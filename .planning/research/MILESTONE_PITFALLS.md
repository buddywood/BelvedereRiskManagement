# Domain Pitfalls: Client Invitations, Status Tracking & Notifications

**Domain:** Advisor workflow pipeline features
**Researched:** 2026-03-15

## Critical Pitfalls

### Pitfall 1: Synchronous Notification Delivery Blocking
**What goes wrong:** Server actions that send emails/SMS synchronously block the user interface while external API calls complete
**Why it happens:** Direct provider API calls in server actions without queuing, network latency/timeouts cascade to user
**Consequences:** Poor UX, timeout errors, cascade failures when notification providers have outages
**Prevention:** Always use async queuing for notification delivery, return success immediately after queuing
**Detection:** Monitor server action execution times >2 seconds, user complaints about slow invite sending

### Pitfall 2: Multi-Tenant Data Leakage in Status Events
**What goes wrong:** Status events expose client data to wrong advisors through improper filtering
**Why it happens:** Forgetting advisor ownership checks, trusting client-side user ID parameters
**Consequences:** GDPR violations, data breach, client confidentiality broken, regulatory compliance failure
**Prevention:** Always use `getAdvisorProfileOrThrow()` pattern, never trust frontend parameters for access control
**Detection:** Database queries that don't include `advisorId` filter, audit logs showing cross-tenant data access

### Pitfall 3: Invitation Token Security Vulnerabilities
**What goes wrong:** Predictable tokens, no expiration, tokens exposed in logs or URLs
**Why it happens:** Using weak randomness, storing tokens in plain text, logging invitation URLs
**Consequences:** Unauthorized account takeovers, client data access by wrong parties
**Prevention:** Use cryptographically secure random tokens, hash stored tokens, implement strict expiration
**Detection:** Security audit tools flagging weak randomness, tokens found in application logs

## Moderate Pitfalls

### Pitfall 4: Real-Time Dashboard Performance Degradation
**What goes wrong:** Dashboard becomes slow as status events accumulate, real-time updates overwhelm client
**Why it happens:** No pagination on status events, broadcasting every minor status change
**Prevention:** Implement event pagination, debounce status updates, use selective broadcasting
**Detection:** Dashboard load times >3 seconds, high database CPU usage on status queries

### Pitfall 5: Notification Provider Vendor Lock-in
**What goes wrong:** Direct API calls throughout codebase make switching providers expensive
**Why it happens:** Embedding Twilio/SendGrid specifics in business logic, no abstraction layer
**Prevention:** Create `NotificationService` interface, implement provider strategy pattern
**Detection:** Grep for provider-specific imports scattered across business logic files

### Pitfall 6: Invitation Email Deliverability Issues
**What goes wrong:** Invitation emails end up in spam, never delivered, wrong sender reputation
**Why it happens:** Improper SPF/DKIM setup, generic sender addresses, missing unsubscribe headers
**Prevention:** Configure proper DNS records, use branded sender domains, implement email best practices
**Detection:** High bounce rates, low invitation acceptance rates, emails in spam folders

## Minor Pitfalls

### Pitfall 7: Status Event Storage Bloat
**What goes wrong:** Status events table grows indefinitely, slowing queries
**Prevention:** Implement retention policy, archive old events, partition by date

### Pitfall 8: Race Conditions in Status Updates
**What goes wrong:** Concurrent status updates create inconsistent state
**Prevention:** Use database transactions, implement optimistic locking patterns

### Pitfall 9: Missing Notification Delivery Confirmations
**What goes wrong:** No visibility into whether notifications actually reached users
**Prevention:** Store delivery receipts, implement webhook handlers for provider callbacks

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Database Schema | Forgetting RLS policies on new models | Review existing RLS patterns, test with multiple advisor accounts |
| Invitation Flow | Weak token generation | Use crypto.randomUUID(), implement expiration, hash storage |
| Status Tracking | Real-time update spam | Debounce events, selective broadcasting, event batching |
| Multi-Channel Notifications | Provider coupling | Abstract notification interface, strategy pattern |
| Dashboard Integration | Query performance | Add proper indexes, implement caching, paginate events |
| Notification Templates | Hard-coded messages | Implement template system, allow advisor customization |
| Delivery Status | Fire-and-forget sending | Track delivery status, implement retry logic |
| Error Handling | Silent notification failures | Log delivery failures, implement alerting |

## Testing Strategies to Avoid Pitfalls

### Multi-Tenant Security Testing
```typescript
// Test cross-advisor data isolation
describe('Client Invitation Security', () => {
  it('prevents advisor from accessing other advisor invitations', async () => {
    const advisor1 = await createTestAdvisor()
    const advisor2 = await createTestAdvisor()

    const invitation = await createInvitation(advisor1.id)

    // Should throw error when advisor2 tries to access
    await expect(
      getInvitation(invitation.id, advisor2.userId)
    ).rejects.toThrow('Invitation not found')
  })
})
```

### Async Notification Testing
```typescript
// Test notification queuing
describe('Notification Delivery', () => {
  it('queues notifications without blocking user flow', async () => {
    const startTime = Date.now()

    await createClientInvitation(advisorId, clientEmail)

    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(500) // < 500ms
  })
})
```

### Performance Testing
```typescript
// Test status event pagination
describe('Status Event Performance', () => {
  it('handles large number of status events efficiently', async () => {
    // Create 10,000 status events
    await createManyStatusEvents(10000)

    const startTime = Date.now()
    const events = await getStatusEvents(advisorId, { page: 1, limit: 20 })
    const endTime = Date.now()

    expect(endTime - startTime).toBeLessThan(100)
    expect(events).toHaveLength(20)
  })
})
```

## Monitoring & Alerting

### Key Metrics to Track
- **Invitation delivery rate:** >95% emails delivered within 5 minutes
- **Status event query performance:** <100ms for dashboard loads
- **Notification queue depth:** <100 pending notifications
- **Cross-tenant data access attempts:** 0 successful violations

### Alert Thresholds
- **High notification queue depth:** >1000 pending items
- **Poor email deliverability:** <90% delivery rate
- **Slow status queries:** >500ms 95th percentile
- **Cross-tenant access violations:** Any successful breach

## Recovery Procedures

### Notification System Outage
1. Switch to backup provider automatically
2. Retry failed deliveries from queue
3. Notify advisors of delivery delays

### Database Performance Issues
1. Enable query monitoring and slow query logs
2. Add missing indexes for new models
3. Implement read replicas for dashboard queries

### Security Breach Response
1. Immediately revoke all active invitation tokens
2. Audit access logs for compromised accounts
3. Force password reset for affected users
4. Implement additional monitoring for suspicious patterns

## Sources

**Multi-Tenant Security:**
- [Multi-Tenant SaaS Architecture Design Guide](https://knowledgelib.io/software/system-design/multi-tenant-saas/2026)
- [The developer's guide to SaaS multi-tenant architecture](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)

**Notification System Pitfalls:**
- [Notification System Design: Architecture & Best Practices](https://www.magicbell.com/blog/notification-system-design)
- [Designing a Scalable Notification System: From HLD to LLD](https://medium.com/@anshulkahar2211/designing-a-scalable-notification-system-email-sms-push-from-hld-to-lld-reliability-to-d5b883d936d8)

**Real-Time Dashboard Issues:**
- [System Design Realtime Monitoring System: Complete Walkthrough](https://systemdesignschool.io/problems/realtime-monitoring-system/solution)
- [10 Best DevOps & Monitoring Dashboard Templates 2026](https://adminlte.io/blog/devops-monitoring-dashboard-templates/)