# Project Research Summary

**Project:** Belvedere Risk Management - Family Governance Risk Assessment Platform with Household Profile Integration
**Domain:** Family Office Risk Assessment Web Application + Household Profile Management
**Researched:** 2026-02-17 (Updated: 2026-03-12)
**Confidence:** HIGH

## Executive Summary

This project integrates household profile management into an existing family governance risk assessment platform that sits between high-cost consultants ($10K-50K) and generic family office software ($500-2K/year). The proven platform achieves 80%+ completion rates with a 12-15 minute assessment using intelligent branching logic, multi-factor authentication, and PDF report generation. The research reveals that successful family governance platforms require sophisticated household data management beyond basic demographics to include governance roles, decision-making hierarchy, and multi-generational perspectives.

The recommended approach prioritizes maintaining the existing assessment completion flow while progressively building household context. The technology stack of Next.js 15+, React 19, TypeScript, and PostgreSQL with Drizzle ORM provides a solid foundation for household data integration. New additions for household management include react-international-phone for global contact validation and react-day-picker for birth date handling, both integrating seamlessly with the existing React Hook Form + Zod validation architecture.

Key risks center on assessment completion disruption (most critical), data fragmentation between profiles and assessments, permission complexity for multi-member households, and scoring algorithm complications from conflicting family perspectives. These can be mitigated through progressive profile building during assessment flow, architectural integration from day one, family office-style role-based access patterns, and clear household scoring methodologies established before implementation.

## Key Findings

### Recommended Stack

The research confirms the existing technology stack is well-suited for household profile integration. The proven foundation of Next.js 15+ with React 19, TypeScript 5.7+, PostgreSQL via Neon serverless, and Drizzle ORM provides strong architectural support for household relationship modeling and multi-member data management.

**Core technologies (validated):**
- **Next.js 15.5+**: Full-stack framework with built-in API routes and Server Actions — proven for existing assessment system, ideal for household profile integration
- **React Hook Form 7.54+ with useFieldArray**: Form management essential for dynamic household member arrays — extends existing form patterns seamlessly
- **Drizzle ORM**: 7.4KB bundle with full TypeScript safety — ideal for household relationship modeling with self-referencing tables
- **PostgreSQL 16+ via Neon**: ACID compliance critical for family data — supports both structured relationships and flexible JSONB profile data
- **Zod 3.24+**: Schema validation with TypeScript inference — extends existing validation to complex household member schemas
- **react-international-phone 4.3+**: International phone validation — TypeScript-native with React Hook Form compatibility for global families
- **react-day-picker 9.1.3+**: Date picker for member birth dates — WCAG compliant, integrates with existing date-fns, TypeScript native

**Critical integration notes:**
- All new household dependencies integrate with existing React Hook Form + Zod validation architecture
- useFieldArray provides performance-optimized dynamic member management
- PostgreSQL self-referencing tables support complex family relationship modeling

### Expected Features

Household profile research reveals sophisticated feature expectations beyond basic demographics, driven by governance-focused personalization requirements and family office operational complexity.

**Must have (table stakes):**
- **Basic member profiles (name, role, contact)** — standard across family platforms for household-aware features
- **Household composition tracking** — required for assessment personalization and governance context understanding
- **Profile-based question branching integration** — core value proposition extending proven 68-question assessment logic
- **Member governance role identification** — necessary for governance-specific recommendations and succession planning context
- **Individual privacy controls** — 2026 standard for family platforms with controlled family-level data sharing
- **Auto-save during profile creation** — extends existing assessment auto-save functionality to prevent data loss

**Should have (competitive advantage):**
- **Governance role assessment (decision authority, influence mapping)** — differentiator for family office sophistication level
- **Cultural governance profiling (communication styles, preferences)** — enhanced personalization for family dynamics understanding
- **Profile-driven report personalization** — tailored PDF sections based on individual member roles and responsibilities
- **Advisor ecosystem mapping** — professional network integration unique to governance focus
- **Multigenerational wealth perspective** — family office level sophistication for succession planning

**Defer (v2+):**
- **Family conflict risk prediction** — advanced ML/AI feature requiring established profile data patterns first
- **Member-specific policy recommendations** — complex rules engine expansion better suited for future phases
- **Cross-generational perspective analysis** — high complexity requiring validation of simpler profile patterns

**Anti-features (avoid building):**
- Real-time location tracking (privacy invasion, not governance-focused)
- Social media integration (dilutes professional focus, introduces security risks)
- Family calendar/event scheduling (feature creep, competitive with existing tools)
- Financial account aggregation (regulated, complex, highly competitive market)
- Gamification elements (undermines serious governance tone required for HNW clients)

### Architecture Approach

The integration follows a profile-context architecture where household profiles become first-class assessment context rather than separate features. This extends the proven hierarchical scoring architecture (question → sub-category → pillar → overall) to include household composition as scoring context, while maintaining the established wizard-based intake pattern with enhanced member-aware branching logic.

**Major components (integrated):**
1. **Profile Services + Enhanced Branching** — Extends existing branching logic engine to consider both user answers AND household composition for question routing
2. **Assessment Logic + Profile Context** — Enhanced Zustand store managing both assessment state and household member data with synchronized updates
3. **Template Engine + Profile Data** — Composed template generation from scores, user data, and household member profiles for personalized reporting

**Key integration patterns:**
- **Profile-aware question branching**: Extend shouldShowQuestion() to consider household composition alongside existing answer-based conditions
- **Profile-context state management**: Enhanced Zustand store including profile data alongside assessment state for unified UI context
- **Template data composition**: Compose template data from multiple sources (scores + profile + members) for rich personalization

**Database schema integration:**
```typescript
// New models integrate with existing User/Assessment tables
HouseholdProfile: userId -> User, has many HouseholdMember
HouseholdMember: profileId -> HouseholdProfile, relationship/role data
Assessment: enhanced with profileId -> HouseholdProfile (optional for backward compatibility)
```

### Critical Pitfalls

Research identified five critical pitfalls from household profile integration failures, plus existing assessment platform risks that must be preserved.

**New household-specific pitfalls:**
1. **Assessment completion rate disruption** — Adding household profiles breaks proven 12-15 minute completion flow; avoid positioning profile setup as prerequisite, use progressive building during assessment
2. **Data fragmentation and integration failures** — Profile data lives in isolation from assessment responses; design household profiles as first-class assessment context from day one
3. **Permission structure complexity** — Multi-member households create permission nightmares; implement role-based access aligned with family office principles from start
4. **Assessment personalization mistakes from stale data** — Profile-driven personalization creates embarrassing mistakes with outdated information; implement profile validation within assessment flow
5. **Scoring algorithm complexity from conflicting perspectives** — Different family members' responses create conflicting risk assessments; establish clear household scoring methodology before building profiles

**Existing platform pitfalls (must preserve mitigation):**
- **Questionnaire fatigue killing completion rates** — Maintain aggressive branching logic, 15-20 minute max completion time
- **Branching logic state management bugs** — Continue comprehensive testing, schema-based validation with conditional fields
- **Opaque scoring algorithm** — Preserve transparent score breakdown by category, weight display, methodology documentation

## Implications for Roadmap

Based on combined research, updated phase structure maintains existing assessment platform stability while progressively adding household capabilities:

### Phase 1: Household Foundation (NEW)
**Rationale:** Must establish basic household data structure without disrupting proven 80%+ assessment completion rates
**Delivers:** Core household profile database schema, basic member management, backward-compatible assessment integration
**Addresses:** Basic member profiles, household composition tracking from table stakes features
**Avoids:** Assessment completion rate disruption by implementing progressive profile building during assessment flow
**Stack elements:** Enhanced Drizzle schema with HouseholdProfile/HouseholdMember models, React Hook Form useFieldArray patterns
**Research flag:** Standard database patterns and CRUD operations, no additional research needed

### Phase 2: Assessment Integration (ENHANCED)
**Rationale:** Core value proposition requires profile data to meaningfully enhance assessment personalization without breaking existing scoring
**Delivers:** Profile-aware question branching, enhanced assessment state management, member-specific question rendering, backward-compatible scoring
**Uses:** Enhanced shouldShowQuestion() with profile context, Zustand store extensions, existing hierarchical scoring engine
**Implements:** Profile-context state management integrating with existing assessment store
**Addresses:** Profile-based question branching (core value proposition), member governance role identification
**Avoids:** Data fragmentation by architectural integration from day one, scoring algorithm complexity through clear methodology
**Research flag:** **HIGH RISK** - Complex state management, conditional validation patterns, comprehensive testing strategy for branching paths. Consider `/gsd:research-phase` for profile-aware branching patterns

### Phase 3: Enhanced Personalization (NEW)
**Rationale:** Builds on proven profile-assessment integration to deliver governance-specific differentiation
**Delivers:** Governance role assessment, cultural profiling, advisor ecosystem mapping, profile validation
**Addresses:** Competitive advantage features that differentiate from generic family platforms
**Avoids:** Personalization mistakes through robust profile validation and conflict resolution patterns
**Stack elements:** react-international-phone for global contacts, enhanced profile validation logic
**Research flag:** Cultural governance profiling patterns need domain-specific validation for family office contexts

### Phase 4: Household Reporting (ENHANCED)
**Rationale:** Enhances existing PDF generation with household context, leveraging proven template infrastructure
**Delivers:** Member-specific report sections, household composition in PDFs, personalized governance recommendations
**Uses:** Enhanced template data composition, existing @react-pdf/renderer infrastructure, proven async PDF generation
**Implements:** Profile-rich template engine extending existing template patterns
**Addresses:** Profile-driven report personalization (differentiator), household-aware visualizations
**Avoids:** Report quality issues through professional template design, member attribution clarity
**Research flag:** Profile-driven PDF template architecture requires technical research for complex data composition

### Phase 5: Advanced Family Features (NEW)
**Rationale:** After household integration validated, add advanced family office sophistication features
**Delivers:** Multigenerational mapping, cross-generational perspective analysis, advanced family conflict assessment
**Addresses:** Family office level sophistication, succession planning enhancement
**Stack elements:** Enhanced data models for extended family relationships, complex scoring algorithms
**Research flag:** Advanced family relationship modeling patterns need validation

### Phase Ordering Rationale

- **Foundation first**: Household schema must exist before assessment integration; maintains backward compatibility with existing assessments
- **Progressive integration**: Assessment integration builds on profile foundation; avoids "big bang" changes that could break existing user flows
- **Risk management**: Profile-aware branching (Phase 2) is highest-risk integration point; defer until foundation solid
- **Value delivery**: Each phase delivers meaningful user value; Phases 1-4 constitute enhanced launchable product

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Assessment Integration):** Profile-aware branching logic, conditional validation patterns, state management for household context
- **Phase 3 (Enhanced Personalization):** Cultural governance profiling patterns for family office appropriateness
- **Phase 4 (Household Reporting):** Profile-driven PDF template architecture and complex data composition patterns

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard database schema and CRUD patterns well-documented
- **Phase 5:** Can leverage patterns established in earlier phases

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official documentation and compatibility matrices; household additions integrate seamlessly |
| Features | MEDIUM | Table stakes validated across family platforms, differentiators based on family office research; household-specific patterns need validation |
| Architecture | HIGH | Integration patterns align with existing proven assessment architecture; profile-context approach is well-documented |
| Pitfalls | HIGH | Household-specific pitfalls documented across family office platform failures; existing platform risks well-understood |

**Overall confidence:** HIGH

Research provides strong foundation for household profile integration decisions. Stack recommendations maintain compatibility with proven assessment platform. Architecture patterns preserve existing strengths while enabling household enhancement.

### Gaps to Address

**Household feature validation gap:** Basic profile features confirmed, but governance-specific features (cultural profiling, advisor mapping) need validation with actual family office users. Recommendation: Include household profile validation in existing user interview process during Phase 1.

**Multi-member scoring methodology gap:** Research confirms need for handling conflicting family perspectives, but specific approaches require domain expertise. Recommendation: Consult family office governance expert during Phase 2 to establish household scoring rules before implementation.

**Profile-assessment integration complexity:** While patterns exist, specific implementation of profile-aware branching with existing 68-question assessment needs careful validation. Recommendation: Prototype key integration points before Phase 2 implementation.

**International family considerations:** Global families have specific requirements (phone formats, cultural considerations) that standard US family patterns don't address. Recommendation: Research international family office requirements if global expansion planned.

## Sources

### Primary (HIGH confidence)
- **Next.js 15 Documentation** - Version 15 features, App Router patterns, TypeScript integration, household profile API patterns
- **React Hook Form useFieldArray Documentation** - Dynamic member management patterns, performance optimization
- **Drizzle ORM Relations Documentation** - Self-referencing tables, family relationship modeling
- **Zod Conditional Validation** - Schema patterns for dynamic household member validation

### Secondary (MEDIUM confidence)
- **Family Office Software Comparison 2026** - Household management feature analysis, professional platform expectations
- **Google Family Groups Analysis** - Consumer family platform patterns, household composition handling
- **Best Family Office Software (Masttro)** - Professional feature expectations, role-based access patterns
- **Family Platform Feature Research** - Household data collection patterns, privacy control requirements

### Tertiary (LOW confidence, needs validation)
- **Cultural Governance Profiling Patterns** - Limited domain-specific documentation, requires expert validation during implementation
- **International Family Requirements** - Inferred from general international platform requirements, needs family office context validation

---
*Research completed: 2026-02-17*
*Updated for household profiles: 2026-03-12*
*Ready for roadmap: yes*