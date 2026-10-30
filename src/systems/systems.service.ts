import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System } from './entities/system.entity';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SystemsService {
  constructor(
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
  ) {}

  async create(dto: CreateSystemDto): Promise<System> {
    const system = this.systemRepository.create(dto);
    return this.systemRepository.save(system);
  }

  async findAll(pagination?: PaginationDto): Promise<{ items: System[]; total: number }> {
    const take = pagination?.limit ?? 20;
    const skip = pagination?.skip ?? 0;

    const [items, total] = await this.systemRepository.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findOne(id: string): Promise<System> {
    const system = await this.systemRepository.findOne({
      where: { id },
      relations: ['datasets', 'trainedModels'],
    });
    if (!system) {
      throw new NotFoundException(`System with ID '${id}' not found.`);
    }
    return system;
  }

  async update(id: string, dto: UpdateSystemDto): Promise<System> {
    const system = await this.findOne(id);
    Object.assign(system, dto);
    return this.systemRepository.save(system);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const system = await this.findOne(id);
    await this.systemRepository.remove(system);
    return { success: true, message: `System '${id}' deleted successfully.` };
  }
}

