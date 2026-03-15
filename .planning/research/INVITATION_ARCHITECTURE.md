# Architecture Patterns: Client Invitations, Status Tracking & Notifications

**Domain:** Advisor workflow pipeline features
**Researched:** 2026-03-15

## Integration Overview

The new features integrate with existing governance platform through **three primary integration layers**: database models (new/modified), API actions (new server actions), and UI components (new advisor workflow components). All features leverage existing row-level security and ownership-enforced CRUD patterns.

### Component Integration Map

| New Feature | Integration Points | Existing Dependencies |
|-------------|-------------------|---------------------|
| **Client Invitations** | InviteCode model, signup flow, tenant assignment | User/Auth models, ClientAdvisorAssignment |
| **Status Tracking** | Dashboard queries, real-time data, progress tracking | Assessment/Interview models, advisor dashboard |
| **Notifications** | AdvisorNotification model, real-time delivery, multi-channel | AdvisorProfile, notification system |

## New vs Modified Components

### New Components Required

**Database Models:**
- `ClientInvitation` (new) - invitation workflow tracking
- `InvitationTemplate` (new) - customizable invitation templates
- `NotificationDelivery` (new) - multi-channel delivery tracking
- `StatusEvent` (new) - workflow state change tracking

**Server Actions:**
- `src/lib/actions/invitation-actions.ts` (new) - invite generation, validation, assignment
- `src/lib/actions/status-tracking-actions.ts` (new) - status queries, event logging
- `src/lib/actions/notification-delivery-actions.ts` (new) - multi-channel sending

**UI Components:**
- `src/components/invitations/` (new) - invitation management interface
- `src/components/status/` (new) - status tracking dashboard widgets
- `src/components/notifications/` (new) - notification preferences, delivery status

### Modified Components

**Extended Models:**
```prisma
// Extend existing AdvisorNotification
model AdvisorNotification {
  // ... existing fields
  deliveryChannels String[] // NEW: email, sms, in-app
  deliveryStatus   Json?    // NEW: per-channel delivery status
  templateId       String?  // NEW: link to notification template
}

// Extend ClientAdvisorAssignment
model ClientAdvisorAssignment {
  // ... existing fields
  invitationId     String?  // NEW: link to originating invitation
  onboardingStatus String   // NEW: NOT_INVITED, INVITED, ONBOARDING, COMPLETED
}
```

**Enhanced Actions:**
- `advisor-actions.ts` - add invitation management, enhanced notification queries
- `invite.ts` - extend for advisor-generated invitations vs admin invite codes

## Data Flow Architecture

### Client Invitation Flow

```
Advisor Dashboard → Create Invitation → Generate Secure Token →
Send Multi-Channel → Client Signup → Auto-Assignment → Status Tracking
```

**Key Integration Points:**
1. **Invitation Generation:** Leverage existing `InviteCode` pattern, extend for advisor-scoped invitations
2. **Client Assignment:** Auto-create `ClientAdvisorAssignment` upon successful signup
3. **Status Updates:** Trigger notifications through existing `AdvisorNotification` system

### Status Tracking Pipeline

```
Workflow Events → Status Event Logger → Real-Time Dashboard Updates →
Progress Indicators → Notification Triggers
```

**Existing Integration:**
- **Event Sources:** Assessment status, interview completion, approval workflow
- **Dashboard Queries:** Extend `getAdvisorDashboardClients()` with status tracking
- **Real-Time Updates:** Use existing React Suspense streaming for live updates

### Notification Delivery Architecture

```
Event Trigger → Notification Router → Channel Selection →
Multi-Provider Delivery → Status Tracking → Delivery Confirmation
```

**Provider Integration:**
- **Email:** Extend existing email infrastructure (likely Resend/SendGrid)
- **SMS:** New integration with Twilio/AWS SNS
- **In-App:** Extend existing `AdvisorNotification` real-time display

## Recommended Integration Patterns

### Pattern 1: Event-Driven Status Updates
```typescript
// New: Status event system
interface StatusEvent {
  entityType: 'CLIENT' | 'ASSESSMENT' | 'INTERVIEW'
  entityId: string
  status: string
  metadata: Json
  advisorId: string
}

// Integration with existing workflow
async function updateAssessmentStatus(assessmentId: string, status: AssessmentStatus) {
  // Existing: Update assessment
  const assessment = await updateAssessment(assessmentId, { status })

  // NEW: Log status event for tracking
  await createStatusEvent({
    entityType: 'ASSESSMENT',
    entityId: assessmentId,
    status,
    advisorId: getAdvisorFromAssessment(assessment)
  })

  // NEW: Trigger notifications if needed
  await triggerStatusNotification(assessment, status)
}
```

### Pattern 2: Multi-Tenant Invitation Scoping
```typescript
// Extend existing ownership patterns
async function createClientInvitation(advisorId: string, clientEmail: string) {
  // Leverage existing advisor profile ownership
  const advisor = await getAdvisorProfileOrThrow(advisorId)

  // Create scoped invitation
  const invitation = await prisma.clientInvitation.create({
    data: {
      advisorId: advisor.id,
      clientEmail,
      token: generateSecureToken(),
      expiresAt: addDays(new Date(), 7)
    }
  })

  // Integrate with existing notification system
  await createNotification(advisor.id, 'INVITATION_SENT', ...)
}
```

### Pattern 3: Real-Time Dashboard Integration
```typescript
// Extend existing dashboard queries
async function getAdvisorDashboardClients(advisorId: string) {
  // Existing client query
  const clients = await getAssignedClients(advisorId)

  // NEW: Add status tracking data
  const clientsWithStatus = await Promise.all(
    clients.map(async (client) => ({
      ...client,
      onboardingStatus: await getClientOnboardingStatus(client.id),
      recentStatusEvents: await getRecentStatusEvents(client.id),
      pendingNotifications: await getPendingNotifications(client.id)
    }))
  )

  return clientsWithStatus
}
```

## Scalability Architecture

### Database Design for Scale

**Row-Level Security Extension:**
```sql
-- Extend existing RLS for new models
CREATE POLICY invitation_advisor_isolation ON ClientInvitation
USING (advisorId = current_setting('app.advisor_id'));

CREATE POLICY status_event_advisor_isolation ON StatusEvent
USING (advisorId = current_setting('app.advisor_id'));
```

**Indexing Strategy:**
```sql
-- Performance indexes for new queries
CREATE INDEX CONCURRENTLY idx_client_invitation_advisor_status
ON ClientInvitation(advisorId, status, createdAt);

CREATE INDEX CONCURRENTLY idx_status_event_entity_time
ON StatusEvent(entityType, entityId, createdAt DESC);
```

### Real-Time Performance Patterns

**Streaming Dashboard Updates:**
- Extend existing React Suspense streaming with status event webhooks
- Use server-sent events for real-time status updates within existing dashboard components
- Implement optimistic updates for immediate UI feedback

**Notification Batching:**
- Batch non-urgent notifications (5-minute windows) to reduce provider API calls
- Immediate delivery for critical status changes (completed assessments)
- Digest notifications for daily/weekly advisor summaries

## Security Integration

### Multi-Tenant Isolation

**Advisor-Scoped Operations:**
All new operations respect existing advisor profile ownership:
```typescript
// Pattern: Always verify advisor ownership before operations
async function sendClientInvitation(invitationId: string, advisorUserId: string) {
  const advisor = await getAdvisorProfileOrThrow(advisorUserId)

  const invitation = await prisma.clientInvitation.findFirst({
    where: {
      id: invitationId,
      advisorId: advisor.id  // Ownership check
    }
  })

  if (!invitation) throw new Error('Invitation not found')
  // ... proceed with send
}
```

**Data Access Controls:**
- Inherit existing row-level security patterns for all new models
- Status events only visible to owning advisor
- Invitations scoped to creating advisor
- Notification delivery logs isolated by advisor profile

## Integration Dependencies & Build Order

### Phase 1: Foundation (Week 1-2)
1. **Database Models** - Add new tables with RLS policies
2. **Core Actions** - Basic CRUD operations for invitations/status
3. **Integration Points** - Extend existing actions with new functionality

**Dependencies:**
- Existing: User, AdvisorProfile, ClientAdvisorAssignment models
- Existing: Row-level security infrastructure
- Existing: Server action patterns

### Phase 2: Workflow Integration (Week 3-4)
1. **Status Tracking** - Event logging system integrated with existing workflows
2. **Dashboard Enhancement** - Extend existing dashboard queries and UI
3. **Invitation Flow** - Complete invitation-to-assignment pipeline

**Dependencies:**
- Phase 1 foundation
- Existing: Assessment, Interview, Approval workflows
- Existing: Dashboard components and queries

### Phase 3: Notification System (Week 5-6)
1. **Multi-Channel Delivery** - Email, SMS, in-app notification routing
2. **Real-Time Updates** - Event-driven dashboard updates
3. **Notification Preferences** - User controls for delivery channels

**Dependencies:**
- Phase 1-2 complete
- External: Email/SMS provider integrations (Resend, Twilio)
- Existing: AdvisorNotification system

### Phase 4: Polish & Optimization (Week 7-8)
1. **Performance Optimization** - Caching, indexing, real-time improvements
2. **Error Handling** - Delivery failure recovery, retry logic
3. **Admin Tools** - Monitoring, debugging, template management

**Dependencies:**
- All prior phases
- Monitoring/observability infrastructure

## Anti-Patterns to Avoid

### Anti-Pattern 1: Bypassing Ownership Checks
**What goes wrong:** Direct database queries without advisor ownership verification
**Why bad:** Breaks multi-tenant security, exposes client data across advisors
**Instead:** Always verify advisor ownership through existing profile patterns

### Anti-Pattern 2: Synchronous Notification Delivery
**What goes wrong:** Blocking user workflows while sending emails/SMS
**Why bad:** Poor UX, timeout failures, cascade failures from provider issues
**Instead:** Async queue-based delivery with status tracking

### Anti-Pattern 3: Tight Coupling to External Providers
**What goes wrong:** Direct Twilio/SendGrid calls throughout application code
**Why bad:** Vendor lock-in, difficult testing, provider outage cascades
**Instead:** Abstracted notification service with provider strategy pattern

## Sources

**Multi-Tenant Architecture:**
- [The developer's guide to SaaS multi-tenant architecture — WorkOS](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [How to Design a Multi-Tenant Notification Delivery System at Scale](https://medium.com/coding-nexus/how-to-design-a-multi-tenant-notification-delivery-system-email-sms-push-at-scale-494ab4a5e69b)
- [Architectural Approaches for Messaging in Multitenant Solutions - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/messaging)

**Real-Time Dashboard Architecture:**
- [System Design Realtime Monitoring System: A Complete Walkthrough](https://systemdesignschool.io/problems/realtime-monitoring-system/solution)
- [Real-time Updates Pattern for System Design Interviews](https://www.hellointerview.com/learn/system-design/patterns/realtime-updates)
- [How to Build a Real-Time Dashboard: A Step-by-Step Guide for Engineers](https://estuary.dev/blog/how-to-build-a-real-time-dashboard/)

**Notification System Design:**
- [Designing a Scalable Notification System (Email, SMS, Push): From HLD to LLD](https://medium.com/@anshulkahar2211/designing-a-scalable-notification-system-email-sms-push-from-hld-to-lld-reliability-to-d5b883d936d8)
- [How to Build a Notification System on AWS (Email, SMS, Push)](https://oneuptime.com/blog/post/2026-02-12-build-notification-system-on-aws/view)
- [Notification System Design: Architecture & Best Practices](https://www.magicbell.com/blog/notification-system-design)