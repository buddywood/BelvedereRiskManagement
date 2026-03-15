# Phase 15: Secure Client Invitations - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Advisors can invite clients through secure branded email system with complete invitation lifecycle management. This includes email creation, sending, status tracking, client registration through invitation links, and invitation management (resend, expire). Client assessment and workflow management are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Email Design and Branding
- Personal message format that looks like direct communication from advisor with subtle branding
- Template system with customizable fields: greeting, personal note, call-to-action - guided personalization approach
- Advisor logo only in email header/footer - no complex branding elements
- Security communicated through advisor verification: credentials, firm name, contact info prominently displayed

### Registration Experience
- Direct registration flow: invitation link goes straight to account creation form with details pre-filled
- Minimal signup requirements: email, password, and name only - collect additional details later
- Standard password strength requirements (8+ characters, mixed case) with optional 2FA setup
- Post-registration: immediately redirect to intake form for assessment start

### Claude's Discretion
- Exact email template layout and styling details
- Invitation link security implementation (tokens, expiration handling)
- Status tracking dashboard interface design
- Error handling and validation messaging

</decisions>

<specifics>
## Specific Ideas

- Email should feel like personal advisor communication, not marketing automation
- Registration process should be frictionless - get clients into the assessment quickly
- Security messaging should build trust through advisor relationship rather than technical badges

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 015-secure-client-invitations*
*Context gathered: 2026-03-15*