---
phase: 015-secure-client-invitations
plan: 01
subsystem: database, invitations
tags: [schema, business-logic, foundation]
dependency_graph:
  requires: [prisma-schema, invite-system]
  provides: [invitation-models, invitation-service, advisor-branding]
  affects: [all-future-invitation-plans]
tech_stack:
  added: [InvitationStatus-enum, advisor-invitation-fields]
  patterns: [multi-tenant-security, secure-token-generation]
key_files:
  created:
    - src/lib/invitations/types.ts
    - src/lib/invitations/service.ts
  modified:
    - prisma/schema.prisma
    - src/lib/invite.ts
decisions:
  - Use 7-day TTL for client invitations separate from 10-minute code flow
  - Store advisor logo as external URL not file upload per research recommendation
  - Implement 3-resend limit with resendCount tracking
  - Multi-tenant isolation through advisor ownership verification
metrics:
  duration: 132
  completed: "2026-03-15T21:54:05Z"
  tasks: 2
  files_modified: 4
  commits: [202d731, 55653cb]
---

# Phase 015 Plan 01: Database Schema and Invitation Service Foundation

Extended Prisma schema and created invitation business logic for advisor-initiated client invitations with status tracking and advisor branding support.

## Tasks Completed

| Task | Name | Status | Commit | Files |
|------|------|--------|---------|-------|
| 1 | Extend Prisma schema for advisor invitations and branding | ✓ | 202d731 | prisma/schema.prisma |
| 2 | Create invitation types and business logic service | ✓ | 55653cb | types.ts, service.ts, invite.ts |

## Schema Extensions

**InvitationStatus enum:** SENT, OPENED, REGISTERED, EXPIRED

**InviteCode model additions:**
- `createdBy String?` - Links to AdvisorProfile.id
- `status InvitationStatus @default(SENT)` - Invitation status tracking
- `statusUpdatedAt DateTime @default(now())` - Status change timestamps
- `personalMessage String?` - Custom advisor message
- `clientName String?` - Pre-fill registration form
- `resendCount Int @default(0)` - Resend tracking (3 max)
- `advisor` relation to AdvisorProfile
- Indexes on `[createdBy]` and `[status]`

**AdvisorProfile model additions:**
- `logoUrl String?` - External URL for advisor branding
- `invitations InviteCode[]` - Back-relation to invitations

## Service Functions

**createAdvisorInvitation:** Generates 6-char alphanumeric codes, creates invitation with 7-day expiry, returns secure invitation URL

**getAdvisorInvitations:** Lists advisor's invitations with optional status/search filtering, computes isExpired/canResend flags

**resendInvitation:** Resets invitation expiry, enforces 3-resend limit, generates new secure token

**expireInvitation:** Manually expires invitation, sets status to EXPIRED

## Security Implementation

- **Multi-tenant isolation:** All functions verify advisor ownership before operations
- **7-day secure tokens:** Uses HMAC-SHA256 with base64url encoding
- **Resend limits:** Maximum 3 resends per invitation
- **Status tracking:** Full lifecycle from SENT → OPENED → REGISTERED → EXPIRED

## Deviations from Plan

None - plan executed exactly as written.

## Foundation Layer

This plan provides the core foundation that all other v1.4 plans depend on:
- Schema changes enable all invitation-related features
- Service layer provides secure invitation management
- Multi-tenant security patterns established
- Advisor branding infrastructure ready

## Self-Check: PASSED

**Created files verified:**
- FOUND: src/lib/invitations/types.ts
- FOUND: src/lib/invitations/service.ts

**Modified files verified:**
- FOUND: prisma/schema.prisma (InvitationStatus enum, extended models)
- FOUND: src/lib/invite.ts (7-day TTL, createInvitationToken)

**Commits verified:**
- FOUND: 202d731 (schema extensions)
- FOUND: 55653cb (service implementation)

**Compilation verified:**
- Prisma schema validates successfully
- TypeScript compilation passes with no errors
- All service functions export correctly