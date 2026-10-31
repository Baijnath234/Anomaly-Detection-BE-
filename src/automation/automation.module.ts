import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceSchedule } from './entities/appliance-schedule.entity';
import { AutomationScene } from './entities/automation-scene.entity';
import { MaintenanceTicket } from './entities/maintenance-ticket.entity';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { TopologyModule } from '../topology/topology.module';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplianceSchedule,
      AutomationScene,
      MaintenanceTicket,
    ]),
    TopologyModule,
    TelemetryModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}

