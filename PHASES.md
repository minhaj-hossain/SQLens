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
**Status: ✅ COMPLETE** · Commit: `249b88f` · Completed: 2026-08-28
- [x] `AuthProvider` — session, user, role/status, signOut, blocked-state (extracted from AppShell)
- [x] `LearningProgressProvider` — userState, all progress actions, localStorage sync, cloud hydration/merge/debounce/flush (verbatim move, then trimmed)
- [x] `SqlExecutorProvider` — executor instance + `executeQuery()` + `resetDatabase()` as a function (no path effects)
- [x] `AppProviders` composition; AppShell consumes context only
- [x] Gates: tsc + build + engine tests + smoke test
- Notes: AppShell 880 → 322 lines (presentation only). Position state
  (module/concept/task/stage/tab) temporarily co-located in
  LearningProgressProvider because progress handlers fuse position + progress
  writes; Phase 3 peels it into routes. URL-sync + NavSnapshot intentionally
  left intact until Phase 3. AppProviders mounts in `src/app/page.tsx` for now
  (moves to `(app)/layout.tsx` in Phase 1). Executor reset effect stays in
  AppShell, now calling `resetDatabase()` from the provider (behavior identical:
  resets on module/concept/task/stage change).

### Phase 1 — Route-group skeleton, auth & playground routes
**Status: ✅ COMPLETE** · Commit: `6fa1df6` · Completed: 2026-08-28
- [x] Route groups `(public)` `(auth)` `(app)` `(admin)`; root layout untouched (global concerns only)
- [x] `(app)/layout.tsx` owns AppProviders + UiChromeProvider + AppChrome (Header + <main>); AppShell deleted
- [x] `/playground` real route; header terminal → `<Link>`; `isPlaygroundOpen` deleted
- [x] `/signin` `/signup` routes w/ per-route metadata; `authMode` deleted; already-signed-in redirect in `(auth)/layout.tsx`
- [x] `(admin)/admin/layout.tsx` server role gate (moved verbatim from the old admin page)
- [x] Gates: tsc + build + engine tests + smoke test
- Notes:
  - New `UiChromeProvider` (inside AppProviders): schema/roadmap modal state +
    roadmap scroll target shared between the header and page content; renders
    both modals at layout level.
  - AppShell replaced by `AppChrome` (chrome + blocked gate) and
    `LearnHomePage` (page content). Header: playground/sign-in/admin buttons
    are now `<Link>`s; dead props removed (onOpenRoadmapModal, onProfileClick,
    onSignUpClick); onLogoClick keeps setRoadmapScrollTarget + setActiveTab.
  - DEVIATION: `/playground` is a TOP-LEVEL route, not inside (app) — it is a
    standalone full-page tool (own SqlExecutor, no Header), matching
    pre-migration UX. Revisit in Phase 5 if chrome integration is wanted.
  - DEVIATION: `/` lives in (app), not (public) — the roadmap is the app
    landing and needs Header + providers. (public) is a reserved empty group.
  - Smoke: `/` 200 · `/playground` 200 · `/signin` `/signup` 200 (anon) ·
    `/admin` streams NEXT_REDIRECT→`/` for anon (same mechanism as
    pre-migration admin page).

### Phase 2 — Concept-ID navigation switch (stable slugs)
**Status: ✅ COMPLETE** · Commit: `e102a7e` · Completed: 2026-08-28
- [x] `UserLearningState.currentConceptIndex` → `currentConceptId: string | null`
- [x] One-time localStorage shim (resolve old index → slug on load, in the provider via `resolveConceptId()`; storage.ts stays curriculum-agnostic)
- [x] All navigation helpers switch to IDs (selectModuleAndConcept, selectModule, completeConcept, continueNextConcept, reviewModule, resetProgress, legacy-URL applier)
- [x] `merge.ts` position merge — NO change needed: it spreads the whole position source, so the new field flows through generically
- [x] Engine tests + curriculum verify + build green
- Notes:
  - Provider exposes BOTH `currentConceptId` (settable slug) and a derived
    read-only `currentConceptIndex` (computed via `concepts.findIndex` +
    `Math.max(0, …)`) — view components (ConceptLessonView, PracticeTaskView,
    ConceptCompleteView) keep their numeric index props unchanged.
  - NavSnapshot format: `conceptId` + optional `legacyConceptIndex` (resolved
    on load); `saveNavSnapshot` writes only the slug going forward.
  - LearningPathView: `onSelectModuleAndConcept(moduleId, conceptId?, stage?)`
    — all call sites (start/continue/review/concept grid/locked alert/challenge
    strip) pass slugs; active-concept highlight compares `currentConceptId ===
    concept.id`.
  - New `scripts/phase2-check.ts` (npx tsx): validates slug uniqueness +
    URL-safety per module (25 modules / 64 concepts) and legacy index → slug
    resolution incl. out-of-bounds and unknown-slug rejection.

### Phase 3 — The learn tree + legacy redirects
**Status: ✅ COMPLETE** · Commit: `5d3b5b2` · Completed: 2026-08-28
- [x] `[dayId]/layout.tsx` — validate dayId (`notFound()`), breadcrumb, executor reset boundary
- [x] `/learn/[dayId]` Module Overview page (NEW UI: concept list with ✓/▶/🔒 states, challenge entry, continue CTA, progress bar, locked-day notice)
- [x] `theory/[conceptId]`, `practice/[conceptId]?task=N`, `challenge`, `complete` pages
- [x] `(app)/template.tsx` stage transition animation (fade/slide on every route change)
- [x] `/learn` resume redirect (first-incomplete concept → challenge → complete); locked-day UI in overview; invalid dayId/conceptId → `notFound()`; concept-level lock → redirect to overview
- [x] `src/lib/legacy-routes.ts` + server wiring in `(app)/page.tsx` (?highlight= passes through)
- [x] DELETE NavSnapshot + pushState/popstate URL-sync machinery; `activeTab`/`NavTab` die; `/` is roadmap-only
- [x] DML-leakage canary: AUTOMATED content audit (new tooling, see notes) — manual playthrough of Day 19/20 still recommended
- Notes:
  - **Provider v3**: LearningProgressProvider holds ONLY Tier-B progress +
    sync + availability + pure `mark*` actions (markTaskComplete,
    markChallengeTaskComplete, markConceptComplete, markModuleComplete,
    resetProgress). Position (module/concept/stage/task) comes from ROUTE
    params; navigation lives in `useLearningNavigation()` (guard-preserving
    router.push actions). `completedChallengeTaskIds` state removed —
    challenge page derives via getCompletedChallengeTaskIds.
  - **Executor reset boundaries (audited)**: reset on day OR concept change.
    Content audit found 31 DML/DDL fields concentrated in day-19 (DML) and
    day-20 (DDL): per-day-only reset would break Day-20 CREATE TABLE retries
    ("table exists") and leak Day-19 mutations across concepts. Theory→practice
    and task→task within a concept keep continuity (per plan).
  - New libs: `learn-routes.ts` (LearnStage, learnUrl, dayId/conceptId from
    pathname, roadmapUrl ?highlight=) and `legacy-routes.ts`
    (legacyNavigationToRoute — full mapping table incl. concept_complete →
    next theory/challenge/complete; unit-verified).
  - AppChrome derives header title/current module from pathname; logo is a
    `<Link href="/">`; Reset Progress = provider action + hard nav to `/`.
    RoadmapModal selection routes to /learn (UiChromeProvider uses nav hook;
    scroll-target state replaced by `?highlight=` on `/`).
  - Dead code: ConceptCompleteView no longer reachable ('concept_complete'
    stage was URL-only even pre-migration) — Phase 5 cleanup candidate.
    SuccessModal legacy mount dropped with LearnHomePage.
  - Smoke (live server): / · /learn · /learn/day-01 · theory · practice?task=0
    · challenge · /learn/day-25 (locked notice rendered) · /learn/day-99 (404)
    · legacy ?day=3&stage=lesson&concept=2 streams redirect to
    /learn/day-03/theory/where-or-union · /signin /playground /admin OK.
    Gates: tsc clean · build OK (learn routes dynamic) · engine 21/21 ·
    phase2-check passing.

### Phase 4 — SEO layer
**Status: ✅ COMPLETE** · Commit: `da7330f` · Completed: 2026-08-28
- [x] `generateStaticParams` ×25 day shells — all 25 `/learn/[dayId]` prerendered **static** (●) at build; `/learn` also static; stage pages dynamic with on-demand metadata
- [x] `generateMetadata` per day + per concept/stage (theory/practice/challenge/complete) + `/playground` (title/desc/canonical/OG/twitter via `src/lib/learn-metadata.ts`)
- [x] JSON-LD `LearningResource` per module overview (name, description, url, timeRequired, teaches, provider, isAccessibleForFree)
- [x] Sitemap expanded: home + /learn + 25 day overview URLs (stage pages intentionally excluded — client-gated practice surfaces)
- [x] `<Link prefetch>` audit: header logo/terminal/admin links are `<Link>`s (prefetched); roadmap/overview cards navigate via `router.push` (no prefetch) — conversion deferred to Phase 5 if needed
- Notes:
  - Page structure: each learn page is now a thin SERVER wrapper exporting
    `generateMetadata` (day overview also `generateStaticParams` + JSON-LD
    script) rendering a client view (`ModuleOverview`/`TheoryView`/
    `PracticeView`/`ChallengeView`/`CompleteView` in src/components/learn/)
    that receives only the serializable `dayId`/`conceptId` — module data
    (with its function-valued validators) imports client-side and never
    crosses the server→client boundary.
  - Verified on live server: day-01 HTML contains meta title, canonical
    `/learn/day-01`, JSON-LD; theory page title
    `Day 1 · SELECT and FROM · SQLens` + canonical; sitemap.xml has 27 URLs
    incl. all 25 days.

### Phase 5 — Backlog (post-migration; work only on request)
**Status: ✅ COMPLETE** · Commit: `BACKLOG_COMMIT` · Completed: 2026-08-28
- [x] Admin panel split → `/admin/users`, `/admin/modules` pages (gate already shared via `(admin)/layout.tsx`)
- [x] Guest-progress prompt UX on first sign-in w/ divergent cloud doc (auto union-merge remains the default)
- [x] `PracticeTask.freshDb` opt-in flag for tasks needing an isolated DB
- [x] README route map + API reference refresh
- [x] `(public)/layout.tsx` marketing chrome only when marketing pages exist (group reserved — no action)
- Notes:
  - **Admin split**: `AdminDashboard` (tabbed) deleted. `(admin)/layout.tsx`
    keeps its role/status gate + now wraps children in `AdminUsersProvider`
    (shared users list + `reload()` for the Overview→Users panel sync) and
    `AdminShell` provides the top bar + tab links (/admin, /admin/modules,
    /admin/users) + centralized loading/forbidden states; `robots: noindex`
    on the whole group. Overview/Users/Modules pages each read adminName
    server-side. Users label in tabs shows live total.
  - **Guest-progress prompt**: provider now detects divergent local vs cloud
    progress on hydration (both sides have completed modules and they
    differ) → holds the merge and renders a `MergePromptDialog` (Combine
    both / Use account progress). Combine = union-merge + persist; Use
    account = fromCloudProgress (keeps local dev toggles) + persist. Same
    progress / empty-side cases still auto-merge silently.
  - `PracticeTask.freshDb` field + PracticeView reset-on-mount when set.
  - Dead code removed: `ConceptCompleteView` (its 'concept_complete' stage
    was URL-only pre-migration — completion flows straight through) and the
    legacy `SuccessModal` (never opened).

---

## Verification matrix (run for every phase)

- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run test:engine`
- [ ] Manual: back/forward across stages · refresh mid-task (draft SQL preserved) · deep-link locked day · legacy `?day=7&stage=practice&concept=2&task=1` · signed-out browse · sign-in merge · blocked account view

---

## Changelog (append one line per phase completion)

- `4b49977` baseline — tracker created; all phases pending.
- `d01f32a` docs — PHASES.md tracker committed.
- `d75f8a6` Phase 0 work committed (superseded by amend → see next line).
- `249b88f` **Phase 0 COMPLETE** — providers extracted (Auth / LearningProgress / SqlExecutor / AppProviders); AppShell 880→322 lines; all gates green.
- `6fa1df6` **Phase 1 COMPLETE** — route groups (public)/(auth)/(app)/(admin); /signin /signup /playground real routes; AppShell deleted → AppChrome + LearnHomePage; UiChromeProvider added; all gates green.
- `e102a7e` **Phase 2 COMPLETE** — navigation switched to stable concept slugs (currentConceptId) with legacy-index shim; merge.ts unchanged; scripts/phase2-check.ts added (25 modules / 64 concepts verified); all gates green.
- `5d3b5b2` **Phase 3 COMPLETE** — real /learn/[dayId] route tree + NEW module overview page; URL is the position (provider stripped of navigation); legacy redirects; executor boundaries day+concept (DML audit); NavSnapshot/pushState machinery deleted; all gates green.
- `da7330f` **Phase 4 COMPLETE** — 25 static day shells + /learn static; per-day/per-concept metadata (canonical/OG); JSON-LD LearningResource; sitemap 27 URLs; learn pages = server wrappers + client views; all gates green.

