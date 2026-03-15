# Access Levels by Role

Summary of what each role can see and do. All protected routes require an authenticated session.

---

## Roles

| Role   | Typical use           | Default for sign-up |
|--------|------------------------|----------------------|
| **USER**   | Client (family, wealth owner) | Yes |
| **ADVISOR** | Advisor (assigned clients, reviews, governance) | No (set in DB/seed) |
| **ADMIN**  | Designated admin only (buddy@ebilly.com); has Admin area + Advisor access | No (set via script) |

---

## USER (client)

**Nav:** Dashboard, Intake, Assessment, Profiles, Settings.

| Area | Access |
|------|--------|
| **Dashboard** (`/dashboard`) | Own dashboard: assessments list, progress, account summary, links to results/settings. |
| **Intake** (`/intake`, `/intake/interview`, `/intake/complete`) | Own intake interview only. |
| **Assessment** (`/assessment`, `/assessment/.../results`, etc.) | Own assessment(s) only; creation and progress scoped to `session.user.id`. |
| **Profiles** (`/profiles`) | Own household members only. |
| **Settings** (`/settings`) | Own account, MFA, email. |
| **Advisor routes** (`/advisor`, `/advisor/dashboard`, etc.) | **No access.** Layout redirects to `/dashboard?error=unauthorized`. |
| **APIs** | Assessment, intake, reports, templates: all scoped by `session.user.id` or interview/assessment ownership. Clients cannot see other users’ data. |

**Makes sense:** Clients see only their own data and flows; no advisor menu or advisor-only routes.

---

## ADVISOR (and ADMIN)

**Nav:** Advisor Hub, Portfolio, Client View, Intake, Assessment, Profiles, Settings.

| Area | Access |
|------|--------|
| **Advisor Hub** (`/advisor`) | Advisor dashboard: assigned clients, pending reviews, notifications. Guarded by `advisor/layout.tsx` and `requireAdvisorRole()` in actions. |
| **Portfolio** (`/advisor/dashboard`) | Governance/portfolio dashboard. Same guards; data via `getGovernanceDashboardData()` (assigned clients only). |
| **Advisor review/notifications** | `/advisor/review/[id]`, `/advisor/notifications`. Same layout guard; actions use `requireAdvisorRole()` and advisor profile. |
| **Client View** (`/dashboard`) | **Currently:** Redirects to `/advisor` from the dashboard page, so “Client View” always sends them back to Advisor Hub. So advisors do not get a distinct “client” view unless you change this (see note below). |
| **Intake / Assessment / Profiles / Settings** | Same pages as clients. Advisors use them for **their own** intake, assessments, household, and account (e.g. demo or personal use). Data still scoped by `session.user.id` in APIs. |
| **APIs** | Client-facing APIs (assessment, intake, reports, templates) still enforce ownership by `session.user.id`. Advisor-only data (client list, reviews, approvals) goes through `requireAdvisorRole()` and advisor profile / assignments. Advisors do not get other users’ data via the generic assessment/intake APIs. |

**Makes sense:** Advisors have a dedicated area (Hub + Portfolio) and role checks on all advisor actions; they can also use client-facing pages for their own data only.

---

## ADMIN (designated admin: buddy@ebilly.com only)

**Nav:** Admin, Advisor Hub, Portfolio, Client View, Intake, Assessment, Profiles, Settings.

| Area | Access |
|------|--------|
| **Admin** (`/admin`) | Admin-only area; guarded by `admin/layout.tsx` and `requireAdminRole()`. Only the user with email `buddy@ebilly.com` and role ADMIN can access. Placeholder for user/role management. |
| **Advisor routes** | Same as ADVISOR (can use Advisor Hub, Portfolio, review, notifications). |
| **Session** | If the DB has `role: ADMIN` for any other email, the session callback in `lib/auth.ts` forces their role to USER so only buddy@ebilly.com ever gets ADMIN in the app. |

**Makes sense:** ADMIN is distinct (has its own Admin area) and is locked to one account.

---

## Things to decide

1. **“Client View” for advisors**  
   Right now, visiting `/dashboard` as an advisor redirects to `/advisor`, so the “Client View” nav item never shows the client dashboard. Options:  
   - **A)** Remove the redirect for advisors so “Client View” shows their own client-style dashboard (e.g. their own assessments if they have any).  
   - **B)** Remove “Client View” from the advisor nav if they should only use Advisor Hub and Portfolio.

2. **ADMIN (buddy@ebilly.com)**  
   ADMIN is a distinct role restricted to the designated admin account (buddy@ebilly.com). Only that user sees the "Admin" nav item and can access `/admin`. Session callback in `lib/auth.ts` strips ADMIN from any other user. Use `scripts/set-admin-role.js` to create or set the admin user.

3. **Advisors and client routes**  
   Advisors can open Intake, Assessment, Profiles, Settings and use them as a normal user (their own data). If the product should be “advisors only use Advisor Hub and Portfolio,” you could hide those four links for ADVISOR/ADMIN and only show Advisor Hub, Portfolio, and Settings (or similar).

---

## Guard summary

| Guard | Where | What it does |
|-------|--------|----------------|
| **Protected layout** | `(protected)/layout.tsx` | No session → redirect to `/signin`. |
| **Advisor layout** | `(protected)/advisor/layout.tsx` | Role not ADVISOR/ADMIN → redirect to `/dashboard?error=unauthorized`. |
| **Dashboard page** | `(protected)/dashboard/page.tsx` | Role ADVISOR/ADMIN → redirect to `/advisor` (so they land on Advisor Hub). |
| **Admin layout** | `(protected)/admin/layout.tsx` | Only allows access if `isAdminUser(email, role)` (ADMIN + buddy@ebilly.com). |
| **requireAdvisorRole()** | `lib/advisor/auth.ts` | Used by all advisor server actions; throws if not ADVISOR/ADMIN. |
| **requireAdminRole()** | `lib/admin/auth.ts` | Used for admin-only actions; throws unless ADMIN and email is buddy@ebilly.com. |
| **API ownership** | Assessment, intake, reports, templates APIs | Compare `assessment.userId` or interview owner to `session.user.id`; no role-based override. |

Role is normalized (`.toString().toUpperCase()`) in layout and advisor auth so “ADVISOR”/“ADMIN” match regardless of casing from the DB/JWT.
