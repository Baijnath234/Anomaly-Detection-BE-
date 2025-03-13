"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTrainingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const model_training_entity_1 = require("./model-training.entity");
const pid_entity_1 = require("./pid.entity");
const grid_search_params_entity_1 = require("./grid-search-params.entity");
const load_condition_entity_1 = require("./load-condition.entity");
let ModelTrainingService = class ModelTrainingService {
    constructor(modelTrainingRepository, pidRepository, gridSearchParamsRepository, loadConditionParamsRepository) {
        this.modelTrainingRepository = modelTrainingRepository;
        this.pidRepository = pidRepository;
        this.gridSearchParamsRepository = gridSearchParamsRepository;
        this.loadConditionParamsRepository = loadConditionParamsRepository;
    }
    async createModelTraining(createModelTrainingDto) {
        const queryRunner = this.modelTrainingRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const modelTraining = this.modelTrainingRepository.create({
                branch: createModelTrainingDto.branch,
                powerPlant: createModelTrainingDto.powerPlant,
                unit: createModelTrainingDto.unit,
                model: createModelTrainingDto.model,
                startDate: createModelTrainingDto.startDate,
                endDate: createModelTrainingDto.endDate,
                tags: createModelTrainingDto.tags,
                layers: createModelTrainingDto.layers,
                nodes: createModelTrainingDto.nodes,
                batches: createModelTrainingDto.batches,
                maxEpochs: createModelTrainingDto.maxEpochs,
            });
            const savedModelTraining = await queryRunner.manager.save(modelTraining);
            const pidEntities = createModelTrainingDto.PIDs.map(pidDto => this.pidRepository.create({
                type: pidDto.type,
                trainCount: pidDto.trainCount,
                trainMean: pidDto.trainMean,
                trainStd: pidDto.trainStd,
                trainMin: pidDto.trainMin,
                trainMax: pidDto.trainMax,
                train25Perc: pidDto.train25Perc,
                train50Perc: pidDto.train50Perc,
                train75Perc: pidDto.train75Perc,
                isOutput: pidDto.isOutput,
                isMonitor: pidDto.isMonitor,
                included: pidDto.included,
                modelTraining: savedModelTraining,
            }));
            await queryRunner.manager.save(pid_entity_1.PID, pidEntities);
            const gridEntities = createModelTrainingDto.grid.batches.map(batch => this.gridSearchParamsRepository.create({
                batches: [batch],
                layers: createModelTrainingDto.grid.layers,
                maxEpochs: createModelTrainingDto.grid.maxEpochs,
                nodes: createModelTrainingDto.grid.nodes,
                rates: createModelTrainingDto.grid.rates,
                modelTraining: savedModelTraining,
            }));
            await queryRunner.manager.save(grid_search_params_entity_1.GridSearchParams, gridEntities);
            const loadConditionEntities = createModelTrainingDto.loadCondition.conditions.map(condition => this.loadConditionParamsRepository.create({
                ...condition,
                modelTraining: savedModelTraining,
            }));
            await queryRunner.manager.save(load_condition_entity_1.LoadCondition, loadConditionEntities);
            await queryRunner.commitTransaction();
            const result = await this.modelTrainingRepository.findOne({
                where: { id: savedModelTraining.id },
                relations: ['pids', 'gridSearchParams', 'loadConditions'],
            });
            return {
                message: 'Model training request received successfully',
                data: result,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllModelTrainings() {
        return await this.modelTrainingRepository.find({
            relations: ['pids', 'gridSearchParams', 'loadConditions'],
        });
    }
    async getModelTrainingById(id) {
        return await this.modelTrainingRepository.findOne({
            where: { id },
            relations: ['pids', 'gridSearchParams', 'loadConditions'],
        });
    }
    async deleteModelTraining(id) {
        console.clear();
        console.log(id, "idsssss");
        const queryRunner = this.modelTrainingRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(load_condition_entity_1.LoadCondition, { modelTraining: { id } });
            await queryRunner.manager.delete(pid_entity_1.PID, { modelTraining: { id } });
            await queryRunner.manager.delete(model_training_entity_1.ModelTraining, { id });
            await queryRunner.commitTransaction();
            return { message: `ModelTraining with ID ${id} deleted successfully` };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Failed to delete ModelTraining with ID ${id}: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ModelTrainingService = ModelTrainingService;
exports.ModelTrainingService = ModelTrainingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(model_training_entity_1.ModelTraining)),
    __param(1, (0, typeorm_1.InjectRepository)(pid_entity_1.PID)),
    __param(2, (0, typeorm_1.InjectRepository)(grid_search_params_entity_1.GridSearchParams)),
    __param(3, (0, typeorm_1.InjectRepository)(load_condition_entity_1.LoadCondition)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ModelTrainingService);
//# sourceMappingURL=model-training.service.js.map