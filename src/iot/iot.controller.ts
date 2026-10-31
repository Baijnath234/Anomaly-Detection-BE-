import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IoTService } from './iot.service';
import {
  RegisterControllerDto,
  HeartbeatDto,
  RegisterSensorDto,
  DispatchCommandDto,
} from './dto';

@ApiTags('IoT Hardware & Sensor Registry')
@Controller('api/iot')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class IoTApiController {
  constructor(private readonly iotService: IoTService) {}

  @Post('controllers')
  @ApiOperation({ summary: 'Register or update an IoT hardware controller (ESP32)' })
  async registerController(@Body() dto: RegisterControllerDto) {
    return await this.iotService.registerController(dto);
  }

  @Get('controllers')
  @ApiOperation({ summary: 'List all registered IoT controllers' })
  async findAllControllers() {
    return await this.iotService.findAllControllers();
  }

  @Post('controllers/:id/heartbeat')
  @ApiOperation({ summary: 'Controller heartbeat and signal telemetry update' })
  async updateHeartbeat(
    @Param('id') id: string,
    @Body() dto: HeartbeatDto,
  ) {
    return await this.iotService.updateHeartbeat(id, dto);
  }

  @Post('sensors')
  @ApiOperation({ summary: 'Register an electrical sensor probe (CT, Voltage, Temp, Leakage)' })
  async registerSensor(@Body() dto: RegisterSensorDto) {
    return await this.iotService.registerSensor(dto);
  }

  @Get('sensors')
  @ApiOperation({ summary: 'List all registered sensors' })
  async findAllSensors() {
    return await this.iotService.findAllSensors();
  }

  @Post('commands')
  @ApiOperation({ summary: 'Dispatch hardware relay actuation command' })
  async dispatchCommand(@Body() dto: DispatchCommandDto) {
    return await this.iotService.dispatchCommand(dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get recent system and device audit trail' })
  async getAuditLogs(@Query('limit') limit?: number) {
    return await this.iotService.getAuditLogs(limit ? Number(limit) : 50);
  }
}
