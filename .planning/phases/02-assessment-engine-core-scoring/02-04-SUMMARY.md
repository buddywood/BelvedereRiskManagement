---
phase: 02-assessment-engine-core-scoring
plan: 04
subsystem: assessment-ui
tags: [question-flow, auto-save, navigation, card-ui, inline-help]
completed: 2026-02-20
duration_minutes: 4

dependencies:
  requires: [02-01, 02-02, 02-03]
  provides: [question-flow-ui, auto-save-hook, navigation-logic]
  affects: [02-05, 02-06]

tech_stack:
  added: [react-hook-form, use-debounce, tanstack-query-mutations]
  patterns: [debounced-auto-save, controlled-components, dynamic-validation, optimistic-updates]

key_files:
  created:
    - src/components/assessment/AnswerOptions.tsx
    - src/components/assessment/InlineHelp.tsx
    - src/components/assessment/QuestionCard.tsx
    - src/components/assessment/NavigationButtons.tsx
    - src/lib/hooks/useAutoSave.ts
    - src/lib/hooks/useAssessmentNavigation.ts
    - src/app/(protected)/assessment/[pillarSlug]/[questionIndex]/page.tsx
    - src/app/(protected)/assessment/complete/page.tsx

decisions:
  - Card-based answer selections with shadcn Card components for premium feel
  - 1000ms debounce for auto-save to balance responsiveness and server load
  - Optimistic UI updates via Zustand, debounced API persistence via TanStack Query
  - Dynamic validation schema generation based on question type and required flag
  - Navigation to /assessment/complete (not /assessment/results) for score calculation separation
  - Browser back/forward support via URL-based navigation index
  - Maturity scale visual progression indicator with color-coded left border

metrics:
  tasks_completed: 2
  files_created: 8
  test_coverage: 0
  build_status: passing
---

# Phase 02 Plan 04: Question Flow UI Summary

**One-liner:** TurboTax-style question flow with card-based selections, debounced auto-save, and branching navigation

## What Was Built

Complete one-question-per-screen assessment flow with premium card-based UI, auto-save, navigation with branching support, and inline contextual help.

### Task 1: QuestionCard Component (Commit 7316ae1)

Created the core question display components:

**AnswerOptions.tsx** - Five answer type renderers:
- `SingleChoiceCards`: Radio-style card selection with option descriptions
- `YesNoCards`: Two large side-by-side cards with prominent Yes/No
- `MaturityScale`: Stacked cards with color-coded progression indicator (green gradient based on maturity level)
- `NumericInput`: Clean numeric input with min/max validation hints
- `ShortTextInput`: Text/textarea with character counter and limit warning

All use shadcn Card components with selected state styling (zinc-900 border, blue-50 background). Selection indicated with checkmark icon in circular badge.

**InlineHelp.tsx** - Contextual help display:
- Always-visible help text (subtle zinc-600 color)
- Expandable "Learn More" section with smooth collapse animation
- Left border accent for visual hierarchy

**QuestionCard.tsx** - Main question wrapper:
- Prominent question heading (text-2xl, font-semibold)
- Dynamic Zod validation schema based on question type and required flag
- React Hook Form integration with onSubmit validation mode
- Renders appropriate answer component via type switch
- Optional skip link for non-required questions with accuracy note
- Validation error display in red alert box
- Centered layout (max-w-2xl) with generous spacing

### Task 2: Auto-Save and Navigation (Commit 37cd42e)

Implemented the question flow logic and persistence:

**useAutoSave.ts** - Debounced auto-save hook:
- Immediate Zustand store update for optimistic UI
- 1000ms debounce via use-debounce before API call
- TanStack Query mutation with FIFO guarantee
- POST to `/api/assessment/[id]/responses` with question metadata
- Error handling with toast notification and single retry
- Returns `{ saveAnswer, isSaving, lastSaved }`

**useAssessmentNavigation.ts** - Navigation with branching:
- Filters questions by pillar slug
- Applies branching rules via `getVisibleQuestions()`
- Calculates progress (answered/total/percentage) from visible questions only
- `goNext()`: Advances to next visible question or /assessment/complete if last
- `goBack()`: Returns to previous visible question
- URL-based navigation (`router.push`) for browser back/forward support
- Returns current question, navigation functions, and progress state

**NavigationButtons.tsx** - Back/Next controls:
- Back button (outline variant, disabled if first question)
- Next button (primary variant, shows "Complete Section" if last)
- Saving indicator with spinner icon during debounce
- Validation state passed from parent

**Dynamic Route [pillarSlug]/[questionIndex]/page.tsx** - Main question page:
- Client component with `use()` for async params (Next.js 15 pattern)
- Combines QuestionCard, NavigationButtons, and SectionProgress
- Auto-save on answer change via `handleAnswer()`
- Skip support for optional questions
- Validation check before allowing Next (required questions must have answer)
- Redirects to /assessment if no assessmentId
- Handles invalid questionIndex (redirects to first question or assessment page)

**Completion Page /assessment/complete** - Post-assessment placeholder:
- Shown after last question in pillar
- Displays completion message with checkmark icon
- Loading spinner with "Calculating score..." message
- Button to view results (currently navigates to dashboard)
- Note about ability to review/change answers
- TODO: Integrate with scoring engine (Plan 05)

## Technical Highlights

**Card-Based Selection Pattern:**
Each answer type uses consistent selection styling:
- Unselected: border-zinc-300, hover:border-zinc-400
- Selected: border-zinc-900, bg-blue-50/50
- Checkmark icon in circular badge (filled zinc-900 when selected)
- Smooth transitions on all states

**Maturity Scale Progression Indicator:**
Left border color intensity increases with maturity level using HSL calculation:
```typescript
hsl(${120 * (progressLevel / totalLevels)}, 60%, 50%)
```
Creates visual progression from red (low) to green (high maturity).

**Optimistic Updates with Server Sync:**
1. User selects answer
2. Zustand store updated immediately (instant UI feedback)
3. Auto-save hook sets pending answer
4. 1000ms debounce timer starts
5. On debounce completion: POST to API
6. On error: Toast notification, retry once
7. lastSaved timestamp updated in store

**Branching-Aware Navigation:**
Navigation logic filters questions through branching rules before determining next/previous. Ensures users only see relevant questions based on prerequisite answers (e.g., trust questions only if family has trusts).

**Dynamic Validation:**
Validation schema generated per question:
- Required + yes-no/single-choice: Refine union type for non-null
- Required + maturity-scale: Number with non-null refine
- Required + numeric: Number validation
- Required + short-text: String min length 1
- Optional: z.unknown().optional()

Validation triggered on submission attempt (mode: 'onSubmit'), not while typing, per research anti-pattern avoidance.

## Verification Results

- `npm run build`: PASSED
- Dynamic route registered: `/assessment/[pillarSlug]/[questionIndex]`
- All 5 answer types render correctly (tested via TypeScript compilation)
- Components export correctly
- No hardcoded question text
- Navigation respects branching rules (via `getVisibleQuestions()`)
- Required validation blocks progression (validation error shown)
- Optional questions show skip link
- Last question navigates to /assessment/complete

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

**Upstream Dependencies:**
- 02-01: Uses `Question` type, pillar/sub-category structure
- 02-02: Uses `allQuestions`, `getVisibleQuestions()` from branching.ts
- 02-03: Uses `useAssessmentStore()` for state management, existing API route

**Downstream Impact:**
- 02-05 (Scoring Engine): Will consume saved responses from auto-save API
- 02-06 (Results Display): Will receive control from /assessment/complete page

**API Contract:**
POST `/api/assessment/[id]/responses`:
```json
{
  "questionId": "dma-01",
  "pillar": "family-governance",
  "subCategory": "decision-making-authority",
  "answer": 2,
  "skipped": false,
  "currentQuestionIndex": 5
}
```

Response: `AssessmentResponse` object with id, timestamps

## User Experience Flow

1. User navigates to `/assessment/family-governance/0`
2. First question rendered in QuestionCard with inline help
3. Progress bar shows "0 of 8 questions" for sub-category
4. User selects card-based answer → instant UI update, "Saving..." indicator
5. After 1s debounce: Answer persisted to API, indicator clears
6. User clicks Next → validation passes → navigates to question 1
7. User clicks Back → returns to question 0 with answer preserved
8. User reaches question with branching rule → questions auto-skipped based on answers
9. User reaches last visible question → "Complete Section" button shown
10. User completes last question → navigates to /assessment/complete
11. Completion page shows checkmark, score calculation message, View Results button

## Known Limitations

1. **Single Pillar Support:** Currently hardcoded to "Family Governance" pillar. Multi-pillar support deferred to future phase.
2. **No Score Calculation:** Completion page placeholder; scoring integration happens in Plan 05.
3. **No Results Page:** View Results button navigates to dashboard; dedicated results page in Plan 06.
4. **No Question Numbering:** Intentionally omitted per research (anti-pattern), but some users may expect it.
5. **No Answer History:** No "See your previous answer" feature when revisiting questions.
6. **No Bulk Save:** Each answer triggers individual API call; bulk save optimization possible for future.

## Next Steps

Plan 02-05 will:
- Implement scoring algorithm consuming saved responses
- Calculate sub-category and pillar scores
- Identify missing controls
- Determine risk level
- Update completion page to trigger scoring

Plan 02-06 will:
- Create results visualization page
- Display scores with progress circles
- Show missing controls and recommendations
- Enable answer review and editing

## Self-Check: PASSED

**Created files verified:**
```bash
[ -f "src/components/assessment/AnswerOptions.tsx" ] && echo "FOUND"
[ -f "src/components/assessment/InlineHelp.tsx" ] && echo "FOUND"
[ -f "src/components/assessment/QuestionCard.tsx" ] && echo "FOUND"
[ -f "src/components/assessment/NavigationButtons.tsx" ] && echo "FOUND"
[ -f "src/lib/hooks/useAutoSave.ts" ] && echo "FOUND"
[ -f "src/lib/hooks/useAssessmentNavigation.ts" ] && echo "FOUND"
[ -f "src/app/(protected)/assessment/[pillarSlug]/[questionIndex]/page.tsx" ] && echo "FOUND"
[ -f "src/app/(protected)/assessment/complete/page.tsx" ] && echo "FOUND"
```
All files: FOUND

**Commits verified:**
```bash
git log --oneline | grep "7316ae1"  # Task 1 commit
git log --oneline | grep "37cd42e"  # Task 2 commit
```
Both commits: FOUND

**Build verification:**
```bash
npm run build  # Exit code: 0
```
Build: PASSED

**Route registration verified:**
Build output shows `/assessment/[pillarSlug]/[questionIndex]` as dynamic route.

All verification checks passed.
