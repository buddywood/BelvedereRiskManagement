# Technology Stack

**Project:** Belvedere Risk Management v1.4 - Advisor Workflow Pipeline
**Researched:** 2026-03-15

## Recommended Stack

### Client Invitation System
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Existing Prisma Schema | 7.4.0 | Database foundation | Extend existing models; proven across 4 milestones |
| Existing Resend | 6.9.2 | Email delivery | Already integrated for advisor notifications; reliable foundation |
| crypto (Node.js built-in) | Node 20+ | Invitation code generation | Secure random token generation without dependencies |

### Status Tracking Dashboard
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Existing TanStack React Table | 8.21.3 | Status pipeline display | Already proven for governance dashboard; supports custom sorting |
| Existing Recharts | 3.8.0 | Progress visualizations | Consistent with existing analytics; TypeScript support |
| Server-Sent Events (SSE) | Native | Real-time status updates | Simple, production-ready for one-way updates; no external deps |
| Existing TanStack Query | 5.90.21 | Status data management | Proven caching and invalidation for dashboard updates |

### Automated Notification System
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Existing AdvisorNotification model | Current | In-app notifications | Foundation exists; extend for pipeline events |
| Existing Resend templates | 6.9.2 | Email notifications | Proven HTML email templates; consistent branding |
| Node.js setTimeout | Native | Deadline reminders | Simple scheduling for short-term notifications |

## Extensions to Existing Stack

### Database Schema Extensions
| Model | Purpose | Integration Point |
|-------|---------|-------------------|
| ClientInvitation | Track invitation codes and status | Extends User model relationships |
| ClientStatus | Pipeline stage tracking | Links User to status enum |
| NotificationType enum | Add pipeline events | Extend existing enum with INVITATION_SENT, STATUS_CHANGED, etc. |

### API Route Extensions
| Route | Purpose | Existing Pattern |
|-------|---------|------------------|
| `/api/invitations` | Invitation CRUD | Follow `/api/auth/register` pattern |
| `/api/status/[id]` | Status updates | Follow `/api/intake/[id]` pattern |
| `/api/notifications/sse` | Real-time updates | New SSE endpoint using Route Handlers |

## Installation

```bash
# No new dependencies required
# All features use existing stack:
# - Prisma 7.4.0 (schema extensions only)
# - Resend 6.9.2 (new email templates)
# - TanStack Query/Table/React (existing versions)
# - Recharts 3.8.0 (new status charts)
```

## Architecture Integration

### Invitation System
- **Database**: Extend existing User/AdvisorProfile relationships
- **Email**: Reuse existing Resend infrastructure
- **Auth**: Integrate with existing Auth.js v5 flow
- **UI**: Follow existing card-based design patterns

### Status Tracking
- **Real-time**: SSE for live updates (simpler than WebSocket for one-way data)
- **Dashboard**: Extend existing advisor portal layout
- **Caching**: TanStack Query for optimistic updates
- **Charts**: Recharts for pipeline progression visualization

### Notifications
- **In-app**: Extend existing AdvisorNotification system
- **Email**: New Resend templates following existing patterns
- **Scheduling**: Native setTimeout for deadline notifications (< 24hr)

## What NOT to Add

| Technology | Why Avoid | Alternative |
|------------|-----------|-------------|
| Socket.IO | Overkill for one-way status updates | Server-Sent Events |
| Bull/Redis queues | Complex for simple deadline notifications | setTimeout for short-term |
| Separate notification service | Added complexity | Extend existing notification system |
| Push notifications | Not needed for advisor workflow | Email + in-app sufficient |
| External status tracking APIs | Unnecessary dependency | Build on existing dashboard |
| Separate invitation service | Already have user management | Extend current auth system |

## Integration Points

### With Existing v1.3 Features
- **Advisor Dashboard**: Add invitation management to existing multi-client view
- **Client Portal**: Status tracking integration with family dashboard
- **Notification Bell**: Extend existing NotificationBell component
- **Email System**: Add templates to existing email.ts infrastructure

### Database Relationships
```prisma
// Extend existing User model
model User {
  // ... existing fields
  sentInvitations     ClientInvitation[] @relation("InvitedBy")
  receivedInvitation  ClientInvitation?  @relation("InvitedClient")
  clientStatus        ClientStatus?
}

// New models integrate with existing patterns
model ClientInvitation {
  id          String            @id @default(cuid())
  code        String            @unique
  email       String
  status      InvitationStatus  @default(PENDING)
  expiresAt   DateTime
  // ... relations to existing User model
}
```

## Performance Considerations

| Feature | Load Pattern | Optimization |
|---------|--------------|--------------|
| Status Dashboard | Real-time updates for 50+ clients | SSE + TanStack Query caching |
| Invitation Tracking | Bulk operations | Database indexes on status/email |
| Notifications | High-frequency pipeline events | Batching via existing notification system |

## Security Considerations

| Component | Security Measure | Implementation |
|-----------|------------------|----------------|
| Invitation Codes | Cryptographically secure | crypto.randomBytes(32) |
| Status Updates | Role-based access | Extend existing ownership patterns |
| Email Templates | XSS protection | Existing Resend HTML sanitization |
| SSE Endpoints | Authentication | Auth.js v5 session verification |

## Sources

**Stack Research:**
- [Real-Time Notifications with Server-Sent Events (SSE) in Next.js - Pedro Alonso](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/)
- [Building Real-Time Notifications with Upstash Redis, Next.js Server Actions and Vercel](https://upstash.com/blog/realtime-notifications)
- [Implementing Push Notifications in Next.js using Web Push and Server Actions](https://medium.com/@amirjld/implementing-push-notifications-in-next-js-using-web-push-and-server-actions-f4b95d68091f)

**Pipeline & Status Tracking:**
- [12 Free Client List Templates for Tracking Contacts in 2026](https://clickup.com/blog/client-list-templates/)
- [10 Best Data Pipeline Monitoring Tools for ETL & Cloud Data Transformation (2026)](https://www.integrate.io/blog/data-pipeline-monitoring-tools/)
- [GitHub - meirwah/awesome-workflow-engines](https://github.com/meirwah/awesome-workflow-engines)

**Database Schema Patterns:**
- [Prisma Schema API | Prisma Documentation](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Advanced Database Schema Management with Atlas & Prisma ORM](https://www.prisma.io/blog/advanced-database-schema-management-with-atlas-and-prisma-orm)
- [The Complete Guide to Storing Multiple Enums in Database: 2026 Best Practices](https://copyprogramming.com/howto/best-way-to-store-multiple-enums-in-database)