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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTraining = void 0;
const typeorm_1 = require("typeorm");
const pid_entity_1 = require("./pid.entity");
const grid_search_params_entity_1 = require("./grid-search-params.entity");
const schedule_entity_1 = require("./schedule.entity");
const load_condition_entity_1 = require("./load-condition.entity");
const ml_model_entity_1 = require("./ml-model.entity");
const class_validator_1 = require("class-validator");
let ModelTraining = class ModelTraining {
};
exports.ModelTraining = ModelTraining;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ModelTraining.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "powerPlant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "analog", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "digital", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "monitor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ModelTraining.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "layers", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "nodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "batches", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ModelTraining.prototype, "maxEpochs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pid_entity_1.PID, pid => pid.modelTraining, { cascade: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "pids", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => grid_search_params_entity_1.GridSearchParams, grid => grid.modelTraining, { cascade: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "gridSearchParams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, schedule => schedule.modelTraining, { cascade: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => load_condition_entity_1.LoadCondition, loadCondition => loadCondition.modelTraining, { cascade: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "loadConditions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ml_model_entity_1.MlModel, mlModel => mlModel.modelTrainings),
    __metadata("design:type", ml_model_entity_1.MlModel)
], ModelTraining.prototype, "mlModel", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "monitorAlarmTags", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], ModelTraining.prototype, "sensorAlarmConditions", void 0);
exports.ModelTraining = ModelTraining = __decorate([
    (0, typeorm_1.Entity)('model_training')
], ModelTraining);
//# sourceMappingURL=model-training.entity.js.map