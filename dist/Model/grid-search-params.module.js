"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridSearchParamsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const grid_search_params_entity_1 = require("./grid-search-params.entity");
let GridSearchParamsModule = class GridSearchParamsModule {
};
exports.GridSearchParamsModule = GridSearchParamsModule;
exports.GridSearchParamsModule = GridSearchParamsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([grid_search_params_entity_1.GridSearchParams])],
        exports: [typeorm_1.TypeOrmModule.forFeature([grid_search_params_entity_1.GridSearchParams])],
    })
], GridSearchParamsModule);
//# sourceMappingURL=grid-search-params.module.js.map