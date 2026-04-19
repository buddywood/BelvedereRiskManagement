import "server-only";

import { PillarCategoryKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { IntakeQuestion } from "@/lib/intake/types";
import { INTAKE_QUESTIONS } from "@/lib/intake/questions";
import {
  pillarQuestionInclude,
  sortPillarQuestionRows,
  type PillarQuestionWithHierarchy,
} from "@/lib/assessment/bank/pillar-question-wire";

const DEFAULT_RECORDING_TIPS = [
  "Speak clearly and at a normal pace",
  "Include concrete examples when they help",
  "It's fine to pause and gather your thoughts",
];

function recordingTipsFromRow(row: PillarQuestionWithHierarchy): string[] {
  const ra = row.recommendedActions?.trim();
  if (ra) {
    const parts = ra.split(/\n+|•|;/).map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts.slice(0, 8);
  }
  return DEFAULT_RECORDING_TIPS;
}

/**
 * Ordered intake script for the audio interview: visible `questions` rows whose category
 * is `PillarCategoryKind.INTAKE`. If none exist, returns legacy `INTAKE_QUESTIONS` (TypeScript).
 */
export async function loadIntakeScriptQuestions(): Promise<IntakeQuestion[]> {
  try {
    const rows = (await prisma.pillarQuestion.findMany({
      where: {
        isVisible: true,
        section: { category: { kind: PillarCategoryKind.INTAKE } },
      },
      include: pillarQuestionInclude,
    })) as PillarQuestionWithHierarchy[];

    if (rows.length === 0) {
      return INTAKE_QUESTIONS;
    }

    const sorted = sortPillarQuestionRows(rows);
    return sorted.map((row, i) => {
      const why = row.whyThisMatters?.trim();
      return {
        id: row.id,
        questionNumber: i + 1,
        questionText: row.questionText,
        whyThisMatters: why || undefined,
        context:
          why ||
          "Take your time; speak naturally as if in conversation with your advisor.",
        recordingTips: recordingTipsFromRow(row),
      };
    });
  } catch (e) {
    console.warn("[loadIntakeScriptQuestions] falling back to static list:", e);
    return INTAKE_QUESTIONS;
  }
}
