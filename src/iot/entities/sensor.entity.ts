import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IoTController } from './iot-controller.entity';

@Entity('sensors')
export class Sensor {
  @ApiProperty({ description: 'Unique UUID identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Parent IoT controller ID' })
  @Column({ type: 'varchar', length: 100 })
  controllerId: string;

  @ManyToOne(() => IoTController, (ctrl) => ctrl.sensors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'controllerId' })
  controller: IoTController;

  @ApiProperty({ description: 'Target entity type', enum: ['CIRCUIT', 'SWITCHBOARD', 'PANEL'] })
  @Column({ type: 'varchar', length: 50 })
  targetType: 'CIRCUIT' | 'SWITCHBOARD' | 'PANEL';

  @ApiProperty({ description: 'Target entity UUID' })
  @Column({ type: 'uuid' })
  targetId: string;

  @ApiProperty({
    description: 'Sensor physical transducer type',
    enum: ['CURRENT_CT', 'VOLTAGE', 'TEMPERATURE', 'LEAKAGE', 'FREQUENCY'],
  })
  @Column({ type: 'varchar', length: 50 })
  sensorType: 'CURRENT_CT' | 'VOLTAGE' | 'TEMPERATURE' | 'LEAKAGE' | 'FREQUENCY';

  @ApiProperty({ description: 'Analog calibration linear multiplier', example: 1.0 })
  @Column({ type: 'float', default: 1.0 })
  calibrationMultiplier: number;

  @ApiProperty({ description: 'Analog calibration offset', example: 0.0 })
  @Column({ type: 'float', default: 0.0 })
  calibrationOffset: number;

  @ApiProperty({ description: 'Hardware connectivity status', default: true })
  @Column({ type: 'boolean', default: true })
  isConnected: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
