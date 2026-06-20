import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { ExpenseStatus, PaymentMode } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ExpensesService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService
    ) { }

    async findAll() {
        return this.prisma.expense.findMany({
            include: {
                category: true,
                createdBy: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { date: 'desc' }
        });
    }

    async findCategories() {
        return this.prisma.expenseCategory.findMany();
    }

    async create(data: any, userId: string) {
        const expense = await this.prisma.expense.create({
            data: {
                title: data.title,
                amount: data.amount,
                paymentMode: data.paymentMode,
                description: data.description,
                categoryId: data.categoryId,
                userId: userId,
                status: 'PENDING',
            }
        });
        await this.auditLog.createLog(userId, 'EXPENSE_CREATE', `Submitted expense for approval: ${expense.title} (${expense.amount})`);
        return expense;
    }

    async approve(id: string, adminId: string, note?: string) {
        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.expense.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            await tx.expenseApproval.create({
                data: {
                    expenseId: id,
                    adminId: adminId,
                    status: 'APPROVED',
                    note: note
                }
            });

            await this.auditLog.createLog(adminId, 'EXPENSE_APPROVE', `Approved expense: ${expense.title} (${expense.amount}). Note: ${note || '-'}`);

            return expense;
        });
    }

    async reject(id: string, adminId: string, note?: string) {
        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.expense.update({
                where: { id },
                data: { status: 'REJECTED' }
            });

            await tx.expenseApproval.create({
                data: {
                    expenseId: id,
                    adminId: adminId,
                    status: 'REJECTED',
                    note: note
                }
            });

            await this.auditLog.createLog(adminId, 'EXPENSE_REJECT', `Rejected expense: ${expense.title} (${expense.amount}). Note: ${note || '-'}`);

            return expense;
        });
    }
}
