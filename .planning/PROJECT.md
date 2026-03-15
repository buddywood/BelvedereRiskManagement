# Belvedere Risk Management

## What This Is

A complete governance intelligence platform for wealth advisors managing multiple families. Features dual dashboard experience: advisors access secure multi-client governance dashboards with risk analytics, trend visualizations, and automated insights across their client portfolio, while families view their governance progress through self-service dashboards with household member display and historical trend tracking. Platform includes advisor-guided intake interviews, customized risk assessments with emphasis scoring, and professional deliverables.

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
- ✓ Multi-client advisor dashboard with secure data isolation — v1.3 (DASH-01 through DASH-05)
- ✓ Governance analytics with trend visualizations and historical tracking — v1.3 (VIZ-01 through VIZ-05)
- ✓ Automated risk intelligence with portfolio-wide insights and drill-down capabilities — v1.3 (INTEL-01 through INTEL-04)
- ✓ Family self-service dashboard with household member display and advisor emphasis indicators — v1.3 (FAMILY-01 through FAMILY-04)

### Active

(Ready for next milestone planning)

### Out of Scope

- Other risk pillars (Financial, Operational, etc.) — Family Governance focus validated across 4 milestones
- Real-time collaboration features — single-user assessment works well
- Mobile native app — responsive web sufficient for target users
- Advanced user management — current advisor/family model handles requirements
- AI-generated recommendations — template-based approach with advisor guidance preferred
- Integration with external portfolio systems — family governance focus doesn't require financial data integration

## Current State

**Version:** v1.3 Governance Intelligence shipped 2026-03-15
**Codebase:** ~25,811 lines TypeScript/TSX (+9,339 lines this milestone)
**Tech Stack:** Next.js 15, Prisma 7, PostgreSQL, Auth.js v5, @react-pdf/renderer, docxtemplater, TanStack Query & React Table, Recharts, OpenAI Whisper API
**Assessment Coverage:** 68 questions with household-aware personalization, intelligent filtering, and advisor-customized emphasis
**Security:** TOTP MFA, Argon2id password hashing, AES-256-GCM encryption, rate limiting, row-level data isolation
**Deliverables:** Advisor-customized PDF reports + 7 pre-filled governance policy templates with household composition

**User Flow:** Registration → MFA setup → Audio intake interview → Advisor review & approval → Customized 12-15 minute assessment → Deliverables with emphasis on advisor-selected risk areas

**Advisor Flow:** Portal access → Client intake review with audio playback → Risk area selection → Assessment approval → Multi-client dashboard with governance analytics → Risk intelligence insights → Client score trend tracking

**Family Flow:** Secure login → Family governance dashboard → Household member display → Current score with pillar breakdown → Historical assessment trends → Advisor emphasis indicators

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Family Governance first | Focused MVP scope within aggressive timeline | ✓ Good — clear focus enabled rapid delivery |
| Full-stack JavaScript | Consistent tech stack, faster development | ✓ Good — proven across 4 milestones |
| TurboTax-style UX | Familiar pattern for complex data collection | ✓ Good — card-based UI with inline help |
| Weighted scoring model | Systematic approach to risk quantification | ✓ Good — 0-10 scale with transparent breakdowns |
| 68 questions with 1-level branching | Balance comprehension with completion time | ✓ Good — 12-15 minute target achieved |
| 0-10 scoring scale (10 = best) | More intuitive than risk score | ✓ Good — reduces user confusion |
| Server-side PDF generation | Professional formatting without client dependencies | ✓ Good — enterprise-quality reports |
| TOTP MFA for security | Enterprise security without SMS dependencies | ✓ Good — authenticator app integration |
| Array of GovernanceRole enums | Support multiple roles per household member | ✓ Good — flexible role assignment system |
| 100% backward compatibility for household features | Protect existing user experience | ✓ Good — seamless upgrade path |
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
| TanStack React Table for governance dashboard | Proven table library with TypeScript support and custom sorting | ✓ Good — handles null scores and responsive columns |
| Recharts for governance analytics | React-first charting with accessibility and TypeScript support | ✓ Good — consistent styling with existing analytics |
| Hero-surface UI pattern for dashboards | Consistent advisor familiarity across portal pages | ✓ Good — unified dashboard experience |
| React Suspense streaming for dashboard performance | Optimize loading for advisors with 50+ families | ✓ Good — target <2 second load time achieved |
| Risk identification algorithms sort by lowest scores | Highest risk = lowest governance scores approach | ✓ Good — intuitive risk prioritization |
| PILLAR_WEIGHTS exported for intelligence module reuse | Share scoring constants between analytics and intelligence | ✓ Good — single source of truth for calculations |
| User-scoped family dashboard queries | Families access their own data without advisor relationship | ✓ Good — enables self-service portal experience |
| Extend existing ownership patterns for advisor relationships | Reuse proven authorization rather than rebuild | ✓ Good — maintains security consistency |

## Constraints

- **Tech Stack**: Full-stack JavaScript — validated as successful approach across 4 milestones
- **Budget**: Minimal hosting costs — achieved with efficient architecture
- **Security**: Enterprise-grade requirements — TOTP MFA, encryption, row-level data isolation, and role-based access delivered
- **Scope**: Family Governance pillar only — validated as sufficient for governance intelligence platform

---
*Last updated: 2026-03-15 after v1.3 milestone completion*