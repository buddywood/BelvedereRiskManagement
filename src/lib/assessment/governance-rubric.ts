/**
 * Belvedere-style family governance rubric: per-question maturity 0–3 rolls up to a
 * 0–100 resilience score and tier classification (see client framework A–F weights).
 */

import type { RiskLevel } from "@/lib/assessment/types";
import { MATURITY_SCALE_MAX } from "@/lib/assessment/maturity-scale";

/** Target framework sections (for roadmap / content alignment; legacy bank uses six risk areas today). */
export const GOVERNANCE_FRAMEWORK_SECTIONS = [
  { code: "A" as const, name: "Family Governance & Decision-Making", weightPercent: 25 },
  { code: "B" as const, name: "Succession & Continuity Planning", weightPercent: 25 },
  { code: "C" as const, name: "Financial Discipline & Spending Governance", weightPercent: 15 },
  { code: "D" as const, name: "Reputation & Conduct Management", weightPercent: 15 },
  { code: "E" as const, name: "Marital & Relationship Governance", weightPercent: 10 },
  { code: "F" as const, name: "Education & Development Standard", weightPercent: 10 },
] as const;

/** Maturity column headers (0–3) aligned to rubric. */
export const MATURITY_LEVEL_LABELS = [
  "Critical gap (absent / unknown / informal only)",
  "Partial / informal (exists but undocumented, inconsistent, or person-dependent)",
  "Formalized (documented, communicated, and followed)",
  "Institutionalized (documented, tested, reviewed, and reinforced regularly)",
] as const;

/**
 * Convert aggregate maturity (0–3) to a 0–100 resilience score for tiering and reporting.
 */
export function maturityScoreToPercent(maturity03: number): number {
  if (maturity03 <= 0) return 0;
  return Math.min(100, Math.round((maturity03 / MATURITY_SCALE_MAX) * 100));
}

/**
 * Risk tier from 0–100 resilience score (Belvedere bands).
 */
export function riskLevelFromResiliencePercent(percent: number): RiskLevel {
  if (percent >= 80) return "low";
  if (percent >= 60) return "medium";
  if (percent >= 40) return "high";
  return "critical";
}

/** Tier classification from aggregate maturity (0–3). */
export function riskLevelFromMaturityScore(maturity03: number): RiskLevel {
  return riskLevelFromResiliencePercent(maturityScoreToPercent(maturity03));
}

export type GovernanceTierCopy = {
  title: string;
  description: string;
  requiredAction: string;
};

/** Client-facing labels (maps internal RiskLevel; HIGH = “Elevated” in rubric). */
export const GOVERNANCE_TIER_COPY: Record<RiskLevel, GovernanceTierCopy> = {
  low: {
    title: "Low Risk / Resilient",
    description: "Governance is durable across generations.",
    requiredAction: "Annual review; scenario testing.",
  },
  medium: {
    title: "Moderate Risk",
    description: "Gaps exist; manageable with targeted controls.",
    requiredAction: "Targeted governance remediation plan.",
  },
  high: {
    title: "Elevated Risk",
    description: "Structural weaknesses; likely conflict or disruption.",
    requiredAction: "Comprehensive governance redesign + advisor integration.",
  },
  critical: {
    title: "High / Critical Risk",
    description: "Governance failure likely under stress.",
    requiredAction: "Immediate CRO oversight; crisis & continuity controls.",
  },
};

export function governanceTierCopyForRiskLevel(riskLevel: RiskLevel): GovernanceTierCopy {
  return GOVERNANCE_TIER_COPY[riskLevel];
}

/** Progress / heat styling from 0–3 maturity (same bands as percent). */
export function maturityHeatLevel(maturity03: number): "strong" | "fair" | "weak" | "severe" {
  const p = maturityScoreToPercent(maturity03);
  if (p >= 80) return "strong";
  if (p >= 60) return "fair";
  if (p >= 40) return "weak";
  return "severe";
}
