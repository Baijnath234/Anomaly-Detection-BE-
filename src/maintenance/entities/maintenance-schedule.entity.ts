import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('maintenance_schedules')
export class MaintenanceSchedule {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Circuit or equipment UUID' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({ description: 'Component type requiring inspection', example: 'CIRCUIT_WIRING' })
  @Column({ type: 'varchar', length: 50 })
  componentType: string;

  @ApiProperty({ description: 'Recommended target date for maintenance' })
  @Column({ type: 'date' })
  scheduledDate: Date;

  @ApiProperty({
    description: 'Maintenance urgency priority',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  })
  @Column({ type: 'varchar', length: 20, default: 'MEDIUM' })
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiProperty({ description: 'Automated AI recommendation reason' })
  @Column({ type: 'text' })
  recommendationReason: string;

  @ApiProperty({
    description: 'Schedule fulfillment status',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  })
  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
