import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export interface SceneActionItem {
  deviceId: string;
  state: 'ON' | 'OFF';
  level?: number;
}

@Entity('automation_scenes')
export class AutomationScene {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated Building / Home UUID' })
  @Column({ type: 'uuid' })
  buildingId: string;

  @ApiProperty({ description: 'Scene display name', example: 'Leave Home / All Off' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ description: 'Scene description or icon', example: 'Turns off all lights, fans, and heaters' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ApiProperty({ description: 'Array of device actions executed by this scene' })
  @Column({ type: 'jsonb' })
  actionsJson: SceneActionItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
