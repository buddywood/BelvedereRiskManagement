import { PLATFORM_PILLAR_CATALOG } from "@/lib/methodology/pillar-catalog-starter";
import type { RiskLevel } from "@/lib/assessment/types";

export const PLATFORM_PILLAR_COUNT = PLATFORM_PILLAR_CATALOG.length;

export type SampleReportAudience = "families" | "organizations" | "practitioners";

export type SamplePillarScore = {
  slug: string;
  name: string;
  shortName: string;
  maturity: number;
  inScope: boolean;
  emphasized?: boolean;
};

export type SampleRisk = {
  level: RiskLevel;
  pillar: string;
  title: string;
  detail: string;
};

export type SampleReportPreview = {
  subjectLabel: string;
  completed: string;
  questionCount: number;
  maturity: number;
  resilienceLabel: string;
  focusLabel: string;
  description: string;
  coverageNote: string;
  domainBreakdownNote: string;
  footerNote: string;
  nextStep: string;
  domains: SamplePillarScore[];
  risks: ReadonlyArray<SampleRisk>;
};

const FAMILY_SHORT_NAMES: Record<string, string> = {
  governance: "Governance",
  "cyber-digital": "Cyber",
  "physical-security": "Physical",
  insurance: "Insurance",
  "geographic-environmental": "Geographic",
  "reputational-social": "Reputation",
  "liquidity-cash": "Liquidity",
  "tax-exposure": "Tax",
  "estate-succession": "Estate",
  "ai-emerging-tech": "AI Risk",
};

const FAMILY_MATURITIES: Record<
  string,
  { maturity: number; inScope: boolean; emphasized?: boolean }
> = {
  governance: { maturity: 2.0, inScope: true },
  "cyber-digital": { maturity: 2.4, inScope: true },
  "physical-security": { maturity: 2.1, inScope: true },
  insurance: { maturity: 2.2, inScope: true },
  "geographic-environmental": { maturity: 0, inScope: false },
  "reputational-social": { maturity: 2.1, inScope: true },
  "liquidity-cash": { maturity: 2.3, inScope: true },
  "tax-exposure": { maturity: 1.9, inScope: true },
  "estate-succession": { maturity: 1.6, inScope: true, emphasized: true },
  "ai-emerging-tech": { maturity: 0, inScope: false },
};

/** Illustrative domains for NGOs, nonprofits, and small organizations (marketing only). */
const ORGANIZATION_DOMAINS: SamplePillarScore[] = [
  {
    slug: "board-oversight",
    name: "Board & Oversight",
    shortName: "Board",
    maturity: 1.7,
    inScope: true,
    emphasized: true,
  },
  {
    slug: "cyber-continuity",
    name: "Cyber & Digital Continuity",
    shortName: "Cyber",
    maturity: 1.8,
    inScope: true,
  },
  {
    slug: "site-security",
    name: "Physical & Site Security",
    shortName: "Physical",
    maturity: 2.2,
    inScope: true,
  },
  {
    slug: "insurance-transfer",
    name: "Insurance & Risk Transfer",
    shortName: "Insurance",
    maturity: 2.0,
    inScope: true,
  },
  {
    slug: "mission-continuity",
    name: "Mission & Program Continuity",
    shortName: "Mission",
    maturity: 0,
    inScope: false,
  },
  {
    slug: "safeguarding",
    name: "Reputation & Safeguarding",
    shortName: "Safeguard",
    maturity: 2.1,
    inScope: true,
  },
  {
    slug: "funding-resilience",
    name: "Funding & Financial Resilience",
    shortName: "Funding",
    maturity: 1.9,
    inScope: true,
  },
  {
    slug: "funder-compliance",
    name: "Regulatory & Funder Compliance",
    shortName: "Funder",
    maturity: 2.3,
    inScope: true,
  },
  {
    slug: "leadership-succession",
    name: "Leadership Succession",
    shortName: "Succession",
    maturity: 1.5,
    inScope: true,
  },
  {
    slug: "ai-emerging",
    name: "AI & Emerging Tech Risk",
    shortName: "AI Risk",
    maturity: 0,
    inScope: false,
  },
];

/**
 * Illustrative domains for consultants / fractional executives assessing
 * business clients (marketing only — not the live household catalog).
 */
const PRACTITIONER_DOMAINS: SamplePillarScore[] = [
  {
    slug: "governance-controls",
    name: "Governance & Controls",
    shortName: "Controls",
    maturity: 2.1,
    inScope: true,
  },
  {
    slug: "cyber-access",
    name: "Cyber & Access Controls",
    shortName: "Cyber",
    maturity: 1.6,
    inScope: true,
    emphasized: true,
  },
  {
    slug: "physical-security",
    name: "Physical Security",
    shortName: "Physical",
    maturity: 2.3,
    inScope: true,
  },
  {
    slug: "insurance-adequacy",
    name: "Insurance Adequacy",
    shortName: "Insurance",
    maturity: 1.9,
    inScope: true,
  },
  {
    slug: "jurisdictional",
    name: "Jurisdictional & Geographic",
    shortName: "Jurisdiction",
    maturity: 0,
    inScope: false,
  },
  {
    slug: "client-trust",
    name: "Reputation & Client Trust",
    shortName: "Reputation",
    maturity: 2.2,
    inScope: true,
  },
  {
    slug: "financial-resilience",
    name: "Financial Resilience",
    shortName: "Financial",
    maturity: 2.0,
    inScope: true,
  },
  {
    slug: "compliance-framework",
    name: "Compliance Framework Readiness",
    shortName: "Compliance",
    maturity: 0,
    inScope: false,
  },
  {
    slug: "key-person",
    name: "Key-Person Continuity",
    shortName: "Key-Person",
    maturity: 1.8,
    inScope: true,
  },
  {
    slug: "ai-emerging",
    name: "AI & Emerging Tech Risk",
    shortName: "AI Risk",
    maturity: 2.0,
    inScope: true,
  },
];

function familyDomains(): SamplePillarScore[] {
  return PLATFORM_PILLAR_CATALOG.map((pillar) => {
    const sample = FAMILY_MATURITIES[pillar.slug] ?? {
      maturity: 2.0,
      inScope: true,
    };
    return {
      slug: pillar.slug,
      name: pillar.canonicalName,
      shortName: FAMILY_SHORT_NAMES[pillar.slug] ?? pillar.canonicalName,
      maturity: sample.maturity,
      inScope: sample.inScope,
      emphasized: sample.emphasized,
    };
  });
}

const FAMILY_SAMPLE: SampleReportPreview = {
  subjectLabel: "Chen Family Office",
  completed: "Mar 12, 2026",
  questionCount: 142,
  maturity: 2.2,
  resilienceLabel: "Governance resilience",
  focusLabel: "Advisor focus area",
  description:
    "A sample household report from a multi-domain engagement — composite scoring, maturity across the platform catalog, and prioritized risks advisors can review with clients.",
  coverageNote:
    "All platform risk domains — active domains scored, inactive domains marked not in scope for this firm-configured engagement.",
  domainBreakdownNote:
    "risk domains selected for this engagement from the platform catalog.",
  footerNote:
    "Illustrative sample. Actual output reflects each household's responses, firm risk domain selection, and methodology settings.",
  nextStep:
    "Facilitate a succession planning workshop with the family council — prioritize trigger definitions and authority documentation.",
  domains: familyDomains(),
  risks: [
    {
      level: "high",
      pillar: "Estate & Succession",
      title: "No defined succession triggers",
      detail:
        "Leadership transition criteria are informal — no documented events or timelines that would activate a handoff plan.",
    },
    {
      level: "high",
      pillar: "Governance & Decision-Making",
      title: "Informal authority structure",
      detail:
        "Major spending and investment decisions route through one family member without a shared decision framework.",
    },
    {
      level: "medium",
      pillar: "Governance & Decision-Making",
      title: "Undocumented governance framework",
      detail:
        "Family council practices exist but are not captured in a charter reviewed within the last 24 months.",
    },
  ],
};

const ORGANIZATION_SAMPLE: SampleReportPreview = {
  subjectLabel: "Riverbend Community Foundation",
  completed: "Apr 3, 2026",
  questionCount: 128,
  maturity: 2.0,
  resilienceLabel: "Organizational resilience",
  focusLabel: "Board focus area",
  description:
    "A sample organization report for a lean nonprofit — board-ready scoring across operational, strategic, and governance risk, with prioritized remediations an executive director can action.",
  coverageNote:
    "Illustrative organization risk domains — framed for boards, funders, and lean operating teams. Domains marked not in scope are available to include in future engagements.",
  domainBreakdownNote:
    "organization risk domains in scope for this self-serve assessment.",
  footerNote:
    "Illustrative sample for NGOs, nonprofits, and small organizations. Live product domains may differ as organization methodology expands.",
  nextStep:
    "Document an executive-director succession plan and present the prioritized risk register to the audit committee at the next quarterly meeting.",
  domains: ORGANIZATION_DOMAINS,
  risks: [
    {
      level: "high",
      pillar: "Leadership Succession",
      title: "No documented ED succession plan",
      detail:
        "Leadership continuity depends on one executive — the board has no named interim authority or trigger events for transition.",
    },
    {
      level: "high",
      pillar: "Funding & Financial Resilience",
      title: "Donor concentration risk",
      detail:
        "One donor family represents roughly a third of unrestricted giving, with no diversification plan on the board agenda.",
    },
    {
      level: "medium",
      pillar: "Cyber & Digital Continuity",
      title: "Controls gap for donor-facing incidents",
      detail:
        "Access and incident response practices would not withstand a donor-data incident during a public fundraising cycle.",
    },
  ],
};

const PRACTITIONER_SAMPLE: SampleReportPreview = {
  subjectLabel: "Northline Architecture · Kessler Fractional Security",
  completed: "May 8, 2026",
  questionCount: 136,
  maturity: 2.1,
  resilienceLabel: "Client risk posture",
  focusLabel: "Engagement focus",
  description:
    "A sample practitioner deliverable — one client engagement scored on your methodology, branded for your practice, with remediations ready to walk through in a working session.",
  coverageNote:
    "Illustrative practitioner engagement domains — scoped per client so deliverables stay comparable across your book. Inactive domains can be enabled for compliance-heavy engagements.",
  domainBreakdownNote:
    "client risk domains selected for this engagement from your practice methodology.",
  footerNote:
    "Illustrative sample for consultants and fractional executives. Live product domains may differ as practitioner methodology expands.",
  nextStep:
    "Deliver the branded remediation pack to Northline leadership and schedule a 90-day follow-up on cyber controls and key-person coverage.",
  domains: PRACTITIONER_DOMAINS,
  risks: [
    {
      level: "high",
      pillar: "Cyber & Access Controls",
      title: "Privileged access without MFA or review",
      detail:
        "Admin and privileged accounts lack consistent MFA and access review — the first finding a customer security questionnaire or incident postmortem would surface.",
    },
    {
      level: "high",
      pillar: "Key-Person Continuity",
      title: "Client key-person continuity undocumented",
      detail:
        "Day-to-day IT and security depend on one contact with no written coverage plan — an absence mid-incident leaves the contract CISO without an internal counterpart.",
    },
    {
      level: "medium",
      pillar: "Insurance Adequacy",
      title: "Cyber policy underwritten on a stale client profile",
      detail:
        "Renewal questionnaire still reflects last year's controls — broker has flagged premium and coverage risk at next renewal.",
    },
  ],
};

const SAMPLES: Record<SampleReportAudience, SampleReportPreview> = {
  families: FAMILY_SAMPLE,
  organizations: ORGANIZATION_SAMPLE,
  practitioners: PRACTITIONER_SAMPLE,
};

export function getSampleReportPreview(
  audience: SampleReportAudience = "families",
): SampleReportPreview & {
  pillarScores: SamplePillarScore[];
  pillarsInScope: SamplePillarScore[];
  domainCatalogCount: number;
} {
  const sample = SAMPLES[audience];
  const pillarScores = sample.domains;

  return {
    ...sample,
    pillarScores,
    pillarsInScope: pillarScores.filter((pillar) => pillar.inScope),
    domainCatalogCount: pillarScores.length,
  };
}

/** @deprecated Prefer getSampleReportPreview("families") — kept for existing imports. */
export const SAMPLE_HOUSEHOLD = FAMILY_SAMPLE.subjectLabel;
/** @deprecated Prefer getSampleReportPreview("families") */
export const SAMPLE_COMPLETED = FAMILY_SAMPLE.completed;
/** @deprecated Prefer getSampleReportPreview("families") */
export const SAMPLE_QUESTION_COUNT = FAMILY_SAMPLE.questionCount;
/** @deprecated Prefer getSampleReportPreview("families") */
export const SAMPLE_MATURITY = FAMILY_SAMPLE.maturity;
/** @deprecated Prefer getSampleReportPreview("families") */
export const SAMPLE_NEXT_STEP = FAMILY_SAMPLE.nextStep;

export const SAMPLE_PILLAR_SCORES = getSampleReportPreview("families").pillarScores;
export const SAMPLE_PILLARS_IN_SCOPE =
  getSampleReportPreview("families").pillarsInScope;
