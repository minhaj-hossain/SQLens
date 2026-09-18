# scripts/ — Developer Utility Scripts

Every script here is run from the **project root** with `tsx` or `node`. The
wired scripts are hooked into `package.json`/CI; the standalone ones are
one-off dev/audit tools. None of them mutate learner data — they run against
an in-memory engine or a fresh sandbox.

## Wired into package.json / CI

| Script | Command | Purpose |
|---|---|---|
| `verify-curriculum.ts` | `npm run verify:curriculum` | Audits all 38 modules against the curriculum rules: step-breakdowns require `targetQuery`, every task's `primaryTable`/`secondaryTables` must exist in the schema, intro-tables are schema-aligned, MCQs are well-formed. Exits non-zero on any 🔴/⚠️. |
| `engine-tests.ts` | `npm run test:engine` | Standalone regression suite for the in-browser SQL engine (48 checks): RIGHT/FULL/CROSS joins, set operations, CASE WHEN, window functions, functions/strings/dates, EXPLAIN, transactions, DDL constraints, comments, scripts. |
| `module-order-check.ts` | `npm run test:module-order` | Verifies the position-independent curriculum ordering: exactly 38 modules, canonical order `day-01…day-38`, unique `curriculumOrder`, Gate-0 = first module, and that a synthetic probe module (order 9.5) inserts cleanly without disturbing any existing ID. |
| `db-lifecycle-check.ts` | `npm run test:db-lifecycle` | Application-level database lifecycle verification (not the engine test): fresh vs inherit DB state across task boundaries, reset boundaries. |
| `day1920-manual-pass.ts` | `npm run test:manual-pass` | Drives the real UI flow (Days 19/20) to verify fresh/inherit DB state and that progress persistence is independent of DB state. |
| `probe-equivalence.ts` | `npm run audit:equivalence` | Projection (F6): 18 assert-style CONTRACT probes for the engine-honesty findings (S1-1 … S3-10) plus BASELINE probes. Exits non-zero if any contract regresses. |
| `audit-equivalence.ts` | `npm run audit:equivalence:tasks` | Projection (F6), author guardrail: for every exact-result task it proves approach-fairness (operator aliases, keyword case, whitespace, CTE re-wrap must all still pass), no-false-accept (dropping the WHERE clause must fail), and that `strictConstruct` accepts the task's own solution. |
| `count-validation-overlap.ts` | `npm run audit:validation-overlap` | Reproduces the validation census (343 tasks / 274 exact-result / 66 structural-only / 3 expect-failure) and the per-rule overlap with `requireExactResult`, from the curriculum source of truth. |
| `audit-keyword-case.ts` | `npm run audit:keyword-case` | Keyword-CASE guardrail: flags regexes/comparisons that match a SQL keyword without the `i` flag across the engine and the SQL-aware UI libs. Reasoned allowlist + stale-entry detection. Found and now guards the `'literal' as alias` → NULL bug. |
| `apply-strict-construct.ts` | `npx tsx scripts/apply-strict-construct.ts [--write]` | Batch 6 content pass: sets `strictConstruct: true` on the 47 tasks whose concept is dedicated to the construct (set ops, DISTINCT, CASE, GROUP BY/HAVING, LIMIT, JOIN). Dry-run by default and prints its reasoning per task; idempotent, so re-running `--write` is safe. |

## Standalone audit / dev tools

| Script | Purpose |
|---|---|
| `audit-all-tasks.ts` | Executes EVERY practice + challenge task through the real engine and reports execution + validation outcomes across the whole curriculum. |
| `audit-task-lifecycle.ts` | Deep lifecycle audit of every task: hints, solution, validation config, DB lifecycle flag consistency. |
| `phase2-check.ts` | Phase 2 verification: concept slugs unique per module; legacy index→slug resolution (replicating `resolveConceptId`) works for every module/index including out-of-bounds values. |
| `probe-engine.ts` | Direct engine probe for audits: runs specific queries against the real executor to confirm exact result sets (used by the validation-robustness audit). |

## Build helper

| File | Purpose |
|---|---|
| `build.mjs` | Cross-platform `next build` wrapper: adds `--max-old-space-size=4096` to `NODE_OPTIONS` (preserving any existing value, never duplicating) so SSG doesn't OOM, then spawns the real build. Invoked via `npm run build`. |

## Adding a script

- Follow the header convention: a `/** ... */` block with the script's purpose and how to run it.
- If it should be runnable by a shortcut, add a `npm run <name>` entry in `package.json` and list it in the "Wired" table above.