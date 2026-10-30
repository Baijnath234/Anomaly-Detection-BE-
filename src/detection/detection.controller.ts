import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DetectionService, DetectionRunResult } from './detection.service';
import { RunDetectionDto } from './dto/run-detection.dto';
import { TrainModelDto } from './dto/train-model.dto';
import { TrainedModel } from './entities/trained-model.entity';

@ApiTags('Anomaly Detection & Models')
@Controller('api')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post('detection/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute anomaly detection on a dataset',
    description:
      'Runs chosen algorithm (zscore | isolation_forest | lof | ocsvm | autoencoder | lstm_ae | ensemble). Calculates anomaly scores, evaluates severity (Critical/Warning/Info), and identifies root causes.',
  })
  @ApiResponse({ status: 200, description: 'Detection run completed with identified anomalies' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  async runDetection(@Body() dto: RunDetectionDto): Promise<DetectionRunResult> {
    return this.detectionService.runDetection(dto);
  }

  @Get('detection/:runId/results')
  @ApiOperation({
    summary: 'Retrieve results and list of anomalies for a specific detection run',
  })
  @ApiParam({ name: 'runId', type: 'string', description: 'DetectionRun UUID' })
  @ApiResponse({ status: 200, description: 'Detection run summary and anomalies list' })
  @ApiResponse({ status: 404, description: 'Detection run not found' })
  async getRunResults(
    @Param('runId', ParseUUIDPipe) runId: string,
  ): Promise<DetectionRunResult> {
    return this.detectionService.getRunResults(runId);
  }

  @Post('models/train')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue model training in BullMQ background worker',
    description:
      'Enqueues training job (Autoencoder, LSTM Autoencoder, Isolation Forest) into BullMQ. Model weights are trained off the main thread and persisted to disk.',
  })
  @ApiResponse({ status: 202, description: 'Training job enqueued successfully', type: TrainedModel })
  @ApiResponse({ status: 404, description: 'System or Dataset not found' })
  async trainModel(@Body() dto: TrainModelDto): Promise<TrainedModel> {
    return this.detectionService.trainModel(dto);
  }

  @Get('models/:id/status')
  @ApiOperation({
    summary: 'Check training status and performance metrics of a model',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'TrainedModel UUID' })
  @ApiResponse({ status: 200, description: 'TrainedModel status and metrics', type: TrainedModel })
  @ApiResponse({ status: 404, description: 'Model not found' })
  async getModelStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TrainedModel> {
    return this.detectionService.getModelStatus(id);
  }
}

