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

## D — Professional DDL coverage (engine + DIALECT) ⬜ NOT STARTED

- [ ] DIALECT §5 support matrix: `IF [NOT] EXISTS` CREATE-side contract;
  supported ALTER sub-forms; explicit UNSUPPORTED list with NAMED errors
  (today `Unsupported DDL` is generic; `DROP COLUMN`/`RENAME`/`MODIFY`/
  `ADD CONSTRAINT`/`TRUNCATE`/`ON DELETE CASCADE` unsupported).
- [ ] Option 1 (docs + named errors) vs Option 2 (implement) — decide.

## E — Sandbox honesty + grading precision ⬜ NOT STARTED

- [ ] `allowDdlOverwrite` retry note ("real DBs would need IF NOT EXISTS").
- [ ] `expectedRowCount:1` no longer the primary DDL signal (state +
  requiredColumns now carry it — mostly landed with A4; formalize policy).
- [ ] `requireIfExists?: boolean` validator flag so Day 29 idempotency lesson
  is graded, not masked.

## F — Editor / Explorer scaffold ⬜ NOT STARTED

- [ ] DDL-aware `initialSql` skeleton (table name + commented column stubs —
  no answers).
- [ ] Explorer "expected schema" panel sourced from `requiredColumns`.

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