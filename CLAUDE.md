# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AkiliRisk is a Next.js 16+ risk assessment platform built with TypeScript, featuring multi-role access (clients, advisors, admins) and comprehensive risk analysis modules including family risk, cyber risk, identity risk, and intelligence assessments.

## Development Commands

```bash
# Install dependencies and generate Prisma client
npm install

# Development server
npm run dev

# Build for production
npm run build

# Production server
npm start

# Linting
npm run lint

# Testing
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
```

## Database Operations

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name descriptive-name

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Seed test data (run in order)
node scripts/seed-advisor-test-data.js
node scripts/seed-invite-code.js
node scripts/set-advisor-role.js
node scripts/set-admin-role.js
```

## Architecture & Structure

### Application Structure
- **App Router**: `/src/app` with route groups `(auth)` and `(protected)`
- **Components**: `/src/components` organized by domain (admin, advisor, assessment, etc.)
- **Business Logic**: `/src/lib` with domain-specific modules (actions, analytics, assessment, etc.)
- **Database**: PostgreSQL with Prisma ORM (`/prisma/schema.prisma`)

### Key Patterns
- **Path Aliases**: Use `@/*` for imports from `/src`
- **Server Actions**: Located in `/src/lib/actions` for database operations
- **Authentication**: NextAuth with MFA support (`/src/lib/auth.ts`)
- **Database Access**: Always use Prisma client from `/src/lib/db.ts`
- **UI Components**: shadcn/ui components in `/src/components/ui`

### Role-based Architecture
- **USER**: Default client role with assessment access
- **ADVISOR**: Can manage clients and review assessments
- **ADMIN**: Full system access via dedicated admin interface

## Key Modules

### Risk Assessment Types
- **Family Risk**: Household member analysis (`/src/lib/family`)
- **Cyber Risk**: Digital security assessment (`/src/lib/cyber-risk`)
- **Identity Risk**: Personal information security (`/src/lib/identity-risk`)
- **Intelligence**: Risk intelligence analysis (`/src/lib/intelligence`)

### Core Functionality
- **Intake System**: Client onboarding with questionnaires (`/src/lib/intake`)
- **Assessment Engine**: Multi-stage risk evaluation (`/src/lib/assessment`)
- **Advisor Tools**: Client management and review workflows (`/src/lib/advisor`)
- **Document Generation**: PDF reports and templates (`/src/lib/documents`)
- **Pipeline**: Assessment workflow management (`/src/lib/pipeline`)

## Test Credentials

Use these credentials for local development testing:

| Role | Email | Password | Notes |
|------|--------|----------|--------|
| **Advisor** | `advisor@test.com` | `testpassword123` | Access Advisor Hub/Portfolio |
| **Client** | `client@test.com` | `testpassword123` | Standard client account |
| **Client (MFA)** | `client-mfa@test.com` | `testpassword123` | For MFA flow testing |
| **Admin** | `buddy@ebilly.com` | `Test1111!` | Admin access (run set-admin-role.js first) |

### Invite Codes
- **123456**: Generic signup code
- **BELV01**: Prefills `buddy+belvcustomer@ebilly.com` on signup

## Development Notes

### Environment Setup
- **Identity for this repo**: Git author `buddy@ebilly.com` (`git config --local`). **AWS** for Akili is the same org: use CLI profile **`ebilly`** in `~/.aws/config` (SSO or keys for `buddy@ebilly.com`). This workspace sets `AWS_PROFILE=ebilly` for integrated terminals (`.vscode/settings.json`). Runtime S3 in `.env.local` should use IAM keys from that account too.
- **Cursor / VS Code profile**: Import `profiles/akili-ebilly.code-profile` or rely on `.vscode/settings.json` (`AWS_PROFILE=buddy@ebilly.com`). The profile must be fully configured for SSO in `~/.aws/config` (see `profiles/aws-profile-akili.snippet`); then `aws sso login --profile buddy@ebilly.com`.
- **Shell themes** (e.g. Starship) may export `AWS_PROFILE` for another org. The CORS script **does not** use that: it picks `AKILI_AWS_PROFILE`, or `./akili.awsprofile` (copy from `akili.awsprofile.example`), or a profile named `ebilly` if defined in `~/.aws/config`. Template: `profiles/aws-profile-akili.snippet`.
- Copy `.env.example` to `.env.local` and configure
- Database: PostgreSQL connection via `DATABASE_URL`
- Auth: NextAuth secret via `AUTH_SECRET`
- Email: Optional Resend API key for notifications
- OpenAI: API key for AI-powered risk analysis

### Testing Flows
1. **Client Assessment**: Home → Start Assessment → Enter invite code → Complete intake → Advisor review
2. **Advisor Workflow**: Sign in → Advisor Hub → Portfolio → Client management
3. **Admin Functions**: Admin nav → Advisors/Clients/Assessment Management
4. **MFA Setup**: Client Settings → Enable Two-Factor Authentication

### Code Quality
- ESLint configured with Next.js and TypeScript rules
- Unused variables prefixed with `_` are ignored
- Vitest for unit testing with global test environment
- TypeScript strict mode enabled

## Common Patterns

### Database Queries
```typescript
// Always import from lib/db
import { db } from '@/lib/db'

// Use Prisma client for all database operations
const user = await db.user.findUnique({ where: { email } })
```

### Server Actions
```typescript
// Place in /src/lib/actions directory
'use server'

export async function createAssessment(data: FormData) {
  // Server action implementation
}
```

### Authentication Checks
```typescript
// Use auth helper for session management
import { auth } from '@/lib/auth'

const session = await auth()
if (!session?.user) redirect('/auth/signin')
```
