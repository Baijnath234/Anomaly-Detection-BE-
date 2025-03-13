import { Test, TestingModule } from '@nestjs/testing';
import { ModelTrainingController } from './model-training.controller';
import { ModelTrainingService } from './model-training.service';
import { CreateModelTrainingDto } from '../users/dto/create-model-training.dto';

describe('ModelTrainingController', () => {
  let controller: ModelTrainingController;
  let service: ModelTrainingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelTrainingController],
      providers: [
        {
          provide: ModelTrainingService,
          useValue: {
            createModelTraining: jest.fn().mockImplementation((dto: CreateModelTrainingDto) => {
              return {
                message: 'Model training request received successfully',
                data: dto,
              };
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ModelTrainingController>(ModelTrainingController);
    service = module.get<ModelTrainingService>(ModelTrainingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service and return a success message', async () => {
    const dto: CreateModelTrainingDto = {
      branch: 'East Division',
      powerPlant: 'Solar Plant',
      unit: 'Unit 2',
      model: 'AnomalyDetectionV1',
      analog: 'Analog Data',
      digital: 'Digital Data',
      monitor: 'Monitor Device',
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      tags: 'anomaly,detection',
      layers: '4',
      nodes: '128',
      batches: '32',
      maxEpochs: '50',
    };

    const result = await controller.createModelTraining(dto);

    expect(result).toEqual({
      message: 'Model training request received successfully',
      data: dto,
    });
    expect(service.createModelTraining).toHaveBeenCalledWith(dto);
  });
});
