import { ModelTraining } from './model-training.entity';
export declare class GridSearchParams {
    id: number;
    batches: number[];
    layers: number[];
    maxEpochs: number[];
    nodes: number[];
    rates: number[];
    modelTraining: ModelTraining;
}
