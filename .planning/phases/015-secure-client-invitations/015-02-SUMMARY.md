---
phase: 015-secure-client-invitations
plan: 02
subsystem: email, server-actions, validation
tags: [email-templates, branded-communication, advisor-branding]
dependency_graph:
  requires: [invitation-models, invitation-service, advisor-auth, resend-infrastructure]
  provides: [branded-email-templates, invitation-server-actions, validation-schemas]
  affects: [client-invitation-flow, advisor-invitation-management]
tech_stack:
  added: [zod-validation, resend-email-templates, server-actions]
  patterns: [html-email-rendering, xss-sanitization, advisor-signature-blocks]
key_files:
  created:
    - src/lib/invitations/email.ts
    - src/lib/schemas/invitation.ts
    - src/lib/actions/invitations.ts
decisions:
  - Personal message format with branded advisor signature block for authenticity
  - HTTPS-only logo validation to prevent mixed content issues
  - HTML escaping for all advisor-provided content to prevent XSS
  - Graceful error handling for Resend API failures to prevent blocking flows
  - 7-day invitation expiration communicated in footer for transparency
metrics:
  duration: 240
  completed: "2026-03-15T21:59:24Z"
  tasks: 2
  files_modified: 3
  commits: [fb558eb, 4e992da]
---

# Phase 015 Plan 02: Branded Email Templates and Server Actions

Created branded email templates and server actions for sending advisor-initiated client invitations with personal messaging and professional advisor verification.

## Tasks Completed

| Task | Name | Status | Commit | Files |
|------|------|--------|---------|-------|
| 1 | Create branded email template and sending function | ✓ | fb558eb | src/lib/invitations/email.ts |
| 2 | Create validation schema and server actions for invitation lifecycle | ✓ | 4e992da | schemas/invitation.ts, actions/invitations.ts |

## Email Template Features

**Personal Communication Design:**
- Advisor logo in header/footer (60px max height, left-aligned)
- Personal greeting: "Dear {clientName}" or "Dear there"
- Advisor's custom message in highlighted quote block
- Professional "Get Started" CTA button (#18181b styling)
- Fallback plain text URL for email client compatibility

**Advisor Verification Block:**
- Advisor name (bold), job title at firm name
- Contact email, phone number, license number prominently displayed
- Builds trust through credential verification per user decision

**Security Implementation:**
- HTML escaping for all advisor-provided content (name, message, etc.)
- HTTPS-only logo URL validation prevents mixed content warnings
- XSS prevention through escapeHtml function (&, <, >, ", ' characters)

## Server Actions

**sendInvitation:** Creates new invitation, validates advisor role, sends branded email with advisor info

**resendInvitationAction:** Enforces 3-resend limit, generates new URL, re-sends with same personalization

**expireInvitationAction:** Manually expires invitation for advisor control

**getInvitationsAction:** Lists advisor's invitations with optional status/search filtering

## Validation Schema

**createInvitationSchema (Zod):**
- `clientEmail`: Required email validation
- `clientName`: Optional, 100 char limit
- `personalMessage`: Optional, 2000 char limit with professional default template

## Multi-Tenant Security

All server actions follow established patterns:
1. Call `requireAdvisorRole()` to authenticate and authorize
2. Get advisor profile with `getAdvisorProfileOrThrow(userId)`
3. Pass advisor ID to service layer for ownership validation
4. Return typed success/error results

## Email Integration

**Resend Pattern Compliance:**
- Runtime client initialization (not module load time)
- Graceful degradation when RESEND_API_KEY missing
- Error logging without throwing to prevent blocking flows
- Uses existing FROM_EMAIL environment configuration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Fixed nullish coalescing operator syntax error**
- **Found during:** Task 2 verification
- **Issue:** `??` and `||` operators mixed without parentheses in AdvisorIntakeView.tsx
- **Fix:** Added parentheses: `question.questionNumber ?? (parseInt(...) || 0)`
- **Files modified:** src/components/advisor/AdvisorIntakeView.tsx
- **Commit:** 4e992da (included in Task 2 commit)

## Foundation Integration

This plan builds on Plan 01's invitation service foundation:
- Uses `createAdvisorInvitation` for secure token generation
- Leverages existing multi-tenant isolation patterns
- Integrates with existing advisor authentication system
- Follows established Resend email infrastructure patterns

The branded email templates provide the first professional touchpoint in the advisor-client relationship, establishing trust through credential verification while maintaining the personal communication style specified in user decisions.

## Self-Check: PASSED

**Created files verified:**
- FOUND: src/lib/invitations/email.ts
- FOUND: src/lib/schemas/invitation.ts
- FOUND: src/lib/actions/invitations.ts

**Modified files verified:**
- FOUND: src/components/advisor/AdvisorIntakeView.tsx (syntax fix)

**Commits verified:**
- FOUND: fb558eb (email template implementation)
- FOUND: 4e992da (validation schemas and server actions)

**Compilation verified:**
- Build passes with no errors
- All server actions properly marked with "use server"
- Advisor role validation enforced in all data access
- HTML escaping implemented for XSS prevention
- HTTPS logo URL validation working correctly