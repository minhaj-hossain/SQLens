# Prisma Curriculum Redesign — Implementation Tracker

> **Document Status:** Active Execution Tracker  
> **Version:** 3.0 (Synthesized Architecture Baseline)  
> **Implementation Plan:** [`docs/PRISMA_CURRICULUM_IMPLEMENTATION_PLAN.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_IMPLEMENTATION_PLAN.md)  
> **Review Reference:** [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md)  
> **Overall Progress:** **`7 / 14 Complete (50%)`**

---

## 1. Executive Summary Table

| Check | ID | Priority | Topic & Focus | Target File | Grading Type | Status |
|:---:|---|:---:|---|---|:---:|:---:|
| [x] | **P1-A** | P1 | Singleton Pattern Diagnostic Challenge | [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) | Snippet-Lab | ✅ Completed |
| [x] | **P1-B** | P1 | `select-vs-include` Mental Model Correction | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) | Theory Update | ✅ Completed |
| [x] | **P1-C** | P1 | Datasource Config Challenge Redesign | [`src/content/prisma/modules/prisma-02-setup-connection.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-02-setup-connection.ts) | Snippet-Lab | ✅ Completed |
| [x] | **P1-D** | P1 | Client Extensions (`$extends`) Transition Bridge | [`src/content/prisma/modules/prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts) | Theory Update | ✅ Completed |
| [x] | **P2-A** | P2 | Capstone Redesign (Member Management API) | [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) | Executable + Lab | ✅ Completed |
| [x] | **P2-B** | P2 | Transaction Rollback Invariant Demonstration | [`src/content/prisma/modules/prisma-12-nested-transactions.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-12-nested-transactions.ts) | Snippet-Lab | ✅ Completed |
| [x] | **P2-C** | P2 | Diagnostic Repair Tasks (Days 10 & 13) | [`prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) & [`prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts) | Snippet-Lab | ✅ Completed |
| [ ] | **P3-A** | P3 | Add `findUniqueOrThrow` Executable Task | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) | Executable | Pending |
| [ ] | **P3-B** | P3 | Add Schema `@unique` Selector Bridge | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) | Theory Update | Pending |
| [ ] | **P3-C** | P3 | Restructure Day 8 Filter Hierarchy | [`src/content/prisma/modules/prisma-08-filtering-pagination.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-08-filtering-pagination.ts) | Structure Update | Pending |
| [ ] | **P3-D** | P3 | Add Zod `safeParse` Non-Throwing Task | [`src/content/prisma/modules/prisma-09-create-zod.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-09-create-zod.ts) | Snippet-Lab | Pending |
| [ ] | **P3-E** | P3 | Add Relational Mutation (`connect`) Task | [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) | Snippet-Lab | Pending |
| [ ] | **P3-F** | P3 | Add `PrismaClientValidationError` Handler | [`src/content/prisma/modules/prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts) | Snippet-Lab | Pending |
| [ ] | **P3-G** | P3 | Add Forward Compilation Pipeline Diagram | [`src/content/prisma/modules/prisma-02-setup-connection.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-02-setup-connection.ts) | Theory Update | Pending |

---

## 2. Priority 1 — Defect Remediation Details

### [x] P1-A: Day 6 Client Lifecycle Challenge Overhaul
- **Target File:** [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) (L121–151)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Replace trivial `findUnique` query in `prisma06-hw-1` with diagnostic singleton pattern checking `globalThis.prisma` and `process.env.NODE_ENV !== 'production'`.
- **Done Definition:**
  - `prisma06-hw-1` converted from `prismaReadTask` to `prismaSnippetTask`.
  - Requires `globalThis`, `new PrismaClient()`, and `NODE_ENV`.
  - No references to unintroduced methods (`findMany`, `orderBy`).
  - Unit tests for Day 6 pass cleanly.

### [x] P1-B: Day 7 `select-vs-include` Mental Model Correction
- **Target File:** [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (L76–89)
- **Grading Type:** Theory Update
- **Action Required:** Rewrite theory of concept `select-vs-include` to explain `select` (projection defining exact shape) vs `include` (attaching relations to default shape). Eliminate incorrect "never both at once" wording.
- **Done Definition:**
  - `theory` and `shortDescription` explain why combining them at the root level is ambiguous and how nested `select` solves relation field projection.
  - No blanket negative prohibitions without architectural justification.

### [x] P1-C: Day 2 Connection Challenge Redundancy Elimination
- **Target File:** [`src/content/prisma/modules/prisma-02-setup-connection.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-02-setup-connection.ts) (L183–210)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Replace redundant `findUnique` query in `prisma02-hw-1` with a schema configuration challenge verifying `datasource db`, `provider = "postgresql"`, `env("DATABASE_URL")`, and `@@map("tbl_users")`.
- **Done Definition:**
  - `prisma02-hw-1` converted to `prismaSnippetTask`.
  - Tests datasource wiring and `@map`/`@@map` schema concepts.
  - Zero query duplication with Day 1 (`prisma01-hw-1`) and Day 7.

### [x] P1-D: Day 13 Client Extensions Architecture Boundary
- **Target File:** [`src/content/prisma/modules/prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts) (L129–145)
- **Grading Type:** Theory Update
- **Action Required:** Add explicit architectural boundary header and narrative bridge connecting Express route error handling (Concepts 1 & 2) to engine client extensions (Concept 3, `$extends`).
- **Done Definition:**
  - Theory and description make explicit that `$extends` is an engine-level extension point serving as the type-safe successor to `$use`.
  - Positioned clearly as the bridge into the Day 14 application architecture capstone.

---

## 3. Priority 2 — Assessment Strengthening Details

### [x] P2-A: Day 14 Capstone Overhaul (Member Management API)
- **Target File:** [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) (L200–295)
- **Grading Type:** Hybrid (`executable` + `snippet-lab`)
- **Action Required:** Rebuild challenges into a 3-part Member Management API using business-requirement phrasing:
  1. `prisma14-hw-1` (Executable): Safe paginated roster (`findMany`, `select` omitting `name`, `orderBy: { id: 'asc' }`, `take: 2`).
  2. `prisma14-hw-2` (Snippet-Lab): Atomic user + onboarding post creation via `$transaction`.
  3. `prisma14-hw-3` (Snippet-Lab): Conflict-trapping route handler (Zod `safeParse` + P2002 → 409 Conflict mapping).
- **Done Definition:**
  - All prompt descriptions describe business problems, not API names.
  - Tasks test multi-day synthesis across schema, CRUD, transactions, and error handling.
  - All Day 14 test suites pass.

### [x] P2-B: Day 12 Transaction Rollback Invariant Demonstration
- **Target File:** [`src/content/prisma/modules/prisma-12-nested-transactions.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-12-nested-transactions.ts)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Add task `prisma12-c2-t3` under `interactive-tx` demonstrating that if step 2 throws in an interactive transaction, step 1's mutation is aborted and rolled back.
- **Done Definition:**
  - Task shows observable before/after state diagram.
  - Learner writes error handling and confirms atomicity invariant.

### [x] P2-C: Diagnostic Repair Tasks in Days 10 & 13
- **Target Files:** [`prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) & [`prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:**
  - Day 10 (`prisma10-hw-2`): Broken `upsert` using non-unique field in `where`. Learner diagnoses and fixes to unique field.
  - Day 13 (`prisma13-hw-2`): Broken error handler omitting `instanceof` check. Learner fixes to properly guard error codes and forward unmatched errors.
- **Done Definition:**
  - Both tasks present broken starter code without giving away the fix in the prompt.
  - Acceptance tests check token and structural repairs.

---

## 4. Priority 3 — Targeted Concept Additions Details

### [ ] P3-A: `findUniqueOrThrow` in Day 7
- **Target File:** [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts)
- **Grading Type:** `executable` (`prismaReadTask`)
- **Action Required:** Add `prisma07-c1-t3` testing `prisma.user.findUniqueOrThrow`.
- **Done Definition:**
  - Executable against live SQLite engine.
  - Passes SQL Lens validation and test suite.

### [ ] P3-B: Schema Uniqueness to Query Selector Bridge in Day 7 Theory
- **Target File:** [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts)
- **Grading Type:** Theory Update
- **Action Required:** Add narrative paragraph bridging Day 3 `@unique`/`@id` schema constraints to compile-time `where` selector limits in `findUnique`.
- **Done Definition:**
  - Theory text updated with explicit explanation of TypeScript compile-time enforcement.

### [ ] P3-C: Day 8 Filter Hierarchy Restructuring
- **Target File:** [`src/content/prisma/modules/prisma-08-filtering-pagination.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-08-filtering-pagination.ts)
- **Grading Type:** Structure + Snippet-Lab Task
- **Action Required:** Restructure concepts into `scalar-filters` (executable) and `relational-filters` (snippet-lab: `some`, `every`, `none`). Add ASCII query modifier hierarchy diagram.
- **Done Definition:**
  - Hierarchy diagram present in concept theory.
  - Clear separation between executable scalar filters and snippet-lab relational filters.

### [ ] P3-D: Zod `.safeParse()` Task in Day 9
- **Target File:** [`src/content/prisma/modules/prisma-09-create-zod.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-09-create-zod.ts)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Add task `prisma09-c2-t3` requiring validation via `UserCreateInput.safeParse()` and handling `!result.success`.
- **Done Definition:**
  - Task tests non-throwing validation branching.
  - Verified by snippet token checker.

### [ ] P3-E: Relation Mutation (`connect`/`disconnect`) in Day 10
- **Target File:** [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Add task `prisma10-c1-t4` requiring updating post author via `author: { connect: { id } }`.
- **Done Definition:**
  - Tests nested relational mutation syntax without manual foreign key editing.

### [ ] P3-F: `PrismaClientValidationError` in Day 13
- **Target File:** [`src/content/prisma/modules/prisma-13-errors-middleware.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-13-errors-middleware.ts)
- **Grading Type:** `snippet-lab` (`prismaSnippetTask`)
- **Action Required:** Add task `prisma13-c1-t3` handling `Prisma.PrismaClientValidationError` returning status 400.
- **Done Definition:**
  - Demonstrates catching client validation errors before database error code checks.

### [ ] P3-G: Compilation & Migration Pipeline Diagram in Day 2
- **Target File:** [`src/content/prisma/modules/prisma-02-setup-connection.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-02-setup-connection.ts)
- **Grading Type:** Theory Update
- **Action Required:** Add ASCII diagram showing `prisma generate` → application code vs `prisma migrate dev` → database schema.
- **Done Definition:**
  - Clear ASCII diagram added to concept `datasource-mapping` theory.

---

## 5. Explicitly Out-of-Scope Confirmation

All implementation work must respect these exclusions:
- [x] `$executeRaw` excluded (redundant with `$queryRaw`).
- [x] `migrate diff` and shadow DBs excluded (DBA tooling).
- [x] `distinct` excluded (marginal pedagogical value).
- [x] `aggregate` beyond `groupBy` excluded (analytics track).
- [x] `$transaction` timeout/maxWait excluded (operational tuning).
- [x] `prisma db pull` excluded (reverse introspection pipeline).
- [x] Unlisted error codes excluded (only P2002, P2025, P2003, `PrismaClientValidationError`).
- [x] Non-executable schema attributes (`@updatedAt`, `@default(cuid())`) excluded from executable tasks.
