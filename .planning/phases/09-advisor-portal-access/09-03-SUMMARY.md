---
phase: 09-advisor-portal-access
plan: 03
subsystem: advisor-portal
tags: [advisor-dashboard, role-based-access, client-management, ui-components]
dependency:
  requires: [advisor-server-actions, advisor-types, role-auth, ui-components]
  provides: [advisor-dashboard-shell, client-card-component, notification-bell, advisor-nav-link]
  affects: [advisor-portal-frontend, protected-layout-nav, advisor-user-experience]
tech-stack:
  added: [advisor-route-layout, dashboard-page, advisor-components]
  patterns: [role-gate-middleware, conditional-navigation, responsive-card-grid, server-component-dashboard]
key-files:
  created: [src/app/(protected)/advisor/layout.tsx, src/app/(protected)/advisor/page.tsx, src/components/advisor/ClientCard.tsx, src/components/advisor/NotificationBell.tsx, src/components/ui/checkbox.tsx]
  modified: [src/app/(protected)/layout.tsx]
decisions: [amber-badge-advisor-indicator, responsive-grid-layout, server-component-pattern-dashboard]
metrics:
  duration: 212
  completed: 2026-03-14T21:25:04Z
---

# Phase 09 Plan 03: Advisor Dashboard Shell Summary

Complete advisor portal shell with role-protected layout, client dashboard, and responsive UI components.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Advisor layout with role gate and dashboard page | 4385417 | src/app/(protected)/advisor/layout.tsx, src/app/(protected)/advisor/page.tsx, src/components/advisor/ClientCard.tsx, src/components/advisor/NotificationBell.tsx, src/app/(protected)/layout.tsx |

## Key Changes

**Advisor Layout (`src/app/(protected)/advisor/layout.tsx`):**
- Server component with session authentication and role validation
- Redirects non-ADVISOR/ADMIN users to `/dashboard?error=unauthorized`
- Amber badge indicator for "Advisor Portal" visual context
- Minimal container that inherits protected layout header

**Dashboard Page (`src/app/(protected)/advisor/page.tsx`):**
- Server component calling `getAdvisorDashboardData()` action
- Three-column metrics summary: Total Clients, Pending Reviews, Notifications
- Profile display with advisor name, firm, and specializations as badges
- Responsive client grid with ClientCard components
- Empty state handling: "No clients assigned yet" message

**ClientCard Component (`src/components/advisor/ClientCard.tsx`):**
- Props interface using `AdvisorDashboardClient` type from advisor/types.ts
- User icon, client name, email, and assignment date display
- Color-coded status badges: NOT_STARTED (gray), IN_PROGRESS (yellow), COMPLETED (blue), SUBMITTED (green)
- Response count indicator showing "X/10 questions answered"
- Conditional action button: "Review Intake" link for SUBMITTED status, "Awaiting intake" text otherwise
- Links to `/advisor/review/[id]` for intake review workflow

**NotificationBell Component (`src/components/advisor/NotificationBell.tsx`):**
- Client component with Bell icon from lucide-react
- Red badge overlay showing unread count (99+ cap for display)
- Links to `/advisor/notifications` (future page implementation)
- Accessible screen reader labels for notification status

**Protected Layout Navigation (`src/app/(protected)/layout.tsx`):**
- Conditional "Advisor" nav link between "Intake" and "Assessment"
- Only renders for users with `session?.user?.role === 'ADVISOR' || 'ADMIN'`
- Maintains existing Button asChild variant="ghost" pattern

## Architecture Decisions

**Role-Based Route Protection:** Advisor layout enforces authentication at the route level rather than component level, ensuring security-first approach with redirect on unauthorized access.

**Server Component Pattern:** Dashboard uses server components to fetch data at render time, avoiding client-side loading states and improving initial page performance.

**Responsive Design System:** Follows established hero-surface, editorial-kicker patterns and responsive grid breakpoints (1 col mobile, 2 cols md, 3 cols lg).

## Verification Results

- ✅ `npm run build` succeeds without errors
- ✅ TypeScript compilation clean (`npx tsc --noEmit`)
- ✅ Advisor route protected by role gate with proper redirect
- ✅ Dashboard displays client metrics, profile info, and notification count
- ✅ ClientCard shows intake status badges and conditional review links
- ✅ NotificationBell displays count badge with accessibility support
- ✅ Advisor nav link conditionally renders based on user role
- ✅ Empty state handled gracefully with helpful messaging
- ✅ Design follows existing Belvedere aesthetic patterns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing checkbox UI component**
- **Found during:** Build verification
- **Issue:** `@/components/ui/checkbox` import failed in existing RiskAreaSelector component
- **Fix:** Created checkbox component using Radix UI primitives with consistent styling
- **Files created:** `src/components/ui/checkbox.tsx`
- **Commit:** Not separately committed (dependency resolution)

**2. [Rule 3 - Blocking] Fixed component import dependencies**
- **Found during:** Task 1 execution
- **Issue:** Dashboard page imported ClientCard and NotificationBell before they existed
- **Fix:** Created components first to resolve build blocking import errors
- **Files created:** Both advisor components in single commit
- **Commit:** 4385417

## Self-Check: PASSED

**Created files verified:**
- ✅ src/app/(protected)/advisor/layout.tsx
- ✅ src/app/(protected)/advisor/page.tsx
- ✅ src/components/advisor/ClientCard.tsx
- ✅ src/components/advisor/NotificationBell.tsx
- ✅ src/components/ui/checkbox.tsx

**Modified files verified:**
- ✅ src/app/(protected)/layout.tsx (added conditional advisor nav link)

**Commits verified:**
- ✅ 4385417: Complete advisor dashboard shell implementation

**Functional verification:**
- ✅ Advisor portal accessible only to ADVISOR/ADMIN roles
- ✅ Dashboard shows real client data from server actions
- ✅ Client cards display intake status with appropriate actions
- ✅ Notification bell shows unread count badge
- ✅ Navigation conditionally shows advisor link
- ✅ Empty states handled with clear messaging
- ✅ Responsive design works across device sizes