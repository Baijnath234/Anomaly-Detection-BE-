"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadCondition = void 0;
var typeorm_1 = require("typeorm");
var model_training_entity_1 = require("./model-training.entity");
var LoadCondition = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _pid_decorators;
    var _pid_initializers = [];
    var _pid_extraInitializers = [];
    var _lower_decorators;
    var _lower_initializers = [];
    var _lower_extraInitializers = [];
    var _upper_decorators;
    var _upper_initializers = [];
    var _upper_extraInitializers = [];
    var _loadId_decorators;
    var _loadId_initializers = [];
    var _loadId_extraInitializers = [];
    var _isUsed_decorators;
    var _isUsed_initializers = [];
    var _isUsed_extraInitializers = [];
    var _isLowerEqualityStrict_decorators;
    var _isLowerEqualityStrict_initializers = [];
    var _isLowerEqualityStrict_extraInitializers = [];
    var _isUpperEqualityStrict_decorators;
    var _isUpperEqualityStrict_initializers = [];
    var _isUpperEqualityStrict_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _modelTraining_decorators;
    var _modelTraining_initializers = [];
    var _modelTraining_extraInitializers = [];
    var LoadCondition = _classThis = /** @class */ (function () {
        function LoadCondition_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.pid = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _pid_initializers, void 0));
            this.lower = (__runInitializers(this, _pid_extraInitializers), __runInitializers(this, _lower_initializers, void 0));
            this.upper = (__runInitializers(this, _lower_extraInitializers), __runInitializers(this, _upper_initializers, void 0));
            this.loadId = (__runInitializers(this, _upper_extraInitializers), __runInitializers(this, _loadId_initializers, void 0));
            this.isUsed = (__runInitializers(this, _loadId_extraInitializers), __runInitializers(this, _isUsed_initializers, void 0));
            this.isLowerEqualityStrict = (__runInitializers(this, _isUsed_extraInitializers), __runInitializers(this, _isLowerEqualityStrict_initializers, void 0));
            this.isUpperEqualityStrict = (__runInitializers(this, _isLowerEqualityStrict_extraInitializers), __runInitializers(this, _isUpperEqualityStrict_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isUpperEqualityStrict_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.modelTraining = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _modelTraining_initializers, void 0));
            __runInitializers(this, _modelTraining_extraInitializers);
        }
        return LoadCondition_1;
    }());
    __setFunctionName(_classThis, "LoadCondition");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _pid_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _lower_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _upper_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _loadId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isUsed_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isLowerEqualityStrict_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isUpperEqualityStrict_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _modelTraining_decorators = [(0, typeorm_1.ManyToOne)(function () { return model_training_entity_1.ModelTraining; }, function (modelTraining) { return modelTraining.loadConditions; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'modelTrainingId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _pid_decorators, { kind: "field", name: "pid", static: false, private: false, access: { has: function (obj) { return "pid" in obj; }, get: function (obj) { return obj.pid; }, set: function (obj, value) { obj.pid = value; } }, metadata: _metadata }, _pid_initializers, _pid_extraInitializers);
        __esDecorate(null, null, _lower_decorators, { kind: "field", name: "lower", static: false, private: false, access: { has: function (obj) { return "lower" in obj; }, get: function (obj) { return obj.lower; }, set: function (obj, value) { obj.lower = value; } }, metadata: _metadata }, _lower_initializers, _lower_extraInitializers);
        __esDecorate(null, null, _upper_decorators, { kind: "field", name: "upper", static: false, private: false, access: { has: function (obj) { return "upper" in obj; }, get: function (obj) { return obj.upper; }, set: function (obj, value) { obj.upper = value; } }, metadata: _metadata }, _upper_initializers, _upper_extraInitializers);
        __esDecorate(null, null, _loadId_decorators, { kind: "field", name: "loadId", static: false, private: false, access: { has: function (obj) { return "loadId" in obj; }, get: function (obj) { return obj.loadId; }, set: function (obj, value) { obj.loadId = value; } }, metadata: _metadata }, _loadId_initializers, _loadId_extraInitializers);
        __esDecorate(null, null, _isUsed_decorators, { kind: "field", name: "isUsed", static: false, private: false, access: { has: function (obj) { return "isUsed" in obj; }, get: function (obj) { return obj.isUsed; }, set: function (obj, value) { obj.isUsed = value; } }, metadata: _metadata }, _isUsed_initializers, _isUsed_extraInitializers);
        __esDecorate(null, null, _isLowerEqualityStrict_decorators, { kind: "field", name: "isLowerEqualityStrict", static: false, private: false, access: { has: function (obj) { return "isLowerEqualityStrict" in obj; }, get: function (obj) { return obj.isLowerEqualityStrict; }, set: function (obj, value) { obj.isLowerEqualityStrict = value; } }, metadata: _metadata }, _isLowerEqualityStrict_initializers, _isLowerEqualityStrict_extraInitializers);
        __esDecorate(null, null, _isUpperEqualityStrict_decorators, { kind: "field", name: "isUpperEqualityStrict", static: false, private: false, access: { has: function (obj) { return "isUpperEqualityStrict" in obj; }, get: function (obj) { return obj.isUpperEqualityStrict; }, set: function (obj, value) { obj.isUpperEqualityStrict = value; } }, metadata: _metadata }, _isUpperEqualityStrict_initializers, _isUpperEqualityStrict_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _modelTraining_decorators, { kind: "field", name: "modelTraining", static: false, private: false, access: { has: function (obj) { return "modelTraining" in obj; }, get: function (obj) { return obj.modelTraining; }, set: function (obj, value) { obj.modelTraining = value; } }, metadata: _metadata }, _modelTraining_initializers, _modelTraining_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoadCondition = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoadCondition = _classThis;
}();
exports.LoadCondition = LoadCondition;
