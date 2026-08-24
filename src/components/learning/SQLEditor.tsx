import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, CheckCircle2, RotateCcw, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: (sql: string) => void;
  onSubmit: (sql: string) => void;
  tableName?: string;
  evaluationState?: 'idle' | 'wrong' | 'correct';
  nextActionLabel?: string;
  onNextAction?: () => void;
  readOnly?: boolean;
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE',
  'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE'
];

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRun,
  onSubmit,
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
        .slice(0, 6)
        .map(i => i.text);

      if (matched.length > 0) {
        setSuggestions(matched);
        setSelectedSuggestionIdx(0);
        setShowSuggestions(true);
        
        // Approximate position
        const lines = textBeforeCursor.split('\n');
        const currLineIdx = lines.length - 1;
        const colIdx = lines[currLineIdx].length;
        setSuggestionCoords({
          top: Math.min(currLineIdx * 22 + 28, 140),
          left: Math.min(colIdx * 8.5 + 48, 280),
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
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Ctrl+Enter or Cmd+Enter -> Run query or submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (evaluationState === 'correct' && onNextAction) {
        onNextAction();
      } else {
        onSubmit(value);
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

  // Syntax highlighting builder
  const highlightedCode = useMemo(() => {
    if (!value) return '';

    // Tokenize strings, numbers, keywords, and comments
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight comments (-- comment)
    let processed = escaped.replace(/(--[^\n]*)/g, '<span class="text-zinc-500 italic">$1</span>');

    // Highlight strings ('string')
    processed = processed.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');

    // Highlight numbers
    processed = processed.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-amber-300 font-semibold">$1</span>');

    // Highlight SQL Keywords (case-insensitive word boundary)
    SQL_KEYWORDS.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
      processed = processed.replace(regex, (match) => {
        // don't replace inside span tags
        return `<span class="text-cyan-400 font-bold">${match.toUpperCase()}</span>`;
      });
    });

    return processed;
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFormat = () => {
    let formatted = value;
    SQL_KEYWORDS.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    onChange(formatted);
  };

  const handleQuickSnippet = (snippet: string) => {
    onChange(snippet);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const lineCount = Math.max(value.split('\n').length, 4);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div id="sql-editor-container" className="flex flex-col bg-[#121820] rounded-xl border border-zinc-700/60 overflow-hidden shadow-xl text-zinc-100">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1217] border-b border-zinc-700/60 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wide">
            query.sql
          </span>
          <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
            Active: {tableName}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="format-sql-btn"
            onClick={handleFormat}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Format uppercase SQL keywords"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            id="copy-sql-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Copy SQL to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
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
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Reset to default query"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor Surface */}
      <div className="relative min-h-[140px] max-h-[260px] flex font-mono text-[13.5px] leading-[22px] bg-[#0e141b] overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-11 select-none py-3 bg-[#0d1217] text-zinc-400 text-right pr-3 font-mono border-r border-zinc-800/80 flex flex-col shrink-0">
          {lines.map((ln) => (
            <div
              key={ln}
              className={`h-[22px] text-[11px] font-medium transition-colors ${
                ln === activeLine ? 'text-cyan-400 font-bold bg-cyan-950/40 -mr-3 pr-3' : ''
              }`}
            >
              {ln}
            </div>
          ))}
        </div>

        {/* Textarea & Syntax Overlay Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlight Overlay */}
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-zinc-100 font-mono text-[13.5px] leading-[22px] select-none"
            dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
          />

          {/* Actual Editable Textarea */}
          <textarea
            id="sql-query-textarea"
            ref={textareaRef}
            value={value}
            disabled={readOnly}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorAndSuggestions(e.target.value, e.target.selectionStart);
            }}
            onKeyUp={(e) => updateCursorAndSuggestions(value, e.currentTarget.selectionStart)}
            onClick={(e) => updateCursorAndSuggestions(value, e.currentTarget.selectionStart)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder={`-- Type your SQL query here\nSELECT * FROM ${tableName};`}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full p-3 bg-transparent text-zinc-100 caret-cyan-400 font-mono text-[13.5px] leading-[22px] resize-none outline-none overflow-y-auto scrollbar-thin border-none"
          />

          {/* Autocomplete Popup */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="autocomplete-dropdown"
              className="absolute z-30 bg-[#1e2733] border border-cyan-500/40 rounded-lg shadow-2xl overflow-hidden py-1 min-w-[140px]"
              style={{ top: `${suggestionCoords.top}px`, left: `${suggestionCoords.left}px` }}
            >
              <div className="px-2 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300 font-bold bg-zinc-900/60 border-b border-zinc-700/50">
                Suggestions (Tab ⇥)
              </div>
              {suggestions.map((sug, idx) => (
                <div
                  key={sug}
                  onClick={() => applySuggestion(sug)}
                  className={`px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between ${
                    idx === selectedSuggestionIdx
                      ? 'bg-cyan-600/30 text-cyan-300 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-700/50'
                  }`}
                >
                  <span>{sug}</span>
                  <span className="text-[10px] text-zinc-300">
                    {SQL_KEYWORDS.includes(sug.toUpperCase()) ? 'keyword' : 'column'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Quick Chips */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0d1217] border-t border-zinc-800/80 overflow-x-auto text-xs scrollbar-none">
        <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mr-1 shrink-0">
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
            className="px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-cyan-950/60 hover:text-cyan-300 text-zinc-300 text-[11px] font-mono border border-zinc-700/60 transition shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#11171f] border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">
            Ctrl + Enter
          </kbd>
          <span className="hidden sm:inline">to execute</span>
        </div>

        {/* Dual Actions: Run Query (Preview) & Submit / Next Action */}
        <div className="flex items-center gap-2.5">
          {/* Run Preview Button */}
          <button
            id="run-query-btn"
            type="button"
            onClick={() => onRun(value)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600/70 transition cursor-pointer active:scale-95"
            title="Execute query and inspect results table"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            <span>Run Preview</span>
          </button>

          {/* Stateful Submit / Next Button */}
          {evaluationState === 'correct' && onNextAction ? (
            <button
              id="next-task-btn"
              type="button"
              onClick={onNextAction}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition cursor-pointer animate-pulse active:scale-95"
            >
              <span>{nextActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="submit-answer-btn"
              type="button"
              onClick={() => onSubmit(value)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold font-mono text-white transition cursor-pointer shadow-md active:scale-95 ${
                evaluationState === 'wrong'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{evaluationState === 'wrong' ? 'Re-Evaluate' : 'Submit Answer'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
