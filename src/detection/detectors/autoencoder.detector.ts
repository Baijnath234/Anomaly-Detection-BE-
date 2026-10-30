import { Detector, DetectionResult } from './detector.interface';
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';

export class AutoencoderDetector implements Detector {
  public name = 'autoencoder';
  private model: tf.LayersModel | null = null;
  private inputDim: number = 0;
  private thresholdError: number = 0.5;
  private sensitivity: number = 0.8;

  async fit(X: number[][], params?: Record<string, any>): Promise<void> {
    if (!X.length || !X[0].length) return;
    this.inputDim = X[0].length;
    this.sensitivity = params?.sensitivity ?? 0.8;
    const epochs = params?.epochs ?? 25;
    const batchSize = params?.batchSize ?? 32;

    const tensorX = tf.tensor2d(X);

    // Build dense autoencoder model
    const input = tf.input({ shape: [this.inputDim] });
    const hidden1 = tf.layers.dense({ units: Math.max(8, Math.floor(this.inputDim * 2)), activation: 'relu' }).apply(input);
    const bottleneck = tf.layers.dense({ units: Math.max(4, Math.floor(this.inputDim / 2)), activation: 'relu' }).apply(hidden1);
    const hidden2 = tf.layers.dense({ units: Math.max(8, Math.floor(this.inputDim * 2)), activation: 'relu' }).apply(bottleneck);
    const output = tf.layers.dense({ units: this.inputDim, activation: 'linear' }).apply(hidden2) as tf.SymbolicTensor;

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

    // Estimate training reconstruction error to set baseline threshold
    const preds = this.model.predict(tensorX) as tf.Tensor;
    const errors = tf.losses.meanSquaredError(tensorX, preds) as tf.Tensor;
    const errorsArray = (await errors.data()) as Float32Array;

    tensorX.dispose();
    preds.dispose();
    errors.dispose();

    // Sort errors and select (1.0 - sensitivity * 0.15) quantile as threshold
    const sorted = Array.from(errorsArray).sort((a, b) => a - b);
    const qIndex = Math.min(
      sorted.length - 1,
      Math.floor(sorted.length * (1.0 - (this.sensitivity * 0.15))),
    );
    this.thresholdError = sorted[qIndex] || 0.1;
  }

  async predict(X: number[][]): Promise<DetectionResult> {
    if (!this.model || !X.length) {
      return {
        flags: new Array(X.length).fill(false),
        scores: new Array(X.length).fill(0),
        threshold: 0.5,
      };
    }

    const tensorX = tf.tensor2d(X);
    const preds = this.model.predict(tensorX) as tf.Tensor;
    
    // Per-sample MSE: (x - x_hat)^2
    const diff = tf.sub(tensorX, preds);
    const squared = tf.square(diff);
    const sampleMSE = tf.mean(squared, 1);
    const errorsArray = (await sampleMSE.data()) as Float32Array;

    tensorX.dispose();
    preds.dispose();
    diff.dispose();
    squared.dispose();
    sampleMSE.dispose();

    const scores: number[] = [];
    const flags: boolean[] = [];

    for (let i = 0; i < errorsArray.length; i++) {
      const err = errorsArray[i];
      // Normalize error: 1 / (1 + exp(-4 * (err - threshold)/threshold))
      const normRatio = this.thresholdError > 0 ? err / this.thresholdError : 1;
      const score = Math.max(0.0, Math.min(1.0, 1 / (1 + Math.exp(-2.5 * (normRatio - 1.0)))));
      scores.push(score);
      flags.push(err >= this.thresholdError);
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
    // Save model topology and weights
    await this.model.save(`file://${filePath}`);
    const metaPath = `${filePath}/meta.json`;
    fs.writeFileSync(
      metaPath,
      JSON.stringify({
        inputDim: this.inputDim,
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
      this.inputDim = meta.inputDim;
      this.thresholdError = meta.thresholdError;
      this.sensitivity = meta.sensitivity;
    }
  }
}

