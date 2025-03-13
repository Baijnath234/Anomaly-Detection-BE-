import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Entity()
export class MlModel {
  @PrimaryGeneratedColumn()
  key: number;

  @Column( {nullable: true})
  uuid: string;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  nameJp: string;

  @Column({nullable: true})
  description: string;

  @Column({nullable: true})
  version: string;

  @Column({nullable: true})
  plant: string;

  @Column({nullable: true})
  unit: string;

  @Column({nullable: true})
  branch: string;

  @Column('date',{nullable: true})
  createdAt: string;

  @Column({nullable: true})
  status: string;

  @Column({nullable: true})
  isNewest: boolean;

  @Column({nullable: true})
  isStopped: boolean;

  @Column({nullable: true})
  isCountReset: boolean;

  @Column({nullable: true})
  specialKey: number;

  @Column({nullable: true})
  specialUuid: string;

  @Column({ nullable: true })
  deployAt: string;

  @Column({ nullable: true })
  stopAt: string;

  @Column({ nullable: true })
  trainedAt: string;

  @Column({ nullable: true })
  equipmentKey: number;

  @Column({nullable: true})
  deletionInProgress: boolean;

  @OneToMany(() => ModelTraining, modelTraining => modelTraining.mlModel)
  modelTrainings: ModelTraining[];  
}
