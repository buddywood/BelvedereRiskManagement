/**
 * Public interactive demo — a short, self-serve slice of the real assessment.
 *
 * Marketing-only content, but the scoring is the platform's: answers are the
 * canonical 0–3 maturity scale, rolled up through `maturityScoreToPercent` and
 * tiered by `riskLevelFromMaturityScore`, so the number a visitor sees on /demo
 * is produced the same way as the number in a real report.
 *
 * Nothing here touches the database or the live question bank — the demo runs
 * entirely client-side and persists no answers.
 */

import {
  governanceTierCopyForRiskLevel,
  maturityScoreToPercent,
  riskLevelFromMaturityScore,
  type GovernanceTierCopy,
} from "@/lib/assessment/governance-rubric";
import {
  MATURITY_SCALE_OPTIONS,
  REMEDIATION_MATURITY_THRESHOLD,
} from "@/lib/assessment/maturity-scale";
import type { RiskLevel } from "@/lib/assessment/types";
import {
  getSampleReportPreview,
  type SamplePillarScore,
  type SampleReportAudience,
} from "@/lib/marketing/sample-report-preview";

export type DemoAudience = SampleReportAudience;

export const DEMO_AUDIENCES = [
  "families",
  "organizations",
  "practitioners",
] as const satisfies ReadonlyArray<DemoAudience>;

/** Canonical maturity levels a demo answer can take (mirrors the 0–3 rubric). */
export type DemoMaturityLevel = 0 | 1 | 2 | 3;

export const DEMO_MATURITY_LEVELS: ReadonlyArray<DemoMaturityLevel> = [0, 1, 2, 3];

export type DemoQuestion = {
  id: string;
  /** Domain slug in the audience's sample catalog — drives the live radar. */
  domainSlug: string;
  prompt: string;
  helper: string;
  /** Concrete, audience-specific descriptions for maturity levels 0–3, in order. */
  levelDescriptions: readonly [string, string, string, string];
  /** Remediation surfaced when the answer lands at or below the gap threshold. */
  gap: { title: string; detail: string };
};

export type DemoExperience = {
  audience: DemoAudience;
  path: string;
  /** Short label for the audience switcher. */
  navLabel: string;
  kicker: string;
  title: string;
  description: string;
  subjectLabel: string;
  /** Shown while the visitor is still answering. */
  inProgressNote: string;
  resultHeadline: string;
  nextStep: string;
  footerNote: string;
  /**
   * The demo is the destination of the site's primary CTA, so it has to close
   * on its own: a self-serve path, a talk-to-sales path, and pricing. Every
   * audience carries all three.
   */
  selfServeCta: { label: string; href: string };
  salesCta: { label: string; href: string };
  pricingLink: { label: string; href: string };
  questions: ReadonlyArray<DemoQuestion>;
};

export type DemoAnswers = Readonly<Record<string, DemoMaturityLevel>>;

export type DemoDomainScore = SamplePillarScore & { answered: boolean };

export type DemoGap = {
  level: RiskLevel;
  domain: string;
  title: string;
  detail: string;
};

export type DemoResult = {
  answeredCount: number;
  questionCount: number;
  complete: boolean;
  /** Mean maturity (0–3) across answered questions only. */
  maturity: number;
  /** Resilience score (0–100) via the platform rubric. */
  percent: number;
  riskLevel: RiskLevel;
  tier: GovernanceTierCopy;
  /** Full audience catalog — answered domains in scope, the rest dimmed. */
  domains: DemoDomainScore[];
  gaps: DemoGap[];
  /** Domains scored at "Formalized" or better. */
  strengths: string[];
  /** Catalog domains the full assessment covers but the demo does not. */
  domainsBeyondDemo: number;
};

const FAMILY_QUESTIONS: ReadonlyArray<DemoQuestion> = [
  {
    id: "families-governance",
    domainSlug: "governance",
    prompt: "How are major household financial decisions made?",
    helper: "Think about spending above your usual threshold, or a new investment.",
    levelDescriptions: [
      "One person decides; there is no agreed process",
      "We discuss informally, but nothing is written down",
      "We have a written decision process the family follows",
      "Written, reviewed regularly, and tested against real decisions",
    ],
    gap: {
      title: "Decision authority is person-dependent",
      detail:
        "Major financial decisions route through an individual rather than an agreed framework — a common source of conflict and delay when that person is unavailable.",
    },
  },
  {
    id: "families-cyber",
    domainSlug: "cyber-digital",
    prompt: "How does your household manage passwords and account access?",
    helper: "Include everyone with access to financial accounts, not just adults.",
    levelDescriptions: [
      "Reused passwords, shared informally, no MFA",
      "Some members use a manager or MFA; coverage is patchy",
      "A password manager and MFA are standard across the household",
      "Standard, reviewed periodically, with access removal on staff or family changes",
    ],
    gap: {
      title: "Incomplete account protection",
      detail:
        "Partial MFA and password coverage means a single compromised account can expose household finances — the most common entry point in family office incidents.",
    },
  },
  {
    id: "families-physical",
    domainSlug: "physical-security",
    prompt: "How is physical security handled across residences and travel?",
    helper: "Home access, staff vetting, and travel planning all count.",
    levelDescriptions: [
      "Nothing formal; we handle issues as they arise",
      "Some measures in place, inconsistently applied across properties",
      "Documented practices covering residences, staff, and travel",
      "Documented and rehearsed, with periodic review after changes",
    ],
    gap: {
      title: "Inconsistent physical security practice",
      detail:
        "Measures vary by property or trip, leaving predictable gaps around staff access, travel routines, and secondary residences.",
    },
  },
  {
    id: "families-insurance",
    domainSlug: "insurance",
    prompt: "When were your coverage limits last reviewed against actual exposure?",
    helper: "Property, liability, umbrella, and specialty coverage.",
    levelDescriptions: [
      "We are not sure what our current limits are",
      "Reviewed at renewal, but not against a current asset picture",
      "Reviewed against a documented asset and liability schedule",
      "Reviewed annually with scenario testing on major exposures",
    ],
    gap: {
      title: "Coverage not matched to current exposure",
      detail:
        "Limits set against an outdated asset picture are the most frequent cause of uncovered loss — particularly umbrella liability and specialty items.",
    },
  },
  {
    id: "families-reputation",
    domainSlug: "reputational-social",
    prompt: "Is there an agreed approach to family privacy and public exposure?",
    helper: "Social media, press inquiries, and children's digital footprint.",
    levelDescriptions: [
      "No shared approach; each member decides independently",
      "General expectations exist but are unwritten",
      "A written privacy standard the family has agreed to",
      "Written, reviewed, and paired with a response plan for incidents",
    ],
    gap: {
      title: "No agreed privacy standard",
      detail:
        "Without a shared standard, exposure is set by the least cautious member — and there is no rehearsed response when something surfaces publicly.",
    },
  },
  {
    id: "families-succession",
    domainSlug: "estate-succession",
    prompt: "What would trigger a leadership or wealth transition, and who decides?",
    helper: "Incapacity, death, or a planned handoff of responsibility.",
    levelDescriptions: [
      "Undefined — we have not worked through this",
      "Discussed within the family but not documented",
      "Documented triggers with named decision-makers",
      "Documented, communicated to those affected, and reviewed regularly",
    ],
    gap: {
      title: "No defined succession triggers",
      detail:
        "Transition criteria are informal — no documented events or timelines that would activate a handoff plan, leaving continuity dependent on goodwill under stress.",
    },
  },
];

const ORGANIZATION_QUESTIONS: ReadonlyArray<DemoQuestion> = [
  {
    id: "organizations-board",
    domainSlug: "board-oversight",
    prompt: "How does your board oversee organizational risk?",
    helper: "Risk register, board reporting cadence, and committee ownership.",
    levelDescriptions: [
      "Risk is not a standing board topic",
      "Discussed when something goes wrong",
      "A risk register is reviewed on a set cadence",
      "Reviewed on cadence with named owners and tracked remediation",
    ],
    gap: {
      title: "Risk oversight is reactive",
      detail:
        "Without a standing register and cadence, the board sees risk only after an incident — and funders increasingly ask for evidence of the opposite.",
    },
  },
  {
    id: "organizations-cyber",
    domainSlug: "cyber-continuity",
    prompt: "How is access to donor and beneficiary data controlled?",
    helper: "Account provisioning, MFA, and offboarding for staff and volunteers.",
    levelDescriptions: [
      "Shared logins; access is rarely removed",
      "Individual accounts, but MFA and offboarding are inconsistent",
      "Individual accounts with MFA and a documented offboarding step",
      "Documented, enforced, and reviewed with periodic access audits",
    ],
    gap: {
      title: "Controls gap on sensitive records",
      detail:
        "Access practices would not withstand a donor- or beneficiary-data incident, and would be difficult to evidence in a funder review.",
    },
  },
  {
    id: "organizations-insurance",
    domainSlug: "insurance-transfer",
    prompt: "How well does your insurance match your actual operations?",
    helper: "D&O, general liability, cyber, and event coverage.",
    levelDescriptions: [
      "We are unsure what is covered",
      "Renewed each year without reassessing activities",
      "Reviewed against a current activity and asset schedule",
      "Reviewed annually with the board briefed on retained risk",
    ],
    gap: {
      title: "Coverage drifting from operations",
      detail:
        "Programs and events change faster than policies get revisited, leaving newer activities and D&O exposure under-covered.",
    },
  },
  {
    id: "organizations-safeguarding",
    domainSlug: "safeguarding",
    prompt: "Is there a safeguarding and incident-response standard staff can follow?",
    helper: "Reporting routes, escalation, and public response.",
    levelDescriptions: [
      "No written standard",
      "A policy exists but staff are not trained on it",
      "Written, trained, with clear reporting routes",
      "Written, trained, rehearsed, and reviewed after each incident",
    ],
    gap: {
      title: "Safeguarding standard not operational",
      detail:
        "A policy that staff cannot act on under pressure provides little protection to beneficiaries or to the organization's standing with funders.",
    },
  },
  {
    id: "organizations-funding",
    domainSlug: "funding-resilience",
    prompt: "How concentrated is your funding base?",
    helper: "Consider the share coming from your largest single source.",
    levelDescriptions: [
      "One source covers most of our budget, with no plan",
      "Concentrated, and diversification is discussed informally",
      "Concentration is tracked with a documented diversification plan",
      "Tracked, planned, and stress-tested against loss of the largest funder",
    ],
    gap: {
      title: "Donor concentration risk",
      detail:
        "A large share of unrestricted funding rests with one source, with no tested plan for absorbing its loss mid-year.",
    },
  },
  {
    id: "organizations-succession",
    domainSlug: "leadership-succession",
    prompt: "What happens if your executive director leaves unexpectedly?",
    helper: "Interim authority, documented responsibilities, and board process.",
    levelDescriptions: [
      "We have not planned for this",
      "The board has discussed it but nothing is written",
      "A written succession plan with named interim authority",
      "Written, board-approved, and reviewed annually",
    ],
    gap: {
      title: "No documented ED succession plan",
      detail:
        "Leadership continuity depends on one executive — the board has no named interim authority or trigger events for transition.",
    },
  },
];

const PRACTITIONER_QUESTIONS: ReadonlyArray<DemoQuestion> = [
  {
    id: "practitioners-controls",
    domainSlug: "governance-controls",
    prompt: "How does this client's leadership oversee information security?",
    helper:
      "As contract CISO: named owner, exec reporting cadence, and documented decisions.",
    levelDescriptions: [
      "No named owner — security sits with whoever is free",
      "An informal owner, but no regular reporting",
      "A named owner with documented reporting to leadership",
      "Named owner, board- or exec-level review, and decision log",
    ],
    gap: {
      title: "No named security owner at the client",
      detail:
        "Information security has no accountable owner or reporting cadence — leadership cannot show oversight when a customer, insurer, or auditor asks.",
    },
  },
  {
    id: "practitioners-cyber",
    domainSlug: "cyber-access",
    prompt: "How is privileged access controlled at this client?",
    helper: "Admin accounts, MFA coverage, and periodic access reviews.",
    levelDescriptions: [
      "Shared admin credentials, no MFA",
      "MFA on some accounts; access reviews are ad hoc",
      "MFA on privileged accounts with scheduled access reviews",
      "MFA, least privilege, and continuous review with retained evidence",
    ],
    gap: {
      title: "Privileged access without MFA or review",
      detail:
        "Admin and privileged accounts lack consistent MFA and access review — the first finding a customer security questionnaire or incident postmortem would surface.",
    },
  },
  {
    id: "practitioners-insurance",
    domainSlug: "insurance-adequacy",
    prompt:
      "How current is the cyber insurance profile behind this client's coverage?",
    helper: "Controls attested at last renewal versus what you observe today.",
    levelDescriptions: [
      "Nobody knows what was attested at renewal",
      "Last renewal's answers, not revisited since",
      "Reviewed against controls you can evidence today",
      "Reviewed with the broker and updated when controls change",
    ],
    gap: {
      title: "Cyber policy underwritten on a stale client profile",
      detail:
        "The renewal questionnaire still reflects last year's controls — a premium and coverage risk at next renewal, and a potential claims problem after an incident.",
    },
  },
  {
    id: "practitioners-trust",
    domainSlug: "client-trust",
    prompt:
      "How prepared is this client for a customer-facing security incident?",
    helper: "Notification plan, customer comms, and reputation response.",
    levelDescriptions: [
      "No plan — we would improvise under pressure",
      "A draft plan that has never been walked through",
      "A written plan with named owners and customer notification steps",
      "Written, rehearsed, and aligned with legal and customer contracts",
    ],
    gap: {
      title: "No customer-incident response plan",
      detail:
        "A breach affecting customer data would have no rehearsed notification path — the exposure most likely to end a client relationship or trigger contractual notice failures.",
    },
  },
  {
    id: "practitioners-financial",
    domainSlug: "financial-resilience",
    prompt:
      "How would a prolonged security incident affect this client's operations?",
    helper: "Delivery continuity, cash runway, and recovery funding.",
    levelDescriptions: [
      "Operations would stall with no recovery plan",
      "Informal continuity ideas; not funded or tested",
      "Documented continuity with known cost and owners",
      "Documented, funded, and stress-tested against a multi-week outage",
    ],
    gap: {
      title: "Incident continuity unfunded",
      detail:
        "A multi-week ransomware or outage event has no funded continuity plan — client delivery and cash runway would degrade without a rehearsed recovery path.",
    },
  },
  {
    id: "practitioners-key-person",
    domainSlug: "key-person",
    prompt:
      "What happens if this client's sole IT or security contact is unavailable?",
    helper: "Prolonged absence, illness, or departure mid-incident.",
    levelDescriptions: [
      "Response and operations would stall",
      "Informal coverage understanding with a vendor or peer",
      "A written coverage plan leadership is aware of",
      "Written, rehearsed, and reflected in vendor and employment agreements",
    ],
    gap: {
      title: "Client key-person continuity undocumented",
      detail:
        "Day-to-day IT and security depend on one contact with no written coverage plan — an absence mid-incident leaves you as contract CISO without an internal counterpart.",
    },
  },
];

const EXPERIENCES: Record<DemoAudience, DemoExperience> = {
  families: {
    audience: "families",
    path: "/demo",
    navLabel: "Households",
    kicker: "Interactive demo",
    title: "See your household risk profile take shape",
    description:
      "Six questions from the live assessment, scored on the same maturity rubric advisors use. Your answers stay in your browser — nothing is saved or sent.",
    subjectLabel: "Your household",
    inProgressNote:
      "Your profile updates with each answer, exactly as it does in a live engagement.",
    resultHeadline: "Your household risk snapshot",
    nextStep:
      "A full engagement scores every domain in the catalog, then turns the gaps below into a sequenced remediation plan with your advisor.",
    footerNote:
      "Illustrative snapshot from a six-question sample. A live engagement covers the full domain catalog and reflects your firm's methodology settings.",
    selfServeCta: { label: "Create your workspace", href: "/signup/advisor" },
    salesCta: { label: "Talk to our team", href: "/contact/demo" },
    pricingLink: { label: "Compare plans", href: "/pricing" },
    questions: FAMILY_QUESTIONS,
  },
  organizations: {
    audience: "organizations",
    path: "/demo/organizations",
    navLabel: "Organizations",
    kicker: "Interactive demo",
    title: "See where your organization's risk sits",
    description:
      "Six questions a board would recognize, scored the way our assessment scores them. Your answers stay in your browser — nothing is saved or sent.",
    subjectLabel: "Your organization",
    inProgressNote:
      "Your profile updates with each answer, exactly as it does in a live assessment.",
    resultHeadline: "Your organization risk snapshot",
    nextStep:
      "A full assessment scores every domain, then produces the board-ready register and prioritized remediations behind this snapshot.",
    footerNote:
      "Illustrative snapshot for NGOs, nonprofits, and small organizations. Live product domains may differ as organization methodology expands.",
    selfServeCta: {
      label: "Start your assessment",
      href: "/signup/organization",
    },
    salesCta: { label: "Talk to our team", href: "/contact/demo" },
    pricingLink: { label: "Compare plans", href: "/pricing" },
    questions: ORGANIZATION_QUESTIONS,
  },
  practitioners: {
    audience: "practitioners",
    path: "/demo/practitioners",
    navLabel: "Practitioners",
    kicker: "Interactive demo · Contract CISO",
    title: "Walk a client engagement as a contract CISO",
    description:
      "Six questions you'd ask while assessing a client — scored the way a fractional CISO engagement scores them under your brand. Your answers stay in your browser — nothing is saved or sent.",
    subjectLabel: "Northline Architecture",
    inProgressNote:
      "The client's profile updates with each answer, exactly as it does in a live engagement.",
    resultHeadline: "Client risk snapshot",
    nextStep:
      "A full engagement scores every domain you enable for this client, then produces the branded remediation pack you walk leadership through.",
    footerNote:
      "Illustrative fractional CISO engagement (Kessler Fractional Security → Northline Architecture). Live product domains may differ as practitioner methodology expands.",
    selfServeCta: {
      label: "Start your practice trial",
      href: "/signup/practitioner",
    },
    salesCta: { label: "Talk to our team", href: "/contact/demo" },
    pricingLink: { label: "Compare plans", href: "/pricing" },
    questions: PRACTITIONER_QUESTIONS,
  },
};

export function isDemoAudience(value: unknown): value is DemoAudience {
  return (
    typeof value === "string" &&
    (DEMO_AUDIENCES as ReadonlyArray<string>).includes(value)
  );
}

export function getDemoExperience(
  audience: DemoAudience = "families",
): DemoExperience {
  return EXPERIENCES[audience];
}

export function listDemoExperiences(): DemoExperience[] {
  return DEMO_AUDIENCES.map((audience) => EXPERIENCES[audience]);
}

/** Option list for a question — canonical rubric labels, question-specific detail. */
export function demoQuestionOptions(question: DemoQuestion): Array<{
  value: DemoMaturityLevel;
  label: string;
  description: string;
}> {
  return DEMO_MATURITY_LEVELS.map((level) => ({
    value: level,
    label: MATURITY_SCALE_OPTIONS[level]?.label ?? `Level ${level}`,
    description: question.levelDescriptions[level],
  }));
}

/**
 * Gap severity for a single answered question. The rubric's percent-based
 * tiering collapses both 0 and 1 into "critical", which reads as alarmist on a
 * six-question sample, so the demo distinguishes an absent control (critical)
 * from a partial one (high).
 */
function gapLevelForAnswer(level: DemoMaturityLevel): RiskLevel {
  return level === 0 ? "critical" : "high";
}

export function scoreDemoAnswers(
  experience: DemoExperience,
  answers: DemoAnswers,
): DemoResult {
  const questions = experience.questions;
  const sample = getSampleReportPreview(experience.audience);
  const answeredQuestions = questions.filter(
    (question) => answers[question.id] !== undefined,
  );

  const total = answeredQuestions.reduce(
    (sum, question) => sum + (answers[question.id] as DemoMaturityLevel),
    0,
  );
  const answeredCount = answeredQuestions.length;
  const maturity = answeredCount === 0 ? 0 : total / answeredCount;
  const percent = maturityScoreToPercent(maturity);

  const questionByDomain = new Map(
    questions.map((question) => [question.domainSlug, question]),
  );

  // Lowest answered domain gets the radar's emphasis treatment — ties break to
  // catalog order so the highlight does not jump between equal scores.
  let emphasizedSlug: string | null = null;
  let emphasizedValue = Number.POSITIVE_INFINITY;
  for (const question of answeredQuestions) {
    const value = answers[question.id] as DemoMaturityLevel;
    if (value < emphasizedValue) {
      emphasizedValue = value;
      emphasizedSlug = question.domainSlug;
    }
  }

  const domains: DemoDomainScore[] = sample.domains.map((domain) => {
    const question = questionByDomain.get(domain.slug);
    const answer = question ? answers[question.id] : undefined;
    const answered = answer !== undefined;

    return {
      ...domain,
      maturity: answered ? answer : 0,
      inScope: answered,
      emphasized: answered && domain.slug === emphasizedSlug,
      answered,
    };
  });

  const gaps: DemoGap[] = answeredQuestions
    .filter(
      (question) =>
        (answers[question.id] as DemoMaturityLevel) <=
        REMEDIATION_MATURITY_THRESHOLD,
    )
    .map((question) => {
      const value = answers[question.id] as DemoMaturityLevel;
      const domain = sample.domains.find(
        (candidate) => candidate.slug === question.domainSlug,
      );
      return {
        level: gapLevelForAnswer(value),
        domain: domain?.name ?? question.domainSlug,
        title: question.gap.title,
        detail: question.gap.detail,
        sortValue: value,
      };
    })
    .sort((a, b) => a.sortValue - b.sortValue)
    .map(({ sortValue: _sortValue, ...gap }) => gap);

  const strengths = answeredQuestions
    .filter(
      (question) =>
        (answers[question.id] as DemoMaturityLevel) >
        REMEDIATION_MATURITY_THRESHOLD,
    )
    .map((question) => {
      const domain = sample.domains.find(
        (candidate) => candidate.slug === question.domainSlug,
      );
      return domain?.name ?? question.domainSlug;
    });

  return {
    answeredCount,
    questionCount: questions.length,
    complete: answeredCount === questions.length,
    maturity,
    percent,
    riskLevel: riskLevelFromMaturityScore(maturity),
    tier: governanceTierCopyForRiskLevel(riskLevelFromMaturityScore(maturity)),
    domains,
    gaps,
    strengths,
    domainsBeyondDemo: Math.max(0, sample.domains.length - questions.length),
  };
}
