# SQLens Documentation Archive Index

This directory archives historical audit reports, curriculum specifications, engineering plans, and migration trackers across the lifecycle of SQLens and PrismaLens.

All documents are organized into three primary categories below.

---

## 1. Audits & Validation Baselines (`audits/`)

Reports, audit trackers, and validation baselines verifying grading integrity, SQL equivalence, DDL contracts, and engine performance.

| Document | Description |
|---|---|
| [AUDIT_REPORT.md](audits/AUDIT_REPORT.md) | Full Website Performance & Maintenance Audit Report (baseline from original 25-day curriculum). |
| [task-equivalence-report.md](audits/task-equivalence-report.md) | Robustness audit investigating whether valid alternative user solutions pass across all 341 tasks. |
| [task-equivalence-audit-fail.txt](audits/task-equivalence-audit-fail.txt) | Raw error tracking log from task equivalence audit runs. |
| [DDL_AUDIT_TRACKER.md](audits/DDL_AUDIT_TRACKER.md) | Comprehensive audit tracker for DDL validation contracts and test fixtures. |
| [MILESTONE_4_AUDIT.md](audits/MILESTONE_4_AUDIT.md) | Milestone 4 audit report covering Days 39–57 advanced SQL topics. |
| [P2_GATE_BASELINE.txt](audits/P2_GATE_BASELINE.txt) | Baseline gate snapshot for Phase 2 validation runs. |
| [VALIDATION_AUDIT_PLAN.md](audits/VALIDATION_AUDIT_PLAN.md) | Audit plan for verifying task rubrics and validation consistency. |

---

## 2. Curriculum Specifications & Master Plans (`specs-and-curriculum/`)

Foundational pedagogy guides, specifications, and architecture blueprints for SQL and Prisma curricula.

| Document | Description |
|---|---|
| [curriculum_master_plan.md](specs-and-curriculum/curriculum_master_plan.md) | SQLens Curriculum Quality & Teaching Architecture Master Plan (pedagogical guidelines, voice & tone, lesson structure). |
| [PRISMA_LEARNING_PLATFORM_SPECIFICATION.md](specs-and-curriculum/PRISMA_LEARNING_PLATFORM_SPECIFICATION.md) | PrismaLens complete engineering specification & 14-day curriculum blueprint. |
| [MILESTONE_4_CURRICULUM_SPEC.md](specs-and-curriculum/MILESTONE_4_CURRICULUM_SPEC.md) | Detailed curriculum specification for Milestone 4 (advanced SQL topics, window functions, recursion, stored procedures). |
| [MILESTONE_4_PLAN.md](specs-and-curriculum/MILESTONE_4_PLAN.md) | Implementation roadmap for Milestone 4 curriculum modules. |
| [PRISMA_CURRICULUM_IMPLEMENTATION_PLAN.md](specs-and-curriculum/PRISMA_CURRICULUM_IMPLEMENTATION_PLAN.md) | Implementation blueprint for the 14-day Prisma ORM track. |
| [PRISMA_CURRICULUM_REDESIGN_PLAN_v2.md](specs-and-curriculum/PRISMA_CURRICULUM_REDESIGN_PLAN_v2.md) | Revised pedagogy and task structure plan for Prisma lessons. |
| [PRISMA_CURRICULUM_REVIEW.md](specs-and-curriculum/PRISMA_CURRICULUM_REVIEW.md) | Formative review of initial Prisma curriculum tasks and concept progression. |
| [PRISMA_CURRICULUM_TRANSFORMATION_PLAN.md](specs-and-curriculum/PRISMA_CURRICULUM_TRANSFORMATION_PLAN.md) | Structural overhaul plan aligning Prisma tasks with browser-first execution. |
| [PRISMA_PEDAGOGICAL_OVERHAUL_PLAN.md](specs-and-curriculum/PRISMA_PEDAGOGICAL_OVERHAUL_PLAN.md) | Pedagogical refinement plan for interactive Prisma concept walkthroughs and live demos. |

---

## 3. Migration Trackers & Work Phases (`migration-and-trackers/`)

Live trackers, checklists, and execution logs used during architectural migrations (Next.js App Router, visual tokens, multi-track unification).

| Document | Description |
|---|---|
| [CHANGELOG.md](migration-and-trackers/CHANGELOG.md) | Historic release changelog tracking operational hygiene, visual redesign phases, and code quality waves. |
| [PHASES.md](migration-and-trackers/PHASES.md) | Phase tracker for Next.js App Router migration (`/`, `/signin`, `/signup`, `/sql`, `/prisma`). |
| [VISUAL_PHASES.md](migration-and-trackers/VISUAL_PHASES.md) | Tracker for the grayscale + gold accent visual system redesign. |
| [HOMEPAGE_REDESIGN_TRACKER.md](migration-and-trackers/HOMEPAGE_REDESIGN_TRACKER.md) | Execution tracker for homepage hero lens and interactive SVG track diagrams. |
| [IMPLEMENTATION_PLAN_PRISMA_MULTI_TRACK.md](migration-and-trackers/IMPLEMENTATION_PLAN_PRISMA_MULTI_TRACK.md) | Architecture plan for unifying SQL and Prisma tracks under a single router and learning shell. |
| [IMPLEMENTATION_TRACKER.md](migration-and-trackers/IMPLEMENTATION_TRACKER.md) | Multi-track integration tracker and gate verification log. |
| [IMPROVEMENT_PLAN.md](migration-and-trackers/IMPROVEMENT_PLAN.md) | Post-audit platform improvement and bugfix roadmap. |
| [MILESTONE_4_WORK_PHASES.md](migration-and-trackers/MILESTONE_4_WORK_PHASES.md) | Work phase checklist for Milestone 4 module authoring and engine expansion. |
| [NAVIGATION_AND_OVERVIEW_CLEANUP_TRACKER.md](migration-and-trackers/NAVIGATION_AND_OVERVIEW_CLEANUP_TRACKER.md) | Route cleanup log retiring obsolete `/learn/[dayId]` routes in favor of namespaced routes. |
| [PLAN_DAY1_RUN_AND_OBSERVE.md](migration-and-trackers/PLAN_DAY1_RUN_AND_OBSERVE.md) | Observation notes and run-through log for Day 1 learner onboarding. |
| [PRISMA_CURRICULUM_TRACKER.md](migration-and-trackers/PRISMA_CURRICULUM_TRACKER.md) | Day-by-day authoring and review tracker for all 14 Prisma modules. |
| [UI_FIXES_PLAN.md](migration-and-trackers/UI_FIXES_PLAN.md) | Issue breakdown and fixes for UI polish, Monaco editor styling, and layout shifts. |
| [VALIDATION_AND_EDITOR_TRACKER.md](migration-and-trackers/VALIDATION_AND_EDITOR_TRACKER.md) | Tracking log for validator bugfixes, final-state checks, and editor Monaco enhancements. |
| [VALIDATION_EQUIVALENCE_AND_EDITOR_PLAN.md](migration-and-trackers/VALIDATION_EQUIVALENCE_AND_EDITOR_PLAN.md) | Comprehensive engineering plan for solution equivalence testing and editor reliability. |
