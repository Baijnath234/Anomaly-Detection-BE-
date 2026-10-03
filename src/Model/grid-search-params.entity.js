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
exports.GridSearchParams = void 0;
var typeorm_1 = require("typeorm");
var model_training_entity_1 = require("./model-training.entity");
var GridSearchParams = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _batches_decorators;
    var _batches_initializers = [];
    var _batches_extraInitializers = [];
    var _layers_decorators;
    var _layers_initializers = [];
    var _layers_extraInitializers = [];
    var _maxEpochs_decorators;
    var _maxEpochs_initializers = [];
    var _maxEpochs_extraInitializers = [];
    var _nodes_decorators;
    var _nodes_initializers = [];
    var _nodes_extraInitializers = [];
    var _rates_decorators;
    var _rates_initializers = [];
    var _rates_extraInitializers = [];
    var _modelTraining_decorators;
    var _modelTraining_initializers = [];
    var _modelTraining_extraInitializers = [];
    var GridSearchParams = _classThis = /** @class */ (function () {
        function GridSearchParams_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.batches = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _batches_initializers, void 0));
            this.layers = (__runInitializers(this, _batches_extraInitializers), __runInitializers(this, _layers_initializers, void 0));
            this.maxEpochs = (__runInitializers(this, _layers_extraInitializers), __runInitializers(this, _maxEpochs_initializers, void 0));
            this.nodes = (__runInitializers(this, _maxEpochs_extraInitializers), __runInitializers(this, _nodes_initializers, void 0));
            this.rates = (__runInitializers(this, _nodes_extraInitializers), __runInitializers(this, _rates_initializers, void 0));
            this.modelTraining = (__runInitializers(this, _rates_extraInitializers), __runInitializers(this, _modelTraining_initializers, void 0));
            __runInitializers(this, _modelTraining_extraInitializers);
        }
        return GridSearchParams_1;
    }());
    __setFunctionName(_classThis, "GridSearchParams");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _batches_decorators = [(0, typeorm_1.Column)("int", { array: true, nullable: true })];
        _layers_decorators = [(0, typeorm_1.Column)("int", { array: true, nullable: true })];
        _maxEpochs_decorators = [(0, typeorm_1.Column)("int", { array: true, nullable: true })];
        _nodes_decorators = [(0, typeorm_1.Column)("int", { array: true, nullable: true })];
        _rates_decorators = [(0, typeorm_1.Column)('float8', { array: true })];
        _modelTraining_decorators = [(0, typeorm_1.ManyToOne)(function () { return model_training_entity_1.ModelTraining; }, function (modelTraining) { return modelTraining.gridSearchParams; }, {
                onDelete: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)({ name: 'modelTrainingId', referencedColumnName: 'id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _batches_decorators, { kind: "field", name: "batches", static: false, private: false, access: { has: function (obj) { return "batches" in obj; }, get: function (obj) { return obj.batches; }, set: function (obj, value) { obj.batches = value; } }, metadata: _metadata }, _batches_initializers, _batches_extraInitializers);
        __esDecorate(null, null, _layers_decorators, { kind: "field", name: "layers", static: false, private: false, access: { has: function (obj) { return "layers" in obj; }, get: function (obj) { return obj.layers; }, set: function (obj, value) { obj.layers = value; } }, metadata: _metadata }, _layers_initializers, _layers_extraInitializers);
        __esDecorate(null, null, _maxEpochs_decorators, { kind: "field", name: "maxEpochs", static: false, private: false, access: { has: function (obj) { return "maxEpochs" in obj; }, get: function (obj) { return obj.maxEpochs; }, set: function (obj, value) { obj.maxEpochs = value; } }, metadata: _metadata }, _maxEpochs_initializers, _maxEpochs_extraInitializers);
        __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: function (obj) { return "nodes" in obj; }, get: function (obj) { return obj.nodes; }, set: function (obj, value) { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
        __esDecorate(null, null, _rates_decorators, { kind: "field", name: "rates", static: false, private: false, access: { has: function (obj) { return "rates" in obj; }, get: function (obj) { return obj.rates; }, set: function (obj, value) { obj.rates = value; } }, metadata: _metadata }, _rates_initializers, _rates_extraInitializers);
        __esDecorate(null, null, _modelTraining_decorators, { kind: "field", name: "modelTraining", static: false, private: false, access: { has: function (obj) { return "modelTraining" in obj; }, get: function (obj) { return obj.modelTraining; }, set: function (obj, value) { obj.modelTraining = value; } }, metadata: _metadata }, _modelTraining_initializers, _modelTraining_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GridSearchParams = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GridSearchParams = _classThis;
}();
exports.GridSearchParams = GridSearchParams;
