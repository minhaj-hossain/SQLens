# PrismaLens & Multi-Track Platform: Comprehensive Implementation Plan

> **Target Architecture:** Scalable, pluggable multi-track learning system (SQL + Prisma + Future Tracks).  
> **Standard:** Zero regression on existing 804 test cases, clean UX isolation, honest pedagogy.  
> **Estimated Total Effort:** 18–26 Engineering Hours across 5 Structured Phases.

---

## Agent Usage & Best Practices (Read Before Executing)

When using AI coding assistants (like Antigravity / Claude / Cursor) to execute this plan, follow these battle-tested rules to prevent hallucination loops, broken builds, or bloated contexts:

1. **One Task per Prompt (Atomic Execution):** Never ask the agent to "do Phase 0 and Phase 1 together". Request one specific Sub-Task at a time (e.g., `Task 0.1: Track-Aware Schema Modal`).
2. **Context Pinning:** In your prompt, explicitly reference the relevant files using markdown links (e.g., `Update src/components/layout/Header.tsx`).
3. **Verify Before Moving On:** After the agent completes a step, immediately require a test run (`npx vitest run <relevant-test>`). Never proceed to the next task if tests fail.
4. **Git Commit Checkpoint per Task:** Commit after each passing sub-task with the ID in the message:
   ```bash
   git add . && git commit -m "feat(p0.1): make schema modal track-aware for prisma"
   ```
   If an agent goes into a loop or breaks types, you can simply `git reset --hard HEAD` and re-prompt cleanly.
5. **No Blind Dependency Installs:** The agent must never install new npm packages unless explicitly instructed in this specification.

---

## Phase 0: Immediate Track-Aware Chrome & Label Fixes (P0)
**Goal:** Fix user-facing chrome bugs where the Prisma track still shows SQL tables, labels, or modals.  
**Estimated Time:** 2 – 3 Hours  
**Risk Level:** Very Low (No core routing or engine alterations).

### Task 0.1: Track-Aware Schema Modal in `UiChromeProvider`
- **Files to Modify:**
  - `src/components/providers/UiChromeProvider.tsx`
  - `src/components/roadmap/SchemaModal.tsx`
  - New Component: `src/components/roadmap/PrismaSchemaModal.tsx` (or wrap `PrismaErdVisualizer`)
- **Instructions:**
  1. Inspect `UiChromeProvider.tsx`. Notice `useTrack()` is already present in the provider.
  2. Create `src/components/roadmap/PrismaSchemaModal.tsx` wrapping `PrismaErdVisualizer` inside the modal dialog container with dark glassmorphic styling matching `SchemaModal.tsx`.
  3. In `UiChromeProvider.tsx`, dynamically render:
     - `track === 'prisma'` $\rightarrow$ `<PrismaSchemaModal isOpen={isSchemaModalOpen} onClose={closeSchema} />`
     - Otherwise $\rightarrow$ `<SchemaModal isOpen={isSchemaModalOpen} onClose={closeSchema} />`
- **Verification Gate:**
  - Open `/sql`, click the Database icon in the Header $\rightarrow$ renders SQL tables (`products`, `categories`).
  - Open `/prisma`, click the Database icon $\rightarrow$ renders Prisma ERD (`User`, `Post`).
  - Run: `npx vitest run tests/tracks/phase9-prisma-surfaces.test.ts`

### Task 0.2: Fix Hardcoded "57 Days" Labels Across 4 Files
- **Files to Modify:**
  - `src/components/layout/Header.tsx` (line 68)
  - `src/components/ui/ResetProgressModal.tsx` (lines 166, 173)
  - `src/components/auth/AuthView.tsx` (line 331)
  - `src/components/admin/AdminAnalyticsPanel.tsx` (lines 28, 75, 119, 129)
- **Instructions:**
  1. In `Header.tsx`: Use `meta.label` and `totalModules` in the `aria-label`:
     ```tsx
     aria-label={`Curriculum progress: ${completedCount} out of ${totalModules} ${meta.label} Days completed`}
     ```
  2. In `ResetProgressModal.tsx`: Read current track via `useTrack()`. Change reset notice to:
     ```tsx
     This will reset all ${totalModules} ${meta.label} days, task submissions, and unlock times.
     ```
     Change warning banner from `Saved SQL solutions will be cleared` to `Saved ${meta.label} solutions will be cleared`.
  3. In `AuthView.tsx`: Change static `57 Days of hands-on SQL` to track-aware pitch or generic `hands-on data engineering`.
  4. In `AdminAnalyticsPanel.tsx`: Compute dynamic module count from `ALL_MODULES.length + PRISMA_MODULES.length` or add a track selector dropdown.
- **Verification Gate:**
  - Run: `npx vitest run` (ensure all tests pass).

### Task 0.3: Synchronize Playground Sidebar in Prisma Mode
- **Files to Modify:**
  - `src/components/learning/Playground.tsx` (lines 457–485)
- **Instructions:**
  1. Locate the Schema Sidebar in `Playground.tsx`.
  2. When `mode === 'prisma'`, do not map over `DATABASE_SCHEMAS`. Instead, parse `PRISMA_SEED_SCHEMA` (or use `prismaPlaygroundSchemaSource()`) and render the models `User` and `Post` with their scalar fields, types, `@id`, and `@relation` badges.
  3. When `mode === 'sql'`, retain the Northwind tables (`products`, `categories`, etc.).
  4. In the Header terminal link (`Header.tsx:89`), update the link:
     ```tsx
     href={track === 'prisma' ? '/playground?mode=prisma' : '/playground'}
     ```
  5. In `Playground.tsx`, read `useSearchParams()` on mount so `?mode=prisma` automatically sets `setMode('prisma')`.
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase9b-prisma-playground.test.ts`

---

## Phase 1: Honest Snippet Labs & View Polymorphism (P1)
**Goal:** Stop displaying disconnected SQL rows (e.g. Alex's user record) when learners edit a schema or CLI command.  
**Estimated Time:** 4 – 5 Hours  
**Risk Level:** Medium (Modifies submit pipeline response shape).

### Task 1.1: Add Local Variable Binding Extractor (Prevent Transpiler Brittleness)
- **Files to Modify:**
  - `src/lib/prisma-engine/prisma-sql-generator.ts`
  - `tests/tracks/phase4-prisma-execution.test.ts`
- **Instructions:**
  1. Add `extractLocalVariableBindings(code: string): Record<string, unknown>` to scan for `const/let/var x = 123` or `'string'` or `true/false`.
  2. In `generatePrismaSql()`, merge extracted bindings with `options.seed.variables`.
  3. Add test cases in `phase4-prisma-execution.test.ts` for:
     ```typescript
     const targetId = 2;
     await prisma.user.findUnique({ where: { id: targetId } });
     ```
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase4-prisma-execution.test.ts`

### Task 1.2: Polymorphic Console Output Contract in `track-submit.ts`
- **Files to Modify:**
  - `src/lib/track-submit.ts`
  - `src/lib/prisma-engine/prisma-submit-pipeline.ts`
  - `src/components/learning/ResultsConsole.tsx`
- **Instructions:**
  1. Extend `TrackSubmitOutcome` with:
     ```typescript
     export type ConsoleDisplayMode = 'table' | 'terminal' | 'schema_diff' | 'type_preview';
     displayMode?: ConsoleDisplayMode;
     terminalOutput?: string;
     ```
  2. In `prisma-submit-pipeline.ts`, when `!gen.ok` (snippet labs):
     - For CLI tasks (e.g. `npx prisma generate`): Set `displayMode: 'terminal'` and return a simulated formatted CLI output:
       ```
       $ npx prisma generate
       Environment variables loaded from .env
       Prisma schema loaded from prisma/schema.prisma
       ✔ Generated Prisma Client (v7.0.0) in 34ms
       ```
     - For `schema.prisma` tasks: Set `displayMode: 'terminal'` or schema validation notice instead of returning the `solutionSql` rows in `result`.
  3. Update `ResultsConsole.tsx` to conditionally render `<TerminalOutput>` when `displayMode === 'terminal'`.
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase5-prisma-pipeline.test.ts`
  - Run: `npx vitest run tests/tracks/phase7-prisma-ui-wiring.test.ts`

### Task 1.3: Clean Up Misleading Scaffolds in Prisma Curriculum
- **Files to Modify:**
  - `src/content/prisma/phase6-tasks.ts`
  - `src/content/prisma/modules/prisma-02-setup-connection.ts`
  - `src/content/prisma/modules/prisma-03-models-constraints.ts`
- **Instructions:**
  1. Replace `-- Same proof:` and `-- The enum still has to read this row:` comments in scaffolds with honest instructional comments:
     ```sql
     -- Configuration and schema validation runs automatically against the engine.
     ```
  2. In `prisma-02-setup-connection.ts`, replace the crossword instructions:
     - Old: `['Starts with npx prisma', 'Ends with generate']`
     - New: `['Execute npx prisma generate to compile the client', 'Verify the output build artifact']`
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase6-prisma-content.test.ts`

---

## Phase 2: Deepening Prisma Pedagogy & Concept Coverage (P2)
**Goal:** Eliminate copy-pasted `prismaTheory` placeholders and add missing production-grade Prisma features.  
**Estimated Time:** 6 – 8 Hours  
**Risk Level:** Medium (Extensive content updates; all automated audits must pass).

### Task 2.1: Refactor `prismaTheory` & Author Rich Concept Steps
- **Files to Modify:**
  - `src/content/prisma/phase6-tasks.ts`
  - Modules: `prisma-02`, `prisma-03`, `prisma-04`, `prisma-07`, `prisma-08`, `prisma-10`, `prisma-12`
- **Instructions:**
  1. Deprecate the single dummy step in `prismaTheory`:
     `stepBreakdowns: [{ stepNumber: 1, stepTitle: 'FROM users exists' }]`
  2. Implement an enhanced `richPrismaTheory` that accepts:
     - `mentalModel`: Visual markdown explanation of the concept.
     - `stepBreakdowns`: At least 3 genuine steps breaking down:
       - Step 1: Input arguments & Prisma Client method call
       - Step 2: Query Engine AST translation $\rightarrow$ generated SQL & parameters
       - Step 3: Database return value $\rightarrow$ TypeScript type inference
  3. Rewrite theory breakdowns for Day 2 (Setup), Day 3 (Models & Enums), and Day 12 (Transactions).
- **Verification Gate:**
  - Run: `npm run verify:curriculum`
  - Run: `npx vitest run tests/content/taught-before-tested.test.ts`

### Task 2.2: Add Missing Production Concepts & Exercises
- **Files to Modify:**
  - `src/content/prisma/modules/prisma-08-filtering-pagination.ts`
  - `src/content/prisma/modules/prisma-12-nested-transactions.ts`
  - `src/content/prisma/modules/prisma-13-errors-middleware.ts`
  - New Module / Capstone: `src/content/prisma/modules/prisma-15-advanced-extensions.ts` (or expand Day 13/14)
- **Concepts to Add:**
  1. **Modern Client Extensions:** Replace deprecated `$use` middleware with `prisma.$extends({ query: { ... } })`.
  2. **Raw SQL Escape Hatch:** Dedicated practice for `prisma.$queryRaw` and `Prisma.sql`.
  3. **Aggregations & Grouping:** Add `prisma.post.groupBy({ by: ['category'], _count: true })`.
  4. **Cursor-Based Pagination:** Lab contrasting `skip/take` vs `cursor: { id }`.
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase8-prisma-audit.test.ts`

---

## Phase 3: Homepage Redesign & Conversion (P3)
**Goal:** Transform `/` from a plain 2-card selector into a modern, high-conversion visual learning showcase.  
**Estimated Time:** 3 – 4 Hours  
**Risk Level:** Low (Self-contained in landing page components).

### Task 3.1: Build Interactive Landing Page Hero & Lens Demo
- **Files to Modify:**
  - `src/components/tracks/TrackSelector.tsx`
  - New Component: `src/components/tracks/HeroLensInteractivePreview.tsx`
- **Features to Implement:**
  1. **Hero Headline:** "Master the Data Layer: From Bare-Metal SQL to Type-Safe Prisma ORM."
  2. **Interactive Query Playground Island:**
     - Left pane: Clickable tabs showing sample queries (`Prisma findMany with include` vs `Raw SQL JOIN`).
     - Right pane: Animated live **Generated SQL Lens** showing the exact query generated and execution time.
  3. **Returning Learner Continuity Card:**
     - Client hook reading `trackStorageKey`:
     - If progress is found in SQL or Prisma, render a prominent:
       `"Resume Day 14: Nested Relations [80% Complete] ->"`
  4. **Curriculum Feature Badges:**
     - Zero Environment Setup (Browser Engine)
     - TypeScript Autocomplete & Inferred Types
     - Visual Entity Relationship Diagrams (ERD)
- **Verification Gate:**
  - Test responsiveness on mobile (`375px`), tablet (`768px`), and desktop (`1280px`).
  - Run: `npm run build` to verify zero server-side rendering (SSR) regressions.

---

## Phase 4: Pluggable Multi-Track Architectural Refactor (P4)
**Goal:** Prepare the platform for Track 3 (Drizzle, Mongo, Redis) without duplicating routes or creating ternary waterfalls.  
**Estimated Time:** 4 – 5 Hours  
**Risk Level:** High (Touches route structure and track registry).

### Task 4.1: Generalize `TrackDefinition` & Registry
- **Files to Modify:**
  - `src/types/track.ts`
  - `src/tracks/registry.ts`
- **Instructions:**
  1. Change `type TrackId = string;` with known constants:
     ```typescript
     export const TRACK_IDS = ['sql', 'prisma'] as const;
     export type BuiltinTrackId = (typeof TRACK_IDS)[number];
     ```
  2. Create `TRACK_REGISTRY: Record<string, TrackDefinition>` where each track registers its metadata, curriculum loader, milestone loader, and engine adapter.
  3. Refactor helper functions in `registry.ts` (`getTrackModules`, `getTrackMilestones`) to read from the registry dictionary rather than using ternary operators.

### Task 4.2: Shared Route View Wrappers (Deduplication)
- **Files to Modify:**
  - Create: `src/components/learn/TrackDayLayoutView.tsx`
  - Refactor: `src/app/(app)/sql/learn/[dayId]/layout.tsx`
  - Refactor: `src/app/(app)/prisma/learn/[dayId]/layout.tsx`
- **Instructions:**
  1. Move the shared layout logic from `layout.tsx` (reset database on day change, locked-day enforcement, breadcrumbs) into `TrackDayLayoutView`.
  2. Have both `sql` and `prisma` layouts simply render `<TrackDayLayoutView track="sql">{children}</TrackDayLayoutView>`.
  3. Protect canonical URLs and sitemaps: keep `/sql` and `/prisma` route paths intact as SEO-optimized entry points.
- **Verification Gate:**
  - Run: `npx vitest run tests/tracks/phase1-foundation.test.ts`
  - Run: `npx vitest run tests/tracks/phase2-routing.test.ts`
  - Full suite: `npx vitest run` (all 804+ tests must pass).

---

## Summary of Phases & Estimated Timetable

| Phase | Core Objective | Estimated Hours | Gate Command |
|---|---|---|---|
| **Phase 0** | Track-Aware Chrome & Label Fixes | 2–3 hrs | `npx vitest run tests/tracks/` |
| **Phase 1** | Honest Snippet Labs & Polymorphic Console | 4–5 hrs | `npx vitest run tests/tracks/phase5-prisma-pipeline.test.ts` |
| **Phase 2** | Prisma Pedagogy Deepening & Concept Expansion | 6–8 hrs | `npm run verify:curriculum && npx vitest run` |
| **Phase 3** | High-Conversion Modern Homepage | 3–4 hrs | `npm run build` |
| **Phase 4** | Generic Multi-Track Registry Architecture | 4–5 hrs | `npm run audit:all` |
| **Total** | **Full System Upgrade** | **19–25 hrs** | **100% Green Test Suite** |
