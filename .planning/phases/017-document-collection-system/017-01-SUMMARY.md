---
phase: 017-document-collection-system
plan: 01
subsystem: document-collection
tags: [infrastructure, s3, validation, security, api]
dependency_graph:
  requires: [client-status-pipeline]
  provides: [document-upload-infrastructure]
  affects: [advisor-workflow]
tech_stack:
  added: [react-dropzone, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner]
  patterns: [presigned-urls, multi-tenant-isolation, server-actions]
key_files:
  created:
    - src/lib/documents/s3.ts
    - src/lib/documents/types.ts
    - src/lib/documents/validation.ts
    - src/app/api/documents/upload-url/route.ts
    - src/app/api/documents/confirm/route.ts
    - src/lib/actions/document-actions.ts
  modified:
    - prisma/schema.prisma
decisions:
  - "Extended DocumentRequirement model with file storage fields (fileKey, fileName, fileSize, fileMimeType)"
  - "Used AWS S3 presigned URLs for secure client-side uploads without exposing credentials"
  - "Implemented lazy S3 client initialization to handle missing environment variables gracefully"
  - "Enforced multi-tenant isolation by validating clientId === session.user.id in all document operations"
  - "Separated upload URL generation and confirmation into two API endpoints for better security"
metrics:
  duration: 189
  completed_date: "2026-03-16T03:30:04Z"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
  commits: 2
---

# Phase 017 Plan 01: Document Upload Infrastructure Summary

Secure S3 document upload infrastructure with presigned URLs and multi-tenant validation

## Objective Achieved

Extended the DocumentRequirement schema with file storage fields and built the secure S3 upload infrastructure with presigned URL endpoints for client document uploads.

## Implementation Summary

Built a complete document upload infrastructure using AWS S3 presigned URLs with proper security, validation, and multi-tenant isolation:

### Database Schema Extension
- Added file metadata fields to DocumentRequirement: `fileKey`, `fileName`, `fileSize`, `fileMimeType`
- Maintains referential integrity with existing advisor/client relationship

### Security & Validation
- Server-side file type validation (PDF, PNG, JPEG only)
- File size limits (10MB maximum)
- Multi-tenant isolation preventing cross-client document access
- Presigned URL approach keeps AWS credentials secure

### API Infrastructure
- `POST /api/documents/upload-url`: Generates secure presigned upload URLs
- `POST /api/documents/confirm`: Marks requirements fulfilled after upload
- Proper authentication and authorization on all endpoints

### Server Actions
- `getClientDocumentRequirements()`: Fetches client requirements grouped by advisor
- `confirmDocumentUpload()`: Server action for upload confirmation
- `getDocumentDownloadUrl()`: Generates presigned download URLs

## Deviations from Plan

None - plan executed exactly as written.

## Key Technical Decisions

### S3 Presigned URLs
Used presigned URLs instead of direct server uploads for better scalability and to keep AWS credentials secure on the server.

### Lazy Initialization Pattern
Followed existing codebase pattern (Resend email client) for graceful handling of missing environment variables during development.

### Multi-Tenant Security
Implemented strict clientId validation in all document operations to prevent unauthorized access across tenant boundaries.

## Files Created/Modified

**Created:**
- `src/lib/documents/s3.ts` - S3 client and presigned URL utilities
- `src/lib/documents/types.ts` - Document upload type definitions and constants
- `src/lib/documents/validation.ts` - Server-side file validation logic
- `src/app/api/documents/upload-url/route.ts` - Presigned URL generation endpoint
- `src/app/api/documents/confirm/route.ts` - Upload confirmation endpoint
- `src/lib/actions/document-actions.ts` - Document server actions for client portal

**Modified:**
- `prisma/schema.prisma` - Extended DocumentRequirement with file fields

## Next Steps

This infrastructure provides the foundation for Phase 017 Plan 02 to build the client document portal UI components that will consume these APIs.

## Self-Check: PASSED

✓ All created files exist at specified paths
✓ Both task commits exist in git history (8536d8d, 2ce21ab)
✓ TypeScript compiles without errors
✓ Prisma schema validates successfully
✓ S3 utilities handle missing environment variables gracefully