import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class EstimateRulDto {
  @ApiProperty({
    description: 'UUID of the dataset to analyze for Remaining Useful Life (RUL)',
    example: 'd9b2d63d-a233-4f9e-9d2c-359543e4980a',
  })
  @IsUUID()
  datasetId: string;

  @ApiPropertyOptional({
    description: 'Health Index threshold below which system is considered in failure state',
    default: 0.25,
    minimum: 0.05,
    maximum: 0.9,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.05)
  @Max(0.9)
  failureThreshold?: number = 0.25;
}

