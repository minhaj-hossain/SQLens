# UI Fixes — Implementation Plan & Tracker

> **Scope:** Homepage (`/`) redesign + Prisma track UI fixes.
> **Constraint:** Do NOT touch anything in `/sql` pages, SQL roadmap, or SQL learn views.
> **Source:** Full audit — see `AUDIT_REPORT.md` and brain artifact `UI_AUDIT_REPORT.md`.
> **Last updated:** 2026-10-03

---

## Quick Status

| Phase | Name | Status |
|-------|------|--------|
| P1 | Prisma copy fixes in `LearningPathView` | ✅ Done |
| P2 | Prisma locked-day back link fix | ✅ Done |
| P3 | Header minimal variant | ⬜ Not started |
| P4 | AppChrome minimal mode detection | ⬜ Not started |
| P5 | Homepage strip & simplify | ⬜ Not started |

**Status key:** ⬜ Not started · 🔄 In progress · ✅ Done · ❌ Blocked

---

## Phase 1 — Prisma Copy Fixes in `LearningPathView.tsx`

> **File:** `src/components/roadmap/LearningPathView.tsx`
> **Risk:** LOW — string swaps only, all behind `track === 'prisma'` branch.
> **SQL safety:** SQL default branch stays exactly as written today.

The component already calls `useTrackCurriculum()`. Add `track` and `meta` to the destructure on line 46:

```tsx
// BEFORE:
const { modules: ALL_MODULES, milestones: ROADMAP_MILESTONES, getModuleById } = useTrackCurriculum();

// AFTER:
const { modules: ALL_MODULES, milestones: ROADMAP_MILESTONES, getModuleById, track, meta } = useTrackCurriculum();
```

### Tasks

- [ ] **P1-A — Overline label** (line ~144)

  ```tsx
  // BEFORE:
  SQLENS <span className="text-func">/</span> CURRICULUM ROADMAP

  // AFTER:
  {track === 'prisma' ? 'PRISMALENS' : 'SQLENS'} <span className="text-func">/</span> CURRICULUM ROADMAP
  ```

- [ ] **P1-B — Hero headline** (line ~147)

  ```tsx
  // BEFORE:
  Go from <span className="text-func">SELECT *</span> to shipped.

  // AFTER:
  {track === 'prisma' ? (
    <>Go from <span className="text-func">prisma.findMany()</span> to production.</>
  ) : (
    <>Go from <span className="text-func">SELECT *</span> to shipped.</>
  )}
  ```

- [ ] **P1-C — Hero subtext** (lines ~149-152)

  ```tsx
  // BEFORE:
  Hands-on SQL, one query at a time — because &quot;I sort of know JOINs&quot;
  isn&apos;t a personality trait.

  // AFTER:
  {track === 'prisma'
    ? "Type-safe queries, one schema at a time — because guessing your DB shape isn't a strategy."
    : <>Hands-on SQL, one query at a time — because &quot;I sort of know JOINs&quot; isn&apos;t a personality trait.</>
  }
  ```

- [ ] **P1-D — Section label "Execution path"** (line ~228)

  ```tsx
  // BEFORE:
  Execution path

  // AFTER:
  {track === 'prisma' ? 'Learning path' : 'Execution path'}
  ```

- [ ] **P1-E — Footer brand name** (line ~386)

  ```tsx
  // BEFORE:
  SQLens — {overallPct}% through the path.

  // AFTER:
  {track === 'prisma' ? 'PrismaLens' : 'SQLens'} — {overallPct}% through the path.
  ```

### Acceptance Criteria

- [ ] `/prisma` overline → "PRISMALENS / CURRICULUM ROADMAP"
- [ ] `/prisma` headline → "Go from `prisma.findMany()` to production."
- [ ] `/prisma` subtext → Prisma copy (not SQL)
- [ ] `/prisma` section → "Learning path"
- [ ] `/prisma` footer → "PrismaLens — N%..."
- [ ] `/sql` — ALL of the above are bit-for-bit unchanged

---

## Phase 2 — Prisma Locked-Day Back Link Fix in `ModuleOverview.tsx`

> **File:** `src/components/learn/ModuleOverview.tsx`
> **Risk:** LOW — one href change using already-imported hook.
> **SQL safety:** Fix is track-aware and correct for both tracks. SQL users on a locked day
>   currently also land on `/` (track selector) — this fix makes SQL route to `/sql` instead.
>   That is strictly a bug fix with no visible SQL UI change.

### Tasks

- [x] **P2-A — Add `meta` to existing `useTrackCurriculum()` destructure** (line ~29)

  ```tsx
  // BEFORE:
  const { modules: ALL_MODULES, getModuleById } = useTrackCurriculum();

  // AFTER:
  const { modules: ALL_MODULES, getModuleById, meta } = useTrackCurriculum();
  ```

- [x] **P2-B — Fix the back link href in the locked-day view** (line ~54)

  ```tsx
  // BEFORE:
  <a href="/" className="...">

  // AFTER:
  <a href={meta.basePath} className="...">
  ```

### Acceptance Criteria

- [x] Locked Prisma day → "Back to Learning Path" → lands on `/prisma`
- [x] Locked SQL day → "Back to Learning Path" → lands on `/sql`
- [x] Neither routes to `/`

---

## Phase 3 — Header Minimal Variant (`Header.tsx`)

> **File:** `src/components/layout/Header.tsx`
> **Risk:** LOW — additive prop only. All existing renders where `isMinimal` is absent/false
>   are completely unchanged.
> **SQL safety:** `/sql` pages always receive `isMinimal={false}`. No SQL change.

### Tasks

- [ ] **P3-A — Add `isMinimal` to `HeaderProps` interface** (after line ~23)

  ```tsx
  /** When true: render logo + auth only. Hides progress pill, database icon,
   *  playground link and reset button. Used on homepage where there is no
   *  active track context. */
  isMinimal?: boolean;
  ```

- [ ] **P3-B — Accept `isMinimal` in the component signature**

  ```tsx
  export const Header: React.FC<HeaderProps> = ({
    // ...existing props...
    isMinimal = false,
  }) => {
  ```

- [ ] **P3-C — Brand logo links to `/` when minimal** (line ~50)

  ```tsx
  // BEFORE:
  href={meta.basePath}

  // AFTER:
  href={isMinimal ? '/' : meta.basePath}
  ```

- [ ] **P3-D — Hide streak pill when minimal** (wrap lines ~65-74)

  ```tsx
  {!isMinimal && (
    <div className="flex items-center gap-1.5 ...">
      {/* streak pill */}
    </div>
  )}
  ```

- [ ] **P3-E — Hide database icon when minimal** (wrap lines ~77-85)

  ```tsx
  {!isMinimal && (
    <button id="header-schema-btn" ...>
      <Icon name="database" />
    </button>
  )}
  ```

- [ ] **P3-F — Hide playground link when minimal** (wrap lines ~88-95)

  ```tsx
  {!isMinimal && (
    <Link href={...} ...>
      <Icon name="terminal" />
    </Link>
  )}
  ```

- [ ] **P3-G — Hide guest reset button when minimal** (wrap lines ~101-110)

  ```tsx
  {!isMinimal && !user && !isAuthPending && (
    <button ...>
      <Icon name="restart_alt" />
    </button>
  )}
  ```

### Acceptance Criteria

- [ ] Homepage header contains: SQLens logo · ThemeToggle · Sign In / user avatar
- [ ] Homepage header does NOT contain: streak pill, database icon, playground link, reset button
- [ ] `/sql` header: fully unchanged, all items visible
- [ ] `/prisma` header: fully unchanged, all items visible
- [ ] Logo on homepage links to `/`, not `/sql`

---

## Phase 4 — AppChrome Minimal Mode Detection (`AppChrome.tsx`)

> **File:** `src/components/layout/AppChrome.tsx`
> **Risk:** LOW — one const, one prop.
> **SQL safety:** `/sql/**` paths never match `pathname === '/'`. No SQL change.

### Tasks

- [ ] **P4-A — Detect homepage pathname** (after line ~21 where `pathname` is set)

  ```tsx
  const isHomepage = pathname === '/';
  ```

- [ ] **P4-B — Pass `isMinimal` to Header** (in the `<Header>` render, ~line 51)

  ```tsx
  <Header
    userState={userState}
    currentModule={pathModule ?? null}
    onResetProgress={...}
    resetError={resetError}
    onOpenSchemaModal={openSchema}
    user={authUser}
    isAuthPending={isAuthPending}
    onSignOut={signOut}
    activeViewTitle={activeViewTitle}
    isMinimal={isHomepage}   // ← add this line only
  />
  ```

### Acceptance Criteria

- [ ] `isMinimal` is `true` on `/` only
- [ ] `isMinimal` is `false` on `/sql`, `/prisma`, `/prisma/learn/*`, `/admin`, etc.

---

## Phase 5 — Homepage Strip & Simplify (`TrackSelector.tsx`)

> **File:** `src/components/tracks/TrackSelector.tsx`
> **Risk:** LOW-MEDIUM — removes `HeroLensInteractivePreview` from the page. The component
>   still exists and is importable elsewhere. No SQL pages use it.
> **SQL safety:** `TrackSelector` only renders on `/`. Zero impact on SQL pages.

### Tasks

- [ ] **P5-A — Simplify the import** (line ~1-5)

  ```tsx
  // BEFORE:
  import HeroLensInteractivePreview, {
    ReturningLearnerCard,
  } from '@/components/tracks/HeroLensInteractivePreview';

  // AFTER (keep only what we still use):
  import { ReturningLearnerCard } from '@/components/tracks/HeroLensInteractivePreview';
  ```

- [ ] **P5-B — Remove `HeroLensInteractivePreview` from JSX** (line ~79)

  ```tsx
  // REMOVE this line entirely:
  <HeroLensInteractivePreview />
  ```

- [ ] **P5-C — Remove the `FEATURES` array and badge grid** (lines ~24-89)

  Remove:
  - The `FEATURES` const (lines ~24-45)
  - The `<ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">` badge section (lines ~81-89)

- [ ] **P5-D — Remove the redundant footer tip** (lines ~146-148)

  ```tsx
  // REMOVE:
  <p className="mt-8 text-center font-mono text-[11px] text-text-dim">
    Already started? Open a track and hit Resume on your roadmap.
  </p>
  ```

  `ReturningLearnerCard` handles this already.

- [ ] **P5-E — Tighten vertical padding on the wrapper** (line ~62)

  ```tsx
  // BEFORE:
  <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8 sm:py-16">

  // AFTER:
  <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
  ```

### Final homepage layout (after P5)

```
/ (homepage)
├── [Header — minimal: logo + auth only]  ← P3+P4
├── overline: "Two tracks · one visual learning system"
├── h1: "Master the Data Layer: From Bare-Metal SQL to Type-Safe Prisma ORM."
├── sub-copy: "Every day is a stage..."
├── [ReturningLearnerCard] (only visible to returning users)
├── "Choose your track" label
├── [Two track cards: SQL card / Prisma card]
└── [Footer — minimal]
```

### Acceptance Criteria

- [ ] No live engine demo on homepage
- [ ] No feature badge grid on homepage
- [ ] No redundant "Already started?" tip
- [ ] Page renders fast — no auto-running JS engine imports on `/`
- [ ] `ReturningLearnerCard` still appears for returning users
- [ ] Track cards (SQL + Prisma) still render correctly
- [ ] `/sql` and `/prisma` roadmap pages: completely unaffected

---

## Implementation Order

```
P1  →  P2  →  P3  →  P4  →  P5
```

- **P1 & P2** first — pure string/href changes, zero risk, highest impact on Prisma UX
- **P3** next — additive prop, can be merged independently
- **P4** — wires P3, one liner
- **P5** last — most visible change on homepage, do after everything else is confirmed working

---

## Files Touched (Full List)

| File | Phase | Nature |
|------|-------|--------|
| `src/components/roadmap/LearningPathView.tsx` | P1 | 5 copy strings → track-conditional expressions |
| `src/components/learn/ModuleOverview.tsx` | P2 | 1 destructure + 1 href |
| `src/components/layout/Header.tsx` | P3 | 1 new prop + 5 conditional wraps + 1 href |
| `src/components/layout/AppChrome.tsx` | P4 | 1 const + 1 prop pass |
| `src/components/tracks/TrackSelector.tsx` | P5 | Remove 3 blocks, simplify import, tighten padding |

**Total:** 5 files · ~30 line edits · 0 new files · 0 SQL pages touched

---

## Explicitly Out of Scope

The following are intentionally NOT changed by this plan:

- `src/app/(app)/sql/` — all SQL route pages
- The SQL branch of `LearningPathView.tsx` — SQL copy stays exactly as-is
- `src/components/layout/Header.tsx` when `isMinimal` is false — renders are identical
- `src/components/learn/` theory/practice/challenge/complete views
- Any database, engine, curriculum, or progress logic
