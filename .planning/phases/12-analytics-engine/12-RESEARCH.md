# Phase 12: Analytics Engine - Research

**Researched:** 2026-03-14
**Domain:** React data visualization and governance analytics
**Confidence:** HIGH

## Summary

Phase 12 requires implementing advisor analytics for governance trends and risk patterns using line charts, governance category breakdowns, and historical comparisons. Current codebase has solid foundations with existing TanStack React Query v5, Next.js 16 App Router, and data access patterns established in Phase 11. No charting library currently exists - need to add production-ready solution.

Research identifies Recharts v3.8.0 as the optimal choice for this domain: React-native components, TypeScript-first APIs, proven performance for governance datasets (8 categories, 68 questions), and strong accessibility support. The existing codebase already demonstrates good score visualization patterns in `ScoreDisplay.tsx` that can be extended to historical trends.

**Primary recommendation:** Use Recharts v3.8.0 for line charts and governance breakdowns, implement time-series data aggregation with TanStack Query for caching, follow Server Component patterns from Phase 11 for optimal performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | v3.8.0 | Chart rendering | React-native, TypeScript-first, handles governance datasets well, strong accessibility |
| TanStack React Query | 5.90.21 | Data fetching/caching | Already in use, perfect for time-series data caching and background updates |
| date-fns | 4.1.0 | Date handling | Already in use, essential for time-series x-axis formatting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Server Components | 16.1.6 | Initial chart data | Server-side data aggregation for better performance |
| Lucide React | 0.575.0 | Chart icons/legends | Already in use, consistent iconography |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js (react-chartjs-2) | Canvas rendering for 100k+ points but governance data is small |
| Recharts | Apache ECharts | Real-time streaming but overkill for governance analytics |
| Recharts | Victory | Strong accessibility but heavier bundle, more complex API |

**Installation:**
```bash
npm install recharts
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(protected)/advisor/
│   └── analytics/
│       ├── page.tsx              # Analytics dashboard Server Component
│       ├── loading.tsx           # Analytics skeleton
│       └── components/
│           ├── GovernanceTrendChart.tsx    # Line chart for historical trends
│           ├── CategoryBreakdownChart.tsx  # Governance category visualization
│           └── ComparisonChart.tsx         # Assessment period comparisons
├── components/analytics/
│   ├── ChartContainer.tsx        # Reusable chart wrapper with responsive sizing
│   ├── ScoreLineChart.tsx        # Reusable line chart component
│   └── GovernanceRadarChart.tsx  # Category breakdown radar/bar charts
└── lib/
    ├── analytics/
    │   ├── aggregation.ts        # Time-series data aggregation functions
    │   ├── queries.ts            # Assessment data queries for charts
    │   └── types.ts              # Chart data TypeScript definitions
    └── charts/
        ├── formatters.ts         # Date/score formatting for charts
        └── themes.ts             # Consistent chart styling
```

### Pattern 1: Time-Series Data Aggregation
**What:** Server-side aggregation of historical assessment data into chart-ready format
**When to use:** For governance trend analysis across multiple assessment periods
**Example:**
```typescript
// lib/analytics/aggregation.ts
// Source: Research findings on React dashboard patterns 2026
export async function getGovernanceTrends(
  clientId: string,
  advisorId: string
): Promise<GovernanceTrendData[]> {
  const assessments = await prisma.assessment.findMany({
    where: {
      userId: clientId,
      user: {
        clientAssignments: {
          some: { advisorId }
        }
      },
      status: 'COMPLETED'
    },
    include: {
      scores: true
    },
    orderBy: {
      completedAt: 'asc'
    }
  });

  return assessments.map(assessment => ({
    date: assessment.completedAt,
    overallScore: calculateOverallScore(assessment.scores),
    categoryScores: assessment.scores.reduce((acc, score) => {
      acc[score.pillar] = score.score;
      return acc;
    }, {} as Record<string, number>)
  }));
}
```

### Pattern 2: Responsive Chart Container
**What:** Wrapper component handling responsive sizing and consistent styling
**When to use:** For all chart components to ensure consistency
**Example:**
```typescript
// components/analytics/ChartContainer.tsx
// Source: Recharts v3.8.0 API documentation
interface ChartContainerProps {
  title: string;
  children: ReactNode;
  height?: number;
}

export function ChartContainer({
  title,
  children,
  height = 300
}: ChartContainerProps) {
  return (
    <div className="rounded-[1.25rem] border bg-background/55 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Client-side data aggregation:** Process time-series data on server to reduce bundle size and improve performance
- **Inline chart configuration:** Extract chart configs to reusable theme objects for consistency
- **Missing responsive containers:** Always wrap charts in ResponsiveContainer for proper mobile rendering

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG/Canvas components | Recharts LineChart/BarChart | Accessibility, touch interactions, legend handling, responsive behavior |
| Time-series formatting | Custom date/time formatters | date-fns + Recharts formatters | Timezone handling, locale support, performance optimization |
| Data tooltips | Custom hover overlays | Recharts Tooltip component | Positioning, mobile touch handling, accessibility |
| Chart legends | Custom legend components | Recharts Legend | Interactive show/hide, consistent styling, accessibility labels |
| Responsive sizing | Manual resize listeners | Recharts ResponsiveContainer | Performance optimization, proper cleanup, mobile handling |

**Key insight:** Chart libraries solve dozens of edge cases (mobile touch, accessibility, data edge cases, responsive behavior) that appear simple but are complex to implement correctly.

## Common Pitfalls

### Pitfall 1: SVG Performance with Large Datasets
**What goes wrong:** Charts become sluggish with 100+ data points using pure SVG rendering
**Why it happens:** SVG reflows the entire DOM on updates, unlike Canvas which repaints regions
**How to avoid:** Recharts handles governance datasets (8 categories, ~10 assessments max) well with SVG
**Warning signs:** Frame rate drops below 30fps, scrolling lag in dashboard

### Pitfall 2: Missing Accessibility Labels
**What goes wrong:** Screen readers can't interpret chart data, violating WCAG 2.1 requirements
**Why it happens:** Charts render as images without semantic HTML structure
**How to avoid:** Use Recharts' built-in accessibility props (aria-label, role="img", description)
**Warning signs:** Accessibility audit failures, poor screen reader experience

### Pitfall 3: Inconsistent Date Formatting
**What goes wrong:** Mixed date formats between charts, timezone issues, locale problems
**Why it happens:** Default JavaScript Date handling varies by browser and user settings
**How to avoid:** Use date-fns consistently for all chart date formatting with explicit timezone handling
**Warning signs:** Charts show different date formats, time shifts between users

### Pitfall 4: Mobile Touch Interaction Issues
**What goes wrong:** Charts don't respond to touch interactions, tooltips don't appear, poor mobile UX
**Why it happens:** Desktop-first chart design doesn't account for touch interaction patterns
**How to avoid:** Recharts handles touch events natively, test on mobile devices early
**Warning signs:** Touch gestures don't work, tooltips require multiple taps

### Pitfall 5: Data Loading States
**What goes wrong:** Charts show empty state or error during data loading, poor perceived performance
**Why it happens:** No skeleton/loading states while fetching time-series data
**How to avoid:** Use Suspense boundaries and loading skeletons, cache data with TanStack Query
**Warning signs:** Flash of empty content, user confusion during loading

## Code Examples

Verified patterns from official sources:

### Governance Trend Line Chart
```typescript
// components/analytics/GovernanceTrendChart.tsx
// Source: Recharts v3.8.0 API documentation
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TrendData {
  date: Date;
  overallScore: number;
  [category: string]: number | Date;
}

export function GovernanceTrendChart({ data }: { data: TrendData[] }) {
  const formatXAxisDate = (date: Date) => format(date, 'MMM yyyy');

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxisDate}
          type="category"
        />
        <YAxis
          domain={[0, 10]}
          label={{ value: 'Governance Score', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
          formatter={(value: number) => [value.toFixed(1), 'Score']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="overallScore"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Overall Governance Score"
          aria-label="Overall governance score trend over time"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Category Breakdown Bar Chart
```typescript
// components/analytics/CategoryBreakdownChart.tsx
// Source: Recharts v3.8.0 API documentation
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  categoryName: string;
  score: number;
  maxScore: number;
}

export function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <XAxis
          dataKey="categoryName"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis
          domain={[0, 10]}
          label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `${value.toFixed(1)} / ${props.payload.maxScore}`,
            'Governance Score'
          ]}
        />
        <Bar
          dataKey="score"
          fill="#3b82f6"
          name="Category Score"
          aria-label="Governance category scores"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom D3 integration | React-native chart libraries | 2024-2025 | Easier maintenance, better React integration |
| Client-side aggregation | Server Component data processing | 2025-2026 | Better performance, reduced bundle size |
| Pure SVG rendering | Canvas for large datasets | 2025-2026 | Handles 100k+ points, but governance data stays SVG |
| Manual responsive design | ResponsiveContainer components | 2024 | Consistent mobile experience |

**Deprecated/outdated:**
- Victory Charts: Heavy bundle size, complex API, replaced by Recharts for simpler use cases
- Custom D3 React integration: Maintenance overhead, accessibility challenges, replaced by purpose-built libraries

## Open Questions

1. **Real-time Updates for Active Assessments**
   - What we know: Current assessments are in-progress, completed ones are static
   - What's unclear: Should charts update as advisors complete new assessments?
   - Recommendation: Phase 12 focuses on historical trends, defer real-time to future phase

2. **Data Retention and Chart Performance**
   - What we know: Governance assessments typically annual, 8 categories, small dataset
   - What's unclear: Long-term performance if clients have 10+ years of assessments
   - Recommendation: Recharts handles this scale well, monitor and optimize if needed

3. **Cross-Family Comparisons**
   - What we know: Requirements focus on individual family trends
   - What's unclear: Do advisors need aggregate trends across their client portfolio?
   - Recommendation: Individual family focus for Phase 12, portfolio view for future phase

## Sources

### Primary (HIGH confidence)
- [Recharts GitHub Repository](https://github.com/recharts/recharts) - v3.8.0 API verification and examples
- [Recharts API Documentation](https://recharts.github.io/en-US/api/) - Component specifications and props

### Secondary (MEDIUM confidence)
- [Top 5 React Chart Libraries for 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) - Library comparison and performance analysis
- [8 Top React Chart Libraries for Data Visualization in 2026](https://querio.ai/articles/top-react-chart-libraries-data-visualization) - Ecosystem overview and best practices
- [React Dashboard Analytics Patterns 2026](https://www.syncfusion.com/blogs/post/create-a-simple-dashboard-for-data-analysis-in-react) - Data aggregation patterns
- [React Chart Performance and Accessibility](https://www.fusioncharts.com/blog/12-helpful-tips-for-doing-powerful-react-graphs/) - Common pitfalls and optimization

### Tertiary (LOW confidence)
- Various dashboard template and tutorial sources - General patterns verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts proven for governance analytics, current codebase compatible
- Architecture: HIGH - Server Component patterns established in Phase 11, data access proven
- Pitfalls: MEDIUM - Performance estimates based on typical governance dataset size

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days - stable domain, established libraries)