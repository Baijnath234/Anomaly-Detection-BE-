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

// Existing user / auth modules
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'postgres'),
        password: String(config.get<string>('database.password', 'postgres')),
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
  ],
  controllers: [AppController],
})
export class AppModule {}
