import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password for test accounts
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create test users
  const member = await prisma.user.upsert({
    where: { email: 'member@miraivpn.com' },
    update: {},
    create: {
      username: 'member',
      email: 'member@miraivpn.com',
      password_hash: passwordHash,
      balance_credits: 100.00,

    },
  });

  const support = await prisma.user.upsert({
    where: { email: 'support@miraivpn.com' },
    update: {},
    create: {
      username: 'support',
      email: 'support@miraivpn.com',
      password_hash: passwordHash,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@miraivpn.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@miraivpn.com',
      password_hash: passwordHash,
    },
  });

  // Create test VPS servers
  const vps1 = await prisma.vpsServer.upsert({
    where: { id: 'osaka-1' },
    update: {},
    create: {
      id: 'osaka-1',
      name: 'osaka-1',
      ip: '192.168.1.100',
      region: 'jp',
      active_users: 0,
      max_users: 100,
      cpu_load: 0.2,
      bw_mbps: 100,
      status: 'online',
    },
  });

  const vps2 = await prisma.vpsServer.upsert({
    where: { id: 'nyc-1' },
    update: {},
    create: {
      id: 'nyc-1',
      name: 'nyc-1',
      ip: '192.168.1.101',
      region: 'us',
      active_users: 0,
      max_users: 100,
      cpu_load: 0.1,
      bw_mbps: 100,
      status: 'online',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts created:');
  console.log('- member@miraivpn.com (100€ credits)');
  console.log('- support@miraivpn.com');
  console.log('- admin@miraivpn.com');
  console.log('Password for all: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
