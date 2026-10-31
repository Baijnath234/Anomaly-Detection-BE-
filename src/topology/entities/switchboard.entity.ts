import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Room } from './room.entity';
import { Circuit } from './circuit.entity';
import { Device } from './device.entity';

@Entity('switchboards')
export class Switchboard {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Room UUID identifier' })
  @Column({ type: 'uuid' })
  roomId: string;

  @ManyToOne(() => Room, (r) => r.switchboards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @ApiProperty({ description: 'Circuit UUID feeding this switchboard' })
  @Column({ type: 'uuid', nullable: true })
  circuitId: string;

  @ManyToOne(() => Circuit, (c) => c.switchboards, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'circuitId' })
  circuit: Circuit;

  @ApiProperty({ description: 'Switchboard label', example: 'Master Bed North Board' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Maximum safe board load rating in Watts', example: 2500 })
  @Column({ type: 'float', default: 2500.0 })
  maxLoadWatts: number;

  @ApiProperty({ description: 'Associated IoT Controller ID (ESP32)', example: 'ctrl_esp32_01', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  controllerId: string;

  @OneToMany(() => Device, (dev) => dev.switchboard, { cascade: true })
  devices: Device[];
}

