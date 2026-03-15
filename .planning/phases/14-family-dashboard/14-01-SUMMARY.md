---
phase: 14-family-dashboard
plan: 01
subsystem: Family Dashboard Data Layer
tags: [types, queries, server-actions, authentication, user-scoped-access]
requires: [analytics-queries, auth-session, prisma-schema]
provides: [family-dashboard-types, family-dashboard-queries, family-dashboard-actions]
affects: [family-self-service-portal]
tech-stack:
  added: []
  patterns: [server-only-queries, authenticated-server-actions, weighted-scoring]
key-files:
  created:
    - src/lib/family/types.ts
    - src/lib/family/queries.ts
    - src/lib/actions/family-actions.ts
  modified: []
decisions:
  - User-scoped data access without advisor relationship requirement for family self-service
  - Reuse PILLAR_WEIGHTS and CATEGORY_LABELS from analytics module for consistency
  - Follow existing server action authentication pattern with null return for errors
metrics:
  duration: 129s
  tasks: 2
  files: 3
  commits: 2
completed: 2026-03-15T18:33:17Z
---

# Phase 14 Plan 01: Family Dashboard Data Layer Summary

Family dashboard types, user-scoped Prisma queries, and authenticated server actions for family self-service portal.

## Overview

Created the complete data layer foundation for the family self-service dashboard, providing type-safe access to household members, governance scores, historical assessments, and advisor emphasis areas. Unlike the advisor-scoped analytics queries, these queries allow family members to access their own data directly without requiring an advisor relationship.

## Tasks Completed

### Task 1: Create family dashboard types and data query
**Commit:** ae6d330
**Files:** src/lib/family/types.ts, src/lib/family/queries.ts

- Defined FamilyDashboardData interface with household members, current/historical scores, pillar breakdowns, and advisor emphasis
- Created user-scoped getFamilyDashboardData query using prisma.user.findUnique with includes for householdMembers, completed assessments, and intakeInterviews with approval relations
- Exported calculateWeightedScore and getTrendDirection pure functions following the exact patterns from analytics/queries.ts
- Mapped pillar scores with CATEGORY_LABELS for display names and PILLAR_WEIGHTS for weighted score calculations
- Added "server-only" guard to prevent client-side usage

### Task 2: Create family dashboard server action
**Commit:** 0416ceb
**Files:** src/lib/actions/family-actions.ts

- Created getFamilyDashboard server action with "use server" directive
- Authenticates user via auth() session and calls getFamilyDashboardData with session.user.id
- Follows existing advisor-actions.ts pattern but scoped to user's own data (no advisor relationship required)
- Returns null for unauthenticated requests or errors with error logging

## Technical Implementation

**Data Flow:**
- Server action authenticates user → Prisma query loads user with relations → Pure functions calculate scores → Typed interface returned

**Key Patterns:**
- User-scoped queries: `prisma.user.findUnique({ where: { id: userId }, include: { ... } })`
- Weighted scoring: Reused calculateWeightedScore logic with PILLAR_WEIGHTS constants
- Trend analysis: 0.3-point threshold for trend direction calculation
- Type safety: Full TypeScript interfaces for all dashboard data structures

**Security:**
- Server-only database queries with "server-only" guard
- Authentication enforced at server action boundary
- User can only access their own data (userId scoping)

## Verification Results

- ✅ `npx tsc --noEmit` passes with zero errors
- ✅ `src/lib/family/types.ts` exports FamilyDashboardData and all supporting interfaces
- ✅ `src/lib/family/queries.ts` has "server-only" guard and exports getFamilyDashboardData
- ✅ `src/lib/actions/family-actions.ts` has "use server" directive and exports getFamilyDashboard
- ✅ Queries use userId scoping for family self-service access (not advisor scoping)

## Success Criteria Met

- ✅ All three files compile without TypeScript errors
- ✅ Data layer provides household members, current/historical scores, pillar breakdowns, and advisor emphasis
- ✅ Authentication enforced through server action pattern

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

**Created files verified:**
- ✅ src/lib/family/types.ts exists
- ✅ src/lib/family/queries.ts exists
- ✅ src/lib/actions/family-actions.ts exists

**Commits verified:**
- ✅ ae6d330: feat(14-01): create family dashboard types and data query
- ✅ 0416ceb: feat(14-01): create family dashboard server action