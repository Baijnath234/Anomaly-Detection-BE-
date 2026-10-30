import { Controller, Get, Param, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Export')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('anomalies/:runId/csv')
  @ApiOperation({ summary: 'Export detected anomalies as downloadable CSV report' })
  @ApiParam({ name: 'runId', type: 'string', description: 'DetectionRun UUID' })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'Downloadable CSV file stream' })
  async exportAnomaliesCsv(
    @Param('runId', ParseUUIDPipe) runId: string,
    @Res() res: Response,
  ) {
    const csvContent = await this.reportsService.generateAnomaliesCsv(runId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="anomalies-run-${runId}.csv"`,
    );
    res.send(csvContent);
  }

  @Get('summary/:runId')
  @ApiOperation({ summary: 'Get aggregated statistical report of a detection run' })
  @ApiParam({ name: 'runId', type: 'string', description: 'DetectionRun UUID' })
  @ApiResponse({ status: 200, description: 'Aggregated summary data' })
  async getRunSummary(@Param('runId', ParseUUIDPipe) runId: string) {
    return this.reportsService.getRunSummary(runId);
  }
}

