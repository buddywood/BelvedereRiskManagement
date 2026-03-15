---
phase: 11-dashboard-foundation
plan: 01
subsystem: dashboard
tags: [data-layer, types, queries, advisor-scoped, tanstack]
dependency_graph:
  requires: [prisma-schema, advisor-auth]
  provides: [dashboard-types, dashboard-queries]
  affects: [advisor-dashboard-ui]
tech_stack:
  added: ["@tanstack/react-table"]
  patterns: [advisor-scoped-queries, server-only-guard, row-level-security]
key_files:
  created:
    - "src/lib/dashboard/types.ts"
    - "src/lib/dashboard/queries.ts"
  modified:
    - "package.json"
    - "package-lock.json"
decisions:
  - "Used ClientAdvisorAssignment filtering for advisor-scoped data access"
  - "Computed governance scores from latest PillarScore records per client"
  - "Separated query functions from aggregation functions for pure function design"
metrics:
  duration_seconds: 180
  tasks_completed: 2
  files_created: 2
  files_modified: 2
  commits: 2
  completed_date: "2026-03-14"
---

# Phase 11 Plan 01: Dashboard Data Layer Summary

JWT auth with refresh rotation using jose library

## What Was Built

Created the foundational data layer for the advisor governance dashboard, including TypeScript types for dashboard entities and Prisma query functions that enforce advisor-scoped access through ClientAdvisorAssignment relationships.

## Tasks Completed

### Task 1: Install TanStack React Table and create dashboard types
- **Status**: ✅ Complete
- **Commit**: 7cfc13f
- **Changes**:
  - Installed `@tanstack/react-table` for data table functionality
  - Created `src/lib/dashboard/types.ts` with complete TypeScript type definitions
  - Defined `GovernanceScoreSummary`, `DashboardClient`, `DashboardMetrics`, `RiskDistribution`
  - Imported `RiskLevel` enum from `@prisma/client` for type safety

### Task 2: Create advisor-scoped dashboard query functions
- **Status**: ✅ Complete
- **Commit**: 35284cf
- **Changes**:
  - Created `src/lib/dashboard/queries.ts` with `"server-only"` guard
  - Implemented `getAdvisorDashboardClients()` with advisor-scoped filtering via `ClientAdvisorAssignment`
  - Added `getDashboardMetrics()` pure function for summary card data
  - Added `getRiskDistribution()` pure function for risk band analysis
  - Enforced row-level security through `advisorId` filtering and `ACTIVE` status requirements

## Technical Implementation

### Security Architecture
- **Row-Level Isolation**: All client data access filtered through `ClientAdvisorAssignment` table
- **Advisor Scoping**: `advisorProfileId` parameter enforces advisor-specific data boundaries
- **Server-Only Enforcement**: Queries guarded with `"server-only"` directive
- **No Direct Access**: Zero direct `prisma.user` or `prisma.assessment` queries

### Data Patterns
- **Latest Score Computation**: Governance scores extracted from most recent PillarScore records
- **Assessment Tracking**: Count and date tracking for completed assessments only
- **Pure Function Design**: Metrics and distribution functions are stateless and testable
- **Type Safety**: Full TypeScript coverage with Prisma client integration

### Performance Considerations
- **Optimized Includes**: Nested includes with ordering and limiting to prevent N+1 queries
- **Single Query Pattern**: Client data fetched in one query with proper includes
- **Computed Metrics**: Dashboard metrics calculated in-memory from client array

## Deviations from Plan

None - plan executed exactly as written.

## Files Created

1. **`src/lib/dashboard/types.ts`** - Complete TypeScript type definitions for dashboard data structures
2. **`src/lib/dashboard/queries.ts`** - Advisor-scoped Prisma query functions with security enforcement

## Files Modified

1. **`package.json`** - Added @tanstack/react-table dependency
2. **`package-lock.json`** - Dependency lock file update

## Quality Verification

### Type Safety
- ✅ All types compile without TypeScript errors
- ✅ Prisma client integration with proper enum imports
- ✅ Next.js build successful

### Security Verification
- ✅ `"server-only"` guard present in queries
- ✅ All data access filtered through `ClientAdvisorAssignment.advisorId`
- ✅ `ACTIVE` status filtering enforced
- ✅ No direct user or assessment queries without advisor relationship

### Functional Verification
- ✅ `@tanstack/react-table` package installed and importable
- ✅ Dashboard types exported and available for import
- ✅ Query functions exported with proper return types
- ✅ Governance score computation from PillarScore records

## Next Steps

This data layer provides the foundation for Phase 11 Plan 02 (Dashboard UI Components). The UI plan can now focus purely on rendering with confidence that:

1. **Data Security**: All client data is advisor-scoped by design
2. **Type Safety**: Complete TypeScript coverage for all dashboard entities
3. **Performance**: Optimized query patterns ready for dashboard implementation
4. **Extensibility**: Clean separation between queries and aggregations for future enhancement

## Self-Check: PASSED

**Created files verified:**
- ✅ FOUND: src/lib/dashboard/types.ts
- ✅ FOUND: src/lib/dashboard/queries.ts

**Commits verified:**
- ✅ FOUND: 7cfc13f
- ✅ FOUND: 35284cf