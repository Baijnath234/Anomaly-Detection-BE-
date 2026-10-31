import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sensor_readings')
@Index(['circuitId', 'timestamp'])
export class SensorReading {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Monitored circuit UUID' })
  @Column({ type: 'uuid' })
  circuitId: string;

  @ApiProperty({ description: 'Controller timestamp' })
  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @ApiProperty({ description: 'True RMS Voltage (V)', example: 230.5 })
  @Column({ type: 'float' })
  voltageRms: number;

  @ApiProperty({ description: 'True RMS Current (A)', example: 8.42 })
  @Column({ type: 'float' })
  currentRms: number;

  @ApiProperty({ description: 'Active Power (Watts)', example: 1912.4 })
  @Column({ type: 'float' })
  activePowerWatts: number;

  @ApiProperty({ description: 'Reactive Power (VAR)', example: 384.1 })
  @Column({ type: 'float', default: 0.0 })
  reactivePowerVar: number;

  @ApiProperty({ description: 'Power Factor (0.0 to 1.0)', example: 0.98 })
  @Column({ type: 'float', default: 1.0 })
  powerFactor: number;

  @ApiProperty({ description: 'Grid Frequency (Hz)', example: 50.0 })
  @Column({ type: 'float', default: 50.0 })
  frequencyHz: number;

  @ApiProperty({ description: 'Busbar / terminal temperature (°C)', example: 38.2 })
  @Column({ type: 'float', default: 30.0 })
  temperatureCelsius: number;

  @ApiProperty({ description: 'Residual Earth Leakage Current (mA)', example: 1.8 })
  @Column({ type: 'float', default: 0.0 })
  leakageCurrentMa: number;

  @ApiProperty({ description: 'Relay status', enum: ['ON', 'OFF'], default: 'ON' })
  @Column({ type: 'varchar', length: 10, default: 'ON' })
  relayState: 'ON' | 'OFF';

  @ApiProperty({ description: 'MCB mechanical status', enum: ['CLOSED', 'TRIPPED'], default: 'CLOSED' })
  @Column({ type: 'varchar', length: 20, default: 'CLOSED' })
  mcbTripStatus: 'CLOSED' | 'TRIPPED';

  @ApiProperty({ description: 'Flag whether this is backfilled offline data' })
  @Column({ type: 'boolean', default: false })
  isBackfill: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
