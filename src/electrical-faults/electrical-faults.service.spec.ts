import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ElectricalFaultsService } from './electrical-faults.service';
import { ElectricalFaultRecord } from './entities/electrical-fault-record.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { NotificationRecord } from './entities/notification-record.entity';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';

describe('ElectricalFaultsService (Task 3 Faults & Alerts)', () => {
  let service: ElectricalFaultsService;

  const mockFaultRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'fault-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([{ id: 'fault-1', faultType: 'OVERCURRENT', status: 'ACTIVE' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'fault-1', status: 'ACTIVE' }),
  };

  const mockRuleRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'rule-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockNotificationRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'notif-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockGateway = {
    broadcastFaultAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectricalFaultsService,
        { provide: getRepositoryToken(ElectricalFaultRecord), useValue: mockFaultRepo },
        { provide: getRepositoryToken(AlertRule), useValue: mockRuleRepo },
        { provide: getRepositoryToken(NotificationRecord), useValue: mockNotificationRepo },
        { provide: TelemetryGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ElectricalFaultsService>(ElectricalFaultsService);
  });

  it('should log an electrical fault, generate a notification, and broadcast to websockets', async () => {
    const fault = await service.logFault({
      circuitId: 'c-1',
      faultType: 'OVERCURRENT',
      severity: 'CRITICAL',
      triggerValue: 26.5,
      thresholdValue: 16.0,
      parameter: 'CURRENT_RMS',
      message: 'Overcurrent detected',
    });

    expect(fault.id).toBe('fault-1');
    expect(fault.severity).toBe('CRITICAL');
    expect(mockNotificationRepo.save).toHaveBeenCalled();
    expect(mockGateway.broadcastFaultAlert).toHaveBeenCalled();
  });

  it('should acknowledge an active electrical fault', async () => {
    const acknowledged = await service.acknowledgeFault('fault-1');
    expect(acknowledged.status).toBe('ACKNOWLEDGED');
    expect(acknowledged.acknowledgedAt).toBeDefined();
  });
});

