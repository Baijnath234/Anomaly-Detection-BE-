import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RulService } from './rul.service';
import { RulResult } from './entities/rul-result.entity';
import { Dataset } from '../datasets/entities/dataset.entity';
import { MetricRow } from '../datasets/entities/metric-row.entity';

describe('RulService', () => {
  let service: RulService;
  let rulRepo: any;
  let datasetRepo: any;
  let metricRepo: any;

  beforeEach(async () => {
    rulRepo = {
      create: jest.fn().mockImplementation((val) => ({ id: 'rul-1', ...val })),
      save: jest.fn().mockImplementation((val) => Promise.resolve({ id: 'rul-1', ...val })),
    };

    datasetRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'dataset-1',
        name: 'Pump-101',
      }),
    };

    // Synthesize 10 degrading metric rows
    const now = Date.now();
    const rows = Array.from({ length: 15 }, (_, i) => ({
      id: `row-${i}`,
      datasetId: 'dataset-1',
      timestamp: new Date(now + i * 24 * 60 * 60 * 1000), // daily
      values: {
        vibration: 1.0 + i * 0.2, // steadily increasing vibration
        temperature: 50.0 + i * 1.5,
      },
    }));

    metricRepo = {
      find: jest.fn().mockResolvedValue(rows),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulService,
        { provide: getRepositoryToken(RulResult), useValue: rulRepo },
        { provide: getRepositoryToken(Dataset), useValue: datasetRepo },
        { provide: getRepositoryToken(MetricRow), useValue: metricRepo },
      ],
    }).compile();

    service = module.get<RulService>(RulService);
  });

  it('should estimate RUL and return etaDays with lower and upper bounds', async () => {
    const result = await service.estimateRul('dataset-1', 0.25);

    expect(result).toBeDefined();
    expect(result.datasetId).toBe('dataset-1');
    expect(result.etaDays).toBeGreaterThan(0);
    expect(result.lowerDays).toBeLessThanOrEqual(result.etaDays);
    expect(result.upperDays).toBeGreaterThanOrEqual(result.etaDays);
    expect(result.healthIndexHistory.scores.length).toBe(15);
  });
});

