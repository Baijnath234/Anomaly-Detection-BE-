import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Switchboard } from './switchboard.entity';
import { Circuit } from './circuit.entity';

@Entity('devices')
export class Device {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Switchboard UUID identifier' })
  @Column({ type: 'uuid' })
  switchboardId: string;

  @ManyToOne(() => Switchboard, (sb) => sb.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'switchboardId' })
  switchboard: Switchboard;

  @ApiProperty({ description: 'Circuit UUID feeding this device' })
  @Column({ type: 'uuid', nullable: true })
  circuitId: string;

  @ManyToOne(() => Circuit, (c) => c.devices, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'circuitId' })
  circuit: Circuit;

  @ApiProperty({ description: 'Hardware relay channel number (1 to 8)', example: 1 })
  @Column({ type: 'int', default: 1 })
  relayChannel: number;

  @ApiProperty({ description: 'Appliance or switch name', example: 'Ceiling Fan' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({
    description: 'Appliance category',
    enum: ['LIGHT', 'FAN', 'AC', 'REFRIGERATOR', 'HEATER', 'SOCKET', 'TV', 'PUMP', 'APPLIANCE'],
    default: 'APPLIANCE',
  })
  @Column({ type: 'varchar', length: 50, default: 'APPLIANCE' })
  category: string;

  @ApiProperty({ description: 'Nominal rated power consumption in Watts', example: 75.0 })
  @Column({ type: 'float', default: 60.0 })
  ratedWatts: number;

  @ApiProperty({ description: 'Current power state', enum: ['ON', 'OFF'], default: 'OFF' })
  @Column({ type: 'varchar', length: 10, default: 'OFF' })
  state: 'ON' | 'OFF';

  @ApiProperty({ description: 'Whether the device supports dimming or speed control', default: false })
  @Column({ type: 'boolean', default: false })
  isDimmable: boolean;

  @ApiProperty({ description: 'Dimming / speed percentage level (0 to 100)', example: 100 })
  @Column({ type: 'int', default: 100 })
  currentLevel: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
