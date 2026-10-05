import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { MonacoCodeEditor, MonacoCodeEditorHandle } from "./MonacoCodeEditor";
import type { SqlSourcePosition } from "@/lib/sql-engine/source-position";
import { PrismaEditorTabs } from "./prisma/PrismaEditorTabs";
import { PrismaSchemaTab } from "./prisma/PrismaSchemaTab";
import type { PrismaEditorTab } from "@/lib/track-submit";
import { buildErdDiagramFromSource } from "@/lib/prisma-engine/prisma-erd";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunAndCheck: (sql: string) => void;
  tableName?: string;
  evaluationState?: "idle" | "wrong" | "correct";
  nextActionLabel?: string;
  onNextAction?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  /** Header file label. Prisma tasks edit TypeScript: `query.ts`. */
  fileLabel?: string;
  /**
   * SQL keyword chips (`SELECT`, `FROM`, …) — SQL-only affordances. The Prisma
   * editor turns them off rather than inserting SQL into TypeScript.
   */
  showQuickChips?: boolean;
  /**
   * Prisma Type Inspector: `prisma.expectedType`, the type the reference call
   * resolves to. `null` renders nothing (the SQL track always passes null).
   */
  expectedType?: string | null;
  /**
   * Phase 9: the `schema.prisma` tab (Prisma track only). `undefined` keeps the
   * SQL editor's single-file layout byte-identical — no tab strip, no schema.
   */
  schemaTab?: { label: string; source: string; caption: string };
  /** Phase 9: the tab to open on (`prisma.activeTab`, default `editor`). */
  defaultTab?: PrismaEditorTab;
  onBack?: () => void;
  backLabel?: string;
  /** Restore this SQL on reset (task scaffold). */
  resetSql?: string;
  /**
   * P0 FIX: ENGINE error only (result.error from executeQuery).
   * Validation/grading feedback must NOT be passed here — it goes to
   * ResultsConsole via validationFeedback. Mixing them made
   * "Table 'products' does not match the expected final state" render as
   * "Table 'products' does not exist. Did you mean 'products'?".
   * `lastError` kept as deprecated alias so existing callers keep compiling.
   */
  engineError?: string | null;
  /** @deprecated use engineError — kept for backwards compat. */
  lastError?: string | null;
  /**
   * P4.17: engine-reported position of the failing token, plus how many times
   * that token appears in real code (so an ambiguous spot never gets a marker).
   */
  errorPosition?: SqlSourcePosition | null;
  errorTokenOccurrences?: number | null;
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
  fileLabel = 'query.sql',
  showQuickChips = true,
  expectedType = null,
  onBack,
  backLabel = "Back",
  resetSql,
  engineError,
  lastError,
  errorPosition,
  errorTokenOccurrences,
  schemaTab,
  defaultTab = 'editor',
}) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<PrismaEditorTab>(defaultTab);
  const [schemaView, setSchemaView] = useState<'source' | 'diagram'>('source');
  const editorRef = useRef<MonacoCodeEditorHandle>(null);
  const showSchema = Boolean(schemaTab) && tab === 'schema';
  const language = fileLabel.endsWith('.ts') ? 'typescript' : fileLabel.endsWith('.prisma') ? 'prisma' : 'sql';

  const erdSummary = React.useMemo(() => {
    if (!schemaTab?.source) return null;
    try {
      const diagram = buildErdDiagramFromSource(schemaTab.source);
      if (diagram.models.length < 2) return null;
      const uniqueRelations = new Set(
        diagram.relations.map((r) => [r.from, r.to].sort().join(':')),
      );
      const relCount = uniqueRelations.size;
      return {
        label: `Schema: ${diagram.models.length} models, ${relCount} relation${relCount === 1 ? '' : 's'} defined ↗`,
      };
    } catch {
      return null;
    }
  }, [schemaTab?.source]);

  // Sync tab state when switching tasks with different defaultTab values
  useEffect(() => {
    setTab(defaultTab);
    // Reset schema view to source when task schema changes
    setSchemaView('source');
  }, [defaultTab, schemaTab?.source]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRun = (sql: string) => {
    if (evaluationState === "correct" && onNextAction) {
      onNextAction();
    } else {
      onRunAndCheck(sql);
    }
  };

  return (
    <div
      id="sql-editor-container"
      className="flex flex-col bg-editor-bg rounded-xl border border-border text-editor-text relative"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border-soft select-none rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-text-faint/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-surface-3 inline-block"></span>
          </div>
          <span className="text-[11px] font-mono text-text font-semibold tracking-wide">
            {showSchema ? schemaTab!.label : fileLabel}
          </span>
          {schemaTab ? (
            <PrismaEditorTabs active={tab} onChange={setTab} className="ml-1" />
          ) : (
            <span className="hidden sm:inline-block text-[10px] text-text-faint px-2 py-0.5 rounded bg-surface border border-border">
              Active: {tableName}
            </span>
          )}
          {erdSummary && (
            <button
              id="erd-relation-pill"
              type="button"
              onClick={() => {
                setTab('schema');
                setSchemaView('diagram');
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-func bg-func/10 border border-func/30 hover:bg-func/20 transition cursor-pointer"
              title="Open ERD diagram"
            >
              {erdSummary.label}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* The code actions belong to the code tab: the schema tab has its own
              copy button, and formatting/copying a read-only schema from here
              would silently act on the hidden TypeScript. */}
          {!showSchema && (
            <>
              <button
                id="format-sql-btn"
            type="button"
            onClick={() => editorRef.current?.format()}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface rounded transition cursor-pointer"
            title="Format SQL (Ctrl+Shift+F)"
          >
            <Sparkles className="w-3.5 h-3.5 text-text-dim" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            id="copy-sql-btn"
            type="button"
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
              type="button"
              onClick={() =>
                onChange(resetSql ?? `SELECT * FROM ${tableName};`)
              }
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-text-faint hover:text-text hover:bg-surface rounded transition cursor-pointer"
              title="Reset to the task starter query"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            </>
          )}
        </div>
      </div>

      {showSchema ? (
        /* Phase 9: the dedicated schema.prisma surface — the source the SQL is
           generated from, plus the live ERD of that same string. */
        <PrismaSchemaTab
          source={schemaTab!.source}
          label={schemaTab!.label}
          caption={schemaTab!.caption}
          activeView={schemaView}
          onViewChange={setSchemaView}
        />
      ) : (
      <MonacoCodeEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        language={language}
        onRun={handleRun}
        schemaSource={schemaTab?.source}
        placeholder={
          placeholder ?? `Type your SQL query here\nSELECT * FROM ${tableName};`
        }
        readOnly={readOnly}
        minHeight="220px"
        error={evaluationState === "wrong" ? (engineError ?? lastError ?? null) : null}
        errorPosition={evaluationState === "wrong" ? (errorPosition ?? null) : null}
      />
      )}

      {!showSchema && (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-surface border-t border-border-soft overflow-x-auto text-xs scrollbar-none">
        <span className="text-[11px] text-text-faint uppercase tracking-wider font-semibold mr-1 shrink-0">
          {showQuickChips ? 'Quick:' : 'Model:'}
        </span>
        {showQuickChips ? (
          ["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT", "JOIN"].map(
          (chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                editorRef.current?.focus();
                editorRef.current?.applySuggestion(chip);
              }}
              className="px-2 py-0.5 rounded bg-surface-2 hover:bg-surface hover:text-text text-text-dim text-[11px] font-mono border border-border transition shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ),
        )
        ) : (
          // Prisma track: no SQL chips (the editor is TypeScript). The row still
          // names the model whose SQL this code will generate.
          <span className="font-mono text-[11px] text-text-dim truncate">{tableName}</span>
        )}
      </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3.5 bg-surface border-t border-border-soft min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-text-faint font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-text-dim text-[10px]">
            Ctrl + Enter
          </kbd>
          <span>to run &amp; check</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={backLabel}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-text-dim border border-border bg-surface-2 hover:text-text hover:bg-surface transition cursor-pointer shrink-0"
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold font-sans bg-func hover:brightness-110 text-ink shadow-[0_0_14px_var(--accent-dim)] transition cursor-pointer active:scale-95"
            >
              <span>{nextActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="run-check-btn"
              type="button"
              onClick={() => onRunAndCheck(value)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold font-sans text-ink transition cursor-pointer active:scale-95 ${
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
