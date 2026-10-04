# Prisma Track: Architectural & Pedagogical Overhaul Plan & Tracker

**Version:** 1.0.0  
**Target:** SQLens Prisma Track (`/prisma`, `/prisma/learn/*`, `/playground?mode=prisma`)  
**Status:** In Progress (Phase 0 Complete)

---

## 1. Executive Summary & Objective

Transform the Prisma track in **SQLens** from a scaffolded code editor into a visual-first, conceptually rigorous learning environment comparable to ExecuteProgram and LeetCode. 

This plan addresses:
1. **Dynamic Type Generation**: Emitting accurate TypeScript `.d.ts` from the existing AST parser (`parsePrismaSchema`), replacing static module-level singletons in Monaco.
2. **Visual Hierarchy in SQL Lens**: Visually distinguishing parent queries from relation sub-queries (`isRel`) to clarify Prisma's two-query execution model.
3. **In-Memory JSON Result Stitching**: Merging relation row sets into true nested JavaScript objects in the pipeline and enabling dual JSON/Table views in the console.
4. **Lightweight Theory Live Demo**: Enabling interactive execution of `theory.prisma.liveDemoCode` on concept pages with a task-agnostic runner.
5. **Interactive Stepped Visualizer**: Upgrading static code cards in `PrismaTheoryBlock` to an interactive state machine.
6. **Adaptive Schema Hinting**: Automatically surfacing the schema and ERD during relation modeling tasks.

---

## 2. Master Progress Tracker

| Phase | Milestone | Primary Target Files | Status | Completion Date |
| :---: | :--- | :--- | :---: | :---: |
| **0** | **Architectural Alignment & Spec** | `docs/PRISMA_PEDAGOGICAL_OVERHAUL_PLAN.md` | 🟢 Complete | 2026-10-04 |
| **1** | **Monaco Dynamic Typing & Cache** | `src/lib/prisma-engine/prisma-dts-emitter.ts`<br>`src/components/learning/MonacoCodeEditor.tsx` | 🟢 Complete | 2026-10-04 |
| **2** | **SQL Lens Visual Hierarchy & Tx** | `src/components/learning/SqlLensPanel.tsx` | 🟢 Complete | 2026-10-04 |
| **3** | **In-Memory Result Stitching Pipeline** | `src/lib/prisma-engine/prisma-in-memory-stitcher.ts`<br>`src/components/learning/ResultsConsole.tsx` | 🟢 Complete | 2026-10-04 |
| **4** | **Concept Theory Live Demo Runner** | `src/lib/prisma-engine/prisma-demo-runner.ts`<br>`src/components/learning/ConceptLessonView.tsx` | 🟢 Complete | 2026-10-04 |
| **5** | **Interactive Theory Stepper Visualizer** | `src/components/learning/prisma/PrismaTheoryBlock.tsx` | ⚪ Not Started | - |
| **6** | **Adaptive Schema Tab Activation** | `src/components/learning/SQLEditor.tsx`<br>`src/content/prisma/modules/prisma-04-relations.ts` | ⚪ Not Started | - |
| **7** | **Quality Gate & Regression Audits** | `tests/tracks/*`<br>`scripts/audit-prisma-grading-pipeline.ts` | ⚪ Not Started | - |

---

## 3. Detailed Phase Breakdown & Tasks

### Phase 1: Monaco Dynamic Typing & Emitter Engine
*Problem:* Monaco currently initializes with a static `PRISMA_DECLARATIONS` string containing only `User` and `Post`. When learners work on custom schema tasks (e.g. `Product`, `Category`, `Profile`), valid code displays false red squiggles and lacks autocomplete. Furthermore, `let monacoConfigured = false` locks declarations on the first task forever.

- [x] **1.1** Implement `src/lib/prisma-engine/prisma-dts-emitter.ts`:
  - Input: `PrismaSchema` AST from existing `parsePrismaSchema()`.
  - Output: Full TypeScript declaration string (`export interface ModelName { ... }`, `export interface PrismaClient { modelName: ... }`).
- [x] **1.2** Refactor `src/components/learning/MonacoCodeEditor.tsx`:
  - Remove module-level boolean singleton lockout.
  - Track `currentExtraLib: { dispose: () => void } | null` and schema signature.
  - Re-emit and register types dynamically when the task schema changes.
- [x] **1.3** Vitest suite:
  - Add `tests/tracks/phase13-prisma-dts-emitter.test.ts` to assert that complex schemas (relations, optional fields, enums) compile to valid `.d.ts`.

---

### Phase 2: SQL Lens Visual Hierarchy & Transaction Semantics
*Problem:* In `SqlLensPanel.tsx`, main record queries and relation sub-queries are rendered as identical sibling cards, obscuring Prisma's multi-step execution. In addition, `$transaction` batch array (`sum`) vs interactive callback (`last`) semantics are hidden from the learner.

- [x] **2.1** Refactor `SqlLensPanel.tsx` card layouts:
  - Indent statements with `step.role === 'relation'` by `ml-3 sm:ml-6`.
  - Add visual tree connector (`↳ Relation Sub-query`) with explanation: `"Populates related records in memory"`.
- [x] **2.2** Display transaction semantics badge:
  - When `method === '$transaction'`, label the execution mode:
    - Array Form: `Batch Transaction: resolves to array of statement results`
    - Callback Form: `Interactive Transaction: resolves to callback return value`
- [x] **2.3** Automated test suite `tests/tracks/phase14-sql-lens-hierarchy.test.ts` covering relation sub-query role tagging and `$transaction` batch vs interactive mode propagation.

---

### Phase 3: In-Memory JSON Result Stitching Pipeline
*Problem:* `SqlLensPanel` explains that Prisma returns nested objects, but `ResultsConsole` forces results into a flat 2D `DataGrid` (tabular rows of the last query). Learners cannot inspect the actual JavaScript object returned by `await prisma.user.findUnique()`.

- [x] **3.1** Implement `src/lib/prisma-engine/prisma-in-memory-stitcher.ts`:
  - `stitchPrismaExecution({ steps, schema, method, rowEffect })`
  - Reconstruct the parent-child object graph using foreign key links (`authorId` ↔ `id`, `userId` ↔ `id`).
  - Output clean nested JavaScript objects/arrays matching Prisma Client's return shape.
- [x] **3.2** Update `src/lib/prisma-engine/prisma-submit-pipeline.ts` & `src/lib/track-submit.ts`:
  - Thread `stitchedJson?: unknown` through `PrismaSubmitOutcome`, `TrackSubmitOutcome`, and `SqlLensState`.
- [x] **3.3** Update `src/components/learning/ResultsConsole.tsx`:
  - Add a toggle button on Prisma tasks:
    - `[ { } ] In-Memory Object` (Syntax-highlighted, formatted JSON tree via `JsonViewer.tsx`).
    - `[ ⊞ ] SQLite Rows` (Tabular DataGrid).
  - Default to JSON view for Prisma queries returning objects.
- [x] **3.4** Vitest suite:
  - Add `tests/tracks/phase15-prisma-stitcher.test.ts` validating 1:1, 1:N, empty results, batch `$transaction`, and pipeline integration.

---

### Phase 4: Concept Theory Live Demo Runner
*Problem:* On concept theory pages, `theory.prisma.liveDemoCode` is authored, but the UI renders `<input placeholder="Enter a SQL query..." />` and executes raw SQL against SQLite.

- [x] **4.1** Implement `src/lib/prisma-engine/prisma-demo-runner.ts`:
  - Build `executePrismaDemo(options)` using `generatePrismaSql()`, `runPrismaPlan()`, and `stitchPrismaExecution()`, with no dependency on `PracticeTask`.
- [x] **4.2** Update `src/components/learning/ConceptLessonView.tsx`:
  - When `theory.prisma?.liveDemoCode` or `targetHero.code` is present, render the interactive Prisma demo panel:
    - TypeScript code editor with "Run Code" and "Reset" buttons.
    - Live SQL Lens showing generated SQL (`SqlLensPanel`).
    - Result card displaying the stitched JSON output (`JsonViewer`).
  - Leave SQL track live demo untouched.
- [x] **4.3** Vitest suite:
  - Add `tests/tracks/phase16-prisma-demo-runner.test.ts` validating execution, include relations, and error handling.

---

### Phase 5: Interactive Stepped Stepper for Theory
*Problem:* `PrismaTheorySteps` in `PrismaTheoryBlock.tsx` renders static code fences and text paragraphs. Learners read about query steps instead of experiencing the step-by-step pipeline.

- [ ] **5.1** Refactor `src/components/learning/prisma/PrismaTheoryBlock.tsx`:
  - Maintain active step state (`activeStepIndex`).
  - Render an interactive step timeline: `[1. Prisma Call] ──► [2. Query 1 (Parent)] ──► [3. Query 2 (Relation)] ──► [4. Hydrated JSON]`.
  - Add step playback controls (Next / Previous / Direct Click).
  - Highlight the corresponding code segment, parameter bindings, and generated SQL per step.

---

### Phase 6: Adaptive Schema Tab Activation
*Problem:* The ERD and schema source are buried inside the `SCHEMA` tab of the editor. Learners frequently miss the ERD when working on relation models in Days 3 and 4.

- [ ] **6.1** Update `src/content/prisma/modules/prisma-03-models-constraints.ts` and `prisma-04-relations.ts`:
  - Configure `activeTab: 'schema'` by default on relation-declaration tasks.
- [ ] **6.2** Update `src/components/learning/SQLEditor.tsx`:
  - Add a persistent relation indicator pill on tasks with multi-model schemas (`Schema: 2 models, 1 relation defined ↗`) that switches to the ERD view on click.

---

### Phase 7: Quality Gate & Regression Verification
- [ ] **7.1** Run full unit test suite: `npx vitest run`.
- [ ] **7.2** Run Prisma grading pipeline audit: `npm run audit:prisma-grading-pipeline`.
- [ ] **7.3** Run Prisma equivalence audit: `npm run audit:prisma-equivalence`.
- [ ] **7.4** Run universal task audit: `npm run audit:all`.
- [ ] **7.5** Complete manual verification on representative days (Day 1, Day 4, Day 8, Day 12).

---

## 4. Architectural Boundaries & Non-Regressions

1. **SQL Track Isolation**: All changes must branch on `isPrismaTask(task)` or `track === 'prisma'`. The SQL pipeline, SQL editors, and SQL evaluation states must remain byte-identical.
2. **Deterministic Grading**: Changes to `ResultsConsole` and `SqlLensPanel` are purely presentational; the grading verdict in `runAndGradePrismaSubmission` remains authoritative.
3. **No External Dependencies**: In-memory stitching and DTS generation use existing TypeScript and SQLite utilities without adding npm packages.
