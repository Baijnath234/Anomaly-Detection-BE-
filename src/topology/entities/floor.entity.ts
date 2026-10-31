import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Building } from './building.entity';
import { Room } from './room.entity';

@Entity('floors')
export class Floor {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Building UUID identifier' })
  @Column({ type: 'uuid' })
  buildingId: string;

  @ManyToOne(() => Building, (building) => building.floors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @ApiProperty({ description: 'Floor name or level', example: 'Ground Floor' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Floor index number (0 for Ground, 1 for First, etc.)', example: 0 })
  @Column({ type: 'int', default: 0 })
  floorNumber: number;

  @OneToMany(() => Room, (room) => room.floor, { cascade: true })
  rooms: Room[];
}
