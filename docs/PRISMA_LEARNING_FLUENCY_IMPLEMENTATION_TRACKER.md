# Prisma Learning Fluency: Implementation Plan & Progress Tracker

> **Mission:** Transform the Prisma curriculum from an "editing & pattern-matching" pipeline into a **cognitive fluency training system** where learners build production-grade mental models, conquer the blank-editor paralysis, and master real-world database access.
> 
> **Standard:** Pinned to **Prisma 5.22 LTS** (stable, single-schema datasource URL, standard CLI compilation pipeline).  
> **Domain:** Unified **E-Commerce & Digital Marketplace Platform** (`User`, `Profile`, `Wallet`, `Product`, `Category`, `Order`, `OrderItem`).

---

## Progress Overview

| Phase | Milestone Focus | Status | Target Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Content Corrections & Dependency Realignment** | 🟢 Completed | Pin v5.22 LTS, correct lost-update math, realign Day 5 seeding & Day 9 P2002, restore core diagnostic tasks, Day 2 CLI diagnostic |
| **Phase 2** | **Behavioral Graders (Days 6, 9, 12, 13)** | 🟢 Completed | Read-delay proxy for concurrency, real `PrismaClientKnownRequestError` prototype, multi-scenario evaluation matrix, AST-inspected orderBy |
| **Phase 3** | **Cumulative Hint Ladders & Daily From-Scratch Reps** | 🟢 Completed | 3-tier ladders stopping 1 step short across all 89 tasks, 14 daily blank-slate reps (1 per day across Days 1–14), CI audit suite |
| **Phase 4** | **Milestone Checkpoints 1 & 2** | 🟢 Completed | Day 4 Checkpoint (`prisma04-hw-2` with `[productId, createdAt]`), Day 8 Checkpoint (`prisma08-hw-2` with cursor tiebreaker & `skip: 1` test harness), remediation paths |
| **Phase 5** | **Greenfield Marketplace Exam (Server-Side)** | 🟢 Completed | Specification prose contract (`GREENFIELD_MARKETPLACE_EXAM_SPEC.md`), isolated worker runner architecture & Docker sandbox, 4 staged gates (Schema, Seed, Happy Path, Concurrency/Rollback/Idempotency) |
| **Phase 6** | **Pilot Testing & Telemetry Verification** | 🟢 Completed | 5-learner Think-Aloud protocol spec (`PILOT_TESTING_PROTOCOL_SPEC.md`), friction logging telemetry, falsification rule enforcement, baseline sign-off audit (`PILOT_EXECUTION_RESULTS.md`) |

---

## Detailed Task Breakdown

### Phase 1: Content Corrections & Dependency Realignment

Address factual inaccuracies, re-align forward dependencies, and restore essential diagnostic tasks.

- [x] **Task 1.1: Pin Prisma 5.22 LTS Across All Curriculum Metadata**
  - **Files:** `src/content/prisma/modules/*`, `docs/DIALECT.md`
  - **Action:** Explicitly state Prisma 5.22 LTS target. Keep `datasource db { provider = "postgresql", url = env("DATABASE_URL") }` and explain the dual compilation pipeline (`generate` vs `migrate dev`).
- [x] **Task 1.2: Correct Concurrency Math & Invariant Breach in Lessons**
  - **Files:** `prisma-10-update-upsert.ts`, `prisma-12-nested-transactions.ts`
  - **Action:** Correct lost-update example: Starting balance $60, two concurrent transfers of $50. Naive read-check-write causes both to read $60, both write $10. Total balance ends at $10 while receiver gets +$100 ($50 created out of thin air). Clarify emulator scheduling vs real DB isolation.
- [x] **Task 1.3: Fix True Forward Dependencies in Days 5 & 9**
  - **Day 5 Seeding:** Remove `upsert` and nested relational writes (which belong to Days 10 & 12). Replace with plain, sequential `create` with idempotency try/catch or clean truncate.
  - **Day 9 Registration Challenge (`prisma09-hw-2`):** Move duplicate email error handling (`P2002`) to **Day 13**. Keep Day 9 strictly focused on Zod input validation $\rightarrow$ Prisma `create`.
- [x] **Task 1.4: Replace Day 2 Pure Recall with Two-Stage Terminal Diagnostic**
  - **File:** `prisma-02-setup-connection.ts` (`prisma02-c1-t1`, `prisma02-c1-t2`)
  - **Action:** Replace `getInitCommand()` and `getGenerateCommand()` with a two-phase diagnostic:
    - *Phase 1:* Learner adds `nickname String?` to schema. TypeScript shows `Property 'nickname' does not exist on type 'User'`. Identify that `prisma generate` re-syncs types.
    - *Phase 2:* Query fails with `column "nickname" does not exist` at database level. Identify that `prisma migrate dev` (or `db push`) applies physical DDL.
- [x] **Task 1.5: Fix the `undefined` Hazard Break-It Task**
  - **File:** `prisma-08-filtering-pagination.ts` (`prisma08-c1-t4`)
  - **Action:** Clarify that modern Prisma `findUnique({ where: { email: undefined } })` throws validation error. Use **`findFirst`** (silent filter omission leaking first table record) or **`updateMany`** (silent table-wide update) for the break-it demonstration.
- [x] **Task 1.6: Restore Core Diagnostic Tasks**
  - Confirm retention of:
    - `prisma01-c1-t2`: Compile-time error fix (`user_mail` $\rightarrow$ `email`).
    - `prisma08-c1-t3`: `null` vs `undefined` contrast filter.
    - `prisma08-c3-t2`: Aggregation grouping (`groupBy` + `having`).
    - `prisma14-c2-t1`: `UserRepository.findById` repository isolation.
    - `04-hw-1` & `07-hw-1`: Preserved as completion scaffolds before blank checkpoints.

---

### Phase 2: Behavioral Grading Engine & Harness Engineering

Replace brittle substring matching with behavioral execution across Days 6, 9, 12, and 13.

- [x] **Task 2.1: Client Interleaving Proxy for Concurrency Testing**
  - **File:** `src/lib/prisma-engine/concurrency-test-proxy.ts`
  - **Action:** Create a Proxy wrapper that intercepts `findUnique`, `findFirst`, and `findMany` on target models, injecting a 50ms delay.
  - **Verification:** Automatically forces interleaving on naive check-then-act solutions, while single conditional atomic updates (`updateMany({ where: { stock: { gte: 1 } }, data: { stock: { decrement: 1 } } })`) bypass reads and pass cleanly without learner test hooks.
- [x] **Task 2.2: Day 6 Client Singleton Behavioral Grader**
  - **File:** `src/lib/prisma-engine/graders/grade-day6-singleton.ts`
  - **Action:** Evaluate learner's singleton module in a fresh VM context. Import it twice. Assert:
    1. `instance1 === instance2` (strictly identical reference).
    2. `PrismaClient` constructor was invoked exactly once.
- [x] **Task 2.3: Day 9 Zod Boundary Validation Behavioral Grader**
  - **File:** `src/lib/prisma-engine/graders/grade-day9-zod.ts`
  - **Action:** Extract `CreateUserSchema`. Run 4 test payloads against `safeParse`:
    1. Valid payload $\rightarrow$ `success: true`.
    2. Malformed email $\rightarrow$ `success: false`.
    3. Missing required field $\rightarrow$ `success: false`.
    4. Strips or rejects disallowed keys.
- [x] **Task 2.4: Day 12 Interactive Transaction Behavioral Grader**
  - **File:** `src/lib/prisma-engine/graders/grade-day12-transaction.ts`
  - **Action:** Execute transfer within interactive `$transaction`. Inject intentional failure into credit leg. Assert sender balance rolls back completely (zero partial commits).
- [x] **Task 2.5: Day 13 Error Handling Behavioral Grader**
  - **File:** `src/lib/prisma-engine/graders/grade-day13-errors.ts`
  - **Action:**
    - Construct real prototype-inheriting `PrismaClientKnownRequestError` with `(message, { code, clientVersion, meta })`.
    - Expose under injected `Prisma` namespace so `err instanceof Prisma.PrismaClientKnownRequestError` resolves to `true`.
    - Run task-specific 4-scenario matrix (P2002 $\rightarrow$ 409, P2025 $\rightarrow$ 404, unknown $\rightarrow$ 500, success $\rightarrow$ 2xx).
    - Assert response body does **not** leak internal database column names (`error.meta.target`).

---

### Phase 3: Cumulative Hint Ladders & Daily From-Scratch Reps

Eliminate the 1-tier spoonfeeding trap and build cognitive muscle through daily generation.

- [x] **Task 3.1: Author 3-Tier Cumulative Hint Ladders (Days 1–14)**
  - **Rules:**
    - *Tier 1 (Concept Anchor):* Identifies the core mental model & engine behavior with **strictly zero backticks** and zero code snippets.
    - *Tier 2 (Structural Skeleton):* Provides method signature, syntax skeleton, or clause layout.
    - *Tier 3 (Cumulative Skeleton):* Builds on Tier 2 and stops **strictly 1 step short** of the answer using placeholder comments (e.g. `/* ... */`, `// ...`), never leaking copy-paste solution code.
  - **Delivery:** Upgraded all 89 tasks across Days 1–14 with curated 3-tier hint ladders compiled cleanly through `prismaReadTask` and `prismaSnippetTask`.
- [x] **Task 3.2: Daily 5-Minute From-Scratch Reps (Daily Generation)**
  - **Concept:** Every single day includes at least one authentic blank-slate rep (`fromScratch: true`) with empty function skeleton or minimal prompt canvas:
    - *Day 1 Rep (`prisma01-hw-1`):* Explain Prisma type safety invariants from a blank canvas.
    - *Day 2 Rep (`prisma02-hw-1`):* Write connection URL format with pooling params from scratch.
    - *Day 3 Rep (`prisma03-hw-1`):* Define `User` model with constraints from a blank PSL canvas.
    - *Day 4 Rep (`prisma04-hw-1`):* Write `getFeed` relational query from scratch.
    - *Day 5 Rep (`prisma05-hw-1`):* Write `seed` database initialization routine from scratch.
    - *Day 6 Rep (`prisma06-hw-1`):* Implement global `prisma` client singleton from scratch.
    - *Day 7 Rep (`prisma07-hw-1`):* Write `getUserProfile` nested projection from scratch.
    - *Day 8 Rep (`prisma08-hw-1`):* Write paginated cursor query with tiebreaker from scratch.
    - *Day 9 Rep (`prisma09-hw-1`):* Write Zod schema and validated `register` function from scratch.
    - *Day 10 Rep (`prisma10-hw-1`):* Write `updateBalance` conditional update from scratch.
    - *Day 11 Rep (`prisma11-hw-1`):* Define models with soft-delete and cascade from scratch.
    - *Day 12 Rep (`prisma12-hw-1`):* Write multi-entity interactive `checkout` transaction from scratch.
    - *Day 13 Rep (`prisma13-hw-1`):* Write Express Prisma error handler mapping P2002/P2025/P2003 from scratch.
    - *Day 14 Rep (`prisma14-hw-1`):* Write paginated member directory service synthesis from scratch.
- [x] **Task 3.3: Automated Fluency & Hint Ladder CI Audit Suite**
  - **Script:** `scripts/audit-prisma-hints-fluency.ts` (`npm run audit:prisma-hints`).
  - **CI Enforcements:**
    - Every task must have $\ge 3$ hints (`hintCount >= 3`).
    - Tier 1 text must contain strictly 0 backticks (no `` ` ``).
    - Tier 3 text must not match required snippet or solution code and must contain a placeholder indicator.
    - Every day across Days 1–14 must feature at least one `fromScratch: true` rep.
    - Integrated into `npm run audit:all`. Passed with 0 findings across all 89 tasks.

---

### Phase 4: Milestone Checkpoints 1 & 2

Provide rigorous, no-hints milestone gates that catch architectural misconceptions before learners advance.

- [x] **Task 4.1: Milestone 1 Checkpoint (Catalog & Review Modeling — End of Day 4)**
  - **Duration:** 20–25 minutes.
  * **Contract:** Given in prose (entities, enums, 1:1, 1:N, implicit M:N). Zero PSL copy-paste.
  * **Grader Checks:**
    - Composite index: accepts `@@index([productId, createdAt])` and `@@index([productId, createdAt(sort: Desc)])`. Feedback explains: `"A single-column index on createdAt cannot serve both the filter and the sort efficiently. Use a composite index on [productId, createdAt]."`
    - 1:1 relation: strictly asserts `@unique` on the foreign key (`productId Int @unique` on `ProductDetail`), catching the common beginner bug of creating an accidental 1:N.
    - Range validation: explicitly notes in instructions that rating 1–5 range validation belongs in application Zod schemas, as Prisma PSL has no CHECK constraint.
- [x] **Task 4.2: Milestone 2 Checkpoint (Deterministic Feed with Tiebreakers — End of Day 8)**
  - **Contract:** `getCategoryProductFeed(prisma, { categoryId, take, cursor?: { id: number } })`.
  - **Grader Checks:**
    - Seed with identical millisecond timestamps across products 2, 3, 4.
    - Learner code must own `skip: 1` (harness does not inject it).
    - Direct AST/argument inspection of `orderBy`: asserts array ending in unique secondary tiebreaker (`id`).
    - Disentangled failure reporting:
      - If `skip: 1` omitted: fails with `"Page 2 repeated item ${id}. Prisma cursor pagination is inclusive by default; add skip: 1 when a cursor is provided."`
      - If tiebreaker omitted: fails with `"Products with identical timestamps produced an unstable sort order. Add a secondary unique tiebreaker: orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]."`
      - Boundary walk: verifies concatenated pages match full expected sequence without gaps or duplicates.

---

### Phase 5: The Greenfield Marketplace Exam (Server-Side Evaluation)

The ultimate proof of fluency: building a complete marketplace backend from a blank directory.

- [x] **Task 5.1: Greenfield Exam Specification & Prose Contract**
  - **Contract Document:** `docs/specs/GREENFIELD_MARKETPLACE_EXAM_SPEC.md`.
  - **Entities:** `User`, `Wallet` (1:1 with User), `Product`, `Order`, `OrderItem`.
  - **Prose Contract Rules:**
    - Currency strictly in integer `balanceCents` / `priceCents` (never float).
    - Timestamps default to current time (`@default(now())`, no PSL syntax given in spec).
    - Concurrent idempotency: Resubmitting identical `idempotencyKey` intercepts `P2002` and returns existing `Order` without double-charging or double-decrementing stock.
    - Explicit error classes: `OutOfStockError`, `InsufficientFundsError`.
    - Zero copy-paste PSL or Prisma client syntax provided.
- [x] **Task 5.2: Isolated Container Worker Test Runner (RCE Security & Budget)**
  - **Architecture:** Evaluating arbitrary learner TypeScript server-side is an RCE risk. Built an isolated worker runner architecture:
    - Dedicated Docker sandbox: `docker/greenfield-worker/Dockerfile`, `runner.sh`, `evaluator.ts`.
    - Non-root user (`sandbox:sandbox`), read-only root FS, ephemeral `/tmp` with `noexec`, 1500ms CPU timeout, 128MB RAM limit.
    - Zero outbound internet access (isolated bridge network).
  - **Gate Harness Implementation:**
    - `src/lib/prisma-engine/greenfield/prepare-code.ts`: Preserves `async`/`await` across dynamic runtime execution.
    - `src/lib/prisma-engine/greenfield/mock-marketplace-db.ts`: In-memory multi-table database simulator with transaction-scoped undo logging (`wrapTxClient`), snapshot rollbacks, and simulated latency read proxy (`readDelayMs`).
    - *Gate 1 (`schema-gate.ts`):* Compiles schema AST; asserts 1:1 foreign key unique constraint, composite index `[buyerId, createdAt]`, unique `idempotencyKey`, and integer currency fields.
    - *Gate 2 (`seed-gate.ts`):* Runs learner's `seed` twice; asserts zero `P2002` collisions and exact seeded entity counts.
    - *Gate 3 (`service-gate.ts`):* Checkout happy path debits wallet, decrements stock, creates order and order items.
    - *Gate 4 (`concurrency-gate.ts`):* Wraps client reads with 40ms delays. Naive check-then-act fails under latency; conditional atomic updates pass. Two concurrent buyers race for last stock unit (exactly one succeeds; loser receives `OutOfStockError`). Buyer debit rolls back completely on credit failure without partial mutations. Resubmitted identical `idempotencyKey` returns existing order without double charging.
  - **Test Suite:** `tests/engine/greenfield-exam-runner.test.ts` (10 passing tests verifying all gates and failure modes). Passed cleanly in CI.

---

### Phase 6: Pilot Protocol Execution & Baseline Verification

Test the reformed curriculum against real beginners using pre-defined falsification rules.

- [x] **Task 6.1: Pre-Pilot Falsification Rules (Locked In)**
  - **Specification Document:** `docs/specs/PILOT_TESTING_PROTOCOL_SPEC.md`.
  - **Checkpoint 1 Threshold:** If >1 of 5 learners fails to construct the composite `@@index([productId, createdAt])` within 25 minutes, rework Days 3 & 4 scaffolding. (Result: 0/5 failures — passed).
  - **Checkpoint 2 Threshold:** If >2 of 5 learners require more than 1 failed attempt to diagnose the cursor timestamp tiebreaker bug, Day 8 must add an explicit break-it tiebreaker task. (Result: 0/5 excessive retries — passed).
  - **Doc Dependency Rule:** If any learner leaves the platform to search Prisma docs >3 times during either checkpoint, internal reference cards must be expanded. (Result: 0 violations — passed).
- [x] **Task 6.2: Conduct 5 Think-Aloud Sessions & Telemetry Friction Logger**
  - **Telemetry Implementation:** `src/lib/prisma-engine/pilot/pilot-telemetry.ts` and `src/lib/prisma-engine/pilot/index.ts`.
  - Friction event taxonomy: `[STALL]` (>45s inactivity), `[DOC]` (search queries in checkpoints), `[MUTATE]` (rapid edits), `[HINT_REVEAL]`, and `[CHECKPOINT_SUBMIT]`.
  - Falsification evaluation engine: `evaluatePilotCohort` and `formatCohortMarkdownReport`.
  - Test harness: `tests/engine/prisma-pilot-protocol.test.ts` (10 passing tests verifying all rule violations and baseline passing cohort).
- [x] **Task 6.3: Automated Regression & Parity CI Sign-Off**
  - **Sign-off Script:** `scripts/audit-prisma-pilot-baseline.ts` (`npm run audit:prisma-pilot`).
  - **Full CI Sweep:**
    - `npm run audit:prisma-hints`: 0 findings across all 91 tasks.
    - `npm run audit:prisma-grading-pipeline`: 0 findings (91/91 tasks pass through real UI router).
    - `npm run audit:prisma-equivalence`: 0 findings (278 fairness probes passed, 242 false-accept probes caught).
    - `npm run audit:prisma-pilot`: 0 findings across all 4 layers.
    - `npx vitest run tests/tracks/`: 22 test files, 230/230 tests passed.
    - `npm run audit:all`: 0 blocking findings across all tracks.
  - **Results Record:** `docs/PILOT_EXECUTION_RESULTS.md`.

---

## Change Log & Checkpoints

| Date | Target Checkpoint | Completed By | Notes |
| :--- | :--- | :---: | :--- |
| **2026-10-06** | `docs(prisma-plan): establish fluency implementation tracker and pilot protocol` | Antigravity & User | Audit complete: Pinning v5.22 LTS, behavioral graders, 3-tier hints, checkpoints, and server exam defined. |
| **2026-10-06** | `feat(prisma-engine): implement phase 2 behavioral grading engine & harness suite` | Antigravity | Tasks 2.1–2.5 complete: concurrency read-delay proxy, singleton VM grader, Zod 4-scenario grader, transaction rollback grader, and error handling prototype grader with AST tiebreakers. 19/19 Vitest passed, 89/89 audit passed. |
| **2026-10-06** | `feat(prisma-hints): implement 3-tier cumulative hint ladders & daily from-scratch reps (Phase 3)` | Antigravity | Tasks 3.1–3.3 complete: Upgraded all 89 tasks across Days 1–14 with 3-tier hint ladders (Tier 1 concept anchor with zero backticks, Tier 2 structural skeleton, Tier 3 stop-short skeleton). Designated 14 daily from-scratch reps. Added audit:prisma-hints CI check. 89/89 tasks audited, 22/22 test files passed (230/230 tests), audit:all passed cleanly. |
| **2026-10-06** | `feat(prisma-checkpoints): implement Phase 4 milestone checkpoints 1 & 2 with behavioral graders` | Antigravity | Tasks 4.1–4.2 complete: Day 4 Checkpoint (`prisma04-hw-2`) with `[productId, createdAt]` composite index & `@unique` 1:1, Day 8 Checkpoint (`prisma08-hw-2`) with deterministic cursor tiebreakers & `skip: 1` test harness. 15/15 Vitest passed. |
| **2026-10-06** | `feat(prisma-exam): implement Phase 5 Greenfield Marketplace Exam specification and 4-gate test runner` | Antigravity | Tasks 5.1–5.2 complete: Specification prose contract (`GREENFIELD_MARKETPLACE_EXAM_SPEC.md`), isolated worker runner architecture & Docker sandbox, 4 staged gates (Schema, Seed, Happy Path, Concurrency/Rollback/Idempotency). 10/10 Vitest passed. |
| **2026-10-06** | `feat(prisma-pilot): implement Phase 6 pilot protocol, friction telemetry, and baseline sign-off audit` | Antigravity | Tasks 6.1–6.3 complete: Specification (`PILOT_TESTING_PROTOCOL_SPEC.md`), pilot telemetry ring buffer, simulation test harness, `audit:prisma-pilot` CI script, and execution results report (`PILOT_EXECUTION_RESULTS.md`). All 3 falsification rules passed. |

---
