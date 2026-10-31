import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('appliance_schedules')
export class ApplianceSchedule {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Target Device UUID' })
  @Column({ type: 'uuid' })
  deviceId: string;

  @ApiProperty({ description: 'Schedule label', example: 'Morning Geyser Schedule' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Execution time in 24h format (HH:MM)', example: '06:30' })
  @Column({ type: 'varchar', length: 10 })
  timeOfDay: string;

  @ApiProperty({ description: 'Active days of week (0=Sun, 1=Mon, ..., 6=Sat)', example: [1, 2, 3, 4, 5] })
  @Column({ type: 'simple-array' })
  daysOfWeek: number[];

  @ApiProperty({ description: 'Target state', enum: ['ON', 'OFF'], default: 'ON' })
  @Column({ type: 'varchar', length: 10, default: 'ON' })
  action: 'ON' | 'OFF';

  @ApiProperty({ description: 'Whether schedule is active', default: true })
  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @ApiProperty({ description: 'Timestamp of last execution', nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  lastExecutedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

