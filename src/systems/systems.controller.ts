import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SystemsService } from './systems.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { System } from './entities/system.entity';

@ApiTags('Systems')
@Controller('api/systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new monitored equipment/system' })
  @ApiResponse({ status: 201, description: 'System registered successfully', type: System })
  create(@Body() createSystemDto: CreateSystemDto) {
    return this.systemsService.create(createSystemDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered monitored systems' })
  @ApiResponse({ status: 200, description: 'List of systems' })
  findAll(@Query() pagination: PaginationDto) {
    return this.systemsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a monitored system by UUID' })
  @ApiParam({ name: 'id', type: 'string', description: 'System UUID' })
  @ApiResponse({ status: 200, description: 'System details', type: System })
  @ApiResponse({ status: 404, description: 'System not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update system metadata' })
  @ApiParam({ name: 'id', type: 'string', description: 'System UUID' })
  @ApiResponse({ status: 200, description: 'System updated', type: System })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemDto: UpdateSystemDto,
  ) {
    return this.systemsService.update(id, updateSystemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a monitored system and its associated datasets' })
  @ApiParam({ name: 'id', type: 'string', description: 'System UUID' })
  @ApiResponse({ status: 200, description: 'System deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemsService.remove(id);
  }
}

