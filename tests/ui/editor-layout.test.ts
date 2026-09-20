import { describe, expect, it } from 'vitest';
import {
  AutoOpenInput,
  COMPACT_SUGGESTION_BREAKPOINT_PX,
  compactSuggestionsQuery,
  countTrailingNewlines,
  gutterLineCount,
  overlaySuffixHtml,
  resolveEnterKey,
  shouldAutoOpenSuggestions,
  shouldSteerSuggestionList,
  SUGGESTION_DEBOUNCE_MS,
  suggestionAnnouncement,
  suggestionDismissKey,
  toOverlayHtml,
} from '../../src/lib/editor-layout';
import { completionPrefix } from '../../src/lib/completion-replace';

describe('editor-layout — cursor-stuck audit guards', () => {
  it('gutter shows exactly the logical lines (no phantom minLineCount row)', () => {
    expect(gutterLineCount('')).toBe(1);
    expect(gutterLineCount('SELECT 1;')).toBe(1);
    // Screenshot case: 5 logical lines must render 5 gutter rows, not 6.
    expect(gutterLineCount('a\nb\nc\nd\ne')).toBe(5);
    expect(gutterLineCount('a\nb\nc\nd\ne\n')).toBe(6);
  });

  it('overlay preserves every trailing newline so the last line stays reachable', () => {
    expect(countTrailingNewlines('SELECT 1;')).toBe(0);
    expect(countTrailingNewlines('SELECT 1;\n')).toBe(1);
    expect(countTrailingNewlines('a\n\n')).toBe(2);
    expect(overlaySuffixHtml('a\n\n')).toBe('<br /><br />');
    expect(toOverlayHtml('', 'a\n')).toContain('<br />');
    expect(toOverlayHtml('<span>x</span>', 'a\n\n').split('<br />').length - 1).toBe(2);
  });

  it('overlay HTML is color-only: no font-weight / italic drift vs textarea', () => {
    const overlay = toOverlayHtml(
      '<span class="text-code-kw font-bold">SELECT</span> <span class="text-code-num font-semibold">21</span> <span class="text-code-comment italic">-- hi</span>',
      'SELECT 21 -- hi',
    );
    expect(overlay).not.toContain('font-bold');
    expect(overlay).not.toContain('font-semibold');
    expect(overlay).not.toContain('font-medium');
    expect(overlay).not.toMatch(/\sitalic\b/);
    expect(overlay).toContain('text-code-kw');
    expect(overlay).toContain('text-code-num');
  });

  it('Enter accepts the selected item whenever the list is open', () => {
    // Closed list: always newline (escape hatch for last-line creation).
    expect(resolveEnterKey(false)).toBe('newline');
    expect(resolveEnterKey(false, true)).toBe('newline');
    // Open list: the first candidate is already selected, so `Enter` accepts it
    // (`SEL` + `Enter` -> `SELECT`) without an arrow press.
    expect(resolveEnterKey(true)).toBe('accept');
    expect(resolveEnterKey(true, false)).toBe('accept');
    // Fully typed word: accepting would not change the text, so newline.
    expect(resolveEnterKey(true, true)).toBe('newline');
  });

  it('arrows steer the visible suggestion list on the first press', () => {
    // Open list: arrows move the highlight immediately. The row is already
    // selected, so navigation must agree with Enter-accept from press one.
    expect(shouldSteerSuggestionList('ArrowDown', true)).toBe(true);
    expect(shouldSteerSuggestionList('ArrowUp', true)).toBe(true);
    // Closed list: never hijack.
    expect(shouldSteerSuggestionList('ArrowDown', false)).toBe(false);
    expect(shouldSteerSuggestionList('ArrowUp', false)).toBe(false);
  });
});

describe('editor-layout — auto-open/close contract (Batch 5 item 4)', () => {
  const open = (textBeforeCursor: string, extra?: Partial<AutoOpenInput>) => {
    const prefix = completionPrefix(textBeforeCursor);
    const token = prefix.includes('.') ? prefix.slice(prefix.lastIndexOf('.') + 1) : prefix;
    return shouldAutoOpenSuggestions({
      token,
      prefix,
      textBeforeCursor,
      hasMatches: true,
      ...extra,
    });
  };

  it('opens while an identifier is being typed', () => {
    expect(open('SELECT * FROM products pr')).toBe(true);
    expect(open('SELECT * FROM products ORDER B')).toBe(true);
    expect(open('SELECT * FROM customers c WHERE c.em')).toBe(true);
  });

  it('opens on a trailing dot so the column list appears immediately', () => {
    expect(open('SELECT * FROM customers c WHERE c.')).toBe(true);
  });

  it('closes once the token is finished with whitespace (single or double space)', () => {
    expect(open('SELECT * FROM products WHERE ')).toBe(false);
    expect(open('SELECT * FROM products WHERE  ')).toBe(false);
  });

  it('closes on statement separators and grouping punctuation', () => {
    expect(open('SELECT * FROM products;')).toBe(false);
    expect(open('SELECT COUNT(')).toBe(false);
    expect(open('SELECT COUNT(*')).toBe(false);
    expect(open('SELECT COUNT(*), ')).toBe(false);
  });

  it('stays closed for the word dismissed with Esc until the token changes', () => {
    expect(open('SELECT * FROM products SEL', { dismissedWord: 'SEL' })).toBe(false);
    // A different token is a new intent: the list re-opens.
    expect(open('SELECT * FROM products SELE', { dismissedWord: 'SEL' })).toBe(true);
    // Dotted dismissals compare the token after the dot.
    expect(open('SELECT * FROM customers c WHERE c.em', { dismissedWord: 'EM' })).toBe(false);
  });

  it('never opens without candidates', () => {
    expect(open('SELECT zzz', { hasMatches: false })).toBe(false);
  });

  it('exposes a single dismiss-key helper for prefix and dotted prefixes', () => {
    expect(suggestionDismissKey('SEL')).toBe('SEL');
    expect(suggestionDismissKey('c.em')).toBe('EM');
    expect(suggestionDismissKey('c.')).toBe('C.');
  });
});

describe('editor-layout — batch 5 tuning constants', () => {
  it('debounces the suggestion pass inside the imperceptible window', () => {
    expect(SUGGESTION_DEBOUNCE_MS).toBeGreaterThanOrEqual(50);
    expect(SUGGESTION_DEBOUNCE_MS).toBeLessThanOrEqual(150);
  });

  it('uses a compact breakpoint just below Tailwind sm (640px)', () => {
    expect(COMPACT_SUGGESTION_BREAKPOINT_PX).toBe(639);
    expect(compactSuggestionsQuery()).toBe('(max-width: 639px)');
  });

describe('editor-layout — batch 5 item 5: screen-reader announcement', () => {
  it('announces the candidate count while the list is open', () => {
    expect(suggestionAnnouncement({ open: true, count: 3 })).toBe('3 suggestions available');
  });

  it('uses the singular for a single candidate', () => {
    expect(suggestionAnnouncement({ open: true, count: 1 })).toBe('1 suggestion available');
  });

  it('stays silent when the list is closed or empty', () => {
    expect(suggestionAnnouncement({ open: false, count: 3 })).toBe('');
    expect(suggestionAnnouncement({ open: true, count: 0 })).toBe('');
  });

  it('names the selected item whenever the list is open', () => {
    // Accept-first: the highlight is actionable, so the selected item is real
    // information whether the user is typing or has explicitly navigated.
    expect(suggestionAnnouncement({ open: true, count: 2, selectedText: 'SELECT' })).toBe(
      '2 suggestions available, SELECT selected',
    );
    expect(suggestionAnnouncement({ open: true, count: 2 })).toBe('2 suggestions available');
  });

  it('is stable for an unchanged state so aria-live does not chatter', () => {
    const a = suggestionAnnouncement({ open: true, count: 8, selectedText: 'X' });
    const b = suggestionAnnouncement({ open: true, count: 8, selectedText: 'X' });
    expect(a).toBe(b);
  });
});

});
