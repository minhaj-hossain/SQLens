# SQLens Curriculum Map — The 38-Day Journey

Three milestones, one arc: **ask → connect → build**. Each day is one focused module
(`src/content/modules/day-NN-<semantic>.ts`); module IDs are day-based and immutable.

---

## Stage 1 — Foundations · *Ask the Right Questions — Single-Table Mastery*
*Learn to ask the database precisely what you need: retrieve specific columns, filter rows by
conditions, and shape raw tables into answers.*

| Day | Module | Focus |
|----:|--------|-------|
| 1 | `day-01` — SELECT Queries 101 | Pinpoint exactly the columns you need |
| 2 | `day-02` — Filter Rows with WHERE | Keep only the rows that matter |
| 3 | `day-03` — Advanced Filtering Techniques | BETWEEN, IN, LIKE, IS NULL, compound logic |
| 4 | `day-04` — Sort, Deduplicate & Paginate | ORDER BY, DISTINCT, LIMIT/OFFSET |
| 5 | `day-05` — Complete Single-Table Queries | Full single-table pipelines, business requirements only |
| 6 | `day-06` — How SQL Really Executes Your Query | The 5-step logical processing order |
| 7 | `day-07` — Real Project: E-Commerce Database Audit | Five audits across the storefront schema |
| **8** | **`day-08` — Milestone 1 Challenge: Single-Table Mastery** | **Checkpoint: 5 deliverables, no hints** |

## Stage 2 — Analysis · *See the Big Picture — Multi-Table Insights & Reporting*
*Connect the dots across tables, summarize data into actionable metrics, and build the queries
that power dashboards.*

| Day | Module | Focus |
|----:|--------|-------|
| 9 | `day-09` — Summarize Data with Aggregation & Grouping | COUNT, SUM, AVG + GROUP BY |
| 10 | `day-10` — Conditional Logic with CASE | Row-level branching inside SELECT |
| 11 | `day-11` — Transform Text with String Functions | CONCAT, UPPER, SUBSTRING, TRIM |
| 12 | `day-12` — Work with Dates Like a Pro | YEAR/MONTH, DATEDIFF, relative windows |
| 13 | `day-13` — Build Reporting Dashboards with Aggregates | HAVING-filtered dashboard widgets |
| 14 | `day-14` — Connect Tables with JOINs | INNER JOIN vs LEFT JOIN |
| 15 | `day-15` — Debug Join Pitfalls | Fan-out, row duplication, COUNT(DISTINCT) |
| 16 | `day-16` — The Full Query Execution Model (7 Stages) | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT |
| 17 | `day-17` — Set Operations: UNION & EXCEPT | Stack, tag, and subtract result sets |
| 18 | `day-18` — Applied Project: BI Analytics Dashboard | Three multi-table reports, no starter SQL |
| 19 | `day-19` — Debugging Lab: Harden Queries & Temporal Filters | Date-range constraints on live reports |
| **20** | **`day-20` — Milestone 2 Challenge: Multi-Table Analyst** | **Checkpoint: 4 deliverables, no hints** |

## Stage 3 — Mastery · *Build & Defend — Data Modification, Schema Design & Production Safety*
*Move beyond querying to building: design your own tables, modify data safely using
transactions, and ship queries that survive production.*

| Day | Module | Focus |
|----:|--------|-------|
| 21 | `day-21` — Decompose Complex Queries with Subqueries & CTEs | Scalar, IN, correlated, WITH |
| 22 | `day-22` — Apply Correlated Subqueries & CTEs: Practice Lab | Blank-editor practice |
| 23 | `day-23` — Rank Rows Without Collapsing: Window Functions I | ROW_NUMBER, RANK, DENSE_RANK, PARTITION BY |
| 24 | `day-24` — Track Trends with Running Metrics: Window Functions II | Running totals, LAG/LEAD, frames |
| 25 | `day-25` — Modify Data Safely: INSERT, UPDATE, DELETE | Guarded DML, WHERE discipline |
| 26 | `day-26` — Control Transaction Boundaries | BEGIN / COMMIT / ROLLBACK atomicity |
| 27 | `day-27` — Blueprint Tables and Schema: DDL Foundations | CREATE TABLE, keys, defaults |
| 28 | `day-28` — Enforce Data Quality at the Database: Column Constraints | NOT NULL, UNIQUE, CHECK, FK |
| 29 | `day-29` — Evolve Schemas and Define Relationships: DDL III | ALTER TABLE, ADD/DROP COLUMN |
| 30 | `day-30` — Design Better Schemas: Normalization Fundamentals | 1NF → 3NF on real data |
| 31 | `day-31` — Optimize Slow Queries: Performance, Indexing & EXPLAIN | Indexes, plans, ALL → ref |
| 32 | `day-32` — Ship It Safely: Security & Production Practices | SQL injection, parameterization, guarded migrations |
| 33 | `day-33` — Capstone: Build a Complete Database From Scratch | Schema → seed → report → index, end to end |
| 34 | `day-34` — Apply Skills to Backend API: Production Integration Queries | Endpoint-shaped queries |
| 35 | `day-35` — Harden Production Queries: Edge Cases & NULL Safety | Zero-state correctness |
| 36 | `day-36` — Comprehensive Skills Assessment: Milestone 3 Finale | 4 capstone deliverables across all 38 days |
| 37 | `day-37` — Test Your Skills: Interview Gauntlet Challenge | 3 interview classics, hints off |
| **38** | **`day-38` — Graduation: Bridge to Production Development** | **Portfolio query + what comes next** |

---

## Milestone → module ranges

| Milestone | moduleIds | Checkpoint |
|---|---|---|
| 1 — Foundations | `day-01` … `day-08` | Day 8 |
| 2 — Analysis | `day-09` … `day-20` | Day 20 |
| 3 — Mastery | `day-21` … `day-38` | Day 36 assessment + Day 37 gauntlet + Day 38 graduation |

Source of truth: `src/config/roadmap.ts` (milestone metadata + ranges) and
`src/config/curriculum-order.ts` (canonical ordering). The scripted check
`npm run test:module-order` enforces that IDs, filenames, `day` numbers, and positions all agree.
