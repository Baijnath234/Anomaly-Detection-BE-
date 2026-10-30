import { ZScoreDetector } from './zscore.detector';

describe('ZScoreDetector', () => {
  let detector: ZScoreDetector;

  beforeEach(() => {
    detector = new ZScoreDetector();
  });

  it('should detect extreme outliers', () => {
    // Normal distribution around mean = 10, std = 1
    const trainData = [
      [9.8, 10.1],
      [10.2, 9.9],
      [10.0, 10.0],
      [10.1, 10.2],
      [9.9, 10.0],
      [10.3, 9.7],
      [9.7, 10.1],
      [10.0, 10.2],
    ];

    detector.fit(trainData, { sensitivity: 0.8 });

    const testData = [
      [10.1, 10.0], // normal
      [35.0, 10.1], // massive anomaly in feature 0
    ];

    const result = detector.predict(testData);

    expect(result.flags.length).toBe(2);
    expect(result.scores.length).toBe(2);
    expect(result.flags[0]).toBe(false); // normal
    expect(result.flags[1]).toBe(true);  // anomaly
    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
  });
});

