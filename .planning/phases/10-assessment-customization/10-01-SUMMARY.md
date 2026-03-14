---
phase: 10-assessment-customization
plan: 01
subsystem: assessment-customization
tags: [data-layer, pure-functions, database-queries, approval-linking]
dependency_graph:
  requires:
    - phase_09_advisor_portal
    - RISK_AREAS_constants
    - IntakeApproval_schema
  provides:
    - CustomizationConfig_interface
    - assessment_customization_functions
    - approval_based_assessment_linking
  affects:
    - assessment_creation_flow
    - question_filtering_system
    - scoring_multipliers
tech_stack:
  added:
    - assessment-customization_data_layer
    - pure_function_architecture
  patterns:
    - server-only_data_access
    - focus_area_validation
    - approval_to_config_mapping
key_files:
  created:
    - src/lib/assessment/customization.ts
    - src/lib/assessment/customization.test.ts
    - src/lib/data/assessment-customization.ts
  modified:
    - prisma/schema.prisma
    - src/app/api/assessment/route.ts
decisions:
  - name: "Pure function architecture for customization logic"
    context: "Separate data access from business logic for testability"
    options: ["monolithic service", "pure functions + data layer", "mixed approach"]
    choice: "pure functions + data layer"
    rationale: "Enables comprehensive unit testing and clean separation of concerns"
  - name: "Emphasis multiplier constant at 1.5x"
    context: "Need scoring weight for advisor-specified focus areas"
    options: ["1.2x", "1.5x", "2.0x", "configurable"]
    choice: "1.5x constant"
    rationale: "Aligns with research recommendations for noticeable but not overwhelming emphasis"
  - name: "All visible areas get emphasis for now"
    context: "Initial implementation approach for emphasis vs visible distinction"
    options: ["separate emphasis selection", "all visible emphasized", "no emphasis"]
    choice: "all visible emphasized"
    rationale: "Simplifies initial implementation while preserving interface for future expansion"
metrics:
  duration_minutes: 23
  tasks_completed: 2
  files_created: 3
  files_modified: 2
  tests_added: 14
  completed_date: "2026-03-14"
---

# Phase 10 Plan 01: Assessment Customization Data Layer

**One-liner:** Pure functions and database queries to derive visible questions and emphasis weights from advisor-approved focus areas.

## What Was Built

Created the foundational data layer for assessment customization based on advisor-approved IntakeApproval records. This enables future UI and scoring changes to read which categories should be visible and emphasized.

### Core Architecture

**Pure Functions Layer** (`src/lib/assessment/customization.ts`):
- `getCustomizationConfig()` - Main entry point deriving full config from focus areas
- `getVisibleSubCategories()` - Validates focus areas against RISK_AREAS with fallback to all 8 categories
- `getEmphasisMultipliers()` - Returns 1.5x for emphasis areas, 1.0x for others
- `getVisibleQuestionIds()` - Key filter controlling which questions appear
- `estimateCompletionMinutes()` - Time estimation (~20s per question, capped at 15min)

**Database Layer** (`src/lib/data/assessment-customization.ts`):
- `getActiveApprovalForUser()` - Queries most recent approved intake with advisor details
- `getCustomizationForUser()` - Combines approval data with pure function logic

**Assessment Integration** (modified `src/app/api/assessment/route.ts`):
- Assessment creation automatically links to active approval via new `approvalId` field
- Backward compatible - assessments without approval work normally

### Key Design Patterns

1. **Server-Only Data Access**: Database functions use `'server-only'` guard for security
2. **Validation with Fallback**: Invalid focus area IDs filtered out, empty arrays default to standard assessment
3. **Pure Function Architecture**: Business logic separated from data access for comprehensive testing
4. **Optional Approval Linking**: Assessments work with or without customization

## Tests & Verification

- **14 unit tests** covering all functions and edge cases:
  - Empty focus areas → standard assessment (all 8 categories)
  - Valid focus areas → customized assessment with those categories
  - Invalid IDs → filtered out automatically
  - Question filtering → returns only questions from visible subcategories
  - Emphasis multipliers → 1.5x for emphasis, 1.0x for others
  - Time estimation → reasonable estimates with 15-minute cap

- **Build verification**: TypeScript compilation and Next.js build both succeed
- **Backward compatibility**: Existing assessment functionality unchanged

## Deviations from Plan

None - plan executed exactly as written.

## Database Changes

Added `approvalId` field to Assessment model:
```prisma
model Assessment {
  // existing fields...
  approvalId String? // Links to IntakeApproval for customized assessments
}
```

Applied via `npx prisma db push` and regenerated client.

## Dependencies Ready

This plan provides the foundation for Plans 10-02 through 10-04:
- **ASSESS-01**: UI can use `getVisibleQuestionIds()` for question filtering
- **ASSESS-02**: Scoring can use `getEmphasisMultipliers()` for weight adjustments
- **ASSESS-03**: Progress tracking can use `estimateCompletionMinutes()`
- **ASSESS-04**: Reports can access `advisorName` and `approvalId` from config

The interface is extensible - future plans can expand `CustomizationConfig` without breaking existing functionality.

## Self-Check: PASSED

**Created files verified:**
- FOUND: /Users/bwoodtalton/Projects/BelvedereRiskManagement/src/lib/assessment/customization.ts
- FOUND: /Users/bwoodtalton/Projects/BelvedereRiskManagement/src/lib/assessment/customization.test.ts
- FOUND: /Users/bwoodtalton/Projects/BelvedereRiskManagement/src/lib/data/assessment-customization.ts

**Commits verified:**
- FOUND: 474b480 (Task 1 - pure functions and tests)
- FOUND: ab47bad (Task 2 - database layer and approval linking)

**Tests verified:**
- All 14 tests pass with Vitest
- Functions handle edge cases correctly
- Question filtering and emphasis logic working as designed

All deliverables present and functioning as specified.