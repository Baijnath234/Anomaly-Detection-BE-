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
exports.ModelTrainingController = void 0;
const common_1 = require("@nestjs/common");
const create_model_training_dto_1 = require("../users/dto/create-model-training.dto");
const model_training_service_1 = require("./model-training.service");
let ModelTrainingController = class ModelTrainingController {
    constructor(modelTrainingService) {
        this.modelTrainingService = modelTrainingService;
    }
    async createModelTraining(createModelTrainingDto) {
        console.log('Received DTO:', JSON.stringify(createModelTrainingDto, null, 2));
        return await this.modelTrainingService.createModelTraining(createModelTrainingDto);
    }
    async getAllModelTrainings() {
        const data = await this.modelTrainingService.getAllModelTrainings();
        return data.map((item) => (item));
    }
    async getModelTrainingById(id) {
        return this.modelTrainingService.getModelTrainingById(id);
    }
    async deleteModelTraining(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.HttpException('Invalid ID provided', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.modelTrainingService.deleteModelTraining(parsedId);
        if (!result) {
            throw new common_1.HttpException('ModelTraining not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { message: `ModelTraining with ID ${parsedId} deleted successfully` };
    }
    async trainModel() {
        console.log('Hello World');
        return { message: 'Hello World printed successfully!' };
    }
};
exports.ModelTrainingController = ModelTrainingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_model_training_dto_1.CreateModelTrainingDto]),
    __metadata("design:returntype", Promise)
], ModelTrainingController.prototype, "createModelTraining", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelTrainingController.prototype, "getAllModelTrainings", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModelTrainingController.prototype, "getModelTrainingById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModelTrainingController.prototype, "deleteModelTraining", null);
__decorate([
    (0, common_1.Post)('train'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelTrainingController.prototype, "trainModel", null);
exports.ModelTrainingController = ModelTrainingController = __decorate([
    (0, common_1.Controller)('model-training'),
    __metadata("design:paramtypes", [model_training_service_1.ModelTrainingService])
], ModelTrainingController);
//# sourceMappingURL=model-training.controller.js.map