---
phase: 06-assessment-integration
plan: 02
subsystem: assessment-personalization-ui
tags: [react-hooks, personalization, user-experience, assessment-flow]
dependency_graph:
  requires: ["06-01-personalization-engine"]
  provides: ["assessment-ui-personalization"]
  affects: ["assessment-flow", "user-experience"]
tech_stack:
  added: ["@tanstack/react-query", "useHouseholdProfile-hook"]
  patterns: ["react-hooks", "prop-drilling-personalization", "backward-compatibility"]
key_files:
  created:
    - "src/lib/hooks/useHouseholdProfile.ts"
  modified:
    - "src/lib/actions/profile-actions.ts"
    - "src/lib/assessment/store.ts"
    - "src/lib/assessment/questions.ts"
    - "src/components/assessment/QuestionCard.tsx"
    - "src/app/(protected)/assessment/[pillarSlug]/[questionIndex]/page.tsx"
    - "src/app/(protected)/assessment/page.tsx"
    - "src/lib/hooks/useAssessmentNavigation.ts"
decisions:
  - "Profile data cached for 5 minutes via TanStack Query for assessment session duration"
  - "Personalized text passed as separate prop to QuestionCard for clean separation of concerns"
  - "Profile stored in Zustand store but excluded from persistence (fetched fresh each session)"
  - "Backward compatibility maintained through null profile handling in all branching functions"
metrics:
  duration_minutes: 5
  tasks_completed: 2
  files_created: 1
  files_modified: 7
  commits_made: 2
  lines_added: ~100
  completed_date: "2026-03-13"
---

# Phase 6 Plan 2: Assessment UI Personalization Summary

**One-liner:** Complete assessment personalization by wiring household profiles into React component tree with graceful fallbacks

## What Was Built

Connected the personalization engine from Plan 1 to the assessment UI flow, enabling users to see personalized question text that references their household members by name and experience profile-aware question branching.

### Core Deliverables

**1. Household Profile React Hook**
- Created `useHouseholdProfile` hook using TanStack Query
- Fetches household members and transforms to `HouseholdProfile` type
- 5-minute cache duration optimized for assessment session length
- Graceful null handling when no household members exist

**2. Assessment Store Profile Integration**
- Added `householdProfile` field to assessment store state
- Excluded from localStorage persistence (fetched fresh each session)
- Updated orphaned answer detection to use profile for branching calculations
- Added setter for profile updates during navigation

**3. Personalized Question Display**
- Added optional `personalizedText` prop to QuestionCard component
- Question page computes personalized text via `getPersonalizedText()`
- Falls back to generic question text when profile is null
- Minimal UI changes maintain existing design consistency

**4. Profile-Aware Navigation**
- Updated assessment navigation hook to use household profile
- Question visibility calculations include profile-based conditions
- Hub page question counts reflect personalized branching logic
- Smart resume functionality works with profile-filtered questions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed null profile handling in textTemplate functions**
- **Found during:** Task 1 TypeScript validation
- **Issue:** textTemplate functions called helper functions like `getMembersByRole(p, 'ROLE')` where `p` could be null, causing type errors
- **Fix:** Added null checks at start of textTemplate functions to return fallback text before calling helper functions
- **Files modified:** src/lib/assessment/questions.ts (2 functions)
- **Commit:** 9906568

## Technical Implementation

**Integration Pattern**
```typescript
// Profile hook in question page
const { profile } = useHouseholdProfile();

// Store in assessment state
useEffect(() => {
  setHouseholdProfile(profile);
}, [profile, setHouseholdProfile]);

// Personalized text computation
const personalizedText = currentQuestion
  ? getPersonalizedText(currentQuestion, profile)
  : undefined;

// Component prop passing
<QuestionCard personalizedText={personalizedText} ... />
```

**Backward Compatibility Strategy**
- All profile parameters optional in branching functions
- Null profile = show all questions with generic text
- Existing assessments without profiles work identically to v1.0
- No breaking changes to component interfaces

**Performance Considerations**
- Profile fetched once per session and cached
- Non-blocking load (questions show generic text then update)
- Profile excluded from localStorage (prevents stale data issues)
- Minimal re-renders through proper dependency arrays

## Quality Verification

**Type Safety:** ✅ All TypeScript compilation clean (excluding pre-existing ProfileForm issues)
**Test Coverage:** ✅ All assessment tests passing (68/68 core tests)
**Backward Compatibility:** ✅ Users without profiles see identical v1.0 behavior
**Performance:** ✅ Profile loading non-blocking, cached appropriately
**Integration:** ✅ Personalization and branching working together seamlessly

## User Experience Impact

**With Household Profiles:**
- Questions reference family members by name ("How prepared is John Smith for leadership responsibility?")
- Questions filter based on household composition (succession questions only show if successors exist)
- Assessment feels tailored to specific family structure

**Without Household Profiles:**
- Generic question text maintained ("How prepared is your primary successor for leadership responsibility?")
- All questions shown (no filtering)
- Identical experience to v1.0 baseline

## Success Criteria Validation

- ✅ Users with household profiles see member names in question text
- ✅ Questions filter based on household composition (succession, trustee questions)
- ✅ Users without profiles experience unchanged assessment flow
- ✅ Profile data fetched once per session and cached
- ✅ No regressions in auto-save, navigation, or scoring

## Self-Check: PASSED

**Files exist:**
- ✅ src/lib/hooks/useHouseholdProfile.ts
- ✅ Modified assessment store with householdProfile field
- ✅ Modified QuestionCard with personalizedText prop
- ✅ Updated question page with personalization logic

**Commits exist:**
- ✅ 9906568: Task 1 (useHouseholdProfile hook and store integration)
- ✅ fac6467: Task 2 (UI wiring and personalization display)

**Integration verified:**
- ✅ Profile hook fetches data successfully
- ✅ Personalized text computed correctly
- ✅ Branching uses profile data appropriately
- ✅ Backward compatibility maintained