# App Router Migration — Phase Tracker

> Live status file for the full route migration. Every phase is committed behind a
> green `npx tsc --noEmit` + `npm run build` gate. Work on a phase ONLY when the
> user explicitly asks for it. Update this file (statuses + notes) as part of
> each phase's commit.

**Baseline:** commit `4b49977` — AppShell state machine, `/?day=&stage=&concept=&task=` URL sync, NavSnapshot localStorage.

---

## Target Architecture

```
src/app/
├── layout.tsx              ROOT — fonts, globals.css, theme, global metadata, JSON-LD only
├── globals.css
├── (public)/
│   ├── layout.tsx          public chrome (reserved for future marketing pages)
│   └── page.tsx            /            Learning Path (roadmap) + legacy ?day= redirect
├── (auth)/
│   ├── layout.tsx          centered chrome; redirect already-signed-in → /
│   ├── signin/page.tsx     /signin
│   └── signup/page.tsx     /signup
├── (app)/
│   ├── layout.tsx          LEARNING SHELL — AppProviders + Header + <main>
│   ├── template.tsx        stage-transition animation
│   ├── learn/
│   │   ├── page.tsx        /learn       resume point → redirect
│   │   └── [dayId]/
│   │       ├── layout.tsx  validate dayId, breadcrumb, day context, executor reset boundary
│   │       ├── page.tsx    /learn/day-09         Module Overview (NEW)
│   │       ├── theory/[conceptId]/page.tsx
│   │       ├── practice/[conceptId]/page.tsx   ?task=N searchParam
│   │       ├── challenge/page.tsx
│   │       └── complete/page.tsx
│   └── playground/page.tsx /playground
└── (admin)/
    └── admin/
        ├── layout.tsx      server role/status gate (moved from app/admin/page.tsx) + nav
        ├── page.tsx        /admin           Overview
        ├── users/page.tsx  /admin/users
        ├── modules/page.tsx /admin/modules
        └── schedule/page.tsx /admin/schedule
```

### Hard constraints (from audit)

1. `customValidator` (function in `ValidationRule`, used at `day01.ts:699`) is NOT serializable → lesson pages are **client components importing their own module data**; module data never crosses server→client boundary.
2. Unlock rules are client-side (progress in localStorage/cloud) → locked days render a **locked-state page**, not a server redirect. Invalid dayId → `notFound()`.
3. `SqlExecutorProvider` exposes `resetDatabase()` as a **function**, never a `useEffect(() => reset(), [pathname])`.
4. Concept IDs are already stable slugs (`where-and-intersection`, …); progress already stores by ID. Only navigation/URL is index-based today → switch, don't migrate data.

### State tiers (keep strictly separated)

| Tier | Owner | Contents |
|---|---|---|
| A. Route state | URL segments + searchParams | dayId, conceptId, stage segment, `?task=N` (replaces NavSnapshot + pushState/popstate entirely) |
| B. Learning progress | localStorage + cloud | completedModules/Concepts/Tasks (ID-keyed), taskAttempts, currentModuleId, currentConceptId (**index→ID switch**) |
| C. Session UI state | component/provider local, never persisted to URL | editor panels, modal flags, playground history, draft SQL (drafts also mirrored in taskAttempts) |

### SQL Executor reset boundaries

| Trigger | Reset | Mechanism |
|---|---|---|
| Different day entered | ✅ | `[dayId]/layout.tsx` effect on dayId |
| "Restart lesson"/review CTA | ✅ | explicit `resetDatabase()` call |
| Theory→practice, same concept | ❌ | continuity preserved |
| Task→task, same concept | ❌ (unless `PracticeTask.freshDb`) | optional per-task flag, default false |
| Playground | ✅ | owns its own executor (already true) |

> ⚠️ Today's code resets on every concept/task/stage change — the new boundaries are
> deliberately more permissive. Canary test: Day 1 DELETE task → later SELECT task.

### Legacy redirect map (`src/lib/legacy-routes.ts` — single source)

| Legacy | New |
|---|---|
| `/?day=7` | `/learn/day-07` |
| `stage=lesson` | `/learn/day-07/theory/{conceptId}` (`?concept=I` 1-based → slug; invalid → first) |
| `stage=practice` | `/learn/day-07/practice/{conceptId}?task=N` |
| `stage=concept_complete` | `/learn/day-07/theory/{nextConceptId}` |
| `stage=challenge` | `/learn/day-07/challenge` |
| `stage=day_complete` | `/learn/day-07/complete` |
| invalid/locked day | `/` |


URLs: `/`, `/signin`, `/signup`, `/learn`, `/learn/day-01`,
`/learn/day-01/theory/where-and-intersection`,
`/learn/day-01/practice/where-and-intersection?task=2`,
`/learn/day-01/challenge`, `/learn/day-01/complete`, `/playground`, `/admin`.


---

## Phases

### Phase 0 — Provider extraction & decomposition (no routes yet, zero visual change)
**Status: ⬜ NOT STARTED** · Commit: — · Completed: —
- [ ] `AuthProvider` — session, user, role/status, signOut, blocked-state (extracted from AppShell)
- [ ] `LearningProgressProvider` — userState, all progress actions, localStorage sync, cloud hydration/merge/debounce/flush (verbatim move, then trimmed)
- [ ] `SqlExecutorProvider` — executor instance + `executeQuery()` + `resetDatabase()` as a function (no path effects)
- [ ] `AppProviders` composition; AppShell consumes context only
- [ ] Gates: tsc + build + engine tests + smoke test
- Notes:

### Phase 1 — Route-group skeleton, auth & playground routes
**Status: ⬜ NOT STARTED** · Commit: — · Completed: —
- [ ] Route groups `(public)` `(auth)` `(app)` `(admin)`; root layout slimmed to global concerns
- [ ] `(app)/layout.tsx` owns AppProviders + Header + `<main>`; AppShell deleted
- [ ] `/playground` real route; header terminal → `<Link>`; `isPlaygroundOpen` deleted
- [ ] `/signin` `/signup` routes w/ per-route metadata; `authMode` deleted; already-signed-in redirect
- [ ] `(admin)/layout.tsx` server role gate (moved verbatim from app/admin/page.tsx)
- [ ] Gates: tsc + build + engine tests + smoke test
- Notes:

### Phase 2 — Concept-ID navigation switch (stable slugs)
**Status: ⬜ NOT STARTED** · Commit: — · Completed: —
- [ ] `UserLearningState.currentConceptIndex` → `currentConceptId: string | null`
- [ ] One-time localStorage shim (resolve old index → slug on load)
- [ ] All navigation helpers switch to IDs (startPractice, completeConcept, continueNextConcept, selectModuleAndConcept)
- [ ] `merge.ts` position merge updated; engine tests green
- Notes:

### Phase 3 — The learn tree + legacy redirects
**Status: ⬜ NOT STARTED** · Commit: — · Completed: —
- [ ] `[dayId]/layout.tsx` — validate dayId (`notFound()`), breadcrumb, executor reset boundary
- [ ] `/learn/[dayId]` Module Overview page (NEW UI: concept list, per-concept state, challenge entry, continue CTA)
- [ ] `theory/[conceptId]`, `practice/[conceptId]?task=N`, `challenge`, `complete` pages
- [ ] `(app)/template.tsx` stage transition animation
- [ ] `/learn` resume redirect; locked-day UI; invalid conceptId → `notFound()`
- [ ] `src/lib/legacy-routes.ts` + wiring in `(public)/page.tsx`
- [ ] DELETE NavSnapshot + AppShell's pushState/popstate URL-sync machinery
- [ ] DML-leakage canary (Day 1 DELETE → SELECT task) manual pass
- Notes:

### Phase 4 — SEO layer
**Status: ⬜ NOT STARTED** · Commit: — · Completed: —
- [ ] `generateStaticParams` ×25 day shells
- [ ] `generateMetadata` per day + `/playground` (title/desc/canonical/OG)
- [ ] JSON-LD LearningResource per module; sitemap: home + /learn + 25 day URLs
- [ ] `<Link prefetch>` audit on roadmap cards
- [ ] Gates: build output inspection (static params emitted)
- Notes:

### Phase 5 — Backlog (post-migration; work only on request)
**Status: ⬜ OPEN** · Commit: — · Completed: —
- [ ] Admin panel split → `/admin/users`, `/admin/modules`, `/admin/schedule` pages (gate already in `(admin)/layout.tsx`)
- [ ] Guest-progress prompt UX on first sign-in w/ divergent cloud doc (auto union-merge remains default until built)
- [ ] `PracticeTask.freshDb` opt-in flag if a task ever needs an isolated DB
- [ ] README route map + API reference refresh
- [ ] `(public)/layout.tsx` marketing chrome (only when marketing pages exist)
- Notes:

---

## Verification matrix (run for every phase)

- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run test:engine`
- [ ] Manual: back/forward across stages · refresh mid-task (draft SQL preserved) · deep-link locked day · legacy `?day=7&stage=practice&concept=2&task=1` · signed-out browse · sign-in merge · blocked account view

---

## Changelog (append one line per phase completion)

- `4b49977` baseline — tracker created; all phases pending.

