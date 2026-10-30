import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Dataset } from '../../datasets/entities/dataset.entity';
import { TrainedModel } from '../../detection/entities/trained-model.entity';

@Entity('systems')
export class System {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the monitored system (e.g. Turbine-A1, Pump-04)' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Type/Category of system (e.g. Turbine, Compressor, Motor)' })
  @Column({ type: 'varchar', length: 100 })
  type: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Dataset, (dataset) => dataset.system, { cascade: true })
  datasets: Dataset[];

  @OneToMany(() => TrainedModel, (model) => model.system)
  trainedModels: TrainedModel[];
}

