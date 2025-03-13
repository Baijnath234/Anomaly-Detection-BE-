import { Repository } from 'typeorm';
import { ModelTraining } from './model-training.entity';
import { CreateModelTrainingDto } from '../users/dto/create-model-training.dto';
import { PID } from './pid.entity';
import { GridSearchParams } from './grid-search-params.entity';
import { LoadCondition } from './load-condition.entity';
export declare class ModelTrainingService {
    private readonly modelTrainingRepository;
    private readonly pidRepository;
    private readonly gridSearchParamsRepository;
    private readonly loadConditionParamsRepository;
    constructor(modelTrainingRepository: Repository<ModelTraining>, pidRepository: Repository<PID>, gridSearchParamsRepository: Repository<GridSearchParams>, loadConditionParamsRepository: Repository<LoadCondition>);
    createModelTraining(createModelTrainingDto: CreateModelTrainingDto): Promise<{
        message: string;
        data: ModelTraining | null;
    }>;
    getAllModelTrainings(): Promise<ModelTraining[]>;
    getModelTrainingById(id: number): Promise<ModelTraining | null>;
    deleteModelTraining(id: number): Promise<{
        message: string;
    }>;
}
