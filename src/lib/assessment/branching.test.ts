import { describe, it, expect } from "vitest";
import {
  shouldShowQuestion,
  getNextQuestion,
  getPreviousQuestion,
  getVisibleQuestions,
  calculateCompletionPercentage,
  getUnansweredRequiredQuestions,
  detectBranchingChanges,
  getOrphanedAnswerIds,
} from "./branching";
import { allQuestions } from "./questions";
import type { Question } from "./types";

// Test data using simple mock questions for basic functionality
const questionNoBranch: Question = {
  id: "q-no-branch",
  text: "No branch?",
  type: "yes-no",
  required: true,
  pillar: "test",
  subCategory: "cat1",
  weight: 1,
  scoreMap: { yes: 1, no: 0 },
};

const questionWithBranch: Question = {
  id: "q-branch",
  text: "Show only if trust?",
  type: "yes-no",
  required: true,
  pillar: "test",
  subCategory: "cat1",
  weight: 1,
  scoreMap: { yes: 1, no: 0 },
  branchingRule: {
    dependsOn: "has-trust",
    showIf: (answer) => answer === "yes",
  },
};

const mockQuestions: Question[] = [
  { ...questionNoBranch, id: "q1" },
  { ...questionWithBranch, id: "q2", branchingRule: { dependsOn: "q1", showIf: (a) => a === "yes" } },
  { id: "q3", text: "Q3?", type: "yes-no", required: true, pillar: "test", subCategory: "cat1", weight: 1, scoreMap: {} },
];

// Helper function to get dependent question IDs for each gate
function getDependentQuestionIds(gateId: string): string[] {
  return allQuestions
    .filter(q => q.branchingRule?.dependsOn === gateId)
    .map(q => q.id)
    .sort();
}

describe("shouldShowQuestion", () => {
  it("returns true when question has no branching rule", () => {
    expect(shouldShowQuestion(questionNoBranch, {})).toBe(true);
    expect(shouldShowQuestion(questionNoBranch, { "q-no-branch": "yes" })).toBe(true);
  });

  it("returns false when dependency not answered", () => {
    expect(shouldShowQuestion(questionWithBranch, {})).toBe(false);
    expect(shouldShowQuestion(questionWithBranch, { other: "x" })).toBe(false);
  });

  it("returns true when dependency answered and showIf matches", () => {
    expect(shouldShowQuestion(questionWithBranch, { "has-trust": "yes" })).toBe(true);
  });

  it("returns false when dependency answered but showIf does not match", () => {
    expect(shouldShowQuestion(questionWithBranch, { "has-trust": "no" })).toBe(false);
  });
});

describe("getNextQuestion", () => {
  it("returns first question when currentId is null", () => {
    expect(getNextQuestion(null, {}, mockQuestions)).toBe("q1");
  });

  it("returns null when questions array is empty", () => {
    expect(getNextQuestion(null, {}, [])).toBe(null);
  });

  it("returns next visible question", () => {
    // q1 visible, q2 visible only if q1 is "yes", q3 always visible
    expect(getNextQuestion("q1", { q1: "yes" }, mockQuestions)).toBe("q2");
    expect(getNextQuestion("q2", { q1: "yes" }, mockQuestions)).toBe("q3");
  });

  it("returns null when at last question", () => {
    expect(getNextQuestion("q3", { q1: "yes", q2: "yes" }, mockQuestions)).toBe(null);
  });
});

describe("detectBranchingChanges", () => {
  it("detects newly visible questions when trust gate changes from no to yes", () => {
    const previousAnswers = { "teg-01": "no" };
    const currentAnswers = { "teg-01": "yes" };

    const changes = detectBranchingChanges(previousAnswers, currentAnswers, allQuestions);

    const expectedNewlyVisible = getDependentQuestionIds("teg-01");
    expect(changes.newlyVisible).toEqual(expectedNewlyVisible);
    expect(changes.newlyHidden).toEqual([]);
    expect(changes.unchanged).toContain("teg-01"); // Gate question itself is unchanged in visibility
  });

  it("detects newly hidden questions when trust gate changes from yes to no", () => {
    const previousAnswers = { "teg-01": "yes" };
    const currentAnswers = { "teg-01": "no" };

    const changes = detectBranchingChanges(previousAnswers, currentAnswers, allQuestions);

    const expectedNewlyHidden = getDependentQuestionIds("teg-01");
    expect(changes.newlyHidden).toEqual(expectedNewlyHidden);
    expect(changes.newlyVisible).toEqual([]);
    expect(changes.unchanged).toContain("teg-01");
  });

  it("detects changes for succession planning gate", () => {
    const previousAnswers = { "sp-01": "no" };
    const currentAnswers = { "sp-01": "yes" };

    const changes = detectBranchingChanges(previousAnswers, currentAnswers, allQuestions);

    const expectedNewlyVisible = getDependentQuestionIds("sp-01");
    expect(changes.newlyVisible).toEqual(expectedNewlyVisible);
    expect(changes.newlyHidden).toEqual([]);
  });

  it("detects changes for business involvement gate", () => {
    const previousAnswers = { "bi-01": "no" };
    const currentAnswers = { "bi-01": "yes" };

    const changes = detectBranchingChanges(previousAnswers, currentAnswers, allQuestions);

    const expectedNewlyVisible = getDependentQuestionIds("bi-01");
    expect(changes.newlyVisible).toEqual(expectedNewlyVisible);
    expect(changes.newlyHidden).toEqual([]);
  });

  it("handles multiple gate changes simultaneously", () => {
    const previousAnswers = { "teg-01": "yes", "sp-01": "no", "bi-01": "no" };
    const currentAnswers = { "teg-01": "no", "sp-01": "yes", "bi-01": "yes" };

    const changes = detectBranchingChanges(previousAnswers, currentAnswers, allQuestions);

    const expectedNewlyVisible = [
      ...getDependentQuestionIds("sp-01"),
      ...getDependentQuestionIds("bi-01"),
    ].sort();
    const expectedNewlyHidden = getDependentQuestionIds("teg-01");

    expect(changes.newlyVisible).toEqual(expectedNewlyVisible);
    expect(changes.newlyHidden).toEqual(expectedNewlyHidden);
  });

  it("returns empty arrays when no branching changes occur", () => {
    const answers = { "teg-01": "yes", "sp-01": "no", "bi-01": "yes" };

    const changes = detectBranchingChanges(answers, answers, allQuestions);

    expect(changes.newlyVisible).toEqual([]);
    expect(changes.newlyHidden).toEqual([]);
    expect(changes.unchanged.length).toBeGreaterThan(0);
  });
});

describe("getOrphanedAnswerIds", () => {
  it("identifies trust answers as orphaned when trust gate is no", () => {
    // User answered trust questions but then changed gate to "no"
    const answers = {
      "teg-01": "no", // Gate says no trusts
      "teg-02": "centralized", // But user previously answered trust questions
      "teg-03": "professional",
      "teg-04": 2,
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).toContain("teg-02");
    expect(orphanedIds).toContain("teg-03");
    expect(orphanedIds).toContain("teg-04");
    expect(orphanedIds).not.toContain("teg-01"); // Gate question itself is visible
  });

  it("identifies succession planning answers as orphaned when gate is no", () => {
    const answers = {
      "sp-01": "no", // Gate says no heirs
      "sp-02": 2, // But user previously answered succession questions
      "sp-03": "training",
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).toContain("sp-02");
    expect(orphanedIds).toContain("sp-03");
    expect(orphanedIds).not.toContain("sp-01");
  });

  it("identifies business involvement answers as orphaned when gate is no", () => {
    const answers = {
      "bi-01": "no", // Gate says no family business
      "bi-02": "documented", // But user previously answered business questions
      "bi-03": "market",
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).toContain("bi-02");
    expect(orphanedIds).toContain("bi-03");
    expect(orphanedIds).not.toContain("bi-01");
  });

  it("returns empty array when no answers are orphaned", () => {
    const answers = {
      "teg-01": "yes", // Gate allows trust questions
      "teg-02": "centralized", // Trust questions are visible
      "sp-01": "no", // No succession planning
      "bi-01": "no", // No business involvement
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).toEqual([]);
  });

  it("handles answers to questions with no branching rules (never orphaned)", () => {
    const answers = {
      "dma-01": 3, // Decision-making question with no branching rule
      "teg-01": "no", // Trust gate
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).not.toContain("dma-01"); // Non-branched questions are never orphaned
    expect(orphanedIds).not.toContain("teg-01"); // Gate questions are never orphaned
  });

  it("ignores unanswered questions", () => {
    const answers = {
      "teg-01": "no", // Gate says no trusts
      "teg-02": null, // Unanswered question shouldn't be considered orphaned
      "teg-03": undefined,
    };

    const orphanedIds = getOrphanedAnswerIds(answers, allQuestions);

    expect(orphanedIds).toEqual([]);
  });
});

describe("calculateCompletionPercentage with mixed visible/hidden answers", () => {
  it("calculates percentage based only on visible questions", () => {
    // User has trusts (shows trust questions) but no business or heirs
    const answers = {
      "dma-01": 3, // Always visible - answered
      "dma-02": "criteria-clear", // Always visible - answered
      "teg-01": "yes", // Gate question - answered (shows trust section)
      "teg-02": "centralized", // Trust question - answered (visible)
      "sp-01": "no", // Gate question - answered (hides succession section)
      "bi-01": "no", // Gate question - answered (hides business section)
    };

    const percentage = calculateCompletionPercentage(answers, allQuestions);

    // Should only count visible questions in the denominator
    // Trust section is visible, succession and business sections are hidden
    const visibleQuestions = getVisibleQuestions(answers, allQuestions);
    const answeredVisible = visibleQuestions.filter(q => {
      const answer = answers[q.id as keyof typeof answers];
      return answer !== undefined && answer !== null;
    }).length;

    const expectedPercentage = Math.round((answeredVisible / visibleQuestions.length) * 100);
    expect(percentage).toBe(expectedPercentage);
    expect(percentage).toBeGreaterThan(0);
  });

  it("handles case where all sections are hidden", () => {
    const answers = {
      "dma-01": 3, // Always visible
      "teg-01": "no", // Hides trust section
      "sp-01": "no", // Hides succession section
      "bi-01": "no", // Hides business section
    };

    const percentage = calculateCompletionPercentage(answers, allQuestions);
    expect(percentage).toBeGreaterThan(0); // Should work with just the always-visible questions
  });
});
