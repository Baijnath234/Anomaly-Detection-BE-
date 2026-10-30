import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulResult } from './entities/rul-result.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import { RulService } from './rul.service';
import { RulController } from './rul.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RulResult, Dataset, MetricRow])],
  controllers: [RulController],
  providers: [RulService],
  exports: [RulService],
})
export class RulModule {}

