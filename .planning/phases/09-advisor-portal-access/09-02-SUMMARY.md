---
phase: 09-advisor-portal-access
plan: 02
subsystem: advisor-portal
tags: [server-actions, data-access, multi-tenant-security, role-based-auth]
dependency:
  requires: [advisor-models, role-auth, prisma-client, intake-questions]
  provides: [advisor-data-layer, advisor-server-actions, secure-data-access]
  affects: [advisor-portal-backend, multi-tenant-isolation, approval-workflow]
tech-stack:
  added: [server-only-guards, advisor-data-functions, authenticated-actions]
  patterns: [ownership-enforcement, try-catch-response-format, auth-first-validation]
key-files:
  created: [src/lib/advisor/auth.ts, src/lib/data/advisor.ts, src/lib/actions/advisor-actions.ts]
  modified: [src/lib/advisor/types.ts]
decisions: [minimal-user-subset-for-security, upsert-approval-creation, auto-timestamp-status-transitions]
metrics:
  duration: 177
  completed: 2026-03-14T21:19:32Z
---

# Phase 09 Plan 02: Advisor Portal Backend Summary

Server-side data access and authenticated actions for advisor portal with multi-tenant security enforcement.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Advisor auth helpers and data access layer | a9b1e7c | src/lib/advisor/auth.ts, src/lib/data/advisor.ts |
| 2 | Authenticated server actions for advisor portal | 50c4ddf | src/lib/actions/advisor-actions.ts, src/lib/advisor/types.ts |

## Key Changes

**Auth Helpers (`src/lib/advisor/auth.ts`):**
- `requireAdvisorRole()`: Guards all advisor operations, validates ADVISOR/ADMIN roles
- `getAdvisorProfileOrThrow()`: Profile validation with user relationship data
- Both functions enforce "server-only" import protection

**Data Access Layer (`src/lib/data/advisor.ts`):**
- `getAssignedClients()`: Multi-tenant client list with latest interview status aggregation
- `getClientIntakeForReview()`: Secure interview access via `ClientAdvisorAssignment` validation
- `createIntakeApproval()`: Upsert pattern prevents duplicate approval records
- `updateIntakeApproval()`: Status transitions with auto-timestamp logic (IN_REVIEW→reviewedAt, APPROVED→approvedAt)
- `getAdvisorNotifications()`: Filtered notification retrieval with ownership boundaries
- All queries enforce `advisorProfileId` in WHERE clauses for multi-tenant isolation

**Server Actions (`src/lib/actions/advisor-actions.ts`):**
- `getAdvisorDashboardData()`: Dashboard aggregation (clients, profile, unread notification count)
- `getIntakeReviewData()`: Secure interview data with INTAKE_QUESTIONS mapping for UI
- `markIntakeInReview()`: Approval workflow transition from PENDING to IN_REVIEW
- `approveClientIntake()`: Focus area selection with APPROVED status and validation
- `rejectClientIntake()`: Rejection workflow with notes support
- Every action follows auth-first pattern: `requireAdvisorRole()` → `getAdvisorProfileOrThrow()` → operation
- Consistent response format: `{ success: boolean, error?: string, data?: T }`

## Architecture Decisions

**Security-First Design:** Every data access function enforces advisor ownership through assignment relationships. No data leakage possible between advisor tenants.

**Upsert Approval Pattern:** `createIntakeApproval()` uses upsert keyed on `interviewId` to handle race conditions and duplicate requests gracefully.

**Minimal User Data Exposure:** Refined `IntakeReviewData` type to include only essential user fields (`id`, `name`, `email`) rather than full `User` object for security.

## Verification Results

- ✅ TypeScript compilation clean (`npx tsc --noEmit`)
- ✅ Next.js build successful (`npm run build`)
- ✅ All exported functions match plan requirements
- ✅ Every server action calls `requireAdvisorRole()` first
- ✅ Every data query includes `advisorProfileId` ownership enforcement
- ✅ Response format matches existing pattern: `{ success, error?, data? }`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type mismatch in IntakeReviewData**
- **Found during:** Task 2 compilation
- **Issue:** `IntakeReviewData.interview.user` expected full `User` object but data query only selected subset
- **Fix:** Updated type definition to specify minimal user subset `{ id, name, email }` for security
- **Files modified:** `src/lib/advisor/types.ts`
- **Commit:** 50c4ddf

**2. [Rule 1 - Bug] Fixed database field name mismatch**
- **Found during:** Task 1 compilation
- **Issue:** Referenced `assignment.createdAt` but schema field is `assignedAt`
- **Fix:** Updated field reference to match schema
- **Files modified:** `src/lib/data/advisor.ts`
- **Commit:** a9b1e7c

**3. [Rule 1 - Bug] Fixed NotificationType enum values**
- **Found during:** Task 1 compilation
- **Issue:** Used non-existent enum values for notification types
- **Fix:** Updated to match schema: `NEW_INTAKE`, `INTAKE_UPDATED`, `SYSTEM`
- **Files modified:** `src/lib/data/advisor.ts`
- **Commit:** a9b1e7c

## Self-Check: PASSED

**Created files verified:**
- ✅ src/lib/advisor/auth.ts
- ✅ src/lib/data/advisor.ts
- ✅ src/lib/actions/advisor-actions.ts

**Modified files verified:**
- ✅ src/lib/advisor/types.ts (refined IntakeReviewData type)

**Commits verified:**
- ✅ a9b1e7c: Auth helpers and data access layer
- ✅ 50c4ddf: Server actions and type refinements

**Functional verification:**
- ✅ All data functions enforce advisorProfileId ownership
- ✅ All actions start with requireAdvisorRole() auth check
- ✅ Approval workflow supports full lifecycle (PENDING→IN_REVIEW→APPROVED/REJECTED)
- ✅ Zero TypeScript errors, successful build