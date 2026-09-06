'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { highlightSql } from '@/lib/highlight-sql';
import { EDITOR_TEXT_STYLE } from '@/lib/editor-text-style';
import { buildSuggestions, Suggestion } from '@/lib/autocomplete';
import {
  applyCompletion,
  applySnippetCompletion,
  completionPrefix,
} from '@/lib/completion-replace';
import { formatSql } from '@/lib/format-sql';
import {
  applyAutoPair,
  deleteEmptyPair,
  duplicateLine,
  indentSelection,
  moveLine,
  selectLineRange,
  signatureHint,
  skipOverCloser,
  toggleLineComment,
} from '@/lib/editor-keybindings';
import { parseEditorError, ParsedEditorError } from '@/lib/editor-errors';

export type QueryEditorHandle = {
  focus: () => void;
  applySuggestion: (text: string) => void;
  format: () => void;
  textarea: HTMLTextAreaElement | null;
};

export interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Called with the current editor string. Does not rewrite SQL. */
  onRun?: (sql: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  fallbackTable?: string;
  textareaId?: string;
  minLineCount?: number;
  className?: string;
  editorClassName?: string;
  /** Inline error from last run / validator */
  error?: string | null;
}

function measureCaret(
  textarea: HTMLTextAreaElement,
  textUpToCaret: string,
): { top: number; left: number } {
  const div = document.createElement('div');
  const style = getComputedStyle(textarea);
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.pointerEvents = 'none';
  div.style.whiteSpace = style.whiteSpace;
  div.style.wordBreak = style.wordBreak;
  div.style.overflowWrap = style.overflowWrap;
  div.style.font = style.font;
  div.style.fontSize = style.fontSize;
  div.style.lineHeight = style.lineHeight;
  div.style.letterSpacing = style.letterSpacing;
  div.style.padding = style.padding;
  div.style.boxSizing = style.boxSizing;
  div.style.width = `${textarea.clientWidth}px`;
  div.textContent = textUpToCaret;
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  div.appendChild(marker);
  textarea.parentElement!.appendChild(div);
  const top = marker.offsetTop - textarea.scrollTop;
  const left = marker.offsetLeft - textarea.scrollLeft;
  div.remove();
  return { top, left };
}

function kindLabel(s: Suggestion): string {
  if (s.type === 'table') return 'TBL';
  if (s.type === 'column') return 'COL';
  return 'SQL';
}

function findMatchingBracket(
  sql: string,
  caret: number,
): { open: number; close: number } | null {
  if (!sql) return null;
  let target = -1;
  let isOpen = true;

  if (sql[caret] === '(') {
    target = caret;
    isOpen = true;
  } else if (caret > 0 && sql[caret - 1] === '(') {
    target = caret - 1;
    isOpen = true;
  } else if (sql[caret] === ')') {
    target = caret;
    isOpen = false;
  } else if (caret > 0 && sql[caret - 1] === ')') {
    target = caret - 1;
    isOpen = false;
  }

  if (target < 0) return null;

  if (isOpen) {
    let depth = 0;
    for (let i = target; i < sql.length; i++) {
      if (sql[i] === '(') depth++;
      else if (sql[i] === ')') {
        depth--;
        if (depth === 0) return { open: target, close: i };
      }
    }
  } else {
    let depth = 0;
    for (let i = target; i >= 0; i--) {
      if (sql[i] === ')') depth++;
      else if (sql[i] === '(') {
        depth--;
        if (depth === 0) return { open: i, close: target };
      }
    }
  }
  return null;
}

export const QueryEditor = forwardRef<QueryEditorHandle, QueryEditorProps>(
  function QueryEditor(
    {
      value,
      onChange,
      onRun,
      placeholder,
      readOnly = false,
      fallbackTable = 'products',
      textareaId = 'sql-query-textarea',
      minLineCount = 6,
      className,
      editorClassName,
      error,
    },
    ref,
  ) {
    const [activeLine, setActiveLine] = useState(1);
    const [activeLineTintTop, setActiveLineTintTop] = useState(12);
    const [caretPos, setCaretPos] = useState(0);
    const [inlineError, setInlineError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [dismissedWord, setDismissedWord] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [showKeys, setShowKeys] = useState(false);
    const [snippetRest, setSnippetRest] = useState<string[]>([]);
    const [isScrollingSuggestions, setIsScrollingSuggestions] = useState(false);
    const [mounted, setMounted] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suggestionsRef = useRef<Suggestion[]>([]);
    const selectedIdxRef = useRef(0);
    suggestionsRef.current = suggestions;
    selectedIdxRef.current = selectedIdx;

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
      setInlineError(error ?? null);
    }, [error]);

    const parsedError = useMemo(
      () => (inlineError ? parseEditorError(inlineError, value, DATABASE_SCHEMAS) : null),
      [inlineError, value],
    );

    const matchedBracket = useMemo(
      () => findMatchingBracket(value, caretPos),
      [value, caretPos],
    );

    const highlightedCode = useMemo(() => {
      let code = value ? highlightSql(value) : '';
      if (!code) return '';

      // Inline red squiggle underline on error token
      if (parsedError?.token) {
        const esc = parsedError.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        code = code.replace(
          new RegExp(`(>|\\b)(${esc})(<|\\b)`, 'i'),
          `$1<span class="underline decoration-wavy decoration-error text-error bg-error/15 font-semibold">$2</span>$3`,
        );
      }

      // Matching bracket glow/tint
      if (matchedBracket) {
        let count = 0;
        let openParenIdx = 0;
        for (let i = 0; i < matchedBracket.open; i++) {
          if (value[i] === '(' || value[i] === ')') openParenIdx++;
        }
        let closeParenIdx = 0;
        for (let i = 0; i < matchedBracket.close; i++) {
          if (value[i] === '(' || value[i] === ')') closeParenIdx++;
        }

        code = code.replace(/<span class="text-code-punc">([()])<\/span>/g, (m, ch) => {
          const isTarget =
            (ch === '(' && count === openParenIdx) ||
            (ch === ')' && count === closeParenIdx);
          count++;
          if (isTarget) {
            return `<span class="text-func font-bold bg-func/25 rounded-xs ring-1 ring-func/60">${ch}</span>`;
          }
          return m;
        });
      }

      return code;
    }, [value, parsedError, matchedBracket]);

    const computeMatches = (prefix: string, textBefore: string) =>
      buildSuggestions({
        prefix,
        queryBeforeCursor: textBefore,
        schemas: DATABASE_SCHEMAS,
        fallbackTable,
        limit: 8,
      });

    const syncScroll = () => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = ta.scrollTop;
        highlightRef.current.scrollLeft = ta.scrollLeft;
      }
      if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
      // Re-sync line tint top when user scrolls
      const caret = ta.selectionStart;
      const textBefore = ta.value.slice(0, caret);
      const line = textBefore.split('\n').length;
      setActiveLineTintTop((line - 1) * 22 + 12 - ta.scrollTop);
    };

    const placeWidget = (textBefore: string, matched: Suggestion[]) => {
      const ta = textareaRef.current;
      if (!ta) return;
      // measureCaret returns coords relative to ta.parentElement
      const pos = measureCaret(ta, textBefore);
      const rect = ta.parentElement!.getBoundingClientRect();
      // Max height: header (36px) + up to 7 items (210px)
      const dropdownHeight = Math.min(matched.length * 30 + 36, 246);
      const caretAbsTop = rect.top + pos.top;
      const spaceBelow = window.innerHeight - caretAbsTop - 20;
      const top =
        spaceBelow < dropdownHeight && caretAbsTop > dropdownHeight
          ? caretAbsTop - dropdownHeight
          : caretAbsTop + 20;
      const left = rect.left + Math.min(Math.max(pos.left, 8), Math.max(12, ta.clientWidth - 180));
      setCoords({ top, left });
    };

    const updateLineFromCaret = (text: string, caret: number) => {
      const ta = textareaRef.current;
      const textBefore = text.slice(0, caret);
      const line = textBefore.split('\n').length;
      setActiveLine(line);
      // Compute tint top accounting for current scroll offset so it stays locked
      const scrollTop = ta ? ta.scrollTop : 0;
      setActiveLineTintTop((line - 1) * 22 + 12 - scrollTop);
    };

    const updateCursorAndSuggestions = (text: string, caret: number) => {
      setCaretPos(caret);
      const textBefore = text.slice(0, caret);
      updateLineFromCaret(text, caret);
      setHint(signatureHint(textBefore));

      const prefix = completionPrefix(textBefore);
      const token = prefix.includes('.')
        ? prefix.slice(prefix.lastIndexOf('.') + 1)
        : prefix;
      const dismissKey = (token || prefix).toUpperCase();

      if (prefix.length >= 1 || textBefore.endsWith('.') || textBefore.endsWith(' ')) {
        if (dismissedWord && dismissKey === dismissedWord) {
          setShowSuggestions(false);
          return;
        }
        if (dismissedWord !== null && dismissKey !== dismissedWord) {
          setDismissedWord(null);
        }
        const matched = computeMatches(prefix, textBefore);
        if (matched.length > 0 && (prefix.length >= 1 || textBefore.endsWith('.'))) {
          const sameList =
            matched.length === suggestions.length &&
            matched.every((m, i) => m.text === suggestions[i]?.text);
          setSuggestions(matched);
          setSelectedIdx(sameList ? selectedIdx : 0);
          setShowSuggestions(true);
          placeWidget(textBefore, matched);
          return;
        }
      }
      setShowSuggestions(false);
    };

    const restoreCaret = (pos: number, end = pos) => {
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(pos, end);
        setCaretPos(pos);
      });
    };

    const applySuggestion = (item: Suggestion | string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const current = ta.value;
      const caret = ta.selectionStart;
      const text = item && typeof item === 'object' ? item.text : item;
      const snippet = applySnippetCompletion(current, caret, text);
      if (snippet) {
        onChange(snippet.next);
        setShowSuggestions(false);
        setSnippetRest(snippet.placeholders);
        restoreCaret(snippet.caretStart, snippet.caretEnd);
        return;
      }
      const { next, caret: nextCaret } = applyCompletion(current, caret, text);
      onChange(next);
      setShowSuggestions(false);
      setSnippetRest([]);
      restoreCaret(nextCaret);
    };

    const jumpNextPlaceholder = (): boolean => {
      if (snippetRest.length === 0 || !textareaRef.current) return false;
      const [nextPh, ...rest] = snippetRest;
      const from = textareaRef.current.selectionEnd;
      const idx = value.indexOf(nextPh, from);
      const idxAny = idx >= 0 ? idx : value.indexOf(nextPh);
      if (idxAny < 0) {
        setSnippetRest([]);
        return false;
      }
      setSnippetRest(rest);
      restoreCaret(idxAny, idxAny + nextPh.length);
      return true;
    };

    const runFormat = () => {
      const formatted = formatSql(value);
      onChange(formatted);
      restoreCaret(Math.min(textareaRef.current?.selectionStart ?? 0, formatted.length));
    };

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      applySuggestion: (text: string) => applySuggestion(text),
      format: runFormat,
      textarea: textareaRef.current,
    }));

    // Auto-scroll the selected suggestion into view when navigating with arrow keys
    useEffect(() => {
      if (!listRef.current) return;
      const active = listRef.current.querySelector<HTMLElement>(
        `[data-suggestion-idx="${selectedIdx}"]`,
      );
      active?.scrollIntoView({ block: 'nearest' });
    }, [selectedIdx]);

    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (showKeys && !(e.target as HTMLElement).closest('[data-shortcut-panel]')) {
          setShowKeys(false);
        }
      };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [showKeys]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing || e.key === 'Process') return;
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const open = showSuggestions && suggestionsRef.current.length > 0;
      const list = suggestionsRef.current;
      const sel = selectedIdxRef.current;

      if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIdx((p) => (p + 1) % list.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIdx((p) => (p - 1 + list.length) % list.length);
          return;
        }
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          applySuggestion(list[sel]);
          return;
        }
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
          const prefix = completionPrefix(value.slice(0, start));
          const token = prefix.includes('.') ? prefix.split('.').pop()! : prefix;
          const sug = list[sel]?.text ?? '';
          const continueAccept =
            token.length > 0 &&
            (sug.toUpperCase().startsWith(token.toUpperCase()) ||
              sug.toUpperCase().startsWith(prefix.toUpperCase()));
          if (continueAccept) {
            e.preventDefault();
            applySuggestion(list[sel]);
            return;
          }
          setShowSuggestions(false);
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowSuggestions(false);
          const p = completionPrefix(value.slice(0, start));
          const token = p.includes('.') ? p.slice(p.lastIndexOf('.') + 1) : p;
          setDismissedWord(token ? token.toUpperCase() : null);
          return;
        }
      }

      if (e.key === 'Escape' && hint) {
        e.preventDefault();
        setHint(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        const textBefore = value.slice(0, start);
        const prefix = completionPrefix(textBefore);
        const matched = computeMatches(prefix, textBefore);
        setDismissedWord(null);
        setSuggestions(matched);
        setSelectedIdx(0);
        setShowSuggestions(matched.length > 0);
        if (matched.length > 0) placeWidget(textBefore, matched);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setShowSuggestions(false);
        onRun?.(value);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const r = toggleLineComment(value, start, end);
        onChange(r.next);
        restoreCaret(r.start, r.end);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        runFormat();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const r = duplicateLine(value, start);
        onChange(r.next);
        restoreCaret(r.caret);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const r = selectLineRange(value, start);
        restoreCaret(r.start, r.end);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === ']' || e.key === '[')) {
        e.preventDefault();
        const r = indentSelection(value, start, end, e.key === ']' ? 'in' : 'out');
        onChange(r.next);
        restoreCaret(r.start, r.end);
        return;
      }

      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const r = moveLine(value, start, e.key === 'ArrowUp' ? -1 : 1);
        onChange(r.next);
        restoreCaret(r.caret);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (!e.shiftKey && jumpNextPlaceholder()) return;
        const r = indentSelection(value, start, end, e.shiftKey ? 'out' : 'in');
        onChange(r.next);
        restoreCaret(r.start, r.end);
        return;
      }

      if (e.key === 'Backspace' && start === end) {
        const pair = deleteEmptyPair(value, start);
        if (pair) {
          e.preventDefault();
          onChange(pair.next);
          restoreCaret(pair.caret);
          return;
        }
      }

      if (start === end && skipOverCloser(value, start, e.key) && (e.key === "'" || e.key === '"' || e.key === ')')) {
        e.preventDefault();
        restoreCaret(start + 1);
        return;
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "'" || e.key === '"' || e.key === '(')) {
        const paired = applyAutoPair(value, start, end, e.key);
        if (paired) {
          e.preventDefault();
          onChange(paired.next);
          restoreCaret(paired.caret);
        }
      }
    };

    const lineCount = Math.max(value.split('\n').length, minLineCount);
    const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

    return (
      <div className={`relative ${className ?? ''}`}>
        <div
          onClick={() => textareaRef.current?.focus()}
          className={`relative min-h-[180px] max-h-[440px] flex font-mono text-[13px] leading-[22px] bg-editor-bg cursor-text ${editorClassName ?? ''}`}
        >
          <div
            ref={gutterRef}
            className="w-11 select-none py-3 bg-editor-gutter text-text-faint text-right pr-3 font-mono border-r border-border-soft overflow-hidden flex flex-col shrink-0"
          >
            {lines.map((ln) => (
              <div
                key={ln}
                className={`h-[22px] text-[11px] font-medium transition-colors ${
                  ln === activeLine
                    ? 'text-func font-bold bg-editor-active-line shadow-[inset_2px_0_0_0_var(--func)] -mr-3 pr-3'
                    : ''
                }`}
              >
                {ln}
              </div>
            ))}
          </div>

          <div className="relative flex-1 self-stretch min-h-[180px] overflow-hidden">
            {/* Active Line Tint — no transition so it snaps instantly like VS Code */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 pointer-events-none bg-func/[0.04] border-y border-func/10 z-0"
              style={{ top: `${activeLineTintTop}px`, height: '22px' }}
            />

            <div
              ref={highlightRef}
              aria-hidden="true"
              className="sql-editor-overlay absolute inset-0 p-3 pointer-events-none select-none font-mono text-[13px] leading-[22px] overflow-hidden whitespace-pre-wrap break-words text-editor-text z-0"
              style={EDITOR_TEXT_STYLE}
              dangerouslySetInnerHTML={{
                __html: highlightedCode + (value.endsWith('\n') ? '<br />' : ''),
              }}
            />
            <textarea
              id={textareaId}
              ref={textareaRef}
              value={value}
              disabled={readOnly}
              onScroll={syncScroll}
              onChange={(e) => {
                setInlineError(null);
                onChange(e.target.value);
                updateCursorAndSuggestions(e.target.value, e.target.selectionStart);
              }}
              onKeyUp={(e) => {
                const k = e.key;
                if (
                  k === 'Control' ||
                  k === 'Shift' ||
                  k === 'Alt' ||
                  k === 'Meta' ||
                  e.code === 'Space' ||
                  k === 'Escape'
                )
                  return;
                // Arrow keys move the caret — update line tint instantly
                if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'ArrowRight') {
                  updateLineFromCaret(value, e.currentTarget.selectionStart);
                  return;
                }
                updateCursorAndSuggestions(value, e.currentTarget.selectionStart);
              }}
              onSelect={(e) => {
                // Fires on all caret/selection movements (mouse drag, keyboard, etc.)
                updateLineFromCaret(value, e.currentTarget.selectionStart);
              }}
              onClick={(e) =>
                updateCursorAndSuggestions(value, e.currentTarget.selectionStart)
              }
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 100);
              }}
              placeholder={placeholder}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              style={{
                ...EDITOR_TEXT_STYLE,
                color: 'transparent',
                caretColor: 'var(--func)',
                WebkitTextFillColor: 'transparent',
              }}
              className="sql-editor-textarea absolute inset-0 w-full h-full p-3 bg-transparent placeholder:text-text-faint placeholder:opacity-40 font-mono text-[13px] leading-[22px] resize-none outline-none overflow-y-auto border-none block selection:bg-editor-selection whitespace-pre-wrap break-words z-10"
            />

            {hint && (
              <div className="absolute bottom-2 left-3 right-3 z-40 pointer-events-none text-[10px] font-mono text-text-dim bg-surface/90 border border-border rounded px-2 py-1">
                {hint}
              </div>
            )}

          </div>
        </div>

        {/* Autocomplete dropdown — rendered via portal so it escapes all overflow:hidden ancestors */}
        {mounted && showSuggestions && suggestions.length > 0 && createPortal(
          <div
            id="autocomplete-dropdown"
            onMouseDown={(e) => e.preventDefault()}
            className="bg-surface-2 border border-border rounded-lg shadow-2xl min-w-[180px] overflow-hidden"
            style={{ position: 'fixed', top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 99999 }}
          >
            {/* Pinned header */}
            <div className="sticky top-0 z-10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-text-dim font-bold bg-surface border-b border-border flex items-center justify-between gap-2">
              <span>Suggestions</span>
              <span className="text-[9px] font-normal normal-case text-text-faint">
                Tab · Esc
              </span>
            </div>
            {/* Scrollable item list */}
            <div
              ref={listRef}
              className={`max-h-[210px] overflow-y-auto overscroll-contain autosuggest-scrollbar${isScrollingSuggestions ? ' is-scrolling' : ''}`}
              onScroll={() => {
                setIsScrollingSuggestions(true);
                if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
                scrollTimerRef.current = setTimeout(() => setIsScrollingSuggestions(false), 1000);
              }}
            >
              {suggestions.map((sug, idx) => {
                const prefix = completionPrefix(
                  value.slice(0, textareaRef.current?.selectionStart ?? value.length),
                );
                const highlight = prefix.includes('.')
                  ? prefix.slice(prefix.lastIndexOf('.') + 1)
                  : prefix;
                const text = sug.text;
                const hi = highlight.length
                  ? text.toLowerCase().indexOf(highlight.toLowerCase())
                  : -1;
                return (
                  <div
                    key={`${sug.type}-${sug.text}`}
                    data-suggestion-idx={idx}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      applySuggestion(sug);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between gap-2.5 transition ${
                      idx === selectedIdx
                        ? 'bg-func/15 text-text font-bold'
                        : 'text-text-dim hover:bg-surface hover:text-text'
                    }`}
                  >
                    <span className="font-semibold">
                      {hi >= 0 ? (
                        <>
                          {text.slice(0, hi)}
                          <span className="text-func">{text.slice(hi, hi + highlight.length)}</span>
                          {text.slice(hi + highlight.length)}
                        </>
                      ) : (
                        text
                      )}
                    </span>
                    <span className="text-[9px] text-text-faint px-1.5 py-0.2 rounded bg-surface border border-border">
                      {kindLabel(sug)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

        {/* Inline Error Bar & Fix Action */}
        {parsedError && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-error/10 border-t border-error/20 text-xs font-mono text-error">
            <div className="flex items-center gap-2 truncate">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              <span className="truncate">
                {parsedError.line ? `Line ${parsedError.line}: ` : ''}
                {parsedError.displayMessage}
              </span>
            </div>
            {parsedError.didYouMean && (
              <button
                type="button"
                onClick={() => {
                  if (parsedError.token && parsedError.didYouMean) {
                    const regex = new RegExp(`\\b${parsedError.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    const next = value.replace(regex, parsedError.didYouMean);
                    onChange(next);
                    setInlineError(null);
                    textareaRef.current?.focus();
                  }
                }}
                className="shrink-0 px-2 py-0.5 rounded bg-error/20 hover:bg-error/30 text-text font-bold transition cursor-pointer text-[11px]"
              >
                Fix to {parsedError.didYouMean}
              </button>
            )}
          </div>
        )}

        <div
          data-shortcut-panel
          className="flex items-center justify-between gap-2 px-3 py-1.5 bg-surface border-t border-border-soft text-[10px] font-mono text-text-faint relative"
        >
          <button
            type="button"
            onClick={() => setShowKeys((v) => !v)}
            className="hover:text-text transition cursor-pointer"
          >
            Keyboard shortcuts
          </button>
          {showKeys && (
            <div className="absolute z-50 mt-8 left-3 right-3 sm:right-auto sm:w-80 rounded-lg border border-border bg-surface-2 shadow-xl p-3 text-[11px] text-text-dim space-y-1">
              <div><kbd>Tab</kbd> accept / indent</div>
              <div><kbd>Shift+Tab</kbd> outdent</div>
              <div><kbd>Ctrl/⌘+Enter</kbd> run</div>
              <div><kbd>Ctrl/⌘+Space</kbd> suggestions</div>
              <div><kbd>Ctrl/⌘+/</kbd> comment</div>
              <div><kbd>Ctrl/⌘+Shift+F</kbd> format</div>
              <div><kbd>Ctrl/⌘+D</kbd> duplicate line</div>
              <div><kbd>Ctrl/⌘+L</kbd> select line</div>
              <div><kbd>Ctrl/⌘+] / [</kbd> indent / outdent</div>
              <div><kbd>Alt+↑/↓</kbd> move line</div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
