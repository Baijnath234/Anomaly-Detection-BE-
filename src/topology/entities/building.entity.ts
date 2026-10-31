import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Floor } from './floor.entity';
import { ElectricalPanel } from './electrical-panel.entity';

@Entity('buildings')
export class Building {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the home or facility', example: 'Greenwood Villa' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Street address or location', example: '124 Palm Avenue' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @ApiProperty({ description: 'User ID of owner', example: 'user-uuid' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerId: string;

  @ApiProperty({ description: 'Electrical grid phase type', enum: ['1-PHASE', '3-PHASE'], default: '1-PHASE' })
  @Column({ type: 'varchar', length: 20, default: '1-PHASE' })
  mainsSupplyType: '1-PHASE' | '3-PHASE';

  @ApiProperty({ description: 'Nominal grid RMS voltage', example: 230 })
  @Column({ type: 'float', default: 230.0 })
  nominalVoltage: number;

  @ApiProperty({ description: 'Nominal grid frequency in Hz', example: 50 })
  @Column({ type: 'float', default: 50.0 })
  nominalFrequency: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Floor, (floor) => floor.building, { cascade: true })
  floors: Floor[];

  @OneToMany(() => ElectricalPanel, (panel) => panel.building, { cascade: true })
  panels: ElectricalPanel[];
}
