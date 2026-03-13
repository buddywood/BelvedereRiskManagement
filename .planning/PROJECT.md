# Belvedere Risk Management

## What This Is

A complete 12-minute TurboTax-style Family Governance assessment that produces professional PDF reports and customizable governance policy templates. Users complete secure registration with multi-factor authentication, answer 53-68 questions (via intelligent branching), and immediately receive professional deliverables including executive summaries, risk breakdowns, and 7 pre-filled governance policy templates.

## Core Value

Prevent family wealth from becoming family conflict through systematic risk assessment and actionable governance recommendations.

## Current Milestone: v1.1 Household Profile Integration

**Goal:** Enhance assessment personalization through comprehensive household member profiles that drive intelligent question branching and customized deliverables.

**Target features:**
- Household member profile collection (names, ages, occupations, contact info)
- Extended family tracking (adult children/grandchildren not in home)
- Assessment question personalization based on family composition
- Pre-filled report and policy template data from profiles
- Enhanced branching logic using household context
- Family-specific governance recommendations

## Requirements

### Validated

- ✓ Secure user authentication with MFA — v1.0
- ✓ Guided Family Governance assessment with branching logic — v1.0 (68 questions, 8 categories)
- ✓ Weighted scoring algorithm (questions → sub-categories → pillar score) — v1.0
- ✓ Risk identification system that surfaces specific missing controls — v1.0
- ✓ Automated report generation (executive summary + detailed breakdown) — v1.0
- ✓ Policy template generation with pre-filled recommendations — v1.0 (7 templates)
- ✓ Real-time auto-save and smart resume functionality — v1.0

### Active

- [ ] User testing and feedback collection system
- [ ] Assessment analytics and completion tracking
- [ ] Multi-family organization support
- [ ] Advanced reporting customization options
- [ ] Integration with external advisory platforms

### Out of Scope

- Other risk pillars (Financial, Operational, etc.) — Family Governance focus validated
- Real-time collaboration features — single-user assessment works well
- Mobile native app — responsive web sufficient for target users
- Advanced user management — current auth sufficient for MVP
- AI-generated recommendations — template-based approach preferred

## Current State

**Version:** v1.0 MVP shipped 2026-03-13
**Codebase:** 12,349 lines TypeScript/TSX
**Tech Stack:** Next.js 15, Prisma 7, PostgreSQL, Auth.js v5, @react-pdf/renderer, docxtemplater
**Assessment Coverage:** 68 questions across 8 Family Governance sub-categories
**Security:** TOTP MFA, Argon2id password hashing, AES-256-GCM encryption, rate limiting
**Deliverables:** Professional PDF reports + 7 governance policy templates

**User Flow:** Registration → MFA setup → 12-15 minute assessment → immediate download of PDF report and Word templates

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Family Governance first | Focused MVP scope within aggressive timeline | ✓ Good — clear focus enabled rapid delivery |
| Full-stack JavaScript | Consistent tech stack, faster development | ✓ Good — 22-day delivery with unified language |
| TurboTax-style UX | Familiar pattern for complex data collection | ✓ Good — card-based UI with inline help |
| Weighted scoring model | Systematic approach to risk quantification | ✓ Good — 0-10 scale with transparent breakdowns |
| 68 questions with 1-level branching | Balance comprehension with completion time | ✓ Good — 12-15 minute target achieved |
| 0-10 scoring scale (10 = best) | More intuitive than risk score | ✓ Good — reduces user confusion |
| Server-side PDF generation | Professional formatting without client dependencies | ✓ Good — enterprise-quality reports |
| TOTP MFA for security | Enterprise security without SMS dependencies | ✓ Good — authenticator app integration |

## Constraints

- **Tech Stack**: Full-stack JavaScript — validated as successful approach
- **Budget**: Minimal hosting costs — achieved with efficient architecture
- **Security**: Enterprise-grade requirements — TOTP MFA and encryption delivered
- **Scope**: Family Governance pillar only — validated as sufficient for MVP

---
*Last updated: 2026-03-12 after v1.1 milestone started*