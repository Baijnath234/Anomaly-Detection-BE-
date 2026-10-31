import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTController } from './entities/iot-controller.entity';
import { Sensor } from './entities/sensor.entity';
import { DeviceCommand } from './entities/device-command.entity';
import { AuditLog } from './entities/audit-log.entity';
import {
  RegisterControllerDto,
  HeartbeatDto,
  RegisterSensorDto,
  DispatchCommandDto,
} from './dto';

@Injectable()
export class IoTService {
  constructor(
    @InjectRepository(IoTController)
    private readonly controllerRepo: Repository<IoTController>,
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(DeviceCommand)
    private readonly commandRepo: Repository<DeviceCommand>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // Controllers
  async registerController(dto: RegisterControllerDto): Promise<IoTController> {
    const existing = await this.controllerRepo.findOne({ where: { id: dto.id } });
    if (existing) {
      Object.assign(existing, dto);
      return await this.controllerRepo.save(existing);
    }
    const controller = this.controllerRepo.create({
      ...dto,
      status: 'ONLINE',
      lastHeartbeat: new Date(),
    });
    return await this.controllerRepo.save(controller);
  }

  async findAllControllers(): Promise<IoTController[]> {
    return await this.controllerRepo.find({
      relations: ['sensors'],
      order: { id: 'ASC' },
    });
  }

  async updateHeartbeat(id: string, dto: HeartbeatDto): Promise<IoTController> {
    const controller = await this.controllerRepo.findOne({ where: { id } });
    if (!controller) {
      throw new NotFoundException(`Controller ${id} not found`);
    }
    controller.status = 'ONLINE';
    controller.lastHeartbeat = new Date();
    if (dto.wifiRssi !== undefined) controller.wifiRssi = dto.wifiRssi;
    if (dto.firmwareVersion) controller.firmwareVersion = dto.firmwareVersion;
    return await this.controllerRepo.save(controller);
  }

  // Sensors
  async registerSensor(dto: RegisterSensorDto): Promise<Sensor> {
    const sensor = this.sensorRepo.create(dto);
    return await this.sensorRepo.save(sensor);
  }

  async findAllSensors(): Promise<Sensor[]> {
    return await this.sensorRepo.find({
      relations: ['controller'],
    });
  }

  async findSensorsByTarget(targetType: 'CIRCUIT' | 'SWITCHBOARD' | 'PANEL', targetId: string): Promise<Sensor[]> {
    return await this.sensorRepo.find({
      where: { targetType, targetId },
    });
  }

  // Commands
  async dispatchCommand(dto: DispatchCommandDto): Promise<DeviceCommand> {
    const command = this.commandRepo.create({
      ...dto,
      commandAction: 'SET_RELAY',
      status: 'SENT',
      sentAt: new Date(),
    });
    const saved = await this.commandRepo.save(command);

    await this.logAudit(
      'system',
      'DEVICE_COMMAND_DISPATCH',
      'DEVICE',
      dto.deviceId,
      { controllerId: dto.controllerId, channel: dto.relayChannel, state: dto.commandState },
    );

    return saved;
  }

  async acknowledgeCommand(commandId: string): Promise<DeviceCommand> {
    const command = await this.commandRepo.findOne({ where: { id: commandId } });
    if (!command) {
      throw new NotFoundException(`Command ${commandId} not found`);
    }
    command.status = 'ACKNOWLEDGED';
    command.ackedAt = new Date();
    return await this.commandRepo.save(command);
  }

  // Audit Logs
  async logAudit(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    const log = this.auditRepo.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
    });
    return await this.auditRepo.save(log);
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
