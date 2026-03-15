# Roadmap: v1.4 Advisor Workflow Pipeline

**Created:** 2026-03-15
**Milestone:** v1.4 Advisor Workflow Pipeline
**Scope:** Automate complete client journey from advisor invite through governance report delivery with status tracking and intelligent notifications

## Overview

Transform the governance intelligence platform into a complete advisor workflow automation system. Delivers secure client invitation system, real-time status tracking dashboard, and intelligent notification engine while maintaining enterprise-grade security for wealth management compliance.

## Phases

### Phase 15: Secure Client Invitations
**Goal:** Advisors can invite clients through secure branded email system with complete invitation lifecycle management

**Dependencies:** None (extends existing auth system)

**Requirements:** INVITE-01, INVITE-02, INVITE-03, INVITE-04, INVITE-05, INVITE-06, INVITE-07, BRAND-01, BRAND-02, BRAND-04

**Success Criteria:**
1. Advisor can send secure email invitations with custom branding and personalized messages
2. Client receives branded invitation email with secure registration link that expires appropriately
3. Client can register through invitation link and access assessment portal seamlessly
4. Advisor can track invitation status (sent, opened, registered, expired) in real-time
5. Advisor can resend invitations for unopened or expired links without creating duplicate accounts

### Phase 16: Client Status Pipeline
**Goal:** Advisors have real-time visibility into complete client workflow progression through visual dashboard

**Dependencies:** Phase 15 (invitation system provides initial status data)

**Requirements:** STATUS-01, STATUS-02, STATUS-03, STATUS-04, STATUS-05, STATUS-06, DOC-01, DOC-02

**Success Criteria:**
1. Advisor dashboard displays real-time client pipeline with visual progress indicators for all stages
2. Each client shows current stage with completion percentage and next action required
3. Advisor can filter and sort clients by status, progress, or timeline for workflow management
4. Dashboard refreshes automatically with real-time updates without page reload
5. Advisor can click any client to view detailed workflow progress and document collection status

### Phase 17: Document Collection System
**Goal:** Clients can upload required documents while advisors track collection progress for compliance

**Dependencies:** Phase 16 (status system tracks document requirements)

**Requirements:** DOC-03, DOC-04, DOC-05, BRAND-03, BRAND-05

**Success Criteria:**
1. Advisor can mark required documents for each client with clear specifications
2. Client portal allows secure document upload with branded interface
3. System tracks uploaded vs missing documents with automated client reminders
4. PDF governance reports include advisor branding and uploaded document references
5. Clients receive automated reminders for missing documents based on workflow timeline

### Phase 18: Intelligent Notifications
**Goal:** Automated notification system prevents workflow stalls while avoiding alert fatigue

**Dependencies:** Phase 16 (status system provides notification triggers)

**Requirements:** NOTIFY-01, NOTIFY-02, NOTIFY-03, NOTIFY-04, NOTIFY-05

**Success Criteria:**
1. System sends automated notifications for key workflow milestones without overwhelming users
2. Client receives contextual reminder notifications for incomplete assessment stages
3. Advisor receives notifications when clients complete milestones requiring advisor action
4. Users can configure notification preferences for frequency and types of alerts
5. System sends deadline reminders for stalled workflows with escalation paths

### Phase 19: Multi-Family Workflows
**Goal:** Advisors can manage complex family governance structures with role-based invitation coordination

**Dependencies:** Phase 15 (invitation system), Phase 16 (status tracking), Phase 18 (notifications)

**Requirements:** WORKFLOW-01, WORKFLOW-02, WORKFLOW-03, WORKFLOW-04, WORKFLOW-05

**Success Criteria:**
1. Advisor can invite multiple family members with different governance roles and permissions
2. Family members receive role-specific invitations and access appropriate portal sections
3. Status tracking displays coordinated progress for multi-member family assessments
4. System manages workflow dependencies between family members automatically
5. Advisor can orchestrate complex family invitation sequences and approval workflows

## Progress

| Phase | Status | Requirements | Progress |
|-------|--------|--------------|----------|
| 15 - Secure Client Invitations | Pending | 10 | ░░░░░░░░░░ 0% |
| 16 - Client Status Pipeline | Pending | 8 | ░░░░░░░░░░ 0% |
| 17 - Document Collection System | Pending | 5 | ░░░░░░░░░░ 0% |
| 18 - Intelligent Notifications | Pending | 5 | ░░░░░░░░░░ 0% |
| 19 - Multi-Family Workflows | Pending | 5 | ░░░░░░░░░░ 0% |

**Total Requirements:** 33 mapped, 0 remaining
**Estimated Completion:** TBD
**Next Phase:** Phase 15 - Secure Client Invitations

---
*Last updated: 2026-03-15*