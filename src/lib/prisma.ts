import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const createPrismaClient = () => {
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const connectionString = process.platform === 'win32'
    ? `file:///${dbPath.replace(/\\/g, '/')}`
    : `file://${dbPath}`;
  
  console.log("Initializing Prisma with Database Path:", connectionString);
  
  const adapter = new PrismaLibSql({ url: connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
export default prisma;