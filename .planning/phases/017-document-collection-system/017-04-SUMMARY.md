---
phase: 017-document-collection-system
plan: 04
subsystem: test-data
tags: [seed-data, document-requirements, gap-closure]
dependency_graph:
  requires: [advisor-profiles, client-assignments]
  provides: [document-requirements]
  affects: [document-portal, UAT-testing]
tech_stack:
  added: []
  patterns: [prisma-upsert, deterministic-ids]
key_files:
  created: []
  modified: [scripts/seed-advisor-test-data.js]
decisions:
  - "Used deterministic ID pattern `doc-req-${clientId}-{number}` for idempotent seed operations"
  - "Created 4 requirements for client@test.com (3 required, 1 optional) to test different status badges"
  - "Created 2 requirements for client-mfa@test.com for comprehensive multi-client testing"
metrics:
  duration: "1 minute 7 seconds"
  tasks_completed: 1
  files_modified: 1
  lines_added: 96
  completed_date: "2026-03-16"
---

# Phase 17 Plan 04: Document Requirements Seed Data Summary

**One-liner:** Added DocumentRequirement records to seed script enabling document portal to display requirements instead of empty state.

## Context

UAT test 1 failed because the seed script created advisor profiles and client assignments but no document requirements. The documents page correctly showed empty state when no requirements existed -- it needed data to render the branded portal with requirements list.

## Execution Summary

### Task 1: Add DocumentRequirement records to seed script ✅
- **Commit:** a07a062
- **Files:** scripts/seed-advisor-test-data.js
- **Implementation:** Added DocumentRequirement records after each client-advisor assignment block
- **Verification:** Script runs without errors and is idempotent

### Key Implementation Details

**For client@test.com (4 requirements):**
- Trust Agreement (required)
- Tax Return (Most Recent) (required)
- Estate Plan Summary (required)
- Insurance Policies (optional)

**For client-mfa@test.com (2 requirements):**
- Trust Agreement (required)
- Financial Statements (required)

**Technical approach:**
- Used `prisma.documentRequirement.upsert()` with deterministic IDs
- References `advisorProfile.id` and `clientUser.id` correctly
- Maintains idempotent behavior for repeated runs

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

**Seed Script Verification:**
- ✅ Script runs without errors
- ✅ Script is idempotent (running twice produces same result)
- ✅ Creates 4 requirements for client@test.com
- ✅ Creates 2 requirements for client-mfa@test.com
- ✅ Requirements properly reference advisor and client IDs

**Expected UAT Impact:**
- Document portal will now show requirements list instead of empty state
- Progress indicator will show "0 of 3 documents uploaded" for client@test.com
- Advisor branding will display prominently with requirements

## Self-Check: PASSED

**Created files exist:**
- No new files created (seed script modification only)

**Modified files exist:**
✅ FOUND: scripts/seed-advisor-test-data.js

**Commits exist:**
✅ FOUND: a07a062

**Functionality verified:**
✅ Seed script creates DocumentRequirement records
✅ Script maintains idempotent behavior
✅ Requirements correctly link advisor to clients