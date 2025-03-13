import { PID } from './pid.entity';
import { GridSearchParams } from './grid-search-params.entity';
import { Schedule } from './schedule.entity';
import { LoadCondition } from './load-condition.entity';
import { MlModel } from './ml-model.entity';
export declare class ModelTraining {
    id: number;
    branch?: string;
    powerPlant: string;
    unit: string;
    model: string;
    analog?: string;
    digital?: string;
    monitor?: string;
    startDate?: Date;
    endDate: string;
    tags?: string;
    layers?: string;
    nodes?: string;
    batches?: string;
    maxEpochs?: string;
    pids: PID[];
    gridSearchParams: GridSearchParams[];
    schedules: Schedule[];
    loadConditions: LoadCondition[];
    mlModel: MlModel;
    monitorAlarmTags?: string[];
    sensorAlarmConditions?: string[];
}
