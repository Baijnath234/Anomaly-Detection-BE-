import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('device_commands')
export class DeviceCommand {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Target IoT Controller ID' })
  @Column({ type: 'varchar', length: 100 })
  controllerId: string;

  @ApiProperty({ description: 'Target Device UUID' })
  @Column({ type: 'uuid' })
  deviceId: string;

  @ApiProperty({ description: 'Relay channel number (1-8)' })
  @Column({ type: 'int' })
  relayChannel: number;

  @ApiProperty({ description: 'Action type', example: 'SET_RELAY' })
  @Column({ type: 'varchar', length: 50, default: 'SET_RELAY' })
  commandAction: string;

  @ApiProperty({ description: 'Target state', enum: ['ON', 'OFF'] })
  @Column({ type: 'varchar', length: 10 })
  commandState: 'ON' | 'OFF';

  @ApiProperty({
    description: 'Dispatch status',
    enum: ['PENDING', 'SENT', 'ACKNOWLEDGED', 'FAILED'],
    default: 'PENDING',
  })
  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when dispatched to MQTT' })
  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @ApiProperty({ description: 'Timestamp when hardware ACK received' })
  @Column({ type: 'timestamptz', nullable: true })
  ackedAt: Date;
}

