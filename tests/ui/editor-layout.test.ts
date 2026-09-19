import { describe, expect, it } from 'vitest';
import {
  countTrailingNewlines,
  gutterLineCount,
  overlaySuffixHtml,
  resolveEnterKey,
  shouldSteerSuggestionList,
  toOverlayHtml,
} from '../../src/lib/editor-layout';

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

  it('Enter always means newline, never suggestion-accept', () => {
    expect(resolveEnterKey(true)).toBe('newline');
    expect(resolveEnterKey(false)).toBe('newline');
  });

  it('arrows move the caret until the user explicitly steers the list', () => {
    // Auto-opened list: first ArrowDown must NOT hijack the caret.
    expect(shouldSteerSuggestionList('ArrowDown', true, false)).toBe(false);
    expect(shouldSteerSuggestionList('ArrowUp', true, false)).toBe(false);
    // After Ctrl+Space / consumed Arrow: list navigation owns the keys.
    expect(shouldSteerSuggestionList('ArrowDown', true, true)).toBe(true);
    expect(shouldSteerSuggestionList('ArrowUp', true, true)).toBe(true);
    // Closed list: never hijack.
    expect(shouldSteerSuggestionList('ArrowDown', false, true)).toBe(false);
  });
});
