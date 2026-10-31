import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectricalFaultRecord } from './entities/electrical-fault-record.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { NotificationRecord } from './entities/notification-record.entity';
import { LogFaultDto, CreateAlertRuleDto } from './dto';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';

@Injectable()
export class ElectricalFaultsService {
  constructor(
    @InjectRepository(ElectricalFaultRecord)
    private readonly faultRepo: Repository<ElectricalFaultRecord>,
    @InjectRepository(AlertRule)
    private readonly ruleRepo: Repository<AlertRule>,
    @InjectRepository(NotificationRecord)
    private readonly notificationRepo: Repository<NotificationRecord>,
    private readonly gateway: TelemetryGateway,
  ) {}

  async logFault(dto: LogFaultDto): Promise<ElectricalFaultRecord> {
    const fault = this.faultRepo.create({
      ...dto,
      status: 'ACTIVE',
    });
    const saved = await this.faultRepo.save(fault);

    // Create Notification
    const notification = this.notificationRepo.create({
      title: `${dto.severity} Hazard: ${dto.faultType}`,
      message: dto.message,
      severity: dto.severity,
      link: `/faults/${saved.id}`,
    });
    await this.notificationRepo.save(notification);

    // Broadcast Real-time Alert
    this.gateway.broadcastFaultAlert(dto.circuitId, {
      id: saved.id,
      faultType: dto.faultType,
      severity: dto.severity,
      message: dto.message,
      triggerValue: dto.triggerValue,
    });

    return saved;
  }

  async getActiveFaults(): Promise<ElectricalFaultRecord[]> {
    return await this.faultRepo.find({
      where: { status: 'ACTIVE' },
      order: { createdAt: 'DESC' },
    });
  }

  async getFaultHistory(circuitId?: string): Promise<ElectricalFaultRecord[]> {
    if (circuitId) {
      return await this.faultRepo.find({
        where: { circuitId },
        order: { createdAt: 'DESC' },
      });
    }
    return await this.faultRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async acknowledgeFault(id: string): Promise<ElectricalFaultRecord> {
    const fault = await this.faultRepo.findOne({ where: { id } });
    if (!fault) throw new NotFoundException(`Fault ${id} not found`);
    fault.status = 'ACKNOWLEDGED';
    fault.acknowledgedAt = new Date();
    return await this.faultRepo.save(fault);
  }

  async resolveFault(id: string): Promise<ElectricalFaultRecord> {
    const fault = await this.faultRepo.findOne({ where: { id } });
    if (!fault) throw new NotFoundException(`Fault ${id} not found`);
    fault.status = 'RESOLVED';
    fault.resolvedAt = new Date();
    return await this.faultRepo.save(fault);
  }

  // Rules
  async createAlertRule(dto: CreateAlertRuleDto): Promise<AlertRule> {
    const rule = this.ruleRepo.create(dto);
    return await this.ruleRepo.save(rule);
  }

  async findAllRules(): Promise<AlertRule[]> {
    return await this.ruleRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationRecord[]> {
    const where = userId ? [{ userId }, { userId: null }] : {};
    return await this.notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markNotificationRead(id: string): Promise<NotificationRecord> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);
    notification.isRead = true;
    return await this.notificationRepo.save(notification);
  }
}
