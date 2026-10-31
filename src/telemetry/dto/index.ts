import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CircuitTelemetryItemDto {
  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  circuitId: string;

  @ApiProperty({ example: 230.5 })
  @IsNumber()
  voltageRms: number;

  @ApiProperty({ example: 8.42 })
  @IsNumber()
  currentRms: number;

  @ApiProperty({ example: 1912.4, required: false })
  @IsNumber()
  @IsOptional()
  activePowerWatts?: number;

  @ApiProperty({ example: 384.1, required: false })
  @IsNumber()
  @IsOptional()
  reactivePowerVar?: number;

  @ApiProperty({ example: 0.98, default: 1.0 })
  @IsNumber()
  @IsOptional()
  powerFactor?: number;

  @ApiProperty({ example: 50.0, default: 50.0 })
  @IsNumber()
  @IsOptional()
  frequencyHz?: number;

  @ApiProperty({ example: 38.2, default: 30.0 })
  @IsNumber()
  @IsOptional()
  temperatureCelsius?: number;

  @ApiProperty({ example: 1.8, default: 0.0 })
  @IsNumber()
  @IsOptional()
  leakageCurrentMa?: number;

  @ApiProperty({ enum: ['ON', 'OFF'], default: 'ON' })
  @IsEnum(['ON', 'OFF'])
  @IsOptional()
  relayState?: 'ON' | 'OFF';

  @ApiProperty({ enum: ['CLOSED', 'TRIPPED'], default: 'CLOSED' })
  @IsEnum(['CLOSED', 'TRIPPED'])
  @IsOptional()
  mcbTripStatus?: 'CLOSED' | 'TRIPPED';
}

export class IngestTelemetryBatchDto {
  @ApiProperty({ example: 1793440000 })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ example: 'ctrl_esp32_living_01' })
  @IsString()
  @IsNotEmpty()
  controllerId: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isBackfill?: boolean;

  @ApiProperty({ type: [CircuitTelemetryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CircuitTelemetryItemDto)
  circuits: CircuitTelemetryItemDto[];
}

