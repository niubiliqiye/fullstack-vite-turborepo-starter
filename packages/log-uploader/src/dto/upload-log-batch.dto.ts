import {Type} from 'class-transformer';
import {ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested} from 'class-validator';
import {UploadLogDto} from './upload-log.dto';

export class UploadLogBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({each: true})
  @Type(() => UploadLogDto)
  logs!: UploadLogDto[];
}
