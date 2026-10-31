import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentHealthRecord } from './entities/component-health-record.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { PredictiveMaintenanceEngine } from './predictive-maintenance.engine';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComponentHealthRecord,
      MaintenanceRecord,
      MaintenanceSchedule,
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, PredictiveMaintenanceEngine],
  exports: [MaintenanceService, PredictiveMaintenanceEngine],
})
export class MaintenanceModule {}
