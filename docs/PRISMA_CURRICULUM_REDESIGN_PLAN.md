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

- **Target File:** [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) (Lines 214–241)
- **Current Defect:**
  Task `prisma14-hw-1` ("Published record read") is a basic single-record `findUnique` on email with `select: { id: true, email: true }`. This is structurally identical to the Day 1 intro query and fails to test cumulative mastery.
- **Pedagogical Goal for Day 14:**
  The capstone challenge must synthesize multi-concept backend skills: unique lookup, relational loading (`include`), and strict projection rules to simulate a secure, production-grade endpoint.
- **Detailed Step Breakdown:**
  1. **Redesign Task `prisma14-hw-1` ("Production API Endpoint: Author Feed Synthesis"):**
     - **Scenario:** The client needs a user's verified public profile along with all their associated posts, ensuring sensitive user columns (`name`, internal metadata) are never exposed.
     - **Instructions:**
       - Query user by unique `email` using `prisma.user.findUnique`
       - Include the related `posts` records
       - Ensure `name` is never returned in the user projection
     - **Scaffold SQL:**
       ```sql
       -- Capstone: user profile with related posts
       SELECT id, email FROM users WHERE id = 99;
       ```
     - **Solution SQL:**
       ```sql
       SELECT id, email FROM users WHERE email = 'alex@prisma.io';
       ```
     - **Starter Code (`code0`):**
       ```typescript
       export async function getAuthorFeed(email: string) {
         return await prisma.user.findUnique({
           where: { email },
         });
       }
       ```
     - **Solution Code (`code1`):**
       ```typescript
       export async function getAuthorFeed(email: string) {
         return await prisma.user.findUnique({
           where: { email },
           include: { posts: true },
         });
       }
       ```
     - **Constraints:**
       - `includes: ['posts']`
       - `cols: ['id', 'email']`
       - `rows: 1`
       - `rtype: 'User & { posts: Post[] } | null'`
       - `why: 'The capstone delivers a complete relational payload: unique user lookup plus child posts.'`
  2. **Acceptance Criteria:**
     - Capstone exercises relational queries with strict schema contracts.
     - Eliminates the Day 1 duplicate query.
     - Test suite passes.

---

## 3. Phase 1 — Capability Grounding (Complete)

The engine audit has mapped all Prisma features to their grading viability:

- **100% Executable:** `findUnique`, `findFirst`, `findMany` (with `where`, `orderBy`, `skip`, `take`, scalar `select`, `include`), `create`, `createMany`, `update`, `updateMany`, `upsert`, `delete`, `deleteMany`, `$transaction` (array and interactive), and atomic arithmetic (`increment`, `decrement`, `multiply`, `divide`).
- **Snippet-Lab Mandatory:** Schema declarations (`datasource`, `model`, `@id`, `@relation`, `@unique`, `@@unique`, `enum`, `@map`), Migration CLI (`migrate dev`, `deploy`, `status`), Prisma Client init/teardown, `groupBy`, `aggregate`, `count`, relational filters (`some`/`every`/`none`), `cursor` pagination, and nested `select` on relations.

---

## 4. Phase 2 — Concept Dependency Map

```
[Schema Definition & Directives] (Snippet Lab)
               │
               ▼
[Migrations & CLI Workflows] (Snippet Lab)
               │
               ▼
[Prisma Client Instantiation & Lifecycle] (Snippet Lab)
               │
       ┌───────┴───────┐
       ▼               ▼
[Single Record CRUD] [Scalar Reads]
(create, findUnique, findFirst) (findMany, where)
       │               │
       └───────┬───────┘
               ▼
[Query Shaping & Pagination] (orderBy, skip, take, select)
               │
               ▼
[Relational Reads & Join Emulation] (include, nested select)
               │
               ▼
[Mutations & Atomic Arithmetic] (update, updateMany, increment/decrement)
               │
               ▼
[Idempotence & Bulk Deletion] (upsert, delete, deleteMany)
               │
               ▼
[Error Handling & Diagnostics] (P2002, P2025 via try/catch)
               │
               ▼
[Atomic Transactions] ($transaction sequential & interactive)
               │
               ▼
[Advanced Analytical Syntax & Relational Filters] (groupBy, some/every) (Snippet Lab)
               │
               ▼
[Comprehensive Capstone Synthesis]
```

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

| File Path | Phase | Action | Purpose |
|---|---|---|---|
| [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md) | Docs | Created | Authoritative consolidated review |
| [`docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md) | Docs | Created | Step-by-step implementation plan |
| [`docs/PRISMA_CURRICULUM_TRACKER.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_TRACKER.md) | Docs | Created | Actionable status tracker |
| [`src/content/prisma/modules/prisma-05-client-setup.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-client-setup.ts) | P0-1 | Edit | Remove premature upsert and createMany |
| [`src/content/prisma/modules/prisma-06-relations.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-relations.ts) | P0-1 | Edit | Replace premature findMany/orderBy in hw-1 |
| [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) | P0-2 | Edit | Fix select/include theory & add nested select |
| [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) | P0-3 | Edit | Add executable increment teaching task |
| [`src/content/prisma/modules/prisma-14-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-capstone.ts) | P0-4 | Edit | Overhaul capstone challenge |
| `src/content/prisma/modules/prisma-*.ts` | P4 | Edit/Create | Progressive rollout of task-first curriculum modules |
