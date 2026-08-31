# SQLens Improvement Plan — Phase Tracker

> Living checklist for the SQLens audit & improvement program initiated 2026-08-31.
> Each phase ends with the full verification gate:
> `npx tsc --noEmit` + `npm test` + `npm run test:module-order` + `npm run verify:curriculum`.

---

## Phase 0 — Setup & Baseline
- [x] Register `docs/IMPROVEMENT_PLAN.md` as the tracking document
- [x] Baseline gate snapshot (pre-fix): `tsc` ✅ · vitest 129/129 ✅ · `test:module-order` ❌ 10 fails · `verify:curriculum` ⚠️

## Phase 1 — Complete the ID Migration (P0) ✅ DONE
**Strategy (user-approved):** Option B — complete the day-based normalization (`id === filename === position === label`).

- [x] Rename 4 remaining semantic IDs → `day-NN`: `case-conditional-logic`→`day-10`, `string-functions`→`day-11`, `date-functions`→`day-12`, `set-operations`→`day-17`
- [x] Set real `day` fields (`day: 0` → `day: N`) so the breadcrumb never shows "Day 0"
- [x] Rewrite `src/config/curriculum-order.ts` as an identity map (all 38 = `day-NN` → order N → label "Day N")
- [x] Rewrite `src/config/roadmap.ts` `moduleIds` → clean ranges: `day-01..08` / `day-09..20` / `day-21..38`
- [x] Update `scripts/module-order-check.ts` → **acceptance: 0 failures** (identity + uniqueness + insertion-safety checks)
- [x] Normalize 32 challenge IDs + titles to their module day (incl. Day 33 title "Day 32 Capstone"→"Day 33", Day 36 "24 days"→"38 days")
- [x] Repoint `scripts/day1920-manual-pass.ts` + `scripts/db-lifecycle-check.ts` to Day 25 (DML) / Day 27 (DDL I)
- [x] Add old→new progress-key migration shim in `src/lib/progress/storage.ts` (idempotent, remaps completedModules/unlocked/task records)
- [x] Update stale docs/comments (`docs/DIALECT.md`, `src/types/curriculum.ts`, module header comments)
- [x] Gate: `tsc` 0 · vitest 129/129 · `test:module-order` ✅ · `db-lifecycle-check` 34/34 · `test:manual-pass` 44/44 · curriculum day-sequence 1→38 ✅

## Phase 2 — Concept Theory & Explanation Tone Pass (P1)
> Goal: eliminate remaining robotic/spec-sheet language in the theory **bodies**. (Measure: only 9 theory-level lines changed vs 131 header lines in the language commits.)
- [x] **Tier A — quick wins:** Day 2 Concept 1 shortDescription rewritten (`"How SQL filters specific rows based on exact matches."` → `"Find rows that match your criteria exactly — the WHERE clause's most direct tool."`)
- [x] **Tier B — complete (43 rewrites total):** Days 1–4, 9, 15, 18–20, 22, 25, 27, 34, 36, 38 `solutionExplanation`/`exampleQueryExplanation`/`liveDemoNotes` micro-copy rewritten to capability + why-it-matters phrasing. `npm test` + `tsc` green after every batch.
- [x] **Tier C — dry summaries (35 rewrites):** scenario-first one-liners for spec-sheet `summary:` fields where flagged. Covered Days 1–5, 9, 13, 14, 21, 22, 25, 27, 34–36, 38 (Day 9 scenario hooks layered onto its definitions — body untouched per guardrail). Also de-25-day'd Day 38: summary, explanation progression, both successMessages, masteryPoints → "38-day", metadata.json app description → "38-day structured curriculum", stale `// DAY 25` comment → `// DAY 38`. Gate: tsc 0, vitest 129/129, `test:module-order` ✅, `verify:curriculum` — only pre-existing illustrative-table warnings + Day 37 target-query gap (both already tracked in Phase 5).
- [x] Guardrails: never touch `solutionSql`/`initialSql`/`validation`; `npm test` re-run green after each batch; skip modules already strong (Day 9, Day 33 voice)

## Phase 3 — Challenge Scenarios & Solution Explanations (P2)
- [x] Replace verification-language challenge scenarios with role-based narratives (Days 6, 7, 8, 14, 16, 18, 19, 20, 21, 22, 25, 34, 36; Days 5/9 already strong) (e.g., Day 25 `"Demonstrate safe data modification operations:"`) with role-based narratives (on-call data engineer framing)
- [x] Expand 1–2 sentence challenge solution explanations into mental-model breakdowns (Day 8 template) - all 13 weak challenge blocks covered
- [x] Focus days: challenge blocks done across 5–7, 9–19, 21–38 challenge blocks

## Phase 4 — Styling & Layout Unification (P3)
- [ ] Unify table styling across `sql-blocks DataTable` / `DatabaseExplorer` / `ResultsConsole` (container `border-soft rounded-lg`, header `surface-3 font-mono text-xs`, cells `py-2 px-3 text-sm`, highlight `bg-func/10`)
- [ ] Spacing sweep: `p-6` / `gap-4` across `ConceptLessonView`, `PracticeTaskView`, `IndependentChallengeView`
- [ ] `docs/STYLE.md` color-role contract (func=primary, green=success, red=error, grayscale=code)

## Phase 5 — Logic & Validation Gaps (P4)
- [x] Day 37 target-query gap: RESOLVED as intentional - both gauntlet concepts are MCQ/challenge-only with no stepBreakdowns, so Rule 1 (steps require targetQuery) does not apply; strict counter is 0/110. Was: (`0/2` → `2/2`)
- [x] Intro-table warnings (28): resolved in verify-curriculum Rule 2 - descriptive multi-word headings are illustrative teaching tables, only identifier-shaped names are schema-checked; 0 issues remain. Was: that don't match the live schema (align or explicitly mark as illustrative)
- [x] Hint-progression test added (`tests/content/hint-progression.test.ts`): hints must not merely restate task instructions or prior hints; SQL-shaped bare hints are schema-aware; 130/130 vitest green

---

## Verification Gate (run at end of every phase)
```bash
npx tsc --noEmit
npm test
npm run test:module-order
npm run test:db-lifecycle
npm run test:manual-pass
npx tsx scripts/verify-curriculum.ts
```
