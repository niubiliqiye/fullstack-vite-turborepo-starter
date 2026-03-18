import {DynamicModule, Module, Provider} from '@nestjs/common';
import {FileStorageAdapter} from '../adapters/file-storage.adapter';
import {LOG_STORAGE_ADAPTER, LOG_UPLOADER_OPTIONS} from '../common/constants';
import {
  LogUploaderModuleAsyncOptions,
  LogUploaderModuleOptions,
  LogUploaderModuleOptionsFactory,
} from '../config/log-uploader.options';
import {LogUploaderController} from '../controller/log-uploader.controller';
import {LogUploadAuthGuard} from '../guards/log-upload-auth.guard';
import {LogUploaderService} from '../services/log-uploader.service';

@Module({})
export class LogUploaderModule {
  static forRoot(options: LogUploaderModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: LOG_UPLOADER_OPTIONS,
      useValue: this.withDefaultOptions(options),
    };

    const storageProvider: Provider = {
      provide: LOG_STORAGE_ADAPTER,
      useFactory: (resolvedOptions: LogUploaderModuleOptions) => {
        return this.createStorageAdapter(resolvedOptions);
      },
      inject: [LOG_UPLOADER_OPTIONS],
    };

    return {
      module: LogUploaderModule,
      controllers: [LogUploaderController],
      providers: [optionsProvider, storageProvider, LogUploaderService, LogUploadAuthGuard],
      exports: [LogUploaderService, LOG_STORAGE_ADAPTER, LOG_UPLOADER_OPTIONS],
    };
  }

  static forRootAsync(options: LogUploaderModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider = this.createAsyncOptionsProvider(options);

    const storageProvider: Provider = {
      provide: LOG_STORAGE_ADAPTER,
      useFactory: (resolvedOptions: LogUploaderModuleOptions) => {
        return this.createStorageAdapter(resolvedOptions);
      },
      inject: [LOG_UPLOADER_OPTIONS],
    };

    const providers: Provider[] = [asyncOptionsProvider, storageProvider, LogUploaderService, LogUploadAuthGuard];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    return {
      module: LogUploaderModule,
      imports: options.imports ?? [],
      controllers: [LogUploaderController],
      providers,
      exports: [LogUploaderService, LOG_STORAGE_ADAPTER, LOG_UPLOADER_OPTIONS],
    };
  }

  private static createAsyncOptionsProvider(options: LogUploaderModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: LOG_UPLOADER_OPTIONS,
        useFactory: async (...args: any[]) => {
          const result = await options.useFactory!(...args);
          return this.withDefaultOptions(result);
        },
        inject: options.inject ?? [],
      };
    }

    if (options.useExisting) {
      return {
        provide: LOG_UPLOADER_OPTIONS,
        useFactory: async (factory: LogUploaderModuleOptionsFactory) => {
          const result = await factory.createLogUploaderOptions();
          return this.withDefaultOptions(result);
        },
        inject: [options.useExisting],
      };
    }

    if (options.useClass) {
      return {
        provide: LOG_UPLOADER_OPTIONS,
        useFactory: async (factory: LogUploaderModuleOptionsFactory) => {
          const result = await factory.createLogUploaderOptions();
          return this.withDefaultOptions(result);
        },
        inject: [options.useClass],
      };
    }

    throw new Error('Invalid async options: one of useFactory, useExisting, or useClass must be provided');
  }

  private static withDefaultOptions(options: LogUploaderModuleOptions): LogUploaderModuleOptions {
    return {
      enableBatch: true,
      maxBatchSize: 200,
      redactFields: [],
      storage: {
        type: 'file',
        baseDir: './logs',
        ...options.storage,
      },
      ...options,
    };
  }

  private static createStorageAdapter(options: LogUploaderModuleOptions) {
    if (options.storage?.type === 'custom') {
      if (!options.storage.adapter) {
        throw new Error('Custom storage selected but no adapter provided');
      }
      return options.storage.adapter;
    }

    return new FileStorageAdapter(options.appName, options.storage?.baseDir ?? './logs');
  }
}
