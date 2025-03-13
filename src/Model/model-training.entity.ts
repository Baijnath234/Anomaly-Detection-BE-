import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Unique } from 'typeorm';
import { PID } from './pid.entity';
import { GridSearchParams } from './grid-search-params.entity';
import { Schedule } from './schedule.entity';
import { LoadCondition } from './load-condition.entity';
import { MlModel } from './ml-model.entity';
import { IsDate, IsOptional, IsString } from 'class-validator';

@Entity('model_training')
export class ModelTraining {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  branch?: string;

  @Column({ nullable: true })
  powerPlant: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  analog?: string;

  @Column({ nullable: true })
  digital?: string;

  @Column({ nullable: true })
  monitor?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Column('date', { nullable: true })
  endDate: string;

  @Column({ nullable: true })
  tags?: string;

  @Column({ nullable: true })
  layers?: string;

  @Column({ nullable: true })
  nodes?: string;

  @Column({ nullable: true })
  batches?: string;

  @Column({ nullable: true })
  maxEpochs?: string;

  @OneToMany(() => PID, pid => pid.modelTraining, { cascade: true })
  pids: PID[];

  @OneToMany(() => GridSearchParams, grid => grid.modelTraining, { cascade: true })
  gridSearchParams: GridSearchParams[];

  @OneToMany(() => Schedule, schedule => schedule.modelTraining, { cascade: true })
  schedules: Schedule[];

  @OneToMany(() => LoadCondition, loadCondition => loadCondition.modelTraining, { cascade: true })
  loadConditions: LoadCondition[];

  @ManyToOne(() => MlModel, mlModel => mlModel.modelTrainings)
  mlModel: MlModel;

  @Column('text', { array: true, nullable: true })
  monitorAlarmTags?: string[];

  @Column('text', { array: true, nullable: true })
  sensorAlarmConditions?: string[];
}
