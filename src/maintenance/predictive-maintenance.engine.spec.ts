import { PredictiveMaintenanceEngine } from './predictive-maintenance.engine';

describe('PredictiveMaintenanceEngine (Task 5 AI Predictive Maintenance)', () => {
  let engine: PredictiveMaintenanceEngine;

  beforeEach(() => {
    engine = new PredictiveMaintenanceEngine();
  });

  it('should grade low-stress component as Healthy with 180-day inspection interval', () => {
    const output = engine.evaluateComponent({
      componentId: 'c-wire-01',
      componentType: 'CIRCUIT_WIRING',
      installationDate: '2024-01-01',
      ratedCurrentAmps: 16.0,
      averageCurrentAmps: 5.0,
      peakCurrentAmps: 9.0,
      averageTemperatureCelsius: 30.0,
      maxTemperatureCelsius: 34.0,
      historicalTripCount: 0,
      historicalAnomalyCount: 0,
    });

    expect(output.healthStatus).toBe('Healthy');
    expect(output.riskLevel).toBe('LOW');
    expect(output.healthScore).toBeGreaterThanOrEqual(85.0);
    expect(output.recommendedAction).toContain('6 months');
  });

  it('should detect thermal aging stress and recommend maintenance within 14-30 days', () => {
    const output = engine.evaluateComponent({
      componentId: 'c-breaker-01',
      componentType: 'BREAKER',
      installationDate: '2020-01-01',
      ratedCurrentAmps: 16.0,
      averageCurrentAmps: 14.5, // High continuous load
      peakCurrentAmps: 18.0,
      averageTemperatureCelsius: 58.0,
      maxTemperatureCelsius: 72.0, // Overheating
      historicalTripCount: 3,
    });

    expect(output.healthScore).toBeLessThan(60.0);
    expect(['Needs inspection', 'Maintenance recommended', 'Critical inspection required']).toContain(output.healthStatus);
    expect(output.detectedIssues.some(i => i.includes('temperature') || i.includes('trip'))).toBe(true);
    expect(output.supportingEvidence.thermalStressScore).toBeGreaterThan(0);
  });

  it('should flag urgent critical inspection when severe multiple stressors combine', () => {
    const output = engine.evaluateComponent({
      componentId: 'c-lug-01',
      componentType: 'TERMINAL_LUG',
      installationDate: '2015-01-01',
      ratedCurrentAmps: 16.0,
      averageCurrentAmps: 16.0,
      peakCurrentAmps: 28.0,
      averageTemperatureCelsius: 65.0,
      maxTemperatureCelsius: 86.0,
      historicalTripCount: 7,
    });

    expect(output.healthScore).toBeLessThan(40.0);
    expect(output.riskLevel).toBe('CRITICAL');
    expect(output.healthStatus).toBe('Critical inspection required');
    expect(output.recommendedAction).toContain('Immediate certified electrician inspection');
  });
});

