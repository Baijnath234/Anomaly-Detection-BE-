import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { Floor } from './entities/floor.entity';
import { Room } from './entities/room.entity';
import { ElectricalPanel } from './entities/electrical-panel.entity';
import { Circuit } from './entities/circuit.entity';
import { Switchboard } from './entities/switchboard.entity';
import { Device } from './entities/device.entity';
import {
  CreateBuildingDto,
  CreateFloorDto,
  CreateRoomDto,
  CreatePanelDto,
  CreateCircuitDto,
  CreateSwitchboardDto,
  CreateDeviceDto,
  ToggleDeviceDto,
} from './dto';

@Injectable()
export class TopologyService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
    @InjectRepository(Floor)
    private readonly floorRepo: Repository<Floor>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(ElectricalPanel)
    private readonly panelRepo: Repository<ElectricalPanel>,
    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,
    @InjectRepository(Switchboard)
    private readonly switchboardRepo: Repository<Switchboard>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) {}

  // Buildings
  async createBuilding(dto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingRepo.create(dto);
    return await this.buildingRepo.save(building);
  }

  async findAllBuildings(): Promise<Building[]> {
    return await this.buildingRepo.find({
      relations: ['floors', 'panels'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBuildingTree(buildingId: string): Promise<Building> {
    const building = await this.buildingRepo.findOne({
      where: { id: buildingId },
      relations: [
        'floors',
        'floors.rooms',
        'floors.rooms.switchboards',
        'floors.rooms.switchboards.devices',
        'panels',
        'panels.circuits',
        'panels.circuits.devices',
      ],
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }
    return building;
  }

  // Floors
  async createFloor(dto: CreateFloorDto): Promise<Floor> {
    const floor = this.floorRepo.create(dto);
    return await this.floorRepo.save(floor);
  }

  // Rooms
  async createRoom(dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepo.create(dto);
    return await this.roomRepo.save(room);
  }

  // Electrical Panels
  async createPanel(dto: CreatePanelDto): Promise<ElectricalPanel> {
    const panel = this.panelRepo.create(dto);
    return await this.panelRepo.save(panel);
  }

  // Circuits
  async createCircuit(dto: CreateCircuitDto): Promise<Circuit> {
    const circuit = this.circuitRepo.create(dto);
    return await this.circuitRepo.save(circuit);
  }

  async findAllCircuits(): Promise<Circuit[]> {
    return await this.circuitRepo.find({
      relations: ['panel', 'devices'],
    });
  }

  async findCircuitById(id: string): Promise<Circuit> {
    const circuit = await this.circuitRepo.findOne({
      where: { id },
      relations: ['panel', 'devices', 'switchboards'],
    });
    if (!circuit) {
      throw new NotFoundException(`Circuit ${id} not found`);
    }
    return circuit;
  }

  // Switchboards
  async createSwitchboard(dto: CreateSwitchboardDto): Promise<Switchboard> {
    const board = this.switchboardRepo.create(dto);
    return await this.switchboardRepo.save(board);
  }

  // Devices
  async createDevice(dto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepo.create(dto);
    return await this.deviceRepo.save(device);
  }

  async findAllDevices(): Promise<Device[]> {
    return await this.deviceRepo.find({
      relations: ['switchboard', 'circuit'],
    });
  }

  async toggleDevice(deviceId: string, dto: ToggleDeviceDto): Promise<Device> {
    const device = await this.deviceRepo.findOne({
      where: { id: deviceId },
      relations: ['switchboard', 'circuit'],
    });
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    device.state = dto.state;
    return await this.deviceRepo.save(device);
  }
}
