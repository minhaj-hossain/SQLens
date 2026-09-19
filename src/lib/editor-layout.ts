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
 * Keyboard contract for the suggestion dropdown.
 * `Enter` ALWAYS inserts a newline (never accepts) so a new last line can
 * always be created; `Tab` accepts; `Esc` dismisses. Ctrl/Cmd+Enter runs.
 *
 * ArrowUp/Down move the caret by default. They only steer the suggestion
 * list after the user has explicitly entered "list navigation" with
 * Ctrl+Space or a prior Arrow press that was already consumed for the list
 * (tracked by `listNavActive`). Typing any text exits list navigation.
 */
export function resolveEnterKey(open: boolean): 'newline' {
  void open;
  return 'newline';
}

export function shouldSteerSuggestionList(
  key: 'ArrowDown' | 'ArrowUp',
  open: boolean,
  listNavActive: boolean,
): boolean {
  void key;
  return open && listNavActive;
}
