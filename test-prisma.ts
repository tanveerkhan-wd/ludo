import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

async function main() {
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const connectionString = `file:///${dbPath.replace(/\\/g, '/')}`;
  
  console.log("Testing Prisma connection with:", connectionString);
  
  const adapter = new PrismaLibSql({ url: connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Successfully connected to DB. Found users count:", users.length);
  } catch (err) {
    console.error("Failed to connect to DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
