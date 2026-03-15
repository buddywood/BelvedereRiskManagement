---
phase: 13-intelligence-features
plan: 01
subsystem: intelligence
tags: [risk-identification, advisor-scoping, portfolio-intelligence]
requires: [analytics-engine, advisor-dashboard-foundation]
provides: [risk-identification-types, portfolio-risk-queries, intelligence-server-actions]
affects: [advisor-actions, analytics-queries]
tech-stack:
  added: []
  patterns: [server-only-guards, advisor-scoping, prisma-aggregations]
key-files:
  created:
    - src/lib/intelligence/types.ts
    - src/lib/intelligence/queries.ts
  modified:
    - src/lib/analytics/queries.ts
    - src/lib/actions/advisor-actions.ts
decisions:
  - Export PILLAR_WEIGHTS from analytics/queries.ts for intelligence reuse
  - Use null safety with non-null assertion for assessment.completedAt (verified by prior checks)
  - Sort risks by score ascending to identify lowest-scoring pillars as top risks
metrics:
  duration: "3min"
  completed: "2026-03-15T04:07:45Z"
---

# Phase 13 Plan 01: Risk Identification Data Layer Summary

**One-liner:** Risk identification algorithms that automatically identify top 3 governance pillars per family and aggregate portfolio-wide risk intelligence with severity classification.

## Objectives Achieved

Built the algorithmic foundation for governance intelligence by creating risk identification queries that:

- Identify top 3 lowest-scoring governance pillars per family (INTEL-01)
- Aggregate portfolio-wide risk data across all advisor's families (INTEL-02)
- Classify risks by severity: critical (≤3.0), moderate (≤5.0), low (>5.0)
- Enforce advisor-scoped access via clientAdvisorAssignment verification

## Tasks Completed

### Task 1: Create intelligence types and risk identification queries
**Files:** `src/lib/intelligence/types.ts`, `src/lib/intelligence/queries.ts`
**Commit:** f373af4

Created TypeScript types for risk intelligence:
- `RiskIndicator`: Individual pillar risk with severity classification
- `FamilyRiskSummary`: Top 3 risks per family with overall score
- `PortfolioIntelligence`: Aggregated portfolio risk data

Implemented core risk identification algorithms:
- `getTopRisksForFamily()`: Identifies top 3 risks by sorting pillar scores ascending
- `getPortfolioIntelligence()`: Aggregates risks across advisor's entire portfolio
- `getSeverity()`: Classifies risk severity based on governance score thresholds

### Task 2: Add intelligence server actions to advisor-actions
**Files:** `src/lib/actions/advisor-actions.ts`
**Commit:** 34f5a4c

Added two new server actions following existing patterns:
- `getPortfolioIntelligenceData()`: Portfolio-wide risk aggregation
- `getFamilyRiskData()`: Per-family risk identification

Both enforce advisor authentication and scoping via `requireAdvisorRole()`.

## Technical Implementation

**Risk Algorithm:** Sort all pillar scores ascending (lowest first = highest risk) and select top 3 as primary governance concerns.

**Severity Classification:**
- Critical: Score ≤ 3.0
- Moderate: Score ≤ 5.0
- Low: Score > 5.0

**Advisor Scoping:** All queries verify active `clientAdvisorAssignment` relationships before returning data.

**Performance:** Uses existing Prisma patterns for optimal query performance with advisor-scoped access.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Export PILLAR_WEIGHTS from analytics queries**
- **Found during:** Task 1 implementation
- **Issue:** PILLAR_WEIGHTS was const-only in analytics/queries.ts, needed for intelligence calculations
- **Fix:** Exported PILLAR_WEIGHTS to enable reuse across intelligence module
- **Files modified:** src/lib/analytics/queries.ts
- **Commit:** f373af4

**2. [Rule 1 - Bug] Fixed TypeScript null safety for assessment.completedAt**
- **Found during:** TypeScript compilation
- **Issue:** assessment.completedAt possibly null errors in risk indicator creation
- **Fix:** Added non-null assertions after prior null checks verify completedAt exists
- **Files modified:** src/lib/intelligence/queries.ts
- **Commit:** f373af4

## Verification Results

✅ TypeScript compilation passes with zero errors
✅ Intelligence types export all declared interfaces and types
✅ Intelligence queries have "server-only" guard as first import
✅ Advisor actions export both new server action functions
✅ Risk severity thresholds correctly implemented (critical ≤ 3.0, moderate ≤ 5.0, low > 5.0)
✅ Top 3 risks correctly selected by sorting pillar scores ascending and taking first 3
✅ Algorithm produces correct results: lowest-scoring pillars identified as highest risk

## Self-Check: PASSED

**Created files verified:**
- FOUND: src/lib/intelligence/types.ts
- FOUND: src/lib/intelligence/queries.ts

**Modified files verified:**
- FOUND: src/lib/analytics/queries.ts
- FOUND: src/lib/actions/advisor-actions.ts

**Commits verified:**
- FOUND: f373af4
- FOUND: 34f5a4c

## Next Steps

Phase 13-02 should implement the intelligence dashboard UI components that consume these risk identification APIs to display portfolio risks, family risk summaries, and governance gap insights to advisors.