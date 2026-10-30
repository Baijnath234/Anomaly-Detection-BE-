import { Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DetectionRun, DetectionStatus } from './entities/detection-run.entity';
import { Anomaly } from './entities/anomaly.entity';
import { TrainedModel, ModelStatus } from './entities/trained-model.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import { System } from '../systems/entities/system.entity';
import { RunDetectionDto } from './dto/run-detection.dto';
import { TrainModelDto } from './dto/train-model.dto';
import { DetectorFactory } from './detectors/detector.factory';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { SeverityService } from '../severity/severity.service';
import { RootCauseService } from '../root-cause/root-cause.service';
import * as ss from 'simple-statistics';

export interface DetectionRunResult {
  runId: string;
  datasetId: string;
  method: string;
  status: DetectionStatus;
  totalRows: number;
  anomaliesCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  threshold: number;
  anomalies: Anomaly[];
}

@Injectable()
export class DetectionService {
  private readonly logger = new Logger(DetectionService.name);

  constructor(
    @InjectRepository(DetectionRun)
    private readonly runRepository: Repository<DetectionRun>,
    @InjectRepository(Anomaly)
    private readonly anomalyRepository: Repository<Anomaly>,
    @InjectRepository(TrainedModel)
    private readonly trainedModelRepository: Repository<TrainedModel>,
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(MetricRow)
    private readonly metricRowRepository: Repository<MetricRow>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    private readonly detectorFactory: DetectorFactory,
    private readonly preprocessingService: PreprocessingService,
    private readonly severityService: SeverityService,
    private readonly rootCauseService: RootCauseService,
    @Optional()
    @InjectQueue('model-training')
    private readonly trainingQueue?: Queue,
  ) {}

  async runDetection(dto: RunDetectionDto): Promise<DetectionRunResult> {
    const dataset = await this.datasetRepository.findOne({
      where: { id: dto.datasetId },
    });
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID '${dto.datasetId}' not found.`);
    }

    // 1. Create DetectionRun entity in RUNNING state
    const run = this.runRepository.create({
      datasetId: dto.datasetId,
      method: dto.method,
      params: {
        sensitivity: dto.sensitivity ?? 0.8,
        windowSize: dto.windowSize ?? 10,
      },
      status: DetectionStatus.RUNNING,
    });
    const savedRun = await this.runRepository.save(run);

    try {
      // 2. Fetch rows
      const rows = await this.metricRowRepository.find({
        where: { datasetId: dto.datasetId },
        order: { timestamp: 'ASC' },
      });

      if (rows.length === 0) {
        throw new NotFoundException(`Dataset '${dto.datasetId}' contains 0 metric rows.`);
      }

      const featureCols = Object.keys(rows[0].values).sort();
      const rawMatrix = rows.map((r) => featureCols.map((col) => r.values[col] ?? 0));

      // 3. Baseline stats for Root Cause analysis
      const baselineStats: Record<string, { mean: number; std: number }> = {};
      const baselineCount = Math.max(5, Math.floor(rows.length * 0.25));
      for (const col of featureCols) {
        const vals = rows.slice(0, baselineCount).map((r) => r.values[col] ?? 0);
        const mean = ss.mean(vals);
        const std = ss.standardDeviation(vals);
        baselineStats[col] = { mean, std: std === 0 ? 1e-6 : std };
      }

      // 4. Preprocess data
      const imputed = this.preprocessingService.imputeMissing(rawMatrix, 'forward_fill');
      const scaler = this.preprocessingService.fitScaler(imputed, 'standard');
      const scaled = this.preprocessingService.transform(imputed, scaler);

      // 5. Instantiate detector & run fit / predict
      const detector = this.detectorFactory.create(dto.method);
      await detector.fit(scaled, {
        sensitivity: dto.sensitivity ?? 0.8,
        windowSize: dto.windowSize ?? 10,
      });

      const prediction = await detector.predict(scaled);

      // 6. Form anomaly records
      const anomaliesToSave: Anomaly[] = [];
      let criticalCount = 0;
      let warningCount = 0;
      let infoCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const isAnomaly = prediction.flags[i];
        const score = prediction.scores[i];

        if (isAnomaly) {
          const rowVals = rows[i].values;
          // Preceding window for temporal root cause
          const windowHistory = rows
            .slice(Math.max(0, i - (dto.windowSize ?? 10)), i)
            .map((r) => r.values);

          const rcResult = this.rootCauseService.analyze(
            rowVals,
            baselineStats,
            windowHistory,
          );

          const severity = this.severityService.calculateSeverity(
            score,
            rcResult.deviations,
          );

          if (severity === 'Critical') criticalCount++;
          else if (severity === 'Warning') warningCount++;
          else infoCount++;

          const anomaly = this.anomalyRepository.create({
            runId: savedRun.id,
            timestamp: rows[i].timestamp,
            score: parseFloat(score.toFixed(4)),
            severity,
            metrics: rowVals,
            rootCause: `${rcResult.primaryMetric} (Z-score: ${rcResult.maxZScore}σ${
              rcResult.firstDeviatedMetric && rcResult.firstDeviatedMetric !== rcResult.primaryMetric
                ? `, triggered after ${rcResult.firstDeviatedMetric}`
                : ''
            })`,
          });

          anomaliesToSave.push(anomaly);
        }
      }

      // 7. Persist anomalies in database
      if (anomaliesToSave.length > 0) {
        await this.anomalyRepository.save(anomaliesToSave, { chunk: 200 });
      }

      // 8. Update run to COMPLETED
      savedRun.status = DetectionStatus.COMPLETED;
      savedRun.params = {
        ...savedRun.params,
        totalRows: rows.length,
        anomaliesCount: anomaliesToSave.length,
        threshold: prediction.threshold,
      };
      await this.runRepository.save(savedRun);

      return {
        runId: savedRun.id,
        datasetId: dto.datasetId,
        method: dto.method,
        status: DetectionStatus.COMPLETED,
        totalRows: rows.length,
        anomaliesCount: anomaliesToSave.length,
        criticalCount,
        warningCount,
        infoCount,
        threshold: prediction.threshold,
        anomalies: anomaliesToSave,
      };
    } catch (err) {
      this.logger.error(`Detection run ${savedRun.id} failed: ${err.message}`, err.stack);
      savedRun.status = DetectionStatus.FAILED;
      savedRun.params = { ...savedRun.params, error: err.message };
      await this.runRepository.save(savedRun);
      throw err;
    }
  }

  async getRunResults(runId: string): Promise<DetectionRunResult> {
    const run = await this.runRepository.findOne({
      where: { id: runId },
      relations: ['anomalies'],
    });

    if (!run) {
      throw new NotFoundException(`Detection run with ID '${runId}' not found.`);
    }

    const anomalies = run.anomalies || [];
    let criticalCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const a of anomalies) {
      if (a.severity === 'Critical') criticalCount++;
      else if (a.severity === 'Warning') warningCount++;
      else infoCount++;
    }

    return {
      runId: run.id,
      datasetId: run.datasetId,
      method: run.method,
      status: run.status,
      totalRows: run.params?.totalRows ?? 0,
      anomaliesCount: anomalies.length,
      criticalCount,
      warningCount,
      infoCount,
      threshold: run.params?.threshold ?? 0.5,
      anomalies,
    };
  }

  async trainModel(dto: TrainModelDto): Promise<TrainedModel> {
    const system = await this.systemRepository.findOne({ where: { id: dto.systemId } });
    if (!system) {
      throw new NotFoundException(`System with ID '${dto.systemId}' not found.`);
    }

    const dataset = await this.datasetRepository.findOne({ where: { id: dto.datasetId } });
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID '${dto.datasetId}' not found.`);
    }

    // Create record
    const trainedModel = this.trainedModelRepository.create({
      systemId: dto.systemId,
      method: dto.method,
      status: ModelStatus.QUEUED,
    });
    const saved = await this.trainedModelRepository.save(trainedModel);

    // Queue training job
    if (this.trainingQueue) {
      try {
        await this.trainingQueue.add('train-model', {
          modelId: saved.id,
          systemId: dto.systemId,
          datasetId: dto.datasetId,
          method: dto.method,
          epochs: dto.epochs ?? 25,
          batchSize: dto.batchSize ?? 32,
        });
        this.logger.log(`Enqueued training job for model ${saved.id} into BullMQ queue.`);
      } catch (queueErr) {
        this.logger.warn(`Could not enqueue into BullMQ (Redis might not be running): ${queueErr.message}`);
      }
    }

    return saved;
  }

  async getModelStatus(id: string): Promise<TrainedModel> {
    const model = await this.trainedModelRepository.findOne({
      where: { id },
      relations: ['system'],
    });

    if (!model) {
      throw new NotFoundException(`TrainedModel with ID '${id}' not found.`);
    }

    return model;
  }
}

