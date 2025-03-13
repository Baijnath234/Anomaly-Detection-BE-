import { ModelTraining } from './model-training.entity';
export declare class PID {
    id: number;
    type?: string;
    trainCount: number;
    trainMean: number;
    trainStd: number;
    trainMin: number;
    trainMax: number;
    train25Perc: number;
    train50Perc: number;
    train75Perc: number;
    isOutput: boolean;
    isMonitor: boolean;
    included: boolean;
    modelTraining: ModelTraining;
}
