import { describe, expect, it } from "vitest";

import { coerceMultiChoiceAnswer } from "./multi-choice-answer";

describe("coerceMultiChoiceAnswer", () => {
  it("passes through arrays", () => {
    expect(coerceMultiChoiceAnswer(["MFA", "Backups"])).toEqual(["MFA", "Backups"]);
    expect(coerceMultiChoiceAnswer([1, "2"])).toEqual([1, "2"]);
  });

  it("parses stringified JSON arrays so multi-select can accumulate", () => {
    expect(coerceMultiChoiceAnswer(JSON.stringify(["MFA", "Backups"]))).toEqual([
      "MFA",
      "Backups",
    ]);
  });

  it("treats a bare token as a single selection", () => {
    expect(coerceMultiChoiceAnswer("MFA")).toEqual(["MFA"]);
  });

  it("returns empty for blank / unknown shapes", () => {
    expect(coerceMultiChoiceAnswer(null)).toEqual([]);
    expect(coerceMultiChoiceAnswer(undefined)).toEqual([]);
    expect(coerceMultiChoiceAnswer("")).toEqual([]);
    expect(coerceMultiChoiceAnswer({})).toEqual([]);
  });
});
