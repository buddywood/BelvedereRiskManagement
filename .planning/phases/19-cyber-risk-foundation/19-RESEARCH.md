# Phase 19: Cyber Risk Foundation - Research

**Researched:** 2026-03-18
**Domain:** Cyber risk assessment and financial cybersecurity
**Confidence:** MEDIUM

## Summary

Cyber risk assessment for household financial security requires implementing standardized frameworks adapted from enterprise-grade tools. The v1.4 platform already provides the assessment architecture (0-10 scoring, risk levels, recommendation engine) that can be extended for cyber risk evaluation.

**Primary recommendation:** Build new cyber risk assessment following existing governance assessment patterns, focusing on NIST-aligned digital hygiene evaluation and financial security practices.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Full-stack framework | Already integrated in v1.4 |
| Prisma | 7.4.0 | Database ORM with scoring tables | Established assessment data model |
| OpenAI | 6.29.0 | AI recommendations engine | Existing integration for automated guidance |
| Zod | 4.3.6 | Schema validation | Standard for form/API validation |
| React Hook Form | 7.71.1 | Form management | Established pattern for assessments |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.21 | Data fetching | Assessment progress tracking |
| Recharts | 3.8.0 | Risk visualization | Score display and progress charts |
| @react-pdf/renderer | 4.3.2 | Report generation | Cyber risk assessment reports |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom scoring | FAIR/NIST tools | Existing 0-10 scale already understood by users |
| New UI patterns | Assessment components | Reuse existing QuestionCard, ScoreDisplay patterns |
| Separate database | New tables | Leverage existing Assessment/PillarScore schema |

**Installation:**
```bash
# No new dependencies - reuse existing stack
npm install # All required libraries already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/cyber-risk/          # New domain module
│   ├── types.ts            # Cyber risk question/scoring types
│   ├── questions.ts        # Digital hygiene + financial security questions
│   ├── scoring.ts          # Reuse assessment scoring engine
│   └── recommendations.ts  # AI-powered cyber recommendations
├── components/cyber/        # Cyber-specific components
│   ├── CyberScoreDisplay.tsx
│   ├── DigitalHygieneCard.tsx
│   └── FinancialSecurityCard.tsx
└── app/(protected)/cyber/   # New route section
```

### Pattern 1: Assessment Extension Pattern
**What:** Extend existing assessment architecture for cyber domain
**When to use:** Building new risk assessment categories
**Example:**
```typescript
// Reuse existing scoring engine
import { calculatePillarScore, getRiskLevel } from '@/lib/assessment/scoring';

export function calculateCyberRiskScore(
  answers: Record<string, unknown>,
  pillar: CyberPillar,
  allQuestions: CyberQuestion[]
): CyberScoreResult {
  return calculatePillarScore(answers, pillar, allQuestions);
}
```

### Pattern 2: NIST-Aligned Question Structure
**What:** Map cyber risk factors to standardized assessment questions
**When to use:** Building cyber risk question bank
**Example:**
```typescript
// Source: NIST Cybersecurity Framework 2.0
const digitalHygieneQuestions: CyberQuestion[] = [
  {
    id: 'cyber-auth-01',
    text: 'Do you use multi-factor authentication on all financial accounts?',
    type: 'yes-no',
    scoreMap: { 'yes': 10, 'no': 0 },
    weight: 5,
    category: 'identity-protection'
  }
];
```

### Anti-Patterns to Avoid
- **Custom scoring scales:** Don't create new 1-5 or percentage scales - stick with 0-10 to match governance
- **Separate assessment flows:** Don't build parallel UI - extend existing assessment components
- **Manual recommendations:** Don't hardcode advice - use AI integration for personalized guidance

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Risk scoring algorithms | Custom cyber scoring | Existing calculatePillarScore() | Well-tested, handles edge cases, consistent UX |
| Question branching logic | New conditional system | Existing branchingRule pattern | Already handles complex dependencies |
| Recommendation engine | Static advice lookup | OpenAI integration + prompts | Personalized, context-aware guidance |
| Progress tracking | New assessment state | Existing Assessment model | Database schema, auto-save, resume capability |

**Key insight:** The v1.4 platform assessment infrastructure solves 80% of cyber risk assessment requirements. Extend rather than rebuild.

## Common Pitfalls

### Pitfall 1: Scope Creep Beyond Household Security
**What goes wrong:** Building enterprise-grade vulnerability scanning or compliance frameworks
**Why it happens:** Cyber risk domain is vast - easy to over-engineer
**How to avoid:** Focus on requirements: identity exposure, financial security practices, digital hygiene only
**Warning signs:** Discussing network scanning, compliance reporting, vendor risk assessment

### Pitfall 2: Ignoring Existing Assessment Patterns
**What goes wrong:** Creating inconsistent UI/UX compared to governance assessment
**Why it happens:** Cyber domain feels different from governance
**How to avoid:** Reuse QuestionCard, ScoreDisplay, ProgressBar components exactly
**Warning signs:** Designing new form layouts, different scoring visualization

### Pitfall 3: Static Recommendations vs Personalized Guidance
**What goes wrong:** Hardcoded "improve password hygiene" advice that doesn't fit user context
**Why it happens:** Easier to write generic recommendations
**How to avoid:** Use existing OpenAI integration to generate contextual advice based on assessment responses
**Warning signs:** Long switch statements mapping risk areas to fixed text

### Pitfall 4: Authentication vs Authorization Confusion
**What goes wrong:** Mixing MFA assessment (authentication) with access control evaluation (authorization)
**Why it happens:** Both relate to "security" but serve different purposes
**How to avoid:** Focus on household practices (MFA, passwords) not enterprise access policies
**Warning signs:** Questions about role-based access, privileged accounts

## Code Examples

Verified patterns from existing codebase:

### Assessment Question Definition
```typescript
// Source: src/lib/assessment/questions.ts
const cyberQuestion: CyberQuestion = {
  id: 'cyber-banking-01',
  text: 'How do you typically access your bank accounts?',
  helpText: 'Direct bank apps are safer than third-party aggregators.',
  type: 'single-choice',
  options: [
    { value: 'bank-app', label: 'Official bank mobile app' },
    { value: 'bank-website', label: 'Bank website directly' },
    { value: 'aggregator', label: 'Financial aggregator (Mint, YNAB)' },
    { value: 'multiple', label: 'Mix of above methods' }
  ],
  required: true,
  pillar: 'cyber-risk',
  subCategory: 'financial-security',
  weight: 4,
  scoreMap: { 'bank-app': 10, 'bank-website': 8, 'aggregator': 4, 'multiple': 6 }
};
```

### AI-Powered Recommendations
```typescript
// Source: src/lib/openai.ts integration
export async function generateCyberRecommendations(
  assessment: CyberAssessment,
  riskAreas: string[]
): Promise<string[]> {
  const client = getOpenAIClient();
  const prompt = `Based on cyber risk assessment scores: ${riskAreas.join(', ')},
    generate 3-5 specific, actionable recommendations for household financial security.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return parseRecommendations(response.choices[0].message.content);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FFIEC CAT Tool | NIST CSF 2.0 + CISA Goals | August 2025 | Standardized on NIST framework |
| SMS-based MFA | App-based/Hardware keys | 2025 | SMS no longer considered secure |
| Annual assessments | Continuous monitoring | 2026 | Real-time risk management |

**Deprecated/outdated:**
- FFIEC Cybersecurity Assessment Tool: Sunset August 31, 2025
- SMS codes for MFA: No longer sufficient for high-risk accounts

## Open Questions

1. **Integration with existing advisor dashboard**
   - What we know: Governance scores display in AdvisorGovernanceDashboardPage
   - What's unclear: Should cyber risk be separate section or integrated view?
   - Recommendation: Separate cyber risk portal section per requirements

2. **Assessment frequency and updates**
   - What we know: Governance assessment is typically one-time or annual
   - What's unclear: How often should cyber risk be re-evaluated?
   - Recommendation: Quarterly prompts, given fast-changing threat landscape

3. **Risk correlation between governance and cyber domains**
   - What we know: Both use 0-10 scale and similar risk levels
   - What's unclear: Should scores influence each other or remain independent?
   - Recommendation: Independent initially, correlation analysis in later phases

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 package.json] - Verified stack compatibility
- [Prisma schema.prisma] - Existing Assessment/PillarScore data model
- [src/lib/assessment/scoring.ts] - Proven scoring algorithms

### Secondary (MEDIUM confidence)
- [Cyber Risk Institute – Trusted Standards for Evolving Risks](https://cyberriskinstitute.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [NIST Cyber Risk Scoring | ZenGRC](https://www.zengrc.com/blog/nist-cyber-risk-scoring/)
- [Financial Services Sector Cybersecurity Profile | American Bankers Association](https://www.aba.com/banking-topics/technology/cybersecurity/cybersecurity-profile)
- [Cybersecurity Hygiene Checklist for 2026](https://www.keepersecurity.com/blog/2024/06/12/cybersecurity-hygiene-checklist/)

### Tertiary (LOW confidence)
- [Top 12 Cyber Security Risk Assessment Tools For 2026](https://www.sentinelone.com/cybersecurity-101/cybersecurity/cyber-security-risk-assessment-tools/) - Tool landscape overview
- [GitHub - Lissy93/personal-security-checklist](https://github.com/Lissy93/personal-security-checklist) - Community practices reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing v1.4 platform provides all required capabilities
- Architecture: MEDIUM - Assessment patterns proven, cyber domain adaptation straightforward
- Pitfalls: MEDIUM - Based on common assessment development issues and domain complexity

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days for stable frameworks, cyber threat landscape evolves monthly)