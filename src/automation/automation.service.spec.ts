import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AutomationService } from './automation.service';
import { ApplianceSchedule } from './entities/appliance-schedule.entity';
import { AutomationScene } from './entities/automation-scene.entity';
import { MaintenanceTicket } from './entities/maintenance-ticket.entity';
import { TopologyService } from '../topology/topology.service';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';

describe('AutomationService (Task 6 Smart Automation & Tickets)', () => {
  let service: AutomationService;

  const mockScheduleRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 's-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockSceneRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'scene-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    findOne: jest.fn().mockResolvedValue({
      id: 'scene-1',
      name: 'Leave Home',
      actionsJson: [
        { deviceId: 'dev-1', state: 'OFF' },
        { deviceId: 'dev-2', state: 'OFF' },
      ],
    }),
  };

  const mockTicketRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 't-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    findOne: jest.fn().mockResolvedValue({ id: 't-1', status: 'OPEN' }),
  };

  const mockTopologyService = {
    toggleDevice: jest.fn().mockResolvedValue({ id: 'dev-1', state: 'OFF' }),
  };

  const mockGateway = {
    broadcastDeviceState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        { provide: getRepositoryToken(ApplianceSchedule), useValue: mockScheduleRepo },
        { provide: getRepositoryToken(AutomationScene), useValue: mockSceneRepo },
        { provide: getRepositoryToken(MaintenanceTicket), useValue: mockTicketRepo },
        { provide: TopologyService, useValue: mockTopologyService },
        { provide: TelemetryGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  it('should execute automated scene across multiple devices', async () => {
    const res = await service.executeScene('scene-1');
    expect(res.success).toBe(true);
    expect(res.executedActionsCount).toBe(2);
    expect(mockTopologyService.toggleDevice).toHaveBeenCalledTimes(2);
    expect(mockGateway.broadcastDeviceState).toHaveBeenCalledTimes(2);
  });

  it('should create and assign a maintenance ticket to an electrician', async () => {
    const ticket = await service.createTicket({
      circuitId: 'c-1',
      title: 'Check Breaker C-01',
      description: 'Repeated trips detected',
      priority: 'HIGH',
    });

    expect(ticket.id).toBe('t-1');

    const assigned = await service.assignTechnician('t-1', {
      technicianName: 'Mike Electrician',
    });

    expect(assigned.assignedTechnician).toBe('Mike Electrician');
    expect(assigned.status).toBe('ASSIGNED');
  });
});
