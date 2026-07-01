import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFreeGiftDto {
  productId: string;
  giftValue: number;
  stockLimit: number;
  priority: number;
  validFrom?: Date;
  validTo?: Date;
}

export interface UpdateFreeGiftDto {
  productId?: string;
  giftValue?: number;
  stockLimit?: number;
  priority?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  validFrom?: Date;
  validTo?: Date;
}

@Injectable()
export class FreeGiftsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFreeGiftDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new BadRequestException(`Product not found`);
    }

    return this.prisma.freeGift.create({
      data: {
        productId: data.productId,
        giftValue: data.giftValue,
        stockLimit: data.stockLimit || 0,
        priority: data.priority || 1,
        status: 'ACTIVE',
        validFrom: data.validFrom || new Date(),
        validTo: data.validTo,
      },
      include: { product: true },
    });
  }

  async findAll(activeOnly = true) {
    return this.prisma.freeGift.findMany({
      where: activeOnly ? { status: 'ACTIVE' } : undefined,
      include: { product: true },
      orderBy: [{ status: 'asc' }, { priority: 'asc' }],
    });
  }

  async findOne(id: string) {
    const gift = await this.prisma.freeGift.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!gift) {
      throw new BadRequestException(`Free gift not found`);
    }

    return gift;
  }

  async update(id: string, data: UpdateFreeGiftDto) {
    await this.findOne(id);

    if (data.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product not found`);
      }
    }

    return this.prisma.freeGift.update({
      where: { id },
      data,
      include: { product: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete by marking as discontinued
    return this.prisma.freeGift.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
    });
  }

  async getAvailableGifts(maxValue: number) {
    return this.prisma.freeGift.findMany({
      where: {
        status: 'ACTIVE',
        giftValue: { lte: maxValue },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
      },
      include: { product: true },
      orderBy: [{ priority: 'asc' }, { giftValue: 'desc' }],
    });
  }

  async getStockLevel(giftId: string) {
    const gift = await this.findOne(giftId);

    if (gift.stockLimit === 0) {
      // Unlimited stock - return product stock
      return gift.product.stock;
    }

    return gift.stockLimit;
  }
}
