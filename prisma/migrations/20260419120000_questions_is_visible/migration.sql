-- Client visibility for pillar DDL questions (admin hide/show).
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "questions_is_visible_idx" ON "questions"("is_visible");
