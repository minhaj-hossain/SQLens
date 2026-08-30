# SQLens Visual System - Phase Tracker

> Live status file for the visual-system redesign (approved plan, Amendments 1-4).
> Basis: monochrome grays + ONE gold accent (#f4c430) that only marks "you are here";
> red reserved for errors only. Every phase lands behind a green npx tsc --noEmit.

**Palette anchor (single source of truth):**
| Role | Value |
|---|---|
| bg | #0a0a0a |
| surface / surface-2 / surface-3 | #131313 / #1a1a1a / #212121 |
| border / border-soft | #262626 / #1c1c1c |
| text / text-dim / text-faint | #f2f2f0 / #93938e / #83837c (P9.2 lift) |
| accent (gold) | #f4c430 (+ 13% dim / 33% line alphas) |
| done (filled node) | #d8d8d3 |
| error (errors only) | #e06c5b |
| editor bg / editor text | #101010 / #e6e6e2 |

**Approved design decisions (Amendments 1-4):**
- Editor theme = Option 3 (gold accents only) - monochrome code; gold only on the active-line gutter, caret and Run and Check button. Same CSS vars across SQLEditor / challenge editor / Playground.
- Error color reserved for errors; success/done = gray fill + check mark.
- Stale-bug fixes land FIRST, independent of the token rewrite (Amendment 3).
- Sweep phase also catches inline style props, not just class names (Amendment 4).

---

## Phases

### F0 - Pre-flight correctness fixes (Amendment 3)
- [x] learn/[dayId]/layout.tsx breadcrumb "Day N of 25" -> "Day N of 38" (uses ALL_MODULES.length)
- [x] app/layout.tsx mojibake in TITLE / template replaced with real em-dashes

### P1 - Design tokens and fonts
- [x] globals.css rewritten to new palette (grays + gold + shared --editor-* vars; legacy tokens func/primary/string -> gold, keyword -> neutral, comment -> dim)
- [x] layout.tsx fonts -> Inter (400-700) + JetBrains Mono; themeColor #0a0a0a; body bg-ink
- [x] npx tsc --noEmit green (exit 0)

### P2 - Shared chrome and brand
- [x] Header re-skinned (gold dot brand, mono wordmark, neutral icon-button hovers, grayscale avatar ring)
- [x] loading / error / not-found re-tokened via token remap (gold spinner/CTA, red error only)
- [x] AppChrome selection/focus confirmed (global gold ::selection + focus-visible)

### P3 - Homepage (visual design, data-wired)
- [x] LearningPathView rebuilt (hero eyebrow/headline/CTAs, gold % ring, 3 stage nodes + leaf rows + active-day callout, real progress data)
- [x] RoadmapModal / SchemaModal re-tokened (grayscale + gold only)

### P4 - Learn flow (practice screens)
- [x] Day layout breadcrumb + locked notice styling (token-led)
- [x] ModuleOverview stage overview (%-bars via tokens, gold primary CTA)
- [x] ConceptLessonView: monochrome code blocks, MCQ states (gold correct / red wrong / neutral explanations), neutral warning card
- [x] SQLEditor: editor theme (bg-editor, monochrome tokens, gold gutter tick/caret/selection, gold Run and Check)
- [x] TaskInstructions / PracticeTaskView re-tokened (neutral done/hints, gold = task emphasis)
- [x] ResultsConsole: grayscale table recipe via tokens
- [x] DatabaseExplorer re-tokened (grayscale tables, gold = highlighted/task-required cols, gold focus)
- [x] IndependentChallengeView: inline editor theme (monochrome code, gold gutter tick) + gold selected pill, neutral done pill
- [x] ModuleCompletionView re-tokened (gold ring glow, gold CTA, no teal)

### P5 - Playground
- [x] Playground page re-tokened (bg-editor surface, gold caret/run, neutral schema/results/history)

### P6 - Auth and Admin
- [x] AuthView brand gold dot + monochrome Google G, gold focus rings/shadows, error tokens, meter gray->gold
- [x] BlockedView re-tokened (token-led)
- [x] Admin tabs/badges/buttons neutral; red reserved for block/delete

### P7 - Monochrome sweep (Amendment 4 widened)
- [x] Repo-wide sweep clean: single hue-source file was dead RoadmapSidebar.tsx -> deleted; remaining hexes are palette-intentional (gold + grays)
- [x] Deleted RoadmapSidebar.tsx; npm-uninstalled unused canvas-confetti
- [ ] Final grep clean: palette = grays + gold + error only

### P8 - Verification
- [x] npx tsc --noEmit (exit 0)
- [x] npm test - 93/93 passed
- [x] npm run build - green (with NODE_OPTIONS=--max-old-space-size=4096; default heap OOMs during SSG on this box)
- [x] Visual smoke - pending manual browser check; colors verified via grep + build

---

## Changelog (append one line per phase completion)
- F0 COMPLETE - breadcrumb day count fixed (38); layout.tsx metadata mojibake + body/theme colors re-tokened.
- P1 COMPLETE - globals.css rewritten to grayscale+gold token system (incl. shared --editor-* vars); fonts switched to Inter + JetBrains Mono; themeColor #0a0a0a; tsc green.
- P2 COMPLETE - Header gold-dot brand + grayscale avatar/controls; token-driven gold on loading/error/not-found; tsc green.
- P3 COMPLETE - homepage rebuilt to execution-plan design, data-wired (ring %, stage %, leaf states, callout); modals neutralized; tsc green.
- P5 COMPLETE - Playground re-tokened (editor bg, gold caret/run, neutral chrome).
- P6 COMPLETE - Auth+Admin neutral/gold; error-red reserved; brand mark + Google G monochrome.
- P7 COMPLETE - full monochrome sweep (incl. inline styles); dead sidebar deleted; canvas-confetti removed.
- P8 COMPLETE - tsc 0, 93/93 tests, build green (heap bump needed on this machine).
- P9 COMPLETE - concept page rebuilt to SQL Lesson design (grayscale code tokens, dots, pills, steps, demo, MCQ); AST-level brace fix; tsc green.



### P9 - Concept (lesson) page redesign (SQL Lesson design)
- [x] globals.css: grayscale code tokens added (--code-kw #ffffff / --code-ident #a9a9a3 / --code-punc #6b6b65 / --code-comment #55554f)
- [x] sql-blocks.tsx created: highlightSql() grayscale tokenizer + shared code/table recipes
- [x] ConceptLessonView rebuilt: 760px lesson card, crumb + progress dots (done/current/todo), gold Next, concept pill grid, step-by-step tables, live demo card, lettered MCQ states, gold-rail takeaway
- [x] TheoryView wired: real per-concept dots from userState
- [x] Brace-imbalance bug fixed (ExplanationItem missing close swallowed file; found via TS AST walk); tsc exit 0
- P9.1 FIX - highlightSql placeholder leak (___TOKEN_n___ rendered in UI): tokenizer extracted to src/lib/highlight-sql.ts, identifier/number passes now guard against re-stashing placeholders, restore made LIFO, HTML entities stashed (were being split into literal text); 10 regression tests added (103 total green).

---

## P9.2 - Contrast balance + ONE highlighter (pure white banned)

- [x] text-faint lift: #55554f -> #83837c (:root + @theme) — passes AA on all surfaces (4.2-5.2:1 vs prior 2.2-2.6:1); fixes lesson crumb, table desc, code-card titles, section labels app-wide, consistently
- [x] Pure white banned: --code-kw #ffffff -> #f2f2f0 (same as headings); ConfirmDialog error buttons text-white -> text-ink (3.25:1 -> 6.1:1); zero #ffffff / text-white left in src
- [x] Role upgrades: demo "How it works" hint + DataTable top-right description -> text-dim (informational, not chrome)
- [x] ONE highlighter: highlightSql + SQL_KEYWORDS exported from @/lib/highlight-sql; SQLEditor + IndependentChallengeView inline tokenizers deleted; Playground textarea got the overlay (was unhighlighted); case preserved as typed (toUpperCase removed)
- [x] Demo duplicate fixed (P9.2d): query renders once — highlighted layer visible, input transparent-text + gold caret stacked over it (scroll-synced)
- [x] Mojibake purged from src (0 files) incl. Playground db-mode label / suggestion header / placeholder
- [x] Gates: tsc exit 0; 105/105 tests; build exit 0

---

## P9.3 - Task (practice) page rebuilt to the 2-column workbench design

- [x] TaskInstructions: design task card — crumb TASK N/M + concept title (faint/dim), Done badge (gray tick circle) + ghost Lesson badge, 19px semibold statement, mono meta strip (TABLE / COLUMNS / EXPECTED ROWS with hairline dividers), collapsible help row (hints/solution logic kept)
- [x] DatabaseExplorer: surface header (db-select + rows · cols meta), underline Preview/Schema/ER-Graph tabs (active = text + white underline, NOT gold), PK/FK key-tags + type line in table headers, required-column gold underline kept, editor-bg replaced with surface
- [x] SQLEditor: flat card (shadows dropped), surface header/footer bars, sans-serif gold Run & Check / Next buttons (design `.btn-gold`)
- [x] ResultsConsole: `>_ QUERY RESULTS` dim mono header, neutral metadata pills (no gold), segmented Output Grid / Explain switch (active = surface-3, NOT gold), `>_` empty state, surface content area
- [x] PracticeTaskView: max-w 1440, gap-5 two-column grid (mobile order Task -> Editor -> Results -> Explorer preserved)
- [x] Colors = the P9.2 token set (kw #f2f2f0, faint #83837c) — zero new colors; gold still only marks active/required/correct/run
- [x] Mojibake swipe-hint lines replaced with real ←/→ arrows
- [x] Gates: tsc exit 0; 105/105 tests; build exit 0

---

## P9.4 - Final challenge palette + app-wide mojibake purge

- [x] IndependentChallengeView re-tokened to the locked palette: FINAL CHALLENGE crumb / task tabs / hints / ms pills / icons moved off gold + legacy string/keyword tokens to gray tiers; active task tab = surface-3 (design segmented pattern); Run/Finish buttons = design .btn-gold (sans, semibold, no glow shadow); gold now only on Run buttons, active-line gutter, autocomplete accent and the Correct banner
- [x] App-wide mojibake purge: 47 lines across 13 files re-decoded (cp1252 reverse-map + UTF-8 validation, iterative for double-encoded runs) — ✓ ✕ — → ← … · “” and the 🏆 emoji all render properly now; 0 mojibake lines remain in src
- [x] Gates: tsc exit 0; 105/105 tests; build exit 0
---

## P9.5 - Back navigation + glyph purge

- [x] Back button in /learn/[dayId] top bar: deterministic step chain (getPreviousStep in learn-routes.ts) - back to previous task / lesson / concept / module card / challenge
- [x] First concept theory -> back goes to the module card (the requested flow)
- [x] Smooth: scroll-position memory (sessionStorage, one-shot restore) + prefetch of the back target so clicks are instant
- [x] Tick marks: challenge done-task pill shows real check; Correct heading shows check (weird symbols removed)
- [x] Glyph purge: replaced corrupted/cp1252-encoded chars (>220 replacements across 30 files) - turned-F, smart-curly, phone/ballot boxes, emoji check/cross, heavy arrows, keycaps; kept intentional glyphs (arrows, check/cross, >= <=, warning, box-drawing README)
- [x] 7 new unit tests for back-chain (112 total green)
- [x] Gates: tsc exit 0, tests 112/112, build exit 0

---
### P9.6 - Table consistency + engine fixes (COMPLETE)
- [x] DataTable: removed per-column highlight styling; uniform text-dim cells + subtle cell borders (hairline column separators)
- [x] splitStatements: comment-only chunks skipped; executor short-circuits empty statement lists (fixes SQL Error: Empty query after trailing comments)
- [x] Content guard test added: no task initialSql passes its own validator (engine-run, all 38 modules, expectFailure labs exempt)
- [x] Rewrote pre-filled-answer initialSql (day-05/10/12/13/21/22/31/38 tasks) to partial scaffolding
- [x] day17-c1c-t2: fixed solutionSql (was missing IS NOT NULL) + customValidator AST guard on whereClause
- Gates: tsc 0 / tests 117/117 / build 0
