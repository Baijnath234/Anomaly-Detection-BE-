import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 'device-uuid' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 'Morning Geyser Schedule' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '06:30' })
  @IsString()
  @IsNotEmpty()
  timeOfDay: string;

  @ApiProperty({ example: [1, 2, 3, 4, 5] })
  @IsArray()
  daysOfWeek: number[];

  @ApiProperty({ enum: ['ON', 'OFF'], default: 'ON' })
  @IsEnum(['ON', 'OFF'])
  action: 'ON' | 'OFF';
}

export class CreateSceneDto {
  @ApiProperty({ example: 'building-uuid' })
  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({ example: 'Leave Home / All Off' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Turns off all lights and appliances' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      { deviceId: 'dev-1', state: 'OFF' },
      { deviceId: 'dev-2', state: 'OFF' },
    ],
  })
  @IsArray()
  actions: { deviceId: string; state: 'ON' | 'OFF'; level?: number }[];
}

export class BulkToggleDto {
  @ApiProperty({ example: ['dev-uuid-1', 'dev-uuid-2'] })
  @IsArray()
  deviceIds: string[];

  @ApiProperty({ enum: ['ON', 'OFF'] })
  @IsEnum(['ON', 'OFF'])
  state: 'ON' | 'OFF';
}

export class CreateTicketDto {
  @ApiProperty({ example: 'fault-uuid', required: false })
  @IsString()
  @IsOptional()
  faultId?: string;

  @ApiProperty({ example: 'circuit-uuid' })
  @IsString()
  @IsNotEmpty()
  circuitId: string;

  @ApiProperty({ example: 'High Current Breaker Inspection' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Repeated overcurrent warnings observed over past 24 hours.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class AssignTicketDto {
  @ApiProperty({ example: 'Alex Smith, Licensed Electrician' })
  @IsString()
  @IsNotEmpty()
  technicianName: string;
}
