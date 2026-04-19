import type { PillarCategory, PillarQuestion, PillarSection } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { GovernanceQuestionWire } from "./behaviors";
import { riskAreaIdForPillarCategory } from "./pillar-category-risk-area";

export type PillarQuestionWithHierarchy = PillarQuestion & {
  section: PillarSection & { category: PillarCategory };
};

export const pillarQuestionInclude = {
  section: { include: { category: true } },
} satisfies Prisma.PillarQuestionInclude;

function cleanLabel(s: string | null | undefined, fallback: string): string {
  const t = (s ?? "").trim();
  return t || fallback;
}

function wireForScored03(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  const a0 = cleanLabel(row.answer0, "0");
  const a1 = cleanLabel(row.answer1, "1");
  const a2 = cleanLabel(row.answer2, "2");
  const a3 = cleanLabel(row.answer3, "3");
  const options = [0, 1, 2, 3].map((value) => ({
    value,
    label: [a0, a1, a2, a3][value] ?? `Level ${value}`,
    description: [a0, a1, a2, a3][value] ?? "",
  }));
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters,
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "maturity-scale",
    options,
    required: true,
    weight: row.section.weightPct ?? 2,
    scoreMap: { 0: 0, 1: 1, 2: 2, 3: 3 },
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

function wireForScale15(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  const labels = [
    cleanLabel(row.answer0, "1"),
    cleanLabel(row.answer1, "2"),
    cleanLabel(row.answer2, "3"),
    cleanLabel(row.answer3, "4–5"),
  ];
  const options = [1, 2, 3, 4, 5].map((value, i) => ({
    value: String(value),
    label: String(value),
    description: labels[Math.min(i, labels.length - 1)] ?? String(value),
  }));
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters,
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "single-choice",
    options,
    required: true,
    weight: row.section.weightPct ?? 2,
    scoreMap: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

function wireForYesNo(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters,
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "yes-no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    required: true,
    weight: row.section.weightPct ?? 2,
    scoreMap: { yes: 3, no: 0 },
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

function wireForFillable(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters,
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "short-text",
    options: null,
    required: true,
    weight: row.section.weightPct ?? 1,
    scoreMap: {},
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

function wireForNumber(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters,
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "numeric",
    options: null,
    required: true,
    weight: row.section.weightPct ?? 1,
    scoreMap: {},
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

function wireForDate(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  return {
    questionId: row.id,
    riskAreaId: riskAreaIdForPillarCategory(row.section.category),
    sortOrderGlobal: 0,
    text: row.questionText,
    helpText: row.whyThisMatters ?? "Use MM/YYYY format where possible.",
    learnMore: row.recommendedActions,
    riskRelevance: row.whyThisMatters,
    type: "short-text",
    options: null,
    required: true,
    weight: row.section.weightPct ?? 1,
    scoreMap: {},
    branchingDependsOn: null,
    branchingPredicate: null,
    profileConditionKey: null,
    omitMaturityScoreWhenYes: false,
  };
}

export function pillarQuestionRowToWire(row: PillarQuestionWithHierarchy): GovernanceQuestionWire {
  switch (row.answerType) {
    case "yes_no":
      return wireForYesNo(row);
    case "fillable":
      return wireForFillable(row);
    case "number":
      return wireForNumber(row);
    case "date_mm_yyyy":
      return wireForDate(row);
    case "scale_1_5":
      return wireForScale15(row);
    case "scored_0_3":
    default:
      return wireForScored03(row);
  }
}

export function assignSortOrderGlobals(wires: GovernanceQuestionWire[]): GovernanceQuestionWire[] {
  return wires.map((w, i) => ({ ...w, sortOrderGlobal: i }));
}

export function sortPillarQuestionRows(
  rows: PillarQuestionWithHierarchy[]
): PillarQuestionWithHierarchy[] {
  return [...rows].sort((a, b) => {
    const ca = a.section.category.displayOrder - b.section.category.displayOrder;
    if (ca !== 0) return ca;
    const cc = a.section.category.code.localeCompare(b.section.category.code);
    if (cc !== 0) return cc;
    const sa = a.section.displayOrder - b.section.displayOrder;
    if (sa !== 0) return sa;
    const sc = a.section.code.localeCompare(b.section.code);
    if (sc !== 0) return sc;
    return a.displayOrder - b.displayOrder;
  });
}
