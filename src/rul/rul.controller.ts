import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RulService, RulEstimationOutput } from './rul.service';
import { EstimateRulDto } from './dto/estimate-rul.dto';

@ApiTags('Remaining Useful Life (RUL)')
@Controller('api/rul')
export class RulController {
  constructor(private readonly rulService: RulService) {}

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Estimate Remaining Useful Life (RUL) with confidence bounds',
    description:
      'Computes Health Index trajectory, fits degradation trend, and projects time to reach failureThreshold with 90% confidence bands.',
  })
  @ApiResponse({
    status: 200,
    description: 'RUL estimation calculated successfully',
  })
  @ApiResponse({ status: 404, description: 'Dataset not found or insufficient data rows' })
  async estimate(@Body() dto: EstimateRulDto): Promise<RulEstimationOutput> {
    return this.rulService.estimateRul(dto.datasetId, dto.failureThreshold);
  }
}

