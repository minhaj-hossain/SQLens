# SQLens Milestone 4: Days 39–57 Complete Specification
## Detailed Day-by-Day Breakdown: Concepts, Tasks, and Challenges

> **Target:** `docs/MILESTONE_4_CURRICULUM_SPEC.md`  
> **Structure Per Module:**
> - Metadata (ID, Slug, Title, Estimated Minutes, Type, Milestone ID)
> - 3 Core Concepts (Theory, Key Takeaways, Step Breakdowns)
> - 2 Practice Tasks Per Concept (Task 1 Guided, Task 2 Independent)
> - Final Challenge / Deliverable Tasks (3–4 Tasks per day, testing the full day's construct with state lifecycle specified)
> - Dual-Validator Rules & Dialect Callouts (MySQL / PostgreSQL differences)

---

# Phase A — Encapsulate & Traverse (Days 39–42)

---

## Day 39 — `day-39-views-saved-queries`
- **Module ID:** `day-39`
- **Slug:** `views-saved-queries`
- **Title:** `Day 39 - Encapsulate Complexity: Views & Saved Query Abstractions`
- **Type:** `conceptual_session` | **Estimated Minutes:** 60 | **Milestone:** `milestone-4`
- **Database Lifecycle:** `fresh` (concept tasks), `inherit` (final challenge view usage)

### Concepts & Learning Objectives
1. **Concept 1: The View Mental Model (Virtual Tables & Freshness)**
   - *Theory:* A view is not a physically duplicated table or copy of data; it is a saved, named `SELECT` query stored in the data dictionary. Every time a query executes against a view, the underlying `SELECT` runs live against base tables.
   - *Takeaway:* Views provide logical abstraction without data staleness.
   - *Dialect Tier:* Tier 1 (identical across MySQL & Postgres).
2. **Concept 2: View Maintenance (`CREATE OR REPLACE` & `DROP`)**
   - *Theory:* Schema requirements evolve. Updating a view without breaking dependent applications requires `CREATE OR REPLACE VIEW` or `DROP VIEW IF EXISTS`. Replacing a view must maintain column compatibility.
   - *Takeaway:* `OR REPLACE` allows atomic definition upgrades without drop-recreate downtime windows.
3. **Concept 3: Querying, Filtering & Hiding JOIN Complexity**
   - *Theory:* Consumers query views as regular tables (`SELECT ... FROM view WHERE ...`). The database merges outer `WHERE` clauses with inner view definitions (view query folding).
   - *Takeaway:* Complex 3-table reporting queries are reduced to single-table `SELECT` statements for downstream consumers.

### Probable Tasks (Per Concept)
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create a view named `v_expensive_products` selecting `product_id`, `name`, `price`, `stock_quantity` from `products` where `price > 50.00`. Run `SELECT * FROM v_expensive_products`.
  - `T2 (Independent)`: Create view `v_customer_order_summary` joining `customers`, `orders`, and calculating total orders per customer. Query the view.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Use `CREATE OR REPLACE VIEW v_expensive_products` to add an additional column (`category_id`) to the existing view.
  - `T2 (Independent)`: Drop the view safely using `DROP VIEW IF EXISTS v_expensive_products`, verify it no longer exists in `information_schema.views`.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Query `v_customer_order_summary` with a filter `WHERE total_orders > 3 ORDER BY total_orders DESC`.
  - `T2 (Independent)`: Join `v_customer_order_summary` with the `customers` table to pull customer emails for outreach.

### Final Challenge Tasks
- **Task 1 (Challenge):** Create view `v_monthly_revenue` aggregating revenue by year and month from `orders` and `order_items`.
- **Task 2 (Challenge):** Query `v_monthly_revenue` to extract only months where total revenue surpassed $10,000.
- **Task 3 (Challenge):** Replace `v_monthly_revenue` to include total item quantity sold, and verify the merged view outputs the new column.
- **Judgment MCQ:** When base table rows are updated, when does a standard view reflect those changes? (Immediate live query vs manual cache refresh).

---

## Day 40 — `day-40-views-updatability-check-option`
- **Module ID:** `day-40`
- **Slug:** `views-updatability-check-option`
- **Title:** `Day 40 - Guard Invariants: Updatable Views & WITH CHECK OPTION`
- **Type:** `conceptual_session` | **Estimated Minutes:** 65 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Updatable vs. Read-Only Views**
   - *Theory:* Not all views allow `INSERT`, `UPDATE`, or `DELETE`. A view is updatable only if it maps 1:1 to rows of a single base table without aggregations (`GROUP BY`, `SUM`), `DISTINCT`, window functions, or `UNION`.
   - *Takeaway:* Multi-table joins and aggregates turn views strictly read-only.
2. **Concept 2: Enforcing Boundaries with `WITH CHECK OPTION`**
   - *Theory:* By default, an `UPDATE` on a view can modify a row such that it disappears from the view's own `WHERE` criteria. Adding `WITH CHECK OPTION` forces the database to reject any `INSERT` or `UPDATE` that violates the view's filter.
   - *Takeaway:* `WITH CHECK OPTION` turns a view into a write-guardrail.
3. **Concept 3: Materialization vs. Virtual Views (Postgres vs MySQL)**
   - *Theory:* Virtual views recalculate on every read. When queries are expensive, Postgres provides `MATERIALIZED VIEW` + `REFRESH MATERIALIZED VIEW`. MySQL uses summary cache tables refreshed via procedures.
   - *Dialect Tier:* Tier 3 (Postgres native vs MySQL summary pattern).

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create a single-table view `v_active_products` for active stock. Execute an `UPDATE` statement through the view updating product price.
  - `T2 (Independent - expectFailure)`: Attempt an `UPDATE` on aggregate view `v_monthly_revenue` and observe the read-only rejection error.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Create view `v_budget_items` (`price <= 25.00`) with `WITH CHECK OPTION`. Update an item's price to $20.00 successfully.
  - `T2 (Independent - expectFailure)`: Attempt to update an item's price to $99.00 through `v_budget_items` and assert failure by `CHECK OPTION`.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Postgres: Create `MATERIALIZED VIEW mv_daily_sales` / MySQL: Create summary table `tbl_daily_sales_cache AS SELECT...`.
  - `T2 (Independent)`: Postgres: Run `REFRESH MATERIALIZED VIEW` / MySQL: Run re-insert script; verify snapshot data isolation.

### Final Challenge Tasks
- **Task 1 (Challenge):** Create view `v_regional_customers` for `region = 'NA'` with `WITH CHECK OPTION`.
- **Task 2 (Challenge):** Insert a new customer for region `'EU'` through the view and assert failure.
- **Task 3 (Challenge):** Insert a valid `'NA'` customer through the view and verify row presence in both the view and base `customers` table.

---

## Day 41 — `day-41-recursive-ctes-series`
- **Module ID:** `day-41`
- **Slug:** `recursive-ctes-series`
- **Title:** `Day 41 - Generate & Unroll: Recursive CTE Foundations & Gap-Filling`
- **Type:** `conceptual_session` | **Estimated Minutes:** 75 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: The Four Pillars of `WITH RECURSIVE`**
   - *Theory:* Anatomy of recursion: (1) Anchor member (base case), (2) `UNION ALL`, (3) Recursive member (references the CTE itself), (4) Termination predicate (`WHERE n < max`).
   - *Takeaway:* Recursion builds rows iteratively until the recursive member returns an empty set.
2. **Concept 2: Gap-Filling with Calendar & Date-Spines**
   - *Theory:* Business analytics problem: Days with 0 sales disappear from `GROUP BY date`. Solution: Generate a continuous date-spine CTE with recursion, then `LEFT JOIN` sales data to display complete time series with explicit zeros.
   - *Takeaway:* Recursive series generation fixes the "missing row" reporting anomaly.
3. **Concept 3: Infinite Loop Traps & Depth Guards**
   - *Theory:* Missing termination predicates create runaway infinite loops consuming CPU/memory. Engines enforce max recursion limits (Postgres `max_parallel_workers` / recursion depth 100, MySQL `cte_max_recursion_depth`).
   - *Takeaway:* Always enforce explicit termination conditions and `LIMIT` safety.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Write a recursive CTE `numbers(n)` generating integer values 1 through 10.
  - `T2 (Independent)`: Write a recursive CTE generating even numbers from 2 up to 50.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Generate a 30-day date series from `'2026-01-01'` to `'2026-01-30'` using `WITH RECURSIVE`.
  - `T2 (Independent)`: `LEFT JOIN` the 30-day calendar CTE with `orders` grouped by date to output zero for dates with no orders (`COALESCE(SUM(total), 0)`).
- **Concept 3 Tasks:**
  - `T1 (Guided - expectFailure)`: Run a recursive CTE with `WHERE n > 0` and observe the depth limit cutoff guardrail.
  - `T2 (Independent)`: Write a guarded series using `WHERE n < 100` alongside an outer query `LIMIT 20`.

### Final Challenge Tasks
- **Task 1 (Challenge):** Generate a missing-invoice-number detection query using a recursive number series compared against `invoices.invoice_num`.
- **Task 2 (Challenge):** Build a 12-month calendar spine for current-year fiscal metrics reporting.
- **Judgment MCQ:** Why is `UNION ALL` preferred over `UNION` inside recursive CTE definitions? (Performance & deduplication overhead).

---

## Day 42 — `day-42-hierarchies-graph-traversal`
- **Module ID:** `day-42`
- **Slug:** `hierarchies-graph-traversal`
- **Title:** `Day 42 - Traverse the Graph: Hierarchies, Trees & Path Building`
- **Type:** `conceptual_session` | **Estimated Minutes:** 75 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Adjacency List Traversal (Roots to Leaves)**
   - *Theory:* Relational tables represent trees via adjacency lists (`manager_id` references `employee_id`). Recursive CTEs walk this hierarchy by joining the recursive step on `child.manager_id = parent.employee_id`.
   - *Takeaway:* Relational trees are flattened and explored without knowing the depth in advance.
2. **Concept 2: Path Breadcrumb Accumulation**
   - *Theory:* Tracking ancestry requires accumulating node names during recursion: `CONCAT(parent.path, ' > ', child.name)` (MySQL/Postgres) or Postgres arrays `path || child.id`.
   - *Takeaway:* Accumulators provide visual context and lineage breadcrumbs for hierarchical data.
3. **Concept 3: Depth Tracking & Circular Reference Protection**
   - *Theory:* Adding a `level` column (`level + 1`) tracks indentation depth. Cycles (A reports to B, B reports to A) cause infinite loops unless cycle detection or visited-path checks are enforced.
   - *Takeaway:* Hierarchical algorithms must maintain a cycle guard and depth counter.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Anchor at CEO (`manager_id IS NULL`), recurse down through all reporting tiers in `employees`.
  - `T2 (Independent)`: Anchor at a specific employee ID and write bottom-up recursion to find their entire management chain.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Build a path string column starting with `'CEO'` and appending `'> ' || name` down the organization.
  - `T2 (Independent)`: Build category hierarchy breadcrumbs (e.g., `'Electronics > Computers > Laptops'`).
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Add `depth` starting at 0, display employees indented with `REPEAT('  ', depth)`.
  - `T2 (Independent)`: Write a recursive CTE on a bill-of-materials table computing total roll-up component quantities.

### Final Challenge Tasks
- **Task 1 (Challenge):** Walk the management hierarchy of employee 14 to compute their total headcount span of control.
- **Task 2 (Challenge):** Generate a full organizational directory with depth, breadcrumb path, and direct report counts.
- **Task 3 (Challenge):** Detect orphaned employees (`manager_id` points to a non-existent employee record).

---

# Phase B — Automate & Guard (Days 43–48)

---

## Day 43 — `day-43-stored-functions`
- **Module ID:** `day-43`
- **Slug:** `stored-functions`
- **Title:** `Day 43 - Encapsulate Compute: Scalar Functions & Dialect Portability`
- **Type:** `conceptual_session` | **Estimated Minutes:** 65 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Scalar Stored Functions (`CREATE FUNCTION ... RETURNS`)**
   - *Theory:* A function takes input parameters and returns a single deterministic scalar value. It can be invoked directly inside `SELECT`, `WHERE`, and `ORDER BY`.
   - *Dialect Tier:* Tier 2. MySQL uses `RETURNS DECIMAL DETERMINISTIC RETURN ...`. Postgres uses `RETURNS DECIMAL AS $$ ... $$ LANGUAGE sql`.
   - *Takeaway:* Centralize business formulas (discounts, taxes, risk scores) in the database.
2. **Concept 2: Determinism vs. Volatility**
   - *Theory:* Deterministic (`IMMUTABLE`) functions produce identical output for identical inputs (e.g., math calculations). Non-deterministic (`VOLATILE`) functions vary (e.g., `NOW()`, `RAND()`). The optimizer can cache or pre-evaluate deterministic functions.
   - *Takeaway:* Correct determinism declarations prevent severe performance degradation.
3. **Concept 3: The Function Scan Trap & Expression Indexes**
   - *Theory:* Calling an unindexed function inside a `WHERE` clause (`WHERE fn_tier(score) = 'Gold'`) executes per-row, preventing ordinary B-Tree index lookups on `score` and forcing a full scan.
   - *Takeaway:* Understand when to compute at query time vs when to use functional/expression indexes.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Write a scalar function `fn_discount_price(price, discount_pct)` returning discounted price.
  - `T2 (Independent)`: Write a function `fn_customer_tier(lifetime_spend)` returning `'VIP'`, `'Standard'`, or `'New'`.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Invoke `fn_discount_price` inside a `SELECT` statement over 20 products.
  - `T2 (Independent)`: Filter rows using `fn_customer_tier(spend) = 'VIP'` in a `WHERE` clause.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Compare the execution plan of a query filtering on raw columns vs filtering on a function result.
  - `T2 (Independent)`: Write a query that computes values via function in the `SELECT` list while keeping the `WHERE` filter sargable on raw indexed columns.

### Final Challenge Tasks
- **Task 1 (Challenge):** Implement a dual-dialect pricing calculation function handling quantity discounts.
- **Task 2 (Challenge):** Build a sales tax calculation routine taking region and base price.
- **Judgment MCQ:** Why can't a stored function execute transaction control statements (`COMMIT` / `ROLLBACK`)?

---

## Day 44 — `day-44-stored-procedures`
- **Module ID:** `day-44`
- **Slug:** `stored-procedures`
- **Title:** `Day 44 - Orchestrate Operations: Stored Procedures & Atomic Routines`
- **Type:** `conceptual_session` | **Estimated Minutes:** 70 | **Milestone:** `milestone-4`
- **Database Lifecycle:** `inherit` (procedures created must be called in subsequent steps)

### Concepts & Learning Objectives
1. **Concept 1: Stored Procedures vs. Functions (`CREATE PROCEDURE` + `CALL`)**
   - *Theory:* Unlike functions, procedures do not return a single scalar value. They perform operational routines, accept `IN`, `OUT`, and `INOUT` parameters, and are invoked using the `CALL` command.
   - *Takeaway:* Procedures are designed for actions (batch mutations, ETL, archiving); functions are designed for calculations.
2. **Concept 2: Multi-Statement Routine Bodies**
   - *Theory:* Procedures encapsulate compound operational workflows: updating stock, inserting audit rows, updating order statuses, and returning status codes.
   - *Dialect Tier:* Tier 2. MySQL: `CREATE PROCEDURE sp(...) BEGIN ... END;`. Postgres (14+): `CREATE PROCEDURE sp(...) AS $$ BEGIN ... END; $$ LANGUAGE plpgsql;`.
3. **Concept 3: Transactions Embedded in Procedures**
   - *Theory:* Procedures can initiate and manage explicit transaction boundaries (`BEGIN`, `COMMIT`, `ROLLBACK`) directly within their procedural bodies.
   - *Takeaway:* Isolate complex multi-table transactional workflows entirely behind clean database API boundaries.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create a procedure `sp_restock_product(p_id INT, p_qty INT)` that updates `products.stock_quantity`.
  - `T2 (Independent)`: Call `sp_restock_product` using `CALL sp_restock_product(2, 50);` and verify updated stock.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Build procedure `sp_deactivate_customer(p_customer_id INT)` that flags customer inactive and cancels their pending orders.
  - `T2 (Independent)`: Execute `sp_deactivate_customer` and assert both tables were updated in sync.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Build a procedure executing an inventory transfer between two warehouses inside an atomic `BEGIN ... COMMIT` block.
  - `T2 (Independent)`: Test calling the inventory transfer procedure with valid inputs.

### Final Challenge Tasks
- **Task 1 (Challenge):** Build `sp_place_order(p_customer_id, p_product_id, p_qty)`: validates stock, inserts order, decrements stock.
- **Task 2 (Challenge):** Execute `sp_place_order` for an in-stock product and verify state consistency across `orders` and `products`.
- **Task 3 (Challenge):** Implement an archival procedure moving completed orders older than 90 days into an `orders_archive` table.

---

## Day 45 — `day-45-procedural-control-error-handling`
- **Module ID:** `day-45`
- **Slug:** `procedural-control-error-handling`
- **Title:** `Day 45 - Fail Safely: Control Flow, Custom Exceptions & Rollback Handlers`
- **Type:** `conceptual_session` | **Estimated Minutes:** 75 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Procedural Branching & Loops (`IF/ELSE`, `WHILE`)**
   - *Theory:* Flow control within stored routines. Validating preconditions (e.g., checking if customer account balance is sufficient before proceeding).
   - *Takeaway:* Database-level validation prevents bad inputs from reaching core modification queries.
2. **Concept 2: Raising Custom Exceptions**
   - *Theory:* When a business invariant is violated, the routine must abort with a descriptive diagnostic error.
   - *Dialect Tier:* Tier 2. MySQL: `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';`. Postgres: `RAISE EXCEPTION 'Insufficient stock';`.
3. **Concept 3: Exception Handlers & Graceful Rollback**
   - *Theory:* Catching database errors within the procedure. Catching SQL exceptions to safely execute `ROLLBACK` and write diagnostic rows to an `error_log` table before returning.
   - *Dialect Tier:* Tier 2. MySQL `DECLARE ... HANDLER FOR SQLEXCEPTION` vs Postgres `BEGIN ... EXCEPTION WHEN ... THEN`.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Write a procedure using `IF ... ELSE` to apply different restocking amounts based on current inventory.
  - `T2 (Independent)`: Write a loop (`WHILE`) calculating compound interest payments across a fixed duration.
- **Concept 2 Tasks:**
  - `T1 (Guided - expectFailure)`: Write a procedure with a guard: if `qty <= 0`, raise an exception. Call it with `-5` to assert the error.
  - `T2 (Independent - expectFailure)`: Add an account balance guard raising a custom error if withdrawal exceeds balance.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Write a procedure that traps exceptions, triggers a `ROLLBACK`, and inserts an error record into `error_logs`.
  - `T2 (Independent)`: Trigger the error condition in the procedure and verify that zero orphaned rows remain in the target business table.

### Final Challenge Tasks
- **Task 1 (Challenge):** Harden `sp_place_order` with an explicit check: raise exception if requested quantity exceeds available stock.
- **Task 2 (Challenge):** Add a rollback exception handler to `sp_place_order` ensuring partial order inserts never persist on failure.
- **Task 3 (Challenge):** Verify end-to-end failure handling: execute an invalid order call and prove that database state remained untouched.

---

## Day 46 — `day-46-triggers-audit`
- **Module ID:** `day-46`
- **Slug:** `triggers-audit`
- **Title:** `Day 46 - Automate Event Hooks: BEFORE/AFTER Triggers & Audit Trails`
- **Type:** `conceptual_session` | **Estimated Minutes:** 75 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Trigger Timing & Events (`BEFORE` vs. `AFTER`)**
   - *Theory:* Triggers fire automatically in response to DML (`INSERT`, `UPDATE`, `DELETE`). `BEFORE` triggers inspect and mutate incoming data before writes occur. `AFTER` triggers execute side-effects (logging, replication) after data changes are committed.
   - *Takeaway:* Use `BEFORE` for sanitization/validation; use `AFTER` for audit trails.
2. **Concept 2: Transition Records (`NEW` and `OLD`)**
   - *Theory:* `NEW` contains incoming row data (available in `INSERT`, `UPDATE`). `OLD` contains existing row data (available in `UPDATE`, `DELETE`).
   - *Dialect Tier:* Tier 2 trigger binding (MySQL inline trigger body vs Postgres trigger function + binding).
3. **Concept 3: Pitfalls: Invisible Logic, Cascades & Mutating Tables**
   - *Theory:* Triggers execute silently; application developers unaware of triggers struggle to debug unexpected state changes. Cascading triggers (trigger A updates table B which triggers C) can cause runaway recursion.
   - *Takeaway:* Reserve triggers for compliance auditing and immutable validation; avoid business logic in triggers.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create a `BEFORE INSERT` trigger on `products` that automatically lowercases and trims product SKU strings.
  - `T2 (Independent)`: Create a `BEFORE UPDATE` trigger that automatically sets `updated_at = CURRENT_TIMESTAMP`.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Create an `audit_logs(log_id, table_name, action, old_val, new_val, changed_at)` table.
  - `T2 (Independent)`: Create an `AFTER UPDATE` trigger on `products` logging old price and new price to `audit_logs`.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Execute an `UPDATE products SET price = price * 1.1 WHERE product_id = 1;` and verify the audit row.
  - `T2 (Independent)`: Create an `AFTER DELETE` trigger capturing deleted customer emails into `deleted_customers_archive`.

### Final Challenge Tasks
- **Task 1 (Challenge):** Create a complete price audit trail trigger capturing user, old price, new price, and timestamp.
- **Task 2 (Challenge):** Update 3 different product prices in a single batch query and verify exactly 3 audit records are generated.
- **Task 3 (Challenge):** Build a guard trigger rejecting attempts to delete products that have associated historical orders.
- **Judgment MCQ:** Why is updating the same table from inside an `AFTER UPDATE` trigger on that table considered an anti-pattern? (Infinite recursion hazard).

---

## Day 47 — `day-47-encapsulation-lab`
- **Module ID:** `day-47`
- **Slug:** `encapsulation-lab`
- **Title:** `Day 47 - Architectural Refactoring: View vs. Function vs. Procedure vs. Trigger`
- **Type:** `practice_day` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`
- **Format:** Blank-editor, zero-starter scaffolding, pure architectural refactoring.

### Concepts & Learning Objectives
1. **Concept 1: The Encapsulation Decision Matrix**
   - *Theory:* Practical trade-off analysis: When to build a `VIEW` (read-only projections, security partitions), a `FUNCTION` (reusable calculations in queries), a `PROCEDURE` (multi-statement transactional workflows), or a `TRIGGER` (passive compliance auditing).

### Practice Tasks (Blank Editor)
- **Task 1 (Refactor to View):** Given a legacy 4-table SQL query joining orders, customers, and order items used in 5 different dashboards, refactor it into an optimized view `v_order_fulfillment_pipeline`.
- **Task 2 (Refactor to Function):** Given duplicated inline `CASE` statements across multiple reporting queries that classify customer churn risk, encapsulate the calculation into a reusable scalar function `fn_churn_risk_score(last_order_date, total_orders)`.
- **Task 3 (Refactor to Procedure):** Given an error-prone client-side multi-query payment capture script, refactor the operations into an atomic procedure `sp_capture_payment(order_id, payment_amount)` managing transaction boundaries.
- **Task 4 (Refactor to Trigger):** Implement a passive compliance audit trigger tracking any manual modifications to user role permissions.

### Judgment MCQs
- For each refactored task, learners defend their architectural choice against alternatives (e.g., "Why not use a trigger here?", "Why is a procedure superior to a view for this workflow?").

---

## Day 48 — `day-48-milestone-4a-checkpoint`
- **Module ID:** `day-48`
- **Slug:** `milestone-4a-checkpoint`
- **Title:** `Day 48 - Milestone 4A Assessment: Database Programmability & Encapsulation`
- **Type:** `assignment` | **Estimated Minutes:** 90 | **Milestone:** `milestone-4`
- **Rules:** Hints disabled, strict automated grading, no starter SQL.

### Deliverables
1. **Deliverable 1 (View Abstraction):** Design and create view `v_customer_lifetime_value` computing aggregated customer purchase histories, total spend, and average order value.
2. **Deliverable 2 (Scalar Function):** Write a portable scalar function `fn_tax_bracket(income)` returning the precise marginal tax rate.
3. **Deliverable 3 (Operational Procedure):** Implement procedure `sp_process_refund(order_id, refund_reason)` that marks the order refunded, restores product inventory, and commits atomically.
4. **Deliverable 4 (Audit Trigger):** Create an audit trigger logging all inventory modifications (`delta_quantity`, `previous_quantity`, `timestamp`).
5. **Architectural Defense (MCQ Matrix):** A 4-scenario architectural defense evaluation scoring trade-off analysis.

---

# Phase C — Guarantee Correctness (Days 49–50)

---

## Day 49 — `day-49-isolation-concurrency`
- **Module ID:** `day-49`
- **Slug:** `isolation-concurrency`
- **Title:** `Day 49 - Guarantee Correctness: Concurrency Anomalies & Isolation Levels`
- **Type:** `conceptual_session` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: The Four Concurrency Anomalies**
   - *Theory:* 
     - *Dirty Read (G1):* Transaction reads uncommitted changes from another transaction that later rolls back.
     - *Non-Repeatable / Fuzzy Read (G2a):* Reading a row twice within the same transaction yields different values because another transaction modified and committed it.
     - *Phantom Read (A3):* Re-executing a range query yields new rows inserted by another concurrent committed transaction.
     - *Lost Update (P4):* Concurrent transactions overwrite each other's updates without checking intermediate state.
   - *Takeaway:* Concurrency anomalies cause real-world balance discrepancies and data corruption.
2. **Concept 2: ANSI Isolation Levels as Guarantees**
   - *Theory:* `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE`. Each level eliminates specific anomalies at the cost of concurrency throughput.
   - *Takeaway:* Higher isolation = stronger correctness guarantees but increased lock contention and latency.
3. **Concept 3: Engine Mechanisms (MVCC vs. Locking Defaults)**
   - *Theory:* MySQL InnoDB defaults to `REPEATABLE READ` using Next-Key locking. PostgreSQL defaults to `READ COMMITTED` using MVCC snapshots.
   - *Takeaway:* Default behaviors differ across engines; mission-critical code must never rely on implicit defaults.

### Probable Tasks (Simulation Harness & Interactive Timeline)
- **Concept 1 Tasks:**
  - `T1 (Guided - Simulator)`: Observe an interleaved timeline of two transactions. Identify the step where a dirty read occurs.
  - `T2 (Independent - Simulator)`: Trace an interleaved timeline showing a lost update anomaly on a bank balance column.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Configure `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;` and verify dirty reads are prevented.
  - `T2 (Independent)`: Configure `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;` and prove non-repeatable reads are eliminated.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Test phantom row visibility in a range query under `REPEATABLE READ` vs `SERIALIZABLE`.
  - `T2 (Independent)`: Choose and configure the minimal isolation level required to prevent non-repeatable reads without locking entire table ranges.

### Final Challenge Tasks
- **Task 1 (Challenge):** Diagnose the concurrency anomaly in a multi-session booking timeline log.
- **Task 2 (Challenge):** Write the exact `SET TRANSACTION ISOLATION LEVEL` command to protect an inventory checkout sequence from phantoms.
- **Task 3 (Challenge):** Compare concurrency trade-offs: Calculate throughput impact under varying isolation levels.

---

## Day 50 — `day-50-locking-contention-deadlocks`
- **Module ID:** `day-50`
- **Slug:** `locking-contention-deadlocks`
- **Title:** `Day 50 - Prevent Contention: Explicit Locking, Deadlocks & Savepoints`
- **Type:** `conceptual_session` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Pessimistic Row Locking (`SELECT ... FOR UPDATE`)**
   - *Theory:* Optimistic concurrency fails under high contention. `SELECT ... FOR UPDATE` places an exclusive lock on selected rows, forcing concurrent transactions to wait until the current transaction commits or rolls back. `FOR SHARE` acquires shared read locks.
   - *Takeaway:* Prevent race conditions in high-contention inventory checkout systems.
2. **Concept 2: Savepoints & Partial Rollbacks**
   - *Theory:* A transaction does not have to be all-or-nothing if errors are recoverable. `SAVEPOINT point_name` marks a checkpoint. `ROLLBACK TO SAVEPOINT point_name` undoes only subsequent statements while keeping earlier modifications alive to commit.
   - *Takeaway:* Savepoints allow resilient multi-step workflows.
3. **Concept 3: Deadlocks, Detection & Retry Loops**
   - *Theory:* Transaction A holds lock 1 and waits for lock 2; Transaction B holds lock 2 and waits for lock 1. The database deadlock detector terminates one transaction as a victim.
   - *Takeaway:* Prevent deadlocks by enforcing deterministic lock acquisition order; handle unavoidable deadlocks with client-side exponential backoff retries.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Construct a query selecting a product row with `SELECT * FROM products WHERE product_id = 1 FOR UPDATE;`.
  - `T2 (Independent)`: Write a reservation transaction selecting an unbooked seat using `FOR UPDATE SKIP LOCKED`.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Run a transaction: `INSERT` row 1, set `SAVEPOINT sp1`, execute an invalid `INSERT`, run `ROLLBACK TO SAVEPOINT sp1`, and `COMMIT`.
  - `T2 (Independent)`: Verify that row 1 persisted while the invalid second statement was rolled back cleanly.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Analyze a wait-for graph log between two transactions and identify the circular wait dependency.
  - `T2 (Independent)`: Reorder statements in a two-account bank transfer query to guarantee all transactions lock accounts in ascending order of `account_id`, eliminating deadlocks.

### Final Challenge Tasks
- **Task 1 (Challenge):** Implement an atomic ticket reservation script with `FOR UPDATE` and stock verification.
- **Task 2 (Challenge):** Construct a multi-item batch insert using savepoints so that individual item failures log a warning without aborting the entire batch.
- **Task 3 (Challenge):** Eliminate deadlock hazards in a concurrent funds-transfer procedure.

---

# Phase D — Diagnose Then Scale (Days 51–54)

---

## Day 51 — `day-51-reading-query-plans`
- **Module ID:** `day-51`
- **Slug:** `reading-query-plans`
- **Title:** `Day 51 - Read the Engine's Mind: Execution Plans & EXPLAIN ANALYZE`
- **Type:** `conceptual_session` | **Estimated Minutes:** 75 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Deconstructing Query Plan Access Methods**
   - *Theory:* Reading execution plans beyond basic scans. The access hierarchy: `const` / `eq_ref` (unique lookup) ➔ `ref` (non-unique index) ➔ `range` (index range scan) ➔ `index` (full index scan) ➔ `ALL` (table scan).
   - *Takeaway:* Identify which tables in a multi-table query are the primary performance bottlenecks.
2. **Concept 2: Estimated vs. Actual (`EXPLAIN ANALYZE`)**
   - *Theory:* Standard `EXPLAIN` shows what the optimizer *estimates* will happen based on statistics. `EXPLAIN ANALYZE` actually executes the query, recording real execution timings, loop counts, and actual row counts.
   - *Takeaway:* Major divergences between estimated and actual rows indicate stale table statistics.
3. **Concept 3: Physical Join Operators (Nested Loop, Hash, Merge)**
   - *Theory:* How the engine actually joins data: Nested Loop (ideal for small outer sets + indexed inner lookups), Hash Join (ideal for large unindexed equijoins), and Merge Join (ideal for presorted datasets).
   - *Takeaway:* Understanding join algorithms explains why indexes speed up joins.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Run `EXPLAIN` on a 3-table join query and identify the access method for each table.
  - `T2 (Independent)`: Identify which table is driving the join (the first table processed in the plan).
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Run `EXPLAIN ANALYZE` on a filtered query and compare `rows estimated` vs `rows actual`.
  - `T2 (Independent)`: Identify a plan suffering from a 10x row estimation drift and explain the impact on join selection.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Inspect an execution plan that switches from Nested Loop to Hash Join when an index is removed.
  - `T2 (Independent)`: Optimize a query to help the optimizer select an efficient index-backed join algorithm.

### Final Challenge Tasks
- **Task 1 (Challenge):** Identify the costliest operation in a slow 5-table report plan.
- **Task 2 (Challenge):** Diagnose why an index was ignored by the planner on a date range query (low selectivity table scan crossover).
- **Judgment MCQ:** When table statistics are out of date, what command updates the engine's distribution histograms? (`ANALYZE TABLE`).

---

## Day 52 — `day-52-composite-covering-indexes`
- **Module ID:** `day-52`
- **Slug:** `composite-covering-indexes`
- **Title:** `Day 52 - Eliminate Scans: Composite Indexes, Leftmost Prefix & Covering`
- **Type:** `conceptual_session` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: The Leftmost Prefix Rule**
   - *Theory:* A composite B-Tree index on `(A, B, C)` acts as an index on `(A)`, an index on `(A, B)`, and an index on `(A, B, C)`. It cannot be used for filtering on `(B)` or `(C)` alone because sorting is hierarchical.
   - *Takeaway:* Index column ordering must match query filter and sort patterns.
2. **Concept 2: Range Predicates Terminate Index Utilization**
   - *Theory:* When a composite index has columns `(status, created_at, user_id)`: equality on `status` allows index filtering on `created_at`. But once a range condition is applied (`created_at > '2026-01-01'`), subsequent columns (e.g., `user_id`) cannot be used for index lookups.
   - *Takeaway:* Rule: Place equality columns first, range columns last in composite index definitions.
3. **Concept 3: Covering Indexes & Index-Only Scans**
   - *Theory:* If an index contains all columns requested by a query (`SELECT`, `WHERE`, `ORDER BY`), the database never accesses table heap storage.
   - *Dialect Tier:* Tier 2. MySQL includes columns in composite definition. Postgres supports `CREATE INDEX ... INCLUDE (col)`.
   - *Takeaway:* Index-only scans eliminate random I/O heap lookups entirely.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create composite index `idx_orders_customer_date ON orders(customer_id, order_date)`. Verify plan for `WHERE customer_id = 5 AND order_date = '2026-01-01'`.
  - `T2 (Independent)`: Run `EXPLAIN` filtering only on `order_date` and observe that the composite index is ignored.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Compare execution plans for `(status, created_at)` vs `(created_at, status)` on a query with equality on `status` and range on `created_at`.
  - `T2 (Independent)`: Design an index satisfying `WHERE store_id = 10 AND sale_date BETWEEN ... ORDER BY sale_date`.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Create a covering index for `SELECT product_id, price FROM products WHERE category_id = 3;` and verify plan outputs `Using index` / `Index Only Scan`.
  - `T2 (Independent)`: Postgres: Use `INCLUDE (price)` syntax / MySQL: Add `price` to composite index; verify 0 heap page fetches.

### Final Challenge Tasks
- **Task 1 (Challenge):** Design an optimal composite index eliminating both table scan and `Using filesort` on a multi-column dashboard widget.
- **Task 2 (Challenge):** Convert a high-frequency API endpoint query into an index-only scan.
- **Task 3 (Challenge):** Identify and drop a redundant index that is already covered by a wider composite index's leftmost prefix.

---

## Day 53 — `day-53-partitioning-deep-pagination`
- **Module ID:** `day-53`
- **Slug:** `partitioning-deep-pagination`
- **Title:** `Day 53 - Scale Horizontally: Table Partitioning & Keyset Pagination`
- **Type:** `conceptual_session` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Table Partitioning Schemes (`RANGE`, `LIST`, `HASH`)**
   - *Theory:* Splitting one large logical table into separate physical underlying storage chunks based on a partition key (e.g., partitioning `orders` by `order_date` year).
   - *Takeaway:* Manage multi-gigabyte or terabyte tables without dropping index performance.
2. **Concept 2: Partition Pruning via EXPLAIN**
   - *Theory:* When a query includes the partition key in its `WHERE` clause, the optimizer inspects *only* the matching physical partition, ignoring the rest.
   - *Takeaway:* Partition pruning reduces I/O by orders of magnitude for time-series and multi-region data.
3. **Concept 3: Keyset (Cursor) Pagination vs. OFFSET**
   - *Theory:* `LIMIT 20 OFFSET 100000` forces the database to read, sort, and discard 100,000 rows. Keyset pagination (`WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20`) uses indexes to jump directly to the target page in $O(1)$ time.
   - *Takeaway:* Never use high `OFFSET` in production APIs; always use cursor/keyset pagination.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create a range-partitioned table `order_events` partitioned by year on `event_timestamp`.
  - `T2 (Independent)`: Insert records across 3 different years and verify records land in respective partitions.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Run `EXPLAIN SELECT * FROM order_events WHERE event_timestamp = '2026-05-01';` and verify the `partitions` column confirms pruning.
  - `T2 (Independent)`: Write a query that accidentally fails partition pruning by wrapping the partition key in a function.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Measure the execution plan cost of `OFFSET 50000 LIMIT 20`.
  - `T2 (Independent)`: Rewrite the query into keyset pagination using `WHERE (order_date, order_id) < (?, ?) ORDER BY order_date DESC, order_id DESC LIMIT 20`.

### Final Challenge Tasks
- **Task 1 (Challenge):** Create a quarterly partitioned log table and prove pruning via `EXPLAIN`.
- **Task 2 (Challenge):** Implement an end-to-end cursor pagination query fetching the next page of 25 customer transaction records.
- **Judgment MCQ:** Under what conditions is table partitioning inferior to an ordinary B-Tree index?

---

## Day 54 — `day-54-json-semi-structured-data`
- **Module ID:** `day-54`
- **Slug:** `json-semi-structured-data`
- **Title:** `Day 54 - Bridge Relational & Document: JSON Storage & Semi-Structured Data`
- **Type:** `conceptual_session` | **Estimated Minutes:** 70 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Semi-Structured JSON Modeling & Extraction**
   - *Theory:* Storing sparse, polymorphic, or rapidly evolving attributes inside native `JSON` columns.
   - *Dialect Tier:* Tier 2 extraction:
     - MySQL: `JSON_EXTRACT(data, '$.color')` or `data->'$.color'` (quoted) vs `data->>'$.color'` (unquoted).
     - Postgres: `data->'color'` (JSON object) vs `data->>'color'` (plain text).
   - *Takeaway:* Combine relational integrity for foreign keys with JSON flexibility for dynamic attributes.
2. **Concept 2: Querying, Containment & Modifying JSON**
   - *Theory:* Filtering inside JSON: MySQL `JSON_CONTAINS(data, '"red"', '$.colors')` vs Postgres `data @> '{"color": "red"}'`. Modifying payloads with `JSON_SET()` or `jsonb_set()`.
   - *Takeaway:* Update individual keys without overwriting entire document payloads.
3. **Concept 3: Relational vs. Document Judgment & Indexing**
   - *Theory:* When to normalize into relational columns vs when to use JSON. Indexing JSON: Functional indexes on specific extracted keys vs GIN/inverted indexes on entire JSON documents.
   - *Takeaway:* Avoid the "EAV anti-pattern" and avoid turning a relational database into a dump of unindexed JSON strings.

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Query `products` extracting nested manufacturer warranty months from `attributes` JSON column.
  - `T2 (Independent)`: Extract user notification preferences from a user `settings` JSON column as plain unquoted strings.
- **Concept 2 Tasks:**
  - `T1 (Guided)`: Filter products where JSON attribute `dimensions.weight` is less than 5.
  - `T2 (Independent)`: Execute a `JSON_SET` / update statement updating a customer's theme preference to `'dark'`.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Create a virtual generated column on an extracted JSON key and index it (MySQL) or create an expression index (Postgres).
  - `T2 (Independent)`: Run an `EXPLAIN` query verifying that the index on the extracted JSON key is adopted.

### Final Challenge Tasks
- **Task 1 (Challenge):** Write a report query extracting customer shipping addresses from nested JSON payloads.
- **Task 2 (Challenge):** Filter orders where a customer applied a specific promotional tag inside a JSON tags array.
- **Judgment MCQ:** In what scenario does storing data in a JSON column violate First Normal Form (1NF) in a harmful way?

---

# Phase E — Operate (Days 55–57)

---

## Day 55 — `day-55-users-roles-least-privilege`
- **Module ID:** `day-55`
- **Slug:** `users-roles-least-privilege`
- **Title:** `Day 55 - Lockdown Access: Principals, Roles & Least Privilege`
- **Type:** `conceptual_session` | **Estimated Minutes:** 70 | **Milestone:** `milestone-4`

### Concepts & Learning Objectives
1. **Concept 1: Principals, Roles & Scoped Grants**
   - *Theory:* `CREATE USER`, `CREATE ROLE`, `GRANT privilege ON object TO role`, `REVOKE`. Separating administrative credentials from application connections.
   - *Takeaway:* Applications must never connect to a database as root / superuser.
2. **Concept 2: Separation of Duties (App vs. Analyst vs. Migration)**
   - *Theory:* Provisioning three distinct tiers of database roles: (1) `app_user` (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on operational tables; no DDL), (2) `analyst_user` (Read-only `SELECT` on reporting views; no base table access), (3) `migrator_user` (`DDL` access used only in CI/CD deployment pipelines).
   - *Takeaway:* Principle of least privilege prevents catastrophic drops and unauthorized data exfiltration.
3. **Concept 3: Row-Level Security vs. Secure Views**
   - *Theory:* How to isolate rows per tenant: PostgreSQL Row-Level Security (`ENABLE ROW LEVEL SECURITY`, `CREATE POLICY tenant_isolation ON ... USING (tenant_id = CURRENT_USER)`) vs MySQL Secure View filtering patterns (`CREATE VIEW v_tenant_orders AS SELECT * FROM orders WHERE tenant_id = ...`).
   - *Dialect Tier:* Tier 3 (Postgres native RLS vs MySQL view pattern).

### Probable Tasks
- **Concept 1 Tasks:**
  - `T1 (Guided)`: Create role `analyst_role` and grant read-only `SELECT` on table `orders`.
  - `T2 (Independent)`: Grant `analyst_role` to user `alice`. Verify permissions via `SHOW GRANTS` / system catalogs.
- **Concept 2 Tasks:**
  - `T1 (Guided - expectFailure)`: Connect as `alice` and attempt an `UPDATE` on `orders`, asserting permission denied.
  - `T2 (Independent - expectFailure)`: Attempt a `DROP TABLE` as application user, asserting authorization failure.
- **Concept 3 Tasks:**
  - `T1 (Guided)`: Postgres: Define an RLS policy restricting users to rows matching their tenant / MySQL: Define a secure view encapsulating `tenant_id` session filtering.
  - `T2 (Independent)`: Query the secured boundary and verify that other tenant records are invisible.

### Final Challenge Tasks
- **Task 1 (Challenge):** Provision a complete least-privilege reporting role with access restricted exclusively to three aggregated views.
- **Task 2 (Challenge):** Implement a multi-tenant isolation policy ensuring tenant A cannot read tenant B records even with raw `SELECT *`.
- **Judgment MCQ:** Why is application-level filtering (`WHERE tenant_id = ?`) considered riskier than database-enforced RLS or secure views?

---

## Day 56 — `day-56-migrations-schema-evolution`
- **Module ID:** `day-56`
- **Slug:** `migrations-schema-evolution`
- **Title:** `Day 56 - Ship Without Outages: Zero-Downtime Schema Evolution`
- **Type:** `conceptual_session` | **Estimated Minutes:** 80 | **Milestone:** `milestone-4`
- **Database Lifecycle:** `inherit` (Step 1 Expand ➔ Step 2 Backfill ➔ Step 3 Contract)

### Concepts & Learning Objectives
1. **Concept 1: The Expand / Contract (Parallel Run) Pattern**
   - *Theory:* Changing a database column in place (`ALTER TABLE customers RENAME COLUMN phone TO mobile_number`) causes instant application downtime because running app servers expect the old name. The 3-phase solution:
     - Phase 1 (Expand): Add new column `mobile_number` as nullable.
     - Phase 2 (Backfill & Sync): Backfill historical data and update apps to write to both columns.
     - Phase 3 (Contract): Point all reads to the new column, stop dual writes, and drop the legacy column.
   - *Takeaway:* Breaking changes must be staged in non-breaking, backwards-compatible phases.
2. **Concept 2: DDL Locking Hazards & Safe Alterations**
   - *Theory:* `ALTER TABLE` acquires exclusive table metadata locks (`ACCESS EXCLUSIVE`). A long-running `SELECT` query blocks the `ALTER`, which in turn blocks all subsequent incoming queries, causing connection pool starvation and site outages.
   - *Takeaway:* Always configure lock timeouts (`lock_timeout = '2s'`) and run heavy migrations during off-peak windows or via online schema change tools (gh-ost / pg_repack).
3. **Concept 3: Transactional DDL Divergence (Postgres vs. MySQL)**
   - *Theory:* In PostgreSQL, `ALTER TABLE` and DDL statements can run inside transaction blocks (`BEGIN; ALTER ...; COMMIT;`). If an error occurs, DDL is rolled back. In MySQL, DDL causes an implicit immediate commit and cannot be rolled back.
   - *Takeaway:* DDL failure recovery procedures differ fundamentally between engines.

### Probable Tasks
- **Concept 1 Tasks (Expand Phase):**
  - `T1 (Guided)`: Add a new nullable column `full_name VARCHAR(150)` to `customers` without dropping `first_name` and `last_name`.
  - `T2 (Independent)`: Run a batched `UPDATE` backfilling `full_name = CONCAT(first_name, ' ', last_name)`.
- **Concept 2 Tasks (Lock Guarding):**
  - `T1 (Guided)`: Inspect active database locks and simulate how a lock timeout aborts an `ALTER TABLE` safely if contention occurs.
  - `T2 (Independent)`: Add a `NOT NULL` constraint safely after verifying zero NULL values remain in the backfilled column.
- **Concept 3 Tasks (Contract Phase):**
  - `T1 (Guided)`: Safely drop legacy columns `first_name` and `last_name` after all application queries have transitioned.
  - `T2 (Independent)`: Verify base table integrity and verify downstream views still operate properly.

### Final Challenge Tasks
- **Task 1 (Challenge):** Execute Phase 1 (Expand) of a column split migration: splitting `address` into `street`, `city`, `zip`.
- **Task 2 (Challenge):** Write the idempotent backfill synchronization query migrating existing address data into the three target columns.
- **Task 3 (Challenge):** Complete Phase 3 (Contract) by verifying data parity and dropping the deprecated legacy column.

---

## Day 57 — `day-57-production-capstone`
- **Module ID:** `day-57`
- **Slug:** `production-capstone`
- **Title:** `Day 57 - Production Capstone: Architect, Harden & Scale a SaaS Database`
- **Type:** `assignment` | **Estimated Minutes:** 120 | **Milestone:** `milestone-4`
- **Rules:** Comprehensive final assessment, hints disabled, strict grading.
- **Scenario:** You are the Lead Database Architect for an enterprise multi-tenant B2B SaaS platform. You must architect, optimize, secure, and evolve the entire database layer from scratch.

### Capstone Deliverables (Inherit Lifecycle Chain)
1. **Deliverable 1 (Multi-Tenant Schema Architecture & Tenancy Bounds):**
   - Design and build the core schema: `tenants`, `tenant_members`, `subscriptions`, `invoices`, and `audit_events`.
   - Enforce rigorous foreign keys, default values, and data integrity constraints.
   - Deploy either a PostgreSQL Row-Level Security policy or a MySQL Secure View layer guaranteeing strict cross-tenant data isolation.

2. **Deliverable 2 (Encapsulation, Programmability & Compliance Audit):**
   - Create view `v_tenant_billing_metrics` calculating monthly recurring revenue (MRR) and active seats per tenant.
   - Implement an operational stored procedure `sp_provision_tenant(name, tier, admin_email)` managing atomic user creation and subscription setup within an explicit transaction.
   - Build an automated compliance audit trigger logging any changes to subscription billing tiers or status.

3. **Deliverable 3 (Performance Tuning & Scale):**
   - Diagnose an intentionally slow multi-join reporting query using `EXPLAIN`.
   - Design and deploy the optimal composite index satisfying leftmost prefix rules and eliminating filesorts.
   - Refactor an $O(N)$ deep pagination query (`OFFSET 100000`) into a constant-time keyset/cursor query.

4. **Deliverable 4 (Zero-Downtime Schema Evolution):**
   - Execute a live expand/contract migration converting subscription pricing models without dropping table access.
   - Demonstrate data parity before and after the contract phase.

5. **Deliverable 5 (Architectural Defense & Trade-Off Analysis):**
   - Complete an architectural defense rubric defending:
     - The choice of transaction isolation level for billing operations (`REPEATABLE READ` vs `SERIALIZABLE`).
     - B-Tree index column order rationale.
     - View vs Procedure vs Trigger separation of concerns.

---

## Summary Matrix: Days 39–57

| Day | Module Slug | Primary Construct | Dialect Tier | Final Task Count |
|---|---|---|---|---|
| **39** | `views-saved-queries` | `CREATE VIEW` & Querying | Tier 1 (Shared) | 3 tasks + 1 MCQ |
| **40** | `views-updatability-check-option` | Updatable Views & `CHECK OPTION` | Tier 1 & Tier 3 | 3 tasks |
| **41** | `recursive-ctes-series` | `WITH RECURSIVE` & Date Spines | Tier 1 (Shared) | 2 tasks + 1 MCQ |
| **42** | `hierarchies-graph-traversal` | Tree Traversal & Path Accumulation | Tier 1 (Shared) | 3 tasks |
| **43** | `stored-functions` | `CREATE FUNCTION ... RETURNS` | Tier 2 (Dual) | 2 tasks + 1 MCQ |
| **44** | `stored-procedures` | `CREATE PROCEDURE` & `CALL` | Tier 2 (Dual) | 3 tasks |
| **45** | `procedural-control-error-handling` | Custom Exceptions & Rollback Handlers | Tier 2 (Dual) | 3 tasks |
| **46** | `triggers-audit` | `BEFORE/AFTER` Triggers & Audit Logs | Tier 2 (Dual) | 3 tasks + 1 MCQ |
| **47** | `encapsulation-lab` | View vs Func vs Proc vs Trigger | Architectural Lab | 4 blank tasks |
| **48** | `milestone-4a-checkpoint` | Programmability Assessment | Strict Assessment | 4 deliverables |
| **49** | `isolation-concurrency` | Concurrency Anomalies & ANSI Levels | Simulation / Dual | 3 tasks |
| **50** | `locking-contention-deadlocks` | `SELECT FOR UPDATE` & Savepoints | Tier 1 & Simulation | 3 tasks |
| **51** | `reading-query-plans` | `EXPLAIN` & `EXPLAIN ANALYZE` | Simulation / Tier 3 | 2 tasks + 1 MCQ |
| **52** | `composite-covering-indexes` | Leftmost Prefix & Covering Indexes | Tier 1 & Tier 2 | 3 tasks |
| **53** | `partitioning-deep-pagination` | Partition Pruning & Keyset Cursor | Simulation / Tier 1 | 2 tasks + 1 MCQ |
| **54** | `json-semi-structured-data` | JSON Extraction & Modification | Tier 2 (Dual) | 2 tasks + 1 MCQ |
| **55** | `users-roles-least-privilege` | Roles, Grants & Row-Level Security | Tier 1 & Tier 3 | 2 tasks + 1 MCQ |
| **56** | `migrations-schema-evolution` | Expand/Contract Zero-Downtime | State Migration | 3 tasks |
| **57** | `production-capstone` | Enterprise SaaS Database Architecture | Final Capstone | 5 deliverables |
