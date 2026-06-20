import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.purchase.findMany({
            include: {
                distributor: true,
                items: {
                    include: { product: true }
                }
            },
            orderBy: { purchaseDate: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.purchase.findUnique({
            where: { id },
            include: {
                distributor: true,
                items: {
                    include: { product: true }
                },
                payments: true
            },
        });
    }

    async create(data: any, userId: string) {
        console.log('--- CREATING PURCHASE ---');
        console.log('User ID:', userId);
        console.log('Payload:', JSON.stringify(data, null, 2));

        const { items, ...purchaseData } = data;
        // ... (rest of the method)

        if (!items || !Array.isArray(items)) {
            throw new BadRequestException('Items array is required');
        }

        // Calculate totals with defensive casting
        let calculatedTotal = 0;
        const processedItems = items.map((item: any) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.purchasePrice) || 0;
            const gst = Number(item.gstPercent) || 0;
            const disc = Number(item.discount) || 0;

            const subtotal = quantity * price;
            const gstAmount = subtotal * (gst / 100);
            const itemTotal = subtotal + gstAmount - disc;

            calculatedTotal += itemTotal;
            return {
                ...item,
                quantity,
                purchasePrice: price,
                gstPercent: gst,
                discount: disc,
                totalAmount: itemTotal
            };
        });

        const paidAmount = Number(purchaseData.paidAmount) || 0;
        const pendingAmount = calculatedTotal - paidAmount;

        // Sanitize purchase data for Prisma
        const sanitizedPurchaseData = {
            invoiceNumber: purchaseData.invoiceNumber ? String(purchaseData.invoiceNumber) : null,
            purchaseDate: new Date(purchaseData.purchaseDate || new Date()),
            distributorId: purchaseData.distributorId,
            salesmanId: !purchaseData.salesmanId ? null : purchaseData.salesmanId,
            type: purchaseData.type || "CREDIT",
            paymentMode: purchaseData.paymentMode || "Cash",
            paidAmount: paidAmount,
        };

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    ...sanitizedPurchaseData,
                    totalAmount: calculatedTotal,
                    pendingAmount: pendingAmount,
                    status: pendingAmount <= 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
                    items: {
                        create: processedItems.map((item: any) => ({
                            productId: item.productId,
                            unitId: item.unitId,
                            quantity: item.quantity,
                            purchasePrice: item.purchasePrice,
                            gstPercent: item.gstPercent,
                            discount: item.discount,
                            totalAmount: item.totalAmount
                        }))
                    }
                }
            });

            // 2. Update Stock & Record Inventory Transactions
            for (const item of processedItems) {
                // Get product-specific unit conversion
                const productUnit = await tx.productUnit.findUnique({
                    where: {
                        productId_unitId: {
                            productId: item.productId,
                            unitId: item.unitId
                        }
                    }
                });

                const conversion = productUnit ? productUnit.conversion : 1;
                const baseQuantity = item.quantity * conversion;

                // Increment Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: baseQuantity }
                    }
                });

                // Create Inventory Transaction
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        quantity: baseQuantity,
                        type: 'PURCHASE',
                        note: `Purchase Invoice: ${purchase.invoiceNumber || 'N/A'}`
                    }
                });
            }

            // 3. Update Distributor Ledger & Balance
            if (pendingAmount > 0 || purchaseData.paidAmount > 0) {
                const distributor = await tx.distributor.update({
                    where: { id: purchaseData.distributorId },
                    data: {
                        outstandingBalance: { increment: pendingAmount }
                    }
                });

                // Record the purchase as a debt (debit) if credit, or just track the full transaction
                await tx.distributorLedger.create({
                    data: {
                        distributorId: purchaseData.distributorId,
                        description: `Purchase Invoice: ${purchase.invoiceNumber || 'N/A'}`,
                        debit: calculatedTotal,
                        balance: distributor.outstandingBalance
                    }
                });

                // Record initial payment if any
                if (purchaseData.paidAmount > 0) {
                    await tx.purchasePayment.create({
                        data: {
                            purchaseId: purchase.id,
                            amount: purchaseData.paidAmount,
                            paymentMode: purchaseData.paymentMode || 'Cash',
                            note: 'Initial payment at purchase'
                        }
                    });

                    await tx.distributorLedger.create({
                        data: {
                            distributorId: purchaseData.distributorId,
                            description: `Payment for Invoice: ${purchase.invoiceNumber || 'N/A'}`,
                            credit: purchaseData.paidAmount,
                            balance: distributor.outstandingBalance // The increment happened above, but the payment reduces it? 
                            // Actually, if I incremented pendingAmount, then the payment doesn't reduce it further in THIS step 
                            // as pendingAmount is already net.
                        }
                    });
                }
            }

            return purchase;
        });
    }

    async addPayment(purchaseId: string, paymentData: any) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id: purchaseId },
                include: { distributor: true }
            });

            if (!purchase) throw new BadRequestException('Purchase not found');
            if (paymentData.amount > purchase.pendingAmount) {
                throw new BadRequestException('Payment amount exceeds pending amount');
            }

            const newPaidAmount = purchase.paidAmount + paymentData.amount;
            const newPendingAmount = purchase.pendingAmount - paymentData.amount;

            // 1. Create Payment
            await tx.purchasePayment.create({
                data: {
                    purchaseId,
                    amount: paymentData.amount,
                    paymentMode: paymentData.paymentMode,
                    note: paymentData.note
                }
            });

            // 2. Update Purchase
            const updatedPurchase = await tx.purchase.update({
                where: { id: purchaseId },
                data: {
                    paidAmount: newPaidAmount,
                    pendingAmount: newPendingAmount,
                    status: newPendingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID'
                }
            });

            // 3. Update Distributor
            const updatedDistributor = await tx.distributor.update({
                where: { id: purchase.distributorId },
                data: {
                    outstandingBalance: { decrement: paymentData.amount }
                }
            });

            // 4. Record in Ledger
            await tx.distributorLedger.create({
                data: {
                    distributorId: purchase.distributorId,
                    description: `Payment for Invoice: ${purchase.invoiceNumber || 'N/A'}`,
                    credit: paymentData.amount,
                    balance: updatedDistributor.outstandingBalance
                }
            });

            return updatedPurchase;
        });
    }
}
