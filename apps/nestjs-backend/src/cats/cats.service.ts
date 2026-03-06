import {Injectable} from '@nestjs/common';
import {PrismaService, Cat} from 'db';
import {CreateCatDto, UpdateCatDto, CatDto} from 'shared';

@Injectable()
export class CatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCatDto: CreateCatDto): Promise<CatDto> {
    return this.prisma.cat.create({
      data: createCatDto,
    });
  }

  async findAll(): Promise<Cat[]> {
    return this.prisma.cat.findMany();
  }

  async findOne(id: number): Promise<Cat | undefined> {
    return this.prisma.cat.findUnique({
      where: {id},
    });
  }

  async update(updateCatDto: UpdateCatDto): Promise<Cat> {
    const {id, ...updateCatData} = updateCatDto;
    return this.prisma.cat.update({
      where: {id},
      data: updateCatData,
    });
  }

  async remove(id: number): Promise<Cat> {
    return this.prisma.cat.delete({
      where: {id},
    });
  }
}
