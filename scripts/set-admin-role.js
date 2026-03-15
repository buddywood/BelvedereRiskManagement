#!/usr/bin/env node
/**
 * Ensure buddy@ebilly.com exists and has role ADMIN.
 * Admin access is restricted to this account in code (see lib/admin/auth.ts and lib/auth.ts).
 * Run: node scripts/set-admin-role.js
 * Then sign out and sign in again so the session gets a fresh JWT with the role.
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcryptjs = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "buddy@ebilly.com";
const DEFAULT_PASSWORD = "Test1111!"; // change if needed for local dev

async function main() {
  const hashedPassword = await bcryptjs.hash(DEFAULT_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", password: hashedPassword },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("✅ Set role to ADMIN for", user.email);
  console.log("   Sign out and sign in again to see the Admin nav and access /admin.");
}

main()
  .then(() => prisma.$disconnect())
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    pool.end();
    process.exit(1);
  });
