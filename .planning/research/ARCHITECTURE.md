# Architecture Research

**Domain:** Governance intelligence dashboards for Next.js assessment platform
**Researched:** 2026-03-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Client    │  │   Advisor   │  │  Dashboard  │  │  Analytics  │ │
│  │ Dashboard   │  │ Management  │  │  Widgets    │  │   Views     │ │
│  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘ │
│        │                │                │                │         │
├────────┴────────────────┴────────────────┴────────────────┴─────────┤
│                      Business Logic Layer                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           Server Actions + API Routes                       │   │
│  │  • Assessment aggregation  • Report generation             │   │
│  │  • Multi-client analytics  • Real-time data sync           │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                      Data Access Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Prisma     │  │    Caching   │  │   External   │              │
│  │   Client     │  │   (Redis)    │  │   Services   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Dashboard Widgets | Real-time data display, charts, KPIs | React components with SWR/React Query |
| Analytics Views | Historical trends, comparative analysis | Server Components with Prisma aggregations |
| Multi-Client Manager | Tenant isolation, client filtering | Row-level security with Prisma middleware |
| Assessment Aggregator | Score calculations, trend analysis | Background jobs + cached results |
| Report Generator | PDF generation, template processing | React-PDF with server-side rendering |

## Integration with Existing Architecture

### Current System Enhancement Points

**Existing Foundation:**
- Next.js 15 with App Router ✓
- PostgreSQL + Prisma 7 ✓
- Role-based authentication (USER/ADVISOR/ADMIN) ✓
- Assessment engine with scoring pipeline ✓
- PDF generation + server actions ✓

**New Dashboard Components:**

```typescript
// Extend existing Prisma models
model DashboardWidget {
  id         String   @id @default(cuid())
  advisorId  String
  type       WidgetType
  config     Json
  position   Json
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  advisor    AdvisorProfile @relation(fields: [advisorId], references: [id])
}

model AssessmentMetrics {
  id           String   @id @default(cuid())
  assessmentId String   @unique
  completedAt  DateTime
  totalScore   Float
  riskTrend    Float?   // Month-over-month change
  advisorNotes String?

  assessment   Assessment @relation(fields: [assessmentId], references: [id])
}
```

### Modified vs New Components

| Component Type | Status | Rationale |
|---------------|--------|-----------|
| **Advisor Layout** | MODIFY | Add dashboard nav, extend existing `/advisor` layout |
| **Client Cards** | EXTEND | Add metrics overlay to existing ClientCard component |
| **Assessment API** | EXTEND | Add aggregation endpoints to existing `/api/assessment` |
| **Dashboard Views** | NEW | Create `/advisor/dashboard` with analytics widgets |
| **Metrics Engine** | NEW | Background calculation service for trends |
| **Data Aggregation** | NEW | Prisma aggregation queries + caching layer |

## Recommended Project Structure

```
src/
├── app/(protected)/advisor/
│   ├── dashboard/              # NEW: Multi-client analytics dashboard
│   │   ├── page.tsx           # Dashboard overview with widgets
│   │   ├── analytics/         # Detailed analytics views
│   │   └── clients/[id]/      # Per-client drill-down views
│   ├── layout.tsx             # MODIFY: Add dashboard navigation
│   └── page.tsx               # EXTEND: Add dashboard preview cards
├── components/dashboard/       # NEW: Dashboard-specific components
│   ├── widgets/               # Chart components, KPI cards
│   ├── analytics/             # Trend analysis, comparisons
│   └── client-insights/       # Client-specific visualizations
├── lib/dashboard/             # NEW: Dashboard business logic
│   ├── aggregation.ts         # Data aggregation functions
│   ├── metrics.ts             # Metric calculation engines
│   └── caching.ts             # Dashboard data caching
├── lib/actions/
│   └── dashboard-actions.ts   # NEW: Server actions for dashboard
└── app/api/dashboard/         # NEW: Real-time data endpoints
    ├── metrics/route.ts       # Aggregate metrics API
    └── widgets/[id]/route.ts  # Widget-specific data
```

### Structure Rationale

- **dashboard/:** Dedicated folder for new functionality avoids disrupting existing assessment flows
- **components/dashboard/:** Reusable widgets prevent code duplication across advisor views
- **lib/dashboard/:** Business logic separation allows for easy testing and caching strategies

## Architectural Patterns

### Pattern 1: Multi-Tenant Row-Level Security

**What:** Use Prisma middleware to automatically filter queries by advisor-client relationships
**When to use:** All dashboard data access to ensure tenant isolation
**Trade-offs:** Performance overhead vs data security guarantee

**Example:**
```typescript
// lib/db.ts - Extend existing Prisma client
prisma.$use(async (params, next) => {
  if (params.model && ['Assessment', 'PillarScore'].includes(params.model)) {
    const session = await getServerSession();
    if (session?.user?.role === 'ADVISOR') {
      // Auto-inject advisor filter
      params.args.where = {
        ...params.args.where,
        user: {
          clientAssignments: {
            some: {
              advisorId: session.user.advisorProfile?.id
            }
          }
        }
      };
    }
  }
  return next(params);
});
```

### Pattern 2: Cached Aggregation Pipeline

**What:** Pre-calculate dashboard metrics using background jobs + Redis caching
**When to use:** Complex multi-client analytics that don't need real-time updates
**Trade-offs:** Stale data (5-15min delay) vs sub-second dashboard load times

**Example:**
```typescript
// lib/dashboard/aggregation.ts
export async function calculateAdvisorMetrics(advisorId: string) {
  const cacheKey = `advisor:${advisorId}:metrics`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const metrics = await prisma.assessment.aggregate({
    _avg: { scores: { score: true } },
    _count: { status: { completed: true } },
    where: {
      user: {
        clientAssignments: {
          some: { advisorId }
        }
      }
    }
  });

  await redis.setex(cacheKey, 900, JSON.stringify(metrics)); // 15min cache
  return metrics;
}
```

### Pattern 3: Streaming Dashboard Updates

**What:** Use Server-Sent Events for real-time dashboard updates without WebSocket overhead
**When to use:** Live assessment progress tracking for advisor monitoring
**Trade-offs:** Simpler than WebSockets but less flexible for bidirectional communication

## Data Flow

### Dashboard Request Flow

```
[Advisor Dashboard Load]
    ↓
[Server Component] → [Dashboard Actions] → [Cached Aggregations] → [PostgreSQL]
    ↓                      ↓                       ↓                    ↓
[Rendered HTML] ← [Metric Calculations] ← [Prisma Queries] ← [Row-Level Security]
    ↓
[Client Hydration] → [Real-time Updates] → [SSE Endpoint]
```

### Assessment Integration Flow

```
[Assessment Completion]
    ↓
[Scoring Pipeline] → [Dashboard Metrics Update] → [Cache Invalidation]
    ↓                        ↓                         ↓
[Advisor Notification] ← [Background Job] ← [Redis Cache Clear]
```

### Key Data Flows

1. **Multi-Client Overview:** Aggregates scores across all assigned clients with trend calculations
2. **Real-time Progress:** Streams live assessment progress to advisor dashboard via SSE
3. **Historical Analysis:** Combines assessment data with time-series analysis for trend insights

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-50 advisors | Current PostgreSQL + Redis cache handles load easily |
| 50-500 advisors | Add read replicas, optimize Prisma queries, implement query batching |
| 500+ advisors | Consider database sharding by advisor region, microservice separation |

### Scaling Priorities

1. **First bottleneck:** Dashboard aggregation queries - solve with materialized views and smart caching
2. **Second bottleneck:** Real-time updates - implement rate limiting and selective updates

## Anti-Patterns

### Anti-Pattern 1: Real-time Everything

**What people do:** Make every dashboard widget update in real-time via WebSocket/polling
**Why it's wrong:** Overwhelms database with unnecessary queries, degrades UX with constant reloading
**Do this instead:** Use cached aggregations (15min updates) for trends, real-time only for active assessments

### Anti-Pattern 2: Client-Side Aggregation

**What people do:** Fetch raw assessment data to browser and calculate metrics client-side
**Why it's wrong:** Security risk (exposes other clients' data), poor performance, breaks on large datasets
**Do this instead:** Server-side aggregation with Prisma, return only processed metrics to client

### Anti-Pattern 3: Single Mega-Dashboard

**What people do:** Cram all possible metrics into one overwhelming dashboard page
**Why it's wrong:** Slow loading, cognitive overload for advisors, difficult maintenance
**Do this instead:** Modular widget system with drill-down capability and customizable layouts

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Existing Assessment Engine | Direct Prisma queries | Leverage existing scoring pipeline |
| PDF Report System | Extend existing routes | Add dashboard snapshot generation |
| Email Notifications | Extend existing system | Add assessment completion alerts |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Dashboard ↔ Assessment | Shared Prisma models | Use existing Assessment/PillarScore schema |
| Advisor ↔ Client data | Row-level security | Enforced via Prisma middleware |
| Real-time updates ↔ Cache | Event-driven invalidation | Redis pub/sub for cache coordination |

## Build Order Recommendation

### Phase 1: Foundation (Week 1-2)
1. Extend Prisma schema with dashboard models
2. Create basic `/advisor/dashboard` layout
3. Implement row-level security middleware
4. Add Redis caching infrastructure

### Phase 2: Core Widgets (Week 3-4)
1. Client overview cards with basic metrics
2. Assessment completion tracking
3. Simple trend calculations (month-over-month)
4. Export existing PDF functionality to dashboard

### Phase 3: Advanced Analytics (Week 5-6)
1. Historical trend analysis
2. Comparative client performance
3. Risk level distribution charts
4. Real-time progress streaming

### Phase 4: Polish & Performance (Week 7-8)
1. Customizable dashboard layouts
2. Advanced caching optimization
3. Background job implementation
4. Performance monitoring and alerting

## Sources

- [Next.js SaaS Dashboard Development: Scalability & Best Practices](https://www.ksolves.com/blog/next-js/best-practices-for-saas-dashboards)
- [How to Build an Admin Dashboard with shadcn/ui and Next.js (2026 Guide)](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/)
- [Next.js App Router: The Patterns That Actually Matter in 2026](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146)
- [Next.js 16 Real-Time Analytics Dashboard: A Production Guide](https://www.shsxnk.com/blog/realtime-analytics-dashboard)
- [How to use Prisma ORM and Prisma Postgres with Next.js and Vercel](https://www.prisma.io/docs/guides/nextjs)
- [What is multi-tenant architecture? A complete guide for 2026](https://www.future-processing.com/blog/multi-tenant-architecture/)
- [Multi-Tenant Deployment: 2026 Complete Guide & Examples](https://qrvey.com/blog/multi-tenant-deployment/)
- [The 2026 Multi-Tenant Data Integration Playbook for Scalable SaaS](https://cdatasoftware.medium.com/the-2026-multi-tenant-data-integration-playbook-for-scalable-saas-1371986d2c2c)

---
*Architecture research for: Governance intelligence dashboards for Next.js assessment platform*
*Researched: 2026-03-14*