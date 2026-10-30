import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainedModel, ModelStatus } from '../detection/entities/trained-model.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { DetectorFactory } from '../detection/detectors/detector.factory';
import * as path from 'path';

export interface TrainJobData {
  modelId: string;
  systemId: string;
  datasetId: string;
  method: string;
  epochs?: number;
  batchSize?: number;
}

@Processor('model-training')
export class TrainingProcessor extends WorkerHost {
  private readonly logger = new Logger(TrainingProcessor.name);

  constructor(
    @InjectRepository(TrainedModel)
    private readonly trainedModelRepository: Repository<TrainedModel>,
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(MetricRow)
    private readonly metricRowRepository: Repository<MetricRow>,
    private readonly preprocessingService: PreprocessingService,
    private readonly detectorFactory: DetectorFactory,
  ) {
    super();
  }

  async process(job: Job<TrainJobData, any, string>): Promise<any> {
    const { modelId, datasetId, method, epochs = 25, batchSize = 32 } = job.data;
    this.logger.log(`[Job ${job.id}] Starting model training for modelId=${modelId}, method=${method}`);

    const modelRecord = await this.trainedModelRepository.findOne({
      where: { id: modelId },
    });
    if (!modelRecord) {
      this.logger.error(`TrainedModel record ${modelId} not found.`);
      return;
    }

    modelRecord.status = ModelStatus.TRAINING;
    await this.trainedModelRepository.save(modelRecord);

    const startTime = Date.now();

    try {
      // 1. Fetch training metric rows
      const rows = await this.metricRowRepository.find({
        where: { datasetId },
        order: { timestamp: 'ASC' },
      });

      if (rows.length === 0) {
        throw new Error(`Dataset ${datasetId} contains no rows.`);
      }

      const featureCols = Object.keys(rows[0].values).sort();
      const rawMatrix = rows.map((r) => featureCols.map((c) => r.values[c] ?? 0));

      // 2. Preprocess
      const imputed = this.preprocessingService.imputeMissing(rawMatrix, 'forward_fill');
      const scaler = this.preprocessingService.fitScaler(imputed, 'standard');
      const scaled = this.preprocessingService.transform(imputed, scaler);

      // 3. Instantiate detector and fit
      const detector = this.detectorFactory.create(method);
      await detector.fit(scaled, { epochs, batchSize, sensitivity: 0.8 });

      // 4. Save trained weights to disk
      const storageDir = process.env.MODEL_STORAGE_PATH || './storage/models';
      const modelPath = path.resolve(storageDir, modelId);

      if (detector.save) {
        await detector.save(modelPath);
      }

      const trainingDuration = Date.now() - startTime;

      modelRecord.status = ModelStatus.COMPLETED;
      modelRecord.filePath = modelPath;
      modelRecord.metrics = {
        trainingDurationMs: trainingDuration,
        samplesCount: rows.length,
        featuresCount: featureCols.length,
        features: featureCols,
        scaler,
        epochs,
        batchSize,
      };

      await this.trainedModelRepository.save(modelRecord);
      this.logger.log(`[Job ${job.id}] Model training finished successfully in ${trainingDuration}ms.`);

      return { success: true, modelId, filePath: modelPath };
    } catch (error) {
      this.logger.error(`[Job ${job.id}] Training failed: ${error.message}`, error.stack);
      modelRecord.status = ModelStatus.FAILED;
      modelRecord.metrics = { error: error.message };
      await this.trainedModelRepository.save(modelRecord);
      throw error;
    }
  }
}

