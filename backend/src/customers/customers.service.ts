import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query?: any) {
        const { search, type, isActive } = query || {};
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        return this.prisma.customer.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                ledgerEntries: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                _count: { select: { invoices: true } }
            }
        });
    }

    async getProfile(id: string) {
        const stats = await this.prisma.invoice.aggregate({
            where: { customerId: id },
            _sum: { netAmount: true, profit: true },
            _count: { id: true },
        });

        const lastInvoice = await this.prisma.invoice.findFirst({
            where: { customerId: id },
            orderBy: { createdAt: 'desc' },
        });

        const bestProduct = await this.prisma.invoiceItem.groupBy({
            by: ['productId'],
            where: { invoice: { customerId: id } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 1,
        });

        let mostProfitableProduct: any = null;
        if (bestProduct.length > 0) {
            mostProfitableProduct = await this.prisma.product.findUnique({
                where: { id: bestProduct[0].productId }
            });
        }

        return {
            totalRevenue: stats._sum?.netAmount || 0,
            totalProfit: stats._sum?.profit || 0,
            avgBill: stats._count?.id > 0 ? (stats._sum?.netAmount || 0) / stats._count.id : 0,
            visitCount: stats._count?.id || 0,
            lastVisitDate: lastInvoice?.createdAt,
            mostProfitableProduct: mostProfitableProduct?.name,
        };
    }

    async getHistory(id: string, filters: any) {
        const { startDate, endDate, paymentStatus, billingType } = filters;
        const where: any = { customerId: id };
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (billingType) where.billingType = billingType;

        return this.prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } }
        });
    }

    async recordPayment(id: string, data: { amount: number; paymentMode: string; note?: string }) {
        return this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.update({
                where: { id },
                data: { outstandingBalance: { decrement: data.amount } }
            });

            await tx.customerLedger.create({
                data: {
                    customerId: id,
                    description: data.note || `Payment Received`,
                    credit: data.amount,
                    balance: customer.outstandingBalance,
                    paymentMode: data.paymentMode,
                }
            });

            return customer;
        });
    }

    async recordLedgerEntry(id: string, data: { amount: number; type: 'DEBIT' | 'CREDIT'; description: string; paymentMode?: string }) {
        return this.prisma.$transaction(async (tx) => {
            const isDebit = data.type === 'DEBIT';
            const customer = await tx.customer.update({
                where: { id },
                data: {
                    outstandingBalance: isDebit
                        ? { increment: data.amount }
                        : { decrement: data.amount }
                }
            });

            await tx.customerLedger.create({
                data: {
                    customerId: id,
                    description: data.description || (isDebit ? 'Debit Adjustment' : 'Credit Adjustment'),
                    debit: isDebit ? data.amount : 0,
                    credit: isDebit ? 0 : data.amount,
                    balance: customer.outstandingBalance,
                    paymentMode: data.paymentMode || null,
                }
            });

            return customer;
        });
    }

    async create(createCustomerDto: any) {
        console.log('Creating customer with data:', createCustomerDto);
        try {
            const { openingBalance, phone, ...rest } = createCustomerDto;
            const result = await this.prisma.customer.create({
                data: {
                    ...rest,
                    phone: phone || null,
                    openingBalance: openingBalance || 0,
                    outstandingBalance: openingBalance || 0
                },
            });
            console.log('Customer created successfully:', result.id);
            return result;
        } catch (error) {
            console.error('FAILED to create customer:', error);
            throw error;
        }
    }

    async update(id: string, updateCustomerDto: any) {
        const { phone, ...data } = updateCustomerDto;
        return this.prisma.customer.update({
            where: { id },
            data: {
                ...data,
                phone: phone || null
            },
        });
    }

    async remove(id: string) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');

        if ((customer.outstandingBalance || 0) > 0) {
            throw new BadRequestException('Cannot delete customer with pending outstanding balance');
        }

        // Optionally: cleanup related records if necessary (ledgers, etc.)
        return this.prisma.customer.delete({ where: { id } });
    }
}
