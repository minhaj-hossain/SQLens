import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, CheckCircle2, RotateCcw, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { highlightSql, SQL_KEYWORDS } from '@/lib/highlight-sql';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunAndCheck: (sql: string) => void;
  tableName?: string;
  evaluationState?: 'idle' | 'wrong' | 'correct';
  nextActionLabel?: string;
  onNextAction?: () => void;
  readOnly?: boolean;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRunAndCheck,
  tableName = 'products',
  evaluationState = 'idle',
  nextActionLabel = 'Next Task',
  onNextAction,
  readOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [activeLine, setActiveLine] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionCoords, setSuggestionCoords] = useState({ top: 0, left: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Available auto-complete items for active table and keywords
  const autocompleteList = useMemo(() => {
    const list: { text: string; type: 'keyword' | 'column' | 'table' }[] = [];
    
    // Keywords
    SQL_KEYWORDS.forEach(kw => list.push({ text: kw, type: 'keyword' }));
    
    // Tables
    Object.keys(DATABASE_SCHEMAS).forEach(tName => {
      list.push({ text: tName, type: 'table' });
    });

    // Columns of active and related tables
    const activeSchema = DATABASE_SCHEMAS[tableName.toLowerCase()];
    if (activeSchema) {
      activeSchema.columns.forEach(col => {
        list.push({ text: col.name, type: 'column' });
      });
    }

    return list;
  }, [tableName]);

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
    const lineNum = textBeforeCursor.split('\n').length;
    setActiveLine(lineNum);

    // Extract current word
    const match = textBeforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (match && match[1].length >= 1) {
      const currentWord = match[1].toUpperCase();
      const matched = autocompleteList
        .filter(item => item.text.toUpperCase().startsWith(currentWord) && item.text.toUpperCase() !== currentWord)
        .slice(0, 5)
        .map(i => i.text);

      if (matched.length > 0) {
        setSuggestions(matched);
        setSelectedSuggestionIdx(0);
        setShowSuggestions(true);
        
        // Calculate safe position inside editor
        const lines = textBeforeCursor.split('\n');
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
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (wordMatch) {
      const wordLength = wordMatch[1].length;
      const newBefore = textBeforeCursor.slice(0, -wordLength) + suggestion;
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
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIdx(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Ctrl+Enter or Cmd+Enter -> Run & Check (or go Next if already correct)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false); // always dismiss autocomplete first
      if (evaluationState === 'correct' && onNextAction) {
        onNextAction();
      } else {
        onRunAndCheck(value);
      }
      return;
    }

    // Tab key indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Syntax highlighting — the shared grayscale tokenizer (P9.2c: ONE
  // highlighter app-wide; same recipe as lesson pages / challenge / playground).
  const highlightedCode = useMemo(() => {
    if (!value) return '';
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
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });

    // Format major clause starts on new lines if currently on one line
    const majorClauses = [
      'SELECT', 'FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'JOIN',
      'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'WITH'
    ];

    majorClauses.forEach((clause) => {
      const regex = new RegExp(`(?<!\\n)\\b${clause}\\b`, 'g');
      formatted = formatted.replace(regex, (match, offset) => {
        return offset === 0 ? match : `\n${match}`;
      });
    });

    // Restore string literals
    formatted = formatted.replace(/__STR_LITERAL_(\d+)__/g, (_, idx) => {
      return stringLiterals[Number(idx)] || '';
    });

    // Normalize spacing
    formatted = formatted
      .split('\n')
      .map(line => line.trim())
      .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
      .join('\n');

    onChange(formatted);
  };

  const lineCount = Math.max(value.split('\n').length, 4);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div id="sql-editor-container" className="flex flex-col bg-editor-bg rounded-xl border border-border text-editor-text relative">
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
                ln === activeLine ? 'text-func font-bold bg-editor-active-line shadow-[inset_2px_0_0_0_var(--func)] -mr-3 pr-3' : ''
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
            className="absolute inset-0 p-3 pointer-events-none select-none font-mono text-[13px] leading-[22px] overflow-hidden whitespace-pre-wrap break-words text-editor-text z-0"
            dangerouslySetInnerHTML={{ __html: highlightedCode + (value.endsWith('\n') ? '<br />&nbsp;' : '') }}
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
              updateCursorAndSuggestions(e.target.value, e.target.selectionStart);
            }}
            onKeyUp={(e) => updateCursorAndSuggestions(value, e.currentTarget.selectionStart)}
            onClick={(e) => updateCursorAndSuggestions(value, e.currentTarget.selectionStart)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Small delay so autocomplete item mousedown can fire before we close it
              setTimeout(() => setShowSuggestions(false), 100);
            }}
            placeholder={`-- Type your SQL query here\nSELECT * FROM ${tableName};`}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{
              tabSize: 2,
              color: 'transparent',
              caretColor: '#f4c430',
              WebkitTextFillColor: 'transparent',
            }}
            className="absolute inset-0 w-full h-full p-3 bg-transparent placeholder:text-text-faint placeholder:opacity-40 font-mono text-[13px] leading-[22px] resize-none outline-none overflow-y-auto scrollbar-thin border-none block selection:bg-editor-selection whitespace-pre-wrap break-words z-10"
          />

          {/* Autocomplete Popup: fully visible, sharp, opaque, never cut off */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="autocomplete-dropdown"
              className="absolute z-50 bg-surface-2 border border-border rounded-lg shadow-2xl overflow-hidden py-1 min-w-[150px] backdrop-blur-none"
              style={{ top: `${suggestionCoords.top}px`, left: `${suggestionCoords.left}px` }}
            >
              <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-text-dim font-bold bg-surface border-b border-border flex items-center justify-between">
                <span>Suggestions</span>
                <span className="text-[9px] text-text-faint font-normal">Tab ↑</span>
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
                      ? 'bg-func/15 text-text font-bold'
                      : 'text-text-dim hover:bg-surface hover:text-text'
                  }`}
                >
                  <span className="font-semibold">{sug}</span>
                  <span className="text-[9px] text-text-faint px-1.5 py-0.2 rounded bg-surface border border-border">
                    {SQL_KEYWORDS.includes(sug.toUpperCase()) ? 'SQL' : 'COL'}
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
        {['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'JOIN'].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              const appended = value.trim() ? `${value} ${chip} ` : `${chip} `;
              onChange(appended);
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="px-2 py-0.5 rounded bg-surface-2 hover:bg-surface hover:text-text text-text-dim text-[11px] font-mono border border-border transition shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-surface border-t border-border-soft">
        <div className="flex items-center gap-2 text-xs text-text-faint font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-text-dim text-[10px]">
            Ctrl + Enter
          </kbd>
          <span className="hidden sm:inline">to run &amp; check</span>
        </div>

        {/* Single Smart Button: Run → Check → Next */}
        <div className="flex items-center gap-2.5">
          {evaluationState === 'correct' && onNextAction ? (
            <button
              id="next-task-btn"
              type="button"
              onClick={onNextAction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold font-sans bg-func hover:brightness-110 text-ink transition cursor-pointer animate-pulse active:scale-95"
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
                evaluationState === 'wrong'
                  ? 'bg-error hover:bg-error/90'
                  : 'bg-func hover:brightness-110'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{evaluationState === 'wrong' ? 'Try Again' : 'Run & Check'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
