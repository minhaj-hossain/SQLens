Listed directory sql_learning
Listed directory src
Listed directory components
Listed directory content
Listed directory modules
Listed directory types
Listed directory learning
Viewed curriculum.ts:1-156
Viewed curriculum-index.ts:1-69
Viewed day01.ts:1-200
Viewed day01.ts:201-450
Viewed day01.ts:451-715
Viewed App.tsx:1-250
Viewed ConceptLessonView.tsx:1-180
Viewed ConceptLessonView.tsx:181-450
Viewed PracticeTaskView.tsx:1-150
Listed directory database
Viewed tables.ts:1-115
Viewed day02.ts:1-100
Searched for "title: '"
Searched for "day: "
Searched for "title: 'Day"
Searched for "id: '"
Searched for "id:"
Viewed day02.ts:1-150
Searched for "CONCEPT"
Searched for "milestone-"
Viewed roadmap.ts:1-60
Listed directory sql-engine
Viewed validator.ts:1-100

# System Audit & Comprehensive Curriculum Implementation Plan

---

## 1. Current Project Audit

### 1.1 What is Currently Implemented
* **Interactive UI Shell & Navigation**: Clean tabbed interface (`LearningPathView`, `ConceptLessonView`, `PracticeTaskView`, `IndependentChallengeView`, `ModuleCompletionView`, `RoadmapModal`, `SchemaModal`) styled with a cohesive dark-mode design system.
* **In-Memory SQL Execution Engine**: Custom SQL tokenizer, parser, and executor supporting `SELECT`, `FROM`, `WHERE`, comparison operators (`=`, `!=`, `<`, `>`, `<=`, `>=`), logical operators (`AND`, `OR`, `NOT`), `LIKE`, `IN`, `BETWEEN`, `IS NULL`, `ORDER BY`, `LIMIT`, `OFFSET`, `DISTINCT`, `GROUP BY`, aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`), `HAVING`, `INNER JOIN`, `LEFT JOIN`, subqueries, CTEs (`WITH`), and basic DML/DDL operations.
* **Intelligent Validation Engine**: AST and result-set inspector checking target tables, required/forbidden columns, column aliases, row counts, and custom predicate validators with contextual error feedback.
* **Persistent Progress Tracking**: `localStorage`-backed state tracking completed modules, individual concept lessons, guided tasks, challenge tasks, hints accessed, and solutions revealed.
* **Preloaded Multi-Table Database**: Complete relational schema with realistic data across 8 tables (`categories`, `suppliers`, `products`, `customers`, `orders`, `order_items`, `students`, `student_records`).

### 1.2 How Day 1 Works (The Reference Gold Standard)
Day 1 teaches **SELECT Queries 101** across 4 modular concepts. Rather than overwhelming learners with a monolithic wall of text, Day 1 operates in micro-learning cycles:
1. **Mental Model & Purpose**: Poses the core question first (*"Where should I get the data from? What data do I want?"*).
2. **Visual Intro Table**: Displays a concrete, realistic table.
3. **Step-by-Step Execution Pipeline**: Shows SQL's internal execution pipeline (`FROM table` scans all rows $\rightarrow$ `SELECT column` isolates columns $\rightarrow$ produces the Result Table).
4. **Knowledge Check (MCQs)**: Tests conceptual prediction and error identification immediately after the visual explanation.
5. **Task 1 (Direct Practice)**: Learner implements the exact pattern.
6. **Task 2 (Perspective Transfer)**: Learner applies the exact same concept on different columns or a different business domain.
7. **End-of-Day Synthesis (Challenges)**: Combines all learned concepts into a multi-part homework challenge set on the e-commerce inventory database.

### 1.3 Audit Findings: Reusable vs. Hardcoded Elements
* **Highly Reusable**:
  * `ConceptLessonView.tsx` parses structured `ConceptTheory` (including `QUESTION_BLOCK`, markdown tables, execution steps, syntax cards, callout notices, interactive sandboxes, and MCQs).
  * `PracticeTaskView.tsx` provides a 4-quadrant layout: Task Instructions & Hints, Table Explorer, SQL Editor with live execution, and Results Console with diff feedback.
  * `IndependentChallengeView.tsx` and `ModuleCompletionView.tsx` handle milestone progression and celebrations.
* **Architectural Bottlenecks & Gaps in Later Days (Days 4–25)**:
  * **Day 2 Misalignment**: Currently includes `AND`, `OR`, and `NOT`, causing redundant overlap with Day 3.
  * **Later Modules Content Granularity**: Days 4 through 25 in `day04to08.ts`, `day09to16.ts`, and `day17to25.ts` have condensed concepts with only 1 task or combined multiple complex topics into a single concept block. They must be upgraded to follow Day 1's atomic 2-task cycle with visual step breakdowns.

---

## 2. Day 1 Teaching-System Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      THE ATOMIC CONCEPT CYCLE                           │
│                                                                         │
│  1. Problem & Mental Model  ──►  "Why does this SQL feature exist?"     │
│             │                                                           │
│  2. Fake Data Table         ──►  Concrete, realistic domain table       │
│             │                                                           │
│  3. Step-by-Step Execution  ──►  Visual row/column state change          │
│             │                                                           │
│  4. Result Set              ──►  Expected output table preview          │
│             │                                                           │
│  5. MCQ Check               ──►  Predictive & conceptual validation     │
│             │                                                           │
│  6. Task 1 (Direct)         ──►  Targeted query on primary table        │
│             │                                                           │
│  7. Task 2 (Transfer)       ──►  Same concept, new scenario/perspective │
│             │                                                           │
│  8. Transition              ──►  Bridge to next problem                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Day 1 Concept Breakdown Matrix

| Concept | Problem / Mental Model | Visual Step Model | MCQ Focus | Task 1 (Direct) | Task 2 (Transfer) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. SELECT & FROM** | Answering "From where?" and "What data?" | `FROM students` (scan 5 rows) $\rightarrow$ `SELECT name` (pick 1 col) | Query outcome prediction | `SELECT name FROM students;` | `SELECT city FROM students;` |
| **2. Multiple Columns** | Extracting multi-attribute records | 5-col table $\rightarrow$ 2-col projected result | Output column identification | `SELECT name, department FROM students;` | `SELECT id, name, city FROM students;` |
| **3. SELECT \*** | Inspecting entire table structure | Selective projection vs. Wildcard expansion | Asterisk wildcard meaning | `SELECT * FROM students;` | `SELECT name, age, city FROM students;` |
| **4. AS Aliasing** | Presentation-layer label formatting | Real Column $\rightarrow$ Alias (Underlying DB untouched) | Persistence vs. Presentation check | `SELECT name AS student_name FROM students;` | `SELECT name AS student_name, department AS student_department FROM students;` |

---

## 3. Recommended Scalable Architecture

To ensure every future day scales effortlessly without rebuilding UI components, all lessons are driven by a unified typed schema:

```
src/
├── types/
│   ├── curriculum.ts       # ModuleData, Concept, ConceptTheory, PracticeTask, ValidationRule
│   ├── database.ts         # TableSchema, TableRow, QueryExecutionResult
│   └── progress.ts         # UserLearningState, ModuleProgress, TaskAttempt
├── content/
│   ├── curriculum-index.ts # Aggregates all 25 modules
│   ├── database/
│   │   ├── schema.ts       # Column types, foreign keys, table descriptions
│   │   └── tables.ts       # Seed data for inventory, university, and employee domains
│   └── modules/
│       ├── day01.ts        # [Gold Standard] SELECT & FROM, Columns, *, Aliasing
│       ├── day02.ts        # [Corrected] WHERE, Numeric & String Comparisons
│       ├── day03.ts        # [Dedicated Logic] AND, OR, NOT, IN, BETWEEN, LIKE, IS NULL, Dates
│       ├── day04.ts        # ORDER BY, DISTINCT, LIMIT & OFFSET
│       ├── day05.ts        # Practice Day: Retrieval + Filtering + Shaping
│       ├── day06.ts        # Conceptual Session: Logical Query Processing Order
│       ├── day07.ts        # Project Part 1: Schema Exploration & Reporting
│       ├── day08.ts        # Milestone 1 Checkpoint Assessment
│       ├── day09to16/      # Milestone 2 Modules (Aggregations, Grouping, JOINs)
│       └── day17to25/      # Milestone 3 Modules (Subqueries, CTEs, DML, DDL, Transactions)
```

---

## 4. Day 2 Correction Specification

> [!IMPORTANT]
> **Curriculum Correction Applied to Day 2**:
> `AND`, `OR`, and `NOT` have been **completely removed** from Day 2.
> Day 2 now focuses purely on single-condition row filtering:
> 1. **Concept 1: The WHERE Clause & Numeric Equality/Inequality** (`=`, `!=`, `<>`)
> 2. **Concept 2: Numeric Range Comparisons** (`<`, `>`, `<=`, `>=`)
> 3. **Concept 3: String Filtering & Single Quotes** (`'Dhaka'`, case sensitivity, quotes vs. numbers)
>
> `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `LIKE`, and `IS NULL` are taught systematically in **Day 3**.

---

## 5. Complete Curriculum Implementation Plan (Days 1–25)

---

### MILESTONE 1: Core Retrieval, Filtering & Shaping (Days 1–8)

---

#### Day 1 — SELECT Queries 101
* **Module**: `day-01` | **Type**: `module` | **Milestone**: `milestone-1`
* **Concepts**: SELECT & FROM, Multiple Columns, SELECT *, Column Aliasing with AS.
* **Learning Goal**: Understand table scanning and column projection.
* **Reference Implementation**: Fully complete gold standard.

---

#### Day 2 — WHERE & Core Filtering (Corrected)
* **Module**: `day-02` | **Type**: `module` | **Milestone**: `milestone-1`
* **Concepts**: WHERE Clause & Numeric Equality, Range Comparisons, Text Filtering with Quotes.
* **Learning Goal**: Filter table rows before projecting columns using single predicates.

##### Concept 1: The WHERE Clause & Numeric Equality (`=`, `!=`)
1. **Introduction**: Introduce the problem of information overload. We have 1,000 products or students, but only want records matching an exact ID or status.
2. **Fake Table**: `students` (`id`, `name`, `age`, `department`, `city`).
3. **Visual Explanation**:
   * Step 1 (`FROM students`): Full 5-row table scanned.
   * Step 2 (`WHERE age = 21`): Evaluates each row (`Rahim (21) -> TRUE`, `Karim (22) -> FALSE`, `Ayesha (20) -> FALSE`, `Tanvir (21) -> TRUE`). Dim non-matching rows.
   * Step 3 (`SELECT name`): Returns 2 rows: Rahim, Tanvir.
4. **SQL Query**: `SELECT name, department FROM students WHERE id = 3;`
5. **MCQ**: Predict output of `SELECT name FROM students WHERE age != 21;`.
6. **Task 1 (Direct)**: Select `name` and `age` of students where `age = 22`.
7. **Task 2 (Transfer)**: Query `products` table: select `name` and `price` where `product_id = 4`.
8. **Transition**: "What if we don't want exact equality, but a threshold or range?"

##### Concept 2: Numeric Range Comparisons (`<`, `>`, `<=`, `>=`)
1. **Introduction**: Finding items above a price cap, students above an age threshold, or low stock counts.
2. **Fake Table**: `products` (`product_id`, `name`, `price`, `quantity_in_stock`).
3. **Visual Explanation**:
   * Step 1 (`FROM products`): Scan all items.
   * Step 2 (`WHERE price >= 100`): Row-by-row boolean evaluation.
   * Step 3 (`SELECT name, price`): Isolate items costing \$100 or more.
4. **SQL Query**: `SELECT name, price FROM products WHERE price < 50.00;`
5. **MCQ**: Which rows survive `WHERE quantity_in_stock <= 10`?
6. **Task 1 (Direct)**: Select `name` and `price` from `products` where `price >= 100.00`.
7. **Task 2 (Transfer)**: Select `name` and `age` from `students` where `age < 22`.
8. **Transition**: "Numbers are written directly. But how does SQL handle words, names, and text?"

##### Concept 3: Filtering Text and Strings with Single Quotes
1. **Introduction**: Explain why strings require single quotes (`'Dhaka'`) while column names and numbers do not.
2. **Fake Table**: `students` (`id`, `name`, `department`, `city`).
3. **Visual Explanation**:
   * Contrast `WHERE city = Dhaka` (SQL looks for a column called Dhaka $\rightarrow$ Error) vs `WHERE city = 'Dhaka'` (matches the literal text `'Dhaka'`).
   * Row evaluation highlighting rows with `'Dhaka'`.
4. **SQL Query**: `SELECT name, city FROM students WHERE department = 'CSE';`
5. **MCQ**: Identify the syntax mistake in `SELECT * FROM students WHERE name = Rahim;`.
6. **Task 1 (Direct)**: Select `name` and `department` for students living in `'Dhaka'`.
7. **Task 2 (Transfer)**: Query `customers` table: select `name` and `email` for customers located in `'London'`.
8. **Transition**: "Now that you can filter by a single condition, what happens when you need to combine conditions or match patterns?"

##### Day 2 Final Challenges (Homework)
* **Task 1**: Display all products with `price > 50.00`.
* **Task 2**: Display customers from `'Chittagong'`.
* **Task 3**: Find products with `quantity_in_stock <= 5` (low stock alert).

---

#### Day 3 — Specialized Filtering
* **Module**: `day-03` | **Type**: `module` | **Milestone**: `milestone-1`
* **Concepts**: Logical Combinators (AND, OR, NOT), Set & Range Filtering (IN, BETWEEN), Pattern Matching (LIKE) & NULL Safety (IS NULL, IS NOT NULL).

##### Concept 1: Logical Combinators (AND, OR, NOT)
1. **Introduction**: Real decisions require compound criteria (e.g., in CSE *and* older than 20; in Dhaka *or* Chittagong).
2. **Fake Table**: `students` (`name`, `age`, `department`, `city`).
3. **Visual Explanation**:
   * `AND`: Both conditions must be `TRUE` (Intersection).
   * `OR`: At least one condition must be `TRUE` (Union).
   * `NOT`: Inverts the boolean result.
4. **SQL Query**: `SELECT name FROM students WHERE department = 'CSE' AND age >= 21;`
5. **MCQ**: Truth table check on `WHERE department = 'CSE' OR city = 'Dhaka'`.
6. **Task 1 (Direct)**: Select `name` and `age` of students where `department = 'CSE'` AND `age = 21`.
7. **Task 2 (Transfer)**: Select `name` and `price` from `products` where `price > 50` AND `quantity_in_stock > 10`.

##### Concept 2: Range & Set Inclusion (BETWEEN, IN)
1. **Introduction**: Simplifying verbose queries like `age >= 20 AND age <= 22` with `BETWEEN 20 AND 22`, and `city = 'Dhaka' OR city = 'Sylhet'` with `IN ('Dhaka', 'Sylhet')`.
2. **Fake Table**: `products` (`name`, `price`, `category_id`).
3. **Visual Explanation**: Set membership check `category_id IN (1, 3, 5)` vs multi-OR evaluation.
4. **SQL Query**: `SELECT name, price FROM products WHERE price BETWEEN 20.00 AND 100.00;`
5. **MCQ**: Is `BETWEEN 10 AND 20` inclusive of 10 and 20? (Yes).
6. **Task 1 (Direct)**: Select products with `price BETWEEN 25.00 AND 150.00`.
7. **Task 2 (Transfer)**: Select students whose `city IN ('Dhaka', 'Chittagong')`.

##### Concept 3: Pattern Matching (LIKE) & Missing Data (IS NULL)
1. **Introduction**: Searching for partial names (`%` wildcard, `_` single char) and handling unknown/missing values safely (`IS NULL`, never `= NULL`).
2. **Fake Table**: `customers` (`customer_id`, `name`, `email`, `city`).
3. **Visual Explanation**: Three-valued logic (TRUE, FALSE, UNKNOWN). Rows with `NULL` email evaluated against `= NULL` vs `IS NULL`.
4. **SQL Query**: `SELECT name, email FROM customers WHERE email IS NULL;`
5. **MCQ**: Why does `WHERE email = NULL` return 0 rows?
6. **Task 1 (Direct)**: Select all customers whose `name LIKE 'Rahim%'`.
7. **Task 2 (Transfer)**: Select all suppliers where `contact_email IS NOT NULL`.

##### Day 3 Final Challenges (Homework)
* **Task 1**: Find products priced between \$50 and \$200 with stock > 0.
* **Task 2**: Find customers whose email ends with `'@gmail.com'`.
* **Task 3**: Find suppliers with missing emails (`contact_email IS NULL`).

---

#### Day 4 — Result Shaping
* **Module**: `day-04` | **Type**: `module` | **Milestone**: `milestone-1`
* **Concepts**: ORDER BY (ASC/DESC/Multi-column), DISTINCT Deduplication, Pagination (LIMIT & OFFSET).

##### Concept 1: Sorting with ORDER BY
1. **Introduction**: Database tables have no inherent order. To get highest-priced items, alphabetically sorted names, or newest signups, we must sort explicitly.
2. **Fake Table**: `products` (`name`, `price`, `quantity_in_stock`).
3. **Visual Explanation**: Rows rearranged in ascending (default) or descending order after filtering.
4. **SQL Query**: `SELECT name, price FROM products ORDER BY price DESC;`
5. **MCQ**: What is the default sorting direction if neither ASC nor DESC is specified?
6. **Task 1 (Direct)**: Select `name` and `price` from `products` ordered by `price DESC`.
7. **Task 2 (Transfer)**: Select `name` and `signup_date` from `customers` ordered by `name ASC`.

##### Concept 2: Removing Duplicates with DISTINCT
1. **Introduction**: When querying foreign keys or categories, identical values repeat. How to get the unique list of values.
2. **Fake Table**: `customers` (`city`).
3. **Visual Explanation**: Duplicate city rows collapsed into a distinct set of values.
4. **SQL Query**: `SELECT DISTINCT city FROM customers;`
5. **MCQ**: What happens to row count when `DISTINCT` is applied to unique primary keys?
6. **Task 1 (Direct)**: Get a list of unique `city` values from `customers`.
7. **Task 2 (Transfer)**: Get a list of unique `category_id` values from `products`.

##### Concept 3: Pagination with LIMIT and OFFSET
1. **Introduction**: Web apps cannot show 100,000 rows on one page. They fetch 10 items at a time (Page 1 = LIMIT 10 OFFSET 0, Page 2 = LIMIT 10 OFFSET 10).
2. **Fake Table**: `products` sorted by `price DESC`.
3. **Visual Explanation**: Visual bounding box taking rows 1 to 5, then offset sliding down.
4. **SQL Query**: `SELECT name, price FROM products ORDER BY price DESC LIMIT 3 OFFSET 0;`
5. **MCQ**: Which rows are returned by `LIMIT 5 OFFSET 10`? (Rows 11 through 15).
6. **Task 1 (Direct)**: Get the top 3 most expensive products (`LIMIT 3`).
7. **Task 2 (Transfer)**: Fetch page 2 of products (5 items per page: `LIMIT 5 OFFSET 5`).

##### Day 4 Final Challenges (Homework)
* **Task 1**: Display top 5 lowest-priced products.
* **Task 2**: Display unique customer cities sorted alphabetically.
* **Task 3**: Build a 3-item leaderboard of customers with earliest signup dates.

---

#### Day 5 — Practice Day: Retrieval + Filtering + Shaping
* **Module**: `day-05` | **Type**: `practice_day` | **Milestone**: `milestone-1`
* **Concepts**: Combining SELECT, WHERE, AND/OR, LIKE, ORDER BY, and LIMIT in single cohesive queries.
* **Focus**: Real-world e-commerce inventory workflows (Top Sellers, Low Stock Warnings, Filtered Catalogs).
* **Tasks**:
  * Task 1: Find all electronics (`category_id = 1`) priced over \$50, ordered by price descending.
  * Task 2: Find all customers in `'Dhaka'` or `'Sylhet'` with valid emails, sorted by signup date.
  * Task 3: Paginated catalog query: Page 2 of active products with stock > 0, sorted by name.

---

#### Day 6 — Conceptual Session: Logical Query Processing Order (Simple Pass)
* **Module**: `day-06` | **Type**: `conceptual_session` | **Milestone**: `milestone-1`
* **Concepts**: Written Syntax Order vs. Execution Engine Order:
  $$\text{FROM} \longrightarrow \text{WHERE} \longrightarrow \text{SELECT} \longrightarrow \text{DISTINCT} \longrightarrow \text{ORDER BY} \longrightarrow \text{LIMIT}$$
* **Visual Breakdown**: Why you cannot use a column alias defined in `SELECT` inside a `WHERE` clause (because `WHERE` executes before `SELECT`).
* **Interactive Debugging**: Fix queries that fail due to alias resolution timing.

---

#### Day 7 — Project Part 1: Explore & Query the Full Schema
* **Module**: `day-07` | **Type**: `project_part` | **Milestone**: `milestone-1`
* **Concepts**: Multi-domain schema inspection across `categories`, `suppliers`, `products`, `customers`, `orders`, `order_items`.
* **Tasks**:
  * Task 1: Catalog audit: Count and list zero-stock products requiring restock.
  * Task 2: High-value customer discovery: Identify international customers outside domestic regions.
  * Task 3: Supplier directory formatting: Build a clean supplier directory with custom column aliases.

---

#### Day 8 — Milestone Assignment 1 (Checkpoint Assessment)
* **Module**: `day-08` | **Type**: `assignment` | **Milestone**: `milestone-1`
* **Assessment Scope**: Days 1–7 mastery verification.
* **Format**: 5 comprehensive, unguided challenge tasks covering full single-table retrieval, complex filtering, pattern matching, NULL handling, deduplication, sorting, and pagination.

---

### MILESTONE 2: Aggregation & Relationships (Days 9–16)

---

#### Day 9 — Aggregation & Grouping
* **Module**: `day-09` | **Type**: `module` | **Milestone**: `milestone-2`
* **Concepts**: Aggregate Functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY Bucketing, Filtering Groups with HAVING.

##### Concept 1: Aggregate Functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`)
1. **Introduction**: Moving from individual rows to summary metrics (total revenue, average price, item counts).
2. **Fake Table**: `products` (`price`, `quantity_in_stock`).
3. **Visual Explanation**: Vertical collapse of rows into single scalar summary values.
4. **SQL Query**: `SELECT COUNT(*) AS total_products, AVG(price) AS avg_price FROM products;`
5. **MCQ**: What does `COUNT(email)` do when some rows contain `NULL`? (Counts non-null values only).
6. **Task 1 (Direct)**: Calculate total count, lowest price, and highest price in `products`.
7. **Task 2 (Transfer)**: Calculate total count of registered `customers` with valid emails.

##### Concept 2: Categorical Bucketing with GROUP BY
1. **Introduction**: What if we need average price *per category*, or student count *per department*?
2. **Fake Table**: `students` (`department`, `name`).
3. **Visual Explanation**: Rows sorted into departmental bins, then aggregated per bin.
4. **SQL Query**: `SELECT department, COUNT(*) AS student_count FROM students GROUP BY department;`
5. **MCQ**: Why does `SELECT department, name, COUNT(*) FROM students GROUP BY department;` cause an aggregation error?
6. **Task 1 (Direct)**: Count number of students in each `department`.
7. **Task 2 (Transfer)**: Count number of products in each `category_id`.

##### Concept 3: Filtering Groups with HAVING
1. **Introduction**: `WHERE` filters individual rows *before* grouping; `HAVING` filters aggregated groups *after* grouping.
2. **Fake Table**: `products` grouped by `category_id`.
3. **Visual Explanation**: Bins created $\rightarrow$ `COUNT(*)` calculated $\rightarrow$ Bins with count $< 3$ discarded.
4. **SQL Query**: `SELECT category_id, COUNT(*) FROM products GROUP BY category_id HAVING COUNT(*) > 3;`
5. **MCQ**: When to use `WHERE` vs `HAVING`?
6. **Task 1 (Direct)**: Find departments with strictly more than 2 students (`HAVING COUNT(*) > 2`).
7. **Task 2 (Transfer)**: Find categories where the average product price exceeds \$50.00 (`HAVING AVG(price) > 50`).

##### Day 9 Final Challenges (Homework)
* **Task 1**: Calculate total inventory units and average price per `category_id`.
* **Task 2**: Find customer cities having at least 3 registered customers.
* **Task 3**: Find suppliers providing more than 2 distinct products.

---

#### Day 10 — Practice Day: Reporting
* **Module**: `day-10` | **Type**: `practice_day` | **Milestone**: `milestone-2`
* **Concepts**: Business KPI dashboards, multi-metric summaries, financial totals.
* **Tasks**:
  * Task 1: Inventory valuation report: Total asset value (`SUM(price * quantity_in_stock)`) per category.
  * Task 2: Customer geographic distribution report with threshold filtering.
  * Task 3: Order status breakdown: Count of orders per status (`pending`, `shipped`, `delivered`, `cancelled`).

---

#### Day 11 — JOINs
* **Module**: `day-11` | **Type**: `module` | **Milestone**: `milestone-2`
* **Concepts**: Primary Keys & Foreign Keys, INNER JOIN, LEFT JOIN, Table Aliasing.

##### Concept 1: Relational Links & INNER JOIN
1. **Introduction**: Real data is normalized into separate tables to avoid duplication. How do we combine `products` with `categories`?
2. **Fake Tables**: `products` (`product_id`, `name`, `category_id`) and `categories` (`category_id`, `name`).
3. **Visual Explanation**:
   * Draw connecting arrows matching `products.category_id` = `categories.category_id`.
   * Unmatched rows excluded from both sides.
4. **SQL Query**:
   ```sql
   SELECT p.name AS product_name, c.name AS category_name
   FROM products p
   INNER JOIN categories c ON p.category_id = c.category_id;
   ```
5. **MCQ**: What happens to a product if its `category_id` has no match in `categories` during an INNER JOIN?
6. **Task 1 (Direct)**: Join `products` and `categories` to display product name and category name.
7. **Task 2 (Transfer)**: Join `orders` and `customers` to display `order_id`, `order_date`, and customer `name`.

##### Concept 2: Preserving Unmatched Rows with LEFT JOIN
1. **Introduction**: What if a customer has placed 0 orders, but we still want them in our customer list?
2. **Fake Tables**: `customers` and `orders`.
3. **Visual Explanation**: All rows from the left table kept; missing right-side matches populated with `NULL`.
4. **SQL Query**:
   ```sql
   SELECT c.name, o.order_id
   FROM customers c
   LEFT JOIN orders o ON c.customer_id = o.customer_id;
   ```
5. **MCQ**: How can you find customers who have NEVER placed an order using LEFT JOIN? (`WHERE o.order_id IS NULL`).
6. **Task 1 (Direct)**: Display all customers and their order IDs, keeping customers with 0 orders (`LEFT JOIN`).
7. **Task 2 (Transfer)**: Display all suppliers and the products they provide, including suppliers with 0 products.

##### Day 11 Final Challenges (Homework)
* **Task 1**: Join `products` with `suppliers` to show product name and supplier email.
* **Task 2**: Multi-table INNER JOIN: `orders` $\rightarrow$ `order_items` $\rightarrow$ `products`.
* **Task 3**: Find inactive customers using `LEFT JOIN` and `WHERE o.order_id IS NULL`.

---

#### Day 12 — Practice Day: JOINs + Aggregates
* **Module**: `day-12` | **Type**: `practice_day` | **Milestone**: `milestone-2`
* **Concepts**: Combining multi-table JOINs with `GROUP BY` and summary functions.
* **Tasks**:
  * Task 1: Total money spent per customer: Join `customers` with `orders` and `order_items`, group by customer name.
  * Task 2: Product sales volume: Join `products` with `order_items`, sum total quantities sold per product.
  * Task 3: Order line-item count: Show `order_id`, customer name, and total items ordered.

---

#### Day 13 — Conceptual Session: Relational Thinking + Logical Query Processing Order (Expanded)
* **Module**: `day-13` | **Type**: `conceptual_session` | **Milestone**: `milestone-2`
* **Concepts**: Full 8-stage Execution Order:
  $$\text{FROM} \longrightarrow \text{ON} \longrightarrow \text{JOIN} \longrightarrow \text{WHERE} \longrightarrow \text{GROUP BY} \longrightarrow \text{HAVING} \longrightarrow \text{SELECT} \longrightarrow \text{DISTINCT} \longrightarrow \text{ORDER BY} \longrightarrow \text{LIMIT}$$
* **Focus**: Preventing the "JOIN Fan-Out" bug (when 1-to-many joins duplicate rows and inflate `SUM()` totals).

---

#### Day 14 — Project Part 2: Multi-Table Reporting
* **Module**: `day-14` | **Type**: `project_part` | **Milestone**: `milestone-2`
* **Concepts**: Executive dashboards connecting all 6 e-commerce tables.
* **Tasks**:
  * Task 1: Category revenue breakdown with total sales and average order value.
  * Task 2: Supplier fulfillment report: Supplier name, items supplied, and total units in active orders.
  * Task 3: Customer loyalty tiers: Categorizing customers based on aggregate spend.

---

#### Day 15 — Independent Work / Debug Day
* **Module**: `day-15` | **Type**: `independent_work` | **Milestone**: `milestone-2`
* **Concepts**: Debugging subtle SQL bugs: NULL propagation in outer joins, accidental Cartesian products (missing ON conditions), and GROUP BY column mismatches.

---

#### Day 16 — Milestone Assignment 2 (Checkpoint Assessment)
* **Module**: `day-16` | **Type**: `assignment` | **Milestone**: `milestone-2`
* **Assessment Scope**: Days 9–15 comprehensive assessment.
* **Format**: 5 rigorous real-world reporting queries testing multi-table joins, grouped aggregates, HAVING filters, and edge-case NULL handling.

---

### MILESTONE 3: Modification, Advanced Queries & Transactions (Days 17–25)

---

#### Day 17 — Subqueries & CTEs
* **Module**: `day-17` | **Type**: `module` | **Milestone**: `milestone-3`
* **Concepts**: Scalar Subqueries in WHERE, Set Membership Subqueries (`IN`), Common Table Expressions (`WITH ... AS`).

##### Concept 1: Scalar & Set Subqueries
1. **Introduction**: "How do we find all products priced above the *average* product price?" We cannot write `WHERE price > AVG(price)` directly. We need a subquery.
2. **Visual Explanation**: Inner query executes once $\rightarrow$ returns scalar value \$84.50 $\rightarrow$ Outer query filters rows `WHERE price > 84.50`.
3. **SQL Query**: `SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);`
4. **MCQ**: What happens if a subquery in a comparison (`=`) returns 2 rows? (Runtime error: subquery returns more than 1 row).
5. **Task 1 (Direct)**: Find products priced above the overall average price.
6. **Task 2 (Transfer)**: Find customers who placed orders by checking `WHERE customer_id IN (SELECT customer_id FROM orders)`.

##### Concept 2: Common Table Expressions (`WITH ... AS`)
1. **Introduction**: Subqueries get messy and unreadable when nested. CTEs let us name temporary result sets like clean procedural steps.
2. **Visual Explanation**: CTE creates a named temporary pipeline table at the top of the query.
3. **SQL Query**:
   ```sql
   WITH CustomerSpending AS (
     SELECT customer_id, SUM(quantity * unit_price) AS total_spent
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     GROUP BY customer_id
   )
   SELECT * FROM CustomerSpending WHERE total_spent > 200;
   ```
4. **MCQ**: When is a CTE materialized vs inlined?
5. **Task 1 (Direct)**: Rewrite the average price query using a `WITH AveragePrice AS (...)` CTE.
6. **Task 2 (Transfer)**: Write a CTE calculating customer order counts, then select customers with $> 1$ order.

##### Day 17 Final Challenges (Homework)
* **Task 1**: Find products that have never been ordered using `WHERE product_id NOT IN (...)`.
* **Task 2**: Build a 2-stage CTE analyzing category average prices vs individual product prices.

---

#### Day 18 — Practice Day: Subqueries & CTEs
* **Module**: `day-18` | **Type**: `practice_day` | **Milestone**: `milestone-3`
* **Concepts**: Correlated subqueries (`WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`), multi-CTE pipelines.
* **Tasks**:
  * Task 1: Products priced above their own category average.
  * Task 2: Staged CTE: Total customer spend $\rightarrow$ Customer loyalty classification $\rightarrow$ VIP summary count.

---

#### Day 19 — DML: INSERT, UPDATE, DELETE
* **Module**: `day-19` | **Type**: `module` | **Milestone**: `milestone-3`
* **Concepts**: Data Modification Language: INSERT INTO, UPDATE SET with WHERE, DELETE FROM with WHERE, Safe execution rules.

##### Concept 1: Inserting New Records (`INSERT INTO`)
1. **Introduction**: Adding new rows into tables with explicit column lists.
2. **Visual Explanation**: New row appended to the bottom of the table structure.
3. **SQL Query**: `INSERT INTO products (name, category_id, supplier_id, price, quantity_in_stock) VALUES ('Desk Lamp Pro', 3, 4, 39.99, 20);`
4. **Task 1 (Direct)**: Insert a new product into `products`.
5. **Task 2 (Transfer)**: Insert a new customer record into `customers`.

##### Concept 2: Updating & Deleting Safely (`UPDATE`, `DELETE`)
1. **Introduction**: The critical danger of running `UPDATE` or `DELETE` without a `WHERE` clause.
2. **Visual Explanation**: Highlighting target row before modification vs accidentally wiping all rows.
3. **SQL Query**: `UPDATE products SET price = 29.99 WHERE product_id = 1;`
4. **Task 1 (Direct)**: Update the stock of product ID 1 to 50.
5. **Task 2 (Transfer)**: Delete cancelled orders older than a specific date threshold.

##### Day 19 Final Challenges (Homework)
* **Task 1**: Insert, verify, and update a new inventory batch.
* **Task 2**: Write a safe data migration modifying discount prices for discontinued items.

---

#### Day 20 — DDL: CREATE TABLE, ALTER TABLE, DROP TABLE
* **Module**: `day-20` | **Type**: `module` | **Milestone**: `milestone-3`
* **Concepts**: Data Definition Language: Data types (`INT`, `VARCHAR`, `DECIMAL`, `DATETIME`, `BOOLEAN`), Constraints (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT`), altering schema.
* **Tasks**:
  * Task 1: Create a new `product_reviews` table with foreign key references to `products` and `customers`.
  * Task 2: Alter table to add a `rating` constraint (`CHECK (rating BETWEEN 1 AND 5)`).
  * Task 3: Populate sample reviews and query average ratings per product.

---

#### Day 21 — Conceptual Session: Indexing, Transactions & Real-World SQL
* **Module**: `day-21` | **Type**: `conceptual_session` | **Milestone**: `milestone-3`
* **Concepts**: B-Tree indexes, full table scans vs index lookups, query plan inspection with `EXPLAIN`, ACID transaction guarantees (`BEGIN`, `COMMIT`, `ROLLBACK`).
* **Visual Exploration**: Comparing $O(N)$ table scans against $O(\log N)$ index seeks.

---

#### Day 22 — Project Part 3: Full-Stack Integration Queries
* **Module**: `day-22` | **Type**: `project_part` | **Milestone**: `milestone-3`
* **Concepts**: Crafting the exact SQL queries required by backend REST and GraphQL APIs.
* **Tasks**:
  * Task 1: "Get Product Detail Page" query (product info + category name + supplier name + rating summary).
  * Task 2: "Paginated Admin Order List" query with search filters and dynamic sorting.
  * Task 3: "Real-Time KPI Dashboard" query (today's revenue, pending shipments, low-stock warnings).

---

#### Day 23 — Project Part 4: Polish, Edge Cases & Performance
* **Module**: `day-23` | **Type**: `project_part` | **Milestone**: `milestone-3`
* **Concepts**: Handling zero-state records, NULL coalescing (`COALESCE`), query optimization, refactoring slow joins.
* **Tasks**:
  * Task 1: Null-safe customer summary ensuring customers with 0 orders display `$0.00` instead of `NULL`.
  * Task 2: Performance refactor: Replacing correlated subqueries with optimized CTE joins.

---

#### Day 24 — Milestone Assignment 3: Comprehensive Final Assessment
* **Module**: `day-24` | **Type**: `assignment` | **Milestone**: `milestone-3`
* **Assessment Scope**: Capstone evaluation across all 3 milestones.
* **Format**: 6 comprehensive real-world challenges testing full-stack backend queries, analytical CTEs, schema modification, and complex aggregations.

---

#### Day 25 — Graduation & Real-World Bridge
* **Module**: `day-25` | **Type**: `conceptual_session` | **Milestone**: `milestone-3`
* **Concepts**: Transitioning from learning environments to production:
  * Raw SQL vs ORMs (Prisma, Drizzle, Hibernate).
  * Database migrations & version control (Flyway, Liquibase).
  * Connection pooling, security (SQL injection prevention via parameterized queries), and career roadmap.

---

## 6. Prioritized Improvement Recommendations

### Critical (P0)
1. **Apply Day 2 Correction in Code**: Update `src/content/modules/day02.ts` to remove `AND`, `OR`, and `NOT`, keeping it focused strictly on `=`, `!=`, `<`, `>`, `<=`, `>=`, and single-quoted string filtering.
2. **Standardize Atomic Concept Structure for Days 4–25**: Expand all remaining module files to follow Day 1's atomic 2-task cycle (`Theory` $\rightarrow$ `Fake Table` $\rightarrow$ `Step Breakdown` $\rightarrow$ `MCQ` $\rightarrow$ `Task 1` $\rightarrow$ `Task 2`).

### Important (P1)
1. **Interactive Visual Execution Stepper**: Enhance the UI to let learners step forward/backward through `FROM` $\rightarrow$ `WHERE` $\rightarrow$ `SELECT` row animations.
2. **Contextual Hint Delivery**: Expand validator hints to pinpoint exact syntax or logical errors (e.g., distinguishing between a missing single quote vs. wrong column name).

### Nice to Have (P2)
1. **SQL Query Formatter**: Add a 1-click beautifier inside the SQL editor.
2. **Interactive Schema Graph**: Visual entity-relationship diagram modal showing table links as live highlighted nodes.


---

## 7. Batch Execution Roadmap & Status Tracker

To execute this large-scale curriculum systematically while ensuring every concept strictly adheres to Day 1's gold standard, the implementation is broken into **8 discrete batches**.

### Batch Tracker Ledger

| Batch | Scope / Focus | Days | Status |
| :--- | :--- | :--- | :--- |
| **Batch 0** | **Foundation & Immediate Corrections**<br>• Correct Day 2 (Remove AND/OR/NOT; single-condition filters)<br>• Align Day 3 (Dedicated AND/OR/NOT, IN, BETWEEN, LIKE, IS NULL, Dates) | Days 2, 3 | `[x] COMPLETED` |
| **Batch 1** | **Milestone 1 Completion: Shaping & Assessment**<br>• Day 4 (ORDER BY, DISTINCT, LIMIT & OFFSET)<br>• Day 5 (Practice Day: Full Retrieval + Filtering + Shaping)<br>• Day 6 (Conceptual: Logical Processing Order)<br>• Day 7 (Project Part 1: Schema Exploration)<br>• Day 8 (Milestone 1 Checkpoint Assessment) | Days 4–8 | `[x] COMPLETED` |
| **Batch 2** | **Milestone 2 Part A: Aggregations & Grouping**<br>• Day 9 (COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING)<br>• Day 10 (Practice Day: Business Reporting & Analytics) | Days 9–10 | `[x] COMPLETED` |
| **Batch 3** | **Milestone 2 Part B: Relational JOINs & Processing**<br>• Day 11 (PK/FK primer, INNER JOIN, LEFT JOIN, Aliases)<br>• Day 12 (Practice Day: JOINs + Aggregates)<br>• Day 13 (Conceptual: Relational Thinking & 8-Stage Execution Order) | Days 11–13 | `[x] COMPLETED` |
| **Batch 4** | **Milestone 2 Part C: Reporting Project & Checkpoint**<br>• Day 14 (Project Part 2: Multi-Table Reporting)<br>• Day 15 (Independent Work / Debug Day)<br>• Day 16 (Milestone 2 Assessment Checkpoint) | Days 14–16 | `[x] COMPLETED` |
| **Batch 5** | **Milestone 3 Part A: Subqueries, CTEs & DML**<br>• Day 17 (Scalar Subqueries, IN lists, WITH CTEs)<br>• Day 18 (Practice Day: Correlated Subqueries & Staged CTEs)<br>• Day 19 (DML: INSERT, UPDATE, DELETE with safety rules) | Days 17–19 | `[x] COMPLETED` |
| **Batch 6** | **Milestone 3 Part B: DDL, Indexes & Integration**<br>• Day 20 (DDL: CREATE TABLE, ALTER, DROP, Constraints)<br>• Day 21 (Conceptual: Indexing, B-Trees, EXPLAIN, ACID Transactions)<br>• Day 22 (Project Part 3: Backend API Integration Queries)<br>• Day 23 (Project Part 4: Edge Cases, NULLs & Performance Tuning) | Days 20–23 | `[x] COMPLETED` |
| **Batch 7** | **Milestone 3 Part C: Capstone Assessment & Graduation**<br>• Day 24 (Milestone 3 Comprehensive Final Assessment)<br>• Day 25 (Graduation & Real-World Bridge: ORMs, Migrations, Security) | Days 24–25 | `[x] COMPLETED` |

---

### Detailed Batch Breakdown

#### 🔹 Batch 0: Foundation & Immediate Corrections
* [x] **Day 2**: Rebuilt [`day02.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day02.ts) with 3 core single-predicate concepts (Equality/Inequality, Numeric Range Comparisons, Text/String Filtering with Single Quotes) + 2 tasks per concept + Homework Challenges (Strictly NO `AND`/`OR`/`NOT`).
* [x] **Day 3**: Rebuilt [`day03.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day03.ts) with dedicated logical combinators (AND, OR, NOT, Parentheses), range/set inclusion (BETWEEN, IN), pattern matching (LIKE), NULL safety (IS NULL), and Homework Challenges.

#### 🔹 Batch 1: Milestone 1 Completion (Days 4–8)
* [x] **Day 4**: Rebuilt `day04` in [`day04to08.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day04to08.ts) (ORDER BY ASC/DESC, DISTINCT, LIMIT & OFFSET pagination) with 3 concepts $\times$ 2 tasks + Challenges.
* [x] **Day 5**: Rebuilt `day05` in [`day04to08.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day04to08.ts) (Practice Day: Retrieval + Filtering + Shaping synthesis).
* [x] **Day 6**: Rebuilt `day06` in [`day04to08.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day04to08.ts) (Conceptual Session: 5-Stage Execution Order & alias visibility timing).
* [x] **Day 7**: Rebuilt `day07` in [`day04to08.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day04to08.ts) (Project Part 1: Full Schema Exploration across all entities).
* [x] **Day 8**: Rebuilt `day08` in [`day04to08.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day04to08.ts) (Milestone 1 Checkpoint Assessment).

#### 🔹 Batch 2: Milestone 2 Part A — Aggregations (Days 9–10)
* [x] **Day 9**: Rebuilt `day09` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING) with 3 concepts $\times$ 2 tasks + Challenges.
* [x] **Day 10**: Rebuilt `day10` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Practice Day: Business Reporting & Analytics with 2 tasks + Challenges).

#### 🔹 Batch 3: Milestone 2 Part B — Relational JOINs (Days 11–13)
* [x] **Day 11**: Rebuilt `day11` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (PK/FK primer, INNER JOIN, LEFT JOIN, aliases) with 2 concepts $\times$ 2 tasks + Challenges.
* [x] **Day 12**: Rebuilt `day12` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Practice Day: JOINs + Aggregates with fan-out prevention).
* [x] **Day 13**: Rebuilt `day13` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Conceptual Session: Full 7-Stage Execution Order & relational normalization).

#### 🔹 Batch 4: Milestone 2 Part C — Reporting Project & Assessment (Days 14–16)
* [x] **Day 14**: Rebuilt `day14` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Project Part 2: Multi-Table Executive Reporting with anti-joins).
* [x] **Day 15**: Rebuilt `day15` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Independent Work / Debug Day with temporal filters).
* [x] **Day 16**: Rebuilt `day16` in [`day09to16.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day09to16.ts) (Milestone 2 Checkpoint Assessment).

#### 🔹 Batch 5: Milestone 3 Part A — Subqueries, CTEs & DML (Days 17–19)
* [x] **Day 17**: Rebuilt `day17` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Scalar Subqueries, IN lists, Common Table Expressions `WITH ... AS`) with 2 concepts $\times$ 2 tasks + Challenges.
* [x] **Day 18**: Rebuilt `day18` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Practice Day: Correlated Subqueries & Staged CTEs).
* [x] **Day 19**: Rebuilt `day19` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (DML: INSERT INTO, UPDATE, DELETE with WHERE safety).

#### 🔹 Batch 6: Milestone 3 Part B — DDL, Indexing & Integration (Days 20–23)
* [x] **Day 20**: Rebuilt `day20` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (DDL: CREATE TABLE, ALTER TABLE, DROP TABLE, Constraints).
* [x] **Day 21**: Rebuilt `day21` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Conceptual Session: Indexing, B-Trees, EXPLAIN, ACID Transactions).
* [x] **Day 22**: Rebuilt `day22` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Project Part 3: Production Backend API Query Patterns).
* [x] **Day 23**: Rebuilt `day23` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Project Part 4: Edge Cases, Null-safe aggregation & Performance).

#### 🔹 Batch 7: Milestone 3 Part C — Capstone Assessment & Graduation (Days 24–25)
* [x] **Day 24**: Rebuilt `day24` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Milestone 3 Comprehensive Final Assessment).
* [x] **Day 25**: Rebuilt `day25` in [`day17to25.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/modules/day17to25.ts) (Graduation & Real-World Bridge: ORMs, Migrations, Security, Production Best Practices).
