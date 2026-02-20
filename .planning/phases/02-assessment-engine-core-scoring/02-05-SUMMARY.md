---
phase: 02-assessment-engine-core-scoring
plan: 05
subsystem: assessment-results
tags: [scoring, results-display, risk-analysis, action-plan]

dependency_graph:
  requires:
    - 02-04 (question flow UI)
    - 02-02 (scoring engine)
    - 02-01 (database schema)
  provides:
    - score-calculation-api
    - results-visualization
    - risk-driver-identification
    - action-plan-generation
  affects:
    - assessment-completion-flow
    - user-value-delivery

tech_stack:
  added:
    - date-fns (date formatting)
  patterns:
    - hierarchical-weighted-scoring
    - progressive-score-visualization
    - risk-based-recommendations

key_files:
  created:
    - src/app/api/assessment/[id]/score/route.ts
    - src/app/(protected)/assessment/results/page.tsx
    - src/components/assessment/ScoreDisplay.tsx
    - src/components/assessment/RiskDrivers.tsx
    - src/components/assessment/ActionPlan.tsx
  modified:
    - src/components/ui/progress.tsx

decisions:
  - summary: "50% minimum completion threshold for scoring"
    rationale: "Prevents misleading scores from insufficient data. Better to block scoring than give false confidence from limited answers."
  - summary: "Exclude unanswered questions from calculations (never default to low risk)"
    rationale: "Unanswered questions represent unknown risk, not low risk. Defaulting to safe scores would create false sense of security."
  - summary: "Hide weights and formulas from UI, show only category scores"
    rationale: "Professional advisory tone requires transparency about structure without overwhelming users with technical scoring details."
  - summary: "Professional advisory tone throughout (no gamification or flashy visualizations)"
    rationale: "Family governance is serious business. Clean numeric scores and severity bars provide clarity without trivialization."
  - summary: "Enhanced Progress component with indicatorClassName prop"
    rationale: "Required for color-coded severity visualization. Essential for correct risk communication."

metrics:
  duration_minutes: 3.5
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
  commits: 2
---

# Phase 02 Plan 05: Scoring Engine Integration and Results Display Summary

**One-liner:** Score calculation API with weighted hierarchical scoring, results page displaying numeric score with severity bar, ranked risk drivers, and prioritized action plan with effort/ownership guidance.

## What Was Built

### Score Calculation API (`/api/assessment/[id]/score`)

**POST Endpoint (Calculate Score):**
- Loads all assessment responses (excludes skipped questions)
- Enforces 50% minimum completion threshold
- Converts responses to answers map
- Calls `calculatePillarScore()` from scoring.ts
- Identifies top 5 missing controls by severity
- Upserts PillarScore record with breakdown and recommendations
- Updates Assessment status to COMPLETED with timestamp
- Returns score, risk level, breakdown, missing controls, and completion date

**GET Endpoint (Retrieve Cached Score):**
- Loads existing PillarScore for assessment
- Returns cached score data (no recalculation)
- Returns 404 if no score exists yet

**Error Handling:**
- 401 for unauthenticated requests
- 403 for non-owner access
- 404 for missing assessment or score
- 400 for incomplete assessments (< 50% answered) with clear message explaining threshold

### Results Page (`/assessment/results`)

**Layout:**
- Professional header with completion timestamp
- Score display card (numeric score, risk level, severity bar, category breakdown)
- Risk drivers card (ranked missing controls with explanations)
- Action plan card (prioritized recommendations with effort/ownership)
- Navigation buttons (review answers, return to dashboard)

**Behavior:**
- Reads assessmentId from Zustand store
- Redirects to /assessment if no assessmentId
- Fetches score from GET endpoint
- If 404, triggers POST to calculate score, then re-fetches
- If 400 (incomplete), displays error with completion guidance
- Marks pillar as complete in Zustand store
- Loading state with spinner during calculation

### Score Visualization Components

**ScoreDisplay:**
- Large numeric score (5xl font) with " / 10" suffix
- Risk level badge (LOW green, MEDIUM amber, HIGH orange, CRITICAL red)
- Horizontal severity bar (shadcn Progress component) colored by risk level
- Completion note if < 100% answered (subtle, not alarming)
- Category breakdown section: one row per sub-category with name, score bar, and value
- **No weights or formulas visible** (transparency about structure, not math)

**RiskDrivers:**
- Contextual intro sentence based on risk level
- Ordered list of top 5 missing controls
- Each control shows: category name, description, severity badge
- Positive message if no missing controls identified
- Professional advisory tone (e.g., "Areas Requiring Attention" not "Your Mistakes")

**ActionPlan:**
- Prioritized recommendations derived from missing controls
- Each action card includes:
  - Action title (from MissingControl.recommendation)
  - Category it addresses
  - Priority badge (High/Medium/Low based on severity)
  - Effort indicator: Quick Win (days), Standard (weeks), Strategic (months)
  - Ownership suggestion: Family Council, Legal Advisor, Financial Advisor, etc.
- Footer note: "Consult with your advisors for implementation guidance"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added indicatorClassName prop to Progress component**
- **Found during:** Task 2 (ScoreDisplay implementation)
- **Issue:** shadcn Progress component didn't support custom indicator colors, required for severity visualization
- **Fix:** Enhanced Progress component with optional `indicatorClassName` prop to support color-coded risk levels
- **Files modified:** `src/components/ui/progress.tsx`
- **Commit:** d245343
- **Rationale:** Essential for correct risk communication. Without color-coded severity bars, users lose critical visual cue about risk level. This is a correctness requirement, not a feature enhancement.

## Verification Results

All verification criteria met:

- [x] `npm run build` passes clean
- [x] Score API calculates and persists pillar scores
- [x] Score excludes unanswered questions (never defaults to low risk)
- [x] Incomplete assessments (<50% answered) rejected with clear message
- [x] Results page shows score, risk level, severity bar, category breakdown
- [x] Missing controls identified and ranked by severity (top 5)
- [x] Action plan provides specific recommendations with priority/effort/ownership
- [x] No formulas, weights, or technical details exposed to user
- [x] Professional advisory tone throughout (not survey results or game scores)

## Technical Notes

**Risk Level Mapping:**
- TypeScript types use lowercase strings ("low", "medium", "high", "critical")
- Prisma enums use uppercase ("LOW", "MEDIUM", "HIGH", "CRITICAL")
- `mapRiskLevelToPrisma()` function handles conversion

**Score Thresholds:**
- LOW: score >= 7.5
- MEDIUM: score >= 5.0
- HIGH: score >= 2.5
- CRITICAL: score < 2.5

**Missing Control Identification:**
- Questions with answer score <= 2 (out of 10) flagged as missing controls
- Severity calculated as: weight * (10 - score)
- Thresholds: high (>= 30), medium (>= 15), low (< 15)
- Sorted by severity score, top 5 returned

**Effort Derivation:**
- High severity = Strategic (months)
- Medium severity = Standard (weeks)
- Low severity = Quick Win (days)

**Ownership Derivation:**
- Decision-making/authority → Family Council
- Access/distributions → Financial Advisor
- Trusts/legal → Legal Advisor
- Documentation/records → Family Office
- Behavior/standards → Family Council
- Succession/transition → Family Council & Advisors
- Business → Board of Directors

## Key Decisions

1. **50% minimum completion threshold:** Prevents misleading scores from insufficient data
2. **Exclude unanswered questions:** Unknown risk is not low risk
3. **Hide scoring formulas:** Professional advisory tone requires clarity without overwhelming detail
4. **Professional tone throughout:** Family governance is serious, not a game
5. **Enhanced Progress component:** Required for color-coded severity visualization

## Self-Check: PASSED

**Created files exist:**
```
FOUND: src/app/api/assessment/[id]/score/route.ts
FOUND: src/app/(protected)/assessment/results/page.tsx
FOUND: src/components/assessment/ScoreDisplay.tsx
FOUND: src/components/assessment/RiskDrivers.tsx
FOUND: src/components/assessment/ActionPlan.tsx
```

**Modified files exist:**
```
FOUND: src/components/ui/progress.tsx
```

**Commits exist:**
```
FOUND: 2b93f5b (feat(02-05): implement score calculation API endpoint)
FOUND: d245343 (feat(02-05): implement assessment results page with score visualization)
```

**Build verification:**
```
✓ Compiled successfully
```

## Impact

**User Value Delivery:**
- Primary value proposition realized: users complete assessment to see **actionable risk intelligence**
- Scores revealed only after completing pillar (per user decision)
- Clear next steps provided via prioritized action plan
- Risk drivers explained in plain language

**Architecture:**
- Score calculation logic centralized in scoring.ts (reusable for future pillars)
- Results page pattern established for other pillar types
- API follows established authentication and ownership patterns
- Professional tone and advisory approach set standard for all future results pages

**Next Steps:**
- Phase 02-06: Integration testing and user flow validation
- Phase 03: Branching logic for conditional sections (trust/business/succession)
- Phase 04: Policy templates based on missing controls
