/**
 * Upsert the family-governance assessment bank from canonical `allQuestions`.
 * Run: npx tsx scripts/seed-assessment-bank.ts
 */
import "dotenv/config";
import type { Prisma } from "@prisma/client";
import { allQuestions } from "../src/lib/assessment/questions";
import {
  inferBranchingPayload,
  profileConditionKeyForQuestion,
} from "../src/lib/assessment/bank/branching-infer";
import { prisma } from "../src/lib/db";

function branchingPredicateAsJson(
  p: { op: "equals" | "notEquals"; value: unknown } | null
): Prisma.InputJsonValue | undefined {
  if (!p) return undefined;
  return JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue;
}

async function main() {
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
        type: q.type,
        options: q.options ? (q.options as object) : undefined,
        required: q.required,
        weight: q.weight,
        scoreMap: q.scoreMap as object,
        branchingDependsOn,
        branchingPredicate: branchingPredicateAsJson(branchingPredicate),
        profileConditionKey,
      },
      update: {
        riskAreaId: q.subCategory,
        sortOrderGlobal: i,
        text: q.text,
        helpText: q.helpText ?? null,
        learnMore: q.learnMore ?? null,
        type: q.type,
        options: q.options ? (q.options as object) : undefined,
        required: q.required,
        weight: q.weight,
        scoreMap: q.scoreMap as object,
        branchingDependsOn,
        branchingPredicate: branchingPredicateAsJson(branchingPredicate),
        profileConditionKey,
      },
    });
  }

  console.log(`Seeded ${allQuestions.length} assessment bank questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
