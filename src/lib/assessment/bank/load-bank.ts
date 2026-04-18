import "server-only";

import { prisma } from "@/lib/db";
import type { GovernanceQuestionWire } from "./behaviors";
import { wireQuestionsToQuestions } from "./behaviors";
import type { Question } from "@/lib/assessment/types";
import { prismaRowToWire } from "./row-wire";

export { prismaRowToWire } from "./row-wire";

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
