import { IsolationForestDetector } from './isolation-forest.detector';

describe('IsolationForestDetector', () => {
  let detector: IsolationForestDetector;

  beforeEach(() => {
    detector = new IsolationForestDetector();
  });

  it('should isolate distinct outliers with higher anomaly scores', () => {
    // Generate cluster of points around [5, 5]
    const trainData: number[][] = [];
    for (let i = 0; i < 50; i++) {
      trainData.push([
        5 + (Math.random() - 0.5) * 1.5,
        5 + (Math.random() - 0.5) * 1.5,
      ]);
    }

    detector.fit(trainData, { sensitivity: 0.8, numTrees: 40 });

    const testData = [
      [5.1, 5.0],   // in-cluster
      [25.0, 30.0], // far outlier
    ];

    const result = detector.predict(testData);

    expect(result.scores.length).toBe(2);
    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
    expect(result.flags[1]).toBe(true);
  });
});

