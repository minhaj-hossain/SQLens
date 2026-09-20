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
import {
  compactSuggestionsQuery,
  gutterLineCount,
  resolveSuggestionKeyAction,
  shouldAutoOpenSuggestions,
  SUGGESTION_DEBOUNCE_MS,
  suggestionAnnouncement,
  suggestionDismissKey,
  toOverlayHtml,
} from '@/lib/editor-layout';
import { buildSuggestions, Suggestion, SuggestionContext, suggestionContext } from '@/lib/autocomplete';
import {
  applyCompletion,
  applySnippetCompletion,
  completionPrefix,
  ghostRemainder,
  isNoOpCompletion,
} from '@/lib/completion-replace';
import { liveHistoryBoost, recordSuggestionPick } from '@/lib/suggestion-history';
import { formatSql } from '@/lib/format-sql';
import {
  applyAutoPair,
  deleteEmptyPair,
  duplicateLine,
  findActiveSignature,
  indentSelection,
  moveLine,
  selectLineRange,
  signatureParts,
  SignatureParts,
  skipOverCloser,
  toggleLineComment,
} from '@/lib/editor-keybindings';
import { recordSuggestEvent } from '@/lib/suggest-telemetry';
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
  div.style.fontWeight = style.fontWeight;
  div.style.fontStyle = style.fontStyle;
  div.style.fontStretch = style.fontStretch;
  div.style.fontKerning = style.fontKerning;
  div.style.fontVariantLigatures = style.fontVariantLigatures;
  div.style.letterSpacing = style.letterSpacing;
  div.style.tabSize = style.tabSize;
  div.style.textRendering = style.textRendering;
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
  if (s.type === 'snippet') return 'JOIN';
  return 'SQL';
}

/** Hard cap so a long doc can never wrap the row (Batch 4 rich rows). */
function truncateDoc(doc: string): string {
  return doc.length > 34 ? `${doc.slice(0, 33)}…` : doc;
}

/**
 * Batch 5 item 6: keep the previous signature object when nothing *visible*
 * changed. `updateCaretState` runs on every keystroke, so returning a fresh
 * object each time would re-render the hint bar (and the editor subtree) for a
 * caret move that does not change the displayed signature.
 */
function sameSignature(a: SignatureParts | null, b: SignatureParts | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.before === b.before && a.active === b.active && a.after === b.after;
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
      // minLineCount kept in props for API compatibility but intentionally
      // unused: the gutter renders exactly value.split('\n').length rows.
      // Filling up to a minimum created phantom rows the caret could never
      // reach (ArrowDown on the real last line is a native no-op).
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
    /** Batch 5 item 6: signature under the caret, with the active arg split out. */
    const [signature, setSignature] = useState<SignatureParts | null>(null);
    const [showKeys, setShowKeys] = useState(false);
    const [snippetRest, setSnippetRest] = useState<string[]>([]);
    const [isScrollingSuggestions, setIsScrollingSuggestions] = useState(false);
    const [mounted, setMounted] = useState(false);
    /** Batch 4 ghost text: inline preview of the top suggestion at the caret. */
    const [ghost, setGhost] = useState<{ text: string; top: number; left: number } | null>(null);
    /** Bumped on scroll so the ghost is re-measured against the new scrollTop. */
    const [scrollTick, setScrollTick] = useState(0);
    /** Batch 5 item 3: below `sm` the portal dropdown is replaced by chips. */
    const [isCompact, setIsCompact] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Batch 5 item 1: pending debounced suggestion pass. */
    const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /**
     * Batch 5 item 2: the currently open suggestion session, for local
     * telemetry. Set when a list is shown, consumed once when the user accepts
     * or dismisses it — so `decisionMs` measures the real think-time.
     */
    const telemetryRef = useRef<{ prefix: string; key: string; at: number } | null>(null);
    const suggestionsRef = useRef<Suggestion[]>([]);
    const selectedIdxRef = useRef(0);
    suggestionsRef.current = suggestions;
    selectedIdxRef.current = selectedIdx;

    useEffect(() => { setMounted(true); }, []);

    // Batch 5 item 3: `matchMedia` (not a resize listener) so the chip bar also
    // tracks orientation changes / devtools docking without layout thrash.
    useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const mq = window.matchMedia(compactSuggestionsQuery());
      const sync = () => setIsCompact(mq.matches);
      sync();
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }, []);

    // Re-sync overlay + gutter + tint after `value` changes from outside
    // (format, undo, task switch, controlled parent). rAF so the textarea
    // has already laid out and scrollTop/scrollHeight are final.
    useEffect(() => {
      const id = requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        if (highlightRef.current) {
          highlightRef.current.scrollTop = ta.scrollTop;
          highlightRef.current.scrollLeft = ta.scrollLeft;
        }
        if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
        const line = ta.value.slice(0, ta.selectionStart).split('\n').length;
        setActiveLine(line);
        setActiveLineTintTop((line - 1) * 22 + 12 - ta.scrollTop);
      });
      return () => cancelAnimationFrame(id);
    }, [value]);

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
          `$1<span class="underline decoration-wavy decoration-error text-error bg-error/15">$2</span>$3`,
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
            return `<span class="text-func bg-func/25 rounded-xs ring-1 ring-func/60">${ch}</span>`;
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
        historyBoost: liveHistoryBoost(),
      });

    // Logical-line tint geometry lives here (Phase 4): the tint tracks the
    // LOGICAL line (22px rows + 12px pad) minus scroll. Wrapped visual rows
    // are handled by measuring the real caret (placeWidget) for the dropdown.
    const lineToTintTop = (line: number, scrollTop: number) =>
      (line - 1) * 22 + 12 - scrollTop;

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
      setActiveLineTintTop(lineToTintTop(line, ta.scrollTop));
      setScrollTick((t) => t + 1);
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
      setActiveLineTintTop(lineToTintTop(line, scrollTop));
    };

    /** Cancel a pending debounced suggestion pass. */
    const cancelPendingSuggestionUpdate = () => {
      if (suggestTimerRef.current !== null) {
        clearTimeout(suggestTimerRef.current);
        suggestTimerRef.current = null;
      }
    };

    /**
     * Batch 5 item 2 — local telemetry. A `shown` event is recorded once per
     * distinct (prefix, count) episode: the pass re-runs on every keystroke and
     * after every prop change, so recording unconditionally would flood the ring
     * buffer with duplicates of the same list.
     */
    const recordShownEvent = (
      prefix: string,
      count: number,
      passStart: number,
      ctx: SuggestionContext,
    ) => {
      const key = `${prefix}|${count}`;
      if (telemetryRef.current?.key === key) return;
      telemetryRef.current = { prefix, key, at: Date.now() };
      recordSuggestEvent({
        kind: 'shown',
        prefix,
        ctx,
        count,
        passMs: Math.round(performance.now() - passStart),
      });
    };

    /**
     * Batch 5 item 2: close the open session with the user's decision plus how
     * long they took. No-op when no list is open, so a stray key never writes a
     * decision for a list that was never shown.
     */
    const recordDecisionEvent = (kind: 'accepted' | 'dismissed', text?: string) => {
      const session = telemetryRef.current;
      if (!session) return;
      telemetryRef.current = null;
      recordSuggestEvent({
        kind,
        prefix: session.prefix,
        decisionMs: Math.max(0, Date.now() - session.at),
        text,
      });
    };

    /** The list closed without an accept/dismiss: end the session so the next
     *  open of the same prefix is recorded as a fresh episode. */
    const closeTelemetrySession = () => {
      telemetryRef.current = null;
    };

    /**
     * Cheap, latency-sensitive caret bookkeeping. Runs on EVERY keystroke so the
     * line tint, caret position and signature hint never lag behind the caret.
     */
    const updateCaretState = (text: string, caret: number) => {
      setCaretPos(caret);
      updateLineFromCaret(text, caret);
      // Batch 5 item 6: highlight the argument the caret sits in. Compares the
      // rendered pieces so a caret move inside the same argument does not
      // re-render the hint bar.
      const active = findActiveSignature(text.slice(0, caret));
      const parts = active ? signatureParts(active) : null;
      setSignature((prev) => (sameSignature(prev, parts) ? prev : parts));
    };

    /**
     * Expensive suggestion pass: builds the whole candidate pool, re-measures the
     * caret with the hidden mirror div and places the dropdown/ghost. Debounced
     * per keystroke (Batch 5 item 1); explicit open paths pass `immediate`.
     *
     * Returns the candidates that were shown, or `null` when the list stayed
     * closed — so a key handler that must decide on the SAME keystroke (Tab /
     * Enter accepting the highlighted row) can flush a queued pass and use its
     * result immediately instead of waiting for a re-render.
     */
    const recomputeSuggestions = (text: string, caret: number): Suggestion[] | null => {
      // Batch 5 item 2: timed so the telemetry panel can flag slow passes.
      const passStart = performance.now();
      const textBefore = text.slice(0, caret);
      const prefix = completionPrefix(textBefore);
      const token = prefix.includes('.')
        ? prefix.slice(prefix.lastIndexOf('.') + 1)
        : prefix;
      const dismissKey = suggestionDismissKey(prefix);

      if (prefix.length >= 1 || textBefore.endsWith('.') || textBefore.endsWith(' ')) {
        if (dismissedWord && dismissKey === dismissedWord) {
          setShowSuggestions(false);
          closeTelemetrySession();
          return null;
        }
        if (dismissedWord !== null && dismissKey !== dismissedWord) {
          setDismissedWord(null);
        }
        const matched = computeMatches(prefix, textBefore);
        if (
          shouldAutoOpenSuggestions({
            token,
            prefix,
            textBeforeCursor: textBefore,
            hasMatches: matched.length > 0,
            dismissedWord,
          })
        ) {
          const sameList =
            matched.length === suggestions.length &&
            matched.every((m, i) => m.text === suggestions[i]?.text);
          setSuggestions(matched);
          setSelectedIdx(sameList ? selectedIdx : 0);
          // Accept-first: the list always opens with the first candidate selected,
          // so `Enter` accepts it without an arrow press.
          setShowSuggestions(true);
          // The caret mirror-div measurement only exists to position the portal
          // dropdown; compact viewports use the chip bar below the editor.
          if (!isCompact) placeWidget(textBefore, matched);
          recordShownEvent(prefix, matched.length, passStart, suggestionContext(prefix, textBefore));
          return matched;
        }
      }
      setShowSuggestions(false);
      closeTelemetrySession();
      return null;
    };

    /**
     * Authoritative list state for a keystroke that acts ON the list.
     *
     * Batch A fix: this ALWAYS evaluates the text under the caret and returns
     * the list it decided on (`null` = closed), instead of returning `null` both
     * for "no pass was queued" and for "the pass closed the list". The old
     * ambiguity made the caller fall back to stale `showSuggestions`, so typing
     * `SEL` then a space and pressing Tab/Enter within the debounce window acted
     * on a list that no longer belonged to the caret (`SEL ` + Tab inserted
     * `SELECT` instead of indenting).
     *
     * Skipped when nothing is being completed (empty token, no trailing dot):
     * `Tab` for indentation and `Enter` after a space are hot paths and must not
     * pay for a full pool build that can only return "closed".
     */
    const flushPendingSuggestionUpdate = (text: string, caret: number): Suggestion[] | null => {
      cancelPendingSuggestionUpdate();
      const textBefore = text.slice(0, caret);
      if (!completionPrefix(textBefore) && !textBefore.endsWith('.')) return null;
      return recomputeSuggestions(text, caret);
    };

    /**
     * Single entry point for caret + suggestion updates. `immediate` bypasses the
     * debounce for explicit requests (Ctrl+Space, mouse click) and for paths that
     * must invalidate a queued pass (Enter/Tab/Esc/blur all cancel it first so a
     * queued pass can never re-open a list the user just dismissed).
     */
    const updateCursorAndSuggestions = (text: string, caret: number, immediate = false) => {
      updateCaretState(text, caret);
      cancelPendingSuggestionUpdate();
      if (immediate) {
        recomputeSuggestions(text, caret);
        return;
      }
      suggestTimerRef.current = setTimeout(() => {
        suggestTimerRef.current = null;
        recomputeSuggestions(text, caret);
      }, SUGGESTION_DEBOUNCE_MS);
    };

    // Never leave a timer behind on unmount (task switch, route change).
    useEffect(() => cancelPendingSuggestionUpdate, []);

    /**
     * Batch 4 ghost text: inline preview of the top suggestion at the caret.
     * A dotted prefix (`c.`) previews the column tail, a plain prefix the
     * keyword/table tail. `ArrowRight`/`Tab` complete it; typing dismisses it.
     */
    useEffect(() => {
      const ta = textareaRef.current;
      // Compact: chips render the whole suggestion text, and there is no `→`
      // key on a touch keyboard to accept a ghost — skip the measurement.
      if (!ta || isCompact || !showSuggestions || suggestions.length === 0) {
        setGhost((g) => (g === null ? g : null));
        return;
      }
      const textBefore = value.slice(0, caretPos);
      const prefix = completionPrefix(textBefore);
      if (!prefix) {
        setGhost((g) => (g === null ? g : null));
        return;
      }
      const remainder = ghostRemainder(prefix, suggestions[0].text);
      if (!remainder) {
        setGhost((g) => (g === null ? g : null));
        return;
      }
      const pos = measureCaret(ta, textBefore);
      setGhost((g) =>
        g && g.text === remainder && g.top === pos.top && g.left === pos.left
          ? g
          : { text: remainder, top: pos.top, left: pos.left },
      );
    }, [value, caretPos, suggestions, showSuggestions, scrollTick, isCompact]);

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
      // Accepting is an explicit end to the current suggestion session: drop any
      // queued pass so it cannot reopen the list over the inserted text.
      cancelPendingSuggestionUpdate();
      const current = ta.value;
      const caret = ta.selectionStart;
      const text = item && typeof item === 'object' ? item.text : item;
      recordSuggestionPick(text);
      // Batch 5 item 2: close the telemetry session with the accept + think-time.
      recordDecisionEvent('accepted', text);
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
      const textBefore = ta.value.slice(0, start);
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Keys that act ON the list must see THIS keystroke's candidates: the
      // debounced pass has not run yet, and stale state must never decide
      // (Batch A). Ctrl/Cmd+Enter only runs, so it never needs the list.
      const actsOnList =
        e.key === 'Tab' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowRight' ||
        (e.key === 'Enter' && !ctrlOrMeta);
      const evaluated = actsOnList ? flushPendingSuggestionUpdate(ta.value, start) : undefined;
      const list = evaluated ?? (actsOnList ? [] : suggestionsRef.current);
      const open = actsOnList ? list.length > 0 : showSuggestions && list.length > 0;
      const sel = selectedIdxRef.current;
      const selected = list.length > 0 ? list[Math.min(sel, list.length - 1)] : undefined;

      /**
       * The inline ghost previews the FIRST candidate and `ArrowRight` only
       * completes it when nothing follows the caret on its line — otherwise the
       * learner is just moving the caret (mirrors VS Code). Restricted to
       * `sel === 0` so every accept path means the same thing.
       */
      const ghostAvailable =
        sel === 0 &&
        list.length > 0 &&
        ghostRemainder(completionPrefix(textBefore), list[0].text) !== '' &&
        !/^[^\n]*\S/.test(ta.value.slice(start));

      // One pure decision function owns the dispatch order (see editor-layout):
      // every past regression of this contract came from branch ordering.
      const action = resolveSuggestionKeyAction({
        key: e.key,
        ctrlOrMeta,
        shift: e.shiftKey,
        open,
        listLength: list.length,
        noOpCompletion: !!selected && isNoOpCompletion(textBefore, selected.text),
        ghostAvailable,
      });

      switch (action) {
        case 'run': {
          e.preventDefault();
          cancelPendingSuggestionUpdate();
          setShowSuggestions(false);
          onRun?.(value);
          return;
        }
        case 'accept': {
          e.preventDefault();
          if (selected) applySuggestion(selected);
          return;
        }
        case 'step-next': {
          e.preventDefault();
          setSelectedIdx((p) => (p + 1) % list.length);
          return;
        }
        case 'step-prev': {
          e.preventDefault();
          setSelectedIdx((p) => (p - 1 + list.length) % list.length);
          return;
        }
        case 'dismiss': {
          // Only the open list is ours; a closed list falls through so Esc can
          // still clear the signature bar below.
          if (open) {
            e.preventDefault();
            cancelPendingSuggestionUpdate();
            setShowSuggestions(false);
            setDismissedWord(suggestionDismissKey(completionPrefix(textBefore)) || null);
            // Batch 5 item 2: a dismissal is the strongest "this list missed" signal.
            recordDecisionEvent('dismissed');
            return;
          }
          break;
        }
        case 'close-and-default': {
          // Close the list, then let the key do its native job: Tab indents and
          // Enter inserts a newline. This is what keeps a no-op completion
          // (typed text already equals the candidate) down to one keystroke.
          cancelPendingSuggestionUpdate();
          setShowSuggestions(false);
          break;
        }
        default:
          break;
      }

      if (e.key === 'Escape' && signature) {
        e.preventDefault();
        setSignature(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        cancelPendingSuggestionUpdate();
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

    const lineCount = gutterLineCount(value);
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
                __html: toOverlayHtml(highlightedCode, value),
              }}
            />
            {/* Batch 4 ghost text — inline preview of the top suggestion at the
                caret. Purely visual: `value` is untouched until accepted with
                Tab / ArrowRight / click. */}
            {ghost && (
              <div
                aria-hidden="true"
                className="absolute pointer-events-none select-none z-[5] font-mono text-[13px] leading-[22px] whitespace-pre text-text-faint/70 italic"
                style={{ top: `${ghost.top}px`, left: `${ghost.left}px` }}
              >
                {ghost.text}
              </div>
            )}

            <textarea
              id={textareaId}
              ref={textareaRef}
              value={value}
              disabled={readOnly}
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              // Compact viewport renders chips instead of the portal dropdown, so
              // the combobox must not point at an element that is not mounted.
              aria-controls={isCompact ? undefined : 'autocomplete-dropdown'}
              aria-activedescendant={
                !isCompact && showSuggestions && suggestions.length > 0
                  ? `suggestion-option-${selectedIdx}`
                  : undefined
              }
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
                // Arrow keys move the caret — update line tint instantly.
                // Always read `e.currentTarget.value`: the `value` prop can still
                // be the PREVIOUS keystroke inside the same event burst.
                if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'ArrowRight') {
                  updateLineFromCaret(e.currentTarget.value, e.currentTarget.selectionStart);
                  return;
                }
                updateCursorAndSuggestions(
                  e.currentTarget.value,
                  e.currentTarget.selectionStart,
                );
              }}
              onSelect={(e) => {
                // Fires on all caret/selection movements (mouse drag, keyboard, etc.)
                updateLineFromCaret(e.currentTarget.value, e.currentTarget.selectionStart);
              }}
              onClick={(e) =>
                // Explicit user intent: bypass the debounce so the list feels instant.
                updateCursorAndSuggestions(e.currentTarget.value, e.currentTarget.selectionStart, true)
              }
              onKeyDown={handleKeyDown}
              onBlur={() => {
                cancelPendingSuggestionUpdate();
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

            {/* Batch 5 item 5 — screen-reader announcement of the list. `sr-only`
                keeps it out of the layout, and the text only changes when the
                list or the selection really changes, so it does not chatter. */}
            <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
              {suggestionAnnouncement({
                open: showSuggestions,
                count: suggestions.length,
                selectedText: suggestions[selectedIdx]?.text ?? null,
              })}
            </div>

            {/* Batch 5 item 6 — signature bar with the ACTIVE argument emphasised,
                so `SUBSTRING(text, |, length)` shows which arg is expected next. */}
            {signature && (
              <div
                title={signature.text}
                className="absolute bottom-2 left-3 right-3 z-40 pointer-events-none text-[10px] font-mono text-text-dim bg-surface/90 border border-border rounded px-2 py-1 truncate"
              >
                <span>{signature.before}</span>
                <span className="text-func font-bold">{signature.active}</span>
                <span>{signature.after}</span>
              </div>
            )}

          </div>
        </div>

        {/* Batch 5 item 3 — compact suggestion chips. Below `sm` the floating
            portal dropdown would sit under the on-screen keyboard (and there is
            no Tab/arrow key to reach it), so the same suggestions render as a
            horizontally scrollable, tap-to-accept chip bar instead. */}
        {isCompact && showSuggestions && suggestions.length > 0 && (
          <div
            id="autocomplete-dropdown"
            role="listbox"
            aria-label="SQL suggestions"
            className="flex items-stretch gap-1.5 overflow-x-auto overscroll-contain px-2 py-1.5 bg-surface border-t border-border autosuggest-scrollbar"
          >
            {suggestions.map((sug, idx) => (
              <button
                key={`chip-${sug.type}-${sug.text}`}
                type="button"
                role="option"
                aria-selected={idx === selectedIdx}
                data-suggestion-chip={idx}
                // Keep focus in the textarea: without this, tapping a chip blurs
                // the editor and the on-screen keyboard collapses mid-completion.
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => applySuggestion(sug)}
                className={`shrink-0 max-w-[70vw] flex items-center gap-1.5 px-2 py-1 rounded border font-mono text-[11px] transition cursor-pointer ${
                  idx === 0
                    ? 'border-func/40 bg-func/10 text-text'
                    : 'border-border bg-surface-2 text-text-dim'
                }`}
              >
                <span className="font-semibold truncate">{sug.text}</span>
                <span className="text-[9px] text-text-faint shrink-0">{kindLabel(sug)}</span>
              </button>
            ))}
          </div>
        )}
        {/* Autocomplete dropdown — rendered via portal so it escapes all overflow:hidden ancestors.
            Compact viewports use the chip bar above instead (the dropdown would
            be hidden behind the on-screen keyboard). */}
        {mounted && !isCompact && showSuggestions && suggestions.length > 0 && createPortal(
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
                Enter ↵ accept · ↑↓ · Esc
              </span>
            </div>
            {/* Scrollable item list */}
            <div
              ref={listRef}
              role="listbox"
              aria-label="SQL suggestions"
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
                    id={`suggestion-option-${idx}`}
                    data-suggestion-idx={idx}
                    role="option"
                    aria-selected={idx === selectedIdx}
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
                    <span className="flex items-center gap-2 shrink-0">
                      {sug.doc && (
                        <span className="text-[9px] text-text-faint normal-case font-sans truncate max-w-[220px]">
                          {truncateDoc(sug.doc)}
                        </span>
                      )}
                      <span className="text-[9px] text-text-faint px-1.5 py-0.2 rounded bg-surface border border-border">
                        {kindLabel(sug)}
                      </span>
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
              <div><kbd>→</kbd> accept inline preview</div>
              <div><kbd>Enter</kbd> accept selected · newline when closed</div>
              <div><kbd>Shift+Enter</kbd> newline</div>
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
