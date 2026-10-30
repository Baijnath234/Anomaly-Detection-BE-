import { Detector, DetectionResult } from './detector.interface';
import { ZScoreDetector } from './zscore.detector';
import { IsolationForestDetector } from './isolation-forest.detector';
import { LofDetector } from './lof.detector';
import { OcsvmLiteDetector } from './ocsvm-lite.detector';

export class EnsembleDetector implements Detector {
  public name = 'ensemble';

  constructor(
    private detectors: Detector[] = [
      new ZScoreDetector(),
      new IsolationForestDetector(),
      new LofDetector(),
      new OcsvmLiteDetector(),
    ],
  ) {}

  async fit(X: number[][], params?: Record<string, any>) {
    for (const d of this.detectors) {
      await d.fit(X, params);
    }
  }

  async predict(X: number[][]): Promise<DetectionResult> {
    if (!this.detectors.length || !X.length) {
      return {
        flags: new Array(X.length).fill(false),
        scores: new Array(X.length).fill(0),
      };
    }

    const results = await Promise.all(this.detectors.map((d) => d.predict(X)));
    const n = X.length;
    const scores = Array.from({ length: n }, (_, i) =>
      results.reduce((s, r) => s + (r.scores[i] ?? 0), 0) / results.length,
    );
    const flags = Array.from(
      { length: n },
      (_, i) => results.filter((r) => r.flags[i]).length > results.length / 2,
    ); // majority vote

    return { flags, scores };
  }
}
