import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Dataset } from './dataset.entity';

@Entity('metric_rows')
@Index(['datasetId', 'timestamp'])
export class MetricRow {
  @ApiProperty({ description: 'Metric row unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Foreign key to parent Dataset' })
  @Column({ type: 'uuid' })
  datasetId: string;

  @ApiProperty({ description: 'Timestamp of metric observation' })
  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @ApiProperty({
    description: 'Key-value map of sensor metrics and numerical readings',
    example: { vibration: 0.45, temperature: 78.2, pressure: 101.3 },
  })
  @Column({ type: 'jsonb' })
  values: Record<string, number>;

  @ManyToOne(() => Dataset, (dataset) => dataset.rows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'datasetId' })
  dataset: Dataset;
}

