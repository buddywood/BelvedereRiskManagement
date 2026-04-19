-- Pillar workbook structure: categories (tabs / major groupings) → sections → questions.
-- Aligns with spreadsheet columns for labels, answer types, and 0–3 maturity copy.

CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100),
    "sheet_name" VARCHAR(100),
    "weight_pct" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "code" VARCHAR(10),
    "name" VARCHAR(200),
    "objective" TEXT,
    "weight_pct" INTEGER,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "section_id" UUID NOT NULL,
    "question_number" VARCHAR(10),
    "question_text" TEXT NOT NULL,
    "answer_type" VARCHAR(50),
    "answer_0" TEXT,
    "answer_1" TEXT,
    "answer_2" TEXT,
    "answer_3" TEXT,
    "why_this_matters" TEXT,
    "recommended_actions" TEXT,
    "is_sub_question" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sections_category_id_idx" ON "sections"("category_id");

CREATE INDEX "questions_section_id_idx" ON "questions"("section_id");

ALTER TABLE "sections" ADD CONSTRAINT "sections_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
