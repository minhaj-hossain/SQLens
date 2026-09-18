# SQLens Validation & Engine Hardening — Batched Audit Plan

> Living tracker for the validation-audit program initiated 2026-09-18.
> Companion to `docs/IMPROVEMENT_PLAN.md` (curriculum/copy program) — this one
> covers the **grading engine**: validator, parser, executor, state verification,
> and the audit instruments that keep them honest.
>
> **Governing principle (from the audit):** *either evaluate a construct
> correctly, or fail with a NAMED error. Never return a plausible-looking wrong
> answer.* Decision-order corollary: **the dataset verdict decides; construct
> rules advise** unless a task opts into `strictConstruct`.

---

## 0. Instruments — the contract every batch is measured against

| Command | Proves |
|---|---|
| `npm run lint` | Type safety (`tsc --noEmit`) |
| `npm test` | Unit + engine suites (vitest) |
| `npm run verify:curriculum` | Content well-formedness |
| `npx tsx scripts/audit-all-tasks.ts` | Every task's own solution passes its own validator |
| `npm run audit:equivalence` | 18 engine contract probes (S1/S2 honesty) |
| `npm run audit:equivalence:tasks` | Approach-fairness + no-false-accept + strict self-consistency over all 274 exact-result tasks |
| `npm run audit:validation-overlap` | Reproducible task census (343 / 274 / 66 / 3) |
| `npm run audit:keyword-case` | No keyword-matching pattern is case-fragile |
| `npm run audit:all` | All of the above in one gate |

All eight run in CI (`.github/workflows/ci.yml`).

---

## 1. Baseline snapshot (measured, 2026-09-18)

| Gate | Result |
|---|---|
| `tsc --noEmit` | ✅ 0 errors |
| vitest | ✅ 30 files / **325 tests** |
| `verify:curriculum` | ✅ 100% clean |
| Task audit | ✅ **343/343**, 0 failures |
| Engine contract probes | ✅ **18 pass / 0 fail** |
| Keyword-case scan | ✅ 0 findings across 13 SQL-aware files |
| Task equivalence guardrail | ⚠️ 274 tasks / 530 rewrites / **5 findings** → Batches 7–8 |

---

## Batch 1 — Engine honesty ✅ DONE
**Theme:** delete every silent-wrong path in the executor.

- [x] **S1-2** `evaluateWhere` fall-through `return true` removed → named `Unsupported WHERE predicate` error
- [x] **S1-2** `EXISTS` / `NOT EXISTS` implemented with real per-row correlation; `IS [NOT] TRUE/FALSE` added
- [x] **S1-3** unknown functions error by name instead of evaluating to NULL — **both layers**: parser accepts any `NAME(...)`, executor default throws
- [x] **S1-3** registered `SUBSTR`, bare `COALESCE`/`IFNULL`/`NULLIF`/`IF`, `NOW`/`CURDATE`/`CURRENT_DATE`, `DATE_SUB`/`DATE_ADD`
- [x] **S2-4** multi-condition `JOIN … ON a = b AND …` no longer silently drops the extra condition
- [x] **S2-6** `IS NULL` no longer matches `''`; `IS FALSE` no longer matches non-booleans
- [x] **S3-9** LIKE→regex conversion escapes regex metacharacters
- [x] **S3-10** `GROUP BY <position|alias|unknown>` resolves or errors instead of collapsing to one bucket
- [x] Regression suite: `tests/engine/unsupported-constructs.test.ts`
- **Exit:** `npm run audit:equivalence` → 18/18 ✅

## Batch 2 — Decision-first grading ✅ DONE
**Theme:** a provably-correct dataset must never be vetoed by a keyword check.

- [x] **S1-1** `strictConstruct` flag added to `ValidationRule` (default `false`); construct checks deferred and reported as advisory `note:` lines
- [x] **S2-5** `collectQueryFeatures()` walks CTE bodies, subqueries and set-op operands — CTE-wrapped `LIMIT`/`OFFSET`/`ORDER BY`/`GROUP BY` now satisfy their rules
- [x] ORDER BY self-satisfying fallback removed (direction is actually compared)
- [x] **S2-7 / S3-8** double-quoted literals masked; structural checks run on masked SQL (literals/comments can no longer fake a construct)
- **Exit:** the 6 canonical rewrites (alias, GROUP-BY dedupe, CTE-LIMIT, complement-WHERE, operator swap, subquery wrap) pass every exact-result task; strict tasks still enforce ✅

## Batch 3 — Feedback & state verification ✅ DONE
- [x] Dataset-mismatch feedback names the offending row/column/value instead of "values differ"
- [x] **S3-11** `verifyTypes` opt-in for DDL tasks (types compared when they are the lesson)
- [x] **S3-11** reference-solution error now returns a flagged verdict ("report this task") instead of silent pass
- [x] Syntax trap no longer preempts a real parse error
- [x] `docs/DIALECT.md` amended for every newly supported/unsupported construct
- [x] UI views surface the advisory notes (`PracticeTaskView`, `IndependentChallengeView`)

## Batch 4 — Instruments & CI ✅ DONE
- [x] `scripts/probe-equivalence.ts`, `scripts/count-validation-overlap.ts`, `scripts/audit-equivalence.ts` committed and wired to npm scripts
- [x] `.github/workflows/ci.yml` runs every audit instrument on push/PR
- [x] The audit's previously-unverified "CI runs these" claim is now true

## Batch 5 — Keyword-case hardening ✅ DONE
**Theme:** SQL keywords are case-insensitive; a regex without `/i` silently mis-parses.

- [x] **Root cause fixed** — `parser.ts` string-literal-alias regex `^'([^']*)'\s*(?:AS\s+)?([\w_]+)?$` had **no `/i` flag**. With a lowercase `as` the alias was folded into the expression, so the tagged column evaluated to **NULL with no error**:
      ```sql
      SELECT name, 'customer' AS source FROM customers
      UNION ALL
      SELECT name, 'supplier' as source FROM suppliers;   -- source was NULL
      ```
- [x] Same-class defects fixed in learner-facing modules: `sql-explain.ts` (lowercase `case … end` was not described as a CASE expression; word boundaries now also stop a `weekend` column matching `end`) and `parse-truth-eval.ts` (`true`/`false`/`unknown`/`and`/`or`/`not` in lowercase now parse; captured words normalised to the typed uppercase union)
- [x] New instrument `scripts/audit-keyword-case.ts` (`npm run audit:keyword-case`) — flags keyword-matching regexes/comparisons lacking `/i`, honours a **reasoned allowlist**, and reports **stale allowlist entries** as findings
- [x] Instrument **validated against pre-fix code**: flags `parser.ts:492` on `HEAD`, 0 findings on the fixed tree
- [x] Regression tests: 6 cases covering the tagged-UNION family (lowercase `as`, lowercase `union all`, newlines/blank lines, alias without `AS`, three-way tags, `ORDER BY` the tag alias)
- [x] CI gate added
- **Exit:** `npm run audit:keyword-case` → 0 findings; 12-item tagged-UNION matrix green (its one failure is Batch 7's root cause, surfaced as an honest error) ✅

---

## Batch 6 — `strictConstruct` author opt-in ⬜ NOT STARTED
**Why it matters:** Batch 2 made shape rules advisory. **0 tasks currently opt in**, so a lesson whose deliverable *is* the construct will accept a rewrite that skips it.

- [ ] Measured candidate set (**99** exact-graded tasks carry a shape rule):
  - [ ] **`requireSetOp` (12 tasks)** — day-17 UNION / UNION ALL / dedupe / shape-compatibility / EXCEPT lessons, day-32 `sec-c1-t3`. These teach the operator itself → `strictConstruct: true`
  - [ ] **`requiredAliases` (5 tasks)** — day-01 column-aliasing (3), day-01-hw-3, day-06-c1-t2. Aliasing is the deliverable → `strictConstruct: true`
  - [ ] **`requireJoin` / `requireLimit` / `requireDistinct` / `requireCase` (remaining ~82)** — author-by-author review; default stays advisory
- [ ] Verify each opt-in with `npm run audit:equivalence:tasks` (`STRICT_IMPOSSIBLE` means an author enabled a rule their own solution breaks)
- **Exit:** every annotatable task has an explicit decision; guardrail reports 0 `STRICT_IMPOSSIBLE`

## Batch 7 — `SELECT *` must not leak internal keys ⬜ NOT STARTED
**Why it matters:** Day-1 user-visible, and it breaks every CTE/derived-table wrapper. **4 of the 5 current guardrail findings.**

- [ ] Evidence (reproduced):

      | Query | Columns |
      |---|---|
      | `SELECT * FROM students` | **10** — `id, name, …, city, students.id, students.name, …, students.city` |
      | `WITH _v AS (SELECT * FROM students) SELECT * FROM _v` | **20** — the above re-prefixed as `_v.*` |

- [ ] Root cause: the FROM loader mirrors every column as `table.col`/`alias.col` for qualified resolution, and `SELECT *` projects `Object.keys(row)` — so the mirrors become result columns. A CTE body stores those rows and the outer FROM re-prefixes them.
- [ ] **Pre-existing** (confirmed against `HEAD`) — not a regression from Batches 1–5.
- [ ] Fix: strip mirrored qualified keys at projection time so `SELECT *` returns base columns and CTE bodies carry plain rows — while keeping qualified resolution working for `WHERE`/`ORDER BY`/`JOIN ON` (which rely on those mirrors plus the non-enumerable `__source__`).
- [ ] Affected findings to re-check: `day-01/select-all/day01-c3-t1`, `day-05/challenge/day05-hw-1`, `day-07/schema-navigation/day07-c1-t1`, `day-07/challenge/day07-hw-1` (+ the CTE + set-op matrix case)
- **Exit:** `SELECT *` column count equals the schema count; CTE re-wrap findings drop to 0; the day-1 result grid shows no duplicate columns

## Batch 8 — `customValidator` must not scan raw text ⬜ NOT STARTED
- [ ] `day-21/subqueries-not-in-null-trap/day17-c1c-t2` fails a semantically identical derived-table wrapper because the check regex-searches the raw SQL for `product_id IS NOT NULL`
- [ ] Fix: run `customValidator` against the masked SQL (reuse the Batch 2 mask), or express the rule structurally against the parsed query
- **Exit:** `npm run audit:equivalence:tasks` → 5 → 0 findings

## Batch 9 — Residual polish & housekeeping ⬜ NOT STARTED
- [ ] `#` comments: `stripComments` handles them, `hasRealSql` (`split-statements.ts`) does not — align
- [ ] `ORDER BY <aggregate>` unsupported (carried over from the prior audit's F5)
- [ ] Document the `toPrecision(12)` numeric-comparison limits in `docs/DIALECT.md`
- [ ] Commit the whole program (currently uncommitted on `main`)
- **Exit:** `npm run audit:all` green; working tree clean

---

## Recommended execution order

1. **Batch 8** (~1 hour) — closes the last content-grading finding with a small, well-understood change
2. **Batch 7** (~½ day) — highest learner-visible impact; unblocks 4 findings and all CTE wrappers
3. **Batch 6** (~2–3 hours of content review) — 17 tasks already identified, the rest is judgment
4. **Batch 9** (~½ day) — polish, then commit

## Adding a batch
Follow the `docs/IMPROVEMENT_PLAN.md` conventions: a `## Batch N — <theme>` heading
with a one-line **Why it matters**, checkboxed items, and an explicit **Exit**
criteria naming the command that proves completion. Every new engine hazard
should land with (a) a contract probe in `scripts/probe-equivalence.ts` or a
vitest case, and (b) — where a whole hazard *class* is involved — its own audit
instrument wired into `npm run audit:all` and CI.
