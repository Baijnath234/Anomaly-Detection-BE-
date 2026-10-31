import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { ElectricalFaultsService } from './electrical-faults.service';

export interface TelemetryRuleContext {
  circuitId: string;
  voltageRms?: number;
  currentRms?: number;
  temperatureCelsius?: number;
  leakageCurrentMa?: number;
  powerFactor?: number;
}

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);
  // Debounce suppression cache: key -> last alert timestamp
  private alertDebounceCache: Map<string, number> = new Map();
  private debounceWindowMs = 300 * 1000; // 5 minutes debounce

  constructor(
    @InjectRepository(AlertRule)
    private readonly ruleRepo: Repository<AlertRule>,
    private readonly faultsService: ElectricalFaultsService,
  ) {}

  async evaluateRules(context: TelemetryRuleContext): Promise<{ evaluated: number; triggered: number }> {
    const rules = await this.ruleRepo.find({
      where: [
        { isEnabled: true, targetType: 'CIRCUIT', targetId: context.circuitId },
        { isEnabled: true, targetType: 'PANEL' }, // Global rules
      ],
    });

    let triggeredCount = 0;
    const now = Date.now();

    for (const rule of rules) {
      const val = this.extractParameterValue(rule.parameter, context);
      if (val === undefined) continue;

      const isViolated = this.checkCondition(val, rule.condition, rule.thresholdValue, rule.thresholdValueSecondary);

      if (isViolated) {
        const debounceKey = `${context.circuitId}_${rule.id}`;
        const lastAlert = this.alertDebounceCache.get(debounceKey) ?? 0;

        if (now - lastAlert >= this.debounceWindowMs) {
          this.alertDebounceCache.set(debounceKey, now);
          triggeredCount++;

          await this.faultsService.logFault({
            circuitId: context.circuitId,
            faultType: `RULE_${rule.parameter}_VIOLATION`,
            severity: rule.severity,
            triggerValue: val,
            thresholdValue: rule.thresholdValue,
            parameter: rule.parameter,
            message: `Custom rule '${rule.name}' triggered: ${rule.parameter} is ${val} (threshold: ${rule.thresholdValue}).`,
          });
        }
      }
    }

    return { evaluated: rules.length, triggered: triggeredCount };
  }

  private extractParameterValue(parameter: string, ctx: TelemetryRuleContext): number | undefined {
    switch (parameter) {
      case 'CURRENT_RMS':
        return ctx.currentRms;
      case 'VOLTAGE_RMS':
        return ctx.voltageRms;
      case 'TEMPERATURE':
        return ctx.temperatureCelsius;
      case 'LEAKAGE_MA':
        return ctx.leakageCurrentMa;
      case 'POWER_FACTOR':
        return ctx.powerFactor;
      default:
        return undefined;
    }
  }

  private checkCondition(val: number, condition: string, threshold1: number, threshold2?: number): boolean {
    switch (condition) {
      case 'GT':
        return val > threshold1;
      case 'LT':
        return val < threshold1;
      case 'BETWEEN':
        return threshold2 !== undefined ? val >= threshold1 && val <= threshold2 : val >= threshold1;
      default:
        return false;
    }
  }
}
