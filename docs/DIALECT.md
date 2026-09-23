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
| String literals | Single quotes (`'Dhaka'`). Double quotes tolerated **everywhere** (masked like single quotes in all structural checks) |
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
| Pattern match | `LIKE` with `%` (any length) and `_` (exactly one char) | every other character is **literal** — `LIKE 'a.c'` does not match `abc` |
| NULL | `IS NULL`, `IS NOT NULL` | 3-valued logic; `= NULL` never matches (taught, never accidental). **Only the absent value is NULL — `''` IS NOT NULL** |
| Boolean predicates | `col IS TRUE`, `col IS FALSE`, `IS NOT TRUE/FALSE` | only boolean-ish values (true/false, 1/0) satisfy them; a non-boolean is *neither*, so `city IS FALSE` matches nothing |
| Shaping | `ORDER BY … ASC/DESC`, multi-key sort, `DISTINCT`, `LIMIT n`, `OFFSET m` | a sort key may be an output column, a SELECT alias, a **positional index**, a projected **expression/aggregate** (`ORDER BY COUNT(*)`, `ORDER BY AVG(price)`) or a **function expression evaluated per row** (`ORDER BY UPPER(name)`) — see §7 for the sort-key contract |
| Aggregates | `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)`, `MIN`, `MAX`, `SUM`, `AVG` | NULL-aware semantics taught (Day 9) |
| Grouping | `GROUP BY`, `HAVING` | WHERE = rows, HAVING = groups. Keys may be a column, an expression, a **positional index** (`GROUP BY 1`) or a **SELECT alias**; an unresolvable key is an ERROR, never a silent single-bucket collapse |
| Joins | `INNER JOIN`, `LEFT JOIN` (OUTER tolerated), table alias | anti-join pattern `LEFT JOIN … WHERE right.pk IS NULL` (Day 14). `RIGHT`/`FULL`/`CROSS` execute but are not taught. Multi-condition `ON a = b AND …` is fully evaluated — no term is dropped. An **alias is optional**: `JOIN orders ON customers.customer_id = orders.customer_id` behaves identically to the aliased form. `JOIN … USING (col)` is **not supported** and errors by name — use an explicit `ON` |
| Subqueries | scalar subquery in comparison, `IN (SELECT …)`, correlated subquery (category-idiom) | Day 17 |
| Existence | `EXISTS (SELECT …)`, `NOT EXISTS (SELECT …)` | correlated via outer alias; the canonical anti-join alternative to `LEFT JOIN … IS NULL` |
| CTEs | `WITH name AS (SELECT …)` | Day 17. Clause rules (LIMIT/OFFSET/ORDER BY/GROUP BY) are satisfied by a clause **anywhere** in the query shape — a CTE-wrapped `LIMIT 3` is still a LIMIT |
| Set operations | `UNION`, `UNION ALL`, `EXCEPT`, `INTERSECT` | `UNION ALL` and `UNION` are distinct requirements (a task asking for `UNION` is not satisfied by `UNION ALL`). `INTERSECT` executes but has no teaching module |
| Conditional logic | `CASE WHEN … THEN … ELSE … END` | incl. `CASE` inside an aggregate (`SUM(CASE WHEN … THEN 1 ELSE 0 END)`) |
| String functions | `UPPER`, `LOWER`, `TRIM`, `LENGTH`, `CONCAT`, `SUBSTRING`/`SUBSTR` | one consistent spellings set; synonyms resolve to the same behavior |
| Date functions | `YEAR`, `MONTH`, `DAY`, `EXTRACT(YEAR FROM col)`, `DATEDIFF`, `DATE_ADD`/`DATE_SUB`, `NOW()`/`CURDATE()`/`CURRENT_DATE` | `NOW()`/`CURRENT_DATE` are `CURDATE()` synonyms anchored to `SIMULATED_TODAY` (see §4) |
| NULL functions | `COALESCE`, `IFNULL`, `NULLIF`, `IF()` | `COALESCE(<agg>(x), fallback)` is also supported in grouped projection |
| Window functions | `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, and `SUM/COUNT/AVG/MIN/MAX … OVER (…)` | Day 34+; frame clauses are not supported |
| DML | `INSERT INTO t (cols) VALUES (…)`, `UPDATE t SET … WHERE …`, `DELETE FROM t WHERE …` | unguarded UPDATE/DELETE taught as a *bug* (Day 19) |
| DDL | `CREATE TABLE`, constraints, `ALTER TABLE … ADD`, `DROP TABLE [IF EXISTS]` | Day 20; see §5 |
| Introspection | `EXPLAIN SELECT …` | **simulated plan model**, see §6 |
| Comments | `-- …`, `# …` (to end of line), `/* … */` | all three are ignored by the parser *and* by statement splitting, so `#` behaves exactly like `--`: a trailing comment never creates a phantom statement, and a script containing only comments reports `Empty script` (uniform for all three styles) |

### Fails loudly by design (the engine-honesty contract)

**An unparsed construct must never produce a plausible-looking wrong answer.**
It either evaluates correctly, or it raises a named error. This is a tested,
normative property of the engine — see `tests/engine/unsupported-constructs.test.ts`
and `scripts/probe-equivalence.ts` (`npm run audit:equivalence`).

| Situation | Engine behavior |
|---|---|
| WHERE predicate outside the dialect (`XOR`, `REGEXP`, `> ALL (…)`, a parenthesised comparison under `IS TRUE`) | error: `Unsupported WHERE predicate: "…"` |
| Unknown or typo'd function (`LENGHT(x)`, `SUBSTR` before it was registered) | error: `Unsupported function: LENGHT()` |
| Aggregate used where no group exists (in `WHERE`) | error naming the aggregate and pointing at `HAVING` |
| `GROUP BY` key that resolves to nothing | error — never a silent single-group collapse |
| Reference solution of a graded mutation task errors | verdict is flagged `inconclusive` (learner not punished; the broken task is surfaced) |

Silent-wrong behavior that would otherwise look plausible (matching every row,
returning all-NULL columns, dropping a JOIN condition, treating `''` as NULL) is
treated as a **bug, not a fallback**. If a construct is not in the registry above,
either amend this document or make it error.

### Planned (engine work scheduled, not yet built)

Frame clauses (`ROWS BETWEEN …`) and `WITH RECURSIVE`. `WITH RECURSIVE` ships only
if the optional recursion module is approved — never build engine features ahead
of pedagogy.

### Explicitly out of scope

Stored procedures, triggers, views, user management, transaction isolation levels
beyond the taught atomicity model.

> **Note on `INTERSECT`/`RIGHT JOIN`/`FULL JOIN`/`CROSS JOIN`:** these execute in
> the engine but have **no teaching module**. They are untaught, not forbidden —
> tasks must never require them, and authored solution SQL must use only the
> taught columns of the registry above.

## 3. Naming and identity rules (engine-adjacent)

- Curriculum module **IDs are positional** (`day-NN`) after the 2026
  consolidation. Ordering still flows through `curriculumOrder`
  (`src/lib/curriculum/module-order.ts`) so future modules can slot in
  between days without re-keying.
- The 25 legacy IDs (`day-01` … `day-25`) are grandfathered and frozen — stored
  progress references them.

## 4. Dates — canonical forms

| Concept | Canonical | Accepted | Not supported |
|---|---|---|---|
| Today | `CURDATE()` | `NOW()`, `CURRENT_DATE` (synonyms) | real system clock |
| Relative window | `CURDATE() - INTERVAL 30 DAY` | `>= 'YYYY-MM-DD'` literals, `DATE_SUB(d, INTERVAL n DAY/MONTH/YEAR)`, `DATE_ADD(…)` | sub-day intervals (`HOUR`/`MINUTE`) |
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

### Column type registry (binding — Workstream B)

Type tokens in `CREATE TABLE (...)` / `ALTER TABLE … ADD COLUMN` resolve through
`src/lib/sql-engine/sql-type-registry.ts`. An unknown or missing type is a
**named error**, never a silent default ("fails loudly by design"):

| Kind | Accepted base types | Internal kind |
|---|---|---|
| Integer | `TINYINT` `SMALLINT` `MEDIUMINT` `INT` `INTEGER` `BIGINT` `SERIAL` `BIGSERIAL` | `number` |
| Numeric | `DEC` `DECIMAL` `NUMERIC` `FLOAT` `DOUBLE` `REAL` | `decimal` |
| Text | `CHAR` `VARCHAR` `TINYTEXT` `TEXT` `MEDIUMTEXT` `LONGTEXT` `ENUM` `JSON` | `string` |
| Temporal | `DATE` `DATETIME` `TIMESTAMP` `TIME` | `date` |
| Boolean | `BOOL` `BOOLEAN` | `boolean` |

- Length/precision (`VARCHAR(50)`, `DECIMAL(10,2)`) never changes the kind —
  `verifyColumnTypes` compares kinds only: `VARCHAR(50) ≡ VARCHAR(200)`,
  `INT ≠ TEXT`. Failure messages use learner labels
  (`a number type (INT)`, `a text type (VARCHAR/TEXT)`), not engine jargon.
- Typo'd types fail with `Unknown data type 'VARCHR(20)' for column 'id' — did
  you mean 'VARCHAR'?`; a column with no type fails with
  `Column 'id' needs a data type (e.g. id INT, id VARCHAR(50)).`.
- Adding a supported type = amend the registry **and** this table in the same
  change (`tests/engine/ddl-types.test.ts` guards both).

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

### Decision-first grading (when the dataset is the answer)

For tasks with `requireExactResult`, the **dataset verdict decides**:

| Situation | Outcome |
|---|---|
| Dataset matches the reference solution | **Pass**, even if a construct rule is unsatisfied — the unsatisfied rule is returned as a `Note:` (advisory) |
| Dataset matches, but the task sets `strictConstruct: true` | **Fail** on the construct rule — the construct *is* the deliverable |
| Dataset does not match | **Fail**, with the construct note (if any) leading and the row-level difference following |
| Task has no comparable dataset (DML/DDL — result *is* a mutation) | Construct rules are the grade, and the final **database state** is compared (`verifyColumnTypes: true` opts into column-type checks) |

Rule of thumb for authors: leave `strictConstruct` **off** (the default) unless the
lesson's objective is the keyword itself (comma-join vs `JOIN`, `UNION` vs
`UNION ALL`, a taught alias). A learner who produces the right answer by a
different-but-equivalent route has succeeded.

Where the construct *is* the lesson, opt in with `strictConstruct: true` — the
set-ops module, the DISTINCT/LIMIT lessons, the CASE module and the GROUP
BY/HAVING and JOIN lessons do. Those opt-ins are applied by
`scripts/apply-strict-construct.ts` (dry-run by default; it prints the reasoning
for every task it would change).

### Numeric comparison tolerance (how the dataset is compared)

Row values are canonicalised before comparison, and **numbers are compared after
rounding to 12 significant digits** (`Number(v.toPrecision(12))` in
`src/lib/sql-engine/validator.ts`). Consequences for authors and learners:

- Floating-point noise never fails a correct answer: `0.1 + 0.2` compares equal
  to `0.3`, and `17.580000000000002` equals `17.58`.
- Differences **at or below ~1e-12 relative** are therefore treated as *equal*.
  Do not author a task whose lesson depends on distinguishing values that close
  together (e.g. "is this 1.0000000000001 or 1.0000000000002?").
- Comparison is still exact per digit above that threshold, so currency and
  percentage answers (the curriculum's DECIMAL work) compare as written.
- This applies to the dataset check only. `expectedRowCount`, `ORDER BY`
  direction and `GROUP BY` keys are compared exactly.

### ORDER BY sort-key contract

A sort key is resolved in this order, and **an unresolvable key is an error** —
the engine never returns rows unsorted as if the sort had applied:

1. **Positional** — `ORDER BY 2` sorts by the second output column; out of range
   errors with the column count.
2. **Output column or alias** — `ORDER BY price`, `ORDER BY n` (an alias).
3. **A projected expression** — `ORDER BY COUNT(*)` / `ORDER BY AVG(price)` maps
   onto the output column of the matching SELECT item, whether or not it has an
   alias. (Learners write the expression; the projection may be aliased.)
4. **A function expression evaluated per row** — `ORDER BY UPPER(name)` works even
   when that expression is not projected; it is evaluated against the row.
5. Anything else errors: `ORDER BY no_such_column` →
   `ORDER BY column '…' not found in the query output.`

**Arithmetic sort keys are not supported** — `ORDER BY price * -1` raises
`ORDER BY expressions are not supported in this SQL dialect — sort by a column
name or position instead.` Use `ORDER BY price DESC` (or a projected alias).

---

## 8. Three-Tier Dialect Model (Milestone 4 contract — Days 39–57)

Teaching rule: **concept first, syntax second. One day = one module = one
conceptual lesson.** Dialect differences live at the step/exercise/validator
level — never as parallel day files. `day-39-views-mysql.ts` next to
`day-39-views-postgres.ts` is forbidden: it duplicates curriculum and drifts.

### Tier 1 — Shared concept (one lesson, one conceptual explanation)

The *idea* exists in both engines and is taught once:

```text
SELECT, JOIN, CTE, WITH RECURSIVE (concept), window functions,
CREATE VIEW, WITH CHECK OPTION, transactions (BEGIN/COMMIT/ROLLBACK),
SAVEPOINT, SELECT ... FOR UPDATE (concept), GRANT/REVOKE (concept),
composite-index (concept), EXPLAIN (concept), JSON-extract (concept),
FUNCTION / PROCEDURE / TRIGGER as concepts (named logic, parameterised
routines, automatic row hooks exist in both engines)
```

### Tier 2 — Same concept, different syntax/implementation

One lesson, two validators. Each exercise carries `dialect` + `variants`
(see `src/types/curriculum.ts`); the validator runs the matching leg.

| Concept | MySQL canonical | PostgreSQL variant |
|---|---|---|
| Auto-increment | `AUTO_INCREMENT` | `GENERATED ALWAYS AS IDENTITY` (`SERIAL` legacy) |
| Upsert | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT DO UPDATE` |
| JSON extract | `JSON_EXTRACT(col, '$.a')` | `col->>'a'` / `col->'a'` |
| JSON contains | `JSON_CONTAINS(col, ...)` | `@>` operator |
| Scalar function def | `CREATE FUNCTION f(p T) RETURNS T RETURN expr` | `CREATE FUNCTION f(p T) RETURNS T AS $$ ... $$ LANGUAGE sql` |
| Procedure error raise | `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT=...` | `RAISE EXCEPTION ...` |
| Procedure error handler | `DECLARE ... HANDLER FOR SQLEXCEPTION ...` | `BEGIN ... EXCEPTION WHEN OTHERS THEN ... END` |
| Trigger creation | `CREATE TRIGGER t BEFORE/AFTER ... FOR EACH ROW <body>` | `CREATE FUNCTION ... RETURNS trigger` + `CREATE TRIGGER ... EXECUTE FUNCTION ...` |
| Covering index | composite design (no `INCLUDE` — rejected with named error + hint) | key columns + `INCLUDE (cols)` |
| String concat | `CONCAT(a, b)` | `CONCAT(a, b)` and `\|\|` |
| `EXPLAIN ANALYZE` | supported (MySQL 8.0.18+, own output shape) | supported (own output shape) — NOT Postgres-only; the matrix captures the syntax/output difference |
| Partition DDL | per-dialect boundary DDL | per-dialect boundary DDL — `PARTITION BY RANGE (YEAR(...))` is NOT assumed universal; lessons teach key, boundaries, pruning |

**FUNCTION / PROCEDURE / TRIGGER placement:** Tier-1 concepts, Tier-2 implementations. Procedural languages and semantics are not interchangeable — never present MySQL handler syntax as valid PostgreSQL or vice versa.

### Tier 3 — Engine-specific (extension callout, validated only on that dialect)

PostgreSQL-native: RLS (CREATE POLICY), MATERIALIZED VIEW + REFRESH, partial index (WHERE), expression index, GIN, INCLUDE.
MySQL-specific: gap-lock behaviour, ENUM semantics, DEFINER-rights patterns, function-based partitioning spellings.

UI rule: PostgreSQL RLS is native; the MySQL approach is an alternative pattern (view + application boundary). Say "Equivalent pattern:", never "Equivalent feature:".

### Execution vs simulation

Real execution in the SQLens engine: VIEW registry + SELECT FROM view, WITH RECURSIVE (depth-guarded), deterministic scalar FUNCTION, PROCEDURE CALL, TRIGGER audit side-effects — but ONLY after engine tests prove state/result semantics (see Readiness Rule below).
Simulation / visualizer: isolation anomalies, deadlock sequences, FOR UPDATE blocking, partition-pruning counts, EXPLAIN ANALYZE cost, GRANT/REVOKE matrix, RLS, backups/PITR, sharding.

**Engine Readiness Rule (binding):** parser support is not execution support is not state mutation is not validator support. A construct is not "Real execution" until an engine-level test proves its state and result semantics. Curriculum claiming otherwise is a defect.

### BEGIN disambiguation (binding, Days 44-45 and 50)

`BEGIN` means two different things; lessons must separate them:

```text
START TRANSACTION ... COMMIT / ROLLBACK  — transaction control
BEGIN ... END                            — procedural block delimiters
```

Inside procedures, authors write `START TRANSACTION` when they mean
transaction control (where the dialect allows it) and call out PostgreSQL
procedure-transaction rules separately. Learners must never leave believing
procedural BEGIN and transaction BEGIN are the same keyword.

### Handler, locking, indexing, anomaly wording (binding, Days 45-53)

- Handler rollback: an error handler does NOT automatically roll back the
  whole transaction. Every Day-45 exercise declares its transaction boundary
  explicitly (BEGIN, operation A, operation B fails, handler, ROLLBACK — one
  shape; SAVEPOINT, op fails, ROLLBACK TO SAVEPOINT — the separate Day-50
  shape).
- Locking: teach what resource is locked, what other transactions are
  blocked, and why, then show engine-specific behaviour. Never present
  "row lock vs table lock" as a universal cross-dialect law.
- Composite indexes: ordered by leading columns, so queries using the
  leading portion can generally benefit; exact optimizer behaviour is
  query- and engine-dependent. Never teach leftmost-prefix as absolute law.
- Anomalies (incl. lost update): teach what occurred, why it occurred, and
  which mechanism prevents it. Never imply SERIALIZABLE universally solves
  every lost update.
- Recursion termination vs runtime guard: SQL termination is anchor plus
  recursive member plus termination condition. The SQLens max expansion
  (100) is runtime safety, not SQL semantics — never present LIMIT as the
  reason recursive CTEs terminate.
- Partitioning: explicit boundary model (2024 / 2025 / 2026 partitions);
  each dialect supplies valid DDL. Objective is key, boundaries, pruning.
- Recursive string accumulation: declare explicit expected output
  schemas/types per dialect leg where needed — do not assume identical
  typing across engines.
- JSON comparison: semantic results, never raw serialisation.
- Day 40 to Day 44 progression: Day 40 teaches VIEW vs stored summary
  table with MANUAL refresh only (DROP/CREATE or conceptual UI action —
  no procedure stub). Day 44 introduces automation.

---

## 9. Dual-validator semantics (Milestone 4)

`dialect: 'both'` does NOT mean "pass if either dialect happens to match".
The learner is validated independently per leg:

```text
learner SQL
   ├── MySQL leg      → pass / fail (+ reason)
   └── PostgreSQL leg → pass / fail (+ reason)
```

Each task declares an explicit `matchPolicy`:

| Policy | Meaning | Use for |
|---|---|---|
| `both-required` (default for shared exercises) | learner SQL passes BOTH legs independently | shared SQL: views, WITH RECURSIVE, SAVEPOINT, FOR UPDATE, shared EXPLAIN reading |
| `one-valid-variant` | task ships `variants.mysql` / `variants.postgres`; learner passes if EITHER variant dataset plus construct checks pass ON ITS MATCHING leg (cross-dialect accidental dataset match without the matching construct check does not pass) | Tier-2 differences: function/procedure/trigger DDL, JSON operators, INCLUDE, EXPLAIN ANALYZE output |
| `dialect-specific` | only the declared leg runs; UI shows a dialect badge | Tier-3: RLS policy, MATERIALIZED VIEW, GIN, DEFINER |

Per-leg failures are both reported on `both-required` tasks so a learner
never sees "passed" while one engine rejects the SQL.

---

## 10. Milestone 4 grading notes

- `strictConstruct` stays syntax-only. Reasoning is graded by `judgment[]`
  exercises (`choose-and-defend`, `predict-failure`, `diagnose-plan`,
  `compare-tradeoff`) — never by keyword regex.
- The atomicity linter (`scripts/audit-atomicity.ts`) is a human-review
  warning, not an automatic reject: `Views + CHECK OPTION` can be one
  atomic module. It flags suspected bundling (`Composite + covering +
  partial`, `JSON + UUID + ENUM`, `Backup + PITR + migration`) for review.

