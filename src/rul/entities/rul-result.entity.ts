import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Dataset } from '../../datasets/entities/dataset.entity';

@Entity('rul_results')
export class RulResult {
  @ApiProperty({ description: 'RUL result unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Evaluated Dataset UUID' })
  @Column({ type: 'uuid' })
  datasetId: string;

  @ApiProperty({
    description: 'Health Index trajectory time-series',
    example: { timestamps: ['2026-10-01T00:00:00Z'], scores: [0.98, 0.95, 0.88] },
  })
  @Column({ type: 'jsonb' })
  healthIndex: {
    timestamps: string[];
    scores: number[];
  };

  @ApiProperty({ description: 'Estimated remaining useful life in days', example: 42.5 })
  @Column({ type: 'float' })
  etaDays: number;

  @ApiProperty({ description: 'Conservative 90% lower bound in days', example: 34.0 })
  @Column({ type: 'float' })
  lowerDays: number;

  @ApiProperty({ description: 'Optimistic 90% upper bound in days', example: 51.2 })
  @Column({ type: 'float' })
  upperDays: number;

  @ApiProperty({ description: 'Estimation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Dataset, (dataset) => dataset.rulResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'datasetId' })
  dataset: Dataset;
}

