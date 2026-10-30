import { PreprocessingService } from './preprocessing.service';

describe('PreprocessingService', () => {
  let service: PreprocessingService;

  beforeEach(() => {
    service = new PreprocessingService();
  });

  it('should impute null and NaN values using forward fill', () => {
    const raw = [
      [10, 20],
      [null as any, 25],
      [12, null as any],
    ];

    const imputed = service.imputeMissing(raw, 'forward_fill');
    expect(imputed[1][0]).toBe(10); // carried forward from previous row
    expect(imputed[2][1]).toBe(25); // carried forward
  });

  it('should fit and apply standard z-score scaling', () => {
    const data = [
      [10, 100],
      [20, 200],
      [30, 300],
    ];

    const scaler = service.fitScaler(data, 'standard');
    expect(scaler.means).toBeDefined();
    expect(scaler.means![0]).toBe(20);

    const scaled = service.transform(data, scaler);
    expect(scaled[1][0]).toBeCloseTo(0, 1); // center row mean should scale to ~0
  });

  it('should generate sliding windows correctly', () => {
    const data = [
      [1],
      [2],
      [3],
      [4],
      [5],
    ];

    const windows = service.createSlidingWindows(data, 3);
    expect(windows.length).toBe(3);
    expect(windows[0]).toEqual([[1], [2], [3]]);
    expect(windows[2]).toEqual([[3], [4], [5]]);
  });
});

