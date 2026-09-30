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
| **Phase 2** | Prisma Pedagogy Depth & Concept Expansion | `[/]` | 818 / 818 | 2026-09-30 (Task 2.1) |
| **Phase 3** | Homepage Redesign & Conversion Island | `[ ]` | - | - |
| **Phase 4** | Generic Multi-Track Scaling Architecture | `[ ]` | - | - |

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
- [ ] **Task 2.2: Add Missing Production Concepts**
  - [ ] Prisma Client Extensions (`prisma.$extends`).
  - [ ] Raw SQL escape hatch (`$queryRaw`, `$executeRaw`).
  - [ ] Aggregations (`groupBy`, `_avg`, `_count`).
  - [ ] Cursor-based pagination vs offset pagination.
  - *Gate Command:* `npx vitest run tests/tracks/phase8-prisma-audit.test.ts`

---

### Phase 3: Homepage Redesign & Conversion (P3)
- [ ] **Task 3.1: Modern Homepage Hero & Interactive Lens Island**
  - [ ] Create `HeroLensInteractivePreview.tsx` with live SQL lens interactive switcher.
  - [ ] Add returning learner continuity card (`Continue Day X [progress%] ->`).
  - [ ] Add responsive grid with modern styling tokens and feature badges.
  - *Gate Command:* `npm run build`

---

### Phase 4: Pluggable Multi-Track Architectural Refactor (P4)
- [ ] **Task 4.1: Generalize `TrackDefinition` & Registry**
  - [ ] Refactor `TRACK_IDS` and create dictionary-based `TRACK_REGISTRY`.
  - [ ] Eliminate ternary operators in `src/tracks/registry.ts`.
- [ ] **Task 4.2: Shared Route View Wrappers**
  - [ ] Extract `TrackDayLayoutView.tsx`.
  - [ ] Make `sql` and `prisma` layout files thin delegates to prevent route duplication.
  - *Gate Command:* `npm run audit:all`

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
