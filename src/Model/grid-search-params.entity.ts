import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Entity()
export class GridSearchParams {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { array: true, nullable: true  })
  batches: number[];

  @Column("int", { array: true, nullable: true })
  layers: number[];

  @Column("int", { array: true, nullable: true })
  maxEpochs: number[];

  @Column("int", { array: true, nullable: true })
  nodes: number[];

  @Column('float8', { array: true })
  rates: number[];

  @ManyToOne(() => ModelTraining, modelTraining => modelTraining.gridSearchParams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'modelTrainingId', referencedColumnName: 'id' })
  modelTraining: ModelTraining;
}
