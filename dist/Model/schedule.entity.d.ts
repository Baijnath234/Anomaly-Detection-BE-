import { ModelTraining } from './model-training.entity';
export declare class Schedule {
    id: number;
    cronExpression?: string;
    description?: string;
    modelTraining: ModelTraining;
}
