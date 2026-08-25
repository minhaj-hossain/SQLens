# SQLens Curriculum Quality & Teaching Architecture Master Plan

## 1. Non-Negotiable Core Principle
> **The learner must never have to guess what query a visualization or transformation is demonstrating.**
> Before any step-by-step table breakdown, row-filtering check, or column transformation appears, the learner must see the complete, formatted target SQL query that the lesson is dissecting.

---

## 2. SQLens Voice & Tone Guide
Every explanation must feel like a **knowledgeable, patient teacher sitting next to the learner, walking through the data**.

### Target Voice Attributes:
- **Friendly & Direct:** Clear, human sentences without academic fluff.
- **Calm & Encouraging:** Simple step-by-step guidance without forced excitement or slang.
- **Technically Accurate:** Teaches correct SQL mental models without unnecessary database jargon.

### Comparison Reference:
| ❌ Robotic / Academic (Avoid) | ❌ Too Casual / Slangy (Avoid) | ✅ The SQLens Voice (Target) |
|---|---|---|
| *"SQL subsequently evaluates each tuple against the specified conditional expression."* | *"Boom! SQL destroys all the trash rows!"* | *"SQL checks each row against your condition and keeps only the rows that pass."* |
| *"Projects the designated attributes into the output relation."* | *"SQL vibes with these columns only."* | *"Selects and returns only the columns you asked for."* |
| *"The predicate resolves to a Boolean truth value."* | *"It checks if stuff is legit."* | *"The condition is either TRUE or FALSE for each row."* |
| *"Constructs a Cartesian product prior to relational reduction."* | *"It mashes everything together!"* | *"Matches every row from the first table with every row from the second table."* |

---

## 3. The 6 Visual Transformation Paradigms

Rather than forcing every concept into a generic template, SQLens uses 6 distinct pedagogical visual types:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TYPE A: Row Filtering (WHERE, AND, OR, BETWEEN, IN, LIKE, IS NULL)     │
│ Source Rows ───► [ Row-by-row Condition Check (TRUE/FALSE) ] ───► Surviving Rows │
├────────────────────────────────────────────────────────────────────────┤
│ TYPE B: Column Shaping (SELECT, Multiple Cols, SELECT *, AS)           │
│ Original Table [id, name, age, city] ───► SELECT name, age ───► [name, age]    │
├────────────────────────────────────────────────────────────────────────┤
│ TYPE C: Ordering & Limiting (ORDER BY, LIMIT, OFFSET)                  │
│ Raw Order ───► Sort (ASC/DESC with tiebreakers) ───► Pagination (Limit/Offset) │
├────────────────────────────────────────────────────────────────────────┤
│ TYPE D: Aggregation (COUNT, SUM, AVG, MIN, MAX)                        │
│ Multiple Column Values [10, 20, 30] ───► Aggregate Function ───► Single Scalar (60) │
├────────────────────────────────────────────────────────────────────────┤
│ TYPE E: Grouping & Group Filtering (GROUP BY, HAVING)                  │
│ Raw Rows ───► Category Buckets (CSE/EEE) ───► Bucket Summary ───► HAVING Filter │
├────────────────────────────────────────────────────────────────────────┤
│ TYPE F: Relational Joining (INNER JOIN, LEFT JOIN, Anti-JOIN)          │
│ Left Table (PK) ◄──[ Matching Keys (ON p.cat_id = c.id) ]──► Right Table (FK) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Flexible & Lightweight Type Definitions

Avoid heavy, over-engineered AST or diff engines. Keep the data model simple, resilient, and directly readable:

```typescript
// Target query to display before step breakdowns
export interface TargetQuery {
  sql: string;
  explanation?: string;
  badge?: string; // e.g. "Query we'll break down", "Inner Subquery", "Final Query"
}

// Lightweight step breakdown
export interface StepBreakdown {
  stepNumber: number;
  stepTitle: string;
  sqlSnippet?: string;
  clause?: string;
  explanation: string;
  tableData?: {
    tableName: string;
    columns: string[];
    highlightedColumns?: string[];
    highlightedRows?: number[];
    dimmedRows?: number[];
    rows: (string | number | null)[][];
  };
}

// In ConceptTheory:
export interface ConceptTheory {
  summary: string;
  introTable?: TableData;
  targetQuery?: TargetQuery; // <-- FIRST CLASS HERO ELEMENT
  explanation: string[];
  stepBreakdowns?: StepBreakdown[];
  syntaxBlocks?: SyntaxBlock[];
  keyTakeaway: string;
  exampleQuery: string;
  exampleQueryExplanation: string;
  liveDemoSql: string;
  liveDemoNotes?: string;
  mcqs: MCQ[];
}
```

---

## 5. Curriculum-Level Automated Verification

A dedicated Node/TypeScript test script (`scripts/verify-curriculum.ts`) validates the entire curriculum with strict checks:

1. **Step Breakdown Rule:** Every concept with `stepBreakdowns` MUST have a `targetQuery`.
2. **Table Reference Integrity:** Every table mentioned in `primaryTable` or `secondaryTables` exists in `DATABASE_SCHEMAS`.
3. **Prerequisite Safety:** Guided tasks only combine currently taught syntax with previously taught concepts—never future keywords.
4. **MCQ Quality:** Every MCQ has at least 3 options, a valid `correctIndex`, and an explanation.
5. **No Broken Markdown / Backtick Escaping:** Code fences and backticks are formatted cleanly.

---

## 6. Batched Execution Roadmap

The implementation has been successfully executed and verified across all batches:

### 📦 BATCH 0: Automated Audit & Verification Engine
- [x] Create `scripts/verify-curriculum.ts` to inspect all 25 days / 64 concepts.
- [x] Generate comprehensive concept matrix report (`audit_matrix.json` / console summary).
- [x] Add `npm run verify:curriculum` script to `package.json`.

### 📦 BATCH 1: Reusable Lesson UI Architecture
- [x] Update `src/types/curriculum.ts` with `targetQuery` and visual table metadata.
- [x] Update `src/components/learning/ConceptLessonView.tsx` with:
  - `TargetQueryHero` (prominent banner with syntax highlight & copy button before steps).
  - Clean step cards supporting row/column highlighting without layout clutter.
  - Reconnection between the final step and the target query.
- [x] Run build and verify component rendering.

### 📦 BATCH 2: Pilot Implementation — Days 1, 2 & 3
- [x] **Day 1 (`day01.ts`):** `SELECT & FROM`, multiple columns, `SELECT *`, `AS` aliasing (Type B Column Shaping).
- [x] **Day 2 (`day02.ts`):** `WHERE =`, `!=`, `<`, `>`, `<=`, `>=`, string quotes (Type A Row Filtering).
- [x] **Day 3 (`day03.ts`):** `AND`, `OR`, `NOT`, `()`, `IN`, `BETWEEN`, `LIKE`, `IS NULL` (Type A Compound Filtering).
- [x] Run `npm run verify:curriculum` and UI preview to validate the pilot.

### 📦 BATCH 3: Milestone 1 — Days 4 to 8
- [x] **Day 4:** Result Shaping (`ORDER BY`, `DISTINCT`, `LIMIT`, `OFFSET`).
- [x] **Day 5:** Multi-Table Database Practice (`pipelines`).
- [x] **Day 6:** Visual Concept Lab: 5-Stage Logical Query Processing Order.
- [x] **Day 7:** Applied Project: Full Schema Exploration.
- [x] **Day 8:** Milestone 1 Single-Table Mastery Checkpoint.

### 📦 BATCH 4: Milestone 2 Part A — Days 9 to 12 (Aggregation & JOINs)
- [x] **Day 9:** Aggregate Functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) & `GROUP BY` / `HAVING`.
- [x] **Day 10:** Guided Practice — Multi-Metric Reporting & Aggregation.
- [x] **Day 11:** Relational Keys (PK/FK), `INNER JOIN`, `LEFT JOIN`, Anti-JOIN.
- [x] **Day 12:** Multi-Table Debugging Lab: Aggregation & Fan-Out Prevention.

### 📦 BATCH 5: Milestone 2 Part B — Days 13 to 16 (Pipeline, BI Suite & Milestone 2)
- [x] **Day 13:** Visual Concept Lab: 7-Stage Relational Pipeline & Lifecycle.
- [x] **Day 14:** Applied Project: Business Intelligence Reporting Suite.
- [x] **Day 15:** Debugging Lab: Query Hardening & Temporal Filters.
- [x] **Day 16:** Milestone 2 Relational Mastery Checkpoint.

### 📦 BATCH 6: Milestone 3 Part A — Days 17 to 19 (Subqueries, CTEs & DML)
- [x] **Day 17:** Subqueries (Scalar, `IN`, `NOT IN` with NULL trap, Correlated) & CTEs (`WITH`).
- [x] **Day 18:** Guided Practice: Correlated Subqueries & CTE Refactoring.
- [x] **Day 19:** Data Mutation (`INSERT INTO`, `UPDATE ... WHERE`, `DELETE ... WHERE`).

### 📦 BATCH 7: Milestone 3 Part B — Day 20 (DDL & Schema Constraints)
- [x] **Day 20:** DDL Architecture (`CREATE TABLE`, Column Types, `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK`, `ALTER TABLE ADD`, `FOREIGN KEY`, `DROP TABLE IF EXISTS`).

### 📦 BATCH 8: Milestone 3 Part C & Graduation — Days 21 to 25
- [x] **Day 21:** Visual Concept Lab: Indexes, EXPLAIN & ACID Safety.
- [x] **Day 22:** Applied Project: Production Full-Stack Backend API Queries.
- [x] **Day 23:** Debugging Lab & Polish: Zero-State Hardening (`LEFT JOIN`, `COALESCE(SUM, 0)`).
- [x] **Day 24:** Milestone 3 Comprehensive Final Assessment & Capstone.
- [x] **Day 25:** Beyond the Course: Window Functions Preview (`ROW_NUMBER() OVER (PARTITION BY ...)`) & Graduation.
- [x] Run automated curriculum test script (`npm run verify:curriculum`) -> **100% Passing (0 missing target queries)**.
- [x] Run full application production build (`npm run build`) -> **0 TypeScript errors, bundle generated in 10.48s**.

