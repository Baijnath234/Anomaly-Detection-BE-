import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { ComponentHealthRecord } from './entities/component-health-record.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';
import { PredictiveMaintenanceEngine } from './predictive-maintenance.engine';

describe('MaintenanceService (Task 3 Predictive Maintenance & Schedules)', () => {
  let service: MaintenanceService;

  const mockHealthRepo = {
    find: jest.fn().mockResolvedValue([
      { id: 'h-1', entityType: 'CIRCUIT_WIRING', healthScore: 82.5, failureRisk: 'LOW' },
    ]),
    findOne: jest.fn().mockResolvedValue({
      id: 'h-1',
      entityId: 'c-1',
      healthScore: 82.5,
      estimatedRulDays: 720,
    }),
    create: jest.fn().mockImplementation((dto) => ({ id: 'h-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
  };

  const mockRecordRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'm-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockScheduleRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 's-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        PredictiveMaintenanceEngine,
        { provide: getRepositoryToken(ComponentHealthRecord), useValue: mockHealthRepo },
        { provide: getRepositoryToken(MaintenanceRecord), useValue: mockRecordRepo },
        { provide: getRepositoryToken(MaintenanceSchedule), useValue: mockScheduleRepo },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should evaluate component health index and estimated RUL', async () => {
    const health = await service.getComponentHealth('c-1');
    expect(health.healthScore).toBe(82.5);
    expect(health.estimatedRulDays).toBe(720);
  });

  it('should record a completed maintenance action', async () => {
    const record = await service.recordMaintenance({
      circuitId: 'c-1',
      componentType: 'TERMINAL_LUG',
      actionTaken: 'Tightened loose terminal screws',
      technicianName: 'Bob Electrician',
      performedAt: '2026-10-31T10:00:00Z',
    });

    expect(record.componentType).toBe('TERMINAL_LUG');
    expect(mockRecordRepo.save).toHaveBeenCalled();
  });

  it('should create a preventive maintenance schedule', async () => {
    const schedule = await service.scheduleMaintenance({
      circuitId: 'c-1',
      componentType: 'CIRCUIT_WIRING',
      scheduledDate: '2026-11-20',
      priority: 'HIGH',
      recommendationReason: 'Elevated thermal stress detected',
    });

    expect(schedule.priority).toBe('HIGH');
    expect(mockScheduleRepo.save).toHaveBeenCalled();
  });
});
