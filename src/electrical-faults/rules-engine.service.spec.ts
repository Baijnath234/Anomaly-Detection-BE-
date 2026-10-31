import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RulesEngineService } from './rules-engine.service';
import { AlertRule } from './entities/alert-rule.entity';
import { ElectricalFaultsService } from './electrical-faults.service';

describe('RulesEngineService (Task 6 Configurable Alert Rules & Debouncing)', () => {
  let service: RulesEngineService;

  const mockRuleRepo = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'rule-overcurrent-1',
        name: 'Overcurrent Alert',
        parameter: 'CURRENT_RMS',
        condition: 'GT',
        thresholdValue: 16.0,
        severity: 'CRITICAL',
        isEnabled: true,
      },
    ]),
  };

  const mockFaultsService = {
    logFault: jest.fn().mockResolvedValue({ id: 'f-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesEngineService,
        { provide: getRepositoryToken(AlertRule), useValue: mockRuleRepo },
        { provide: ElectricalFaultsService, useValue: mockFaultsService },
      ],
    }).compile();

    service = module.get<RulesEngineService>(RulesEngineService);
  });

  it('should trigger alert rule when parameter exceeds configured threshold', async () => {
    const res = await service.evaluateRules({
      circuitId: 'c-test-1',
      currentRms: 22.5, // > 16.0
    });

    expect(res.triggered).toBe(1);
    expect(mockFaultsService.logFault).toHaveBeenCalled();
  });

  it('should suppress duplicate notifications within debounce window', async () => {
    // First evaluation triggers
    await service.evaluateRules({
      circuitId: 'c-debounce-test',
      currentRms: 25.0,
    });

    // Immediate second evaluation should be suppressed
    const res2 = await service.evaluateRules({
      circuitId: 'c-debounce-test',
      currentRms: 25.0,
    });

    expect(res2.triggered).toBe(0);
  });
});
