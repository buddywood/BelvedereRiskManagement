#!/usr/bin/env node
/**
 * Backfill Subscription rows for existing ADVISOR users (STRIPE-SPEC migration).
 * Tier: >25 active clients → PROFESSIONAL (75), else GROWTH (25).
 * Status GRACE_PERIOD, 30-day window, no Stripe IDs until Checkout.
 *
 * Usage: node scripts/migrate-advisor-subscriptions.js
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GRACE_DAYS = 30;

async function main() {
  console.log("Migrating advisor subscriptions…");

  const advisors = await prisma.user.findMany({
    where: { role: "ADVISOR", advisorProfile: { isNot: null } },
    select: {
      id: true,
      email: true,
      advisorProfile: { select: { id: true } },
    },
  });

  let created = 0;
  let skipped = 0;

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + GRACE_DAYS);

  for (const user of advisors) {
    if (!user.advisorProfile) continue;

    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const clientCount = await prisma.clientAdvisorAssignment.count({
      where: { advisorId: user.advisorProfile.id, status: "ACTIVE" },
    });

    const tier = clientCount > 25 ? "PROFESSIONAL" : "GROWTH";
    const clientLimit = clientCount > 25 ? 75 : 25;

    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier,
        status: "GRACE_PERIOD",
        clientLimit,
        billingCycle: "MONTHLY",
        currentPeriodEnd: periodEnd,
      },
    });

    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (sub) {
      await prisma.subscriptionAuditLog.create({
        data: {
          subscriptionId: sub.id,
          action: "migration_backfill",
          newTier: tier,
          metadata: {
            clientCountAtMigration: clientCount,
            email: user.email,
          },
        },
      });
    }

    created += 1;
    console.log(`  + ${user.email} → ${tier} (${clientCount} clients)`);
  }

  console.log(`Done. Created ${created}, skipped (already had subscription) ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
