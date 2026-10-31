import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDatasetDto {
  @ApiPropertyOptional({
    description: 'UUID of the monitored system this dataset belongs to',
    example: 'd9b2d63d-a233-4f9e-9d2c-359543e4980a',
  })
  @IsString()
  @IsOptional()
  systemId?: string;

  @ApiPropertyOptional({
    description: 'Friendly name or label for the uploaded dataset',
    example: 'Turbine-A1 Vibration Run Oct 2026',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Custom name of the timestamp column in the CSV file (if not automatically auto-detected)',
    example: 'timestamp',
  })
  @IsString()
  @IsOptional()
  timestampColumn?: string;
}
