# Technical debt

Living register of known debt, risky shortcuts, and cleanup work. **Update this file** when you pay something down or add new debt so the team keeps one source of truth.

## How to use

- Add rows with a short **ID** (stable slug), **area**, **summary**, and **prescribed cleanup**.
- Prefer **prescribed cleanup** that is actionable (migrate X, delete Y, align Z) over vague “refactor later”.
- Close an item by removing it or moving it to a “Resolved” subsection with PR/date.

---

## Active items

| ID | Area | Summary | Prescribed cleanup |
|----|------|---------|---------------------|
| `advisor-brand-name-duality` | Data model / branding | `AdvisorProfile` carries both `firmName` and `brandName`. In practice the app treats them as mirrors (`updateAdvisorBrandingAction` always writes `brandName` from `firmName`), which caused stale UI when only `firmName` changed. Display logic and admin updates were aligned to prefer `firmName` and sync on admin save, but **two columns remain redundant**. | **Pick one canonical field** (recommend `firmName` as org/legal label). Then: (1) stop persisting `brandName` in Prisma for new writes; (2) migrate existing rows (`UPDATE` copy / null as needed); (3) remove `brandName` from `schema.prisma` and regenerate client; (4) delete `brandName` from `AdvisorBrandingData`, Zod `brandingUpdateSchema`, advisor branding UI, seeds, and subdomain/branded layouts; (5) replace remaining “brand name then firm name” fallbacks with the single field or a thin `displayFirmName()` that reads only `firmName`. Files that still use the old dual fallback today include `src/lib/pdf/components/EnhancedReportCover.tsx`, `EnhancedPageFooter.tsx`, `src/app/api/reports/[id]/pdf/route.tsx`, `src/lib/invitations/enhanced-email.ts`, `src/lib/templates/enhanced-generator.ts` (in addition to places already using `clientPortalBrandingDisplayTitle` and `pdfDisplayNameFromBranding` in `src/lib/pdf/branding-integration.ts`). |

---

## Resolved (archive)

_Move completed items here with date and PR reference._

_(None yet.)_
