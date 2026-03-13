# Phase 7: Household Reporting - Research

**Researched:** March 13, 2026
**Domain:** PDF and document templating with household member personalization
**Confidence:** HIGH

## Summary

Phase 7 requires integrating household member information into existing PDF reports and Word document templates. The project already has solid infrastructure with @react-pdf/renderer 4.3.2 for PDF generation and docxtemplater 3.68.3 for Word templates. The key challenge is extending these existing systems to include household composition sections and personalize governance recommendations based on member roles.

The existing codebase shows mature patterns: TanStack Query handles profile caching (5-minute staleTime), household data is well-structured in Prisma with FamilyRelationship and GovernanceRole enums, and the current PDF architecture uses component composition for different report sections.

**Primary recommendation:** Extend existing PDF and template components to accept household profile data and add new sections without disrupting current professional formatting.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.3.2 | PDF generation from React components | Industry standard for React PDF generation, mature API |
| docxtemplater | 3.68.3 | Word document template processing | De facto standard for .docx template replacement |
| @tanstack/react-query | 5.90.21 | Data caching and synchronization | Best practice for server state management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pizzip | 3.2.0 | ZIP handling for docxtemplater | Required dependency for .docx manipulation |
| date-fns | 4.1.0 | Date formatting in reports | Already used for assessment date formatting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF | Less declarative, harder to maintain complex layouts |
| docxtemplater | mammoth.js | Read-only, can't generate documents |

**Installation:**
```bash
# Already installed in project
npm install @react-pdf/renderer docxtemplater pizzip @tanstack/react-query
```

## Architecture Patterns

### Recommended Project Structure
```
src/lib/pdf/components/
├── household/           # New household-specific components
│   ├── HouseholdComposition.tsx
│   └── GovernanceRecommendations.tsx
├── AssessmentReport.tsx # Extended to accept household profile
└── styles.ts           # Extended with household section styles

src/lib/templates/
├── household-mapper.ts  # New household data mapping logic
├── data-mapper.ts      # Extended to include household context
└── types.ts           # Extended with household template data
```

### Pattern 1: Household Profile Integration
**What:** Pass household profile data through existing report generation pipeline
**When to use:** For all reports when household members exist
**Example:**
```typescript
// Source: Existing AssessmentReport.tsx pattern
interface AssessmentReportProps {
  data: AssessmentReportData
  householdProfile?: HouseholdProfile // New optional prop for backward compatibility
}

export function AssessmentReport({ data, householdProfile }: AssessmentReportProps) {
  return (
    <Document>
      <ReportCover {...} />
      <ExecutiveSummary {...} />
      {householdProfile && <HouseholdComposition profile={householdProfile} />}
      <CategoryBreakdown {...} />
      <RecommendationsSection
        missingControls={data.missingControls}
        householdProfile={householdProfile}
      />
    </Document>
  )
}
```

### Pattern 2: Template Data Enhancement
**What:** Extend existing template data mapping to include household member details
**When to use:** For all Word document template generation
**Example:**
```typescript
// Source: Existing data-mapper.ts pattern
export function mapAssessmentToTemplate(
  templateId: TemplateId,
  scoreData: ScoreResult,
  userEmail: string,
  householdProfile?: HouseholdProfile // New optional parameter
): TemplateData {
  const baseData = { /* existing mapping */ };

  if (householdProfile) {
    return {
      ...baseData,
      householdHead: householdProfile.members.find(m => m.relationship === 'SPOUSE')?.fullName,
      decisionMakers: householdProfile.members
        .filter(m => m.governanceRoles.includes('DECISION_MAKER'))
        .map(m => m.fullName),
      // Additional household-specific mappings
    };
  }

  return baseData;
}
```

### Anti-Patterns to Avoid
- **Direct database calls in PDF components:** Pass all data through props to maintain component purity
- **Hardcoded member limits:** Use dynamic mapping for variable household sizes
- **Breaking existing reports:** Always make household data optional for backward compatibility

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF layout engine | Custom PDF generation | @react-pdf/renderer | Professional formatting, pagination, styling handled |
| Word template parsing | Custom .docx parser | docxtemplater | Complex ZIP/XML handling, placeholder detection |
| Document caching | Custom file cache | TanStack Query with 5min staleTime | Handles invalidation, background updates, error states |
| Member role formatting | Custom governance display logic | Prisma enum mappings | Type safety, consistent with existing data model |

**Key insight:** Document generation involves complex layout algorithms, ZIP file manipulation, and XML parsing that libraries handle better than custom solutions.

## Common Pitfalls

### Pitfall 1: Memory Leaks in PDF Generation
**What goes wrong:** Every PDF render increases memory usage that never releases, especially with dynamic household data
**Why it happens:** React-pdf/renderer has known memory leak issues with repeated renders
**How to avoid:** Generate PDFs server-side or implement proper component cleanup
**Warning signs:** Browser memory usage climbing with each PDF generation, crashes on mobile devices

### Pitfall 2: Template Placeholder Corruption
**What goes wrong:** Missing household member data creates corrupt Word documents
**Why it happens:** docxtemplater throws errors on undefined placeholders without proper nullGetter configuration
**How to avoid:** Configure nullGetter to preserve placeholders when data missing, validate all templates
**Warning signs:** "Document corrupt" errors in Word, XML parsing failures

### Pitfall 3: Stale Household Data in Reports
**What goes wrong:** Reports show outdated member information after profile updates
**Why it happens:** Report generation doesn't invalidate household profile cache
**How to avoid:** Invalidate 'household-profile' query key when generating reports
**Warning signs:** Users reporting incorrect member names in generated documents

### Pitfall 4: Professional Formatting Loss
**What goes wrong:** Adding household sections breaks existing report layout and styling
**Why it happens:** New components don't follow established style patterns
**How to avoid:** Extend existing styles.ts, follow component composition patterns
**Warning signs:** Misaligned sections, inconsistent fonts, page break issues

## Code Examples

Verified patterns from project codebase:

### Household Profile Caching
```typescript
// Source: src/lib/hooks/useHouseholdProfile.ts
export function useHouseholdProfile() {
  const query = useQuery({
    queryKey: ['household-profile'],
    queryFn: async () => { /* existing logic */ },
    staleTime: 5 * 60 * 1000, // 5 minutes — profile rarely changes during assessment
    retry: 1,
  });
}
```

### PDF Component Pattern
```typescript
// Source: src/lib/pdf/components/AssessmentReport.tsx
return (
  <Document title="Family Governance Assessment Report">
    <ReportCover {...props} />
    <ExecutiveSummary {...props} />
    {/* New household section fits here */}
    <CategoryBreakdown breakdown={data.breakdown} />
    <RecommendationsSection missingControls={data.missingControls} />
  </Document>
)
```

### Template Data Mapping
```typescript
// Source: src/lib/templates/data-mapper.ts
export function mapAssessmentToTemplate(templateId: TemplateId, scoreData: ScoreResult, userEmail: string) {
  const familyName = userEmail.split('@')[0] || 'Your Family';
  return {
    familyName,
    assessmentDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    // Extend with household member data
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static family name from email | Dynamic household member data | Phase 6 (Profile Foundation) | Enables personalized governance recommendations |
| Generic governance templates | Role-based template customization | 2026 governance standards | More relevant policy documents |
| Single PDF layout | Modular component composition | react-pdf 4.x | Easier to add household sections |

**Deprecated/outdated:**
- cacheTime in TanStack Query v5: renamed to gcTime, use gcTime for garbage collection timing

## Open Questions

1. **Performance with Large Households**
   - What we know: Memory issues with react-pdf/renderer on repeated renders
   - What's unclear: Impact of 10+ household members on PDF generation time
   - Recommendation: Load test with large households, consider pagination

2. **Word Template Complexity Limits**
   - What we know: docxtemplater handles loops and conditionals for member lists
   - What's unclear: Performance limits for complex governance role matrices
   - Recommendation: Test templates with maximum expected member count

3. **Mobile PDF Viewing**
   - What we know: iOS Safari has 256MB canvas limits, PDF.js performance issues
   - What's unclear: Household section impact on mobile rendering
   - Recommendation: Test on mobile devices, consider progressive loading

## Sources

### Primary (HIGH confidence)
- [react-pdf GitHub repository](https://github.com/diegomura/react-pdf) - Official API documentation
- [docxtemplater official docs](https://docxtemplater.com/docs/) - Template and error handling patterns
- [TanStack Query caching strategies](https://tanstack.com/query/v4/docs/react/guides/caching) - Cache configuration guidance

### Secondary (MEDIUM confidence)
- [React PDF dynamic content guide](https://kartikbudhraja.medium.com/generating-dynamic-pdfs-with-react-a-step-by-step-guide-ab755995c3cd) - Dynamic PDF generation patterns
- [Family office governance best practices 2026](https://asora.com/blog/top-7-family-office-reporting-best-practices) - Professional formatting standards
- [TanStack Query staleTime optimization](https://medium.com/@bloodturtle/understanding-staletime-vs-gctime-in-tanstack-query-e9928d3e41d4) - Cache timing strategies

### Tertiary (LOW confidence)
- [React-PDF memory leak issues](https://github.com/diegomura/react-pdf/issues/2848) - Performance concerns requiring validation
- [Docxtemplater error handling](https://docxtemplater.com/docs/errors/) - Template corruption prevention

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries already in use with known versions
- Architecture: HIGH - Following established project patterns
- Pitfalls: MEDIUM - Based on documented issues and project experience

**Research date:** March 13, 2026
**Valid until:** April 13, 2026 (30 days - stable document generation domain)