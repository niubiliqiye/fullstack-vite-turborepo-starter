import {ModuleMetadata, Type} from '@nestjs/common';
import {StorageAdapter} from '../common/interfaces';

export interface LogUploaderModuleOptions {
  appName: string;
  authToken?: string;
  routePrefix?: string; // 默认 internal/logs
  enableBatch?: boolean;
  maxBatchSize?: number;
  redactFields?: string[];
  storage?: {
    type: 'file' | 'custom';
    baseDir?: string;
    adapter?: StorageAdapter;
  };
}

export interface LogUploaderModuleOptionsFactory {
  createLogUploaderOptions: (() => Promise<LogUploaderModuleOptions>) | (() => LogUploaderModuleOptions);
}

export interface LogUploaderModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LogUploaderModuleOptionsFactory>;
  useClass?: Type<LogUploaderModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<LogUploaderModuleOptions> | LogUploaderModuleOptions;
  inject?: any[];
}
