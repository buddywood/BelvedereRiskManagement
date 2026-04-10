import "server-only";

import type { AssessmentBankQuestion } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { BranchingPredicateWire, GovernanceQuestionWire } from "./behaviors";
import { wireQuestionsToQuestions } from "./behaviors";
import type { Question } from "@/lib/assessment/types";

export function prismaRowToWire(row: AssessmentBankQuestion): GovernanceQuestionWire {
  const scoreMap =
    typeof row.scoreMap === "object" && row.scoreMap !== null && !Array.isArray(row.scoreMap)
      ? (row.scoreMap as Record<string, unknown>)
      : {};

  const predicate =
    row.branchingPredicate &&
    typeof row.branchingPredicate === "object" &&
    !Array.isArray(row.branchingPredicate)
      ? (row.branchingPredicate as { op?: string; value?: unknown })
      : null;

  let branchingPredicate: BranchingPredicateWire | null = null;
  if (
    predicate &&
    (predicate.op === "equals" || predicate.op === "notEquals") &&
    "value" in predicate
  ) {
    branchingPredicate = {
      op: predicate.op as BranchingPredicateWire["op"],
      value: predicate.value,
    };
  }

  return {
    questionId: row.questionId,
    riskAreaId: row.riskAreaId,
    sortOrderGlobal: row.sortOrderGlobal,
    text: row.text,
    helpText: row.helpText,
    learnMore: row.learnMore,
    riskRelevance: row.riskRelevance,
    type: row.type,
    options: row.options ?? null,
    required: row.required,
    weight: row.weight,
    scoreMap,
    branchingDependsOn: row.branchingDependsOn,
    branchingPredicate,
    profileConditionKey: row.profileConditionKey,
    omitMaturityScoreWhenYes: row.omitMaturityScoreWhenYes,
  };
}

export async function loadGovernanceQuestionWires(options: {
  onlyVisible: boolean;
  riskAreaId?: string;
}): Promise<GovernanceQuestionWire[]> {
  const rows = await prisma.assessmentBankQuestion.findMany({
    where: {
      ...(options.onlyVisible ? { isVisible: true } : {}),
      ...(options.riskAreaId ? { riskAreaId: options.riskAreaId } : {}),
    },
    orderBy: { sortOrderGlobal: "asc" },
  });
  return rows.map(prismaRowToWire);
}

export async function loadGovernanceQuestionsMerged(options: {
  onlyVisible: boolean;
  riskAreaId?: string;
}): Promise<Question[]> {
  const wires = await loadGovernanceQuestionWires(options);
  return wireQuestionsToQuestions(wires);
}

export async function countVisibleGovernanceQuestions(): Promise<number> {
  return prisma.assessmentBankQuestion.count({ where: { isVisible: true } });
}
