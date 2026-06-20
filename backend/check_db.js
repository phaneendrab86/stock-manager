const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.purchase.count();
        console.log('PURCHASE_COUNT:', count);
        const lastPurchase = await prisma.purchase.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        console.log('LAST_PURCHASE:', lastPurchase);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
