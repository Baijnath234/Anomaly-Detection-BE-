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
import { System } from '../../systems/entities/system.entity';
import { MetricRow } from './metric-row.entity';
import { DetectionRun } from '../../detection/entities/detection-run.entity';
import { RulResult } from '../../rul/entities/rul-result.entity';

@Entity('datasets')
export class Dataset {
  @ApiProperty({ description: 'Unique dataset UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Foreign key referencing monitored System' })
  @Column({ type: 'uuid' })
  systemId: string;

  @ApiProperty({ description: 'Dataset display name or filename' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'List of column names parsed from dataset', example: ['timestamp', 'vibration', 'temperature', 'pressure'] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  columns: string[];

  @ApiProperty({ description: 'Total rows in dataset', example: 1000 })
  @Column({ type: 'int', default: 0 })
  rowCount: number;

  @ApiProperty({ description: 'Upload/Creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => System, (system) => system.datasets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'systemId' })
  system: System;

  @OneToMany(() => MetricRow, (row) => row.dataset, { cascade: true })
  rows: MetricRow[];

  @OneToMany(() => DetectionRun, (run) => run.dataset)
  detectionRuns: DetectionRun[];

  @OneToMany(() => RulResult, (rul) => rul.dataset)
  rulResults: RulResult[];
}

