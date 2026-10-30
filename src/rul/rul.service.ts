import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RulResult } from './entities/rul-result.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';
import * as ss from 'simple-statistics';

export interface RulEstimationOutput {
  id: string;
  datasetId: string;
  etaDays: number;
  lowerDays: number;
  upperDays: number;
  currentHealthIndex: number;
  failureThreshold: number;
  healthIndexHistory: {
    timestamps: string[];
    scores: number[];
  };
}

@Injectable()
export class RulService {
  private readonly logger = new Logger(RulService.name);

  constructor(
    @InjectRepository(RulResult)
    private readonly rulRepository: Repository<RulResult>,
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(MetricRow)
    private readonly metricRowRepository: Repository<MetricRow>,
  ) {}

  async estimateRul(
    datasetId: string,
    failureThreshold: number = 0.25,
  ): Promise<RulEstimationOutput> {
    const dataset = await this.datasetRepository.findOne({
      where: { id: datasetId },
    });
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID '${datasetId}' not found.`);
    }

    const rows = await this.metricRowRepository.find({
      where: { datasetId },
      order: { timestamp: 'ASC' },
    });

    if (rows.length < 5) {
      throw new NotFoundException(
        `Insufficient metric rows in dataset (${rows.length} rows found). Need at least 5 for RUL estimation.`,
      );
    }

    // Determine numeric column names
    const numericCols = Object.keys(rows[0].values).filter(
      (k) => typeof rows[0].values[k] === 'number',
    );

    // Compute baseline mean and std from first 20% of data (healthy state)
    const baselineCount = Math.max(2, Math.floor(rows.length * 0.2));
    const baselineMeans: Record<string, number> = {};
    const baselineStds: Record<string, number> = {};

    for (const col of numericCols) {
      const vals = rows.slice(0, baselineCount).map((r) => r.values[col] ?? 0);
      baselineMeans[col] = ss.mean(vals);
      const std = ss.standardDeviation(vals);
      baselineStds[col] = std === 0 ? 1e-6 : std;
    }

    // Compute Health Index for each point: HI = exp(-0.5 * mean(z^2))
    const timestamps: string[] = [];
    const healthScores: number[] = [];

    for (const r of rows) {
      let sumZ2 = 0;
      for (const col of numericCols) {
        const val = r.values[col] ?? baselineMeans[col];
        const z = (val - baselineMeans[col]) / baselineStds[col];
        sumZ2 += z * z;
      }
      const avgZ2 = sumZ2 / (numericCols.length || 1);
      // Health index decaying from 1.0 towards 0.0
      const hi = Math.max(0.01, Math.min(1.0, Math.exp(-0.25 * avgZ2)));
      timestamps.push(r.timestamp.toISOString());
      healthScores.push(parseFloat(hi.toFixed(4)));
    }

    // Time deltas in days from first timestamp
    const t0 = new Date(timestamps[0]).getTime();
    const timeDays = timestamps.map(
      (ts) => (new Date(ts).getTime() - t0) / (1000 * 60 * 60 * 24),
    );

    const totalObservedDays = timeDays[timeDays.length - 1] - timeDays[0];
    const avgStepDays =
      totalObservedDays > 0 ? totalObservedDays / (rows.length - 1) : 1;

    // Linear regression on log(HI) for exponential degradation: ln(HI) = m * t + c
    const points: [number, number][] = timeDays.map((t, idx) => [
      t,
      Math.log(healthScores[idx]),
    ]);

    const regression = ss.linearRegression(points);
    const slope = regression.m; // Expected to be negative as equipment degrades
    const intercept = regression.b;

    let etaDays: number;
    let lowerDays: number;
    let upperDays: number;

    const currentT = timeDays[timeDays.length - 1];
    const currentHI = healthScores[healthScores.length - 1];

    if (slope < -1e-5) {
      // Time when ln(HI) reaches ln(failureThreshold): t_fail = (ln(failureThreshold) - intercept) / slope
      const tFail = (Math.log(failureThreshold) - intercept) / slope;
      const rawEta = Math.max(0.5, tFail - currentT);

      // Compute standard error of regression to form confidence band
      const residuals = points.map(([t, logHI]) => logHI - (slope * t + intercept));
      const residualStd = ss.standardDeviation(residuals);

      // 90% confidence interval width
      const deltaT = Math.abs(residualStd / slope) * 1.645;

      etaDays = parseFloat(rawEta.toFixed(1));
      lowerDays = parseFloat(Math.max(0.2, rawEta - deltaT).toFixed(1));
      upperDays = parseFloat((rawEta + deltaT).toFixed(1));
    } else {
      // Slope is non-negative (system is stable and not showing noticeable degradation)
      // Provide healthy long-term baseline projection
      etaDays = parseFloat((totalObservedDays * 5 + 180).toFixed(1));
      lowerDays = parseFloat((etaDays * 0.75).toFixed(1));
      upperDays = parseFloat((etaDays * 1.35).toFixed(1));
    }

    // Save RulResult entity
    const rulEntity = this.rulRepository.create({
      datasetId,
      healthIndex: {
        timestamps,
        scores: healthScores,
      },
      etaDays,
      lowerDays,
      upperDays,
    });

    const saved = await this.rulRepository.save(rulEntity);

    return {
      id: saved.id,
      datasetId,
      etaDays,
      lowerDays,
      upperDays,
      currentHealthIndex: currentHI,
      failureThreshold,
      healthIndexHistory: {
        timestamps,
        scores: healthScores,
      },
    };
  }
}

