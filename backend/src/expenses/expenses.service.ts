import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

    // async createCategory(name: string, userId: string) {
    //     const category = await this.prisma.expenseCategory.create({
    //         data: { name }
    //     });
    //     await this.auditLog.createLog(userId, 'CATEGORY_CREATE', `Created expense category: ${name}`);
    //     return category;
    // }
    // In your expenses.service.ts
    async createCategory(createCategoryDto: { name: string }, userId: string) {
        const existing = await this.prisma.expenseCategory.findUnique({
            where: { name: createCategoryDto.name },
        });
    
        if (existing) {
            throw new BadRequestException('Category with this name already exists.');
        }
    
        const category = await this.prisma.expenseCategory.create({
            data: createCategoryDto,
        });
    
        await this.auditLog.createLog(userId, 'CATEGORY_CREATE', `Created expense category: ${category.name}`);
        return category;
    }

    async updateCategory(id: string, updateCategoryDto: { name: string }, userId: string) {
        const categoryToUpdate = await this.prisma.expenseCategory.findUnique({ where: { id } });
        if (!categoryToUpdate) {
            throw new NotFoundException(`Category with ID ${id} not found.`);
        }

        const updatedCategory = await this.prisma.expenseCategory.update({
            where: { id },
            data: { name: updateCategoryDto.name },
        });

        await this.auditLog.createLog(userId, 'CATEGORY_UPDATE', `Updated expense category from "${categoryToUpdate.name}" to "${updatedCategory.name}"`);
        return updatedCategory;
    }

    async deleteCategory(id: string, userId: string) {
        const expenseCount = await this.prisma.expense.count({ where: { categoryId: id } });
        if (expenseCount > 0) {
            throw new BadRequestException('Cannot delete category as it is associated with existing expenses.');
        }
        const category = await this.prisma.expenseCategory.delete({
            where: { id }
        });
        await this.auditLog.createLog(userId, 'CATEGORY_DELETE', `Deleted expense category: ${category.name}`);
        return category;
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
