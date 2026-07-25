-- Reconcile Preview/Neon drift for columns declared in schema.prisma whose
-- original migrations (20260724080000, 20260724090000, 20260725050000) are
-- recorded as applied in `_prisma_migrations` but whose ADD COLUMN statements
-- never landed (or only partially landed). Surfaced on preview.akilirisk.com as
-- digest 2654820978:
--   Invalid `prisma.advisorProfile.findUnique()` … column does not exist
--   Invalid `prisma.clientAdvisorAssignment.findMany()` … column does not exist
--
-- Idempotent: safe on DBs that already have the columns and on those that don't.

-- ── AdvisorProfile / AdvisorEnterprise: white-label client from-address ─────
ALTER TABLE "AdvisorEnterprise"
  ADD COLUMN IF NOT EXISTS "clientEmailFromAddress" TEXT;

ALTER TABLE "AdvisorProfile"
  ADD COLUMN IF NOT EXISTS "clientEmailFromAddress" TEXT;

-- ── ClientAdvisorAssignment: manual completion + assessment waiver ──────────
ALTER TABLE "ClientAdvisorAssignment"
  ADD COLUMN IF NOT EXISTS "manuallyCompletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "manuallyCompletedByAdvisorId" TEXT,
  ADD COLUMN IF NOT EXISTS "assessmentWaivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "assessmentWaivedByAdvisorId" TEXT;

-- ── Foreign keys (guarded — CREATE has no IF NOT EXISTS) ────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ClientAdvisorAssignment_manuallyCompletedByAdvisorId_fkey'
  ) THEN
    ALTER TABLE "ClientAdvisorAssignment"
      ADD CONSTRAINT "ClientAdvisorAssignment_manuallyCompletedByAdvisorId_fkey"
      FOREIGN KEY ("manuallyCompletedByAdvisorId")
      REFERENCES "AdvisorProfile"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ClientAdvisorAssignment_assessmentWaivedByAdvisorId_fkey'
  ) THEN
    ALTER TABLE "ClientAdvisorAssignment"
      ADD CONSTRAINT "ClientAdvisorAssignment_assessmentWaivedByAdvisorId_fkey"
      FOREIGN KEY ("assessmentWaivedByAdvisorId")
      REFERENCES "AdvisorProfile"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
