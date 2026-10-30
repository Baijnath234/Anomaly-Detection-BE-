import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DatasetsService, DatasetPreviewResult } from './datasets.service';
import { UploadDatasetDto } from './dto/upload-dataset.dto';
import { Dataset } from './entities/dataset.entity';

@ApiTags('Datasets')
@Controller('api/datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload CSV time-series sensor dataset',
    description:
      'Uploads a multipart CSV file. The file must include a timestamp column (e.g. timestamp, time, datetime) and at least one numerical sensor column.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'systemId', 'name'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file with sensor metric readings' },
        systemId: { type: 'string', format: 'uuid', description: 'Monitored System UUID' },
        name: { type: 'string', description: 'Friendly dataset name' },
        timestampColumn: { type: 'string', description: 'Optional explicit timestamp header' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Dataset parsed and stored successfully', type: Dataset })
  @ApiResponse({ status: 400, description: 'Invalid CSV format or missing required columns' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.uploadCsv(file, dto);
  }

  @Get(':id/preview')
  @ApiOperation({
    summary: 'Preview dataset schema, detected numeric columns, and initial rows',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Dataset UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Sample rows to return (default: 20)' })
  @ApiResponse({ status: 200, description: 'Dataset preview data' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  getPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ): Promise<DatasetPreviewResult> {
    return this.datasetsService.getPreview(id, limit ? Number(limit) : 20);
  }

  @Get()
  @ApiOperation({ summary: 'List all uploaded datasets' })
  @ApiResponse({ status: 200, description: 'List of datasets', type: [Dataset] })
  findAll(): Promise<Dataset[]> {
    return this.datasetsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dataset metadata by UUID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Dataset UUID' })
  @ApiResponse({ status: 200, description: 'Dataset metadata', type: Dataset })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Dataset> {
    return this.datasetsService.findOne(id);
  }
}

