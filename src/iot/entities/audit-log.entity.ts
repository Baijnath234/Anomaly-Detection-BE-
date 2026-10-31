import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User UUID performing action', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string;

  @ApiProperty({ description: 'Action name', example: 'DEVICE_SWITCH_TOGGLE' })
  @Column({ type: 'varchar', length: 100 })
  action: string;

  @ApiProperty({ description: 'Resource type', example: 'DEVICE' })
  @Column({ type: 'varchar', length: 50 })
  resourceType: string;

  @ApiProperty({ description: 'Resource UUID or ID', example: 'dev-1234' })
  @Column({ type: 'varchar', length: 100 })
  resourceId: string;

  @ApiProperty({ description: 'JSON metadata/details' })
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @ApiProperty({ description: 'Client IP address', nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
