import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentHealthRecord } from './entities/component-health-record.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';
import {
  UpdateHealthDto,
  RecordMaintenanceDto,
  ScheduleMaintenanceDto,
} from './dto';
import {
  PredictiveMaintenanceEngine,
  ComponentTelemetryContext,
  PredictiveMaintenanceOutput,
} from './predictive-maintenance.engine';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(ComponentHealthRecord)
    private readonly healthRepo: Repository<ComponentHealthRecord>,
    @InjectRepository(MaintenanceRecord)
    private readonly recordRepo: Repository<MaintenanceRecord>,
    @InjectRepository(MaintenanceSchedule)
    private readonly scheduleRepo: Repository<MaintenanceSchedule>,
    private readonly predictiveEngine: PredictiveMaintenanceEngine,
  ) {}

  async predictComponentHealth(
    context: ComponentTelemetryContext,
    saveToDb: boolean = true,
  ): Promise<PredictiveMaintenanceOutput> {
    const prediction = this.predictiveEngine.evaluateComponent(context);

    if (saveToDb) {
      await this.updateComponentHealth({
        entityType: context.componentType as any,
        entityId: context.componentId,
        healthScore: prediction.healthScore,
        failureRisk: prediction.riskLevel,
        estimatedRulDays: prediction.healthScore > 50 ? 365 : 60,
        thermalStressAccumulated: prediction.supportingEvidence.thermalStressScore,
        degradationReason: prediction.detectedIssues.join('; '),
      });
    }

    return prediction;
  }

  async getHealthOverview(): Promise<ComponentHealthRecord[]> {
    return await this.healthRepo.find({
      order: { healthScore: 'ASC' },
    });
  }

  async getComponentHealth(entityId: string): Promise<ComponentHealthRecord> {
    const health = await this.healthRepo.findOne({
      where: { entityId },
      order: { lastEvaluatedAt: 'DESC' },
    });
    if (!health) {
      throw new NotFoundException(`No health record for entity ${entityId}`);
    }
    return health;
  }

  async updateComponentHealth(dto: UpdateHealthDto): Promise<ComponentHealthRecord> {
    let record = await this.healthRepo.findOne({
      where: { entityId: dto.entityId },
    });

    if (!record) {
      record = this.healthRepo.create({
        ...dto,
        lastEvaluatedAt: new Date(),
      });
    } else {
      Object.assign(record, dto);
      record.lastEvaluatedAt = new Date();
    }

    return await this.healthRepo.save(record);
  }

  async recordMaintenance(dto: RecordMaintenanceDto): Promise<MaintenanceRecord> {
    const record = this.recordRepo.create({
      ...dto,
      performedAt: new Date(dto.performedAt),
    });
    return await this.recordRepo.save(record);
  }

  async getMaintenanceHistory(circuitId?: string): Promise<MaintenanceRecord[]> {
    const where = circuitId ? { circuitId } : {};
    return await this.recordRepo.find({
      where,
      order: { performedAt: 'DESC' },
    });
  }

  async scheduleMaintenance(dto: ScheduleMaintenanceDto): Promise<MaintenanceSchedule> {
    const schedule = this.scheduleRepo.create({
      ...dto,
      scheduledDate: new Date(dto.scheduledDate),
      status: 'PENDING',
    });
    return await this.scheduleRepo.save(schedule);
  }

  async getPendingSchedules(): Promise<MaintenanceSchedule[]> {
    return await this.scheduleRepo.find({
      where: { status: 'PENDING' },
      order: { scheduledDate: 'ASC' },
    });
  }
}
