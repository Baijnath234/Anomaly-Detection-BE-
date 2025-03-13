import { ModelTraining } from './model-training.entity';
export declare class MlModel {
    key: number;
    uuid: string;
    name: string;
    nameJp: string;
    description: string;
    version: string;
    plant: string;
    unit: string;
    branch: string;
    createdAt: string;
    status: string;
    isNewest: boolean;
    isStopped: boolean;
    isCountReset: boolean;
    specialKey: number;
    specialUuid: string;
    deployAt: string;
    stopAt: string;
    trainedAt: string;
    equipmentKey: number;
    deletionInProgress: boolean;
    modelTrainings: ModelTraining[];
}
