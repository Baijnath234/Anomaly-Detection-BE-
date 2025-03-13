import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Entity()
export class LoadCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column( {nullable: true})
  pid: string;

  @Column( {nullable: true})
  lower: string;

  @Column( {nullable: true})
  upper: string;

  @Column( {nullable: true})
  loadId: string;

  @Column( {nullable: true})
  isUsed: boolean;

  @Column( {nullable: true})
  isLowerEqualityStrict: boolean;

  @Column( {nullable: true})
  isUpperEqualityStrict: boolean;

  @Column( {nullable: true})
  createdAt: string;

  @ManyToOne(() => ModelTraining, (modelTraining) => modelTraining.loadConditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelTrainingId' })
  modelTraining: ModelTraining;
}
