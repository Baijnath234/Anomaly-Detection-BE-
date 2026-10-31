import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectricalFaultRecord } from './entities/electrical-fault-record.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { NotificationRecord } from './entities/notification-record.entity';
import { ElectricalFaultsService } from './electrical-faults.service';
import { ElectricalFaultsController } from './electrical-faults.controller';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElectricalFaultRecord,
      AlertRule,
      NotificationRecord,
    ]),
    TelemetryModule,
  ],
  controllers: [ElectricalFaultsController],
  providers: [ElectricalFaultsService],
  exports: [ElectricalFaultsService],
})
export class ElectricalFaultsModule {}
