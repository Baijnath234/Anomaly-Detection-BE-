import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { MetricRow } from './entities/metric-row.entity';
import { System } from '../systems/entities/system.entity';
import { DatasetsService } from './datasets.service';
import { DatasetsController } from './datasets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dataset, MetricRow, System])],
  controllers: [DatasetsController],
  providers: [DatasetsService],
  exports: [DatasetsService],
})
export class DatasetsModule {}

