# Technology Stack: Client Invitations, Status Tracking & Notifications

**Project:** Advisor workflow pipeline features
**Researched:** 2026-03-15

## Recommended Stack Extensions

### Core Framework Extensions
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js 15 | 15.x | Server actions for invitation/notification logic | Existing foundation, proven server action patterns |
| Prisma 7 | 7.x | Extended schema with new models + RLS | Existing multi-tenant patterns, mature row-level security |
| PostgreSQL | 14+ | Core database with new tables | Existing foundation, supports Prisma RLS policies |

### New Infrastructure Components
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Redis | 7.x | Notification queuing + status caching | Industry standard for async job queues, low-latency caching |
| Resend/SendGrid | Latest | Email delivery service | Resend for developer experience, SendGrid for enterprise scale |
| Twilio | v2024 | SMS delivery service | Market leader for SMS APIs, reliable delivery rates |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @prisma/client | 7.x | Database access with ownership patterns | All database operations, extend existing patterns |
| zod | ^3.22 | Validation for invitation/notification schemas | Server action validation, API input sanitization |
| date-fns | ^3.0 | Date manipulation for invitations/tracking | Invitation expiry, status event timestamps |
| react-query/swr | Latest | Client-side caching for dashboard updates | Real-time dashboard data, optimistic updates |

## Integration Strategy

### Leverage Existing Infrastructure
```typescript
// Extend current Prisma client patterns
export const prisma = new PrismaClient({
  // Existing configuration
}).$extends({
  query: {
    // Extend existing RLS middleware for new models
    clientInvitation: {
      findMany: ({ args, query }) => {
        // Apply advisor ownership filter
        return query({
          ...args,
          where: {
            ...args.where,
            advisorId: getCurrentAdvisorId()
          }
        })
      }
    }
  }
})
```

### New Service Abstractions
```typescript
// Notification service abstraction
interface NotificationService {
  sendEmail(to: string, template: string, data: any): Promise<DeliveryResult>
  sendSMS(to: string, message: string): Promise<DeliveryResult>
  sendInApp(userId: string, notification: any): Promise<DeliveryResult>
}

// Implementation with provider fallbacks
class MultiChannelNotificationService implements NotificationService {
  private emailProvider: ResendProvider | SendGridProvider
  private smsProvider: TwilioProvider
  private inAppProvider: DatabaseProvider
}
```

## Database Schema Extensions

### New Models Required
```prisma
model ClientInvitation {
  id          String    @id @default(cuid())
  advisorId   String
  clientEmail String
  token       String    @unique
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime
  sentAt      DateTime?
  acceptedAt  DateTime?
  createdAt   DateTime  @default(now())

  advisor     AdvisorProfile @relation(fields: [advisorId], references: [id])

  @@index([advisorId, status])
  @@index([token])
}

model StatusEvent {
  id         String   @id @default(cuid())
  advisorId  String
  entityType String   // CLIENT, ASSESSMENT, INTERVIEW
  entityId   String
  status     String
  metadata   Json?
  createdAt  DateTime @default(now())

  advisor    AdvisorProfile @relation(fields: [advisorId], references: [id])

  @@index([advisorId, entityType, entityId])
  @@index([createdAt])
}

model NotificationDelivery {
  id             String   @id @default(cuid())
  notificationId String
  channel        String   // EMAIL, SMS, IN_APP
  provider       String   // RESEND, TWILIO, etc
  status         String   // PENDING, SENT, DELIVERED, FAILED
  providerRef    String?  // Provider's delivery ID
  sentAt         DateTime?
  deliveredAt    DateTime?
  failureReason  String?
  createdAt      DateTime @default(now())

  notification   AdvisorNotification @relation(fields: [notificationId], references: [id])

  @@index([notificationId])
  @@index([status, createdAt])
}

enum InvitationStatus {
  PENDING
  SENT
  ACCEPTED
  EXPIRED
  CANCELLED
}
```

### Extended Models
```prisma
// Extend existing AdvisorNotification
model AdvisorNotification {
  id              String    @id @default(cuid())
  // ... existing fields
  deliveryMethods String[]  @default(["IN_APP"]) // NEW
  templateId      String?   // NEW
  urgency         String    @default("NORMAL") // NEW: HIGH, NORMAL, LOW

  deliveries      NotificationDelivery[] // NEW
}

// Extend existing ClientAdvisorAssignment
model ClientAdvisorAssignment {
  id               String           @id @default(cuid())
  // ... existing fields
  invitationId     String?          // NEW
  onboardingStatus String           @default("NOT_INVITED") // NEW

  invitation       ClientInvitation? @relation(fields: [invitationId], references: [id])
}
```

## API Architecture

### Server Actions Extension
```typescript
// src/lib/actions/invitation-actions.ts
export async function createClientInvitation(data: CreateInvitationData) {
  const advisor = await getAdvisorProfileOrThrow(userId)

  const invitation = await prisma.clientInvitation.create({
    data: {
      advisorId: advisor.id,
      clientEmail: data.email,
      token: generateSecureToken(),
      expiresAt: addDays(new Date(), 7)
    }
  })

  // Queue notification sending
  await queueNotificationDelivery(invitation)

  return { success: true, data: invitation }
}

// src/lib/actions/status-tracking-actions.ts
export async function logStatusEvent(event: StatusEventData) {
  const advisor = await getAdvisorProfileOrThrow(userId)

  await prisma.statusEvent.create({
    data: {
      advisorId: advisor.id,
      ...event
    }
  })

  // Trigger real-time dashboard update
  await broadcastStatusUpdate(advisor.id, event)
}
```

### Real-Time Updates
```typescript
// src/lib/realtime/status-updates.ts
export async function broadcastStatusUpdate(advisorId: string, event: StatusEvent) {
  // Use Server-Sent Events for real-time dashboard updates
  const clients = getConnectedClients(advisorId)

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(event)}\n\n`)
  })
}
```

## Installation & Setup

### Core Dependencies
```bash
# Extend existing stack
npm install @prisma/client@7 prisma@7
npm install redis @redis/client
npm install resend twilio
npm install date-fns zod
npm install @tanstack/react-query # if not already installed
```

### Development Dependencies
```bash
npm install -D @types/node
npm install -D prisma-erd-generator # for schema visualization
```

### Environment Variables
```bash
# Add to existing .env
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

## Deployment Considerations

### Production Setup
- **Redis:** Use managed service (Upstash, AWS ElastiCache) for queue persistence
- **Email:** Start with Resend for development, consider SendGrid for volume
- **SMS:** Twilio standard, consider AWS SNS for cost optimization at scale
- **Monitoring:** Add delivery status tracking to existing observability stack

### Performance Optimization
- **Database:** Add indexes for advisor-scoped queries on new models
- **Caching:** Cache invitation tokens and status events in Redis
- **Real-time:** Implement connection pooling for dashboard updates

## Sources

**Multi-Tenant Notifications:**
- [How to Design a Multi-Tenant Notification Delivery System at Scale](https://medium.com/coding-nexus/how-to-design-a-multi-tenant-notification-delivery-system-email-sms-push-at-scale-494ab4a5e69b)
- [The 5 best notification infrastructure platforms for developers in 2026](https://knock.app/blog/the-top-notification-infrastructure-platforms-for-developers)

**Real-Time Architecture:**
- [Real-time Updates Pattern for System Design Interviews](https://www.hellointerview.com/learn/system-design/patterns/realtime-updates)
- [How to Build a Real-Time Dashboard: A Step-by-Step Guide](https://estuary.dev/blog/how-to-build-a-real-time-dashboard/)