---
phase: 12-analytics-engine
plan: 01
subsystem: analytics
tags: [data-layer, recharts, advisor-scoping, weighted-scoring]
dependency_graph:
  requires: [prisma-schema, dashboard-foundation]
  provides: [analytics-types, chart-ready-data, advisor-scoped-queries]
  affects: [dashboard-queries, chart-components]
tech_stack:
  added: [recharts@3.8.0]
  patterns: [server-only-queries, advisor-scoped-access, weighted-aggregation]
key_files:
  created: [src/lib/analytics/types.ts, src/lib/analytics/formatters.ts, src/lib/analytics/queries.ts, src/components/analytics/ChartContainer.tsx]
  modified: [package.json, package-lock.json]
decisions:
  - Use Recharts for React-first charting with TypeScript support
  - Enforce advisor-scoped access via clientAdvisorAssignment verification
  - Implement weighted scoring with pillar-specific weights from assessment definition
  - Simplify client name to email for now (profile integration deferred)
metrics:
  duration_seconds: 180
  completed_date: 2026-03-15T02:39:29Z
  tasks_completed: 2
  files_created: 4
---

# Phase 12 Plan 01: Analytics Data Layer Summary

**One-liner:** Analytics foundation with Recharts integration, advisor-scoped queries, and weighted governance scoring from historical assessments.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install Recharts and create analytics types and formatting utilities | eea44d4 | package.json, package-lock.json, src/lib/analytics/types.ts, src/lib/analytics/formatters.ts |
| 2 | Create advisor-scoped analytics queries and chart container component | a2db4ce | src/lib/analytics/queries.ts, src/components/analytics/ChartContainer.tsx |

## What Was Built

**Analytics Type System:**
- `GovernanceTrendPoint` - Time-series data points for governance score trends
- `CategoryBreakdownPoint` - Individual category scores with weights
- `AssessmentComparison` - Full assessment snapshots with trend direction
- `FamilyAnalyticsData` - Complete analytics payload for advisor dashboard

**Data Aggregation Layer:**
- `getFamilyGovernanceTrends()` - Historical trend analysis with advisor access verification
- `getAssessmentComparison()` - Single assessment breakdown with security enforcement
- Weighted scoring algorithm using correct pillar weights (20,15,15,10,15,10,10,5)
- Trend direction calculation with 0.3-point threshold for improving/declining

**Chart Infrastructure:**
- Recharts library integration for React-native charting
- `ChartContainer` component with responsive layout and Card wrapper
- Date and score formatting utilities for chart axes
- Category labels mapping for all 8 governance subcategories
- Distinct color palette for chart series and primary trend line

## Key Technical Decisions

**Security:** All queries enforce advisor-client relationship verification via `clientAdvisorAssignment` before data access

**Weighted Scoring:** Implemented correct pillar weights matching assessment definition - decision-making (20%), access-controls (15%), trust-estate (15%), succession (15%), marriage-risk (10%), behavior-standards (10%), business (10%), documentation (5%)

**Trend Analysis:** 0.3-point threshold for trend direction changes to avoid noise from minor score fluctuations

**Client Names:** Simplified to use email addresses for now, deferring profile integration to avoid complexity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Prisma query syntax conflicts**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** Cannot use both `include` and `select` in same Prisma query
- **Fix:** Removed conflicting `select` clauses, used `include` only
- **Files modified:** src/lib/analytics/queries.ts
- **Commit:** a2db4ce

**2. [Rule 2 - Missing functionality] Removed profile field access**
- **Found during:** Task 2 Prisma query design
- **Issue:** User.profile relation not available in schema, would cause runtime errors
- **Fix:** Use email field directly for client names instead of profile fields
- **Files modified:** src/lib/analytics/queries.ts
- **Commit:** a2db4ce

## Verification Results

✓ Recharts ^3.8.0 installed and importable
✓ `"server-only"` guard present in queries.ts
✓ `clientAdvisorAssignment` filtering implemented
✓ All 8 governance categories in CATEGORY_LABELS
✓ Weighted scoring uses correct weights (20,15,15,10,15,10,10,5)
✓ ChartContainer wraps ResponsiveContainer properly

## Ready For

Plan 02 can now implement governance trend charts and category breakdown visualizations using the chart-ready data structures and responsive chart container.

## Self-Check: PASSED

✓ Created files exist: src/lib/analytics/types.ts, src/lib/analytics/formatters.ts, src/lib/analytics/queries.ts, src/components/analytics/ChartContainer.tsx
✓ Commits exist: eea44d4, a2db4ce
✓ Recharts dependency added to package.json
✓ Analytics types properly exported
✓ Server-only queries enforce advisor access patterns