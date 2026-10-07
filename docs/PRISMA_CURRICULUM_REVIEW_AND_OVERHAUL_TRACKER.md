# Prisma Curriculum Review & Overhaul Tracker

> Living tracker for the comprehensive Prisma curriculum audit, technical error remediation, deduplication, and production-readiness enhancements across all 14 Prisma modules (88 tasks).

---

## Progress Overview

| Phase | Milestone / Focus | Status | Target Checkpoint |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Technical Inaccuracies & Bug Fixes** | 🟢 Complete | `fix(prisma-content): correct package import, include-select contract, redundant index, and pk increment` |
| **Phase 2** | **Deduplication & High-Value Lesson Replacement** | 🟢 Complete | `refactor(prisma-tasks): replace redundant tasks with nested select, connection pooling, and nested validation` |
| **Phase 3** | **Critical Conceptual Gaps & Production Mastery** | 🟢 Complete | `feat(prisma-curriculum): add undefined-null hazard, cursor skip offset, and payload typing` |
| **Phase 4** | **Milestone Alignment & Theory Polish** | 🟢 Complete | `docs(prisma-roadmap): align milestone scopes and enhance theory mental models` |
| **Phase 5** | **Automated Verification & CI Sign-Off** | 🟢 Complete | `chore: verify prisma curriculum audit and grading pipeline parity (977/977 vitest tests, 89/89 audit)` |

---

## Detailed Task Breakdown

### Phase 1: Technical Inaccuracies & Bug Fixes
Address factual errors, invalid imports, schema anti-patterns, and misleading claims identified in the curriculum audit.

- [x] **Task 1.1: Fix Invalid Package Import in Day 6 Client Lifecycle**
  - **File:** `src/content/prisma/modules/prisma-06-client-lifecycle.ts` (`prisma06-hw-1`)
  - **Issue:** Uses non-existent `@prisma/prisma-client` in starter and solution.
  - **Action:** Replace `import { PrismaClient } from '@prisma/prisma-client';` with `import { PrismaClient } from '@prisma/client';`.
- [x] **Task 1.2: Correct `include` vs `select` Field Exclusion in Day 7 Challenge**
  - **File:** `src/content/prisma/modules/prisma-07-reading-data.ts` (`prisma07-hw-1`)
  - **Issue:** Prompt claims `include: { posts: true }` "never leaks name", but Prisma's `include` always returns all scalar fields of the model.
  - **Action:** Rewrite the prompt and solution to explicitly teach nested `select` (`select: { id: true, email: true, posts: { select: { title: true } } }`) so personal details like `name` are truly omitted.
- [x] **Task 1.3: Eliminate Redundant `@@index([email])` on Unique Field in Day 3**
  - **File:** `src/content/prisma/modules/prisma-03-models-constraints.ts` (`prisma03-hw-1`)
  - **Issue:** Declaring `@@index([email])` on top of `email String @unique` creates a duplicate index and triggers Prisma schema generator warnings.
  - **Action:** Change the indexed field to a realistic non-unique field (e.g., `createdAt DateTime @default(now())` with `@@index([createdAt])` or `@@index([name])`).
- [x] **Task 1.4: Fix Primary Key Atomic Increment Anti-Pattern in Day 10**
  - **File:** `src/content/prisma/modules/prisma-10-update-upsert.ts` (`prisma10-c1-t3`)
  - **Issue:** Running `{ increment: 1 }` on surrogate primary key `id` violates relational database sequence and invariant norms.
  - **Action:** Target an attribute representing an authentic counter (e.g. `loginCount: { increment: 1 }` or `version: { increment: 1 }`) instead of altering the primary key sequence.

---

### Phase 2: Deduplication & High-Value Lesson Replacement
Replace copy-paste exercises with meaningful exercises that introduce new skills.

- [x] **Task 2.1: Diversify Day 7 Challenge (Deduplicate from Day 4)**
  - **Files:** `src/content/prisma/modules/prisma-04-relations.ts` (`prisma04-hw-1`) vs `src/content/prisma/modules/prisma-07-reading-data.ts` (`prisma07-hw-1`)
  - **Issue:** Both challenges previously executed the identical `findUnique({ where: { email }, include: { posts: true } })`.
  - **Action:** Transformed `prisma07-hw-1` into **Nested Relational Projection**: load user `id` and `email` while nesting a selective projection on `posts` (`select: { title: true }`).
- [x] **Task 2.2: Refactor Day 6 Challenge to Connection Pooling Configuration**
  - **File:** `src/content/prisma/modules/prisma-06-client-lifecycle.ts` (`prisma06-hw-1`)
  - **Issue:** Tasks `prisma06-c1-t1`, `prisma06-c1-t2`, and `prisma06-hw-1` all tested the identical 3-line `globalThis` singleton.
  - **Action:** Repurposed `prisma06-hw-1` into **Datasource Pool Configuration**: configured connection string parameters (`connection_limit=5&pool_timeout=10`) and logging in `datasources.db.url`.
- [x] **Task 2.3: Upgrade Day 9 Challenge to Nested Schema Validation**
  - **File:** `src/content/prisma/modules/prisma-09-create-zod.ts` (`prisma09-hw-1`)
  - **Issue:** `prisma09-c2-t2` and `prisma09-hw-1` both performed simple `CreateUserSchema.safeParse(req.body)` without conceptual escalation.
  - **Action:** Upgraded `prisma09-hw-1` to validate an incoming payload containing nested data (`RegisterPayloadSchema` with initial post) before dispatching to Prisma via nested write.
- [x] **Task 2.4: Deduplicate Day 13 In-Route Error Trapping**
  - **File:** `src/content/prisma/modules/prisma-13-errors-middleware.ts` (`prisma13-c1-t2`, `prisma13-c2-t1`, `prisma13-hw-1`, `prisma13-hw-2`)
  - **Issue:** Repeated redundant tests on P2025/P2002.
  - **Action:** Differentiated `prisma13-c2-t1` to target record delete trapping; retargeted `prisma13-hw-1` to map **P2002, P2025, and P2003**; upgraded `prisma13-hw-2` to multi-error type discrimination (`KnownRequestError` vs `ValidationError` vs generic error).
- [x] **Task 2.5: Replace Redundant Pagination Tasks in Day 14 Capstone**
  - **File:** `src/content/prisma/modules/prisma-14-api-capstone.ts` (`prisma14-c2-t1` and `prisma14-hw-1`)
  - **Issue:** Exact duplicate of Day 8's final challenge and `prisma14-c2-t1` (`findMany` with `orderBy` + `take: 2` + `select: { id, email }`).
  - **Action:** Converted the Capstone challenge `prisma14-hw-1` into an authentic **Multi-Table Service Synthesis**: combining soft-delete filtering (`deletedAt: null`), deterministic ordering (`id: asc`), pagination (`take: 2`), selective relation projection (`posts: { select: { title: true } }`), and column privacy.

---

### Phase 3: Critical Conceptual Gaps & Production Mastery
Fill high-impact knowledge gaps essential for shipping Prisma in production.

- [x] **Task 3.1: The `undefined` vs `null` Filter Hazard**
  - **File:** `src/content/prisma/modules/prisma-08-filtering-pagination.ts` (Theory + Diagnostic Task `prisma08-c1-t4`)
  - **Concept:** Passing `undefined` to a Prisma filter causes Prisma to ignore the condition completely (risking accidental full-table reads or updates), whereas `null` filters for `IS NULL`.
  - **Action:** Added `prisma08-c1-t4` diagnostic repair task teaching defensive parameter guarding, plus explicit hazard explanation in Concept 1 theory.
- [x] **Task 3.2: Accurate Forward Cursor Pagination with `skip: 1`**
  - **File:** `src/content/prisma/modules/prisma-08-filtering-pagination.ts` (`prisma08-c2-t2`)
  - **Concept:** Without `skip: 1`, cursor pagination includes the cursor item itself, causing an immediate duplicate record bug on page turns.
  - **Action:** Updated Concept 2 theory and validation rule in `prisma08-c2-t2` to require `cursor: { id }` + `skip: 1` + `take: 2`.
- [x] **Task 3.3: TypeScript Payload Typing with `Prisma.UserGetPayload`**
  - **File:** `src/content/prisma/modules/prisma-07-reading-data.ts` (Theory block)
  - **Concept:** Generated base types (e.g. `User`) do not include relation fields. Writing type-safe helpers requires `Prisma.UserGetPayload<{ include: { posts: true } }>`.
  - **Action:** Added payload typing mental model and code snippet in Day 7 Concept 2 theory.
- [x] **Task 3.4: Serverless Connection Pooling & Driver Adapters**
  - **File:** `src/content/prisma/modules/prisma-06-client-lifecycle.ts` (Theory block)
  - **Concept:** Serverless runtimes (Next.js, Vercel, AWS Lambda) exhaust connection limits without PgBouncer, Prisma Accelerate, or Driver Adapters.
  - **Action:** Expanded Day 6 Concept 1 theory with PgBouncer (`?pgbouncer=true&connection_limit=1`) and Driver Adapter architecture.
- [x] **Task 3.5: Computed Fields via `$extends` Result Extensions**
  - **File:** `src/content/prisma/modules/prisma-13-errors-middleware.ts` (`prisma13-c3-t2`)
  - **Concept:** Result extensions (`result: { user: { fullName: { needs: { ... }, compute(user) { ... } } } }`) are the standard pattern for derived domain properties.
  - **Action:** Retargeted `prisma13-c3-t2` to implement computed fields via `$extends` result extensions (`displayName`), and added step 5 to Concept 3 rich theory.

---

### Phase 4: Milestone Alignment & Theory Polish
Ensure roadmap metadata, milestone descriptions, and theory visual steps are accurate.

- [x] **Task 4.1: Align Milestone Scopes in Roadmap**
  - **File:** `src/content/prisma/prisma-roadmap.ts`
  - **Issue:** Milestone 2 was labeled *"Querying: Filter, Relate & Paginate"* but contains Day 5 (Migrations) and Day 6 (Lifecycle), while Milestone 4 claimed Migrations which actually live in Day 5.
  - **Action:** Aligned Milestone 2 (`Migrations, Client Lifecycle & Core Querying`), Milestone 3 (`Mutations, Validation & Safe Deletes`), and Milestone 4 (`Transactions, Extensions & API Architecture`) subtitles and descriptions to accurately reflect contained modules.
- [x] **Task 4.2: Audit Step Breakdowns & Visual Lens Metadata**
  - **Files:** `src/content/prisma/modules/prisma-01` to `prisma-14`
  - **Action:** Verified all modules have valid, sequential step breakdowns with 0 placeholder steps and strict visual data typing. Elevated **Day 6 Concept 1** (The Global PrismaClient Singleton & Serverless Pooling) and **Day 7 Concept 2** (Select vs Include Projections & TypeScript Payload Typing) to `richPrismaTheory` with 3-step interactive visual progressions.

---

### Phase 5: Automated Verification & CI Sign-Off
Guarantee 100% test coverage and validation pipeline integrity.

- [x] **Task 5.1: Curriculum Content Suite Verification**
  ```powershell
  npx vitest run tests/tracks/prisma-curriculum-content.test.ts
  ```
  - **Result:** Passed (21/21 tests passed across all 14 modules, milestones, and rich theory step validations).
- [x] **Task 5.2: Prisma Grading Pipeline Audit (All 89 Tasks)**
  ```powershell
  npm run audit:prisma-grading-pipeline
  ```
  - **Result:** Passed with 0 findings (89/89 tasks graded: 40 lens-backed executable, 49 read-through static).
- [x] **Task 5.3: Prisma Equivalence & Anti-Cheat Audit**
  ```powershell
  npm run audit:prisma-equivalence
  ```
  - **Result:** Passed with 0 findings (277 fairness probes passed, 236 false-accept mutation probes caught).
- [x] **Task 5.4: Full Test Suite Check**
  ```powershell
  npx vitest run
  ```
  - **Result:** Passed (90 test files, 977/977 tests passed).

---

## Change Log & Checkpoints

| Date | Checkpoint | Completed By | Notes |
| :--- | :--- | :--- | :--- |
| **2026-10-05** | `fix(prisma-content): correct package import, include-select contract, redundant index, and pk increment` | Antigravity | Phase 1 Complete: 4 tasks resolved, 100% audit & vitest passed |
| **2026-10-05** | `refactor(prisma-tasks): replace redundant tasks with nested select, connection pooling, and nested validation` | Antigravity | Phase 2 Complete: 5 tasks upgraded/deduplicated across Days 6, 7, 9, 13, 14. 100% audit & vitest passed |
| **2026-10-05** | `feat(prisma-curriculum): add undefined-null hazard, cursor skip offset, payload typing, driver adapters, and computed fields` | Antigravity | Phase 3 Complete: 5 production concepts added across Days 6, 7, 8, 13. 100% audit & vitest passed |
| **2026-10-05** | `docs(prisma-roadmap): align milestone scopes and enhance theory mental models` | Antigravity | Phase 4 Complete: Milestones 2, 3, 4 aligned; Day 6 & Day 7 elevated to richPrismaTheory |
| **2026-10-05** | `chore(prisma-ci): verify 100% grading pipeline parity and test coverage across full workspace` | Antigravity | Phase 5 Sign-Off Complete: 89/89 tasks audit passed (0 findings), 90 test files (977/977 tests) passed |
| **2026-10-07** | `feat(prisma-milestone-4): overhaul Phase 3 & 4 (Days 5-8) Schema Constraints, Relations (1:N, 1:1, M:N), and Referential Actions` | Antigravity | Milestone 4 Complete: Days 5-8 authored (28 tasks total: Day 5 schema mode, Day 6 1:N & 1:1, Day 7 cascades, Day 8 M:N). 103/103 tasks pass pipeline & equivalence audit with 0 findings; 94 test files (1,030/1,030 tests) and Next.js production build pass cleanly. |
| **2026-10-07** | `feat(prisma-curriculum): complete Milestone 5 mutations, workflow, transactions & production capstone (Days 9-14)` | Antigravity | Milestone 5 & 6 Complete: Days 9-14 authored and verified (42 tasks across Day 9 create writes, Day 10 updates & deletes, Day 11 init & generate CLI, Day 12 migrations & seeding, Day 13 transactions, Day 14 error codes, client extensions & capstone). 105/105 tasks pass pipeline & equivalence audits with 0 findings; 94 test files (1,030/1,030 tests) and Next.js production build pass cleanly. |

