import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Floor } from './floor.entity';
import { Switchboard } from './switchboard.entity';

@Entity('rooms')
export class Room {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Floor UUID identifier' })
  @Column({ type: 'uuid' })
  floorId: string;

  @ManyToOne(() => Floor, (floor) => floor.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'floorId' })
  floor: Floor;

  @ApiProperty({ description: 'Room name', example: 'Master Bedroom' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({
    description: 'Room type category',
    enum: ['LIVING', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'UTILITY', 'BALCONY', 'OFFICE', 'OTHER'],
    default: 'LIVING',
  })
  @Column({ type: 'varchar', length: 50, default: 'LIVING' })
  roomType: string;

  @OneToMany(() => Switchboard, (board) => board.room, { cascade: true })
  switchboards: Switchboard[];
}
