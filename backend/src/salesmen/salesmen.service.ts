import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class SalesmenService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService,
    ) { }

    async findAll() {
        return this.prisma.salesman.findMany({
            include: {
                distributor: true,
                _count: {
                    select: { products: true, visits: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const salesman = await this.prisma.salesman.findUnique({
            where: { id },
            include: {
                distributor: true,
                products: {
                    include: { category: true }
                },
                visits: {
                    include: { distributor: true, createdBy: true },
                    orderBy: { visitDate: 'desc' }
                }
            }
        });
        if (!salesman) throw new NotFoundException('Salesman not found');
        return salesman;
    }

    async create(data: any, userId: string) {
        const { productIds, ...rest } = data;
        const salesman = await this.prisma.salesman.create({
            data: {
                ...rest,
                products: productIds ? {
                    connect: productIds.map((id: string) => ({ id }))
                } : undefined
            },
            include: { distributor: true }
        });
        await this.auditLog.createLog(userId, 'SALESMAN_CREATE', `Created salesman: ${salesman.name} for distributor: ${salesman.distributor.name}`);
        return salesman;
    }

    async update(id: string, data: any, userId: string) {
        const { productIds, ...rest } = data;
        const salesman = await this.prisma.salesman.update({
            where: { id },
            data: {
                ...rest,
                products: productIds ? {
                    set: productIds.map((id: string) => ({ id }))
                } : undefined
            },
            include: { distributor: true }
        });
        await this.auditLog.createLog(userId, 'SALESMAN_UPDATE', `Updated salesman: ${salesman.name}`);
        return salesman;
    }

    async remove(id: string, userId: string) {
        const salesman = await this.prisma.salesman.delete({ where: { id } });
        await this.auditLog.createLog(userId, 'SALESMAN_DELETE', `Deleted salesman: ${salesman.name}`);
        return salesman;
    }

    async findByDistributor(distributorId: string) {
        return this.prisma.salesman.findMany({
            where: { distributorId },
            orderBy: { name: 'asc' }
        });
    }
}
