# Feature Landscape: Client Invitations, Status Tracking & Notifications

**Domain:** Advisor workflow pipeline features
**Researched:** 2026-03-15

## Table Stakes

Features users expect for modern advisor workflow management. Missing = platform feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Client Invitation Generation** | All SaaS platforms have invite workflows | Low | Extend existing invite code pattern |
| **Email Invitation Delivery** | Standard onboarding expectation | Medium | Requires email provider integration |
| **Invitation Status Tracking** | Advisors need visibility into sent invites | Low | Basic status enum with timestamps |
| **Client Auto-Assignment** | Manual assignment breaks onboarding flow | Medium | Integrate with existing ClientAdvisorAssignment |
| **Dashboard Status Indicators** | Advisors expect workflow visibility | Medium | Extend existing dashboard queries |
| **Basic Notification Preferences** | Users expect control over notifications | Low | Simple opt-in/opt-out for channels |
| **In-App Notification Display** | Standard for web applications | Low | Extend existing AdvisorNotification system |

## Differentiators

Features that set the advisor workflow apart. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-Channel Invitation Delivery** | Send invites via email + SMS for higher acceptance | High | Requires SMS provider integration, phone collection |
| **Real-Time Dashboard Updates** | Live progress tracking without page refresh | High | Server-sent events, WebSocket complexity |
| **Invitation Template Customization** | Branded invitations increase acceptance rates | Medium | Template system with advisor branding |
| **Smart Notification Batching** | Reduce notification fatigue with intelligent grouping | High | Complex logic for batching rules |
| **Delivery Status Analytics** | Advisor insights into invitation effectiveness | Medium | Track open rates, click rates, acceptance rates |
| **Automated Follow-Up Sequences** | Increase invitation acceptance through reminders | High | Multi-step automation with timing logic |
| **Client Onboarding Progress Tracking** | Visual progress indicators for complex workflows | Medium | Multi-step status tracking with percentages |
| **Notification Channel Fallbacks** | Retry failed emails via SMS automatically | High | Provider failure detection and routing |

## Anti-Features

Features to explicitly NOT build for this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex Workflow Builder** | Over-engineering for simple invitation flow | Use fixed workflow with configurable templates |
| **Advanced Role-Based Invitations** | Adds complexity without clear value | Single "client" role invitation only |
| **Real-Time Chat/Messaging** | Feature creep, out of scope | Focus on status notifications |
| **Mobile Push Notifications** | Requires mobile app, platform complexity | Web notifications and email/SMS |
| **Integration with External CRMs** | Complex, many edge cases | Manual export/import for now |
| **Advanced Analytics Dashboard** | Feature creep, needs separate design phase | Basic delivery status only |
| **Bulk Invitation Management** | Complex UI, edge cases | One-by-one invitations initially |
| **White-Label Invitation Branding** | Multi-tenant complexity | Standard Belvedere branding |

## Feature Dependencies

```
Client Invitation Creation → Email/SMS Delivery → Status Tracking
                        ↓
Client Account Creation → Auto-Assignment → Onboarding Tracking
                        ↓
Dashboard Integration → Real-Time Updates → Notification Triggers
```

### Critical Path Dependencies
1. **Invitation Model** → All other features depend on core invitation data structure
2. **Notification Service** → Email/SMS delivery and status tracking both require provider abstraction
3. **Status Event System** → Dashboard and notification features need event logging foundation

## MVP Recommendation

Prioritize for initial implementation:

### Phase 1: Core Invitation Flow
1. **Client invitation creation** - Advisor generates invitation from dashboard
2. **Email delivery** - Send invitation email with secure signup link
3. **Status tracking** - Basic PENDING/SENT/ACCEPTED status display
4. **Auto-assignment** - Automatic ClientAdvisorAssignment creation on signup

### Phase 2: Dashboard Integration
1. **Status indicators** - Show invitation status in advisor dashboard
2. **Real-time updates** - Live status changes without page refresh
3. **Basic notifications** - In-app alerts for invitation acceptance

### Phase 3: Multi-Channel Enhancement
1. **SMS invitations** - Optional SMS delivery for higher acceptance
2. **Notification preferences** - Advisor control over notification channels
3. **Delivery tracking** - Visibility into email/SMS delivery status

**Defer for later milestones:**
- **Template customization:** Complex editor interface needs separate design
- **Analytics dashboard:** Requires data collection period and separate analytics phase
- **Automated follow-ups:** Complex timing logic better suited for workflow automation phase
- **Mobile push notifications:** Requires mobile app development

## Feature Validation Criteria

### Core Invitation Flow
- **Success Metric:** >90% invitation acceptance rate within 24 hours
- **Performance:** Invitation creation <500ms, email delivery queued <100ms
- **Security:** No cross-advisor invitation access, secure token generation

### Status Tracking
- **Success Metric:** Real-time status updates within 5 seconds
- **Usability:** Status changes visible without page refresh
- **Data Integrity:** All status transitions logged with timestamps

### Notification System
- **Success Metric:** >95% notification delivery rate
- **Reliability:** Graceful degradation when providers fail
- **User Control:** Advisors can configure notification preferences

## Integration Points with Existing Features

### Advisor Dashboard
- **Client Cards:** Add invitation status badges
- **Quick Actions:** "Invite Client" button on dashboard
- **Metrics:** Include invitation metrics in dashboard stats

### Assessment Workflow
- **Trigger Point:** Assessment completion triggers invitation for family members
- **Status Integration:** Assessment status affects invitation sending eligibility

### Notification System
- **Extension:** Leverage existing AdvisorNotification for in-app alerts
- **Enhancement:** Add email/SMS channels to existing notification types

## Technical Constraints

### Platform Limitations
- **Email Provider:** Must integrate with existing email infrastructure (likely Resend)
- **Database:** Must use existing Prisma 7 + PostgreSQL setup
- **Authentication:** Must integrate with existing Auth.js v5 system
- **Security:** Must follow existing row-level security patterns

### Performance Requirements
- **Invitation Creation:** <500ms end-to-end
- **Status Updates:** <5 second real-time propagation
- **Dashboard Load:** <2 seconds with invitation data included

### Compliance Requirements
- **Data Privacy:** GDPR-compliant invitation handling
- **Security:** Secure token generation and storage
- **Audit Trail:** All invitation activities logged for compliance

## User Experience Priorities

### Advisor Experience
1. **Simple invitation creation** - One-click invite from client list
2. **Clear status visibility** - Obvious invitation states and progress
3. **Reliable notifications** - Trustworthy alerts about invitation acceptance

### Client Experience
1. **Professional invitations** - Branded, clear, trustworthy invitation emails
2. **Smooth signup process** - Pre-filled forms, minimal friction
3. **Clear next steps** - Obvious path to complete onboarding

### Error Handling
1. **Graceful failures** - Clear error messages for failed invitations
2. **Recovery options** - Easy re-sending of failed invitations
3. **Provider fallbacks** - Automatic retry with different provider

## Sources

**SaaS Invitation Best Practices:**
- [Build a multi-tenant SaaS application: Complete Guide](https://logto.medium.com/build-a-multi-tenant-saas-application-a-complete-guide-from-design-to-implementation-d109d041f253)
- [The developer's guide to SaaS multi-tenant architecture](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)

**Notification System Features:**
- [The 5 best notification infrastructure platforms for developers in 2026](https://knock.app/blog/the-top-notification-infrastructure-platforms-for-developers)
- [Notification Infrastructure for email, sms, slack, push, inbox](https://www.suprsend.com/)

**Real-Time Dashboard Capabilities:**
- [How to Build a Real-Time Dashboard: A Step-by-Step Guide](https://estuary.dev/blog/how-to-build-a-real-time-dashboard/)
- [A step-by-step guide to build a real-time dashboard](https://www.tinybird.co/blog/real-time-dashboard-step-by-step)