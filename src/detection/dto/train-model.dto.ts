import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { DetectionMethod } from './run-detection.dto';

export class TrainModelDto {
  @ApiProperty({
    description: 'System UUID associated with model',
    example: 'd9b2d63d-a233-4f9e-9d2c-359543e4980a',
  })
  @IsUUID()
  systemId: string;

  @ApiProperty({
    description: 'Dataset UUID used for training normal baseline model',
    example: 'a4c7e81b-5321-4f9e-bc21-82736154091a',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Model architecture to train',
    enum: DetectionMethod,
    example: DetectionMethod.AUTOENCODER,
  })
  @IsEnum(DetectionMethod)
  method: DetectionMethod;

  @ApiPropertyOptional({ default: 30, minimum: 1, maximum: 200 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  epochs?: number = 30;

  @ApiPropertyOptional({ default: 32, minimum: 4, maximum: 512 })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(512)
  batchSize?: number = 32;
}

