import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  cronExpression?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => ModelTraining, (modelTraining) => modelTraining.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelTrainingId' })
  modelTraining: ModelTraining;
}
