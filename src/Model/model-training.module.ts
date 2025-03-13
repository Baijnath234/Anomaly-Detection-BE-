import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelTraining } from './model-training.entity';
import { PID } from './pid.entity';
import { GridSearchParams } from './grid-search-params.entity';
import { LoadCondition } from './load-condition.entity';
import { ModelTrainingService } from './model-training.service';
import { ModelTrainingController } from './model-training.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelTraining, PID, GridSearchParams, LoadCondition]),
  ],
  providers: [ModelTrainingService],
  controllers: [ModelTrainingController],
})
export class ModelTrainingModule {}
