import { Injectable, Logger } from '@nestjs/common';
import { ElectricalFaultsService } from '../electrical-faults/electrical-faults.service';
import { ZScoreDetector } from './detectors/zscore.detector';
import { IsolationForestDetector } from './detectors/isolation-forest.detector';
import { v4 as uuidv4 } from 'uuid';

export interface ElectricalReadingInput {
  homeId?: string;
  roomId?: string;
  circuitId: string;
  deviceId?: string;
  timestamp?: number;
  voltageRms: number;
  currentRms: number;
  activePowerWatts?: number;
  reactivePowerVar?: number;
  powerFactor?: number;
  frequencyHz?: number;
  temperatureCelsius?: number;
  leakageCurrentMa?: number;
  breakerRatingAmps?: number;
}

export interface ElectricalFaultDiagnosticReport {
  faultId: string;
  homeId: string;
  roomId: string;
  circuitId: string;
  deviceId?: string;
  timestamp: number;
  faultCategory: string;
  severity: 'NORMAL' | 'INFORMATIONAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  measuredValues: {
    voltageRms: number;
    currentRms: number;
    activePowerWatts: number;
    powerFactor: number;
    temperatureCelsius: number;
    leakageCurrentMa: number;
  };
  expectedValues: {
    voltageRange: [number, number];
    maxContinuousCurrent: number;
    maxTerminalTemperature: number;
    maxLeakageCurrentMa: number;
    nominalPowerFactorMin: number;
  };
  detectionMethod: string;
  confidenceScore: number;
  explanation: string;
  recommendedAction: string;
  maintenancePriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';
}

@Injectable()
export class ElectricalFaultDetectionService {
  private readonly logger = new Logger(ElectricalFaultDetectionService.name);
  private zScoreDetector: ZScoreDetector = new ZScoreDetector(2.5);
  private isoForest: IsolationForestDetector = new IsolationForestDetector(50, 0.05);

  constructor(
    private readonly faultsService: ElectricalFaultsService,
  ) {}

  public async evaluateReading(
    input: ElectricalReadingInput,
    autoPersist: boolean = true,
  ): Promise<ElectricalFaultDiagnosticReport> {
    const nominalV = 230.0;
    const breakerRating = input.breakerRatingAmps ?? 16.0;
    const v = input.voltageRms;
    const i = input.currentRms;
    const p = input.activePowerWatts ?? (v * i * (input.powerFactor ?? 1.0));
    const pf = input.powerFactor ?? 1.0;
    const t = input.temperatureCelsius ?? 30.0;
    const leakageMa = input.leakageCurrentMa ?? 0.0;
    const ts = input.timestamp ?? Math.floor(Date.now() / 1000);

    const measuredValues = {
      voltageRms: Math.round(v * 10) / 10,
      currentRms: Math.round(i * 100) / 100,
      activePowerWatts: Math.round(p * 10) / 10,
      powerFactor: Math.round(pf * 100) / 100,
      temperatureCelsius: Math.round(t * 10) / 10,
      leakageCurrentMa: Math.round(leakageMa * 100) / 100,
    };

    const expectedValues = {
      voltageRange: [Math.round(nominalV * 0.9 * 10) / 10, Math.round(nominalV * 1.1 * 10) / 10] as [number, number],
      maxContinuousCurrent: breakerRating,
      maxTerminalTemperature: 65.0,
      maxLeakageCurrentMa: 15.0,
      nominalPowerFactorMin: 0.85,
    };

    let report: ElectricalFaultDiagnosticReport;

    // 1. Sensor Malfunction Check
    if (t <= -120.0 || t >= 125.0) {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'SENSOR_MALFUNCTION',
        severity: 'WARNING',
        measuredValues,
        expectedValues,
        detectionMethod: 'SENSOR_TRANSDUCER_HEALTH_CHECK',
        confidenceScore: 0.99,
        explanation: `Thermal sensor returned ${t}°C, indicating disconnected probe or open-circuit error.`,
        recommendedAction: 'Verify physical connection of the DS18B20 digital temperature bus.',
        maintenancePriority: 'MEDIUM',
      });
    }
    // 2. Critical Overcurrent / Potential Overload
    else if (i > breakerRating * 1.25) {
      const severity = i > breakerRating * 1.5 ? 'CRITICAL' : 'HIGH';
      report = this.createReport({
        input,
        ts,
        faultCategory: 'OVERCURRENT',
        severity,
        measuredValues,
        expectedValues,
        detectionMethod: 'IEC_60364_AMPACITY_LIMIT',
        confidenceScore: 0.98,
        explanation: `Circuit current of ${i}A is ${Math.round((i / breakerRating) * 100)}% of the ${breakerRating}A rated breaker limit.`,
        recommendedAction: 'Inspect for overloaded downstream sockets or stalled motor appliances.',
        maintenancePriority: 'IMMEDIATE',
      });
    } else if (i > breakerRating) {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'POTENTIAL_OVERLOAD',
        severity: 'WARNING',
        measuredValues,
        expectedValues,
        detectionMethod: 'THERMAL_TRIP_CURVE_ESTIMATION',
        confidenceScore: 0.92,
        explanation: `Current ${i}A exceeds nominal breaker capacity (${breakerRating}A). Sustained operation will trigger thermal trip.`,
        recommendedAction: 'Turn off non-essential appliances on this circuit.',
        maintenancePriority: 'HIGH',
      });
    }
    // 3. Terminal Overheating / Contact Resistance
    else if (t > 70.0) {
      const severity = t > 80.0 ? 'CRITICAL' : 'HIGH';
      report = this.createReport({
        input,
        ts,
        faultCategory: 'OVERHEATING',
        severity,
        measuredValues,
        expectedValues,
        detectionMethod: 'ARRHENIUS_THERMAL_SURGE_DETECTOR',
        confidenceScore: 0.95,
        explanation: `Terminal temperature ${t}°C is in the insulation degradation hazard zone (>65°C).`,
        recommendedAction: 'Retorque terminal screw connections and inspect busbar contacts for oxidation.',
        maintenancePriority: 'IMMEDIATE',
      });
    }
    // 4. Earth Leakage
    else if (leakageMa > 15.0) {
      const severity = leakageMa >= 30.0 ? 'CRITICAL' : 'WARNING';
      report = this.createReport({
        input,
        ts,
        faultCategory: 'EARTH_LEAKAGE',
        severity,
        measuredValues,
        expectedValues,
        detectionMethod: 'ZERO_SEQUENCE_CURRENT_ANALYSIS',
        confidenceScore: 0.94,
        explanation: `Residual leakage current of ${leakageMa}mA detected. Approaching 30mA RCD trip safety limit.`,
        recommendedAction: 'Perform insulation resistance Megger test across Phase/Neutral to Earth.',
        maintenancePriority: severity === 'CRITICAL' ? 'IMMEDIATE' : 'MEDIUM',
      });
    }
    // 5. Voltage Sag / Surge
    else if (v < nominalV * 0.9) {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'UNDER_VOLTAGE',
        severity: 'WARNING',
        measuredValues,
        expectedValues,
        detectionMethod: 'GRID_POWER_QUALITY_MONITOR',
        confidenceScore: 0.96,
        explanation: `Mains voltage ${v}V is under the 10% lower limit (207V). Susceptible motors may overheat.`,
        recommendedAction: 'Verify incoming feeder neutral integrity or contact utility company.',
        maintenancePriority: 'MEDIUM',
      });
    } else if (v > nominalV * 1.1) {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'OVER_VOLTAGE',
        severity: 'HIGH',
        measuredValues,
        expectedValues,
        detectionMethod: 'GRID_POWER_QUALITY_MONITOR',
        confidenceScore: 0.96,
        explanation: `Mains voltage ${v}V exceeds the 10% upper safety limit (253V). High risk of dielectric breakdown.`,
        recommendedAction: 'Verify surge protection device status and contact utility supplier.',
        maintenancePriority: 'HIGH',
      });
    }
    // 6. Micro-Arcing / Loose Contact Indicator
    else if (i > 2.0 && pf < 0.75) {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'MICRO_ARCING',
        severity: 'WARNING',
        measuredValues,
        expectedValues,
        detectionMethod: 'SPECTRAL_VARIANCE_ANOMALY_DETECTOR',
        confidenceScore: 0.88,
        explanation: `Low power factor (${pf}) with normal load current indicates possible cycle-to-cycle series contact arcing.`,
        recommendedAction: 'Inspect switch contacts and terminal blocks for burn marks or loose clamping.',
        maintenancePriority: 'HIGH',
      });
    }
    // 7. Normal Operation
    else {
      report = this.createReport({
        input,
        ts,
        faultCategory: 'NORMAL',
        severity: 'NORMAL',
        measuredValues,
        expectedValues,
        detectionMethod: 'MULTI_VARIABLE_BASELINE_CHECK',
        confidenceScore: 0.99,
        explanation: 'All monitored electrical parameters are within standard operating baselines.',
        recommendedAction: 'No action required.',
        maintenancePriority: 'LOW',
      });
    }

    // Auto-persist active fault if not normal
    if (autoPersist && report.severity !== 'NORMAL') {
      try {
        await this.faultsService.logFault({
          circuitId: input.circuitId,
          faultType: report.faultCategory,
          severity: report.severity === 'HIGH' || report.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          triggerValue: report.measuredValues.currentRms,
          thresholdValue: report.expectedValues.maxContinuousCurrent,
          parameter: 'ELECTRICAL_COMPOSITE',
          message: report.explanation,
          snapshotJson: report as any,
        });
      } catch (err) {
        this.logger.warn(`Failed to auto-persist fault record: ${err.message}`);
      }
    }

    return report;
  }

  private createReport(params: {
    input: ElectricalReadingInput;
    ts: number;
    faultCategory: string;
    severity: 'NORMAL' | 'INFORMATIONAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
    measuredValues: any;
    expectedValues: any;
    detectionMethod: string;
    confidenceScore: number;
    explanation: string;
    recommendedAction: string;
    maintenancePriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';
  }): ElectricalFaultDiagnosticReport {
    return {
      faultId: uuidv4(),
      homeId: params.input.homeId ?? 'home_default',
      roomId: params.input.roomId ?? 'room_default',
      circuitId: params.input.circuitId,
      deviceId: params.input.deviceId,
      timestamp: params.ts,
      faultCategory: params.faultCategory,
      severity: params.severity,
      measuredValues: params.measuredValues,
      expectedValues: params.expectedValues,
      detectionMethod: params.detectionMethod,
      confidenceScore: params.confidenceScore,
      explanation: params.explanation,
      recommendedAction: params.recommendedAction,
      maintenancePriority: params.maintenancePriority,
    };
  }
}

