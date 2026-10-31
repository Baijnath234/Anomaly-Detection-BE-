import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('component_health_records')
@Index(['entityType', 'entityId', 'lastEvaluatedAt'])
export class ComponentHealthRecord {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Component asset category',
    enum: ['CIRCUIT_WIRING', 'SWITCH_RELAY', 'BREAKER', 'TERMINAL_LUG', 'PANEL_BUSBAR'],
  })
  @Column({ type: 'varchar', length: 50 })
  entityType: 'CIRCUIT_WIRING' | 'SWITCH_RELAY' | 'BREAKER' | 'TERMINAL_LUG' | 'PANEL_BUSBAR';

  @ApiProperty({ description: 'Target entity UUID (circuitId, switchboardId, etc.)' })
  @Column({ type: 'uuid' })
  entityId: string;

  @ApiProperty({ description: 'Health Index score between 0.0 and 100.0', example: 88.5 })
  @Column({ type: 'float', default: 100.0 })
  healthScore: number;

  @ApiProperty({
    description: 'Failure risk estimation',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
  })
  @Column({ type: 'varchar', length: 20, default: 'LOW' })
  failureRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ description: 'Estimated Remaining Useful Life in days', example: 720 })
  @Column({ type: 'int', default: 1825 })
  estimatedRulDays: number;

  @ApiProperty({ description: 'Arrhenius thermal cumulative aging stress score', example: 12.4 })
  @Column({ type: 'float', default: 0.0 })
  thermalStressAccumulated: number;

  @ApiProperty({ description: 'Mechanical/electrical relay cycles switched count', example: 1250 })
  @Column({ type: 'int', default: 0 })
  cyclesSwitched: number;

  @ApiProperty({ description: 'Degradation wear factor (0.0 to 1.0)', example: 0.12 })
  @Column({ type: 'float', default: 0.0 })
  wearFactor: number;

  @ApiProperty({ description: 'AI diagnostic explanation of degradation factors' })
  @Column({ type: 'text', nullable: true })
  degradationReason: string;

  @ApiProperty({ description: 'Last evaluation timestamp' })
  @Column({ type: 'timestamptz' })
  lastEvaluatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
