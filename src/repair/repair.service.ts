import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anomaly } from '../detection/entities/anomaly.entity';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

export interface RepairGuide {
  anomalyId: string;
  problem: string;
  severity: string;
  rootCause: string;
  orderedSteps: string[];
  safetyPrecaution: string;
  aiExplanation?: string;
  metrics: Record<string, any>;
  matchedRuleId: string;
}

@Injectable()
export class RepairService {
  private readonly logger = new Logger(RepairService.name);
  private rules: any[] = [];
  private anthropicClient: Anthropic | null = null;

  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepository: Repository<Anomaly>,
  ) {
    this.loadRules();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_api_key')) {
      this.anthropicClient = new Anthropic({ apiKey });
      this.logger.log('Anthropic Claude API client initialized for Repair Assistant.');
    } else {
      this.logger.log('Anthropic API key not set. Using rule-grounded internal explanation.');
    }
  }

  private loadRules() {
    try {
      const rulesPath = path.join(__dirname, 'knowledge-base', 'rules.json');
      if (fs.existsSync(rulesPath)) {
        this.rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
      }
    } catch (e) {
      this.logger.warn(`Could not load rules.json: ${e.message}`);
      this.rules = [];
    }
  }

  async getRepairPlan(anomalyId: string): Promise<RepairGuide> {
    const anomaly = await this.anomalyRepository.findOne({
      where: { id: anomalyId },
      relations: ['run', 'run.dataset', 'run.dataset.system'],
    });

    if (!anomaly) {
      throw new NotFoundException(`Anomaly with ID '${anomalyId}' not found.`);
    }

    const systemType = anomaly.run?.dataset?.system?.type?.toLowerCase() || 'any';
    const rootCauseText = (anomaly.rootCause || '').toLowerCase();
    const metricKeys = Object.keys(anomaly.metrics || {}).map((k) => k.toLowerCase());

    // Match best rule
    let matchedRule = this.rules.find((rule) => {
      const trigger = rule.triggerMetric.toLowerCase();
      const matchMetric = rootCauseText.includes(trigger) || metricKeys.includes(trigger);
      const matchSystem = rule.systemType === 'any' || rule.systemType.toLowerCase() === systemType;
      return matchMetric && matchSystem;
    });

    // Fallback rule if specific metric not matched
    if (!matchedRule) {
      matchedRule = this.rules.find((r) => r.triggerMetric === 'generic') || {
        id: 'RULE-DEFAULT',
        problem: 'System Operating Anomaly Detected',
        severity: anomaly.severity,
        rootCause: anomaly.rootCause || 'Multivariate deviation exceeding empirical threshold.',
        orderedSteps: [
          'Step 1: Check primary sensor wiring and calibration.',
          'Step 2: Inspect physical component for excessive noise or vibration.',
          'Step 3: Verify operational load and operating environment.',
        ],
        safetyPrecaution: 'Adhere to standard plant safety and PPE requirements.',
      };
    }

    let aiExplanation: string;

    if (this.anthropicClient) {
      try {
        const prompt = `You are a Senior Industrial Reliability and Repair Engineer.
Analyze the following equipment anomaly grounded ONLY in the matched rule and empirical data values provided:

SYSTEM INFORMATION:
- System Type: ${systemType}
- Anomaly Severity: ${anomaly.severity}
- Anomaly Score: ${anomaly.score}
- Root Cause Identified: ${anomaly.rootCause}
- Sensor Metrics: ${JSON.stringify(anomaly.metrics, null, 2)}

MATCHED ENGINEERING RULE:
- Problem: ${matchedRule.problem}
- Root Cause Description: ${matchedRule.rootCause}
- Ordered Repair Steps:
${matchedRule.orderedSteps.join('\n')}
- Safety Precaution: ${matchedRule.safetyPrecaution}

INSTRUCTIONS:
Provide a concise, grounded technical explanation of this failure mode and why the ordered repair steps resolve it. Ground your explanation strictly on the provided empirical values and rule instructions. Do not extrapolate or assume outside facts.`;

        const message = await this.anthropicClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        });

        const contentBlock = message.content[0];
        aiExplanation = contentBlock.type === 'text' ? contentBlock.text : '';
      } catch (err) {
        this.logger.warn(`Anthropic API call failed: ${err.message}. Falling back to rule-grounded explanation.`);
        aiExplanation = this.buildGroundedExplanation(anomaly, matchedRule);
      }
    } else {
      aiExplanation = this.buildGroundedExplanation(anomaly, matchedRule);
    }

    return {
      anomalyId: anomaly.id,
      problem: matchedRule.problem,
      severity: anomaly.severity,
      rootCause: anomaly.rootCause || matchedRule.rootCause,
      orderedSteps: matchedRule.orderedSteps,
      safetyPrecaution: matchedRule.safetyPrecaution,
      aiExplanation,
      metrics: anomaly.metrics,
      matchedRuleId: matchedRule.id,
    };
  }

  private buildGroundedExplanation(anomaly: Anomaly, rule: any): string {
    const metricsStr = Object.entries(anomaly.metrics || {})
      .map(([k, v]) => `${k} = ${v}`)
      .join(', ');

    return `Diagnostic Evaluation: At timestamp ${anomaly.timestamp.toISOString()}, a ${anomaly.severity} anomaly was detected with score ${(
      anomaly.score * 100
    ).toFixed(1)}%. Sensor readings recorded: [${metricsStr}]. Primary deviation identified: ${
      anomaly.rootCause
    }. This matches reliability rule ${rule.id} ("${rule.problem}"). Maintenance action is required following the prescribed ${
      rule.orderedSteps.length
    } sequential steps to prevent cascading mechanical degradation. Observe safety guideline: ${
      rule.safetyPrecaution
    }.`;
  }
}

