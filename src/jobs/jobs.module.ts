import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingProcessor } from './training.processor';
import { TrainedModel } from '../detection/entities/trained-model.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { DetectorFactory } from '../detection/detectors/detector.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainedModel, Dataset, MetricRow]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
          retryStrategy: (times) => Math.min(times * 100, 3000),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'model-training',
    }),
  ],
  providers: [TrainingProcessor, PreprocessingService, DetectorFactory],
  exports: [BullModule, TrainingProcessor],
})
export class JobsModule {}

