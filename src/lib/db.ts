import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * pg / pg-connection-string warns when sslmode is prefer, require, or verify-ca
 * (those are temporarily treated like verify-full; future majors will not).
 * Setting verify-full explicitly keeps strict verification and silences the warning.
 */
function postgresUrlWithExplicitSslMode(url: string): string {
  return url.replace(
    /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/gi,
    "$1verify-full"
  );
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const rawUrl = process.env.DATABASE_URL;
  const connectionString = rawUrl ? postgresUrlWithExplicitSslMode(rawUrl) : rawUrl;

  const pool =
    globalForPrisma.pool ??
    new Pool({ connectionString });

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
