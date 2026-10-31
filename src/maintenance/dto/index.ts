import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHealthDto {
  @ApiProperty({
    enum: ['CIRCUIT_WIRING', 'SWITCH_RELAY', 'BREAKER', 'TERMINAL_LUG', 'PANEL_BUSBAR'],
  })
  @IsEnum(['CIRCUIT_WIRING', 'SWITCH_RELAY', 'BREAKER', 'TERMINAL_LUG', 'PANEL_BUSBAR'])
  entityType: 'CIRCUIT_WIRING' | 'SWITCH_RELAY' | 'BREAKER' | 'TERMINAL_LUG' | 'PANEL_BUSBAR';

  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ example: 88.5 })
  @IsNumber()
  healthScore: number;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  failureRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ example: 720 })
  @IsNumber()
  estimatedRulDays: number;

  @ApiProperty({ example: 12.4, default: 0.0 })
  @IsNumber()
  @IsOptional()
  thermalStressAccumulated?: number;

  @ApiProperty({ example: 1250, default: 0 })
  @IsNumber()
  @IsOptional()
  cyclesSwitched?: number;

  @ApiProperty({ example: 'Slight thermal aging observed due to continuous load above 80% capacity.' })
  @IsString()
  @IsOptional()
  degradationReason?: string;
}

export class RecordMaintenanceDto {
  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  circuitId: string;

  @ApiProperty({ example: 'TERMINAL_LUG' })
  @IsString()
  @IsNotEmpty()
  componentType: string;

  @ApiProperty({ example: 'Retorqued loose terminal screws and re-seated CT clamp' })
  @IsString()
  @IsNotEmpty()
  actionTaken: string;

  @ApiProperty({ example: 'John Doe, Master Electrician' })
  @IsString()
  @IsNotEmpty()
  technicianName: string;

  @ApiProperty({ example: 150.0, required: false })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiProperty({ example: '2026-10-31T12:00:00Z' })
  @IsDateString()
  performedAt: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ScheduleMaintenanceDto {
  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  circuitId: string;

  @ApiProperty({ example: 'CIRCUIT_WIRING' })
  @IsString()
  @IsNotEmpty()
  componentType: string;

  @ApiProperty({ example: '2026-11-15' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiProperty({ example: 'Health index dropped to 58%; thermal stress elevated' })
  @IsString()
  @IsNotEmpty()
  recommendationReason: string;
}

