# Phase 4: Reports & Templates - Research

**Researched:** March 12, 2026
**Domain:** PDF generation, Word document templating, data visualization
**Confidence:** HIGH

## Summary

Phase 4 requires implementing PDF report generation and Word template downloads for governance policies. The assessment system already has comprehensive scoring, risk categorization, and missing control identification. Need to integrate professional PDF generation for executive summaries and detailed reports, plus pre-filled Word templates for core governance policies.

**Primary recommendation:** Use @react-pdf/renderer for PDF generation and docxtemplater for Word document templating - both proven solutions with excellent Node.js integration.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | ^3.4.4 | PDF generation from React components | Industry standard for React PDF generation, ultra light, works server-side |
| docxtemplater | ^3.68.3 | Word template generation | Most mature Node.js Word templating solution, supports complex templates |
| file-saver | ^2.0.5 | Client-side file downloads | Standard for triggering downloads in browsers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pizzip | ^3.1.7 | ZIP handling for docxtemplater | Required dependency for Word document processing |
| buffer | ^6.0.3 | Buffer polyfill for browser usage | When using docxtemplater in browser context |
| @react-pdf/types | ^2.4.0 | TypeScript definitions | For type safety in PDF components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | Puppeteer | Puppeteer slower but handles complex CSS, larger bundle |
| @react-pdf/renderer | jsPDF | jsPDF simpler but no React component support |
| docxtemplater | docx-templates | docxtemplater more mature, better template editing |

**Installation:**
```bash
npm install @react-pdf/renderer docxtemplater file-saver pizzip buffer @react-pdf/types
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── pdf/              # PDF generation utilities
│   │   ├── components/   # React PDF components
│   │   ├── templates/    # PDF template definitions
│   │   └── utils.ts      # PDF helper functions
│   └── templates/        # Word template handling
│       ├── policies/     # Policy template definitions
│       ├── data/         # Template data mappers
│       └── generator.ts  # Template generation logic
├── app/api/
│   ├── reports/          # PDF generation endpoints
│   └── templates/        # Template download endpoints
└── components/
    └── reports/          # Results dashboard components
```

### Pattern 1: PDF Report Generation
**What:** Server-side PDF generation using React PDF components
**When to use:** For executive summaries and detailed assessment reports
**Example:**
```typescript
// Source: @react-pdf/renderer documentation
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const MyDocument = ({ scoreData }: { scoreData: ScoreResult }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Family Governance Assessment Report</Text>
        <Text>Overall Score: {scoreData.score}/10</Text>
        <Text>Risk Level: {scoreData.riskLevel}</Text>
      </View>
    </Page>
  </Document>
);
```

### Pattern 2: Word Template Generation
**What:** Template-based Word document generation with data injection
**When to use:** For customizable governance policy templates
**Example:**
```typescript
// Source: docxtemplater documentation
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const generateTemplate = (templateBuffer: Buffer, data: any) => {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.render(data);
  return doc.getZip().generate({ type: 'nodebuffer' });
};
```

### Pattern 3: Results Dashboard Integration
**What:** Enhanced ScoreDisplay component with download actions
**When to use:** For providing immediate access to reports and templates
**Example:**
```typescript
// Enhanced existing ScoreDisplay component
<div className="mt-8 flex gap-4">
  <Button onClick={downloadPDFReport}>
    Download PDF Report
  </Button>
  <Button variant="outline" onClick={downloadTemplates}>
    Get Policy Templates
  </Button>
</div>
```

### Anti-Patterns to Avoid
- **Client-side PDF generation for large reports:** Use server-side generation to avoid performance issues
- **Manual Word document assembly:** Use template-based approach for consistency and maintainability
- **Inline PDF/Word generation:** Abstract into dedicated services for reusability

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF layout engine | Custom PDF writer | @react-pdf/renderer | Complex typography, page breaks, styling edge cases |
| Word document creation | Manual XML manipulation | docxtemplater | OOXML format complexity, template logic, cross-platform compatibility |
| File downloads | Custom download handlers | file-saver | Browser compatibility, CORS handling, mobile support |
| Template data mapping | Manual object transformation | Structured mappers | Type safety, validation, consistency |

**Key insight:** PDF and Word document generation involve complex specifications with many edge cases. Mature libraries handle format compliance, rendering optimizations, and cross-platform compatibility.

## Common Pitfalls

### Pitfall 1: PDF Component State Issues
**What goes wrong:** React PDF components don't support React hooks or stateful logic
**Why it happens:** @react-pdf/renderer uses its own renderer, not React DOM
**How to avoid:** Pre-process all data before passing to PDF components
**Warning signs:** Errors about hooks not being supported in PDF context

### Pitfall 2: Word Template Path Resolution
**What goes wrong:** Template files not found when deployed to production
**Why it happens:** Different file path resolution between development and production
**How to avoid:** Use absolute paths or place templates in public directory
**Warning signs:** Works locally but fails in production deployment

### Pitfall 3: Memory Issues with Large Reports
**What goes wrong:** Server memory exhaustion when generating large PDF reports
**Why it happens:** @react-pdf/renderer loads entire document into memory
**How to avoid:** Implement pagination, streaming, or background job processing
**Warning signs:** Timeouts or OOM errors with comprehensive reports

### Pitfall 4: Template Data Type Mismatches
**What goes wrong:** docxtemplater fails silently or produces corrupted documents
**Why it happens:** Template placeholders expect specific data types or structures
**How to avoid:** Validate template data against expected schema before generation
**Warning signs:** Missing content in generated documents or generation failures

## Code Examples

Verified patterns from official sources:

### PDF API Route
```typescript
// Source: @react-pdf/renderer documentation
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { AssessmentReport } from '@/lib/pdf/components/AssessmentReport';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('id');

  // Fetch assessment data
  const assessmentData = await getAssessmentData(assessmentId);

  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    <AssessmentReport data={assessmentData} />
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="assessment-report.pdf"',
    },
  });
}
```

### Word Template Generation
```typescript
// Source: docxtemplater documentation
import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const { templateType, assessmentData } = await request.json();

  // Load template
  const templatePath = path.join(process.cwd(), 'templates', `${templateType}.docx`);
  const content = fs.readFileSync(templatePath, 'binary');

  // Generate document
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Map assessment data to template format
  const templateData = mapAssessmentToTemplate(assessmentData, templateType);
  doc.render(templateData);

  const buffer = doc.getZip().generate({ type: 'nodebuffer' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${templateType}-policy.docx"`,
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF manual layout | @react-pdf/renderer components | 2022-2023 | Component-based PDF development |
| Puppeteer for all PDFs | Hybrid approach | 2024-2025 | Better performance for structured reports |
| Manual Word XML | Template-based generation | 2020-ongoing | Non-technical template editing |

**Deprecated/outdated:**
- PDFKit: Too low-level for React applications
- html-pdf: Deprecated, security issues with PhantomJS dependency

## Open Questions

1. **Template Storage Strategy**
   - What we know: Templates need to be accessible to server
   - What's unclear: Best practice for template versioning and updates
   - Recommendation: Store in `/templates` directory with version control

2. **Report Caching Strategy**
   - What we know: PDF generation can be resource-intensive
   - What's unclear: Whether to implement caching for identical assessments
   - Recommendation: Start without caching, monitor performance

3. **Template Customization Level**
   - What we know: Users want pre-filled templates
   - What's unclear: How much customization to allow in templates
   - Recommendation: Start with 5-7 core templates, expand based on feedback

## Sources

### Primary (HIGH confidence)
- [docxtemplater official documentation](https://docxtemplater.com)
- [docxtemplater npm package](https://www.npmjs.com/package/docxtemplater)
- [@react-pdf/renderer documentation](https://react-pdf.org/)

### Secondary (MEDIUM confidence)
- [Turning React apps into PDFs with Next.js, NodeJS and puppeteer](https://dev.to/jordykoppen/turning-react-apps-into-pdfs-with-nextjs-nodejs-and-puppeteer-mfi)
- [A full comparison of 6 JS libraries for generating PDFs](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- [Top JavaScript PDF generator libraries for 2026](https://www.nutrient.io/blog/top-js-pdf-libraries/)
- [Creating Customized Word Document Templates with Node.js](https://www.linkedin.com/pulse/creating-customized-word-document-templates-nodejs-schaffner-bofill)
- [Family Constitution Guide: Template + Examples 2026](https://advisorfinder.com/resources-for-clients/family/constitution-guide)
- [8 Essential Best Practices for Effective Family Governance](https://www.bedrockgroup.com/8-best-practices-for-family-governance/)

### Tertiary (LOW confidence)
- Community discussions on React PDF vs Puppeteer performance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-established libraries with proven track records
- Architecture: HIGH - Patterns verified against official documentation
- Pitfalls: MEDIUM - Based on documented issues and community experience

**Research date:** March 12, 2026
**Valid until:** June 12, 2026 (3 months for stable ecosystem)