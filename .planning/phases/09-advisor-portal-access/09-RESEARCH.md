# Phase 9: Advisor Portal Access - Research

**Researched:** 2026-03-14
**Domain:** Role-based access control and advisor portals
**Confidence:** HIGH

## Summary

Phase 9 requires implementing a secure advisor portal where advisors can review client intake interviews, access transcriptions, play audio recordings, identify risk focus areas, and approve clients for customized assessments. The implementation builds on existing NextAuth.js authentication and Prisma data models.

**Primary recommendation:** Extend existing auth system with role-based access control using middleware protection, create advisor-client relationship models, implement audio review interfaces with synchronized transcription display, and add real-time notifications for intake completion.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| NextAuth.js | 5.x | Role-based authentication | Official Next.js auth, JWT session tokens |
| Prisma | Current | Database ORM with RBAC models | Existing project standard, advisor-client relations |
| Next.js Middleware | 15.x | Route protection | Server-side role verification before page load |
| Tailwind CSS | Current | UI styling | Existing project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Audio Player | Latest | Audio playback with controls | Transcription synchronized playback |
| React Hot Toast | Current | Notification UI | Existing project pattern |
| Zod | Current | Schema validation | Existing validation pattern |
| Lucide React | Current | Icons | Existing icon system |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Role-based middleware | Page-level protection | Middleware prevents unauthorized page loads |
| Custom audio player | HTML5 audio | Custom allows transcript sync and professional controls |
| Database notifications | Real-time websockets | Database polling simpler for advisor portal scale |

**Installation:**
```bash
# No new packages required - extending existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(advisor)/           # Advisor-only routes
│   ├── dashboard/          # Advisor dashboard
│   ├── intake/            # Intake review pages
│   └── layout.tsx         # Advisor portal wrapper
├── lib/data/advisor.ts     # Advisor data access
├── lib/middleware/rbac.ts  # Role-based access control
└── components/advisor/     # Advisor-specific components
```

### Pattern 1: Role-Based Access Control
**What:** Middleware-first protection with session token role verification
**When to use:** All advisor routes and API endpoints
**Example:**
```typescript
// Source: NextAuth.js RBAC documentation
export async function middleware(request: NextRequest) {
  const session = await auth(request);

  if (request.nextUrl.pathname.startsWith('/advisor')) {
    if (!session?.user?.role || session.user.role !== 'ADVISOR') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
}
```

### Pattern 2: Advisor-Client Relationship Model
**What:** Junction table with permissions and assignment tracking
**When to use:** Multi-tenant advisor portal where advisors see only assigned clients
**Example:**
```typescript
// Source: Prisma RBAC patterns
model AdvisorClientAssignment {
  id        String   @id @default(cuid())
  advisorId String
  clientId  String
  assignedAt DateTime @default(now())
  permissions AdvisorPermission[]

  advisor   User @relation("AdvisorRole", fields: [advisorId], references: [id])
  client    User @relation("ClientRole", fields: [clientId], references: [id])
}
```

### Pattern 3: Audio Review Interface
**What:** Synchronized audio player with transcript highlighting and controls
**When to use:** Advisor review of client intake recordings
**Example:**
```typescript
// Source: React transcript player patterns
const AudioReviewPlayer = ({ audioUrl, transcription, onProgress }) => {
  const [currentTime, setCurrentTime] = useState(0);

  // Sync transcript highlighting with audio time
  useEffect(() => {
    const activeWord = findWordByTime(transcription, currentTime);
    highlightWord(activeWord);
  }, [currentTime]);
};
```

### Anti-Patterns to Avoid
- **Client-side role checking only:** Always verify roles on server-side for security
- **Shared state between advisor/client:** Keep advisor and client contexts completely separate
- **Direct database access in components:** Use server actions and data access layer

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio synchronization | Custom time tracking | React transcript libraries | Frame-perfect sync, performance optimization |
| Role management | Custom permission system | NextAuth role callbacks | Session token integration, middleware support |
| Real-time notifications | Custom WebSocket system | Server-Sent Events or database polling | Simpler for advisor portal scale |
| Risk area identification | Custom text analysis | OpenAI structured output | Existing transcription infrastructure |

**Key insight:** Advisor portals require different performance characteristics than client-facing applications - focus on data-rich interfaces over real-time responsiveness.

## Common Pitfalls

### Pitfall 1: Role Verification Only in Middleware
**What goes wrong:** API routes bypass middleware role checking
**Why it happens:** Middleware only protects page routes, not API endpoints
**How to avoid:** Add role verification to every API route handler
**Warning signs:** Advisor API endpoints accessible via direct URL

### Pitfall 2: Transcription Display Performance
**What goes wrong:** Audio timeupdate events trigger excessive React renders
**Why it happens:** Direct connection of high-frequency events to React state
**How to avoid:** Use requestAnimationFrame and throttled state updates
**Warning signs:** Audio playback stuttering, poor performance on mobile

### Pitfall 3: Client Data Exposure
**What goes wrong:** Advisor sees intake data from unassigned clients
**Why it happens:** Database queries missing advisor-client relationship filters
**How to avoid:** Every data access function must filter by advisor assignment
**Warning signs:** Advisor dashboard showing unexpected client data

### Pitfall 4: Missing Notification Persistence
**What goes wrong:** Advisors miss notifications if not online when intake completes
**Why it happens:** Real-time notifications without database persistence
**How to avoid:** Store notification state in database, mark as read when viewed
**Warning signs:** Advisors reporting missed intake completion alerts

## Code Examples

Verified patterns from official sources:

### Middleware Role Protection
```typescript
// Source: NextAuth.js v5 middleware documentation
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth(request);

  if (request.nextUrl.pathname.startsWith('/advisor')) {
    if (!session?.user?.role || session.user.role !== 'ADVISOR') {
      return Response.redirect(new URL('/signin', request.url));
    }
  }
}
```

### Advisor Data Access Pattern
```typescript
// Source: Prisma best practices
export async function getAdvisorAssignedIntakes(advisorId: string) {
  return prisma.intakeInterview.findMany({
    where: {
      AND: [
        { status: 'SUBMITTED' },
        {
          user: {
            advisorAssignments: {
              some: { advisorId }
            }
          }
        }
      ]
    },
    include: {
      user: { select: { name: true, email: true } },
      responses: { include: { transcription: true } }
    }
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Page-level auth | Middleware auth | NextAuth v5 | Prevents unauthorized page loads |
| Custom audio controls | Specialized libraries | 2024 | Professional transcript sync |
| Manual role management | Session token roles | Auth.js RBAC | Simplified permission checking |
| WebSocket notifications | Server-Sent Events | 2025-2026 | Simpler deployment, better scaling |

**Deprecated/outdated:**
- NextAuth v4 callbacks: Use v5 session token approach
- Custom transcript highlighting: Use performance-optimized libraries

## Open Questions

1. **Notification Delivery Method**
   - What we know: Email, in-app, or push notification options
   - What's unclear: Advisor preference management and urgency levels
   - Recommendation: Start with email + in-app, add preferences later

2. **Risk Area Identification Automation**
   - What we know: OpenAI can analyze transcriptions for risk indicators
   - What's unclear: Specific prompts and risk categorization schema
   - Recommendation: Manual identification initially, automate with advisor feedback

3. **Multi-Advisor Client Assignment**
   - What we know: Current model allows one advisor per client
   - What's unclear: Team-based advisory relationships
   - Recommendation: Design for single advisor, extend if needed

## Sources

### Primary (HIGH confidence)
- [NextAuth.js Role Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [Next.js 15 RBAC Implementation](https://clerk.com/blog/nextjs-role-based-access-control)
- [Prisma Role-Based Models](https://www.prisma.io/docs/orm/prisma-client/client-extensions/shared-extensions/permit-rbac)

### Secondary (MEDIUM confidence)
- [React Audio Transcription Sync](https://www.metaview.ai/resources/blog/syncing-a-transcript-with-audio-in-react)
- [Next.js Real-time Notifications](https://dev.to/ethanleetech/top-7-notification-solutions-for-nextjs-application-160k)
- [Advisor Portal Workflow Patterns](https://productive.io/blog/workflow-approval-software/)

### Tertiary (LOW confidence)
- [React Transcript Editor Components](https://github.com/bbc/react-transcript-editor)
- [Risk Assessment Automation](https://www.flowforma.com/blog/automated-risk-assessment-tools)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - extends existing NextAuth/Prisma patterns
- Architecture: HIGH - proven RBAC and advisor portal patterns
- Pitfalls: MEDIUM - based on common NextAuth and audio player issues

**Research date:** 2026-03-14
**Valid until:** 2026-04-13 (30 days - stable domain)