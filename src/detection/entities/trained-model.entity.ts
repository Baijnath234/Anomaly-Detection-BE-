import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { System } from '../../systems/entities/system.entity';

export enum ModelStatus {
  QUEUED = 'QUEUED',
  TRAINING = 'TRAINING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('trained_models')
export class TrainedModel {
  @ApiProperty({ description: 'Trained model unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated System UUID' })
  @Column({ type: 'uuid' })
  systemId: string;

  @ApiProperty({
    description: 'Algorithm method',
    example: 'autoencoder',
    enum: ['autoencoder', 'lstm_ae', 'isolation_forest', 'lof'],
  })
  @Column({ type: 'varchar', length: 50 })
  method: string;

  @ApiProperty({ description: 'Local path where model artifacts/weights are saved' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @ApiProperty({ description: 'Model training execution status', enum: ModelStatus })
  @Column({
    type: 'enum',
    enum: ModelStatus,
    default: ModelStatus.QUEUED,
  })
  status: ModelStatus;

  @ApiProperty({
    description: 'Training metadata (loss, validation error, epochs)',
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @ApiProperty({ description: 'Timestamp when model was trained/saved' })
  @CreateDateColumn({ type: 'timestamptz' })
  trainedAt: Date;

  @ManyToOne(() => System, (system) => system.trainedModels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'systemId' })
  system: System;
}

