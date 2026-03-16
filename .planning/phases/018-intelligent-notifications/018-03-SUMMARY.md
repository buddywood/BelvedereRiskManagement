---
phase: 018-intelligent-notifications
plan: 03
subsystem: notification-scheduler
tags: [scheduled-reminders, notification-preferences, anti-fatigue, workflow-monitoring]
dependencies:
  requires: [018-01-notification-engine]
  provides: [scheduled-reminders, preference-management]
  affects: [advisor-workflow, client-engagement]
tech-stack:
  added: [cron-endpoints]
  patterns: [deduplication-windows, preference-mapping, stalled-detection]
key-files:
  created:
    - src/lib/reminders/assessment-reminders.ts
    - src/lib/reminders/workflow-reminders.ts
    - src/app/api/cron/workflow-reminders/route.ts
    - src/lib/actions/notification-actions.ts
    - src/components/advisor/NotificationPreferencesForm.tsx
    - src/app/(protected)/advisor/settings/notifications/page.tsx
  modified:
    - src/app/(protected)/advisor/notifications/page.tsx
decisions:
  - "Cron endpoint authentication via Bearer token for serverless compatibility"
  - "Assessment reminder thresholds: 7 days for intake, 14 days for assessment"
  - "Deduplication via user's reminderFrequencyDays preference (default 7 days)"
  - "Workflow stall detection using existing isStalled() logic (>7 days inactive)"
  - "Separate reminder processors for assessment (to clients) vs workflow (to advisors)"
  - "Checkbox UI over toggle switches for notification preferences"
metrics:
  duration: "30 minutes"
  tasks-completed: 2
  files-created: 6
  files-modified: 1
  completed-date: "2026-03-16"
---

# Phase 18 Plan 03: Scheduled Reminder System Summary

**One-liner:** Cron-driven reminder system for stalled assessments and workflows with user-configurable notification preferences to prevent alert fatigue.

## Objective Achieved

Implemented automated reminder system for workflow stalls and incomplete assessments, plus comprehensive notification preferences UI for user control (NOTIFY-02, NOTIFY-04, NOTIFY-05).

**Key Value:** Prevents client workflow abandonment through intelligent reminders while giving users granular control over notification frequency and types.

## Implementation Details

### Task 1: Scheduled Reminder Processors

**Assessment Reminders (to Clients):**
- Targets stalled intake interviews (>7 days) and assessments (>14 days)
- Uses user's reminderFrequencyDays preference for deduplication
- Sends to CLIENT with assessment reminder email template
- Respects shouldSendNotification() preferences

**Workflow Reminders (to Advisors):**
- Leverages existing isStalled() detection (>7 days inactive)
- Escalates clients stalled >30 days with 'stalled' category
- 7-day deduplication window via AdvisorNotification records
- Sends to ADVISOR with stalled workflow email template

**Cron Endpoint:**
- Bearer token authentication for serverless compatibility
- Parallel processing of both reminder types
- Returns comprehensive processing metrics
- Follows exact pattern of document-reminders endpoint

### Task 2: Notification Preferences UI

**Server Actions:**
- getNotificationPreferencesAction() - loads current/defaults
- updateNotificationPreferencesAction() - Zod-validated updates
- Uses requireAdvisorRole() auth pattern from existing codebase

**Form Component:**
- Master toggle (emailEnabled) disables sub-categories when off
- Category toggles for registrations, milestones, reminders, stalled alerts
- Reminder frequency input (1-30 days) with validation
- React Hook Form with Zod resolver integration

**Settings Page:**
- /advisor/settings/notifications route with proper navigation
- Back link to advisor settings page
- Error handling for failed preference loads
- Added "Notification Settings" link to notifications page

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Prisma relationship access patterns**
- **Found during:** Task 1 implementation
- **Issue:** Attempted to use singular `intakeInterview` and `assessment` relationships instead of plural arrays
- **Fix:** Updated to use `intakeInterviews` and `assessments` with array access and proper ordering
- **Files modified:** assessment-reminders.ts, workflow-reminders.ts
- **Commits:** c4bd560

**2. [Rule 1 - Bug] Corrected ClientAdvisorAssignment relationship includes**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Tried to include non-existent `invitation` field on ClientAdvisorAssignment model
- **Fix:** Separated invitation lookup via InviteCode model with proper filtering by advisorId
- **Files modified:** workflow-reminders.ts
- **Commits:** c4bd560

**3. [Rule 2 - Missing critical] Added email null check for advisor notifications**
- **Found during:** Task 1 implementation
- **Issue:** Could attempt to send email to advisor without email address
- **Fix:** Added null check with early continue to skip advisors without email
- **Files modified:** workflow-reminders.ts
- **Commits:** c4bd560

## Technical Integration

**Preference System Integration:**
- Leverages existing getUserPreferences() and updatePreferences() from 018-01
- Uses CATEGORY_TO_PREFERENCE_FIELD mapping for category-specific toggles
- Respects shouldSendNotification() logic for email delivery decisions

**Template System Integration:**
- Uses renderNotificationEmail() with 'reminder' and 'stalled' categories
- Passes advisor branding (firmName, logoUrl) for personalized emails
- Follows existing email template patterns with proper HTML escaping

**Authentication Integration:**
- Uses requireAdvisorRole() pattern consistent with existing advisor actions
- Proper error handling and return value patterns matching advisor-actions.ts
- Revalidates notification-related paths on preference updates

## Success Criteria Met

- ✅ **NOTIFY-02:** Clients receive contextual reminder emails for incomplete assessments (7-day intake, 14-day assessment thresholds)
- ✅ **NOTIFY-04:** Advisors receive escalation notifications for stalled workflows with configurable frequency
- ✅ **NOTIFY-05:** Users can toggle notification categories on/off and set reminder frequency through settings page
- ✅ **Anti-fatigue:** Deduplication prevents repeat notifications within user-configured frequency window

## Future Considerations

**Monitoring:** Cron endpoint provides processing metrics for operational monitoring
**Scalability:** Bearer token auth supports serverless deployment patterns
**Extensibility:** Preference schema supports future notification channels (SMS, push)

## Self-Check: PASSED

**Created files verified:**
- ✅ src/lib/reminders/assessment-reminders.ts
- ✅ src/lib/reminders/workflow-reminders.ts
- ✅ src/app/api/cron/workflow-reminders/route.ts
- ✅ src/lib/actions/notification-actions.ts
- ✅ src/components/advisor/NotificationPreferencesForm.tsx
- ✅ src/app/(protected)/advisor/settings/notifications/page.tsx

**Commits verified:**
- ✅ c4bd560: Task 1 - Scheduled reminder processors
- ✅ 1464afa: Task 2 - Notification preferences UI

**Functional verification:**
- ✅ Cron endpoint responds with valid JSON structure
- ✅ Settings page accessible via navigation hierarchy
- ✅ Form component properly handles preference toggles and validation