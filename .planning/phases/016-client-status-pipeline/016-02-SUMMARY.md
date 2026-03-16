---
phase: 016-client-status-pipeline
plan: 02
subsystem: Pipeline Dashboard
tags: [dashboard, real-time, sse, ui-components, tanstack-table]
completed: 2026-03-16T00:05:12Z
duration: 264
task_count: 2

dependency_graph:
  requires: ["016-01 (data pipeline foundation)", "existing advisor dashboard patterns"]
  provides: ["pipeline dashboard UI", "real-time SSE updates", "stage visualization components"]
  affects: ["016-03 (status dashboard)", "advisor portal navigation"]

tech_stack:
  added: ["SSE endpoint", "TanStack React Table", "Radix UI Select", "use-debounce", "EventSource API"]
  patterns: ["Suspense streaming", "real-time updates", "responsive table design", "visual step indicators"]

key_files:
  created:
    - "src/app/api/advisor/status-stream/route.ts"
    - "src/lib/actions/pipeline-actions.ts"
    - "src/lib/pipeline/hooks.ts"
    - "src/components/pipeline/StageIndicator.tsx"
    - "src/components/pipeline/PipelineFilters.tsx"
    - "src/components/pipeline/PipelineTable.tsx"
    - "src/app/(protected)/advisor/pipeline/page.tsx"
    - "src/app/(protected)/advisor/pipeline/PipelineView.tsx"
    - "src/app/(protected)/advisor/pipeline/loading.tsx"
    - "src/components/ui/select.tsx"
  modified:
    - "src/app/(protected)/advisor/page.tsx"

decisions:
  - "SSE polling every 30 seconds for simplicity over WebSocket complexity"
  - "TanStack Table for consistent table patterns with existing dashboard components"
  - "Visual step indicator shows abbreviated stage labels for compact table display"
  - "Responsive design hides columns on smaller screens for mobile usability"
  - "Pipeline navigation placed as first card in advisor portal for primary workflow"
---

# Phase 16 Plan 02: Pipeline Dashboard Summary

**One-liner:** Complete client pipeline dashboard with real-time SSE updates, TanStack Table with filtering/sorting, and visual stage indicators for comprehensive workflow tracking

## Objective Completed

Built a comprehensive client pipeline dashboard that provides advisors with real-time visibility into where every client is in the workflow. The dashboard replaces basic pipeline counts on the advisor portal with a full interactive table featuring stage filters, search capabilities, and live updates through Server-Sent Events.

## Tasks Completed

### Task 1: Create SSE endpoint, pipeline server actions, and real-time hook
- **Commit:** [96c8b6c] feat(016-02): create SSE endpoint, pipeline server actions, and real-time hook
- **Key Changes:**
  - Implemented `/api/advisor/status-stream` SSE endpoint with 30-second polling
  - Created `getClientPipelineData` server action following existing advisor action patterns
  - Added document requirement management actions (`addDocumentRequirement`, `removeDocumentRequirement`)
  - Built `usePipelineUpdates` hook with EventSource for real-time state management
  - Created `usePipelineFilters` hook for client-side filtering and sorting with debouncing
- **Files:** `src/app/api/advisor/status-stream/route.ts`, `src/lib/actions/pipeline-actions.ts`, `src/lib/pipeline/hooks.ts`

### Task 2: Build pipeline dashboard page with TanStack Table and visual components
- **Commit:** [6c5f13c] feat(016-02): build pipeline dashboard page with TanStack Table and visual components
- **Key Changes:**
  - Created `StageIndicator` component with compact visual step progression
  - Built `PipelineFilters` with stage dropdown, search input, and count badges
  - Implemented `PipelineTable` using TanStack Table with responsive columns and sorting
  - Added pipeline page with Suspense streaming pattern following dashboard architecture
  - Created client-side `PipelineView` component for real-time updates
  - Integrated Pipeline navigation card into advisor portal as primary workflow entry
- **Files:** `src/components/pipeline/*`, `src/app/(protected)/advisor/pipeline/*`, `src/components/ui/select.tsx`

## Technical Implementation

### Real-time Architecture
- **SSE endpoint** streams pipeline updates every 30 seconds with advisor isolation
- **EventSource client** handles automatic reconnection and parses JSON updates
- **Connection indicator** shows live/disconnected status with last update timestamp
- **Polling approach** chosen for simplicity over WebSocket complexity

### Dashboard Components
- **StageIndicator** displays abbreviated workflow steps with visual completion states
- **PipelineFilters** provide stage selection with count badges and debounced search
- **PipelineTable** implements responsive TanStack Table with sortable columns
- **Progress bars** show workflow completion percentage for each client

### User Experience
- **Suspense streaming** ensures fast initial render with skeleton fallback
- **Responsive design** hides columns appropriately on mobile and tablet
- **Live updates** refresh data automatically without user intervention
- **Rich filtering** allows narrowing by stage and searching by name/email

## Verification Results

✅ **TypeScript compilation:** Zero errors across all new components
✅ **SSE endpoint:** Streams events with proper authentication and advisor isolation
✅ **Pipeline table:** Renders client data with stage indicators and progress bars
✅ **Filters:** Stage dropdown and search work correctly with live count updates
✅ **Real-time updates:** EventSource connection establishes and updates client state
✅ **Advisor portal:** Pipeline navigation card integrated as primary workflow entry
✅ **Responsive layout:** Table adapts correctly on different screen sizes

## Dependencies Satisfied

**From Plan 016-01:** Leverages pipeline queries, types, and status computation functions
**From Existing Patterns:** Follows advisor dashboard Suspense streaming and table patterns
**From UI Components:** Uses established Badge, Progress, Input components with consistent styling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Added Radix UI Select component**
- **Found during:** PipelineFilters implementation
- **Issue:** No Select component available in UI library for stage filtering
- **Fix:** Created complete Radix UI Select component following established patterns
- **Files modified:** `src/components/ui/select.tsx`
- **Commit:** [6c5f13c]

## Self-Check: PASSED

✅ **Created files exist:**
- FOUND: src/app/api/advisor/status-stream/route.ts
- FOUND: src/lib/actions/pipeline-actions.ts
- FOUND: src/lib/pipeline/hooks.ts
- FOUND: src/components/pipeline/StageIndicator.tsx
- FOUND: src/components/pipeline/PipelineFilters.tsx
- FOUND: src/components/pipeline/PipelineTable.tsx
- FOUND: src/app/(protected)/advisor/pipeline/page.tsx
- FOUND: src/app/(protected)/advisor/pipeline/PipelineView.tsx
- FOUND: src/app/(protected)/advisor/pipeline/loading.tsx
- FOUND: src/components/ui/select.tsx

✅ **Commits exist:**
- FOUND: 96c8b6c (SSE and server actions)
- FOUND: 6c5f13c (dashboard components)

✅ **TypeScript compilation:** Passes without errors
✅ **Pipeline page:** Accessible at /advisor/pipeline with streaming content