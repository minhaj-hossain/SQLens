# Prisma Curriculum Redesign — Implementation Plan

> **Document Version:** 2.0 (Post-Verification Baseline)  
> **Reference Review:** [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md)  
> **Status:** Pending Strategy Sign-Off & Execution

---

## 1. Guiding Principles & Architectural Rules

1. **Tasks Precede Concepts:** A lesson's concept list is strictly derived from the minimal concepts required to solve its tasks. Concepts without corresponding tasks are prohibited.
2. **Explicit Grading Classification:** Every task is explicitly classified as either `executable` (auto-graded against SQLite with SQL Lens enabled) or `snippet-lab` (AST/token-matched code presence check).
3. **No Unannounced Prerequisite Demands:** A task's solution code may only use concepts taught in earlier lessons or earlier in the same lesson.
4. **Three-Tier Task Progression:** Concepts follow an `introduce` (syntax scaffolded) → `practice` (context variation) → `assess` (diagnostic problem, no method hints) progression.
5. **Falsifiable Learning Outcomes:** Outcomes in `completionLearnings` must correspond to demonstrated tasks in that module.
6. **Seed Stability:** The live database seed (`users` and `posts`) in `PRISMA_TASK_SETUP_SQL` is kept stable to prevent regressions in existing tasks. Complex multi-table schemas are taught in snippet-lab mode.

---

## 2. Phase 0 — Immediate Defect Remediation (Step-by-Step Plan)

These four fixes address confirmed defects in the active curriculum. They are independent of the broader curriculum rewrite, do not require engine modifications, and can be implemented, tested, and shipped immediately.

---

### Step P0-1a: Fix Prerequisite Inversions in Day 6 Challenge (`prisma06-hw-1`)

- **Target File:** [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) (Lines 121–151)
- **Current Defect:**
  Task `prisma06-hw-1` ("Deterministic roster read") requires `findMany` and `orderBy: { id: "asc" }`:
  ```typescript
  export async function roster() {
    return await prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { id: 'asc' },
    });
  }
  ```
  `findMany` is not introduced until Day 7 (`prisma-07`), and `orderBy` is not introduced until Day 8 (`prisma-08`).
- **Pedagogical Goal for Day 6:**
  Day 6 teaches **PrismaClient Lifecycle & Connections** (the singleton pattern on `globalThis`, connection pooling, query logging, and `$disconnect`). The challenge must test single-client retrieval or lifecycle hygiene without demanding unintroduced query builder methods.
- **Detailed Step Breakdown:**
  1. **Redesign Task `prisma06-hw-1`:**
     - **Title:** "Production Gateway Lookup"
     - **Description:** Retrieve a single verified user's ID and email through the cached client gateway.
     - **Instructions:**
       - Use `prisma.user.findUnique` with `where: { email: 'alex@prisma.io' }`
       - Select `id` and `email`
     - **Hint:** `findUnique` with a unique `email` key returns a single typed record without unneeded scalar fields.
     - **Scaffold SQL:**
       ```sql
       -- Production gateway single lookup:
       SELECT id, email FROM users WHERE id = 99;
       ```
     - **Solution SQL:**
       ```sql
       SELECT id, email FROM users WHERE email = 'alex@prisma.io';
       ```
     - **Starter Code (`code0`):**
       ```typescript
       export async function getUser(email: string) {
         return await prisma.user.findUnique({
           where: { email },
         });
       }
       ```
     - **Solution Code (`code1`):**
       ```typescript
       export async function getUser(email: string) {
         return await prisma.user.findUnique({
           where: { email },
           select: { id: true, email: true },
         });
       }
       ```
     - **Grading & Constraints:**
       - `cols: ['id', 'email']`
       - `noCols: ['name']`
       - `rows: 1`
       - `rtype: '{ id: number; email: string } | null'`
  2. **Acceptance Criteria:**
     - Zero unintroduced methods (`findMany`, `orderBy`) in Day 6.
     - `npx vitest run tests/tracks/phase6-prisma-content.test.ts` passes with zero regressions.

---

### Step P0-1b: Fix Prerequisite Inversions in Day 5 Migrations & Seeding

- **Target File:** [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) (Lines 74–152)
- **Current Defects:**
  1. `prisma05-c2-t1` requires `prisma.user.upsert` with `update: {}` (`upsert` is not taught until Day 10 in `prisma-10`).
  2. `prisma05-hw-1` requires `prisma.user.createMany` with `skipDuplicates: true` (`createMany` is not taught until Day 9 in `prisma-09`).
- **Pedagogical Goal for Day 5:**
  Day 5 is **Migrations & Seeding**. Its core focus is the CLI workflow (`migrate dev`, `migrate deploy`, `migrate reset`) and package.json seed configuration. Seeding tasks should focus on CLI commands and seed script registration rather than advanced mutation methods that belong in Days 9 and 10.
- **Detailed Step Breakdown:**
  1. **Refactor Task `prisma05-c2-t1` ("Idempotent Seed Script Execution"):**
     - Shift focus to the CLI seed runner command `npx prisma db seed`.
     - **Instructions:**
       - Run `npx prisma db seed` to execute the registered seed script.
     - **Starter Code (`code0`):**
       ```typescript
       const cmd = "node prisma/seed.js";
       ```
     - **Solution Code (`code1`):**
       ```typescript
       const cmd = "npx prisma db seed";
       ```
     - **Snippets:** `need: ['npx prisma db seed']`, `ban: ['node ']`
     - **SQL Lens:** `SELECT id, email FROM users WHERE email = 'alex@prisma.io';`
  2. **Refactor Challenge Task `prisma05-hw-1` ("Clean Development Database Reset"):**
     - Replace the `createMany` task with a complete migration & seed reset workflow.
     - **Title:** "Deterministic Database Reset & Seed"
     - **Description:** When migrations diverge or the dev database state is corrupted, reset the schema and re-run all seed scripts in one CLI command.
     - **Instructions:**
       - Use `npx prisma migrate reset` to drop the database, apply all migrations, and trigger seeding.
       - Pass `--force` to skip interactive confirmation in scripts.
     - **Starter Code (`code0`):**
       ```typescript
       const resetCmd = "npx prisma db push --force-reset";
       ```
     - **Solution Code (`code1`):**
       ```typescript
       const resetCmd = "npx prisma migrate reset --force";
       ```
     - **Snippets:** `need: ['npx prisma migrate reset', '--force']`, `ban: ['db push']`
     - **SQL Lens:** `SELECT id, email FROM users WHERE id IN (1, 2, 3);`
  3. **Acceptance Criteria:**
     - Neither `upsert` nor `createMany` appears anywhere in Day 5.
     - All 4 tasks in Day 5 form a cohesive, CLI-driven migration and seeding journey.
     - `tests/tracks/phase6-prisma-content.test.ts` passes.

---

### Step P0-2: Rectify `select` vs. `include` Pedagogy & Add Nested `select`

- **Target File:** [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (Lines 77–155)
- **Current Defect:**
  Line 83 teaches a false dichotomy: `'select trims, include widens — never both at once.'`
  Task `prisma07-c2-t2` reinforces this antipattern by instructing learners to delete `select` to access relations.
- **Pedagogical Goal for Day 7:**
  Clarify that while `select` and `include` cannot be siblings at the root query level, **nested `select` is the idiomatic Prisma pattern** for fetching relations with specific columns.
- **Detailed Step Breakdown:**
  1. **Update Concept Theory Text:**
     - Replace line 83 with:
       ```
       '`select` and `include` cannot be used at the same root level of a query. To fetch relations without over-fetching, use a nested `select` inside your projection.'
       ```
     - Update the explanation block to show the three options:
       1. Scalar `select`: only specific model columns.
       2. Root `include`: all model columns + all relation columns.
       3. Nested `select`: specific model columns + specific relation columns.
  2. **Add Task `prisma07-c2-t3` ("Targeted Nested Relation Projection"):**
     - **Type:** Snippet Lab (`prismaSnippetTask`), because the SQL simulation engine silently drops nested relations in `select` (`prisma-sql-generator.ts` line 267).
     - **Title:** "Nested Relation Projection"
     - **Description:** Retrieve user 1's name and the titles of their posts, preventing all other columns from leaking.
     - **Instructions:**
       - Use `prisma.user.findUnique` with `where: { id }`
       - In `select`, include `name: true` and `posts: { select: { title: true } }`
     - **Starter Code (`code0`):**
       ```typescript
       export async function getUserPosts(id: number) {
         return await prisma.user.findUnique({
           where: { id },
           include: { posts: true },
         });
       }
       ```
     - **Solution Code (`code1`):**
       ```typescript
       export async function getUserPosts(id: number) {
         return await prisma.user.findUnique({
           where: { id },
           select: {
             name: true,
             posts: { select: { title: true } },
           },
         });
       }
       ```
     - **Snippets:** `need: ['posts: {', 'select: { title: true }']`, `ban: ['include:']`
     - **SQL Lens / Solution SQL:** `SELECT name FROM users WHERE id = 1;`
  3. **Acceptance Criteria:**
     - Theory no longer teaches the false rule.
     - Learners write idiomatic nested selection.
     - All tests pass.

---

### Step P0-3: Deliver the Atomic `increment` Teaching Task in Day 10

- **Target File:** [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) (Lines 21 & 38–80)
- **Current Defect:**
  `completionLearnings` claims: `'Do arithmetic atomically with increment'`, but not a single task teaches or tests `increment`.
  The engine audit confirmed that `scalarAtomicSets` in `prisma-sql-generator.ts` (lines 1017–1053) **already fully supports** `increment`, `decrement`, `multiply`, and `divide`!
- **Pedagogical Goal for Day 10:**
  Provide an executable task demonstrating concurrency-safe atomic updates on numeric columns without read-modify-write race conditions.
- **Detailed Step Breakdown:**
  1. **Add Task `prisma10-c1-t3` ("Concurrency-Safe Atomic Increment"):**
     - **Location:** Under concept `update-atomic`, following `prisma10-c1-t2`.
     - **Type:** Executable Read/Mutation Task (`prismaReadTask`).
     - **Title:** "Atomic Numeric Increment"
     - **Description:** Increment the `authorId` or post counter atomically without an insecure read-before-write round trip.
     - **Instructions:**
       - Use `prisma.post.update` with `where: { id: 1 }`
       - Update `authorId` using `{ increment: 1 }`
       - Select `id` and `authorId`
     - **Hint:** Atomic math prevents race conditions: `data: { authorId: { increment: 1 } }`.
     - **Scaffold SQL:**
       ```sql
       -- The post before the atomic increment:
       SELECT id, authorId FROM posts WHERE id = 99;
       ```
     - **Solution SQL:**
       ```sql
       SELECT id, authorId FROM posts WHERE id = 1;
       ```
     - **Starter Code (`code0`):**
       ```typescript
       export async function reassignPost(id: number) {
         return await prisma.post.update({
           where: { id },
           data: { authorId: 2 },
           select: { id: true, authorId: true },
         });
       }
       ```
     - **Solution Code (`code1`):**
       ```typescript
       export async function reassignPost(id: number) {
         return await prisma.post.update({
           where: { id },
           data: { authorId: { increment: 1 } },
           select: { id: true, authorId: true },
         });
       }
       ```
     - **Task Settings:**
       - `model: 'post'`
       - `cols: ['id', 'authorId']`
       - `select: ['id', 'authorId']`
       - `method: 'update'`
       - `snippets: ['increment: 1']`
       - `rows: 1`
       - `rtype: '{ id: number; authorId: number }'`
  2. **Acceptance Criteria:**
     - Executable task runs against the engine and SQL generator without errors.
     - `completionLearnings` claim is 100% verified and fulfilled by hands-on practice.
     - `tests/tracks/phase6-prisma-content.test.ts` passes.

---

### Step P0-4: Overhaul the Day 14 Capstone Challenge

- **Target File:** [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) (Lines 213–295)
- **Original Defect:**
  Task `prisma14-hw-1` ("Published record read") was a basic single-record `findUnique` on email with `select: { id: true, email: true }` — structurally identical to the Day 1 intro query and insufficient to test cumulative mastery.
- **Engine Constraint (discovered during implementation):**
  The SQL simulation engine silently drops nested relations from a `select` block (`prisma-sql-generator.ts` line 267). A single `include`-based task cannot be graded as **executable** — the SQL Lens would show only the scalar columns, making the relational load invisible to the grader. The original one-task spec was therefore split into two complementary tasks.
- **Pedagogical Goal for Day 14:**
  The capstone must synthesise multi-concept backend skills across two unassisted tasks: projection discipline (no over-fetching) and relational loading (idiomatic `include` usage).

#### Task 1 — `prisma14-hw-1` (Executable): Strict Projection

- **Type:** Executable (`prismaReadTask`)
- **Title:** "Strict projection — all users, no `name`"
- **Description:** Return the public roster (id + email) for every user ordered by id. The `name` column must never leave the database.
- **Instructions:**
  - Use `findMany`
  - `orderBy: { id: "asc" }`
  - Select `id` and `email` only — never `name`
- **Scaffold SQL:**
  ```sql
  -- The roster your endpoint must return:
  SELECT id, email FROM users WHERE id = 99;
  ```
- **Solution SQL:**
  ```sql
  SELECT id, email FROM users ORDER BY id ASC;
  ```
- **Starter Code (`code0`):**
  ```typescript
  export async function roster() {
    return await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
  }
  ```
- **Solution Code (`code1`):**
  ```typescript
  export async function roster() {
    return await prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, email: true },
    });
  }
  ```
- **Constraints:**
  - `cols: ['id', 'email']`, `noCols: ['name']`
  - `orderBy: [{ field: 'id', direction: 'asc' }]`
  - `rows: 3`
  - `rtype: '{ id: number; email: string }[]'`

#### Task 2 — `prisma14-hw-2` (Snippet Lab): Relational Profile

- **Type:** Snippet Lab (`prismaSnippetTask`)
- **Title:** "Relational profile — user with posts"
- **Description:** Fetch one user by email and eagerly load all their posts. Use `include`, not root `select` — they cannot coexist at the top level.
- **Instructions:**
  - Use `findUnique` with `where: { email }`
  - Load posts via `include: { posts: true }`
  - Do NOT add a root `select` block
- **Scaffold SQL:**
  ```sql
  -- Profile query: user + their posts
  SELECT id, email FROM users WHERE id = 99;
  ```
- **Solution SQL:**
  ```sql
  SELECT id, email, name FROM users WHERE email = 'alex@prisma.io';
  ```
- **Starter Code (`code0`):**
  ```typescript
  export async function profile(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }
  ```
- **Solution Code (`code1`):**
  ```typescript
  export async function profile(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { posts: true },
    });
  }
  ```
- **Constraints:**
  - `includes: ['posts']`, `select: []` (suppresses `requiredFieldsInSelect` — no root `select` by design)
  - `need: ['findUnique(', 'include:', 'posts: true']`
  - `ban: ['select: {']`
  - `rtype: '({ id: number; email: string; name: string; posts: { id: number; title: string; authorId: number }[] }) | null'`

#### Acceptance Criteria

- Capstone has two unassisted tasks covering complementary skills (projection + relational loading).
- `prisma14-hw-2` uses snippet-lab grading, consistent with engine constraints.
- `ban: ['select: {']` enforces the Day 7 correction: root `include` and root `select` cannot coexist.
- `tests/tracks/phase6-prisma-content.test.ts` passes (21/21). ✅ Shipped in commit `04e0c7e`.

---

## 3. Phase 1 — Capability Grounding (Complete)

The engine audit has mapped all Prisma features to their grading viability:

- **100% Executable:** `findUnique`, `findFirst`, `findMany` (with `where`, `orderBy`, `skip`, `take`, scalar `select`, `include`), `create`, `createMany`, `update`, `updateMany`, `upsert`, `delete`, `deleteMany`, `$transaction` (array and interactive), and atomic arithmetic (`increment`, `decrement`, `multiply`, `divide`).
- **Snippet-Lab Mandatory:** Schema declarations (`datasource`, `model`, `@id`, `@relation`, `@unique`, `@@unique`, `enum`, `@map`), Migration CLI (`migrate dev`, `deploy`, `status`), Prisma Client init/teardown, `groupBy`, `aggregate`, `count`, relational filters (`some`/`every`/`none`), `cursor` pagination, and nested `select` on relations.

---

## 4. Phase 2 — Architecture & Dependency Mapping (Step-by-Step Plan)

Phase 2 is a **planning and audit phase** — no new content is authored yet. The output is a signed-off architecture map, a verified module↔section mapping, and a gap list that drives Phase 4 content authoring.

---

### Concept Dependency Graph

```
[Schema Definition & Directives] (Snippet Lab)   ← S1, S2, S3
               │
               ▼
[Migrations & CLI Workflows] (Snippet Lab)        ← S4
               │
               ▼
[Prisma Client Instantiation & Lifecycle] (Snippet Lab) ← S5
               │
       ┌───────┴───────┐
       ▼               ▼
[Single Record CRUD]  [Scalar Reads]              ← S6, S7
(create, findUnique)  (findMany, where)
       │               │
       └───────┬───────┘
               ▼
[Query Shaping & Pagination]                      ← S8
(orderBy, skip, take)
               │
               ▼
[Field Selection & Relations]                     ← S9
(select, include, nested select)
               │
               ▼
[Mutations & Atomic Arithmetic]                   ← S10
(update, updateMany, increment/decrement)
               │
               ▼
[Idempotence & Bulk Deletion]                     ← S11
(upsert, delete, deleteMany)
               │
               ▼
[Error Handling & Diagnostics]                    ← S12
(P2002, P2025 via try/catch)
               │
               ▼
[Atomic Transactions]                             ← S13
($transaction sequential & interactive)
               │
               ▼
[Advanced Analytics & Relational Filters]         ← S14
(groupBy, some/every) (Snippet Lab)
               │
               ▼
[Capstone Diagnostic Synthesis]                   ← S15
```

---

### Step P2-1: Formally Adopt Strategy C (Two-Tier Hybrid)

- **Action:** Record the grading strategy decision in the plan so all subsequent authoring follows a single, stable rule.
- **Decision:** **Strategy C — Two-Tier Hybrid**
  - **Core foundations** (CRUD, atomic math, transactions, reads, pagination, error handling) → **Executable** tasks graded by SQLite + SQL Lens.
  - **Structural/CLI/advanced analytics** (schema declarations, migration CLI, `groupBy`, relational filters, nested `select` on relations) → **Snippet-Lab** tasks graded by AST/token matching.
- **Rule of thumb:** If the engine's `generatePrismaSql` can produce a valid, human-readable SQL statement for it, it is executable. If the engine silently drops it or rejects it (`ok: false`), it is a snippet lab.
- **Output:** This section of the plan serves as the sign-off document.
- **Acceptance Criteria:**
  - ✅ Strategy C rationale is documented here.
  - ✅ No Phase 4 task is authored without first classifying it as `executable` or `snippet-lab` per the engine matrix.

---

### Step P2-2: Map Existing 14 Modules to S1–S15

Each of the 14 current modules is mapped to the section(s) it covers. This establishes what already exists and prevents authoring duplicate content.

| Module File | Day | Primary Section(s) | Current State |
|---|---|---|---|
| `prisma-01-why-prisma.ts` | 1 | — (orientation, no section target) | Exists — no structural change needed |
| `prisma-02-setup-connection.ts` | 2 | S5 (Client Setup & Singleton) | Exists — audit for Strategy C compliance |
| `prisma-03-models-constraints.ts` | 3 | S1 + S2 (Schema, Constraints) | Exists — audit for Strategy C compliance |
| `prisma-04-relations.ts` | 4 | S3 (Relations & Foreign Keys) | Exists — audit for Strategy C compliance |
| `prisma-05-migrations-seeding.ts` | 5 | S4 (Migration Lifecycle) | Exists — P0 fixes applied ✅ |
| `prisma-06-client-lifecycle.ts` | 6 | S5 (Client Setup & Lifecycle) | Exists — P0 fix applied ✅ |
| `prisma-07-reading-data.ts` | 7 | S7 + S9 (Basic Reads, Field Selection) | Exists — P0 fixes applied ✅ |
| `prisma-08-filtering-pagination.ts` | 8 | S7 + S8 (Reads, Sorting & Pagination) | Exists — audit for Strategy C compliance |
| `prisma-09-create-zod.ts` | 9 | S6 (Record Creation) | Exists — audit; Zod validation is snippet-lab |
| `prisma-10-update-upsert.ts` | 10 | S10 + S11 (Updates, Idempotence) | Exists — P0 fix applied ✅ |
| `prisma-11-delete-cascades.ts` | 11 | S11 (Idempotence & Deletion) | Exists — audit for Strategy C compliance |
| `prisma-12-nested-transactions.ts` | 12 | S13 (Transactions) | Exists — audit for Strategy C compliance |
| `prisma-13-errors-middleware.ts` | 13 | S12 + S14 (Error Handling, Analytics) | Exists — audit; `groupBy` must be snippet-lab |
| `prisma-14-api-capstone.ts` | 14 | S15 (Capstone) | Exists — P0 overhaul applied ✅ |

- **Gap:** Section **S6** (Record Creation: `create`, `createMany`) is currently split across Day 9 and Day 5. No dedicated standalone module exists.
- **Gap:** Section **S14** (Advanced Analytics: `groupBy`, `aggregate`, relational filters) is partially covered in Day 13 but needs a dedicated snippet-lab task for `groupBy` + `_count`.
- **Acceptance Criteria:**
  - Every section S1–S15 maps to at least one existing module.
  - Gaps are listed and become Phase 4 authoring targets.

---

### Step P2-3: Audit Each Module for Strategy C Compliance

For each existing module, verify:

1. **No executable task uses an engine-unsupported method** (e.g. `groupBy`, nested relation `select` graded as executable).
2. **No snippet-lab task is masquerading as executable** (e.g. schema declarations in a `prismaReadTask`).
3. **`completionLearnings` are falsifiable** — each outcome has a corresponding task.
4. **No prerequisite inversion** — solution code only uses methods from the current or prior lessons.

| Module | Audit Target | Known Issues to Verify |
|---|---|---|
| `prisma-02-setup-connection.ts` | S5 — Client Setup | Check singleton pattern tasks are snippet-lab |
| `prisma-03-models-constraints.ts` | S1/S2 — Schema | Verify all schema tasks are snippet-lab; no executable schema writes |
| `prisma-04-relations.ts` | S3 — Relations | Confirm `@relation` tasks are snippet-lab; check for premature `include` |
| `prisma-08-filtering-pagination.ts` | S8 — Pagination | Verify `skip`/`take` are executable; confirm `cursor` is snippet-lab |
| `prisma-09-create-zod.ts` | S6 — Creation | Zod schema tasks must be snippet-lab; `create`/`createMany` must be executable |
| `prisma-11-delete-cascades.ts` | S11 — Deletion | Verify cascade behaviour is snippet-lab; `delete`/`deleteMany` are executable |
| `prisma-12-nested-transactions.ts` | S13 — Transactions | Confirm `$transaction` array is executable; interactive callback is executable via proxy |
| `prisma-13-errors-middleware.ts` | S12/S14 — Errors/Analytics | `P2002`/`P2025` error tasks must be executable; `groupBy` must be snippet-lab |

- **Output:** A per-module compliance report (table in the tracker).
- **Acceptance Criteria:**
  - Zero executable tasks use engine-unsupported methods.
  - Zero snippet-lab tasks could have been executable (no missed opportunity for live grading).

---

### Step P2-4: Identify & Prioritise Phase 4 Authoring Gaps

Based on P2-2 (mapping) and P2-3 (audit), produce a prioritised list of content that does **not** exist yet and must be authored in Phase 4.

**Known gaps at planning time:**

| Gap ID | Section | Missing Content | Grading Type | Priority |
|---|---|---|---|---|
| G1 | S6 | Dedicated `create` introduce task (Day 9 buries it inside Zod) | Executable | High |
| G2 | S6 | `createMany` with batch feedback task | Executable | Medium |
| G3 | S7 | `findFirst` introduce task (Day 7 skips `findFirst` entirely) | Executable | High |
| G4 | S8 | Cursor-based pagination introduce task | Snippet Lab | Medium |
| G5 | S12 | `P2025` (RecordNotFound) catch task | Executable (`expectFailure`) | High |
| G6 | S14 | `groupBy` + `_count` introduce task | Snippet Lab | Medium |
| G7 | S14 | Relational filter (`some`, `every`, `none`) introduce task | Snippet Lab | Medium |

- **Output:** Gap table committed to the tracker.
- **Acceptance Criteria:**
  - Every gap has a priority and a target section.
  - Gaps G1, G3, G5 (High priority) are scheduled as first Phase 4 authoring targets.

---

### Step P2-5: Freeze the Module Sequence

Confirm and lock the final day-to-section mapping so Phase 4 authoring has a stable target. No new modules are added or reordered after this step without a tracker entry.

| Day | Module | Primary Section | Grading Mix |
|---|---|---|---|
| 1 | `prisma-01` | Orientation | — |
| 2 | `prisma-02` | S5 | Snippet Lab |
| 3 | `prisma-03` | S1 + S2 | Snippet Lab |
| 4 | `prisma-04` | S3 | Snippet Lab |
| 5 | `prisma-05` | S4 | Snippet Lab (CLI) |
| 6 | `prisma-06` | S5 | Snippet Lab |
| 7 | `prisma-07` | S7 + S9 | Executable + Snippet |
| 8 | `prisma-08` | S8 | Executable |
| 9 | `prisma-09` | S6 | Executable + Snippet |
| 10 | `prisma-10` | S10 + S11 | Executable |
| 11 | `prisma-11` | S11 | Executable |
| 12 | `prisma-12` | S13 | Executable |
| 13 | `prisma-13` | S12 + S14 | Executable + Snippet |
| 14 | `prisma-14` | S15 | Executable + Snippet |

- **Acceptance Criteria:**
  - Sequence is signed off.
  - Tracker Phase 2 table is updated with `✅ Mapped` status for each section.
  - Phase 4 authoring targets are derived exclusively from the gap list (P2-4).

---

## 5. Phase 3 — Task Quality Rubric

Every newly written or refactored task must satisfy this 8-point rubric:

| # | Dimension | Pass Standard |
|---|---|---|
| **1** | **Skill Level** | Explicitly flagged as `introduce`, `practice`, or `assess`. |
| **2** | **Grading Channel** | Labeled as `executable` or `snippet-lab` in strict agreement with engine matrix. |
| **3** | **No Premature Demands** | All syntax in `solutionCode` is present in prior concepts or current lesson. |
| **4** | **Single-Concept Delta** | `introduce` tasks introduce exactly one new mechanism. |
| **5** | **Scaffolding Balance** | Starter code provides type context without spelling out the solution. |
| **6** | **Diagnostic Assess Tasks** | At least one task per section frames the instruction as a bug fix or feature goal without naming the API method. |
| **7** | **SQL Lens Integrity** | Tasks marked `executable` must produce valid, readable SQL in SQL Lens. |
| **8** | **Falsifiable Outcomes** | Every item in `completionLearnings` corresponds to an exercised task. |

---

## 6. Phase 4 — Curriculum Section Specifications

The curriculum is structured into task-driven sections. Final module count will be determined by task load per section (target ~45–60 mins per session).

### Section Outline & Grading Profile

| Section | Focus Areas | Primary Grading | Key Observable Competencies |
|---|---|---|---|
| **S1: Schema Foundations** | Datasource, model, scalar types, `@id`, `@default` | Snippet Lab | Can define valid Prisma models with primary keys and default values. |
| **S2: Constraints & Mappings** | `@unique`, `@@unique`, `enum`, `@map`, `@@map` | Snippet Lab | Can enforce single-field and compound uniqueness constraints. |
| **S3: Relational Modeling** | `@relation`, 1:1, 1:N, M:N, foreign key conventions | Snippet Lab | Can model relational integrity and foreign keys in schema files. |
| **S4: Migration Lifecycle** | `migrate dev`, `deploy`, `status`, reset, shadow DB | Snippet Lab (CLI) | Can distinguish dev migrations from CI/CD production deployment. |
| **S5: Client Instantiation** | PrismaClient, env configs, connection pooling, teardown | Snippet Lab | Can instantiate, configure, and cleanly disconnect Prisma Client. |
| **S6: Record Creation** | `create`, `createMany`, batching | Executable | Can insert individual and batch records safely into the database. |
| **S7: Targeted Retrieval** | `findUnique`, `findFirst`, `findMany`, `where` | Executable | Can query records using comparison operators and boolean logic. |
| **S8: Sorting & Windowing** | `orderBy`, `skip`, `take`, pagination | Executable | Can implement offset-based pagination and multi-column sorting. |
| **S9: Projection & Relations** | `select` (scalar), `include`, nested `select` | Executable + Snippet | Can prevent over-fetching via targeted field selection and relations. |
| **S10: Updates & Atomic Math** | `update`, `updateMany`, `increment`, `decrement` | Executable | Can perform concurrency-safe arithmetic updates on numeric fields. |
| **S11: Idempotency & Deletion** | `upsert`, `delete`, `deleteMany` | Executable | Can write idempotent write operations and targeted batch deletions. |
| **S12: Error Handling** | `P2002` (Unique), `P2025` (RecordNotFound) | Executable (`expectFailure`) | Can catch Prisma runtime errors and branch on error codes. |
| **S13: Safe Transactions** | Sequential array and interactive callback transactions | Executable | Can execute multi-step operations atomically with rollback safety. |
| **S14: Advanced Analytics** | `groupBy`, `aggregate`, `some`/`every`/`none` | Snippet Lab | Can write aggregation queries and relational filter criteria. |
| **S15: Capstone Synthesis** | Diagnostic scenarios, multi-model workflows | Executable | Can diagnose and solve complex, realistic backend database tasks. |

---

## 7. Phase 5 — Validation Gates

Before changes are merged or advanced, they must pass these verification gates:

- [ ] **Gate 0 (Sequence Audit):** `npm run audit:taught-before-tested` exits with 0 errors.
- [ ] **Gate 1 (Test Suite):** `npm test` passes completely without regressions.
- [ ] **Gate 2 (Grading Match):** No unsupported method is configured with executable grading.
- [ ] **Gate 3 (Outcome Truth):** 100% of statements in `completionLearnings` map to completed tasks.
- [ ] **Gate 4 (Diagnostic Presence):** Every core section contains at least one unassisted `assess` task.
- [ ] **Gate 5 (SQL Lens Parity):** All executable tasks produce valid SQL statements in SQL Lens.

---

## 8. File Change Register

| File Path | Phase | Action | Status | Purpose |
|---|---|---|---|---|
| [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md) | Docs | Created | ✅ | Authoritative consolidated review |
| [`docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md) | Docs | Created | ✅ | Step-by-step implementation plan |
| [`docs/PRISMA_CURRICULUM_TRACKER.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_TRACKER.md) | Docs | Created | ✅ | Actionable status tracker |
| [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) | P0-1b | ✅ Edited | ✅ | Replaced `upsert` with CLI seed task; replaced `createMany` with migrate reset task |
| [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) | P0-1a | ✅ Edited | ✅ | Replaced premature `findMany`/`orderBy` in `prisma06-hw-1` with `findUnique` gateway lookup |
| [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) | P0-2 | ✅ Edited | ✅ | Corrected select/include theory; added `prisma07-c2-t3` nested select snippet lab |
| [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) | P0-3 | ✅ Edited | ✅ | Added executable `prisma10-c1-t3` atomic `increment` task |
| [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) | P0-4 | ✅ Edited | ✅ | Replaced single trivial lookup with two-task diagnostic (`prisma14-hw-1` executable + `prisma14-hw-2` snippet lab) |
| `src/content/prisma/modules/prisma-*.ts` | P4 | Edit/Create | ⏹️ Not Started | Progressive rollout of task-first curriculum modules |
