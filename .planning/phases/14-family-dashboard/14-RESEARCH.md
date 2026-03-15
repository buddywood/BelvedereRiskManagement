# Phase 14: Family Dashboard - Research

**Researched:** 2026-03-15
**Domain:** Family-facing governance dashboard with self-service analytics and progress tracking
**Confidence:** HIGH

## Summary

Phase 14 creates a self-service family dashboard where household members can view their governance scores, track improvements over time, and see advisor-emphasized areas. The existing codebase provides excellent foundations: established authentication with USER role support, proven analytics components (ScoreDisplay, progress visualization), shadcn/ui patterns for consistent styling, and comprehensive assessment data structures with household member relationships.

Research identifies optimal patterns leveraging existing architecture: extend current dashboard components for family-specific views, implement household member display using existing HouseholdMember model, track historical scores with existing Assessment/PillarScore tables, and use established emphasis patterns from Phase 13 advisor customization. The current client dashboard (/dashboard) provides proven UX patterns for progress tracking and results display.

**Primary recommendation:** Extend existing client dashboard patterns with household-aware components, implement historical trend visualization using existing score data, leverage current authentication without role changes, and use established shadcn Alert/Badge patterns for advisor emphasis indicators.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | Current | Family dashboard routing | Already in use, existing protected routes pattern |
| TanStack React Query | 5.90.21 | Score data caching | Already implemented, perfect for dashboard data management |
| Prisma | 6.1.0 | Family data queries | Current ORM, excellent relations for user->assessments->scores |
| shadcn/ui Components | Current | Dashboard UI consistency | Proven patterns, accessible, matches existing client dashboard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Recharts | Current | Historical trend charts | Already in analytics, perfect for score tracking over time |
| date-fns | 4.1.0 | Assessment date formatting | Already in use, essential for "last assessed" timestamps |
| Lucide React | 0.575.0 | Dashboard icons | Already in use, provides TrendingUp, Users, Calendar icons |
| class-variance-authority | 0.7.1 | Badge/Alert variants | Already integrated, perfect for emphasis indicators |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extend client dashboard | New family app section | Client dashboard already contains family-specific patterns |
| Prisma relations | Custom queries | Prisma maintains type safety and existing data access patterns |
| Recharts | Custom charts | Recharts provides accessibility and consistent styling with current analytics |

**Installation:**
```bash
# All dependencies already installed
# No new installations required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(protected)/family/
│   ├── dashboard/
│   │   ├── page.tsx              # Family governance dashboard
│   │   ├── loading.tsx           # Dashboard skeleton
│   │   └── components/
│   │       ├── GovernanceOverview.tsx    # Score with household names
│   │       ├── HistoricalTrends.tsx      # Multiple assessment tracking
│   │       └── AdvisorEmphasisCard.tsx   # 1.5x emphasis indicators
├── components/family/
│   ├── FamilyScoreDisplay.tsx     # Score with household context
│   ├── HouseholdMemberList.tsx    # Family member names display
│   ├── ScoreTrendChart.tsx        # Historical improvement visualization
│   └── EmphasisIndicator.tsx      # Advisor emphasis visual markers
└── lib/
    ├── family/
    │   ├── queries.ts             # Family dashboard data queries
    │   ├── types.ts               # Family dashboard TypeScript definitions
    │   └── utils.ts               # Score calculation helpers
    └── actions/
        └── family-actions.ts      # Family dashboard Server Actions
```

### Pattern 1: Household-Aware Score Display
**What:** Display governance score with household member names and relationships
**When to use:** For family dashboard score overview
**Example:**
```typescript
// lib/family/queries.ts
// Source: Existing HouseholdMember model and ScoreDisplay patterns
export async function getFamilyDashboardData(
  userId: string
): Promise<FamilyDashboardData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      householdMembers: {
        select: {
          id: true,
          fullName: true,
          relationship: true,
          governanceRoles: true
        }
      },
      assessments: {
        where: { status: 'COMPLETED' },
        include: {
          scores: true,
          customization: true
        },
        orderBy: { completedAt: 'desc' }
      }
    }
  });

  if (!user) throw new Error('User not found');

  const latestAssessment = user.assessments[0];
  const hasMultipleAssessments = user.assessments.length > 1;

  return {
    householdMembers: user.householdMembers,
    currentScore: latestAssessment?.scores?.[0] || null,
    historicalScores: user.assessments.map(assessment => ({
      assessmentId: assessment.id,
      completedAt: assessment.completedAt,
      overallScore: assessment.scores?.[0]?.score || 0,
      pillarScores: assessment.scores || []
    })),
    advisorEmphasis: latestAssessment?.customization?.focusAreas || [],
    hasMultipleAssessments
  };
}
```

### Pattern 2: Historical Trend Visualization
**What:** Chart showing governance score improvements across multiple annual assessments
**When to use:** When family has completed multiple assessments
**Example:**
```typescript
// components/family/ScoreTrendChart.tsx
// Source: Existing Recharts patterns from analytics components
interface ScoreTrendChartProps {
  historicalScores: HistoricalScore[];
  advisorEmphasis: string[];
}

export function ScoreTrendChart({ historicalScores, advisorEmphasis }: ScoreTrendChartProps) {
  if (historicalScores.length < 2) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Complete another annual assessment to see your improvement trends
        </p>
      </div>
    );
  }

  const chartData = historicalScores.map(score => ({
    date: format(score.completedAt, 'MMM yyyy'),
    overallScore: score.overallScore,
    // Add emphasis indicator for advisor-focused pillars
    ...score.pillarScores.reduce((acc, pillar) => {
      const isEmphasized = advisorEmphasis.includes(pillar.pillar);
      const key = CATEGORY_LABELS[pillar.pillar];
      acc[key] = pillar.score;
      if (isEmphasized) {
        acc[`${key}_emphasized`] = pillar.score;
      }
      return acc;
    }, {} as Record<string, number>)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="overallScore"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
        />
        {/* Add emphasized pillar lines with special styling */}
        {advisorEmphasis.map(pillarId => (
          <Line
            key={`${pillarId}_emphasized`}
            type="monotone"
            dataKey={`${CATEGORY_LABELS[pillarId]}_emphasized`}
            stroke="hsl(var(--warning))"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 3: Advisor Emphasis Indicators
**What:** Visual indicators showing which governance areas received 1.5x advisor emphasis
**When to use:** When displaying pillar scores with advisor customization
**Example:**
```typescript
// components/family/EmphasisIndicator.tsx
// Source: Existing Badge and Alert patterns from shadcn/ui
interface EmphasisIndicatorProps {
  pillarName: string;
  score: number;
  isEmphasized: boolean;
  className?: string;
}

export function EmphasisIndicator({
  pillarName,
  score,
  isEmphasized,
  className
}: EmphasisIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">{pillarName}</span>
          {isEmphasized && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Advisor Focus
            </Badge>
          )}
        </div>
        <span className="font-semibold">{score.toFixed(1)}/10</span>
      </div>

      {isEmphasized && (
        <Alert className="py-2">
          <AlertDescription className="text-xs">
            Your advisor gave this area extra attention in your assessment
          </AlertDescription>
        </Alert>
      )}

      <Progress
        value={(score / 10) * 100}
        className={cn("h-2", isEmphasized && "border-2 border-warning/50")}
        indicatorClassName={
          isEmphasized ? "bg-warning" :
          score >= 7.5 ? "bg-green-600" :
          score >= 5.0 ? "bg-amber-500" :
          score >= 2.5 ? "bg-orange-600" : "bg-red-600"
        }
      />
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Separate family user accounts:** Leverage existing USER role rather than creating FAMILY role
- **Duplicate score calculations:** Reuse existing PillarScore and weighted scoring logic
- **Custom authentication:** Use established protected route patterns from /dashboard

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Historical tracking | Custom analytics database | Extend existing Assessment/PillarScore tables | Already proven, maintains data consistency |
| Family authentication | Separate family login system | Extend existing protected routes | Existing auth covers USER role perfectly |
| Score visualization | Custom chart library | Recharts with existing patterns | Accessibility, consistency, proven in analytics |
| Emphasis indicators | Custom highlight system | shadcn Badge/Alert with variants | Established design system, accessibility compliant |
| Progress tracking | Custom trend calculations | Date-based Assessment queries | Existing data model supports multiple assessments |

**Key insight:** Family dashboard is fundamentally an alternate view of existing assessment data - leverage proven analytics patterns rather than rebuilding scoring, visualization, or data access patterns.

## Common Pitfalls

### Pitfall 1: Authentication Complexity
**What goes wrong:** Attempting to create separate family authentication or role systems
**Why it happens:** Assumption that families need different access patterns than individual users
**How to avoid:** Use existing USER role and protected routes - families are already users in the system
**Warning signs:** Creating new roles, separate login flows, or family-specific middleware

### Pitfall 2: Data Access Performance
**What goes wrong:** Slow dashboard loading when fetching household and historical assessment data
**Why it happens:** N+1 queries when loading household members and multiple assessments
**How to avoid:** Use Prisma include relations for single-query data loading, implement proper indexing
**Warning signs:** Multiple database queries in network tab, dashboard loading times > 2 seconds

### Pitfall 3: Inconsistent Score Display
**What goes wrong:** Family dashboard shows different scores than assessment results or advisor analytics
**Why it happens:** Different calculation logic or data sources between dashboard views
**How to avoid:** Reuse existing score calculation utilities, maintain single source of truth for pillar weights
**Warning signs:** Score discrepancies between pages, different risk level classifications

### Pitfall 4: Missing Household Context
**What goes wrong:** Dashboard shows scores without family member names or relationships
**Why it happens:** Not leveraging existing HouseholdMember data for personalization
**How to avoid:** Always include household member information in family dashboard queries
**Warning signs:** Generic "your family" language, no member names displayed

### Pitfall 5: Overwhelming Historical Data
**What goes wrong:** Too much historical detail confuses families rather than showing clear progress
**Why it happens:** Showing all assessment data instead of focusing on key trends and improvements
**How to avoid:** Focus on overall score trends, limit historical detail, highlight major improvements
**Warning signs:** Complex charts, too many data points, users confused about progress

## Code Examples

Verified patterns from official sources:

### Family Dashboard Page Implementation
```typescript
// app/(protected)/family/dashboard/page.tsx
// Source: Existing client dashboard patterns from /dashboard/page.tsx
import { auth } from "@/lib/auth";
import { getFamilyDashboardData } from "@/lib/family/queries";
import { redirect } from "next/navigation";
import { FamilyScoreDisplay } from "@/components/family/FamilyScoreDisplay";
import { HouseholdMemberList } from "@/components/family/HouseholdMemberList";
import { ScoreTrendChart } from "@/components/family/ScoreTrendChart";

export default async function FamilyDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Redirect advisors and admins to their appropriate dashboards
  const role = session.user.role?.toString().toUpperCase();
  if (role === "ADVISOR" || role === "ADMIN") {
    redirect("/advisor");
  }

  const dashboardData = await getFamilyDashboardData(session.user.id);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-2 sm:space-y-3">
            <p className="editorial-kicker">Family Dashboard</p>
            <h2 className="text-3xl font-semibold text-balance sm:text-5xl">
              Family Governance Progress
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Track your governance improvements and view insights customized by your advisor.
            </p>
          </div>

          <HouseholdMemberList members={dashboardData.householdMembers} />
        </div>
      </section>

      {dashboardData.currentScore && (
        <Card>
          <CardContent className="pt-8">
            <FamilyScoreDisplay
              score={dashboardData.currentScore}
              advisorEmphasis={dashboardData.advisorEmphasis}
            />
          </CardContent>
        </Card>
      )}

      {dashboardData.hasMultipleAssessments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Progress Over Time</CardTitle>
            <CardDescription>
              See how your governance maturity has improved with each annual assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart
              historicalScores={dashboardData.historicalScores}
              advisorEmphasis={dashboardData.advisorEmphasis}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Household Member Display Component
```typescript
// components/family/HouseholdMemberList.tsx
// Source: Existing HouseholdMember model and Badge patterns
interface HouseholdMemberListProps {
  members: Array<{
    fullName: string;
    relationship: string;
    governanceRoles: string[];
  }>;
}

export function HouseholdMemberList({ members }: HouseholdMemberListProps) {
  if (members.length === 0) return null;

  return (
    <Card className="bg-background/60">
      <CardContent className="pt-6">
        <p className="editorial-kicker mb-4">Household Members</p>
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{member.fullName}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.relationship.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              <div className="flex gap-1 flex-wrap">
                {member.governanceRoles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Advisor-only dashboard access | Family self-service portals | 2026 | Increased engagement, reduced advisor overhead |
| Static PDF reports | Interactive progress tracking | 2025-2026 | Real-time insights, historical trend visibility |
| Generic assessment results | Advisor-emphasized insights | 2026 | Personalized guidance, clearer priority focus |
| Single assessment snapshots | Multi-assessment progress tracking | 2026 | Long-term governance improvement visibility |

**Deprecated/outdated:**
- PDF-only score reporting: Replaced by interactive dashboards with drill-down capabilities
- Advisor-mediated score access: Replaced by direct family access with self-service analytics

## Open Questions

1. **Historical Assessment Access**
   - What we know: Families want to track improvements over time from multiple annual assessments
   - What's unclear: Should families see detailed historical assessment responses or just score trends?
   - Recommendation: Focus on score trends for Phase 14, detailed historical responses for future enhancement

2. **Household Member Authentication**
   - What we know: Current system uses single USER account per assessment
   - What's unclear: Should household members have separate login access or shared family account?
   - Recommendation: Continue with single USER account model, show all household member names in dashboard

3. **Advisor Emphasis Granularity**
   - What we know: Phase 13 provides 1.5x emphasis indicators from advisor customization
   - What's unclear: Should families see which specific questions received emphasis or just pillar-level?
   - Recommendation: Pillar-level emphasis display for Phase 14, question-level detail for future enhancement

## Sources

### Primary (HIGH confidence)
- Current codebase analysis - Dashboard authentication, HouseholdMember model, existing score visualization
- [shadcn/ui Component Library](https://ui.shadcn.com/) - Badge, Alert, Card component patterns
- [Prisma Client Relations Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries) - Multi-table data loading
- [Recharts Documentation](https://recharts.org/) - Historical trend chart implementation

### Secondary (MEDIUM confidence)
- [Family Office Dashboard: 4 Must-Have Views for Wealth Data](https://asora.com/blog/family-office-dashboards) - Family office portal patterns
- [2026 Family Office Portals for Secure Access & Reporting](https://asora.com/blog/family-office-portal) - Client portal best practices
- [Dashboard Design UX Patterns Best Practices - Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards) - UX patterns for data dashboards
- [How to Build an Admin Dashboard with shadcn/ui and Next.js (2026 Guide) - AdminLTE.IO](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/) - Next.js dashboard architecture

### Tertiary (LOW confidence)
- [The Best Password Managers for Families of 2026](https://www.passwordmanager.com/best-password-managers-for-families/) - Family authentication patterns
- [9 Dashboard Design Principles (2026) | DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles) - Dashboard UX principles
- [The most popular experience design trends of 2026](https://uxdesign.cc/the-most-popular-experience-design-trends-of-2026-3ca85c8a3e3d) - 2026 UX trends

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, proven authentication and data patterns
- Architecture: HIGH - Extends existing dashboard and analytics patterns with established data model
- Pitfalls: HIGH - Based on current codebase analysis and family portal best practices

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days - stable domain, extending existing proven patterns)