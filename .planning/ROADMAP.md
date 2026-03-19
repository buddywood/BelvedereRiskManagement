# Roadmap: v1.5 Cyber Risk Intelligence

**Goal:** Expand beyond family governance into comprehensive family risk intelligence by adding cyber risk as a distinct, independently-scored pillar that feeds into a unified risk profile.

**Phases:** 4
**Depth:** Quick
**Coverage:** 9/9 requirements mapped ✓

## Overview

Builds cyber risk assessment capabilities as parallel pillar alongside existing governance system. Maintains strict domain separation while enabling unified family risk profiles that give advisors holistic visibility into both governance and cyber security posture.

## Phase Structure

### Phase 19: Cyber Risk Foundation
**Dependencies:** None (builds on existing v1.4 platform)
**Requirements:** CYBER-01, CYBER-02, FINANCE-01, FINANCE-02
**Plans:** 3 plans

**Goal:** Establish independent cyber risk assessment with financial security evaluation

Plans:
- [ ] 19-01-PLAN.md -- Cyber risk question bank, types, and scoring wrapper
- [ ] 19-02-PLAN.md -- Multi-pillar assessment UI, question flow, and scoring API
- [ ] 19-03-PLAN.md -- AI recommendations engine and advisor cyber risk dashboard

**Success Criteria:**
1. Family can complete cyber risk assessment with numerical scoring (0-10 scale matching governance)
2. System generates automated cyber risk recommendations based on assessment results
3. Advisor can view client cyber risk scores in separate portal section
4. Assessment evaluates banking security practices and payment method risks with actionable feedback

### Phase 20: Identity Risk Intelligence
**Dependencies:** Phase 19 (cyber risk foundation)
**Requirements:** IDENTITY-01, IDENTITY-02
**Plans:** 3 plans

**Goal:** Enable comprehensive identity exposure monitoring and analysis

Plans:
- [ ] 20-01-PLAN.md -- Identity risk question bank, types, and scoring wrapper
- [ ] 20-02-PLAN.md -- Assessment UI integration for identity risk pillar
- [ ] 20-03-PLAN.md -- AI recommendations engine and advisor identity risk dashboard

**Success Criteria:**
1. System analyzes family member social media exposure and assigns risk scores
2. Family receives public information visibility assessment with privacy recommendations
3. Advisor dashboard displays identity risk metrics alongside existing governance analytics
4. Platform identifies specific identity exposure gaps and generates remediation steps

### Phase 21: Unified Risk Intelligence
**Dependencies:** Phase 20 (identity assessment complete)
**Requirements:** UNIFIED-01, UNIFIED-02

**Goal:** Combine governance and cyber risk into holistic family risk profiles

**Success Criteria:**
1. Advisor dashboard shows combined risk profile with weighted composite scoring (governance + cyber)
2. Platform displays individual pillar scores and highlights risk domain interactions
3. Family dashboard shows unified risk view with both governance and cyber metrics
4. Advisor can create action plans that address both governance and cyber risk domains

### Phase 22: Advanced Reporting
**Dependencies:** Phase 21 (unified scoring complete)
**Requirements:** REPORT-01

**Goal:** Deliver comprehensive risk reporting with client-friendly cyber insights

**Success Criteria:**
1. Advisor can generate unified risk reports combining governance and cyber risk insights
2. PDF reports include client-friendly cyber risk explanations and action steps
3. Reports show risk domain interactions and compounding effects
4. Automated report generation maintains existing branded template system

## Progress Tracking

| Phase | Status | Plans | Tasks | Completion |
|-------|--------|-------|-------|------------|
| 19 - Cyber Foundation | Planned | 0/3 | 0/7 | ░░░░░░░░░░ 0% |
| 20 - Identity Intelligence | Planned | 0/3 | 0/6 | ░░░░░░░░░░ 0% |
| 21 - Unified Intelligence | Pending | 0/0 | 0/0 | ░░░░░░░░░░ 0% |
| 22 - Advanced Reporting | Pending | 0/0 | 0/0 | ░░░░░░░░░░ 0% |

**Overall:** ░░░░░░░░░░ 0% (0/4 phases complete)

## Architecture Notes

**Domain Separation:** Cyber risk runs as parallel pillar to governance, preventing data model contamination while enabling unified views through materialized scoring.

**Security Isolation:** Multi-tenant cyber risk data maintains same row-level security as governance system, with separate schemas for cyber-specific data.

**Performance Strategy:** Async cyber risk processing with cached results, never blocking workflows on external threat intelligence APIs.

---
*Roadmap created: 2026-03-19*
*Next phase: 19*
