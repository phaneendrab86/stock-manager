import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; conversion: number; isBase: boolean }) {
    return this.prisma.unit.create({
      data,
    });
  }
}
