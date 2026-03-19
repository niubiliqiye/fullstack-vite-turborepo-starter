import {Type} from 'class-transformer';
import {IsInt, IsOptional, Max, Min} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class QueryLogStatsDto {
  @ApiPropertyOptional({
    description: '仅统计最近 N 天日志文件，最小 1，最大 30，默认 7',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  days?: number = 7;
}
