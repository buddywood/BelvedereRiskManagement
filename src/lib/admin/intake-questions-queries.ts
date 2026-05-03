import "server-only";

import { PillarCategoryKind } from "@prisma/client";

import { requireAdminRole } from "@/lib/admin/auth";
import {
  pillarQuestionInclude,
  sortPillarQuestionRows,
  type PillarQuestionWithHierarchy,
} from "@/lib/assessment/bank/pillar-question-wire";
import { prisma } from "@/lib/db";

/** All intake-category pillar questions (any visibility), sorted for admin review. */
export async function getIntakeScriptQuestionsForAdmin(): Promise<PillarQuestionWithHierarchy[]> {
  await requireAdminRole();
  const rows = (await prisma.pillarQuestion.findMany({
    where: {
      section: { category: { kind: PillarCategoryKind.INTAKE } },
    },
    include: pillarQuestionInclude,
  })) as PillarQuestionWithHierarchy[];

  return sortPillarQuestionRows(rows);
}

export async function getIntakeQuestionForAdmin(
  questionId: string
): Promise<PillarQuestionWithHierarchy | null> {
  await requireAdminRole();
  return prisma.pillarQuestion.findFirst({
    where: {
      id: questionId,
      section: { category: { kind: PillarCategoryKind.INTAKE } },
    },
    include: pillarQuestionInclude,
  });
}
