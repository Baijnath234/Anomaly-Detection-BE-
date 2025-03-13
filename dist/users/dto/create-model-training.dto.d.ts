declare class PIDDto {
    type: string;
    deletedAt?: string | null;
    trainCount: number;
    trainMean: number;
    trainStd: number;
    trainMin: number;
    trainMax: number;
    train25Perc: number;
    train50Perc: number;
    train75Perc: number;
    isOutput?: boolean;
    isMonitor?: boolean;
    included?: boolean;
}
declare class GridSearchParamsDto {
    batches: number[];
    layers: number[];
    maxEpochs: number[];
    nodes: number[];
    rates: number[];
}
declare class ScheduleDto {
    startDate: string;
    endDate: string;
    PIDs: string[];
    timePeriods: SchedulePeriodDto[];
}
declare class SchedulePeriodDto {
    start: string;
    end: string;
}
declare class LoadConditionDto {
    conditions: LoadConditionEntryDto[];
}
declare class LoadConditionEntryDto {
    pid: string;
    lower: string;
    upper: string;
    loadId: string;
    isUsed: boolean;
    isLowerEqualityStrict: boolean;
    isUpperEqualityStrict: boolean;
    createdAt: string;
}
declare class MlModelDto {
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
    deployAt?: string;
    stopAt?: string;
    trainedAt?: string;
    equipmentKey?: number;
    deletionInProgress: boolean;
}
export declare class CreateModelTrainingDto {
    branch: string;
    powerPlant: string;
    unit: string;
    model: string;
    analog?: string;
    digital?: string;
    monitor?: string;
    startDate: string;
    endDate: string;
    tags?: string;
    layers?: string;
    nodes?: string;
    batches?: string;
    maxEpochs?: string;
    PIDs: PIDDto[];
    grid: GridSearchParamsDto;
    schedule: ScheduleDto;
    loadCondition: LoadConditionDto;
    mlModel: MlModelDto;
    monitorAlarmTags?: string[];
    sensorAlarmConditions?: string[];
}
export {};
