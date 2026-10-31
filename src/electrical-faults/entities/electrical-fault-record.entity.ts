import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('electrical_fault_records')
@Index(['circuitId', 'status', 'createdAt'])
export class ElectricalFaultRecord {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Circuit UUID where fault was detected' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({
    description: 'Electrical fault classification',
    example: 'OVERCURRENT',
    enum: [
      'OVERCURRENT',
      'VOLTAGE_SAG',
      'VOLTAGE_SURGE',
      'OVERHEATING',
      'EARTH_LEAKAGE',
      'MICRO_ARCING',
      'PHASE_IMBALANCE',
      'BREAKER_TRIP',
      'DEGRADATION_WARNING',
    ],
  })
  @Column({ type: 'varchar', length: 50 })
  faultType: string;

  @ApiProperty({ description: 'Severity level', enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' })
  @Column({ type: 'varchar', length: 20, default: 'WARNING' })
  severity: 'INFO' | 'WARNING' | 'CRITICAL';

  @ApiProperty({ description: 'Telemetry value that triggered the fault', example: 24.8 })
  @Column({ type: 'float' })
  triggerValue: number;

  @ApiProperty({ description: 'Safety threshold value configured', example: 16.0 })
  @Column({ type: 'float' })
  thresholdValue: number;

  @ApiProperty({ description: 'Electrical parameter monitored', example: 'CURRENT_RMS' })
  @Column({ type: 'varchar', length: 50 })
  parameter: string;

  @ApiProperty({ description: 'Human-readable explanation of fault root cause' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'JSON snapshot of electrical parameters at the moment of fault' })
  @Column({ type: 'jsonb', nullable: true })
  snapshotJson: Record<string, any>;

  @ApiProperty({ description: 'Fault resolution status', enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE' })
  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

  @ApiProperty({ description: 'Timestamp when user or technician acknowledged' })
  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt: Date;

  @ApiProperty({ description: 'Timestamp when issue was physically resolved' })
  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
