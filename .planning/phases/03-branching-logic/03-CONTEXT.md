# Phase 3: Branching Logic - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Assessment adapts to user context, skipping irrelevant questions to achieve 12-minute completion target. System presents only relevant questions based on prior answers (e.g., skip trustee questions if no trusts), user completes assessment in 12-15 minutes, and all conditional paths validate correctly without orphaned data.

</domain>

<decisions>
## Implementation Decisions

### Progress tracking & completion
- Percentage-based progress display instead of question counts (more intuitive with dynamic totals)
- Pillars show as complete when all applicable questions are answered (not based on total possible)
- Hide skipping completely - seamless experience where user never knows questions were skipped
- Don't mention time savings or personalization - just deliver fast 12-minute experience

### Review & path changes
- Re-evaluate and show new questions when user changes answers that previously triggered skips
- Auto-navigate to first newly-relevant question immediately when branching changes occur
- Recalculate scores immediately in real-time as answers change or sections become relevant/irrelevant
- Only show applicable questions in review mode (cleaner, focused experience)

### Claude's Discretion
- Specific branching trigger logic and complexity levels
- Technical implementation of path validation
- Error handling for edge cases in branching logic
- Performance optimization for real-time recalculation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for conditional logic implementation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-branching-logic*
*Context gathered: 2026-03-08*