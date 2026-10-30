import { LofDetector } from './lof.detector';

describe('LofDetector', () => {
  let detector: LofDetector;

  beforeEach(() => {
    detector = new LofDetector();
  });

  it('should flag local density outliers', () => {
    // Dense cluster
    const cluster: number[][] = [];
    for (let i = 0; i < 30; i++) {
      cluster.push([
        1.0 + (Math.random() - 0.5) * 0.2,
        1.0 + (Math.random() - 0.5) * 0.2,
      ]);
    }

    detector.fit(cluster, { sensitivity: 0.85, k: 5 });

    const testPoints = [
      [1.02, 0.99], // dense point
      [5.5, 6.2],   // far outlier
    ];

    const result = detector.predict(testPoints);

    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
    expect(result.flags[1]).toBe(true);
  });
});

