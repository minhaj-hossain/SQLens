'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, RotateCcw, Eraser, X, Download, Database, History } from 'lucide-react';
import { SqlExecutor } from '@/lib/sql-engine/executor';
import { QueryExecutionResult } from '@/types/database';
import { DATABASE_SCHEMAS } from '@/content/database/schema';
import { INITIAL_TABLES } from '@/content/database/tables';

const HISTORY_KEY = 'sqlens_playground_history_v1';
const DRAFT_KEY = 'sqlens_playground_draft_v1';
const SCRATCH_DB = { tables: {}, schemas: {} };

/** All schema-known table + column identifiers, used by autocomplete and
 *  "did you mean" typo hints. */
const ALL_TABLES = Object.keys(DATABASE_SCHEMAS);
const ALL_COLUMNS = Array.from(
  new Set(ALL_TABLES.flatMap((t) => DATABASE_SCHEMAS[t]?.columns.map((c) => c.name) ?? [])),
);
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AS',
  'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE WHEN', 'THEN', 'ELSE', 'END',
  'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AND', 'OR', 'NOT',
  'NULL', 'IS NULL', 'IN', 'BETWEEN', 'LIKE', 'ASC', 'DESC', 'WITH',
];

/** Levenshtein distance — powers the "did you mean" typo hint. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1),
      );
  return dp[m][n];
}

/** Suggests the closest known identifier for an unknown one. */
function didYouMean(word: string): string | null {
  const pool = [...ALL_TABLES, ...ALL_COLUMNS];
  let best: string | null = null;
  let bestDist = Infinity;
  for (const cand of pool) {
    const d = editDistance(word, cand);
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }
  // Only suggest when reasonably close (typo, not a different query entirely)
  return best && bestDist <= Math.max(2, Math.floor(best.length / 3)) ? best : null;
}

/** Translates raw engine errors into learner-friendly messages with hints. */
function friendlyError(raw: string): string {
  let msg = raw;

  // Unknown table typos → suggest closest table
  const tableMatch = msg.match(/Table '([^']+)' does not exist/i);
  if (tableMatch) {
    const hint = didYouMean(tableMatch[1]);
    if (hint) msg += `\n\n💡 Did you mean '${hint}'?`;
    return msg;
  }
  const joinTableMatch = msg.match(/Table '([^']+)' in JOIN clause does not exist/i);
  if (joinTableMatch) {
    const hint = didYouMean(joinTableMatch[1]);
    if (hint) msg += `\n\n💡 Did you mean '${hint}'?`;
    return msg;
  }

  const genericMap: [RegExp, string][] = [
    [/Unsupported or unparseable SQL/i,
      'We could not understand this statement.\nCheck the spelling of clauses (SELECT…FROM…WHERE) and make sure the statement is supported.'],
    [/Empty query/i,
      'This statement is empty after removing comments. Did you forget to write SQL?'],
    [/foreign key constraint fails/i,
      'Foreign key violation: the referenced value does not exist in the parent table.\nInsert or reference an existing parent record first.'],
    [/Invalid set-operation/i,
      'Set operations need a valid query on each side of UNION / INTERSECT / EXCEPT, e.g.\n(SELECT … ) UNION (SELECT …)'],
    [/Invalid Common Table Expression/i,
      'CTE syntax is: WITH name AS (SELECT …) SELECT … FROM name;'],
    [/Unsupported statement type/i,
      'This statement type is not supported yet. Supported: SELECT, INSERT, UPDATE, DELETE, CREATE/ALTER/DROP TABLE, WITH (CTE), EXPLAIN.'],
  ];
  for (const [re, human] of genericMap) {
    if (re.test(msg)) return `${msg}\n\n${human}`;
  }

  // Column-like unknowns sometimes come through as generic throws mentioning quotes
  const colMatch = msg.match(/(?:column|Column) '([^']+)'/);
  if (colMatch) {
    const hint = didYouMean(colMatch[1]);
    if (hint) msg += `\n\n💡 Did you mean '${hint}'?`;
  }
  return msg;
}

/** Encodes SQL into a compact URL-safe string for share links. */
function encodeSqlForUrl(sqlText: string): string {
  try {
    const bytes = new TextEncoder().encode(sqlText);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

/** Decodes a share-link payload back to SQL. */
function decodeSqlFromUrl(encoded: string): string | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Splits a SQL script on top-level `;` (quote/paren aware) so each statement
 *  can be executed in order — multi-statement script support. */
function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let current = '';
  let inString: string | null = null;
  let parenDepth = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if ((ch === "'" || ch === '"') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inString) inString = ch;
      else if (inString === ch) inString = null;
      current += ch;
      continue;
    }
    if (inString) {
      current += ch;
      continue;
    }
    if (ch === '(') {
      parenDepth++;
      current += ch;
      continue;
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += ch;
      continue;
    }
    if (ch === ';' && parenDepth === 0) {
      if (current.trim()) out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

interface StmtResult {
  stmt: string;
  r: QueryExecutionResult;
}

interface PlaygroundProps {
  onClose: () => void;
}

export default function Playground({ onClose }: PlaygroundProps) {
  const [sql, setSql] = useState('');
  const [results, setResults] = useState<StmtResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dbMode, setDbMode] = useState<'lesson' | 'scratch'>('lesson');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const execRef = useRef<SqlExecutor | null>(null);

  useEffect(() => {
    // Restore a shared query from the URL hash first (#q=<encoded>), then draft.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/^#q=(.+)$/);
      if (match) {
        const shared = decodeSqlFromUrl(match[1]);
        if (shared !== null && shared.trim()) setSql(shared);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && !sql) setSql(draft);
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        /* corrupted history — ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, sql);
  }, [sql]);

  const run = useCallback(() => {
    if (!sql.trim()) return;
    if (!execRef.current) {
      execRef.current = new SqlExecutor(dbMode === 'scratch' ? (SCRATCH_DB as never) : undefined);
    }
    const exec = execRef.current;
    const statements = splitStatements(sql);
    if (statements.length === 0) return;

    const stmtResults: StmtResult[] = [];
    let firstError: string | null = null;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        const r = exec.execute(stmt);
        stmtResults.push({ stmt, r });
        if (!r.success && r.error && !firstError)
          firstError = `Statement ${i + 1}: ${friendlyError(r.error)}`;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        stmtResults.push({
          stmt,
          r: { success: false, columns: [], rows: [], rowCount: 0, executionTimeMs: 0, error: msg },
        });
        if (!firstError) firstError = `Statement ${i + 1}: ${friendlyError(msg)}`;
      }
    }

    setResults(stmtResults);
    setError(firstError);
    setHistory((prev) => {
      const next = [sql.trim(), ...prev.filter((h) => h !== sql.trim())].slice(0, 15);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* storage full — skip */
      }
      return next;
    });
    setShowHistory(false);
  }, [sql, dbMode]);

  /** Ctrl+Space autocomplete — suggests keywords, tables, and columns matching
   *  the word currently being typed. */
  const showSuggestions = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const upto = sql.slice(0, ta.selectionStart);
    const wordMatch = upto.match(/[A-Za-z_][A-Za-z0-9_.]*$/);
    const prefix = wordMatch ? wordMatch[0].toLowerCase() : '';
    const pool = [...SQL_KEYWORDS, ...ALL_TABLES.map((t) => `${t}`), ...ALL_COLUMNS];
    const matches = Array.from(new Set(pool))
      .filter((cand) => cand.toLowerCase().startsWith(prefix) && prefix.length >= 1)
      .slice(0, 8);
    setSuggestions(matches);
  }, [sql]);

  /** Inserts a suggestion at the caret position. */
  const insertSuggestion = useCallback(
    (s: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const caret = ta.selectionStart;
      const before = sql.slice(0, caret);
      const partial = before.match(/[A-Za-z_][A-Za-z0-9_.]*$/)?.[0] ?? '';
      const replacement = s.includes(' ') ? s : s; // multi-word keywords inserted verbatim
      const nextSql = before.slice(0, before.length - partial.length) + replacement + sql.slice(caret);
      setSql(nextSql);
      setSuggestions([]);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = before.length - partial.length + replacement.length;
        ta.setSelectionRange(pos, pos);
      });
    },
    [sql],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      } else if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        showSuggestions();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const sel = sql.slice(start, end);
        if (!sel) return;
        const hasComment = /^\s*--/.test(sel);
        const newSel = hasComment ? sel.replace(/^\s*--\s*/gm, '') : sel.replace(/^/gm, '-- ');
        setSql(sql.slice(0, start) + newSel + sql.slice(end));
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start, start + newSel.length);
        });
      }
    },
    [run, sql],
  );

  const shareQuery = useCallback(async () => {
    const encoded = encodeSqlForUrl(sql);
    if (!encoded) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?playground=1#q=${encoded}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, [sql]);

  const csvOf = (r: QueryExecutionResult): string => {
    const cols = r.columns || [];
    const esc = (v: unknown): string => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [cols.join(','), ...r.rows.map((row) => cols.map((c) => esc(row[c])).join(','))].join('\n');
  };

  const copyResult = useCallback(async (key: string, r: QueryExecutionResult) => {
    try {
      await navigator.clipboard.writeText(csvOf(r));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const downloadResult = useCallback((key: string, r: QueryExecutionResult) => {
    const blob = new Blob([csvOf(r)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sqlens-query-${key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const resetDb = useCallback(() => {
    execRef.current?.resetDatabase(dbMode === 'scratch' ? (SCRATCH_DB as never) : undefined);
    setResults([]);
    setError(null);
  }, [dbMode]);

  const clearEditor = useCallback(() => {
    setSql('');
    setResults([]);
    setError(null);
    textareaRef.current?.focus();
  }, []);

  const tableNames = Object.keys(DATABASE_SCHEMAS);

  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display font-bold text-sm text-text whitespace-nowrap">
              SQL<span className="text-func">ens</span>
            </span>
            <span className="hidden sm:inline-block text-border font-mono text-xs">/</span>
            <span className="hidden sm:inline-block font-mono text-xs text-func uppercase tracking-wider">
              Playground
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={dbMode}
              onChange={(e) => {
                setDbMode(e.target.value as 'lesson' | 'scratch');
                execRef.current = null;
                setResults([]);
                setError(null);
              }}
              className="font-mono text-[10px] sm:text-xs px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text transition cursor-pointer"
              title="Choose the dataset for this session"
            >
              <option value="lesson">Lesson data</option>
              <option value="scratch">Scratch (empty)</option>
            </select>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border text-xs font-mono transition cursor-pointer ${
                showHistory ? 'border-func/60 text-text' : 'border-border text-text-dim hover:text-text'
              }`}
              title="Query history"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={resetDb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text text-xs font-mono transition cursor-pointer"
              title="Reset the in-memory database"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset DB</span>
            </button>
            <button
              onClick={() => void shareQuery()}
              disabled={!sql.trim()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border text-xs font-mono transition cursor-pointer ${
                shareCopied ? 'border-func/60 text-func' : 'border-border text-text-dim hover:text-text'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Copy a link that opens this exact query"
            >
              {shareCopied ? 'Link copied ✓' : 'Share'}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-error/40 text-error hover:bg-error/10 text-xs font-mono transition cursor-pointer"
              title="Exit playground"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Schema sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-surface overflow-hidden">
            <div className="px-3 py-2.5 bg-surface-2 border-b border-border flex items-center gap-2">
              <Database className="w-4 h-4 text-func" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
                Schema ({tableNames.length})
              </span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1.5">
              {tableNames.map((t) => (
                <div key={t} className="text-xs">
                  <div className="font-mono font-semibold text-func/90 px-1 py-0.5">{t}</div>
                  <div className="px-3 space-y-0.5 text-text-faint font-mono text-[10.5px]">
                    {DATABASE_SCHEMAS[t]?.columns.map((c) => (
                      <div key={c.name} className="flex items-center justify-between gap-2">
                        <span>{c.name}</span>
                        <span className="text-text-faint/70">{c.type}</span>
                      </div>
                    ))}
                    <div className="text-[10px] text-text-faint/70 border-t border-border-soft mt-1 pt-1">
                      {INITIAL_TABLES[t]?.length ?? 0} rows
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Editor + results column */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="relative rounded-xl border border-border bg-[#0B0F17] overflow-visible">
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface/80 border-b border-border/60 rounded-t-xl">
              <span className="font-mono text-[11px] text-text-dim">
                {dbMode === 'lesson' ? 'sqlens.db — lesson dataset' : 'sqlens.db — scratch space'}
              </span>
              <button
                onClick={clearEditor}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-text-dim hover:text-text px-2 py-0.5 rounded hover:bg-surface-2 transition cursor-pointer"
              >
                <Eraser className="w-3 h-3" /> Clear
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={(e) => {
                setSql(e.target.value);
                setSuggestions([]);
              }}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full h-56 p-4 bg-transparent font-mono text-xs sm:text-sm text-primary leading-relaxed outline-none resize-y"
              placeholder="Write SQL here… separate multiple statements with ;  (Ctrl+Space for suggestions)"
            />
            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-[-8px] ml-4 rounded-xl border border-border bg-surface shadow-xl overflow-hidden w-64">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-faint bg-surface-2 border-b border-border">
                  Ctrl+Space suggestions — click or keep typing
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertSuggestion(s);
                    }}
                    className={`w-full text-left px-3 py-1.5 font-mono text-xs hover:bg-surface-2 transition cursor-pointer ${
                      ALL_TABLES.includes(s) ? 'text-func' : 'text-text-dim'
                    }`}
                    title={ALL_TABLES.includes(s) ? 'table' : SQL_KEYWORDS.includes(s) ? 'keyword' : 'column'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#11171f] border-t border-border">
              <div className="flex items-center gap-2 text-xs text-text-dim font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-faint text-[10px]">Ctrl+Enter</kbd>
                <span>run</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-faint text-[10px]">Ctrl+Space</kbd>
                <span>suggest</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-faint text-[10px]">Ctrl+/</kbd>
                <span className="hidden sm:inline">comment</span>
              </div>
              <button
                onClick={run}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold font-mono bg-func text-ink hover:brightness-110 transition cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run
              </button>
            </div>
          </div>

          {/* Query history panel */}
          {showHistory && (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-3 py-2 bg-surface-2 border-b border-border flex items-center gap-2">
                <History className="w-4 h-4 text-func" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
                  Recent Queries
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-border">
                {history.length === 0 && (
                  <p className="px-4 py-3 text-xs text-text-faint font-mono">No history yet.</p>
                )}
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSql(h);
                      setShowHistory(false);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-mono text-text-dim hover:bg-surface-2 truncate transition cursor-pointer"
                    title={h}
                  >
                    {h.split('\n')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-error font-mono text-xs whitespace-pre-wrap">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="flex flex-col gap-3">
            {results.length === 0 && !error && (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-dim font-mono">
                  Run a query to see results. Separate multiple statements with{' '}
                  <span className="text-func">;</span> to run a script.
                </p>
              </div>
            )}
            {results.map(({ stmt, r }, idx) => (

              <div key={idx} className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-2 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-func font-mono text-xs shrink-0">#{idx + 1}</span>
                    <span className="font-mono text-[11px] text-text-dim truncate">{stmt.split('\n')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyResult(`${idx}`, r)}
                      className="text-[11px] font-mono text-text-dim hover:text-text px-2 py-0.5 rounded hover:bg-ink transition cursor-pointer"
                      title="Copy as CSV"
                    >
                      {copiedKey === `${idx}` ? 'Copied ✓' : 'Copy'}
                    </button>
                    <button
                      onClick={() => downloadResult(`${idx}`, r)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-text-dim hover:text-text px-2 py-0.5 rounded hover:bg-ink transition cursor-pointer"
                      title="Download as CSV"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    {r.affectedRows !== undefined ? (
                      <span className="font-mono text-[10.5px] text-text-faint">
                        {r.affectedRows} affected · {r.executionTimeMs}ms
                      </span>
                    ) : (
                      <span className="font-mono text-[10.5px] text-text-faint">
                        {r.rowCount} rows · {r.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                </div>

                {r.error ? (
                  <div className="p-4 bg-error/10 text-error font-mono text-xs whitespace-pre-wrap">
                    {friendlyError(r.error)}
                  </div>
                ) : r.rows.length === 0 ? (
                  <div className="p-4 text-text-dim font-mono text-xs text-center">
                    Executed successfully — no result set
                    {r.affectedRows !== undefined ? ` (${r.affectedRows} rows affected)` : ''}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-surface-2/60">
                          {r.columns.map((c) => (
                            <th key={c} className="text-left px-3 py-2 text-text-faint font-medium border-b border-border whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {r.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-surface-2/40">
                            {r.columns.map((c) => (
                              <td key={c} className="px-3 py-1.5 text-text-dim whitespace-nowrap">
                                {row[c] === null || row[c] === undefined ? (
                                  <span className="text-text-faint italic">NULL</span>
                                ) : (
                                  String(row[c])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}