# Logos

Design kit lives in `media/`. Runtime and deck delivery copies are in `public/brand/` and `logo/`.

## Variants

| Variant | File | When to use |
|---------|------|-------------|
| **Horizontal Primary** | `public/brand/akili-horizontal-primary.png` (+ `.svg` for design) | Light backgrounds — nav, headers |
| **Horizontal White** | `public/brand/akili-horizontal-white.png` | Dark UI / photography |
| **Horizontal Secondary** | `public/brand/akili-horizontal-secondary.png` | Navy / dark brand backgrounds |
| **Horizontal Black** | `public/brand/akili-horizontal-black.png` | One-colour / print |
| **Vertical Primary** | `public/brand/akili-vertical-primary.png` | Stacked lockup — footers, decks |
| **Vertical White** | `public/brand/akili-vertical-white.png` | Stacked on dark |
| **Icon Color** | `public/brand/akili-icon-color.png` / `.svg` | Favicons, compact UI, powered-by |
| **Email lockup** | `public/brand/akili-email-lockup.png` | HTML email (PNG — clients block SVG) |

Compat aliases still exist (`akili-horizontal-compact.*`, `akili-stacked.*`) pointing at Primary assets.

Source masters: `media/1-Full-Logo/`, `media/6-Icon/`, `media/7-Transparent-PNG/`. Do not import `media/` at runtime.

---

## App wiring

| Surface | Asset |
|---------|-------|
| Header / slim chrome | `/brand/akili-horizontal-primary.png` (+ white in dark mode) |
| Footer / 404 | `/brand/akili-vertical-primary.png` (+ white in dark mode) |
| Favicons / PWA | `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `site.webmanifest` |
| Platform email + SEO logo | `/brand/akili-email-lockup.png` |

UI lockups use **PNG** (not SVG). Brand kit SVGs leave “Risk Intelligence” as live Montserrat text without embedded fonts; browsers break glyph spacing when those SVGs load via `<img>`. Delivery PNGs in `public/brand/` are rebuilt with Montserrat from `media/Fonts/`.

---

## Clear space

Minimum clear space = **icon height** on all sides. Full logo ≥120px wide; icon ≥24px.

---

## Backgrounds

| Background | Lockup |
|------------|--------|
| White / off-white | Primary |
| Navy / dark brand | Secondary or White |
| Photos / dark UI | White |
| One-colour print | Black |
| Advisor-branded portal | Advisor logo; AKILI icon optional in footer |

---

## Do / Don't

**Do**
- Prefer SVG from `logo/` or `public/brand/` (cropped, transparent)
- Preserve aspect ratio
- Use Horizontal Primary in deck footers; Vertical for title slides

**Don't**
- Serve uncropped artboards from `media/1-Full-Logo` in the app (opaque backgrounds)
- Use `media/Unsorted/` or `media/4-Preview-JPGs/`
- Stretch, recolor, or recreate the lockup

---

## Co-branding

Enterprise white-label uses the advisor logo on client portals. AKILI appears as platform attribution when appropriate.
