# Colors

## Logo palette (official lockup)

Used in the icon, email lockups, and pitch decks. **Do not substitute the editorial UI `--brand` token for logo blue.**

| Role | Light | Dark | Usage |
|------|-------|------|--------|
| **Brand primary** | `#0564b6` | `#4EA5D9` | Icon fills, links, deck accent bar |
| **Trust accent** | `#f89c11` | `#F59E0B` | Icon highlight, callouts |
| **Foreground** | `#0b0d1c` | `#fefefe` | Wordmark on light / dark |
| **Muted** | `#061734` | `#94a3b8` | Secondary type |
| **Border** | `#e2e8f0` | `#334155` | Dividers |

CSS variables (`src/app/globals.css`):

```css
--logo-brand-primary: #0564b6;
--logo-trust-accent: #f89c11;
--logo-foreground: #0b0d1c;
--logo-muted-foreground: #061734;
--logo-border: #e2e8f0;
```

---

## UI palette (product)

Warm editorial neutrals with oklch tokens in `globals.css`. Used for app chrome, cards, and dashboards — distinct from logo blue.

| Token | Purpose |
|-------|---------|
| `--background` / `--foreground` | Page base |
| `--primary` | Buttons, key actions |
| `--brand` / `--trust-accent` | Editorial accents (not logo palette) |
| `--muted` / `--muted-foreground` | Secondary surfaces and text |
| `--destructive` | Errors, critical risk |

Use **logo palette** for external/marketing; **UI tokens** for in-app screens.

---

## Deck & presentation

| Role | Hex | Use |
|------|-----|-----|
| Navy | `#1E293B` | Slide titles, table headers |
| Navy deep | `#1A1A2E` | Title slide & closing backgrounds |
| Brand blue | `#0564b6` | Top accent bar, links, diagram nodes |
| Trust accent | `#f89c11` | Title marker, traction banner, moat callouts |
| Off-white | `#F8FAFC` | Content slide background alt, diagram fills |
| Muted | `#64748B` | Subtitles, footnotes |

Defined in code as `AKILI_DECK_COLORS` in [`src/lib/brand/tokens.ts`](../../src/lib/brand/tokens.ts).

---

## PDF reports (default platform)

When no advisor branding is applied:

| Role | Hex |
|------|-----|
| Primary | `#1a1a2e` |
| Secondary | `#16213e` |
| Accent | `#10b981` |
| Text | `#374151` |
| Border | `#e5e7eb` |

Source: `src/lib/pdf/enhanced-styles.ts`

---

## Email

| Role | Value |
|------|--------|
| Brand blue | `#0564b6` |
| Trust accent | `#f89c11` |
| CTA background | `#18181b` |
| Header gradient | `linear-gradient(145deg,#1e293b 0%,#0f172a 55%,#172554 100%)` |

Source: `src/lib/email/platform-brand.ts` (imports from brand tokens).

---

## Do / Don't

**Do**
- Use `#0564b6` for AKILI logo contexts and investor materials
- Test lockups on both white and `#1A1A2E` backgrounds
- Use trust accent sparingly — one focal element per slide

**Don't**
- Recolor the icon or wordmark
- Use advisor tenant colors in AKILI corporate decks
- Mix logo blue with unrelated blues (e.g. default Bootstrap `#0d6efd`)
