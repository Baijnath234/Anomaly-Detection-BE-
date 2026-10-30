import { Injectable } from '@nestjs/common';
import { AnomalySeverity } from '../detection/entities/anomaly.entity';

@Injectable()
export class SeverityService {
  /**
   * Determine anomaly severity (Critical, Warning, Info) based on score and metric deviations
   */
  calculateSeverity(
    score: number,
    metricDeviations?: Record<string, number>,
  ): AnomalySeverity {
    let maxSigma = 0;
    if (metricDeviations) {
      for (const val of Object.values(metricDeviations)) {
        if (Math.abs(val) > maxSigma) {
          maxSigma = Math.abs(val);
        }
      }
    }

    if (score >= 0.85 || maxSigma >= 4.0) {
      return AnomalySeverity.CRITICAL;
    }

    if (score >= 0.65 || maxSigma >= 2.5) {
      return AnomalySeverity.WARNING;
    }

    return AnomalySeverity.INFO;
  }
}

