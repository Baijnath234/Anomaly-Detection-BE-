import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anomaly } from '../detection/entities/anomaly.entity';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Anomaly])],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}

