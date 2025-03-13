import { ModelTraining } from './model-training.entity';
export declare class Schedule {
    id: number;
    startDate: string;
    endDate: string;
    PIDs: string[];
    modelTraining: ModelTraining;
}
