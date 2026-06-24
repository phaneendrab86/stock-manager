import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');

  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  const managerRole = await prisma.role.findUnique({
    where: { name: 'MANAGER' },
  });

  if (!adminRole || !managerRole) {
    console.error('Roles not found. Please run seed first.');
    process.exit(1);
  }

  // User 1: Admin
  const hashedPassword1 = await bcrypt.hash('admin@123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword1,
      name: 'Admin User',
      roles: { connect: [{ id: adminRole.id }] },
    },
  });
  console.log('✓ User 1 created:', user1.email, '| Password: admin@123');

  // User 2: Manager
  const hashedPassword2 = await bcrypt.hash('manager@123', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword2,
      name: 'Manager User',
      roles: { connect: [{ id: managerRole.id }] },
    },
  });
  console.log('✓ User 2 created:', user2.email, '| Password: manager@123');

  console.log('\n📝 Login Credentials:');
  console.log('User 1 - Email: admin@example.com | Password: admin@123');
  console.log('User 2 - Email: manager@example.com | Password: manager@123');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
