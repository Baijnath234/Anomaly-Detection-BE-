import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SensorReading } from './entities/sensor-reading.entity';
import { EnergyConsumptionRecord } from './entities/energy-consumption-record.entity';
import { IngestTelemetryBatchDto } from './dto';
import { TelemetryGateway } from './telemetry.gateway';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @InjectRepository(SensorReading)
    private readonly readingRepo: Repository<SensorReading>,
    @InjectRepository(EnergyConsumptionRecord)
    private readonly energyRepo: Repository<EnergyConsumptionRecord>,
    private readonly gateway: TelemetryGateway,
  ) {}

  async ingestBatch(dto: IngestTelemetryBatchDto): Promise<{ savedCount: number }> {
    const timestamp = new Date(dto.timestamp * 1000);
    const entities: SensorReading[] = [];

    for (const item of dto.circuits) {
      const activePower =
        item.activePowerWatts !== undefined
          ? item.activePowerWatts
          : item.voltageRms * item.currentRms * (item.powerFactor ?? 1.0);

      const reading = this.readingRepo.create({
        circuitId: item.circuitId,
        timestamp,
        voltageRms: item.voltageRms,
        currentRms: item.currentRms,
        activePowerWatts: Math.round(activePower * 10) / 10,
        reactivePowerVar: item.reactivePowerVar ?? 0.0,
        powerFactor: item.powerFactor ?? 1.0,
        frequencyHz: item.frequencyHz ?? 50.0,
        temperatureCelsius: item.temperatureCelsius ?? 30.0,
        leakageCurrentMa: item.leakageCurrentMa ?? 0.0,
        relayState: item.relayState ?? 'ON',
        mcbTripStatus: item.mcbTripStatus ?? 'CLOSED',
        isBackfill: dto.isBackfill ?? false,
      });

      entities.push(reading);

      // Broadcast real-time stream unless backfilling historical records
      if (!dto.isBackfill) {
        this.gateway.broadcastTelemetry(item.circuitId, {
          circuitId: item.circuitId,
          timestamp: timestamp.toISOString(),
          voltage: item.voltageRms,
          current: item.currentRms,
          power: activePower,
          powerFactor: item.powerFactor ?? 1.0,
          temperature: item.temperatureCelsius ?? 30.0,
          leakageMa: item.leakageCurrentMa ?? 0.0,
          relayState: item.relayState ?? 'ON',
          mcbStatus: item.mcbTripStatus ?? 'CLOSED',
        });
      }
    }

    await this.readingRepo.save(entities);
    return { savedCount: entities.length };
  }

  async getLiveReading(circuitId: string): Promise<SensorReading | null> {
    return await this.readingRepo.findOne({
      where: { circuitId },
      order: { timestamp: 'DESC' },
    });
  }

  async getHistoricalReadings(
    circuitId: string,
    from?: string,
    to?: string,
    limit: number = 100,
  ): Promise<SensorReading[]> {
    const query = this.readingRepo.createQueryBuilder('r')
      .where('r.circuitId = :circuitId', { circuitId });

    if (from) {
      query.andWhere('r.timestamp >= :from', { from: new Date(from) });
    }
    if (to) {
      query.andWhere('r.timestamp <= :to', { to: new Date(to) });
    }

    return await query
      .orderBy('r.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  async getEnergyConsumption(circuitId: string): Promise<{
    todayKwh: number;
    monthKwh: number;
    peakWatts: number;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayReadings = await this.readingRepo.find({
      where: {
        circuitId,
        timestamp: Between(startOfDay, new Date()),
      },
      order: { timestamp: 'ASC' },
    });

    let peakWatts = 0;
    let sumWatts = 0;
    for (const r of todayReadings) {
      if (r.activePowerWatts > peakWatts) peakWatts = r.activePowerWatts;
      sumWatts += r.activePowerWatts;
    }

    // Trapezoidal kWh estimate if readings exist
    const avgWatts = todayReadings.length > 0 ? sumWatts / todayReadings.length : 0;
    const hoursElapsed = Math.max(0.1, (Date.now() - startOfDay.getTime()) / (1000 * 3600));
    const todayKwh = Math.round(((avgWatts * hoursElapsed) / 1000) * 100) / 100;
    const monthKwh = Math.round(todayKwh * 30 * 10) / 10;

    return {
      todayKwh,
      monthKwh,
      peakWatts,
    };
  }
}

