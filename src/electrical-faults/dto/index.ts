import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogFaultDto {
  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  circuitId: string;

  @ApiProperty({ example: 'OVERCURRENT' })
  @IsString()
  @IsNotEmpty()
  faultType: string;

  @ApiProperty({ enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' })
  @IsEnum(['INFO', 'WARNING', 'CRITICAL'])
  severity: 'INFO' | 'WARNING' | 'CRITICAL';

  @ApiProperty({ example: 25.4 })
  @IsNumber()
  triggerValue: number;

  @ApiProperty({ example: 16.0 })
  @IsNumber()
  thresholdValue: number;

  @ApiProperty({ example: 'CURRENT_RMS' })
  @IsString()
  @IsNotEmpty()
  parameter: string;

  @ApiProperty({ example: 'Continuous 25.4A current detected on a 16A rated breaker circuit.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  snapshotJson?: Record<string, any>;
}

export class CreateAlertRuleDto {
  @ApiProperty({ example: 'Living Room Overcurrent Rule' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['CIRCUIT', 'SWITCHBOARD', 'PANEL'], default: 'CIRCUIT' })
  @IsEnum(['CIRCUIT', 'SWITCHBOARD', 'PANEL'])
  targetType: 'CIRCUIT' | 'SWITCHBOARD' | 'PANEL';

  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ enum: ['CURRENT_RMS', 'VOLTAGE_RMS', 'TEMPERATURE', 'LEAKAGE_MA', 'POWER_FACTOR'] })
  @IsEnum(['CURRENT_RMS', 'VOLTAGE_RMS', 'TEMPERATURE', 'LEAKAGE_MA', 'POWER_FACTOR'])
  parameter: 'CURRENT_RMS' | 'VOLTAGE_RMS' | 'TEMPERATURE' | 'LEAKAGE_MA' | 'POWER_FACTOR';

  @ApiProperty({ enum: ['GT', 'LT', 'BETWEEN'], default: 'GT' })
  @IsEnum(['GT', 'LT', 'BETWEEN'])
  condition: 'GT' | 'LT' | 'BETWEEN';

  @ApiProperty({ example: 16.0 })
  @IsNumber()
  thresholdValue: number;

  @ApiProperty({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  durationSeconds?: number;

  @ApiProperty({ example: 0.5, default: 0.5 })
  @IsNumber()
  @IsOptional()
  hysteresis?: number;

  @ApiProperty({ enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' })
  @IsEnum(['INFO', 'WARNING', 'CRITICAL'])
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
