import type { QuestionOption } from "@/lib/assessment/types";

/** Maximum maturity score used in rollups, category averages, and reporting. */
export const MATURITY_SCALE_MAX = 3;

/**
 * Answers at or below this normalized maturity score (0–3) generate a remediation
 * item: levels 0–1 ("Critical gap" and "Partial / informal").
 */
export const REMEDIATION_MATURITY_THRESHOLD = 1;

/**
 * Canonical four-level maturity scale for governance-style questions.
 * Values 0–3 roll up to the pillar maturity score (also 0–3).
 */
export const MATURITY_SCALE_OPTIONS: QuestionOption[] = [
  {
    value: 0,
    label: "Critical gap",
    description: "Absent, unknown, or informal only",
  },
  {
    value: 1,
    label: "Partial / informal",
    description: "Exists but undocumented, inconsistent, or person-dependent",
  },
  {
    value: 2,
    label: "Formalized",
    description: "Documented, communicated, and followed",
  },
  {
    value: 3,
    label: "Institutionalized",
    description: "Documented, tested, reviewed, and reinforced regularly",
  },
];
