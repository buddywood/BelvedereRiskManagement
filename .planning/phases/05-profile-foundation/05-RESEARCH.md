# Phase 05: Profile Foundation - Research

**Researched:** 2026-03-12
**Domain:** User profile management, family member tracking, governance roles
**Confidence:** HIGH

## Summary

Phase 5 requires implementing household member profile management with governance role assignment capabilities. The existing codebase uses Next.js 15 with NextAuth, Prisma (PostgreSQL), React Hook Form with Zod validation, and shadcn/ui components. The current User model needs extension to support household members with relationships, roles, and hierarchical permissions.

Research shows React Hook Form + Zod + Server Actions is the current standard for type-safe form handling in Next.js 15. The existing auth system provides a solid foundation, with patterns already established for schema validation, form handling, and database operations.

**Primary recommendation:** Extend existing Prisma schema with HouseholdMember and GovernanceRole models, implement form components using established React Hook Form + Zod patterns, and leverage existing UI component library.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.4.0 | Database ORM | Already integrated, supports complex relationships |
| React Hook Form | 7.71.1 | Form state management | Already in use, performance-optimized |
| Zod | 4.3.6 | Schema validation | Already in use, type-safe validation |
| Next.js | 16.1.6 | Full-stack framework | Project foundation, Server Actions support |
| NextAuth | 5.0.0-beta.30 | Authentication | Already configured with user management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 5.2.2 | Zod integration | Form validation binding |
| shadcn/ui | Latest | UI components | Consistent styling, already established |
| Lucide React | 0.575.0 | Icons | Profile and role iconography |
| class-variance-authority | 0.7.1 | Component variants | Role badge variants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Formik | RHF better performance, already integrated |
| Prisma relations | Separate tables | Direct relations provide better type safety |
| Server Actions | API routes | Server Actions preferred in Next.js 15 |

**Installation:**
All dependencies already installed in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── profiles/           # Profile management components
│   │   ├── ProfileForm.tsx
│   │   ├── MemberCard.tsx
│   │   └── RoleSelector.tsx
│   └── ui/                # Existing UI components
├── lib/
│   ├── schemas/           # Zod validation schemas
│   │   └── profile.ts
│   └── actions/           # Server Actions
│       └── profile-actions.ts
└── app/
    └── (protected)/
        └── profiles/      # Profile management pages
```

### Pattern 1: Schema-First Validation
**What:** Define Zod schemas for type safety across client and server
**When to use:** All profile forms and API validation
**Example:**
```typescript
// Source: Existing pattern in register route
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  relationship: z.enum(['spouse', 'child', 'parent', 'guardian']),
  governanceRoles: z.array(z.string()).default([])
});
```

### Pattern 2: Server Actions with Form Integration
**What:** Use Next.js 15 Server Actions with React Hook Form
**When to use:** All CRUD operations for profiles
**Example:**
```typescript
// Source: Next.js 15 best practices from web research
'use server';
export async function createHouseholdMember(formData: FormData) {
  const validatedFields = profileSchema.safeParse({...});
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  // Database operations...
}
```

### Pattern 3: Relational Data Modeling
**What:** Use Prisma's relationship capabilities for family structure
**When to use:** Modeling household member relationships and governance
**Example:**
```prisma
model HouseholdMember {
  id              String @id @default(cuid())
  userId          String
  name            String
  relationship    FamilyRelationship
  governanceRoles GovernanceRole[]
  user            User @relation(fields: [userId], references: [id])
}
```

### Anti-Patterns to Avoid
- **Manual form state management:** Use React Hook Form for all profile forms
- **Direct database mutations:** Always use Server Actions with validation
- **Inline validation logic:** Keep all validation in Zod schemas

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validators | Zod schemas | Type safety, reusable, existing pattern |
| Form state | useState for complex forms | React Hook Form | Performance, validation integration |
| Database operations | Raw SQL | Prisma | Type safety, relationship handling |
| UI components | Custom form inputs | shadcn/ui components | Consistent design, accessibility |
| Role management | Custom RBAC | Prisma enums + relations | Database integrity, query optimization |

**Key insight:** Profile management involves complex relationships and validation - use established libraries to handle edge cases around family hierarchies, role permissions, and data consistency.

## Common Pitfalls

### Pitfall 1: Circular Relationship Dependencies
**What goes wrong:** Parent-child relationships can create circular references
**Why it happens:** Self-referential models without proper constraints
**How to avoid:** Use optional parent relationships and validate hierarchy depth
**Warning signs:** Database constraint violations, infinite loops in queries

### Pitfall 2: Governance Role Conflicts
**What goes wrong:** Multiple conflicting roles assigned to same person
**Why it happens:** No role validation or hierarchy enforcement
**How to avoid:** Implement role compatibility checks in Zod schemas
**Warning signs:** Users with incompatible permissions, authorization errors

### Pitfall 3: Profile Data Validation Bypass
**What goes wrong:** Client-side validation differs from server-side
**Why it happens:** Separate validation logic on client and server
**How to avoid:** Share Zod schemas between client and server actions
**Warning signs:** Data inconsistencies, validation errors after submission

### Pitfall 4: Missing Relationship Cascades
**What goes wrong:** Orphaned records when household members are deleted
**Why it happens:** Missing onDelete cascade constraints
**How to avoid:** Define proper Prisma relationship cascades
**Warning signs:** Referenced records without valid parent relationships

## Code Examples

Verified patterns from official sources:

### Profile Form with Validation
```typescript
// Source: React Hook Form + Zod pattern from existing QuestionCard
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ProfileForm({ onSubmit }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', relationship: 'child' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField>
        <FormLabel>Full Name</FormLabel>
        <FormControl>
          <Input {...register('name')} />
        </FormControl>
        <FormMessage />
      </FormField>
    </form>
  );
}
```

### Server Action with Database Operation
```typescript
// Source: Existing pattern from auth register route
'use server';
import { prisma } from "@/lib/db";

export async function createHouseholdMember(userId: string, formData: FormData) {
  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    relationship: formData.get('relationship')
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const member = await prisma.householdMember.create({
    data: {
      ...validatedFields.data,
      userId
    }
  });

  return { success: true, member };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | React Hook Form + Zod | 2023-2024 | Better performance, type safety |
| API routes | Server Actions | Next.js 15 | Simpler data flow, better DX |
| Manual validation | Schema-first | 2024 | Shared validation logic |
| Custom RBAC | Database-driven roles | Modern apps | Easier permissions management |

**Deprecated/outdated:**
- Manual form state with useState for complex forms
- Separate client/server validation logic
- Custom authentication when NextAuth available

## Open Questions

1. **Extended Family Complexity**
   - What we know: Requirements include extended family tracking
   - What's unclear: Depth of relationship hierarchy needed
   - Recommendation: Start with direct relationships, extend based on user feedback

2. **Role Permission Granularity**
   - What we know: Governance roles needed (decision maker, advisor, successor)
   - What's unclear: Specific permissions each role should have
   - Recommendation: Define basic role types, expand permissions later

3. **Profile Photo Storage**
   - What we know: User model has image field
   - What's unclear: Storage strategy for household member photos
   - Recommendation: Follow existing User.image pattern initially

## Sources

### Primary (HIGH confidence)
- [Prisma Schema Language Documentation](https://www.prisma.io/docs/orm/prisma-schema/overview) - Database modeling patterns
- [Next.js Forms Documentation](https://nextjs.org/docs/app/guides/forms) - Server Actions integration
- [React Hook Form Documentation](https://react-hook-form.com/) - Form patterns

### Secondary (MEDIUM confidence)
- [Handling Forms in Next.js with React Hook Form, Zod, and Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1) - Integration patterns
- [Type-Safe Form Validation in Next.js 15: Zod, RHF, & Server Actions](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Best practices
- [Build a Multistep form in Next.js powered by React hook form and Zod](https://kodaschool.com/blog/build-a-multistep-form-in-next-js-powered-by-react-hook-form-and-zod) - Multi-step patterns

### Tertiary (LOW confidence)
- [React Form Libraries Strategic Analysis](https://dev.to/cerge74_cbb3abeb75dde90f5/surveyjs-vs-other-react-form-libraries-a-strategic-architecture-analysis-32ge) - Library comparisons
- [React Architecture Patterns 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) - General patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json and in use
- Architecture: HIGH - Patterns verified in existing codebase
- Pitfalls: MEDIUM - Based on web research and common database modeling issues

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (30 days - stable ecosystem)