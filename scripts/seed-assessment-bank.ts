/**
 * Seed `AssessmentBankQuestion` from the Belvedere spreadsheet (source of truth).
 *
 * Resolution order:
 * 1. `BELVEDERE_WORKBOOK_PATH` or repo-root `Belvedere_Household_Risk_Profile.xlsx` — import all recognized tabs.
 * 2. If no workbook / workbook parses 0 rows: fails unless `QUESTION_BANK_FALLBACK_TYPESCRIPT=1`, then seeds from
 *    `src/lib/assessment/questions.ts` (dev / tests only — not equivalent to spreadsheet IDs).
 *
 * Run from repo root: `npm run seed:assessment-bank`
 */
import "./load-repo-env";
import type { Prisma } from "@prisma/client";
import { allQuestions } from "../src/lib/assessment/questions";
import {
  inferBranchingPayload,
  profileConditionKeyForQuestion,
} from "../src/lib/assessment/bank/branching-infer";
import {
  workbookExists,
  resolveWorkbookPath,
  importBelvedereWorkbookAllSheets,
} from "./lib/belvedere-workbook";
import { prisma, disconnectPrismaScript } from "./lib/prisma-for-scripts";

const FALLBACK_TYPESCRIPT = process.env.QUESTION_BANK_FALLBACK_TYPESCRIPT?.trim() === "1";

function branchingPredicateAsJson(
  p: { op: "equals" | "notEquals"; value: unknown } | null
): Prisma.InputJsonValue | undefined {
  if (!p) return undefined;
  return JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue;
}

async function seedFromTypeScriptCatalog(): Promise<void> {
  const byId = new Map(allQuestions.map((q) => [q.id, q]));

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    let branchingDependsOn: string | null = null;
    let branchingPredicate: { op: "equals" | "notEquals"; value: unknown } | null = null;

    try {
      const inferred = inferBranchingPayload(q, byId);
      if (inferred) {
        branchingDependsOn = inferred.dependsOn;
        branchingPredicate = inferred.predicate;
      }
    } catch (e) {
      console.error(`Branching inference failed for ${q.id}:`, e);
      throw e;
    }

    const profileConditionKey = profileConditionKeyForQuestion(q);

    await prisma.assessmentBankQuestion.upsert({
      where: { questionId: q.id },
      create: {
        questionId: q.id,
        riskAreaId: q.subCategory,
        sortOrderGlobal: i,
        isVisible: true,
        text: q.text,
        helpText: q.helpText ?? null,
        learnMore: q.learnMore ?? null,
        riskRelevance: q.riskRelevance ?? null,
        type: q.type,
        options: q.options ? (q.options as object) : undefined,
        required: q.required,
        weight: q.weight,
        scoreMap: q.scoreMap as object,
        branchingDependsOn,
        branchingPredicate: branchingPredicateAsJson(branchingPredicate),
        profileConditionKey,
        omitMaturityScoreWhenYes: q.omitMaturityScoreWhenYes === true,
      },
      update: {
        riskAreaId: q.subCategory,
        sortOrderGlobal: i,
        text: q.text,
        helpText: q.helpText ?? null,
        learnMore: q.learnMore ?? null,
        riskRelevance: q.riskRelevance ?? null,
        type: q.type,
        options: q.options ? (q.options as object) : undefined,
        required: q.required,
        weight: q.weight,
        scoreMap: q.scoreMap as object,
        branchingDependsOn,
        branchingPredicate: branchingPredicateAsJson(branchingPredicate),
        profileConditionKey,
        omitMaturityScoreWhenYes: q.omitMaturityScoreWhenYes === true,
      },
    });
  }

  console.log(`Seeded ${allQuestions.length} assessment bank questions from TypeScript catalog (fallback).`);
}

async function seedFromWorkbook(): Promise<boolean> {
  const wbPath = resolveWorkbookPath();
  if (!workbookExists(wbPath)) {
    return false;
  }

  const r = await importBelvedereWorkbookAllSheets(prisma, wbPath);
  if (r.questionCount === 0) {
    console.warn(
      `Workbook found at ${wbPath} but 0 questions were parsed. Check tab names (Governance, Cyber, Physical, …) and A.–F. row layout (see scripts/lib/belvedere-workbook.ts).`
    );
    return false;
  }

  console.log(`Seeded ${r.questionCount} questions from Belvedere workbook (source of truth).`);
  console.log(`   Path: ${wbPath}`);
  console.log(`   Tabs: ${r.sheets.join(", ")}`);
  return true;
}

async function main(): Promise<void> {
  const wbPath = resolveWorkbookPath();

  if (await seedFromWorkbook()) {
    return;
  }

  if (!FALLBACK_TYPESCRIPT) {
    console.error(
      [
        "Assessment bank was not loaded from a spreadsheet.",
        "",
        `Expected workbook: ${wbPath}`,
        "Set BELVEDERE_WORKBOOK_PATH to your .xlsx, or place the default file at the repo root.",
        "",
        "For dev/tests only (IDs and scoreMaps differ from spreadsheet):",
        "  QUESTION_BANK_FALLBACK_TYPESCRIPT=1 npm run seed:assessment-bank",
      ].join("\n")
    );
    process.exit(1);
  }

  console.warn(
    "QUESTION_BANK_FALLBACK_TYPESCRIPT=1 — seeding from src/lib/assessment/questions.ts. " +
      "This is not spreadsheet-driven; question IDs will not match Belvedere imports."
  );
  await seedFromTypeScriptCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrismaScript();
  });
