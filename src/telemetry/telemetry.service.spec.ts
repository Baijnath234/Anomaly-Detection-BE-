import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { SensorReading } from './entities/sensor-reading.entity';
import { EnergyConsumptionRecord } from './entities/energy-consumption-record.entity';
import { TelemetryGateway } from './telemetry.gateway';

describe('TelemetryService (Task 3 Real-time Stream & Ingestion)', () => {
  let service: TelemetryService;

  const mockReadingRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { circuitId: 'c-1', voltageRms: 231.2, currentRms: 8.5, activePowerWatts: 1965.2 },
      ]),
    }),
  };

  const mockEnergyRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
  };

  const mockGateway = {
    broadcastTelemetry: jest.fn(),
    broadcastFaultAlert: jest.fn(),
    broadcastDeviceState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        { provide: getRepositoryToken(SensorReading), useValue: mockReadingRepo },
        { provide: getRepositoryToken(EnergyConsumptionRecord), useValue: mockEnergyRepo },
        { provide: TelemetryGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  it('should ingest telemetry batch and broadcast to websocket clients', async () => {
    const result = await service.ingestBatch({
      timestamp: 1793440000,
      controllerId: 'ctrl_01',
      circuits: [
        {
          circuitId: 'c-1',
          voltageRms: 230.0,
          currentRms: 5.0,
          powerFactor: 0.98,
        },
      ],
    });

    expect(result.savedCount).toBe(1);
    expect(mockReadingRepo.save).toHaveBeenCalled();
    expect(mockGateway.broadcastTelemetry).toHaveBeenCalled();
  });

  it('should retrieve historical time-series telemetry', async () => {
    const history = await service.getHistoricalReadings('c-1');
    expect(history).toHaveLength(1);
    expect(history[0].voltageRms).toBe(231.2);
  });
});
