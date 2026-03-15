# Project Research Summary

**Project:** Belvedere Risk Management v1.4 - Advisor Workflow Pipeline
**Domain:** Client invitation systems, status tracking dashboards, and automated workflow notifications for governance intelligence platforms
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

This project extends the existing Next.js governance intelligence platform with advisor workflow automation focused on client invitation, status tracking, and notification systems. Research shows this follows established SaaS dashboard patterns with multi-tenant security requirements specific to wealth management compliance. The recommended approach leverages the existing technology stack (Next.js 15, Prisma 7, Auth.js v5) with minimal new dependencies while extending proven patterns for advisor-client relationships and notification systems.

The critical success factor is establishing proper multi-tenant data isolation from the foundation phase, as wealth management platforms face severe regulatory consequences for cross-client data exposure. The existing codebase provides strong foundations through ClientAdvisorAssignment models and role-based authentication, but new invitation and status tracking features require careful extension of these security boundaries. Server-Sent Events are recommended over WebSockets for real-time updates due to simpler implementation and maintenance overhead.

Key risks center on notification fatigue (automated alerts becoming noise rather than signal) and dashboard theater (beautiful visualizations without actionable intelligence). These are mitigated by designing notifications around advisor decision-making patterns and ensuring every status indicator links to specific workflow actions rather than passive data display.

## Key Findings

### Recommended Stack

The research strongly favors extending the existing technology foundation rather than introducing new dependencies. All core functionality can be achieved using the current Next.js 15 app with Prisma 7 database extensions, Resend email infrastructure, and TanStack Query for data management. The only addition is Server-Sent Events for real-time status updates, which provides simpler implementation than WebSocket alternatives while meeting the one-way data flow requirements.

**Core technologies:**
- Existing Prisma Schema 7.4.0: Database foundation — proven across 4 milestones, extend with ClientInvitation and ClientStatus models
- Existing Resend 6.9.2: Email delivery — already integrated for advisor notifications, reliable foundation for invitation templates
- Server-Sent Events (Native): Real-time status updates — simple, production-ready for one-way updates without external dependencies
- Existing TanStack React Table 8.21.3: Status pipeline display — proven for governance dashboard, supports custom sorting for client tracking

### Expected Features

Research identifies clear feature priorities based on wealth management industry standards and competitive analysis. Security and compliance requirements elevate certain features from "nice-to-have" to "table stakes" for professional advisor workflows.

**Must have (table stakes):**
- Secure email invitations with branded templates — standard for all wealth management platforms 2026
- Real-time pipeline status dashboard — advisors need visibility into client onboarding progress
- Automated status change notifications — expected for professional service delivery efficiency
- Document collection progress tracking — required for compliance and momentum maintenance

**Should have (competitive):**
- White-label invitation system with advisor branding — complete advisor brand experience throughout journey
- Family member role-based invitation workflows — handles complex governance structures with multiple stakeholders
- Compliance audit trail with governance focus — demonstrates regulatory adherence specific to family governance

**Defer (v2+):**
- AI-powered personalized onboarding paths — requires usage data to be meaningful, not essential for validation
- Predictive analytics for engagement optimization — need baseline engagement data first
- Video introduction integration — nice-to-have, not essential for governance workflow validation

### Architecture Approach

The architecture extends the existing multi-tenant Next.js application with new dashboard components while maintaining security boundaries through Prisma middleware and row-level security. The pattern follows server-side aggregation with Redis caching for dashboard metrics and real-time updates via Server-Sent Events for active workflow monitoring. This approach leverages existing authentication, notification infrastructure, and client-advisor relationship models.

**Major components:**
1. **Client Invitation System** — extends existing User model relationships with secure token generation and email integration
2. **Status Tracking Dashboard** — multi-client analytics with cached aggregations and real-time progress streaming
3. **Automated Notification Engine** — extends existing AdvisorNotification system with pipeline-specific event triggers and preference management

### Critical Pitfalls

Research identifies security and user experience pitfalls specific to multi-tenant wealth management platforms that must be addressed in foundation phases.

1. **Multi-Tenant Data Leakage in Client Invitations** — implement tenant-scoped queries at data layer, use row-level security policies, validate all queries include proper advisor/client filtering
2. **Dashboard Theater Without Actionable Intelligence** — design dashboards around advisor workflows not data visualization, each status must link to specific actions, include contextual next steps
3. **Notification Fatigue and Alert Blindness** — implement granular notification preferences, use urgency levels matching advisor patterns, aggregate related notifications to reduce volume
4. **Invitation State Consistency Across System Boundaries** — use database transactions for state changes, implement invitation state machine with clear transitions, add idempotency checks
5. **Compliance Audit Trail Gaps in Automated Systems** — log all notification decisions, store delivery confirmations, maintain immutable audit log for all client communication

## Implications for Roadmap

Based on research, suggested phase structure prioritizes security foundations, core workflow functionality, and intelligent automation:

### Phase 1: Security Foundation
**Rationale:** Multi-tenant data isolation must be established before any invitation features based on wealth management compliance requirements and critical pitfall analysis
**Delivers:** Secure invitation system with proper tenant boundaries and audit trails
**Addresses:** Secure email invitations, document collection progress tracking
**Avoids:** Multi-tenant data leakage, invitation state consistency issues, audit trail gaps

### Phase 2: Core Workflow Dashboard
**Rationale:** Status tracking provides the foundation for automated notifications and advisor decision-making workflows
**Delivers:** Real-time status dashboard with actionable intelligence
**Uses:** TanStack React Table for status display, Server-Sent Events for updates, existing Prisma models extended
**Implements:** Multi-client analytics with cached aggregations, workflow-driven status indicators

### Phase 3: Intelligent Notifications
**Rationale:** Automation built on proven status tracking foundation with smart filtering to prevent notification fatigue
**Delivers:** Context-aware notification system with preferences and batching
**Addresses:** Automated status change notifications with advisor workflow integration
**Avoids:** Notification fatigue through intelligent filtering and urgency levels

### Phase 4: Advanced Advisor Features
**Rationale:** White-label branding and multi-stakeholder workflows build on proven core system
**Delivers:** Professional advisor brand experience and complex family governance support
**Addresses:** White-label invitation system, family member role-based workflows
**Implements:** Advanced customization while maintaining security boundaries

### Phase Ordering Rationale

- **Security first:** Multi-tenant isolation cannot be retrofitted safely in wealth management platforms
- **Workflow foundation:** Status tracking provides the data foundation for meaningful notifications
- **Intelligence before automation:** Understanding advisor patterns before automating reduces notification fatigue
- **Advanced features last:** Branding and complex workflows require stable core foundation

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Complex notification filtering and preference management — needs advisor behavior analysis and engagement optimization research
- **Phase 4:** Multi-stakeholder family workflows — may need deeper governance structure research for complex approval chains

Phases with standard patterns (skip research-phase):
- **Phase 1:** Database security patterns — well-documented multi-tenant isolation approaches
- **Phase 2:** Dashboard implementation — established SaaS dashboard and real-time update patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Leverages existing proven technologies, minimal new dependencies, official documentation reviewed |
| Features | MEDIUM | Based on industry analysis and competitor research, but advisor workflow patterns may need validation |
| Architecture | HIGH | Extends proven existing patterns, security boundaries well-established, performance patterns documented |
| Pitfalls | HIGH | Wealth management specific risks well-documented, regulatory compliance requirements clear |

**Overall confidence:** HIGH

### Gaps to Address

Areas where research was conclusive but may need validation during implementation:

- **Notification engagement patterns:** Research shows general principles but specific advisor workflow interruption preferences need validation during Phase 3 planning
- **Complex family governance workflows:** Multi-stakeholder approval chains are documented in general but specific governance intelligence requirements may need domain expert input during Phase 4

## Sources

### Primary (HIGH confidence)
- [Prisma Schema API | Prisma Documentation](https://www.prisma.io/docs/orm/reference/prisma-schema-reference) — database extension patterns
- [Real-Time Notifications with Server-Sent Events (SSE) in Next.js - Pedro Alonso](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/) — SSE implementation
- [Tenant isolation in multi-tenant systems: What you need to know — WorkOS](https://workos.com/blog/tenant-isolation-in-multi-tenant-systems) — security patterns
- [Multi-Tenant Data Integration Playbook for Scalable SaaS](https://cdatasoftware.medium.com/the-2026-multi-tenant-data-integration-playbook-for-scalable-saas-1371986d2c2c) — scaling patterns

### Secondary (MEDIUM confidence)
- [Wealth Management Software in 2026 | Top Platforms & Technology Solutions](https://revenx.com/wealth-management-software-in-2026-platforms-and-technology-for-scalable-pre-set-appointments/) — industry requirements
- [Client Onboarding in Wealth Management: Best Practices](https://whatfix.com/blog/client-onboarding-in-wealth-management/) — feature expectations
- [Next.js SaaS Dashboard Development: Scalability & Best Practices](https://www.ksolves.com/blog/next-js/best-practices-for-saas-dashboards) — architecture patterns

### Tertiary (LOW confidence)
- [12 Free Client List Templates for Tracking Contacts in 2026](https://clickup.com/blog/client-list-templates/) — UI patterns, needs validation with advisor workflows
- [Top 5 Governance, Risk, and Compliance (GRC) Tools and Solutions for 2026](https://www.metricstream.com/blog/top-governance-risk-compliance-grc-tools.html) — compliance features, specific requirements may vary

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*