import { Controller, Post, Body, Get, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { CreateModelTrainingDto } from '../users/dto/create-model-training.dto';
import { ModelTrainingService } from './model-training.service';

@Controller('model-training')
export class ModelTrainingController {
  constructor(private readonly modelTrainingService: ModelTrainingService) { }

  @Post()
  async createModelTraining(@Body() createModelTrainingDto: CreateModelTrainingDto) {
    console.log('Received DTO:', JSON.stringify(createModelTrainingDto, null, 2));
    return await this.modelTrainingService.createModelTraining(createModelTrainingDto);
  }

  @Get()
  async getAllModelTrainings() {
    const data = await this.modelTrainingService.getAllModelTrainings();
    return data.map((item) => (item)); 
  }

  @Get(':id')
  async getModelTrainingById(@Param('id') id: number) {
    return this.modelTrainingService.getModelTrainingById(id);
  }

  @Delete(':id')
  async deleteModelTraining(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid ID provided', HttpStatus.BAD_REQUEST);
    }
    const result = await this.modelTrainingService.deleteModelTraining(parsedId);
    if (!result) {
      throw new HttpException('ModelTraining not found', HttpStatus.NOT_FOUND);
    }
    return { message: `ModelTraining with ID ${parsedId} deleted successfully` };
  }

  @Post('train')
  async trainModel() {
    console.log('Hello World'); // Prints "Hello World" in the server console
    return { message: 'Hello World printed successfully!' }; // Response for the client
  }
}
