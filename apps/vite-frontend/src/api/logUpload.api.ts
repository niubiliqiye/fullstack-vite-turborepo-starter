import {type UploadLogDto} from 'log-uploader';
import type {ApiResponse} from 'log-uploader/src/common/response';
import {axiosInstance} from '@/lib/axios';

export async function uploadLogApi(log: UploadLogDto): Promise<ApiResponse> {
  const {data} = await axiosInstance.post<ApiResponse>('/internal/logs/upload', log, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_LOG_UPLOAD_TOKEN}`,
    },
  });
  return data;
}
