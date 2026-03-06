import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsString, IsInt, IsPositive} from 'class-validator';

export class UpdateCatDto {
  @ApiProperty({example: 1})
  @IsInt()
  @IsPositive()
  id!: number;

  @ApiPropertyOptional({example: 'Whiskers'})
  @IsString()
  name?: string;

  @ApiPropertyOptional({example: 3})
  @IsInt()
  @IsPositive()
  age?: number;

  @ApiPropertyOptional({example: 'Siamese'})
  @IsString()
  variety?: string;
}
