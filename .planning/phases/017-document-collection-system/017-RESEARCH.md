# Phase 17: Document Collection System - Research

**Researched:** March 16, 2026
**Domain:** File upload, document management, workflow automation
**Confidence:** HIGH

## Summary

Phase 17 requires implementing a secure document collection system for client-advisor workflows with automated reminders and white-label PDF reports. The system builds on existing database structures (DocumentRequirement model) and PDF generation capabilities (@react-pdf/renderer).

Key technical domains: secure file uploads using react-dropzone + AWS S3 presigned URLs, document tracking with the existing Prisma schema, automated reminders via node-cron, and white-label PDF generation extending current @react-pdf/renderer implementation.

**Primary recommendation:** Use react-dropzone for client portal uploads, AWS S3 with presigned URLs for secure storage, extend existing PDF system for advisor branding, and implement node-cron for automated client reminders.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | Latest | File upload UI with drag-drop | Industry standard for React file uploads, HTML5 compliant |
| @aws-sdk/client-s3 | v3.x | S3 operations | Modern AWS SDK v3, modular and lightweight |
| @aws-sdk/s3-request-presigner | v3.x | Presigned URL generation | Secure direct uploads without exposing credentials |
| node-cron | Latest | Task scheduling | Pure JavaScript cron scheduler for Node.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | Current | PDF generation (existing) | Already implemented for assessment reports |
| multer | Latest | Multipart form parsing | Alternative to built-in formData for complex uploads |
| mime-types | Latest | File type validation | Server-side MIME type verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | FilePond React | More features but heavier bundle |
| AWS S3 | Cloudinary/Uploadcare | SaaS simplicity vs cost and control |
| node-cron | Bull/Agenda | Database persistence vs memory-based simplicity |

**Installation:**
```bash
npm install react-dropzone @aws-sdk/client-s3 @aws-sdk/s3-request-presigner node-cron mime-types
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── documents/          # Document upload/management UI
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── RequiredDocsList.tsx
│   └── advisor/            # Advisor document management
├── app/api/
│   ├── documents/          # Document management endpoints
│   │   ├── upload-url/route.ts
│   │   ├── [id]/route.ts
│   │   └── requirements/route.ts
│   └── reminders/          # Automated reminder system
└── lib/
    ├── documents/          # Document business logic
    ├── reminders/          # Reminder scheduling
    └── pdf/               # Extend existing PDF system
```

### Pattern 1: Secure Upload Flow
**What:** Client requests presigned URL → uploads directly to S3 → notifies server of completion
**When to use:** All file uploads to maintain security and performance
**Example:**
```typescript
// Source: AWS S3 official docs + Next.js patterns
// 1. Generate presigned URL
const command = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: `documents/${userId}/${filename}`,
  ContentType: fileType,
});
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

// 2. Client uploads directly to S3
const response = await fetch(signedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Server records completion
await prisma.documentRequirement.update({
  where: { id },
  data: { fulfilled: true, fulfilledAt: new Date() }
});
```

### Pattern 2: Document Requirement Tracking
**What:** Advisor creates requirements → Client uploads → System tracks completion
**When to use:** All document collection workflows
**Example:**
```typescript
// Source: Existing DocumentRequirement schema
const requirement = await prisma.documentRequirement.create({
  data: {
    advisorId,
    clientId,
    name: "Tax Return 2025",
    description: "Complete Form 1040 with schedules",
    required: true
  }
});
```

### Pattern 3: Automated Reminder System
**What:** Scheduled tasks check unfulfilled requirements and send reminders
**When to use:** All document collection with deadlines
**Example:**
```typescript
// Source: node-cron documentation
cron.schedule('0 9 * * *', async () => {
  const overdue = await prisma.documentRequirement.findMany({
    where: {
      fulfilled: false,
      createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    include: { client: true }
  });

  for (const doc of overdue) {
    await sendReminderEmail(doc.client.email, doc.name);
  }
});
```

### Anti-Patterns to Avoid
- **Direct server upload:** Don't upload through your Next.js server - use presigned URLs for better performance
- **Client-side only validation:** Always validate file types and sizes server-side
- **Storing files in /public:** Never store sensitive documents in publicly accessible directories

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload UI | Custom drag-drop | react-dropzone | Handles edge cases, accessibility, browser compatibility |
| File type detection | String parsing | mime-types library | Covers security edge cases, MIME sniffing attacks |
| Cron scheduling | Custom timers | node-cron | Proper cron syntax, timezone handling, error recovery |
| Presigned URL security | Custom signing | AWS SDK | Cryptographically secure, handles edge cases |

**Key insight:** File upload and scheduling seem simple but have numerous security and edge case considerations that libraries handle better.

## Common Pitfalls

### Pitfall 1: Insecure File Storage
**What goes wrong:** Files stored in /public directory or without proper access controls
**Why it happens:** Convenience of serving static files directly
**How to avoid:** Always use private S3 buckets with presigned URLs for access
**Warning signs:** File URLs accessible without authentication

### Pitfall 2: Client-Side Security Theater
**What goes wrong:** Only validating file types/sizes on client, server trusts client data
**Why it happens:** Better UX to validate immediately in browser
**How to avoid:** Always re-validate server-side, treat client validation as UX enhancement only
**Warning signs:** No server-side validation in upload routes

### Pitfall 3: Reminder Spam
**What goes wrong:** Sending multiple reminders for same document without deduplication
**Why it happens:** Simple cron job without state tracking
**How to avoid:** Track reminder history, implement exponential backoff
**Warning signs:** Client complaints about excessive emails

### Pitfall 4: Hard-Coded Branding
**What goes wrong:** PDF branding not configurable per advisor
**Why it happens:** Simpler to hard-code initial implementation
**How to avoid:** Design advisor profile to include branding assets from start
**Warning signs:** All reports look identical regardless of advisor

## Code Examples

Verified patterns from official sources:

### Secure File Upload Component
```typescript
// Source: react-dropzone official docs
import { useDropzone } from 'react-dropzone';

const DocumentUpload = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (files) => {
      for (const file of files) {
        const formData = new FormData();
        formData.append('fileName', file.name);
        formData.append('fileType', file.type);

        // Get presigned URL
        const urlResponse = await fetch('/api/documents/upload-url', {
          method: 'POST',
          body: formData
        });
        const { signedUrl, documentId } = await urlResponse.json();

        // Upload to S3
        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        onUpload(documentId);
      }
    }
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? 'Drop files here' : 'Drag files or click to upload'}
    </div>
  );
};
```

### Presigned URL Generation
```typescript
// Source: AWS S3 official documentation
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function generateUploadUrl(fileName: string, fileType: string, userId: string) {
  const key = `documents/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600 // 1 hour
  });

  return { signedUrl, key };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server file uploads | Direct S3 uploads | 2023-2024 | Better performance, reduced server load |
| Hard-coded PDF branding | Advisor-configurable branding | 2025-2026 | White-label capability |
| Manual reminder tracking | Automated cron-based system | 2024-2026 | Reduced manual work |
| Form-based uploads | Drag-and-drop interfaces | 2022-2025 | Better UX |

**Deprecated/outdated:**
- multer for all file uploads: Use presigned URLs instead for security and performance
- Storing files locally: Cloud storage is now standard for scalability

## Open Questions

1. **File retention and cleanup**
   - What we know: S3 supports lifecycle policies
   - What's unclear: Business rules for document retention periods
   - Recommendation: Plan S3 lifecycle rules during implementation

2. **Large file handling**
   - What we know: Presigned URLs support files up to 5GB
   - What's unclear: Expected file sizes and chunked upload needs
   - Recommendation: Start with basic uploads, add chunking if needed

3. **Virus scanning**
   - What we know: Third-party services available for malware scanning
   - What's unclear: Required compliance level for document scanning
   - Recommendation: Evaluate compliance requirements before choosing solution

## Sources

### Primary (HIGH confidence)
- [AWS S3 Presigned URLs Official Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html) - Presigned URL security and best practices
- [react-dropzone GitHub Repository](https://github.com/react-dropzone/react-dropzone) - Current usage patterns and API

### Secondary (MEDIUM confidence)
- [Handling File Uploads in Nextjs Best Practices and Security Considerations | MoldStud](https://moldstud.com/articles/p-handling-file-uploads-in-nextjs-best-practices-and-security-considerations)
- [How to Secure Your Next.js Application: Middleware, Security Headers, Best Practices, and Common Mistakes & Anti-Patterns | by Boluwatife Ajose | Mar, 2026 | Medium](https://medium.com/@boluwatifeajose/how-to-secure-your-next-js-application-middleware-security-headers-and-best-practices-2235ff2bbb77)
- [File Uploads, Images & Media Handling in Next.js (Production-Ready Patterns) | by Chandan | Full-Stack Developer | CodeToDeploy | Jan, 2026 | Medium](https://medium.com/codetodeploy/file-uploads-images-media-handling-in-next-js-production-ready-patterns-d914c6456620)
- [7 Best React File Upload Components For Modern Web Apps (2026 Update) - ReactScript](https://reactscript.com/best-file-upload/)
- [Upload Files from Next.js to AWS S3 Using Presigned URLs - DEV Community](https://dev.to/ahadcommit/upload-files-from-nextjs-to-aws-s3-using-presigned-urls-50k9)
- [Using Presigned URLs in a Next.js App Router Project to Upload Files to an AWS S3 Bucket | Coner Murphy](https://conermurphy.com/blog/presigned-urls-nextjs-s3-upload/)
- [How to upload files to AWS S3 using pre-signed URLs in Next JS. | by Kundan Bhosale | Medium](https://medium.com/@kundanmbhosale/how-to-upload-files-to-aws-s3-using-pre-signed-urls-in-next-js-92af067a4e7f)
- [Puppeteer HTML to PDF Generation with Node.js - RisingStack Engineering](https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/)
- [How to Create Cron Jobs in Node.js](https://oneuptime.com/blog/post/2026-01-22-nodejs-cron-jobs/view)
- [Automating Tasks with Cron Jobs in Node.js - DEV Community](https://dev.to/sojida/automating-tasks-with-cron-jobs-in-nodejs-52e0)
- [Document Workflow Automation 2026: Tools & Guide](https://www.flowforma.com/blog/document-workflow-automation)

### Tertiary (LOW confidence)
- [node-cron - npm](https://www.npmjs.com/package/node-cron) - Package information only
- [GitHub - node-cron/node-cron: A simple cron-like job scheduler for Node.js · GitHub](https://github.com/node-cron/node-cron) - Implementation details to verify

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - AWS S3 and react-dropzone are proven enterprise solutions
- Architecture: HIGH - Patterns based on AWS and Next.js official documentation
- Pitfalls: MEDIUM - Based on common security issues documented in search results

**Research date:** March 16, 2026
**Valid until:** April 15, 2026 (30 days for stable technologies)