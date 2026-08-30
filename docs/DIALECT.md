# SQLens Supported SQL Dialect

> **Status: Normative.** Every engine feature (parser, executor, validator) and every
> curriculum example must conform to this document. If a feature isn't listed here,
> it doesn't exist yet — propose an amendment (PR + test cases) before authoring
> content that uses it.
>
> Rationale: without a single canonical dialect the engine becomes a collection of
> syntax exceptions and learners meet contradictions between lessons. SQLens teaches
> **one consistent dialect** derived from the MySQL family (the most common beginner
> target), with documented deviations.

---

## 1. Canonical base

| Aspect | Ruling |
|---|---|
| Family | MySQL-flavored core |
| Identifiers | Bare names; backticks tolerated and stripped |
| String literals | Single quotes (`'Dhaka'`). Double quotes tolerated in filtering contexts |
| Case sensitivity | Keywords case-insensitive; identifiers matched case-insensitively |
| Statement terminator | `;` optional everywhere |
| Aliases | `AS alias` (alias without AS tolerated); aliases are output-only |

## 2. Feature registry (engine support status)

### Supported (verified by tests)

| Feature | Canonical form | Notes |
|---|---|---|
| Projection | `SELECT cols FROM t` | `*`, multiple columns, aliases |
| Filtering | `WHERE` with `=`, `!=`/`<>`, `>`, `<`, `>=`, `<=` | strict vs inclusive boundary semantics are **taught explicitly** (Day 2) |
| Boolean logic | `AND`, `OR`, `NOT`, parentheses | AND binds tighter than OR (Day 3) |
| Ranges / sets | `BETWEEN x AND y` (inclusive both ends), `IN (…)`, `NOT IN (…)` | NOT IN + NULL trap is a taught concept (Day 17) |
| Pattern match | `LIKE` with `%` (any length) and `_` (exactly one char) | |
| NULL | `IS NULL`, `IS NOT NULL` | 3-valued logic; `= NULL` never matches (taught, never accidental) |
| Shaping | `ORDER BY … ASC/DESC`, multi-key sort, `DISTINCT`, `LIMIT n`, `OFFSET m` | |
| Aggregates | `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)`, `MIN`, `MAX`, `SUM`, `AVG` | NULL-aware semantics taught (Day 9) |
| Grouping | `GROUP BY`, `HAVING` | WHERE = rows, HAVING = groups |
| Joins | `INNER JOIN`, `LEFT JOIN` (OUTER tolerated), table alias | anti-join pattern `LEFT JOIN … WHERE right.pk IS NULL` (Day 14) |
| Subqueries | scalar subquery in comparison, `IN (SELECT …)`, correlated subquery (category-idiom) | Day 17 |
| CTEs | `WITH name AS (SELECT …)` | Day 17 |
| DML | `INSERT INTO t (cols) VALUES (…)`, `UPDATE t SET … WHERE …`, `DELETE FROM t WHERE …` | unguarded UPDATE/DELETE taught as a *bug* (Day 19) |
| DDL | `CREATE TABLE`, constraints, `ALTER TABLE … ADD`, `DROP TABLE [IF EXISTS]` | Day 20; see §5 |
| Introspection | `EXPLAIN SELECT …` | **simulated plan model**, see §6 |

### Planned (engine work scheduled, not yet built)

`CASE WHEN` (Batch 3), string functions `UPPER/LOWER/TRIM/CONCAT/SUBSTRING/LENGTH`
(Batch 3), date components + `DATEDIFF` (Batch 5), `UNION ALL`/`UNION`/`EXCEPT`
(Batch 5), window functions `ROW_NUMBER/RANK/DENSE_RANK` (Batch 7), `LAG`/`LEAD`
+ running aggregates (Batch 7), frame clauses (`ROWS BETWEEN …`, advanced-preview
only), `BEGIN/COMMIT/ROLLBACK` + multi-row `INSERT` (Batch 9), `WITH RECURSIVE`
(only if the optional recursion module is approved).

### Explicitly out of scope

`INTERSECT` (no teaching module yet — never build engine features ahead of
pedagogy), stored procedures, triggers, views, user management, transaction
isolation levels beyond the taught atomicity model.

## 3. Naming and identity rules (engine-adjacent)

- Curriculum module **IDs are semantic and immutable** (`case-conditional-logic`),
  never positional. Ordering uses `curriculumOrder`
  (`src/lib/curriculum/module-order.ts`).
- The 25 legacy IDs (`day-01` … `day-25`) are grandfathered and frozen — stored
  progress references them.

## 4. Dates — canonical forms

| Concept | Canonical | Accepted | Not supported |
|---|---|---|---|
| Today | `CURDATE()` | — | `NOW()`, `CURRENT_DATE` |
| Relative window | `CURDATE() - INTERVAL 30 DAY` | `>= 'YYYY-MM-DD'` literals | `DATE_SUB` |
| "Today" value | `SIMULATED_TODAY` = `'2026-08-24'` (`src/config/simulated-date.ts`) | — | real system clock |

**Determinism rule:** the engine never reads the wall clock. All temporal content is
authored against `SIMULATED_TODAY`, chosen to sit just after the newest seed order
(2026-08-21). If seed dates change, `SIMULATED_TODAY` changes in the same commit.

## 5. DDL dialect notes

Day 20's syntax is MySQL family (`AUTO_INCREMENT`, `DEFAULT CURRENT_TIMESTAMP`).
When content touches dialect variance, authors add a **dialect note** callout
(e.g. PostgreSQL: `GENERATED … AS IDENTITY` / `SERIAL` instead of
`AUTO_INCREMENT`). Dialect notes are informational only — tasks always validate
against the canonical form.

## 6. EXPLAIN — the simulation contract

SQLens teaches query plans through a **defined simulation**, and says so in content
("simplified query-plan simulation"). Contract:

| Situation | Reported plan |
|---|---|
| Filtered/ordered column has no index (or no WHERE) | `type: ALL` (full table scan) |
| Filtered column has an index, equality (`=`) | `type: ref` (index lookup) |
| Filtered column has an index, range (`>`,`>=`,`<`,`<=`,`BETWEEN`,`IN`,`LIKE`) | `type: range` (index range scan) |
| Filtered column is the PRIMARY KEY / unique, equality (`=`) | `type: const` |

Any future change to this model updates this table **and** the teaching content in
the same change — the two must never diverge.

## 7. Validation philosophy

- **Semantics over syntax.** Validators check the *result and required constructs*
  (`requiredColumns`, `requireJoin`, `requireHaving`, row counts, …) — never a unique
  syntactic shape. Multiple correct formulations of the same business question must
  all pass (e.g. second-highest price via subquery *or* `DISTINCT … LIMIT 1 OFFSET 1`).
- Solution SQL is a *reference answer*, not the only accepted answer.

