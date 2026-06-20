import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            include: { roles: true },
        });
    }

    async findOne(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { roles: true },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            include: { roles: true },
        });
    }

    async update(id: string, data: any) {
        const updateData = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        if (data.roleIds) {
            updateData.roles = {
                set: data.roleIds.map((roleId: string) => ({ id: roleId })),
            };
            delete updateData.roleIds;
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            include: { roles: true },
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async getAllRoles() {
        return this.prisma.role.findMany();
    }
}
