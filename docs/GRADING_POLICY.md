# SQLens Grading Policy (the contract every task must satisfy)

> Living contract for the grading program. `scripts/audit-grading-policy.ts`
> enforces every rule below in CI (`npm run audit:grading-policy`). If you add a
> task that violates one of these rules, the build fails — fix the task, not the
> enforcer.

This exists because of a shipped bug: a correct INSERT reported
`expected 32, found 31` and the learner could never unlock Next. The old audit
(`audit-all-tasks.ts`) only replayed the *validate* half of a submit, so
"343/343 passed" could not see it. The policy below pins the *full* user-visible
contract — validator + final-state comparison — and the enforcer runs every task
through the SAME `runAndGradeSubmission` pipeline the UI runs.

## The seven rules

### Rule 1 — Exact-result coverage
Every task whose `solutionSql` is a single read-only query MUST set
`requireExactResult: true`, so grading compares the learner's dataset against
the reference output (multiset of row-values; ordered when `requireOrderBy` is
set). Row-count-only grading is how equivalent-but-correct SQL (`IN` vs `OR`,
aliasing, spacing) gets rejected.

- Enforcement: `isReadOnlySelect(task.solutionSql) && !expectFailure` implies
  `requireExactResult === true`.
- Exempt: `expectFailure` labs (the query must ERROR — there is no dataset to
  compare), multi-statement scripts, mutations/DDL (graded by Rule 2).

### Rule 2 — Mutations grade by final state
Every INSERT/UPDATE/DELETE/DDL task is graded by `gradeFinalState`: the
solution replays on a sandbox clone of the pre-state and the learner's
post-state must match (same tables, same columns, same row multisets). An
UPDATE on the wrong row reports the same `affectedRows` as the right one — only
the state comparison can tell them apart.

- Enforcement: `isStateGraded(task)` tasks must reach `stateOk === true`
  through the real pipeline (this is the PHANTOM_PASS check in
  `audit-grading-pipeline.ts`, referenced here as the sibling gate).
- Reference solutions that fail to run are `INCONCLUSIVE`: the learner still
  passes, but CI fails. A silently-passing broken task is an authoring bug that
  never gets fixed.
- DDL precision (Workstream E): for CREATE/ALTER tasks the SCHEMA is the grade
  — `validation.requiredColumns` (validator stage) plus the final-state
  column-name diff (and type kinds under `verifyColumnTypes`) decide
  pass/fail. `expectedRowCount: 1` on a DDL task only confirms the statement
  ran and affected one object — it can never carry correctness alone. The
  interactive sandbox's `allowDdlOverwrite` re-create path says so explicitly
  in the result row (`already existed — dropped and re-created for retry`), so
  leniency is never mistaken for legal SQL.

### Rule 3 — Dataset decides, construct advises
When the learner's dataset is identical to the reference solution's, construct
rules (`requireJoin`, `requireLimit`, `requireDistinct`, `requireWhere`, …)
become ADVISORY notes, not failures. The answer is correct by definition; the
keyword requirement is a hint about style, not a veto on truth.

- Enforcement: `strictConstruct: true` is allowed ONLY on tasks where the
  construct itself is the deliverable (e.g. "use JOIN, not a comma join";
  "use UNION ALL, not UNION"). A `strictConstruct` task MUST also set
  `requireExactResult: true` — strictness without a dataset to be strict about
  is a contradiction.
- Census (2026-09-20): `strictConstruct` appears only on Days 4, 9, 10, 12, 14,
  17, 32 — the construct-teaching days. If you add one elsewhere, the enforcer
  asks you to justify it in the task comment.

### Rule 4 — Type comparison is opt-in
Final-state comparison matches column NAMES, never declared TYPES, unless the
task sets `verifyColumnTypes: true`. Legal variations (VARCHAR(100) vs
VARCHAR(200), DECIMAL vs FLOAT) must not fail a correct solution.

- Enforcement: `verifyColumnTypes: true` is allowed ONLY on tasks where the
  declared type is the learning objective (DDL type-teaching tasks).

### Rule 5 — Retry idempotence (`fresh` tasks)
A `fresh`-lifecycle mutation task must pass on attempt 1 AND attempt N with an
identical post-state. The shipped regression: retries stacked mutations
(28→29→30→31) so every grader message went off-by-one and the learner was stuck
on `Try Again` with a correct query. The pipeline resets `fresh` tasks BEFORE
the pre-state snapshot; the enforcer re-submits the solution against a dirty
executor and demands the same verdict and the same row counts.

### Rule 6 — Taught before tested
Every construct a task's `solutionSql` uses must be SHOWN in theory code
(target query, step snippets, syntax blocks, worked examples, live demos,
fenced SQL, inline `code` spans — never bare prose) by the task's own or an
earlier concept; and every value the grader enforces must appear in the
RENDERED prompt (title/description/instructions/scenario — never hints behind
"Need help?"). Motivating bugs: Day 26 `tx-c1-t2`/`tx-hw-2` required multi-row
`VALUES (...), (...)` no earlier theory teaches; `tx-c1-t1` graded
`'Flash Sale Mouse', ...` while the visible prompt said "one flash-sale
product".

- Enforcement: `npm run audit:taught-before-tested` (Batch 2 gate). Lesson
  tasks must be taught strictly before use; challenge tasks are exempt from
  the construct half ONLY when the construct is taught later in the same-or-
  later module AND the task's own rendered prompt spells out the exact
  statement (self-contained). The literal half applies to every task
  (`expectFailure` labs exempt — their invalid values are the point).

### Rule 7 — Grading predicates are reachable, refutable, explainable, discoverable
A `validation.customValidator` is CODE, not data: nothing type-checks it, nothing
renders it, and no earlier rule can see it. It MUST therefore satisfy all four:

1. **Reachable** — the predicate actually runs. It must not sit on an
   `expectFailure` lab (rule 14 of the validator is unreachable there, so the
   predicate is dead code wearing a requirement), and its task's reference
   solution must reach rule 14 in true ladder order.
2. **Refutable** — it has at least one failing path (`valid: false` /
   `return false`). A predicate that can only return `true` grades nothing.
3. **Explainable** — every failing path supplies an engine-readable `message`.
   `feedback:` and friends are NOT read by rule 14; the learner then sees only
   the generic "does not match all required criteria" sentence. Motivating bug:
   Day 1 `sel-hw-2` (alias guidance hidden behind `feedback:`).
4. **Discoverable** — every value it keys off is either a schema identifier, a
   SQL syntax token, or present in the RENDERED prompt. A hidden value makes a
   correct-looking answer impossible to reach — the Day-26 `tx-c1-t1` class,
   transplanted from data into code.

- Enforcement: `npm run audit:custom-validators` (Batch 5 gate). Static half
  reads `fn.toString()` and classifies `always-valid` / `unreachable` /
  `silent-failure` / `ghost-value` / `no-solution`. Behavioural half replays each
  affected module as a **ladder** (concepts then challenge, one session executor
  per module — identical to `audit-grading-pipeline.ts`, so the two gates cannot
  disagree) and asserts the predicate was invoked and did not reject the task's
  own `solutionSql`. Ladder fidelity is load-bearing: probing an `inherit` task
  on a bare executor makes its own reference solution ERROR and reports a
  false "dead code" finding.

## Task-author checklist

1. Single read-only query? → `requireExactResult: true`.
2. Mutation/DDL? → it grades by final state automatically; make sure your
   `solutionSql` is the canonical way to reach that state.
3. Requiring a keyword? → leave `strictConstruct` OFF unless the keyword IS the
   lesson; if ON, keep `requireExactResult: true`.
4. Teaching a TYPE (`verifyColumnTypes`)? → only for DDL type lessons.
5. `fresh` mutation? → the pipeline resets before grading; your solution must
   pass from seed every time.
6. Writing a `customValidator`? → give every failing path a `message`, and key
   only off values the rendered prompt shows (Rule 7).
7. Run `npm run audit:grading-pipeline && npm run audit:grading-policy && npm run audit:taught-before-tested && npm run audit:custom-validators` before pushing. All four must be green.

## Grading integrity vs. cloud progress (Milestone 4, S-2)

Self-graded labs are a deliberate scope decision: this is a learning tool, not
a credentialing system. The policy above keeps lab feedback honest *within the
client* (deterministic engine, re-runnable reference solutions, validators that
must pass the task's own `solutionSql`). The one integrity boundary to state
explicitly:

- **Cloud progress (`user_progress`) never backs a certificate, badge,
  analytics claim, or leaderboard.** It is a convenience sync of learner-owned
  state — written by the same client that could edit it in DevTools — and is
  treated as such everywhere it is read.
- **S-5 stance (admin `audit_log` — recommended by this audit, not yet
  implemented):** if/when added, it must record **admin mutations only** (who
  changed availability/announcements/roles), so operator actions are
  attributable. It is not — and must not become — a record of learner mastery.
- If certificate/credential features are ever added, they must re-grade
  server-side (replaying tasks through the same engine) rather than trusting
  stored progress flags. No such feature exists today; nothing in the current
  codebase may be read as implying one.
- Developer time knobs (`bypassDailyLock`, `simulatedTimeOffsetHours`) are
  inert outside `next dev` (enforced by `devKnobsEnabled()`), so they cannot
  distort unlock state in production either.
