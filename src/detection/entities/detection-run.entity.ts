import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Dataset } from '../../datasets/entities/dataset.entity';
import { Anomaly } from './anomaly.entity';

export enum DetectionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('detection_runs')
export class DetectionRun {
  @ApiProperty({ description: 'Detection run unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Dataset UUID analyzed' })
  @Column({ type: 'uuid' })
  datasetId: string;

  @ApiProperty({
    description: 'Detection algorithm used',
    example: 'ensemble',
    enum: ['zscore', 'isolation_forest', 'lof', 'ocsvm', 'autoencoder', 'lstm_ae', 'ensemble'],
  })
  @Column({ type: 'varchar', length: 50 })
  method: string;

  @ApiProperty({
    description: 'Hyperparameters and configuration used for this run',
    example: { sensitivity: 0.8, windowSize: 10 },
  })
  @Column({ type: 'jsonb', default: () => "'{}'" })
  params: Record<string, any>;

  @ApiProperty({
    description: 'Status of detection execution',
    enum: DetectionStatus,
    example: DetectionStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: DetectionStatus,
    default: DetectionStatus.PENDING,
  })
  status: DetectionStatus;

  @ApiProperty({ description: 'Execution timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Dataset, (dataset) => dataset.detectionRuns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'datasetId' })
  dataset: Dataset;

  @OneToMany(() => Anomaly, (anomaly) => anomaly.run, { cascade: true })
  anomalies: Anomaly[];
}

