import { EnsembleDetector } from './ensemble.detector';
import { ZScoreDetector } from './zscore.detector';

describe('EnsembleDetector', () => {
  it('should combine predictions using majority vote and averaged scores', async () => {
    const normalData = [
      [10, 10],
      [10.1, 9.9],
      [9.9, 10.1],
      [10, 10.2],
      [10.2, 10],
      [9.8, 10],
    ];

    const detector = new EnsembleDetector([
      new ZScoreDetector(2.5),
      new ZScoreDetector(3.0),
    ]);

    await detector.fit(normalData);

    const testData = [
      [10.0, 10.0], // normal
      [40.0, 40.0], // extreme outlier
    ];

    const result = await detector.predict(testData);

    expect(result.scores.length).toBe(2);
    expect(result.flags.length).toBe(2);
    expect(result.flags[0]).toBe(false);
    expect(result.flags[1]).toBe(true);
    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
  });
});

