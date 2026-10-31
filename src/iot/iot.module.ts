import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTController } from './entities/iot-controller.entity';
import { Sensor } from './entities/sensor.entity';
import { DeviceCommand } from './entities/device-command.entity';
import { AuditLog } from './entities/audit-log.entity';
import { IoTService } from './iot.service';
import { IoTApiController } from './iot.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IoTController,
      Sensor,
      DeviceCommand,
      AuditLog,
    ]),
  ],
  controllers: [IoTApiController],
  providers: [IoTService],
  exports: [IoTService],
})
export class IoTModule {}

