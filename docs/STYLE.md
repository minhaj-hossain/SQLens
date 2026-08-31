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

## 2. Surface & Border Tokens

| Token | Role |
|---|---|
| `bg-surface-2` | Recessed panels (code blocks, table containers, wells) |
| `bg-surface-3` | Headers of recessed panels (table headers, card headers) |
| `border-border` | Every hairline border — never raw `border-gray-*` |
| `rounded-lg` | Cards, panels, table containers, modals |
| `border-l-func` + `bg-func/10` | Highlighted/active row treatment (left accent bar) |

## 3. Table Styling Spec (unified)

All data tables — `DataTable` (`sql-blocks.tsx`), `DatabaseExplorer`,
`ResultsConsole`, and any future table — follow one spec:

```
container:   border border-border rounded-lg overflow-hidden
header row:  bg-surface-3 font-mono text-xs text-left
cells:       py-2 px-3 text-sm font-mono
zebra (opt): odd rows bg-surface-2/50
highlight:   bg-func/10 border-l-2 border-l-func
```

- Headers are mono and small (they are identifiers, not prose).
- Cell padding is uniform: `py-2 px-3`.
- Numeric right-alignment is allowed, but the mono font and padding do not change.

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
