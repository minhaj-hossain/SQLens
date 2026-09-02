import type { CSSProperties } from 'react';

/**
 * EDITOR_TEXT_STYLE — the text-layout contract shared by the syntax-highlight
 * overlay AND the transparent textarea in SQLEditor / IndependentChallengeView.
 *
 * Those editors stack two layers: the textarea holds the real text + caret but
 * paints it invisible; the overlay above it paints the highlighted copy. The
 * caret, clicks and typed letters are all resolved against the TEXTAREA's
 * layout, while everything the user SEES is the OVERLAY's layout. If the two
 * layers diverge by even a pixel, the caret visually floats mid-word while the
 * logical position is elsewhere — clicks clamp to the line end and typed
 * letters appear to land at the end of the line.
 *
 * Both layers therefore MUST apply this exact object, so their metrics are
 * identical by construction:
 *  - letterSpacing / fontKerning / fontVariantLigatures pinned: the textarea
 *    lays a line out as ONE text run while the overlay splits it into many
 *    spans; engines resolve kerning/ligatures per run, so any per-run
 *    difference accumulates horizontally along the line.
 *  - tabSize pinned (it used to be inline on the textarea only — 2 vs the
 *    overlay's default 8).
 *  - textRendering geometricPrecision: identical glyph-advance rounding for
 *    both layers (fractional advances at 13px must never round differently
 *    between a single run and spanned text).
 *  - scrollbar-width none on both: a textarea scrollbar gutter the overlay
 *    lacks narrows its wrapping width (classic Windows/Chrome caret drift).
 */
export const EDITOR_TEXT_STYLE: CSSProperties = {
  margin: 0,
  border: 0,
  boxSizing: 'border-box',
  padding: '12px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  lineHeight: '22px',
  letterSpacing: '0px',
  fontKerning: 'none',
  fontVariantLigatures: 'none',
  textRendering: 'geometricPrecision',
  tabSize: 2,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  scrollbarWidth: 'none',
};
