/**
 * Cyber assessment rubric: 0–3 maturity columns, A–F framework, tier bands (same 80/60/40 as governance),
 * and required actions aligned to client worksheet.
 */

import type { RiskLevel } from "@/lib/assessment/types";
import type { QuestionOption } from "@/lib/assessment/types";
import { riskLevelFromMaturityScore } from "@/lib/assessment/governance-rubric";

/** Column headers for 0–3 (shown under maturity-scale questions in the cyber security area). */
export const CYBER_MATURITY_LEVEL_LABELS = [
  "Critical exposure (absent / unknown / unsafe practice)",
  "Partial / inconsistent (ad hoc, user-dependent, not enforced)",
  "Implemented (in place and generally followed)",
  "Mature / resilient (standardized, enforced, monitored, and periodically tested)",
] as const;

/**
 * Default 0–3 options when a cyber question does not define its own option text.
 * Row-specific rubric rows still override via `question.options`.
 */
export const CYBER_MATURITY_SCALE_OPTIONS: QuestionOption[] = [
  {
    value: 0,
    label: "Critical exposure",
    description: "Absent, unknown, or unsafe practice",
  },
  {
    value: 1,
    label: "Partial / inconsistent",
    description: "Ad hoc, user-dependent, not enforced",
  },
  {
    value: 2,
    label: "Implemented",
    description: "In place and generally followed",
  },
  {
    value: 3,
    label: "Mature / resilient",
    description: "Standardized, enforced, monitored, and periodically tested",
  },
];

/** Worksheet sections A–F (content grouping; scoring may still roll up to `cybersecurity`). */
export const CYBER_FRAMEWORK_SECTIONS = [
  { code: "A" as const, name: "Household governance" },
  { code: "B" as const, name: "Devices & network" },
  { code: "C" as const, name: "Accounts & access" },
  { code: "D" as const, name: "Data & privacy" },
  { code: "E" as const, name: "Financial & identity risk" },
  { code: "F" as const, name: "Incident response & recovery" },
] as const;

export type CyberTierCopy = {
  title: string;
  description: string;
  requiredAction: string;
};

export const CYBER_TIER_COPY: Record<RiskLevel, CyberTierCopy> = {
  low: {
    title: "Low risk / resilient",
    description: "Strong controls; resilient to most common attack vectors.",
    requiredAction: "Annual testing (phishing simulations, backup validation).",
  },
  medium: {
    title: "Moderate risk",
    description: "Some exploitable gaps; requires targeted improvements.",
    requiredAction: "Targeted remediation (MFA rollout, device hardening, training).",
  },
  high: {
    title: "Elevated risk",
    description: "Likely vulnerability to phishing, account takeover, or device compromise.",
    requiredAction: "Full cybersecurity uplift (access control, network segmentation, monitoring).",
  },
  critical: {
    title: "High / critical risk",
    description: "Significant exposure; high probability of successful attack.",
    requiredAction:
      "Immediate intervention (incident readiness, credential reset, system hardening).",
  },
};

export function cyberTierCopyForRiskLevel(riskLevel: RiskLevel): CyberTierCopy {
  return CYBER_TIER_COPY[riskLevel];
}

export function cyberRiskLevelFromMaturityScore(maturity03: number): RiskLevel {
  return riskLevelFromMaturityScore(maturity03);
}
