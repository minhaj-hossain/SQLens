# User Journey & Flow Improvements: Implementation Plan & Tracker

**Date:** October 9, 2026  
**Status:** In Progress / Pending Implementation  
**Location:** `docs/global/USER_JOURNEY_IMPLEMENTATION_PLAN_AND_TRACKER.md`  
**Reference Audit:** Artifact [`user_journey_audit.md`](file:///C:/Users/mjp20/.gemini/antigravity-ide/brain/77444c16-aa2f-40bc-9c60-059e8c30cf5f/user_journey_audit.md)

---

## 1. Vision & Objectives

Eliminate critical user flow disconnects, disorienting navigation traps, and track-leakage bugs in SQLens / Click without redesigning unrelated features or breaking existing database and testing invariants.

### Key Goals
1. **True Track Isolation & Completion Fidelity:** Ensure the Prisma track (14 Days) calculates milestone progress, unlock gates, and completion celebrations using Prisma curriculum data rather than SQL defaults.
2. **Context-Preserving Route Navigation:** Prevent Auth (`/signin`, `/signup`) and Playground (`/playground`) from dumping users to `/`, preserving their active task and track.
3. **Robust Resumption (`deriveLastPosition`):** Ensure deep-link resume routes (`/sql/learn`, `/prisma/learn`) compute real unlock progress instead of relying on stale stored IDs.
4. **Hydration Continuity:** Replace blank screen flickers (`return null`) with theme-consistent loading skeletons and spinners during progress readiness checks.
5. **Accurate Step-Chain Back Traversal:** Fix back transitions between Challenges, Practice tasks, and Theory lessons.
6. **Returning Learner Resume Widget:** Deliver the resume widget on the homepage (`/`) for fast single-click resumption.

---

## 2. Invariants & Guardrails

- **Zero Content Breakage:** Preserve all 57 SQL days, 14 Prisma days, 200+ practice tasks, and custom validators.
- **Engine Integrity:** Do not touch `src/lib/sql-engine/` or `src/lib/prisma-engine/` execution pipelines.
- **Test Integrity:** All Vitest suites, CI checks, and curriculum verification scripts must pass.
- **Design Token Discipline:** Adhere to existing theme tokens (`bg-surface`, `bg-surface-2`, `text-func`, `border-border`, etc.).

---

## 3. Implementation Phases & Tracker

### Overview Matrix

| Phase | Description | Priority | Files Touched | Status |
|---|---|---|---|---|
| **Phase 1** | Track-Aware Module Completion & Prisma Gating | **P0** | `src/components/learning/ModuleCompletionView.tsx` | ✅ Completed |
| **Phase 2** | Dynamic Resume Calculation on Track Entry | **P0** | `src/app/(app)/sql/learn/page.tsx`, `src/app/(app)/prisma/learn/page.tsx` | ✅ Completed |
| **Phase 3** | Route Context Preservation (Auth & Playground) | **P0 / P1** | `src/components/auth/AuthScreen.tsx`, `src/components/auth/AuthView.tsx`, `src/app/playground/page.tsx`, `src/components/learning/Playground.tsx` | ✅ Completed |
| **Phase 4** | Exact Step-Chain Challenge Back Navigation | **P1** | `src/components/learn/ChallengeView.tsx` | 🔲 Not Started |
| **Phase 5** | Hydration Shells & Skeleton Fallbacks | **P1** | `src/components/learn/TrackDayLayoutView.tsx`, `src/components/learn/PracticeView.tsx` | 🔲 Not Started |
| **Phase 6** | Homepage Returning Learner Widget & Copy Polish | **P1 / P2** | `src/components/home/ClickHomepage.tsx`, `src/app/not-found.tsx`, `src/components/learning/ConceptLessonView.tsx`, `src/components/learning/PracticeTaskView.tsx` | 🔲 Not Started |
| **Phase 7** | End-to-End Journey QA & Regression Testing | **Gate** | CI scripts, Vitest suite, manual flow check | 🔲 Not Started |

---

### Detailed Task Tracker

#### Phase 1: Track-Aware Module Completion & Prisma Gating (P0)
Fixes the hardcoded SQL imports in the completion celebration view that broke Prisma track progress.
- [x] **1.1** Replace static `ALL_MODULES` and `ROADMAP_MILESTONES` imports with dynamic `useTrackCurriculum()` in [ModuleCompletionView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learning/ModuleCompletionView.tsx).
- [x] **1.2** Dynamically look up current milestone from `milestones` array by `module.milestoneId` with fallback to `milestones[0]`.
- [x] **1.3** Pass the track's own `modules` to `getModuleUnlockStatus(nextModule, modules, userState)` instead of SQL modules.
- [x] **1.4** Update completion banner copy from hardcoded "57 days of SQLens" to dynamic `{modules.length} days of {meta.label}`.
- [x] **1.5** Add safe navigation check on `nextModule.concepts?.[0]?.id` when rendering "Next Module" button.

#### Phase 2: Dynamic Resume Calculation on Track Entry (P0)
Prevents `/sql/learn` and `/prisma/learn` from redirecting learners to completed days based on stale `currentModuleId`.
- [x] **2.1** In [src/app/(app)/sql/learn/page.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/app/(app)/sql/learn/page.tsx), import `deriveLastPosition` from `@/lib/progress/unlock-calculator`.
- [x] **2.2** Calculate the true active position using `deriveLastPosition(modules, userState)` and redirect to `position.moduleId` / `position.conceptId`.
- [x] **2.3** Apply the identical fix in [src/app/(app)/prisma/learn/page.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/app/(app)/prisma/learn/page.tsx).

#### Phase 3: Route Context Preservation for Auth & Playground (P0 / P1)
Ensures users returning from sign-in or closing the playground return to their active lesson rather than being kicked to `/`.
- [x] **3.1** In [src/components/auth/AuthScreen.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/auth/AuthScreen.tsx), read `redirect` or `from` query parameter via `useSearchParams()`.
- [x] **3.2** Update `handleBack` to navigate to `returnUrl` (defaulting to current track or `/` only if no return target).
- [x] **3.3** Pass `returnUrl` to `AuthView` so cancel / back arrow and successful login/signup resolve to `returnUrl`.
- [x] **3.4** Update Header "Sign In" link in [Header.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/layout/Header.tsx) to attach `?from=${encodeURIComponent(pathname)}`.
- [x] **3.5** In [src/app/playground/page.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/app/playground/page.tsx), read `from` search param or use browser history fallback (`router.back()`) when closing Playground.

#### Phase 4: Exact Step-Chain Challenge Back Navigation (P1)
Aligns Challenge "Back" navigation with the step-chain contract.
- [ ] **4.1** In [src/components/learn/ChallengeView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learn/ChallengeView.tsx), update `onBackToPractice`.
- [ ] **4.2** Determine the last concept and its total tasks (`lastConcept.tasks.length`).
- [ ] **4.3** Route to `task = Math.max(0, lastConcept.tasks.length - 1)` instead of index `0`.

#### Phase 5: Hydration Shells & Skeleton Fallbacks (P1)
Eliminates blank dark flickers during progress readiness evaluation.
- [ ] **5.1** In [src/components/learn/TrackDayLayoutView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learn/TrackDayLayoutView.tsx), replace `if (!isProgressReady) return null;` with a styled breadcrumb shell and skeleton loader.
- [ ] **5.2** In [src/components/learn/PracticeView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learn/PracticeView.tsx), provide a skeleton fallback in `<Suspense fallback={<PracticeSkeleton />}>`.
- [ ] **5.3** Ensure skeletons match dark theme tokens (`bg-surface`, `bg-surface-2`, `animate-pulse`).

#### Phase 6: Homepage Returning Learner Widget & Copy Polish (P1 / P2)
Restores missing homepage resume widget and polishes misleading button labels.
- [ ] **6.1** In [src/components/home/ClickHomepage.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/home/ClickHomepage.tsx), render a returning learner resume card above the track grid if user has saved progress.
- [ ] **6.2** Include active track badge, current day title, completion percentage, and a direct "Resume Learning" button.
- [ ] **6.3** In [src/components/learning/ConceptLessonView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learning/ConceptLessonView.tsx), set button label to "Complete Concept & Continue" when `concept.tasks.length === 0`.
- [ ] **6.4** In [src/components/learning/PracticeTaskView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learning/PracticeTaskView.tsx), check `concept.module?.challenge` (or parent module) before setting label to "Module Challenge" vs "Complete Module".
- [ ] **6.5** In [src/app/not-found.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/app/not-found.tsx), update copy to link directly to `/sql` and `/prisma` learning paths.

#### Phase 7: Verification & QA Testing (Gate)
- [ ] **7.1** Run `npm run lint` (TypeScript type check across entire project).
- [ ] **7.2** Run `npm test` (All Vitest suites).
- [ ] **7.3** Run `npm run verify:curriculum` and `npm run test:module-order`.
- [ ] **7.4** Manual walk-through of the complete journey:
  - Homepage → Track Selection → Theory → Practice → Challenge → Module Complete → Next Module.
  - Test Auth sign-in return loop from inside a lesson.
  - Test Playground open/close from inside a lesson.
  - Test Prisma completion celebration with 14-day milestones.

---

## 4. Verification Protocol

```bash
# 1. Typecheck & Lint
npm run lint

# 2. Automated Test Suites
npm test

# 3. Curriculum Integrity Audit
npm run verify:curriculum
npm run test:module-order

# 4. Engine & Equivalence Check
npm run test:engine
```

---

## 5. Changelog & Progress Log

- **2026-10-09:** Initial Journey Audit completed (Artifact: `user_journey_audit.md`). Implementation Plan and Tracker created in `docs/global/USER_JOURNEY_IMPLEMENTATION_PLAN_AND_TRACKER.md`.
- **2026-10-09:** Phase 1 implemented & committed (`b625106`): Track-aware module completion & Prisma milestones.
- **2026-10-09:** Phase 2 implemented & committed (`a5584e5`): Dynamic resume calculation on `/sql/learn` and `/prisma/learn`.
- **2026-10-09:** Phase 3 implemented: Route context preservation across Auth transitions and Playground modal/page exits.
