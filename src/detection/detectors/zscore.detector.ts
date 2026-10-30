import { Detector, DetectionResult } from './detector.interface';
import { StandardScaler } from '../../preprocessing/scaler';

export class ZScoreDetector implements Detector {
  public name = 'zscore';
  private scaler = new StandardScaler();

  constructor(private threshold = 3) {}

  fit(X: number[][], params?: Record<string, any>) {
    if (params?.threshold !== undefined) {
      this.threshold = params.threshold;
    } else if (params?.sensitivity !== undefined) {
      // Map sensitivity 0.1 - 1.0 to z-threshold roughly 4.0 down to 2.0
      this.threshold = 4.0 - params.sensitivity * 2.0;
    }
    this.scaler.fit(X);
  }

  predict(X: number[][]): DetectionResult {
    const Z = this.scaler.transform(X);
    const maxZ = Z.map((r) => Math.max(...r.map(Math.abs)));
    return {
      flags: maxZ.map((z) => z > this.threshold),
      scores: maxZ.map((z) => Math.min(z / (this.threshold * 2), 1)),
      threshold: this.threshold,
    };
  }
}
