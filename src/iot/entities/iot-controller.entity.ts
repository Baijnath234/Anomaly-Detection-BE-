import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Sensor } from './sensor.entity';

@Entity('iot_controllers')
export class IoTController {
  @ApiProperty({ description: 'Hardware Controller ID', example: 'ctrl_esp32_living_01' })
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @ApiProperty({ description: 'Building UUID identifier' })
  @Column({ type: 'uuid', nullable: true })
  buildingId: string;

  @ApiProperty({ description: 'Hardware MAC address', example: '24:0A:C4:58:1B:9A' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  macAddress: string;

  @ApiProperty({ description: 'Installed firmware version', example: '1.2.0' })
  @Column({ type: 'varchar', length: 50, default: '1.0.0' })
  firmwareVersion: string;

  @ApiProperty({ description: 'Local IP address', example: '192.168.1.145', nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @ApiProperty({ description: 'Connection status', enum: ['ONLINE', 'OFFLINE'], default: 'OFFLINE' })
  @Column({ type: 'varchar', length: 20, default: 'OFFLINE' })
  status: 'ONLINE' | 'OFFLINE';

  @ApiProperty({ description: 'Last received heartbeat timestamp' })
  @Column({ type: 'timestamptz', nullable: true })
  lastHeartbeat: Date;

  @ApiProperty({ description: 'Wi-Fi RSSI signal strength (dBm)', example: -64 })
  @Column({ type: 'int', default: -70 })
  wifiRssi: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Sensor, (s) => s.controller)
  sensors: Sensor[];
}
