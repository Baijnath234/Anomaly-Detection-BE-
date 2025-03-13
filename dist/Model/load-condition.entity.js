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
exports.LoadCondition = void 0;
const typeorm_1 = require("typeorm");
const model_training_entity_1 = require("./model-training.entity");
let LoadCondition = class LoadCondition {
};
exports.LoadCondition = LoadCondition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LoadCondition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoadCondition.prototype, "pid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoadCondition.prototype, "lower", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoadCondition.prototype, "upper", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoadCondition.prototype, "loadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], LoadCondition.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], LoadCondition.prototype, "isLowerEqualityStrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], LoadCondition.prototype, "isUpperEqualityStrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoadCondition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => model_training_entity_1.ModelTraining, (modelTraining) => modelTraining.loadConditions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'modelTrainingId' }),
    __metadata("design:type", model_training_entity_1.ModelTraining)
], LoadCondition.prototype, "modelTraining", void 0);
exports.LoadCondition = LoadCondition = __decorate([
    (0, typeorm_1.Entity)()
], LoadCondition);
//# sourceMappingURL=load-condition.entity.js.map