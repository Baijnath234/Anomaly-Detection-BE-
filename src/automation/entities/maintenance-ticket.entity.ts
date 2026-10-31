import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('maintenance_tickets')
export class MaintenanceTicket {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated electrical fault ID', nullable: true })
  @Column({ type: 'uuid', nullable: true })
  faultId: string;

  @ApiProperty({ description: 'Associated circuit UUID' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({ description: 'Ticket title', example: 'Branch C-04 Overheating Inspection' })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiProperty({ description: 'Detailed diagnostic description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @Column({ type: 'varchar', length: 20, default: 'MEDIUM' })
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiProperty({
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
    default: 'OPEN',
  })
  @Column({ type: 'varchar', length: 20, default: 'OPEN' })
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

  @ApiProperty({ description: 'Assigned certified electrician name', nullable: true })
  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedTechnician: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ description: 'Resolution timestamp', nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date;
}

