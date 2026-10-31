import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('maintenance_records')
export class MaintenanceRecord {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Circuit or equipment UUID' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({ description: 'Component type repaired or replaced', example: 'TERMINAL_LUG' })
  @Column({ type: 'varchar', length: 50 })
  componentType: string;

  @ApiProperty({ description: 'Detailed action performed', example: 'Retorqued loose screw terminal and trimmed oxidized copper lead' })
  @Column({ type: 'text' })
  actionTaken: string;

  @ApiProperty({ description: 'Name of certified technician', example: 'John Doe, Licensed Electrician' })
  @Column({ type: 'varchar', length: 150 })
  technicianName: string;

  @ApiProperty({ description: 'Maintenance service cost', example: 120.0, nullable: true })
  @Column({ type: 'float', nullable: true })
  cost: number;

  @ApiProperty({ description: 'Date and time work was completed' })
  @Column({ type: 'timestamptz' })
  performedAt: Date;

  @ApiProperty({ description: 'Technician notes or post-service test results', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
