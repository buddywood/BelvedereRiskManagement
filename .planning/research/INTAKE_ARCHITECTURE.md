# Architecture Research

**Domain:** Intake Interview, Audio Recording, and Advisor Portal Integration
**Researched:** 2026-03-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Intake  │  │ Audio   │  │ Advisor │  │ Assess  │        │
│  │ Flow    │  │ Record  │  │ Portal  │  │ Custom  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                        API Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Next.js App Router                  │    │
│  │            /api/intake/* + /api/advisor/*           │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                        State Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Intake   │  │ Audio    │  │ Existing │                   │
│  │ Store    │  │ Manager  │  │ Stores   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| IntakeFlowStore | Multi-step form state, progress tracking | Zustand store with localStorage persistence |
| AudioRecordingManager | Audio capture, file processing, transcription | MediaRecorder API + Web Audio API |
| AdvisorPortalAuth | Role-based access, tenant isolation | Auth.js with role enum + middleware |
| AssessmentCustomizer | Question curation, dynamic form generation | JSON schema-driven forms with SurveyJS |
| IntegrationOrchestrator | Data flow between intake and assessment | Server actions + API routes |

## Recommended Project Structure

```
src/
├── app/
│   ├── (protected)/
│   │   ├── intake/            # Client intake interface
│   │   │   ├── [step]/page.tsx
│   │   │   └── complete/page.tsx
│   │   ├── advisor/           # Advisor portal
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── intakes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── customize/[id]/page.tsx
│   │   └── assessment/        # Existing assessment
│   └── api/
│       ├── intake/            # Intake management
│       │   ├── [sessionId]/
│       │   │   ├── route.ts
│       │   │   ├── responses/route.ts
│       │   │   ├── audio/route.ts
│       │   │   └── generate-assessment/route.ts
│       │   └── route.ts
│       └── advisor/           # Advisor operations
│           ├── assigned/route.ts
│           └── [sessionId]/
│               ├── review/route.ts
│               └── customize/route.ts
├── lib/
│   ├── intake/               # Intake business logic
│   │   ├── store.ts         # Zustand store
│   │   ├── flow.ts          # Multi-step navigation
│   │   └── integration.ts   # Assessment generation
│   ├── audio/               # Audio processing
│   │   ├── recorder.ts      # MediaRecorder wrapper
│   │   ├── transcription.ts # Whisper integration
│   │   └── storage.ts       # File upload/storage
│   └── advisor/             # Advisor functionality
│       ├── auth.ts          # Role verification
│       ├── assignment.ts    # Intake assignment logic
│       └── customization.ts # Assessment customization
└── components/
    ├── intake/              # Intake UI components
    ├── audio/               # Audio recording components
    └── advisor/             # Advisor portal components
```

### Structure Rationale

- **intake/:** Mirrors existing assessment structure, easy integration
- **advisor/:** Separate portal prevents role confusion, clean RBAC
- **audio/:** Isolated audio concerns enable progressive enhancement

## Architectural Patterns

### Pattern 1: Progressive Enhancement Audio Recording

**What:** Start with text input, enhance with audio if available
**When to use:** Cross-device compatibility required, graceful degradation
**Trade-offs:** Slightly more complex but ensures universal access

**Example:**
```typescript
const QuestionWithAudio = ({ questionId, onResponse }) => {
  const [hasAudio, setHasAudio] = useState(false);
  const [textResponse, setTextResponse] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasAudio(true))
      .catch(() => setHasAudio(false));
  }, []);

  return (
    <div className="space-y-4">
      <textarea
        value={textResponse}
        onChange={(e) => setTextResponse(e.target.value)}
        placeholder="Type your response..."
      />
      {hasAudio && (
        <AudioRecorder
          onRecording={(audio, transcription) => {
            setTextResponse(transcription);
            onResponse(questionId, { text: transcription, audio });
          }}
        />
      )}
    </div>
  );
};
```

### Pattern 2: Schema-Driven Assessment Customization

**What:** JSON configuration drives dynamic form generation
**When to use:** Complex conditional logic, advisor-driven customization
**Trade-offs:** More flexible but requires schema validation

**Example:**
```typescript
interface AssessmentCustomization {
  excludedPillars: string[];
  emphasizedQuestions: string[];
  conditionalRules: {
    condition: string; // "intake.hasChildren === true"
    action: 'include' | 'exclude' | 'emphasize';
    targets: string[];
  }[];
}

const generateCustomizedAssessment = (
  intakeData: IntakeSession,
  customization: AssessmentCustomization
) => {
  return {
    questions: filterQuestions(allQuestions, customization),
    branching: enhanceBranching(baseBranching, intakeData),
    context: enrichContext(intakeData.responses)
  };
};
```

### Pattern 3: Role-Based Route Protection

**What:** Wrap advisor routes with role verification middleware
**When to use:** Any advisor-only functionality
**Trade-offs:** Simple but requires careful route organization

**Example:**
```typescript
// middleware.ts extension
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/advisor')) {
    return withAuth(request, ['ADVISOR', 'ADMIN']);
  }

  // Existing middleware logic...
}

async function withAuth(request: NextRequest, allowedRoles: UserRole[]) {
  const session = await getSession(request);

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
```

## Data Flow

### Request Flow

```
[Client Intake]
    ↓
[Intake Store] → [Audio Service] → [API Routes] → [Database]
    ↓              ↓               ↓               ↓
[UI Update] ← [Transcription] ← [Processing] ← [File Storage]
```

### Advisor Review Flow

```
[Advisor Portal]
    ↓
[RBAC Check] → [Assigned Intakes] → [Review Interface] → [Customization]
    ↓               ↓                   ↓                   ↓
[Authorization] → [Query Filter] → [Intake Data] → [Assessment Config]
```

### Integration Flow

```
[Intake Complete] → [Advisor Review] → [Assessment Generation] → [Existing Assessment Flow]
```

### Key Data Flows

1. **Audio Processing:** MediaRecorder → File Upload → Transcription → Response Storage
2. **Assessment Generation:** Intake Data + Advisor Customization → Dynamic Assessment Config → Existing Assessment Store

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Next.js instance, local file storage, synchronous transcription |
| 1k-100k users | Cloud storage (R2/S3), async transcription queue, Redis caching |
| 100k+ users | Dedicated transcription service, CDN for audio files, microservices for advisor features |

### Scaling Priorities

1. **First bottleneck:** Audio file storage and processing — move to cloud storage early
2. **Second bottleneck:** Transcription latency — implement async processing with job queues

## Anti-Patterns

### Anti-Pattern 1: Direct Audio Storage in Database

**What people do:** Store audio blobs directly in PostgreSQL
**Why it's wrong:** Database bloat, poor performance, backup issues, memory problems
**Do this instead:** Use cloud storage (S3/R2) with database references to file URLs

### Anti-Pattern 2: Tight Coupling Between Intake and Assessment

**What people do:** Directly modify existing assessment store from intake components
**Why it's wrong:** Breaks existing assessment flow, hard to maintain, creates circular dependencies
**Do this instead:** Generate new assessment with intake context, preserve existing store independence

### Anti-Pattern 3: Synchronous Audio Transcription

**What people do:** Block UI while processing audio transcription
**Why it's wrong:** Poor UX, timeout issues, server overload on concurrent requests
**Do this instead:** Async processing with progress indicators and job queues

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI Whisper | RESTful API with retry logic | Rate limits, file size limits (25MB) |
| Cloud Storage | SDK with presigned URLs | Direct client upload reduces server load |
| Email/SMS | Queue-based notifications | Advisor assignment alerts, intake completion |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Intake ↔ Assessment | Server action generation | One-way data flow, immutable handoff |
| Advisor ↔ Client | Database + real-time updates | Optional WebSocket for live collaboration |
| Audio ↔ Forms | Event-driven updates | Transcription enriches form responses |

## Database Schema Extensions

```sql
-- Add to existing schema
model IntakeSession {
  id            String      @id @default(cuid())
  userId        String
  advisorId     String?
  status        IntakeStatus @default(IN_PROGRESS)
  currentStep   Int         @default(0)
  responses     Json
  audioFiles    AudioFile[]
  completedAt   DateTime?
  createdAt     DateTime    @default(now())

  user          User        @relation(fields: [userId], references: [id])
  advisor       User?       @relation("AdvisorIntakes", fields: [advisorId], references: [id])
  customizedAssessment Assessment?
}

model AudioFile {
  id              String    @id @default(cuid())
  intakeSessionId String
  questionId      String
  audioUrl        String    -- Cloud storage URL
  transcription   String?
  duration        Float?
  recordedAt      DateTime

  intakeSession   IntakeSession @relation(fields: [intakeSessionId], references: [id])
}

-- Extend User model
enum UserRole {
  CLIENT
  ADVISOR
  ADMIN
}

enum IntakeStatus {
  IN_PROGRESS
  PENDING_ADVISOR_REVIEW
  ADVISOR_REVIEWED
  ASSESSMENT_GENERATED
  COMPLETED
}
```

## Sources

- [Auth.js Role Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [You Can't Handle Real-Time voice Transcription with Next.js, Can You?](https://medium.com/@shanur.cse.nitap/you-cant-handle-real-time-voice-transcription-with-next-js-can-you-80221aa5595e)
- [Building an audio Transcription App with Next.js](https://akoskm.com/building-an-audio-transcription-app-with-nextjs/)
- [Building Audio Recorder app using Native Web API in React](https://medium.com/recoding/building-audio-recorder-app-using-native-web-api-in-react-8cc98405e019)
- [How to create a Multi-tenant application with Next.js and Prisma](https://www.mikealche.com/software-development/how-to-create-a-multi-tenant-application-with-next-js-and-prisma)
- [How We Built a Multi-Tenant SaaS with Next.js 16, Prisma 7, and Auth.js](https://dev.to/frostbyte_nz/how-we-built-a-multi-tenant-saas-with-nextjs-16-prisma-7-and-authjs-57gj)
- [Building Dynamic Forms In React And Next.js — Smashing Magazine](https://www.smashingmagazine.com/2026/03/building-dynamic-forms-react-next-js/)
- [How To Build a Multi-Step Form using NextJS, TypeScript, React Context, And Shadcn UI](https://medium.com/@wdswy/how-to-build-a-multi-step-form-using-nextjs-typescript-react-context-and-shadcn-ui-ef1b7dcceec3)
- [Build Dynamic Forms in NextJS with SurveyJS Survey Creator](https://surveyjs.io/stay-updated/blog/nextjs-form-builder)

---
*Architecture research for: Intake Interview, Audio Recording, and Advisor Portal Integration*
*Researched: 2026-03-13*