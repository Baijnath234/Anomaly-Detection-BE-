import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RepairService, RepairGuide } from './repair.service';

@ApiTags('Repair Assistant')
@Controller('api/repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Get(':anomalyId')
  @ApiOperation({
    summary: 'Get expert repair guide and grounded AI explanation for an anomaly',
    description:
      'Matches the anomaly root cause and system type against the expert knowledge base rules, returning problem description, severity, ordered fix steps, safety precautions, and an optional Claude-grounded explanation.',
  })
  @ApiParam({ name: 'anomalyId', type: 'string', description: 'UUID of the detected anomaly' })
  @ApiResponse({ status: 200, description: 'Repair plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Anomaly not found' })
  async getRepair(@Param('anomalyId', ParseUUIDPipe) anomalyId: string): Promise<RepairGuide> {
    return this.repairService.getRepairPlan(anomalyId);
  }
}

