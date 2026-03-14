---
phase: 09-advisor-portal-access
plan: 04
subsystem: advisor-review-ui
tags: [intake-review, audio-playback, risk-area-selection, approval-workflow, responsive-layout]
dependency:
  requires: [advisor-server-actions, intake-questions, risk-areas-constant, ui-components]
  provides: [intake-review-page, transcript-viewer, audio-player, approval-workflow-ui]
  affects: [advisor-portal-ui, intake-review-workflow, client-approval-process]
tech-stack:
  added: [audio-playback-controls, transcript-display, risk-selection-grid, approval-state-machine]
  patterns: [two-column-layout, sticky-sidebar, status-badges, confirmation-dialogs]
key-files:
  created: [src/components/advisor/TranscriptViewer.tsx, src/components/advisor/AudioPlayer.tsx, src/components/advisor/RiskAreaSelector.tsx, src/components/advisor/ApprovalActions.tsx, src/components/advisor/ReviewSidebar.tsx, src/app/(protected)/advisor/review/[id]/page.tsx]
  modified: []
decisions: [custom-audio-controls-over-native, risk-area-validation-inline, confirmation-dialogs-for-critical-actions, two-column-responsive-layout]
metrics:
  duration: 2283
  completed: 2026-03-14T21:59:35Z
---

# Phase 09 Plan 04: Advisor Intake Review Page Summary

Complete intake review page with transcript display, audio playback, risk area selection, and approval workflow for advisor-guided client assessment.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TranscriptViewer and AudioPlayer components | fd301f9 | src/components/advisor/TranscriptViewer.tsx, src/components/advisor/AudioPlayer.tsx |
| 2 | RiskAreaSelector, ApprovalActions, and review page | b961187 | src/components/advisor/RiskAreaSelector.tsx, src/components/advisor/ApprovalActions.tsx, src/components/advisor/ReviewSidebar.tsx, src/app/(protected)/advisor/review/[id]/page.tsx |

## Key Changes

**TranscriptViewer Component (`src/components/advisor/TranscriptViewer.tsx`):**
- Maps intake responses to questions using INTAKE_QUESTIONS lookup
- Displays question context and transcription with proper formatting
- Shows transcription status badges for failed transcriptions
- Integrates AudioPlayer for each response with audio
- Handles empty transcriptions with helpful messaging
- Future-proofed for confidence indicators

**AudioPlayer Component (`src/components/advisor/AudioPlayer.tsx`):**
- Custom HTML5 audio controls with play/pause/seek/speed functionality
- Playback speed cycling through 0.75x, 1x, 1.25x, 1.5x
- Progress bar with clickable seeking and time display
- Error handling for unavailable audio files
- Responsive design with clean compact layout
- CSS custom properties for webkit/moz slider styling

**RiskAreaSelector Component (`src/components/advisor/RiskAreaSelector.tsx`):**
- Grid layout of 8 RISK_AREAS with checkbox selection
- Visual highlighting for selected areas with primary colors
- Real-time selection count and validation messaging
- Minimum 1 area required for approval with inline validation
- Disabled state support for approved/rejected statuses
- Responsive grid (1 col mobile, 2 cols desktop)

**ApprovalActions Component (`src/components/advisor/ApprovalActions.tsx`):**
- Complete approval state machine: PENDING → IN_REVIEW → APPROVED/REJECTED
- Status-specific action buttons with confirmation dialogs
- Notes textarea for advisor review documentation
- Integration with server actions (markIntakeInReview, approveClientIntake, rejectClientIntake)
- Toast feedback for all operations with loading states
- Revoke/reopen functionality for status rollbacks

**ReviewSidebar Component (`src/components/advisor/ReviewSidebar.tsx`):**
- Client state wrapper managing selectedAreas and notes synchronization
- Connects RiskAreaSelector and ApprovalActions with shared state
- Handles approval data initialization and updates
- Disabled state propagation for completed reviews

**Review Page (`src/app/(protected)/advisor/review/[id]/page.tsx`):**
- Server component with Next.js 15+ async params pattern
- Two-column responsive layout (stacked on mobile, side-by-side on desktop)
- Client info header with submission metadata and status badges
- Sticky sidebar for review controls on desktop
- 404 handling for invalid interview IDs
- Navigation back to advisor dashboard

## Architecture Decisions

**Custom Audio Controls:** Built custom audio player instead of native browser controls for consistent UX and advanced features (speed control, custom styling, better mobile experience).

**Inline Risk Area Validation:** Validation messages appear directly in RiskAreaSelector component rather than only in ApprovalActions for immediate feedback.

**Confirmation Dialogs:** Critical actions (approve/reject) require confirmation to prevent accidental status changes that affect client access.

**Two-Column Responsive Layout:** Desktop users get transcript and approval controls simultaneously, mobile users get stacked layout for optimal readability.

## Verification Results

- ✅ Next.js build successful with new `/advisor/review/[id]` route
- ✅ TypeScript compilation clean for all components
- ✅ TranscriptViewer correctly maps responses to questions using questionId lookup
- ✅ AudioPlayer provides full playback controls with error handling
- ✅ RiskAreaSelector displays all 8 RISK_AREAS with proper validation
- ✅ ApprovalActions implements complete workflow state transitions
- ✅ Server actions integration for focus area storage and status updates
- ✅ Responsive layout works across device sizes
- ✅ Multi-tenant security through existing advisor-actions auth layer

## Success Criteria Achievement

- ✅ Advisor can view all transcribed responses mapped to questions
- ✅ Advisor can play back audio recordings with speed controls
- ✅ Advisor can select 1-8 focus risk areas from assessment subcategories
- ✅ Approval workflow persists status and focus areas via server actions
- ✅ Multi-tenant security: only assigned client intakes accessible through getIntakeReviewData
- ✅ Responsive layout works on desktop and tablet devices

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed IntakeResponse schema field mappings**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Used non-existent fields `questionNumber`, `duration`, `transcriptionConfidence`
- **Fix:** Updated to use actual schema fields `audioDuration` and derived question number from `questionId`
- **Files modified:** `src/components/advisor/TranscriptViewer.tsx`
- **Commit:** fd301f9

**2. [Rule 1 - Bug] Fixed Badge component variant**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Used non-existent `destructive` variant
- **Fix:** Changed to available `warning` variant for failed transcription status
- **Files modified:** `src/components/advisor/TranscriptViewer.tsx`
- **Commit:** fd301f9

**3. [Rule 3 - Blocking] Replaced styled-jsx with Tailwind classes**
- **Found during:** Task 2 development
- **Issue:** styled-jsx causing compilation complexity in AudioPlayer
- **Fix:** Converted to Tailwind CSS custom pseudo-selectors for slider styling
- **Files modified:** `src/components/advisor/AudioPlayer.tsx`
- **Commit:** b961187

## Self-Check: PASSED

**Created files verified:**
- ✅ src/components/advisor/TranscriptViewer.tsx (87 lines)
- ✅ src/components/advisor/AudioPlayer.tsx (202 lines)
- ✅ src/components/advisor/RiskAreaSelector.tsx (94 lines)
- ✅ src/components/advisor/ApprovalActions.tsx (251 lines)
- ✅ src/components/advisor/ReviewSidebar.tsx (28 lines)
- ✅ src/app/(protected)/advisor/review/[id]/page.tsx (145 lines)

**Commits verified:**
- ✅ fd301f9: TranscriptViewer and AudioPlayer components
- ✅ b961187: RiskAreaSelector, ApprovalActions, and review page

**Functional verification:**
- ✅ All components exceed minimum line requirements
- ✅ Key links implemented (review page → advisor-actions, RiskAreaSelector → RISK_AREAS)
- ✅ Must-have truths satisfied (read transcripts, play audio, select areas, approve clients)
- ✅ Server-side data access through getIntakeReviewData with proper auth
- ✅ Approval transitions update status and store selected focus areas