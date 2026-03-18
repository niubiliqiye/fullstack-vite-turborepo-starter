export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface NormalizedLog {
  appName: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  serverReceiveTime: string;
  module?: string;
  traceId?: string;
  userId?: string;
  deviceId?: string;
  page?: string;
  ip?: string;
  ua?: string;
  extra?: Record<string, any>;
}

export interface StorageAdapter {
  save(log: NormalizedLog): Promise<void>;
  saveBatch(logs: NormalizedLog[]): Promise<void>;
}
