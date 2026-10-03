# Homepage Redesign Tracker — "Click" Data Layer Platform

> **Scope:** Homepage (`/`) complete redesign following the provided "Click" design specification, SVG interactive architecture diagrams, minimalist header, and footer.
> **Brand Identity:** **Click** — cursor click logo with `#38bdf8` electric sky-blue accents, tagline *"When concepts finally click."*, tracks for **SQL** (57 days) and **Prisma** (14 days).
> **Created:** 2026-10-03
> **Tracker Status:** Ready for Execution (Awaiting User Plan Approval)

---

## Progress Overview

| Phase | Milestone / Area | Tasks | Status |
|---|---|---|---|
| **Phase 1** | **Brand Identity & Tokens** | Click SVG cursor logo, "Click" wordmark, brand variant support in `BrandLogo.tsx`, `.tile`, `.flink`, `.bg-dot-grid` CSS utilities | ✅ Done |
| **Phase 2** | **Click Homepage Component** | Hero section, interactive SVG diagrams (SQL query/result & Prisma schema/autocomplete), track cards | ✅ Done |
| **Phase 3** | **Header & Navigation Integration** | Homepage minimal header with Click logo, theme switcher, user avatar / sign-in pill | ⬜ Not started |
| **Phase 4** | **Click Footer Component** | Multi-column footer with brand, tracks links, project links, and copyright bar | ⬜ Not started |
| **Phase 5** | **Page Assembly & Continuity** | Connect `/` route, keep subtle returning learner resume card for returning users | ⬜ Not started |
| **Phase 6** | **Verification & Test Alignment** | Update `tests/tracks/phase3-homepage.test.tsx`, visual verification, build check | ⬜ Not started |

**Status Key:** ⬜ Not Started · 🔄 In Progress · ✅ Done · ⚠️ Blocked

---

## Detailed Task Breakdown

### Phase 1 — Brand Identity & Tokens
- [x] **T1.1** Update `src/components/ui/BrandLogo.tsx` to support `variant?: 'click' | 'sqlens'` (defaulting to `'click'` when specified).
- [x] **T1.2** Implement the exact Click SVG cursor logo with dual path definition:
  - Cursor pointer path: `M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z` (fill `#38bdf8`, stroke `#38bdf8`)
  - Click burst lines: `M10 3V1M6 4L4.5 2.5M6 8H4` (stroke `#38bdf8`, stroke-width 2, round linecap)
- [x] **T1.3** Style the `Click` wordmark with `font-semibold text-lg tracking-[-0.02em]` matching the design mockup.
- [x] **T1.4** Add `.tile`, `.flink`, and `.bg-dot-grid` design system utility classes in `src/app/globals.css`.
- [x] **T1.5** Write and verify automated unit tests in `tests/ui/brand-logo.test.tsx` (5 passing tests).

### Phase 2 — Click Homepage Component & SVG Diagrams
- [x] **T2.1** Create `src/components/home/ClickHomepage.tsx` with high-aesthetic midnight navy canvas (`#060b16`), font hierarchy, and max-width layout (1120px).
- [x] **T2.2** Implement Hero Section:
  - JetBrains Mono overline: `WHEN CONCEPTS FINALLY CLICK` (`text-[12px] tracking-[0.14em] text-[#38bdf8]`)
  - Headline: `Learn the data layer by running it.` (`text-[48px] font-semibold leading-[1.06] tracking-[-0.03em]`)
  - Subtitle: `Hands-on tracks. A real engine. All in your browser.` (`text-[17px] leading-[1.6] text-[#8a9bbd]`)
- [x] **T2.3** Build the SQL Interactive Diagram Card:
  - Top visual container with dot-grid pattern (`radial-gradient(#1b2a47 1px, transparent 1px) 20px 20px`).
  - Left sub-window `query.sql`: 3 traffic light dots, syntax highlighted SQL query (`SELECT`, `FROM`, `JOIN`, `WHERE`, `ORDER BY`).
  - Connecting directional arrow in `#38bdf8`.
  - Right sub-window `result`: Table columns `name`, `total` with row 1 highlighted (`Ava 420` in cyan glow) and rows 2-4 (`Liam 310`, `Noah 260`, `Mia 180`).
  - Bottom metadata: `SQL` · `57 days` · `From SELECT to production engineering` · Arrow right icon.
- [x] **T2.4** Build the Prisma Interactive Diagram Card:
  - Top visual container with dot-grid pattern.
  - Left sub-window `schema.prisma`: 3 traffic light dots, syntax highlighted `model User` with `@id`.
  - Connecting directional arrow in `#38bdf8`.
  - Right sub-window `app.ts`: `prisma.user.` with blinking cursor rect and type-safe autocomplete popup (`id number`, `email string` highlighted, `posts Post[]`).
  - Bottom metadata: `Prisma` · `14 days` · `Schema modeling and type-safe database access` · Arrow right icon.
- [x] **T2.5** Add CSS hover tile animation: smooth translateY(-2px), border color glow `#38bdf8`, and focus-visible rings.
- [x] **T2.6** Create and verify unit tests in `tests/ui/click-homepage.test.tsx` (6 passing tests).

### Phase 3 — Header & Navigation Integration
- [ ] **T3.1** In `src/components/layout/Header.tsx`, check `isMinimal` (which is active on `/`):
  - Render Click logo and wordmark (`BrandLogo variant="click"`).
  - Include the circular Theme switcher button (`ThemeToggle`).
  - Include the user avatar button ("M" or user initial) or Sign In button.
- [ ] **T3.2** Align header width to `max-w-[1120px]` on the homepage to maintain unified margins with hero and track cards.

### Phase 4 — Click Footer Component
- [ ] **T4.1** Create `src/components/layout/ClickFooter.tsx`:
  - Border top `1px solid #121d33`.
  - Left column: Click logo + "Click" wordmark + tagline *"When concepts finally click."*.
  - Tracks navigation column: `SQL` (`/sql`), `Prisma` (`/prisma`).
  - Project navigation column: `About` (`#about`), `Feedback` (`#feedback`).
  - Copyright line: `© 2026 Click` with divider.

### Phase 5 — Page Assembly & Continuity
- [ ] **T5.1** Update `src/app/(app)/page.tsx` and `src/components/tracks/TrackSelector.tsx` to render the `ClickHomepage` experience.
- [ ] **T5.2** Embed `<ReturningLearnerCard />` directly beneath the hero for returning learners so existing progress continuity is preserved seamlessly.
- [ ] **T5.3** Mount `ClickFooter` on the homepage layout.

### Phase 6 — Verification & Test Alignment
- [ ] **T6.1** Update `tests/tracks/phase3-homepage.test.tsx` to test the Click homepage content, headlines, SQL & Prisma cards, and SSR behavior.
- [ ] **T6.2** Run `npm test tests/tracks/phase3-homepage.test.tsx` to ensure unit test passes.
- [ ] **T6.3** Run `npm run build` or Next.js typecheck to ensure zero TypeScript errors or SSR hydration mismatches.
- [ ] **T6.4** Verify responsive layout on mobile (<640px), tablet (768px), and desktop (1120px+).

---

## Log of Completed Changes

| Date | Task ID | Summary | Author |
|---|---|---|---|
| 2026-10-03 | Phase 1 (T1.1–T1.5) | Click brand cursor SVG vector logo, wordmark, variant support in BrandLogo, .tile/.flink/.bg-dot-grid utilities, unit tests | Antigravity |
| 2026-10-03 | Phase 2 (T2.1–T2.6) | ClickHomepage shell, SqlDiagramSvg, PrismaDiagramSvg, track cards with hover transitions, unit tests | Antigravity |
