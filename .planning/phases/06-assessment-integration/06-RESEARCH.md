# Phase 6: Assessment Integration - Research

**Researched:** 2026-03-13
**Domain:** Assessment personalization with household profile data
**Confidence:** HIGH

## Summary

Assessment integration with household profiles requires implementing dynamic question text personalization, profile-aware branching logic, and robust backward compatibility for existing assessments without profiles. The existing codebase has a solid foundation with TypeScript assessment types, Zustand state management, debounced auto-save via TanStack Query, and basic branching logic that can be extended for household-aware functionality.

The highest risk integration point is ensuring profile-aware branching maintains assessment integrity while gracefully degrading for assessments without household data. Modern TypeScript template literal patterns enable type-safe dynamic text generation, while established expand-migrate-contract patterns ensure safe database migrations.

**Primary recommendation:** Extend existing Question interface with optional template function, implement household-aware branching rules alongside current system, and use nullable profile data patterns for backward compatibility.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x | Type safety for personalization logic | Template literals enable type-safe dynamic text, discriminated unions for branching |
| Zustand | Current | Assessment state management | Already integrated, supports complex state updates for profile data |
| TanStack Query | v5 | Auto-save and profile data fetching | Proven debounced mutation patterns, race condition prevention |
| Prisma | Current | Database schema evolution | Type-safe migrations, existing HouseholdMember model integration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | Current | Debounced auto-save | Already implemented, prevents excessive API calls |
| React Hook Form | Latest | Profile data forms | For household profile creation/editing |
| zod | Current | Schema validation | Existing profile schemas, runtime validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Template literals | String concatenation | Template literals provide compile-time safety and readability |
| Zustand | Redux Toolkit | Zustand already integrated, simpler for this use case |
| Discriminated unions | Switch statements | Union types enable exhaustive checking, better IntelliSense |

**Installation:**
```bash
# Already installed in existing codebase
# No additional dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
src/lib/assessment/
├── personalization.ts  # Dynamic text generation
├── branching.ts        # Extended with profile awareness
├── types.ts           # Enhanced Question interface
└── backward-compat.ts  # Compatibility helpers
```

### Pattern 1: Template Literal Personalization
**What:** Type-safe dynamic question text using template literals and household data
**When to use:** Questions that reference family members by name or role
**Example:**
```typescript
interface PersonalizedQuestion extends Question {
  textTemplate?: (profile: HouseholdProfile | null) => string;
}

function generateQuestionText(
  question: PersonalizedQuestion,
  profile: HouseholdProfile | null
): string {
  if (question.textTemplate && profile) {
    return question.textTemplate(profile);
  }
  return question.text; // Fallback to static text
}
```

### Pattern 2: Profile-Aware Branching Rules
**What:** Branching logic that considers household composition alongside answers
**When to use:** Questions that should only appear based on household structure
**Example:**
```typescript
interface ProfileBranchingRule extends BranchingRule {
  requiresProfile?: boolean;
  profileCondition?: (profile: HouseholdProfile) => boolean;
}

function shouldShowQuestion(
  question: Question,
  answers: Record<string, unknown>,
  profile: HouseholdProfile | null
): boolean {
  // Existing answer-based branching logic
  if (question.branchingRule && !evaluateAnswerBranching(question, answers)) {
    return false;
  }

  // New profile-based conditions
  if (question.profileBranchingRule) {
    if (question.profileBranchingRule.requiresProfile && !profile) {
      return false;
    }
    if (profile && question.profileBranchingRule.profileCondition) {
      return question.profileBranchingRule.profileCondition(profile);
    }
  }

  return true;
}
```

### Pattern 3: Backward Compatibility Wrapper
**What:** Graceful degradation for assessments without household profiles
**When to use:** All personalized questions to ensure existing assessments continue working
**Example:**
```typescript
function renderQuestion(
  question: PersonalizedQuestion,
  profile: HouseholdProfile | null
): QuestionComponent {
  const questionText = profile && question.textTemplate
    ? question.textTemplate(profile)
    : question.text;

  return <QuestionCard text={questionText} {...otherProps} />;
}
```

### Anti-Patterns to Avoid
- **Hard-coding member names:** Always use profile data or fallback to generic text
- **Assuming profile exists:** All profile-dependent logic must handle null profiles
- **Breaking existing branching:** New profile rules should be additive, not replacement

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Template string validation | Custom parser | TypeScript template literals | Compile-time safety, IDE support |
| Debounced mutations | Custom debounce logic | use-debounce + TanStack Query | Race condition handling, retry logic |
| Schema migrations | Manual SQL | Prisma migrations | Type safety, rollback support |
| State persistence | Custom localStorage | Zustand persist middleware | Serialization edge cases, hydration |

**Key insight:** Assessment systems have complex edge cases around state consistency, data integrity, and user experience that are better handled by battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Template Literal Type Explosion
**What goes wrong:** Complex template literals can create unwieldy union types
**Why it happens:** TypeScript infers all possible string combinations
**How to avoid:** Use generic template functions instead of literal types for dynamic content
**Warning signs:** Slow IntelliSense, type errors on complex templates

### Pitfall 2: Profile Data Race Conditions
**What goes wrong:** Assessment loads before profile data, causing undefined errors
**Why it happens:** Async data fetching without proper loading states
**How to avoid:** Always check for profile existence, use loading states, implement fallbacks
**Warning signs:** Console errors about undefined profile properties

### Pitfall 3: Orphaned Personalized Answers
**What goes wrong:** Profile changes invalidate previous answers to personalized questions
**Why it happens:** No cleanup when household composition changes
**How to avoid:** Implement profile change detection and answer validation
**Warning signs:** Stale references to removed family members in saved answers

### Pitfall 4: Backward Compatibility Breaking
**What goes wrong:** New personalization breaks existing assessments
**Why it happens:** Assuming all assessments have profiles
**How to avoid:** Implement strict null checks, graceful fallbacks, feature flags
**Warning signs:** Assessment crashes for users without profiles

## Code Examples

### Dynamic Question Text Generation
```typescript
// Source: TypeScript Template Literal best practices
const createFamilyQuestionTemplate = (
  staticText: string,
  memberRole?: string
) => (profile: HouseholdProfile | null): string => {
  if (!profile || !memberRole) return staticText;

  const member = profile.members.find(m =>
    m.governanceRoles.includes(memberRole as GovernanceRole)
  );

  return member
    ? staticText.replace('{{memberName}}', member.fullName)
    : staticText;
};

const question: PersonalizedQuestion = {
  id: 'succession-heir',
  text: 'How prepared is your primary heir for leadership?',
  textTemplate: createFamilyQuestionTemplate(
    'How prepared is {{memberName}} for leadership?',
    'SUCCESSOR'
  ),
  // ... other properties
};
```

### Profile-Aware Auto-Save Integration
```typescript
// Source: Existing useAutoSave.ts pattern
interface SaveAnswerParams {
  questionId: string;
  pillar: string;
  subCategory: string;
  answer: unknown;
  skipped?: boolean;
  profileId?: string; // New: link answers to profile version
}

const saveAnswer = (params: SaveAnswerParams) => {
  const store = useAssessmentStore.getState();

  // Update with profile context
  if (params.skipped) {
    store.skipQuestion(params.questionId, params.profileId);
  } else {
    store.setAnswer(params.questionId, params.answer, params.profileId);
  }

  setPendingAnswer(params);
};
```

### Household Composition Branching
```typescript
// Source: Existing branching.ts pattern extended
function shouldShowFamilyBusinessQuestions(
  profile: HouseholdProfile | null
): boolean {
  if (!profile) return true; // Show generic questions

  // Skip if no decision makers or advisors
  const hasBusinessRoles = profile.members.some(member =>
    member.governanceRoles.some(role =>
      ['DECISION_MAKER', 'ADVISOR'].includes(role)
    )
  );

  return hasBusinessRoles;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static question text | Template literal personalization | 2026 | Type-safe dynamic content |
| Answer-only branching | Multi-factor branching (answers + profile) | 2026 | Better relevance filtering |
| Manual save/load | Debounced auto-save with race prevention | 2025 | Data integrity assurance |
| Schema-first migrations | Expand-migrate-contract patterns | 2026 | Zero-downtime deployments |

**Deprecated/outdated:**
- String concatenation for dynamic text: Template literals provide better safety and readability
- Synchronous state updates: Auto-save requires async handling with optimistic updates

## Open Questions

1. **Profile Change Impact on Existing Answers**
   - What we know: Profile changes can invalidate personalized question answers
   - What's unclear: Should answers be deleted, flagged, or migrated automatically?
   - Recommendation: Implement soft validation with user confirmation for significant changes

2. **Multi-Profile Assessments**
   - What we know: Current design assumes one profile per assessment
   - What's unclear: Future need for comparing multiple household configurations
   - Recommendation: Design profile association as optional foreign key for future flexibility

3. **Question Template Complexity Limits**
   - What we know: TypeScript template literals have performance implications
   - What's unclear: Threshold where runtime generation becomes preferable
   - Recommendation: Start with simple name/role substitution, monitor performance

## Sources

### Primary (HIGH confidence)
- [TypeScript 6.0 Migration Guide](https://gist.github.com/privatenumber/3d2e80da28f84ee30b77d53e1693378f) - Backward compatibility patterns
- [Building Dynamic Forms In React And Next.js](https://www.smashingmagazine.com/2026/03/building-dynamic-forms-react-next-js/) - React form personalization
- [React Query Autosave: Preventing Data Loss & Race Conditions](https://www.pz.com.au/insights/react-query-autosave-data-integrity) - Auto-save implementation

### Secondary (MEDIUM confidence)
- [Template Literals in React: Dynamic and Readable Components](https://medium.com/@stheodorejohn/template-literals-in-react-dynamic-and-readable-components-aa82350ff9f7) - Template literal patterns
- [Backward Compatible Database Changes](https://planetscale.com/blog/backward-compatible-databases-changes) - Migration strategies
- [Family Assessment questionnaire tools](https://www.iom.int/resources/household-family-factors-assessment-toolkit) - Assessment personalization approaches

### Tertiary (LOW confidence)
- [React Query Auto Sync Hook](https://lukesmurray.com/blog/react-query-auto-sync-hook) - Advanced auto-save patterns
- [Debounced mutation proposal](https://github.com/TanStack/query/discussions/2292) - TanStack Query optimization

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already integrated and proven
- Architecture: HIGH - Patterns based on existing codebase and established practices
- Pitfalls: MEDIUM - Based on common TypeScript/React issues and codebase analysis

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (30 days - stable domain with established patterns)