import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorReading } from './entities/sensor-reading.entity';
import { EnergyConsumptionRecord } from './entities/energy-consumption-record.entity';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { TelemetryGateway } from './telemetry.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SensorReading,
      EnergyConsumptionRecord,
    ]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryGateway],
  exports: [TelemetryService, TelemetryGateway],
})
export class TelemetryModule {}

