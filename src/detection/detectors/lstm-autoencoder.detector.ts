import { IDetector, DetectorResult } from './detector.interface';
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';

export class LstmAutoencoderDetector implements IDetector {
  public name = 'lstm_ae';
  private model: tf.LayersModel | null = null;
  private timeSteps: number = 5;
  private numFeatures: number = 0;
  private thresholdError: number = 0.5;
  private sensitivity: number = 0.8;

  private createWindows(X: number[][]): number[][][] {
    if (X.length < this.timeSteps) {
      // Pad if less than timesteps
      const padded: number[][] = [];
      while (padded.length + X.length < this.timeSteps) {
        padded.push(X[0] || []);
      }
      return [[...padded, ...X]];
    }

    const windows: number[][][] = [];
    for (let i = 0; i <= X.length - this.timeSteps; i++) {
      windows.push(X.slice(i, i + this.timeSteps));
    }
    return windows;
  }

  async fit(X: number[][], params?: Record<string, any>): Promise<void> {
    if (!X.length || !X[0].length) return;
    this.numFeatures = X[0].length;
    this.timeSteps = params?.windowSize ?? 5;
    this.sensitivity = params?.sensitivity ?? 0.8;
    const epochs = params?.epochs ?? 20;
    const batchSize = params?.batchSize ?? 16;

    const windows = this.createWindows(X);
    if (!windows.length) return;

    const tensorX = tf.tensor3d(windows);

    // Build LSTM autoencoder
    const input = tf.input({ shape: [this.timeSteps, this.numFeatures] });
    const encoder = tf.layers.lstm({ units: 16, returnSequences: false }).apply(input);
    const repeat = tf.layers.repeatVector({ n: this.timeSteps }).apply(encoder);
    const decoder = tf.layers.lstm({ units: 16, returnSequences: true }).apply(repeat);
    const output = tf.layers.timeDistributed({
      layer: tf.layers.dense({ units: this.numFeatures, activation: 'linear' }),
    }).apply(decoder) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: output });
    this.model.compile({
      optimizer: tf.train.adam(0.005),
      loss: 'meanSquaredError',
    });

    await this.model.fit(tensorX, tensorX, {
      epochs,
      batchSize,
      shuffle: true,
      verbose: 0,
    });

    // Evaluate baseline reconstruction error
    const preds = this.model.predict(tensorX) as tf.Tensor;
    const diff = tf.sub(tensorX, preds);
    const sampleMSE = tf.mean(tf.square(diff), [1, 2]);
    const errorsArray = (await sampleMSE.data()) as Float32Array;

    tensorX.dispose();
    preds.dispose();
    diff.dispose();
    sampleMSE.dispose();

    const sorted = Array.from(errorsArray).sort((a, b) => a - b);
    const qIndex = Math.min(
      sorted.length - 1,
      Math.floor(sorted.length * (1.0 - (this.sensitivity * 0.15))),
    );
    this.thresholdError = sorted[qIndex] || 0.1;
  }

  async predict(X: number[][]): Promise<DetectorResult> {
    if (!this.model || !X.length) {
      return {
        flags: new Array(X.length).fill(false),
        scores: new Array(X.length).fill(0),
        threshold: 0.5,
      };
    }

    const windows = this.createWindows(X);
    const tensorX = tf.tensor3d(windows);
    const preds = this.model.predict(tensorX) as tf.Tensor;

    const diff = tf.sub(tensorX, preds);
    const sampleMSE = tf.mean(tf.square(diff), [1, 2]);
    const windowErrors = (await sampleMSE.data()) as Float32Array;

    tensorX.dispose();
    preds.dispose();
    diff.dispose();
    sampleMSE.dispose();

    // Map window errors back to individual rows
    const scores: number[] = new Array(X.length).fill(0);
    const flags: boolean[] = new Array(X.length).fill(false);

    for (let w = 0; w < windowErrors.length; w++) {
      const err = windowErrors[w];
      const normRatio = this.thresholdError > 0 ? err / this.thresholdError : 1;
      const score = Math.max(0.0, Math.min(1.0, 1 / (1 + Math.exp(-2.5 * (normRatio - 1.0)))));
      const isAnomaly = err >= this.thresholdError;

      // Assign score to the end of the window (current observed point)
      const targetIdx = Math.min(X.length - 1, w + this.timeSteps - 1);
      scores[targetIdx] = Math.max(scores[targetIdx], score);
      if (isAnomaly) flags[targetIdx] = true;
    }

    // For any unassigned initial points (before window filled), fill with first window's score
    for (let i = 0; i < Math.min(this.timeSteps - 1, X.length); i++) {
      scores[i] = scores[this.timeSteps - 1] ?? 0;
      flags[i] = flags[this.timeSteps - 1] ?? false;
    }

    return {
      flags,
      scores,
      threshold: 0.5,
    };
  }

  async save(filePath: string): Promise<void> {
    if (!this.model) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await this.model.save(`file://${filePath}`);
    const metaPath = `${filePath}/meta.json`;
    fs.writeFileSync(
      metaPath,
      JSON.stringify({
        timeSteps: this.timeSteps,
        numFeatures: this.numFeatures,
        thresholdError: this.thresholdError,
        sensitivity: this.sensitivity,
      }),
    );
  }

  async load(filePath: string): Promise<void> {
    const modelJsonPath = `file://${filePath}/model.json`;
    this.model = await tf.loadLayersModel(modelJsonPath);
    const metaPath = `${filePath}/meta.json`;
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      this.timeSteps = meta.timeSteps;
      this.numFeatures = meta.numFeatures;
      this.thresholdError = meta.thresholdError;
      this.sensitivity = meta.sensitivity;
    }
  }
}

