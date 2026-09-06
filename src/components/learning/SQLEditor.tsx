import React, { useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { QueryEditor, QueryEditorHandle } from "./QueryEditor";

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
  onBack?: () => void;
  backLabel?: string;
  /** Restore this SQL on reset (task scaffold). */
  resetSql?: string;
  /** Error from last execution or validation */
  lastError?: string | null;
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
  resetSql,
  lastError,
}) => {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<QueryEditorHandle>(null);

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
            query.sql
          </span>
          <span className="hidden sm:inline-block text-[10px] text-text-faint px-2 py-0.5 rounded bg-surface border border-border">
            Active: {tableName}
          </span>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <QueryEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        onRun={handleRun}
        fallbackTable={tableName}
        placeholder={
          placeholder ?? `Type your SQL query here\nSELECT * FROM ${tableName};`
        }
        readOnly={readOnly}
        textareaId="sql-query-textarea"
        error={evaluationState === "wrong" ? lastError : null}
      />

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
                editorRef.current?.focus();
                editorRef.current?.applySuggestion(chip);
              }}
              className="px-2 py-0.5 rounded bg-surface-2 hover:bg-surface hover:text-text text-text-dim text-[11px] font-mono border border-border transition shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ),
        )}
      </div>

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
