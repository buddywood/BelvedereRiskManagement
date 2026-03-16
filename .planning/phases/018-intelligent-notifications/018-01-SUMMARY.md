---
phase: 018-intelligent-notifications
plan: 01
subsystem: notification-engine
tags: [notifications, preferences, email-templates, deduplication]
dependency-graph:
  requires: [prisma-schema, resend-email, advisor-profiles]
  provides: [notification-service, preference-system, email-templates]
  affects: [advisor-dashboard, client-communication]
tech-stack:
  added: [notification-preferences-model]
  patterns: [preference-aware-dispatch, 24h-deduplication, branded-templates]
key-files:
  created:
    - src/lib/notifications/types.ts
    - src/lib/notifications/preferences.ts
    - src/lib/notifications/service.ts
    - src/lib/notifications/templates.ts
  modified:
    - prisma/schema.prisma
decisions:
  - "24-hour deduplication window prevents notification spam while allowing reasonable re-notifications"
  - "Category-to-preference mapping enables granular notification control per notification type"
  - "Quiet hours stored as UTC strings for simple timezone-agnostic implementation"
  - "In-app notifications always created regardless of email preferences for advisor workflow continuity"
metrics:
  duration: "4 minutes"
  completed-date: "2026-03-16"
---

# Phase 18 Plan 01: Notification Engine Foundation Summary

**JWT auth with refresh rotation using jose library**

## Overview

Built the core notification engine infrastructure providing preference-aware dispatch, email templates, and deduplication logic. Establishes the foundation for intelligent notifications that Plans 02 and 03 will wire into event triggers and scheduled jobs.

## What Was Built

### Schema Extensions
- Extended NotificationType enum with CLIENT_REGISTERED, MILESTONE_COMPLETE, WORKFLOW_STALLED, DOCUMENT_UPLOADED
- Added NotificationPreference model with per-category email toggles, frequency control, and quiet hours support
- Established user relationship for preference management

### Notification Service Layer
- **sendNotification()** - Main dispatch function with preference checking and dual-channel delivery
- **shouldSendNotification()** - Preference engine with quiet hours and category-specific controls
- **createInAppNotification()** - Simplified in-app only notification creation
- **getUserPreferences()/updatePreferences()** - Preference CRUD operations with defaults

### Email Templates
- Registration: "New client {name} has registered from your invitation"
- Milestone: "{clientName} has completed {milestone}"
- Stalled workflow: "{clientName} inactive for {days} days at {stage}"
- Assessment reminder: "Your assessment is waiting - complete it to receive recommendations"
- All templates follow existing Belvedere styling with advisor branding support

### Deduplication Logic
- 24-hour window prevents duplicate in-app notifications for identical advisor+type+reference combinations
- Email notifications respect user preferences and quiet hours independently

## Technical Implementation

**Preference System:**
```typescript
// Category-specific email controls
emailMilestones: boolean      // NOTIFY-03: milestone completions
emailReminders: boolean       // NOTIFY-02: assessment reminders
emailStalled: boolean         // NOTIFY-04: stalled workflow alerts
emailRegistrations: boolean   // NOTIFY-01: client registrations
```

**Dispatch Flow:**
1. Check `shouldSendNotification()` for email channel
2. If allowed, render template and send via Resend
3. If advisorProfileId provided, create in-app notification (always)
4. Deduplication prevents repeat in-app notifications within 24 hours

**Template Rendering:**
- Follows existing reminder-email.ts patterns
- HTML escaping prevents XSS
- HTTPS logo validation for security
- Advisor branding: { firmName?, logoUrl? }

## Files Created

| File | Purpose | Exports |
|------|---------|---------|
| `types.ts` | Type definitions and category mapping | NotificationCategory, SendNotificationParams, CATEGORY_TO_PREFERENCE_FIELD |
| `preferences.ts` | Preference CRUD and checking logic | getUserPreferences, shouldSendNotification, updatePreferences |
| `service.ts` | Core dispatch with deduplication | sendNotification, createInAppNotification |
| `templates.ts` | Branded email templates | renderNotificationEmail |

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Verification

✅ **Notification engine can dispatch email + in-app notifications** - sendNotification() handles both channels with preference awareness

✅ **Preference system allows per-category opt-out** - NotificationPreference model provides granular controls for each notification type

✅ **Deduplication prevents repeat notifications within 24-hour window** - isDuplicateNotification() checks existing records before creating in-app notifications

✅ **Email templates follow existing branded template patterns** - All templates use escapeHtml, HTTPS validation, and advisor branding like existing reminder-email.ts

✅ **All code compiles without errors** - Schema validation passes, TypeScript compilation successful

## Dependencies Ready

The notification service is now ready for:
- **Plan 02**: Event triggers (client registration, milestone completion, document uploads)
- **Plan 03**: Scheduled jobs (stalled workflow detection, assessment reminders)

Both plans can import and use `sendNotification()` with proper template data to deliver intelligent, preference-aware notifications across email and in-app channels.

## Self-Check: PASSED

**Files verified:**
- ✅ `prisma/schema.prisma` - Contains NotificationPreference model and extended NotificationType enum
- ✅ `src/lib/notifications/types.ts` - TypeScript types compile cleanly
- ✅ `src/lib/notifications/preferences.ts` - Preference logic with quiet hours support
- ✅ `src/lib/notifications/service.ts` - Main dispatch function with deduplication
- ✅ `src/lib/notifications/templates.ts` - Branded email templates for all categories

**Commits verified:**
- ✅ `1a7725d` - Schema extensions and types
- ✅ `9af791a` - Service layer, preferences, and templates