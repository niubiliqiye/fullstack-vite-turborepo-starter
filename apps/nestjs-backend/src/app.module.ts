import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {PrismaModule} from 'db';
import {LogUploaderCoreModule, LogUploaderAdminModule, LogUploaderHttpModule} from 'log-uploader';
import {CommonModule} from './common/common.module';
import appConfig from './config/app.config';
import validationSchema from './config/validation.schema';
import {HealthModule} from './health/health.module';
import {RedisModule} from './redis/redis.module';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {CatsModule} from './cats/cats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema,
      load: [appConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default-throttler',
          ttl: 60 * 1000,
          limit: 60,
        },
      ],
    }),
    CommonModule,
    HealthModule,
    RedisModule,
    AuthModule,
    UsersModule,
    CatsModule,
    LogUploaderCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appName: configService.get<string>('APP_NAME') ?? 'nestjs-backend',
        authToken: configService.get<string>('LOG_UPLOAD_TOKEN'),
        allowedLevels: ['info', 'warn', 'error'],
        storage: {
          type: 'file',
          baseDir: configService.get<string>('LOG_BASE_DIR') ?? './logs',
          splitByLogType: true,
        },
      }),
    }),
    LogUploaderHttpModule,
    LogUploaderAdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
