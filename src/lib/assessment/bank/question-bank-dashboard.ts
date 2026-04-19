import "server-only";

import { prisma } from "@/lib/db";
import type { GovernanceQuestionWire } from "./behaviors";
import { loadGovernanceQuestionWires } from "./load-bank";

/**
 * Question bank UI rows: same resolution order as assessments (`loadGovernanceQuestionWires`).
 * `hasAssessmentBankRow` is false for pillar-DDL-only questions (admin edit/reorder does not apply).
 */
export type QuestionBankDashboardRow = GovernanceQuestionWire & {
  hasAssessmentBankRow: boolean;
  isVisible: boolean;
};

export type QuestionBankAreaCounts = {
  total: number;
  visible: number;
};

/**
 * Per–risk-area totals for the admin question bank index. Matches `loadGovernanceQuestionWires`
 * (pillar DDL when `questions` has rows, else `AssessmentBankQuestion`). Visible counts use
 * `AssessmentBankQuestion.isVisible` when a row exists for that `questionId`; otherwise
 * `questions.is_visible` for pillar-only ids.
 */
export async function loadQuestionBankCountsByRiskArea(): Promise<
  Record<string, QuestionBankAreaCounts>
> {
  const allWires = await loadGovernanceQuestionWires({
    onlyVisible: false,
  });

  const result: Record<string, QuestionBankAreaCounts> = {};
  if (allWires.length === 0) return result;

  const questionIds = [...new Set(allWires.map((w) => w.questionId))];
  const bankRows = await prisma.assessmentBankQuestion.findMany({
    where: { questionId: { in: questionIds } },
    select: { questionId: true, isVisible: true },
  });
  const visibilityByQuestionId = new Map(
    bankRows.map((r) => [r.questionId, r.isVisible])
  );

  const pillarRows = await prisma.pillarQuestion.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, isVisible: true },
  });
  const pillarVisibilityById = new Map(pillarRows.map((r) => [r.id, r.isVisible]));

  for (const w of allWires) {
    const area = w.riskAreaId;
    if (area === null) continue;
    if (!result[area]) result[area] = { total: 0, visible: 0 };
    result[area].total += 1;
    const bankVis = visibilityByQuestionId.get(w.questionId);
    const pillarVis = pillarVisibilityById.get(w.questionId);
    const countsAsVisible =
      bankVis !== undefined ? bankVis === true : (pillarVis ?? true) === true;
    if (countsAsVisible) result[area].visible += 1;
  }

  return result;
}

export async function loadQuestionBankDashboardRows(
  riskAreaId: string
): Promise<QuestionBankDashboardRow[]> {
  const wires = await loadGovernanceQuestionWires({
    onlyVisible: false,
    riskAreaId,
  });
  if (wires.length === 0) return [];

  const questionIds = wires.map((w) => w.questionId);
  const bankRows = await prisma.assessmentBankQuestion.findMany({
    where: { riskAreaId, questionId: { in: questionIds } },
  });
  const bankByQuestionId = new Map(bankRows.map((r) => [r.questionId, r]));

  const pillarRows = await prisma.pillarQuestion.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, isVisible: true },
  });
  const pillarVisibilityById = new Map(pillarRows.map((r) => [r.id, r.isVisible]));

  return wires.map((w) => {
    const b = bankByQuestionId.get(w.questionId);
    const pillarVis = pillarVisibilityById.get(w.questionId);
    return {
      ...w,
      hasAssessmentBankRow: Boolean(b),
      isVisible: b !== undefined ? b.isVisible : (pillarVis ?? true),
    };
  });
}
