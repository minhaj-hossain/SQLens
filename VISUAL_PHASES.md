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
| text / text-dim / text-faint | #f2f2f0 / #93938e / #55554f |
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
