import { Injectable } from '@nestjs/common';
import * as ss from 'simple-statistics';

export interface RootCauseAnalysisResult {
  primaryMetric: string;
  maxZScore: number;
  deviations: Record<string, number>;
  firstDeviatedMetric?: string;
  correlatedMetrics: string[];
}

@Injectable()
export class RootCauseService {
  /**
   * Determine the root cause of an anomaly by analyzing which metric deviated most or earliest
   */
  analyze(
    row: Record<string, number>,
    baselineStats: Record<string, { mean: number; std: number }>,
    windowHistory?: Record<string, number>[],
  ): RootCauseAnalysisResult {
    const deviations: Record<string, number> = {};
    let primaryMetric = '';
    let maxZScore = -1;

    for (const [col, val] of Object.entries(row)) {
      if (typeof val !== 'number' || Number.isNaN(val)) continue;
      const stats = baselineStats[col];
      if (!stats) continue;

      const z = Math.abs(val - stats.mean) / (stats.std || 1e-6);
      deviations[col] = parseFloat(z.toFixed(2));

      if (z > maxZScore) {
        maxZScore = z;
        primaryMetric = col;
      }
    }

    // Temporal analysis: check which metric crossed 2.0 sigma first in the preceding window
    let firstDeviatedMetric = primaryMetric;
    if (windowHistory && windowHistory.length > 0) {
      for (let t = 0; t < windowHistory.length; t++) {
        const histRow = windowHistory[t];
        let foundEarly = false;
        for (const [col, val] of Object.entries(histRow)) {
          const stats = baselineStats[col];
          if (!stats) continue;
          const z = Math.abs(val - stats.mean) / (stats.std || 1e-6);
          if (z >= 2.0) {
            firstDeviatedMetric = col;
            foundEarly = true;
            break;
          }
        }
        if (foundEarly) break;
      }
    }

    // Determine correlated metrics (those that also deviated significantly, >= 2.0 sigma)
    const correlatedMetrics = Object.keys(deviations).filter(
      (col) => col !== primaryMetric && deviations[col] >= 2.0,
    );

    return {
      primaryMetric: primaryMetric || 'unknown',
      maxZScore: parseFloat(maxZScore.toFixed(2)),
      deviations,
      firstDeviatedMetric,
      correlatedMetrics,
    };
  }

  /**
   * Compute pairwise Pearson correlation matrix across metrics
   */
  computeCorrelationMatrix(
    rows: Record<string, number>[],
    columns: string[],
  ): Record<string, Record<string, number>> {
    const matrix: Record<string, Record<string, number>> = {};

    for (const colA of columns) {
      matrix[colA] = {};
      const seriesA = rows.map((r) => r[colA] ?? 0);

      for (const colB of columns) {
        const seriesB = rows.map((r) => r[colB] ?? 0);
        try {
          const corr = ss.sampleCorrelation(seriesA, seriesB);
          matrix[colA][colB] = Number.isNaN(corr) ? 0 : parseFloat(corr.toFixed(3));
        } catch {
          matrix[colA][colB] = 0;
        }
      }
    }

    return matrix;
  }
}

