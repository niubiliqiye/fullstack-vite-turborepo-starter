import {ApiProperty} from '@nestjs/swagger';

export class CatDto {
  @ApiProperty({example: '1'})
  id!: number;

  @ApiProperty({example: 'Whiskers'})
  name!: string;

  @ApiProperty({example: 3})
  age!: number;

  @ApiProperty({example: 'Siamese'})
  variety!: string;

  @ApiProperty({example: '2026-01-01T00:00:00.000Z'})
  createdAt!: Date;

  @ApiProperty({example: '2026-01-01T00:00:00.000Z'})
  updatedAt!: Date;
}
