import {Inject, Injectable, Logger} from '@nestjs/common';
import {Request} from 'express';
import {LOG_STORAGE_ADAPTER, LOG_UPLOADER_OPTIONS} from '../common/constants';
import {NormalizedLog, StorageAdapter} from '../common/interfaces';
import {deepRedact} from '../common/utils';
import {LogUploaderModuleOptions} from '../config/log-uploader.options';
import {UploadLogDto} from '../dto/upload-log.dto';

@Injectable()
export class LogUploaderService {
  private readonly logger = new Logger(LogUploaderService.name);

  constructor(
    @Inject(LOG_UPLOADER_OPTIONS)
    private readonly options: LogUploaderModuleOptions,
    @Inject(LOG_STORAGE_ADAPTER)
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async upload(dto: UploadLogDto, request?: Request): Promise<void> {
    const normalized = this.normalize(dto, request);
    await this.storageAdapter.save(normalized);
  }

  async uploadBatch(dtos: UploadLogDto[], request?: Request): Promise<void> {
    const maxBatchSize = this.options.maxBatchSize ?? 200;

    if (dtos.length > maxBatchSize) {
      throw new Error(`Batch size exceeds limit: ${maxBatchSize}`);
    }

    const normalizedLogs = dtos.map((item) => this.normalize(item, request));
    await this.storageAdapter.saveBatch(normalizedLogs);
  }

  private normalize(dto: UploadLogDto, request?: Request): NormalizedLog {
    const redactFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'phone',
      'idCard',
      ...(this.options.redactFields ?? []),
    ];

    return {
      appName: this.options.appName,
      level: dto.level,
      message: dto.message,
      timestamp: dto.timestamp ?? new Date().toISOString(),
      serverReceiveTime: new Date().toISOString(),
      module: dto.module,
      traceId: dto.traceId,
      userId: dto.userId,
      deviceId: dto.deviceId,
      page: dto.page,
      ip: this.getIp(request),
      ua: request?.headers?.['user-agent'],
      extra: deepRedact(dto.extra, redactFields),
    };
  }

  private getIp(request?: Request): string | undefined {
    if (!request) return undefined;

    const forwardedFor = request.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0]?.trim();
    }

    return request.socket?.remoteAddress;
  }
}
