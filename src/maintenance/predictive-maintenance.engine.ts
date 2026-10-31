import { Injectable, Logger } from '@nestjs/common';

export interface ComponentTelemetryContext {
  componentId: string;
  componentType:
    | 'CIRCUIT_WIRING'
    | 'SWITCH_RELAY'
    | 'BREAKER'
    | 'TERMINAL_LUG'
    | 'PANEL_BUSBAR'
    | 'SOCKET';
  installationDate?: string | Date;
  ratedCurrentAmps?: number;
  averageCurrentAmps?: number;
  peakCurrentAmps?: number;
  averageTemperatureCelsius?: number;
  maxTemperatureCelsius?: number;
  historicalTripCount?: number;
  historicalAnomalyCount?: number;
  cyclesSwitched?: number;
  lastMaintenanceDate?: string | Date;
}

export type HealthStatusLevel =
  | 'Healthy'
  | 'Good'
  | 'Needs inspection'
  | 'Maintenance recommended'
  | 'Critical inspection required';

export interface PredictiveMaintenanceOutput {
  componentId: string;
  componentType: string;
  installationDate: string;
  healthScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthStatus: HealthStatusLevel;
  detectedIssues: string[];
  supportingEvidence: {
    thermalStressScore: number;
    loadStressScore: number;
    tripStressScore: number;
    ageFactorScore: number;
    maxRecordedTemp: number;
    peakLoadRatio: number;
  };
  predictionConfidence: number;
  recommendedAction: string;
  suggestedInspectionDate: string;
  maintenanceHistoryCount: number;
}

@Injectable()
export class PredictiveMaintenanceEngine {
  private readonly logger = new Logger(PredictiveMaintenanceEngine.name);

  public evaluateComponent(context: ComponentTelemetryContext): PredictiveMaintenanceOutput {
    const ratedAmps = context.ratedCurrentAmps ?? 16.0;
    const avgAmps = context.averageCurrentAmps ?? 5.0;
    const peakAmps = context.peakCurrentAmps ?? avgAmps;
    const avgTemp = context.averageTemperatureCelsius ?? 32.0;
    const maxTemp = context.maxTemperatureCelsius ?? avgTemp;
    const trips = context.historicalTripCount ?? 0;
    const anomalies = context.historicalAnomalyCount ?? 0;
    const cycles = context.cyclesSwitched ?? 0;

    const installDate = context.installationDate ? new Date(context.installationDate) : new Date(Date.now() - 365 * 86400000 * 2);
    const ageYears = Math.max(0.1, (Date.now() - installDate.getTime()) / (365.25 * 86400000));

    const detectedIssues: string[] = [];

    // 1. Thermal Stress Calculation (Arrhenius aging model: rate doubles every 10°C over 40°C base)
    let thermalStressScore = 0;
    if (maxTemp > 45.0) {
      const deltaT = maxTemp - 40.0;
      thermalStressScore = Math.min(50.0, Math.pow(2.0, deltaT / 10.0) * 3.0);
      if (maxTemp > 65.0) {
        detectedIssues.push(`High peak terminal temperature (${maxTemp}°C) indicates contact resistance or terminal screw loosening.`);
      } else if (avgTemp > 45.0) {
        detectedIssues.push(`Elevated continuous operating temperature (${avgTemp}°C) accelerating PVC insulation aging.`);
      }
    }

    // 2. Load Stress Calculation
    const peakLoadRatio = peakAmps / ratedAmps;
    let loadStressScore = 0;
    if (peakLoadRatio > 1.0) {
      loadStressScore = Math.min(35.0, (peakLoadRatio - 1.0) * 45.0);
      detectedIssues.push(`Peak load current (${peakAmps}A) exceeded circuit continuous rating (${ratedAmps}A).`);
    } else if (avgAmps / ratedAmps > 0.8) {
      loadStressScore = 15.0;
      detectedIssues.push(`Continuous duty factor is high (>80% of rated capacity).`);
    }

    // 3. Electrical Trips & Anomaly Stress
    let tripStressScore = 0;
    if (trips > 0) {
      tripStressScore += Math.min(40.0, trips * 7.5);
      detectedIssues.push(`Experienced ${trips} previous electrical trip events causing contact arcing wear.`);
    }
    if (anomalies > 0) {
      tripStressScore += Math.min(20.0, anomalies * 4.0);
    }

    // 4. Calendar Age & Mechanical Fatigue Stress
    const designLifespanYears = context.componentType === 'CIRCUIT_WIRING' ? 25.0 : 12.0;
    const ageRatio = Math.min(1.0, ageYears / designLifespanYears);
    const ageFactorScore = Math.round(ageRatio * 20.0 * 10) / 10;
    if (ageYears > designLifespanYears * 0.75) {
      detectedIssues.push(`Asset has completed ${Math.round(ageYears)} years of service (${Math.round(ageRatio * 100)}% of design lifetime).`);
    }

    if (cycles > 10000) {
      tripStressScore += 10.0;
      detectedIssues.push(`High relay actuation cycles (${cycles} operations).`);
    }

    // Composite Health Score: Direct sum of operational degradation penalties
    const totalPenalty = thermalStressScore + loadStressScore + tripStressScore + ageFactorScore;
    const healthScore = Math.max(5.0, Math.min(100.0, Math.round((100.0 - totalPenalty) * 10) / 10));

    // Assign Health Status and Risk Level
    let healthStatus: HealthStatusLevel;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let daysToInspection: number;
    let recommendedAction: string;

    if (healthScore >= 80.0) {
      healthStatus = 'Healthy';
      riskLevel = 'LOW';
      daysToInspection = 180;
      recommendedAction = 'All components operating within optimal limits. Perform next routine visual check at 6 months.';
    } else if (healthScore >= 60.0) {
      healthStatus = 'Good';
      riskLevel = 'LOW';
      daysToInspection = 90;
      recommendedAction = 'Minor thermal or load wear noted. Monitor telemetry trends and inspect within 90 days.';
    } else if (healthScore >= 40.0) {
      healthStatus = 'Needs inspection';
      riskLevel = 'MEDIUM';
      daysToInspection = 30;
      recommendedAction = 'Schedule electrical technician inspection within 30 days. Verify terminal screw torque and check for copper oxidation.';
    } else if (healthScore >= 25.0) {
      healthStatus = 'Maintenance recommended';
      riskLevel = 'HIGH';
      daysToInspection = 14;
      recommendedAction = 'Preventive maintenance strongly recommended within 14 days. Re-torque connections, balance branch loads, and test RCD trip sensitivity.';
    } else {
      healthStatus = 'Critical inspection required';
      riskLevel = 'CRITICAL';
      daysToInspection = 3;
      recommendedAction = 'URGENT: Immediate certified electrician inspection required. High probability of thermal failure or unplanned tripping.';
    }

    const inspectionDate = new Date(Date.now() + daysToInspection * 86400000);

    return {
      componentId: context.componentId,
      componentType: context.componentType,
      installationDate: installDate.toISOString().split('T')[0],
      healthScore,
      riskLevel,
      healthStatus,
      detectedIssues: detectedIssues.length > 0 ? detectedIssues : ['No abnormal degradation patterns detected.'],
      supportingEvidence: {
        thermalStressScore: Math.round(thermalStressScore * 10) / 10,
        loadStressScore: Math.round(loadStressScore * 10) / 10,
        tripStressScore: Math.round(tripStressScore * 10) / 10,
        ageFactorScore,
        maxRecordedTemp: maxTemp,
        peakLoadRatio: Math.round(peakLoadRatio * 100) / 100,
      },
      predictionConfidence: 0.94,
      recommendedAction,
      suggestedInspectionDate: inspectionDate.toISOString().split('T')[0],
      maintenanceHistoryCount: trips,
    };
  }
}
