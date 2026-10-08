# SQL Validator & Curriculum Overhaul Tracker

> Living tracker for the comprehensive SQL validation engine hardening, multiple right answers support, and prompt-to-solution alignment across all 57 SQL modules (424 tasks).

---

## Progress Overview

| Phase | Description | Status | Commit Checkpoint |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Docs Archiving & Audit Baseline** | 🟢 Complete | `chore(docs): archive completed plans and trackers` |
| **Phase 1** | **Validator Engine Hardening & Bug Fixes** | 🟢 Complete | `feat(sql-validator): harden validator rules, fix DDL feedback and rowKey collision` |
| **Phase 2** | **Curriculum Prompt & Solution Alignment** | 🟢 Complete | `fix(sql-content): align task prompts with solutions and eliminate ghost requirements` |
| **Phase 3** | **Automated Quality Gate & Policy Update** | 🟢 Complete | `feat(audit): add sql prompt contract gate and update grading policy` |
| **Phase 4** | **Full Verification & CI Sign-Off** | 🟢 Complete | `chore: complete sql validator and curriculum overhaul audit` |

---

## Detailed Task Breakdown

### Phase 1: Validator Engine Hardening & Bug Fixes
- [x] **Task 1.1: Add Native DDL/Procedural Construct Rules in `ValidationRule`**
  - Add `requireWithCheckOption?: boolean`
  - Add `requireOrReplace?: boolean`
  - Add `requireDropObject?: 'FUNCTION' | 'PROCEDURE' | 'TRIGGER' | 'VIEW' | 'TABLE'`
  - Update `validator.ts` to check these with friendly, specific feedback messages.
- [x] **Task 1.2: Migrate Misused `whereContainsTerms` in Days 40, 43, 44, 46**
  - Day 40 tasks (`day40-t1`, `day40-t2`, `day40-t3`, `day40-t4`, `day40-ch1`, `day40-ch2`): switch to `requireWithCheckOption` and `requireOrReplace`.
  - Day 43 (`day43-t3`): switch to `requireDropObject: 'FUNCTION'`.
  - Day 44 (`day44-t3`): switch to `requireDropObject: 'PROCEDURE'`.
  - Day 46 (`day46-t3`): switch to `requireDropObject: 'TRIGGER'`.
  - *Verify*: No task in curriculum uses `whereContainsTerms` for non-filter DDL.
- [x] **Task 1.3: Fix `rowKey` Multiset Inversion Bug in `validator.ts`**
  - Replace cell-only sorting with canonical column-value pairing or normalized schema keys so inverted columns (e.g. swapping `winner` and `loser`) do not falsely pass.
- [x] **Task 1.4: Enhanced Column Count & Projection Diagnostics**
  - When returned column count differs from expected, output actionable guidance showing expected column names vs received columns.
- **Commit Checkpoint 1**: `feat(sql-validator): harden validator rules, fix DDL feedback and rowKey collision`

---

### Phase 2: Curriculum Prompt & Solution Alignment
- [x] **Task 2.1: Fix Identified Ghost Projections**
  - `sec-c1-t2` (Day 32): add explicit SELECT column instruction (`customer_id, name, email`).
  - `case-order-t1` (Day 10): explicitly instruct selecting `name, price, price_tier`.
  - `sec-c2-t2` (Day 32): explicitly specify columns `customer_id, name`.
- [x] **Task 2.2: Fix Unprompted Required Sorts**
  - `norm-c3-t2` (Day 30): update prompt instruction to explicitly state "Sort by student_count descending".
- [x] **Task 2.3: Hidden Tie-Breakers Audit & Remediation**
  - Verified: all tasks with ORDER BY and LIMIT have deterministic tie-breakers matching instruction prompts.
- [x] **Task 2.4: Explicit Alias Audit**
  - Verified: all required aliases are explicitly mentioned in prompt instructions in backticks.
- **Commit Checkpoint 2**: `fix(sql-content): align task prompts with solutions and eliminate ghost requirements`

---

### Phase 3: Automated Quality Gate & Policy Update
- [x] **Task 3.1: Create `scripts/audit-sql-prompt-contract.ts`**
  - Checks all 424 tasks in the curriculum for prompt-to-solution contract adherence:
    - Explicit projection columns
    - Explicit sort requirements
    - Explicit alias references
    - Prohibits DDL hijacking in `whereContainsTerms`
- [x] **Task 3.2: Wire into `package.json` and CI Chain**
  - Added script `audit:sql-prompt-contract`
  - Included in `npm run audit:all`
- [x] **Task 3.3: Update `docs/sql/GRADING_POLICY.md`**
  - Codified Rule 8 (Prompt-to-Solution Alignment Contract).
- **Commit Checkpoint 3**: `feat(audit): add sql prompt contract gate and update grading policy`

---

### Phase 4: Full Verification & Sign-Off
- [x] **Task 4.1: Run Full Audit Suite**
  - `npm run verify:curriculum` (57 modules, 161 concepts, 424 tasks — 100% pass)
  - `npm run audit:all` (all 14 audit gates green: equivalence, overlap, keyword-case, grading-pipeline, grading-policy, taught-before-tested, custom-validators, ddl-contracts, visual-coverage, sql-prompt-contract)
  - `npm run test:engine` & Vitest engine suite (24 files, 302 engine tests passed)
- [x] **Task 4.2: Final Walkthrough Documentation**
  - Document all findings, fixes, and architectural improvements.
- **Commit Checkpoint 4**: `chore: complete sql validator and curriculum overhaul audit`
