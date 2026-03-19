import {Logger, ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import {LogUploaderAdminModule, LogUploaderHttpModule} from 'log-uploader';
import {AppModule} from './app.module';
import {AuthModule} from './auth/auth.module';
import {CatsModule} from './cats/cats.module';
import {HttpExceptionFilter} from './common/filters/http-exception/http-exception.filter';
import {Logger as LoggerService} from './common/logger/logger.service';
import {PrismaExceptionFilter} from './common/filters/prisma-exception/prisma-exception.filter';
import {ConfigKey} from './config/config-key.enum';
import {HealthModule} from './health/health.module';
import {UsersModule} from './users/users.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const frontendHost = configService.get<string>(ConfigKey.FRONTEND_HOST) ?? 'http://localhost:3000';
  const enableSwagger = configService.get<boolean>(ConfigKey.ENABLE_SWAGGER) ?? true;
  const port = configService.get<number>(ConfigKey.PORT) ?? 4000;

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: frontendHost,
    credentials: true,
  });

  app.useLogger(new LoggerService());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  if (enableSwagger) {
    const publicSwaggerConfig = new DocumentBuilder()
      .setTitle('Public API')
      .setDescription('Frontend/public API docs')
      .setVersion('1.0')
      .build();

    const adminSwaggerConfig = new DocumentBuilder()
      .setTitle('Admin API')
      .setDescription('Admin/backoffice API docs')
      .setVersion('1.0')
      .build();

    const publicDocument = (): OpenAPIObject =>
      SwaggerModule.createDocument(app, publicSwaggerConfig, {
        include: [AuthModule, UsersModule, CatsModule, HealthModule, LogUploaderHttpModule],
        deepScanRoutes: true,
      });

    const adminDocument = (): OpenAPIObject =>
      SwaggerModule.createDocument(app, adminSwaggerConfig, {
        include: [LogUploaderAdminModule],
        deepScanRoutes: true,
      });

    SwaggerModule.setup('api/docs', app, publicDocument);
    SwaggerModule.setup('admin/docs', app, adminDocument);
  }

  await app.listen(port);

  if (enableSwagger) {
    const logger = new Logger('bootstrap', {timestamp: true});
    logger.log(`Swagger is running on: ${await app.getUrl()}/api/docs`);
    logger.log(`Swagger admin is running on: ${await app.getUrl()}/admin/docs`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
bootstrap();
