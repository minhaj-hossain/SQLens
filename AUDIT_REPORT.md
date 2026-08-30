# SQLens — Full Website Performance & Maintenance Audit Report

> **RESOLUTION UPDATE (post-expansion, 2026):** this audit drove the improvement roadmap and
> its findings have since been addressed. Status: ① engine test suite **added** (Vitest,
> 93 tests / 8 files + `test:engine` 46-case suite + CI workflow); ② code splitting in place
> (`RoadmapModal` dynamically imported); ③ DB state reset verified via lifecycle policy
> (`test:db-lifecycle`, 34 assertions); ④ `CURDATE()` anchored to the 2026 seed data
> (`src/config/simulated-date.ts`); ⑤ curriculum auditor DDL false positives fixed;
> ⑥ dead dependencies re-checked — `better-auth`/`mongodb` are used (auth), remaining deps
> in use. Curriculum has since expanded from 25 to **38 days** (see
> `curriculum_master_plan.md` §7). The report below is preserved as the original baseline.

**Project:** SQL Interactive Learning Platform ("SQLens")
**Root:** `sql_learning/`
**Stack:** React 19 + Vite 6 + TypeScript + Tailwind 4 + `motion` (SPA, statically exported)
**Hosting:** Vercel (`sqlens`)
**Audit date:** 2026-08-26

---

## 1. Executive Summary

SQLens is a hands-on SQL learning SPA driven by a custom in-browser SQL engine (parser, executor, validator), a 25-day / 64-concept / 202-task curriculum, localStorage progress tracking, and a daily 6 PM unlock gate. The application is functionally rich and the content authoring is high quality.

Three live validation gates were run during this audit:

| Gate | Command / Method | Result |
|---|---|---|
| Type safety / "lint" | `npx tsc --noEmit` | ✅ PASS — 0 errors |
| Curriculum & pedagogy auto-audit | `npx tsx scripts/verify-curriculum.ts` | ⚠️ WARNING — Day 20 flagged (see §5) |
| Runtime tooling | Node v24.13.0, npm 11.19.0 | ✅ PASS |

**Headline risks** (ordered by impact):
1. **No automated test suite** exists for the SQL engine — the highest technical risk.
2. A **single ~918 KB JS bundle** ships with no code splitting or route-level lazy loading.
3. **In-memory database state is not reset** between lessons/modules — DML/DDL mutations leak across the session and silently revert on refresh.
4. **`CURDATE()` is hard-coded to `2024-03-01`**, but seed data is dated **2026** — temporal/recency queries drift and return empty results.
5. The **curriculum auditor reports false positives** for DDL-created tables (Day 20 always shows as broken).
6. Several **bundled dependencies are unused** by the app.

---

## 2. Project Structure

```
src/
  App.tsx                     — root state machine, global modals, layout orchestration
  main.tsx                    — React root (StrictMode)
  index.css                   — Tailwind entry
  components/
    layout/   Header, BottomNav, RoadmapSidebar
    learning/ ConceptLessonView, ConceptCompleteView, PracticeTaskView,
              IndependentChallengeView, ModuleCompletionView, SQLEditor,
              ResultsConsole, SuccessModal, TaskInstructions, DatabaseExplorer
    roadmap/  LearningPathView, RoadmapModal, SchemaModal
  config/     curriculum-schedule.ts, learning.ts, roadmap.ts
  content/
    curriculum-index.ts
    database/ schema.ts, tables.ts
    modules/  day01.ts ... day03.ts, day04to08.ts, day09to16.ts, day17to25.ts
  lib/
    progress/ storage.ts, unlock-calculator.ts
    sql-engine/ executor.ts, parser.ts, validator.ts
  types/       curriculum.ts, database.ts, progress.ts
scripts/
  verify-curriculum.ts        — content / pedagogy auto-audit
assets/ dist/ .vercel/
stale dev docs: atomization_plan.md, curriculum_master_plan.md, plan.md
lockfiles:      bun.lock + package-lock.json
```

### Volume statistics
- **25 modules**, **64 concepts**, **202 practice tasks**, **67 MCQs**
- SQL content source: day01 (~35 KB) … day17to25 (~199 KB) — ~585 KB raw
- Build output: `dist/assets/index-oH2wLpEp.js` (940,612 B ≈ 918 KB), `index-Bs_rXnkk.css` (75,945 B)

---

## 3. Architecture & Data Flow

- One shared `SqlExecutor` instance (`useMemo(() => new SqlExecutor(), [])` in `App.tsx`) executes queries in-memory against seeded tables.
- Progress is persisted to `localStorage` under key `sql_mastery_progress_v1` on every `userState` change.
- The unlock logic lives in `unlock-calculator.ts` and models a "learning day" that begins at 18:00 local and ends at 17:59 the next day.
- All goals are static / in-browser; there is **no server component** — the project deploys as static files on Vercel.
---

## 4. Performance Findings

### 🔴 P-HIGH — Single large synchronous bundle
- **No code splitting.** `React.lazy` / `Suspense` are absent; all 25 curriculum files, the engine, and animation libraries are bundled into one chunk.
- `vite.config.ts` configures only defaults — no `manualChunks`, no input splitting.
- Result: initial download in the region of **~1 MB (JS + CSS)** before the app is interactive.

### 🔴 P-HIGH — Global animation + render-heavy libs loaded eagerly
- `motion` (framer) is imported in 12 components; `canvas-confetti` is also bundled globally even though it is only needed for celebration moments.
- Neither is split or lazily loaded.

### 🟡 P-MED — Render-blocking web-font loading
- `index.html` loads **two** Google Fonts stylesheets covering **6 families** and many weights (Space Grotesk, Manrope, Hanken Grotesk, Inter, JetBrains Mono, Material Symbols).
- The Material Symbols stylesheet is **not preconnected**, and no `display=swap` is set on either link — this blocks first paint and LCP.

### 🟡 P-MED — In-memory DB lifecycle
- `App.tsx` creates a single `SqlExecutor` for the whole session and **never calls `resetDatabase()`** on module/concept switches or unload.
- DML (INSERT/UPDATE/DELETE, Day 19+) and DDL (Day 20+) persist in memory across lessons and silently revert on a page refresh (the DB itself is not persisted while progress is) — a consistency hazard for later lessons reading mutated data.

### 🟡 P-MED — Date anchor drift (temporal/recency queries)
- `executor.ts` hard-codes `CURDATE()` to `2024-03-01` for `CURDATE() - INTERVAL …`.
- Seed data (`src/content/database/tables.ts`) was updated to **2026** dates (`FIX 1/2/3/4` comments confirm the change).
- Consequences: queries like `WHERE order_date >= CURDATE() - INTERVAL 30 DAY` now return **0 rows**; recency examples silently produce empty output.

### 🟢 P-LOW — No offline cache / service worker
- Static bundles are cacheable by the host, but no in-app cache strategy or offline fallback is defined.

---

## 5. Maintenance Findings

### 🔴 M-HIGH — No automated tests
- No `*.test.*` files, no Vitest/Jest, no `test` script in `package.json`.
- The SQL engine (parser / executor / validator) — the highest-risk pure-logic tier — is entirely untested.

### 🔴 M-HIGH — verify-curriculum.ts false positives (Day 20)
- The auditor flags many Day 20 `primaryTable`s as unknown: `product_tags`, `quick_notes`, `product_metrics`, `customer_preferences`, `categories_new`, `departments`, `employees`, `user_logins`, `customer_emails`, `product_skus`, `audit_logs`, `store_credits`, `product_ratings`, `employee_bonuses`, `temp_order_staging`, `legacy_student_grades`.
- These are **DDL-created tables**; `executeDdl()` creates them at runtime, so they are functional — but the auditor does not understand them, so **Day 20 always shows ⚠️** and pollutes the review signal.

### 🟡 M-MED — Dead / unused dependencies
- Listed as production dependencies but never imported in `src`: **`gsap`**, **`express`**, **`dotenv`**, **`@google/genai`** (AI-Studio template remnants). No `server.js` exists.

### 🟡 M-MED — Duplicate lockfiles
- Both `bun.lock` and `package-lock.json` are committed — two package managers in one repo add noise and risk.

### 🟡 M-MED — Type-safety leaks
- ~10 occurrences of `as any` / `: any` / `Record<string, any>` (incl. `customValidator`, parser/executor internals) weaken compile-time guarantees.

### 🟡 M-MED — No linting / formatting / CI
- No ESLint, Prettier, no `.github/workflows`, no CI build gate, no pre-push hooks. `npm run lint` only runs `tsc --noEmit`.

### 🟡 M-MED — Developer knobs shipped to production
- `bypassDailyLock` and `simulatedTimeOffsetHours` are part of `UserLearningState` and exposed in the Header UI; any user can toggle them to defeat the daily unlock model.

### 🟢 M-LOW — localStorage without migration/validation
- Load merges any parsed blob over defaults; a corrupt or partial state silently degrades. No schema version migration path.

### 🟢 M-LOW — Stale docs / config references
- README instructs setting a Gemini key + `.env.local`, and `.env.example` documents `GEMINI_API_KEY`, for a **static, no-server app** that makes no Gemini call.
---

## 6. Unlock & Progression Logic Analysis

- The learning-cycle gate meaningfully controls pacing: the previous module must be fully completed (concepts **and** challenge), a 6 PM boundary must pass, and an optional `scheduledPublishDate` may add a hard date floor.
- Edge cases worth testing (see matrix §8): exactly at 18:00, `simulatedTimeOffsetHours`, `bypassDailyLock`, missing previous completion record, previous record with `challengeCompleted: false`, publish-date still in the future, and `prevCycle`/`currentCycle` equality.
- A malformed `completedAt` string is tolerated (falls back to today's 18:00) — no hard crash, but silent behavior.

---

## 7. Prioritized Remediation Plan

### Phase 1 — Stability (P0)
1. Fix the `CURDATE()` anchor so temporal filters are correct for the 2026 seed data (or make the anchor data-driven).
2. Reset the in-memory database when navigating between modules/concepts (`resetDatabase()` on transition) to stop mutation leaks.
3. Audit DML/DDL mutation persistence and add a deliberate per-day reset policy.

### Phase 2 — Test coverage (P0)
4. Add Vitest, a `test` script, and write the full scenario matrix (§8): parser, executor, validator, unlock-logic, storage.
5. Add a CI GitHub Action as a gate: `npm run lint && npm test && npm run build`.

### Phase 3 — Authoring tooling (P1)
6. Teach `verify-curriculum.ts` about DDL-created tables (skip the `primaryTable` unknown-check for `CREATE TABLE`-first concepts) to remove Day 20 false positives.
7. Re-run the curriculum audit and confirm all days pass cleanly.

### Phase 4 — Performance (P1)
8. Enable component-level code-splitting (`React.lazy`) for lesson / challenge / completion views.
9. Add Vite `manualChunks` to separate vendor, content, engine, and UI concerns.
10. Reduce font load: self-host the core families with `font-display: swap`, consolidate to 2 families, add `display=swap` + preconnect for the Material Symbols sheet.
11. Lazy-load `canvas-confetti` and load `motion` only where transitions are essential.
12. Re-build and re-measure bundle sizes (target < ~500 KB parsed JS).

### Phase 5 — Hygiene & hardening (P2)
13. Remove unused deps (`gsap`, `express`, `dotenv`, `@google/genai`); reconcile to a single lockfile.
14. Add Prettier + ESLint + commit hooks.
15. Tighten `any` to proper types (`ParsedSqlQuery`, `TableRow` helpers).
16. Gate dev/test flags behind an explicit `VITE_` env or a dev-only settings screen.
17. Add localStorage schema versioning + validation with a migration path.
18. Update README / `.env.example` to reflect the actual no-server static architecture.

---

## 8. Proposed Test Scenario Matrix

### Parser
- `SELECT` / `SELECT *` / selective columns / aliasing (`AS`)
- Aggregates (`COUNT`/`SUM`/`AVG`/`MIN`/`MAX`) and aliases
- Window functions (`ROW_NUMBER`/`RANK`/`DENSE_RANK`, `PARTITION BY`, `ORDER BY`)
- WHERE operators: `=`, `!=`, `<>`, `<=`, `>=`, `<`, `>`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`
- Joins: `INNER`/`LEFT` + `ON`
- `GROUP BY` / `HAVING` / `ORDER BY` / `LIMIT` / `OFFSET` / `DISTINCT`
- Subqueries and CTEs
- DML: `INSERT` / `UPDATE` / `DELETE`
- Transactions: `BEGIN` / `COMMIT` / `ROLLBACK`
- DDL: `CREATE` / `ALTER` / `DROP`
- Comments, quoting, trailing semicolons

### Executor
- Correct row counts and column sets for each of the above
- `LEFT JOIN` null-fan-out semantics
- `GROUP BY` + `HAVING` aggregate evaluation
- Aggregate correctness incl. `DISTINCT` and `COUNT(*)`
- Window partitioning / ranking order
- `LIMIT`/`OFFSET` slicing
- DML affects (INSERT/UPDATE/DELETE actual rows changed)
- Transaction rollback restores pre-`BEGIN` state; commit persists
- DDL create/alter; missing-table error paths
- Error paths: unknown table, unknown column, invalid syntax

### Validator
- `targetTable` (incl. CTE / EXPLAIN / DDL handling)
- `requiredColumns`, `forbiddenColumns`, `requiredAliases`
- `requireJoin`, `requireGroupBy`, `requireHaving`
- `requireLimit` (exact and ranged) / `requireOffset` / `requireOrderBy` + direction
- `requireDistinct`, `requireWhere` + `whereContainsTerms`
- `expectedRowCount` (exact and min/max)
- `customValidator`
- Syntax traps: aggregate-in-`WHERE`, unquoted text literal

### Unlock / progress
- Cycle ID boundary at 18:00 (before and after)
- `getNextUnlockTime` across day/hour boundaries
- Sequential gating (#concepts + #challenge completed)
- `scheduledPublishDate` override
- `bypassDailyLock` true/false
- Countdown formatting and simulated time offset shifts

### Storage
- load / save / reset round-trip
- Reset clears all records
- Corrupt JSON → returns initial state without crash
- Version / migration guard
---

## 9. Concrete File / Line References

- **Bundle / fonts:** `vite.config.ts` (no `manualChunks`, no lazy loading); `index.html` (two font stylesheets).
- **DB state leak:** `src/App.tsx` — `sqlExecutor` created in `useMemo(() => new SqlExecutor(), [])` with no `resetDatabase()` call on transitions.
- **Date drift:** `src/lib/sql-engine/executor.ts` — `CURDATE()` anchor (`≈ 2024-03-01`) used for `CURDATE() - INTERVAL …`; seed data `src/content/database/tables.ts` uses 2026 dates (`FIX 1/2/3/4` comments).
- **DDL creator:** `src/lib/sql-engine/executor.ts` — `executeDdl()`.
- **Auditor false positives:** `scripts/verify-curriculum.ts` — Rule 3 (`primaryTable` check against `DATABASE_SCHEMAS` / `INITIAL_TABLES`).
- **Dead deps:** `package.json` — `gsap`, `express`, `dotenv`, `@google/genai`.
- **Dev flags:** `src/types/progress.ts` — `bypassDailyLock`, `simulatedTimeOffsetHours`; surfaced in `src/components/layout/Header.tsx`.
- **Storage:** `src/lib/progress/storage.ts` — load/save/reset, no versioning or migration.
- **Unlock gates:** `src/lib/progress/unlock-calculator.ts`.

---

*Report generated 2026-08-26 for `sql_learning`. Next step: implement Phase 1 and add the test harness (§8).*