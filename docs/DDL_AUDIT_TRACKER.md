# DDL Audit — Workstream Tracker

> Source: the DDL audit you requested (Days 25-30 review, 2026-09-23).
> Six workstreams (A-F). This file is the single source of truth for what is
> DONE vs. NOT DONE. Update it whenever a workstream lands.
>
> Legend: ✅ done & verified · 🟡 in progress · ⬜ not started

## A — Content contract fix (column discoverability) ✅

- [x] **A1** `scripts/audit-ddl-contracts.ts` — gate: every column a
  CREATE/ALTER `solutionSql` declares must be (1) visible in the rendered
  prompt and (2) declared in `validation.requiredColumns`; phantom required
  columns flagged. Days 27-30 block, other days advisory.
  Wired: `npm run audit:ddl-contracts`, appended to `audit:all`, CI step added,
  row in `scripts/README.md`.
- [x] **A2** Days 27-30 instructions state every column (with type) of each
  CREATE/ALTER solution — tightened Day 27 `day20-c1-t1`/`day20-c1-t2` prose
  into explicit `INT`/`VARCHAR(50)`/`TEXT` bullets, `DECIMAL(6,2)` wording on
  `day20-c2-t1`. No solution leakage (contract only, never values).
- [x] **A3** `validation.requiredColumns` added to every column-defining DDL
  task in Days 27-30 (24 tasks: 7 in Day 27, 9 in Day 28, 5 in Day 29, 3 in
  Day 30). `verifyColumnTypes: true` on type-stating tasks in Days 27-29 only
  (GRADING_POLICY Rule 4 allowlist `{27,28,29}` — Day 30 deliberately not set).
  DROP-only and expectFailure tasks correctly exempt.
- [x] **A4** `src/lib/sql-engine/ddl-columns.ts` (new) + validator rule 2 DDL
  branch: `requiredColumns` now evaluates CREATE/ALTER statements directly and
  fails with `Missing column 'x' … Your statement currently declares: […]`.
  SELECT/DML result-grid path unchanged.
- [x] **A5** `tests/engine/ddl-contracts.test.ts` — extractor unit tests,
  validator DDL vs grid paths, end-to-end on the real Day 27 task (reference
  passes / dropped column named / wrong type KIND named).
- [x] **A6** Acceptance run — **zero regressions vs. baseline** (proven via
  `git stash` baseline capture, 2026-09-23):
  - ✅ GREEN on my tree: `lint` (tsc) · `vitest` **559/559** (incl. the 11 new
    `ddl-contracts` tests) · `test:engine` 46/46 · `audit:ddl-contracts`
    **0 blocking / 32 advisory** · `verify:curriculum` exit 0 ·
    `audit:custom-validators` 17/17 · `audit:equivalence` 28/28 ·
    `audit:equivalence:tasks` 0 findings · `audit:validation-overlap` census
    ok · `audit:keyword-case` 0 · `audit-all-tasks` 423/424 ·
    `tests/content/solution-sql` (every solution, incl. new requiredColumns,
    still passes validation) · `verify:curriculum` Days 27-30 all ✅.
  - ⚠️ PRE-EXISTING reds, **byte-identical before and after** (stash-verified):
    `audit:grading-policy` exit 1 (18 Rule-1 `requireExactResult` findings,
    Days 41/42/51/53/54/57) · `audit:taught-before-tested` exit 1 (6 findings:
    day27-hw-1 CHECK+DEFAULT construct, day31 CREATE INDEX, Day 25 ×2 literals,
    day41 literal) · `audit:grading-pipeline` exit 1 (6 findings: Day 42 ×4,
    Day 54 ×2) · `audit-all-tasks` Day 45 `day45-t3` expectFailure lab fails ·
    Day-50 `primaryTable 'accounts'` note (verify script has no `process.exit`,
    always exits 0). NONE touch Workstream-A files.
  - Advisory output worth a later pass: Day 33 `cap-ch-t1` has real
    `missing-column-in-prompt` findings (challenge prompt doesn't name its
    created columns) — outside the A blocking scope; consider extending
    `BLOCKING_DAYS` after a Day 33+ content pass.

## B — Datatype grading (engine) ✅

- [x] **B1** Canonical registry `src/lib/sql-engine/sql-type-registry.ts` —
  32 base types → 5 internal kinds, exact match on the base word, with
  Levenshtein ≤ 2 "did you mean" suggestions. Replaces the old prefix chain
  `sqlTypeToDataType` whose `return 'string'` catch-all silently accepted any
  typo (`VARCHR(20)` became a string column).
- [x] **B2** Missing/unknown types are now NAMED errors on both the CREATE and
  the ALTER paths (plus empty column lists):
  - `Column 'id' needs a data type (e.g. id INT, id VARCHAR(50)).`
  - `Unknown data type 'VARCHR(20)' for column 'id' — did you mean 'VARCHAR'? (supported: … see docs/DIALECT.md §5).`
  - `CREATE TABLE needs a column list (e.g. CREATE TABLE t (id INT));`
- [x] **B3** `verifyColumnTypes` was already wired end-to-end (used since A);
  failure messages upgraded from engine jargon to learner labels via
  `describeSqlKind`: `was declared as a number type (INT), but this task
  requires a text type (VARCHAR/TEXT).`
- [x] **B4** Phantom-column fix found during B: table-level
  `PRIMARY KEY (…)` / `FOREIGN KEY …` / `UNIQUE (…)` were misparsed as columns
  named `PRIMARY`/`FOREIGN`/… (type token `KEY` → string), polluting the
  explorer and state diffs. Column parsing is now shape-gated (constraint
  metadata still registers); quoted identifiers and `key TEXT`-style columns
  still parse as columns.
- [x] **B5** Tests `tests/engine/ddl-types.test.ts` — 13 tests: registry units,
  typo suggestions, CREATE/ALTER missing+unknown errors, kind mapping across
  all 5 families, no-phantom-columns (metadata kept), learner-facing
  verifyColumnTypes message, kind-equality (precision) case.
- [x] **B6** DIALECT §5 "Column type registry" section — normative table,
  error contracts, and the rule "amend registry + table together".
- [x] **B7** Acceptance (2026-09-23) — **zero regressions**:
  - ✅ `tsc` · vitest **572/572** (559 + 13 new) · `test:engine` 46/46 ·
    `test:db-lifecycle` · `verify:curriculum` (identical baseline output) ·
    `audit:ddl-contracts` 0 blocking · `audit:keyword-case` 0 ·
    `audit:equivalence` 28/28 · `audit:equivalence:tasks` 0 ·
    `audit:custom-validators` 17/17 · `audit-all-tasks` **423/424** (same
    pre-existing Day-45 lab) · `audit:grading-pipeline` **6 findings =
    baseline byte-for-byte** (Day 42 ×4, Day 54 ×2) · grading-policy /
    taught-before-tested untouched (B changes no curriculum content).
  - Probe-driven whitelist: a temporary collector enumerated every executable
    type token first (INT/INTEGER/VARCHAR/DECIMAL/DATE/DATETIME/BOOLEAN/TEXT
    are the real set; NUMERIC/FLOAT/DOUBLE/REAL/CHAR/ENUM/JSON/SERIAL also
    whitelisted), so no passing task could regress.

**CORRECTIONS to the original audit plan — both claims came from truncated
reads and were WRONG:**
- `INTEGER` was ALWAYS fine — the old regex `^(INT|…)` matches `INTEGER`
  (it literally starts with `INT`). It is whitelisted and tested anyway.
- Missing types were NOT defaulted to `TEXT` — the old parser silently
  **dropped the whole column definition** (`if (!colMatch) continue`), so
  `CREATE TABLE t (id, name VARCHAR(5))` lost `id` entirely. Both old
  behaviors are named errors now.

## C — Keyword / highlight / format / autocomplete parity ✅

Scope adopted: full recommendations D1-D7 (CASCADE/RESTRICT/GRANT/REVOKE
deliberately deferred to Workstream D).

- [x] **C1** `src/lib/sql-keywords.ts` (new) — canonical `SQL_KEYWORDS`
  (moved from highlight-sql) + curated `SQL_DATA_TYPES` (28 bases, Day-27
  teaching order) + `SQL_DDL_MODIFIERS` (`IF NOT EXISTS`, `IF EXISTS`,
  `OR REPLACE`, `CONSTRAINT`). `highlight-sql.ts` imports for the tokenizer
  and re-exports the same names → format-sql / autocomplete / editor-errors /
  existing tests keep their import paths (zero churn).
- [x] **C2** Highlight: data types + modifiers + taught-but-missing gap fill
  (`CHECK`, `EXISTS`, `NOT EXISTS`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`,
  `WITH RECURSIVE`, `CREATE/DROP VIEW`, `CREATE OR REPLACE VIEW`,
  `IS [NOT] TRUE/FALSE`, `CREATE/DROP TRIGGER|FUNCTION|PROCEDURE`, `CALL`)
  render as `.text-code-kw` in lessons AND the editor overlay (one list).
  Longest-first matching guarantees `DATETIME` ≻ `DATE`, `BOOLEAN` ≻ `BOOL`,
  `IF NOT EXISTS` ≻ `IF EXISTS` ≻ `EXISTS`. Unsupported vocabulary stays out
  (asserted by test) until Workstream D rules on it.
- [x] **C3** Format uppercases types/modifiers; precision untouched
  (`decimal(10,2)` → `DECIMAL(10,2)`); the FULL-JOIN exclusion stays green.
- [x] **C4** Autocomplete: new `ddl-columns` context (paren-depth-aware —
  depth 1 = types-first pool that flips to constraints-first once the current
  definition declares a type; depth > 1 = expression rules) and `ddl-modifier`
  context (`IF EXISTS`/`IF NOT EXISTS` ranked first ahead of the statement
  pool + tables); `CHECK`/`CONSTRAINT` added to `DDL_KWS`; the whole
  `SQL_KEYWORDS` list joins `ALL_KEYWORDS` (prefix-reachable from any cursor,
  no empty-prefix noise); `NON_STARTER_FIRST_WORDS = {OR, WITH}` stops
  `OR `/`WITH ` from hijacking their expression/CTE pools (reachability kept
  via their own prefixes); ~35 new `SUGGESTION_DOCS` one-liners.
- [x] **C5** `editor-errors.ts` pre-classifies Workstream-B engine messages:
  `Unknown data type 'VARCHR(20)' …` → syntax kind, token `VARCHR`,
  did-you-mean `VARCHAR` (types are now candidates); `Column 'x' needs a
  data type` → surfaced as-is with NO keyword suggestion ('id'→'IN' would be
  a lie), and never misread as an unknown-column error despite its
  `for column 'id'` tail.
- [x] **C6** Tests (+20): new `sql-keywords.test.ts` (drift guard — set
  equality with the engine type registry + gap-fill membership +
  unsupported-excluded) and `format-sql.test.ts`; extended highlight (+4),
  autocomplete-coverage (+5), autocomplete-context (+2 incl. telemetry
  labels), editor-errors (+2).
- [x] **C7** Acceptance (2026-09-23) — **zero regressions**:
  - ✅ `tsc` · vitest **592/592** (572 + 20 new, all 50 files green) ·
    `audit:keyword-case` **0 findings** (every new regex carries /i) ·
    `audit:ddl-contracts` **0 blocking / 32 advisory = baseline** · all
    pre-existing autocomplete/highlight/editor/solution suites green.
  - Content & engine untouched → grading-policy / taught / pipeline /
    verify:curriculum / all-tasks hold their A/B baselines by construction.
- Implementation notes: `highlight-sql.test.ts` needed an `insert_line` EOF
  append (the replacement matcher could not find its final block — invisible
  char/line-ending quirk in that file). A column that shadows a type name
  (`date`, `text`) now highlights as a keyword — accepted cosmetic, same
  class as the pre-existing `day`/`order` behavior.

## D — Professional DDL coverage (engine + DIALECT) ✅

Option 1 adopted (document-first + named errors); **Option 2 stays deferred**
(implementing DROP COLUMN / RENAME / MODIFY / TRUNCATE-data / ON DELETE
actions / multi-clause ALTER execution — revisit only if a lesson needs them).

- [x] **D1** DIALECT §5 "DDL statement support matrix" (binding): executable
  forms incl. `CREATE TABLE IF [NOT] EXISTS` + single-clause ALTER; ❌-rows
  quoting their exact named errors; the Day-55 `Simulated: …` row (§8
  cross-ref); the CASCADE/RESTRICT/GRANT/REVOKE vocabulary ruling (stays out
  of `SQL_KEYWORDS` until executable — C's test locks it).
- [x] **D2** Named errors replace silent behavior — discoveries & fixes:
  1. **The DDL fall-through was `success: true` executing NOTHING** — my
     original "returns Unsupported DDL" claim was another truncated-read
     misdiagnosis (that string never existed). Now: a simulation branch
     (`GRANT`/`REVOKE`/`CREATE|DROP USER|ROLE` keep succeeding with an
     explicit `Simulated: …` status row — Day-55 solutions execute them) plus
     `unsupportedDdlError()` named errors for TRUNCATE / RENAME TABLE / ALTER
     sub-ops (DROP COLUMN, RENAME, MODIFY/CHANGE, CONSTRAINT, malformed) /
     anything else unrecognized.
  2. `TRUNCATE` / `RENAME TABLE` classified as DDL in parser.ts so the named
     error is reachable (previously a generic unknown-query failure).
  3. ALTER: DEFAULT capture tightened (no comma-swallowing) + second-clause
     guard (`… ADD COLUMN a INT, DROP COLUMN b` → named error; constraint
     tails like `NOT NULL DEFAULT FALSE` remain legal).
  4. DROP: plain `DROP TABLE <missing>` now **errors** like real SQL (it was
     a silent no-op — contradicting Day-29's own lesson text; `IF EXISTS`
     keeps the idempotent no-op) + one-table-per-statement guard (also
     catches trailing `CASCADE`).
  5. parseColumnDefs fails loudly on: column-level `REFERENCES` (was
     silently unregistered), FK `ON DELETE/ON UPDATE` actions (the FK
     registered WITHOUT its action), named `CONSTRAINT …` clauses inside
     CREATE (silently vanished). Usage-greps proved no executed content
     relies on any of them.
- [x] **D3** `validation.requireIfExists` (type + validator rule 7.9): grades
  the teardown TEXT so sandbox/lifecycle leniency can't mask the lesson; set
  on all three Day-29 teardowns (`ddl3-c3-t1`, `ddl3-c3-t2`, `ddl3-hw-3`).
- [x] **D4** keyword-case: one reasoned ALLOWLIST entry for the FK error
  MESSAGE (its slash pair `DELETE /` + `docs/` false-positives as a regex).
- [x] **D5** Tests: `tests/engine/ddl-unsupported.test.ts` — 13 tests (10
  engine named-error/simulation/drop-guard + 3 requireIfExists incl. the
  real Day-29 task flags).
- [x] **D6** Acceptance (2026-09-23) — **zero regressions**:
  - ✅ `tsc` · vitest **605/605** (51 files) · `test:engine` 46/46 ·
    `test:db-lifecycle` 34/34 · `keyword-case` 0 (allowlisted) ·
    `ddl-contracts` 0 blocking = baseline · `equivalence` 28/28 ·
    `equivalence:tasks` 0 · `custom-validators` 17/17 ·
    `verify:curriculum` identical baseline · `all-tasks` **423/424** (same
    Day-45 lab) · `grading-pipeline` **6 = baseline** (D42×4 + D54×2) ·
    `taught` 6 = baseline · `policy` 18 = baseline.
  - ⚠️ `test:module-order` exit 1 **stash-verified as pre-existing baseline**
    (the script still asserts 38 modules vs the 57-module curriculum — a
    stale milestone-4 leftover unrelated to A–D; candidate for a separate
    fix).

## E — Sandbox honesty + grading precision ✅

- [x] **E1** `allowDdlOverwrite` retry honesty — the re-create paths now SAY
  SO in the result row instead of pretending legal SQL:
  - CREATE TABLE → `already existed — dropped and re-created for retry (real
    SQL would error here; use IF NOT EXISTS or DROP TABLE first — §5)`;
  - CREATE INDEX → same shape (`DROP INDEX first`);
  - bare CREATE VIEW → `already existed — replaced for retry (real SQL would
    error without OR REPLACE — §5)`; the legal `CREATE OR REPLACE` path stays
    quiet; first-create text unchanged. A grep proved no test/script asserts
    the old status strings, and statuses are never graded (tables hold data
    rows, not status rows) — solution-sql/all-tasks/pipeline stayed baseline.
- [x] **E2** Policy formalized (GRADING_POLICY Rule 2, "DDL precision" bullet):
  for CREATE/ALTER the SCHEMA is the grade — `requiredColumns` + final-state
  column diff (+ type kinds under `verifyColumnTypes`); `expectedRowCount: 1`
  is only an execution signal and can never carry correctness alone. DIALECT
  §5's CREATE row documents the sandbox re-create behavior.
- [x] **E3** State-diff messages name the empty-table shapes:
  expected-empty vs rows → `should be EMPTY at this step … extra INSERT?`;
  rows-expected vs empty → `missing N row(s) … skip the follow-up INSERT?`
  (replacing count-speak that read like DML advice on schema tasks). The
  existing named messages (missing/extra table, missing/unexpected column,
  type-kind) are pinned by tests — schema diffs, never row counts, decide DDL.
- [x] **E4** `requireIfExists` grading — **landed in Workstream D (D3)**;
  counted here for completeness.
- [x] **E5** Tests: `tests/engine/ddl-honesty.test.ts` — 7 tests (4 sandbox
  honesty incl. strict re-CREATE still erroring + OR REPLACE staying quiet,
  3 state-diff message shapes).
- [x] **E6** Acceptance (2026-09-23) — **zero regressions**: `tsc` · vitest
  **612/612** (52 files) · engine 46/46 · db-lifecycle 34/34 · keyword-case 0
  · ddl-contracts 0 blocking = baseline · equivalence 28/28 · tasks 0 ·
  custom-validators 17/17 · verify baseline output · all-tasks **423/424**
  (same Day-45 lab) · pipeline **6 = baseline** · taught **6 = baseline** ·
  policy **18 = baseline**. (`test:module-order` remains the D-documented
  pre-existing baseline red — stale 38-module script.)

## F — Editor / Explorer scaffold ✅

- [x] **F1** DDL-aware `initialSql` skeletons — all **27** Day-27…30 DDL tasks
  (19 lesson + 8 challenge) now open the editor with structure instead of a
  blank buffer:
  - **CREATE** → table name + one commented `-- column` stub per contract
    column **inside the parens** (leading comments are stripped by
    `splitTaskScaffold`, so the stubs must live in the body). Names only —
    no types, constraints, or values leak (same discoverability line A drew;
    types live in the instructions).
  - **ALTER** → `ALTER TABLE … ADD COLUMN <name>;` — Run-as-is yields D's
    named `Column '<name>' needs a data type …` guidance.
  - **DROP** → plain `DROP TABLE <t>;` — Run-as-is yields D's
    `… doesn't exist. Use DROP TABLE IF EXISTS …` guidance. Starters now
    TEACH through the named-error channel instead of staring at nothing.
  - Guarantee verified: the `initialSql does not already pass` gate is green —
    every lesson starter fails validation with guidance; `solutionSql`
    untouched (solution-sql/all-tasks/pipeline stayed baseline).
- [x] **F2** Explorer expected-schema panel (`#expected-schema-panel` in
  `DatabaseExplorer`):
  - Contract sourced ONLY from the explicit `expectedColumns` prop (=
    `validation.requiredColumns`), **never from `solutionSql`**; DDL-gated in
    `PracticeTaskView` with the same statement classifier the submit pipeline
    uses, so SELECT tasks cannot false-trigger (computed requiredColumns on
    SELECT stay invisible to the panel).
  - `EXPECTED SCHEMA · <table> (not created yet)` for fresh CREATEs — covers
    the explorer's silent `products`-schema fallback that would otherwise
    display another table's columns under the new table's header;
    `EXPECTED COLUMNS · <table> (to be added)` for pending ALTER columns;
    trailing `types & constraints: see the instructions` (types stay where A
    put them — the panel adds no type claims it can't source).
  - Discovered along the way: the task card's meta strip ALREADY lists
    `COLUMNS = requiredColumns` (A's field surfaced in TaskInstructions) —
    the task-card half of the contract was live before F; F delivered the
    explorer half.
  - Scope: the lesson workbench mounts the explorer; challenge tasks
    (incl. Day-30) are covered by their F1 skeleton + instructions. Day-33+
    DDL stays advisory, matching A's blocking scope.
- [x] **F3** Tests: `tests/ui/expected-schema.test.tsx` — 3 tests (panel for
  not-yet-created table, pending-ALTER wording, hidden for SELECT).
- [x] **F4** Acceptance (2026-09-23) — **zero regressions**: `tsc` · vitest
  **615/615** (53 files; initial-sql gate green with all 19 lesson skeletons)
  · keyword-case 0 · ddl-contracts 0 blocking/32 advisory = baseline ·
  verify baseline output · all-tasks **423/424** (same Day-45) · pipeline
  **6 = baseline** · taught **6 = baseline** · policy **18 = baseline** ·
  custom-validators 0/17 · db-lifecycle 34/34 · engine suite/equivalence
  justified-skipped (F touches zero engine files) · module-order remains the
  D-documented pre-existing red.

## Known tooling quirks surfaced during the audits (parked)

- ~~`INTEGER` → `string`~~ / ~~VARCHAR typos silently accepted~~ — **fixed in
  B** (the INTEGER half was a misdiagnosis; see B corrections above).
- Ranged `read_files` (start_line/end_line) returns placeholder content in
  this tooling. PowerShell `Get-Content` slices work but intermittently return
  empty/lost output at high offsets. Fallbacks that worked: `Select-String`
  for line numbers, write a slice to a scratch file + full-read it, or recover
  content from terminal scrollback.
- Batched `run_commands` arrays occasionally execute concurrently and collide
  on the shared terminal — keep gate-run batches ≤ 3 commands.