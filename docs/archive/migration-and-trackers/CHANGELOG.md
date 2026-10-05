# Changelog

All notable changes to the SQL Interactive Learning Platform (SQLens).

## [Unreleased]

- **Operational hygiene (Wave A):** `tsconfig` strict mode enabled (was `false`); the 6 resulting type errors fixed with null-guards (no behavior change). Package renamed `react-example` → `sqlens`. New `scripts/build.mjs` cross-platform heap wrapper (`--max-old-space-size=4096`) so `npm run build` no longer OOMs during SSG without a manual `NODE_OPTIONS`. Verified `.env` was never committed (only `.env.example` tracked; git history empty) — no rotation required. Fixed a UTF-8 BOM in `tsconfig.json` that Turbopack could not parse.

- **Docs + metadata (Wave B):** `scripts/module-order-check.ts` docstring updated to the real 38-module canonical contract. README test counts refreshed (173 tests / 18 suites; engine suite still 46). Removed the phantom `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` from `metadata.json` (zero Gemini usage in the codebase). `VISUAL_PHASES.md` P7 "Final grep clean" checkbox completed with palette-audit evidence.

- **Code quality (issues 11–13):** new AST-based `explainQuery` (`src/lib/sql-explain.ts`) replaces the fragile regex explainer; context-aware `buildSuggestions` (`src/lib/autocomplete.ts`) replaces the context-blind autocomplete and drops the unsupported `FULL JOIN`; honest execution-time pill (`src/lib/format-execution-time.ts`) — no more fabricated `1.2` fallback. +27 tests.

- **Validate-by-state (report fix, wave F1–F3):** mutation/DDL tasks (Days 25–33) now graded by final database state via sandbox replay (`state-verification.ts`); float-exactness epsilon (12 significant digits) in exact-result grading; `whereContainsTerms` treats `<>` and `!=` as equivalent.

## Visual phases

- F0 COMPLETE - breadcrumb day count fixed (38); layout.tsx metadata mojibake + body/theme colors re-tokened.
- P1 COMPLETE - globals.css rewritten to grayscale+gold token system (incl. shared `--editor-*` vars); fonts switched to Inter + JetBrains Mono; themeColor #0a0a0a; tsc green.
- P2 COMPLETE - Header gold-dot brand + grayscale avatar/controls; token-driven gold on loading/error/not-found; tsc green.
- P3 COMPLETE - homepage rebuilt to execution-plan design, data-wired (ring %, stage %, leaf states, callout); modals neutralized; tsc green.
- P5 COMPLETE - Playground re-tokened (editor bg, gold caret/run, neutral chrome).
- P6 COMPLETE - Auth+Admin neutral/gold; error-red reserved; brand mark + Google G monochrome.
- P7 COMPLETE - full monochrome sweep (incl. inline styles); dead sidebar deleted; canvas-confetti removed.
- P8 COMPLETE - tsc 0, 93/93 tests, build green (heap bump needed on this machine).
- P9 COMPLETE - concept page rebuilt to SQL Lesson design (grayscale code tokens, dots, pills, steps, demo, MCQ); AST-level brace fix; tsc green.