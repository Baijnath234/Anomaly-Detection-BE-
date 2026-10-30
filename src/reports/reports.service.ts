import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetectionRun } from '../detection/entities/detection-run.entity';
import { Anomaly } from '../detection/entities/anomaly.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DetectionRun)
    private readonly runRepository: Repository<DetectionRun>,
    @InjectRepository(Anomaly)
    private readonly anomalyRepository: Repository<Anomaly>,
  ) {}

  async generateAnomaliesCsv(runId: string): Promise<string> {
    const run = await this.runRepository.findOne({
      where: { id: runId },
      relations: ['anomalies', 'dataset', 'dataset.system'],
    });

    if (!run) {
      throw new NotFoundException(`Detection run '${runId}' not found.`);
    }

    const anomalies = run.anomalies || [];
    const headers = [
      'AnomalyId',
      'RunId',
      'SystemName',
      'Timestamp',
      'Severity',
      'Score',
      'RootCause',
      'SensorReadings',
    ];

    const lines = [headers.join(',')];

    for (const a of anomalies) {
      const systemName = run.dataset?.system?.name || 'Unknown';
      const metricsSummary = Object.entries(a.metrics || {})
        .map(([k, v]) => `${k}:${v}`)
        .join('; ');

      const row = [
        `"${a.id}"`,
        `"${run.id}"`,
        `"${systemName}"`,
        `"${a.timestamp.toISOString()}"`,
        `"${a.severity}"`,
        a.score.toFixed(4),
        `"${(a.rootCause || '').replace(/"/g, '""')}"`,
        `"${metricsSummary.replace(/"/g, '""')}"`,
      ];
      lines.push(row.join(','));
    }

    return lines.join('\n');
  }

  async getRunSummary(runId: string): Promise<Record<string, any>> {
    const run = await this.runRepository.findOne({
      where: { id: runId },
      relations: ['anomalies', 'dataset', 'dataset.system'],
    });

    if (!run) {
      throw new NotFoundException(`Detection run '${runId}' not found.`);
    }

    const anomalies = run.anomalies || [];
    const rootCauses: Record<string, number> = {};
    let critical = 0;
    let warning = 0;
    let info = 0;

    for (const a of anomalies) {
      if (a.severity === 'Critical') critical++;
      else if (a.severity === 'Warning') warning++;
      else info++;

      const cause = a.rootCause?.split(' ')[0] || 'Unknown';
      rootCauses[cause] = (rootCauses[cause] || 0) + 1;
    }

    return {
      runId: run.id,
      systemName: run.dataset?.system?.name,
      datasetName: run.dataset?.name,
      method: run.method,
      executedAt: run.createdAt,
      totalAnomalies: anomalies.length,
      severityBreakdown: {
        critical,
        warning,
        info,
      },
      topRootCauses: rootCauses,
    };
  }
}

