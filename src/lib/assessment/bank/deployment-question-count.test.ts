import { describe, expect, it } from "vitest";
import { deploymentVisibleQuestionCount } from "./deployment-question-count";

describe("deploymentVisibleQuestionCount", () => {
  it("uses pillar visible count when pillar bank is enabled and rows exist", () => {
    expect(
      deploymentVisibleQuestionCount({
        pillarBankDisabled: false,
        pillarTotalCount: 179,
        pillarVisibleCount: 179,
        bankVisibleCount: 0,
      })
    ).toBe(179);
  });

  it("uses pillar visible subset when some pillar rows are hidden", () => {
    expect(
      deploymentVisibleQuestionCount({
        pillarBankDisabled: false,
        pillarTotalCount: 50,
        pillarVisibleCount: 12,
        bankVisibleCount: 99,
      })
    ).toBe(12);
  });

  it("uses bank visible count when pillar bank is disabled", () => {
    expect(
      deploymentVisibleQuestionCount({
        pillarBankDisabled: true,
        pillarTotalCount: 179,
        pillarVisibleCount: 179,
        bankVisibleCount: 12,
      })
    ).toBe(12);
  });

  it("uses bank when pillar enabled but questions table empty", () => {
    expect(
      deploymentVisibleQuestionCount({
        pillarBankDisabled: false,
        pillarTotalCount: 0,
        pillarVisibleCount: 0,
        bankVisibleCount: 120,
      })
    ).toBe(120);
  });
});
