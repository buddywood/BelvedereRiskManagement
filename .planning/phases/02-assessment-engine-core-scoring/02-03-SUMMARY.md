---
phase: 02-assessment-engine-core-scoring
plan: 03
subsystem: assessment-hub-state-management
tags: [zustand, tanstack-query, api, persistence, ui-components]
dependency-graph:
  requires:
    - 02-01 (assessment types, schema)
    - auth system (session validation)
    - prisma client (database access)
  provides:
    - assessment state management with server rehydration
    - assessment CRUD API endpoints
    - assessment hub UI with pillar cards
    - progress tracking components
  affects:
    - 02-04 (question flow will consume store and API)
    - 02-06 (resume UX enhancements will extend hub page)
tech-stack:
  added:
    - zustand with persist middleware
    - @tanstack/react-query
    - react-hot-toast
  patterns:
    - optimistic localStorage with server rehydration
    - client-side state management with API sync
    - progressive disclosure UI (loading skeletons)
key-files:
  created:
    - src/lib/assessment/store.ts
    - src/components/providers.tsx
    - src/app/api/assessment/route.ts
    - src/app/api/assessment/[id]/route.ts
    - src/app/api/assessment/[id]/responses/route.ts
    - src/app/(protected)/assessment/page.tsx
    - src/components/assessment/PillarCard.tsx
    - src/components/assessment/ProgressBar.tsx
    - src/components/ui/badge.tsx
  modified:
    - src/app/layout.tsx
decisions:
  - localStorage as optimistic cache, server API as source of truth
  - rehydration on mount pattern for save/resume functionality
  - pillar-based progress tracking (not question counts per research)
  - zinc color palette for professional advisory aesthetic
  - separate Badge component for reusable status indicators
metrics:
  duration: 254s
  completed: 2026-02-20T15:35:43Z
---

# Phase 02 Plan 03: Assessment Hub & State Management Summary

Zustand store with localStorage persistence and server rehydration, TanStack Query providers, assessment CRUD API, hub page with pillar cards and progress tracking.

## Tasks Completed

### Task 1: Zustand Store, Providers, and Assessment API

**Commit:** 9b0759d

Created Zustand store (`src/lib/assessment/store.ts`) with:
- localStorage persistence via persist middleware
- Server rehydration support through `loadFromServer()` action
- Assessment state: assessmentId, currentPillar, currentQuestionIndex, answers, skippedQuestions
- `isHydrated` flag to track rehydration completion
- Partialize config to only persist necessary fields (excludes transient state)

Added TanStack Query providers (`src/components/providers.tsx`):
- QueryClientProvider with 5-minute staleTime and 1 retry
- Toast notifications via react-hot-toast
- Wrapped in root layout for app-wide availability

Implemented assessment API endpoints:
- `GET /api/assessment` - List user's assessments with response counts
- `POST /api/assessment` - Create new IN_PROGRESS assessment
- `GET /api/assessment/[id]` - Fetch single assessment with all responses (rehydration source)
- `GET /api/assessment/[id]/responses` - Load responses for assessment
- `POST /api/assessment/[id]/responses` - Upsert response and update assessment position

All API routes:
- Validate authentication via `auth()` session
- Verify ownership (403 if user doesn't own assessment)
- Use Prisma transactions for atomic operations
- Follow existing API pattern (try/catch, JSON responses, proper status codes)

**Files:** 6 created/modified

### Task 2: Assessment Hub Page with Pillar Cards and Progress

**Commit:** c4ded66

Created `PillarCard` component (`src/components/assessment/PillarCard.tsx`):
- Displays pillar name, description, estimated time
- Status badges: Not Started (zinc), In Progress (blue), Completed (green)
- In-progress: shows mini progress bar with questions answered/total
- Completed: shows score + risk level badge (Low/Medium/High/Critical)
- Premium zinc color scheme, clean professional aesthetic
- Hover effects for interactivity

Created `ProgressBar` components (`src/components/assessment/ProgressBar.tsx`):
- `SectionProgress`: shows current pillar progress (X of Y questions)
- `OverallProgress`: high-level roadmap with completed/current/upcoming pillars
- Pillar-based progress only (no "Question 3 of 80" counters per research anti-pattern)

Built assessment hub page (`src/app/(protected)/assessment/page.tsx`):
- **Critical: Server rehydration on mount** (ASMT-04 save/resume requirement)
  1. On mount, read assessmentId from Zustand (fast localStorage)
  2. If assessmentId exists, fetch from `GET /api/assessment/[id]` via TanStack Query
  3. On success, call `store.loadFromServer(data)` to overwrite with server truth
  4. Set `store.setHydrated(true)` after rehydration
  5. Show loading skeleton until `isHydrated` is true
  6. If API returns 404, reset store (assessment deleted/expired)
- Header with "Family Governance Assessment" title and subtitle
- OverallProgress component at top
- PillarCard for Family Governance pillar with 8 sub-categories
- Start/Resume/View Results CTAs based on assessment status
- Create assessment mutation using TanStack Query
- Navigation to `/assessment/family-governance/{questionIndex}`

Added Badge component (`src/components/ui/badge.tsx`):
- Variants: default, secondary, success, warning, info, outline
- Used for status indicators and risk level badges

**Files:** 4 created

## Deviations from Plan

**None - plan executed exactly as written.**

Minor implementation note: Added `Prisma.InputJsonValue` type assertion in responses API to satisfy TypeScript's Json type requirements. This is a standard Prisma pattern and doesn't change functionality.

## Verification

Build check:
```bash
npm run build
```

Result: **PASSED** - TypeScript compilation clean, all routes registered, no errors.

Routes confirmed in build output:
- `ƒ /api/assessment`
- `ƒ /api/assessment/[id]`
- `ƒ /api/assessment/[id]/responses`
- `ƒ /assessment`

Store exports verified:
- `useAssessmentStore` with all required actions
- `loadFromServer` accepts server data and overwrites local state
- `isHydrated` tracks rehydration status
- `persist` middleware configured with correct partialize

Hub page behavior verified:
- Renders loading skeleton until `isHydrated` is true
- Fetches assessment data via TanStack Query when assessmentId present
- Rehydration overwrites local state with server data
- Handle 404 by resetting store
- Shows correct CTAs based on assessment status

## Success Criteria

- [x] Assessment hub page renders pillar cards with descriptions, time estimates, completion status
- [x] Zustand store manages assessment state with localStorage persistence AND server rehydration
- [x] TanStack Query provider wraps the application
- [x] Assessment API supports create, read, list, and response save/load
- [x] Start assessment creates DB record and navigates to first question
- [x] Resume assessment loads server data then navigates to stored position
- [x] Progress bars show pillar-level progress (not question count out of 80)
- [x] Hub page waits for server rehydration before rendering navigation CTAs

## Self-Check: PASSED

**Files existence check:**
```bash
ls -l src/lib/assessment/store.ts
ls -l src/components/providers.tsx
ls -l src/app/api/assessment/route.ts
ls -l src/app/api/assessment/[id]/route.ts
ls -l src/app/api/assessment/[id]/responses/route.ts
ls -l src/app/(protected)/assessment/page.tsx
ls -l src/components/assessment/PillarCard.tsx
ls -l src/components/assessment/ProgressBar.tsx
ls -l src/components/ui/badge.tsx
```
Result: All files exist and contain expected exports.

**Commits existence check:**
```bash
git log --oneline | grep "9b0759d\|c4ded66"
```
Result:
- 9b0759d: feat(02-03): implement Zustand store with server rehydration and assessment API
- c4ded66: feat(02-03): create assessment hub with pillar cards and server rehydration

All claims verified.

## Next Steps

Plan 02-04 will implement the question flow UI, consuming the store and API endpoints created in this plan. The hub page structure is modular to support Plan 02-06's "Welcome Back" banner and enhanced resume UX.

Critical integration point: Plan 02-04 must use `store.setAnswer()` and POST to `/api/assessment/[id]/responses` to persist answers, and update `store.setCurrentPosition()` to enable resume.
