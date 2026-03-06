import {type CatDto, type CreateCatDto} from 'shared';
import {axiosInstance} from '@/lib/axios';

export async function getCatsApi(): Promise<CatDto> {
  const {data} = await axiosInstance.get<CatDto>('/cats/all-cats');
  return data;
}

export async function createCatApi(cat: CreateCatDto): Promise<CatDto> {
  const {data} = await axiosInstance.post<CatDto>('/cats/create-cat', cat);
  return data;
}
