import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FreeGiftsService } from '../free-gifts/free-gifts.service';

export interface GiftAllocation {
  giftId: string;
  productId: string;
  productName: string;
  quantity: number;
  value: number;
}

@Injectable()
export class GiftAllocationService {
  constructor(
    private prisma: PrismaService,
    private freeGiftsService: FreeGiftsService,
  ) {}

  /**
   * Greedy allocation algorithm with backtracking
   * Tries to maximize the number of gifts within maxGiftValue constraint
   */
  async allocateGifts(
    maxGiftValue: number,
    availableStock?: boolean,
  ): Promise<{
    allocations: GiftAllocation[];
    totalValue: number;
    success: boolean;
  }> {
    // Get all available gifts sorted by priority and value
    const gifts = await this.freeGiftsService.getAvailableGifts(maxGiftValue);

    if (gifts.length === 0) {
      return {
        allocations: [],
        totalValue: 0,
        success: false,
      };
    }

    // Filter by stock if required
    let availableGifts = gifts;
    if (availableStock) {
      availableGifts = await Promise.all(
        gifts.map(async (gift) => ({
          gift,
          stock: await this.freeGiftsService.getStockLevel(gift.id),
        })),
      ).then((results) =>
        results.filter((r) => r.stock > 0).map((r) => r.gift),
      );
    }

    if (availableGifts.length === 0) {
      return {
        allocations: [],
        totalValue: 0,
        success: false,
      };
    }

    // Random approach: pick exactly ONE random gift from the available eligible gifts
    const allocations: GiftAllocation[] = [];

    // Pick one random gift
    const randomIndex = Math.floor(Math.random() * availableGifts.length);
    const randomGift = availableGifts[randomIndex];

    // Determine quantity (at least 1, up to what maxGiftValue allows)
    const quantity = Math.floor(maxGiftValue / randomGift.giftValue);

    if (quantity > 0) {
      const value = quantity * randomGift.giftValue;
      allocations.push({
        giftId: randomGift.id,
        productId: randomGift.productId,
        productName: randomGift.product.name,
        quantity,
        value,
      });
    }

    const remainingValue =
      maxGiftValue - (allocations.length > 0 ? allocations[0].value : 0);
    const totalValue = maxGiftValue - remainingValue;

    return {
      allocations,
      totalValue,
      success: allocations.length > 0 && totalValue > 0,
    };
  }

  /**
   * Allocate gifts and deduct from inventory
   */
  async executeAllocation(
    invoiceId: string,
    customerId: string,
    allocations: GiftAllocation[],
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const totalGiftValue = allocations.reduce((sum, a) => sum + a.value, 0);

      // Create allocation log
      const log = await tx.giftAllocationLog.create({
        data: {
          invoiceId,
          customerId,
          totalGiftValue,
          allocations: JSON.stringify(allocations),
          createdBy: userId,
        },
      });

      // Deduct inventory for each allocated gift
      for (const allocation of allocations) {
        // Get product unit conversion
        const productUnit = await tx.productUnit.findFirst({
          where: { productId: allocation.productId },
          orderBy: { isBase: 'desc' },
        });

        const conversion = productUnit?.conversion || 1;
        const baseQuantity = allocation.quantity * conversion;

        // Update product stock
        await tx.product.update({
          where: { id: allocation.productId },
          data: { stock: { decrement: baseQuantity } },
        });

        // Record inventory transaction
        await tx.inventoryTransaction.create({
          data: {
            productId: allocation.productId,
            quantity: -baseQuantity,
            type: 'GIFT_ALLOCATION',
            note: `Gift allocated via Invoice ${invoiceId}`,
          },
        });
      }

      return log;
    });
  }

  /**
   * Preview allocation without executing (for UI preview)
   */
  async previewAllocation(maxGiftValue: number) {
    return this.allocateGifts(maxGiftValue, true);
  }
}
