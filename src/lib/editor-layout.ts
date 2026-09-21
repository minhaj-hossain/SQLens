/**
 * editor-layout — pure, unit-testable layout contract for the custom
 * transparent-textarea + highlight-overlay SQL editor (QueryEditor).
 *
 * Why this exists (cursor-stuck-on-second-last-line audit):
 *  1. The gutter must show exactly the logical lines in `value`. Rendering
 *     `Math.max(lines, minLineCount)` phantom rows makes the last visible row
 *     un reachable — ArrowDown on the real last line natively does nothing,
 *     so the caret feels "stuck" one line above.
 *  2. The overlay div collapses trailing newlines (whiteSpace: pre-wrap still
 *     drops the final line break box), so one `<br />` per trailing `\n` must
 *     be appended or the overlay is shorter than the textarea and the last
 *     line can't be clicked/scrolled into view.
 *  3. Highlight spans must be color-only. `font-bold/semibold/medium/italic`
 *     change glyph advances, so the overlay wraps at a different x than the
 *     textarea's single plain run and clicks land on the wrong column.
 */

export function gutterLineCount(value: string): number {
  // split('') on '' yields [''] -> length 1, which is exactly the one empty
  // gutter row an empty editor needs. No minLineCount floor: phantom rows
  // are unreachable (ArrowDown on the real last line is a native no-op).
  return value.split('\n').length;
}

export function countTrailingNewlines(value: string): number {
  let n = 0;
  for (let i = value.length - 1; i >= 0 && value[i] === '\n'; i--) n++;
  return n;
}

/** One `<br />` per trailing newline so overlay height === textarea height. */
export function overlaySuffixHtml(value: string): string {
  return '<br />'.repeat(countTrailingNewlines(value));
}

/**
 * Strip layout-affecting typography classes from highlight HTML for overlay
 * use only. Lesson-page rendering (CodeCard) keeps using `highlightSql`
 * output directly so its weight-based hierarchy is untouched.
 */
export function toOverlayHtml(highlightedCode: string, value: string): string {
  if (!highlightedCode) return overlaySuffixHtml(value);
  const stripped = highlightedCode
    .replace(/\sfont-(bold|semibold|medium)\b/g, '')
    .replace(/\sitalic\b/g, '');
  return stripped + overlaySuffixHtml(value);
}

/**
 * Batch E1 — visual-row geometry for the gutter, the overlay and the
 * active-line tint.
 *
 * The editor layers are `white-space: pre-wrap` + `word-break`, so ONE logical
 * line can occupy N visual rows (a long multi-row `VALUES` list wraps inside a
 * single logical line). Anything that maps a logical line number to a y
 * position must therefore consume MEASURED row counts: the old fixed-pixel tint
 * (`(line - 1) * 22px`) drifted by one row per wrapped line above the caret,
 * which is exactly why the highlight sat on the wrong row on long VALUES lists
 * while the caret was correct.
 *
 * These helpers are pure so the geometry is unit-tested; the component supplies
 * the measured row counts (a hidden mirror div with the textarea's metrics).
 */
export interface LineVisualLayout {
  /** Logical lines — `value.split('\n').length`, same as `gutterLineCount`. */
  lineCount: number;
  /** Visual rows occupied by each logical line (always >= 1). */
  rowCounts: number[];
  /** Visual rows ABOVE each logical line; `rowOffset[0]` is always 0. */
  rowOffset: number[];
  /** Visual rows in the whole document. */
  totalRows: number;
}

/** Metrics shared by the gutter, the overlay and the tint (`p-3`, `leading-[22px]`). */
export interface EditorMetrics {
  /** Computed `line-height` of the editor text, in px. */
  lineHeight: number;
  /** Computed top padding of the editor text (`p-3`), in px. */
  padTop: number;
}

/**
 * Zip logical lines with their MEASURED visual row counts.
 *
 * `measuredRows` may be shorter than the document (or empty before the first
 * measurement): a missing / non-finite / sub-1 entry degrades to a single row,
 * which is the old behaviour — never NaN geometry.
 */
export function lineVisualLayout(
  value: string,
  measuredRows: readonly number[] = [],
): LineVisualLayout {
  const rowCounts = value.split('\n').map((_, i) => {
    const rows = measuredRows[i];
    return typeof rows === 'number' && Number.isFinite(rows) && rows >= 1
      ? Math.floor(rows)
      : 1;
  });
  const rowOffset: number[] = new Array(rowCounts.length);
  let acc = 0;
  for (let i = 0; i < rowCounts.length; i++) {
    rowOffset[i] = acc;
    acc += rowCounts[i];
  }
  return { lineCount: rowCounts.length, rowCounts, rowOffset, totalRows: acc };
}

/**
 * Gutter row heights. A wrapped line's number owns all of its visual rows, so
 * the numbers stay beside the text they label instead of sliding up by one row
 * per preceding wrapped line.
 */
export function gutterRowHeights(layout: LineVisualLayout, lineHeight: number): number[] {
  return layout.rowCounts.map((rows) => rows * lineHeight);
}

/**
 * The active-line tint box in editor coordinates, already scroll-corrected, so
 * it can be rendered as `top` / `height` on an absolutely positioned div.
 *
 * Out-of-range lines (a stale `activeLine` after an external value swap) fall
 * back to the pre-E1 one-row-per-line math rather than producing `undefined`.
 */
export function tintBox(
  layout: LineVisualLayout,
  line: number,
  metrics: EditorMetrics,
  scrollTop: number,
): { top: number; height: number } {
  const index = Math.max(1, Math.floor(line)) - 1;
  const rowsAbove = layout.rowOffset[index] ?? index;
  const rows = layout.rowCounts[index] ?? 1;
  return {
    top: metrics.padTop + rowsAbove * metrics.lineHeight - scrollTop,
    height: rows * metrics.lineHeight,
  };
}

/**
 * Keyboard contract for the suggestion dropdown.
 *
 * The list opens with the FIRST candidate already selected, so the contract
 * reduces to "what happens to the selected item?":
 *
 * - `Enter` accepts the selected item whenever the list is open. It is a
 *   newline when the list is closed, and also when accepting would not change
 *   the typed text (see `isNoOpCompletion`) — otherwise typing a complete
 *   `customers` would cost two Enters to move on and the last line of the
 *   document would be hard to create. `Shift+Enter` is ALWAYS a newline.
 * - `Tab` accepts while the list is open, otherwise it indents; a no-op
 *   completion falls through to indentation.
 * - `ArrowUp`/`ArrowDown` move the highlight while the list is open — they
 *   never move the caret out from under a list you can see — and move the caret
 *   when it is closed.
 * - `ArrowRight` accepts the inline ghost preview when the candidate really
 *   extends the typed token, else it moves the caret.
 * - `Esc` dismisses (and remembers the word); `Ctrl/Cmd+Enter` always runs the
 *   query and never accepts.
 *
 * Why the historical "Enter must always be a newline" rule (commit 1768662) is
 * no longer needed: `shouldAutoOpenSuggestions` closes the list on trailing
 * whitespace and on `; ( ) ,`, and accepting inserts a trailing space, so a
 * newline is never more than one keystroke away. See `resolveSuggestionKeyAction`.
 */
export function resolveEnterKey(open: boolean, noOpCompletion = false): 'accept' | 'newline' {
  return open && !noOpCompletion ? 'accept' : 'newline';
}

/**
 * Whether an arrow key should move the suggestion highlight instead of the
 * caret (Batch A).
 *
 * Accept-first means the visible row is actionable from the first press: if a
 * list is open, ArrowDown/ArrowUp steer its highlight and never move the
 * caret out from under it. A closed list leaves arrows native.
 */
 export function shouldSteerSuggestionList(key: 'ArrowDown' | 'ArrowUp', open: boolean): boolean {
  void key;
  return open;
}

/** Everything the editor does in response to a suggestion-list keypress. */
export type SuggestionKeyAction =
  /** Ctrl/Cmd+Enter: run the query. */
  | 'run'
  /** Insert the selected candidate. */
  | 'accept'
  /** Move the highlight down one candidate. */
  | 'step-next'
  /** Move the highlight up one candidate. */
  | 'step-prev'
  /** Esc: close the list and remember the dismissed word. */
  | 'dismiss'
  /** Close the list, then let the key do its native job (Tab indents, Enter
   *  inserts a newline). Used for no-op completions. */
  | 'close-and-default'
  /** Not ours: leave the keystroke alone. */
  | 'default';

export interface SuggestionKeyContext {
  key: string;
  /** Ctrl or Cmd held (both mean "run" for Enter). */
  ctrlOrMeta: boolean;
  shift: boolean;
  /** A suggestion list is currently on screen. */
  open: boolean;
  listLength: number;
  /** Accepting the selected candidate would not change the typed text. */
  noOpCompletion: boolean;
  /** `ArrowRight` may complete the inline ghost preview. */
  ghostAvailable: boolean;
}

/**
 * Single source of truth for the suggestion-list keys. Extracted from the
 * component so the DISPATCH ORDER is unit-tested: every regression in this
 * contract (accept → newline → hybrid → accept) came from branch ordering, not
 * from a single predicate being wrong.
 */
export function resolveSuggestionKeyAction(ctx: SuggestionKeyContext): SuggestionKeyAction {
  const { key, ctrlOrMeta, shift, open, listLength, noOpCompletion, ghostAvailable } = ctx;

  // Ctrl/Cmd+Enter runs the query whether or not the list is open.
  if (key === 'Enter' && ctrlOrMeta) return 'run';
  if (key === 'Escape') return 'dismiss';

  if (open && listLength > 0) {
    if (key === 'ArrowDown') return 'step-next';
    if (key === 'ArrowUp') return 'step-prev';
    if (key === 'ArrowRight' && !shift && ghostAvailable) return 'accept';
    if (key === 'Tab' && !shift) return noOpCompletion ? 'close-and-default' : 'accept';
    // Shift+Enter is a newline in every mode, list open or not.
    if (key === 'Enter' && shift) return 'close-and-default';
    if (key === 'Enter') {
      return resolveEnterKey(true, noOpCompletion) === 'accept' ? 'accept' : 'close-and-default';
    }
  }

  return 'default';
}


/**
 * Per-keystroke debounce for the suggestion pass (`recomputeSuggestions`).
 * The pass builds the whole candidate pool AND re-measures the caret with a
 * hidden mirror div, so running it on every single keypress is wasted work
 * while typing fast. 80ms is below the threshold where the dropdown feels
 * laggy but above typical inter-keystroke time when touch-typing.
 * Explicit open paths (Ctrl+Space, mouse click) bypass this delay.
 */
export const SUGGESTION_DEBOUNCE_MS = 80;

/** Compact-viewport breakpoint for the tap-friendly suggestion chip bar.
 *  Below Tailwind's `sm` (640px) the floating portal dropdown would sit
 *  underneath the on-screen keyboard, so chips replace it. */
export const COMPACT_SUGGESTION_BREAKPOINT_PX = 639;

/** `matchMedia` query string for the compact suggestion chip bar. */
export function compactSuggestionsQuery(): string {
  return `(max-width: ${COMPACT_SUGGESTION_BREAKPOINT_PX}px)`;
}

/** Characters that end the current token. A suggestion list opened while
 *  typing them would be immediately stale, so they always close it. */
const AUTO_CLOSE_CHARS = new Set([';', '(', ')', ',']);

export interface AutoOpenInput {
  /** Identifier being typed, without any `alias.` qualifier (may be ''). */
  token: string;
  /** Full typed prefix, including `alias.` when present (may be ''). */
  prefix: string;
  /** Full editor text up to the caret. */
  textBeforeCursor: string;
  /** Whether the candidate pool produced anything for this prefix. */
  hasMatches: boolean;
  /** Word the user dismissed with Esc, if any (remembered per token). */
  dismissedWord?: string | null;
}

/**
 * Auto-open/close contract for the suggestion list (Batch 5, item 4). Extracted
 * from the component's nested conditions so the rules are explicit and unit
 * tested:
 *
 *  - a non-empty token keeps the list open while typing (`SEL`),
 *  - a trailing `.` opens it even though the token is still empty (`c.`),
 *  - a finished token (trailing space) closes it (`WHERE `), and a double space
 *    stays closed — the learner is writing, not completing,
 *  - statement separators / grouping punctuation (`; ( ) ,`) close it,
 *  - the word dismissed with Esc stays dismissed until the token changes,
 *  - no candidates means no list.
 */
export function shouldAutoOpenSuggestions(input: AutoOpenInput): boolean {
  const { token, prefix, textBeforeCursor, hasMatches, dismissedWord } = input;
  if (!hasMatches) return false;
  const dismissKey = (token || prefix).toUpperCase();
  if (dismissedWord && dismissKey === dismissedWord) return false;
  const lastChar = textBeforeCursor.slice(-1);
  if (AUTO_CLOSE_CHARS.has(lastChar)) return false;
  if (textBeforeCursor.endsWith('.')) return true;
  // Trailing whitespace means the token is finished (single or double space).
  if (/\s$/.test(textBeforeCursor)) return false;
  return token.length >= 1;
}

/** Dismiss-key for a prefix: the token after `alias.`, upper-cased. */
export function suggestionDismissKey(prefix: string): string {
  const token = prefix.includes('.') ? prefix.slice(prefix.lastIndexOf('.') + 1) : prefix;
  return (token || prefix).toUpperCase();
}

/**
 * Screen-reader announcement for the suggestion list (Batch 5, item 5).
 *
 * `aria-live` regions only speak when their text CHANGES, so this returns a
 * string that is stable for a given state: re-rendering with the same count
 * stays silent, which is what stops the list from chattering on every
 * keystroke. The selected item is always included when known — since the list
 * opens with the first candidate selected and `Enter` accepts it, the selection
 * is real information, not decoration. Returns `''` when there is nothing to
 * announce.
 */
export function suggestionAnnouncement(input: {
  open: boolean;
  count: number;
  selectedText?: string | null;
}): string {
  const { open, count, selectedText } = input;
  if (!open || count <= 0) return '';
  const noun = count === 1 ? 'suggestion' : 'suggestions';
  const highlight = selectedText ? `, ${selectedText} selected` : '';
  return `${count} ${noun} available${highlight}`;
}
