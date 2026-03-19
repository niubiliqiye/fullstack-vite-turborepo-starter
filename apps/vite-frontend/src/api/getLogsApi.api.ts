import {type QueryRecentLogsDto} from 'log-uploader/src/admin/dto/query-recent-logs.dto';
import type {ApiResponse} from 'log-uploader/src/common/response';
import {axiosInstance} from '@/lib/axios';

export async function getLogsApi(query: QueryRecentLogsDto): Promise<ApiResponse> {
  const {data} = await axiosInstance.get<ApiResponse>('/internal/logs/admin/recent', {
    params: query,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_LOG_UPLOAD_TOKEN}`,
    },
  });
  return data;
}
