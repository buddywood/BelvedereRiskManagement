/**
 * Question count for deployment / health checks when pillar DDL may own the bank.
 * Mirrors the intent of `load-bank`: pillar `questions` rows win unless
 * `USE_PILLAR_QUESTION_BANK=0`.
 */
export function deploymentVisibleQuestionCount(input: {
  pillarBankDisabled: boolean;
  /** Any rows in `questions` — decides whether the merged bank is pillar-backed. */
  pillarTotalCount: number;
  /** Rows in `questions` with `is_visible = true`. */
  pillarVisibleCount: number;
  bankVisibleCount: number;
}): number {
  if (!input.pillarBankDisabled && input.pillarTotalCount > 0) {
    return input.pillarVisibleCount;
  }
  return input.bankVisibleCount;
}
