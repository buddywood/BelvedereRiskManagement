import type { LegalSection } from "@/lib/legal/documents";
import type { SelfServeTier } from "@/lib/billing/tier-catalog";

export const organizationsHero = {
  kicker: "For small businesses, non-profits, and NGOs",
  title: "Know where you're exposed — without hiring a risk team.",
  description:
    "A structured, guided assessment across cyber, financial, operational, compliance, reputational, and mission-continuity risk. One methodology, one afternoon, one deliverable your board, donors, or funders can actually read.",
  primaryCta: {
    label: "Start your assessment",
    href: "/signup/organization",
  },
  secondaryCta: {
    label: "See pricing",
    href: "#pricing",
  },
} as const;

export const organizationsHeroFeatures = [
  {
    title: "Board-ready in an afternoon",
    description:
      "A guided walkthrough that produces a risk register your board or funders can read without translation.",
  },
  {
    title: "One coherent picture",
    description:
      "Comparable scores across operational, strategic, and governance risk — not a stack of disconnected checklists.",
  },
  {
    title: "Prioritized next steps",
    description:
      "Recommendations ranked by impact and effort so the highest-return fix is clear.",
  },
] as const;

export const organizationsProseSections: LegalSection[] = [
  {
    id: "the-problem",
    title: "The problem",
    paragraphs: [
      "Small organizations carry the same risks as large ones, without the staff to manage them. A twenty-five-person firm faces the same cyber threats a twenty-five-thousand-person one does, but does not have a CISO. A community foundation has the same fiduciary duty a national one does, but does not have a general counsel. An NGO operating across three countries answers to the same institutional funders as an NGO operating across thirty, but does not have a dedicated compliance officer.",
      "The work still has to get done. A board still expects a risk register. A donor still expects an operational credibility artifact. A funder still expects a business-continuity plan. A cyber-insurance renewal still expects a controls attestation. The result is usually not catastrophe; it is smaller and more common — risk managed in fragments, without a defensible artifact, until the first time someone asks to see one.",
    ],
  },
  {
    id: "the-akili-approach",
    title: "The Akili approach",
    paragraphs: [
      "Akili is a guided, structured risk assessment designed for organizations that do not have a risk team. It replaces the blank-page problem with a walkthrough across the categories that matter, in plain language, with the kind of guidance a consultant would give you if you could afford one. The output is a coherent picture your board, donors, or funders can read without translation, and a prioritized list of next steps you can actually work through.",
      "The methodology is the same one Akili uses for family wealth and for advisor firms. It was not invented for you; it was proven on thousands of assessments before you saw it. You get the benefit of a mature methodology without needing a mature risk function to run it.",
    ],
  },
];

export const organizationsHowItWorks = [
  {
    step: "01",
    title: "Assess",
    description:
      "A guided assessment across every relevant category, in plain language, completable in an afternoon or split across a working session with the board.",
  },
  {
    step: "02",
    title: "Visualize",
    description:
      "One coherent view of where the organization is exposed, with comparable scores across categories and a summary a board member or funder can read without briefing.",
  },
  {
    step: "03",
    title: "Prioritize",
    description:
      "Recommendations ranked by impact and effort, so the highest-return next step is the one Akili tells you to take — not the loudest urgency of the week.",
  },
] as const;

export const organizationsVignettes = [
  {
    title: "A twenty-five-person professional services firm",
    body: "A small architecture practice with twenty-five staff, no CISO, and no dedicated compliance lead. The managing partner is the de-facto risk owner on top of running the firm. A new institutional client has asked for a completed cyber-and-controls questionnaire before the engagement can proceed. Akili gives the partner a structured walkthrough they can finish in an afternoon and a board-ready summary the client will accept.",
  },
  {
    title: "A community foundation",
    body: "A regional community foundation with a lean staff and an active board. The audit committee has asked for a formal risk register for two years. The executive director keeps intending to build one, but grantmaking cycles keep displacing the work. Akili turns that blank-page obligation into a guided assessment the ED can complete and bring to the next board meeting.",
  },
  {
    title: "An international NGO",
    body: "An NGO operating programs across three countries, answering to institutional funders who expect business-continuity and safeguarding documentation. There is no dedicated compliance officer. Akili surfaces cross-border, reputational, and operational gaps in one methodology so the country directors and HQ share a single picture of exposure.",
  },
] as const;

export const organizationsCaseStudy = {
  label: "Illustrative",
  title: "Riverbend Community Foundation",
  practice:
    "Regional community foundation. Roughly $42M AUM, grantmaking across four counties.",
  problem:
    "The audit committee had asked for a formal risk register for two years running. The executive director kept intending to build one, but the work kept getting displaced by grantmaking cycles. The insurance broker had also flagged that the D&O policy was underwritten against a stale risk profile.",
  whatTheyDid:
    "The executive director completed the assessment across all ten pillars in a single afternoon, then reviewed the output with the board chair. It surfaced three material gaps: a concentration in one donor family representing 34% of unrestricted giving, no documented ED succession plan, and cyber controls that would not survive a donor-facing incident.",
  outcome:
    "Within six months the foundation had a documented succession plan, a diversified donor-outreach program, and a cyber-controls uplift that satisfied the D&O renewal. Total staff time: roughly fourteen hours across the ED, ops manager, and board chair.",
} as const;

export const organizationsPricingCopy = {
  title: "Per-organization tiers that grow with you",
  description:
    "Public, self-serve plans for a single organization assessing itself — from a first structured deliverable through year-over-year funder cycles.",
} as const;

/** Advisor-framed TIER_CATALOG overrides for organization buyers. */
export const organizationsTierCopyOverrides: Partial<
  Record<
    SelfServeTier,
    {
      tagline?: string;
      modules?: string;
      cardIncludes?: readonly string[];
      cardExcludes?: readonly string[];
    }
  >
> = {
  ESSENTIALS: {
    tagline: "A single organization-wide assessment and action plan",
    modules: "Assessment + PDF report + Action plan",
    cardIncludes: [
      "Organization-wide assessment, PDF report & prioritized action plan",
      "Board-ready summary your funders can read",
      "Standard Akili methodology (not customizable)",
    ],
    cardExcludes: [
      "Custom framing, branded reports & shareable board access",
      "Implementation tracking & scheduled reassessments",
    ],
  },
  PROFESSIONAL: {
    tagline: "Custom framing for funders, branded reports, board access",
    modules: "Custom framing + branded reports + board access",
    cardIncludes: [
      "Everything in Essentials",
      "Funder-specific control language & branded reports",
      "Shareable board access to results",
    ],
    cardExcludes: [
      "Implementation tracking with owners and dates",
      "Scheduled reassessments & year-over-year comparison",
    ],
  },
  BUSINESS: {
    tagline: "Implementation tracking your board can follow",
    modules: "Implementation tracking + owners + dates",
    cardIncludes: [
      "Everything in Professional",
      "Implementation tracking with owners and dates",
      "Remediation progress your board or funder can review",
    ],
    cardExcludes: ["Scheduled reassessments & year-over-year comparison"],
  },
  INTELLIGENCE: {
    tagline: "Scheduled reassessments and year-over-year comparison",
    modules: "Reassessments + trend comparison",
    cardIncludes: [
      "Everything in Business",
      "Scheduled reassessments & year-over-year comparison",
      "Built for annual funder due-diligence cycles",
    ],
  },
};

export const organizationsConfigServices = {
  kicker: "Optional services",
  title: "Prefer white-glove setup?",
  description:
    "Configuration-as-a-Service is available on top of any subscription. Akili's team configures pillars, questions, scoring, and report templates for your organization — turnaround one to three weeks depending on scope.",
  items: [
    {
      title: "Setup",
      body: "Guided configuration of the standard methodology to your organization's context and reporting needs.",
    },
    {
      title: "Custom Methodology",
      body: "Deeper customization of pillars, questions, and report templates for funder-specific or sector-specific frameworks.",
    },
    {
      title: "Ongoing Advisory",
      body: "Retainer-based support for reassessments, board packs, and methodology refresh. Contact for pricing.",
    },
  ],
} as const;

export const organizationsSignupCopy = {
  eyebrow: "Organization workspace",
  title: "Create your organization account",
  description:
    "Register to run a structured risk assessment for your organization. We'll email you a confirmation link before checkout.",
  organizationLabel: "Organization name",
  organizationPlaceholder: "Riverbend Community Foundation",
} as const;
