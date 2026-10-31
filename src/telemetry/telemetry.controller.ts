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
import { TelemetryService } from './telemetry.service';
import { IngestTelemetryBatchDto } from './dto';

@ApiTags('Telemetry & Energy Monitoring')
@Controller('api/telemetry')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest batch electrical sensor telemetry from IoT edge' })
  async ingestBatch(@Body() dto: IngestTelemetryBatchDto) {
    return await this.telemetryService.ingestBatch(dto);
  }

  @Get('live/:circuitId')
  @ApiOperation({ summary: 'Get latest instantaneous reading for a circuit' })
  async getLiveReading(@Param('circuitId') circuitId: string) {
    return await this.telemetryService.getLiveReading(circuitId);
  }

  @Get('history/:circuitId')
  @ApiOperation({ summary: 'Get historical time series for circuit' })
  async getHistoricalReadings(
    @Param('circuitId') circuitId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: number,
  ) {
    return await this.telemetryService.getHistoricalReadings(
      circuitId,
      from,
      to,
      limit ? Number(limit) : 100,
    );
  }

  @Get('energy/:circuitId')
  @ApiOperation({ summary: 'Get aggregated energy consumption metrics (kWh, peak Watts)' })
  async getEnergyConsumption(@Param('circuitId') circuitId: string) {
    return await this.telemetryService.getEnergyConsumption(circuitId);
  }
}

