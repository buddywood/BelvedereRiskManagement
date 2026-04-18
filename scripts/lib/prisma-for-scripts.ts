/**
 * Prisma client for Node/tsx scripts. Prisma 7 requires a driver adapter.
 * Loads .env.local then .env so DATABASE_URL is set like prisma.config.ts.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

config({ path: ".env.local" });
config();

function postgresUrlWithExplicitSslMode(url: string): string {
  return url.replace(
    /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/gi,
    "$1verify-full"
  );
}

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl?.trim()) {
  throw new Error(
    "DATABASE_URL is missing. Set it in .env or .env.local (see .env.example)."
  );
}

const pool = new Pool({
  connectionString: postgresUrlWithExplicitSslMode(rawUrl),
});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

export async function disconnectPrismaScript(): Promise<void> {
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
}
