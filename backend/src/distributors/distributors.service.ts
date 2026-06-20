import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistributorsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.distributor.findMany({
            include: {
                _count: {
                    select: { salesmen: true, products: true }
                }
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const distributor = await this.prisma.distributor.findUnique({
            where: { id },
            include: {
                salesmen: {
                    include: { products: true }
                },
                products: true,
                purchases: {
                    take: 10,
                    orderBy: { purchaseDate: 'desc' },
                },
                ledgerEntries: {
                    take: 20,
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!distributor) throw new NotFoundException('Distributor not found');
        return distributor;
    }

    async create(data: any, userId: string) {
        const { salesmen, productIds, ...distributorData } = data;

        return this.prisma.distributor.create({
            data: {
                ...distributorData,
                salesmen: salesmen ? {
                    create: salesmen.map((s: any) => ({
                        name: s.name,
                        phone: s.phone,
                        email: s.email,
                        designation: s.designation,
                        isActive: s.isActive !== undefined ? s.isActive : true,
                        products: s.productIds ? {
                            connect: s.productIds.map((pid: string) => ({ id: pid }))
                        } : undefined
                    }))
                } : undefined,
                products: productIds ? {
                    connect: productIds.map((id: string) => ({ id })),
                } : undefined,
            },
            include: { salesmen: true, products: true }
        });
    }

    async update(id: string, data: any, userId: string) {
        const { salesmen, productIds, ...distributorData } = data;

        // Note: For salesmen, we handle them by deleting those not in the new list 
        // and upserting the others, or simply recreating if the list is small.
        // For this requirement, we'll do a simple replace logic for salesmen product assignments
        // but try to keep salesmen IDs if they exist.

        return this.prisma.$transaction(async (tx) => {
            // Update basic distributor data
            const distributor = await tx.distributor.update({
                where: { id },
                data: {
                    ...distributorData,
                    products: productIds ? {
                        set: productIds.map((pid: string) => ({ id: pid })),
                    } : undefined,
                },
            });

            if (salesmen) {
                // Get current salesmen to identify which ones to remove
                const currentSalesmen = await tx.salesman.findMany({
                    where: { distributorId: id },
                    select: { id: true }
                });
                const currentIds = currentSalesmen.map(s => s.id);
                const incomingIds = salesmen.filter((s: any) => s.id).map((s: any) => s.id);
                const idsToRemove = currentIds.filter(cid => !incomingIds.includes(cid));

                // Remove salesmen not in the new list
                if (idsToRemove.length > 0) {
                    await tx.salesman.deleteMany({
                        where: { id: { in: idsToRemove } }
                    });
                }

                // Upsert salesmen
                for (const s of salesmen) {
                    if (s.id) {
                        await tx.salesman.update({
                            where: { id: s.id },
                            data: {
                                name: s.name,
                                phone: s.phone,
                                email: s.email,
                                designation: s.designation,
                                isActive: s.isActive !== undefined ? s.isActive : true,
                                products: s.productIds ? {
                                    set: s.productIds.map((pid: string) => ({ id: pid }))
                                } : undefined
                            }
                        });
                    } else {
                        await tx.salesman.create({
                            data: {
                                name: s.name,
                                phone: s.phone,
                                email: s.email,
                                designation: s.designation,
                                isActive: s.isActive !== undefined ? s.isActive : true,
                                distributorId: id,
                                products: s.productIds ? {
                                    connect: s.productIds.map((pid: string) => ({ id: pid }))
                                } : undefined
                            }
                        });
                    }
                }
            }

            return tx.distributor.findUnique({
                where: { id },
                include: { salesmen: { include: { products: true } }, products: true }
            });
        });
    }

    async remove(id: string) {
        return this.prisma.distributor.delete({
            where: { id },
        });
    }

    async getLedger(id: string) {
        return this.prisma.distributorLedger.findMany({
            where: { distributorId: id },
            orderBy: { date: 'desc' },
        });
    }

    async recordLedgerEntry(id: string, data: { amount: number; type: 'DEBIT' | 'CREDIT'; description: string }) {
        return this.prisma.$transaction(async (tx) => {
            const isDebit = data.type === 'DEBIT';
            const distributor = await tx.distributor.update({
                where: { id },
                data: {
                    outstandingBalance: isDebit
                        ? { increment: data.amount }
                        : { decrement: data.amount }
                }
            });

            await tx.distributorLedger.create({
                data: {
                    distributorId: id,
                    description: data.description || (isDebit ? 'Debit Adjustment' : 'Credit Adjustment'),
                    debit: isDebit ? data.amount : 0,
                    credit: isDebit ? 0 : data.amount,
                    balance: distributor.outstandingBalance,
                }
            });

            return distributor;
        });
    }
}
