import {type SearchLogsDto} from 'log-uploader/src/admin/dto/search-logs.dto';
import type {ApiResponse} from 'log-uploader/src/common/response';
import {axiosInstance} from '@/lib/axios';

export async function searchLogsApi(query: SearchLogsDto): Promise<ApiResponse> {
  const {data} = await axiosInstance.get<ApiResponse>('/internal/logs/admin/search', {
    params: query,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_LOG_UPLOAD_TOKEN}`,
    },
  });
  return data;
}
