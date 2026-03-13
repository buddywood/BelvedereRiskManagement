# Architecture Integration: Household Profile Features

**Domain:** Household Profile Management for Risk Assessment Platform
**Researched:** 2026-03-12
**Confidence:** HIGH

## Integration Architecture

### System Overview with Profile Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Profile UI  │  │Assessment UI│  │ Report UI   │  │ Auth UI     │         │
│  │ Components  │  │ Components  │  │ Components  │  │ Components  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │                  │
├─────────┴────────────────┴────────────────┴────────────────┴──────────────────┤
│                      BUSINESS LOGIC LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Profile Services │  │ Assessment Logic │  │ Template Engine  │           │
│  │ + Branching     │  │ + Profile Context│  │ + Profile Data   │           │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘           │
├─────────────────────────────────────────────────────────────────────────────┤
│                         STATE MANAGEMENT                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │ Profile Store│  │Assessment    │  │ Session      │                       │
│  │ (Zustand)    │  │ Store        │  │ Store        │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL + Prisma ORM + Row-Level Security                          │  │
│  │ User → HouseholdProfile → Assessment → Responses → PillarScores       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Integration Points

| Component | Current System | Profile Integration | Communication Pattern |
|-----------|----------------|-------------------|---------------------|
| Branching Logic | `shouldShowQuestion()` → answers only | Profile data + answers → enhanced context | Service layer injection |
| Assessment Store | User answers + session state | Profile data + answers + member context | Extended Zustand store |
| Template Generator | Score data + user email | Score + profile + member data | Data mapper enhancement |
| Question Components | Static question rendering | Dynamic member-specific questions | Props + context |
| Progress Tracking | Question completion % | Profile-aware completion tracking | Store computed values |

## Database Schema Integration

### New Models Required

```typescript
model HouseholdProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  familyName      String?
  estimatedNetWorth Float?
  numberOfHeirs   Int?
  hasSpouse       Boolean  @default(false)
  hasTrusts       Boolean  @default(false)
  hasFamilyBusiness Boolean @default(false)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  members         HouseholdMember[]
  assessments     Assessment[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

model HouseholdMember {
  id              String   @id @default(cuid())
  profileId       String
  name            String
  relationship    String   // spouse, child, dependent, etc.
  age             Int?
  hasSpecialNeeds Boolean  @default(false)
  isSuccessor     Boolean  @default(false)

  profile         HouseholdProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([profileId])
}
```

### Existing Model Updates

```typescript
model Assessment {
  // Add household profile relationship
  profileId       String?
  profile         HouseholdProfile? @relation(fields: [profileId], references: [id])

  // Enhance context tracking
  profileSnapshot Json?  // Snapshot of profile data when assessment started
}

model AssessmentResponse {
  // Add member context for personalized questions
  targetMemberId  String?
  memberContext   Json?   // Which household member this response relates to
}
```

## Architectural Patterns

### Pattern 1: Profile-Aware Question Branching

**What:** Extend existing branching logic to consider both user answers AND profile data
**When to use:** When questions should appear/disappear based on household composition
**Trade-offs:** Increased complexity, better user experience, more accurate assessments

**Example:**
```typescript
// Enhanced branching rule
interface ProfileAwareBranchingRule extends BranchingRule {
  profileCondition?: (profile: HouseholdProfile) => boolean;
  memberCondition?: (members: HouseholdMember[]) => boolean;
}

// Updated logic
export function shouldShowQuestion(
  question: Question,
  answers: Record<string, unknown>,
  profile?: HouseholdProfile,
  members?: HouseholdMember[]
): boolean {
  // Existing answer-based logic
  if (!evaluateAnswerCondition(question, answers)) {
    return false;
  }

  // New profile-based logic
  if (question.branchingRule?.profileCondition && profile) {
    return question.branchingRule.profileCondition(profile);
  }

  if (question.branchingRule?.memberCondition && members) {
    return question.branchingRule.memberCondition(members);
  }

  return true;
}
```

### Pattern 2: Profile-Context State Management

**What:** Extend Zustand store to include profile data alongside assessment state
**When to use:** When UI components need both assessment and profile data
**Trade-offs:** Single source of truth, potential store bloat for large families

**Example:**
```typescript
interface EnhancedAssessmentState extends AssessmentState {
  // Profile context
  currentProfile: HouseholdProfile | null;
  householdMembers: HouseholdMember[];

  // Profile actions
  setProfile: (profile: HouseholdProfile) => void;
  updateMember: (memberId: string, updates: Partial<HouseholdMember>) => void;

  // Enhanced answer tracking with member context
  setMemberAnswer: (questionId: string, answer: unknown, memberId?: string) => void;
}
```

### Pattern 3: Template Data Composition

**What:** Compose template data from multiple sources (scores + profile + members)
**When to use:** When generating personalized reports and documents
**Trade-offs:** Rich personalization, complex data mapping, template dependencies

**Example:**
```typescript
interface EnhancedTemplateData {
  // Existing score data
  assessment: ScoreResult;
  userEmail: string;

  // New profile data
  household: {
    familyName: string;
    totalMembers: number;
    estimatedNetWorth: string;
    hasSuccessors: boolean;
  };

  // Member-specific sections
  memberProfiles: {
    id: string;
    name: string;
    relationship: string;
    riskFactors: string[];
    recommendations: string[];
  }[];
}
```

## Data Flow Integration

### Profile-Aware Assessment Flow

```
[Profile Setup] → [Assessment Start] → [Profile-Enhanced Questions] → [Member-Specific Responses] → [Personalized Scoring] → [Profile-Rich Reports]
       ↓                ↓                        ↓                            ↓                        ↓                    ↓
[Profile Store] → [Assessment Store] → [Enhanced Branching] → [Member Context] → [Score Calculator] → [Template Engine]
```

### State Synchronization

```
[Profile Changes]
    ↓
[Invalidate Assessment Cache] → [Recalculate Visible Questions] → [Update Progress] → [Refresh UI]
    ↓                              ↓                               ↓                   ↓
[Database Update] → [Zustand Store Update] → [Component Re-render] → [User Sees Changes]
```

## Integration Anti-Patterns

### Anti-Pattern 1: Profile Data in Assessment Store

**What people do:** Store all household profile data in assessment store
**Why it's wrong:** Violates separation of concerns, creates tight coupling, bloats assessment logic
**Do this instead:** Keep profile store separate, inject profile context only when needed for branching/scoring

### Anti-Pattern 2: Deep Member Nesting in Questions

**What people do:** Create separate question variants for each household member
**Why it's wrong:** Exponential question explosion, maintenance nightmare, poor UX
**Do this instead:** Use dynamic question rendering with member context injection

### Anti-Pattern 3: Profile Snapshots Everywhere

**What people do:** Store profile snapshots in every response record
**Why it's wrong:** Data duplication, stale data issues, storage bloat
**Do this instead:** Store profile snapshot only at assessment level, reference member IDs in responses

## Build Order Dependencies

### Phase 1: Database Foundation
1. **HouseholdProfile** model with basic fields
2. **HouseholdMember** model with relationships
3. Database migration scripts
4. Updated Assessment model with profile relationship

**Critical Integration Point:** Must maintain backward compatibility with existing assessments

### Phase 2: Core Profile Services
1. Profile CRUD operations (create, read, update, delete)
2. Member management services
3. Profile validation logic
4. API routes for profile management

**Critical Integration Point:** Profile service interfaces must align with existing auth patterns

### Phase 3: Enhanced Branching Logic
1. Profile-aware branching rule interfaces
2. Updated `shouldShowQuestion()` function
3. Member-context question filtering
4. Integration with existing assessment store

**Critical Integration Point:** Branching logic changes require extensive testing to avoid breaking existing assessments

### Phase 4: Assessment Integration
1. Profile store creation (Zustand)
2. Assessment store enhancement with profile context
3. Question component updates for member-specific rendering
4. Progress tracking with profile awareness

**Critical Integration Point:** State management changes must preserve existing auto-save functionality

### Phase 5: Template Personalization
1. Enhanced template data mapper
2. Profile-aware document generation
3. Member-specific report sections
4. Template registry updates for household features

**Critical Integration Point:** Template changes must maintain backward compatibility with existing reports

## Critical Integration Points

| Integration Point | Risk Level | Mitigation Strategy |
|------------------|------------|-------------------|
| Branching Logic Migration | HIGH | Feature flags, gradual rollout, extensive testing |
| Assessment Store Changes | MEDIUM | Backward compatibility, data migration scripts |
| Template Data Breaking Changes | MEDIUM | Versioned template interfaces, graceful degradation |
| Database Schema Evolution | LOW | Standard Prisma migration workflow |

## Recommended Project Structure Updates

```
src/
├── lib/
│   ├── profile/           # NEW: Profile management
│   │   ├── types.ts       # Profile and member interfaces
│   │   ├── services.ts    # CRUD operations
│   │   ├── store.ts       # Zustand profile store
│   │   └── validation.ts  # Profile data validation
│   ├── assessment/        # ENHANCED: Existing assessment logic
│   │   ├── branching.ts   # Updated with profile awareness
│   │   ├── store.ts       # Enhanced with profile context
│   │   └── scoring.ts     # Profile-aware scoring
│   └── templates/         # ENHANCED: Template generation
│       ├── data-mapper.ts # Enhanced with profile data
│       └── generator.ts   # Profile-aware generation
├── components/
│   ├── profile/           # NEW: Profile UI components
│   │   ├── ProfileForm.tsx
│   │   ├── MemberList.tsx
│   │   └── ProfileSummary.tsx
│   ├── assessment/        # ENHANCED: Existing components
│   │   ├── QuestionCard.tsx # Member-aware rendering
│   │   └── ProgressBar.tsx  # Profile-aware progress
│   └── ui/                # Existing shared components
└── app/
    ├── api/
    │   ├── profile/       # NEW: Profile API routes
    │   │   └── route.ts
    │   ├── assessment/    # ENHANCED: Profile-aware endpoints
    │   │   └── [id]/score/route.ts # Profile data included
    │   └── templates/     # ENHANCED: Profile data injection
    └── (protected)/
        ├── profile/       # NEW: Profile management pages
        └── assessment/    # ENHANCED: Profile-aware assessment
```

## Scaling Considerations

| Scale | Profile-Specific Considerations |
|-------|-------------------------------|
| 0-1k families | Store member data as JSONB, simple profile queries |
| 1k-10k families | Normalize member relationships, index on profile_id |
| 10k+ families | Consider member data archival, profile search optimization |

## Sources

- [Next.js Authentication Patterns for 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026)
- [SaaS Architecture Patterns with Next.js](https://vladimirsiedykh.com/blog/saas-architecture-patterns-nextjs)
- [Prisma Schema Relations Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Profile-Driven Document Generation](https://apryse.com/blog/docx-generation-from-templates-react)
- [React PDF Generation Libraries 2025](https://dev.to/ansonch/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025-13g0)
- [Multi-Tenant Database Patterns](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/)

---
*Architecture research for: Household Profile Integration*
*Researched: 2026-03-12*