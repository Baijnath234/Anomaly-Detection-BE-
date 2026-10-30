import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export enum DetectionMethod {
  ZSCORE = 'zscore',
  ISOLATION_FOREST = 'isolation_forest',
  LOF = 'lof',
  OCSVM = 'ocsvm',
  AUTOENCODER = 'autoencoder',
  LSTM_AE = 'lstm_ae',
  ENSEMBLE = 'ensemble',
}

export class RunDetectionDto {
  @ApiProperty({
    description: 'UUID of the dataset to analyze',
    example: 'd9b2d63d-a233-4f9e-9d2c-359543e4980a',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Detection method algorithm',
    enum: DetectionMethod,
    example: DetectionMethod.ENSEMBLE,
  })
  @IsEnum(DetectionMethod)
  method: DetectionMethod;

  @ApiPropertyOptional({
    description: 'Sensitivity threshold multiplier (0.1 = conservative/few alerts, 1.0 = highly sensitive)',
    default: 0.8,
    minimum: 0.1,
    maximum: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  sensitivity?: number = 0.8;

  @ApiPropertyOptional({
    description: 'Temporal sliding window size for sequence models (LSTM / rolling stats)',
    default: 10,
    minimum: 2,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(100)
  windowSize?: number = 10;
}

