import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      kyc: {
        create: {
          kycStatus: 'VERIFIED',
          verifiedAt: new Date(),
        }
      }
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
