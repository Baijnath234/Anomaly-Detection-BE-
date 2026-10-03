import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Entity()
export class PID {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pid: string;

  @Column({ nullable: true })
  name?: string;

  @ManyToOne(() => ModelTraining, (modelTraining) => modelTraining.pids, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelTrainingId' })
  modelTraining: ModelTraining;
}
