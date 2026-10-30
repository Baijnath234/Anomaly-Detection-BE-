import { Detector, DetectionResult } from './detector.interface';

export class OcsvmLiteDetector implements Detector {
  public name = 'ocsvm';
  private supportVectors: number[][] = [];
  private gamma: number = 0.5;
  private thresholdScore: number = 0.6;
  private sensitivity: number = 0.8;

  private rbfKernel(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.exp(-this.gamma * sum);
  }

  fit(X: number[][], params?: Record<string, any>): void {
    if (!X.length) return;
    this.sensitivity = params?.sensitivity ?? 0.8;
    this.thresholdScore = 0.7 - this.sensitivity * 0.25;

    // Subsample up to 200 points for kernel representation
    const maxSVs = Math.min(200, X.length);
    const step = Math.max(1, Math.floor(X.length / maxSVs));
    this.supportVectors = [];
    for (let i = 0; i < X.length && this.supportVectors.length < maxSVs; i += step) {
      this.supportVectors.push(X[i]);
    }

    // Heuristic gamma: 1 / (numFeatures * variance)
    const numCols = X[0].length;
    this.gamma = 1.0 / (numCols || 1.0);
  }

  predict(X: number[][]): DetectionResult {
    const scores: number[] = [];
    const flags: boolean[] = [];

    const numSVs = this.supportVectors.length || 1;

    for (const x of X) {
      let kernelSum = 0;
      for (const sv of this.supportVectors) {
        kernelSum += this.rbfKernel(x, sv);
      }
      const similarity = kernelSum / numSVs;
      // In RBF space, points close to normal center have similarity ~ 1.0; outliers have similarity ~ 0.0
      const anomalyScore = Math.max(0.0, Math.min(1.0, 1.0 - similarity));
      scores.push(anomalyScore);
      flags.push(anomalyScore >= this.thresholdScore);
    }

    return {
      flags,
      scores,
      threshold: this.thresholdScore,
    };
  }
}

