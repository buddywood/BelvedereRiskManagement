---
status: testing
phase: 20-identity-risk-intelligence
source: 20-01-SUMMARY.md, 20-02-SUMMARY.md, 20-03-SUMMARY.md
started: 2026-03-19T15:45:00Z
updated: 2026-03-19T15:45:00Z
---

## Current Test

number: 1
name: Identity Risk Pillar in Assessment Hub
expected: |
  Navigate to /assessment as a family user. The assessment hub displays three pillar cards: Family Governance, Cyber Risk, and Identity Risk. The Identity Risk pillar card shows progress status and allows starting the assessment.
awaiting: user response

## Tests

### 1. Identity Risk Pillar in Assessment Hub
expected: Navigate to /assessment as a family user. The assessment hub displays three pillar cards: Family Governance, Cyber Risk, and Identity Risk. The Identity Risk pillar card shows progress status and allows starting the assessment.
result: [pending]

### 2. Identity Risk Question Navigation
expected: Click "Start Assessment" on Identity Risk pillar. Navigate through identity risk questions at URLs like /assessment/identity-risk/1, /assessment/identity-risk/2, etc. Questions cover social exposure, public information, digital footprint, and family visibility with appropriate branching logic.
result: [pending]

### 3. Identity Risk Assessment Completion
expected: Complete all identity risk questions and submit assessment. System calculates identity risk score on 0-10 scale and displays completion confirmation with score summary.
result: [pending]

### 4. Identity Risk Results Display
expected: Navigate to /assessment/results after completing identity risk assessment. Results page displays identity risk pillar alongside other completed assessments with numerical score and risk level indicator.
result: [pending]

### 5. AI Identity Risk Recommendations
expected: After completing identity risk assessment, system generates AI-powered recommendations targeting social media privacy, public information removal, digital footprint reduction, and family visibility management. Recommendations appear as actionable steps.
result: [pending]

### 6. Advisor Identity Risk Dashboard
expected: As an advisor user, navigate to /advisor/identity-risk. Dashboard displays portfolio metrics (total clients, assessed count, average score, at-risk count) and client table with identity risk scores sorted by risk level (critical → high → medium → low → unassessed).
result: [pending]

### 7. Advisor Portal Navigation Integration
expected: In advisor portal at /advisor, Identity Risk navigation card appears with UserSearch (Fingerprint) icon positioned after Cyber Risk card. Card links to identity risk dashboard and shows portfolio summary.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]