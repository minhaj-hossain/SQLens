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
| **Phase 0** | Immediate Defect Remediation | ✅ Completed | P0-1a, P0-1b.1, P0-1b.2, P0-2.1, P0-2.2, P0-3, P0-4 — all verified; 21/21 tests green |
| **Phase 1** | Engine Capability Grounding | ✅ Completed | 1,254 lines of generator + validator analyzed; capability matrix published |
| **Phase 2** | Architecture & Dependency Mapping | ✅ Completed | Strategy C adopted; all 14 modules mapped; 8 modules audited; sequence frozen |
| **Phase 3** | Task Quality Rubric Implementation | 🔄 In Progress | Implementing 8-point rubric: task type tagging (`skillType`, `gradingType`), audit script, and rubric validation across all 80 tasks |
| **Phase 4** | Curriculum Content Authoring | ⏹️ Blocked by P3 | Authoring missing tasks for open gaps (G3, G5, G7) |
| **Phase 5** | Validation Gates & Release | ⏹️ Not Started | End-to-end verification via audit scripts and full test suite |

---

## Phase 0: Immediate Defect Remediation (Granular Action Items)

| Step ID | Focus Item | Target File & Line Range | Action Plan & Verification | Status |
|---|---|---|---|---|
| **P0-1a** | Fix Day 6 Inversions (`prisma06-hw-1`) | [`src/content/prisma/modules/prisma-06-client-lifecycle.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-06-client-lifecycle.ts) (L121–151) | Replace `findMany` + `orderBy` with single gateway lookup (`findUnique` on `alex@prisma.io`, `select: { id, email }`). Test passes. | ✅ Completed |
| **P0-1b.1** | Fix Day 5 `upsert` Inversion (`prisma05-c2-t1`) | [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) (L87–104) | Replace `prisma.user.upsert` with CLI seed trigger: `npx prisma db seed`. Ban `node `. | ✅ Completed |
| **P0-1b.2** | Fix Day 5 `createMany` Inversion (`prisma05-hw-1`) | [`src/content/prisma/modules/prisma-05-migrations-seeding.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-05-migrations-seeding.ts) (L132–151) | Replace `prisma.user.createMany` challenge with deterministic dev reset: `npx prisma migrate reset --force`. | ✅ Completed |
| **P0-2.1** | Correct `select`/`include` Theory | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (L81–88) | Replace "never both at once" with accurate explanation of root collision vs nested `select` relation projection. | ✅ Completed |
| **P0-2.2** | Add Nested `select` Snippet Lab Task | [`src/content/prisma/modules/prisma-07-reading-data.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-07-reading-data.ts) (L127–128) | Add task `prisma07-c2-t3` requiring `posts: { select: { title: true } }` graded via `prismaSnippetTask`. | ✅ Completed |
| **P0-3** | Add Atomic `increment` Executable Task | [`src/content/prisma/modules/prisma-10-update-upsert.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-10-update-upsert.ts) (L75–98) | Add executable task `prisma10-c1-t3` under `update-atomic` for `prisma.user.update({ data: { id: { increment: 1 } } })`. Fulfills outcome. | ✅ Completed |
| **P0-4** | Overhaul Day 14 Capstone Challenge | [`src/content/prisma/modules/prisma-14-api-capstone.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-14-api-capstone.ts) (L213–295) | Replaced single trivial lookup with two-task diagnostic: `prisma14-hw-1` (executable `findMany` with `orderBy` + `noCols: ['name']`) and `prisma14-hw-2` (snippet lab `findUnique` + `include: { posts: true }`, `ban: ['select: {']`, `select: []` to suppress select contract). 21/21 tests pass. | ✅ Completed |

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

## Phase 2: Architecture & Dependency Mapping (Granular Action Items)

| Step ID | Focus | Action | Status |
|---|---|---|---|
| **P2-1** | Strategy C Sign-Off | Formally adopt Two-Tier Hybrid: executable for core CRUD/queries/transactions; snippet-lab for schema/CLI/analytics | ✅ Completed |
| **P2-2** | Module → Section Mapping | Map all 14 existing modules to S1–S15; identify coverage gaps | ✅ Completed |
| **P2-3** | Strategy C Compliance Audit | Audit 8 un-P0'd modules for grading type correctness, prerequisite inversions, and falsifiable outcomes | ✅ Completed |
| **P2-4** | Gap Identification | Produce prioritised list of missing tasks for Phase 4 authoring | ✅ Completed |
| **P2-5** | Freeze Module Sequence | Lock day→section mapping; no reordering after this step | ✅ Completed |

---

## Phase 3: Task Quality Rubric Implementation (Granular Action Items)

| Step ID | Focus | Action Plan | Status |
|---|---|---|---|
| **P3-1** | Rubric Schema Extension | Add `skillType` (`introduce`, `practice`, `assess`) and `gradingType` (`executable`, `snippet-lab`) to task types in [`src/types/curriculum.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/types/curriculum.ts) & [`src/types/prisma-curriculum.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/types/prisma-curriculum.ts). | ✅ Completed |
| **P3-2** | Task Factories Adaptation | Update `prismaReadTask` (defaults `gradingType: 'executable'`) and `prismaSnippetTask` (defaults `gradingType: 'snippet-lab'`) in [`src/content/prisma/phase6-tasks.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/phase6-tasks.ts) to stamp rubric metadata. | ⏳ Pending |
| **P3-3** | Rubric Gate 2 Audit Script | Implement `scripts/audit-task-rubric.ts` to assert all 8 rubric dimensions across all 80 tasks. Register `audit:task-rubric` in `package.json`. | ⏳ Pending |
| **P3-4** | Task Metadata Rollout | Ensure all 80 tasks across Days 1–14 have explicit, verified `skillType` and `gradingType` tagging matching their instructional intent. | ⏳ Pending |
| **P3-5** | Gate 2 Audit & Sign-Off | Execute `npm run audit:task-rubric` with 0 findings, validating all 8 rubric dimensions for curriculum tasks. | ⏳ Pending |

---

## Phase 2: Verified Content Gaps (Phase 4 Results)

| Gap ID | Section | Content Area | Grading Type | Priority | Status |
|---|---|---|---|---|---|
| **G1** | S6 | `create` introduce task | Executable | High | ✅ CLOSED — `prisma09-c1-t1` already covers it |
| **G2** | S6 | `createMany` batch task | Executable | Medium | ✅ CLOSED — `prisma09-c1-t2` already covers it |
| **G3** | S7 | `findFirst` standalone introduce task | Executable | 🔴 High | ✅ CLOSED — `prisma07-c1-t2` already introduces `findFirst` |
| **G4** | S8 | Cursor pagination task | Snippet Lab | Medium | ✅ CLOSED — `prisma08-c2-t2` is already executable (better) |
| **G5** | S12 | P2025 error handling task | Snippet Lab | 🔴 High | ✅ CLOSED — `prisma13-c1-t2` covers P2025 in try/catch under Strategy C |
| **G6** | S14 | `groupBy` + `_count` introduce task | Snippet Lab | Medium | ✅ CLOSED — `prisma08-c3-t1` already covers it |
| **G7** | S14 | Relational filter (`some`/`every`/`none`) task | Snippet Lab | 🟡 Medium | ✅ CLOSED — Authored `prisma08-c1-t3` for relational `some` filter |

---

## Phase 2: Frozen Module Sequence

| Day | Module | Primary Section | Grading Mix | Compliance Status |
|---|---|---|---|---|
| 1 | `prisma-01-why-prisma.ts` | Orientation | — | ✅ No change needed |
| 2 | `prisma-02-setup-connection.ts` | S5 | Snippet Lab | ✅ PASS — all tasks snippet-lab |
| 3 | `prisma-03-models-constraints.ts` | S1 + S2 | Snippet Lab | ✅ ACCEPTED deviation — 1 executable schema proof (`findUnique` pre-introduced) |
| 4 | `prisma-04-relations.ts` | S3 | Snippet Lab | ✅ ACCEPTED deviation — `include` demos require `findUnique` as vehicle |
| 5 | `prisma-05-migrations-seeding.ts` | S4 | Snippet Lab (CLI) | ✅ P0 fixes applied |
| 6 | `prisma-06-client-lifecycle.ts` | S5 | Snippet Lab | ✅ P0 fix applied |
| 7 | `prisma-07-reading-data.ts` | S7 + S9 | Executable + Snippet | ✅ P0 fixes applied |
| 8 | `prisma-08-filtering-pagination.ts` | S7 + S8 + S14 | Executable + Snippet | ✅ PASS — groupBy & relational `some` snippet-lab; cursor executable |
| 9 | `prisma-09-create-zod.ts` | S6 | Executable + Snippet | ✅ PASS — create/createMany executable; Zod snippet-lab |
| 10 | `prisma-10-update-upsert.ts` | S10 + S11 | Executable | ✅ P0 fix applied |
| 11 | `prisma-11-delete-cascades.ts` | S11 | Executable + Snippet | ✅ PASS — cascade snippet-lab; deleteMany executable |
| 12 | `prisma-12-nested-transactions.ts` | S13 | Snippet Lab | ✅ PASS — both $transaction forms graded correctly |
| 13 | `prisma-13-errors-middleware.ts` | S12 | Snippet Lab | ✅ PASS — all error tasks snippet-lab |
| 14 | `prisma-14-api-capstone.ts` | S15 | Executable + Snippet | ✅ P0 overhaul applied |

---

## Validation Gate Checklist

- [x] **Gate 0:** `npm run audit:taught-before-tested` returns 0 sequence errors (424 tasks checked, 0 findings).
- [x] **Gate 1:** `npm test` passes across all test suites without regressions (885/885 passed across 77 suites).
- [ ] **Gate 2:** Every task definition specifies `skillType` (`introduce`, `practice`, `assess`) and `gradingType` adhering to Strategy C.
- [ ] **Gate 3:** All `completionLearnings` statements are verified against actual lesson tasks.
- [ ] **Gate 4:** At least one diagnostic `assess` task is present in each core section (S7–S15).
- [ ] **Gate 5:** All executable tasks produce valid SQL statements in SQL Lens without runtime warnings.

