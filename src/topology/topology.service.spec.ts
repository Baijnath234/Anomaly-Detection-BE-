import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TopologyService } from './topology.service';
import { Building } from './entities/building.entity';
import { Floor } from './entities/floor.entity';
import { Room } from './entities/room.entity';
import { ElectricalPanel } from './entities/electrical-panel.entity';
import { Circuit } from './entities/circuit.entity';
import { Switchboard } from './entities/switchboard.entity';
import { Device } from './entities/device.entity';

describe('TopologyService (Task 3 Backend APIs)', () => {
  let service: TopologyService;

  const mockBuildingRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'b-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'b-1', ...entity })),
    find: jest.fn().mockResolvedValue([{ id: 'b-1', name: 'Home Test' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'b-1', name: 'Home Test', floors: [], panels: [] }),
  };

  const mockFloorRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'f-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'f-1', ...entity })),
  };

  const mockRoomRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'r-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'r-1', ...entity })),
  };

  const mockPanelRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'p-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'p-1', ...entity })),
  };

  const mockCircuitRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'c-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'c-1', ...entity })),
    find: jest.fn().mockResolvedValue([{ id: 'c-1', circuitNumber: 'C-01', breakerRatingAmps: 16 }]),
    findOne: jest.fn().mockResolvedValue({ id: 'c-1', circuitNumber: 'C-01' }),
  };

  const mockSwitchboardRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'sb-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'sb-1', ...entity })),
  };

  const mockDeviceRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'd-1', ...dto, state: 'OFF' })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    find: jest.fn().mockResolvedValue([{ id: 'd-1', name: 'Fan', state: 'OFF' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'd-1', name: 'Fan', state: 'OFF' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopologyService,
        { provide: getRepositoryToken(Building), useValue: mockBuildingRepo },
        { provide: getRepositoryToken(Floor), useValue: mockFloorRepo },
        { provide: getRepositoryToken(Room), useValue: mockRoomRepo },
        { provide: getRepositoryToken(ElectricalPanel), useValue: mockPanelRepo },
        { provide: getRepositoryToken(Circuit), useValue: mockCircuitRepo },
        { provide: getRepositoryToken(Switchboard), useValue: mockSwitchboardRepo },
        { provide: getRepositoryToken(Device), useValue: mockDeviceRepo },
      ],
    }).compile();

    service = module.get<TopologyService>(TopologyService);
  });

  it('should create and retrieve building tree hierarchy', async () => {
    const building = await service.createBuilding({ name: 'Villa Test', mainsSupplyType: '1-PHASE' });
    expect(building.name).toBe('Villa Test');

    const tree = await service.getBuildingTree('b-1');
    expect(tree.id).toBe('b-1');
    expect(mockBuildingRepo.findOne).toHaveBeenCalled();
  });

  it('should create electrical circuit with breaker specifications', async () => {
    const circuit = await service.createCircuit({
      panelId: 'p-1',
      circuitNumber: 'C-02',
      name: 'Kitchen Power',
      breakerRatingAmps: 20,
      wireGaugeMm2: 4.0,
    });
    expect(circuit.circuitNumber).toBe('C-02');
    expect(circuit.breakerRatingAmps).toBe(20);
  });

  it('should toggle device relay state between ON and OFF', async () => {
    const toggled = await service.toggleDevice('d-1', { state: 'ON' });
    expect(toggled.state).toBe('ON');
  });
});
