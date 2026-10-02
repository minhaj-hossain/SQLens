# Prisma Curriculum Redesign — Action Tracker

> **Document Status:** Active Tracker  
> **Related Documents:**  
> - Consolidated Review: [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md)  
> - Implementation Plan: [`docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md)  
> - Engine Matrix: [`C:\Users\mjp20\.gemini\antigravity-ide\brain\9a2bcf62-8692-4161-85a9-e7c6b9bf59e2\ENGINE_CAPABILITY_MATRIX.md`](file:///C:/Users/mjp20/.gemini/antigravity-ide/brain/9a2bcf62-8692-4161-85a9-e7c6b9bf59e2/ENGINE_CAPABILITY_MATRIX.md)

---

## Overall Progress Summary

| Phase | Description | Status | Blockers / Notes |
|---|---|---|---|
| **Phase 0** | Immediate Defect Remediation | ⏳ Pending | Ready for implementation; independent of redesign |
| **Phase 1** | Engine Capability Grounding | ✅ Completed | 1,254 lines of generator + validator analyzed |
| **Phase 2** | Architecture & Dependency Mapping | ⏳ Pending Review | Strategy C recommended; awaiting user sign-off |
| **Phase 3** | Task Quality Rubric Finalization | ⏳ Pending Review | Rubric drafted in Plan |
| **Phase 4** | Curriculum Content Authoring | ⏹️ Blocked by P0–P3 | Dependent on task-first section specifications |
| **Phase 5** | Validation Gates & Release | ⏹️ Not Started | Verification via audit scripts and test suite |

---

## Phase 0: Immediate Defect Remediation (Granular Action Items)

| Step ID | Focus Item | Target File & Line Range | Action Plan & Verification | Status |
|---|---|---|---|---|
| **P0-1a** | Fix Day 6 Inversions (`prisma06-hw-1`) | [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) (L121–151) | Replace `findMany` + `orderBy` with single gateway lookup (`findUnique` on `alex@prisma.io`, `select: { id, email }`). Test passes. | ✅ Completed |
| **P0-1b.1** | Fix Day 5 `upsert` Inversion (`prisma05-c2-t1`) | [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) (L87–104) | Replace `prisma.user.upsert` with CLI seed trigger: `npx prisma db seed`. Ban `node `. | ✅ Completed |
| **P0-1b.2** | Fix Day 5 `createMany` Inversion (`prisma05-hw-1`) | [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) (L132–151) | Replace `prisma.user.createMany` challenge with deterministic dev reset: `npx prisma migrate reset --force`. | ✅ Completed |
| **P0-2.1** | Correct `select`/`include` Theory | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (L81–88) | Replace "never both at once" with accurate explanation of root collision vs nested `select` relation projection. | ✅ Completed |
| **P0-2.2** | Add Nested `select` Snippet Lab Task | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (L127–128) | Add task `prisma07-c2-t3` requiring `posts: { select: { title: true } }` graded via `prismaSnippetTask`. | ✅ Completed |
| **P0-3** | Add Atomic `increment` Executable Task | [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) (L79–80) | Add executable task `prisma10-c1-t3` under `update-atomic` for `prisma.post.update({ data: { authorId: { increment: 1 } } })`. Fulfills outcome. | ⏳ Ready |
| **P0-4** | Overhaul Day 14 Capstone Challenge | [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) (L214–241) | Replace Day 1-style lookup in `prisma14-hw-1` with relational profile & posts query (`include: { posts: true }`, `noCols: ['name']`). | ⏳ Ready |

---

## Phase 1: Engine Capability Grounding (Completed)

| Verification Item | Tested In Source | Verified Result | Strategy Impact |
|---|---|---|---|
| `PrismaMethod` Union | `src/types/prisma-curriculum.ts` line 14 | 11 methods recognized | Dispatches strictly to supported subset |
| Atomic Math (`increment`, etc.) | `prisma-sql-generator.ts` lines 1017–1053 | ✅ Supported in `scalarAtomicSets` | Can be taught as executable tasks |
| Nested `select` Relations | `prisma-sql-generator.ts` line 267 | ⚠️ Relation dropped silently | Must be graded via snippet labs |
| Relational Filters (`some`, etc.) | `prisma-sql-generator.ts` line 463 | ❌ Rejected (`ok: false`) | Must be graded via snippet labs |
| `groupBy` & `aggregate` | `prisma-sql-generator.ts` line 1200 | ❌ Not translatable | Must be graded via snippet labs |
| Interactive Transactions | `prisma-sql-generator.ts` line 1183 | ✅ Executable via proxy | Can be taught as executable tasks |

---

## Phase 2: Curriculum Structure & Task Specifications

| Section | Focus Area | Grading Type | Status | Review Notes |
|---|---|---|---|---|
| **S1** | Schema Basics (datasource, model, scalar types) | Snippet Lab | ⏳ Drafting | Focus on mental model of models & fields |
| **S2** | Constraints & Enums (@id, @unique, @@unique) | Snippet Lab | ⏳ Drafting | Split from S1 to avoid decorator overload |
| **S3** | Relations & Foreign Keys (@relation, 1:N, M:N) | Snippet Lab | ⏳ Drafting | Clear distinction between FK and navigation field |
| **S4** | Migration Lifecycle (migrate dev/deploy) | Snippet Lab (CLI) | ⏳ Drafting | Contrast local dev vs CI/CD pipelines |
| **S5** | Client Setup & Singleton Pattern | Snippet Lab | ⏳ Drafting | Connection management and teardown |
| **S6** | Record Creation (create, createMany) | Executable | ⏳ Drafting | First live database mutation |
| **S7** | Basic Reads (findUnique, findMany + where) | Executable | ⏳ Drafting | Equality, boolean logic, comparison operators |
| **S8** | Sorting & Pagination (orderBy, skip, take) | Executable | ⏳ Drafting | Offset pagination and sort directions |
| **S9** | Field Selection (select, include, nested select) | Executable + Snippet | ⏳ Drafting | Accurate explanation of over-fetching prevention |
| **S10** | Updates & Atomic Math (update, increment) | Executable | ⏳ Drafting | Emphasize concurrency-safe arithmetic |
| **S11** | Idempotence & Deletions (upsert, delete) | Executable | ⏳ Drafting | Upsert mechanics and cascade considerations |
| **S12** | Error Handling (P2002, P2025) | Executable (failure) | ⏳ Drafting | Realistic try/catch error inspection |
| **S13** | Transactions ($transaction array + interactive) | Executable | ⏳ Drafting | ACID guarantees and rollback behavior |
| **S14** | Advanced Analytics (groupBy, relational filters) | Snippet Lab | ⏳ Drafting | Clearly framed as snippet architecture lab |
| **S15** | Capstone Diagnostic Synthesis | Executable | ⏳ Drafting | Unassisted multi-concept diagnostic challenge |

---

## Validation Gate Checklist

- [ ] **Gate 0:** `npm run audit:taught-before-tested` returns 0 sequence errors.
- [ ] **Gate 1:** `npm test` passes across all test suites without regressions.
- [ ] **Gate 2:** Every task definition specifies `skillType` (`introduce`, `practice`, `assess`) and `gradingType`.
- [ ] **Gate 3:** All `completionLearnings` statements are verified against actual lesson tasks.
- [ ] **Gate 4:** At least one diagnostic `assess` task is present in each core section (S7–S15).
- [ ] **Gate 5:** All executable tasks produce valid SQL statements in SQL Lens without runtime warnings.
