# Navigation & Overview Cleanup Tracker

## Problem Audit & Root Cause Analysis

### Problem 1: Locked Concept Click on Roadmap Card Redirects to a Locked Page
- **Root Cause**:
  In `LearningPathView.tsx` (the roadmap view for `/sql` and `/prisma`), the active day callout card renders all concepts of the active module. Each concept button was unconditionally clickable with `onClick={() => onSelectModuleAndConcept(currentModule.id, concept.id, ...)}`.
  When a user clicked a locked concept (e.g. Concept 2 when Concept 1 is incomplete), `onSelectModuleAndConcept` pushed the URL `/sql/learn/[dayId]/theory/[conceptId]`.
  On that page, `TheoryView.tsx` ran:
  ```ts
  const conceptLocked = !isConceptCompleted(concept, mod.id, userState) && conceptIndex > completedCount;
  if (conceptLocked) {
    router.replace(`${meta.basePath}/learn/${mod.id}`);
    return null;
  }
  ```
  This redirected the user to `/sql/learn/[dayId]`, which was the Day Overview page displaying lock notices.
- **Solution**:
  1. In `LearningPathView.tsx`, calculate concept unlock state:
     `const isConceptLocked = !conceptDone && cIdx > completedConceptsCount;`
  2. For locked concepts:
     - Render a distinct locked visual treatment (subtle lock badge, dim opacity, `cursor-not-allowed`).
     - Clicking a locked concept **does NOT navigate** to any new page.
     - Instead, display an in-place notification / alert (using the existing `lockedAlert` banner in `LearningPathView.tsx` or an inline card notice: `"Concept Locked: Finish the earlier concept lessons first to unlock."`).
  3. In `TheoryView.tsx`, if directly visited via deep URL, do **not** redirect to `/learn/[dayId]`; bounce to the active incomplete concept or show the lesson in read-only / preview mode with a note.

---

### Problem 2: Browser Refresh on Task Page Bounces to the Overview Page
- **Root Cause**:
  1. `LearningProgressProvider.tsx` initializes `userState` synchronously on mount with `loadUserState(null, track)` (guest storage).
  2. When the user is authenticated, Better Auth's `useAuth().isPending` is initially `true`, so `signedInUserId` is `null` on the first render.
  3. If a signed-in user has reached Day 2+ or completed earlier tasks, the initial guest state in memory does NOT reflect their progress yet (`completedModules` is empty).
  4. `TrackDayLayoutView.tsx` wraps all learn subpages (`theory`, `practice`, `challenge`, `complete`) and ran `resolveDayLayoutState` immediately on mount:
     ```ts
     const { isLocked, isOverview, redirectUrl } = resolveDayLayoutState(mod, def.modules, pathname, track, userState);
     useEffect(() => {
       if (redirectUrl) router.replace(redirectUrl);
     }, [redirectUrl]);
     ```
     Because `userState` was unhydrated on initial mount, `isLocked` evaluated to `true`, and `TrackDayLayoutView.tsx` immediately executed `router.replace('/sql/learn/[dayId]')`.
- **Solution**:
  1. **Remove overview bounce**: With the overview page removed, `TrackDayLayoutView.tsx` will not bounce deep links to `/learn/[dayId]`.
  2. **Auth & hydration awareness**: Never perform a lock-rejection redirect while `isAuthPending` is true.
  3. **Preserve page on refresh**: For valid task pages (`/practice/[conceptId]?task=N`), ensure the page mounts and remains on that exact route and task without interruption.

---

### Problem 3: Remove User Resume Part from the Homepage
- **Root Cause**:
  In `ClickHomepage.tsx` (`/`), the hero section rendered `<ReturningLearnerCard />`.
  The user explicitly requested: *"i don't wanna show the user resume part in the homepage, clear it with its code as well"*.
- **Solution**:
  1. Remove `<ReturningLearnerCard />` from `ClickHomepage.tsx`.
  2. Remove `ReturningLearnerCard` from `HeroLensInteractivePreview.tsx`.
  3. Clean up unused continuity helpers (`buildContinuityEntry` in `src/lib/homepage.ts`) and associated test suites.

---

### Core Architectural Change: Complete Removal of the `/learn/[dayId]` Overview Page
- **Pages & Components to Remove**:
  - `src/components/learn/ModuleOverview.tsx` (delete / deprecate)
  - `src/app/(app)/sql/learn/[dayId]/page.tsx` & `src/app/(app)/prisma/learn/[dayId]/page.tsx`:
    Replace with an immediate server redirect (or redirect component) to the day's first concept (`/sql/learn/[dayId]/theory/[firstConceptId]`), so learners landing directly on `/learn/[dayId]` automatically start the lesson instead of viewing an intermediate landing page.
- **Refactor Call Sites**:
  - `TrackDayLayoutView.tsx`: Remove `isOverview` and `overviewUrl` redirect.
  - `TheoryView.tsx`: Replace redirect to `${meta.basePath}/learn/${mod.id}` with fallback to the first incomplete concept.
  - `ChallengeView.tsx`: Replace overview fallback with direct route to theory.
  - `CompleteView.tsx`: Replace overview fallback with roadmap link.
  - `use-learning-navigation.ts`: Replace any `${basePath}/learn/${next.id}` references with direct theory URLs.
  - `tests/tracks/phase11-day-layout-view.test.tsx`: Update tests to align with new layout invariants.

---

## Phased Implementation Tracker

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Remove homepage resume card (`ReturningLearnerCard`) and unused continuity code | Completed |
| **Phase 2** | Fix roadmap card locked concept interaction (no redirect, in-place alert/locked UI) | Completed |
| **Phase 3** | Fix task page refresh behavior (prevent premature locked redirect while auth/progress hydrates) | Completed |
| **Phase 4** | Remove `/learn/[dayId]` overview page & `ModuleOverview.tsx`, redirect day URLs directly to theory | Completed |
| **Phase 5** | Clean up all remaining overview redirects (`TheoryView`, `ChallengeView`, `CompleteView`, `use-learning-navigation`) | Completed |
| **Phase 6** | Verification, regression testing, and test suite alignment | Completed |

---

## Phase 3 — Implementation Notes (completed)

**Signal:** `isProgressReady` (new field on the learning context). It is derived
from a *readiness ticket* — the `(user, track)` whose local snapshot the provider
has actually applied. While Better Auth is resolving there is no expected ticket
(`null`), so nothing is ready; on a signed-in refresh the seeded guest state
(`completedModules` empty) is therefore never mistaken for the authoritative one.

**Pure seam:** `src/lib/progress/readiness.ts`
- `progressReadyTicket(authPending, signedInUserId, track) → string | null`
- `deriveProgressReady(authPending, signedInUserId, track, readyTicket) → boolean`

**Provider (`LearningProgressProvider.tsx`):**
- Reads `isAuthPending` from `useAuth()` and owns `readyTicket` state.
- The identity-reconciliation effect now early-returns while `isAuthPending`, so
  readiness is never stamped mid-hydration; it stamps the ticket at the end of
  the guest / logout / login reconciliation (in the same commit the snapshot is
  applied). Deps extended to `[signedInUserId, track, isAuthPending]`.
- Cloud hydration that follows only *refines* an already-ready state.

**Consumers:** `TrackDayLayoutView`, `TheoryView`, `ChallengeView`, `CompleteView`
all gate their lock-rejection/redirect on `isProgressReady` and hold the exact
route (render nothing) until it is true — so a refreshed task page never bounces
off its own route/task.

**Tests:** `tests/tracks/learn-refresh-hydration.test.tsx` (pure seam truth
table, 7 cases) + a new SSR case in `phase11-day-layout-view.test.tsx` ("holds
the exact route … until progress is ready"), whose `useLearning` mock now
supplies `isProgressReady`.

---

## Phase 4 — Implementation Notes (completed)

**Removed:** `src/components/learn/ModuleOverview.tsx` (deleted; no test
imported it).

**Day entry is now a redirect.** `src/app/(app)/{sql,prisma}/learn/[dayId]/page.tsx`
are server components that resolve the module via `getTrackModuleById` and call
`redirect(trackLearnUrl(track, dayId, 'theory', mod.concepts[0].id))` — a 307 to
the day's first concept. `generateStaticParams` + `generateMetadata` are kept, so
the day URLs stay prerendered (verified: `day-01.html` carries
`NEXT_REDIRECT;replace;/sql/learn/day-01/theory/select-and-from;307;`) and keep
their per-day metadata/canonical. An unknown `dayId` is `notFound()`.

**Locked notice moved into the layout.** New `src/components/learn/LockedDayNotice.tsx`
(ports the old overview locked view; back link stays track-aware via
`meta.basePath`). `TrackDayLayoutView` now renders
`{isLocked ? <LockedDayNotice mod={mod} /> : children}` inside the day chrome and
**never redirects**.

**Pure seam collapsed.** `resolveDayLayoutState(mod, modules, userState)` →
`{ isLocked }` only. `isOverview`, `overviewUrl`, `redirectUrl`, and the redirect
`useEffect` are gone; `usePathname`/`useRouter` dropped from the view.

**SEO.** The day `LearningResource` JSON-LD moved from the (now-redirecting) day
page to the canonical theory entry — emitted once, on the FIRST concept of each
day, in both theory page wrappers. `moduleJsonLd` stays in use.

**Tests (`tests/tracks/phase11-day-layout-view.test.tsx`, 25 total):**
- locked deep link → renders `LockedDayNotice` ("Day 2 is locked" + "Back to
  Learning Path"), never a redirect, children suppressed;
- locked day keeps the day chrome (Roadmap + `Day 2 of 57`);
- `resolveDayLayoutState` rewritten to the 3-arg `{ isLocked }` contract;
- new redirect-target block: SQL + Prisma day entries redirect to
  `…/theory/<firstConceptId>`, unknown id is a 404;
- removal guards: the view contains none of `isOverview`/`overviewUrl`/
  `redirectUrl`/`usePathname`/`useRouter`/`ModuleOverview` and does own
  `LockedDayNotice`; `ModuleOverview.tsx` no longer exists.

**Deferred to Phase 5:** the remaining bare `…/learn/${mod.id}` fallbacks in
`ChallengeView.tsx` and `CompleteView.tsx` (and `use-learning-navigation.ts`).
They keep working (they now take the day redirect hop) but are still "overview"
URLs to be cleaned up.

---

## Phase 5 — Implementation Notes (completed)

No app source builds a bare `…/{track}/learn/{moduleId}` ("overview") URL any
more. Each remaining fallback now targets theory or the track roadmap:

- `ChallengeView.tsx` — locked challenge → first incomplete concept's theory,
  else the track roadmap (`trackRoadmapUrl`); dropped the unused `meta`.
- `CompleteView.tsx` — a not-completed `/complete` URL → the track roadmap
  (`trackRoadmapUrl`, highlight = module); destructures `track` instead of `meta`.
- `use-learning-navigation.ts` — `continueNextDay` fallback → next module's
  first concept theory, else roadmap; `TRACK_META` import removed.
- `TheoryView.tsx` — already overview-free (Phase 2); dropped the unused `meta`.
- **Adjacent fix (beyond the tracker's list):** `ModuleCompletionView.tsx`
  ("Next Module") built the legacy un-namespaced `/learn/...` URL via
  `learnUrl` — wrong for Prisma (404 through the `/learn*`→`/sql/learn*`
  redirect). It now uses `trackLearnUrl(track, …)` via `useTrack()`.

**Left intentionally unchanged:** `src/lib/learn-routes.ts` (frozen legacy
helpers), `sitemap.ts` (canonical day URLs), and the day-redirect pages.
`learn-metadata.ts` still emits the bare day URL as canonical/JSON-LD `url`
(now a 307 to concept 0) — an optional SEO repoint for Phase 6.

**Tests:** two Phase 5 guards added to `phase11-day-layout-view.test.tsx`
(now 27): the five cleaned files contain no `/learn/${…}` bare-overview
signature, and each uses a track-aware builder (`trackLearnUrl` /
`trackRoadmapUrl`). Full suite 918 passed (same 9 pre-existing Prisma
failures); `tsc --noEmit` clean; `npm run build` green.

---

## Phase 6 — End-state Verification (completed)

### Automated gates

| Gate | Command | Result |
|---|---|---|
| Types | `npm run lint` (`tsc --noEmit`) | exit 0 |
| Full suite | `npx vitest run` | **918 passed / 9 failed** (82 files; baseline below) |
| Targeted gate | phase11 + learn-refresh-hydration + click-homepage + roadmap-concept-lock + phase2-routing | **51 passed / 5 files** |
| Build | `npm run build` | exit 0 (day routes SSG) |

### Known-failing baseline (pre-existing, out of scope)

Reproducible on a clean checkout **before Phase 1**; unrelated to this cleanup
(Prisma content/grading), deliberately **not** fixed here:

| File | Fails | Root cause |
|---|---|---|
| `tests/tracks/phase5-prisma-pipeline.test.ts` | 5 | `prisma14-c1-t2` solution validation + CLI-snippet normalization |
| `tests/tracks/phase7-prisma-ui-wiring.test.ts` | 2 | same `prisma14-c1-t2` solution/validation mismatch |
| `tests/tracks/phase8-prisma-audit.test.ts` | 1 | same `prisma14-c1-t2` validation |
| `tests/tracks/phase12-prisma-state-parity.test.ts` | 1 | corpus NULL-in-write-position sweep |

### HTTP smoke (production build, `next start` on :3000)

| Route | Result |
|---|---|
| `/` | 200; Click headline present; **no** resume card; `/sql` + `/prisma` cards present |
| `/sql/learn/day-01` | 200 static shell whose payload carries `NEXT_REDIRECT;…;307` → `/sql/learn/day-01/theory/<firstConcept>` (no old overview CTA) |
| `/prisma/learn/prisma-01` | 200 static shell → redirect to the Prisma first-concept theory |
| `/learn/day-01` (legacy) | **307** `Location: /sql/learn/day-01` (next.config bridge) |
| `/sitemap.xml` | 200; contains `/sql/learn/day-01` + `/prisma/learn/prisma-01` |

Interactive sign-off uses the same invariants the guards assert: refresh holds
the exact task route, locked deep links render `LockedDayNotice`, roadmap locked
concepts show the in-place alert, homepage has no continuity card.

### Definition of Done

- [x] `tsc --noEmit` exit 0
- [x] Full suite 918 pass / 9 documented baseline fail (no new failures)
- [x] `npm run build` exit 0; day routes emit a redirect
- [x] HTTP smoke matches the table above
- [x] Zero `ReturningLearnerCard` / `buildContinuityEntry` / `ModuleOverview` /
      bare-overview-URL references left in `src/` (guarded by tests)
- [x] README + stale code comments corrected

### Docs alignment

`README.md` route bullet and two stale code comments
(`HeroLensInteractivePreview.tsx`, `learn-metadata.ts`) updated to the current
model. Historical trackers (`PHASES.md`, `VISUAL_PHASES.md`,
`docs/UI_FIXES_PLAN.md`, `docs/HOMEPAGE_REDESIGN_TRACKER.md`) are left as dated
records of their era; **this tracker is the authoritative end-state**.




