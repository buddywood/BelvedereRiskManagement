---
phase: 09-advisor-portal-access
plan: 01
subsystem: advisor-portal
tags: [data-models, auth-extension, role-based-access]
dependency:
  requires: [prisma-schema, nextauth-config, user-model]
  provides: [advisor-models, role-auth, advisor-types]
  affects: [auth-system, database-schema, type-definitions]
tech-stack:
  added: [advisor-domain-types, role-based-auth]
  patterns: [prisma-relations, nextauth-extensions, zod-validation]
key-files:
  created: [src/lib/advisor/types.ts, src/lib/schemas/advisor.ts]
  modified: [prisma/schema.prisma, src/types/next-auth.d.ts, src/lib/auth.ts, src/lib/auth-edge.ts]
decisions: [use-enum-for-user-roles, specializations-as-string-array, advisor-profile-separate-from-user]
metrics:
  duration: 150
  completed: 2026-03-14T21:14:40Z
---

# Phase 09 Plan 01: Advisor Portal Data Foundation Summary

JWT auth with role-based access and complete advisor data models for client management.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Prisma schema extensions for advisor portal | a608cd2 | prisma/schema.prisma |
| 2 | Auth extensions and TypeScript/Zod types for advisor domain | 8ff4a1a | src/types/next-auth.d.ts, src/lib/auth.ts, src/lib/auth-edge.ts, src/lib/advisor/types.ts, src/lib/schemas/advisor.ts |

## Key Changes

**Database Schema:**
- Added UserRole enum (USER, ADVISOR, ADMIN) with USER default
- Extended User model with role field and advisor relations
- Created AdvisorProfile model with specializations, license, firm info
- Created ClientAdvisorAssignment for unique client-advisor pairs
- Created IntakeApproval for advisor review workflow with focus areas
- Created AdvisorNotification for notification management
- Added AssignmentStatus, ApprovalStatus, NotificationType enums

**Authentication System:**
- Extended NextAuth Session, User, and JWT interfaces with role field
- Updated auth.ts and auth-edge.ts to propagate role through JWT/session
- Role now available in all protected routes for authorization checks

**Type Definitions:**
- Created comprehensive TypeScript types for advisor domain operations
- RISK_AREAS constant maps 8 assessment subcategories for focus area selection
- Zod validation schemas for all advisor operations (assign, approve, update status)

## Architecture Decisions

**Role Implementation:** Used enum at database level but string in TypeScript for NextAuth compatibility. Role defaults to USER and propagates through entire auth stack.

**Advisor Profile Design:** Separated AdvisorProfile from User model to maintain clean user core while extending with advisor-specific data. Specializations stored as string array matching assessment subcategory IDs.

**Assignment Model:** ClientAdvisorAssignment enforces unique constraint on client-advisor pairs with status tracking for lifecycle management.

## Verification Results

- ✅ Database migration successful (`npx prisma db push`)
- ✅ Prisma client generation complete
- ✅ TypeScript compilation clean (`npx tsc --noEmit`)
- ✅ Next.js build successful (`npm run build`)
- ✅ All new models and enums present in schema
- ✅ Role field available in JWT and session

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

**Created files verified:**
- ✅ src/lib/advisor/types.ts
- ✅ src/lib/schemas/advisor.ts

**Commits verified:**
- ✅ a608cd2: Prisma schema with advisor models
- ✅ 8ff4a1a: Auth extensions and advisor types

**Database schema verified:**
- ✅ UserRole enum exists
- ✅ User.role field with USER default
- ✅ AdvisorProfile, ClientAdvisorAssignment, IntakeApproval, AdvisorNotification models
- ✅ IntakeInterview.approval relation added