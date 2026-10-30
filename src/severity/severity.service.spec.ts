import { SeverityService } from './severity.service';
import { AnomalySeverity } from '../detection/entities/anomaly.entity';

describe('SeverityService', () => {
  let service: SeverityService;

  beforeEach(() => {
    service = new SeverityService();
  });

  it('should categorize high anomaly score as Critical', () => {
    const severity = service.calculateSeverity(0.92);
    expect(severity).toBe(AnomalySeverity.CRITICAL);
  });

  it('should categorize moderate anomaly score as Warning', () => {
    const severity = service.calculateSeverity(0.72);
    expect(severity).toBe(AnomalySeverity.WARNING);
  });

  it('should categorize lower score as Info', () => {
    const severity = service.calculateSeverity(0.52);
    expect(severity).toBe(AnomalySeverity.INFO);
  });

  it('should override to Critical if any metric has deviation >= 4 sigma', () => {
    const severity = service.calculateSeverity(0.55, { temperature: 4.8, pressure: 1.2 });
    expect(severity).toBe(AnomalySeverity.CRITICAL);
  });
});

