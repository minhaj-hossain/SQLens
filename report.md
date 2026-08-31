# Report: Will Every Task Work for Every Valid Approach?

**Scope:** All 341 graded tasks across 38 modules — a robustness audit of "can different users solve the same task in different (but correct) ways and still pass?"

**Method:**
1. Static analysis of the validation engine (`src/lib/sql-engine/validator.ts`) and every task's `validation` config (data-driven tally over `src/content/modules/*`).
2. Empirical probing: executed the real `solutionSql` and alternate formulations (equivalent rewrites + deliberately wrong ones) through the actual validator via `scripts/_probe-equivalence.ts` (2 rounds, ~30 probes).
3. Cross-checked against the existing engine test suite (`tests/engine/`, 130 tests passing).

---

## 1. Executive Summary

**Verdict: SELECT-side grading (272 tasks) is strongly approach-fair. DML/DDL grading (66 tasks, Days 25–33) has confirmed false-accepts — wrong solutions pass. Plus a handful of confirmed false-rejects of correct alternative approaches.**

| Class | Tasks | Grading method | Alternative-approach behavior |
|---|---|---|---|
| A — Dataset-graded | 272 (80%) | `requireExactResult`: learner output compared to solution output | Mostly fair ✅ — multiset comparison, alias/column-order/join-order insensitive; a few confirmed unfair rejects ⚠️ |
| B — Expect-failure | 3 | Query must produce an engine error | Fair ✅ |
| D — Structural-only | 66 (19%) | Clause presence + row/affected-count only | **Confirmed false-accepts** 🔴 — wrong SQL passes on Days 25–33 |

The task classes map cleanly onto the curriculum: **every task on Days 1–24, 34, 35, 37, 38 is class A or B** (result-graded, approach-fair). All 66 class-D tasks are concentrated in **Days 25–33** (DML, transactions, DDL, normalization, indexing, security, capstone) plus 2 on Day 36 — exactly the modules where the result *is* a mutation, so dataset comparison was intentionally disabled.

---

## 2. How Grading Actually Works

The validator (`validator.ts`) runs a rule pipeline per task, in order:

| # | Rule | Tasks using it | Purpose |
|---|---|---|---|
| 1 | `expectFailure` | 3 | Query must error (e.g., invalid DDL lessons) |
| 2 | quote-reminder pre-check | — | Friendly hint for unquoted text values |
| 3 | `targetTable` | 329 | FROM-table sanity (with feedback) |
| 4 | `requireWhere` / `whereContainsTerms` | 94 / 42 | Force filtering; literal term match |
| 5 | `requireJoin` | 46 | Force JOIN keyword |
| 6 | `requireGroupBy` / `requireHaving` | 47 / 11 | Force aggregation clauses |
| 7 | `requireLimit` / `requireOffset` | 23 / 5 | Force pagination |
| 8 | `requireOrderBy` | 42 | Force sorting (+ direction); switches exact-result to ordered compare |
| 9 | `requireFunction` / `requireCase` / `requireSetOp` / `requireDistinct` | 45 / 14 / 12 / 6 | Force the taught construct |
| 10 | `requiredColumns` / `requiredAliases` / `forbiddenColumns` | 189 / 5 / 6 | Shape of SELECT list |
| 11 | **`requireExactResult`** | 272 | Executes `solutionSql`, compares learner's dataset to it |
| 12 | `expectedRowCount` | ~all | Row-count guard (also the blast-radius guard for DML) |
| 13 | `customValidator` | 17 | Task-specific logic (e.g., EXPLAIN plan checks on Day 31) |

**The exact-result comparison (rule 11) is the fairness core:**

- Expected output is computed by executing the task's own `solutionSql` — only legal for single read-only statements (a documented invariant: computing expected output must never mutate the session DB; this is *why* Days 25–33 can't use it).
- Column **count** must match; column names/order/aliases **don't** matter.
- Rows are compared as a **sorted value-multiset** — row order doesn't matter — *unless* `requireOrderBy` is set (40 tasks, sorting lessons), where order matters too.
- Each cell is serialized: numbers as `'n:' + String(v)`, dates as ISO, everything else as string.

---

## 3. What Is Genuinely Approach-Fair (verified, not assumed)

These alternate formulations were **executed against the real validator and PASSED**:

- Decimal literals: `WHERE price < 50.00` vs `< 50` ✅
- `1.1` vs `1.10` arithmetic literal in UPDATE ✅
- CTE benchmark instead of scalar subquery (`WITH avg AS … CROSS JOIN`) ✅
- Operator equivalences covered by the existing suite (9 tests): `!=` vs `<>`, `IN` vs `OR`-chain, `BETWEEN` vs compound range, alias renames, explicit `INNER`, positional ORDER BY, aggregate-alias tolerance in HAVING/ORDER BY ✅
---

## 4. Confirmed Findings

### 🔴 F1 — Days 25–33 (66 tasks): wrong solutions pass (false-accepts)

Structural-only grading verifies *that* a statement ran and touched N rows, not *what* it changed. Probes executed through the real validator:

| Task | Deliberately wrong solution | Result |
|---|---|---|
| `day19-hw-1` (INSERT, Day 25) | Only 4 of 6 required columns supplied | **PASS** ❌ |
| `day19-hw-2` (UPDATE price ×10%, Day 25) | Hard-coded value (`SET price = 17.58`) instead of arithmetic | **PASS** ❌ |
| `day19-hw-2` | Arithmetic applied to the *wrong column* (`SET reorder_level = reorder_level * 1.10`) | **PASS** ❌ |
| `day19-hw-2` | `WHERE product_id = 999` (no such row) | **PASS** ❌ (row-count semantics not enforced on actual change) |

This is the single biggest hole: a learner can "complete" all of Day 25 and much of Days 26–33 with SQL that would be fired on the spot in a real job. It's a *design* consequence (correct — dataset comparison can't run on mutating statements), not a bug, but the fix is well-known: **state verification** — clone the seeded DB (or replay the seed), run the learner's statement, then run a checker `SELECT` and compare against the solution's post-state.

### 🔴 F2 — Float-exact comparison: no epsilon (21 tasks at risk)

`serializeValue` maps numbers via `String(v)` — bit-exact. Any alternate-but-correct arithmetic formulation that produces a 1-ulp float difference is rejected as "values differ." 21 tasks have `AVG`/division/rounding in their solution (Days 9, 10, 12, 17, 18, 20, 24, 37 — e.g., `day09-hw-2`, `day17-hw-1`, `gauntlet-t2`). One probe round produced exactly this signature: a CTE reformulation of `day17-hw-1` was rejected with *"row count was right but one or more values differ"* while an equivalent CROSS-JOIN formulation passed. Whether a learner hits this depends on their arithmetic formulation — a live lottery on those 21 tasks.

**Fix:** compare numerics with tolerance (e.g., `Math.abs(a-b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))`) inside `serializeValue`/row-key construction.

### ⚠️ F3 — `whereContainsTerms` is literal substring matching (42 tasks)

Confirmed rejects of logically identical filters:
- `WHERE NOT (price >= 50)` → rejected: *"Your filter should use '<' to check the condition."*
- `WHERE 50 > price` (reversed operands) → rejected, same message.

The dataset is identical; only the surface syntax differs. Low severity (the lesson *is* teaching `<`), but the feedback implies the learner is wrong when they are right. Either accept parsed equivalents or reword feedback to "this task asks you to practice the `<` operator."

### ⚠️ F4 — `requireGroupBy` blocks correct non-aggregate approaches (anti-join tasks)

`day16-hw-4` (Day 20, "suppliers whose products never ordered"): both canonical alternates — `NOT EXISTS` and `LEFT JOIN … IS NULL` — are rejected *"This task requires aggregating rows using GROUP BY"*, because the rule is checked before any dataset comparison. The solution happens to use GROUP BY; the alternates don't need it. Same pattern likely on other anti-join deliverables (Day 18 Report 3, Day 20 Deliverable 4).

**Fix:** when `requireExactResult` passes, structural clause rules that the *solution* merely happens to satisfy (GROUP BY) should be advisory.

- Multiset row comparison means: join order, GROUP BY column order, alias choice, column order in SELECT — all accepted as long as the dataset matches ✅
- Wrong approaches correctly rejected: `UPDATE` without WHERE (28 rows vs 1) → rejected by row-count blast-radius guard ✅; incomplete SELECT lists, wrong functions, missing clauses → rejected with actionable feedback ✅

The 130-test suite (15 files) already includes a dedicated approach-equivalence harness (`tests/engine/equivalence.test.ts`) — this audit's probes extend it rather than contradict it.
### ⚠️ F5 — Engine cannot `ORDER BY` an aggregate expression

`ORDER BY SUM(oi.quantity) DESC` (no alias) → engine error *"ORDER BY column 'SUM(oi.quantity)' not found in the query output."* MySQL accepts this; the lesson solutions always alias, and learners are taught to alias — but a learner who writes the MySQL-legal unaliased form gets an engine error instead of a pass. Engine limitation, medium-low frequency.

### ⚠️ F6 — `targetTable` feedback is misleading on reordered joins

On Day 18 exact-result tasks, a correct-dataset query with a different FROM order was rejected with *"You are querying the table 'customers', but this task requires querying the 'products' table"* — a message that misdescribes both the error and the fix. (Note: some round-1 probe variants here were themselves incomplete — missing LIMIT — so the *rejection* was often correct; the *message* is the confirmed problem.)

### ℹ️ F7 — Pedagogically-justified strictness (working as intended, documented)

- `requireFunction: 'DENSE_RANK'` rejects the `COUNT(DISTINCT)+1` rewrite — correct for a window-functions lesson; the ranking technique is the deliverable.
- `requireJoin` rejects comma-joins — correct; explicit JOIN syntax is the taught and safer standard.
- Ordered comparison on the 40 sorting tasks, `requireCase`, `requireSetOp` — all pin the *taught construct*, consistent with the curriculum contract.

---

## 5. Coverage Map (per module)

- **Days 1–24 + 34, 35, 37, 38:** 100% class A/B — result-graded, approach-fair, with findings F2–F6 as the only risk surface.
- **Days 25–33:** class-D concentration — Day 25 (8), 26 (7), 27 (7), 28 (9), 29 (8), 30 (4), 31 (5 — its custom-validated EXPLAIN checks are solid), 32 (3), 33 (13), plus 2 on Day 36.
- **Day 31** is the model to copy: its custom validators assert EXPLAIN plan shape (`type` becomes `ref`, etc.) — i.e., they verify *state/behavior*, not just statement shape.

---

## 6. Recommendations (prioritized)

| # | Priority | Action | Effort |
|---|---|---|---|
| 1 | **P0** | **State verification for DML/DDL (F1):** clone/replay the seed DB in a sandbox, run the learner's statement, run a checker SELECT, compare post-state to solution post-state. Add per-task `checkSql` for the 66 class-D tasks. | High |
| 2 | **P0** | **Float epsilon in row comparison (F2):** tolerance-based numeric equality in `serializeValue`. Add regression probes for the 21 float tasks. | Low |
| 3 | P1 | Make `requireGroupBy`-style clause rules advisory once exact-result passes (F4) — or keep them only on guided tasks where dataset comparison doesn't apply. | Medium |
| 4 | P1 | Extend `tests/engine/equivalence.test.ts` with this audit's probes as permanent regression tests (currently the probes live in a throwaway script). | Low |
| 5 | P2 | Reword `whereContainsTerms` feedback to name the practice goal instead of implying wrongness (F3), or parse comparison operands. | Low |
| 6 | P2 | Support `ORDER BY <aggregate expr>` in the engine (F5). | Medium |
| 7 | P3 | Improve `targetTable` feedback for multi-join queries (F6): detect all joined tables before complaining. | Low |

---

## 7. Bottom Line

**Will all tasks work if users solve them differently?** For the 275 SELECT-side tasks (Days 1–24, 34–38): **yes, with high confidence** — the grading core compares results, not SQL text, and the confirmed unfair-reject surface is small (float bit-exactness on 21 tasks, literal term matching on 42, GROUP BY pinning on a few anti-join tasks, one engine ORDER BY gap).

For the 66 mutation-side tasks (Days 25–33): **the happy path works, but grading does not actually verify correctness** — confirmed probes show wrong statements passing. Until state verification (Rec #1) lands, a learner can finish the DML/DDL half of the course with objectively broken SQL. That is the one finding that meaningfully answers "would all the tasks work?" with a "not yet."

