# SQLens Style Contract

This document defines the visual contract for SQLens UI components. It exists so
future components stay consistent without re-deriving the system from existing code.
The canonical reference is `src/app/globals.css` (token definitions) plus the
components listed in the Table Styling section below.

## 1. Color-Role Contract

| Role | Token | Used for |
|---|---|---|
| **Primary action / accent** | `bg-func`, `border-func`, `text-func`, `bg-func/10` | Primary buttons, active state, focused/highlighted rows, links that drive the learning flow |
| **Success** | `green-500` family | Passed validations, correct answers, durable/committed state messages |
| **Error / danger** | `red-500` family | Failed validations, destructive actions (DELETE, DROP), SQL-injection evidence |
| **Warning** | `amber/yellow` family | Hints, non-blocking warnings, "provisional" transaction state |
| **Code / data (grayscale)** | `font-mono` + `surface-2/3` | All SQL, identifiers, table data. **Never** colorize code semantically — grayscale + mono is the code signal |

Rules of thumb:
- One accent per screen region. If everything is `bg-func`, nothing is.
- Green/red/amber are **states**, not decoration. Code and data stay grayscale.
- Accent intensity is expressed with the `/10`–`/20` opacity suffixes
  (`bg-func/10`, `border-l-func`) rather than new colors.

## 1b. Theme System

Two palettes ship, defined entirely in `src/app/globals.css` as CSS custom
properties (raw `--*` tokens + Tailwind v4 `@theme` mirrors):

| Theme | `data-theme` | Look |
|---|---|---|
| **Graphite** (default) | absent / `graphite` | Monochrome grays + gold `#f4c430` accent |
| **Sky** | `sky` | The original SQLens palette (restored from git `902874c`): navy surfaces `#121722`–`#212A3D`, sky-blue `#38BDF8` accent, **blue SQL keywords `#60A5FA`, amber strings `#F59E0B`, slate comments `#94A3B8`**, navy editor `#0D1322` |

Mechanics:
- `:root` holds graphite values; `:root[data-theme='sky']` overrides **every**
  raw token AND its `--color-*` mirror. Because Tailwind v4 utilities resolve
  to `var(--color-*)`, the whole UI re-themes with zero component changes.
- `src/lib/theme-system.ts` — registry (`THEMES`, `DEFAULT_THEME`,
  `STORAGE_KEY='sqlens:theme'`, `THEME_COLORS`).
- `src/components/providers/ThemeProvider.tsx` — applies `data-theme` to
  `<html>`, persists to localStorage, syncs `meta[name=theme-color]`. A FOUC
  script in the root layout applies the saved theme pre-hydration.
- `src/components/ui/ThemeToggle.tsx` — one-click toggle (each click cycles
  graphite ↔ sky; active palette shown as an accent dot on the button; also
  floated on the auth pages, which have no header chrome).

Rules for new code:
- Never hardcode hex colors or gold/sky rgba in components or CSS — add a
  token to `:root`, mirror it in `@theme`, and define it in BOTH theme scopes.
- Selection/pulse alpha colors are tokenized (`--selection-bg`, `--pulse-*`)
  so animations re-hue per theme; do not reintroduce raw `rgba(244,…)`.

## 2. Surface & Border Tokens

| Token | Role |
|---|---|
| `bg-surface-2` | Recessed panels (code blocks, table containers, wells) |
| `bg-surface-3` | Headers of recessed panels (table headers, card headers) |
| `border-border` | Every hairline border — never raw `border-gray-*` |
| `rounded-lg` | Cards, panels, table containers, modals |
| `border-l-func` + `bg-func/10` | Highlighted/active row treatment (left accent bar) |

## 3. Table Styling Spec (unified)

All data tables render through the **`DataGrid`** primitive
(`src/components/learning/DataGrid.tsx`). `ResultsConsole`, `DatabaseExplorer`,
`sql-blocks` `DataTable`, the `ConceptLessonView` live demo + markdown tables,
`Playground` and `IndependentChallengeView` (incl. its inspector modal) are all
thin consumers of it. **Do not hand-write a `<table>` for query/data output** —
feature requests go on `DataGrid`.

Visual contract (implemented once, in `DataGrid`):

```
container:   border border-border rounded-lg overflow-hidden
header row:  sticky bg-surface-3, mono 11px, text-left
cells:       px-3 py-2, mono 13px
zebra:       odd rows bg-surface-2/40, hover bg-surface-2/70
highlight:   header border-b-2 border-b-func + cell bg-func/10
NULL:        muted mono chip (bg-surface-2 border-border, uppercase italic)
```

Cell formatting is **type-aware and never inlined** — it lives in
`src/lib/format-cell.ts`:
- numbers → right-aligned `tabular-nums`; float dust stripped
- money-lookalike columns (`price`, `unit_price`, …) → fixed 2 decimals
  (a stored `120.00` must never render as `120`)
- schema `decimal` → 2dp only when fractional
- dates → stable ISO, `tabular-nums`

Row honesty:
- `pageSize > 0` → built-in pagination + `Showing N–M of K` footer
- `rowCap > 0` → hard cap + `Showing first N of M` footer
- Prefer `DataGrid` pagination over hand-rolled chunked tables.

## 4. Spacing Contract

| Context | Standard |
|---|---|
| Major section padding (lesson/challenge/practice views) | `p-6` |
| Gaps between blocks within a section | `gap-4` |
| Gaps between sibling chips/badges | `gap-2` |
| Stacked prose lists | `space-y-2` (tight) / `space-y-5` (step cards) |

Applies to `ConceptLessonView`, `PracticeTaskView`, `IndependentChallengeView`,
`Playground`, and modal content (`SchemaModal`, roadmap modal).

## 5. Typography

| Element | Standard |
|---|---|
| SQL, identifiers, table data, headers of data surfaces | `font-mono` |
| Prose (descriptions, explanations, scenarios) | default sans, `text-sm`–`text-base` |
| Section labels | uppercase, tracking-wide, `text-xs`, muted color |
| Body headings in views | `text-lg`/`text-xl font-semibold` |

## 6. Checklist for New Components

- [ ] Borders use `border-border`, radius uses `rounded-lg`
- [ ] Recessed surfaces use `surface-2`/`surface-3`, not ad-hoc grays
- [ ] Any data table matches the Table Styling Spec
- [ ] Accent color reserved for primary/active elements only
- [ ] Code rendered in `font-mono`, grayscale
- [ ] Section padding `p-6`, block gaps `gap-4`
