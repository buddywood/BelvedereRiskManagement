/** Question `type` values used in the admin question bank filter (matches bank + pillar wires). */
export const QUESTION_BANK_FILTER_TYPES = [
  "maturity-scale",
  "yes-no",
  "single-choice",
  "numeric",
  "short-text",
] as const;

export type QuestionBankFilterType = (typeof QUESTION_BANK_FILTER_TYPES)[number];

export function isQuestionBankFilterType(
  value: string | undefined
): value is QuestionBankFilterType {
  return (
    value !== undefined &&
    (QUESTION_BANK_FILTER_TYPES as readonly string[]).includes(value)
  );
}

export const QUESTION_BANK_TYPE_LABELS: Record<QuestionBankFilterType, string> = {
  "maturity-scale": "Maturity scale (0–3)",
  "yes-no": "Yes / No",
  "single-choice": "Single choice",
  numeric: "Numeric",
  "short-text": "Short text",
};
