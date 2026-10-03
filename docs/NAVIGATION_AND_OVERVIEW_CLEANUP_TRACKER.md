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
| **Phase 3** | Fix task page refresh behavior (prevent premature locked redirect while auth/progress hydrates) | Pending |
| **Phase 4** | Remove `/learn/[dayId]` overview page & `ModuleOverview.tsx`, redirect day URLs directly to theory | Pending |
| **Phase 5** | Clean up all remaining overview redirects (`TheoryView`, `ChallengeView`, `CompleteView`, `use-learning-navigation`) | Pending |
| **Phase 6** | Verification, regression testing, and test suite alignment | Pending |
