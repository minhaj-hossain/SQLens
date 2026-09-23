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

## B — Datatype grading (engine) ⬜ NOT STARTED

Planned (from the audit plan):
- [ ] Canonical `DATA_TYPE_KINDS` map in `executor.parseColumnDefs` — unknown
  type → named error with suggestion (today `VARCHR(20)` silently becomes
  `string`; `INTEGER` falls through to `string` because `'INTEGER'.includes('INT')`
  is false — reproduce & fix).
- [ ] Missing datatype → error (`CREATE TABLE t (id)` currently defaults to
  TEXT silently).
- [ ] Enable/wire `verifyColumnTypes` coverage guarantees + audit hook for
  justification comments (policy already allows 27-29).
- [ ] Tests: missing-type, typo-type, INT→VARCHAR rejected, VARCHAR(50)≡VARCHAR(200).

## C — Keyword / highlight / format / autocomplete parity ⬜ NOT STARTED

- [ ] `src/lib/sql-keywords.ts` single source (keywords + data types + DDL
  modifiers), consumed by `highlight-sql.ts`, `format-sql.ts`, `autocomplete.ts`.
- [ ] Data types (`INT`, `VARCHAR`, `DECIMAL`, `DATETIME`, `BOOLEAN`, `TEXT`…)
  highlight as `.text-code-kw`; `IF [NOT] EXISTS`, `OR REPLACE`, `CASCADE`…
- [ ] Format: uppercase types/modifiers.
- [ ] Autocomplete: DDL contexts (after `CREATE TABLE (` → types; after type →
  constraint keywords; after `DROP TABLE` → `IF EXISTS`).
- [ ] Snapshot tests for highlight + format.

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

## Known engine quirks surfaced during the audit (parked for B)

- `INTEGER` type normalizes to `string` (no `INT` substring) — `executor.ts`.
- `VARCHAR`-family typos fall through to `string` with no error.
- Ranged `read_files` (start_line/end_line) returned placeholder content in
  this repo's tooling; PowerShell `Get-Content -Skip/-First` used instead —
  note for future audits.