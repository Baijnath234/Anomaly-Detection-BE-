import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GridSearchParams } from './grid-search-params.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GridSearchParams])],  // Register GridSearchParams entity
  exports: [TypeOrmModule.forFeature([GridSearchParams])],  // Export for other modules to use
})
export class GridSearchParamsModule {}
