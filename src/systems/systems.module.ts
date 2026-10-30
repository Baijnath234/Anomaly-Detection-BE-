import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from './entities/system.entity';
import { SystemsService } from './systems.service';
import { SystemsController } from './systems.controller';

@Module({
  imports: [TypeOrmModule.forFeature([System])],
  controllers: [SystemsController],
  providers: [SystemsService],
  exports: [SystemsService],
})
export class SystemsModule {}

