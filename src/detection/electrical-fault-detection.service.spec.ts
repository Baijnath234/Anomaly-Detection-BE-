import { Test, TestingModule } from '@nestjs/testing';
import { ElectricalFaultDetectionService } from './electrical-fault-detection.service';
import { ElectricalFaultsService } from '../electrical-faults/electrical-faults.service';

describe('ElectricalFaultDetectionService (Task 4 AI Fault Detection Engine)', () => {
  let service: ElectricalFaultDetectionService;

  const mockFaultsService = {
    logFault: jest.fn().mockResolvedValue({ id: 'f-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectricalFaultDetectionService,
        { provide: ElectricalFaultsService, useValue: mockFaultsService },
      ],
    }).compile();

    service = module.get<ElectricalFaultDetectionService>(ElectricalFaultDetectionService);
  });

  it('should identify normal operating conditions with high confidence', async () => {
    const report = await service.evaluateReading({
      circuitId: 'c-test',
      voltageRms: 230.2,
      currentRms: 4.8,
      powerFactor: 0.98,
      temperatureCelsius: 31.5,
      leakageCurrentMa: 1.1,
      breakerRatingAmps: 16.0,
    });

    expect(report.faultCategory).toBe('NORMAL');
    expect(report.severity).toBe('NORMAL');
    expect(report.maintenancePriority).toBe('LOW');
    expect(report.confidenceScore).toBeGreaterThanOrEqual(0.95);
  });

  it('should detect critical overcurrent condition and auto-persist fault', async () => {
    const report = await service.evaluateReading(
      {
        circuitId: 'c-test',
        voltageRms: 226.0,
        currentRms: 28.5, // > 16A * 1.5
        powerFactor: 0.95,
        breakerRatingAmps: 16.0,
      },
      true,
    );

    expect(report.faultCategory).toBe('OVERCURRENT');
    expect(report.severity).toBe('CRITICAL');
    expect(report.maintenancePriority).toBe('IMMEDIATE');
    expect(mockFaultsService.logFault).toHaveBeenCalled();
  });

  it('should detect terminal overheating above 70°C and prescribe retorquing', async () => {
    const report = await service.evaluateReading({
      circuitId: 'c-test',
      voltageRms: 230.0,
      currentRms: 8.0,
      temperatureCelsius: 82.0, // High temperature
      breakerRatingAmps: 16.0,
    });

    expect(report.faultCategory).toBe('OVERHEATING');
    expect(report.severity).toBe('CRITICAL');
    expect(report.recommendedAction).toContain('Retorque terminal screw connections');
  });

  it('should detect earth leakage approaching RCD trip limits', async () => {
    const report = await service.evaluateReading({
      circuitId: 'c-test',
      voltageRms: 230.0,
      currentRms: 5.0,
      leakageCurrentMa: 32.0,
    });

    expect(report.faultCategory).toBe('EARTH_LEAKAGE');
    expect(report.severity).toBe('CRITICAL');
  });

  it('should detect potential micro-arcing via low power factor with normal current load', async () => {
    const report = await service.evaluateReading({
      circuitId: 'c-test',
      voltageRms: 230.0,
      currentRms: 6.5,
      powerFactor: 0.68, // Severe waveform distortion
    });

    expect(report.faultCategory).toBe('MICRO_ARCING');
    expect(report.severity).toBe('WARNING');
    expect(report.maintenancePriority).toBe('HIGH');
  });

  it('should identify sensor hardware disconnect error', async () => {
    const report = await service.evaluateReading({
      circuitId: 'c-test',
      voltageRms: 230.0,
      currentRms: 4.0,
      temperatureCelsius: -127.0, // Open-circuit DS18B20 code
    });

    expect(report.faultCategory).toBe('SENSOR_MALFUNCTION');
    expect(report.severity).toBe('WARNING');
    expect(report.detectionMethod).toBe('SENSOR_TRANSDUCER_HEALTH_CHECK');
  });
});
