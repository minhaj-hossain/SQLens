# SQLens Milestone 4: Implementation Action Plan
## Clear, Step-by-Step Work Phases (No Jargon, Plain English)

This guide breaks down all the work for **Days 39 through 57** into clear, bite-sized phases. Each phase has a distinct goal, what needs to be built first, which lessons to write, and how to verify your progress before moving to the next step.

---

## Big Picture: The 6 Work Phases

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 0: Engine & Tools (Set Up the Foundation)             │
│ Add support for views, procedures, and dual database syntax │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Reusable Queries & Trees (Days 39 – 42)            │
│ Saved Views, Check Rules & Hierarchy Explorations           │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Automation & Safety Hooks (Days 43 – 48)           │
│ Custom Functions, Stored Procedures, Triggers & Checkpoint  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Preventing Data Clashes (Days 49 – 50)             │
│ Handling simultaneous users, locking rows, and savepoints   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Speed & Handling Large Data (Days 51 – 54)         │
│ Reading query plans, smart indexes, partitions & JSON data  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Security, Upgrades & Final Capstone (Days 55 – 57) │
│ User roles, smooth database upgrades & Final Project        │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Engine & Validation Foundation (The Groundwork)

Before writing the lessons, the SQL engine in your app must know how to understand and check the new SQL commands.

### What to do:
1. **Support New Database Commands in the Code Engine (`src/lib/sql-engine/`):**
   - Teach the engine to remember views (`CREATE VIEW`) and look them up when queried.
   - Add safe repeated looping for tree queries (`WITH RECURSIVE`), stopping at 100 loops so it never freezes the browser.
   - Accept stored function and procedure definitions so learners can write and call them.
   - Add support for `SAVEPOINT` and `ROLLBACK TO SAVEPOINT` so partial steps can be undone.
2. **Update Curriculum Types (`src/types/curriculum.ts`):**
   - Add fields for dialect options (`mysql`, `postgres`, or `both`).
   - Add support for multiple-choice judgment questions where learners explain *why* they chose a solution.
3. **Check the Foundation:**
   - Run existing tests (`npm run test:engine`) to ensure nothing broke.

---

## Phase 1: Reusable Queries & Tree Exploration (Days 39 – 42)

**Theme:** Teach learners how to save messy queries under clean names and walk through nested data (like org charts).

### Lessons to Build:
- **Day 39 — Saved Queries (`views-saved-queries`):**
  - *What it teaches:* How to save a long query as a view so anyone can query it like a simple table.
  - *Why it matters:* Hides complex table joins and keeps reports simple.
- **Day 40 — View Rules & Editable Views (`views-updatability-check-option`):**
  - *What it teaches:* When you can edit data through a view and how to block bad edits using `WITH CHECK OPTION`.
  - *Why it matters:* Prevents users from accidentally inserting rows that break business rules.
- **Day 41 — Generating Sequences & Filling Gaps (`recursive-ctes-series`):**
  - *What it teaches:* Using `WITH RECURSIVE` to generate numbers and calendar dates from scratch.
  - *Why it matters:* Solves the classic problem where days with zero sales disappear from charts.
- **Day 42 — Navigating Trees & Management Chains (`hierarchies-graph-traversal`):**
  - *What it teaches:* Walking step-by-step from an employee up to the CEO, building a breadcrumb path (e.g., `CEO > VP > Manager > You`).
  - *Why it matters:* Essential for categories, folder trees, and organizational charts.

### How to verify Phase 1:
- Run `npm run verify:curriculum` to check that all exercises and solutions run cleanly.

---

## Phase 2: Automation, Procedures & Guardrails (Days 43 – 48)

**Theme:** Let the database do the heavy lifting automatically and protect itself from mistakes.

### Lessons to Build:
- **Day 43 — Custom Formulas (`stored-functions`):**
  - *What it teaches:* Writing reusable formulas (like tax calculations or discount tiers) directly inside SQL.
  - *Why it matters:* Avoids duplicating the same math formula in 10 different reports.
- **Day 44 — Multi-Step Operations (`stored-procedures`):**
  - *What it teaches:* Grouping multiple steps (like adding an order, updating stock, and writing a log) into a single routine called with `CALL`.
  - *Why it matters:* Packages whole business actions so apps don't have to send 5 separate queries over the network.
- **Day 45 — Handling Errors & Safe Rollbacks (`procedural-control-error-handling`):**
  - *What it teaches:* Checking rules with `IF/ELSE`, throwing clear error messages when something is wrong, and canceling safely.
  - *Why it matters:* Guarantees that if a payment fails halfway through, no half-finished order gets saved.
- **Day 46 — Automatic Event Triggers (`triggers-audit`):**
  - *What it teaches:* Setting up automatic hooks that run before or after data changes to track who changed what and when.
  - *Why it matters:* Automatically creates audit histories without relying on developers remembering to log it.
- **Day 47 — Refactoring Lab (`encapsulation-lab`):**
  - *What it teaches:* A practice day with a blank screen. Learners look at messy code and decide: *Should this be a view, a function, a procedure, or a trigger?*
- **Day 48 — Milestone 4A Checkpoint (`milestone-4a-checkpoint`):**
  - *What it teaches:* An open challenge with no hints. Learners build a view, a function, a procedure, and an audit trigger from scratch.

### How to verify Phase 2:
- Run `npm run verify:curriculum` and ensure all procedure calls and triggers execute properly in sequence.

---

## Phase 3: Preventing Data Clashes & Concurrency (Days 49 – 50)

**Theme:** What happens when two users click "Buy" on the last item at the exact same millisecond?

### Lessons to Build:
- **Day 49 — Timing Clashes & Safety Levels (`isolation-concurrency`):**
  - *What it teaches:* The 4 common mistakes that happen when queries overlap (like reading half-saved data or accidentally overwriting someone else's work).
  - *Why it matters:* Teaches learners how to choose the right transaction safety level without slowing the whole site down.
- **Day 50 — Locking Rows & Safe Checkpoints (`locking-contention-deadlocks`):**
  - *What it teaches:* Putting a temporary "in use" sign on a row (`SELECT ... FOR UPDATE`), using savepoints for partial undo, and avoiding deadlocks where two queries get stuck waiting on each other forever.
  - *Why it matters:* Keeps seat-reservation and checkout systems 100% accurate under heavy traffic.

### How to verify Phase 3:
- Verify that timeline scenarios and multiple-choice explanations clearly illustrate the problem without getting bogged down in academic jargon.

---

## Phase 4: Diagnosing Slow Queries & Scaling Up (Days 51 – 54)

**Theme:** Finding why queries run slowly, making them fast, and handling modern flexible data like JSON.

### Lessons to Build:
- **Day 51 — Reading the Database's Plan (`reading-query-plans`):**
  - *What it teaches:* Using `EXPLAIN` to look under the hood. Seeing whether the database scanned every single row or used a fast index shortcut.
  - *Why it matters:* Turns slow-query troubleshooting from random guessing into precise science.
- **Day 52 — Multi-Column Indexes & Fast Lookups (`composite-covering-indexes`):**
  - *What it teaches:* Making indexes that cover two or more columns, understanding column order (left-to-right rule), and creating indexes that answer queries without touching the main table.
  - *Why it matters:* Speeds up filtered and sorted searches on millions of rows.
- **Day 53 — Big Table Slicing & Fast Page Flipping (`partitioning-deep-pagination`):**
  - *What it teaches:* Splitting massive tables by year or month so searches only touch relevant chunks, and replacing slow `OFFSET` page numbers with lightning-fast cursor pagination.
  - *Why it matters:* Keeps website search results and feeds fast, even on page 5,000.
- **Day 54 — Working with Flexible JSON Data (`json-semi-structured-data`):**
  - *What it teaches:* Storing and extracting data from JSON columns, and knowing when to use JSON vs when to use regular columns.
  - *Why it matters:* Handles dynamic product features, customer preferences, and external API responses cleanly.

### How to verify Phase 4:
- Check that all `EXPLAIN` query tasks return the expected plan results and that cursor queries pass verification.

---

## Phase 5: Production Security, Upgrades & Capstone (Days 55 – 57)

**Theme:** Running a real database in production safely, keeping data private, and putting everything together.

### Lessons to Build:
- **Day 55 — User Roles & Keeping Data Private (`users-roles-least-privilege`):**
  - *What it teaches:* Creating read-only accounts for reporting analysts, locking down apps so they can't delete tables, and keeping customer data separated.
  - *Why it matters:* Protects against accidental data leaks and destructive mistakes.
- **Day 56 — Upgrading Tables Without Downtime (`migrations-schema-evolution`):**
  - *What it teaches:* The safe 3-step dance for renaming or splitting columns (Add New ➔ Copy Data ➔ Remove Old) while users are actively using the website.
  - *Why it matters:* Prevents website error pages and downtime during software updates.
- **Day 57 — The Production Capstone (`production-capstone`):**
  - *What it teaches:* A realistic 2-hour final project where learners design, protect, index, and upgrade a complete multi-company SaaS database from scratch.
  - *Why it matters:* Gives learners a portfolio-grade project showing mastery of high-level database engineering.

### How to verify Phase 5:
- Run full automated checks:
  1. `npm run test:module-order` (Confirms Days 1 through 57 line up in perfect order)
  2. `npm run verify:curriculum` (Confirms every task in every lesson runs and passes)
  3. `npm run build` (Ensures the web app builds cleanly with zero errors)

---

## Progress Checklist

Track your progress by checking off items as you finish them:

- [x] **Phase 0:** Engine updates (view registry, recursive safety check, procedure dispatch)
- [x] **Phase 1:** Days 39, 40, 41, 42 created and verified
- [ ] **Phase 2:** Days 43, 44, 45, 46, 47, 48 created and verified
- [ ] **Phase 3:** Days 49, 50 created and verified
- [ ] **Phase 4:** Days 51, 52, 53, 54 created and verified
- [ ] **Phase 5:** Days 55, 56, 57 created and verified
- [ ] **Final Sign-off:** All test commands green (`verify:curriculum`, `test:module-order`, `build`)

