import { ModelTraining } from './model-training.entity';
export declare class LoadCondition {
    id: number;
    pid: string;
    lower: string;
    upper: string;
    loadId: string;
    isUsed: boolean;
    isLowerEqualityStrict: boolean;
    isUpperEqualityStrict: boolean;
    createdAt: string;
    modelTraining: ModelTraining;
}
