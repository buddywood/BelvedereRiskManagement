# Belvedere Risk Management

## What This Is

A complete advisor-guided Family Governance platform with audio-enhanced intake interviews, secure advisor portal, and customized risk assessments. Users complete audio interviews with family governance experts, who review responses and approve customized assessments focused on specific risk areas with 1.5x emphasis scoring. The platform produces personalized PDF reports and customizable governance policy templates with household member names and advisor-curated recommendations.

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
- ✓ Step-by-step intake interview system with audio response capability — v1.2
- ✓ Advisor portal for client intake review and management — v1.2
- ✓ Risk area identification and approval workflow for advisors — v1.2
- ✓ Assessment customization with 1.5x emphasis multipliers for advisor-selected focus areas — v1.2
- ✓ Audio transcription via OpenAI Whisper integration — v1.2
- ✓ Notification system for advisor-client communication — v1.2

### Active

(Ready for next milestone planning)

## Current Milestone: v1.3 Governance Intelligence

**Goal:** Transform the platform from single-assessment tool into a governance intelligence dashboard for advisors managing multiple families.

**Target features:**
- Belvedere Governance Score (0-10 headline score) derived from weighted scoring engine
- Risk pillar visualization with charts showing scores across governance domains
- Top risk indicators that automatically surface highest-risk governance gaps
- Advisor insights panel for prioritizing remediation work across multiple clients
- Annual assessment tracking enabling families to retake assessments for trend analysis
- Dual dashboard experience (advisor multi-client view + family self-service view)

### Out of Scope

- Other risk pillars (Financial, Operational, etc.) — Family Governance focus validated
- Real-time collaboration features — single-user assessment works well
- Mobile native app — responsive web sufficient for target users
- Advanced user management — current auth sufficient for advisor workflow
- AI-generated recommendations — template-based approach with advisor guidance preferred

## Current State

**Version:** v1.2 Intake & Triage System shipped 2026-03-14
**Codebase:** ~1,301,761 lines TypeScript/TSX (+1,612 lines this milestone)
**Tech Stack:** Next.js 15, Prisma 7, PostgreSQL, Auth.js v5, @react-pdf/renderer, docxtemplater, TanStack Query, OpenAI Whisper API
**Assessment Coverage:** 68 questions with household-aware personalization, intelligent filtering, and advisor-customized emphasis
**Security:** TOTP MFA, Argon2id password hashing, AES-256-GCM encryption, rate limiting, role-based advisor portal access
**Deliverables:** Advisor-customized PDF reports + 7 pre-filled governance policy templates with household composition

**User Flow:** Registration → MFA setup → Audio intake interview → Advisor review & approval → Customized 12-15 minute assessment → Deliverables with emphasis on advisor-selected risk areas

**Advisor Flow:** Portal access → Client intake review with audio playback → Risk area selection → Assessment approval → Customized scoring with 1.5x multipliers

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
| Audio interview foundation before advisor portal | Establish data source before consumption interface | ✓ Good — logical dependency flow |
| OpenAI Whisper for transcription | Proven accuracy for professional advisor review | ✓ Good — reliable transcript quality |
| Filesystem storage for MVP audio | Simple storage avoiding cloud complexity | ✓ Good — rapid development without S3 setup |
| Pure function architecture for customization logic | Separate data access from business logic for testability | ✓ Good — comprehensive unit testing enabled |
| 1.5x emphasis multiplier constant | Noticeable but not overwhelming focus area weighting | ✓ Good — balanced scoring adjustment |
| Pre-filter before branching logic | Question filtering before assessment branching | ✓ Good — clean separation of concerns |
| Advisor portal role-based access | Secure multi-tenant advisor-client relationships | ✓ Good — proper access control without complexity |

## Constraints

- **Tech Stack**: Full-stack JavaScript — validated as successful approach across 3 milestones
- **Budget**: Minimal hosting costs — achieved with efficient architecture
- **Security**: Enterprise-grade requirements — TOTP MFA, encryption, and role-based access delivered
- **Scope**: Family Governance pillar only — validated as sufficient for advisor-guided MVP

---
*Last updated: 2026-03-14 after v1.3 milestone started*