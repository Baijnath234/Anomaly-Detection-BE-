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
exports.GridSearchParams = void 0;
const typeorm_1 = require("typeorm");
const model_training_entity_1 = require("./model-training.entity");
let GridSearchParams = class GridSearchParams {
};
exports.GridSearchParams = GridSearchParams;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GridSearchParams.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], GridSearchParams.prototype, "batches", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], GridSearchParams.prototype, "layers", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], GridSearchParams.prototype, "maxEpochs", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], GridSearchParams.prototype, "nodes", void 0);
__decorate([
    (0, typeorm_1.Column)('float8', { array: true }),
    __metadata("design:type", Array)
], GridSearchParams.prototype, "rates", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => model_training_entity_1.ModelTraining, modelTraining => modelTraining.gridSearchParams, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'modelTrainingId', referencedColumnName: 'id' }),
    __metadata("design:type", model_training_entity_1.ModelTraining)
], GridSearchParams.prototype, "modelTraining", void 0);
exports.GridSearchParams = GridSearchParams = __decorate([
    (0, typeorm_1.Entity)()
], GridSearchParams);
//# sourceMappingURL=grid-search-params.entity.js.map