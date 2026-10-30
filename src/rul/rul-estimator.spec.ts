import { estimateRul } from './rul-estimator';

describe('estimateRul', () => {
  it('should estimate RUL and confidence bounds for degrading equipment', () => {
    // Health index decaying from 100 towards 20 over 80 days
    const points = [
      { t: 0, h: 100 },
      { t: 10, h: 90 },
      { t: 20, h: 81 },
      { t: 30, h: 69 },
      { t: 40, h: 60 },
      { t: 50, h: 51 },
    ];

    const result = estimateRul(points, 20);

    expect(result).not.toBeNull();
    expect(result!.etaDays).toBeGreaterThan(0);
    expect(result!.lowerDays).toBeLessThanOrEqual(result!.etaDays);
    expect(result!.upperDays).toBeGreaterThanOrEqual(result!.etaDays);
  });

  it('should return null when health index is flat or improving (not degrading)', () => {
    const points = [
      { t: 0, h: 80 },
      { t: 10, h: 82 },
      { t: 20, h: 85 },
    ];

    const result = estimateRul(points, 20);
    expect(result).toBeNull();
  });
});

