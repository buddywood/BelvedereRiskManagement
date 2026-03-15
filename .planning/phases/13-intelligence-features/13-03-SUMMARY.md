---
phase: 13
plan: 03
subsystem: intelligence
tags: ["risk-detail", "drill-down", "assessment-responses", "recommendations"]
dependency-graph:
  requires: ["13-02-intelligence-dashboard", "analytics-queries", "advisor-auth"]
  provides: ["family-risk-detail", "assessment-response-access", "governance-recommendations"]
  affects: ["intelligence-navigation", "advisor-workflow"]
tech-stack:
  added: ["collapsible-ui", "assessment-response-mapping"]
  patterns: ["drill-down-navigation", "risk-recommendation-mapping", "response-detail-display"]
key-files:
  created:
    - "src/components/intelligence/FamilyRiskCard.tsx"
    - "src/components/intelligence/RiskDetailPanel.tsx"
    - "src/app/(protected)/advisor/intelligence/[familyId]/page.tsx"
    - "src/app/(protected)/advisor/intelligence/[familyId]/loading.tsx"
  modified:
    - "src/lib/intelligence/types.ts"
    - "src/lib/intelligence/queries.ts"
    - "src/lib/actions/advisor-actions.ts"
decisions:
  - "RISK_RECOMMENDATIONS constant for governance best practices (8 categories x 2-3 recommendations each)"
  - "Collapsible assessment responses section for INTEL-04 drill-down requirement"
  - "Priority adjustment based on risk severity (critical=high, moderate=medium, low=low)"
  - "Grid layout on desktop (3 columns) for risk card comparison"
metrics:
  duration: "5min"
  completed: "2026-03-15T04:23:00Z"
---

# Phase 13 Plan 03: Family Risk Detail Page Summary

Family risk drill-down page with detailed governance recommendations and underlying assessment response access (INTEL-04).

## What Was Built

**Risk Detail Query System:**
- Extended intelligence types with RiskRecommendation, AssessmentResponseDetail, and RiskDetail interfaces
- Added RISK_RECOMMENDATIONS constant mapping 8 governance categories to 2-3 actionable best practices each
- Implemented getRiskDetailForFamily query with AssessmentResponse table integration for INTEL-04 requirement
- Added getFamilyRiskDetailData server action with advisor authentication

**Risk Drill-Down Components:**
- FamilyRiskCard with risk scores, severity badges, governance recommendations, and collapsible assessment responses
- RiskDetailPanel with family summary header, overall score display, and responsive grid layout
- Assessment Details section showing actual question responses that contributed to risk scores
- Priority indicators (colored dots) for recommendation urgency based on risk severity

**Dynamic Route Implementation:**
- /advisor/intelligence/[familyId] page with hero section and back navigation to intelligence portal
- Loading skeleton matching card structure with animated placeholders
- Cross-navigation links to full analytics page for deeper investigation
- Suspense-wrapped server component following existing analytics page pattern

## Key Features Delivered

**INTEL-01 (Top 3 Risks Detail):** Risk cards show governance category scores with severity classification and pillar weights for context.

**INTEL-04 (Assessment Response Access):** Collapsible "Assessment Details" section displays underlying assessment responses filtered by pillar, including question answers, sub-categories, and skip status.

**Governance Recommendations:** Static best-practice recommendations mapped to each governance category with priority adjustment based on risk severity:
- Decision Making Authority: Formal frameworks, authority levels, family council voting
- Trust Estate Governance: Document review, succession planning, trust protector roles
- Succession Planning: Timeline creation, leadership development, transition procedures
- Behavior Standards: Values codification, violation consequences
- Plus 4 additional categories with targeted governance improvements

## Verification Results

- ✅ TypeScript compilation passes with zero errors
- ✅ Next.js build succeeds with new /advisor/intelligence/[familyId] route registered
- ✅ FamilyRiskCard renders assessment responses section with collapsible UI
- ✅ Assessment responses query includes prisma.assessmentResponse.findMany for each risk pillar
- ✅ Cross-navigation implemented between intelligence portal, risk detail, and full analytics
- ✅ All must-have artifacts created with minimum line requirements exceeded

## Navigation Flow

1. **Advisor Intelligence Portal** → Click family risk indicator
2. **Family Risk Detail Page** → View top 3 risks with recommendations + assessment details
3. **Cross-Navigation** → "View Full Analytics" link to deeper trend analysis
4. **Back Navigation** → Return to intelligence portfolio overview

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

**Files created:**
- FOUND: src/components/intelligence/FamilyRiskCard.tsx
- FOUND: src/components/intelligence/RiskDetailPanel.tsx
- FOUND: src/app/(protected)/advisor/intelligence/[familyId]/page.tsx
- FOUND: src/app/(protected)/advisor/intelligence/[familyId]/loading.tsx

**Commits verified:**
- FOUND: 69d0787 (Task 1: risk detail query)
- FOUND: 67394f6 (Task 2: drill-down page components)

**Integration points verified:**
- FOUND: getRiskDetailForFamily exported from queries.ts
- FOUND: getFamilyRiskDetailData exported from advisor-actions.ts
- FOUND: Assessment response mapping in FamilyRiskCard component
- FOUND: Link navigation pattern from PortfolioRiskList to [familyId] route