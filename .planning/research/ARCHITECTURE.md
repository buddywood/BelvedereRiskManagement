# Architecture Research

**Domain:** Risk Assessment and Scoring Systems
**Researched:** 2026-02-17
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Wizard  │  │ Progress│  │ Review  │  │ Results │        │
│  │ UI      │  │ Tracker │  │ Summary │  │ Display │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                    APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │          State Management & Orchestration           │    │
│  │  • Form State    • Scoring State   • Session State  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Branching   │  │   Scoring    │  │  Template    │      │
│  │  Logic       │  │   Engine     │  │  Engine      │      │
│  │  Engine      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Assessment│  │  Scoring │  │ Templates│  │ Audit    │    │
│  │ Store    │  │  Config  │  │          │  │ Log      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Wizard UI | Multi-step form navigation, conditional rendering | React with form state machine or step array |
| Progress Tracker | Visual progress, step validation, save/resume | Component with session storage backup |
| Branching Logic Engine | Question routing based on answers, skip logic | Rule engine with condition evaluator |
| Scoring Engine | Weighted calculations, aggregation (question → sub-category → pillar) | Backend service with configurable weights |
| Template Engine | PDF generation, policy document assembly | Template library (Carbone, PDFKit) with data binding |
| Assessment Store | Draft persistence, session management | Database with tenant_id isolation |
| Audit Log | Event tracking, state history | Append-only event store |

## Recommended Project Structure

```
src/
├── client/                 # Frontend (React/Next.js)
│   ├── components/
│   │   ├── wizard/        # Multi-step form components
│   │   ├── scoring/       # Score display, charts
│   │   └── shared/        # Reusable UI components
│   ├── hooks/             # Custom hooks for state/persistence
│   ├── state/             # State management (Zustand/Context)
│   └── lib/               # Client utilities
├── server/                # Backend (Node.js/Express)
│   ├── api/               # REST/GraphQL endpoints
│   │   ├── assessments/   # Assessment CRUD
│   │   ├── scoring/       # Scoring calculations
│   │   └── reports/       # PDF/template generation
│   ├── engines/
│   │   ├── branching/     # Question routing logic
│   │   ├── scoring/       # Weighted calculation engine
│   │   └── templates/     # Document generation
│   ├── models/            # Data models
│   └── middleware/        # Auth, validation, logging
├── shared/                # Shared TypeScript types
│   ├── types/             # Assessment, scoring interfaces
│   └── schemas/           # Validation schemas (Zod)
└── config/                # Configuration, scoring weights
```

### Structure Rationale

- **client/wizard/:** Encapsulates multi-step form complexity, makes wizard reusable across different assessment types
- **server/engines/:** Separates business logic from HTTP layer, enables testing scoring/branching independently
- **shared/types/:** Single source of truth for data shapes, prevents frontend/backend drift
- **config/:** Externalizes scoring weights and question trees, allows non-developer updates

## Architectural Patterns

### Pattern 1: Wizard State Machine

**What:** Multi-step forms modeled as state machines with defined transitions between steps

**When to use:** Forms with 3+ steps, conditional navigation, need for progress tracking

**Trade-offs:**
- **Pros:** Predictable navigation, easy to visualize flow, supports skip logic naturally
- **Cons:** Can be overkill for linear forms, requires upfront modeling

**Example:**
```typescript
// Step definition with navigation logic
interface WizardStep {
  id: string;
  component: React.ComponentType;
  shouldSkip?: (data: FormData) => boolean;
  onNext?: (data: FormData) => void;
}

const steps: WizardStep[] = [
  {
    id: 'governance',
    component: GovernanceQuestions,
    shouldSkip: (data) => !data.hasFamily,
  },
  {
    id: 'succession',
    component: SuccessionQuestions,
    onNext: (data) => saveProgress(data),
  },
];
```

### Pattern 2: Hierarchical Scoring Aggregation

**What:** Scores aggregate bottom-up: questions → sub-categories → pillars → overall

**When to use:** Multi-level weighted scoring, need to show breakdown at different granularities

**Trade-offs:**
- **Pros:** Transparency (show score components), flexible weighting, easy to explain
- **Cons:** Requires careful weight calibration, more complex to change structure

**Example:**
```typescript
interface ScoringConfig {
  pillars: Pillar[];
}

interface Pillar {
  id: string;
  weight: number;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  weight: number;
  questions: Question[];
}

// Calculate pillar score
function calculatePillarScore(pillar: Pillar, answers: Answers): number {
  const subCategoryScores = pillar.subCategories.map(sub => {
    const questionScores = sub.questions.map(q =>
      answers[q.id] * q.weight
    );
    return sum(questionScores) * sub.weight;
  });
  return sum(subCategoryScores) * pillar.weight;
}
```

### Pattern 3: Template-Based Report Generation

**What:** Separate data from presentation using templates with placeholders

**When to use:** Multiple output formats, non-developers need to edit layouts, brand customization

**Trade-offs:**
- **Pros:** Non-technical users can update templates, consistent styling, easy A/B testing
- **Cons:** Template syntax learning curve, debugging can be harder than code

**Example:**
```typescript
// Using template engine (Carbone-style)
const reportData = {
  client: { name: 'Smith Family', date: new Date() },
  scores: {
    governance: 85,
    succession: 72,
    financialControls: 90,
  },
  recommendations: [
    'Establish family council',
    'Document succession plan',
  ],
};

// Template: report-template.docx with placeholders
// {client.name}, {scores.governance}, {d.recommendations:forEach}

generatePDF({
  template: 'report-template.docx',
  data: reportData,
  output: 'risk-assessment.pdf',
});
```

### Pattern 4: Progressive State Persistence

**What:** Save form state incrementally (per-step or per-change) to allow resume

**When to use:** Long forms (10+ min), high-value conversions, mobile users

**Trade-offs:**
- **Pros:** Reduces abandonment, better UX, enables "save and email" feature
- **Cons:** More backend writes, state reconciliation complexity, GDPR considerations

**Example:**
```typescript
// Save on step completion
function useWizardPersistence(assessmentId: string) {
  const saveStep = async (stepData: StepData) => {
    await api.patch(`/assessments/${assessmentId}`, {
      currentStep: stepData.stepId,
      data: stepData.answers,
      lastUpdated: new Date(),
    });
  };

  // Restore on mount
  useEffect(() => {
    const draft = await api.get(`/assessments/${assessmentId}`);
    if (draft.currentStep) {
      restoreToStep(draft.currentStep, draft.data);
    }
  }, []);

  return { saveStep };
}
```

## Data Flow

### Assessment Flow

```
[User starts assessment]
    ↓
[Create draft] → [DB: assessments table]
    ↓
[Present question 1]
    ↓
[User answers] → [Evaluate branching logic] → [Determine next question]
    ↓
[Save answer] → [DB: update draft]
    ↓
[Repeat until complete]
    ↓
[Calculate scores] → [Scoring Engine] → [Weight × sum aggregation]
    ↓
[Generate reports] → [Template Engine] → [PDF + policy templates]
    ↓
[Mark assessment complete] → [DB: status = 'completed']
```

### Scoring Calculation Flow

```
[Form submission]
    ↓
[Collect all answers] → {questionId: value}
    ↓
[Load scoring config] → Pillars + weights from DB/config
    ↓
[Calculate question scores] → answer × question.weight
    ↓
[Aggregate to sub-categories] → sum(questions) × sub-category.weight
    ↓
[Aggregate to pillars] → sum(sub-categories) × pillar.weight
    ↓
[Calculate overall score] → weighted average of pillars
    ↓
[Identify risks] → Scores below thresholds
    ↓
[Return score breakdown + recommendations]
```

### State Management

```
[Client State]
    ↓ (on user interaction)
[Local State Update] → React state/Zustand
    ↓
[Debounced Save] → API call every 5s or on blur
    ↓
[Server State] → Database (draft record)
    ↓
[Audit Event] → Append-only log (optional for compliance)
    ↓
[Optimistic UI Update] ← Show saved indicator
```

### Key Data Flows

1. **Conditional Navigation:** Answer → Branching Logic Engine → Next step determination → UI update
2. **Auto-save:** Form change → Debounce timer → API PATCH → Success/error toast
3. **Score Display:** Completed assessment → Scoring calculation → Cache result → Display with breakdown
4. **Report Generation:** Assessment ID → Fetch data → Populate template → Generate PDF → Return download link

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users | Monolith (Next.js full-stack), SQLite/Postgres, in-memory scoring, synchronous PDF generation |
| 100-10k users | Separate frontend/backend, Postgres with indexes on tenant_id, Redis cache for scoring configs, async PDF generation (queue) |
| 10k+ users | CDN for static assets, database read replicas, job queue (BullMQ/SQS) for reports, consider multi-region deployment |

### Scaling Priorities

1. **First bottleneck:** PDF generation blocks responses
   - **Fix:** Move to background job queue, return job ID immediately, notify via webhook/polling

2. **Second bottleneck:** Scoring calculations slow with many assessments
   - **Fix:** Cache scoring configs in Redis, denormalize pillar scores to avoid recalculation, add database indexes

3. **Third bottleneck:** Database writes from auto-save
   - **Fix:** Batch updates, use JSONB columns for flexible schema, implement database connection pooling

## Anti-Patterns

### Anti-Pattern 1: Client-Side Only Scoring

**What people do:** Calculate scores entirely in browser JavaScript

**Why it's wrong:**
- Exposes scoring algorithm (clients can reverse-engineer weights)
- No audit trail of how scores were calculated
- Can't change algorithm without forcing client updates
- Vulnerable to manipulation

**Do this instead:** Calculate scores server-side, return results via API. Client displays results but doesn't calculate.

### Anti-Pattern 2: Storing All Answers in Single JSON Blob

**What people do:** `answers: { question1: 'yes', question2: 4, ... }` as single JSONB column

**Why it's wrong:**
- Can't query by specific answers
- Hard to generate analytics across assessments
- Makes branching logic queries impossible
- No referential integrity

**Do this instead:** Hybrid approach - structured tables for critical data, JSONB for flexible extensions:

```sql
CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  question_id VARCHAR NOT NULL,
  question_text TEXT,
  answer_value TEXT,
  answer_numeric DECIMAL,
  created_at TIMESTAMP
);

-- Index for analytics
CREATE INDEX idx_answers_question_value ON assessment_answers(question_id, answer_value);
```

### Anti-Pattern 3: Synchronous PDF Generation in Request Handler

**What people do:**
```typescript
app.post('/api/generate-report', async (req, res) => {
  const pdf = await generatePDF(req.body); // Takes 5-15 seconds
  res.send(pdf);
});
```

**Why it's wrong:**
- Request timeouts (especially with API gateways)
- Blocks worker threads
- Poor UX (user waits with spinner)
- Can't show progress

**Do this instead:** Async job pattern:
```typescript
app.post('/api/generate-report', async (req, res) => {
  const job = await queue.add('generate-pdf', req.body);
  res.json({ jobId: job.id, status: 'processing' });
});

app.get('/api/reports/:jobId', async (req, res) => {
  const job = await queue.getJob(req.params.jobId);
  if (job.isCompleted) {
    res.json({ status: 'complete', url: job.result.url });
  } else {
    res.json({ status: 'processing', progress: job.progress });
  }
});
```

### Anti-Pattern 4: Hard-Coding Question Logic in Components

**What people do:**
```typescript
function WizardStep3() {
  if (answers.hasChildren === 'yes') {
    return <SuccessionQuestions />;
  }
  return <SkipToStep4 />;
}
```

**Why it's wrong:**
- Can't change logic without code deployment
- Business users can't update assessment flow
- Hard to test all paths
- Duplicates logic across components

**Do this instead:** Data-driven configuration:
```typescript
// config/assessment-flow.json
{
  "steps": [
    {
      "id": "step-3",
      "component": "SuccessionQuestions",
      "showIf": {
        "question": "hasChildren",
        "operator": "equals",
        "value": "yes"
      }
    }
  ]
}

// Dynamic renderer
function WizardRenderer({ config, answers }) {
  const visibleSteps = config.steps.filter(step =>
    evaluateCondition(step.showIf, answers)
  );
  return visibleSteps.map(step => renderComponent(step.component));
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Email (SendGrid/SES) | Async via queue | For report delivery, assessment reminders |
| Storage (S3/CloudFlare R2) | Direct upload from server | Store generated PDFs, templates |
| PDF Engine (Carbone/PDFKit) | Library integration | Self-hosted, no external API dependency |
| Analytics (PostHog/Mixpanel) | Client + server events | Track assessment completion, drop-off points |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend ↔ Backend | REST API (JSON) | Consider GraphQL if frontend needs vary widely |
| Scoring Engine ↔ Database | Direct SQL queries | Keep scoring engine stateless |
| Template Engine ↔ Storage | Write-then-read pattern | Generate PDF → upload to S3 → return URL |
| Application ↔ Audit Log | Fire-and-forget events | Don't block on audit writes; use queue if needed |

## Database Schema Considerations

### Multi-Tenant Isolation

For family office SaaS, use **shared database, shared schema** with `tenant_id` (or `family_id`):

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL,  -- Tenant isolation
  name VARCHAR(255),
  status VARCHAR(50),
  current_step VARCHAR(100),
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Critical: Index on tenant column
CREATE INDEX idx_assessments_family ON assessments(family_id);

-- Row-level security (Postgres)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assessments
  USING (family_id = current_setting('app.current_family_id')::uuid);
```

**Why not database-per-tenant:** Overkill for MVP (100-1000 families), adds operational complexity, harder to run analytics across all tenants.

### Scoring Configuration

Store weights in database for runtime updates:

```sql
CREATE TABLE scoring_configs (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL,
  config JSONB NOT NULL,  -- Full scoring tree
  effective_from TIMESTAMP,
  created_at TIMESTAMP
);

-- Example config structure
{
  "version": 2,
  "pillars": [
    {
      "id": "governance",
      "weight": 0.35,
      "subCategories": [
        {
          "id": "decision-making",
          "weight": 0.5,
          "questions": [
            {"id": "q1", "weight": 0.3},
            {"id": "q2", "weight": 0.7}
          ]
        }
      ]
    }
  ]
}
```

## Build Order Implications

Based on component dependencies, recommended build sequence:

### Phase 1: Foundation
1. **Database schema** (assessments, answers, families)
2. **Authentication** (family/user login)
3. **Basic API** (CRUD for assessments)

### Phase 2: Core Assessment
4. **Wizard UI** (multi-step form without branching)
5. **Progress persistence** (auto-save, resume)
6. **Simple scoring** (flat calculation, no hierarchy yet)

### Phase 3: Intelligence
7. **Branching logic engine** (conditional question display)
8. **Hierarchical scoring** (pillar → sub-category → question)
9. **Results display** (score breakdown, visualizations)

### Phase 4: Deliverables
10. **Template engine** (PDF report generation)
11. **Policy template assembly** (based on identified risks)
12. **Async job processing** (background PDF generation)

### Phase 5: Polish
13. **Audit logging** (compliance trail)
14. **Analytics integration** (usage tracking)
15. **Email delivery** (send reports)

**Critical path:** Steps 1-6 are MVP. Steps 7-9 add value. Steps 10-12 complete core offering. Steps 13-15 are nice-to-have.

**Parallelization opportunities:**
- UI components (step 4) can be built while backend (steps 1-3) is in progress
- Template design (step 10) can start early, integrated later
- Analytics (step 14) can be added anytime without blocking other work

## Sources

- [A Guide to Risk Scoring: Best Practices and Strategies](https://www.flagright.com/post/how-to-do-risk-scoring)
- [The Modern Risk Prioritization Framework for 2026](https://safe.security/resources/blog/the-modern-risk-prioritization-framework-for-2026/)
- [Multi-Tenant Database Architecture Patterns Explained](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/)
- [Multi-Tenant Application Database Design - GeeksforGeeks](https://www.geeksforgeeks.org/dbms/multi-tenant-application-database-design/)
- [Guidance for Multi-Tenant Architectures on AWS](https://aws.amazon.com/solutions/guidance/multi-tenant-architectures-on-aws/)
- [Carbone - Open Source Report and Document Generator](https://carbone.io/)
- [State Management in 2026: Modern Frontend Guide](https://www.elearningsolutions.co.in/state-management-in-2026-2/)
- [Frontend System Design: The Complete Guide 2026](https://www.systemdesignhandbook.com/guides/frontend-system-design/)
- [Survey Branching Logic: A Complete Guide for Researchers (2026)](https://lensym.com/blog/survey-branching-logic-guide)
- [Event Sourcing pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- [Is the audit log a proper architecture driver for Event Sourcing?](https://event-driven.io/en/audit_log_event_sourcing/)
- [React: Building a Multi-Step Form with Wizard Pattern](https://medium.com/@vandanpatel29122001/react-building-a-multi-step-form-with-wizard-pattern-85edec21f793)
- [Multistep Forms in React with Awesome UX – Persistent State](https://andyfry.co/multi-step-form-persistent-state/)
- [Scoring approach for 2026 benchmarks - World Benchmarking Alliance](https://archive.worldbenchmarkingalliance.org/research/scoring-approach-2026-benchmarks/)

---
*Architecture research for: Belvedere Risk Management - Family Governance Risk Assessment*
*Researched: 2026-02-17*
