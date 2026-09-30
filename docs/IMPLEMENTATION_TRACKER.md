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
| **Phase 1** | Honest Snippet Labs & View Polymorphism | `[ ]` | - | - |
| **Phase 2** | Prisma Pedagogy Depth & Concept Expansion | `[ ]` | - | - |
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
- [ ] **Task 1.1: Local Variable Binding Extractor**
  - [ ] Add `extractLocalVariableBindings()` to `src/lib/prisma-engine/prisma-sql-generator.ts`.
  - [ ] Merge extracted variables into `SeedContext.variables`.
  - [ ] Add unit tests for variable assignment patterns.
  - *Gate Command:* `npx vitest run tests/tracks/phase4-prisma-execution.test.ts`
- [ ] **Task 1.2: Polymorphic Console Output in `track-submit.ts`**
  - [ ] Add `displayMode?: 'table' | 'terminal' | 'schema_diff'` to `TrackSubmitOutcome`.
  - [ ] Update `prisma-submit-pipeline.ts` to return simulated CLI stdout for CLI tasks.
  - [ ] Update `ResultsConsole.tsx` to render terminal/CLI card for non-tabular tasks.
  - *Gate Command:* `npx vitest run tests/tracks/phase5-prisma-pipeline.test.ts`
- [ ] **Task 1.3: Clean Up Misleading Scaffolds**
  - [ ] Replace `-- Same proof:` and `-- The enum still has to read this row:` comments.
  - [ ] Replace crossword clues in `prisma-02-setup-connection.ts` with real engineering prompts.
  - *Gate Command:* `npx vitest run tests/tracks/phase6-prisma-content.test.ts`

---

### Phase 2: Deepening Prisma Pedagogy & Concept Coverage (P2)
- [ ] **Task 2.1: Refactor `prismaTheory` & Author Rich Concept Steps**
  - [ ] Deprecate the single dummy step in `prismaTheory`.
  - [ ] Author 3–4 step breakdowns for Day 2 (Setup), Day 3 (Models & Enums), and Day 12 (Transactions).
  - [ ] Ensure every concept includes AST breakdown, generated SQL, and TypeScript return type.
  - *Gate Command:* `npm run verify:curriculum`
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
