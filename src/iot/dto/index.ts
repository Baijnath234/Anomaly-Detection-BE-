import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterControllerDto {
  @ApiProperty({ example: 'ctrl_esp32_living_01' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'building-uuid', required: false })
  @IsString()
  @IsOptional()
  buildingId?: string;

  @ApiProperty({ example: '24:0A:C4:58:1B:9A', required: false })
  @IsString()
  @IsOptional()
  macAddress?: string;

  @ApiProperty({ example: '1.2.0', default: '1.0.0' })
  @IsString()
  @IsOptional()
  firmwareVersion?: string;

  @ApiProperty({ example: '192.168.1.145', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class HeartbeatDto {
  @ApiProperty({ example: -64, default: -70 })
  @IsNumber()
  @IsOptional()
  wifiRssi?: number;

  @ApiProperty({ example: '1.2.0', required: false })
  @IsString()
  @IsOptional()
  firmwareVersion?: string;
}

export class RegisterSensorDto {
  @ApiProperty({ example: 'ctrl_esp32_living_01' })
  @IsString()
  @IsNotEmpty()
  controllerId: string;

  @ApiProperty({ enum: ['CIRCUIT', 'SWITCHBOARD', 'PANEL'] })
  @IsEnum(['CIRCUIT', 'SWITCHBOARD', 'PANEL'])
  targetType: 'CIRCUIT' | 'SWITCHBOARD' | 'PANEL';

  @ApiProperty({ example: 'target-uuid' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ enum: ['CURRENT_CT', 'VOLTAGE', 'TEMPERATURE', 'LEAKAGE', 'FREQUENCY'] })
  @IsEnum(['CURRENT_CT', 'VOLTAGE', 'TEMPERATURE', 'LEAKAGE', 'FREQUENCY'])
  sensorType: 'CURRENT_CT' | 'VOLTAGE' | 'TEMPERATURE' | 'LEAKAGE' | 'FREQUENCY';

  @ApiProperty({ example: 1.0, default: 1.0 })
  @IsNumber()
  @IsOptional()
  calibrationMultiplier?: number;

  @ApiProperty({ example: 0.0, default: 0.0 })
  @IsNumber()
  @IsOptional()
  calibrationOffset?: number;
}

export class DispatchCommandDto {
  @ApiProperty({ example: 'ctrl_esp32_living_01' })
  @IsString()
  @IsNotEmpty()
  controllerId: string;

  @ApiProperty({ example: 'device-uuid' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  relayChannel: number;

  @ApiProperty({ enum: ['ON', 'OFF'] })
  @IsEnum(['ON', 'OFF'])
  commandState: 'ON' | 'OFF';
}

