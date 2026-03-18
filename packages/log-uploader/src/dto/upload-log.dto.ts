import {IsIn, IsISO8601, IsObject, IsOptional, IsString, MaxLength} from 'class-validator';
import {LogLevel} from '../common/interfaces';

export class UploadLogDto {
  @IsIn(['debug', 'info', 'warn', 'error'], {
    message: 'level must be one of debug/info/warn/error',
  })
  level!: LogLevel;

  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  traceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  page?: string;

  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
