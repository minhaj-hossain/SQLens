# Curriculum Atomization Batch Execution Tracker

This file tracks the atomic breakdown of all module concepts across the 25-day SQL curriculum. All batches have been sequentially implemented and verified.

---

## 📊 Batch Summary & Status Table

| Batch | Scope / Focus | Target Files | Concepts Count | Status |
|---|---|---|:---:|:---:|
| **Batch 1** | **Milestone 1: Core Filtering**<br>• Day 2: WHERE & `=`, `!=`, `>`, `<`, `>=`, `<=`<br>• Day 3: `AND`, `OR`, `NOT (...)`, Precedence, `BETWEEN`, `IN`, `LIKE` (`%`/`_`), `IS NULL` | `src/content/modules/day02.ts`<br>`src/content/modules/day03.ts` | **13 concepts** | `[x] COMPLETED` |
| **Batch 2** | **Milestone 1: Result Shaping**<br>• Day 4: Single-column Sort (`ASC`/`DESC`), Multi-column Tiebreaker Sort | `src/content/modules/day04to08.ts` | **4 concepts** | `[x] COMPLETED` |
| **Batch 3** | **Milestone 2: Aggregations & Joins**<br>• Day 9: `COUNT` / `COUNT(col)`, `MIN`, `MAX`, `SUM`, `AVG`<br>• Day 11: `LEFT JOIN`, Anti-JOIN (`WHERE right.pk IS NULL`) | `src/content/modules/day09to16.ts` | **10 concepts** | `[x] COMPLETED` |
| **Batch 4** | **Milestone 3: Subqueries & DML**<br>• Day 17: Scalar Subquery, `IN` Subquery, `NOT IN` + 3-Valued Logic NULL Trap<br>• Day 19: Safe `UPDATE`, Safe `DELETE` | `src/content/modules/day17to25.ts` | **7 concepts** | `[x] COMPLETED` |
| **Batch 5** | **Milestone 3: DDL Deep Atomization**<br>• Day 20: `CREATE TABLE`, Data Types, `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK`, `ALTER TABLE ... ADD`, `FOREIGN KEY`, `DROP TABLE` | `src/content/modules/day17to25.ts` | **10 concepts** | `[x] COMPLETED` |

---

## 📌 Detailed Batch Specifications

### 🔹 Batch 1: Milestone 1 Core Filtering (Days 2 & 3) — `[x] COMPLETED`
*File targets: `src/content/modules/day02.ts`, `src/content/modules/day03.ts`*

- [x] **Day 2 — Concept 1a**: Filtering Rows with `WHERE` and Exact Equality (`=`)
  - *Tasks*: Task 1 (Direct on `students` `age = 22`), Task 2 (Transfer on `products` `product_id = 4`).
- [x] **Day 2 — Concept 1b**: Excluding Values with Inequality (`!=` / `<>`)
  - *Tasks*: Task 1 (Direct on `students` `department != 'EEE'`), Task 2 (Transfer on `products` `product_id != 1`).
- [x] **Day 2 — Concept 2a**: Strict Comparisons (`>` and `<`)
  - *Tasks*: Task 1 (Direct with `price > 50.00`), Task 2 (Transfer with `age < 22`).
- [x] **Day 2 — Concept 2b**: Inclusive Comparisons (`>=` and `<=`)
  - *Tasks*: Task 1 (Direct with `price >= 50.00`), Task 2 (Transfer with `age <= 21`), Task 3 (Edge case: boundary confirmation with `quantity_in_stock <= 15`).
- [x] **Day 2 — Concept 3**: Filtering Text and Strings with Single Quotes
  - *Tasks*: Task 1 (Direct on `city = 'Dhaka'`), Task 2 (Transfer on `city = 'Chittagong'`).
- [x] **Day 3 — Concept 1a**: Combining Conditions with `AND` (Intersection)
  - *Tasks*: Task 1 (Direct on `department = 'CSE' AND age = 21`), Task 2 (Transfer on `price > 50 AND quantity_in_stock > 10`).
- [x] **Day 3 — Concept 1b**: Combining Conditions with `OR` (Union)
  - *Tasks*: Task 1 (Direct on `city = 'Dhaka' OR city = 'Gazipur'`), Task 2 (Transfer on `price < 10 OR quantity_in_stock > 50`).
- [x] **Day 3 — Concept 1c**: Negating Conditions with `NOT (...)`
  - *Tasks*: Task 1 (Direct on `NOT (city = 'Dhaka')`), Task 2 (Transfer on `NOT (category_id = 1)`).
- [x] **Day 3 — Concept 1d**: Controlling Evaluation Order with Parentheses
  - *Tasks*: Task 1 (Direct with `price > 50 AND (category_id = 1 OR category_id = 2)`), Task 2 (Edge case: precedence bug fix with `price < 20 AND (category_id = 1 OR category_id = 2)`).
- [x] **Day 3 — Concept 2a**: Range Shorthand with `BETWEEN`
  - *Tasks*: Task 1 (Direct on `$25 to $100`), Task 2 (Transfer on `age BETWEEN 20 AND 22`), Task 3 (Edge case: boundary verification on `$15.99 to $65.00`).
- [x] **Day 3 — Concept 2b**: Set Membership with `IN`
  - *Tasks*: Task 1 (Direct on `city IN ('Dhaka', 'Chattogram')`), Task 2 (Transfer on `category_id IN (1, 2)`).
- [x] **Day 3 — Concept 3a**: Wildcard Pattern Matching with `LIKE` (`%` and `_`)
  - *Tasks*: Task 1 (Direct with `%@example.com`), Task 2 (Transfer with `_SB%` single-character index matching).
- [x] **Day 3 — Concept 3b**: NULL Safety with `IS NULL` and `IS NOT NULL`
  - *Tasks*: Task 1 (Direct `email IS NULL`), Task 2 (Transfer `contact_email IS NOT NULL`), Task 3 (Edge case: fixing `= NULL` gotcha).

---

### 🔹 Batch 2: Milestone 1 Result Shaping (Day 4) — `[x] COMPLETED`
*File target: `src/content/modules/day04to08.ts`*

- [x] **Day 4 — Concept 1a**: Single-Column Sorting with `ORDER BY` (`ASC` / `DESC`)
  - *Tasks*: Task 1 (Direct on `products` `price DESC`), Task 2 (Transfer on `customers` `name ASC`).
- [x] **Day 4 — Concept 1b**: Multi-Column Sorting — Tie-Breaking
  - *Tasks*: Task 1 (Direct on `students` `age ASC, name ASC`), Task 2 (Transfer on `products` `category_id ASC, price DESC`).
- [x] **Day 4 — Concept 2**: Removing Duplicates with `DISTINCT` *(Preserved)*
- [x] **Day 4 — Concept 3**: Pagination with `LIMIT` and `OFFSET` *(Preserved)*

---

### 🔹 Batch 3: Milestone 2 Aggregations & Joins (Days 9 & 11) — `[x] COMPLETED`
*File target: `src/content/modules/day09to16.ts`*

- [x] **Day 9 — Concept 1a**: Counting Rows with `COUNT`
  - *Tasks*: Task 1 (Direct `COUNT(*)`), Task 2 (Transfer `COUNT(email)` syntax requirement).
- [x] **Day 9 — Concept 1b**: Finding the Smallest Value with `MIN`
  - *Tasks*: Task 1 (Direct `MIN(price)`), Task 2 (Transfer `MIN(age)`).
- [x] **Day 9 — Concept 1c**: Finding the Largest Value with `MAX`
  - *Tasks*: Task 1 (Direct `MAX(price)`), Task 2 (Transfer `MAX(age)`).
- [x] **Day 9 — Concept 1d**: Adding Values with `SUM`
  - *Tasks*: Task 1 (Direct `SUM(price)`), Task 2 (Transfer `SUM(quantity_in_stock)`).
- [x] **Day 9 — Concept 1e**: Calculating an Average with `AVG`
  - *Tasks*: Task 1 (Direct `AVG(price)`), Task 2 (Transfer `AVG(age)`).
- [x] **Day 9 — Concept 2**: Categorical Bucketing with `GROUP BY` *(Preserved)*
- [x] **Day 9 — Concept 3**: Filtering Groups with `HAVING` *(Preserved)*
- [x] **Day 11 — Concept 1**: Relational Links & `INNER JOIN` *(Preserved)*
- [x] **Day 11 — Concept 2a**: `LEFT JOIN` — Preserving All Left Rows
  - *Tasks*: Task 1 (Direct `customers` + `orders`), Task 2 (Transfer `suppliers` + `products`).
- [x] **Day 11 — Concept 2b**: The Anti-JOIN Pattern — Finding Rows with NO Match
  - *Tasks*: Task 1 (Direct find customers with no orders `WHERE o.order_id IS NULL`), Task 2 (Transfer find products never ordered `WHERE oi.order_item_id IS NULL`).

---

### 🔹 Batch 4: Milestone 3 Subqueries & DML (Days 17 & 19) — `[x] COMPLETED`
*File target: `src/content/modules/day17to25.ts`*

- [x] **Day 17 — Concept 1a**: Scalar Subqueries (Single-Value Comparison)
  - *Tasks*: Task 1 (Direct on `products` `price > (SELECT AVG(price) FROM products)`), Task 2 (Transfer on `students` `age > (SELECT AVG(age) FROM students)`).
- [x] **Day 17 — Concept 1b**: Set Membership Subqueries with `IN`
  - *Tasks*: Task 1 (Direct on `customers` with orders `customer_id IN (SELECT customer_id FROM orders)`), Task 2 (Transfer on multi-item `categories`).
- [x] **Day 17 — Concept 1c**: Exclusion Subqueries with `NOT IN` & Three-Valued Logic NULL Trap
  - *Tasks*: Task 1 (Direct safe `NOT IN`), Task 2 (Edge case: fix `NOT IN` with subquery `IS NOT NULL`).
- [x] **Day 17 — Concept 2**: Common Table Expressions (`WITH ... AS`) *(Preserved)*
- [x] **Day 19 — Concept 1**: Inserting New Records with `INSERT INTO`
  - *Tasks*: Task 1 (Direct new product), Task 2 (Transfer new customer).
- [x] **Day 19 — Concept 2a**: Modifying Rows Safely with `UPDATE ... SET ... WHERE`
  - *Tasks*: Task 1 (Direct single item update), Task 2 (Transfer category batch update).
- [x] **Day 19 — Concept 2b**: Removing Rows Safely with `DELETE FROM ... WHERE`
  - *Tasks*: Task 1 (Direct single item delete `order_id = 18`), Task 2 (Edge case: guard unbounded delete with `WHERE quantity_in_stock = 0`).

---

### 🔹 Batch 5: Milestone 3 DDL Deep Atomization (Day 20) — `[x] COMPLETED`
*File target: `src/content/modules/day17to25.ts`*

- [x] **Day 20 — Concept 1**: Creating a Table with `CREATE TABLE`
  - *Tasks*: Task 1 (Guided on `product_tags`), Task 2 (Independent on `quick_notes`).
- [x] **Day 20 — Concept 2**: Choosing Column Data Types (`INT`, `VARCHAR`, `DECIMAL`, `DATETIME`, MySQL `BOOLEAN`/`TINYINT(1)`)
  - *Tasks*: Task 1 (Guided on `product_metrics`), Task 2 (Independent on `customer_preferences`).
- [x] **Day 20 — Concept 3**: `PRIMARY KEY` Constraint & `AUTO_INCREMENT`
  - *Tasks*: Task 1 (Guided on `categories_new`), Task 2 (Independent on `departments`).
- [x] **Day 20 — Concept 4**: Mandatory Columns with `NOT NULL`
  - *Tasks*: Task 1 (Guided on `employees`), Task 2 (Independent on `user_logins`).
- [x] **Day 20 — Concept 5**: Preventing Duplicates with `UNIQUE`
  - *Tasks*: Task 1 (Guided on `customer_emails`), Task 2 (Independent on `product_skus`).
- [x] **Day 20 — Concept 6**: Automatic Fallback Values with `DEFAULT`
  - *Tasks*: Task 1 (Guided on `audit_logs`), Task 2 (Independent on `store_credits`).
- [x] **Day 20 — Concept 7**: Business Rules with `CHECK`
  - *Tasks*: Task 1 (Guided on `product_ratings`), Task 2 (Independent on `employee_bonuses`).
- [x] **Day 20 — Concept 8**: Modifying Existing Tables with `ALTER TABLE ... ADD`
  - *Tasks*: Task 1 (Guided on `products` `ADD COLUMN is_featured`), Task 2 (Independent on `customers` `ADD COLUMN phone_number`).
- [x] **Day 20 — Concept 9**: Connecting Tables with `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY`
  - *Tasks*: Task 1 (Guided on `orders` $\rightarrow$ `customers`), Task 2 (Independent on `order_items` $\rightarrow$ `products`).
- [x] **Day 20 — Concept 10**: Removing Tables with `DROP TABLE IF EXISTS`
  - *Tasks*: Task 1 (Guided on `temp_order_staging`), Task 2 (Independent on `legacy_student_grades`).

---

## 🏁 All Curriculum Atomization Batches are Complete!
All 5 batches across Milestone 1, Milestone 2, and Milestone 3 have been atomized according to the rigorous single-mental-model standard with complete task coverage and 100% build verification.
