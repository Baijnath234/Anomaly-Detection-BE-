import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import 'dotenv/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global exception filter and request logging interceptor
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup at /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Anomaly Detection, RUL & Repair Assistant Platform')
    .setDescription(
      'Industrial IoT Predictive Maintenance API: Real-time multivariate sensor anomaly detection, Remaining Useful Life (RUL) estimation with Weibull/exponential trends, expert repair assistant with grounded Claude explanations, and Socket.io live streaming.',
    )
    .setVersion('1.0')
    .addTag('Systems', 'CRUD operations for monitored equipment and machinery')
    .addTag('Datasets', 'Time-series sensor CSV upload, schema parsing, and preview')
    .addTag('Anomaly Detection & Models', 'Algorithm execution (Z-Score, Isolation Forest, LOF, Autoencoders, Ensemble) & BullMQ training jobs')
    .addTag('Remaining Useful Life (RUL)', 'Health index computation and remaining days estimation with confidence intervals')
    .addTag('Repair Assistant', 'Rule-based diagnostics and Claude AI repair guidance grounded in empirical data')
    .addTag('Reports & Export', 'Downloadable CSV anomaly export and statistical summaries')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  logger.log(`========================================================`);
  logger.log(` Platform API is running on: http://localhost:${port}`);
  logger.log(` Swagger Documentation:       http://localhost:${port}/docs`);
  logger.log(` Live WebSocket Gateway:      ws://localhost:${port}/live`);
  logger.log(`========================================================`);
}

bootstrap();
