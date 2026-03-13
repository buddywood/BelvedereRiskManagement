# Belvedere Risk Management

## What This Is

A complete 12-minute TurboTax-style Family Governance assessment with household profile integration that produces personalized PDF reports and customizable governance policy templates. Users complete secure registration, create optional household member profiles, answer personalized questions (53-68 via intelligent branching), and receive customized deliverables including executive summaries, risk breakdowns, and 7 pre-filled governance policy templates with family member names.

## Core Value

Prevent family wealth from becoming family conflict through systematic risk assessment and actionable governance recommendations.

## Requirements

### Validated

- ✓ Secure user authentication with MFA — v1.0
- ✓ Guided Family Governance assessment with branching logic — v1.0 (68 questions, 8 categories)
- ✓ Weighted scoring algorithm (questions → sub-categories → pillar score) — v1.0
- ✓ Risk identification system that surfaces specific missing controls — v1.0
- ✓ Automated report generation (executive summary + detailed breakdown) — v1.0
- ✓ Policy template generation with pre-filled recommendations — v1.0 (7 templates)
- ✓ Real-time auto-save and smart resume functionality — v1.0
- ✓ Household member profile management with governance roles — v1.1
- ✓ Assessment personalization using household member names and composition — v1.1
- ✓ Profile-aware question branching and filtering — v1.1
- ✓ Household-aware PDF reports with composition tables and role-based recommendations — v1.1
- ✓ Policy template pre-population with household member names and roles — v1.1
- ✓ Extended family tracking for non-resident members — v1.1
- ✓ 100% backward compatibility for assessments without profiles — v1.1

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

**Version:** v1.1 Household Profile Integration shipped 2026-03-13
**Codebase:** ~130,460 lines TypeScript/TSX
**Tech Stack:** Next.js 15, Prisma 7, PostgreSQL, Auth.js v5, @react-pdf/renderer, docxtemplater, TanStack Query
**Assessment Coverage:** 68 questions with household-aware personalization and intelligent filtering
**Security:** TOTP MFA, Argon2id password hashing, AES-256-GCM encryption, rate limiting, ownership-enforced household data
**Deliverables:** Personalized PDF reports with household composition + 7 pre-filled governance policy templates

**User Flow:** Registration → MFA setup → Optional household profiles → Personalized 12-15 minute assessment → Customized deliverables with family member names

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
| Array of GovernanceRole enums | Support multiple roles per household member | ✓ Good — flexible role assignment system |
| 100% backward compatibility for household features | Protect existing user experience | ✓ Good — seamless upgrade path for v1.0 users |
| Profile data cached for 5 minutes | Balance session performance with data freshness | ✓ Good — optimal for assessment completion time |
| Ownership-enforced household CRUD | Secure multi-user household data access | ✓ Good — prevents data leakage between users |
| Client-server component split for profiles | Optimize data fetching while maintaining interactivity | ✓ Good — clean separation of concerns |
| nullGetter pattern for template placeholders | Graceful handling of missing household data | ✓ Good — prevents template corruption |

## Constraints

- **Tech Stack**: Full-stack JavaScript — validated as successful approach
- **Budget**: Minimal hosting costs — achieved with efficient architecture
- **Security**: Enterprise-grade requirements — TOTP MFA and encryption delivered
- **Scope**: Family Governance pillar only — validated as sufficient for MVP

---
*Last updated: 2026-03-13 after v1.1 milestone completion*