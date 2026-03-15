# Stack Research

**Domain:** Governance intelligence dashboards
**Researched:** 2026-03-14
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | ^2.13.0 | Primary charting library | React-first library with SVG rendering, ideal for governance datasets (<10K points). Excellent TypeScript support and responsive design built-in |
| @tanstack/react-query | ^5.90.21 | Dashboard data management | Server state management standard in 2026. Handles multi-client data fetching, caching, and real-time updates for advisor workflows |
| zustand | ^5.0.11 | UI state management | Already in stack. Lightweight client state for dashboard filters, selections, and multi-client navigation |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-chartjs-2 | ^5.3.0 | High-performance charts | When governance data exceeds 10K points or requires Canvas rendering for smooth interactions |
| date-fns | ^4.1.0 | Time series calculations | Already in stack. Critical for historical governance tracking and period comparisons |
| @radix-ui/react-select | ^2.1.2 | Multi-client filtering | Dashboard client/family selection dropdowns with search and grouping |
| @radix-ui/react-tabs | ^1.1.1 | Dashboard navigation | Organizing governance intelligence views (overview, trends, comparisons) |
| @radix-ui/react-dialog | ^1.1.2 | Drill-down modals | Deep-dive analysis windows for specific governance metrics |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| recharts/types | Chart TypeScript definitions | Essential for type-safe governance metric interfaces |
| vitest coverage | Dashboard component testing | Test chart data transformations and multi-client state logic |

## Installation

```bash
# Core dashboard libraries
npm install recharts@^2.13.0 react-chartjs-2@^5.3.0 chart.js@^4.4.8

# Radix UI components for dashboard UX
npm install @radix-ui/react-select@^2.1.2 @radix-ui/react-tabs@^1.1.1 @radix-ui/react-dialog@^1.1.2

# Dev dependencies
npm install -D @types/recharts
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts | Visx | Custom governance visualizations requiring D3 primitives or sub-15KB bundle requirements |
| react-chartjs-2 | Plotly.js | Interactive 3D visualizations or scientific governance modeling |
| TanStack Query | SWR | Simpler projects without complex multi-client data orchestration |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Victory | Performance degrades with governance time-series data | Recharts for SVG or Chart.js for Canvas |
| Chart.js v3 | SSR compatibility issues with Next.js 15 | Chart.js v4.4.8+ with proper dynamic imports |
| D3 directly | Complex integration with React state management | Visx for D3 patterns or Recharts for standard charts |

## Stack Patterns by Variant

**If governance data is <10K points per chart:**
- Use Recharts as primary
- Leverage existing Zustand for dashboard state
- Because SVG rendering performs well and integrates seamlessly with TypeScript

**If governance data is >10K points or requires real-time updates:**
- Use Chart.js with Canvas rendering
- Add react-window for data virtualization
- Because Canvas handles large datasets without DOM performance issues

**If custom governance visualizations needed:**
- Add Visx for specialized components
- Keep Recharts for standard metrics
- Because Visx provides D3 primitives while maintaining React patterns

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Recharts@^2.13.0 | React@19.2.3 | Full compatibility with React 19 concurrent features |
| react-chartjs-2@^5.3.0 | Next.js@16.1.6 | Requires "use client" directive for Chart.js browser APIs |
| TanStack Query@^5.90.21 | Next.js App Router | Built-in SSR support with hydration patterns |

## Integration with Existing Stack

### Database Schema Extensions
```sql
-- Time series tables for governance tracking
CREATE TABLE governance_metrics_history (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id),
  metric_type VARCHAR NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMP NOT NULL
);

-- Multi-client dashboard state
CREATE TABLE advisor_dashboard_preferences (
  advisor_id UUID REFERENCES users(id),
  client_filters JSONB,
  view_preferences JSONB
);
```

### Authentication Integration
- Leverage existing Auth.js v5 for advisor role checks
- Use household-level permissions for multi-client data access
- Dashboard state persists per advisor session via Zustand

### API Pattern Extensions
```typescript
// Governance metrics endpoint
GET /api/governance/metrics?households=uuid1,uuid2&period=6m&metrics=communication,decision_making
```

## PostgreSQL Time Series Patterns

### Core Query Patterns
```sql
-- Fill gaps in governance tracking data
SELECT
  dates.d as period,
  COALESCE(AVG(gm.value), 0) as average_score
FROM generate_series('2025-01-01'::DATE, '2026-01-01'::DATE, '1 month') AS dates(d)
LEFT JOIN governance_metrics_history gm ON date_trunc('month', gm.recorded_at) = dates.d
WHERE gm.household_id = ANY($1)
GROUP BY dates.d
ORDER BY dates.d;
```

### Dashboard Aggregation Views
```sql
-- Pre-computed governance trends for advisor dashboards
CREATE MATERIALIZED VIEW governance_trends_monthly AS
SELECT
  household_id,
  date_trunc('month', recorded_at) as month,
  metric_type,
  AVG(value) as avg_value,
  COUNT(*) as measurement_count
FROM governance_metrics_history
GROUP BY household_id, month, metric_type;
```

## Sources

- [Chart.js in Next.js 15](https://dev.to/willochs316/mastering-chartjs-in-nextjs-15-create-dynamic-data-visualizations-564p) — Next.js 15 integration patterns
- [PostgreSQL Time Series](https://oneuptime.com/blog/post/2026-01-25-postgresql-generate-time-series/view) — Dashboard query optimization
- [React State Management 2026](https://www.pkgpulse.com/blog/state-of-react-state-management-2026) — TanStack Query + Zustand patterns
- [Best React Chart Libraries 2026](https://blog.logrocket.com/best-react-chart-libraries-2025/) — Performance comparison data
- [Multi-tenant Dashboard Architecture](https://geekyants.com/blog/react-query-as-a-state-manager-in-nextjs-do-you-still-need-redux-or-zustand) — MEDIUM confidence

---
*Stack research for: Governance intelligence dashboards*
*Researched: 2026-03-14*