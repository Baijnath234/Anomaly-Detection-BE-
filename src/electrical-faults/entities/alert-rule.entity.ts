import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('alert_rules')
export class AlertRule {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Descriptive rule name', example: 'Living Room Overcurrent Rule' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Target scope', enum: ['CIRCUIT', 'SWITCHBOARD', 'PANEL'] })
  @Column({ type: 'varchar', length: 50, default: 'CIRCUIT' })
  targetType: 'CIRCUIT' | 'SWITCHBOARD' | 'PANEL';

  @ApiProperty({ description: 'Target entity UUID (circuitId, switchboardId, etc.)' })
  @Column({ type: 'uuid' })
  targetId: string;

  @ApiProperty({
    description: 'Electrical telemetry parameter to evaluate',
    enum: ['CURRENT_RMS', 'VOLTAGE_RMS', 'TEMPERATURE', 'LEAKAGE_MA', 'POWER_FACTOR'],
  })
  @Column({ type: 'varchar', length: 50 })
  parameter: 'CURRENT_RMS' | 'VOLTAGE_RMS' | 'TEMPERATURE' | 'LEAKAGE_MA' | 'POWER_FACTOR';

  @ApiProperty({ description: 'Comparison operator', enum: ['GT', 'LT', 'BETWEEN'] })
  @Column({ type: 'varchar', length: 20, default: 'GT' })
  condition: 'GT' | 'LT' | 'BETWEEN';

  @ApiProperty({ description: 'Threshold numeric value', example: 16.0 })
  @Column({ type: 'float' })
  thresholdValue: number;

  @ApiProperty({ description: 'Second threshold value for BETWEEN conditions', nullable: true })
  @Column({ type: 'float', nullable: true })
  thresholdValueSecondary: number;

  @ApiProperty({ description: 'Required continuous duration over threshold before firing (seconds)', default: 0 })
  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @ApiProperty({ description: 'Hysteresis band value to prevent alert flapping', default: 0.5 })
  @Column({ type: 'float', default: 0.5 })
  hysteresis: number;

  @ApiProperty({ description: 'Alert severity', enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' })
  @Column({ type: 'varchar', length: 20, default: 'WARNING' })
  severity: 'INFO' | 'WARNING' | 'CRITICAL';

  @ApiProperty({ description: 'Whether rule is currently active', default: true })
  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

