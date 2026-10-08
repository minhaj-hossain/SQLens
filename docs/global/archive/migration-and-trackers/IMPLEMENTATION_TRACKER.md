# Implementation Progress Tracker: Prisma & Multi-Track Platform

> **Status Reference:**
> - `[ ]` = Pending / Not Started
> - `[/]` = In Progress
> - `[x]` = Completed & Verified by Test Gate
> - `[!]` = Blocked / Needs Review

---

## Quick Dashboard

| Phase | Description | Status | Tests Passing | Last Verified |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 0** | Immediate Track-Aware Chrome & Label Fixes | `[x]` | 806 / 806 | 2026-09-30 (Task 0.3 — Phase 0 complete) |
| **Phase 1** | Honest Snippet Labs & View Polymorphism | `[x]` | 815 / 815 | 2026-09-30 (Task 1.3 — Phase 1 complete) |
| **Phase 2** | Prisma Pedagogy Depth & Concept Expansion | `[x]` | 823 / 823 | 2026-10-01 (Task 2.2 — Phase 2 complete) |
| **Phase 3** | Homepage Redesign & Conversion Island | `[x]` | 837 / 837 | 2026-10-01 (Task 3.1 — Phase 3 complete) |
| **Phase 4** | Generic Multi-Track Scaling Architecture | `[x]` | 870 / 870 | 2026-10-01 (Task 4.2 — Phase 4 complete) |

---

## Detailed Task Breakdown

### Phase 0: Immediate Track-Aware Chrome & Label Fixes (P0)
- [x] **Task 0.1: Track-Aware Schema Modal in `UiChromeProvider`**
  - [x] Create `src/components/roadmap/PrismaSchemaModal.tsx` wrapping `PrismaErdVisualizer`.
  - [x] Update `src/components/providers/UiChromeProvider.tsx` to branch on `track === 'prisma'`.
  - [x] *Automated verification:* `tsc --noEmit` clean · gate test 5/5 · full suite 804/804. *(Manual dev-server click-through recommended: `/prisma` Database icon → ERD; `/sql` → SQL tables.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase9-prisma-surfaces.test.ts` ✅
- [x] **Task 0.2: Fix Hardcoded "57 Days" Labels Across 4 Files**
  - [x] `src/components/layout/Header.tsx:68` (dynamic aria-label via `meta.label` + `totalModules`).
  - [x] `src/components/ui/ResetProgressModal.tsx:134,166,173` (track-aware reset prompt, warning & scope-radio day range via `useTrackCurriculum()`; radio was stale "Days 1–38").
  - [x] `src/components/auth/AuthView.tsx:331` (track-neutral signup pitch — auth routes have no track prefix, so `useTrack()` there is always `sql`).
  - [x] `src/components/admin/AdminAnalyticsPanel.tsx:28,54,75,115,119,129` (counts from `ALL_MODULES.length`, matching the SQL-only analytics API; also fixed stale "38 curriculum days" copy).
  - [x] *Automated verification:* `tsc --noEmit` clean · full suite 804/804. *(Manual dev-server click-through recommended: `/prisma` header aria-label + reset modal; `/signup` copy; `/admin/analytics` labels.)*
  - *Gate Command:* `npx vitest run` ✅
- [x] **Task 0.3: Synchronize Playground Sidebar in Prisma Mode**
  - [x] `src/components/learning/Playground.tsx:457–485` (Prisma mode renders the seed schema's `User`/`Post` with `@id`/`@relation` badges, from the same AST as the ERD).
  - [x] `src/components/layout/Header.tsx:89` (terminal link → `/playground?mode=prisma` on the Prisma track; track-aware title/aria-label).
  - [x] `Playground.tsx` (reads `?mode=` on mount via `playgroundModeFromSearch`; param kept so refresh preserves the mode).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase9b gate 8/8 · full suite 806/806. *(Manual dev-server click-through recommended: `/prisma` terminal → Prisma-mode playground with seed sidebar; `/sql` → SQL playground unchanged.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase9b-prisma-playground.test.ts` ✅

---

### Phase 1: Honest Snippet Labs & View Polymorphism (P1)
- [x] **Task 1.1: Local Variable Binding Extractor**
  - [x] `extractLocalVariableBindings()` in `prisma-sql-generator.ts` — `const/let/var` literals (number incl. negative/decimal, `'...'`/`"..."` strings, booleans); computed values, template literals and objects/arrays keep the marker path.
  - [x] Merged into the translate-time seed (locals win over caller/demo variables) and threaded through `genFind`/`genCreate`/`genUpdate`/`genTransaction` + the `$transaction` branch.
  - [x] 4 new tests in `phase4-prisma-execution.test.ts` (extractor forms, plan's `const targetId = 2` case, string filter, end-to-end row id 2).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase4 gate 13/13 · full suite 810/810. *(Manual: playground `const targetId = 2;` + `where: { id: targetId }` → Lens shows `WHERE id = 2`.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase4-prisma-execution.test.ts` ✅
- [x] **Task 1.2: Polymorphic Console Output in `track-submit.ts`**
  - [x] `TrackSubmitOutcome` + `PrismaSubmitResult` extended with `displayMode?: ConsoleDisplayMode` (`'table' | 'terminal' | 'schema_diff' | 'type_preview'`) and `terminalOutput`; type re-exported from `track-submit`.
  - [x] `prisma-submit-pipeline.ts`: `snippetLabDisplay()` classifies labs — CLI tasks get deterministic simulated stdout (`prismaCliCommandIn` + `simulatePrismaCliOutput`, echo-the-command), schema.prisma labs a comment notice; the read-through reference rows are dropped for those (static failures stay plain, URL/Zod labs keep the dataset contract).
  - [x] New `TerminalOutput.tsx` card (caption: "Simulated CLI output — no shell ran in your browser") + `ResultsConsole` terminal branch + `PracticeTaskView` wiring (set from outcome, cleared on task switch & preview).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase5 gate 8→13 · phase7 passthrough assertions added · full suite 815/815. *(Manual: prisma-02 `npx prisma generate` lab → Check → terminal card, no reference rows; executable lab → unchanged grid.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase5-prisma-pipeline.test.ts` ✅
- [x] **Task 1.3: Clean Up Misleading Scaffolds**
  - [x] `prisma-02-setup-connection.ts:43–44` crossword clues → engineering prompts (`Execute npx prisma generate to compile the client` / `Verify the output build artifact`) + de-crossworded hint; 3 "Same proof" scaffolds (`:60,:91,:107`) → `-- Configuration and schema validation runs automatically against the engine.`
  - [x] `prisma-03-models-constraints.ts:95` enum-lab scaffold comment → the same honest line. *(Plan correction: `phase6-tasks.ts` needed **no change** — the target strings live only in the module files; scaffold comments aren't learner-visible on the Prisma track (the TS starter loads), so this is source-honesty hygiene.)*
  - [x] *Automated verification:* `tsc --noEmit` clean · phase6 gate 13/13 · full suite 815/815 · `verify:curriculum` pass · string sweep: zero `Same proof` / `still has to read this row` / Starts with `npx prisma` left. *(Flagged follow-up: 4 sibling proof-claim scaffolds left out of plan scope — `-- Prove the chain:` prisma-02:45, `-- Same column set…` / `-- The lookup the index exists for:` / `-- The blueprint has to survive this read:` in prisma-03.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase6-prisma-content.test.ts` ✅

---

### Phase 2: Deepening Prisma Pedagogy & Concept Coverage (P2)
- [x] **Task 2.1: Refactor `prismaTheory` & Author Rich Concept Steps**
  - [x] Placeholder step deprecated: `prismaTheory` no longer auto-fills `stepBreakdowns` (`FROM users exists` is extinct); both factories share `basePrismaTheory`, and new `richPrismaTheory({ … })` takes `mentalModel` + ≥3 genuine steps.
  - [x] `PrismaTheoryContent` gained `mentalModel?: string`; steps ride the already-typed `prisma.stepBreakdowns` (`PrismaStepBreakdown` with `visualData: sql_lens | type_preview`).
  - [x] **Renderer added (scope note):** `theory.prisma.*` had ZERO consumers — authored `targetHero`/steps were dead content, while the dummy SQL step was what learners saw. New `PrismaTheoryBlock.tsx` (`PrismaTheoryHero` + `PrismaTheorySteps`) wired into `ConceptLessonView`, guarded on `theory.prisma` (SQL track byte-identical).
  - [x] Day 2 (2 concepts), Day 3 (2), Day 12 (2) rewritten via `richPrismaTheory`: bespoke mental models + 4 steps each (call → SQL → type) with real `sql_lens`/`type_preview` snippets.
  - [x] *Automated verification:* `tsc --noEmit` clean · phase6 13→16 · full suite 818/818 · `verify:curriculum` pass · `taught-before-tested` 22/22. *(Manual dev-server recommended: `/prisma` Day 2 → hero + steps render, no placeholder; Day 5 → hero, no steps section; `/sql` lesson unchanged.)*
  - *Gate Command:* `npm run verify:curriculum` + `npx vitest run tests/content/taught-before-tested.test.ts` ✅
  *(Flagged follow-up: extend `richPrismaTheory` to the plan's remaining named modules — prisma-04/07/08/10, then 05/06/09/11/13/14; `liveDemoCode` stays unrendered.)*
- [x] **Task 2.2: Add Missing Production Concepts**
  - [x] **Client Extensions (`$extends`)** — new concept 3 on `prisma-13` (`client-extensions`); lab bans the deprecated `$use` and adds a `query`/`$allOperations` hook + a `model` method.
  - [x] **Raw SQL escape hatch** — new concept 3 on `prisma-14` (`raw-sql-escape-hatch`): `$queryRaw` tagged template + `Prisma.sql` composition; `$queryRawUnsafe` banned. *(Plan correction: `$use` did not exist and was not "replaced" — prisma-13 teaches error middleware, so `$extends` is an addition.)*
  - [x] **Aggregations (`groupBy` + `_count`)** — new concept 3 on `prisma-08` (`aggregating-grouping`): `groupBy({ by: ['name'], _count: true })` + ordering on the aggregate. *(Plan correction: no `categories` table exists in the seed universe → grouped on a real `users` column.)*
  - [x] **Cursor vs offset** — *(already shipped)*: the contrast is now **taught**, not just two labs — `prisma-08`'s pagination concept migrated to `richPrismaTheory` with a mental model + 4 steps (LIMIT/OFFSET vs keyed WHERE). No new labs needed.
  - [x] All three new concepts authored via `richPrismaTheory` (hero + mental model + 4 steps), honouring the 2.1 step contract; aggregation/extension/raw labs are honest read-through labs (engine-derived, never a hardcoded flag).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase8 gate (plan) green · phase6 16→21 · full suite 818→823. *(Manual dev-server recommended: `/prisma` Day 8 → Aggregating & Grouping; Day 13 → Client Extensions; Day 14 → Raw SQL Escape Hatch.)*
  - *Gate Command:* `npx vitest run tests/tracks/phase8-prisma-audit.test.ts` ✅

---

### Phase 3: Homepage Redesign & Conversion (P3)
- [x] **Task 3.1: Modern Homepage Hero & Interactive Lens Island**
  - [x] `HeroLensInteractivePreview.tsx` (client island): two sample tabs — the Prisma `findUnique + include` call and the raw-SQL `JOIN` — over ONE seeded engine, lazy-loaded via `import('@/lib/sql-engine/executor')` + `import('@/lib/prisma-playground')` inside the run (the homepage stays a shell on the server; the prerender never executes anything).
  - [x] The lens shows the REAL run: every statement with its label/role, row counts and `executionTimeMs`, then the call's own result peek (`+N more rows`). Run-id guard discards stale async results when tabs switch mid-run; staggered `lens-step-in` entrance (reduced-motion safe).
  - [x] Samples + derivations live in `src/lib/homepage.ts` (`buildPrismaSampleRun`, `buildSqlSampleRun`) so the engine behaviour is testable without a DOM.
  - [x] Returning-learner continuity card (`Resume Day 14: Nested Relations [80% Complete] ->`): reads THIS user's storage key per track (`loadUserState(userId, track)`), resumes at `deriveLastPosition` (first incomplete concept — never the stale `currentModuleId`), percent = finished task units via `getModuleProgressCounts`; hidden for first-time visitors AND absent from server markup (effect-only read); re-reads on `storage`/`focus`.
  - [x] Feature badges (Zero setup · Typed by design · ERDs on demand · SQL Lens) under the hero headline "Master the Data Layer: From Bare-Metal SQL to Type-Safe Prisma ORM."; `TrackSelector` stays a server component (headline/badges/cards ship as HTML).
  - [x] *Automated verification:* `tsc --noEmit` clean · new phase3 gates 14/14 (lens engine run incl. the honest-failure case; continuity truth; SSR render) · full suite 823→837 (74 files) · `npm run build` green (86 static pages, zero errors). *(Manual dev-server recommended: `/` — lens auto-runs the Prisma tab, tab switch re-runs, the card appears only with stored progress.)*
  - *Gate Command:* `npm run build` ✅
  - *(Infra note: `vitest.config.ts` gained `resolve.alias '@' -> src` — no test could previously load a component whose own imports used the Next alias.)*

---

### Phase 4: Pluggable Multi-Track Architectural Refactor (P4)
- [x] **Task 4.1: Generalize `TrackDefinition` & Registry**
  - [x] Refactor `TRACK_IDS` and create dictionary-based `TRACK_REGISTRY`.
  - [x] Eliminate ternary operators in `src/tracks/registry.ts`.
  - [x] `src/types/track.ts`: `TRACK_IDS = ['sql', 'prisma'] as const` (a real literal tuple; was `readonly TrackId[]`, where `as const` did nothing); `BuiltinTrackId = (typeof TRACK_IDS)[number]`; `TrackId` kept as an alias so all ~20 import sites compile unchanged; `isTrackId` derived from the tuple (identical results, incl. junk strings).
  - [x] `src/tracks/registry.ts`: `TrackDefinition` (`meta` / `modules` / `getModuleById` / `milestones` / `moduleIdPattern`) + `TRACK_REGISTRY: Record<BuiltinTrackId, TrackDefinition>` — adding an id to `TRACK_IDS` without a definition is now a compile error, so the ternary cascade cannot come back. SQL entry holds `ALL_MODULES` / `ROADMAP_MILESTONES` / `TRACK_META.sql` BY REFERENCE (identity, never a copy); the 3 ternary getters are dictionary lookups; `trackForModuleId` classifies from the registered patterns (historical semantics preserved exactly: `prisma-xyz` → prisma, junk/legacy → sql); `assertNoModuleIdCollision` reads the registry; new `assertTrackRegistry()` invariant collector (metadata identity, `basePath`, resolvable `initialModuleId`, exactly-one-track pattern ownership).
  - [x] *Scope corrections (recorded at execution time):* (1) plan premise "Change `type TrackId = string`" was stale — `TrackId` was already `'sql' | 'prisma'`; widening to `string` would have degraded the exhaustive `Record` maps (`TRACK_META`, storage keys), so the union is now DERIVED from the tuple instead. (2) The plan's "engine adapter" registration is **descoped**: the only grading seam is `submitForTask` (`src/lib/track-submit.ts:115`), which routes on task content (`task.prisma`), not on track — a consumerless registry field would be dead abstraction; revisit when a 3rd track needs a different executor.
  - [x] New gate file `tests/tracks/phase10-registry.test.ts` (13 tests): entry-per-`TRACK_IDS` completeness, metadata identity, 71-id module lookup parity sweep (57 SQL + 14 Prisma, by identity), `assertTrackRegistry() === []`, pattern ownership (exactly one track per id), classifier parity + 71-id round-trip, and a static no-branch guard pinning the acceptance criterion (comments stripped before matching).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase10 13/13 · phase1 7/7 · phase2 8/8 · phase3-track-progress 23/23 · full suite 850/850 (75 files) · `npm run build` exit 0 (86/86 static pages). All 6 registry consumers in `src/` compiled unchanged — no consumer edits were needed.
  - *Gate Command:* `npx vitest run tests/tracks/phase10-registry.test.ts tests/tracks/phase1-foundation.test.ts tests/tracks/phase2-routing.test.ts` ✅
- [x] **Task 4.2: Shared Route View Wrappers**
  - [x] Extract `TrackDayLayoutView.tsx`.
  - [x] Make `sql` and `prisma` layout files thin delegates to prevent route duplication.
  - [x] `src/components/learn/TrackDayLayoutView.tsx` (new): the two 82-line route layouts were **byte-identical** (identical SHA-256), so the whole day boundary moved verbatim into one client view — dayId→404, the executor reset boundary (`[dayId, conceptId]`), locked-day enforcement and the breadcrumb chrome. The `track` prop is authoritative: `meta` / `modules` / `getModuleById` come from `TRACK_REGISTRY` (4.1), dropping `useTrack()` + `useTrackCurriculum()`; the reset boundary still uses the pathname-derived `useTrackConceptId()`. New exported pure seam `resolveDayLayoutState(mod, modules, pathname, track, userState)` owns locked/overview/redirectUrl, so the per-track redirect decision is testable without a DOM (SSR never runs effects).
  - [x] Both route layouts are now 15-line delegates that differ ONLY in their `track` literal, kept `'use client'` (component boundary unchanged — a pure move).
  - [x] New gate file `tests/tracks/phase11-day-layout-view.test.tsx` (20 tests): SSR render for both tracks (`Day 1 of 57` / `Day 1 of 14`), cross-track id-isolation 404s, locked deep link → empty render, locked OVERVIEW still renders, completion-record bypass; pure `resolveDayLayoutState` per-track redirect targets (`/sql/…` vs `/prisma/…`); static guards — delegates contain none of the day-boundary markers, the shared view is the positive owner of them, delegate byte-parity modulo the literal, a route-inventory tripwire pinning exactly two learn-day layouts, and frozen canonical contracts (live `sitemap()` emits both track surfaces + all 71 module overviews; legacy `/learn*` redirects still declared verbatim).
  - [x] *Automated verification:* `tsc --noEmit` clean · phase11 20/20 · phase1 7/7 · phase2 8/8 · full suite 870/870 (76 files) · `npm run build` exit 0 (86/86 static pages, zero errors) · `npm run audit:all` 0 blocking (17 advisory, pre-existing).
  - *Gate Command:* `npx vitest run tests/tracks/phase11-day-layout-view.test.tsx tests/tracks/phase1-foundation.test.ts tests/tracks/phase2-routing.test.ts` ✅ · `npm run audit:all` ✅

---

## Log of Completed Work

| Timestamp | Task ID | Description | Commit / Verification Hash |
| :--- | :---: | :--- | :--- |
| *Pending* | - | Initial plan and tracker setup | Initial baseline 804/804 tests green |
| 2026-09-30 19:23 | 0.1 | Track-aware schema modal: created `PrismaSchemaModal.tsx` (ERD + raw source, seed schema) and `UiChromeProvider` now branches on `useTrack()` | `c4020ec` · `tsc --noEmit` clean · phase9 gate 5/5 · full suite 804/804 |
| 2026-09-30 19:36 | 0.2 | Track-aware labels: Header pill aria-label (57/14 by track), ResetProgressModal copy (SQL/Prisma) + scope-radio day range (stale 1–38 fixed), track-neutral auth pitch, admin analytics counts from `ALL_MODULES.length` (stale "38" fixed) | `cf7ecdb` · `0f8f491` · `79ca3aa` · `54d2a7c` · `ebee69a` (5 atomic commits) · `tsc --noEmit` clean · full suite 804/804 |
| 2026-09-30 21:06 | 0.3 | Prisma playground sync: seed-model sidebar (User/Post + @id/@relation badges from the ERD AST), track-routed header terminal link, `?mode=prisma` on load via `playgroundModeFromSearch`; phase9b gate coverage added (6→8) | `3dbb604` · `1815f0a` · `66eebf1` · `461967a` (4 commits) · `tsc --noEmit` clean · phase9b 8/8 · full suite 806/806 |
| 2026-09-30 21:34 | 1.1 | Local variable bindings: `extractLocalVariableBindings()` (const/let/var literals — numbers incl. negative, quoted strings, booleans) merged into the translate-time seed with locals-first precedence, threaded through all dispatch paths; 4 phase4 tests added (9→13) | `a5796a3` · `724af27` (2 commits) · `tsc --noEmit` clean · phase4 13/13 · full suite 810/810 |
| 2026-09-30 22:11 | 1.2 | Polymorphic console output: `ConsoleDisplayMode` + `terminalOutput` on the submit outcome; `prismaCliCommandIn` / `isPrismaSchemaLab` / `simulatePrismaCliOutput` / `snippetLabDisplay` helpers; CLI & schema.prisma labs drop the authored reference rows (static fails stay plain); new `TerminalOutput` card + ResultsConsole branch + PracticeTaskView wiring; tests 810→815 | `8c90458` · `cf8311d` · `c752c58` · `b789507` (4 commits) · `tsc --noEmit` clean · phase5 13/13 · phase7 15/15 · full suite 815/815 |
| 2026-09-30 22:24 | 1.3 | Scaffold honesty: prisma-02 crossword clues → engineering prompts + honest hint, 3 "Same proof" scaffolds → engine-validation comment; prisma-03 enum scaffold comment fixed; `phase6-tasks.ts` needed no change (plan file-list correction); content-only — no tests added | `70591bd` · `5b9dda4` (2 commits) · `tsc --noEmit` clean · phase6 13/13 · full suite 815/815 |
| 2026-09-30 23:53 | 2.1 | Rich Prisma theory: `richPrismaTheory` factory (mentalModel + ≥3 genuine steps; placeholder step deleted globally), `PrismaTheoryContent.mentalModel` field, new `PrismaTheoryBlock` renderer (hero + steps were previously dead content), Days 2/3/12 rewritten (6 concepts × 4 steps w/ sql_lens + type_preview); invariant tests added (phase6 13→16); tests 815→818 | `57b35aa` · `6032879` · `b3a9411` · `204be75` · `2727a14` · `0832b68` (6 commits) · `tsc --noEmit` clean · phase6 16/16 · full suite 818/818 · `verify:curriculum` pass |
| 2026-10-01 00:19 | 2.2 | Production concepts: `$extends` client extensions (prisma-13 c3, bans `$use`), `$queryRaw`/`Prisma.sql` escape hatch (prisma-14 c3), `groupBy`/`_count` aggregation (prisma-08 c3), and rich cursor-vs-offset pagination theory (prisma-08 c2) — all via `richPrismaTheory`; invariant tests added (phase6 16→21); tests 818→823 | `ca830a9` · `1e64bc2` · `c6b25f7` · `1d57fa5` (4 commits) · `tsc --noEmit` clean · phase8 green · full suite 823/823 |
| 2026-10-01 01:10 | 3.1 | Homepage redesign: hero headline + live SQL Lens island (`HeroLensInteractivePreview.tsx`; lazy engine/playground imports, real statement labels/row counts/`executionTimeMs`, result peek, stale-run guard, `lens-step-in` animation) over `src/lib/homepage.ts` (both samples + continuity derivations), returning-learner card (own storage key per track, `deriveLastPosition`, task-unit %, server-silent), four feature badges; `vitest.config.ts` alias so components load in tests; new phase3 tests 14 (823→837), build green | `a1a3ecd` · `194994c` (2 commits) · `tsc --noEmit` clean · full suite 837/837 (74 files) · `npm run build` exit 0 (86 static pages) |
| 2026-10-01 01:26 | 4.1 | Multi-track registry generalization: `TRACK_IDS` const tuple + derived `BuiltinTrackId` (`TrackId` union KEPT — plan premise stale; no consumer edits), `TRACK_REGISTRY` `TrackDefinition` dictionary (meta/modules/by-id lookup/milestones/moduleIdPattern; SQL identity by reference), pattern-driven `trackForModuleId`, `assertNoModuleIdCollision` from registry, new `assertTrackRegistry()` invariants; engine-adapter field descoped (the only grading seam `submitForTask` routes on task content, not track); new phase10 gate 13 tests (837→850) | `0e5d2e0` · `197e2ab` · `5903bfb` (3 commits) · `tsc --noEmit` clean · phase10 13/13 · phase1 7/7 · phase2 8/8 · phase3-track-progress 23/23 · full suite 850/850 (75 files) · `npm run build` exit 0 (86/86 static pages) |
| 2026-10-01 11:42 | 4.2 | Shared route view wrappers: the two byte-identical day layouts collapsed into `TrackDayLayoutView` (authoritative `track` prop → `TRACK_REGISTRY`; pure `resolveDayLayoutState` seam for locked/overview/per-track redirect) + 15-line parity-checked delegates; new phase11 gate 20 tests (SSR both tracks, lock/404 behavior, static ownership + byte-parity guards, route-inventory tripwire, live sitemap & redirect-contract asserts) (850→870); **Phase 4 complete — the multi-track plan is fully delivered** | `aa9a97d` · `2b7a751` (2 commits) · `tsc --noEmit` clean · phase11 20/20 · phase1 7/7 · phase2 8/8 · full suite 870/870 (76 files) · `npm run build` exit 0 (86/86 static pages) · `audit:all` 0 blocking |
