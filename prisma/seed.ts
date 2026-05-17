import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: "file:./dev.db"
});

async function main() {
  const adminPhone = '9999999999';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      name: 'System Admin',
      userType: 'Admin',
      referralCode: 'ADMIN01',
      status: 'Active',
      kycStatus: 'Verified',
    },
  });

  console.log('Admin user seeded:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
