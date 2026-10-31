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
import { MaintenanceService } from './maintenance.service';
import {
  UpdateHealthDto,
  RecordMaintenanceDto,
  ScheduleMaintenanceDto,
} from './dto';

@ApiTags('Predictive Electrical Maintenance & Health')
@Controller('api/maintenance')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get health overview for all electrical components' })
  async getHealthOverview() {
    return await this.maintenanceService.getHealthOverview();
  }

  @Post('predict')
  @ApiOperation({ summary: 'Predict maintenance condition and failure risk for an electrical asset' })
  async predictComponentHealth(@Body() body: any) {
    return await this.maintenanceService.predictComponentHealth(body, body.saveToDb ?? true);
  }

  @Get('health/:entityId')
  @ApiOperation({ summary: 'Get Health Index and RUL for a specific component' })
  async getComponentHealth(@Param('entityId') entityId: string) {
    return await this.maintenanceService.getComponentHealth(entityId);
  }

  @Post('health')
  @ApiOperation({ summary: 'Update or evaluate component health index score' })
  async updateComponentHealth(@Body() dto: UpdateHealthDto) {
    return await this.maintenanceService.updateComponentHealth(dto);
  }

  @Post('records')
  @ApiOperation({ summary: 'Log a completed maintenance service action' })
  async recordMaintenance(@Body() dto: RecordMaintenanceDto) {
    return await this.maintenanceService.recordMaintenance(dto);
  }

  @Get('records')
  @ApiOperation({ summary: 'Get past maintenance service history' })
  async getMaintenanceHistory(@Query('circuitId') circuitId?: string) {
    return await this.maintenanceService.getMaintenanceHistory(circuitId);
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Schedule future preventive maintenance inspection' })
  async scheduleMaintenance(@Body() dto: ScheduleMaintenanceDto) {
    return await this.maintenanceService.scheduleMaintenance(dto);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List all pending maintenance schedules' })
  async getPendingSchedules() {
    return await this.maintenanceService.getPendingSchedules();
  }
}
