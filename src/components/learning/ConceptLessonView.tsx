'use client';
/**
 * ConceptLessonView — the concept (theory) page, rebuilt to the approved
 * "SQLens editor" design:
 *   - a single 760px `.lesson` card (surface, border, radius-14)
 *   - lesson-head: mono crumb `SQL Lesson N / <b>title</b>`, progress dots,
 *     gold `Next →` button
 *   - the design's table-card recipe (via shared DataTable `sql-blocks`)
 *   - grayscale SQL code blocks with gold-as-UI-only emphasis
 *   - step-by-step breakdown, live demo, MCQ (gold correct / red wrong), takeaway
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Concept } from '../../types/curriculum';
import { QueryExecutionResult } from '../../types/database';
import { DataTable, CodeCard, highlightSql } from './sql-blocks';
import Icon from '@/components/ui/Icon';

export type ConceptDot = 'done' | 'current' | 'todo';

interface ConceptLessonViewProps {
  concept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  /** Per-concept progress dots for the lesson head. */
  conceptDots?: ConceptDot[];
  onStartPractice: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
  onExecuteSql?: (sql: string) => QueryExecutionResult;
}

/* ========================================================================= */
/*  Rich-formatter primitives (kept from the previous implementation)         */
/*  Renders the `.explanation[]` array: code fences, markdown lists, tables,  */
/*  QUESTION_BLOCK pill cards, bold + inline-code. All grayscale + gold.      */
/* ========================================================================= */

/** Inline bold + code chips. */
function InlineContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-text">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="font-mono text-xs text-editor-text bg-surface-2 px-1.5 py-0.5 rounded border border-border-soft mx-0.5 font-medium"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
/* A single explanation item: QUESTION_BLOCK card, code fence, heading, or body. */
const ExplanationItem: React.FC<{ rawText: string }> = ({ rawText }) => {
  // 1. Stacked Question Cards: `QUESTION_BLOCK::LABEL::QUESTION`
  if (rawText.startsWith('QUESTION_BLOCK::')) {
    const parts = rawText.split('::');
    const label = parts[1] || '';
    const question = parts[2] || '';
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-4 flex flex-col gap-2 transition hover:border-text-dim">
        <span className="inline-block self-start font-mono text-[10.5px] text-text-faint border border-border px-2 py-0.5 rounded-[5px]">
          {label}
        </span>
        <p className="text-sm font-semibold text-text leading-snug font-sans">
          {question}
        </p>
      </div>
    );
  }

  const lines = rawText.split('\n');

  // 2. Pure code block ```sql ... ``` / ```text ... ```
  if (rawText.startsWith('```') && rawText.endsWith('```')) {
    const lang = (lines[0] || '').replace(/```/, '').trim() || 'SQL';
    const codeContent = lines.slice(1, -1).join('\n');
    return (
      <div className="rounded-xl border border-border bg-editor-bg overflow-hidden">
        <div className="px-3.5 py-1.5 bg-surface-2 border-b border-border-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            {lang.toUpperCase()}
          </span>
        </div>
        <pre className="p-3.5 font-mono text-xs sm:text-sm text-editor-text whitespace-pre overflow-x-auto leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlightSql(codeContent) }} />
        </pre>
      </div>
    );
  }

  // 3. Section heading
  if (rawText.startsWith('### ')) {
    const headerLine = lines[0].replace(/^###\s*/, '').trim();
    const isCallout = /notice|important|key insight|takeaway|pro tip/i.test(headerLine);
    const body = lines.slice(1).join('\n').trim();
    if (isCallout) {
      return (
        <div className="border border-border-soft border-l-[3px] border-l-func rounded-r-xl bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-2 text-text font-semibold text-sm font-sans">
            <Icon name="tips_and_updates" className="text-[16px] text-func" />
            <span>{headerLine.replace(/:$/, '')}</span>
          </div>
          {body && (
            <div className="mt-1 text-xs sm:text-sm text-text-dim leading-relaxed">
              <InlineContent text={body} />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <h3 className="text-sm sm:text-base font-bold text-text pt-2 pb-1.5 border-b border-border-soft flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-func inline-block shrink-0" />
          <span>{headerLine}</span>
        </h3>
        {body && (
          <div className="space-y-2">
            <InlineContent text={body} />
          </div>
        )}
      </div>
    );
  }

  return <SubContent text={rawText} />;
};
/* Recursive sub-content: code fences, tables, step lists, bullets, paragraphs */
function SubContent({ text }: { text: string }) {
  if (text.includes('```')) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          if (part.startsWith('```')) {
            const inLines = part.split('\n');
            const code = inLines.slice(1, -1).join('\n');
            return (
              <div key={idx} className="rounded-xl border border-border bg-editor-bg overflow-hidden">
                <pre className="p-3.5 font-mono text-xs sm:text-sm text-editor-text whitespace-pre overflow-x-auto leading-relaxed">
                  <code dangerouslySetInnerHTML={{ __html: highlightSql(code) }} />
                </pre>
              </div>
            );
          }
          if (!part.trim()) return null;
          return <SubLineBlocks key={idx} text={part.trim()} />;
        })}
      </div>
    );
  }
  return <SubLineBlocks text={text} />;
};

function SubLineBlocks({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/);
  return (
    <div className="space-y-3">
      {paragraphs.map((para, idx) => {
        const paraLines = para.split('\n').map((l) => l.trim()).filter(Boolean);
        if (paraLines.length === 0) return null;

        // Markdown table
        const isTable =
          paraLines.length >= 2 &&
          paraLines.every((l) => l.startsWith('|') && l.endsWith('|')) &&
          paraLines.some((l) => /-{2,}/.test(l));
        if (isTable) {
          const nonDivider = paraLines.filter((l) => !/^\|[\s-:|]+\|?$/.test(l));
          const headers = (nonDivider[0] || '')
            .split('|').slice(1, -1).map((h) => h.trim());
          const rows = nonDivider.slice(1).map((l) =>
            l.split('|').slice(1, -1).map((c) => c.trim()),
          );
          return (
            <div key={idx} className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-surface-2 border-b border-border">
                    <tr>
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2 text-[11px] font-semibold text-text whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface-2/40">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 text-text-dim border-t border-border-soft whitespace-nowrap">
                            <InlineContent text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Numbered step list
        if (paraLines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <div key={idx} className="space-y-2">
              {paraLines.map((line, lIdx) => {
                const m = line.match(/^(\d+)\.\s+(.*)$/);
                return (
                  <div key={lIdx} className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-2 border border-border-soft">
                    <span className="w-5 h-5 rounded-full bg-surface-3 text-text-dim flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {m ? m[1] : lIdx + 1}
                    </span>
                    <div className="text-xs sm:text-sm text-text leading-relaxed flex-1">
                      <InlineContent text={m ? m[2] : line} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Bullet list
        if (paraLines.every((l) => /^[•\-*]\s+/.test(l))) {
          return (
            <ul key={idx} className="space-y-1.5 pl-1">
              {paraLines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-func font-bold text-base leading-none select-none mt-0.5">•</span>
                  <span className="flex-1 leading-relaxed text-text-dim">
                    <InlineContent text={line.replace(/^[•\-*]\s+/, '')} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-sm sm:text-[15px] leading-relaxed text-text-dim whitespace-pre-line font-sans">
            <InlineContent text={para} />
          </p>
        );
      })}
    </div>
  );
}

const FormattedExplanation: React.FC<{ content: string[] }> = ({ content }) => {
  // Group consecutive QUESTION_BLOCK items into a 2-col pill grid.
  const groups: { isQuestion: boolean; items: string[] }[] = [];
  for (const item of content) {
    const isQ = item.startsWith('QUESTION_BLOCK::');
    const last = groups[groups.length - 1];
    if (last && last.isQuestion === isQ) last.items.push(item);
    else groups.push({ isQuestion: isQ, items: [item] });
  }

  return (
    <div className="space-y-4">
      {groups.map((g, gIdx) =>
        g.isQuestion ? (
          <div key={gIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {g.items.map((q, qIdx) => (
              <ExplanationItem key={qIdx} rawText={q} />
            ))}
          </div>
        ) : (
          <div key={gIdx} className="space-y-4">
            {g.items.map((it, iIdx) => (
              <ExplanationItem key={iIdx} rawText={it} />
            ))}
          </div>
        ),
      )}
    </div>
  );
};
/* ========================================================================= */
/*  Main component                                                           */
/* ========================================================================= */

export const ConceptLessonView: React.FC<ConceptLessonViewProps> = ({
  concept,
  conceptIndex,
  totalConcepts,
  conceptDots,
  onStartPractice,
  onPrevious,
  canGoBack = false,
  onExecuteSql,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Interactive sandbox inside the lesson
  const initialSql =
    concept.theory.liveDemoSql || concept.theory.exampleQuery || 'SELECT name FROM students;';
  const [demoSql, setDemoSql] = useState<string>(initialSql);
  const [demoResult, setDemoResult] = useState<QueryExecutionResult | null>(() => {
    if (onExecuteSql && initialSql) {
      try {
        return onExecuteSql(initialSql);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunDemo = (sqlToRun?: string) => {
    const query = sqlToRun || demoSql;
    if (!onExecuteSql) return;
    try {
      const res = onExecuteSql(query);
      if (res.error) {
        setDemoError(res.error);
        setDemoResult(null);
      } else {
        setDemoResult(res);
        setDemoError(null);
      }
    } catch (err: any) {
      setDemoError(err.message || 'Error executing query');
      setDemoResult(null);
    }
  };

  const theory = concept.theory;
  // Default dots: current = this concept's index, previous = done.
  const dots: ConceptDot[] =
    conceptDots && conceptDots.length === totalConcepts
      ? conceptDots
      : Array.from({ length: totalConcepts }, (_, i) =>
          i < conceptIndex ? 'done' : i === conceptIndex ? 'current' : 'todo');

  const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="font-mono text-[11px] text-text-faint tracking-[0.07em] uppercase mb-3.5 mt-7 first:mt-0">
      {children}
    </div>
  );
return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="w-full max-w-[760px] mx-auto px-4 pb-10"
    >
      <div className="bg-surface border border-border rounded-[14px] px-5 sm:px-[30px] pt-[26px] sm:pt-[30px] pb-2 overflow-hidden">

        {/* ----- lesson head ----- */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-6">
          <div className="font-mono text-[11.5px] text-text-faint">
            SQL Lesson {conceptIndex + 1} /{' '}
            <b className="text-text-dim font-medium">{concept.title}</b>
          </div>
          <div className="flex items-center gap-3.5">
            {/* progress dots */}
            <div className="flex items-center gap-1.5">
              {dots.map((d, i) => (
                <span
                  key={i}
                  title={i === conceptIndex ? 'You are here' : undefined}
                  className={
                    d === 'current'
                      ? 'w-2 h-2 rounded-full border-[1.5px] border-func bg-transparent'
                      : d === 'done'
                      ? 'w-[7px] h-[7px] rounded-full bg-text-faint'
                      : 'w-[7px] h-[7px] rounded-full bg-border'
                  }
                />
              ))}
            </div>
            <button
              onClick={onStartPractice}
              className="inline-flex items-center gap-1.5 bg-func text-ink font-semibold text-[13px] px-4 py-2 rounded-lg hover:brightness-110 transition-colors cursor-pointer"
            >
              Next <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        {/* heading */}
        <h1 className="font-mono text-[24px] sm:text-[28px] font-bold leading-tight tracking-tight text-text">
          {concept.title}
        </h1>
        {concept.shortDescription && (
          <p className="text-sm text-text-dim mt-1.5 font-sans">{concept.shortDescription}</p>
        )}

        {/* summary */}
        {theory.summary && (
          <p className="text-sm sm:text-[14.5px] leading-relaxed text-text-dim mt-5 max-w-[620px] font-sans">
            <InlineContent text={theory.summary} />
          </p>
        )}

        {/* intro table */}
        {theory.introTable && (
          <div className="mt-4">
            <DataTable
              tableName={theory.introTable.tableName}
              description={theory.introTable.description}
              columns={theory.introTable.columns}
              rows={theory.introTable.rows}
            />
          </div>
        )}

        {/* explanation */}
        {theory.explanation && theory.explanation.length > 0 && (
          <div className="mt-4">
            <FormattedExplanation content={theory.explanation} />
          </div>
        )}

        {/* target query */}
        {theory.targetQuery && (
          <div className="mt-6">
            <CodeCard
              title={theory.targetQuery.badge || "The query we're going to break down"}
              sql={theory.targetQuery.sql}
              caption={theory.targetQuery.explanation}
              copied={copiedIndex === 9999}
              onCopy={() => {
                navigator.clipboard.writeText(theory.targetQuery!.sql);
                setCopiedIndex(9999);
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
            />
          </div>
        )}
{/* ---------- steps ---------- */}
        {theory.stepBreakdowns && theory.stepBreakdowns.length > 0 && (
          <>
            <SectionLabel>Step-by-step SQL processing</SectionLabel>
            <div className="space-y-5">
              {theory.stepBreakdowns.map((step, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                    <div className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold text-text">
                      <span className="w-[18px] h-[18px] rounded-full bg-surface-3 text-text-dim flex items-center justify-center text-[10px] shrink-0">
                        {step.stepNumber}
                      </span>
                      <span>{step.stepTitle.replace(/^Step\s*\d*:\s*/i, '')}</span>
                    </div>
                    {step.sqlSnippet && (
                      <span
                        className="font-mono text-[10.5px] text-text-dim border border-border px-2 py-1 rounded"
                        dangerouslySetInnerHTML={{ __html: highlightSql(step.sqlSnippet) }}
                      />
                    )}
                  </div>
                  {step.explanation && (
                    <p className="text-[13px] leading-relaxed text-text-dim font-sans">
                      {step.explanation}
                    </p>
                  )}
                  {step.tableData && (
                    <DataTable
                      tableName={step.tableData.tableName}
                      columns={step.tableData.columns}
                      rows={step.tableData.rows}
                      highlightedColumns={step.tableData.highlightedColumns}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- syntax blocks (meaning of the query) ---------- */}
        {theory.syntaxBlocks && theory.syntaxBlocks.length > 0 && (
          <>
            <SectionLabel>Meaning of the query</SectionLabel>
            <div className="space-y-4">
              {theory.syntaxBlocks.map((block, bIdx) => (
                <CodeCard
                  key={bIdx}
                  title={block.title}
                  sql={block.sql}
                  caption={block.description}
                  copied={copiedIndex === bIdx}
                  onCopy={() => handleCopy(block.sql, bIdx)}
                />
              ))}
            </div>
          </>
        )}
{/* ---------- live demo ---------- */}
        {onExecuteSql && (theory.liveDemoSql || theory.exampleQuery) && (
          <>
            <SectionLabel>Interactive live demo</SectionLabel>
            <div className="rounded-xl border border-border bg-editor-bg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-soft">
                <span className="font-mono text-[11px] text-text-faint uppercase tracking-[0.05em]">
                  Run it yourself
                </span>
                <button
                  onClick={() => handleRunDemo()}
                  className="inline-flex items-center gap-1.5 bg-func text-ink font-semibold text-xs px-3 py-1.5 rounded-lg hover:brightness-110 transition-colors cursor-pointer"
                >
                  <Icon name="play_arrow" className="text-[14px]" /> Run Query
                </button>
              </div>

              <div className="mx-4 mt-3">
                <div className="relative bg-surface border border-border-soft rounded-lg px-3 py-2 font-mono text-[13px] min-h-[38px]">
                  {/* P9.2d — the query renders ONCE: this highlighted layer is
                      the only visible text; the input below has transparent
                      text + gold caret stacked over it. */}
                  <div
                    aria-hidden
                    className="whitespace-pre overflow-x-hidden pointer-events-none select-none"
                    dangerouslySetInnerHTML={{ __html: highlightSql(demoSql) }}
                  />
                  <input
                    type="text"
                    value={demoSql}
                    onChange={(e) => setDemoSql(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunDemo();
                    }}
                    onScroll={(e) => {
                      const el = e.currentTarget.previousElementSibling as HTMLDivElement | null;
                      if (el) el.scrollLeft = e.currentTarget.scrollLeft;
                    }}
                    className="absolute inset-0 w-full bg-transparent outline-none text-transparent font-mono text-[13px] px-3 py-2 placeholder:text-text-faint"
                    style={{ caretColor: '#f4c430' }}
                    placeholder="Enter a SQL query..."
                    aria-label="SQL demo query"
                  />
                </div>
              </div>

              {(theory.liveDemoNotes || theory.exampleQueryExplanation) && (
                <p className="mx-4 mt-2 text-[11.5px] leading-relaxed text-text-dim font-sans">
                  <b className="text-text font-semibold">How it works:</b>{' '}
                  {theory.liveDemoNotes || theory.exampleQueryExplanation}
                </p>
              )}

              {demoError && (
                <div className="mx-4 mt-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
                  {demoError}
                </div>
              )}

              {demoResult && demoResult.columns && demoResult.columns.length > 0 && (
                <div className="mx-4 my-4 border border-border-soft rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface font-mono text-[10.5px] text-text-faint">
                    <span>RESULT — {demoResult.rowCount} rows</span>
                    <span>{demoResult.executionTimeMs?.toFixed(1)}ms</span>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left font-mono text-[12.5px] border-collapse">
                      <thead className="bg-surface-2">
                        <tr>
                          {demoResult.columns.map((col, cIdx) => (
                            <th key={cIdx} className="px-3 py-1.5 text-[11px] font-semibold text-text whitespace-nowrap border-b border-border">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {demoResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-surface-2/40">
                            {demoResult.columns.map((col, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 text-text-dim border-b border-border-soft whitespace-nowrap">
                                {row[col] === null || row[col] === undefined ? (
                                  <span className="text-text-faint italic">NULL</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
{/* ---------- MCQ ---------- */}
        {theory.mcqs && theory.mcqs.length > 0 && (
          <>
            <SectionLabel>Test yourself</SectionLabel>
            <div className="space-y-4">
              {theory.mcqs.map((mcq, mIdx) => {
                const selected = selectedAnswers[mIdx];
                const hasAnswered = selected !== undefined;
                const isCorrect = selected === mcq.correctIndex;
                // Question may include trailing SQL code lines after the first line.
                const qParts = mcq.question.split('\n');
                const qLine = qParts[0] || mcq.question;
                const qCode = qParts.slice(1).filter((l) => l.trim());
                return (
                  <div key={mIdx} className="rounded-xl bg-surface-2 border border-border p-5">
                    <div className="font-mono text-[10.5px] text-text-faint uppercase tracking-[0.06em] mb-3">
                      MCQ · Question {mIdx + 1}
                    </div>
                    <p className="text-[13.5px] font-semibold text-text leading-snug font-sans">{qLine}</p>
                    {qCode.length > 0 && (
                      <div
                        className="mt-2 mb-3 font-mono text-[12.5px] text-text-dim whitespace-pre overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: highlightSql(qCode.join('\n')) }}
                      />
                    )}
                    <div className="space-y-2 mt-3">
                      {mcq.options.map((opt, oIdx) => {
                        const isOptSelected = selected === oIdx;
                        const isOptCorrect = oIdx === mcq.correctIndex;
                        let cls =
                          'flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg border text-[13px] font-sans transition cursor-pointer ';
                        if (!hasAnswered) {
                          cls += 'border-border text-text-dim hover:border-text-dim hover:bg-surface';
                        } else if (isOptCorrect) {
                          cls += 'border-func/60 bg-func/10 text-text font-medium';
                        } else if (isOptSelected && !isCorrect) {
                          cls += 'border-error/60 bg-error/10 text-error';
                        } else {
                          cls += 'border-border-soft text-text-faint opacity-60';
                        }
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              if (hasAnswered) return;
                              setSelectedAnswers((prev) => ({ ...prev, [mIdx]: oIdx }));
                            }}
                            disabled={hasAnswered}
                            className={cls}
                          >
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10.5px] shrink-0 ${
                                hasAnswered && isOptCorrect
                                  ? 'border-func text-ink bg-func'
                                  : hasAnswered && isOptSelected && !isCorrect
                                  ? 'border-error text-error'
                                  : 'border-border text-text-faint'
                              }`}
                            >
                              {hasAnswered && isOptCorrect && !isOptSelected ? '✓' : letter}
                            </span>
                            <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                            {hasAnswered && isOptSelected && isOptCorrect && (
                              <Icon name="check_circle" className="text-[15px] text-func ml-auto shrink-0" />
                            )}
                            {hasAnswered && isOptSelected && !isOptCorrect && (
                              <Icon name="cancel" className="text-[15px] text-error ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {hasAnswered && mcq.explanation && (
                      <div
                        className={`mt-3 rounded-lg px-3 py-2.5 text-xs leading-relaxed border font-sans ${
                          isCorrect
                            ? 'bg-func/10 border-func/25 text-text'
                            : 'bg-error/10 border-error/25 text-error'
                        }`}
                      >
                        <span className="font-bold">
                          {isCorrect ? 'Correct! ' : 'Explanation: '}
                        </span>
                        {mcq.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
{/* ---------- key takeaway + common mistakes ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7 mb-4">
          {theory.keyTakeaway && (
            <div className="rounded-r-xl border border-border-soft border-l-[3px] border-l-func bg-surface-2 px-4 py-3">
              <div className="font-mono text-[10.5px] text-func uppercase tracking-[0.06em] mb-1.5">
                Key takeaway
              </div>
              <p className="text-[13.5px] leading-relaxed text-text-dim font-sans">
                {theory.keyTakeaway}
              </p>
            </div>
          )}

          {theory.commonMistakes && theory.commonMistakes.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <div className="font-mono text-[10.5px] text-text-faint uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1.5">
                <Icon name="warning" className="text-[14px]" /> Watch Out For
              </div>
              <ul className="space-y-1 text-[13px] leading-relaxed text-text-dim font-sans">
                {theory.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-text-faint font-mono font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ---------- footer actions ---------- */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-5 border-t border-border-soft pb-8">
          <div>
            {onPrevious && canGoBack ? (
              <button
                onClick={onPrevious}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-text-dim border border-border bg-surface-2 hover:text-text hover:border-text-dim px-4 py-2.5 rounded-lg transition cursor-pointer"
              >
                <Icon name="arrow_back" className="text-[15px]" /> Previous Concept
              </button>
            ) : (
              <div />
            )}
          </div>
          <button
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 bg-func text-ink font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:brightness-110 transition-colors cursor-pointer"
          >
            Continue to Practice <Icon name="arrow_forward" className="text-[15px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};