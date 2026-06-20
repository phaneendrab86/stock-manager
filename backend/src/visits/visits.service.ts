import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class VisitsService {
    constructor(
        private prisma: PrismaService,
        private auditLog: AuditLogService,
    ) { }

    async findAll() {
        return this.prisma.salesmanVisit.findMany({
            include: {
                distributor: true,
                salesman: true,
                createdBy: true
            },
            orderBy: { visitDate: 'desc' }
        });
    }

    async findOne(id: string) {
        const visit = await this.prisma.salesmanVisit.findUnique({
            where: { id },
            include: {
                distributor: true,
                salesman: true,
                createdBy: true
            }
        });
        if (!visit) throw new NotFoundException('Visit not found');
        return visit;
    }

    async create(data: any, userId: string) {
        const visit = await this.prisma.salesmanVisit.create({
            data: {
                ...data,
                userId
            },
            include: {
                distributor: true,
                salesman: true
            }
        });
        await this.auditLog.createLog(userId, 'VISIT_CREATE', `Recorded visit: ${visit.distributor.name} by ${visit.salesman.name}`);
        return visit;
    }

    async update(id: string, data: any, userId: string) {
        const visit = await this.prisma.salesmanVisit.update({
            where: { id },
            data,
            include: { distributor: true, salesman: true }
        });
        await this.auditLog.createLog(userId, 'VISIT_UPDATE', `Updated visit record: ${visit.distributor.name}`);
        return visit;
    }

    async remove(id: string, userId: string) {
        const visit = await this.prisma.salesmanVisit.delete({ where: { id }, include: { distributor: true } });
        await this.auditLog.createLog(userId, 'VISIT_DELETE', `Deleted visit record for: ${visit.distributor.name}`);
        return visit;
    }

    async findFollowUps() {
        return this.prisma.salesmanVisit.findMany({
            where: {
                OR: [
                    { status: 'FOLLOW_UP_REQUIRED' },
                    { followUpDate: { gte: new Date() } }
                ]
            },
            include: {
                distributor: true,
                salesman: true
            },
            orderBy: { followUpDate: 'asc' }
        });
    }
}
