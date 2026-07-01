import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; isTobacco?: boolean }, userId: string) {
    const category = await this.prisma.category.create({
      data,
    });
    await this.auditLog.createLog(
      userId,
      'CATEGORY_CREATE',
      `Created category: ${category.name}`,
    );
    return category;
  }

  async update(
    id: string,
    data: { name?: string; isTobacco?: boolean },
    userId: string,
  ) {
    const category = await this.prisma.category.update({
      where: { id },
      data,
    });
    await this.auditLog.createLog(
      userId,
      'CATEGORY_UPDATE',
      `Updated category: ${category.name}`,
    );
    return category;
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.delete({
      where: { id },
    });
    await this.auditLog.createLog(
      userId,
      'CATEGORY_DELETE',
      `Deleted category: ${category.name}`,
    );
    return category;
  }
}
