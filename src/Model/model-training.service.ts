import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelTraining } from './model-training.entity';

@Injectable()
export class ModelTrainingService {
  constructor(
    @InjectRepository(ModelTraining)
    private readonly repository: Repository<ModelTraining>,
  ) {}

  async createModelTraining(dto: any) {
    return this.repository.save(dto);
  }

  async getAllModelTrainings() {
    return this.repository.find({
      relations: {
        pids: true,
        gridSearchParams: true,
        loadConditions: true,
      },
    });
  }

  async getModelTrainingById(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: {
        pids: true,
        gridSearchParams: true,
        loadConditions: true,
      },
    });
  }

  async deleteModelTraining(id: number) {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) return null;
    await this.repository.remove(item);
    return item;
  }
}
