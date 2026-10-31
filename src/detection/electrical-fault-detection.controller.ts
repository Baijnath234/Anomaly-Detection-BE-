import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ElectricalFaultDetectionService,
  ElectricalReadingInput,
} from './electrical-fault-detection.service';

@ApiTags('AI Electrical Fault Detection Engine')
@Controller('api/detection/electrical')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ElectricalFaultDetectionController {
  constructor(
    private readonly faultDetectionService: ElectricalFaultDetectionService,
  ) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate single telemetry reading for physical electrical faults' })
  async evaluateReading(@Body() body: any) {
    const input: ElectricalReadingInput = {
      homeId: body.homeId,
      roomId: body.roomId,
      circuitId: body.circuitId || 'circuit_eval',
      deviceId: body.deviceId,
      timestamp: body.timestamp,
      voltageRms: Number(body.voltageRms ?? body.v ?? 230),
      currentRms: Number(body.currentRms ?? body.i ?? 0),
      activePowerWatts: body.activePowerWatts !== undefined ? Number(body.activePowerWatts) : undefined,
      powerFactor: body.powerFactor !== undefined ? Number(body.powerFactor) : undefined,
      temperatureCelsius: body.temperatureCelsius !== undefined ? Number(body.temperatureCelsius) : undefined,
      leakageCurrentMa: body.leakageCurrentMa !== undefined ? Number(body.leakageCurrentMa) : undefined,
      breakerRatingAmps: body.breakerRatingAmps !== undefined ? Number(body.breakerRatingAmps) : 16.0,
    };
    return await this.faultDetectionService.evaluateReading(input, body.autoPersist ?? false);
  }

  @Post('batch-evaluate')
  @ApiOperation({ summary: 'Batch evaluate telemetry readings' })
  async batchEvaluate(@Body() body: { readings: any[]; autoPersist?: boolean }) {
    const results = [];
    for (const r of body.readings || []) {
      const input: ElectricalReadingInput = {
        circuitId: r.circuitId || 'circuit_eval',
        voltageRms: Number(r.voltageRms ?? r.v ?? 230),
        currentRms: Number(r.currentRms ?? r.i ?? 0),
        powerFactor: r.powerFactor !== undefined ? Number(r.powerFactor) : undefined,
        temperatureCelsius: r.temperatureCelsius !== undefined ? Number(r.temperatureCelsius) : undefined,
        leakageCurrentMa: r.leakageCurrentMa !== undefined ? Number(r.leakageCurrentMa) : undefined,
        breakerRatingAmps: r.breakerRatingAmps !== undefined ? Number(r.breakerRatingAmps) : 16.0,
      };
      const res = await this.faultDetectionService.evaluateReading(input, body.autoPersist ?? false);
      results.push(res);
    }
    return { evaluatedCount: results.length, reports: results };
  }
}
