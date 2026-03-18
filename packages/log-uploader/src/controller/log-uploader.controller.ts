import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from 'express';
import {LogUploadAuthGuard} from '../guards/log-upload-auth.guard';
import {UploadLogBatchDto} from '../dto/upload-log-batch.dto';
import {UploadLogDto} from '../dto/upload-log.dto';
import {LogUploaderService} from '../services/log-uploader.service';

@Controller('internal/logs')
@UseGuards(LogUploadAuthGuard)
export class LogUploaderController {
  constructor(private readonly logUploaderService: LogUploaderService) {}

  @Post('upload')
  async upload(@Body() dto: UploadLogDto, @Req() request: Request) {
    await this.logUploaderService.upload(dto, request);
    return {
      code: 0,
      message: 'ok',
      data: null,
    };
  }

  @Post('batch')
  async batch(@Body() dto: UploadLogBatchDto, @Req() request: Request) {
    await this.logUploaderService.uploadBatch(dto.logs, request);
    return {
      code: 0,
      message: 'ok',
      data: {
        count: dto.logs.length,
      },
    };
  }
}
