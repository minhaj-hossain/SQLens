import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Play,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { DATABASE_SCHEMAS } from "../../content/database/schema";
import { highlightSql, SQL_KEYWORDS } from "@/lib/highlight-sql";
import { EDITOR_TEXT_STYLE } from "@/lib/editor-text-style";
import { buildSuggestions } from "@/lib/autocomplete";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunAndCheck: (sql: string) => void;
  tableName?: string;
  evaluationState?: "idle" | "wrong" | "correct";
  nextActionLabel?: string;
  onNextAction?: () => void;
  readOnly?: boolean;
  /** Task guidance shown as the empty-editor placeholder (replaces in-code comments). */
  placeholder?: string;
  /** P11.2: in-flow step-chain Back, rendered left of Run & Check. */
  onBack?: () => void;
  backLabel?: string;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRunAndCheck,
  tableName = "products",
  evaluationState = "idle",
  nextActionLabel = "Next Task",
  onNextAction,
  readOnly = false,
  placeholder,
  onBack,
  backLabel = "Back",
}) => {
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [activeLine, setActiveLine] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionCoords, setSuggestionCoords] = useState({ top: 0, left: 0 });
  // Word the user dismissed with Esc — suggestions stay hidden while this word
  // is still at the cursor; typing a different word (or Ctrl+Space) re-opens.
  const [dismissedWord, setDismissedWord] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Context-aware autocomplete lives in the pure buildSuggestions() module
  // (tracker item 12): tables stay in FROM/JOIN, columns belong to the tables
  // actually referenced, and clause keywords appear only at clause boundaries.
  const computeMatches = (word: string, textBefore: string) =>
    buildSuggestions({
      prefix: word,
      queryBeforeCursor: textBefore,
      schemas: DATABASE_SCHEMAS,
      fallbackTable: tableName,
      limit: 5,
    }).map((i) => i.text);

  // Sync scrolling between textarea and syntax highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Update active line and suggestions based on cursor
  const updateCursorAndSuggestions = (text: string, selectionStart: number) => {
    setCursorPos(selectionStart);

    // Calculate active line
    const textBeforeCursor = text.slice(0, selectionStart);
    const lineNum = textBeforeCursor.split("\n").length;
    setActiveLine(lineNum);

    // Extract current word
    const match = textBeforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (match && match[1].length >= 1) {
      const currentWord = match[1].toUpperCase();
      // Respect an Esc dismissal: same word at the cursor keeps the panel shut.
      if (dismissedWord === currentWord) {
        setShowSuggestions(false);
        return;
      }
      if (dismissedWord !== null) setDismissedWord(null); // different word -> re-open
      const matched = computeMatches(currentWord, textBeforeCursor);

      if (matched.length > 0) {
        setSuggestions(matched);
        // Only reset the highlighted suggestion when the list actually changed —
        // otherwise ArrowUp/ArrowDown keyup re-runs this and snaps the
        // selection back to the first item (bug: could not navigate with arrows).
        const sameList =
          matched.length === suggestions.length &&
          matched.every((m, i) => m === suggestions[i]);
        setSelectedSuggestionIdx(sameList ? selectedSuggestionIdx : 0);
        setShowSuggestions(true);

        // Calculate safe position inside editor
        const lines = textBeforeCursor.split("\n");
        const currLineIdx = lines.length - 1;
        const colIdx = lines[currLineIdx].length;

        // If cursor is at line 3 or lower, position dropdown above line to avoid clipping
        const dropdownHeight = matched.length * 30 + 36;
        const isNearBottom = currLineIdx >= 3;
        const topPos = isNearBottom
          ? Math.max(8, currLineIdx * 22 - dropdownHeight)
          : currLineIdx * 22 + 30;
        const leftPos = Math.min(Math.max(colIdx * 8 + 12, 12), 220);

        setSuggestionCoords({
          top: topPos,
          left: leftPos,
        });
        return;
      }
    }
    setShowSuggestions(false);
  };

  const applySuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    // Live caret position — the `cursorPos` state can be stale between renders.
    const caret = textareaRef.current.selectionStart ?? cursorPos;
    const textBeforeCursor = value.slice(0, caret);
    const textAfterCursor = value.slice(caret);

    // Replace the region the suggestion actually completes. When the user typed
    // the SECOND word of a multi-word keyword (`ORDER B` -> ORDER BY), the
    // suggestion covers both tokens — swap them as a unit, not just the last.
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (wordMatch) {
      const typedWord = wordMatch[1];
      const typedBefore = textBeforeCursor.slice(0, -typedWord.length);
      const prevMatch = typedBefore.match(/([a-zA-Z0-9_]+)$/);
      const bothTyped = prevMatch ? `${prevMatch[1]} ${typedWord}` : typedWord;
      const su = suggestion.toUpperCase();
      const replaceBoth =
        !!prevMatch && su.startsWith(bothTyped.toUpperCase()) && bothTyped.includes(' ');
      const replaceLen = replaceBoth ? bothTyped.length : typedWord.length;

      const newBefore = textBeforeCursor.slice(0, -replaceLen) + suggestion;
      const newValue = newBefore + textAfterCursor;
      onChange(newValue);
      setShowSuggestions(false);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = newBefore.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Autocomplete Navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIdx(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        const m = value
          .slice(0, e.currentTarget.selectionStart)
          .match(/([a-zA-Z0-9_]+)$/);
        setDismissedWord(m ? m[1].toUpperCase() : null);
        return;
      }
    }

    // Ctrl+Space -> force-open suggestions (even after Esc, even with no prefix)
    if (e.ctrlKey && e.code === "Space") {
      e.preventDefault();
      const selStart = e.currentTarget.selectionStart;
      const m = value.slice(0, selStart).match(/([a-zA-Z0-9_]+)$/);
      const prefix = m ? m[1].toUpperCase() : "";
      const matched = computeMatches(prefix, value.slice(0, selStart));
      if (matched.length === 0 && prefix) {
        // Empty prefix forces the panel open; keep it cheap and context-aware.
        setSuggestions([]);
      }
      setDismissedWord(null);
      setSuggestions(matched);
      setSelectedSuggestionIdx(0);
      setShowSuggestions(true);
      const lines = value.slice(0, selStart).split("\n");
      const currLineIdx = lines.length - 1;
      const colIdx = lines[currLineIdx].length;
      const dropdownHeight = matched.length * 30 + 36;
      const topPos =
        currLineIdx >= 3
          ? Math.max(8, currLineIdx * 22 - dropdownHeight)
          : currLineIdx * 22 + 30;
      setSuggestionCoords({
        top: topPos,
        left: Math.min(Math.max(colIdx * 8 + 12, 12), 220),
      });
      return;
    }

    // Ctrl+Enter or Cmd+Enter -> Run & Check (or go Next if already correct)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false); // always dismiss autocomplete first
      if (evaluationState === "correct" && onNextAction) {
        onNextAction();
      } else {
        onRunAndCheck(value);
      }
      return;
    }

    // Tab key indent
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Syntax highlighting — the shared grayscale tokenizer (P9.2c: ONE
  // highlighter app-wide; same recipe as lesson pages / challenge / playground).
  const highlightedCode = useMemo(() => {
    if (!value) return "";
    return highlightSql(value);
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFormat = () => {
    if (!value.trim()) return;

    let formatted = value;

    // Protect string literals
    const stringLiterals: string[] = [];
    formatted = formatted.replace(/'(?:[^'\\]|\\.)*'/g, (match) => {
      stringLiterals.push(match);
      return `__STR_LITERAL_${stringLiterals.length - 1}__`;
    });

    // Uppercase keywords
    SQL_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      formatted = formatted.replace(regex, kw);
    });

    // Format major clause starts on new lines if currently on one line
    const majorClauses = [
      "SELECT",
      "FROM",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "JOIN",
      "WHERE",
      "GROUP BY",
      "HAVING",
      "ORDER BY",
      "LIMIT",
      "OFFSET",
      "UNION",
      "WITH",
    ];

    majorClauses.forEach((clause) => {
      const regex = new RegExp(`(?<!\\n)\\b${clause}\\b`, "g");
      formatted = formatted.replace(regex, (match, offset) => {
        return offset === 0 ? match : `\n${match}`;
      });
    });

    // Restore string literals
    formatted = formatted.replace(/__STR_LITERAL_(\d+)__/g, (_, idx) => {
      return stringLiterals[Number(idx)] || "";
    });

    // Normalize spacing
    formatted = formatted
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0),
      )
      .join("\n");

    onChange(formatted);
  };

  const lineCount = Math.max(value.split("\n").length, 4);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div
      id="sql-editor-container"
      className="flex flex-col bg-editor-bg rounded-xl border border-border text-editor-text relative"
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border-soft select-none rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-text-faint/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-surface-3 inline-block"></span>
          </div>
          <span className="text-[11px] font-mono text-text font-semibold tracking-wide">
            query.sql
          </span>
          <span className="hidden sm:inline-block text-[10px] text-text-faint px-2 py-0.5 rounded bg-surface border border-border">
            Active: {tableName}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="format-sql-btn"
            onClick={handleFormat}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface rounded transition cursor-pointer"
            title="Format uppercase SQL keywords"
          >
            <Sparkles className="w-3.5 h-3.5 text-text-dim" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            id="copy-sql-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface rounded transition cursor-pointer"
            title="Copy SQL to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-text" />
                <span className="text-text">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            id="reset-sql-btn"
            onClick={() => onChange(`SELECT * FROM ${tableName};`)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-text-faint hover:text-text hover:bg-surface rounded transition cursor-pointer"
            title="Reset to default query"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor Surface */}
      <div className="relative min-h-[160px] max-h-[280px] flex font-mono text-[13px] leading-[22px] bg-editor-bg">
        {/* Line Numbers Gutter */}
        <div className="w-11 select-none py-3 bg-editor-gutter text-text-faint text-right pr-3 font-mono border-r border-border-soft flex flex-col shrink-0">
          {lines.map((ln) => (
            <div
              key={ln}
              className={`h-[22px] text-[11px] font-medium transition-colors ${
                ln === activeLine
                  ? "text-func font-bold bg-editor-active-line shadow-[inset_2px_0_0_0_var(--func)] -mr-3 pr-3"
                  : ""
              }`}
            >
              {ln}
            </div>
          ))}
        </div>

        {/* Textarea & Syntax Highlight Layer Surface */}
        <div className="relative flex-1 h-full min-h-[160px]">
          {/* Syntax Highlight Overlay (renders dimmed comments, colored keywords & strings) */}
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="sql-editor-overlay absolute inset-0 p-3 pointer-events-none select-none font-mono text-[13px] leading-[22px] overflow-hidden whitespace-pre-wrap break-words text-editor-text z-0"
            style={EDITOR_TEXT_STYLE}
            dangerouslySetInnerHTML={{
              __html:
                highlightedCode + (value.endsWith("\n") ? "<br />" : ""),
            }}
          />

          {/* Interactive Native Textarea */}
          <textarea
            id="sql-query-textarea"
            ref={textareaRef}
            value={value}
            disabled={readOnly}
            onScroll={handleScroll}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorAndSuggestions(
                e.target.value,
                e.target.selectionStart,
              );
            }}
            onKeyUp={(e) => {
              // Keyup must not recompute right after Ctrl+Space opened the
              // panel (Space/Ctrl keyup would close it in the same instant).
              // Plain typing is already covered by onChange; clicks by onClick.
              const k = e.key;
              if (
                k === "Control" ||
                k === "Shift" ||
                k === "Alt" ||
                k === "Meta" ||
                e.code === "Space" ||
                k === "Escape" ||
                k === "ArrowDown" ||
                k === "ArrowUp"
              )
                return;
              updateCursorAndSuggestions(value, e.currentTarget.selectionStart);
            }}
            onClick={(e) =>
              updateCursorAndSuggestions(value, e.currentTarget.selectionStart)
            }
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Small delay so autocomplete item mousedown can fire before we close it
              setTimeout(() => setShowSuggestions(false), 100);
            }}
            placeholder={
              placeholder ??
              `Type your SQL query here\nSELECT * FROM ${tableName};`
            }
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{
              ...EDITOR_TEXT_STYLE,
              color: "transparent",
              caretColor: "var(--func)",
              WebkitTextFillColor: "transparent",
            }}
            className="sql-editor-textarea absolute inset-0 w-full h-full p-3 bg-transparent placeholder:text-text-faint placeholder:opacity-40 font-mono text-[13px] leading-[22px] resize-none outline-none overflow-y-auto border-none block selection:bg-editor-selection whitespace-pre-wrap break-words z-10"
          />

          {/* Autocomplete Popup: fully visible, sharp, opaque, never cut off */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="autocomplete-dropdown"
              className="absolute z-50 bg-surface-2 border border-border rounded-lg shadow-2xl overflow-hidden py-1 min-w-[150px] backdrop-blur-none"
              style={{
                top: `${suggestionCoords.top}px`,
                left: `${suggestionCoords.left}px`,
              }}
            >
              <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-text-dim font-bold bg-surface border-b border-border flex items-center justify-between">
                <span>Suggestions</span>
              </div>
              {suggestions.map((sug, idx) => (
                <div
                  key={sug}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(sug);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between gap-2.5 transition ${
                    idx === selectedSuggestionIdx
                      ? "bg-func/15 text-text font-bold"
                      : "text-text-dim hover:bg-surface hover:text-text"
                  }`}
                >
                  <span className="font-semibold">{sug}</span>
                  <span className="text-[9px] text-text-faint px-1.5 py-0.2 rounded bg-surface border border-border">
                    {SQL_KEYWORDS.includes(sug.toUpperCase())
                      ? "SQL"
                      : DATABASE_SCHEMAS[sug.toLowerCase()]
                        ? "TBL"
                        : "COL"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Quick Chips */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-surface border-t border-border-soft overflow-x-auto text-xs scrollbar-none">
        <span className="text-[11px] text-text-faint uppercase tracking-wider font-semibold mr-1 shrink-0">
          Quick:
        </span>
        {["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT", "JOIN"].map(
          (chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                const appended = value.trim()
                  ? `${value} ${chip} `
                  : `${chip} `;
                onChange(appended);
                if (textareaRef.current) textareaRef.current.focus();
              }}
              className="px-2 py-0.5 rounded bg-surface-2 hover:bg-surface hover:text-text text-text-dim text-[11px] font-mono border border-border transition shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ),
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-surface border-t border-border-soft">
        <div className="flex items-center gap-2 text-xs text-text-faint font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-text-dim text-[10px]">
            Ctrl + Enter
          </kbd>
          <span className="hidden sm:inline">to run &amp; check</span>
        </div>

        {/* P11.2: step-chain Back + Single Smart Button: Run -> Check -> Next */}
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={backLabel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-text-dim border border-border bg-surface-2 hover:text-text hover:bg-surface transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          {evaluationState === "correct" && onNextAction ? (
            <button
              id="next-task-btn"
              type="button"
              onClick={onNextAction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold font-sans bg-func hover:brightness-110 text-ink shadow-[0_0_14px_var(--accent-dim)] transition cursor-pointer active:scale-95"
            >
              <span>{nextActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="run-check-btn"
              type="button"
              onClick={() => onRunAndCheck(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold font-sans text-ink transition cursor-pointer active:scale-95 ${
                evaluationState === "wrong"
                  ? "bg-error hover:bg-error/90"
                  : "bg-func hover:brightness-110"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {evaluationState === "wrong" ? "Try Again" : "Run & Check"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
