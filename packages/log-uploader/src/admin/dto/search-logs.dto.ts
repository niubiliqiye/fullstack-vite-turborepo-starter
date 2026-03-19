import {IsIn, IsISO8601, IsOptional, IsString, MaxLength} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';
import {LogLevel} from '../../common/interfaces';
import {QueryLogPaginationDto} from './query-log-pagination.dto';

export class SearchLogsDto extends QueryLogPaginationDto {
  @ApiPropertyOptional({
    description: '关键词，匹配 message/module/page/traceId/userId/deviceId/extra',
    example: 'timeout',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiPropertyOptional({
    description: '按日志级别过滤',
    enum: ['debug', 'info', 'warn', 'error'],
    example: 'error',
  })
  @IsOptional()
  @IsIn(['debug', 'info', 'warn', 'error'])
  level?: LogLevel;

  @ApiPropertyOptional({
    description: '按 traceId 精确过滤',
    example: 'trace_001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  traceId?: string;

  @ApiPropertyOptional({
    description: '开始时间（ISO 8601）',
    example: '2026-03-19T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @ApiPropertyOptional({
    description: '结束时间（ISO 8601）',
    example: '2026-03-19T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  endTime?: string;
}
