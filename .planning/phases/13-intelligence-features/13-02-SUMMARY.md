---
phase: 13-intelligence-features
plan: 02
subsystem: intelligence
tags: [portfolio-intelligence, risk-dashboard, advisor-ui]
requires: [risk-identification-types, portfolio-risk-queries, intelligence-server-actions]
provides: [intelligence-dashboard, portfolio-risk-ui, risk-visualization]
affects: [advisor-navigation, dashboard-navigation]
tech-stack:
  added: []
  patterns: [suspense-streaming, responsive-layouts, risk-severity-visualization]
key-files:
  created:
    - src/components/intelligence/RiskSummaryCard.tsx
    - src/components/intelligence/PortfolioRiskList.tsx
    - src/components/intelligence/RiskDistributionChart.tsx
    - src/app/(protected)/advisor/intelligence/page.tsx
    - src/app/(protected)/advisor/intelligence/loading.tsx
  modified:
    - src/app/(protected)/advisor/dashboard/page.tsx
    - src/components/layout/ProtectedNav.tsx
decisions:
  - Used warning variant for critical severity badges instead of destructive (not available)
  - Added color-coded risk intensity visualization in horizontal bar chart
  - Integrated intelligence navigation into both dashboard page and main advisor nav
metrics:
  duration: "3min"
  completed: "2026-03-15T04:13:38Z"
---

# Phase 13 Plan 02: Intelligence Dashboard UI Summary

**One-liner:** Complete intelligence dashboard UI with portfolio risk overview, prioritized risk list with drill-down navigation, and category distribution visualization accessible from advisor navigation.

## Objectives Achieved

Built the complete intelligence dashboard interface delivering:

- Portfolio-wide risk summary metrics showing families at risk and critical issue counts (INTEL-02)
- Prioritized list of governance risk indicators across the portfolio with severity classification (INTEL-02)
- Specific governance area indicators with category names and drill-down navigation (INTEL-03)
- Risk distribution visualization showing count by governance category
- Full navigation integration from dashboard and main advisor nav

## Tasks Completed

### Task 1: Create intelligence UI components
**Files:** `src/components/intelligence/RiskSummaryCard.tsx`, `src/components/intelligence/PortfolioRiskList.tsx`, `src/components/intelligence/RiskDistributionChart.tsx`
**Commit:** 12b3e35

Created three client components following established UI patterns:

**RiskSummaryCard**: Portfolio metrics in stat card format
- Total families, families at risk, critical issues, total risk indicators
- Destructive text color for risk counts when > 0
- Grid layout responsive to screen size

**PortfolioRiskList**: Table-style risk indicator list
- Family name with drill-down links to `/advisor/intelligence/{familyId}`
- Category names (Decision-Making, Succession Planning, etc.)
- Risk scores with 1 decimal precision display
- Severity badges with color-coded variants (critical=warning+red, moderate=outline+amber, low=secondary)
- Top 20 risks displayed with count indicator for overflow

**RiskDistributionChart**: Horizontal bar chart using Recharts
- Risk count by governance category using CATEGORY_LABELS
- Color intensity based on risk count (red=high, orange=moderate, blue=low)
- Wrapped in ChartContainer for consistent styling
- Empty state for zero risk scenarios

### Task 2: Create intelligence page with navigation integration
**Files:** `src/app/(protected)/advisor/intelligence/page.tsx`, `src/app/(protected)/advisor/intelligence/loading.tsx`, `src/app/(protected)/advisor/dashboard/page.tsx`, `src/components/layout/ProtectedNav.tsx`
**Commit:** f92a903

**Intelligence Page**: Full-featured dashboard following existing patterns
- Hero section with "Risk Intelligence" title and governance intelligence kicker
- Suspense streaming with IntelligenceContent component
- Error and empty state handling for no assessment data
- Three-section layout: summary cards, risk list (2/3 width), distribution chart (1/3 width)
- Back to Dashboard navigation link with ArrowLeft icon

**Loading Skeleton**: Progressive enhancement support
- Animated pulse placeholders for summary cards
- Grid layout matching actual content structure
- Table-style skeleton for risk list area

**Navigation Integration**:
- Dashboard page: Added subtle Risk Intelligence link with Shield icon
- Main advisor nav: Added "/advisor/intelligence" with "Risk Intelligence" label

## Technical Implementation

**UI Architecture**: Client components consuming intelligence types and server actions
**Layout Pattern**: Responsive grid (full width mobile, side-by-side lg+ screens)
**Streaming**: Suspense boundary for data-dependent content with progressive loading
**Navigation**: Consistent with existing advisor portal patterns

**Risk Severity Visualization**:
- Critical: Warning badge variant with red background override
- Moderate: Outline variant with amber border and text
- Low: Secondary variant default styling

**Chart Implementation**: Recharts horizontal BarChart with:
- Category labels from analytics formatters
- Dynamic color intensity based on risk count distribution
- Responsive container following ChartContainer patterns

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

✅ TypeScript compilation passes with zero errors
✅ npm run build succeeds
✅ `/advisor/intelligence` route exists and renders
✅ Intelligence page uses Suspense streaming pattern
✅ PortfolioRiskList links to `/advisor/intelligence/{familyId}` for drill-down
✅ Navigation to intelligence exists from dashboard page and main nav
✅ Risk severity badges use correct variants (warning for critical with red styling)

## Self-Check: PASSED

**Created files verified:**
- FOUND: src/components/intelligence/RiskSummaryCard.tsx
- FOUND: src/components/intelligence/PortfolioRiskList.tsx
- FOUND: src/components/intelligence/RiskDistributionChart.tsx
- FOUND: src/app/(protected)/advisor/intelligence/page.tsx
- FOUND: src/app/(protected)/advisor/intelligence/loading.tsx

**Modified files verified:**
- FOUND: src/app/(protected)/advisor/dashboard/page.tsx
- FOUND: src/components/layout/ProtectedNav.tsx

**Commits verified:**
- FOUND: 12b3e35
- FOUND: f92a903

## Next Steps

Phase 13-03 should implement the individual family risk detail page accessible via drill-down links from the portfolio risk list, providing per-family risk analysis and governance recommendations.