import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DetectionRun } from './entities/detection-run.entity';
import { Anomaly } from './entities/anomaly.entity';
import { TrainedModel } from './entities/trained-model.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import { System } from '../systems/entities/system.entity';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';
import { DetectorFactory } from './detectors/detector.factory';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { SeverityService } from '../severity/severity.service';
import { RootCauseService } from '../root-cause/root-cause.service';
import { JobsModule } from '../jobs/jobs.module';
import { ElectricalFaultsModule } from '../electrical-faults/electrical-faults.module';
import { ElectricalFaultDetectionService } from './electrical-fault-detection.service';
import { ElectricalFaultDetectionController } from './electrical-fault-detection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetectionRun,
      Anomaly,
      TrainedModel,
      Dataset,
      MetricRow,
      System,
    ]),
    BullModule.registerQueue({
      name: 'model-training',
    }),
    JobsModule,
    ElectricalFaultsModule,
  ],
  controllers: [DetectionController, ElectricalFaultDetectionController],
  providers: [
    DetectionService,
    DetectorFactory,
    PreprocessingService,
    SeverityService,
    RootCauseService,
    ElectricalFaultDetectionService,
  ],
  exports: [DetectionService, DetectorFactory, ElectricalFaultDetectionService],
})
export class DetectionModule {}

