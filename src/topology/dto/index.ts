import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Villa Sunshine' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '42 Orchid Boulevard', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: ['1-PHASE', '3-PHASE'], default: '1-PHASE', required: false })
  @IsEnum(['1-PHASE', '3-PHASE'])
  @IsOptional()
  mainsSupplyType?: '1-PHASE' | '3-PHASE';

  @ApiProperty({ example: 230, required: false })
  @IsNumber()
  @IsOptional()
  nominalVoltage?: number;
}

export class CreateFloorDto {
  @ApiProperty({ example: 'b0a701d0-1234-4567-8901-abcdef123456' })
  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({ example: 'Ground Floor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  floorNumber?: number;
}

export class CreateRoomDto {
  @ApiProperty({ example: 'floor-uuid' })
  @IsString()
  @IsNotEmpty()
  floorId: string;

  @ApiProperty({ example: 'Living Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'LIVING', required: false })
  @IsString()
  @IsOptional()
  roomType?: string;
}

export class CreatePanelDto {
  @ApiProperty({ example: 'building-uuid' })
  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @ApiProperty({ example: 'Main Distribution Board' })
  @IsString()
  @IsNotEmpty()
  panelName: string;

  @ApiProperty({ example: 63, default: 63 })
  @IsNumber()
  @IsOptional()
  ratedAmperage?: number;
}

export class CreateCircuitDto {
  @ApiProperty({ example: 'panel-uuid' })
  @IsString()
  @IsNotEmpty()
  panelId: string;

  @ApiProperty({ example: 'C-01' })
  @IsString()
  @IsNotEmpty()
  circuitNumber: string;

  @ApiProperty({ example: 'Living Room Power' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 16, default: 16 })
  @IsNumber()
  @IsOptional()
  breakerRatingAmps?: number;

  @ApiProperty({ example: 2.5, default: 2.5 })
  @IsNumber()
  @IsOptional()
  wireGaugeMm2?: number;

  @ApiProperty({ example: 'GENERAL', default: 'GENERAL' })
  @IsString()
  @IsOptional()
  circuitCategory?: string;
}

export class CreateSwitchboardDto {
  @ApiProperty({ example: 'room-uuid' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: 'circuit-uuid', required: false })
  @IsString()
  @IsOptional()
  circuitId?: string;

  @ApiProperty({ example: 'Main Switchboard' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ctrl_esp32_01', required: false })
  @IsString()
  @IsOptional()
  controllerId?: string;
}

export class CreateDeviceDto {
  @ApiProperty({ example: 'switchboard-uuid' })
  @IsString()
  @IsNotEmpty()
  switchboardId: string;

  @ApiProperty({ example: 'circuit-uuid', required: false })
  @IsString()
  @IsOptional()
  circuitId?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(8)
  relayChannel: number;

  @ApiProperty({ example: 'Ceiling Fan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'FAN' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 75.0, default: 60.0 })
  @IsNumber()
  @IsOptional()
  ratedWatts?: number;
}

export class ToggleDeviceDto {
  @ApiProperty({ enum: ['ON', 'OFF'], example: 'ON' })
  @IsEnum(['ON', 'OFF'])
  state: 'ON' | 'OFF';
}

