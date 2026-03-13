# Stack Research

**Domain:** Family Governance Risk Assessment Web Application + Household Profile Management + Intake Interview & Advisor Portal
**Researched:** 2026-02-17 (Updated: 2026-03-12, 2026-03-13)
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5+ | Full-stack framework | Industry standard for React apps in 2025. Built-in API routes, Server Actions, Server Components reduce architecture complexity. Turbopack bundler (now default) significantly faster than webpack. App Router with React 19 support provides modern patterns for data fetching and rendering. |
| React | 19.2+ | UI framework | React 19 stable release brings automatic optimizations and Server Components. Next.js 15 fully supports React 19. Largest ecosystem of components and libraries. |
| TypeScript | 5.7+ | Type safety | Eliminates entire classes of runtime errors. Next.js 15.5 adds typed routes for compile-time route safety. Essential for multi-developer projects and long-term maintainability. |
| PostgreSQL | 16+ | Primary database | Proven reliability for structured data. ACID compliance critical for risk assessment records. Excellent JSON support (better than MongoDB for hybrid workloads). Superior query performance for complex reporting. |
| Neon | Latest | Serverless Postgres | Scale-to-zero reduces hosting costs (critical for MVP budget). 100 CU-hours free tier sufficient for development and early production. 15-25% compute cost reduction in 2025. Branching enables safe schema migrations and preview environments. Storage at $0.35/GB-month (down from $1.75) makes it most cost-effective serverless option. |
| Tailwind CSS | 4.x | Styling framework | Standard for 2025. Utility-first reduces CSS bloat. New @theme directive simplifies theming. Excellent with component libraries. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.54+ | Form management | All forms. 12KB bundle (vs 44KB Formik). Zero dependencies. Uncontrolled inputs minimize re-renders. Active maintenance (Formik abandoned). Required for 12-minute assessment workflow. |
| Zod | 3.24+ | Schema validation | All data validation. TypeScript-first validation with type inference. Integrates with React Hook Form via @hookform/resolvers. Single source of truth for validation rules and types. |
| shadcn/ui | Latest | Component library | All UI components. Copy-paste components you own (not npm dependency). Built on Radix primitives for accessibility. Tailwind v4 compatible. Significantly faster than building from scratch. |
| Drizzle ORM | Latest | Database ORM | All database access. SQL-like API with full type safety. 7.4KB bundle. Zero dependencies. No Rust binary (unlike Prisma). Instant type updates without generation step. Better for serverless/edge due to minimal cold start. |
| NextAuth.js (Auth.js) | 5.x | Authentication | User auth. Most popular Next.js auth solution. Zero marginal cost (vs paid services). CVE-2025-29927 fixed - use Data Access Layer pattern not middleware. Supports multiple providers. |
| Resend | 3.x | Email delivery | Transactional emails. Developer-friendly API. React Email integration for beautiful templates. Free tier includes DKIM/SPF/DMARC. Better DX than SendGrid/Mailgun. |
| @react-pdf/renderer | 3.x | PDF generation | Assessment reports. Pure React components for PDFs. Lighter than Puppeteer (no headless browser). Server-side rendering compatible. Sufficient for structured reports. |
| TanStack Query | 5.x | Server state | API data caching. Automatic background refetching. Optimistic updates. Reduces boilerplate. Better than useState + fetch. |
| Vitest | 2.x | Testing framework | Unit tests. 10-20x faster than Jest in watch mode. Native ESM and TypeScript. Vite compatibility. Drop-in Jest replacement. |

## NEW: Household Profile Management Stack Additions

### Required for Household Features

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-international-phone | ^4.3.0 | International phone number input | For household member contact info; TypeScript-native, React Hook Form compatible with proper validation |
| react-day-picker | ^9.1.3 | Date picker for birth dates | For member date of birth; integrates with existing date-fns, WCAG compliant, TypeScript native |

## NEW: Intake Interview & Audio Recording Stack Additions

### Core New Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| RecordRTC | 5.6.x | Browser audio recording | Most maintained WebRTC library with Chrome/Firefox/Safari support, handles format conversion, 15KB minified |
| OpenAI Whisper API | v1 | Audio transcription | Best price/accuracy ratio at $0.006/minute, 103 languages, reliable uptime, streaming support |
| rhf-wizard | 1.2.x | Multi-step form wizard | Integrates with existing React Hook Form, handles step validation, progress tracking |

### Supporting Libraries for New Features

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-audio-visualize | 2.x | Audio waveform display | Recording feedback and playback visualization during interviews |
| @radix-ui/react-dialog | 1.x | Modal/overlay components | Advisor portal overlays, recording confirmation dialogs, step transitions |
| lucide-react | 0.x | Icon library | Recording controls, step indicators, advisor portal navigation |

## NEW: Advisor Portal Stack Additions

### Role-Based Access Control

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Custom RBAC with Auth.js | - | Role-based permissions | Advisor vs client role checking, built on existing auth, no additional dependencies needed |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code linting | Use Next.js config: `extends: ["next/core-web-vitals"]` |
| Prettier | Code formatting | Integrate with ESLint via `eslint-config-prettier` |
| Husky | Git hooks | Pre-commit linting and type checking |
| TypeScript Strict Mode | Type safety | Enable `strict: true` in tsconfig.json |
| @types/dom-mediacapture-record | Type definitions for MediaRecorder API | Essential for TypeScript audio recording |

## Installation

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest belvedere-app --typescript --tailwind --app --eslint

# Core dependencies
npm install react-hook-form @hookform/resolvers zod
npm install drizzle-orm drizzle-kit postgres
npm install @tanstack/react-query
npm install next-auth@beta
npm install resend react-email @react-email/components
npm install @react-pdf/renderer

# Household profile dependencies
npm install react-international-phone react-day-picker

# NEW: Intake interview & audio recording
npm install recordrtc rhf-wizard react-audio-visualize
npm install @radix-ui/react-dialog lucide-react

# UI components (via shadcn CLI)
npx shadcn@latest init
npx shadcn@latest add form input button select textarea dialog

# Dev dependencies
npm install -D vitest @vitejs/plugin-react
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged
npm install -D @types/react-day-picker @types/dom-mediacapture-record
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma 7 | Use Prisma if team already experienced with it. Prisma 7 removed Rust engine (performance gap narrowed). Better for complex schema migrations with auto-generation. Trade: 2x larger bundle, generation step. |
| Neon | Supabase | Use Supabase if you need built-in auth, storage, realtime, edge functions. All-in-one stack at $25/month. Trade: Always-on compute (no scale-to-zero), 70% higher cost for variable loads. |
| React Hook Form | Formik | Never. Formik abandoned (no commits in 1+ year), 3.6x larger bundle, more re-renders. React Hook Form superior in every metric. |
| @react-pdf/renderer | Puppeteer | Use Puppeteer if you need pixel-perfect HTML/CSS rendering. Better for complex layouts with modern CSS. Trade: Requires headless Chrome, slower cold starts, higher memory usage. Not needed for structured reports. |
| NextAuth.js | Clerk/Auth0 | Use paid service if you need enterprise SSO, advanced RBAC, pre-built UI components, compliance certifications. Trade: $25+/month, vendor lock-in. NextAuth sufficient for MVP. |
| Vitest | Jest | Use Jest if React Native is in roadmap (required for Expo). Otherwise Vitest superior: 10-20x faster, native ESM/TS, modern API. |
| Vercel | VPS (Railway/Render) | Use VPS if cost-sensitive after 1M pageviews. Vercel $20/month Pro can hit $500+/month with bandwidth overages. Railway/Render $5-8/month unlimited. Trade: Manual scaling, ops overhead. Vercel better for MVP (zero config). |

### NEW: Audio Recording & Interview Alternatives

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| RecordRTC | Native MediaRecorder API | Simple recording without format conversion needs, smaller bundle |
| OpenAI Whisper | Google Speech-to-Text | Enterprise environments with existing Google Cloud setup |
| rhf-wizard | React Albus | Complex state machine requirements beyond forms |
| react-audio-visualize | Custom canvas solution | Highly specialized visualization needs |

### Household Profile Alternatives

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| react-international-phone | react-phone-number-input | If you need more extensive formatting options, but comes with larger bundle size |
| react-day-picker | react-datepicker | If you need time selection; react-day-picker is lighter and date-fns integrated |
| useFieldArray (react-hook-form) | Custom state management | Never; useFieldArray handles performance and validation edge cases properly |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MongoDB | JSON flexibility unnecessary for structured risk assessments. Postgres JSON support sufficient. Missing relational integrity causes data inconsistencies. Harder to write complex reports. | PostgreSQL with JSONB columns where needed |
| Pages Router (Next.js) | Deprecated pattern. App Router is the future. Server Components and Server Actions simplify architecture. Migration path exists but costly. | App Router (default in create-next-app) |
| Create React App | Abandoned by React team. No longer maintained. Slow build times. Missing modern features. | Next.js, Vite, or Remix |
| CSS-in-JS (emotion, styled-components) | Runtime overhead. Slower than Tailwind. Harder to optimize. Poor SSR performance. Trend moving away from runtime CSS. | Tailwind CSS 4 with shadcn/ui |
| PDFKit | Low-level canvas API. Not React-friendly. Manual positioning tedious. Harder to maintain than declarative components. | @react-pdf/renderer for React components |
| Sequelize | Legacy ORM. Poor TypeScript support. No longer actively maintained. Slower than modern alternatives. | Drizzle or Prisma |
| npm | Slower than modern alternatives. Inconsistent lockfile behavior. | pnpm (3x faster installs) or yarn |

### NEW: Audio Recording Anti-Patterns

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Recorder.js | Not maintained since 2016, no TypeScript support | RecordRTC |
| Assembly AI | 5x more expensive ($0.55/hour vs $0.006/minute) | OpenAI Whisper |
| Vanilla wizard libs | Manual form state management overhead | rhf-wizard with React Hook Form |
| CASL for RBAC | Server component compatibility issues in Next.js | Custom role checking with existing Auth.js setup |

### Household Profile Anti-Patterns

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| formik | Performance issues with large dynamic forms | react-hook-form already integrated |
| yup | Less TypeScript-native than Zod | zod already integrated with better inference |
| Custom phone validation | Regex patterns miss international edge cases | react-international-phone with proper libphonenumber validation |
| Material UI Date Picker | Adds entire MUI dependency for one component | react-day-picker with existing shadcn/ui styling |

## Stack Patterns by Variant

**If budget extremely constrained (< $10/month):**
- Use Neon free tier (100 CU-hours sufficient for low traffic)
- Deploy on Vercel free tier (limited to hobby projects)
- Use Resend free tier (100 emails/day)
- OpenAI Whisper free tier ($5 credits for ~833 minutes)
- Total: $0/month for MVP validation

**If expecting high traffic (1M+ pageviews/month):**
- Use Railway or Render VPS ($8-17/month) instead of Vercel
- Self-host Postgres on VPS or use Neon Scale plan
- Consider Cloudflare Pages for static assets (free unlimited bandwidth)
- Budget $20-30/month for transcription at scale

**If team unfamiliar with Next.js:**
- Still use Next.js. Learning curve < 1 week for React developers
- Follow official App Router tutorial first
- App Router simpler than Pages Router (less boilerplate)

**If complex PDF layouts required:**
- Switch to Puppeteer for PDF generation
- Accept higher cold start times (2-5 seconds)
- Consider background job queue for large reports

### NEW: Audio Recording Patterns

**If simple recording only:**
- Use native MediaRecorder API
- Because minimal dependencies for basic audio capture

**If real-time transcription needed:**
- Use WebSocket with streaming APIs
- Because batch transcription adds UX friction

### NEW: Advisor Portal Patterns

**If complex advisor workflows:**
- Build on existing Auth.js role system
- Because granular permissions without additional dependencies

### Household Profile Patterns

**For dynamic household member arrays:**
- Use react-hook-form useFieldArray
- Because it handles key management, validation timing, and performance optimization automatically

**For complex family relationships:**
- Use Drizzle self-relations with explicit relationship types
- Because it maintains referential integrity while supporting flexible family structures

**For international users:**
- Use react-international-phone for all contact fields
- Because domestic phone validation breaks for international families

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.5 | React 19.2+ | App Router requires React 19. Pages Router supports React 18 fallback. |
| Next.js 15.5 | TypeScript 5.7+ | Requires TypeScript 5.0+ for typed routes. Update @types/react and @types/react-dom. |
| React Hook Form 7.54 | Zod 3.24 | Use @hookform/resolvers 3.9+ for zodResolver. |
| Drizzle ORM | Node.js 18+ | Requires native ESM support. Use Postgres.js or node-postgres driver. |
| NextAuth.js 5.x | Next.js 15+ | v5 beta is production-ready. Breaking changes from v4. Uses Web Crypto API. |
| Tailwind CSS 4.x | PostCSS 8+ | Requires modern browsers (Chrome 115+, Safari 16.4+). Uses CSS nesting, cascade layers. |
| Vitest 2.x | Vite 5+ | If using Vite for dev server. Next.js users run Vitest standalone. |

### NEW: Audio Recording & Interview Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| RecordRTC@5.6.x | Next.js 15 | SSR-safe, use dynamic imports |
| rhf-wizard@1.x | react-hook-form@7.x | Requires useFormContext |
| OpenAI API | Node.js 18+ | Server-side only, use API routes |

### Household Profile Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-hook-form@^7.54 | zod@^3.24 | Stable integration through @hookform/resolvers@^3.9 |
| react-day-picker@^9.1.3 | date-fns@^4.1.0 | Uses same date library as existing project |
| react-international-phone@^4.3.0 | react@19.2.3 | Tested with React 19, TypeScript 5+ |

## Configuration Notes

### Drizzle + Neon Setup
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### React Hook Form + Zod Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  familyName: z.string().min(2, 'Minimum 2 characters'),
  members: z.number().int().positive(),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### NEW: Audio Recording Setup
```typescript
// Dynamic import for SSR safety
import dynamic from 'next/dynamic';

const AudioRecorder = dynamic(
  () => import('@/components/AudioRecorder'),
  { ssr: false }
);

// RecordRTC configuration
const options = {
  type: 'audio',
  mimeType: 'audio/webm;codecs=opus',
  bitsPerSecond: 128000,
  audioBitsPerSecond: 128000,
  sampleRate: 44100,
};
```

### NEW: Multi-Step Interview Pattern
```typescript
import { useForm } from 'react-hook-form';
import { useWizard } from 'rhf-wizard';

const interviewSchema = z.object({
  step1: z.object({ /* step 1 fields */ }),
  step2: z.object({ /* step 2 fields */ }),
  step3: z.object({ /* step 3 fields */ }),
});

const { wizard, nextStep, prevStep, currentStep } = useWizard({
  steps: ['step1', 'step2', 'step3'],
});

const form = useForm({
  resolver: zodResolver(interviewSchema),
  mode: 'onChange',
});
```

### Household Profile Schema Pattern
```typescript
const householdMemberSchema = z.object({
  name: z.string().min(1, "Name required"),
  dateOfBirth: z.date().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  relationship: z.enum(["self", "spouse", "child", "parent", "sibling", "other"])
});

const householdProfileSchema = z.object({
  householdName: z.string().optional(),
  members: z.array(householdMemberSchema).min(1, "At least one member required")
});

// Use with useFieldArray
const { fields, append, remove } = useFieldArray({
  control,
  name: "members"
});
```

### NEW: Database Schema Extensions

```typescript
// Drizzle schema for household profiles
export const householdProfiles = pgTable('household_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  householdName: text('household_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// NEW: Interview recordings table
export const interviewRecordings = pgTable('interview_recordings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(),
  audioUrl: text('audio_url'), // S3/blob storage URL
  transcription: text('transcription'),
  duration: integer('duration'), // seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// NEW: Advisor-client relationships
export const advisorClients = pgTable('advisor_clients', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  advisorId: text('advisor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### NextAuth.js Data Access Layer Pattern (Post-CVE Fix)
```typescript
// Never use middleware for auth checks (vulnerable)
// Always check in Server Components, Server Actions, Route Handlers

// app/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <Dashboard user={session.user} />;
}
```

## Sources

### Context7 & Official Documentation
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15) - Version 15 features and migration
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5) - TypeScript improvements and Turbopack
- [Auth.js Next.js Reference](https://authjs.dev/reference/nextjs) - NextAuth.js v5 documentation
- [Zod Documentation](https://zod.dev/) - Schema validation patterns
- [React Hook Form Docs](https://react-hook-form.com/docs/useform) - Form management API
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) - Component compatibility
- [Drizzle ORM](https://orm.drizzle.team/) - ORM documentation

### NEW: Audio Recording & Transcription Sources
- [RecordRTC GitHub](https://github.com/muaz-khan/RecordRTC) - Browser compatibility, features
- [OpenAI Transcription Pricing](https://costgoat.com/pricing/openai-transcription) - Cost comparison
- [Using the MediaStream Recording API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API) - Web standards
- [rhf-wizard GitHub](https://github.com/kennyhei/rhf-wizard) - Multi-step form patterns

### NEW: Interview & Form Wizard Sources
- [React Hook Form useFieldArray Documentation](https://react-hook-form.com/docs/usefieldarray) - Field array best practices
- [Build a Multistep Form With React Hook Form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) - Implementation guide
- [The best React form libraries of 2026](https://blog.croct.com/post/best-react-form-libraries) - Library comparison

### Household Profile Sources
- [React Hook Form + Zod Integration Guide 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Resolver integration patterns
- [Zod Object and Array Validation](https://tecktol.com/zod-array/) - Nested schema patterns
- [React International Phone Libraries 2026](https://blog.croct.com/post/best-react-phone-number-input-libraries) - Phone input comparison
- [React Date Picker Accessibility](https://daypicker.dev/guides/accessibility) - WCAG compliance

### Web Search - HIGH Confidence (Official/Recent Sources)
- [React & Next.js in 2025 Best Practices](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices) - Architecture patterns
- [Next.js 15 Best Practices](https://www.antanaskovic.com/en/blog/nextjs-15-best-practices) - Performance optimization
- [PostgreSQL vs MongoDB 2025](https://www.bytebase.com/blog/postgres-vs-mongodb/) - Database comparison
- [Neon vs Supabase Comparison](https://www.bytebase.com/blog/neon-vs-supabase/) - Serverless Postgres options
- [Neon Price Reduction 2025](https://neon.com/blog/major-compute-price-reduction-on-neon) - Cost analysis

### Web Search - MEDIUM Confidence (Multiple Sources Agree)
- [React Hook Form vs Formik 2025](https://www.digitalogy.co/blog/react-hook-form-vs-formik/) - Performance benchmarks
- [Top PDF Generation Libraries 2025](https://pdfbolt.com/blog/top-nodejs-pdf-generation-libraries) - PDF library comparison
- [Drizzle vs Prisma 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/) - ORM comparison
- [Vitest vs Jest 2025](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9) - Testing framework comparison
- [NextAuth.js Security Best Practices](https://www.franciscomoretti.com/blog/modern-nextjs-authentication-best-practices) - Post-CVE patterns
- [Vercel Alternatives 2025](https://snappify.com/blog/vercel-alternatives) - Hosting cost comparison
- [PostgreSQL Hosting Pricing](https://www.bytebase.com/blog/postgres-hosting-options-pricing-comparison/) - Database hosting costs

---
*Stack research for: Family Governance Risk Assessment Web Application + Household Profile Management + Intake Interview & Advisor Portal*
*Original research: 2026-02-17*
*Household profile additions: 2026-03-12*
*Intake interview & advisor portal additions: 2026-03-13*
*Overall confidence: HIGH - All core recommendations verified with official documentation or multiple authoritative sources*