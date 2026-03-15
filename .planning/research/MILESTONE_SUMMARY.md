# Research Summary: Client Invitations, Status Tracking & Notifications

**Domain:** Advisor workflow pipeline features
**Researched:** 2026-03-15
**Overall confidence:** HIGH

## Executive Summary

Research reveals three interconnected features that extend the existing governance platform with advisor-driven client onboarding capabilities. Modern 2026 multi-tenant SaaS architectures emphasize invitation-based onboarding with tenant-scoped permissions, event-driven status tracking with real-time dashboard updates, and unified notification systems with multi-channel delivery.

The existing Belvedere platform provides strong foundation: Prisma 7 with row-level security, Next.js 15 server actions, advisor profile ownership patterns, and basic notification infrastructure. Integration requires extending current models and actions rather than rebuilding core architecture.

All features follow the platform's ownership-enforced CRUD patterns, maintaining multi-tenant security through advisor profile scoping. The notification system leverages existing `AdvisorNotification` infrastructure while adding multi-channel delivery capabilities (email, SMS, in-app).

## Key Findings

**Stack:** Next.js 15 server actions + extended Prisma schema + notification service abstraction + real-time dashboard streaming
**Architecture:** Event-driven status tracking with advisor-scoped invitations and multi-channel notification delivery
**Critical pitfall:** Synchronous notification delivery can block user workflows; async queue-based delivery essential

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation & Database Models** - Extends existing patterns
   - Addresses: Core invitation/status tracking models, RLS policies, basic server actions
   - Avoids: Complex notification routing, ensures database foundation is solid

2. **Invitation Workflow Integration** - Leverages existing auth system
   - Addresses: Advisor-generated invitations, automatic client assignment, basic status tracking
   - Avoids: Real-time complexity, focuses on core workflow completion

3. **Status Tracking Dashboard** - Extends existing dashboard queries
   - Addresses: Real-time progress monitoring, event logging, dashboard integration
   - Avoids: Complex aggregations, builds on proven dashboard patterns

4. **Multi-Channel Notifications** - Adds new notification capabilities
   - Addresses: Email/SMS delivery, notification preferences, delivery status tracking
   - Avoids: Vendor lock-in through abstracted notification service

**Phase ordering rationale:**
- Database foundation must be stable before workflow integration
- Invitation system drives status events, so must precede status tracking
- Dashboard integration uses status data, so follows invitation workflow
- Notification system consumes status events, so comes last

**Research flags for phases:**
- Phase 2: Standard invitation patterns, unlikely to need research
- Phase 3: Real-time dashboard updates may need performance tuning research
- Phase 4: Multi-channel notification providers need integration research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing Next.js 15 + Prisma 7 foundation well-documented |
| Features | HIGH | Standard SaaS patterns with clear existing models |
| Architecture | HIGH | Event-driven patterns well-established for 2026 |
| Pitfalls | MEDIUM | Multi-channel delivery complexity requires careful design |

## Gaps to Address

- Specific email/SMS provider selection needs vendor evaluation
- Real-time dashboard performance at scale needs load testing approach
- Notification template system design needs phase-specific research