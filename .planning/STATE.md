# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Prevent family wealth from becoming family conflict through systematic risk assessment and actionable governance recommendations
**Current focus:** Phase 2 - Assessment Engine & Core Scoring

## Current Position

Phase: 2 of 4 (Assessment Engine & Core Scoring)
Plan: 4 of 6 completed
Status: In progress
Last activity: 2026-02-20 — Completed 02-02: Question bank and scoring engine

Progress: [████░░░░░░] 42% (5 of 12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 4.6 minutes
- Total execution time: 0.4 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 10.3 min | 5.2 min |
| 02 | 3 | 13.2 min | 4.4 min |

**Recent Trend:**
- Last 5 plans: 01-02 (3.4 min), 02-01 (3.0 min), 02-03 (4.2 min), 02-02 (6.0 min)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- 0-10 scoring scale where 10 = best governance (02-02): More intuitive than 'risk score' where high = bad. Aligns with maturity model mental framework.
- Simple 1-level branching (02-02): Skip trust/business/succession sections if not applicable. Deeper nesting deferred based on research recommendation to monitor completion rates.
- 68 questions across 8 sub-categories (02-02): Balances comprehensive coverage with 15-minute completion target. Distributed based on risk impact.
- localStorage as optimistic cache, server API as source of truth (02-03): Zustand persist provides fast local state, but loadFromServer() rehydrates from API on mount. Ensures save/resume works after browser restart or localStorage clear.
- pillar-based progress tracking (02-03): Show pillar completion progress, not question counts (e.g., "X of Y questions" per pillar, not "Question 3 of 80"). Research shows total counts are demoralizing.
- Hierarchical weighted scoring model (02-01): Question -> Sub-Category -> Pillar structure enables granular risk analysis. Bottom-up score aggregation supports flexible weighting algorithms.
- JSON fields for assessment flexibility (02-01): answer, breakdown, missingControls use Json type for schema evolution. Type safety enforced in TypeScript layer, not DB constraints.
- shadcn/ui component library (02-01): Radix UI primitives with zinc color scheme. Owned components avoid library lock-in, provide accessibility out of the box.
- In-memory rate limiting for MVP (01-02): In-memory Map storage sufficient for single-instance MVP with 60s cleanup. Production needs Redis/Upstash for multi-instance.
- SHA-256 token hashing (01-02): Reset tokens hashed with SHA-256 before database storage. Prevents token theft if database compromised. 15-minute expiry, single-use.
- Generic success messages for forgot-password (01-02): Always return 'If an account exists...' message to prevent email enumeration attacks.
- JWT session strategy over database sessions (01-01): Auth.js v5 with credentials provider doesn't auto-create database sessions. JWT with server-side lookup avoids manual session creation complexity.
- Prisma 7 with pg adapter (01-01): Prisma 7 requires explicit connection adapters. pg adapter with connection pooling provides production-ready PostgreSQL connectivity.
- Argon2id for password hashing (01-01): Most secure password hashing algorithm with OWASP-recommended parameters (65536 KiB memory, 3 iterations).
- [Phase 02-02]: 68 questions across 8 sub-categories: Balances comprehensive coverage with 15-minute completion target. Distributed based on risk impact.
- [Phase 02-02]: Simple 1-level branching: Skip trust/business/succession sections if not applicable. Deeper nesting deferred based on research recommendation to monitor completion rates.
- [Phase 02-02]: 0-10 scoring scale where 10 = best governance: More intuitive than 'risk score' where high = bad. Aligns with maturity model mental framework.

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 3 (Branching Logic):** Research flagged as HIGH RISK due to state management complexity. Conditional validation patterns and comprehensive path testing will require careful implementation. Consider `/gsd:research-phase` during Phase 3 planning.

**Scoring methodology:** Specific weights and categories for family governance require domain expertise. Consult family office governance expert during Phase 2 to calibrate weights.

**User validation gap:** Differentiator features (branching logic, policy templates) need validation with actual family office users. Conduct 5-10 user interviews before finalizing Phase 3-4 scope.

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 02-02-PLAN.md - Question bank and scoring engine
Resume file: .planning/phases/02-assessment-engine-core-scoring/02-02-SUMMARY.md

**Completed plans (out of order):** 02-01, 02-03, 02-02
**Next plan:** 02-04 (Question flow UI)
