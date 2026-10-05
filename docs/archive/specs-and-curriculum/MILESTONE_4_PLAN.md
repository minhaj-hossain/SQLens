# SQLens Milestone 4 Expansion Plan: Days 39–57
## Advanced Database Engineering (No Compression + Full Dual-Validator)

> **Document Version:** 1.0.0  
> **Target Path:** Milestone 4 (`day-39` through `day-57`)  
> **Macro-Arc Progression:**  
> `Ask (1–8) ➔ Connect (9–20) ➔ Build & Defend (21–38) ➔ Advanced Engineering (39–57): Encapsulate & Traverse ➔ Automate ➔ Guarantee Correctness ➔ Diagnose & Scale ➔ Operate`

---

## 1. Executive Summary & Design Principles

Milestone 4 elevates learners from query writers and schema builders to production database engineers. The curriculum operates under three non-negotiable architectural directives:

1. **No Compression (19 Full Days):** 19 dedicated modules (`day-39` to `day-57`), each scoped to 60–90 minutes (Day 57 Capstone at 120 minutes).
2. **1 Day = 1 Primary Construct:** Complex multi-concept bundles are decomposed. Supporting concepts are clearly separated from syntax and graded distinctly via judgment items.
3. **Full Dual-Validator Architecture (MySQL + PostgreSQL):** Dialects are integrated at the step/exercise level via a three-tier model rather than maintaining redundant, parallel curriculum trees.

> **Implementation status (2026-09-23, Milestone-4 audit P1):**
> - **Directive 2 (`judgment[]`) — DONE.** `ValidationRule.judgment` is graded by
>   `validateTaskSolution` as the final gate (SQL first, reasoning second); 14
>   items are authored (days 39, 41, 43, 46–51, 53–57) and rendered by
>   `JudgmentBlock` in both task views. Audits submit the reference answers, so
>   CI grades reasoning exactly the way a perfect learner would.
> - **Directive 3 (`dialect` / `variants` two-engine validator) — DEFERRED by
>   decision.** The engine executes one dialect; populating `variants` would
>   ship semantics nothing can verify until a reference-DB CI exists to replay
>   both legs (audit §6, item P4.19). Content stays single-dialect with
>   dialect callouts in theory prose; `DialectId` / `DialectMatchPolicy` /
>   `DialectVariant` types remain reserved, and `docs/DIALECT.md` §9 now carries
>   the explicit SPEC — NOT IMPLEMENTED status. The three-tier tables below are
>   the spec for that future work, not a description of runtime behavior.

---

## 2. Dialect Architecture: Three-Tier Model

Defined formally for `docs/DIALECT.md` §8:

### Tier 1 — Shared Core (Unified Syntax & Validator)
*Both engines share standard syntax and semantic behavior. A single parser and result-set comparator evaluates both.*
- Constructs: `CREATE VIEW`, `WITH CHECK OPTION`, `WITH RECURSIVE`, basic `CREATE FUNCTION / PROCEDURE / CALL` mechanics, `BEFORE/AFTER TRIGGER + NEW/OLD`, `BEGIN/COMMIT/ROLLBACK`, `SAVEPOINT`, `SELECT ... FOR UPDATE`, `GRANT/REVOKE`, composite index mechanics, `EXPLAIN` fundamentals.

### Tier 2 — Unified Concept, Divergent Syntax (Dual-Engine Validator)
*The underlying engineering concept is identical, but syntaxes diverge. Both variants are accepted or validated with engine-specific parsers.*

| Concept | MySQL Canonical | PostgreSQL Variant |
|---|---|---|
| **Identity / Auto-Increment** | `AUTO_INCREMENT` | `GENERATED ALWAYS AS IDENTITY` / `SERIAL` |
| **Upsert** | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT (...) DO UPDATE` |
| **JSON Extraction (Unquoted)** | `JSON_UNQUOTE(JSON_EXTRACT(c, '$.k'))` or `c->>'$.k'` | `c->>'k'` |
| **JSON Extraction (Raw JSON)** | `JSON_EXTRACT(c, '$.k')` or `c->'$.k'` | `c->'k'` |
| **JSON Containment** | `JSON_CONTAINS(target, candidate)` | `target @> candidate` |
| **Procedural Signal / Exception** | `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = ...` | `RAISE EXCEPTION '...'` |
| **Procedural Error Handler** | `DECLARE ... HANDLER FOR SQLEXCEPTION ...` | `BEGIN ... EXCEPTION WHEN ... THEN ...` |
| **Trigger Function Binding** | Direct trigger body (`FOR EACH ROW BEGIN ... END`) | `CREATE FUNCTION ... RETURNS trigger` + `CREATE TRIGGER ... EXECUTE FUNCTION` |
| **Covering Index** | Composite index covering query columns | `CREATE INDEX ... INCLUDE (col)` |
| **String Concatenation** | `CONCAT(a, b)` | `CONCAT(a, b)` or `a || b` |

### Tier 3 — Engine-Specific Extensions (Extension Callouts + Dedicated Dialect Paths)
*Features unique to or characteristic of one engine. Taught with comparative callouts and dedicated validation rules.*
- **PostgreSQL:** `MATERIALIZED VIEW + REFRESH`, Row-Level Security (`CREATE POLICY`), Partial Indexes (`WHERE condition`), Expression Indexes, GiST/GIN indexes.
- **MySQL:** Gap Locking / Next-Key Locking defaults, `ENUM` storage semantics, non-transactional DDL behavior.

---

## 3. Schema and Curriculum Type Extensions

### 3.1 Type Contract (`src/types/curriculum.ts`)

```typescript
export type DialectId = 'both' | 'mysql' | 'postgres';

export interface DialectVariant {
  solutionSql: string;
  validationOverride?: Partial<ValidationRule>;
  explanationSuffix?: string;
}

export interface PracticeTask {
  // Existing fields retained
  id: string;
  instruction: string;
  starterSql?: string;
  solutionSql: string;
  hint?: string;
  
  // Dual-Validator & Judgment Extensions
  dialect?: DialectId; // default 'both'
  variants?: {
    mysql?: DialectVariant;
    postgres?: DialectVariant;
  };
  judgment?: {
    kind: 'choose-and-defend' | 'predict-failure' | 'diagnose-plan' | 'compare-tradeoff';
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
```

### 3.2 Execution vs. Simulation Matrix

| Feature | Execution Environment | Simulation / Interactive Visualizer |
|---|---|---|
| Views & Check Options | Real in-memory SQL execution | — |
| Recursive CTEs (Depth ≤ 100) | Real in-memory SQL execution | Recursion unroll step-visualizer |
| Scalar Functions & Procedures | In-engine AST execution dispatcher | — |
| Triggers (`BEFORE`, `AFTER`, Audit) | In-engine lifecycle hooks | Trigger cascade visualizer |
| Concurrency & Isolation Anomalies | — | Interactive multi-session timeline visualizer |
| Locks, Contention & Deadlocks | Simulation harness with lock queues | Two-timeline graph cycle visualizer |
| Query Plans (`EXPLAIN`, Cost, Rows) | Simulated plan generator matching engine rules | Visual plan tree & operator breakdown |
| Table Partitioning & Pruning | Simulated partition scan metadata | Partition pruning heatmap visualizer |
| Least Privilege & Roles | In-memory permission matrix evaluator | Role-permission matrix simulator |
| Migrations & Expand/Contract | Multi-step stateful schema verification | Migration zero-downtime timeline |

---

## 4. Detailed Day-by-Day Syllabus (Days 39–57)

### Phase A: Encapsulate & Traverse (Days 39–42)

#### Day 39 — `day-39-views-saved-queries`
- **Primary Construct:** `CREATE VIEW` & View Querying
- **Concepts:**
  1. *View as a Virtual Table:* Logical abstraction, re-execution model (not a copy), encapsulation of complex JOINs.
  2. *View Maintenance:* `CREATE OR REPLACE VIEW` vs. `DROP VIEW IF EXISTS`.
  3. *Security & Decoupling:* Masking sensitive columns (e.g., PII, cost metrics) while exposing clean reporting surfaces.
- **Tasks:**
  - T1 (Guided): Create `v_expensive_products` (price > 50) with `strictConstruct: true` and `SELECT * FROM v_expensive_products`.
  - T2 (Independent): Build `v_customer_order_summary` hiding a 3-table join. Dual-dialect compatible.
- **Challenge:** Multi-level view querying (creating a summary view, then querying it with aggregations).

#### Day 40 — `day-40-views-updatability-check-option`
- **Primary Construct:** View Updatability & `WITH CHECK OPTION`
- **Concepts:**
  1. *Updatable vs. Read-Only Views:* Invariants required for DML through views (no aggregates, DISTINCT, or complex joins).
  2. *WITH CHECK OPTION:* Restricting updates/inserts that violate view predicates.
  3. *Materialization Tradeoffs:* Conceptual introduction to Postgres `MATERIALIZED VIEW + REFRESH` vs. MySQL summary tables.
- **Tasks:**
  - T1 (Guided): Create an updatable view with `WITH CHECK OPTION`.
  - T2 (Independent - `expectFailure`): Attempt an INSERT violating the view WHERE clause and assert rejection.
- **Challenge:** Build an updatable active-users view and verify updates persist to the underlying base table.

#### Day 41 — `day-41-recursive-ctes-series`
- **Primary Construct:** `WITH RECURSIVE` Base Series
- **Concepts:**
  1. *Recursive CTE Anatomy:* Anchor query, `UNION ALL`, recursive member, and termination condition.
  2. *Calendar & Number Series:* Generating gap-free numeric ranges and date-spines for zero-fill reports.
  3. *Recursion Guardrails:* Engine depth constraints (default 100 limit) and preventing infinite runaway loops.
- **Tasks:**
  - T1 (Guided): Generate number series 1 to 10 using `WITH RECURSIVE`.
  - T2 (Independent): Generate a 30-day date series joined with daily orders to report missing sales days as 0.
- **Challenge:** Fibonacci or countdown sequence generator with explicit termination guards.

#### Day 42 — `day-42-hierarchies-graph-traversal`
- **Primary Construct:** Graph & Hierarchy Traversal
- **Concepts:**
  1. *Adjacency List Navigation:* Navigating `employees(employee_id, manager_id)` from root to leaf or leaf to root.
  2. *Breadcrumb Path Building:* Accumulating ancestry paths (`CONCAT(path, ' > ', name)`).
  3. *Tree Depth & Level Computation:* Calculating depth levels for hierarchical indentation.
- **Tasks:**
  - T1 (Guided): Walk the reporting chain from employee ID 7 up to the CEO.
  - T2 (Independent): Compute organizational depth and hierarchical breadcrumbs for all department employees.
- **Challenge:** Detect potential circular reporting loops in an organizational structure.

---

### Phase B: Automate & Guard (Days 43–48)

#### Day 43 — `day-43-stored-functions`
- **Primary Construct:** `CREATE FUNCTION ... RETURNS`
- **Concepts:**
  1. *Deterministic Scalar Functions:* Syntax differences between MySQL and PostgreSQL function definitions.
  2. *Invocation Contexts:* Calling user-defined functions in `SELECT`, `WHERE`, and `ORDER BY`.
  3. *Expression Index Interaction:* Why unindexed functions on filtered columns cause full table scans and how expression indexes mitigate this.
- **Tasks:**
  - T1 (Guided): Create a scalar tax-calculation function `fn_calculate_tax(subtotal, tax_rate)` and invoke it in a query.
  - T2 (Independent): Create a customer tier function (`Gold`, `Silver`, `Bronze`) and filter on it.
- **Challenge:** Price-band categorization function evaluated across order line items.

#### Day 44 — `day-44-stored-procedures`
- **Primary Construct:** `CREATE PROCEDURE` & `CALL`
- **Concepts:**
  1. *Procedures vs. Functions:* Actions vs. calculations, parameter modes (`IN`, `OUT`, `INOUT`).
  2. *Batch Operational Processing:* Bundling multi-statement mutations into an executable unit.
  3. *Transaction Encapsulation:* Embedding `BEGIN / COMMIT / ROLLBACK` inside a procedure body.
- **Tasks:**
  - T1 (Guided): Create a restocking procedure `sp_restock_product(product_id, qty)` and verify stock updates via `CALL`.
  - T2 (Independent): Build `sp_archive_old_orders(cutoff_date)` moving data between live and archive tables.
- **Challenge:** Implement `sp_place_order(customer_id, product_id, qty)` ensuring atomic inventory decrements.

#### Day 45 — `day-45-procedural-control-error-handling`
- **Primary Construct:** Procedural Control Flow & Error Handling
- **Concepts:**
  1. *Conditionals & Loops:* `IF / ELSE`, `WHILE / LOOP` within routine bodies.
  2. *Raising Custom Exceptions:* MySQL `SIGNAL SQLSTATE '45000'` vs. PostgreSQL `RAISE EXCEPTION`.
  3. *Exception Handlers & Safe Unwind:* `DECLARE ... HANDLER FOR SQLEXCEPTION` vs. PostgreSQL `EXCEPTION WHEN OTHERS`.
- **Tasks:**
  - T1 (Guided - `expectFailure`): Create a procedure that throws a custom business error on insufficient inventory.
  - T2 (Independent): Wrap a multi-table transfer in an exception handler that safely logs failures to `audit_errors` and rolls back.
- **Challenge:** Harden the checkout procedure to guarantee zero partial records on failure.

#### Day 46 — `day-46-triggers-audit`
- **Primary Construct:** `CREATE TRIGGER` (`BEFORE` / `AFTER`)
- **Concepts:**
  1. *Trigger Mechanics & Timing:* `BEFORE` (validation, default shaping) vs. `AFTER` (audit trails, replication side-effects).
  2. *Transition Records:* Inspecting and comparing `NEW` and `OLD` records across DML operations.
  3. *Hidden Costs & Infinite Cascades:* Mutating table restrictions, silent side-effects, and debugging trade-offs.
- **Tasks:**
  - T1 (Guided): Create a `BEFORE INSERT` trigger validating discount thresholds.
  - T2 (Independent): Create an `AFTER UPDATE` audit trigger logging old and new prices to `product_price_audit`.
- **Challenge:** Verify audit log integrity through multiple updates and deletes.

#### Day 47 — `day-47-encapsulation-lab`
- **Primary Construct:** Architectural Decision-Making (`practice_day`)
- **Focus:** Refactoring real-world monolith queries into modular database components.
- **Concepts:**
  1. *Architectural Tradeoffs:* When to choose a VIEW vs. a FUNCTION vs. a PROCEDURE vs. a TRIGGER.
- **Tasks (Blank Editor):**
  - Task 1: Refactor an ad-hoc 4-table revenue calculation into a secure view.
  - Task 2: Encapsulate compound discount logic into a scalar function.
  - Task 3: Build an automated audit log trigger on sensitive customer status updates.
- **Judgment Items:** Defend the choice of construct against alternative architectures for each scenario.

#### Day 48 — `day-48-milestone-4a-checkpoint`
- **Format:** `assignment` (Hints off, strict assessment mode)
- **Deliverables:**
  1. Deliverable 1: Design and deploy a filtered business intelligence `VIEW`.
  2. Deliverable 2: Implement a dual-dialect scalar financial calculation `FUNCTION`.
  3. Deliverable 3: Implement an automated inventory decrement `PROCEDURE` with validation exceptions.
  4. Deliverable 4: Build a change-data-capture audit `TRIGGER`.
  5. Judgment Item: Multi-scenario architecture defense matrix.

---

### Phase C: Guarantee Correctness (Days 49–50)

#### Day 49 — `day-49-isolation-concurrency`
- **Primary Construct:** ANSI Transaction Isolation Levels & Concurrency Anomalies
- **Concepts:**
  1. *The Four Concurrency Anomalies:* Dirty reads, Non-repeatable reads, Phantom reads, and Lost updates.
  2. *Isolation Levels as Guarantees:* `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`.
  3. *Engine Defaults & Mechanism Divergence:* MySQL InnoDB default (`REPEATABLE READ` via next-key locking) vs. PostgreSQL default (`READ COMMITTED` via MVCC snapshots).
- **Tasks (Simulation-based):**
  - T1: Diagnose the anomaly present in an interleaved two-transaction execution log.
  - T2: Select and set the minimal isolation level (`SET TRANSACTION ISOLATION LEVEL ...`) required to prevent lost updates without full serialization.
- **Challenge:** Evaluate transaction timelines and predict outcomes under varying isolation settings.

#### Day 50 — `day-50-locking-contention-deadlocks`
- **Primary Construct:** Explicit Locking & Contention Management
- **Concepts:**
  1. *Pessimistic Row Locking:* `SELECT ... FOR UPDATE`, `FOR SHARE`, `NOWAIT`, and `SKIP LOCKED`.
  2. *Savepoints & Partial Rollbacks:* `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`, and `RELEASE SAVEPOINT`.
  3. *Deadlocks & Resolution Strategies:* Lock order inversion, wait-for graphs, deadlock detection, and client retry loops with exponential backoff.
- **Tasks:**
  - T1 (Guided): Construct an atomic seat-reservation query utilizing `SELECT ... FOR UPDATE`.
  - T2 (Independent): Execute a multi-step transaction using `SAVEPOINT` to cleanly handle an optional failing insert without abandoning the transaction.
- **Challenge:** Identify a deadlock hazard in a two-party ledger transfer script and reorder statements to eliminate the cycle.

---

### Phase D: Diagnose Then Scale (Days 51–54)

#### Day 51 — `day-51-reading-query-plans`
- **Primary Construct:** Query Execution Plans (`EXPLAIN` & `EXPLAIN ANALYZE`)
- **Concepts:**
  1. *Plan Anatomy:* Scan types (`ALL`, `index`, `range`, `ref`, `eq_ref`, `const`), filtered percentages, and join types.
  2. *Estimated vs. Actual Metrics:* Diagnosing row estimation drift, stale table statistics, and plan degradation with `EXPLAIN ANALYZE`.
  3. *Physical Join Operators:* Understanding Nested Loop Join, Hash Join, and Merge Join trade-offs.
- **Tasks:**
  - T1 (Guided): Run `EXPLAIN` on an unindexed query, identify the table scan bottleneck, and verify index adoption.
  - T2 (Independent): Compare estimated row counts against actual rows to diagnose a stale statistics bottleneck.
- **Challenge:** Interpret a 4-table join execution plan and identify the driving table.

#### Day 52 — `day-52-composite-covering-indexes`
- **Primary Construct:** Multi-Column & Covering Indexes
- **Concepts:**
  1. *Leftmost Prefix Rule:* Why an index on `(A, B, C)` supports filtering on `(A)` or `(A, B)` but fails on `(B, C)` alone.
  2. *Range Predicate Cutoffs:* How inequalities (`>`, `<`, `BETWEEN`) terminate index usage for subsequent composite columns.
  3. *Covering Indexes & Index-Only Scans:* Avoiding table heap lookups using composite indexes (MySQL) or `INCLUDE` columns (PostgreSQL).
- **Tasks:**
  - T1 (Guided): Create a composite index to eliminate a filesort on an `ORDER BY` + `WHERE` query.
  - T2 (Independent): Design an index-only covering query and verify the plan shows `Using index` / `Index Only Scan`.
- **Challenge:** Tune an indexing strategy for an analytics query with two equality filters and one range filter.

#### Day 53 — `day-53-partitioning-deep-pagination`
- **Primary Construct:** Table Partitioning & Keyset Pagination
- **Concepts:**
  1. *Table Partitioning Schemes:* `RANGE`, `LIST`, and `HASH` partitioning on one logical table.
  2. *Partition Pruning:* Validating via `EXPLAIN` that queries touch only relevant partition slices.
  3. *Keyset (Cursor) Pagination vs. OFFSET:* The $O(N)$ performance degradation of high `OFFSET` values and how `WHERE (col, id) > (?, ?)` delivers constant-time pagination.
- **Tasks:**
  - T1 (Guided): Create a range-partitioned log table by year and demonstrate partition pruning with an `EXPLAIN` query.
  - T2 (Independent): Rewrite a slow `LIMIT 20 OFFSET 50000` query into a high-performance keyset cursor query.
- **Challenge:** Design a partitioned audit history table with cursor-based retrieval.

#### Day 54 — `day-54-json-semi-structured-data`
- **Primary Construct:** Semi-Structured JSON Modeling
- **Concepts:**
  1. *JSON Storage & Extraction:* Syntax differences (`JSON_EXTRACT`, `->>`, `->`) between MySQL and PostgreSQL.
  2. *JSON Predicates & Mutations:* Filtering on nested keys, JSON containment (`JSON_CONTAINS` vs. `@>`), and updates (`JSON_SET`).
  3. *Relational vs. Document Modeling:* When to keep data normalized vs. storing semi-structured attributes, plus functional/GIN index considerations.
- **Tasks:**
  - T1 (Guided): Extract and project nested customer settings from a JSON payload column.
  - T2 (Independent): Query and filter an e-commerce catalog using JSON attribute filters.
- **Challenge:** Build a hybrid query joining relational order records with semi-structured JSON fulfillment logs.

---

### Phase E: Operate (Days 55–57)

#### Day 55 — `day-55-users-roles-least-privilege`
- **Primary Construct:** Database Security & Least Privilege Access Control
- **Concepts:**
  1. *Principals & Privileges:* `CREATE USER`, `CREATE ROLE`, and scoped `GRANT / REVOKE` commands.
  2. *Application vs. Analyst Separation:* Isolating read-only reporting roles from transactional application accounts.
  3. *Row-Level Security:* PostgreSQL Row-Level Security (`CREATE POLICY`) compared against MySQL Secure View filtering patterns.
- **Tasks:**
  - T1 (Guided): Provision a read-only reporting role granted access solely to specific views.
  - T2 (Independent - `expectFailure`): Attempt direct modifications using the restricted role to verify permission denial.
- **Challenge:** Configure a multi-tenant tenant-isolation view boundary and verify leak-free querying.

#### Day 56 — `day-56-migrations-schema-evolution`
- **Primary Construct:** Zero-Downtime Schema Evolution
- **Concepts:**
  1. *The Expand / Contract Pattern:* Safely renaming columns or changing types without downtime across running applications.
  2. *Locking Hazards of DDL:* Avoiding exclusive table locks (`ACCESS EXCLUSIVE` / table lock queues) on large datasets.
  3. *Transactional DDL Differences:* PostgreSQL transactional DDL (rollback on error) vs. MySQL auto-committing DDL caveats.
- **Tasks:**
  - Step 1 (Expand): Add a new nullable column alongside the legacy column.
  - Step 2 (Backfill): Run a batched data migration synchronization step.
  - Step 3 (Contract): Safely drop or deprecate the legacy column after validation.
- **Challenge:** Execute a zero-downtime column migration script and state-verify schema integrity at each stage.

#### Day 57 — `day-57-production-capstone`
- **Format:** Comprehensive Final Capstone (120 min, `assignment`)
- **Scenario:** Architect, harden, and optimize a production-grade multi-tenant B2B SaaS database backend.
- **Deliverables:**
  1. **Schema & Tenancy:** Build a multi-tenant schema with isolation policies and constraints.
  2. **Encapsulated Layer:** Expose filtered tenant views and an automated audit-log trigger system.
  3. **Performance Optimization:** Design composite indexes and write keyset-paginated queries backed by verified `EXPLAIN` plans.
  4. **Safe Evolution:** Apply an expand/contract migration to update tenant settings without dropping traffic.
  5. **Architecture Defense:** Written defense evaluating isolation levels, indexing trade-offs, and encapsulation choices.

---

## 5. Technical Implementation Roadmap & Verification Gates

### 5.1 Infrastructure Workstream (Pre-Requisites)
1. **Engine Extensions (`src/lib/sql-engine/`):**
   - Implement View Registry (resolving views during AST traversal).
   - Implement Recursive CTE visitor with depth-cutoff protection (max 100 iterations).
   - Implement basic scalar function evaluation and stored routine caller.
   - Implement trigger hooks for `BEFORE/AFTER` DML events.
   - Implement `SAVEPOINT` stack management and partial rollback handling.
2. **Dual-Validator (`src/lib/sql-engine/validator.ts`):**
   - Add AST dialect switching (`mysql` vs. `postgres`).
   - Add result-set normalization (handling quote and casing quirks).
   - Implement `strictConstruct` checkers for `CREATE VIEW`, `TRIGGER`, `FUNCTION`, `PROCEDURE`.
3. **Interactive Simulators (`src/components/learning/`):**
   - Multi-timeline concurrency visualizer (Day 49 & 50).
   - Query Plan tree viewer (Day 51 & 52).
   - Partition pruning status visualizer (Day 53).

### 5.2 Verification Gates
Before marking any milestone-4 module complete, the following CI checks must pass:
- `npm run verify:curriculum` (All tasks, solutions, seeds, and metadata valid)
- `npm run test:engine` (All parser and executor features green)
- `npm run test:module-order` (Canonical ordering `day-01` through `day-57` validated)
- `npx tsx scripts/audit-atomicity.ts` (Ensuring no day contains multiple bundled Tier-1 concepts)
- `npm run build` (Clean production Next.js build)
