import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplianceSchedule } from './entities/appliance-schedule.entity';
import { AutomationScene } from './entities/automation-scene.entity';
import { MaintenanceTicket } from './entities/maintenance-ticket.entity';
import { TopologyService } from '../topology/topology.service';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';
import {
  CreateScheduleDto,
  CreateSceneDto,
  BulkToggleDto,
  CreateTicketDto,
  AssignTicketDto,
} from './dto';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(ApplianceSchedule)
    private readonly scheduleRepo: Repository<ApplianceSchedule>,
    @InjectRepository(AutomationScene)
    private readonly sceneRepo: Repository<AutomationScene>,
    @InjectRepository(MaintenanceTicket)
    private readonly ticketRepo: Repository<MaintenanceTicket>,
    private readonly topologyService: TopologyService,
    private readonly gateway: TelemetryGateway,
  ) {}

  // Schedules
  async createSchedule(dto: CreateScheduleDto): Promise<ApplianceSchedule> {
    const schedule = this.scheduleRepo.create(dto);
    return await this.scheduleRepo.save(schedule);
  }

  async getSchedulesByDevice(deviceId?: string): Promise<ApplianceSchedule[]> {
    const where = deviceId ? { deviceId } : {};
    return await this.scheduleRepo.find({ where, order: { timeOfDay: 'ASC' } });
  }

  // Scenes
  async createScene(dto: CreateSceneDto): Promise<AutomationScene> {
    const scene = this.sceneRepo.create({
      buildingId: dto.buildingId,
      name: dto.name,
      description: dto.description ?? '',
      actionsJson: dto.actions,
    });
    return await this.sceneRepo.save(scene);
  }

  async getScenes(buildingId?: string): Promise<AutomationScene[]> {
    const where = buildingId ? { buildingId } : {};
    return await this.sceneRepo.find({ where, order: { name: 'ASC' } });
  }

  async executeScene(sceneId: string): Promise<{ success: boolean; executedActionsCount: number }> {
    const scene = await this.sceneRepo.findOne({ where: { id: sceneId } });
    if (!scene) {
      throw new NotFoundException(`Scene ${sceneId} not found`);
    }

    let count = 0;
    for (const action of scene.actionsJson) {
      try {
        await this.topologyService.toggleDevice(action.deviceId, { state: action.state });
        this.gateway.broadcastDeviceState(action.deviceId, action.state);
        count++;
      } catch (err) {
        this.logger.warn(`Failed to execute scene action on device ${action.deviceId}: ${err.message}`);
      }
    }

    return { success: true, executedActionsCount: count };
  }

  // Bulk Device Actuation
  async bulkToggle(dto: BulkToggleDto): Promise<{ updatedCount: number }> {
    let count = 0;
    for (const deviceId of dto.deviceIds) {
      try {
        await this.topologyService.toggleDevice(deviceId, { state: dto.state });
        this.gateway.broadcastDeviceState(deviceId, dto.state);
        count++;
      } catch (err) {
        this.logger.warn(`Could not toggle device ${deviceId}: ${err.message}`);
      }
    }
    return { updatedCount: count };
  }

  // Maintenance Tickets
  async createTicket(dto: CreateTicketDto): Promise<MaintenanceTicket> {
    const ticket = this.ticketRepo.create({
      ...dto,
      status: 'OPEN',
    });
    return await this.ticketRepo.save(ticket);
  }

  async getTickets(circuitId?: string): Promise<MaintenanceTicket[]> {
    const where = circuitId ? { circuitId } : {};
    return await this.ticketRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async assignTechnician(ticketId: string, dto: AssignTicketDto): Promise<MaintenanceTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    ticket.assignedTechnician = dto.technicianName;
    ticket.status = 'ASSIGNED';
    return await this.ticketRepo.save(ticket);
  }

  async resolveTicket(ticketId: string): Promise<MaintenanceTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date();
    return await this.ticketRepo.save(ticket);
  }
}

