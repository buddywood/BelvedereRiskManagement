import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({ connectionString: process.env.DATABASE_URL });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  globalForPrisma.prisma = prisma;
  return prisma;
}

export const prisma = getPrisma();
