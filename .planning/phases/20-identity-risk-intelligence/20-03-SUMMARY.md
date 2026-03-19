---
phase: 20-identity-risk-intelligence
plan: 03
subsystem: advisor-portal
tags: [ai-recommendations, advisor-dashboard, identity-risk, threat-intelligence]
dependency-graph:
  requires: [20-01, 20-02]
  provides: [identity-recommendations-api, advisor-identity-dashboard]
  affects: [advisor-portal-navigation, recommendation-engine]
tech-stack:
  added: [openai-integration]
  patterns: [suspense-streaming, fallback-recommendations, risk-level-sorting]
key-files:
  created:
    - src/lib/identity-risk/recommendations.ts
    - src/app/api/identity-risk/recommendations/route.ts
    - src/app/(protected)/advisor/identity-risk/page.tsx
    - src/app/(protected)/advisor/identity-risk/loading.tsx
  modified:
    - src/lib/actions/advisor-actions.ts
    - src/app/(protected)/advisor/page.tsx
decisions:
  - "AI model selection: gpt-4o-mini for cost-effective structured recommendations matching cyber risk approach"
  - "Fallback system: Four static recommendation categories covering all identity risk subcategories"
  - "Caching strategy: Recommendations stored in PillarScore.missingControls JSON field with generation timestamp"
  - "Navigation placement: Identity Risk card positioned after Cyber Risk in advisor portal for logical risk progression"
metrics:
  duration: 249
  tasks-completed: 2
  files-created: 4
  files-modified: 2
  completed-date: 2026-03-19T15:17:51Z
---

# Phase 20 Plan 03: Threat Intelligence Integration Summary

AI-powered identity risk recommendations with advisor dashboard and OpenAI integration

## Objective Completion

**Goal:** Create AI-powered identity risk recommendations and dedicated advisor portal section for client identity risk oversight.

**Status:** ✅ Complete - Identity risk recommendations with AI integration and advisor dashboard established

## Task Execution

### Task 1: AI identity risk recommendation engine and API
- **Status:** ✅ Complete
- **Commit:** 4e83bb6
- **Files:** `src/lib/identity-risk/recommendations.ts`, `src/app/api/identity-risk/recommendations/route.ts`
- **Output:**
  - `generateIdentityRecommendations` function with OpenAI integration using gpt-4o-mini model
  - Structured prompts targeting social media privacy hardening, public information removal, digital footprint reduction, family visibility management
  - Comprehensive fallback system with static recommendations for all four subcategories (social-exposure, public-information, digital-footprint, family-visibility)
  - POST/GET API endpoints with authentication, ownership verification, and caching in PillarScore.missingControls

### Task 2: Advisor identity risk dashboard
- **Status:** ✅ Complete
- **Commit:** f851fab
- **Files:** Dashboard page, loading skeleton, server action, portal navigation
- **Output:**
  - `getIdentityRiskDashboardData` server action following cyber risk pattern
  - `/advisor/identity-risk` dashboard with portfolio metrics and client table
  - Suspense-enabled streaming with risk level sorting (critical → high → medium → low → unassessed)
  - UserSearch (Fingerprint) icon for visual identity risk distinction
  - Identity Risk navigation card added to advisor portal

## Deviations from Plan

None - plan executed exactly as written.

## Key Technical Decisions

**AI Recommendation Engine:**
- **Model Selection:** gpt-4o-mini chosen for consistency with cyber risk implementation and cost efficiency
- **System Prompt:** Positioned as "identity protection and privacy advisor for high-net-worth families" with focus on practical weekly-implementable steps
- **Fallback Mapping:** Four core categories with specific actionable recommendations covering social exposure, public information removal, digital footprint management, and family visibility controls

**Advisor Dashboard Architecture:**
- **Data Model:** Separate IdentityRiskClient and IdentityRiskMetrics types following cyber risk pattern
- **Metrics:** Total clients, assessed count, average score, at-risk count (HIGH/CRITICAL risk levels)
- **Navigation Placement:** Identity Risk positioned after Cyber Risk card for logical risk pillar progression

## Integration Points

**Frontend Integration:**
- Advisor portal navigation updated with UserSearch icon link to identity risk dashboard
- Suspense boundaries for streaming server components with loading skeletons
- Risk level badge styling consistent with cyber risk implementation

**Backend Integration:**
- Server action follows established advisor-actions.ts patterns with requireAdvisorRole and profile verification
- Database queries filter by 'identity-risk' pillar following cyber risk data access patterns
- Recommendation caching uses existing PillarScore.missingControls JSON structure

## Verification Results

- ✅ TypeScript compilation: Zero errors
- ✅ Next.js build: All routes generated successfully
- ✅ API endpoints: POST/GET for recommendation generation and retrieval
- ✅ Dashboard routing: `/advisor/identity-risk` accessible with loading states
- ✅ Navigation: Identity Risk card appears in advisor portal
- ✅ Fallback system: Four subcategories covered with actionable recommendations

## Success Criteria Assessment

- ✅ **AI-powered recommendations:** System generates identity risk recommendations from assessment results with OpenAI integration
- ✅ **Graceful fallbacks:** Static recommendations work without OpenAI API key covering all identity risk areas
- ✅ **Advisor visibility:** Dedicated portal section shows client identity risk scores with portfolio metrics
- ✅ **Portal navigation:** Identity Risk link integrated into advisor portal navigation
- ✅ **Build success:** Full application builds without errors

## Files Delivered

**Core Engine:**
- `src/lib/identity-risk/recommendations.ts` - AI recommendation engine with fallback system
- `src/app/api/identity-risk/recommendations/route.ts` - REST API for recommendation generation/retrieval

**Advisor Dashboard:**
- `src/app/(protected)/advisor/identity-risk/page.tsx` - Portfolio dashboard with metrics and client table
- `src/app/(protected)/advisor/identity-risk/loading.tsx` - Suspense loading skeleton
- `src/lib/actions/advisor-actions.ts` - Updated with getIdentityRiskDashboardData server action
- `src/app/(protected)/advisor/page.tsx` - Updated with Identity Risk navigation card

## Self-Check: PASSED

✅ All created files exist and compile
✅ All commits verified in git history
✅ Build generates routes successfully
✅ TypeScript validation passes