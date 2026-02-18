# Project Research Summary

**Project:** Belvedere Risk Management - Family Governance Risk Assessment Platform
**Domain:** Family Office Risk Assessment Web Application
**Researched:** 2026-02-17
**Confidence:** HIGH

## Executive Summary

This is a family governance risk assessment platform that sits between high-cost consultants ($10K-50K) and generic family office software ($500-2K/year). Experts build these as guided assessment tools with intelligent branching logic that compress 60-minute interviews into 12-minute self-service flows, coupled with weighted scoring engines that produce transparent, actionable risk reports. The recommended approach uses Next.js 15+ full-stack architecture with Drizzle ORM and Neon serverless Postgres for cost-effective scale-to-zero hosting, React Hook Form with Zod for complex multi-step forms, and shadcn/ui for rapid professional UI development.

The key risks center on user experience and data integrity. First, questionnaire fatigue kills completion rates - users abandon if assessments exceed 15-20 minutes or show irrelevant questions. Second, branching logic creates fragile state management where conditional paths can orphan data or break validation. Third, opaque scoring algorithms erode trust with HNW clients who need transparency to justify action. Mitigation requires aggressive branching to skip irrelevant questions, comprehensive dependency testing with schema-based validation, transparent score breakdowns showing category weights, and algorithm versioning to preserve historical data integrity.

The architecture follows standard risk assessment patterns: wizard UI drives multi-step forms through a branching logic engine, responses flow to a hierarchical scoring engine (question → sub-category → pillar → overall), and results populate template-based PDF reports with actionable policy recommendations. Critical is separating business logic (engines) from HTTP layer for testability, storing raw responses separately from calculated scores for versioning, and implementing progressive state persistence to prevent abandonment.

## Key Findings

### Recommended Stack

Modern full-stack JavaScript/TypeScript architecture dominates 2025 family office software. Next.js 15+ with App Router provides Server Components and Server Actions that simplify data fetching while maintaining type safety end-to-end. React 19 brings automatic optimizations, and Turbopack (now default) significantly accelerates development builds.

**Core technologies:**
- **Next.js 15.5+**: Full-stack framework with built-in API routes and Server Actions - reduces architecture complexity for MVP
- **TypeScript 5.7+**: Type safety eliminates runtime errors - critical for multi-developer teams and long-term maintainability
- **PostgreSQL 16+ via Neon**: Serverless Postgres with scale-to-zero reduces hosting costs to $0-10/month for MVP; branching enables safe migrations
- **Drizzle ORM**: Lightweight (7.4KB) SQL-like API with full type safety - instant type updates without generation step (vs Prisma)
- **React Hook Form + Zod**: Form management with 12KB bundle and zero dependencies - required for 12-minute assessment workflow with complex validation
- **shadcn/ui**: Copy-paste component library built on Radix primitives - significantly faster than building UI from scratch
- **NextAuth.js 5.x**: Zero marginal cost authentication - use Data Access Layer pattern not middleware post-CVE-2025-29927
- **@react-pdf/renderer**: Pure React components for PDFs - lighter than Puppeteer for structured reports

**Critical version notes:**
- Next.js 15.5+ requires React 19.2+ for App Router
- NextAuth.js v5 has breaking changes from v4 but is production-ready
- Tailwind CSS 4.x requires modern browsers (Chrome 115+, Safari 16.4+)

**Avoid:**
- MongoDB (unnecessary flexibility, lacks relational integrity for structured assessments)
- Pages Router (deprecated pattern, App Router is future)
- Formik (abandoned, 3.6x larger than React Hook Form)
- CSS-in-JS libraries (runtime overhead, poor SSR performance)

### Expected Features

Family governance assessment platforms have clear feature expectations driven by HNW client privacy concerns and professional deliverable requirements.

**Must have (table stakes):**
- **Guided assessment questionnaire (60-80 questions)** - standard for professional tools, eliminates blank-page anxiety
- **Risk scoring/rating system** - users need quantifiable output to justify action to family members
- **PDF report generation** - required deliverable for presentation to advisors
- **Secure document storage with MFA** - handling sensitive family/financial data
- **Progress saving** - 12-minute assessment may be interrupted
- **Multi-device access** - users start on desktop, review on mobile
- **User dashboard** - need to see completed assessments, reports

**Should have (competitive advantage):**
- **TurboTax-style branching logic** - reduces 60-minute questionnaire to 12 minutes, eliminates cognitive overload
- **Actionable policy templates** - moves from "what's wrong" to "here's how to fix it"
- **Maturity model scoring** - shows current state + roadmap to improvement (not just problems)
- **Risk area visualizations** - makes abstract governance concepts concrete for visual learners
- **Family-specific recommendations** - tailored guidance drives action (generic advice ignored)
- **Conflict resolution assessment** - 60% of wealth transfer failures are communication/trust breakdowns
- **Next-gen readiness assessment** - addresses #1 family office concern

**Defer (v2+):**
- **Succession planning deep-dive module** - requires legal/estate planning expertise to do properly
- **Cybersecurity assessment module** - specialized domain, needs dedicated research
- **Multi-language support** - only if international demand emerges
- **White-label version for advisors** - different business model, defer until B2C proven
- **Native mobile app** - responsive web sufficient until heavy mobile usage proven

**Anti-features (avoid building):**
- Real-time collaboration (creates governance conflicts about who has final say)
- Comprehensive financial integration (massive scope creep, security liability)
- AI-generated recommendations (black box loses trust with HNW clients)
- Social features (family forums/chat create moderation burden and liability)
- Custom question builder (breaks scoring consistency, QA nightmare)

### Architecture Approach

Risk assessment systems follow hierarchical scoring architecture with wizard-based intake. The presentation layer uses multi-step form components with progress tracking and conditional rendering. The application layer contains three core engines: branching logic for question routing, scoring for weighted calculations, and template generation for PDF/policy documents. The data layer stores assessment drafts, scoring configurations, and audit logs with tenant isolation.

**Major components:**
1. **Wizard State Machine** - multi-step forms modeled as state machines with defined transitions, supports skip logic naturally
2. **Branching Logic Engine** - rule-based question routing with condition evaluator, determines next question based on prior answers
3. **Hierarchical Scoring Engine** - bottom-up aggregation (questions → sub-categories → pillars → overall) with transparent weights
4. **Template Engine** - separate data from presentation using templates with placeholders, enables non-technical updates
5. **Progressive State Persistence** - save form state incrementally (per-step or per-change) to allow resume

**Key architectural patterns:**
- **Data-driven configuration**: Question logic lives in JSON/database, not hardcoded in components - enables business users to update flows
- **Schema-based validation**: Use Zod with conditional validation for dynamic forms - handles optional fields based on branching paths
- **Async job pattern**: Move PDF generation to background queue, return job ID immediately - prevents request timeouts
- **Algorithm versioning**: Tag each assessment with scoring methodology version used - preserves historical data integrity
- **Multi-tenant isolation**: Shared database/schema with `tenant_id` (family_id) and row-level security - sufficient for 100-1000 families

**Project structure:**
```
src/
├── client/components/wizard/     # Multi-step form components
├── client/components/scoring/    # Score display, charts
├── server/engines/branching/     # Question routing logic
├── server/engines/scoring/       # Weighted calculation engine
├── server/engines/templates/     # Document generation
└── shared/types/                 # Single source of truth for data shapes
```

### Critical Pitfalls

1. **Opaque Scoring Algorithm ("Black Box" Problem)** - Users receive risk scores without understanding how they were calculated. Show score breakdown by category, provide score explanation page showing which question responses contributed most, display weights transparently. Address in Phase 2 (Core Assessment Engine) by building transparency into scoring from start.

2. **Questionnaire Fatigue Killing Completion Rates** - Users abandon assessment because it's too long or contains irrelevant questions. Target 15-20 minutes max completion time, implement aggressive branching logic to skip irrelevant sections, show progress indicator prominently, allow save-and-resume. Address in Phase 1 (Guided Intake) and Phase 3 (Branching Logic).

3. **Branching Logic State Management Bugs** - Conditional logic creates cascading failures where Question D expects Answer A that was skipped. Map all question dependencies before implementation, use schema-based validation with conditional fields, implement "question lifecycle" concept (visible/hidden/answered/skipped), test all branching paths systematically. Address in Phase 3 (Branching Logic) - highest-risk phase requiring robust state management.

4. **Historical Data Invalidation After Scoring Changes** - You update question weights, now previous assessments show different scores when recalculated. Store raw question responses separately from calculated scores, version the scoring algorithm (v1, v2), tag each assessment with algorithm version used, never recalculate historical scores with new methodology. Address in Phase 2 (Core Assessment Engine) by designing data model with versioning from start.

5. **Poor Stakeholder Engagement in Family Office Context** - Built for "family principal" but used by family office staff, features solve imagined problems not real pain points. Interview 5-10 family office professionals before Phase 1, test prototypes with real family office staff, create advisory group of 2-3 family office professionals for ongoing feedback. Address pre-Phase 1 (Research/Discovery) and ongoing validation at each phase.

6. **Automated Report Generation Quality Issues** - Generated reports look unprofessional, templates break on edge cases, reports require manual editing before sending to clients. Design report templates with professional designer not just developers, test with edge cases (very low scores, incomplete data), build report preview before final generation. Address in Phase 4 (Report Generation) - budget 30% more time than estimated.

7. **Insufficient Risk Assessment Granularity** - Risk scores too broad to be actionable, reports identify problems but provide no path forward. Break overall score into 5-8 meaningful categories, provide sub-scores within categories, generate specific actionable recommendations based on score patterns, include "quick wins" vs "long-term improvements". Address in Phase 2 (Core Assessment Engine) by designing multi-dimensional scoring from start.

## Implications for Roadmap

Based on research, suggested phase structure follows architecture dependencies and pitfall mitigation:

### Phase 1: Foundation & Basic Intake
**Rationale:** Must establish authentication, data persistence, and linear questionnaire before adding complexity. This validates core concept without branching logic risk.

**Delivers:** User authentication, basic multi-step form (30-50 questions linear), progress saving/resume, assessment draft persistence.

**Addresses:**
- Progress saving (table stakes from FEATURES.md)
- Secure authentication (table stakes from FEATURES.md)
- User dashboard to view assessments (table stakes from FEATURES.md)

**Avoids:**
- Questionnaire fatigue (by targeting 15-20 min completion, testing with real users)
- Poor stakeholder engagement (requires pre-phase user interviews with 5-10 family office professionals)

**Stack elements:** Next.js 15+ App Router, NextAuth.js 5.x, Drizzle ORM with Neon Postgres, React Hook Form + Zod for forms.

**Research flag:** Standard authentication and form patterns, no additional research needed.

### Phase 2: Core Scoring Engine
**Rationale:** Must implement scoring with transparency and versioning before branching complicates data model. Establishes foundation for all future features.

**Delivers:** Hierarchical scoring system (question → sub-category → pillar → overall), transparent score breakdown by category, algorithm versioning, score calculation API.

**Addresses:**
- Risk scoring/rating system (table stakes from FEATURES.md)
- Maturity model scoring (differentiator from FEATURES.md)

**Implements:**
- Hierarchical Scoring Engine (from ARCHITECTURE.md)
- Algorithm versioning pattern (from ARCHITECTURE.md)

**Avoids:**
- Opaque scoring algorithm (build transparency from start: score breakdowns, weight display, methodology documentation)
- Historical data invalidation (implement versioning in data model, store raw responses separately)
- Insufficient granularity (design 5-8 meaningful categories with sub-scores)

**Stack elements:** Scoring calculation in Server Actions, PostgreSQL with JSON columns for flexible scoring config, TanStack Query for client-side caching.

**Research flag:** Standard scoring patterns well-documented, no additional research needed.

### Phase 3: Branching Logic & Adaptive Questionnaire
**Rationale:** Highest-risk phase due to state management complexity. Must have solid foundation from Phases 1-2 before adding conditional logic.

**Delivers:** Dynamic question routing based on answers, skip logic for irrelevant sections, reduced completion time from 30+ min to 12-15 min, comprehensive branching path testing.

**Addresses:**
- TurboTax-style branching logic (key differentiator from FEATURES.md)
- Questionnaire fatigue mitigation (skip irrelevant questions)

**Implements:**
- Branching Logic Engine with rule evaluator (from ARCHITECTURE.md)
- Data-driven configuration pattern (from ARCHITECTURE.md)

**Avoids:**
- Branching logic state management bugs (map dependencies, schema-based validation with conditional fields, comprehensive path testing)
- Questionnaire fatigue (aggressive branching reduces time, improves completion rates)

**Stack elements:** JSON-based branching rules, Zod conditional validation, comprehensive Vitest test suite for all paths.

**Research flag:** HIGH RISK - needs dedicated QA strategy and state management research. May warrant `/gsd:research-phase` for conditional validation patterns.

### Phase 4: PDF Reports & Policy Templates
**Rationale:** Can't generate reports without scoring (Phase 2). Reports are table stakes deliverable - required for launch but can be added after core assessment works.

**Delivers:** Professional PDF reports with score breakdown and visualizations, policy template library (5-7 templates), template selection based on risk profile, async PDF generation with job queue.

**Addresses:**
- PDF report generation (table stakes from FEATURES.md)
- Actionable policy templates (differentiator from FEATURES.md)
- Risk area visualizations (differentiator from FEATURES.md)

**Implements:**
- Template Engine with data binding (from ARCHITECTURE.md)
- Async job pattern for PDF generation (from ARCHITECTURE.md)

**Avoids:**
- Report generation quality issues (professional designer for templates, test edge cases, build preview step)
- Synchronous PDF generation blocking requests (use background queue)

**Stack elements:** @react-pdf/renderer for PDFs, Resend for email delivery, BullMQ or similar for job queue.

**Research flag:** Standard PDF generation patterns, no additional research needed. Budget 30% extra time for edge case testing.

### Phase 5: Enhanced Reporting & Analytics
**Rationale:** After core features working, add assessment history comparison, enhanced visualizations, recommendation engine. Non-blocking improvements.

**Delivers:** Assessment history and comparison over time, conflict resolution assessment module, next-gen readiness assessment module, family-specific recommendations engine.

**Addresses:**
- Conflict resolution assessment (differentiator from FEATURES.md)
- Next-gen readiness assessment (differentiator from FEATURES.md)
- Family-specific recommendations (differentiator from FEATURES.md)

**Avoids:**
- Insufficient granularity (enhanced recommendations are specific and actionable)

**Stack elements:** Chart libraries for enhanced visualizations, recommendation rules engine.

**Research flag:** May need research phase for recommendation rules engine patterns if going beyond simple if-then logic.

### Phase Ordering Rationale

- **Sequential dependency**: Phase 2 scoring requires Phase 1 data model; Phase 3 branching requires Phase 2 scoring to be versioned; Phase 4 reports require Phase 2 scores and Phase 3 complete assessments.
- **Risk management**: Phase 3 branching is highest-risk (state management bugs) - defer until foundation solid. Phase 4 report generation has quality risks - isolate from core assessment.
- **MVP definition**: Phases 1-4 constitute launchable product (guided assessment + scoring + reports). Phase 5 adds competitive features after validation.
- **Parallel work potential**: Phase 4 template design can start during Phase 3 implementation. Phase 5 modules can be built independently.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Branching Logic):** Complex state management, conditional validation patterns, comprehensive testing strategy for branching paths. Consider `/gsd:research-phase` for Zod conditional validation and state machine patterns.
- **Phase 5 (Recommendation Engine):** If going beyond simple rules, may need research on recommendation engine architectures and pattern matching.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard Next.js authentication and form patterns, well-documented
- **Phase 2:** Hierarchical scoring is established pattern with clear implementations
- **Phase 4:** PDF generation with @react-pdf/renderer has extensive examples

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official documentation (Next.js 15, React 19, Drizzle, Neon) and multiple authoritative sources. Version compatibility confirmed. |
| Features | MEDIUM | Based on family office software reports (Simple, Masttro) and governance frameworks (Bedrock, Northern Trust, EY). Table stakes features clear; differentiators inferred from industry reports on pain points. |
| Architecture | HIGH | Risk assessment architecture patterns verified across multiple domains (healthcare, cybersecurity, compliance). Multi-tenant isolation, scoring engines, wizard patterns all well-documented. |
| Pitfalls | MEDIUM | Synthesized from cross-domain research (risk assessment failures, form UX, algorithmic bias). Family office context from industry reports; technical pitfalls from standard web application failures. Some pitfalls adapted from adjacent domains. |

**Overall confidence:** HIGH

Research provides strong foundation for roadmap decisions. Stack recommendations are production-ready and version-compatible. Architecture patterns are proven across similar domains. Feature expectations validated through industry reports and expert frameworks.

### Gaps to Address

**Feature validation gap:** Table stakes features confirmed via industry reports, but differentiator features (branching logic, maturity model, policy templates) need validation with actual family office users during Phase 1 implementation. Recommendation: Conduct 5-10 user interviews before finalizing Phase 3-5 scope.

**Scoring methodology gap:** Research confirms need for hierarchical weighted scoring, but specific weights and categories for family governance require domain expertise. Family office best practices identify governance areas (succession, communication, decision-making, conflict resolution, financial controls, cybersecurity) but not relative importance. Recommendation: Consult family office governance expert during Phase 2 to calibrate weights. Consider advisory board of 2-3 family office professionals for validation.

**Branching logic complexity gap:** Research confirms TurboTax-style branching as differentiator and questionnaire fatigue mitigation strategy, but specific branching rules depend on family governance domain expertise (e.g., "skip succession planning if no next generation"). Recommendation: Map question dependencies with governance expert during Phase 2, before Phase 3 implementation.

**Compliance requirements gap:** Research identifies HNW clients have heightened privacy concerns and need enterprise-grade security (SOC 2, encryption, MFA, audit logs), but doesn't specify exact compliance requirements. Recommendation: During Phase 1, clarify if targeting enterprise family offices (require SOC 2 Type II) vs. individual wealthy families (basic security sufficient). This affects hosting decisions and timeline.

## Sources

### Primary (HIGH confidence)
- **Next.js 15 Documentation** - Version 15 features, App Router patterns, TypeScript integration
- **React 19 Documentation** - Server Components, automatic optimizations, compatibility
- **Auth.js/NextAuth.js 5.x** - Post-CVE patterns, Data Access Layer approach
- **Drizzle ORM Documentation** - Type-safe queries, serverless compatibility
- **Neon Documentation** - Serverless Postgres pricing, branching, scale-to-zero
- **React Hook Form Documentation** - Form management patterns, Zod integration
- **Zod Documentation** - Schema validation, conditional validation patterns

### Secondary (MEDIUM confidence)
- **Family Office Software & Technology Report 2025 (Simple)** - Industry trends, technology adoption, key concerns
- **Best Family Office Software 2026 (Masttro)** - Feature expectations, pricing benchmarks
- **KPMG Global Family Business Report 2025** - Governance challenges, succession statistics
- **Family Office Governance Frameworks** - Bedrock Group, Northern Trust, John A. Davis & Family Business Consulting Group
- **Risk Assessment Methodologies** - EY, Alvarez & Marsal, FundCount on family office risk management
- **Multi-Tenant Architecture Patterns** - AWS guidance, Bytebase, GeeksforGeeks
- **Frontend System Design** - SystemDesignHandbook 2026, State Management Guide 2026
- **Risk Scoring Best Practices** - Flagright, Splunk, RiskWatch, LightBox on weighted scoring models

### Tertiary (LOW confidence, needs validation)
- **TurboTax UX patterns** - Inferred from reviews and onboarding analysis, not official documentation
- **Questionnaire completion benchmarks** - 80%+ target from survey best practices, not family office specific
- **Branching logic complexity estimates** - 12-minute completion time extrapolated from general form optimization research

---
*Research completed: 2026-02-17*
*Ready for roadmap: yes*
