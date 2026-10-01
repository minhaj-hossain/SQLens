# Progress Tracker: Validation Equivalence, Grading Parity & Editor Architecture

> **Status Reference:**
> - `[ ]` = Pending / Not Started
> - `[/]` = In Progress
> - `[x]` = Completed & Verified by Test Gate
> - `[!]` = Blocked / Needs Review

---

## Quick Dashboard

| Phase | Description | Status | Target Gate | Tests Passing | Last Verified |
| :--- | :--- | :---: | :--- | :---: | :---: |
| **Phase 0** | Prisma Grading Parity & Reference Integrity | `[x]` | `audit-prisma-equivalence.ts` | 880 / 880 | 2026-10-01 |
| **Phase 1** | Prisma Static Robustness & Snippet Normalization | `[ ]` | `phase5-prisma-pipeline.test.ts` | — / 870 | Pending |
| **Phase 2** | Track-Aware Tokenizer & Editor Highlighting | `[ ]` | `tests/ui/` + Visual Inspection | — / 870 | Pending |
| **Phase 3** | SQL Mutation State-Visible Keyword Review | `[ ]` | `npm run audit:all` | — / 870 | Pending |

---

## Detailed Task Breakdown

### Phase 0: Prisma Grading Parity & Reference Integrity (P0 — Critical)
- [x] **Task 0.1: Thread Database State Hooks into Prisma Pipeline** — verified 2026-10-01
  - [x] Extend `PrismaSubmitHooks` in `src/lib/prisma-engine/prisma-submit-pipeline.ts` with `getDatabaseState` (deep-cloning snapshot; mirrors `preState`'s convention in `sql-engine/submit-pipeline.ts`). Deliberate single-hook design instead of also adding `getCommittedState`: the Prisma generator emits no `BEGIN`/`COMMIT` (verified in `prisma-sql-generator.ts`), so the SQL track's durable/session split has no Prisma counterpart — committed and session views coincide here. Absent hook → layer skipped, no crash (legacy hosts).
  - [x] Forward `getDatabaseState` in `src/lib/track-submit.ts` to the Prisma pipeline router (`submitForTask`).
  - [x] Integrate `gradeFinalState()` for mutating Prisma operations: pre/post snapshots around the run plus the new `isStateGradedPrismaTask` classifier (reference translated via `generatePrismaSql` — the reference's OWN SQL, not the read-probe `solutionSql` — UPDATE/INSERT/DELETE/DDL verbs; reads/`findMany`/snippet labs excluded). A state mismatch returns `stage: 'final-state'`, `stateOk: false`, `diffColumns`. `expectFailure` labs stay execution-graded; references that still render unresolved NULL params defer to Task 0.2.
  - [x] *Verification Gate:* `tests/tracks/phase12-prisma-state-parity.test.ts` (7 tests): clean `prisma10-c1-t2` passes with `stateOk: true`; wrong-row (`where: { name: 'Mina' }`) and wrong-value (`data: { name: 'HACKED' }`) both FAIL at `stage: 'final-state'` — direct AND through the real `submitForTask` router; reads keep `stateOk` undefined; hook-less hosts keep the legacy verdict. The original `prisma10-c1-t1` probe (`where: { id: 2 }` / `'HACKED'`) is the Task 0.2 dependency: its reference still renders `SET name = NULL`, so the layer skips it today — the phase12 test asserts that skip and carries the flip to the strict verdict once 0.2 rebinds the reference. Gates: `npx tsc --noEmit` clean · `npm test` 877/877 · `audit:prisma-grading-pipeline` 0 findings · `audit:grading-pipeline` 0 findings · `audit:equivalence` 28/28.
- [x] **Task 0.2: Fix Reference Demo Bindings & Eliminate NULL Writes** — verified 2026-10-01
  - [x] **0.2.1** `PrismaTaskContent.demoVariables?: Record<string, unknown>` (`src/types/prisma-curriculum.ts`) + `PrismaTaskExtras.demoVariables` threaded into both factories (`phase6-tasks.ts`) → `prisma.demoVariables`. Zero behaviour change (no task declared one yet).
  - [x] **0.2.2 Discovery (evidence).** Temporary probe rendered every executable reference and flagged param-marker statements that fell back to honest NULL. **Confirmed exactly 9 affected tasks; unresolved params `name` (×8) + `title` (×1)** — matches the plan's census. Bindings declared in 0.2.4 (table below).
  - [x] **0.2.3 Threading.** New `taskSeedContext(task) = prismaSeedContext(task.prisma?.demoVariables)` replaces the shared-context call at all four task-scoped sites (`isExecutablePrismaTask`, `translateReference`, `runAndGradePrismaSubmission`, `previewPrismaSubmission`). `prisma-playground.ts` deliberately stays global (no task). Learner and reference share the context, so a param both write binds to the same value — no divergence.
  - [x] **0.2.4 Bindings declared** (`demoVariables`) on the 9 tasks:
        | task | demoVariables | runtime write |
        |---|---|---|
        | `prisma09-c1-t1` | `{ name: 'Rafi', email: 'rafi@prisma.io' }` | `INSERT INTO users (name, email) VALUES ('Rafi', 'rafi@prisma.io')` |
        | `prisma10-c1-t1` | `{ name: 'Alexandra' }` | `UPDATE users SET name = 'Alexandra' WHERE id = 1` |
        | `prisma10-c2-t2` | `{ name: 'Alexandra' }` | `UPDATE users SET name = 'Alexandra' WHERE email = 'mina@prisma.io'` |
        | `prisma10-hw-1` | `{ name: 'Rafi', email: 'rafi@prisma.io' }` | `UPDATE users SET name = 'Rafi' WHERE email = 'rafi@prisma.io'` |
        | `prisma12-c1-t1` | `{ name: 'Alexandra', title: 'Hello Prisma' }` | `INSERT INTO users (name, email) VALUES ('Alexandra', 'mina@prisma.io')` |
        | `prisma12-c1-t2` | `{ title: 'Hello Prisma', categoryName: 'General' }` | `INSERT INTO posts (title) VALUES ('Hello Prisma')` |
        | `prisma12-c2-t2` | `{ name: 'Alexandra' }` | `INSERT INTO users (name, email) VALUES ('Alexandra', 'mina@prisma.io')` |
        | `prisma13-c1-t1` | `{ name: 'Alexandra' }` | `INSERT INTO users (name, email) VALUES ('Alexandra', 'mina@prisma.io')` |
        | `prisma13-c1-t2` | `{ name: 'Alexandra' }` | `UPDATE users SET name = 'Alexandra' WHERE id = 1` |
  - [x] **0.2.5 Payoff pinned.** `tests/tracks/phase12-prisma-state-parity.test.ts`: the Task 0.1 deferral is retired — the ORIGINAL probes on `prisma10-c1-t1` (`where: { id: 2 }` AND `data: { name: 'HACKED' }`) now **FAIL** at `stage: 'final-state'`, the reference passes with `stateOk: true`, and a **corpus sweep** asserts NO executable reference renders `NULL` in a write position. `referenceStateSql()`'s `unresolvedNull` guard stays as defence-in-depth (never fires for authored tasks now).
  - [x] **0.2.6 Full gate.** NULL-write sweep **0** · `npx tsc --noEmit` clean · `npm test` **878/878** · `audit:prisma-grading-pipeline` 0 findings · `audit:grading-pipeline` 0 findings · `audit:equivalence` 28/28 · `npm run audit:all` **0 blocking** (17 pre-existing advisory).
- [x] **Task 0.3: Deprecate Dead `task.prisma.generatedSql` Previews (Path A — remove)** — verified 2026-10-01
  - [x] **0.3.1 Consumer confirmation (evidence).** `task.prisma.generatedSql` had **0** readers across `src`/`tests`/`scripts`; the only live field is the runtime `PrismaSubmitOutcome.generatedSql` (mirror of `steps.map(s => s.sql)`), rendered by `SqlLensPanel`.
  - [x] **0.3.2–0.3.4 Removal.** Deleted `generatedSql` from `PrismaTaskContent` (`src/types/prisma-curriculum.ts`), from `PrismaTaskExtras` + both factory defaults (`src/content/prisma/phase6-tasks.ts`), and the 10 authored values (prisma-01 ×3, prisma-09 ×2, prisma-10 ×4, prisma-11 ×1). Authored `generatedSql` count in `src/content`: **0**; the one doc mention of field-name resolution (`renderGeneratedSql` source→field order) is unrelated.
  - [x] **0.3.5 Tripwire test.** `tests/tracks/phase12-prisma-state-parity.test.ts`: asserts NO task carries `prisma.generatedSql` (re-introduction is a content regression) + the runtime `outcome.generatedSql` stays the single source (non-empty, no unresolved `/* param:` markers).
  - [x] **0.3.6 Full gate.** `npx tsc --noEmit` clean · `npm test` **879/879** (77 files) · `audit:prisma-grading-pipeline` 0 findings (76 tasks) · `audit:grading-pipeline` 0 findings (420 tasks) · `audit:equivalence` 28/28. Drift structurally = 0 (no authored copy exists).
- [x] **Task 0.4: Build `audit:prisma-equivalence` Suite** — verified 2026-10-01
  - [x] **0.4.1 Partition census (reconciled).** 76 Prisma tasks = **35 executable** (13 state-graded + 22 executable-read) + **41 read-through** — matches `audit:prisma-grading-pipeline`'s census (76 / 35 / 41) exactly.
  - [x] **0.4.2 Transform spike (evidence).** 5 pure transforms built and probed through `generatePrismaSql` + the real submit path: `reorder-select-keys`, `wrap-assignment` (`return await prisma.…` → `const r = await …; return r;`; bare `await` statements too; `this.`-prefixed calls included), `reflow-multiline` (the call's args collapsed to one line), `equals-form` (`where: { f: v }` → `where: { f: { equals: v } }`), `normalize-strings` (quote style flipped inside the call args). A variant is only generated while every authored `requiredCodeSnippets` fragment survives — 5 probes are correctly skipped on that guard instead of reported (e.g. `prisma09-hw-1`'s literal `select: { id: true, email: true }` contract). Quoted keys (`"name": true`) stay deferred to Phase 1.2 and CLI quote/`=`/runner normalization to Phase 1.1 — asserted nowhere here by design (named in the audit header).
  - [x] **0.4.3 Probe generators (wrong-value / wrong-row / drop-where / drop-snippet).** Every probe routes through `submitForTask` (`record: false`) with UI-parity hooks (`allowDdlOverwrite` + all state snapshot hooks). Two evidence-driven contract refinements:
        (a) **Real hole found, pipeline fixed.** A submission failing translation on a **client-code lab** (its reference IS translatable) fell into the read-through contract and graded the **reference's** dataset — the drop-where probes on `prisma12-c2-t1`, `prisma12-hw-1`, `prisma13-c1-t2` all **PASSED** (phantom pass). `runAndGradePrismaSubmission` now fails untranslatable submissions when `isExecutablePrismaTask(task)` and `!expectFailure`; snippet labs keep the read-through contract untouched. All three probes now fail at `stage: 'validation'`, and no test expected the old behavior (880/880 still green).
        (b) **Flexible-insert policy acknowledged, not fought.** `compareFinalState`'s documented carve-out accepts custom values on rows a reference INSERTs (`eRows > pRows` + pre-existing rows preserved), so wrong-value / wrong-row probes against a table the reference inserts into are **skipped with that reason named** (6 probes) — SQL-track parity policy, not a defect. Non-equivalent probes (sentinel matched nothing because the reference matched nothing) are skipped too (10).
        *Gate tasks:* `prisma10-c1-t1` (4 fairness PASS; wrong-value caught at `final-state`; wrong-row + drop-where caught at `validation`) · `prisma10-c1-t2` (4 PASS; all three false-accepts caught) · `prisma09-c1-t1` (3 PASS; insert-growth carve-out skip named) — references pass everywhere.
  - [x] **0.4.4 `scripts/audit-prisma-equivalence.ts` built.** Header contracts the Option A scope (deferrals named) and the skip taxonomy; Finding kinds `FALSE_REJECT | FALSE_ACCEPT | EXEC_ERROR | REFERENCE_FAIL`; a reference self-consistency check (a reference carrying its own `forbiddenCodeSnippets` fragment is a `REFERENCE_FAIL`); per-day OK/ISSUE lines; SUMMARY with caught-by-stage + skip-reason census; `process.exit(1)` on any finding. Full-corpus run: **147 fairness probes passed · 158 false-accept probes caught** (99 drop-snippet → validation, 28 wrong-row → validation, 25 drop-where → validation, 5 wrong-value → final-state, 1 wrong-value → validation) **· 279 skips (each named) · 0 findings** → exit 0.
  - [x] **0.4.5 Wiring.** `npm run audit:prisma-equivalence` added right after `audit:prisma-grading-pipeline` and chained into `audit:all`; CI step added; `scripts/README.md` row added; the Phase-8 wiring test now pins all four surfaces (script invocation, chain membership + order after the pipeline gate, CI step, README row).
  - [x] **0.4.6 Full gate.** `npx tsc --noEmit` clean · `npm test` **880/880** (77 files) · `audit:prisma-equivalence` **0 findings, exit 0** · `audit:prisma-grading-pipeline` 0 findings (76 tasks) · `audit:grading-pipeline` 0 findings (420 tasks) · `audit:equivalence:tasks` 0 findings (291 tasks / 866 rewrites) · `npm run audit:all` **exit 0** (0 blocking; 17 pre-existing advisory from visual-coverage).

---

### Phase 1: Prisma Static Robustness & Snippet Normalization (P1)
- [ ] **Task 1.1: Normalize CLI & Snippet Flags**
  - [ ] Update `validatePrismaCode` in `src/lib/prisma-engine/prisma-validator.ts` to normalize quotes (`--name "init"` ≡ `--name init`).
  - [ ] Support equals flag syntax (`--name=init`).
  - [ ] Support package runner variants (`pnpm dlx prisma`, `bunx prisma` ≡ `npx prisma`).
  - [ ] *Verification Gate:* Unit test in `phase5-prisma-pipeline.test.ts` verifying all 3 variants pass for Day 5 migration labs.
- [ ] **Task 1.2: Quoted Object Keys & Structural Normalization**
  - [ ] Allow quoted keys in `requiredFieldsInSelect` (`select: { "name": true }`).
  - [ ] Anchor `extractBlock` using `new RegExp(\`\\b\${key}\\s*:\\s*\\{\`)` instead of raw `indexOf`.
  - [ ] *Verification Gate:* Quoted keys test in `phase4-prisma-execution.test.ts`.

---

### Phase 2: Track-Aware Tokenizer & Editor Highlighting (P2)
- [ ] **Task 2.1: Pure TypeScript / Prisma Tokenizer**
  - [ ] Create `src/lib/highlight-typescript.ts` following `highlight-sql.ts` token lifecycle and stashing pattern.
  - [ ] Map keywords, strings, comments, numbers, punctuation to existing theme tokens (`--code-kw`, `--code-str`, etc.).
  - [ ] Add unit tests in `tests/ui/highlight-typescript.test.ts`.
- [ ] **Task 2.2: Pure Prisma Schema Tokenizer**
  - [ ] Create `src/lib/highlight-prisma-schema.ts` for `model`, `enum`, types, and `@attributes`.
  - [ ] Wire into `src/components/learning/prisma/PrismaSchemaTab.tsx`.
- [ ] **Task 2.3: Language-Aware Editor Integration**
  - [ ] Add `language?: 'sql' | 'typescript'` to `QueryEditor.tsx`.
  - [ ] Select appropriate tokenizer based on active surface in `SQLEditor.tsx`.
  - [ ] *Verification Gate:* Visual check on both `graphite` and `sky` themes; all 870 unit tests remain green.
- [ ] **Task 2.4: Prisma Autocomplete Affordances**
  - [ ] Extend `src/lib/autocomplete.ts` to suggest Prisma models, methods, and clause blocks when `language === 'typescript'`.
  - [ ] *Verification Gate:* Autocomplete unit tests in `tests/ui/autocomplete-context.test.ts`.

---

### Phase 3: SQL Mutation State-Visible Keyword Review (P3 — Policy)
- [ ] **Task 3.1: Census & Relaxation of ~40 State-Visible Keyword Rules**
  - [ ] Audit the ~40 mutation tasks with `requireWhere` / `whereContainsTerms`.
  - [ ] Demote to advisory notes when final state matches and `strictConstruct` is false.
  - [ ] Update `docs/GRADING_POLICY.md` if policy changes.
  - [ ] *Verification Gate:* `npm run audit:all` passes with 0 findings.
