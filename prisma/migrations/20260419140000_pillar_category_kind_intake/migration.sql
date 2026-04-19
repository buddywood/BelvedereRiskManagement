-- Distinguish intake script categories from scored assessment workbook categories.

CREATE TYPE "pillar_category_kind" AS ENUM ('INTAKE', 'ASSESSMENT');

ALTER TABLE "categories" ADD COLUMN "category_kind" "pillar_category_kind" NOT NULL DEFAULT 'ASSESSMENT';

UPDATE "categories" SET "category_kind" = 'INTAKE' WHERE "code" = 'intake';
