import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
export class NotificationRecord {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Recipient User UUID (or null for all occupants)', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string;

  @ApiProperty({ description: 'Notification title', example: 'High Current Alert' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Notification detailed message' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'Severity', enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' })
  @Column({ type: 'varchar', length: 20, default: 'INFO' })
  severity: 'INFO' | 'WARNING' | 'CRITICAL';

  @ApiProperty({ description: 'Whether notification has been marked read', default: false })
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Deep link to specific circuit or dashboard view', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

