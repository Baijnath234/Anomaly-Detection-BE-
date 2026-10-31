import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

// Core domain modules
import { SystemsModule } from './systems/systems.module';
import { DatasetsModule } from './datasets/datasets.module';
import { DetectionModule } from './detection/detection.module';
import { RulModule } from './rul/rul.module';
import { RepairModule } from './repair/repair.module';
import { LiveModule } from './live/live.module';
import { ReportsModule } from './reports/reports.module';
import { JobsModule } from './jobs/jobs.module';

// Electrical Smart Monitoring & Automation Modules (Task 3 & Task 6)
import { TopologyModule } from './topology/topology.module';
import { IoTModule } from './iot/iot.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { ElectricalFaultsModule } from './electrical-faults/electrical-faults.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AutomationModule } from './automation/automation.module';

// Existing user / auth modules
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as path from 'path';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../.env'),
        '.env',
        '.env.local',
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'postgres'),
        password: String(config.get<string>('database.password', 'root')),
        database: config.get<string>('database.database', 'anomaly_detection'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    SystemsModule,
    DatasetsModule,
    DetectionModule,
    RulModule,
    RepairModule,
    LiveModule,
    ReportsModule,
    JobsModule,
    UserModule,
    AuthModule,
    TopologyModule,
    IoTModule,
    TelemetryModule,
    ElectricalFaultsModule,
    MaintenanceModule,
    AutomationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
