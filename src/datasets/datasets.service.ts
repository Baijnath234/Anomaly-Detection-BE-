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
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('A valid non-empty CSV file is required.');
    }

    // Resolve or auto-provision target System
    let system: System | null = null;
    if (dto.systemId) {
      try {
        system = await this.systemRepository.findOne({
          where: { id: dto.systemId },
        });
      } catch (err) {
        // In case systemId is not a valid UUID format
        system = null;
      }
    }

    if (!system) {
      const existing = await this.systemRepository.find({ take: 1 });
      if (existing.length > 0) {
        system = existing[0];
      } else {
        system = await this.systemRepository.save(
          this.systemRepository.create({
            name: 'Default Monitored Equipment',
            type: 'Industrial Asset',
          }),
        );
      }
    }

    // Strip UTF-8 BOM if present
    let rawContent = file.buffer.toString('utf-8');
    if (rawContent.charCodeAt(0) === 0xfeff) {
      rawContent = rawContent.slice(1);
    }

    let records: Record<string, any>[];
    try {
      records = parse(rawContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new BadRequestException(`Failed to parse CSV file: ${err.message}`);
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('CSV file is empty or contains only header row.');
    }

    const allHeaders = Object.keys(records[0]).map((h) => h.trim());

    // 1. Identify timestamp column
    let timeCol: string | undefined;
    if (dto.timestampColumn) {
      const requested = dto.timestampColumn.trim().toLowerCase();
      timeCol = allHeaders.find((h) => h.toLowerCase() === requested);
    }

    if (!timeCol) {
      const candidates = ['timestamp', 'time', 'datetime', 'date', 'ts', 'epoch', 'step', 'index'];
      timeCol = allHeaders.find((h) =>
        candidates.some((c) => h.toLowerCase().includes(c)),
      );
    }

    // Fallback: use first column if candidate not found
    if (!timeCol) {
      timeCol = allHeaders[0];
    }

    // 2. Identify numeric sensor columns across sample rows
    const sampleRows = records.slice(0, 25);
    const numericCols = allHeaders.filter((h) => {
      if (h === timeCol) return false;
      return sampleRows.some((r) => {
        const val = parseFloat(r[h]);
        return !Number.isNaN(val) && Number.isFinite(val);
      });
    });

    if (numericCols.length === 0) {
      throw new BadRequestException(
        `At least one numeric sensor column is required. Detected columns: [${allHeaders.join(', ')}]`,
      );
    }

    const datasetName =
      (dto.name && dto.name.trim()) ||
      file.originalname.replace(/\.[^/.]+$/, '') ||
      'Uploaded Dataset';

    // Create Dataset entity
    const dataset = this.datasetRepository.create({
      systemId: system.id,
      name: datasetName,
      columns: allHeaders,
      rowCount: records.length,
    });
    const savedDataset = await this.datasetRepository.save(dataset);

    // Batch insert MetricRow entities
    const BATCH_SIZE = 500;
    const rowsToInsert: Array<{
      datasetId: string;
      timestamp: Date;
      values: Record<string, number>;
    }> = [];

    const nowBase = Date.now() - records.length * 60 * 1000;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rawTime = record[timeCol];
      const parsedDate = new Date(rawTime);
      const timestamp =
        rawTime && !isNaN(parsedDate.getTime())
          ? parsedDate
          : new Date(nowBase + i * 60 * 1000); // 1-minute fallback interval

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
    const timestampCol =
      dataset.columns.find((c) =>
        ['timestamp', 'time', 'datetime', 'date'].includes(c.toLowerCase()),
      ) || dataset.columns[0] || 'timestamp';

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
