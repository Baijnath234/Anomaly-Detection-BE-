"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTrainingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const model_training_entity_1 = require("./model-training.entity");
const pid_entity_1 = require("./pid.entity");
const grid_search_params_entity_1 = require("./grid-search-params.entity");
const load_condition_entity_1 = require("./load-condition.entity");
const model_training_service_1 = require("./model-training.service");
const model_training_controller_1 = require("./model-training.controller");
let ModelTrainingModule = class ModelTrainingModule {
};
exports.ModelTrainingModule = ModelTrainingModule;
exports.ModelTrainingModule = ModelTrainingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([model_training_entity_1.ModelTraining, pid_entity_1.PID, grid_search_params_entity_1.GridSearchParams, load_condition_entity_1.LoadCondition]),
        ],
        providers: [model_training_service_1.ModelTrainingService],
        controllers: [model_training_controller_1.ModelTrainingController],
    })
], ModelTrainingModule);
//# sourceMappingURL=model-training.module.js.map