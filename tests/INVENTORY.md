# E2E Test Inventory

Tracks which manual test cases from the **Akili Risk Test Plan** (BRD-derived,
~95 cases, stored in the user's Google Drive) are covered by Playwright tests
under `tests/`.

> **Note:** The BRD test plan document is not committed to this repo. TC IDs
> below should be filled in from the Google Drive doc as tests are implemented.
> Until then, tests are listed by feature area.

## Status Key
- **Implemented** - automated, runs in `tests/`
- **Not Implemented** - planned, no code yet
- **Failing** - implemented but currently red
- **Skipped** - implemented but disabled (note reason)

## Implemented

| Spec | Test | BRD TC ID(s) | Status |
|---|---|---|---|
| `tests/smoke/auth.spec.ts` | advisor can sign in and load `/advisor` | TBD | Implemented |
| `tests/smoke/auth.spec.ts` | client can sign in and load `/dashboard` | TBD | Implemented |
| `tests/smoke/auth.spec.ts` | admin can sign in and load `/admin` | TBD | Implemented |
| `tests/smoke/client-dashboard.spec.ts` | client dashboard reflects submitted intake state | TBD | Implemented |
| `tests/smoke/advisor-clients.spec.ts` | advisor can view client list and open a client | TBD | Implemented |
| `tests/smoke/admin-advisors.spec.ts` | admin can view advisors list with at least one row | TBD | Implemented |

## Not Implemented (BRD Test Plan Coverage Gap)

Ordered roughly by BRD section. Fill in TC IDs and split into specs as work proceeds.

### Authentication & Access
- Sign up with valid invite code (generic `123456`)
- Sign up with prefilled invite code (`BELV01`)
- Sign up rejects invalid/expired invite codes
- Sign in rejects wrong password (error surfaces, no redirect)
- Forgot password - request email
- Reset password from emailed link
- MFA enrollment flow (`/settings` Two-Factor)
- MFA challenge on sign in (`client-mfa@test.com`)
- Sign out clears session and redirects to `/signin`
- Deactivated account shows `notice=account_deactivated`
- Open-redirect protection on `callbackUrl`

### Client Intake
- Client starts intake from dashboard *(blocked: needs a fresh-intake test user — see "Open Blockers")*
- Intake "Type" tab happy path: answer 10 questions, submit, land on `/intake/complete`
- Intake validation: Next button disabled until response saved
- Intake save-and-resume
- Intake submit moves to `IN_REVIEW`
- Advisor approval unlocks assessment (`intakeGate.assessmentUnlocked`)
- Advisor rejection surfaces "Update needed" hero state
- Advisor waiver path (intake skipped, assessment unlocked)

### Risk Assessments
- Governance question bank loads on assessment start
- Family risk module - complete and score
- Cyber risk module - complete and score
- Identity risk module - complete and score
- Intelligence module - complete and score
- Reputational & social module
- Physical risk module
- Resume in-progress assessment from dashboard
- Score persists and renders on dashboard
- Hidden questions (`questions.is_visible=false`) excluded

### Advisor Workflows
- ~~Advisor portfolio lists assigned clients~~ *(covered by `advisor-clients.spec.ts`)*
- ~~Open client detail from pipeline~~ *(covered by `advisor-clients.spec.ts`)*
- Pipeline metrics (`activeInFlight`, `totalAssigned`) match expected counts
- Pipeline filters (by stage, search) update visible rows
- Send client invitation
- Review client intake submission
- Approve/reject intake
- View client assessment results
- Cyber risk advisor review
- Identity risk advisor review
- Intelligence advisor review
- Notification bell shows unread count
- Advisor billing page accessible when hub blocked
- Soft-deleted advisor: deactivated styling on admin advisors list

### Admin Functions
- ~~Admin can list advisors (`/admin/advisors`)~~ *(covered by `admin-advisors.spec.ts`)*
- Admin can soft-delete an advisor
- Admin can list clients (`/admin/clients`)
- Admin can assign lead to advisor (`/admin/leads`)
- Admin intake management view (`/admin/intake`)
- Admin assessment management view (`/admin/assessment`)
- Admin question bank: hide/show question
- Admin question bank: edit copy
- Admin settings page renders
- Non-admin users redirected from `/admin/*` with `?error=unauthorized`

### Documents
- Generate PDF report for completed assessment
- Download report from dashboard
- Document templates render with branding

### Billing
- Free tier client onboarding
- Advisor subscribes to a tier (Stripe checkout)
- Subscription tier displayed on advisor admin row
- Billing cycle (monthly/annual) shown
- Grace period behavior on payment failure

### Branding & Multi-Tenant
- Client portal shows assigned advisor branding
- Preview brand hex applied
- Default Akili branding when no advisor branding

## Open Blockers

### Intake happy-path test needs a fresh-intake user

Both seeded clients (`client@test.com`, `client-mfa@test.com`) have SUBMITTED
intakes from `seed-advisor-test-data.js`, so `/intake` redirects them to
`/intake/complete` and the interview wizard cannot be exercised end-to-end.

Options to unblock (none implemented):
1. Add a third seeded client (e.g. `client-fresh@test.com`) with no intake
   interview row, used only by intake tests that re-create state.
2. Add a dev-only API endpoint (gated by env flag) to reset a user's intake,
   called from a Playwright `beforeAll`.
3. Use the public signup flow: generate a per-run email, redeem invite code
   `123456`, complete signup, run intake. Pollutes the DB with one user per
   run but is fully self-contained.

Audio recording is not a blocker - the interview wizard has a "Type" tab
(`tests/smoke/...` would use `responseTab="type"`).

## Process

1. When implementing a new test, move its row from "Not Implemented" to "Implemented"
2. Fill in the BRD TC ID(s) it covers
3. If a test is added that has no BRD TC, leave the column blank but keep the row
4. If a feature is removed, delete the row outright (don't mark removed)
