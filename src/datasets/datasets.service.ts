import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Dataset } from './entities/dataset.entity';
import { MetricRow } from './entities/metric-row.entity';
import { System } from '../systems/entities/system.entity';
import { UploadDatasetDto } from './dto/upload-dataset.dto';
import { parse } from 'csv-parse/sync';

export interface DatasetPreviewResult {
  id: string;
  systemId: string;
  name: string;
  columns: string[];
  numericColumns: string[];
  timestampColumn: string;
  rowCount: number;
  previewRows: Array<{
    timestamp: string;
    values: Record<string, number>;
  }>;
}

@Injectable()
export class DatasetsService {
  private readonly logger = new Logger(DatasetsService.name);

  constructor(
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(MetricRow)
    private readonly metricRowRepository: Repository<MetricRow>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
    private readonly dataSource: DataSource,
  ) {}

  async uploadCsv(
    file: Express.Multer.File,
    dto: UploadDatasetDto,
  ): Promise<Dataset> {
    if (!file || !file.buffer) {
      throw new BadRequestException('A valid CSV file is required.');
    }

    const system = await this.systemRepository.findOne({
      where: { id: dto.systemId },
    });
    if (!system) {
      throw new NotFoundException(`System with ID '${dto.systemId}' not found.`);
    }

    let records: Record<string, any>[];
    try {
      records = parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new BadRequestException(`Failed to parse CSV file: ${err.message}`);
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('CSV file is empty or contains only headers.');
    }

    const allHeaders = Object.keys(records[0]);

    // Find timestamp column
    let timeCol = dto.timestampColumn;
    if (!timeCol) {
      const candidates = ['timestamp', 'time', 'datetime', 'date', 'ts'];
      timeCol = allHeaders.find((h) => candidates.includes(h.toLowerCase()));
    }

    if (!timeCol || !allHeaders.includes(timeCol)) {
      throw new BadRequestException(
        `Timestamp column '${timeCol || 'timestamp'}' not found in CSV. Detected headers: [${allHeaders.join(', ')}].`,
      );
    }

    // Identify numeric sensor columns
    const numericCols = allHeaders.filter((h) => {
      if (h === timeCol) return false;
      const sampleVal = records[0][h];
      const parsed = parseFloat(sampleVal);
      return !Number.isNaN(parsed) && Number.isFinite(parsed);
    });

    if (numericCols.length === 0) {
      throw new BadRequestException(
        `At least one numeric sensor column is required. Found columns: [${allHeaders.join(', ')}]`,
      );
    }

    // Create Dataset entity
    const dataset = this.datasetRepository.create({
      systemId: dto.systemId,
      name: dto.name,
      columns: allHeaders,
      rowCount: records.length,
    });
    const savedDataset = await this.datasetRepository.save(dataset);

    // Prepare MetricRow entities in batches
    const BATCH_SIZE = 500;
    const rowsToInsert: Array<{
      datasetId: string;
      timestamp: Date;
      values: Record<string, number>;
    }> = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rawTime = record[timeCol];
      const parsedDate = new Date(rawTime);
      const timestamp = !isNaN(parsedDate.getTime())
        ? parsedDate
        : new Date(Date.now() + i * 1000); // Fallback: 1-second intervals if invalid string

      const values: Record<string, number> = {};
      for (const col of numericCols) {
        const parsedNum = parseFloat(record[col]);
        values[col] = Number.isNaN(parsedNum) ? 0 : parsedNum;
      }

      rowsToInsert.push({
        datasetId: savedDataset.id,
        timestamp,
        values,
      });

      if (rowsToInsert.length >= BATCH_SIZE) {
        await this.metricRowRepository.insert(rowsToInsert);
        rowsToInsert.length = 0;
      }
    }

    if (rowsToInsert.length > 0) {
      await this.metricRowRepository.insert(rowsToInsert);
    }

    this.logger.log(
      `Dataset '${savedDataset.name}' uploaded successfully with ${records.length} rows and ${numericCols.length} metrics.`,
    );

    return savedDataset;
  }

  async getPreview(id: string, limit: number = 20): Promise<DatasetPreviewResult> {
    const dataset = await this.datasetRepository.findOne({ where: { id } });
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID '${id}' not found.`);
    }

    const rows = await this.metricRowRepository.find({
      where: { datasetId: id },
      order: { timestamp: 'ASC' },
      take: limit,
    });

    const numericColumns = rows.length > 0 ? Object.keys(rows[0].values) : [];
    const timestampCol = dataset.columns.find((c) =>
      ['timestamp', 'time', 'datetime', 'date'].includes(c.toLowerCase()),
    ) || 'timestamp';

    return {
      id: dataset.id,
      systemId: dataset.systemId,
      name: dataset.name,
      columns: dataset.columns,
      numericColumns,
      timestampColumn: timestampCol,
      rowCount: dataset.rowCount,
      previewRows: rows.map((r) => ({
        timestamp: r.timestamp.toISOString(),
        values: r.values,
      })),
    };
  }

  async findAll(): Promise<Dataset[]> {
    return this.datasetRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Dataset> {
    const dataset = await this.datasetRepository.findOne({
      where: { id },
      relations: ['system'],
    });
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID '${id}' not found.`);
    }
    return dataset;
  }
}

