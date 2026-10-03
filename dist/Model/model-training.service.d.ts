import { Repository } from 'typeorm';
import { ModelTraining } from './model-training.entity';
export declare class ModelTrainingService {
    private readonly repository;
    constructor(repository: Repository<ModelTraining>);
    createModelTraining(dto: any): Promise<any>;
    getAllModelTrainings(): Promise<ModelTraining[]>;
    getModelTrainingById(id: number): Promise<ModelTraining>;
    deleteModelTraining(id: number): Promise<ModelTraining>;
}
