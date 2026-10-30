import * as tf from '@tensorflow/tfjs';
import { Detector, DetectionResult } from './detector.interface';
import { StandardScaler } from '../../preprocessing/scaler';

export class AutoencoderDetector implements Detector {
  public name = 'autoencoder';
  private model!: tf.LayersModel;
  private scaler = new StandardScaler();
  private threshold = 0;

  constructor(
    private epochs = 25,
    private batchSize = 32,
  ) {}

  async fit(X: number[][], params?: Record<string, any>): Promise<void> {
    if (!X.length || !X[0]?.length) return;
    if (params?.epochs) this.epochs = params.epochs;
    if (params?.batchSize) this.batchSize = params.batchSize;

    const Xs = this.scaler.fit(X).transform(X);
    const nFeatures = X[0].length;
    const input = tf.tensor2d(Xs);

    const m = tf.sequential();
    m.add(
      tf.layers.dense({ units: 16, activation: 'relu', inputShape: [nFeatures] }),
    );
    m.add(tf.layers.dense({ units: 4, activation: 'relu' })); // latent bottleneck
    m.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    m.add(tf.layers.dense({ units: nFeatures, activation: 'linear' }));
    m.compile({ optimizer: tf.train.adam(1e-3), loss: 'meanSquaredError' });

    await m.fit(input, input, {
      epochs: this.epochs,
      batchSize: this.batchSize,
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

  private errors(input: tf.Tensor2D): number[] {
    return tf.tidy(() => {
      const recon = this.model.predict(input) as tf.Tensor2D;
      return Array.from(input.sub(recon).square().mean(1).dataSync());
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
    const input = tf.tensor2d(Xs);
    const errs = this.errors(input);
    input.dispose();

    const denom = this.threshold > 0 ? this.threshold * 2 : 1;
    const flags = errs.map((e) => e > this.threshold);
    const scores = errs.map((e) => Math.min(e / denom, 1));

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
