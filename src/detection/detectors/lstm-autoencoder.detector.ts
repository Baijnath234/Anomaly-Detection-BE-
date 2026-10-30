import * as tf from '@tensorflow/tfjs';
import { Detector, DetectionResult } from './detector.interface';
import { StandardScaler } from '../../preprocessing/scaler';
import { makeWindows } from '../../preprocessing/windowing';

export class LstmAutoencoderDetector implements Detector {
  public name = 'lstm_ae';
  private model!: tf.LayersModel;
  private scaler = new StandardScaler();
  private threshold = 0;

  constructor(
    private windowSize = 30,
    private epochs = 30,
  ) {}

  async fit(X: number[][], params?: Record<string, any>) {
    if (!X.length || !X[0]?.length) return;
    if (params?.windowSize) this.windowSize = params.windowSize;
    if (params?.epochs) this.epochs = params.epochs;

    // Adjust window size if dataset has fewer rows than default
    if (X.length <= this.windowSize) {
      this.windowSize = Math.max(2, Math.floor(X.length / 2));
    }

    const Xs = this.scaler.fit(X).transform(X);
    const nFeatures = X[0].length;
    const windows = makeWindows(Xs, this.windowSize);
    if (!windows.length) return;

    const input = tf.tensor3d(windows);

    const m = tf.sequential();
    m.add(
      tf.layers.lstm({ units: 64, inputShape: [this.windowSize, nFeatures] }),
    );
    m.add(tf.layers.dense({ units: 16, activation: 'relu' })); // latent space
    m.add(tf.layers.repeatVector({ n: this.windowSize }));
    m.add(tf.layers.lstm({ units: 64, returnSequences: true }));
    m.add(
      tf.layers.timeDistributed({ layer: tf.layers.dense({ units: nFeatures }) }),
    );
    m.compile({ optimizer: tf.train.adam(1e-3), loss: 'meanSquaredError' });

    await m.fit(input, input, {
      epochs: this.epochs,
      batchSize: 64,
      shuffle: true,
      verbose: 0,
    });
    this.model = m;

    const errs = this.errors(input);
    const mean = errs.reduce((a, b) => a + b, 0) / (errs.length || 1);
    const std = Math.sqrt(
      errs.reduce((a, b) => a + (b - mean) ** 2, 0) / (errs.length || 1),
    );
    this.threshold = mean + 3 * std;
    input.dispose();
  }

  private errors(input: tf.Tensor3D): number[] {
    return tf.tidy(() => {
      const recon = this.model.predict(input) as tf.Tensor3D;
      return Array.from(input.sub(recon).square().mean([1, 2]).dataSync());
    });
  }

  predict(X: number[][]): DetectionResult {
    if (!this.model || !X.length) {
      return {
        flags: new Array(X.length).fill(false),
        scores: new Array(X.length).fill(0),
        threshold: this.threshold,
      };
    }

    const Xs = this.scaler.transform(X);
    const windows = makeWindows(Xs, this.windowSize);
    if (!windows.length) {
      return {
        flags: new Array(X.length).fill(false),
        scores: new Array(X.length).fill(0),
        threshold: this.threshold,
      };
    }

    const input = tf.tensor3d(windows);
    const errs = this.errors(input);
    input.dispose();

    const pad = this.windowSize - 1; // align with original rows
    const denom = this.threshold > 0 ? this.threshold * 2 : 1;
    const flags = [
      ...Array(pad).fill(false),
      ...errs.map((e) => e > this.threshold),
    ];
    const scores = [
      ...Array(pad).fill(0),
      ...errs.map((e) => Math.min(e / denom, 1)),
    ];

    return { flags, scores, threshold: this.threshold };
  }

  async save(path: string) {
    if (this.model) {
      await this.model.save(`file://${path}`);
    }
  }

  async load(path: string) {
    this.model = await tf.loadLayersModel(`file://${path}/model.json`);
  }
}
