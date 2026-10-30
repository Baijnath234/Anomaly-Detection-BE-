import { IDetector, DetectorResult } from './detector.interface';
import * as ss from 'simple-statistics';

export class ZScoreDetector implements IDetector {
  public name = 'zscore';
  private means: number[] = [];
  private stds: number[] = [];
  private sensitivity: number = 0.8; // default sensitivity
  private thresholdZ: number = 3.0;

  fit(X: number[][], params?: Record<string, any>): void {
    if (!X.length || !X[0].length) return;
    this.sensitivity = params?.sensitivity ?? 0.8;
    // Map sensitivity 0.1 - 1.0 to z-threshold roughly 4.0 down to 2.0
    this.thresholdZ = 4.0 - this.sensitivity * 2.0;

    const numCols = X[0].length;
    this.means = [];
    this.stds = [];

    for (let j = 0; j < numCols; j++) {
      const colVals = X.map((row) => row[j]);
      const mean = ss.mean(colVals);
      const std = ss.standardDeviation(colVals);
      this.means.push(mean);
      this.stds.push(std === 0 ? 1e-6 : std);
    }
  }

  predict(X: number[][]): DetectorResult {
    const scores: number[] = [];
    const flags: boolean[] = [];

    for (const row of X) {
      let maxZ = 0;
      for (let j = 0; j < row.length; j++) {
        const mean = this.means[j] ?? 0;
        const std = this.stds[j] ?? 1;
        const z = Math.abs(row[j] - mean) / std;
        if (z > maxZ) maxZ = z;
      }

      // Normalize z-score to [0, 1] using logistic sigmoid scaled around thresholdZ
      const normalizedScore = 1 / (1 + Math.exp(-1.5 * (maxZ - this.thresholdZ)));
      scores.push(Math.min(1.0, Math.max(0.0, normalizedScore)));
      flags.push(maxZ >= this.thresholdZ);
    }

    return {
      flags,
      scores,
      threshold: 0.5,
    };
  }
}

