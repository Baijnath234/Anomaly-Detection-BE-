import { RootCauseService } from './root-cause.service';

describe('RootCauseService', () => {
  let service: RootCauseService;

  beforeEach(() => {
    service = new RootCauseService();
  });

  it('should identify the primary deviating metric and compute z-scores', () => {
    const baseline = {
      vibration: { mean: 1.0, std: 0.1 },
      temperature: { mean: 50.0, std: 2.0 },
    };

    // vibration is 2.5 (15 sigma deviation!), temperature is 52.0 (1 sigma)
    const anomalousRow = {
      vibration: 2.5,
      temperature: 52.0,
    };

    const result = service.analyze(anomalousRow, baseline);

    expect(result.primaryMetric).toBe('vibration');
    expect(result.maxZScore).toBe(15.0);
    expect(result.deviations['vibration']).toBe(15.0);
    expect(result.deviations['temperature']).toBe(1.0);
  });
});

