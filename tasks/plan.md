# Implementation Plan: Full Codebase Remediation (SQLens)

## Overview
Remediates all identified security threats, broken tests, orphaned duplicate files, and curriculum audit failures in the SQLens core codebase, deliberately deferring the networking track for a dedicated milestone.

---

## Architecture Decisions & Scope
- **De-scope Networking Track:** Per user instruction, all networking track modules, canvas, components, and routes remain untouched for now.
- **Complete Removal of AI/Pyodide Spikes:** Delete `ai-bootcamp`, `ai-sandbox`, `ai-parser.ts`, `docs/global/ai_curriculum/`, and remove the `pyodide` package. This eliminates the critical Path Traversal vulnerability and shrinks attack surface.
- **Elimination of Orphaned Prisma Duplicates:** Delete 10 unreferenced duplicate modules in `src/content/prisma/modules/` (~280 KB), retargeting tests to canonical modules.
- **Alignment of UI Contracts & Tests:** Restore `.flink` utility class in `ClickFooter.tsx` and synchronize test link assertions so the entire Vitest suite passes green.
- **Curriculum Quality Gate Compliance:** Resolve outcome claim mismatches in `audit:outcomes` and normalize hint ladders to satisfy `audit:prisma-hints`.

---

## Task List

### Phase 1: Security Hardening & Dead Code Removal
- [ ] **Task 1.1: Purge AI Prototype Spikes & Fix Path Traversal**
  - Delete `src/app/(app)/ai-bootcamp/`
  - Delete `src/app/(app)/ai-sandbox/`
  - Delete `src/app/(app)/learn/`
  - Delete `src/components/ai-sandbox/`
  - Delete `src/lib/ai-parser.ts`
  - Delete `docs/global/ai_curriculum/` and `docs/global/AI_ENGINEERING_BOOTCAMP_PLAN_AND_TRACKER.md`
  - Remove `pyodide` from `package.json` dependencies and run clean install
- [ ] **Task 1.2: Clean CSP and Auth Configuration**
  - In `next.config.ts`, remove `https://cdn.jsdelivr.net` from Content Security Policy
  - In `src/lib/auth.ts`, add fail-fast check in production if `BETTER_AUTH_SECRET` is unset, and configure safe dev fallback to silence 14 build warnings
- [ ] **Task 1.3: Run Dependency Audit Remediation**
  - Execute `npm audit fix` for non-breaking security updates

### Phase 2: Duplicate Prisma Cleanup & Vitest Fixes
- [ ] **Task 2.1: Update `tests/tracks/prisma-submit-pipeline.test.ts`**
  - Retarget CLI task IDs from deprecated `prisma05-c1-t1`/`t2` to canonical Day 12 `prisma12-c1-t1`/`t2`
  - Remove import of `prisma-05-migrations-seeding.ts`
  - Update line 444 whitespace assertion to reflect `canonicalizeNonCliSnippet` colon-spacing normalization
- [ ] **Task 2.2: Delete 10 Orphaned Duplicate Prisma Modules**
  - Remove `prisma-05-migrations-seeding.ts`, `prisma-06-client-lifecycle.ts`, `prisma-07-reading-data.ts`, `prisma-08-filtering-pagination.ts`, `prisma-09-create-zod.ts`, `prisma-10-update-upsert.ts`, `prisma-11-delete-cascades.ts`, `prisma-12-nested-transactions.ts`, `prisma-13-errors-middleware.ts`, `prisma-14-api-capstone.ts`
- [ ] **Task 2.3: Fix `ClickFooter` Styling and Test Alignment**
  - In `src/components/layout/ClickFooter.tsx`, apply `.flink` class to navigation links
  - Reconcile `href="#about"` and `href="#feedback"` with `tests/ui/click-footer.test.tsx`

### Checkpoint: Test Suite Green
- [ ] Run `npm run test` — verify all 101 test files and 1,139+ tests pass with 0 failures

### Phase 3: Curriculum Quality Gates & Admin Metrics
- [ ] **Task 3.1: Fix `audit:outcomes` Claims in Prisma Days 3 & 4**
  - Adjust `completionLearnings` in `prisma-03-models-constraints.ts` and `prisma-04-relations.ts` to match task keywords
  - Verify `npm run audit:outcomes` passes cleanly
- [ ] **Task 3.2: Reconcile Prisma Hint Ladders (`audit:prisma-hints`)**
  - Ensure Tier 3 hints stop 1 step short across Prisma tasks (adding stop-short indicators like `/* ... */` instead of verbatim solution dumps)
  - Verify `npm run audit:prisma-hints` passes cleanly
- [ ] **Task 3.3: Include Prisma in Admin System Health API**
  - In `src/app/api/admin/system/route.ts`, compute curriculum metrics across both SQL and Prisma

### Phase 4: Production Verification
- [ ] **Task 4.1: Enforce Strict TypeScript Builds**
  - Set `ignoreBuildErrors: false` in `next.config.ts`
  - Verify `npm run lint` and `npm run build` succeed with zero errors or warnings
- [ ] **Task 4.2: Full Regression Audit**
  - Run `npm run audit:all` — verify all curriculum, equivalence, and grading audits pass 100%

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Deleting duplicate Prisma files breaks external imports | High | Grepped codebase: only `prisma-submit-pipeline.test.ts` referenced them; retargeting to canonical Day 12 resolves it completely. |
| Removing Pyodide breaks build | Low | Tested build without Pyodide; removing routes and package reduces build time and bundle size. |
| Strict TS build reveals hidden errors | Medium | Run `tsc --noEmit` locally first before toggling `ignoreBuildErrors`. |
