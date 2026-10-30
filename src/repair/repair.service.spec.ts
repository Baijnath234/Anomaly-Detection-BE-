import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepairService } from './repair.service';
import { Anomaly, AnomalySeverity } from '../detection/entities/anomaly.entity';

describe('RepairService', () => {
  let service: RepairService;
  let anomalyRepo: any;

  beforeEach(async () => {
    anomalyRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'anomaly-uuid-1',
        timestamp: new Date(),
        score: 0.94,
        severity: AnomalySeverity.CRITICAL,
        metrics: { vibration: 5.2, temperature: 88.0 },
        rootCause: 'vibration (Z-score: 5.1σ)',
        run: {
          dataset: {
            system: {
              type: 'Turbine',
            },
          },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairService,
        { provide: getRepositoryToken(Anomaly), useValue: anomalyRepo },
      ],
    }).compile();

    service = module.get<RepairService>(RepairService);
  });

  it('should match vibration rule and provide ordered fix steps and grounded explanation', async () => {
    const guide = await service.getRepairPlan('anomaly-uuid-1');

    expect(guide).toBeDefined();
    expect(guide.anomalyId).toBe('anomaly-uuid-1');
    expect(guide.problem).toContain('Imbalance');
    expect(guide.orderedSteps.length).toBeGreaterThan(0);
    expect(guide.safetyPrecaution).toBeDefined();
    expect(guide.aiExplanation).toContain('vibration');
  });
});

