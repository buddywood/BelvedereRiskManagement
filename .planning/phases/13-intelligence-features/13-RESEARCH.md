# Phase 13: Intelligence Features - Research

**Researched:** 2026-03-14
**Domain:** Automated risk intelligence and portfolio-level insight generation
**Confidence:** HIGH

## Summary

Phase 13 builds on the analytics foundation from Phase 12 to implement automated intelligence features that surface highest-priority governance risks for advisor decision-making. The existing codebase provides strong foundations: established analytics data structures with weighted scoring algorithms, shadcn/ui components including Alert variants for risk notifications, and proven Server Component patterns with TanStack Query for data management.

Research identifies a comprehensive stack leveraging existing patterns: automated insight generation using low-score identification algorithms, portfolio-level aggregation queries extending current single-family analytics, and modern React Server Actions with next-safe-action for type-safe risk alert workflows. The current pillar scoring system (8 categories with defined weights) provides the perfect foundation for automated risk prioritization.

**Primary recommendation:** Extend existing analytics queries for portfolio-level aggregation, implement automated insight generation with configurable risk thresholds, use existing shadcn Alert components for risk notifications, and leverage Server Actions for real-time intelligence updates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-safe-action | 7.10.0 | Type-safe Server Actions | Full TypeScript inference, middleware pipeline, action status tracking for risk alerts |
| TanStack React Query | 5.90.21 | Intelligence data caching | Already in use, perfect for portfolio aggregation caching and background updates |
| Prisma | 6.1.0 | Portfolio data queries | Current ORM, excellent for multi-tenant data aggregation and analytics views |
| shadcn/ui Alert | Current | Risk notifications | Already implemented, supports warning/destructive variants for risk levels |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 0.575.0 | Risk indicator icons | Already in use, provides AlertTriangle, TrendingDown, AlertCircle |
| date-fns | 4.1.0 | Risk timeline formatting | Already in use, essential for "last assessed" timestamps |
| class-variance-authority | 0.7.1 | Risk level variants | Already integrated with Alert component for styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | API routes | Server Actions provide better TypeScript integration and form handling |
| Prisma aggregations | Custom SQL views | Prisma maintains type safety and existing data access patterns |
| shadcn Alert | Custom toast system | Alert components provide better accessibility and consistent styling |

**Installation:**
```bash
npm install next-safe-action
# All other dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(protected)/advisor/
│   ├── intelligence/
│   │   ├── page.tsx              # Portfolio intelligence dashboard
│   │   ├── loading.tsx           # Intelligence skeleton
│   │   └── components/
│   │       ├── RiskOverview.tsx       # Top 3 risks per family
│   │       ├── PortfolioRiskList.tsx  # Master risk list
│   │       └── RiskDetailModal.tsx    # Assessment detail drill-down
├── components/intelligence/
│   ├── RiskAlertCard.tsx         # Individual risk alert display
│   ├── RiskIndicator.tsx         # Risk level visual indicator
│   └── InsightsList.tsx          # Automated insight components
└── lib/
    ├── intelligence/
    │   ├── queries.ts            # Portfolio aggregation queries
    │   ├── scoring.ts            # Risk identification algorithms
    │   ├── insights.ts           # Automated insight generation
    │   └── types.ts              # Intelligence TypeScript definitions
    └── actions/
        └── intelligence-actions.ts # Server Actions for risk updates
```

### Pattern 1: Portfolio Risk Aggregation
**What:** Server-side aggregation of lowest scores across advisor's entire client portfolio
**When to use:** For master risk list and portfolio-level insights
**Example:**
```typescript
// lib/intelligence/queries.ts
// Source: Research on Prisma multi-tenant patterns 2026
export async function getPortfolioRiskInsights(
  advisorProfileId: string
): Promise<PortfolioRiskInsight[]> {
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE'
    },
    include: {
      client: {
        include: {
          assessments: {
            where: { status: 'COMPLETED' },
            include: { scores: true },
            orderBy: { completedAt: 'desc' },
            take: 1 // Latest assessment only
          }
        }
      }
    }
  });

  const riskInsights: PortfolioRiskInsight[] = [];

  for (const assignment of assignments) {
    const latestAssessment = assignment.client.assessments[0];
    if (!latestAssessment) continue;

    // Find top 3 lowest scoring pillars
    const sortedPillars = latestAssessment.scores
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    for (const pillar of sortedPillars) {
      if (pillar.score < RISK_THRESHOLD) {
        riskInsights.push({
          clientId: assignment.clientId,
          clientName: assignment.client.email,
          assessmentId: latestAssessment.id,
          pillarId: pillar.pillar,
          pillarName: CATEGORY_LABELS[pillar.pillar],
          score: pillar.score,
          riskLevel: pillar.riskLevel,
          lastAssessed: latestAssessment.completedAt,
          priority: calculateRiskPriority(pillar.score, pillar.riskLevel)
        });
      }
    }
  }

  return riskInsights.sort((a, b) => b.priority - a.priority);
}
```

### Pattern 2: Type-Safe Risk Alert Actions
**What:** Server Actions for updating risk alert preferences and marking insights as reviewed
**When to use:** For interactive risk management workflows
**Example:**
```typescript
// lib/actions/intelligence-actions.ts
// Source: next-safe-action 7.10.0 API documentation
import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';

const markInsightReviewedSchema = z.object({
  clientId: z.string(),
  pillarId: z.string(),
  reviewed: z.boolean()
});

export const markInsightReviewed = actionClient
  .schema(markInsightReviewedSchema)
  .action(async ({ parsedInput: { clientId, pillarId, reviewed } }) => {
    // Update risk insight review status
    await prisma.riskInsightReview.upsert({
      where: {
        clientId_pillarId: {
          clientId,
          pillarId
        }
      },
      create: {
        clientId,
        pillarId,
        reviewedAt: reviewed ? new Date() : null,
        reviewed
      },
      update: {
        reviewedAt: reviewed ? new Date() : null,
        reviewed
      }
    });

    revalidatePath('/advisor/intelligence');
    return { success: true };
  });
```

### Pattern 3: Risk Level Component Variants
**What:** Consistent risk level styling using existing shadcn Alert variants
**When to use:** For all risk indicator displays
**Example:**
```typescript
// components/intelligence/RiskAlertCard.tsx
// Source: shadcn/ui Alert component API 2026
interface RiskAlertCardProps {
  insight: PortfolioRiskInsight;
  onViewDetails: (assessmentId: string) => void;
}

export function RiskAlertCard({ insight, onViewDetails }: RiskAlertCardProps) {
  const alertVariant = {
    'CRITICAL': 'destructive',
    'HIGH': 'warning',
    'MEDIUM': 'warning',
    'LOW': 'info'
  }[insight.riskLevel] as 'destructive' | 'warning' | 'info';

  const riskIcon = {
    'CRITICAL': AlertTriangle,
    'HIGH': AlertCircle,
    'MEDIUM': TrendingDown,
    'LOW': Info
  }[insight.riskLevel];

  const Icon = riskIcon;

  return (
    <Alert variant={alertVariant} className="cursor-pointer hover:shadow-md transition-shadow">
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex justify-between items-center">
        <span>{insight.pillarName}</span>
        <Badge variant="outline">{insight.score.toFixed(1)}/10</Badge>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          {insight.clientName} • Last assessed {format(insight.lastAssessed, 'MMM d, yyyy')}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(insight.assessmentId)}
        >
          View Details
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Anti-Patterns to Avoid
- **Client-side risk calculations:** Keep scoring and threshold logic on server for consistency and security
- **Hardcoded risk thresholds:** Make risk thresholds configurable per advisor preferences
- **Missing audit trails:** Track when insights are reviewed for compliance and follow-up patterns

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Risk score algorithms | Custom scoring logic | Extend existing PILLAR_WEIGHTS system | Already proven, weighted, and validated |
| Alert notifications | Custom notification system | shadcn Alert with variants | Accessibility, consistent styling, proven patterns |
| Portfolio aggregation | Custom database queries | Prisma with include relations | Type safety, query optimization, existing patterns |
| Action state management | Custom form handling | next-safe-action with useActionState | TypeScript inference, loading states, error handling |
| Risk level styling | Custom CSS classes | class-variance-authority with Alert | Consistent variants, maintainable, already integrated |

**Key insight:** Intelligence features are fundamentally data aggregation and presentation problems - leverage existing analytics foundation rather than rebuilding scoring, styling, or data access patterns.

## Common Pitfalls

### Pitfall 1: Performance Issues with Portfolio Queries
**What goes wrong:** Slow dashboard loading when aggregating data across large client portfolios
**Why it happens:** N+1 queries when fetching assessment data for each client separately
**How to avoid:** Use Prisma include relations with proper indexing on advisorId and assessment status
**Warning signs:** Dashboard loading times > 2 seconds, multiple database queries in network tab

### Pitfall 2: Stale Risk Data
**What goes wrong:** Intelligence dashboard shows outdated risk information after new assessments
**Why it happens:** Missing cache invalidation when assessments are completed
**How to avoid:** Use revalidatePath in assessment completion actions, implement proper TanStack Query cache keys
**Warning signs:** Users report seeing old scores, manual page refresh shows different data

### Pitfall 3: Risk Alert Fatigue
**What goes wrong:** Too many low-priority alerts overwhelm advisors, reducing engagement with critical issues
**Why it happens:** No prioritization logic or threshold configuration for risk alerts
**How to avoid:** Implement configurable risk thresholds, limit alerts to top 3 per family, provide "mark as reviewed" functionality
**Warning signs:** Users ignore intelligence dashboard, complaints about too many notifications

### Pitfall 4: Missing Assessment Context
**What goes wrong:** Risk alerts don't provide enough context for advisors to take action
**Why it happens:** Intelligence features only show scores without linking to underlying assessment responses
**How to avoid:** Always provide drill-down to assessment details, include "last assessed" timestamps, link to specific questions
**Warning signs:** Advisors ask "why is this a risk?" or can't find assessment details

### Pitfall 5: Inconsistent Risk Level Classifications
**What goes wrong:** Same scores classified differently between single-family analytics and portfolio intelligence
**Why it happens:** Different risk threshold logic between Phase 12 charts and Phase 13 intelligence
**How to avoid:** Reuse existing risk level logic from PillarScore.riskLevel, maintain single source of truth for thresholds
**Warning signs:** Users see conflicting risk levels between analytics and intelligence pages

## Code Examples

Verified patterns from official sources:

### Portfolio Intelligence Dashboard Query
```typescript
// lib/intelligence/queries.ts
// Source: Prisma multi-tenant patterns and current analytics implementation
export async function getAdvisorIntelligenceData(
  advisorProfileId: string
): Promise<AdvisorIntelligenceData> {
  // Get all active client assignments with latest assessments
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE'
    },
    include: {
      client: {
        select: {
          id: true,
          email: true,
          assessments: {
            where: { status: 'COMPLETED' },
            include: { scores: true },
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  const familyRisks: FamilyRiskSummary[] = [];
  const portfolioRisks: PortfolioRiskItem[] = [];

  for (const assignment of assignments) {
    const latestAssessment = assignment.client.assessments[0];
    if (!latestAssessment) continue;

    // Calculate top 3 risks for this family
    const sortedRisks = latestAssessment.scores
      .map(score => ({
        pillarId: score.pillar,
        pillarName: CATEGORY_LABELS[score.pillar] || score.pillar,
        score: score.score,
        riskLevel: score.riskLevel,
        weight: PILLAR_WEIGHTS[score.pillar as keyof typeof PILLAR_WEIGHTS] || 0
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    familyRisks.push({
      clientId: assignment.client.id,
      clientName: assignment.client.email,
      topRisks: sortedRisks,
      lastAssessed: latestAssessment.completedAt,
      overallScore: calculateWeightedScore(latestAssessment.scores)
    });

    // Add high/critical risks to portfolio master list
    portfolioRisks.push(
      ...sortedRisks
        .filter(risk => ['HIGH', 'CRITICAL'].includes(risk.riskLevel))
        .map(risk => ({
          ...risk,
          clientId: assignment.client.id,
          clientName: assignment.client.email,
          assessmentId: latestAssessment.id,
          lastAssessed: latestAssessment.completedAt,
          priority: calculateRiskPriority(risk.score, risk.riskLevel)
        }))
    );
  }

  return {
    familyRisks: familyRisks.sort((a, b) => a.overallScore - b.overallScore),
    portfolioRisks: portfolioRisks.sort((a, b) => b.priority - a.priority),
    totalClients: assignments.length,
    clientsWithRisks: familyRisks.filter(f => f.topRisks.some(r => ['HIGH', 'CRITICAL'].includes(r.riskLevel))).length
  };
}
```

### Risk Priority Calculation
```typescript
// lib/intelligence/scoring.ts
// Source: Research on automated risk assessment algorithms 2026
export function calculateRiskPriority(score: number, riskLevel: RiskLevel): number {
  // Weight by pillar importance and score severity
  const baseScore = 10 - score; // Invert score (lower = higher priority)

  const riskMultipliers = {
    'CRITICAL': 4.0,
    'HIGH': 3.0,
    'MEDIUM': 2.0,
    'LOW': 1.0
  };

  return baseScore * riskMultipliers[riskLevel];
}

export const RISK_THRESHOLD = 6.0; // Configurable threshold for risk alerts

export function generateAutomatedInsights(
  familyRisks: FamilyRiskSummary[]
): AutomatedInsight[] {
  const insights: AutomatedInsight[] = [];

  // Portfolio-wide insights
  const totalRiskCount = familyRisks.reduce(
    (acc, family) => acc + family.topRisks.filter(r => r.score < RISK_THRESHOLD).length,
    0
  );

  if (totalRiskCount > 0) {
    insights.push({
      type: 'PORTFOLIO_RISK_SUMMARY',
      title: `${totalRiskCount} Governance Risks Identified`,
      description: `Across ${familyRisks.length} families, ${totalRiskCount} governance areas need attention.`,
      priority: 'HIGH',
      actionable: true
    });
  }

  // Common risk patterns
  const riskCounts = familyRisks.flatMap(f => f.topRisks)
    .reduce((acc, risk) => {
      acc[risk.pillarId] = (acc[risk.pillarId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const commonRisks = Object.entries(riskCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (commonRisks.length > 0) {
    const [mostCommonRisk, count] = commonRisks[0];
    insights.push({
      type: 'COMMON_RISK_PATTERN',
      title: `${CATEGORY_LABELS[mostCommonRisk]} Risk Pattern`,
      description: `${count} families show governance gaps in ${CATEGORY_LABELS[mostCommonRisk].toLowerCase()}.`,
      priority: 'MEDIUM',
      actionable: true
    });
  }

  return insights;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual risk identification | Automated scoring algorithms | 2026 | Real-time risk detection, consistent prioritization |
| Single-family analytics | Portfolio-level aggregation | 2026 | Advisor efficiency, pattern recognition across clients |
| Custom alert systems | next-safe-action with TypeScript | 2025-2026 | Type safety, better error handling, consistent actions |
| Dashboard-only insights | Contextual drill-down to assessments | 2026 | Actionable intelligence, clear remediation paths |

**Deprecated/outdated:**
- Manual spreadsheet tracking: Replaced by automated portfolio dashboards with real-time updates
- API routes for simple actions: Replaced by Server Actions for better TypeScript integration

## Open Questions

1. **Risk Threshold Customization**
   - What we know: Current system uses fixed score thresholds for risk identification
   - What's unclear: Should advisors be able to customize risk thresholds per client or governance area?
   - Recommendation: Phase 13 uses fixed thresholds, defer customization to future enhancement

2. **Historical Risk Trends**
   - What we know: Current analytics show historical score trends for individual families
   - What's unclear: Should intelligence features track risk trend changes over time?
   - Recommendation: Focus on current risk state for Phase 13, historical risk analysis for future phase

3. **Integration with Assessment Workflow**
   - What we know: Risk alerts should link to underlying assessment details
   - What's unclear: Should intelligence features trigger recommended assessment updates?
   - Recommendation: Provide view-only drill-down for Phase 13, workflow integration for future phase

## Sources

### Primary (HIGH confidence)
- [next-safe-action API Documentation](https://next-safe-action.dev/) - TypeScript Server Actions patterns and middleware
- [shadcn/ui Alert Component](https://ui.shadcn.com/docs/components/radix/alert) - Risk notification UI patterns
- [Prisma Client Relations](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries) - Portfolio aggregation queries
- Current codebase analytics implementation - Existing scoring algorithms and data structures

### Secondary (MEDIUM confidence)
- [React.js For FinTech: Integrating Predictive AI Into High-Frequency Trading Dashboards](https://fullstacktechies.com/react-js-for-fintech-predictive-ai-dashboard/) - Financial risk dashboard patterns
- [Next.js Server Actions: The Complete Guide (2026)](https://makerkit.dev/blog/tutorials/nextjs-server-actions) - Modern server action patterns
- [Prisma multi-tenant features discussion](https://github.com/prisma/prisma/discussions/2846) - Multi-tenant portfolio patterns
- [CISOs: Automate risk assessments with AI in 2026](https://www.trustcloud.ai/ai/how-cisos-are-using-ai-to-automate-risk-assessments-in-2025/) - Automated risk identification algorithms

### Tertiary (LOW confidence)
- [shadcn UI React Components](https://www.shadcn.io/ui) - UI component ecosystem overview
- [Top Risk Assessment Tools for 2026](https://cynomi.com/learn/risk-assessment-tools/) - Industry risk assessment patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use or well-established patterns
- Architecture: HIGH - Extends proven Phase 12 analytics patterns with existing data structures
- Pitfalls: HIGH - Based on current codebase analysis and established performance patterns

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days - stable domain, extending existing proven patterns)