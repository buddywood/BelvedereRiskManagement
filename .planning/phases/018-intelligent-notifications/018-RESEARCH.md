# Phase 18: Intelligent Notifications - Research

**Researched:** 2026-03-15
**Domain:** Notification system architecture and email automation
**Confidence:** MEDIUM

## Summary

Modern notification systems require balancing automated workflow triggers with anti-fatigue measures. The current Belvedere system has basic in-app notifications and email infrastructure using Resend. Phase 18 needs intelligent scheduling, user preferences, escalation patterns, and cross-channel coordination.

**Primary recommendation:** Implement BullMQ-based job queuing with user preference controls and intelligent frequency management.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| BullMQ | ^5.x | Job queue/scheduling | Redis-backed, delayed jobs, enterprise features |
| Resend | ^6.9.2 | Email delivery | Already in use, developer-friendly API |
| ioredis | ^5.x | Redis client | BullMQ dependency, connection pooling |
| date-fns | ^4.1.0 | Date calculations | Already in use, timezone handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node-cron | ^3.x | Simple scheduling | Basic recurring jobs without Redis |
| @react-email/components | ^0.x | Email templates | Reusable email components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BullMQ | node-cron | Simpler but no persistence, delayed jobs |
| Resend | SendGrid | More features but complex API, higher cost |
| ioredis | node-redis | Less features but lower overhead |

**Installation:**
```bash
npm install bullmq ioredis @react-email/components
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── notifications/
│   │   ├── queues/           # BullMQ queue setup
│   │   ├── templates/        # Email templates
│   │   ├── triggers/         # Workflow event handlers
│   │   ├── preferences/      # User setting management
│   │   └── services/         # Email/push services
│   └── jobs/
│       ├── notification-worker.ts  # Background processor
│       └── reminder-cron.ts        # Scheduled jobs
└── app/api/
    ├── cron/
    │   └── notifications/     # Scheduled endpoints
    └── webhooks/
        └── notification-events/ # External triggers
```

### Pattern 1: Event-Driven Triggers
**What:** Database changes trigger notification events via database hooks or service layer
**When to use:** Real-time notifications based on workflow stage changes
**Example:**
```typescript
// Source: Current codebase pattern
export async function onWorkflowStageChange(
  clientId: string,
  fromStage: ClientWorkflowStage,
  toStage: ClientWorkflowStage
) {
  await notificationQueue.add('workflow-milestone', {
    clientId,
    fromStage,
    toStage,
    timestamp: new Date()
  });
}
```

### Pattern 2: Scheduled Reminder System
**What:** Recurring jobs check for stalled workflows and send reminders
**When to use:** Anti-stagnation notifications for incomplete processes
**Example:**
```typescript
// Source: Existing document reminder pattern
export async function scheduleClientReminders() {
  const stalledClients = await findStalledWorkflows();
  for (const client of stalledClients) {
    await reminderQueue.add('client-reminder', {
      clientId: client.id,
      stage: client.stage,
      daysSinceActivity: client.daysSinceActivity
    }, {
      delay: calculateReminderDelay(client.preferences)
    });
  }
}
```

### Pattern 3: Preference-Based Filtering
**What:** Check user preferences before sending any notification
**When to use:** All notification types to respect user choices
**Example:**
```typescript
// Source: Research on preference management
export async function shouldSendNotification(
  userId: string,
  notificationType: NotificationType,
  channel: NotificationChannel
): Promise<boolean> {
  const preferences = await getUserPreferences(userId);
  return preferences.isEnabled(notificationType, channel);
}
```

### Anti-Patterns to Avoid
- **Immediate email sending:** Use queues for reliability and rate limiting
- **Hard-coded delays:** Make all timing configurable through user preferences
- **Single notification channel:** Always consider user's preferred channels

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Job queuing | Custom setTimeout/setInterval | BullMQ | Persistence, retries, scaling, monitoring |
| Email templates | String concatenation | @react-email/components | Type safety, reusability, preview |
| Rate limiting | Custom throttling logic | BullMQ rate limiting | Built-in, Redis-backed, configurable |
| Cron scheduling | Custom interval management | BullMQ recurring jobs | Distributed, failure handling |
| User preferences | JSON blob storage | Structured preference schema | Validation, migration, querying |

**Key insight:** Notification systems require sophisticated queuing, rate limiting, and preference management that are deceptively complex to implement correctly.

## Common Pitfalls

### Pitfall 1: Notification Fatigue
**What goes wrong:** Users receive too many notifications and disable all alerts or churn
**Why it happens:** No frequency controls, sending duplicates across channels, irrelevant content
**How to avoid:** Implement granular user preferences, cross-channel deduplication, intelligent timing
**Warning signs:** Declining open rates, increased unsubscribes, poor app reviews

### Pitfall 2: Queue Failure Handling
**What goes wrong:** Failed notifications are lost or retried infinitely
**Why it happens:** No dead letter queue, improper error handling, missing monitoring
**How to avoid:** Configure BullMQ with exponential backoff, dead letter processing, and alerts
**Warning signs:** Silent notification failures, duplicate deliveries, memory leaks

### Pitfall 3: Database Locks from Triggers
**What goes wrong:** Notification triggers block main database operations
**Why it happens:** Synchronous notification sending in database triggers
**How to avoid:** Use async queue processing, keep triggers lightweight
**Warning signs:** Slow database operations, timeout errors, deadlocks

### Pitfall 4: Timezone and Scheduling Bugs
**What goes wrong:** Notifications sent at inappropriate times for users
**Why it happens:** Server timezone assumptions, daylight saving changes
**How to avoid:** Store user timezones, use UTC for calculations, test DST transitions
**Warning signs:** User complaints about timing, engagement drops in specific regions

### Pitfall 5: Configuration Scope Blindness
**What goes wrong:** Assuming notification preferences are user-wide only
**Why it happens:** Missing per-advisor, per-client, or per-workflow-type preferences
**How to avoid:** Design preference hierarchy: global → advisor → client → notification type
**Warning signs:** Users can't fine-tune preferences, all-or-nothing adoption

## Code Examples

Verified patterns from existing codebase and research:

### Current Email Infrastructure
```typescript
// Source: src/lib/email.ts
export async function sendAdvisorIntakeNotification(
  advisorEmail: string,
  advisorName: string,
  clientName: string,
  clientEmail: string,
  reviewUrl: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: advisorEmail,
    subject: `New Intake Ready for Review - ${clientName}`,
    html: templateHtml
  });
}
```

### Existing Notification Model
```typescript
// Source: prisma/schema.prisma
model AdvisorNotification {
  id          String           @id @default(cuid())
  advisorId   String
  type        NotificationType // NEW_INTAKE, INTAKE_UPDATED, SYSTEM
  title       String
  message     String
  referenceId String?
  read        Boolean          @default(false)
  createdAt   DateTime         @default(now())
}
```

### Current Cron Implementation
```typescript
// Source: src/app/api/cron/document-reminders/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader.substring(7) !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Invalid cron secret" }, { status: 401 });
  }

  const result = await processDocumentReminders();
  return NextResponse.json({
    success: true,
    clientsReminded: result.clientsReminded,
    processingTimeMs: Date.now() - startTime
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Immediate email sending | Queue-based processing | 2024-2025 | Reliability, rate limiting, monitoring |
| Simple cron jobs | BullMQ with Redis | 2025-2026 | Distributed processing, failure recovery |
| All-or-nothing preferences | Granular channel/type control | 2025-2026 | Reduced fatigue, higher engagement |
| Manual template creation | Component-based emails | 2024-2026 | Type safety, reusability, maintenance |

**Deprecated/outdated:**
- node-cron for complex scheduling: BullMQ provides better persistence and monitoring
- String-based email templates: Component libraries offer type safety and previews
- Manual rate limiting: Built-in queue throttling is more reliable

## Anti-Spam and Fatigue Prevention

### 2026 Best Practices
- **Frequency limits:** Maximum 2-5 notifications per week per user by default
- **Intelligent timing:** Avoid sending outside user's typical activity hours
- **Cross-channel deduplication:** Don't send same notification via multiple channels
- **Progressive escalation:** Start with in-app, escalate to email only if unread
- **User control:** Granular preferences for notification types and channels

### Chrome 2026 Anti-Spam Measures
- Automatic permission revocation for low-engagement notifications
- Enhanced spam protection muting unwanted alerts
- Proactive Safety Check removing dormant notification access

## Workflow Trigger Points

Based on existing ClientWorkflowStage enum:

| Trigger Event | Notification Type | Recipients | Timing |
|---------------|-------------------|------------|--------|
| Client registers | NOTIFY-01 | Advisor | Immediate |
| Stage: INTAKE_IN_PROGRESS > 7 days | NOTIFY-02 | Client | Daily reminders |
| Stage: INTAKE_COMPLETE | NOTIFY-03 | Advisor | Immediate |
| Stage: ASSESSMENT_IN_PROGRESS > 14 days | NOTIFY-02 | Client | Weekly reminders |
| Stage: ASSESSMENT_COMPLETE | NOTIFY-03 | Advisor | Immediate |
| Stage: DOCUMENTS_REQUIRED > 3 days | NOTIFY-04 | Client + Advisor | Escalating frequency |
| Any stage > 30 days | NOTIFY-04 | Advisor | Weekly escalation |

## Open Questions

1. **Redis Infrastructure**
   - What we know: BullMQ requires Redis 5.0+
   - What's unclear: Whether to use managed Redis (Upstash) or self-hosted
   - Recommendation: Research Vercel-compatible Redis options

2. **Multi-tenant Preferences**
   - What we know: Need user-level notification controls
   - What's unclear: Whether advisor-level defaults override client preferences
   - Recommendation: Design preference hierarchy before implementation

3. **Email Service Scaling**
   - What we know: Resend is already integrated
   - What's unclear: Rate limits and pricing at scale for high-volume notifications
   - Recommendation: Benchmark current usage patterns

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/src/lib/email.ts`, `/prisma/schema.prisma`, notification components
- Package.json: Resend v6.9.2, date-fns v4.1.0 already integrated

### Secondary (MEDIUM confidence)
- [Implementing Push Notifications in Next.js using Web Push and Server Actions](https://medium.com/@amirjld/implementing-push-notifications-in-next-js-using-web-push-and-server-actions-f4b95d68091f)
- [How to Build a Job Queue in Node.js with BullMQ and Redis](https://oneuptime.com/blog/post/2026-01-06-nodejs-job-queue-bullmq-redis/view)
- [How to Build a Notification System with BullMQ, Redis, and Node.js](https://medium.com/thebackendtech/how-to-build-a-notification-system-with-bullmq-redis-and-node-js-997fc704ea0b)
- [Resend vs Sendgrid Comparison (2026)](https://forwardemail.net/en/blog/resend-vs-sendgrid-email-service-comparison)
- [Designing a "User Settings" Database Table](https://basila.medium.com/designing-a-user-settings-database-table-e8084fcd1f67)

### Tertiary (LOW confidence)
- [App Push Notification Best Practices for 2026](https://appbot.co/blog/app-push-notifications-2026-best-practices/)
- [How to Reduce Notification Fatigue: 7 Proven Product Strategies](https://www.courier.com/blog/how-to-reduce-notification-fatigue-7-proven-product-strategies-for-saas)
- [Google Chrome Policy Updates 2026 – Rate Limits, Spam Protection](https://pushalert.co/blog/google-chrome-rate-limits-spam-protection-permission-removal/)

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - BullMQ/Redis verified, Resend already in use
- Architecture: MEDIUM - Patterns verified against existing codebase and industry standards
- Pitfalls: HIGH - Based on documented issues and existing system analysis

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days - notification ecosystem is relatively stable)