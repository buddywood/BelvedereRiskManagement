# Phase 2: Assessment Engine & Core Scoring - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a guided 60-80 question Family Governance assessment with TurboTax-style interface, progress tracking, save/resume capability, and transparent weighted scoring system that produces actionable governance recommendations.

</domain>

<decisions>
## Implementation Decisions

### Question flow & navigation
- Pillar-based sections with one question per screen, adaptive branching that reduces irrelevant questions
- Users can go back and change answers within sections and after completion with recalculation and updated risk scores
- Pillar sections presented as clear cards with descriptions, time estimates, completion status, sequential progression with mini-scores after each section
- Hard validation blocks progression for critical questions with professional messaging; optional questions can be skipped with reduced accuracy notes
- Unanswered items should never default to low risk

### Progress tracking & saves
- Section-level progress bars within each pillar plus high-level roadmap showing completed and remaining pillars
- Auto-save after every answer and at section checkpoints with seamless resume capability
- Smart resume that recognizes in-progress state and takes users to exact next required question with visible progress context
- Comprehensive completion status showing overall progress, pillar-by-pillar completion, risk levels where available, final completion state with timestamps and deliverable access

### Question presentation
- One question per screen with clear, plain-language prompts and selectable card-based answer options
- Premium guided experience with minimal visual clutter, not survey-like
- Help text through short inline context sentences, optional expandable "Learn More" sections, and subtle tooltips for defined terms
- Clean card-based selections for yes/no and tiered maturity questions, simple numeric inputs, minimal short text fields with consistent layout
- Real-time inline validation that gently guides users to correct invalid inputs without disrupting flow or aggressive error messaging

### Scoring transparency
- Risk scores revealed only after completing each pillar, with final overall score at full assessment completion to preserve credibility and prevent gaming
- High-level category breakdowns showing key score drivers, but not underlying formulas or weightings - transparency about structure, not math
- Clean numeric score paired with clear risk level, supported by horizontal severity bar and professional advisory tone (no flashy gauges or gamification)
- Concise explanation of why score is elevated, ranked list of key risk drivers, prioritized action plan with clear ownership and effort guidance

### Claude's Discretion
- Exact visual styling and spacing details
- Technical implementation of auto-save mechanism
- Specific branching logic algorithms
- Database schema for storing assessment responses

</decisions>

<specifics>
## Specific Ideas

- "60-80 questions should feel like a structured 15-minute guided interview rather than a survey"
- "Creating structured momentum without being overwhelmed by total question count"
- "Premium experience" - professional advisory tone throughout
- "Never forcing them to restart or hunt for where they left off"
- Assessment should feel like TurboTax - familiar guided experience pattern

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-assessment-engine-core-scoring*
*Context gathered: 2026-02-20*