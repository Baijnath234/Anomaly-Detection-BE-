import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IoTService } from './iot.service';
import { IoTController } from './entities/iot-controller.entity';
import { Sensor } from './entities/sensor.entity';
import { DeviceCommand } from './entities/device-command.entity';
import { AuditLog } from './entities/audit-log.entity';

describe('IoTService (Task 3 Hardware Communication & Registry)', () => {
  let service: IoTService;

  const mockControllerRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockSensorRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 's-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockCommandRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'cmd-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    findOne: jest.fn(),
  };

  const mockAuditRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'a-1', ...dto })),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IoTService,
        { provide: getRepositoryToken(IoTController), useValue: mockControllerRepo },
        { provide: getRepositoryToken(Sensor), useValue: mockSensorRepo },
        { provide: getRepositoryToken(DeviceCommand), useValue: mockCommandRepo },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditRepo },
      ],
    }).compile();

    service = module.get<IoTService>(IoTService);
  });

  it('should register a new ESP32 controller and maintain online status', async () => {
    mockControllerRepo.findOne.mockResolvedValue(null);
    const ctrl = await service.registerController({
      id: 'ctrl_esp32_01',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      firmwareVersion: '1.2.0',
    });

    expect(ctrl.id).toBe('ctrl_esp32_01');
    expect(ctrl.status).toBe('ONLINE');
  });

  it('should register an electrical CT current sensor probe', async () => {
    const sensor = await service.registerSensor({
      controllerId: 'ctrl_esp32_01',
      targetType: 'CIRCUIT',
      targetId: 'c-1',
      sensorType: 'CURRENT_CT',
      calibrationMultiplier: 1.02,
    });

    expect(sensor.sensorType).toBe('CURRENT_CT');
    expect(sensor.calibrationMultiplier).toBe(1.02);
  });

  it('should dispatch relay command and log audit entry', async () => {
    const cmd = await service.dispatchCommand({
      controllerId: 'ctrl_esp32_01',
      deviceId: 'dev-1',
      relayChannel: 1,
      commandState: 'ON',
    });

    expect(cmd.commandAction).toBe('SET_RELAY');
    expect(cmd.commandState).toBe('ON');
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });
});

