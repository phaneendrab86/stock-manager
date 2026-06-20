import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const today = startOfDay(new Date());

        // Revenue (Sum of invoice net amounts from today)
        const revenue = await this.prisma.invoice.aggregate({
            where: { createdAt: { gte: today } },
            _sum: { netAmount: true },
        });

        // Expenses (Sum of approved expense amounts from today)
        const expenses = await this.prisma.expense.aggregate({
            where: {
                createdAt: { gte: today },
                status: 'APPROVED'
            },
            _sum: { amount: true },
        });

        // Low Stock Count
        const lowStockCount = await this.prisma.product.count({
            where: { stock: { lte: 10 } },
        });

        // Invoices
        const totalInvoices = await this.prisma.invoice.count();
        const todayInvoices = await this.prisma.invoice.count({
            where: { createdAt: { gte: today } },
        });

        // Customers
        const totalCustomers = await this.prisma.customer.count();
        const todayCustomers = await this.prisma.customer.count({
            where: { createdAt: { gte: today } },
        });

        // Suppliers (Distributors)
        const totalSuppliers = await this.prisma.distributor.count();
        const todaySuppliers = await this.prisma.distributor.count({
            where: { createdAt: { gte: today } },
        });

        // Products
        const totalProducts = await this.prisma.product.count();
        const todayProducts = await this.prisma.product.count({
            where: { createdAt: { gte: today } },
        });

        return {
            todayRevenue: revenue._sum.netAmount || 0,
            todayExpenses: expenses._sum.amount || 0,
            lowStockCount,
            totalInvoices,
            todayInvoices,
            totalCustomers,
            todayCustomers,
            totalSuppliers,
            todaySuppliers,
            totalProducts,
            todayProducts,
        };
    }

    async getRecentActivities(type: string) {
        const take = 5;
        const orderBy: any = { createdAt: 'desc' };

        switch (type.toLowerCase()) {
            case 'sells':
                return this.prisma.invoice.findMany({
                    take,
                    orderBy,
                    include: { customer: true }
                });
            case 'purchases':
                return this.prisma.purchase.findMany({
                    take,
                    orderBy,
                    include: { distributor: true }
                });
            case 'customers':
                return this.prisma.customer.findMany({
                    take,
                    orderBy
                });
            case 'suppliers':
                return this.prisma.distributor.findMany({
                    take,
                    orderBy
                });
            default:
                return [];
        }
    }

    async getStockAnalytics(filters: any) {
        const where: any = {};
        if (filters.categoryId) where.categoryId = filters.categoryId;
        if (filters.distributorId) {
            where.distributors = {
                some: { id: filters.distributorId }
            };
        }

        const products: any[] = await this.prisma.product.findMany({
            where,
            include: {
                purchaseItems: {
                    orderBy: { purchase: { purchaseDate: 'desc' } },
                    take: 1,
                    include: { purchase: true }
                },
                invoiceItems: {
                    include: { invoice: true }
                }
            }
        });

        let totalInventoryValue = 0;
        let totalStockQuantity = 0;
        const lowStockItems = products.filter(p => p.stock <= 10).length;

        const thirtyDaysAgo = subDays(new Date(), 30);
        const deadStockItems = products.filter(p => {
            const hasRecentSale = p.invoiceItems.some((ii: any) => ii.invoice?.createdAt >= thirtyDaysAgo);
            return !hasRecentSale && p.stock > 0;
        }).length;

        products.forEach(p => {
            const purchasePrice = p.purchaseItems[0]?.purchasePrice || 0;
            totalInventoryValue += p.stock * purchasePrice;
            totalStockQuantity += p.stock;
        });

        // Top 10 Low Stock Products
        const topLowStockProducts = await this.prisma.product.findMany({
            where: { ...where, stock: { lte: 10 } },
            orderBy: { stock: 'asc' },
            take: 10,
            include: { category: true, distributors: true }
        });

        return {
            totalInventoryValue,
            totalStockQuantity,
            lowStockItems,
            deadStockItems,
            topLowStockProducts
        };
    }

    async getRevenueAnalytics(filters: any) {
        const { startDate, endDate, billingType, paymentMode } = filters;
        const where: any = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (billingType) where.billingType = billingType;
        if (paymentMode) where.paymentMode = paymentMode;

        const invoices = await this.prisma.invoice.findMany({
            where,
            include: { items: true }
        });

        const revenueByDate = invoices.reduce((acc, inv) => {
            const date = inv.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + inv.netAmount;
            return acc;
        }, {});

        const revenueData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date],
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Wholesale vs Retail Split
        const split = await this.prisma.invoice.groupBy({
            by: ['billingType'],
            where,
            _sum: { netAmount: true }
        });

        return {
            revenueTrend: revenueData,
            revenueSplit: split.map(s => ({
                type: s.billingType,
                amount: s._sum.netAmount || 0
            }))
        };
    }

    async getTopSellingAnalytics(filters: any) {
        const { startDate, endDate } = filters;
        const where: any = {};
        if (startDate && endDate) {
            where.invoice = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
            };
        }

        const topProducts = await this.prisma.invoiceItem.groupBy({
            by: ['productId'],
            where: startDate && endDate ? {
                invoice: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                }
            } : {},
            _sum: { quantity: true, total: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        });

        const productDetails = await Promise.all(topProducts.map(async (p) => {
            const details = await this.prisma.product.findUnique({
                where: { id: p.productId },
                include: { category: true }
            });
            return {
                id: p.productId,
                name: details?.name,
                category: details?.category?.name,
                quantity: p._sum.quantity,
                revenue: p._sum.total
            };
        }));

        const topCategories = await this.prisma.invoiceItem.findMany({
            where: startDate && endDate ? {
                invoice: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                }
            } : {},
            include: { product: { include: { category: true } } }
        });

        const categorySales = topCategories.reduce((acc, item: any) => {
            const catName = item.product.category.name;
            acc[catName] = (acc[catName] || 0) + item.total;
            return acc;
        }, {});

        const topCategoryData = Object.keys(categorySales).map(name => ({
            name,
            value: categorySales[name]
        })).sort((a, b: any) => b.value - a.value).slice(0, 5);

        return {
            topProducts: productDetails,
            topCategories: topCategoryData
        };
    }

    async getAverageBillingAnalytics(filters: any) {
        const { startDate, endDate } = filters;
        const where: any = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const stats = await this.prisma.invoice.aggregate({
            where,
            _avg: { netAmount: true },
            _count: { id: true }
        });

        const itemsPerBill = await this.prisma.invoiceItem.count({
            where: { invoice: where }
        });

        return {
            avgBillAmount: stats._avg.netAmount || 0,
            totalBills: stats._count.id,
            avgItemsPerBill: stats._count.id > 0 ? itemsPerBill / stats._count.id : 0
        };
    }

    async getCustomerAnalytics(filters: any) {
        const { startDate, endDate } = filters;
        const where: any = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const topCustomers = await this.prisma.invoice.groupBy({
            by: ['customerId'],
            where: { ...where, customerId: { not: null } },
            _count: { id: true },
            _sum: { netAmount: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });

        const customerDetails = await Promise.all(topCustomers.map(async (c) => {
            const details = await this.prisma.customer.findUnique({
                where: { id: c.customerId as string }
            });
            return {
                id: c.customerId,
                name: details?.name,
                visits: c._count.id,
                revenue: c._sum.netAmount
            };
        }));

        return {
            topCustomers: customerDetails
        };
    }

    async getCustomerTrend(customerId: string) {
        const invoices = await this.prisma.invoice.findMany({
            where: { customerId },
            orderBy: { createdAt: 'asc' }
        });

        return invoices.map(inv => ({
            date: inv.createdAt.toISOString().split('T')[0],
            amount: inv.netAmount
        }));
    }
}
