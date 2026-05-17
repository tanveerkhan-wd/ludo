import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import path from 'path';

const createPrismaClient = () => {
  // Use absolute path for Windows to ensure LibSQL can find the file
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const connectionString = `file:${dbPath}`;
  
  console.log("Initializing Prisma with Database Path:", connectionString);
  
  const client = createClient({
    url: connectionString,
  });
  
  const adapter = new PrismaLibSql(client);

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

export default prisma;
