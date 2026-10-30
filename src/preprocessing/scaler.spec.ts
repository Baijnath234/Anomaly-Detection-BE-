import { StandardScaler } from './scaler';

describe('StandardScaler', () => {
  it('should scale values to zero mean and unit variance', () => {
    const X = [
      [10, 100],
      [20, 200],
      [30, 300],
    ];

    const scaler = new StandardScaler();
    const transformed = scaler.fit(X).transform(X);

    // Mean should be 20 for col 0 and 200 for col 1
    expect(scaler.mean[0]).toBeCloseTo(20);
    expect(scaler.mean[1]).toBeCloseTo(200);

    // Transformed column 0: (10-20)/std < 0, (20-20)/std = 0, (30-20)/std > 0
    expect(transformed[1][0]).toBeCloseTo(0);
    expect(transformed[1][1]).toBeCloseTo(0);
    expect(transformed[0][0]).toBeLessThan(0);
    expect(transformed[2][0]).toBeGreaterThan(0);
  });
});

