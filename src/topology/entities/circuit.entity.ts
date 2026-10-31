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
import { ElectricalPanel } from './electrical-panel.entity';
import { Switchboard } from './switchboard.entity';
import { Device } from './device.entity';

@Entity('circuits')
export class Circuit {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Electrical panel UUID identifier' })
  @Column({ type: 'uuid' })
  panelId: string;

  @ManyToOne(() => ElectricalPanel, (p) => p.circuits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panelId' })
  panel: ElectricalPanel;

  @ApiProperty({ description: 'Circuit identifier / breaker position', example: 'C-04' })
  @Column({ type: 'varchar', length: 50 })
  circuitNumber: string;

  @ApiProperty({ description: 'Descriptive circuit name', example: 'Living Room AC & Power' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Rated MCB Trip Current in Amperes', example: 16 })
  @Column({ type: 'float', default: 16.0 })
  breakerRatingAmps: number;

  @ApiProperty({ description: 'Wire conductor cross-section in mm²', example: 2.5 })
  @Column({ type: 'float', default: 2.5 })
  wireGaugeMm2: number;

  @ApiProperty({ description: 'Conductor material', enum: ['COPPER', 'ALUMINUM'], default: 'COPPER' })
  @Column({ type: 'varchar', length: 50, default: 'COPPER' })
  wireType: 'COPPER' | 'ALUMINUM';

  @ApiProperty({
    description: 'Circuit functional category',
    enum: ['LIGHTING', 'SOCKETS', 'HVAC', 'HEAVY_APPLIANCE', 'GENERAL'],
    default: 'GENERAL',
  })
  @Column({ type: 'varchar', length: 50, default: 'GENERAL' })
  circuitCategory: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Switchboard, (sb) => sb.circuit)
  switchboards: Switchboard[];

  @OneToMany(() => Device, (device) => device.circuit)
  devices: Device[];
}

