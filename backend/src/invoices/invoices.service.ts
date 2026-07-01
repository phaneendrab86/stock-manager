import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { RewardSettingsService } from '../reward-settings/reward-settings.service';
import { GiftAllocationService } from '../gift-allocation/gift-allocation.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
    private rewardSettingsService: RewardSettingsService,
    private giftAllocationService: GiftAllocationService,
  ) {}

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const {
      items,
      customerId,
      paymentMode,
      discount,
      totalAmount,
      billingType,
      couponCode,
    } = data;

    // 1. Calculate Tobacco vs Non-Tobacco amounts
    let tobaccoTotal = 0;
    await Promise.all(
      items.map(async (item: any) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        if (!product)
          throw new BadRequestException(`Product ${item.productId} not found`);

        const itemTotal = item.quantity * item.price;
        if (product.category.isTobacco) {
          tobaccoTotal += itemTotal;
        }
        return { ...item, isTobacco: product.category.isTobacco, itemTotal };
      }),
    );

    const eligibleAmount = totalAmount - tobaccoTotal;
    let appliedCouponAmount = 0;
    let couponToUse: any = null;
    let rewardDiscount = 0;
    let giftAllocations: any[] = [];
    let rewardSettings: any = null;

    // 2. Check Reward Eligibility and Calculate Reward Discount or Gift
    if (customerId && paymentMode !== 'CREDIT') {
      const eligibilityCheck =
        await this.rewardSettingsService.checkEligibility(
          customerId,
          paymentMode,
          billingType,
          eligibleAmount,
        );

      if (eligibilityCheck.isEligible) {
        rewardSettings = eligibilityCheck.settings;

        if (eligibilityCheck.settings.mode === 'DISCOUNT') {
          // Calculate reward discount: % of eligible amount, capped at discountCap
          rewardDiscount = Math.min(
            eligibleAmount * (rewardSettings.discountPercent / 100),
            rewardSettings.discountCap,
          );
        } else if (eligibilityCheck.settings.mode === 'GIFT') {
          // Try to allocate gifts - determine max gift value based on eligible amount
          const maxGiftValue = Math.min(
            Math.max(eligibleAmount * 0.05, 50), // 5% of eligible amount, min 50
          );

          if (maxGiftValue > 0) {
            const allocation = await this.giftAllocationService.allocateGifts(
              maxGiftValue,
              rewardSettings.allocateOnlyByInventory,
            );

            if (allocation.success) {
              giftAllocations = allocation.allocations;
              // Gifts are recorded via GiftAllocationLog, no immediate discount
            } else if (rewardSettings.fallbackMode === 'DISCOUNT') {
              // Fallback to discount if gift allocation fails
              rewardDiscount = Math.min(
                eligibleAmount * (rewardSettings.discountPercent / 100),
                rewardSettings.discountCap,
              );
            }
          }
        }
      } else {
        rewardSettings = eligibilityCheck.settings;
      }
    }

    // 3. Validate and Apply Coupon if provided
    if (couponCode && customerId) {
      couponToUse = await this.couponsService.validateCoupon(
        couponCode,
        customerId,
        billingType,
        paymentMode,
        eligibleAmount,
      );

      // 1% discount on eligible amount, capped at discountCap (usually 50)
      appliedCouponAmount = Math.min(
        eligibleAmount * (couponToUse.discountValue / 100),
        couponToUse.discountCap,
      );
    }

    const netAmount =
      totalAmount - (discount || 0) - appliedCouponAmount - rewardDiscount;

    return this.prisma.$transaction(async (tx) => {
      // 4. Calculate Item Profits and Total Invoice Profit
      let totalInvoiceProfit = 0;
      const processedItems = await Promise.all(
        items.map(async (item: any) => {
          // Get the latest purchase price for the product to calculate profit
          const latestPurchase = await tx.purchaseItem.findFirst({
            where: { productId: item.productId },
            orderBy: { purchase: { purchaseDate: 'desc' } },
          });
          const purchasePrice = latestPurchase?.purchasePrice || 0;
          const itemProfit = (item.price - purchasePrice) * item.quantity;
          totalInvoiceProfit += itemProfit;
          return { ...item, profit: itemProfit };
        }),
      );

      // 5. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          customerId,
          billingType: billingType || 'RETAIL',
          totalAmount,
          gstAmount: 0,
          discount: (discount || 0) + rewardDiscount,
          couponDiscount: appliedCouponAmount,
          netAmount,
          profit: totalInvoiceProfit,
          paymentMode,
          paymentStatus: paymentMode === 'CREDIT' ? 'PENDING' : 'PAID',
          eligibleAmount,
          items: {
            create: processedItems.map((item: any) => ({
              productId: item.productId,
              unit: item.unit,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
              profit: item.profit,
            })),
          },
        },
        include: { items: true },
      });

      // 6. Update Customer Outstanding if Credit Sale
      if (paymentMode === 'CREDIT' && customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { outstandingBalance: { increment: netAmount } },
        });

        await tx.customerLedger.create({
          data: {
            customerId,
            description: `Credit Sale - Invoice #${invoice.id}`,
            debit: netAmount,
            balance:
              (await tx.customer.findUnique({ where: { id: customerId } }))
                ?.outstandingBalance || 0,
            paymentMode: 'CREDIT',
            referenceId: invoice.id,
          },
        });
      }

      // 7. Update Coupon if used
      if (couponToUse) {
        await tx.coupon.update({
          where: { id: couponToUse.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.invoiceCoupon.create({
          data: {
            invoiceId: invoice.id,
            couponId: couponToUse.id,
            amount: appliedCouponAmount,
          },
        });
      }

      // 8. Auto-Generate New Coupon for Wholesale
      if (
        billingType === 'WHOLESALE' &&
        paymentMode !== 'CREDIT' &&
        eligibleAmount >= 2000 &&
        customerId
      ) {
        const code = `WHL${Math.floor(1000 + Math.random() * 9000)}`;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        await tx.coupon.create({
          data: {
            code,
            customerId,
            expiryDate,
            discountValue: 1,
            discountCap: 50,
            minEligibleAmount: 2000,
            excludedCategory: 'Tobacco',
          },
        });
        (invoice as any).generatedCoupon = code;
      }

      // 8b. Execute Gift Allocation if gifts were allocated
      if (giftAllocations.length > 0 && customerId) {
        const updatedInvoice =
          await this.giftAllocationService.executeAllocation(
            invoice.id,
            customerId,
            giftAllocations,
            'system', // TODO: Get actual user ID from context
          );
        (invoice as any).giftAllocation = updatedInvoice;
      }

      // 9. Deduct Stock & Record Transactions
      for (const item of items) {
        const productUnit = await tx.productUnit.findFirst({
          where: {
            productId: item.productId,
            OR: [{ unit: { name: item.unit } }, { unitId: item.unit }],
          },
        });

        const conversion = productUnit ? productUnit.conversion : 1;
        const baseQuantity = item.quantity * conversion;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: baseQuantity } },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            quantity: -baseQuantity,
            type: 'SALE',
            note: `Sold via Invoice ${invoice.id}`,
          },
        });
      }

      return invoice;
    });
  }
}
