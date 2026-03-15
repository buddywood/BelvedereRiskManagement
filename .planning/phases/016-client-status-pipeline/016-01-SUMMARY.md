---
phase: 016-client-status-pipeline
plan: 01
subsystem: Data Pipeline Foundation
tags: [data-modeling, pipeline, status-tracking, schema]
completed: 2026-03-15T23:58:37Z
duration: 1520
task_count: 2

dependency_graph:
  requires: ["015-01 (invitation system)", "existing assessment & intake models"]
  provides: ["ClientWorkflowStage enum", "DocumentRequirement model", "pipeline query functions"]
  affects: ["016-02 (pipeline dashboard)", "016-03 (status dashboard)"]

tech_stack:
  added: ["DocumentRequirement Prisma model", "ClientWorkflowStage enum", "pipeline query layer"]
  patterns: ["multi-tenant data isolation", "computed workflow stages", "unified status computation"]

key_files:
  created:
    - "src/lib/pipeline/types.ts"
    - "src/lib/pipeline/status.ts"
    - "src/lib/pipeline/queries.ts"
  modified:
    - "prisma/schema.prisma"
    - "src/lib/actions/invitations.ts"

decisions:
  - "Stage computed from data rather than stored to avoid sync issues"
  - "DocumentRequirement model supports future Phase 17 document collection"
  - "Pipeline types include all workflow states from invitation to completion"
  - "Multi-tenant isolation maintained through advisor-scoped queries"
---

# Phase 16 Plan 01: Data Pipeline Foundation Summary

**One-liner:** Complete client status pipeline data foundation with schema extensions, unified stage computation, and multi-tenant query infrastructure

## Objective Completed

Created the comprehensive data foundation for the client status pipeline that unifies invitation status, intake progress, assessment completion, and document collection into a single pipeline view. This provides the essential data layer that all downstream UI plans will consume.

## Tasks Completed

### Task 1: Extend Prisma schema with DocumentRequirement model and workflow support
- **Commit:** [53db29f] feat(016-01): extend Prisma schema with DocumentRequirement and ClientWorkflowStage
- **Key Changes:**
  - Added `ClientWorkflowStage` enum with 8 workflow states (INVITED → COMPLETE)
  - Implemented `DocumentRequirement` model with advisor/client relations and multi-tenant indexes
  - Extended User and AdvisorProfile models with document requirement relations
  - Fixed TypeScript compilation errors in invitation actions
- **Files:** `prisma/schema.prisma`, `src/lib/actions/invitations.ts`

### Task 2: Create pipeline types, status computation, and query layer
- **Commit:** [4cfa6b8] feat(016-01): implement pipeline types, status computation, and query layer
- **Key Changes:**
  - Built comprehensive `PipelineClient` type with stage, progress, and document tracking
  - Implemented intelligent stage computation from invitation/intake/assessment/document data
  - Created multi-tenant pipeline queries with advisor isolation
  - Added utility functions for stage labels, ordering, and stall detection
- **Files:** `src/lib/pipeline/types.ts`, `src/lib/pipeline/status.ts`, `src/lib/pipeline/queries.ts`

## Technical Implementation

### Schema Design
- **ClientWorkflowStage enum** provides complete workflow tracking from invitation through completion
- **DocumentRequirement model** supports Phase 17 document collection with advisor/client multi-tenancy
- **Computed stages** avoid data sync issues by deriving state from existing data sources

### Status Computation Logic
- Stage priority: Assessment > Intake > Invitation (later stages override earlier ones)
- Progress percentages: INVITED(10%) → COMPLETE(100%)
- Stall detection: 7+ days without activity (excluding COMPLETE stage)

### Query Architecture
- **Multi-tenant isolation** through advisor-scoped queries following existing patterns
- **Unified data fetching** combines invitation, intake, assessment, and document data
- **Performance optimization** with proper indexing and selective includes

## Verification Results

✅ **Prisma validation:** Schema validates successfully
✅ **TypeScript compilation:** Zero errors across all new modules
✅ **Generated client:** ClientWorkflowStage enum and DocumentRequirement model available
✅ **Export verification:** All pipeline types and functions export correctly
✅ **Database sync:** Schema changes applied successfully

## Dependencies Satisfied

**From Plan 015-01:** Leverages existing invitation system and InvitationStatus enum
**From Existing Models:** Integrates with User, Assessment, IntakeInterview, and AdvisorProfile models
**Multi-tenant Patterns:** Follows established advisor isolation patterns from dashboard queries

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

✅ **Created files exist:**
- FOUND: src/lib/pipeline/types.ts
- FOUND: src/lib/pipeline/status.ts
- FOUND: src/lib/pipeline/queries.ts

✅ **Commits exist:**
- FOUND: 53db29f (schema extensions)
- FOUND: 4cfa6b8 (pipeline implementation)

✅ **Schema validation:** Prisma schema validates successfully
✅ **Generated types:** ClientWorkflowStage and DocumentRequirement available in Prisma client