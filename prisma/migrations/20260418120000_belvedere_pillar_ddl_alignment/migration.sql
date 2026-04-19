-- Align pillar workbook tables with Belvedere Household Risk Profile DDL (source of truth).
-- categories: code, display_order; drop legacy category weight_pct.
-- sections: display_order, wider text fields, UNIQUE(category_id, code).
-- questions: display_order, cross_reference (renamed from notes), wider question_number,
--   NOT NULL answer_type default, UNIQUE(section_id, question_number), UNIQUE(section_id, display_order).

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
ALTER TABLE "categories" DROP COLUMN IF EXISTS "weight_pct";

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "code" VARCHAR(50);
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;

UPDATE "categories"
SET "code" = LEFT(
  LOWER(REGEXP_REPLACE(
    COALESCE(NULLIF(TRIM("sheet_name"), ''), NULLIF(TRIM("name"), ''), 'pillar'),
    '[^a-zA-Z0-9]+',
    '_',
    'g'
  )),
  50
)
WHERE "code" IS NULL OR TRIM("code") = '';

UPDATE "categories" SET "name" = COALESCE(NULLIF(TRIM("name"), ''), 'Unnamed') WHERE "name" IS NULL;

ALTER TABLE "categories" ALTER COLUMN "name" TYPE VARCHAR(200);
ALTER TABLE "categories" ALTER COLUMN "sheet_name" TYPE VARCHAR(200);
ALTER TABLE "categories" ALTER COLUMN "code" SET NOT NULL;

DROP INDEX IF EXISTS "categories_code_key";
CREATE UNIQUE INDEX "categories_code_key" ON "categories" ("code");

-- ---------------------------------------------------------------------------
-- sections
-- ---------------------------------------------------------------------------
ALTER TABLE "sections" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;

UPDATE "sections" SET "code" = COALESCE(NULLIF(TRIM("code"), ''), '_') WHERE "code" IS NULL OR TRIM("code") = '';
UPDATE "sections" SET "name" = COALESCE(NULLIF(TRIM("name"), ''), 'Unnamed') WHERE "name" IS NULL;

ALTER TABLE "sections" ALTER COLUMN "code" TYPE VARCHAR(20);
ALTER TABLE "sections" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "sections" ALTER COLUMN "name" TYPE VARCHAR(300);
ALTER TABLE "sections" ALTER COLUMN "name" SET NOT NULL;

DROP INDEX IF EXISTS "sections_category_id_code_key";
CREATE UNIQUE INDEX "sections_category_id_code_key" ON "sections" ("category_id", "code");

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE "questions" RENAME COLUMN "notes" TO "cross_reference";
  END IF;
END $$;

ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "questions" ALTER COLUMN "question_number" TYPE VARCHAR(20);

UPDATE "questions" SET "answer_type" = 'scored_0_3' WHERE "answer_type" IS NULL;
ALTER TABLE "questions" ALTER COLUMN "answer_type" SET DEFAULT 'scored_0_3';
ALTER TABLE "questions" ALTER COLUMN "answer_type" SET NOT NULL;

DROP INDEX IF EXISTS "questions_section_id_question_number_key";
CREATE UNIQUE INDEX "questions_section_id_question_number_key" ON "questions" ("section_id", "question_number");

DROP INDEX IF EXISTS "questions_section_id_display_order_key";
CREATE UNIQUE INDEX "questions_section_id_display_order_key" ON "questions" ("section_id", "display_order");
