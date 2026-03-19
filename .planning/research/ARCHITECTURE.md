# Architecture Research

**Domain:** Cyber Risk Integration with Governance Platform
**Researched:** March 18, 2026
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Advisor  │  │ Cyber   │  │Unified  │  │Family   │        │
│  │Portal   │  │Risk     │  │Risk     │  │Portal   │        │
│  │         │  │Portal   │  │Dashboard│  │         │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                      API Layer (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Business Logic Layer                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │Governance│ │Cyber Risk│ │ Unified  │           │    │
│  │  │Engine    │ │Engine    │ │Scoring   │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │PostgreSQL│  │   Row    │  │External  │                   │
│  │Multi-Ten │  │  Level   │  │ Cyber    │                   │
│  │Database  │  │Security  │  │Feeds API │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Cyber Risk Integration Architecture

### New Component Responsibilities

| Component | Responsibility | Implementation Pattern |
|-----------|----------------|------------------------|
| **CyberRiskEngine** | Parallel assessment scoring, threat integration | Follows existing AssessmentEngine patterns |
| **CyberRiskQuestions** | Cyber-specific question framework | Extends existing question structure |
| **UnifiedScoring** | Combines governance + cyber risk scores | Uses existing weighted scoring algorithms |
| **ThreatFeedConnector** | External threat intelligence integration | New API service pattern |
| **CyberRiskPortal** | Advisor interface for cyber risk analysis | Extends existing portal pattern |

### Modified Components

| Existing Component | Modification Required | Integration Point |
|-------------------|----------------------|-------------------|
| **Intelligence Queries** | Add cyber risk pillar support | Extend getTopRisksForFamily to include cyber risks |
| **Assessment API** | Add cyber assessment type | Extend route.ts to handle cyber assessments |
| **Unified Dashboard** | Display combined risk profiles | Merge governance + cyber visualizations |
| **PDF Reports** | Include cyber risk sections | Extend ReportCover.tsx and scoring displays |

## Data Architecture Integration

### New Database Models

```typescript
// Extends existing Assessment pattern
model CyberRiskAssessment {
  id            String                 @id @default(cuid())
  userId        String                 // Same tenant isolation pattern
  version       Int                    @default(1)
  status        AssessmentStatus       @default(IN_PROGRESS)
  currentDomain String?                // cyber-security, data-protection, etc.
  currentQuestionIndex Int?            @default(0)
  startedAt     DateTime              @default(now())
  completedAt   DateTime?
  updatedAt     DateTime              @updatedAt

  user          User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  responses     CyberRiskResponse[]
  scores        CyberRiskScore[]
  threatFeeds   ThreatFeedData[]

  @@index([userId])
  @@index([status])
}

model CyberRiskScore {
  id           String        @id @default(cuid())
  assessmentId String
  domain       String        // cyber-security, data-protection, incident-response
  score        Float         // 0-10 scale matching governance scoring
  riskLevel    RiskLevel     // LOW, MEDIUM, HIGH, CRITICAL
  breakdown    Json          // Domain-specific breakdown
  threatContext Json?        // External threat intelligence context
  calculatedAt DateTime     @default(now())

  assessment   CyberRiskAssessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([assessmentId, domain])
  @@index([assessmentId])
}

// Unified risk combining governance + cyber
model UnifiedRiskProfile {
  id                  String    @id @default(cuid())
  userId              String
  governanceScore     Float     // From existing Assessment
  cyberRiskScore      Float     // From CyberRiskAssessment
  combinedScore       Float     // Weighted combination
  riskInteractions    Json      // How risks compound each other
  lastCalculated      DateTime  @default(now())

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
  @@index([userId])
}
```

### Data Flow Patterns

```
User Action (Cyber Assessment)
    ↓
CyberRiskEngine → ThreatFeedConnector → External APIs
    ↓                    ↓                    ↓
CyberRiskScore ← ThreatContext ← Live Threat Data
    ↓
UnifiedScoring (governance + cyber weights)
    ↓
UnifiedRiskProfile → Intelligence Dashboard
```

## Architectural Integration Patterns

### Pattern 1: Parallel Assessment Architecture

**What:** Cyber risk runs independently alongside governance assessment
**When to use:** Family needs separate cyber risk evaluation with optional combination
**Trade-offs:** More complex but allows independent progression and specialized scoring

**Example:**
```typescript
// Parallel assessment creation
const createParallelAssessments = async (userId: string) => {
  const [governance, cyber] = await Promise.all([
    prisma.assessment.create({ data: { userId, type: 'GOVERNANCE' } }),
    prisma.cyberRiskAssessment.create({ data: { userId, type: 'CYBER' } })
  ]);
  return { governance, cyber };
};
```

### Pattern 2: Unified Risk Scoring

**What:** Combines governance and cyber scores using configurable weights
**When to use:** Advisor needs holistic family risk view with domain interactions
**Trade-offs:** Complex weighting algorithm but provides comprehensive risk picture

**Example:**
```typescript
// Unified scoring calculation
const calculateUnifiedScore = (governance: number, cyber: number, weights: RiskWeights) => {
  const baseScore = (governance * weights.governance) + (cyber * weights.cyber);
  const interactionMultiplier = calculateRiskInteraction(governance, cyber);
  return baseScore * interactionMultiplier;
};
```

### Pattern 3: Tenant Isolation Consistency

**What:** Cyber risk data follows same row-level security patterns as governance data
**When to use:** Always - maintains existing security architecture
**Trade-offs:** No additional complexity, leverages proven patterns

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k families | Single database, unified Next.js app handles both assessment types |
| 1k-10k families | Add read replicas for cyber threat feed processing, cache threat intelligence |
| 10k+ families | Consider microservice for threat feed processing, separate cyber risk scoring service |

### Scaling Priorities

1. **First bottleneck:** External threat feed API rate limits - implement caching and batch processing
2. **Second bottleneck:** Combined scoring calculations - move to background jobs for complex unified scoring

## Anti-Patterns

### Anti-Pattern 1: Separate Cyber Risk Platform

**What people do:** Build completely separate application for cyber risk
**Why it's wrong:** Breaks unified family risk view, duplicates authentication/authorization
**Do this instead:** Extend existing platform with cyber risk modules using same architecture patterns

### Anti-Pattern 2: Real-time Threat Feed Integration

**What people do:** Call external threat APIs for every assessment question
**Why it's wrong:** Creates performance bottlenecks and external service dependencies
**Do this instead:** Batch threat intelligence updates, cache results, and apply contextually during scoring

### Anti-Pattern 3: Combined Assessment Questions

**What people do:** Mix cyber and governance questions in single assessment flow
**Why it's wrong:** Reduces modularity, makes scoring complex, harder to evolve separately
**Do this instead:** Keep assessments parallel, combine only at scoring/reporting level

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Threat Intelligence APIs** | Batch processing with caching | Update threat context daily, not per assessment |
| **Security Frameworks (NIST)** | Static mapping in scoring engine | Map assessment responses to framework controls |
| **Vulnerability Databases** | Scheduled background sync | Enrich cyber risk context with current threat landscape |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Governance ↔ Cyber Risk** | Unified scoring service | Combine scores using weighted algorithms |
| **Assessment ↔ Intelligence** | Shared database queries | Extend existing intelligence queries for cyber data |
| **Portal ↔ Risk Engines** | RESTful API patterns | Maintain existing API patterns for consistency |

## Build Order for Integration

### Phase 1: Cyber Risk Foundation
1. **Cyber risk database models** - Extend existing schema patterns
2. **Cyber risk question framework** - Mirror governance question structure
3. **Basic cyber risk scoring** - Adapt existing scoring algorithms

### Phase 2: Assessment Integration
1. **Parallel assessment UI** - Extend existing assessment portal
2. **Cyber risk API endpoints** - Follow existing API patterns
3. **Independent cyber risk reports** - Extend PDF generation

### Phase 3: Unified Risk Intelligence
1. **Unified scoring algorithms** - Combine governance + cyber scores
2. **Risk interaction modeling** - How risks compound each other
3. **Enhanced intelligence dashboard** - Show combined risk views

### Phase 4: Advanced Features
1. **Threat feed integration** - External intelligence APIs
2. **Real-time risk monitoring** - Background threat context updates
3. **Predictive risk analytics** - ML-based risk forecasting

## Sources

- [Top 12 Cyber Security Risk Assessment Tools For 2026](https://www.sentinelone.com/cybersecurity-101/cybersecurity/cyber-security-risk-assessment-tools/)
- [Multi-Tenant Database Architecture Patterns Explained](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/)
- [AI-Powered Cyber Risk Forecasting 2026](https://informatix.systems/blog/cyber-threat-intelligence-services/ai-powered-cyber-risk-forecasting-2026/)
- [Cyber Insights 2026: API Security](https://www.securityweek.com/cyber-insights-2026-api-security/)
- [How to Build a Fullstack App with Next.js, Prisma, and Postgres](https://vercel.com/kb/guide/nextjs-prisma-postgres)

---
*Architecture research for: Cyber Risk Integration with Governance Platform*
*Researched: March 18, 2026*