# Phase 11: Dashboard Foundation - Research

**Researched:** 2026-03-14
**Domain:** Multi-client dashboard visualization and row-level security
**Confidence:** HIGH

## Summary

Phase 11 requires implementing a secure multi-client governance dashboard for advisors to view assigned families with governance scores. Current codebase has solid foundations: Next.js 15 with App Router, NextAuth 5, Prisma with PostgreSQL, role-based access control via `ClientAdvisorAssignment` model, and existing advisor portal infrastructure. Research identifies proven patterns for row-level security, performance optimization for 50+ records, and responsive dashboard components.

The existing security model already isolates data at the application level via the `ClientAdvisorAssignment` junction table. The advisor portal demonstrates the pattern with `getAssignedClients()` enforcing proper data access controls.

**Primary recommendation:** Build dashboard using TanStack React Table v8 with server-side filtering, implement Prisma-level row filtering for defense in depth, use React Server Components for initial data loading with Suspense boundaries for sub-2s performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack React Table | v8 | Data grid/table | Headless, TypeScript-first, handles virtualization and complex filtering |
| @tanstack/react-query | 5.90.21 | Data fetching/caching | Already in use, handles background updates and optimistic UI |
| Next.js Server Components | 16.1.6 | Dashboard rendering | Reduces client bundle, enables direct DB access, improves performance |
| Lucide React | 0.575.0 | Dashboard icons | Already in use, consistent with existing UI patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-window | ^1.8.8 | Virtualization | If client lists exceed 100 families |
| date-fns | 4.1.0 | Date formatting | Already in use for timestamp display |
| Zod | 4.3.6 | API validation | Already in use for type-safe server actions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | MUI Data Grid X | MUI provides more built-in styling but less flexibility |
| TanStack Table | react-data-table-component | Simpler API but lacks advanced features for large datasets |
| Server Components | Client-side SPA | Client approach gives more interactivity but worse initial performance |

**Installation:**
```bash
npm install @tanstack/react-table
# Optional for virtualization:
npm install react-window @types/react-window
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(protected)/
│   └── advisor/
│       └── dashboard/
│           ├── page.tsx          # Main dashboard server component
│           ├── loading.tsx       # Dashboard skeleton
│           └── components/
│               ├── ClientTable.tsx    # Data table component
│               ├── ScoreCard.tsx      # Individual score display
│               └── FilterPanel.tsx    # Client filtering UI
├── components/dashboard/
│   ├── DataTable.tsx             # Reusable table component
│   └── ScoreVisualization.tsx    # Governance score display
└── lib/
    ├── advisor/
    │   ├── dashboard.ts          # Dashboard data functions
    │   └── security.ts           # Row-level access control
    └── types/dashboard.ts        # TypeScript definitions
```

### Pattern 1: Server Component Data Loading
**What:** Use Server Components for initial dashboard data, Client Components for interactivity
**When to use:** Always for dashboard pages requiring performance under 2 seconds
**Example:**
```typescript
// app/(protected)/advisor/dashboard/page.tsx
export default async function AdvisorDashboard() {
  const { clients } = await getAdvisorClients();

  return (
    <div>
      <Suspense fallback={<ClientTableSkeleton />}>
        <ClientTable initialData={clients} />
      </Suspense>
    </div>
  );
}
```

### Pattern 2: Row-Level Security at Application Level
**What:** Filter data by advisor assignment before sending to client
**When to use:** All advisor queries to prevent data leakage
**Example:**
```typescript
// lib/advisor/dashboard.ts
export async function getAdvisorClients(advisorProfileId: string) {
  return prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE'
    },
    include: {
      client: {
        include: {
          assessments: {
            include: { scores: true },
            where: { status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });
}
```

### Pattern 3: Performance-Optimized Dashboard Loading
**What:** Stream data with parallel loading and skeleton states
**When to use:** Dashboards with 20+ families to meet 2-second requirement
**Example:**
```typescript
// Multiple parallel data fetches wrapped in Suspense
<div className="grid gap-6">
  <Suspense fallback={<MetricsSkeleton />}>
    <DashboardMetrics advisorId={advisorId} />
  </Suspense>
  <Suspense fallback={<ClientTableSkeleton />}>
    <ClientTable advisorId={advisorId} />
  </Suspense>
</div>
```

### Anti-Patterns to Avoid
- **Direct Prisma queries without advisor filtering:** Always filter by `clientAssignments` relationship
- **Large client-side data fetching:** Use Server Components for initial load, client-side for interactions only
- **Missing loading states:** Provide skeletons for all async data to maintain perceived performance

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table virtualization | Custom scrolling tables | TanStack Table + react-window | Handles edge cases, accessibility, complex interactions |
| Data grid sorting/filtering | Custom sort logic | TanStack Table column definitions | Handles multiple column types, complex filter operators |
| Responsive table layouts | Media queries for tables | TanStack Table column visibility API | Handles dynamic column management, user preferences |
| Dashboard state management | Custom hooks for dashboard state | TanStack Query | Handles cache invalidation, background updates, optimistic updates |

**Key insight:** Dashboard data patterns have complex edge cases around real-time updates, offline state, and performance optimization that require mature libraries.

## Common Pitfalls

### Pitfall 1: N+1 Query Problems with Score Display
**What goes wrong:** Fetching governance scores separately for each client causes performance degradation
**Why it happens:** Prisma relations aren't eagerly loaded, causing separate queries per client
**How to avoid:** Use `include` with nested relations or separate query with `IN` clause for score lookup
**Warning signs:** Dashboard loading slows down as client count increases; database query count matches client count

### Pitfall 2: Security Bypass in Direct Client Access
**What goes wrong:** Components directly query client data without advisor relationship check
**Why it happens:** Forgetting to filter by `ClientAdvisorAssignment` in data fetching functions
**How to avoid:** Always use advisor-scoped data functions; never query `User` or `Assessment` directly
**Warning signs:** Advisor sees clients they shouldn't; security audit reveals unfiltered queries

### Pitfall 3: Client-Side Performance with Large Datasets
**What goes wrong:** Dashboard becomes unresponsive with 30+ families due to rendering overhead
**Why it happens:** Rendering all table rows simultaneously without virtualization
**How to avoid:** Implement virtualization early; use Server Components for initial render
**Warning signs:** Page becomes sluggish when scrolling; browser tab uses excessive memory

### Pitfall 4: Responsive Design Failures on Tablets
**What goes wrong:** Dashboard layout breaks or becomes unusable on tablet screens
**Why it happens:** Fixed table layouts don't adapt to intermediate screen sizes
**How to avoid:** Use TanStack Table column visibility API; test on actual tablet devices
**Warning signs:** Horizontal scrolling required; touch interactions don't work properly

## Code Examples

Verified patterns from official sources:

### Multi-Client Data Fetching with Security
```typescript
// Source: Current codebase pattern in src/lib/data/advisor.ts
export async function getAdvisorDashboardData(advisorProfileId: string) {
  // Get assigned clients with latest scores
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        include: {
          assessments: {
            include: {
              scores: {
                orderBy: { calculatedAt: 'desc' },
                take: 1
              }
            },
            where: { status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  return assignments.map(assignment => ({
    clientId: assignment.client.id,
    clientName: assignment.client.name,
    assignedAt: assignment.assignedAt,
    latestScore: assignment.client.assessments[0]?.scores[0] || null
  }));
}
```

### TanStack Table Dashboard Implementation
```typescript
// Source: https://tanstack.com/table/v8/docs/framework/react/react-table
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

type ClientDashboardData = {
  clientId: string;
  clientName: string;
  governanceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastAssessment: Date;
};

const columns: ColumnDef<ClientDashboardData>[] = [
  {
    accessorKey: 'clientName',
    header: 'Family Name',
  },
  {
    accessorKey: 'governanceScore',
    header: 'Score',
    cell: ({ getValue }) => `${getValue()}/10`,
  },
  {
    accessorKey: 'riskLevel',
    header: 'Risk Level',
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'LOW' ? 'success' : 'warning'}>
        {getValue()}
      </Badge>
    ),
  },
];

export function ClientDashboardTable({ data }: { data: ClientDashboardData[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-2 text-left">
                  {header.isPlaceholder ? null : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Responsive Dashboard Layout
```typescript
// Source: Current codebase UI patterns in src/app/(protected)/dashboard/page.tsx
export default function AdvisorDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header section */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-2 sm:space-y-3">
            <p className="editorial-kicker">Multi-Client Dashboard</p>
            <h2 className="text-3xl font-semibold text-balance sm:text-5xl">
              Assigned Families Overview
            </h2>
          </div>

          {/* Metrics card - responsive grid */}
          <Card className="bg-background/60">
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-3 sm:pt-6">
              <div>
                <p className="editorial-kicker">Total Families</p>
                <p className="mt-2 text-3xl font-semibold">{clientCount}</p>
              </div>
              <div>
                <p className="editorial-kicker">Avg Score</p>
                <p className="mt-2 text-3xl font-semibold">{avgScore}/10</p>
              </div>
              <div>
                <p className="editorial-kicker">High Risk</p>
                <p className="mt-2 text-3xl font-semibold">{highRiskCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main dashboard table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Family Governance Overview</CardTitle>
          <CardDescription>
            Monitor governance scores and risk levels across assigned families
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientDashboardTable data={dashboardData} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual table building | TanStack Table v8 | 2024 | TypeScript-first, headless UI, better performance |
| Client-side dashboards | Server Components + streaming | Next.js 13+ | Faster initial load, better SEO, reduced client bundle |
| Custom security patterns | Prisma + application-level filtering | 2023-2024 | More reliable data isolation, easier to audit |
| useEffect data fetching | Server Actions + TanStack Query | Next.js 14+ | Better error handling, optimistic updates, cache management |

**Deprecated/outdated:**
- React Table v7: Replaced by TanStack Table v8 with better TypeScript support
- Manual row-level security: Application-level filtering is safer than database-level RLS for this use case

## Open Questions

1. **Score Aggregation Performance**
   - What we know: Current schema stores individual pillar scores
   - What's unclear: Whether to pre-calculate overall scores or compute on-demand
   - Recommendation: Start with on-demand calculation, add computed column if performance degrades

2. **Real-time Score Updates**
   - What we know: TanStack Query can handle background updates
   - What's unclear: Whether advisors need real-time notifications of score changes
   - Recommendation: Implement polling every 30 seconds; upgrade to WebSockets if real-time is needed

3. **Mobile Experience Scope**
   - What we know: Requirements mention tablet support
   - What's unclear: Whether phone support is needed
   - Recommendation: Clarify with stakeholders; tablet-first approach can extend to phones

## Sources

### Primary (HIGH confidence)
- [TanStack React Table v8 documentation](https://tanstack.com/table/v8/docs/framework/react/react-table) - Core table features and API
- [Material UI Data Grid X Performance](https://mui.com/x/react-data-grid/performance/) - Performance best practices for data grids
- Current codebase patterns in src/lib/data/advisor.ts and src/app/(protected)/advisor/page.tsx

### Secondary (MEDIUM confidence)
- [React Dashboard Components Multi-Client Data Visualization 2026](https://refine.dev/blog/react-admin-dashboard/) - Dashboard frameworks and patterns
- [Next.js 15 Dashboard Performance Optimization](https://www.sitepoint.com/react-server-components-streaming-performance-2026/) - Server Components streaming patterns
- [PostgreSQL Row Level Security Multi-Tenant](https://medium.com/@francolabuschagne90/securing-multi-tenant-applications-using-row-level-security-in-postgresql-with-prisma-orm-4237f4d4bd35) - Multi-tenant security patterns

### Tertiary (LOW confidence)
- [React Performance Optimization 50+ Records](https://www.zignuts.com/blog/react-app-performance-optimization-guide) - General performance guidelines
- [Responsive Data Table Components](https://www.syncfusion.com/blogs/post/top-react-data-grid-libraries) - Data grid library comparisons

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified through official documentation and current codebase usage
- Architecture: HIGH - Patterns proven in current advisor portal implementation
- Pitfalls: MEDIUM - Based on documented patterns but specific to this implementation

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days - stable technology stack)

Sources:
- [React Admin Dashboard - Best Templates & Frameworks (2026 Guide) | Refine](https://refine.dev/blog/react-admin-dashboard/)
- [React Dashboard Libraries: Which One To Use in 2026?](https://www.luzmo.com/blog/react-dashboard)
- [React Table | TanStack Table React Docs](https://tanstack.com/table/v8/docs/framework/react/react-table)
- [React Data Grid component - MUI X](https://mui.com/x/react-data-grid/)
- [Data Grid - Performance - MUI X](https://mui.com/x/react-data-grid/performance/)
- [Securing Multi-Tenant Applications Using Row Level Security in PostgreSQL with Prisma ORM](https://medium.com/@francolabuschagne90/securing-multi-tenant-applications-using-row-level-security-in-postgresql-with-prisma-orm-4237f4d4bd35)
- [React Server Components Streaming Performance Guide 2026](https://www.sitepoint.com/react-server-components-streaming-performance-2026/)
- [React App Performance Optimization Guide: 2026 Expert Tips](https://www.zignuts.com/blog/react-app-performance-optimization-guide)
- [5 Best React Data Grid Libraries for Data‑Driven Apps in 2026](https://www.syncfusion.com/blogs/post/top-react-data-grid-libraries)