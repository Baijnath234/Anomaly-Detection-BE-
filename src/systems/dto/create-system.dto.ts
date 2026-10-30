import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSystemDto {
  @ApiProperty({
    description: 'Name of the monitored equipment / system',
    example: 'Gas Turbine Unit 3',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Type / Category of system (e.g. Turbine, Compressor, Motor, Pump)',
    example: 'Turbine',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;
}

