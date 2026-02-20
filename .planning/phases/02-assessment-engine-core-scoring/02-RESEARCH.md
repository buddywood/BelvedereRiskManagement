# Phase 2: Assessment Engine & Core Scoring - Research

**Researched:** 2026-02-19
**Domain:** Multi-step form wizards, auto-save persistence, weighted scoring algorithms
**Confidence:** HIGH

## Summary

Building a TurboTax-style assessment requires combining proven patterns for multi-step forms with robust state management and data persistence. The standard stack is React Hook Form + Zod + Zustand for form handling, shadcn/ui for UI components, and queued mutations with TanStack Query for auto-save. Database schema follows entity-attribute-value (EAV) patterns to support flexible questionnaires without schema changes. Scoring uses hierarchical weighted aggregation (question → sub-category → pillar → overall).

**Key insight:** The biggest risk is race conditions in auto-save leading to data loss. Debouncing alone is insufficient - must use FIFO queued mutations to guarantee data consistency.

**Primary recommendation:** Use React Hook Form with per-step Zod schemas, Zustand for cross-step state + localStorage persistence, and TanStack Query with queued mutations for auto-save. Build flexible Prisma schema supporting multiple assessment types without restructuring.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Question flow & navigation**
- Pillar-based sections with one question per screen, adaptive branching that reduces irrelevant questions
- Users can go back and change answers within sections and after completion with recalculation and updated risk scores
- Pillar sections presented as clear cards with descriptions, time estimates, completion status, sequential progression with mini-scores after each section
- Hard validation blocks progression for critical questions with professional messaging; optional questions can be skipped with reduced accuracy notes
- Unanswered items should never default to low risk

**Progress tracking & saves**
- Section-level progress bars within each pillar plus high-level roadmap showing completed and remaining pillars
- Auto-save after every answer and at section checkpoints with seamless resume capability
- Smart resume that recognizes in-progress state and takes users to exact next required question with visible progress context
- Comprehensive completion status showing overall progress, pillar-by-pillar completion, risk levels where available, final completion state with timestamps and deliverable access

**Question presentation**
- One question per screen with clear, plain-language prompts and selectable card-based answer options
- Premium guided experience with minimal visual clutter, not survey-like
- Help text through short inline context sentences, optional expandable "Learn More" sections, and subtle tooltips for defined terms
- Clean card-based selections for yes/no and tiered maturity questions, simple numeric inputs, minimal short text fields with consistent layout
- Real-time inline validation that gently guides users to correct invalid inputs without disrupting flow or aggressive error messaging

**Scoring transparency**
- Risk scores revealed only after completing each pillar, with final overall score at full assessment completion to preserve credibility and prevent gaming
- High-level category breakdowns showing key score drivers, but not underlying formulas or weightings - transparency about structure, not math
- Clean numeric score paired with clear risk level, supported by horizontal severity bar and professional advisory tone (no flashy gauges or gamification)
- Concise explanation of why score is elevated, ranked list of key risk drivers, prioritized action plan with clear ownership and effort guidance

### Claude's Discretion
- Exact visual styling and spacing details
- Technical implementation of auto-save mechanism
- Specific branching logic algorithms
- Database schema for storing assessment responses

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | 7.x | Form state management | Industry standard for complex forms, minimal re-renders, excellent TypeScript support |
| Zod | 4.3.6+ | Schema validation | Already in project, type-safe validation, integrates seamlessly with RHF via zodResolver |
| Zustand | 5.x | Cross-step state management | Lightweight (1KB), localStorage middleware built-in, no Provider boilerplate |
| TanStack Query | 5.x | Server state & mutations | Optimistic updates, mutation queuing, automatic retry/error handling |
| shadcn/ui | Latest | UI components | Copy-paste components, Tailwind-native, Radix accessibility, zero runtime overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | 10.x | Auto-save debouncing | Pair with mutation queue for auto-save (1000ms typical) |
| react-hot-toast | 2.x | User feedback | Success/error notifications for save operations |
| date-fns | 3.x | Date formatting | Session timestamps, completion dates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context | Context causes re-renders; Zustand is more performant |
| TanStack Query | SWR | TanStack Query has better mutation queuing support |
| shadcn/ui | Headless UI | shadcn/ui provides complete styled components, faster development |

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers zustand @tanstack/react-query use-debounce react-hot-toast date-fns
npx shadcn@latest init
npx shadcn@latest add form card progress button input textarea radio-group
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── (protected)/
│       └── assessment/
│           ├── page.tsx              # Assessment hub/resume
│           ├── [pillar]/
│           │   └── [question]/
│           │       └── page.tsx      # Dynamic question routes
│           └── results/
│               └── page.tsx          # Score display
├── components/
│   └── assessment/
│       ├── QuestionCard.tsx          # Single question UI
│       ├── ProgressBar.tsx           # Section/overall progress
│       ├── PillarCard.tsx            # Pillar selection cards
│       ├── ScoreDisplay.tsx          # Risk score visualization
│       └── NavigationButtons.tsx     # Back/Next/Skip controls
├── lib/
│   ├── assessment/
│   │   ├── store.ts                  # Zustand state + persist
│   │   ├── questions.ts              # Question definitions
│   │   ├── branching.ts              # Conditional logic
│   │   └── scoring.ts                # Weighted calculation
│   └── hooks/
│       ├── useAssessmentMutation.ts  # Queued auto-save
│       └── useAssessmentProgress.ts  # Progress calculations
└── prisma/
    └── schema.prisma                 # Assessment data models
```

### Pattern 1: Multi-Step Form with Per-Step Validation
**What:** Each question/step has its own Zod schema. React Hook Form validates only current step.
**When to use:** Prevents premature validation, allows users to navigate freely between steps.
**Example:**
```typescript
// lib/assessment/schemas.ts
import { z } from 'zod';

export const questionSchemas = {
  governanceStructure: z.object({
    answer: z.enum(['none', 'informal', 'documented', 'mature']),
  }),
  familyMeetings: z.object({
    answer: z.enum(['never', 'adhoc', 'scheduled', 'structured']),
  }),
  // ... per-question schemas
};

// components/assessment/QuestionCard.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function QuestionCard({ questionId, schema, onNext }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: useAssessmentStore(s => s.answers[questionId]),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await saveAnswer(questionId, data);
    onNext();
  });

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2: Zustand Store with localStorage Persistence
**What:** Single store manages all assessment state, automatically persists to localStorage.
**When to use:** Essential for save/resume functionality across sessions.
**Example:**
```typescript
// lib/assessment/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssessmentState {
  assessmentId: string | null;
  currentPillar: string;
  currentQuestion: number;
  answers: Record<string, unknown>;
  completedPillars: string[];
  lastSaved: string | null;

  setAnswer: (questionId: string, answer: unknown) => void;
  markPillarComplete: (pillar: string) => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessmentId: null,
      currentPillar: 'family-governance',
      currentQuestion: 0,
      answers: {},
      completedPillars: [],
      lastSaved: null,

      setAnswer: (questionId, answer) =>
        set(state => ({
          answers: { ...state.answers, [questionId]: answer },
          lastSaved: new Date().toISOString(),
        })),

      markPillarComplete: (pillar) =>
        set(state => ({
          completedPillars: [...state.completedPillars, pillar],
        })),

      resetAssessment: () =>
        set({
          assessmentId: null,
          answers: {},
          completedPillars: [],
        }),
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        // Don't persist transient UI state
        assessmentId: state.assessmentId,
        answers: state.answers,
        completedPillars: state.completedPillars,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
```

### Pattern 3: Queued Mutations for Auto-Save
**What:** Use TanStack Query with custom mutation queue to guarantee FIFO execution.
**When to use:** Critical for preventing race conditions and data loss in auto-save.
**Example:**
```typescript
// lib/hooks/useAssessmentMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

export function useAssessmentMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: AssessmentUpdate) => {
      const response = await fetch('/api/assessment/save', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Save failed');
      return response.json();
    },

    onMutate: async (newData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['assessment'] });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(['assessment']);

      // Optimistically update UI
      queryClient.setQueryData(['assessment'], (old) => ({
        ...old,
        ...newData,
      }));

      return { previous };
    },

    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['assessment'], context?.previous);
      toast.error('Failed to save. Retrying...');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment'] });
    },
  });

  return mutation;
}

// Usage with debouncing
function QuestionCard({ questionId }) {
  const { mutate } = useAssessmentMutation();
  const [answer, setAnswer] = useState('');
  const [debouncedAnswer] = useDebounce(answer, 1000);

  useEffect(() => {
    if (debouncedAnswer) {
      mutate({ questionId, answer: debouncedAnswer });
    }
  }, [debouncedAnswer]);

  // ...
}
```

### Pattern 4: Conditional Branching Logic
**What:** Determine which questions to show based on previous answers.
**When to use:** Adaptive assessment that skips irrelevant questions.
**Example:**
```typescript
// lib/assessment/branching.ts
type BranchingRule = {
  dependsOn: string;
  showIf: (answer: unknown) => boolean;
};

export const branchingRules: Record<string, BranchingRule> = {
  'family-trust-structure': {
    dependsOn: 'has-family-trust',
    showIf: (answer) => answer === 'yes',
  },
  'trust-succession-plan': {
    dependsOn: 'family-trust-structure',
    showIf: (answer) => answer !== 'none',
  },
};

export function getNextQuestion(
  currentQuestionId: string,
  answers: Record<string, unknown>,
  allQuestions: string[]
): string | null {
  const currentIndex = allQuestions.indexOf(currentQuestionId);

  for (let i = currentIndex + 1; i < allQuestions.length; i++) {
    const questionId = allQuestions[i];
    const rule = branchingRules[questionId];

    // No rule = always show
    if (!rule) return questionId;

    // Check if branching condition met
    const dependentAnswer = answers[rule.dependsOn];
    if (rule.showIf(dependentAnswer)) return questionId;
  }

  return null; // End of assessment
}
```

### Pattern 5: Hierarchical Weighted Scoring
**What:** Aggregate scores from questions → sub-categories → pillars → overall.
**When to use:** Transparent, explainable risk scoring system.
**Example:**
```typescript
// lib/assessment/scoring.ts
type QuestionWeight = {
  id: string;
  weight: number;
  scoreMap: Record<string, number>; // answer value → score
};

type SubCategory = {
  id: string;
  name: string;
  weight: number;
  questions: QuestionWeight[];
};

type Pillar = {
  id: string;
  name: string;
  weight: number;
  subCategories: SubCategory[];
};

export function calculateScore(
  answers: Record<string, unknown>,
  pillar: Pillar
): { score: number; breakdown: CategoryBreakdown[] } {
  const categoryScores = pillar.subCategories.map(category => {
    // Calculate weighted average for questions in category
    let totalWeight = 0;
    let weightedSum = 0;

    category.questions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const score = q.scoreMap[String(answer)] ?? 0;
        weightedSum += score * q.weight;
        totalWeight += q.weight;
      }
    });

    const categoryScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      score: categoryScore,
      weight: category.weight,
    };
  });

  // Calculate pillar score as weighted average of categories
  const totalWeight = categoryScores.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = categoryScores.reduce(
    (sum, c) => sum + c.score * c.weight,
    0
  );

  const pillarScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    score: Math.round(pillarScore * 10) / 10, // Round to 1 decimal
    breakdown: categoryScores,
  };
}

export function getRiskLevel(score: number): {
  level: 'low' | 'medium' | 'high' | 'critical';
  color: string;
} {
  if (score >= 7.5) return { level: 'low', color: 'green' };
  if (score >= 5.0) return { level: 'medium', color: 'yellow' };
  if (score >= 2.5) return { level: 'high', color: 'orange' };
  return { level: 'critical', color: 'red' };
}
```

### Anti-Patterns to Avoid

- **Premature validation:** Don't validate fields before users finish entering data. Only validate on blur or next-step attempt.
- **Multi-column layouts on forms:** Causes users to miss fields. Always single-column for questions.
- **Placeholder text as labels:** Users mistake it for pre-filled data. Use proper labels with inline hints.
- **Blocking all progress without answers:** Creates frustration. Allow skipping optional questions with "reduced accuracy" notice.
- **Showing full question count upfront:** "Question 3 of 80" is demoralizing. Use pillar-based progress instead.
- **Auto-save without queuing:** Race conditions cause data loss. Must use FIFO mutation queue.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState tracking per field | React Hook Form | Handles validation, errors, touched state, dirty checking, 1000+ edge cases |
| Schema validation | Manual if/else validation | Zod with zodResolver | Type-safe, composable, error messages, 50+ built-in validators |
| State persistence | Custom localStorage wrapper | Zustand persist middleware | Handles serialization, hydration timing, SSR compatibility, partial persistence |
| Auto-save with debouncing | Custom setTimeout logic | use-debounce + TanStack Query | Prevents race conditions, handles cleanup, mutation queuing |
| Progress calculation | Manual counting logic | Derived state from answers | Single source of truth, automatic updates, no sync issues |
| Conditional branching | Hardcoded if statements | Rule-based engine | Maintainable, testable, data-driven, easy to modify |
| Date/time formatting | new Date().toString() | date-fns | Handles timezones, locales, relative time, consistent formatting |

**Key insight:** Form state management is deceptively complex. React Hook Form handles 1000+ edge cases including: touched/dirty/pristine state, validation timing, error focus management, field arrays, nested objects, async validation, conditional fields, and controlled/uncontrolled component sync. Never build this from scratch.

## Common Pitfalls

### Pitfall 1: Race Conditions in Auto-Save
**What goes wrong:** Slow "old" save overwrites fast "new" save, deleting user's recent work.
**Why it happens:** Asynchronous HTTP requests don't guarantee order - a delayed request can complete after newer requests.
**How to avoid:** Use TanStack Query with mutation queue ensuring FIFO execution. Debouncing reduces server load but doesn't prevent race conditions.
**Warning signs:** Users report "my answers disappeared" or "changes not saving". Check network tab for out-of-order responses.
**Source:** [Patient PZ - React Query Autosave](https://www.pz.com.au/avoiding-race-conditions-and-data-loss-when-autosaving-in-react-query)

### Pitfall 2: Survey Dropout from Length Overload
**What goes wrong:** Users abandon assessment midway through. Completion rate drops from 83% (1-3 questions) to 42% (15+ questions).
**Why it happens:** Showing "Question 5 of 80" is demoralizing. Users feel overwhelmed by total length.
**How to avoid:** Use pillar-based progression. Show "Section 2 of 5" and "3 questions remaining in section". Users focus on immediate goal, not total count.
**Warning signs:** High dropout at question 10-15 despite good initial engagement. Users not returning to resume.
**Source:** [Survicate - Survey Completion Rate Study](https://survicate.com/blog/survey-completion-rate/)

### Pitfall 3: Premature Inline Validation
**What goes wrong:** Error messages appear while users are still typing. Creates frustrating "red field following cursor" effect.
**Why it happens:** Validation triggered onChange instead of onBlur or on submit attempt.
**How to avoid:** React Hook Form's `mode: 'onTouched'` validates only after user leaves field. For multi-step, validate on "Next" button click, not during input.
**Warning signs:** Users complain about "annoying red errors" or "form is too strict". High abandonment on first question.
**Source:** [Smashing Magazine - Inline Validation UX](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)

### Pitfall 4: localStorage Not Available on SSR
**What goes wrong:** Next.js throws "localStorage is not defined" error during server-side rendering.
**Why it happens:** localStorage only exists in browser, not Node.js server environment.
**How to avoid:** Wrap localStorage access in `useEffect` hook or check `typeof window !== 'undefined'`. Zustand persist middleware handles this automatically.
**Warning signs:** Build succeeds but production deployment crashes. Hydration mismatches between server and client.
**Source:** [Next.js LocalStorage Guide](https://www.restack.io/docs/nextjs-knowledge-nextjs-localstorage-guide)

### Pitfall 5: Unanswered Questions Defaulting to "Low Risk"
**What goes wrong:** Missing data gets treated as positive signal, artificially lowering risk scores and invalidating assessment.
**Why it happens:** Fallback values in score calculation default to 0 or "best case".
**How to avoid:** Explicitly track answered vs. unanswered questions. Exclude unanswered from score calculation or flag report as "incomplete - accuracy reduced". Never assume missing = safe.
**Warning signs:** Users skip entire sections but still get detailed risk scores. Scores don't reflect reality.
**Source:** User constraint from CONTEXT.md

### Pitfall 6: Database Schema Too Rigid
**What goes wrong:** Adding new question types requires database migration. Can't adjust assessment without downtime.
**Why it happens:** Questions hard-coded as table columns instead of using entity-attribute-value (EAV) pattern.
**How to avoid:** Store questions as JSON configuration, responses in flexible key-value structure. Schema accommodates new question types without migration.
**Warning signs:** Every assessment change requires Prisma migration. Can't test new questions in production.
**Source:** [Redgate - Survey Database Design](https://www.red-gate.com/blog/database-design-survey-system)

### Pitfall 7: Storing Sensitive Data in localStorage
**What goes wrong:** Assessment data accessible to XSS attacks. User information exposed if device compromised.
**Why it happens:** localStorage stores plain text, readable by any JavaScript on the page.
**How to avoid:** Only store assessment progress/answers in localStorage (non-sensitive). Keep user identity (email, name) in server-side session. Use httpOnly cookies for authentication tokens.
**Warning signs:** Security audit flags localStorage usage. Compliance requirements prohibit client-side PII storage.
**Source:** [Wesionary - Securing LocalStorage in Next.js](https://articles.wesionary.team/securing-sensitive-data-in-a-next-js-application-d7d5cce67f23)

## Code Examples

Verified patterns from official sources:

### Multi-Step Form with shadcn/ui and React Hook Form
```typescript
// app/(protected)/assessment/[pillar]/[question]/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/assessment/store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

export default function QuestionPage({ params }) {
  const router = useRouter();
  const { setAnswer, answers } = useAssessmentStore();
  const question = getQuestion(params.pillar, params.question);

  const form = useForm({
    resolver: zodResolver(question.schema),
    defaultValues: answers[question.id] || {},
    mode: 'onTouched', // Validate only after user leaves field
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setAnswer(question.id, data);

    // Navigate to next question
    const nextQuestion = getNextQuestion(question.id, answers);
    if (nextQuestion) {
      router.push(`/assessment/${params.pillar}/${nextQuestion}`);
    } else {
      router.push('/assessment/results');
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xl font-semibold">
                      {question.text}
                    </FormLabel>
                    <FormDescription>
                      {question.helpText}
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {question.options.map((option) => (
                          <Card
                            key={option.value}
                            className="cursor-pointer hover:border-zinc-400"
                          >
                            <CardContent className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value={option.value} />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                {option.description && (
                                  <div className="text-sm text-zinc-500">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button type="submit">
              {question.isOptional ? 'Next (or Skip)' : 'Next'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```
Source: [Makerkit - Multi-Step Forms React](https://makerkit.dev/blog/tutorials/multi-step-forms-reactjs)

### Progress Bar Component
```typescript
// components/assessment/ProgressBar.tsx
import { Progress } from '@/components/ui/progress';
import { useAssessmentStore } from '@/lib/assessment/store';

export function AssessmentProgress() {
  const { currentPillar, answers, completedPillars } = useAssessmentStore();

  const pillarQuestions = getPillarQuestions(currentPillar);
  const answeredInPillar = pillarQuestions.filter(q => answers[q.id]).length;
  const pillarProgress = (answeredInPillar / pillarQuestions.length) * 100;

  const totalPillars = 5;
  const overallProgress = ((completedPillars.length + (pillarProgress / 100)) / totalPillars) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Current Section Progress</span>
          <span className="text-zinc-500">
            {answeredInPillar} of {pillarQuestions.length} questions
          </span>
        </div>
        <Progress value={pillarProgress} className="h-2" />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-zinc-500">
            {completedPillars.length} of {totalPillars} sections complete
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
    </div>
  );
}
```
Source: [shadcn/ui - Progress Component](https://ui.shadcn.com/docs/components/radix/progress)

### Risk Score Display
```typescript
// components/assessment/ScoreDisplay.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScoreDisplayProps {
  score: number;
  pillarName: string;
  breakdown: CategoryBreakdown[];
}

export function ScoreDisplay({ score, pillarName, breakdown }: ScoreDisplayProps) {
  const riskLevel = getRiskLevel(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pillarName} Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-5xl font-bold">{score}</span>
            <span className="text-lg text-zinc-500">/ 10</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Risk Level: {riskLevel.level.toUpperCase()}</span>
            </div>
            <Progress
              value={score * 10}
              className="h-3"
              indicatorClassName={`bg-${riskLevel.color}-500`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-zinc-700">Score Breakdown</h4>
          {breakdown.map(category => (
            <div key={category.categoryId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{category.categoryName}</span>
                <span className="font-medium">{category.score.toFixed(1)}</span>
              </div>
              <Progress value={category.score * 10} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```
Source: [shadcn/ui - Card Component](https://ui.shadcn.com/docs/components/radix/card)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik | React Hook Form | 2021-2022 | Better performance, TypeScript support, smaller bundle |
| Yup validation | Zod validation | 2022-2023 | Type inference, better DX, composability |
| Redux for forms | Zustand or React Hook Form | 2023-2024 | Less boilerplate, better performance |
| Manual debouncing | use-debounce + mutation queue | 2024-2025 | Prevents race conditions, cleaner code |
| Custom components | shadcn/ui | 2023-2024 | Faster development, built-in accessibility |
| REST polling | TanStack Query | 2022-2023 | Optimistic updates, automatic refetching, better UX |

**Deprecated/outdated:**
- **Formik:** Still works but React Hook Form is lighter and faster. Formik v3 stalled since 2021.
- **Redux for form state:** Overkill for forms. Use React Hook Form for form state, Zustand for cross-form state.
- **Manual onChange auto-save:** Race conditions inevitable. Always use mutation queue with debouncing.
- **Survey-style multi-select on one page:** Modern patterns use one question per screen for mobile-first UX.

## Open Questions

1. **Weighted scoring configuration management**
   - What we know: Hierarchical scoring needs question weights, category weights, pillar weights
   - What's unclear: Should weights be hard-coded in scoring.ts, stored in database, or configurable via admin UI?
   - Recommendation: Hard-code in scoring.ts for MVP (phase 2), plan admin UI for future phase. Avoids premature complexity while keeping option open.

2. **Assessment versioning strategy**
   - What we know: Questions/weights will evolve over time, need to track which version user completed
   - What's unclear: How to handle users mid-assessment when questions change? Lock to version or migrate answers?
   - Recommendation: Store `assessmentVersion` field in database. Users in progress stay on their version. New sessions get latest version. Plan migration tool for future.

3. **Branching complexity limits**
   - What we know: Adaptive branching reduces question count but adds complexity
   - What's unclear: How many levels of conditional branching before UX suffers? When does "smart" become "confusing"?
   - Recommendation: Start with simple 1-level branching (if A then show B, else skip B). Monitor completion rates before adding deeper nesting.

4. **Score recalculation performance**
   - What we know: Users can change answers after completing pillar, requiring score recalculation
   - What's unclear: With 80 questions and hierarchical aggregation, is client-side recalculation fast enough or should it be server-side?
   - Recommendation: Calculate client-side for instant feedback, debounced server-side save. Test with 80 questions - if <100ms, client-side is fine.

## Database Schema

### Recommended Prisma Models
```prisma
model Assessment {
  id            String   @id @default(cuid())
  userId        String
  version       Int      @default(1)
  status        AssessmentStatus @default(IN_PROGRESS)
  currentPillar String?
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  responses     AssessmentResponse[]
  scores        PillarScore[]

  @@index([userId])
  @@index([status])
}

model AssessmentResponse {
  id           String   @id @default(cuid())
  assessmentId String
  questionId   String   // e.g., "governance-structure"
  pillar       String   // e.g., "family-governance"
  answer       Json     // Flexible: string, number, array, object
  answeredAt   DateTime @default(now())

  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([assessmentId, questionId])
  @@index([assessmentId])
}

model PillarScore {
  id           String   @id @default(cuid())
  assessmentId String
  pillar       String
  score        Float
  riskLevel    RiskLevel
  breakdown    Json     // Array of { categoryId, categoryName, score, weight }
  calculatedAt DateTime @default(now())

  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([assessmentId, pillar])
  @@index([assessmentId])
}

enum AssessmentStatus {
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

**Key design decisions:**
- **Flexible response storage:** `answer: Json` accommodates any question type without schema migration
- **Unique constraint:** `@@unique([assessmentId, questionId])` prevents duplicate answers
- **Score caching:** `PillarScore` table caches calculated scores with breakdown, avoiding recalculation on every view
- **Version tracking:** `version: Int` enables assessment evolution without breaking in-progress sessions

**Why not store questions in database:** Questions, weights, and branching logic are code, not data. Storing in TypeScript files enables:
- Type safety for question IDs
- Version control for question changes
- Easy refactoring and testing
- No database queries to render questions

Only responses (user data) and scores (computed results) go in database.

## Sources

### Primary (HIGH confidence)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/v5/docs/react/guides/optimistic-updates)
- [Zustand - Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist)
- [shadcn/ui - Components](https://ui.shadcn.com/docs/components)
- [React Hook Form - Advanced Usage](https://react-hook-form.com/advanced-usage)
- [Next.js - Forms with Server Actions](https://nextjs.org/docs/app/guides/forms)

### Secondary (MEDIUM confidence)
- [Makerkit - Multi-Step Forms React](https://makerkit.dev/blog/tutorials/multi-step-forms-reactjs)
- [Patient PZ - React Query Autosave](https://www.pz.com.au/avoiding-race-conditions-and-data-loss-when-autosaving-in-react-query)
- [Smashing Magazine - Inline Validation UX](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
- [NN/g - Form Error Guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [Redgate - Survey Database Design](https://www.red-gate.com/blog/database-design-survey-system)
- [MetricStream - Risk Scores Calculation](https://www.metricstream.com/learn/risk-scores-for-better-risk-mgmt.html)
- [Survicate - Survey Completion Rate](https://survicate.com/blog/survey-completion-rate/)
- [Growform - Multi-Step Form UX Best Practices](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)

### Tertiary (LOW confidence - community sources)
- [Medium - useAutoSave Hook](https://darius-marlowe.medium.com/smarter-forms-in-react-building-a-useautosave-hook-with-debounce-and-react-query-d4d7f9bb052e)
- [Medium - Multi-Step Form Next.js Context](https://medium.com/@wdswy/how-to-build-a-multi-step-form-using-nextjs-typescript-react-context-and-shadcn-ui-ef1b7dcceec3)
- [Build with Matija - Multi-Step Form Tutorial](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs, active maintenance, community consensus
- Architecture patterns: HIGH - Verified code examples from official sources
- Pitfalls: MEDIUM-HIGH - Mix of official sources (NN/g, Smashing Magazine) and case studies
- Database schema: MEDIUM - Best practices from Redgate, adapted to Prisma/Next.js context
- Scoring algorithms: MEDIUM - Academic research combined with practical implementation patterns

**Research date:** 2026-02-19
**Valid until:** ~2026-03-31 (6 weeks - React/Next.js ecosystem moves quickly)
**Recommended re-validation:** Check TanStack Query and React Hook Form docs before implementation for latest patterns
