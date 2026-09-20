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

## The five rules

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

## Task-author checklist

1. Single read-only query? → `requireExactResult: true`.
2. Mutation/DDL? → it grades by final state automatically; make sure your
   `solutionSql` is the canonical way to reach that state.
3. Requiring a keyword? → leave `strictConstruct` OFF unless the keyword IS the
   lesson; if ON, keep `requireExactResult: true`.
4. Teaching a TYPE (`verifyColumnTypes`)? → only for DDL type lessons.
5. `fresh` mutation? → the pipeline resets before grading; your solution must
   pass from seed every time.
6. Run `npm run audit:grading-pipeline && npm run audit:grading-policy` before
   pushing. Both must be green.
