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
- [ ] **Tier C — dry summaries:** scenario-first one-liners for spec-sheet `summary:` fields where flagged
- [x] Guardrails: never touch `solutionSql`/`initialSql`/`validation`; `npm test` re-run green after each batch; skip modules already strong (Day 9, Day 33 voice)

## Phase 3 — Challenge Scenarios & Solution Explanations (P2)
- [ ] Replace verification-language challenge scenarios (e.g., Day 25 `"Demonstrate safe data modification operations:"`) with role-based narratives (on-call data engineer framing)
- [ ] Expand 1–2 sentence solution explanations into clause-breakdown + "Why this works" (Day 8 template)
- [ ] Focus days: 5–7, 9–19, 21–38 challenge blocks

## Phase 4 — Styling & Layout Unification (P3)
- [ ] Unify table styling across `sql-blocks DataTable` / `DatabaseExplorer` / `ResultsConsole` (container `border-soft rounded-lg`, header `surface-3 font-mono text-xs`, cells `py-2 px-3 text-sm`, highlight `bg-func/10`)
- [ ] Spacing sweep: `p-6` / `gap-4` across `ConceptLessonView`, `PracticeTaskView`, `IndependentChallengeView`
- [ ] `docs/STYLE.md` color-role contract (func=primary, green=success, red=error, grayscale=code)

## Phase 5 — Logic & Validation Gaps (P4)
- [ ] Day 37: author the 2 missing concept target queries (`0/2` → `2/2`)
- [ ] Resolve the ~19 warning intro-tables that don't match the live schema (align or explicitly mark as illustrative)
- [ ] Add a hint-progression test (hints must not merely restate the instructions)

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