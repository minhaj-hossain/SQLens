# SQLens Milestone 4 Audit — Content, Validation, Security & Engine
> **Scope:** Days 39–57 (`milestone-4`, 19 modules, 51 concepts, 81 tasks), the grading
> pipeline/validator, the SQL engine, and the auth/API surface.
> **Method:** All 10 CI gates executed live on 2026-09-23 against `main` (commit `4adf197`),
> plus manual review of `ConceptMentalModel`, M4 module sources, `submit-pipeline.ts`,
> `validator.ts`, `auth.ts`, and every API route.
> **Verdict in one line:** the *system* around Milestone 4 is strong (great gates, honest
> engine), but Milestone 4's own content shipped **behind** that system — 3 of 10 CI gates
> are red, every M4 task is graded by the weaker structural path, and no M4 concept has a
> purpose-built visualization.

---

## 0. Live gate results (evidence)

| Gate | Result |
|---|---|
| `npm run lint` (tsc) | ✅ 0 errors (ran directly) |
| `npm test` | ✅ 54 files / **628 tests** (P0: +7 engine regressions; P1: +6 judgment-gate tests) |
| `npm run verify:curriculum` | ✅ **100% clean** — Day 50 `primaryTable 'accounts'` note resolved (P0) |
| `npx tsx scripts/audit-all-tasks.ts` | ✅ **424/424** (after P0: `day45-t3` expectFailure fixed) |
| `npm run audit:equivalence` | ✅ (28 contract probes) |
| `npm run audit:equivalence:tasks` | ✅ **291 tasks / 866 rewrites** (P1: +6 M4-shape families; 5 honest skips) / 0 findings — every read-only task is inside the approach-fairness gauntlet |
| `npm run audit:validation-overlap` | ✅ census: 424 tasks / **291 exact** / **129 structural-only** / 4 expectFailure |
| `npm run audit:keyword-case` | ✅ |
| `npm run audit:grading-pipeline` | ✅ **0 findings** (after P0: Day 42 ×4, Day 54 ×2 fixed; P1: submits reference judgment answers) |
| `npm run audit:grading-policy` | ✅ **0 findings** (after P0: all 18 Rule-1 tasks now `requireExactResult`) |
| `npm run audit:taught-before-tested` | ✅ **0 findings** (after P0: all 6 prompt/construct findings fixed) |
| `npm run audit:custom-validators` | ✅ 17/17 predicates reachable, refutable, explainable |
| `npm run audit:ddl-contracts` | ✅ blocking 0 **AND advisory 0** (P1 swept all 32 `requiredColumns` + the Day-33 prompt columns) |
| `npm run test:module-order` / `test:engine` / `test:db-lifecycle` | ✅ checker updated from its stale 38-day contract to 57 · 46/46 · 34/34 |
| `npm run build` | ✅ Next 16 production build |

**F-0 → ✅ RESOLVED (P0 executed 2026-09-23):** all 10 `audit:all` gates, every CI
script, the full test suite, and the production build now pass. The four reds are fixed
at their roots — see the **P0 Execution Log** at the end of this document.

---

## 1. Concept position & visualization-type audit

### 1.1 Position/order — ✅ correct
- All 19 modules carry `milestoneId: 'milestone-4'`, sequential `curriculumOrder` 39–57
  (`src/config/curriculum-order.ts`), and are registered in `roadmap.ts` /
  `curriculum-index` (57 modules discovered by the verifier).
- Every concept has sequential `order: 1..3` (2 for days 55–56, 1 for 47/48) and the
  concept progression matches `docs/MILESTONE_4_CURRICULUM_SPEC.md` (e.g. day 41:
  *How WITH RECURSIVE Works → Number Series → Calendar Gaps*; day 56: *Expand/Contract →
  Backfill*). Ordering gate `test:module-order` passes.
- Concept titles are correctly positioned *within* phases (Encapsulate → Automate →
  Guarantee → Diagnose → Operate).

### 1.2 Visualization type — ❌ systematically wrong for M4
`resolveConceptArchetype()` (`src/components/learning/mental-models/ConceptMentalModel.tsx`)
maps **Days 1–38 only**. Days 39–57 hit the universal fallback:

1. **No archetype coverage.** All 51 M4 concepts resolve to `TABULAR_PROJECTION`
   (a static source-table card). Neither `CONCEPT_ID_OVERRIDES` nor the module-level
   defaults mention a single M4 day. Consequences by phase:
   - Day 41/42 (recursion, org-chart trees) → no tree/iteration visualizer
     (`CtePipelineVisualizer` from days 21/22 sits unused).
   - Day 49/50 (isolation anomalies, locks/deadlocks) → no timeline/wait-graph;
     `TransactionTimelineVisualizer` (day 26) is the natural fit but is unreachable for M4 ids.
   - Day 52 (composite/covering indexes) → `BTreeIndexVisualizer` (day 31) is a perfect
     match and is not wired.
   - Day 56 (expand/contract) → `SchemaBlueprintVisualizer` (DDL days) not wired.
2. **`shouldSuppressTopIntroTable`'s `diagramDrivenModules` list also stops at day-38** —
   so even if an archetype were added, the suppression list needs the same update or the
   two will disagree.
3. **Theory-element coverage collapsed in M4** (grep across the 19 files):

   | Element | Days 1–38 (typical) | Milestone 4 |
   |---|---|---|
   | `stepBreakdowns` | 2–5 per module | **0 in all 19 modules** |
   | `targetQuery` (hero) | per concept | **1 total** (day 39) |
   | `introTable` | 1 per concept (e.g. day 21: 5/5) | **1 per module max for days 39–48; 0 for days 49–57** |
   | `keyTakeaway` / `exampleQuery` | ✅ | ✅ 51/51 |
   | `liveDemoSql` / `mcqs` | ✅ | ✅ 1–3 per day |

   Because fallback `TABULAR_PROJECTION` *never suppresses* the intro table, the days-49–57
   concepts render **no top visualization at all** (mental model returns `null` and there
   is no `introTable` to show). The step-by-step visual pipeline that
   `curriculum_master_plan.md` calls the "Non-Negotiable Core Principle" (target query →
   step cards) simply does not exist in Milestone 4.
4. **Verifier blind spot:** `verify-curriculum`'s rule only fires when `stepBreakdowns`
   exist *without* `targetQuery` — M4 authors zero steps, so the gap is invisible to CI
   (it reports `TargetQueries: 0/3 ✅` for days 40–57).

---

## 2. Task validation — does a "right answer from another angle" pass?

### 2.1 What works (Days 1–38 baseline)
- **Dataset-first grading:** exact-result multiset compare (273 tasks), ordered only when
  `requireOrderBy`; construct rules are *advisory* unless `strictConstruct` (47 sites,
  justified per-task) — this is exactly the "multiple perspectives" fairness the repo
  promises.
- **528 automated SQL rewrites** (aliases, spacing, `IN` vs `OR`, CTE-wrapping…) pass with
  0 findings — proven approach-fairness *where applied*.
- **Mutations grade by final state** (129 tasks, sandbox replay) — wrong-row updates can't
  phantom-pass; retry idempotence asserted.
- Custom validators: 17/17 reachable/refutable/explainable.

### 2.2 Milestone 4 — ❌ the fairness machinery is not applied
- **`requireExactResult: 0` across all 81 M4 tasks** (273 exist elsewhere). The equivalence
  audit therefore tests **none** of M4: "can a differently-written correct answer pass?"
  is *unverified* for the entire milestone.
- **18 tasks break GRADING_POLICY Rule 1 right now** (days 41, 42, 51, 53, 54, 57 — single
  read-only SELECTs graded by `expectedRowCount` + regex construct checks only):
  - *False rejects:* row-count-only grading is the documented failure mode ("`IN` vs
    `OR`, aliasing, spacing"). E.g. a learner who returns the right rows plus one extra
    row, or who expresses the recursion differently, gets a canned "Check your
    WHERE/JOIN/LIMIT" message.
  - *False accepts:* `validation: { requireRecursive: true, expectedRowCount: 31 }` passes
    any 31-row recursion-shaped query — content is never compared to the reference.
- **6 tasks fail the real pipeline — the reference solution itself does not pass**
  (`day42-t2/t3/t4/ch1`, `day54-t2/t3`; feedback: *"returned 30 rows, but 4 expected"*).
  Root cause is two-part:
  1. `runAndGradeSubmission` resets on `fresh` **only when `isStateGraded(task)`** —
     i.e. mutation solutions. Read-only `fresh` tasks with `setupSql`-created tables never
     reset; correctness depends on `allowDdlOverwrite` re-CREATE side effects.
  2. The audit harness (`hooksFor` in `audit-grading-pipeline.ts`) builds `new SqlExecutor()`
     **without** `allowDdlOverwrite = true`, while the production provider
     (`SqlExecutorProvider.tsx`) sets it — so the gate's claim "identical to the provider's
     wiring" is currently false. Either the UI has the same latent state-pollution bug or
     the gate is a false alarm; **both readings require a fix**, and today CI cannot tell
     you which.
- **DDL under-declaration:** 32 advisory `missing-requiredColumns` findings, mostly M4
  (days 46, 47, 48, 49, 50, 54, 56, 57). Per GRADING_POLICY Rule 2, `requiredColumns` IS
  the DDL grade contract — without it the validator cannot name the missing column and the
  task degrades to "statement ran".
- **Prompt visibility:** `day41-t4` grades the literal `'1 day'` which never appears in the
  rendered prompt (Rule 6 violation → hidden requirement).
- **Spec drift:** `MILESTONE_4_PLAN` promises *Full Dual-Validator (MySQL/PostgreSQL)* and
  *`judgment[]` reasoning exercises*. Content reality: **`dialect:`/`variants:` used 0
  times**, **`judgment:` used 0 times** (the single grep hit is the English word in a
  day-47 description). DIALECT.md §9/§10 documents semantics nothing consumes. Reasoning
  grading falls back to plain MCQs (226 exist, ~1–3/day — present but not the designed
  `choose-and-defend` shape).

### 2.3 `primaryTable` / discoverability
- `verify:curriculum` flags `day50-t2/t3 → unknown primaryTable 'accounts'` while day-49's
  identical pattern passes — a checker inconsistency at minimum; at worst the schema
  panel/autocomplete points learners at a table that isn't in the seed. One-line
  investigation needed.
- `day42-ch1` declares `primaryTable: 'products'` although the task builds `employees` —
  wrong schema hint in the UI panel.

---

## 3. Phrasing audit (plain language, no jargon)

**Overall: good.** Sampled titles/descriptions/instructions across days 39–57 show the
plain-language house style ("When Two Transactions Collide", "Holding Your Spot", "Savepoint
= autosave checkpoint"), QUESTION_BLOCK recaps, and jargon introduced only after being
explained. `hint-progression` and `task-instructions` tests pass.

Concrete defects:
1. **`day41-t4`** — hidden enforced literal `'1 day'` (Rule 6; see §2.2).
2. **5 pre-M4 hidden-value/construct findings** (day 25 ×2 literals, day 27 CHECK/DEFAULT,
   day 31 CREATE INDEX) — same class, currently red.
3. **`instructions[]` pre-solve the task** in most M4 tasks (e.g. day 42 ch1 lists the
   anchor, the join key, and the exact SELECT). Discoverability-safe, but it converts
   "independent" tasks into transcription exercises — a pedagogy trade-off worth a
   deliberate policy (Level-1 hint should be the nudge; the answer belongs in Level 2).
4. Level-2 hints embed the **entire solution SQL** in many M4 tasks (accepted by the hint
   test because they don't restate instructions — but it makes hints a one-click solve).

---

## 4. Security audit

**No breach found.** Verified strengths:
- `role`/`status` are Better Auth `input: false` — never client-writable; every admin API
  calls `requireAdmin` (re-verified per request), `(admin)/layout.tsx` re-reads role+status
  from Mongo per navigation (revoked admins caught mid-session), admin pages `noindex`.
- `/api/me/progress` derives `userId` from the verified session only; blocked/deleted
  accounts rejected; JSON shape validated; epoch tombstone prevents reset-resurrection.
- `.env` is gitignored and **not tracked** (verified via `git ls-files`); working tree clean;
  `.env.example` contains placeholders only.
- XSS: `highlightSql` escapes `& < >` *before* tokenization; announcements render as React
  text children (no `dangerouslySetInnerHTML` on user/admin content); JSON-LD built with
  `JSON.stringify`.
- Mongo access uses the driver's parameterized API (no string-built queries); `server-only`
  guards keep `auth.ts`/`authorize.ts` off the client.
- SQL executes 100% client-side in-memory — **no server SQL surface to inject into**.

Findings (no breach, but hardening backlog):

| ID | Sev | Finding |
|---|---|---|
| S-1 | Med | **No rate limiting / lockout** anywhere (searched: zero matches). `/api/auth/*` (signup/signin) is brute-forceable; `PUT /api/me/progress` accepts unbounded writes per session. |
| S-2 | Med | **Grading & unlock are client-authoritative.** Any signed-in user can `PUT /api/me/progress` with forged completions (grading runs in the browser). Fine for self-paced learning; unacceptable if completions ever back a certificate/analytics. |
| S-3 | Med | **Dev knobs shipped:** `bypassDailyLock` / `simulatedTimeOffsetHours` remain in `UserLearningState` and the Header UI — any learner can defeat the daily unlock model (also flagged in the legacy AUDIT_REPORT, still open). |
| S-4 | Low | **No security headers** — `next.config.ts` is bare (no CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS); `vercel.json` adds none. |
| S-5 | Low | **No admin action audit trail** (user block/delete, announcement publish are not logged anywhere). |
| S-6 | Info | Better Auth Mongo adapter runs with `transaction: false` (documented upstream-bug workaround) — accepted risk, keep the comment. |
| S-7 | Info | No CSRF-specific hardening beyond framework defaults; better-auth ≥1.7.x is current/patched — keep it in `npm audit` CI if not already. |

---

## 5. Is the engine as capable as a real SQL editor for validation?

**Honesty layer — excellent.** The governing rule (*"either evaluate correctly or fail with
a NAMED error; never return a plausible-looking wrong answer"*) is enforced throughout:
unknown functions / ALTER forms / `JOIN USING` / FK actions error by name with DIALECT.md
pointers; literals/comments are masked before structural checks; recursion is depth-guarded
(100); `EXPLAIN` and `CREATE USER/GRANT/REVOKE` are explicitly **labeled simulations**
(`Simulated: …` status row, DIALECT §5/§6/§8); float compare uses documented 12-digit
tolerance. The validator also masks string literals and strips comments before every
keyword/construct check, so `'-- drop'` inside a literal can't satisfy a rule.

**Gaps vs. a real SQL editor / real DB:**

| Area | Reality in SQLens | Impact |
|---|---|---|
| Error **positions** | No line/column in parse errors; `editor-errors.ts` regex-scrapes message text (`near 'x'`) | Learner sees *what* failed, not *where* — longstanding backlog item (plan #5), still open |
| Diagnostics | Regex heuristics, not AST-based, plus autocomplete/schema checks | Misses semantically-wrong-but-parseable SQL (e.g. column from the wrong table) except where `requiredColumns` is declared — the M4 under-declaration in §2.2 amplifies this |
| Concurrency (days 49–50) | Single-threaded engine: `FOR UPDATE`, isolation levels, deadlocks, `SKIP LOCKED` cannot actually block/interleave — graded by script shape + final state | A learner can pass while misunderstanding the behavior; DIALECT honestly lists these as *concept/simulation* — the **tasks should be graded as reasoning (`judgment[]`)**, which brings us back to the unimplemented `judgment` field |
| `GRANT`/RLS (day 55) | Simulated, nothing persisted/enforced | Same: shape-graded only |
| Parser coverage | `JOIN … USING`, window frames, `ALTER … CONSTRAINT`, column-level `REFERENCES`, `CTAS` unsupported | Named errors (correct policy) — but learners coming from real editors hit walls lessons don't always foreshadow |
| Feature extraction | Validator's `collectQueryFeatures` is CTE/set-op-aware but still **textual regex** over masked SQL | Edge shapes (deeply nested derived tables, unusual aliasing) can evade construct rules — mitigated *only* where `requireExactResult` exists (absent in M4) |
| Reference DB | No real MySQL/Postgres execution anywhere | Dual-dialect claims (MySQL vs Postgres variants) are currently untestable end-to-end |

**Bottom line:** the engine is *honest* (better than most toy engines) but *narrower than a
real editor* in error positioning, semantic diagnostics, and true concurrency/privilege
execution — and M4 is precisely the milestone that leans on those three missing capabilities,
which is why its tasks ended up shape-graded.

---

## 6. Suggestion plan (prioritized)

### P0 — make CI green (1–2 days; fix the contract before adding content)
1. **Fix the 6 pipeline failures** (day42 ×4, day54 ×2): either
   (a) make `audit-grading-pipeline`'s `hooksFor` set `allowDdlOverwrite = true` to match
   `SqlExecutorProvider`, *after* confirming the UI path passes for these tasks, **or**
   (b) if the UI also fails, reset `fresh` read-only tasks too (change the reset condition
   in `runAndGradeSubmission` to fire whenever `databaseLifecycle === 'fresh'`, regardless
   of `isStateGraded`), then re-run the retry-idempotence assertions. Decide with one
   hand-probe in the browser on day 42 task 2.
2. **Rule 1 sweep:** add `requireExactResult: true` to the 18 flagged M4 read-only tasks
   (days 41, 42, 51, 53, 54, 57), then immediately run `audit:equivalence:tasks` — for the
   first time M4 enters the approach-fairness gauntlet; fix any rewrites it rejects.
3. **Rule 6 fix:** surface `'1 day'` / `'+1 day'` in `day41-t4`'s visible prompt; fix the
   5 pre-M4 hidden-literal/construct findings the same way.
4. **Day 50 `accounts` + `day42-ch1 primaryTable: 'products'`** — resolve the checker
   inconsistency and correct the wrong schema hint.

### P1 — make M4 validation multi-perspective (this sprint)
5. **State-grade or exact-grade every M4 task**: DML/DDL tasks get explicit
   `validation.requiredColumns` (clears the 32 advisories and gives named feedback);
   read-only tasks get `requireExactResult` (step 2). Target: M4 structural-only share
   drops from 100% to the Days 1–38 norm.
6. **Extend `scripts/audit-equivalence.ts` rewrite families** with M4 shapes:
   recursive-CTE reformulations (anchor/step spacing, `WHERE` placement), JSON path quoting
   variants, keyset-pagination predicate variants, view-creation formatting — so
   approach-fairness for these new construct classes is automated, not assumed.
7. **Implement `judgment[]` for the simulated constructs** (days 49, 50, 55 — plus the
   spec's per-day Judgment MCQs): a shape-graded `FOR UPDATE` script cannot prove
   understanding; a `predict-failure` / `diagnose-plan` exercise can. DIALECT §10 already
   defines the contract — wire `ValidationRule.judgment` into the grader and author the
   ~15 items the spec lists.
8. **Decide the dual-dialect story:** either populate `dialect`/`variants` where the spec
   promises them (days 43, 45, 52, 54 have real MySQL/Postgres deltas) **or** amend
   `MILESTONE_4_PLAN`/`DIALECT.md` §9 to declare deferred — the current state documents a
   feature nothing consumes.

### P2 — visualization pass for Days 39–57 (next content sprint)
9. **Wire existing visualizers first (cheap):**
   - `day-41/42` → `CtePipelineVisualizer` (add a recursive-iteration variant) or a new
     `RecursiveUnrollVisualizer` (anchor → step → termination trace; org-chart tree with
     walk-up/walk-down arrows).
   - `day-49/50` → `TransactionTimelineVisualizer` (two interleaved Alice/Bob lanes;
     anomaly callouts; wait-for cycle ring for deadlocks).
   - `day-52` → `BTreeIndexVisualizer` (composite = multi-key node compare; covering =
     "index-only" path).
   - `day-56` → `SchemaBlueprintVisualizer` (expand: old/new columns side-by-side →
     contract: drop).
   - `day-39/40` → keep `TABULAR_PROJECTION` but add the missing introTables.
10. **Fill the theory-element holes:** add `introTable` to every concept of days 49–57
    (currently zero) and backfill `targetQuery` + `stepBreakdowns` for at least the guided
    (T1) concept of each day — restore the master plan's "target query before steps"
    principle. Days 39–48 need introTables on concepts 2–3.
11. **Add `shouldSuppressTopIntroTable` entries** for any M4 day given a diagram
    archetype (keep the two lists in sync — see §1.2).
12. **New gate `audit:visual-coverage`:** fail CI when any module resolves to the
    universal fallback *and* lacks an `introTable`, or has `stepBreakdowns` without
    `targetQuery` — this closes the blind spot that let §1.2 through.

### P3 — security hardening (parallel, low-risk)
13. Rate-limit `/api/auth/*` and `PUT /api/me/progress` (Vercel WAF rule or an
    Upstash-style limiter keyed on IP+session; 429 with a friendly body).
14. Add security headers in `next.config.ts` (`X-Content-Type-Options: nosniff`,
    `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a
    conservative CSP allowing self + the inline theme script).
15. Gate `bypassDailyLock` / `simulatedTimeOffsetHours` behind `NODE_ENV === 'development'`
    (types stay; UI and merge logic ignore them in production).
16. Decide the integrity stance on S-2 (forged progress): cheapest honest option is to
    keep grading client-side but **exclude cloud progress from any future
    certificate/analytics claim**, and log admin mutations (S-5) to a Mongo `audit_log`
    collection.

### P4 — engine/editor parity (backlog)
17. Line/column positions in parser errors + gutter markers in `QueryEditor` (backlog #5).
18. Promote `editor-errors.ts` from regex to AST-walk using the existing `parseSql`
    output for semantic diagnostics ("column `price` does not exist in `orders` — did you
    mean `unit_price`?").
19. If MySQL/Postgres dual-dialect tasks stay in scope, add an **optional** CI job that
    replays `solutionSql` variants against real MySQL 8 / Postgres containers (test-only) —
    the only way to ever validate the `variants` layer for real.

### Exit criteria (re-audit checklist)
- `npm run audit:all` → **green** (all 10 gates).
- M4 census: `requireExactResult + state-graded == 81/81` (no structural-only read-only
  tasks); `missing-requiredColumns` advisories in days 39–57 → 0.
- `audit:equivalence:tasks` scope includes all 81 M4 tasks (was 0).
- Every M4 concept: introTable **or** dedicated archetype; ≥ 1 `targetQuery`+steps per day.
- Rate-limit + security headers live; dev knobs inert in production.

---

## P0 Execution Log (2026-09-23) — all items done, all gates green

### 1. Pipeline failures (6) — fixed at two roots
- **`src/lib/sql-engine/submit-pipeline.ts`** — `fresh` reset no longer gated on
  `isStateGraded(task)`. Read-only `fresh` tasks now replay from seed exactly like
  `tests/content/solution-sql.test.ts` always did. Kills the Day 42/54 ladder-pollution
  class (30-rows-where-4-expected).
- **`scripts/audit-grading-pipeline.ts`** — harness now sets `allowDdlOverwrite = true`,
  matching `SqlExecutorProvider`, so the gate's "identical wiring" claim is true again.
- **Root cause found while fixing:** the multi-statement runner stored the first failure
  in `last` behind `if (!last)`, so any later successful statement overwrote it — *every*
  script error except one in statement position 1 was silently swallowed (the shipped
  `day45-t3` "query succeeded" defect). Fixed with a dedicated `firstError` slot that is
  always surfaced (Batch-A contract unchanged).

### 2. Rule 1 sweep (18 tasks) — `requireExactResult: true` added
days 41 (t1–t4, ch1), 42 (t2–t4, ch1), 51 (t1, t3), 53 (t1–t3, ch1), 54 (t2, t3),
57 (t3). `audit:equivalence:tasks` now grades **291** tasks (was 273) — first time the
M4 tasks enter the rewrite/approach-fairness gauntlet: **0 findings**.

### 3. Rule 6 / taught-before-tested (6 findings) — prompts now state every graded value
- `day41-t4` instructions name the `'+1 day'` step expression.
- `day19-c1-t1` names the reference tuple (`Ultra Wireless Mouse`, …);
  `day19-c1-t2` names `Sultana Begum` / `sultana@example.com` / `Dhaka` / `2026-08-25`.
- `day27-hw-1` instructions spell `CHECK (rating BETWEEN 1 AND 5)` and
  `DATETIME DEFAULT CURRENT_TIMESTAMP` literally (challenge self-contained exemption).
- `perf-c2-t2` instructions spell `CREATE INDEX idx_products_supplier ON …` literally
  (lesson forward-reference exemption).

### 4. `day45-t3` expectFailure lab — fixed end-to-end
- **Engine:** `executeUpdate` now validates every candidate row against the same
  constraint set as INSERT (CHECK / NOT NULL / UNIQUE / FK), two-pass all-or-nothing —
  Day-28 theory's "the engine evaluates [CHECK] on INSERT **and UPDATE**" is finally true.
  Also `SET col = NULL` now evaluates to NULL (named NOT NULL error, not a predicate error).
- **Content:** description copy corrected (said "authors/author_id" for an accounts lab);
  column-list INSERTs added to instructions/initialSql/solutionSql (engine dialect
  requires `(cols)` per DIALECT.md §5).

### 5. Discoverability / schema-hint fixes
- `verify-curriculum` now scans `setupSql` (string **and** array) for CREATE/DROP TABLE →
  Day 50 `primaryTable 'accounts'` false positive gone; `verify:curriculum` 100% clean.
- All 5 Day-42 tasks: `primaryTable` `'products'` → `'employees'` (the table the tasks
  actually build/query).

### 6. Discovered & fixed along the way (beyond the original P0 list)
- **12 broken column-less `INSERT`s** in shipped content (liveDemoSql on days 42/49/50,
  day-45 instructions/solution, day-50 instruction) — the engine rejects
  `INSERT INTO t VALUES (…)` by design, so those live demos errored for learners while
  no CI gate executed them. All now use explicit column lists; `README.md` example fixed.
- **`day40-ch2` solutionSql** began with a plain `CREATE VIEW` that always errors in the
  inherited ladder — it had only "passed" because of the swallow bug. Solution is now the
  `CREATE OR REPLACE VIEW` statement alone (works with or without the view present).
- **`test:module-order`** still asserted the pre-M4 **38-day** curriculum (6 failures,
  CI red before this pass). Updated to the real **57-module** contract.

### 7. New regression tests (+7 → 622)
- `tests/engine/ddl-constraints.test.ts` — UPDATE enforces CHECK, NOT NULL, UNIQUE;
  violating multi-row UPDATE is all-or-nothing; valid UPDATE still applies.
- `tests/engine/scripts.test.ts` — mid-script error after a success is surfaced; the
  exact `day45-t3` shape reports `CHECK constraint violated`.

### 8. Final verification (full CI parity)
`lint` 0 · `npm test` **622/622** · `test:engine` 46/46 · `test:module-order` ✅ ·
`test:db-lifecycle` 34/34 · `verify:curriculum` **100% clean** ·
`audit-all-tasks` **424/424** · `audit:all` **10/10 gates green**
(grading-pipeline 0, grading-policy 0, taught-before-tested 0, equivalence:tasks 291/0) ·
`npm run build` ✅. Changed files: 21 modified + this report.

**Not in P0 (tracked):** 32 DDL `requiredColumns` advisories (P1.5), `stepBreakdowns`/
`introTable` visualization backfill (P2), rate limiting & security headers (P3).

---

## P1 Execution Log (2026-09-23) — all four items done, all gates green

### 1. DDL column contracts — 32 advisories → 0
- `validation.requiredColumns` added to **23 tasks** (days 33, 36, 42, 45, 46 ×3,
  47, 48, 49 ×2, 50 ×2, 54 ×2, 56 ×3, 57) with exactly the columns the audit
  prescribed, so the validator can now name a missing column instead of shrugging.
- Day-33 `cap-ch-t1` instructions now spell out the full `books (...)` and
  `sales (...)` column lists — the9 `missing-column-in-prompt` findings are gone.
- `audit:ddl-contracts`: blocking **0**, advisory **0** (was 32).

### 2. Equivalence rewrite families — 528 → 866 rewrites
- Six new families in `scripts/audit-equivalence.ts`: leading comment + trailing
  semicolon; `BETWEEN → >= AND <=`; `COALESCE ↔ IFNULL`; integer cursor step
  (keyset `col > n → col >= n+1`); JSON quoted segments (`'$.a' → '$."a"'`);
  JSON bracket form (`'$.a' → '$["a"]'`).
- New row-equality guard on the fairness path: a "form" rewrite whose dataset
  differs was never a form rewrite — it is counted (`skipped-non-equivalent=5`),
  never a false-reject; engine-side equivalence stays owned by
  `tests/engine/equivalence.test.ts`.
- **Engine fix the families forced:** `JSON_EXTRACT` now resolves MySQL-legal
  quoted/bracket paths. Previously `$."theme"` silently returned NULL (probe:
  `{"v":null}`) where MySQL returns the value — a plausible-looking wrong answer.
- Result: **291 tasks / 866 rewrites / 0 findings**.

### 3. `judgment[]` — reasoning graded end-to-end (DIALECT §10 implemented)
- Type lives on `ValidationRule` (where the validator can gate on it);
  `PracticeTask.dialect/matchPolicy/variants` untouched.
- `validateTaskSolution(..., judgmentAnswers)` — **last gate**: SQL verdict first,
  then unanswered → fail with the question, wrong pick → fail with the authored
  explanation (reachable, refutable, explainable — pinned by tests).
- `SubmitOptions.judgmentAnswers` threaded through `runAndGradeSubmission` /
  `gradeSubmission`.
- **UI:** new `JudgmentBlock` component (`Reasoning Check` option buttons),
  state + task-switch reset + pass-through wired into `PracticeTaskView` and
  `IndependentChallengeView`.
- **Reference callers submit perfect answers:** audit-all-tasks,
  audit-equivalence, audit-grading-pipeline, audit-custom-validators,
  solution-sql test — CI grades reasoning exactly like a perfect learner.
- **14 items authored** (days 39, 41, 43, 46–51, 53–57): the spec's Judgment
  MCQs plus the simulated-concept days 49/50/55 where shape-graded SQL cannot
  prove understanding.
- New `tests/content/judgment.test.ts`: content contract (well-formed, required
  days present) + gate behavior (pass / wrong answer / missing answer /
  SQL-failure-before-judgment).

### 4. Dual-dialect decision — DEFERRED, docs now honest
- `docs/DIALECT.md` §9 carries **SPEC — NOT IMPLEMENTED** with the
  reference-DB-CI precondition (P4.19).
- `docs/MILESTONE_4_PLAN.md` gained a directive-status block: Directive 2
  (`judgment[]`) DONE, Directive 3 (two-engine validator) DEFERRED.

### P1-discovered — queued as P2 (NOT fixed in this batch)
- **Engine silent-NULL on unknown columns:** `SELECT no_such_column FROM
  products` succeeds with all-NULL rows and `WHERE no_such_col = 5` succeeds
  with `[]`, where MySQL names both errors — violates the governing "never a
  plausible-looking wrong answer" rule. Partially mitigated today by the
  editor's live column diagnostics (`editor-errors.ts`). Fix queued: named
  error at projection and WHERE resolution for bare identifiers absent from the
  row/schema, with the full battery as the safety net.

### Final verification (full CI parity)
`lint` 0 · `npm test` **628/628** (54 files) · `test:engine` 46/46 ·
`test:module-order` ✅ · `test:db-lifecycle` 34/34 · `verify:curriculum`
**100% clean** · `audit-all-tasks` **424/424** · `audit:all` **10/10 green**
(equivalence:tasks 291/866/0 · grading-pipeline 0 · grading-policy 0 ·
taught-before-tested 0 · custom-validators 0 · **ddl-contracts 0/0**) ·
`npm run build` ✅.

---

*Generated by the Milestone 4 audit, 2026-09-23 (P0 executed same day; P1 executed same day). Evidence: every
gate run listed in §0 plus greps over `src/content/modules/day-{39..57}-*.ts`,
`ConceptMentalModel.tsx`, `submit-pipeline.ts`, and all of `src/app/api`.*


