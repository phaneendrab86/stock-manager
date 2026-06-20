import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService
    ) { }

    async findAll(distributorId?: string) {
        return this.prisma.product.findMany({
            where: distributorId ? {
                distributors: {
                    some: { id: distributorId }
                }
            } : {},
            include: {
                category: true,
                units: { include: { unit: true } },
                prices: true,
                distributors: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                units: { include: { unit: true } },
                prices: true,
                distributors: true,
                salesmen: true,
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async create(data: any, userId: string) {
        try {
            const { prices, units, distributorIds, ...productData } = data;

            // Handle empty strings for unique/optional relation fields
            if (productData.sku === "") productData.sku = null;
            if (productData.barcode === "") productData.barcode = null;
            if (productData.shortCode === "") productData.shortCode = null;
            if (productData.hsn === "") productData.hsn = null;

            const product = await this.prisma.product.create({
                data: {
                    ...productData,
                    prices: {
                        create: (prices || []).map((p: any) => ({
                            billingType: p.billingType,
                            price: p.price,
                        })),
                    },
                    units: {
                        create: (units || []).map((u: any) => ({
                            unitId: u.unitId,
                            conversion: u.conversion,
                            isBase: u.isBase,
                        })),
                    },
                    distributors: distributorIds ? {
                        connect: distributorIds.map((id: string) => ({ id }))
                    } : undefined,
                },
                include: {
                    category: true,
                    units: { include: { unit: true } },
                    prices: true,
                    distributors: true,
                },
            });

            await this.auditLog.createLog(userId, 'PRODUCT_CREATE', `Created product: ${product.name} (${product.sku})`);
            return product;
        } catch (error) {
            console.error("FAILED TO CREATE PRODUCT:", error);
            throw error;
        }
    }

    async update(id: string, data: any, userId: string) {
        const { prices, units, distributorIds, ...productData } = data;

        // Handle empty strings for unique/optional relation fields
        if (productData.sku === "") productData.sku = null;
        if (productData.barcode === "") productData.barcode = null;
        if (productData.shortCode === "") productData.shortCode = null;
        if (productData.hsn === "") productData.hsn = null;

        // Clean up productData to avoid Prisma errors
        delete (productData as any).category;
        delete (productData as any).salesmen;
        delete (productData as any).distributors;

        await this.prisma.$transaction(async (tx) => {
            if (prices) {
                await tx.productPrice.deleteMany({ where: { productId: id } });
            }
            if (units) {
                await tx.productUnit.deleteMany({ where: { productId: id } });
            }
        });

        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                prices: prices ? {
                    create: prices.map((p: any) => ({
                        billingType: p.billingType,
                        price: p.price,
                    })),
                } : undefined,
                units: units ? {
                    create: units.map((u: any) => ({
                        unitId: u.unitId,
                        conversion: u.conversion,
                        isBase: u.isBase,
                    })),
                } : undefined,
                distributors: distributorIds ? {
                    set: distributorIds.map((id: string) => ({ id }))
                } : undefined,
            },
            include: {
                category: true,
                units: { include: { unit: true } },
                prices: true,
                distributors: true,
            },
        });

        await this.auditLog.createLog(userId, 'PRODUCT_UPDATE', `Updated product: ${product.name}`);
        return product;
    }

    async adjustStock(productId: string, quantity: number, unitId: string, type: string, userId: string, note?: string) {
        const productUnit = await this.prisma.productUnit.findUnique({
            where: {
                productId_unitId: { productId, unitId }
            },
            include: { unit: true }
        });
        if (!productUnit) throw new Error('Unit not associated with this product');

        const baseQuantity = quantity * productUnit.conversion;

        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    stock: { increment: baseQuantity }
                }
            });

            await tx.inventoryTransaction.create({
                data: {
                    productId,
                    quantity: baseQuantity,
                    type,
                    note
                }
            });

            await this.auditLog.createLog(userId, 'STOCK_ADJUST', `${type}: ${quantity} ${productUnit.unit.name} for ${product.name}. ${note || ''}`);

            return product;
        });
    }

    async findAllTransactions() {
        return this.prisma.inventoryTransaction.findMany({
            include: { product: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProductPurchases(productId: string) {
        return this.prisma.purchaseItem.findMany({
            where: { productId },
            include: {
                purchase: {
                    include: { distributor: true }
                }
            },
            orderBy: { purchase: { purchaseDate: 'desc' } }
        });
    }
}
