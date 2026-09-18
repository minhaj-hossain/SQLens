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
| Engine contract probes | ✅ **25 pass / 0 fail** |
| Keyword-case scan | ✅ 0 findings across 13 SQL-aware files |
| Task equivalence guardrail | ✅ 274 tasks / 530 rewrites / **0 findings** |

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

## Batch 6 — `strictConstruct` author opt-in ✅ DONE
**Why it mattered:** Batch 2 made construct rules advisory when the dataset matches. On a lesson whose *subject* is the construct, an equivalent formulation that skips it was a false accept.

- [x] **Census corrected.** The original plan counted 99 tasks as "now advisory". Re-checking the validator showed **`requiredAliases` was never advisory** — it is checked against the returned column names and fails *immediately* (not via the deferred `constructFailures` list). The genuinely advisory rules are the deferred ones: `requireJoin`, `requireGroupBy`, `requireHaving`, `requireCase`, `requireFunction`, `requireSetOp`, `requireLimit`, `requireOffset`, `requireOrderBy`, `requireDistinct`, `requireWhere`, `whereContainsTerms`.
- [x] **Criterion (auditable, not vibes):** opt in when the *concept* is named after / dedicated to the construct, or it is that construct's module challenge. Where the construct is merely a means to a report, the dataset self-verifies it and the rule stays advisory.
- [x] **47 tasks opted in** across 7 module files, applied by `scripts/apply-strict-construct.ts` (idempotent, dry-run by default, prints its reasoning):

      | Scope | Tasks |
      |---|---|
      | `day-17` (all set-op concepts) + `day-32/sec-injection` | 12 |
      | `day-10` (conditional-logic module) | 14 |
      | `day-04` distinct-deduplication + challenge | 3 |
      | `day-04` limit-and-offset | 2 |
      | `day-09` grouping/having + challenge | 7 |
      | `day-12` group-by-date-parts + challenge | 3 |
      | `day-14` (JOIN module) | 6 |

- [x] **Value proven, not assumed** — 6 same-dataset false accepts are now closed (each returned identical rows and previously PASSED):

      | Task | Rewrite that produced identical data | Before | Now |
      |---|---|---|---|
      | `day-17/union-all/union-all-t1` | `UNION ALL` → `UNION` | passed | **rejected** |
      | `day-17/union-dedupe/union-dedupe-t2` | `UNION` → `UNION ALL` | passed | **rejected** |
      | `day-17/shape-compatibility/shape-compat-t1` | `UNION ALL` → `UNION` | passed | **rejected** |
      | `day-17/shape-compatibility/shape-compat-t2` | `UNION ALL` → `UNION` | passed | **rejected** |
      | `day-17/challenge/setops-hw-1` | `UNION ALL` → `UNION` | passed | **rejected** |
      | `day-32/sec-injection/sec-c1-t3` | `UNION` → `UNION ALL` | passed | **rejected** |
      | `day-04/distinct-deduplication/day04-c2-t1` (+t2, hw-2) | `DISTINCT` → `GROUP BY` | passed | **rejected** |

- [x] **Two cases deliberately left advisory** (documented so they are not mistaken for oversights): `day-07/challenge/day07-hw-3` and `day-08/challenge/day08-hw-2` accept `DISTINCT` ≡ `GROUP BY`. Their modules are not DISTINCT lessons — the ask is the *result*, and `DIALECT.md` says an equivalent route has succeeded. `day-08/milestone-1-eval/day08-c1-t2` cannot even be rewritten (`ORDER BY <expression>` is unsupported — Batch 10).
- [x] 5 new vitest cases: advisory default accepts with a `note:`, strict rejects the identical dataset, strict still accepts the required construct, and a content guard asserting the opt-in set (≥47, including the critical ids) so it cannot silently regress
- **Exit:** `npm run audit:equivalence:tasks` → 0 findings, no `STRICT_IMPOSSIBLE` ✅ ; task audit 343/343 ✅ ; `npm run audit:all` green ✅

### Batch 6 follow-up backlog (reviewed, intentionally advisory)
`requireJoin` (39), `requireGroupBy` (38), `requireFunction` (46), `requireWhere` (87), `whereContainsTerms` (42), `requireOrderBy` (41), `requireLimit` (21), `requireDistinct` (3) — the construct is a means; the returned dataset encodes the work, so a same-dataset skip is rare. Revisit only if a concrete false accept is observed.

## Batch 7 — `SELECT *` must not leak internal keys ✅ DONE
**Why it mattered:** Day-1 user-visible, and it broke every CTE/derived-table wrapper. Was **4 of the 5** guardrail findings.

- [x] Evidence (reproduced before the fix):

      | Query | Columns |
      |---|---|
      | `SELECT * FROM students` | **10** — `id, name, …, city, students.id, students.name, …, students.city` |
      | `WITH _v AS (SELECT * FROM students) SELECT * FROM _v` | **20** — the above re-prefixed as `_v.*` |

- [x] Root cause: the FROM loader mirrors every column as `table.col`/`alias.col` for qualified resolution, and the `SELECT *` branch projected `Object.keys(row)` — so the mirrors became result columns. A CTE body stored those rows and the outer FROM re-prefixed them.
- [x] **Pre-existing** (confirmed against `HEAD`) — not a regression from Batches 1–5.
- [x] Fix: `isInternalMirrorKey()` + the `SELECT *` branch builds a base-column projection and re-attaches the non-enumerable `__source__` so `ORDER BY <qualified name>` still resolves.
- [x] Bonus fix: `WITH c AS (SELECT name, 'customer' AS source …) SELECT * FROM c UNION ALL …` used to fail with a bogus *"left side: 4, right side: 2"* shape error — now passes (the mirrors were faking extra columns).
- [x] 3 new CONTRACT probes + 1 BASELINE probe in `scripts/probe-equivalence.ts` (18 → 22 probes)
- [x] 5 new vitest cases in `tests/engine/unsupported-constructs.test.ts`
- [x] `tests/engine/ddl-constraints.test.ts` corrected — it had encoded the buggy shape while *documenting* that parity was the point; it now asserts the projection equals the registered schema columns
- **Exit:** `npm run audit:equivalence:tasks` → 5 → **1 finding** ✅ ; `SELECT *` column count equals the schema count ✅

## Batch 8 — Unaliased `JOIN … ON` silently returned no rows ✅ DONE
**Why it mattered:** silent wrong answers on textbook SQL — the exact class this program exists to eliminate.

- [x] Evidence (reproduced before the fix):

      | Query | Before | After |
      |---|---|---|
      | `SELECT COUNT(*) FROM customers JOIN orders ON customers.customer_id = orders.customer_id` | **0** (silently) | **18** ✅ |
      | `SELECT COUNT(*) FROM orders JOIN order_items ON orders.order_id = order_items.order_id` | **0** (silently) | **29** ✅ |
      | `SELECT COUNT(*) FROM customers LEFT JOIN orders ON customers.customer_id = orders.customer_id` | **15**, every right side NULL | **21** (18 matched + 3 order-less) ✅ |

- [x] Root cause (`parser.ts`, JOIN parsing): the alias group `(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?` greedily captured the keyword **`ON`** as the table alias when no alias was written, so the parsed join was `{ alias: 'ON', onLeft: '', onRight: '' }`. The matcher had no equality to test and produced no rows. Curriculum solutions all use aliases, which is why the 343-task audit never caught it.
- [x] Fix (parser): split the `ON` clause off **first**, then tokenise table + optional alias; a captured alias is accepted only if it is not a clause keyword (`NON_ALIAS_WORDS` / `normalizeTableAlias`). The first equality still populates `onLeft`/`onRight`; everything else stays in `onCondition`.
- [x] Fix (executor): when there is no fast-path equality, evaluate the **whole** ON predicate against the merged row. A JOIN with no ON condition at all raises `JOIN on '<table>' is missing an ON condition` instead of returning an empty set.
- [x] 3 new CONTRACT probes (22 → 25 probes); 6 new vitest cases (unaliased ≡ aliased row-for-row, LEFT JOIN padding, missing-ON error, extra `AND` terms)
- [x] `docs/DIALECT.md`: joins table now states the alias is optional and `JOIN … USING (col)` is unsupported (errors by name)
- **Exit:** unaliased ≡ aliased for INNER/LEFT/RIGHT/FULL ✅ ; `npm run audit:all` green ✅

## Batch 9 — `customValidator` could not see nested clauses ✅ DONE
**Why it mattered:** the last remaining guardrail finding — a correctly-solved task was falsely rejected.

- [x] **Correction to the original label:** this was *not* raw-text scanning. The authored check read `queryAst.whereClause`, i.e. the **top-level** statement only, so `WITH _v AS (SELECT … WHERE product_id IS NOT NULL) SELECT … FROM _v` reported *"the filter is missing"* although the semantics are identical.
- [x] Fix (engine): `QueryFeatureSet.whereClauses` now collects **every** WHERE clause in the query shape (top level, CTE bodies, set-operation operands, derived tables) with string literals blanked; `customValidator` receives it as a third argument (`(queryAst, result, features)`).
- [x] Fix (content): `day-21/day17-c1c-t2` now tests `features.whereClauses` instead of only the top-level clause.
- [x] 4 vitest cases: flat form passes, CTE-wrapped form passes, a genuinely unfiltered query still fails, and a **string literal containing `IS NOT NULL` cannot fake the filter** (literals are blanked)
- **Exit:** `npm run audit:equivalence:tasks` → 1 → **0 findings** ✅ ; `npm run audit:all` fully green ✅

## Batch 10 — Residual polish & housekeeping ⬜ NOT STARTED
- [ ] `#` comments: `stripComments` handles them, `hasRealSql` (`split-statements.ts`) does not — align
- [ ] `ORDER BY <aggregate>` unsupported (carried over from the prior audit's F5)
- [ ] Document the `toPrecision(12)` numeric-comparison limits in `docs/DIALECT.md`
- [ ] **Watch item — one flaky vitest failure observed.** During Batch 6 verification the full suite reported `1 failed | 343 passed (344)` on a run that took 11.96s (vs 8.20s normally); **4 subsequent runs were clean (344/344)**. The correlation with run duration points at a per-test timeout under load rather than a logic failure. Identify and harden that test so CI cannot flake.
- **Exit:** `npm run audit:all` green; working tree clean

---

## Recommended execution order

1. **Batch 10** (~½ day) — residual polish (`#` comments, `ORDER BY <aggregate>`, `toPrecision(12)` docs)

**Commit policy:** each batch is committed on completion with its verification
results in the message (Batches 1–9 are already committed).

## Adding a batch
Follow the `docs/IMPROVEMENT_PLAN.md` conventions: a `## Batch N — <theme>` heading
with a one-line **Why it matters**, checkboxed items, and an explicit **Exit**
criteria naming the command that proves completion. Every new engine hazard
should land with (a) a contract probe in `scripts/probe-equivalence.ts` or a
vitest case, and (b) — where a whole hazard *class* is involved — its own audit
instrument wired into `npm run audit:all` and CI.
