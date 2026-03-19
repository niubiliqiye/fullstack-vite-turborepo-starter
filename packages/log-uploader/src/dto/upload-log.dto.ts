import {IsIn, IsISO8601, IsObject, IsOptional, IsString, MaxLength} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {LogLevel} from '../common/interfaces';

export class UploadLogDto {
  @ApiProperty({
    example: 'error',
    enum: ['debug', 'info', 'warn', 'error'],
  })
  @IsIn(['debug', 'info', 'warn', 'error'])
  level!: LogLevel;

  @ApiProperty({
    example: 'request failed',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  message!: string;

  @ApiPropertyOptional({
    example: '2026-03-18T08:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  timestamp?: string;

  @ApiPropertyOptional({example: 'frontend'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;

  @ApiPropertyOptional({example: 'trace_001'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  traceId?: string;

  @ApiPropertyOptional({example: 'u_001'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @ApiPropertyOptional({example: 'device_001'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @ApiPropertyOptional({example: '/pages/home/index'})
  @IsOptional()
  @IsString()
  @MaxLength(500)
  page?: string;

  @ApiPropertyOptional({
    example: {
      status: 500,
      reason: 'timeout',
    },
  })
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
