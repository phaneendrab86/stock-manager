import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findActiveByCustomer(customerId: string) {
        return this.prisma.coupon.findMany({
            where: {
                customerId,
                isActive: true,
                expiryDate: { gte: new Date() },
                usedCount: { lt: 1 }, // Usage limit is 1 as per rules
            },
            orderBy: { expiryDate: 'asc' },
        });
    }

    async generateCoupon(customerId: string) {
        const code = this.generateCode();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        return this.prisma.coupon.create({
            data: {
                code,
                customerId,
                expiryDate,
                discountType: 'PERCENTAGE',
                discountValue: 1,
                discountCap: 50,
                minEligibleAmount: 2000,
                excludedCategory: 'Tobacco',
            },
        });
    }

    async validateCoupon(code: string, customerId: string, billingType: string, paymentMode: string, eligibleAmount: number) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) throw new BadRequestException('Invalid coupon code');
        if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
        if (coupon.customerId !== customerId) throw new BadRequestException('Coupon doesn\'t belong to this customer');
        if (new Date() > coupon.expiryDate) throw new BadRequestException('Coupon expired');
        if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon already used');
        if (billingType !== 'WHOLESALE') throw new BadRequestException('Coupons can only be applied to Wholesale bills');
        if (paymentMode === 'CREDIT') throw new BadRequestException('Coupons cannot be used with Credit payment');
        if (eligibleAmount < coupon.minEligibleAmount) {
            throw new BadRequestException(`Minimum eligible amount (excluding tobacco) must be ₹${coupon.minEligibleAmount}`);
        }

        return coupon;
    }

    private generateCode(): string {
        const prefix = 'WHL';
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${random}`;
    }
}
