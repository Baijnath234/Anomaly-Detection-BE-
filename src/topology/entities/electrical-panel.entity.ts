import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Building } from './building.entity';
import { Circuit } from './circuit.entity';

@Entity('electrical_panels')
export class ElectricalPanel {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Building UUID identifier' })
  @Column({ type: 'uuid' })
  buildingId: string;

  @ManyToOne(() => Building, (b) => b.panels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @ApiProperty({ description: 'Panel name', example: 'Main Distribution Board (MDB-01)' })
  @Column({ type: 'varchar', length: 150 })
  panelName: string;

  @ApiProperty({ description: 'Physical location of panel', example: 'Utility Room Basement' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @ApiProperty({ description: 'Rated busbar continuous current in Amperes', example: 63 })
  @Column({ type: 'float', default: 63.0 })
  ratedAmperage: number;

  @ApiProperty({ description: 'Busbar material', enum: ['COPPER', 'ALUMINUM'], default: 'COPPER' })
  @Column({ type: 'varchar', length: 50, default: 'COPPER' })
  busbarMaterial: 'COPPER' | 'ALUMINUM';

  @ApiProperty({ description: 'Panel installation date' })
  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Circuit, (circuit) => circuit.panel, { cascade: true })
  circuits: Circuit[];
}
