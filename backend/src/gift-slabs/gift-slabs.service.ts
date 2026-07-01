import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateGiftSlabDto {
  minAmount: number;
  maxAmount: number;
  maxGiftValue: number;
  priority: number;
  description?: string;
}

export interface UpdateGiftSlabDto {
  minAmount?: number;
  maxAmount?: number;
  maxGiftValue?: number;
  priority?: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class GiftSlabsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGiftSlabDto) {
    // Validate no overlapping slabs
    const existing = await this.prisma.giftSlab.findFirst({
      where: {
        OR: [
          {
            AND: [
              { minAmount: { lte: data.minAmount } },
              { maxAmount: { gte: data.minAmount } },
            ],
          },
          {
            AND: [
              { minAmount: { lte: data.maxAmount } },
              { maxAmount: { gte: data.maxAmount } },
            ],
          },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Amount range overlaps with existing slab (${existing.minAmount}-${existing.maxAmount})`,
      );
    }

    return this.prisma.giftSlab.create({
      data: {
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        maxGiftValue: data.maxGiftValue,
        priority: data.priority || 1,
        description: data.description,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.giftSlab.findMany({
      orderBy: [{ isActive: 'desc' }, { priority: 'asc' }],
    });
  }

  async findOne(id: string) {
    const slab = await this.prisma.giftSlab.findUnique({
      where: { id },
    });

    if (!slab) {
      throw new BadRequestException(`Gift slab not found`);
    }

    return slab;
  }

  async update(id: string, data: UpdateGiftSlabDto) {
    await this.findOne(id);

    // If updating amount range, check for overlaps
    if (data.minAmount !== undefined || data.maxAmount !== undefined) {
      const minAmount = data.minAmount;
      const maxAmount = data.maxAmount;

      const existing = await this.prisma.giftSlab.findFirst({
        where: {
          id: { not: id },
          OR: [
            {
              AND: [
                { minAmount: { lte: minAmount } },
                { maxAmount: { gte: minAmount } },
              ],
            },
            {
              AND: [
                { minAmount: { lte: maxAmount } },
                { maxAmount: { gte: maxAmount } },
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Amount range overlaps with existing slab (${existing.minAmount}-${existing.maxAmount})`,
        );
      }
    }

    return this.prisma.giftSlab.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete by marking as inactive instead of hard delete
    return this.prisma.giftSlab.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSlabForAmount(amount: number) {
    return this.prisma.giftSlab.findFirst({
      where: {
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
        isActive: true,
      },
      orderBy: { priority: 'asc' },
    });
  }
}
