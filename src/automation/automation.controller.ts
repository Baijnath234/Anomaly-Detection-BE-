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
import { AutomationService } from './automation.service';
import {
  CreateScheduleDto,
  CreateSceneDto,
  BulkToggleDto,
  CreateTicketDto,
  AssignTicketDto,
} from './dto';

@ApiTags('Smart Automation & Maintenance Tickets')
@Controller('api/automation')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('schedules')
  @ApiOperation({ summary: 'Create timed appliance operating schedule' })
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return await this.automationService.createSchedule(dto);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List schedules for devices' })
  async getSchedules(@Query('deviceId') deviceId?: string) {
    return await this.automationService.getSchedulesByDevice(deviceId);
  }

  @Post('scenes')
  @ApiOperation({ summary: 'Create automated home scene (e.g. Leave Home, Good Night)' })
  async createScene(@Body() dto: CreateSceneDto) {
    return await this.automationService.createScene(dto);
  }

  @Get('scenes')
  @ApiOperation({ summary: 'List available scenes for a building' })
  async getScenes(@Query('buildingId') buildingId?: string) {
    return await this.automationService.getScenes(buildingId);
  }

  @Post('scenes/:id/execute')
  @ApiOperation({ summary: 'Execute an automated scene across multiple devices' })
  async executeScene(@Param('id') id: string) {
    return await this.automationService.executeScene(id);
  }

  @Post('bulk-toggle')
  @ApiOperation({ summary: 'Toggle multiple appliances simultaneously' })
  async bulkToggle(@Body() dto: BulkToggleDto) {
    return await this.automationService.bulkToggle(dto);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create a maintenance service ticket' })
  async createTicket(@Body() dto: CreateTicketDto) {
    return await this.automationService.createTicket(dto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List all maintenance service tickets' })
  async getTickets(@Query('circuitId') circuitId?: string) {
    return await this.automationService.getTickets(circuitId);
  }

  @Post('tickets/:id/assign')
  @ApiOperation({ summary: 'Assign maintenance ticket to a licensed electrician' })
  async assignTechnician(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return await this.automationService.assignTechnician(id, dto);
  }

  @Post('tickets/:id/resolve')
  @ApiOperation({ summary: 'Mark maintenance ticket as resolved' })
  async resolveTicket(@Param('id') id: string) {
    return await this.automationService.resolveTicket(id);
  }
}

