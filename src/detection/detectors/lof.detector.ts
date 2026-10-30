import { Detector, DetectionResult } from './detector.interface';

export class LofDetector implements Detector {
  public name = 'lof';
  private trainX: number[][] = [];
  private k: number = 10;
  private sensitivity: number = 0.8;
  private thresholdScore: number = 0.6;

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  fit(X: number[][], params?: Record<string, any>): void {
    if (!X.length) return;
    this.trainX = X;
    this.sensitivity = params?.sensitivity ?? 0.8;
    this.k = Math.max(2, Math.min(params?.k ?? 10, X.length - 1));
    this.thresholdScore = 0.75 - this.sensitivity * 0.3;
  }

  predict(X: number[][]): DetectionResult {
    const scores: number[] = [];
    const flags: boolean[] = [];

    const referenceData = this.trainX.length > 0 ? this.trainX : X;
    const k = Math.min(this.k, referenceData.length - 1);

    // Compute k-distances for referenceData
    const kDistances: number[] = [];
    for (let i = 0; i < referenceData.length; i++) {
      const dists = referenceData
        .map((p, idx) => (idx === i ? Infinity : this.euclideanDistance(referenceData[i], p)))
        .sort((a, b) => a - b);
      kDistances.push(dists[k - 1] ?? 1e-6);
    }

    // Local reachability density for referenceData
    const lrds: number[] = [];
    for (let i = 0; i < referenceData.length; i++) {
      let sumReachDist = 0;
      const neighbors = referenceData
        .map((p, idx) => ({ dist: this.euclideanDistance(referenceData[i], p), idx }))
        .filter((item) => item.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k);

      for (const n of neighbors) {
        sumReachDist += Math.max(kDistances[n.idx], n.dist);
      }
      lrds.push(neighbors.length / (sumReachDist || 1e-6));
    }

    // Score test points
    for (const x of X) {
      const neighbors = referenceData
        .map((p, idx) => ({ dist: this.euclideanDistance(x, p), idx }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k);

      let sumReachDist = 0;
      for (const n of neighbors) {
        sumReachDist += Math.max(kDistances[n.idx], n.dist);
      }
      const pointLrd = neighbors.length / (sumReachDist || 1e-6);

      let sumRatio = 0;
      for (const n of neighbors) {
        sumRatio += lrds[n.idx] / pointLrd;
      }
      const rawLof = sumRatio / (k || 1);

      // Convert LOF (where ~1.0 is normal, >1.5 is anomalous) into [0, 1] range
      const normalizedScore = 1 / (1 + Math.exp(-2.0 * (rawLof - 1.5)));
      scores.push(Math.min(1.0, Math.max(0.0, normalizedScore)));
      flags.push(normalizedScore >= this.thresholdScore);
    }

    return {
      flags,
      scores,
      threshold: this.thresholdScore,
    };
  }
}

