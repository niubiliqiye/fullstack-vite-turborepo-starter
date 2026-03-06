import {Controller, Get, Post, Body, Patch, Delete, UseGuards} from '@nestjs/common';
import {CreateCatDto, UpdateCatDto, CatDto} from 'shared';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {CatsService} from './cats.service';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post('create-cat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({summary: 'Create a new cat'})
  @ApiResponse({status: 201, type: CatDto})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async create(@Body() createCatDto: CreateCatDto): Promise<CatDto> {
    return this.catsService.create(createCatDto);
  }

  @Get('all-cats')
  @ApiOperation({summary: 'Get all cats'})
  @ApiResponse({status: 200, type: CatDto, isArray: true})
  async findAll(): Promise<CatDto[]> {
    return this.catsService.findAll();
  }

  @Get('getCatById')
  @ApiOperation({summary: 'Get a cat by ID'})
  @ApiResponse({status: 200, type: CatDto})
  @ApiResponse({status: 404, description: 'Cat not found'})
  async findOne(@Body('id') id: number): Promise<CatDto | undefined> {
    return this.catsService.findOne(id);
  }

  @Patch('updateCatById')
  @ApiOperation({summary: 'Update a cat by ID'})
  @ApiResponse({status: 200, type: CatDto})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 404, description: 'Cat not found'})
  async update(@Body() updateCatDto: UpdateCatDto): Promise<CatDto> {
    return this.catsService.update(updateCatDto);
  }

  @Delete('deleteCatById')
  @ApiOperation({summary: 'Delete a cat by ID'})
  @ApiResponse({status: 200, type: CatDto})
  @ApiResponse({status: 404, description: 'Cat not found'})
  async remove(@Body('id') id: number): Promise<CatDto> {
    return this.catsService.remove(id);
  }
}
