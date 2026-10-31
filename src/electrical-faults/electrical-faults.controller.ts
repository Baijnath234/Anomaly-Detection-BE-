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
import { ElectricalFaultsService } from './electrical-faults.service';
import { LogFaultDto, CreateAlertRuleDto } from './dto';

@ApiTags('Electrical Faults & Alert Rules')
@Controller('api/faults')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ElectricalFaultsController {
  constructor(private readonly faultsService: ElectricalFaultsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a detected electrical fault' })
  async logFault(@Body() dto: LogFaultDto) {
    return await this.faultsService.logFault(dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'List all currently active electrical faults' })
  async getActiveFaults() {
    return await this.faultsService.getActiveFaults();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get historical fault logs' })
  async getFaultHistory(@Query('circuitId') circuitId?: string) {
    return await this.faultsService.getFaultHistory(circuitId);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an active electrical fault' })
  async acknowledgeFault(@Param('id') id: string) {
    return await this.faultsService.acknowledgeFault(id);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Mark an electrical fault as physically resolved' })
  async resolveFault(@Param('id') id: string) {
    return await this.faultsService.resolveFault(id);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create configurable alert rule' })
  async createAlertRule(@Body() dto: CreateAlertRuleDto) {
    return await this.faultsService.createAlertRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List all active alert rules' })
  async findAllRules() {
    return await this.faultsService.findAllRules();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Query('userId') userId?: string) {
    return await this.faultsService.getNotifications(userId);
  }

  @Post('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationRead(@Param('id') id: string) {
    return await this.faultsService.markNotificationRead(id);
  }
}
