import {BadRequestException, Inject, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {promises as fs} from 'fs';
import {join} from 'path';
import {LOG_UPLOADER_OPTIONS} from '../../common/constants';
import {LogLevel, NormalizedLog} from '../../common/interfaces';
import {LogUploaderModuleOptions} from '../../config/log-uploader.options';

interface LogQueryPageResult {
  items: NormalizedLog[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class LogUploaderAdminQueryService {
  private readonly logger = new Logger(LogUploaderAdminQueryService.name);

  constructor(
    @Inject(LOG_UPLOADER_OPTIONS)
    private readonly options: LogUploaderModuleOptions,
  ) {}

  async getRecentLogs(params?: {
    limit?: number;
    level?: LogLevel;
    days?: number;
    cursor?: string;
  }): Promise<LogQueryPageResult> {
    return this.queryLogs(
      {
        limit: params?.limit,
        days: params?.days,
        cursor: params?.cursor,
      },
      (log) => {
        if (params?.level && log.level !== params.level) {
          return false;
        }
        return true;
      },
    );
  }

  async getLogsByTraceId(params: {
    traceId: string;
    limit?: number;
    days?: number;
    cursor?: string;
  }): Promise<LogQueryPageResult> {
    const traceId = params.traceId.trim();
    if (!traceId) {
      throw new BadRequestException('traceId is required');
    }

    return this.queryLogs(
      {
        limit: params.limit,
        days: params.days,
        cursor: params.cursor,
      },
      (log) => log.traceId === traceId,
    );
  }

  async searchLogs(params?: {
    keyword?: string;
    level?: LogLevel;
    traceId?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
    days?: number;
    cursor?: string;
  }): Promise<LogQueryPageResult> {
    const keyword = params?.keyword?.trim().toLowerCase();
    const level = params?.level;
    const traceId = params?.traceId?.trim();
    const startTime = params?.startTime ? new Date(params.startTime).getTime() : undefined;
    const endTime = params?.endTime ? new Date(params.endTime).getTime() : undefined;

    if (startTime !== undefined && endTime !== undefined && startTime > endTime) {
      throw new BadRequestException('startTime cannot be greater than endTime');
    }

    return this.queryLogs(
      {
        limit: params?.limit,
        days: params?.days,
        cursor: params?.cursor,
      },
      (log) => this.matchesFilters(log, {keyword, level, traceId, startTime, endTime}),
    );
  }

  async getLogStats(params?: {days?: number}): Promise<{
    days: number;
    total: number;
    byLevel: Record<LogLevel, number>;
    byDate: Array<{date: string; count: number}>;
  }> {
    const days = this.normalizeDays(params?.days) ?? 7;
    const logFiles = await this.getSortedLogFiles(days);

    try {
      const byLevel: Record<LogLevel, number> = {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
      };

      const byDateMap = new Map<string, number>();
      let total = 0;

      for (const filePath of logFiles) {
        const lines = await this.readLogFileLines(filePath);

        for (const line of lines) {
          const parsed = this.safeParseLog(line);
          if (!parsed) continue;

          total += 1;
          byLevel[parsed.level] += 1;

          const date = this.extractDate(parsed.timestamp);
          if (date) {
            byDateMap.set(date, (byDateMap.get(date) ?? 0) + 1);
          }
        }
      }

      const byDate = Array.from(byDateMap.entries())
        .map(([date, count]) => ({date, count}))
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        days,
        total,
        byLevel,
        byDate,
      };
    } catch (error) {
      this.logger.error('Failed to get log stats', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to get log stats');
    }
  }

  private async queryLogs(
    params: {
      limit?: number;
      days?: number;
      cursor?: string;
    },
    matcher: (log: NormalizedLog) => boolean,
  ): Promise<LogQueryPageResult> {
    const limit = this.normalizeLimit(params.limit);
    const days = this.normalizeDays(params.days);
    const cursorTime = params.cursor ? new Date(params.cursor).getTime() : undefined;
    const logFiles = await this.getSortedLogFiles(days);

    try {
      const collected: NormalizedLog[] = [];
      let hasMore = false;

      for (const filePath of logFiles) {
        if (collected.length > limit) break;

        const lines = await this.readLogFileLines(filePath);

        for (let i = lines.length - 1; i >= 0; i -= 1) {
          const parsed = this.safeParseLog(lines[i]);
          if (!parsed) continue;

          const parsedTime = new Date(parsed.timestamp).getTime();

          if (cursorTime !== undefined && Number.isFinite(parsedTime) && parsedTime >= cursorTime) {
            continue;
          }

          if (!matcher(parsed)) {
            continue;
          }

          collected.push(parsed);

          if (collected.length > limit) {
            hasMore = true;
            break;
          }
        }
      }

      const sorted = this.sortLogsDesc(collected).slice(0, limit);
      const nextCursor = hasMore && sorted.length > 0 ? sorted[sorted.length - 1].timestamp : null;

      return {
        items: sorted,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Failed to query logs', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to query logs');
    }
  }

  private matchesFilters(
    log: NormalizedLog,
    filters: {
      keyword?: string;
      level?: LogLevel;
      traceId?: string;
      startTime?: number;
      endTime?: number;
    },
  ): boolean {
    if (filters.level && log.level !== filters.level) {
      return false;
    }

    if (filters.traceId && log.traceId !== filters.traceId) {
      return false;
    }

    const logTime = new Date(log.timestamp).getTime();

    if (filters.startTime !== undefined && Number.isFinite(logTime) && logTime < filters.startTime) {
      return false;
    }

    if (filters.endTime !== undefined && Number.isFinite(logTime) && logTime > filters.endTime) {
      return false;
    }

    if (filters.keyword) {
      const haystack = this.buildSearchText(log);
      if (!haystack.includes(filters.keyword)) {
        return false;
      }
    }

    return true;
  }

  private buildSearchText(log: NormalizedLog): string {
    return [log.message, log.module, log.page, log.traceId, log.userId, log.deviceId, this.safeStringify(log.extra)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  private safeStringify(value: unknown): string {
    try {
      return value ? JSON.stringify(value) : '';
    } catch {
      return '';
    }
  }

  private async getSortedLogFiles(days?: number): Promise<string[]> {
    const storageType = this.options.storage?.type ?? 'file';

    if (storageType !== 'file') {
      throw new BadRequestException('Admin log query currently supports file storage only');
    }

    const baseDir = this.options.storage?.baseDir ?? './logs';
    const appDir = join(baseDir, this.options.appName);

    try {
      const dirEntries = await fs.readdir(appDir, {withFileTypes: true});

      let fileNames = dirEntries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.log'))
        .map((entry) => entry.name)
        .sort((a, b) => b.localeCompare(a));

      if (days !== undefined) {
        const allowedNames = this.buildRecentLogFileNames(days);
        const allowedSet = new Set(allowedNames);
        fileNames = fileNames.filter((name) => allowedSet.has(name));
      }

      return fileNames.map((name) => join(appDir, name));
    } catch (error) {
      this.logger.error('Failed to read log directory', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to read log directory');
    }
  }

  private buildRecentLogFileNames(days: number): string[] {
    const names: string[] = [];
    const now = new Date();

    for (let i = 0; i < days; i += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      names.push(`${yyyy}-${mm}-${dd}.log`);
    }

    return names;
  }

  private extractDate(timestamp: string): string | null {
    const time = new Date(timestamp).getTime();
    if (!Number.isFinite(time)) {
      return null;
    }

    return timestamp.slice(0, 10);
  }

  private async readLogFileLines(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf8');

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private safeParseLog(line: string): NormalizedLog | null {
    try {
      return JSON.parse(line) as NormalizedLog;
    } catch {
      return null;
    }
  }

  private normalizeLimit(limit?: number): number {
    return Math.min(Math.max(limit ?? 50, 1), 200);
  }

  private normalizeDays(days?: number): number | undefined {
    if (days === undefined) {
      return undefined;
    }

    return Math.min(Math.max(days, 1), 30);
  }

  private sortLogsDesc(logs: NormalizedLog[]): NormalizedLog[] {
    return logs.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return tb - ta;
    });
  }
}
