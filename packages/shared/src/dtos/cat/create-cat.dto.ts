import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsInt, IsPositive} from 'class-validator';

export class CreateCatDto {
  @ApiProperty({example: 'Whiskers'})
  @IsString()
  name!: string;

  @ApiProperty({example: 3})
  @IsInt()
  @IsPositive()
  age!: number;

  @ApiProperty({example: 'Siamese'})
  @IsString()
  variety!: string;
}
