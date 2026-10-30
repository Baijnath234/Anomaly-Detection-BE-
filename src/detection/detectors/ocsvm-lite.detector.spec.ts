import { OcsvmLiteDetector } from './ocsvm-lite.detector';

describe('OcsvmLiteDetector', () => {
  let detector: OcsvmLiteDetector;

  beforeEach(() => {
    detector = new OcsvmLiteDetector();
  });

  it('should detect outliers using RBF kernel similarity', () => {
    // Normal cluster centered around (5, 5)
    const normalData = [
      [5.0, 5.1],
      [4.9, 5.0],
      [5.2, 4.8],
      [5.1, 5.2],
      [4.8, 4.9],
      [5.0, 5.0],
    ];

    detector.fit(normalData, { sensitivity: 0.8 });

    const testData = [
      [5.05, 5.02], // close to cluster center
      [25.0, 30.0], // distant outlier
    ];

    const result = detector.predict(testData);

    expect(result.flags.length).toBe(2);
    expect(result.scores.length).toBe(2);
    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
    expect(result.flags[1]).toBe(true);
  });
});

