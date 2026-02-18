# Stack Research

**Domain:** Family Governance Risk Assessment Web Application
**Researched:** 2026-02-17
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

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code linting | Use Next.js config: `extends: ["next/core-web-vitals"]` |
| Prettier | Code formatting | Integrate with ESLint via `eslint-config-prettier` |
| Husky | Git hooks | Pre-commit linting and type checking |
| TypeScript Strict Mode | Type safety | Enable `strict: true` in tsconfig.json |

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

# UI components (via shadcn CLI)
npx shadcn@latest init
npx shadcn@latest add form input button select textarea

# Dev dependencies
npm install -D vitest @vitejs/plugin-react
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged
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

## Stack Patterns by Variant

**If budget extremely constrained (< $10/month):**
- Use Neon free tier (100 CU-hours sufficient for low traffic)
- Deploy on Vercel free tier (limited to hobby projects)
- Use Resend free tier (100 emails/day)
- Total: $0/month for MVP validation

**If expecting high traffic (1M+ pageviews/month):**
- Use Railway or Render VPS ($8-17/month) instead of Vercel
- Self-host Postgres on VPS or use Neon Scale plan
- Consider Cloudflare Pages for static assets (free unlimited bandwidth)

**If team unfamiliar with Next.js:**
- Still use Next.js. Learning curve < 1 week for React developers
- Follow official App Router tutorial first
- App Router simpler than Pages Router (less boilerplate)

**If complex PDF layouts required:**
- Switch to Puppeteer for PDF generation
- Accept higher cold start times (2-5 seconds)
- Consider background job queue for large reports

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

### Web Search - HIGH Confidence (Official/Recent Sources)
- [React & Next.js in 2025 Best Practices](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices) - Architecture patterns
- [Next.js 15 Best Practices](https://www.antanaskovic.com/en/blog/nextjs-15-best-practices) - Performance optimization
- [PostgreSQL vs MongoDB 2025](https://www.bytebase.com/blog/postgres-vs-mongodb/) - Database comparison
- [Neon vs Supabase Comparison](https://www.bytebase.com/blog/neon-vs-supabase/) - Serverless Postgres options
- [Neon Price Reduction 2025](https://neon.com/blog/major-compute-price-reduction-on-neon) - Cost analysis

### Web Search - MEDIUM Confidence (Multiple Sources Agree)
- [React Hook Form vs Formik 2025](https://www.digitalogy.co/blog/react-hook-form-vs-formik/) - Performance benchmarks
- [Best React Form Libraries 2026](https://blog.croct.com/post/best-react-form-libraries) - Ecosystem comparison
- [Top PDF Generation Libraries 2025](https://pdfbolt.com/blog/top-nodejs-pdf-generation-libraries) - PDF library comparison
- [Drizzle vs Prisma 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/) - ORM comparison
- [Vitest vs Jest 2025](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9) - Testing framework comparison
- [NextAuth.js Security Best Practices](https://www.franciscomoretti.com/blog/modern-nextjs-authentication-best-practices) - Post-CVE patterns
- [Vercel Alternatives 2025](https://snappify.com/blog/vercel-alternatives) - Hosting cost comparison
- [PostgreSQL Hosting Pricing](https://www.bytebase.com/blog/postgres-hosting-options-pricing-comparison/) - Database hosting costs

---
*Stack research for: Family Governance Risk Assessment Web Application*
*Researched: 2026-02-17*
*Overall confidence: HIGH - All core recommendations verified with official documentation or multiple authoritative sources*
