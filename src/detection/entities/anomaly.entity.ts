import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DetectionRun } from './detection-run.entity';

export enum AnomalySeverity {
  CRITICAL = 'Critical',
  WARNING = 'Warning',
  INFO = 'Info',
}

@Entity('anomalies')
@Index(['runId', 'timestamp'])
export class Anomaly {
  @ApiProperty({ description: 'Unique anomaly UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Parent DetectionRun UUID' })
  @Column({ type: 'uuid' })
  runId: string;

  @ApiProperty({ description: 'Timestamp of the detected anomaly' })
  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @ApiProperty({ description: 'Normalized anomaly score [0.0 - 1.0]', example: 0.92 })
  @Column({ type: 'float' })
  score: number;

  @ApiProperty({
    description: 'Calculated severity tier',
    enum: AnomalySeverity,
    example: AnomalySeverity.CRITICAL,
  })
  @Column({
    type: 'enum',
    enum: AnomalySeverity,
    default: AnomalySeverity.WARNING,
  })
  severity: AnomalySeverity;

  @ApiProperty({
    description: 'Sensor metric snapshot at the anomaly timestep',
    example: { vibration: 4.8, temperature: 95.2 },
  })
  @Column({ type: 'jsonb' })
  metrics: Record<string, any>;

  @ApiProperty({
    description: 'Identified root cause metric or subsystem',
    example: 'vibration (deviated 4.2σ above baseline)',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  rootCause: string;

  @ManyToOne(() => DetectionRun, (run) => run.anomalies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'runId' })
  run: DetectionRun;
}

