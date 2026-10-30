import { AutoencoderDetector } from './autoencoder.detector';

describe('AutoencoderDetector', () => {
  it('should train dense autoencoder and score reconstruction errors', async () => {
    // Generate simple normal dataset
    const normalData = [
      [1.0, 1.0],
      [1.1, 0.9],
      [0.9, 1.1],
      [1.0, 1.05],
      [1.05, 0.95],
      [0.95, 1.0],
    ];

    const detector = new AutoencoderDetector(10, 16);
    await detector.fit(normalData);

    const testData = [
      [1.0, 1.0],   // in-distribution
      [20.0, 20.0], // out-of-distribution anomaly
    ];

    const result = detector.predict(testData);

    expect(result.scores.length).toBe(2);
    expect(result.flags.length).toBe(2);
    expect(result.scores[1]).toBeGreaterThan(result.scores[0]);
  }, 20000);
});

