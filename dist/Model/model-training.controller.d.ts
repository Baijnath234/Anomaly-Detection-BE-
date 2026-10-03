import { CreateModelTrainingDto } from '../users/dto/create-model-training.dto';
import { ModelTrainingService } from './model-training.service';
export declare class ModelTrainingController {
    private readonly modelTrainingService;
    constructor(modelTrainingService: ModelTrainingService);
    createModelTraining(createModelTrainingDto: CreateModelTrainingDto): Promise<any>;
    getAllModelTrainings(): Promise<import("./model-training.entity").ModelTraining[]>;
    getModelTrainingById(id: number): Promise<import("./model-training.entity").ModelTraining>;
    deleteModelTraining(id: string): Promise<{
        message: string;
    }>;
    trainModel(): Promise<{
        message: string;
    }>;
}
