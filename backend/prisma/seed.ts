import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Roles & Permissions
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: { name: 'MANAGER' },
    });

    const billingRole = await prisma.role.upsert({
        where: { name: 'BILLING_STAFF' },
        update: {},
        create: { name: 'BILLING_STAFF' },
    });

    // 2. Units (Master list without conversion factors)
    const piece = await prisma.unit.upsert({
        where: { name: 'Piece' },
        update: {},
        create: { name: 'Piece' },
    });

    const caseUnit = await prisma.unit.upsert({
        where: { name: 'Case' },
        update: {},
        create: { name: 'Case' },
    });

    const bag = await prisma.unit.upsert({
        where: { name: 'Bag' },
        update: {},
        create: { name: 'Bag' },
    });

    const box = await prisma.unit.upsert({
        where: { name: 'Box' },
        update: {},
        create: { name: 'Box' },
    });

    const bori = await prisma.unit.upsert({
        where: { name: 'Bori' },
        update: {},
        create: { name: 'Bori' },
    });

    const pack = await prisma.unit.upsert({
        where: { name: 'Pack' },
        update: {},
        create: { name: 'Pack' },
    });

    const tube = await prisma.unit.upsert({
        where: { name: 'Tube' },
        update: {},
        create: { name: 'Tube' },
    });

    // 3. Categories
    await prisma.category.upsert({
        where: { name: 'Beverages' },
        update: {},
        create: { name: 'Beverages' },
    });

    await prisma.category.upsert({
        where: { name: 'Tobacco Products' },
        update: {},
        create: { name: 'Tobacco Products' },
    });

    await prisma.category.upsert({
        where: { name: 'Pan Masala' },
        update: {},
        create: { name: 'Pan Masala' },
    });

    // 4. Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@smartstock.com' },
        update: {},
        create: {
            email: 'admin@smartstock.com',
            password: hashedPassword,
            name: 'System Admin',
            roles: { connect: [{ id: adminRole.id }] },
        },
    });

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
