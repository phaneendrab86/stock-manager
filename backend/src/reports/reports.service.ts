import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesReport(startDate: string, endDate: string) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return this.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                customer: true,
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getInventoryReport() {
        const products = await this.prisma.product.findMany({
            include: {
                category: true,
                prices: true,
            },
        });

        return products.map(product => {
            const basePrice = product.prices.find(p => p.billingType === 'RESALE')?.price || 0;
            return {
                id: product.id,
                name: product.name,
                category: product.category.name,
                stock: product.stock,
                price: basePrice,
                totalValue: product.stock * basePrice,
            };
        });
    }

    async getExpenseReport(startDate: string, endDate: string) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return this.prisma.expense.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                category: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProfitLossSummary(startDate: string, endDate: string) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const revenue = await this.prisma.invoice.aggregate({
            where: { createdAt: { gte: start, lte: end } },
            _sum: { netAmount: true },
        });

        const expenses = await this.prisma.expense.aggregate({
            where: {
                createdAt: { gte: start, lte: end },
                status: 'APPROVED'
            },
            _sum: { amount: true },
        });

        const totalRevenue = revenue._sum.netAmount || 0;
        const totalExpenses = expenses._sum.amount || 0;

        return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
        };
    }
}
