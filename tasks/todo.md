# Remediation Task List

## Phase 1: Security Hardening & Dead Code Removal
- [x] Task 1.1: Purge AI prototype spikes (ai-bootcamp, ai-sandbox, ai-parser, pyodide)
- [x] Task 1.2: Clean CSP and Better Auth configuration in next.config.ts & auth.ts
- [x] Task 1.3: Run dependency audit fix (`npm audit fix`)

## Phase 2: Duplicate Prisma Cleanup & Test Alignments
- [x] Task 2.1: Update tests/tracks/prisma-submit-pipeline.test.ts to canonical Day 12
- [x] Task 2.2: Delete 10 orphaned duplicate Prisma modules in src/content/prisma/modules/
- [x] Task 2.3: Fix ClickFooter.tsx `.flink` styling and align click-footer.test.tsx

## Checkpoint: Test Suite Green
- [x] Run `npm run test` (all 101 test files must pass)

## Phase 3: Curriculum Quality Gates & Admin Metrics
- [x] Task 3.1: Fix outcome claims in prisma-03 and prisma-04 (`npm run audit:outcomes`)
- [x] Task 3.2: Reconcile Prisma hint ladders to pass `npm run audit:prisma-hints`
- [x] Task 3.3: Include Prisma in admin system health API (src/app/api/admin/system/route.ts)

## Phase 4: Production Verification
- [x] Task 4.1: Enforce strict TypeScript in next.config.ts (`ignoreBuildErrors: false`)
- [x] Task 4.2: Run `npm run audit:all` and `npm run build`
