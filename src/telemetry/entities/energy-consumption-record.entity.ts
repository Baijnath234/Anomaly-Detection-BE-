import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('energy_consumption_records')
@Index(['circuitId', 'periodStart', 'periodType'])
export class EnergyConsumptionRecord {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Circuit UUID identifier' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({ description: 'Aggregation period type', enum: ['HOURLY', 'DAILY', 'MONTHLY'] })
  @Column({ type: 'varchar', length: 20 })
  periodType: 'HOURLY' | 'DAILY' | 'MONTHLY';

  @ApiProperty({ description: 'Period start timestamp' })
  @Column({ type: 'timestamptz' })
  periodStart: Date;

  @ApiProperty({ description: 'Total electrical energy consumed in kilowatt-hours (kWh)', example: 14.5 })
  @Column({ type: 'float', default: 0.0 })
  kwhConsumed: number;

  @ApiProperty({ description: 'Peak instantaneous power during period (Watts)', example: 3450.0 })
  @Column({ type: 'float', default: 0.0 })
  peakPowerWatts: number;

  @ApiProperty({ description: 'Minimum power during period (Watts)', example: 45.0 })
  @Column({ type: 'float', default: 0.0 })
  minPowerWatts: number;

  @ApiProperty({ description: 'Average power factor during period', example: 0.96 })
  @Column({ type: 'float', default: 1.0 })
  avgPowerFactor: number;

  @ApiProperty({ description: 'Maximum recorded temperature during period (°C)', example: 42.1 })
  @Column({ type: 'float', default: 30.0 })
  maxTemperature: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

