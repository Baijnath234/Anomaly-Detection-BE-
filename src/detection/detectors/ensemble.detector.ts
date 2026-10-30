import { IDetector, DetectorResult } from './detector.interface';
import { ZScoreDetector } from './zscore.detector';
import { IsolationForestDetector } from './isolation-forest.detector';
import { LofDetector } from './lof.detector';
import { OcsvmLiteDetector } from './ocsvm-lite.detector';

export class EnsembleDetector implements IDetector {
  public name = 'ensemble';
  private detectors: IDetector[] = [];
  private weights: number[] = [];
  private threshold: number = 0.55;

  constructor() {
    this.detectors = [
      new ZScoreDetector(),
      new IsolationForestDetector(),
      new LofDetector(),
      new OcsvmLiteDetector(),
    ];
    // Equal weighting across algorithms
    this.weights = [0.25, 0.35, 0.20, 0.20];
  }

  async fit(X: number[][], params?: Record<string, any>): Promise<void> {
    for (const detector of this.detectors) {
      await detector.fit(X, params);
    }
    const sensitivity = params?.sensitivity ?? 0.8;
    this.threshold = 0.65 - sensitivity * 0.2;
  }

  async predict(X: number[][]): Promise<DetectorResult> {
    if (!X.length) {
      return { flags: [], scores: [], threshold: this.threshold };
    }

    const allResults: DetectorResult[] = [];
    for (const detector of this.detectors) {
      allResults.push(await detector.predict(X));
    }

    const numRows = X.length;
    const scores: number[] = [];
    const flags: boolean[] = [];

    for (let i = 0; i < numRows; i++) {
      let weightedScore = 0;
      let positiveVotes = 0;

      for (let d = 0; d < this.detectors.length; d++) {
        const detResult = allResults[d];
        const s = detResult.scores[i] ?? 0;
        const f = detResult.flags[i] ?? false;
        weightedScore += s * this.weights[d];
        if (f) positiveVotes++;
      }

      // Majority vote (>= 2 out of 4) OR high weighted score
      const isAnomaly = positiveVotes >= 2 || weightedScore >= this.threshold;
      scores.push(Math.min(1.0, Math.max(0.0, weightedScore)));
      flags.push(isAnomaly);
    }

    return {
      flags,
      scores,
      threshold: this.threshold,
    };
  }
}

