import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Concept } from '../../types/curriculum';
import { QueryExecutionResult } from '../../types/database';

interface ConceptLessonViewProps {
  concept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  onStartPractice: () => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
  onExecuteSql?: (sql: string) => QueryExecutionResult;
}

/**
 * Rich Formatter for Lesson Explanations
 * Elegantly formats:
 * - Callout Cards (Notice / Key Insights / Tips)
 * - Stacked Question Cards: `QUESTION_BLOCK::LABEL::QUESTION`
 * - Section Headings: `### Heading` (with body properly separated)
 * - Execution Order / Numbered Step Pipelines: `1. **...**`
 * - Bullet Lists: `• item` or `- item`
 * - Monospace SQL & Diagram Code Blocks with Copy Button
 * - Inline code chips and bold text
 */
const FormattedExplanation: React.FC<{ content: string[] }> = ({ content }) => {
  return (
    <div className="space-y-5 text-on-surface/90 text-sm sm:text-[15px] leading-relaxed">
      {content.map((item, idx) => (
        <ExplanationItem key={idx} rawText={item} />
      ))}
    </div>
  );
};

const ExplanationItem: React.FC<{ rawText: string }> = ({ rawText }) => {
  const [copied, setCopied] = useState(false);

  // 1. Special Question Block: `QUESTION_BLOCK::LABEL::QUESTION`
  if (rawText.startsWith('QUESTION_BLOCK::')) {
    const parts = rawText.split('::');
    const label = parts[1] || '';
    const question = parts[2] || '';
    return (
      <div className="rounded-xl border border-primary/30 bg-surface-base/80 p-4 shadow-sm flex flex-col gap-2 transition hover:border-primary/50">
        <div className="flex items-center gap-2">
          <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider border border-primary/30">
            {label}
          </span>
        </div>
        <p className="text-on-surface font-semibold text-sm sm:text-base">
          {question}
        </p>
      </div>
    );
  }

  // 2. Pure Code Block: ```sql ... ``` or ```text ... ```
  if (rawText.startsWith('```') && rawText.endsWith('```')) {
    const lines = rawText.split('\n');
    const lang = lines[0].replace('```', '').trim() || 'SQL';
    const codeContent = lines.slice(1, -1).join('\n');

    const handleCopy = () => {
      navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="rounded-xl bg-surface-dim border border-outline-variant/70 overflow-hidden shadow-sm my-3">
        <div className="px-3.5 py-2 bg-surface-container border-b border-outline-variant/50 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wider">
            {lang.toUpperCase()}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-on-surface transition cursor-pointer px-2 py-0.5 rounded hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[13px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-4 font-mono text-xs sm:text-sm text-cyan-300 whitespace-pre overflow-x-auto">
          <code>{codeContent}</code>
        </div>
      </div>
    );
  }

  // 3. Section with Heading (### ...)
  if (rawText.startsWith('### ')) {
    const lines = rawText.split('\n');
    const headerLine = lines[0].replace('### ', '').trim();
    const remainingText = lines.slice(1).join('\n').trim();

    // Is it a Callout / Notice Card? (e.g. "Notice something important", "Important Concept", "Key Insight")
    const isCallout =
      /notice|important|key insight|takeaway|pro tip/i.test(headerLine);

    if (isCallout) {
      return (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col gap-2.5 my-3 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
            <span className="material-symbols-outlined text-[20px] text-primary">
              tips_and_updates
            </span>
            <span>{headerLine.replace(/:$/, '')}</span>
          </div>
          {remainingText && (
            <div className="text-on-surface/90 text-xs sm:text-sm leading-relaxed space-y-2">
              <RenderSubContent text={remainingText} />
            </div>
          )}
        </div>
      );
    }

    // Standard Heading + Body
    return (
      <div className="space-y-3 my-2">
        <h3 className="text-sm sm:text-base font-bold text-on-surface pt-2 pb-1.5 border-b border-outline-variant/40 flex items-center gap-2">
          {!/^\d+\./.test(headerLine) && (
            <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
          )}
          <span>{headerLine}</span>
        </h3>
        {remainingText && (
          <div className="space-y-2">
            <RenderSubContent text={remainingText} />
          </div>
        )}
      </div>
    );
  }

  // 4. Multi-part content with code or markdown lists
  return <RenderSubContent text={rawText} />;
};

/** Helper to render paragraphs, lists, steps, and embedded code blocks */
const RenderSubContent: React.FC<{ text: string }> = ({ text }) => {
  // Check if text has code blocks inside
  if (text.includes('```')) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="space-y-3">
        {parts.map((part, pIdx) => {
          if (part.startsWith('```')) {
            const lines = part.split('\n');
            const lang = lines[0].replace('```', '').trim() || 'SQL';
            const codeContent = lines.slice(1, -1).join('\n');
            return (
              <div
                key={pIdx}
                className="rounded-xl bg-surface-dim border border-outline-variant/70 overflow-hidden shadow-sm my-2"
              >
                <div className="px-3.5 py-1.5 bg-surface-container border-b border-outline-variant/50 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wider">
                    {lang.toUpperCase()}
                  </span>
                </div>
                <div className="p-3.5 font-mono text-xs sm:text-sm text-cyan-300 whitespace-pre overflow-x-auto">
                  <code>{codeContent}</code>
                </div>
              </div>
            );
          }
          if (!part.trim()) return null;
          return <RenderStructuredLines key={pIdx} text={part.trim()} />;
        })}
      </div>
    );
  }

  return <RenderStructuredLines text={text} />;
};

/** Helper to parse lists, step pipelines, and regular paragraphs */
const RenderStructuredLines: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);

        // Check if paragraph is a markdown table (| ... |)
        const isTable =
          lines.length >= 2 &&
          lines.every((l) => l.startsWith('|') && l.endsWith('|')) &&
          lines.some((l) => l.includes('---'));

        if (isTable) {
          const nonDividerLines = lines.filter((l) => !l.replace(/\|/g, '').trim().startsWith('-'));
          const headerLine = nonDividerLines[0];
          const dataLines = nonDividerLines.slice(1);

          const headers = headerLine
            .split('|')
            .slice(1, -1)
            .map((h) => h.trim());

          return (
            <div
              key={pIdx}
              className="my-3 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-base shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-surface-container border-b border-outline-variant/60">
                    <tr>
                      {headers.map((hdr, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3.5 py-2.5 font-bold text-on-surface uppercase tracking-wider text-[11px] font-mono"
                        >
                          {renderInlineFormatted(hdr)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {dataLines.map((dLine, rowIdx) => {
                      const cells = dLine
                        .split('|')
                        .slice(1, -1)
                        .map((c) => c.trim());
                      return (
                        <tr
                          key={rowIdx}
                          className="hover:bg-surface-container/50 transition-colors"
                        >
                          {cells.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3.5 py-2.5 text-on-surface/90 font-mono text-xs sm:text-[13px]"
                            >
                              {renderInlineFormatted(cell)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Check if paragraph is a numbered step list (1. ..., 2. ...)
        const isNumberedSteps =
          lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l));

        if (isNumberedSteps) {
          return (
            <div key={pIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const match = line.match(/^(\d+)\.\s+(.*)$/);
                const stepNum = match ? match[1] : `${lIdx + 1}`;
                const stepContent = match ? match[2] : line;
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-base/60 border border-outline-variant/50"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {stepNum}
                    </span>
                    <div className="text-xs sm:text-sm text-on-surface leading-relaxed flex-1">
                      {renderInlineFormatted(stepContent)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Check if paragraph is a bullet list (• ..., - ..., * ...)
        const isBulletList =
          lines.length > 0 && lines.every((l) => /^[•\-\*]\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-1 my-2">
              {lines.map((line, lIdx) => {
                const bulletContent = line.replace(/^[•\-\*]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-primary font-bold text-base leading-none select-none mt-0.5">
                      •
                    </span>
                    <span className="flex-1 leading-relaxed text-on-surface/90">
                      {renderInlineFormatted(bulletContent)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph
        return (
          <p key={pIdx} className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
            {renderInlineFormatted(para)}
          </p>
        );
      })}
    </div>
  );
};

// Helper for bold and inline code
function renderInlineFormatted(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={pIdx} className="font-bold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={pIdx}
          className="font-mono text-xs text-cyan-300 bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 mx-0.5 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const ConceptLessonView: React.FC<ConceptLessonViewProps> = ({
  concept,
  conceptIndex,
  totalConcepts,
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

  const tasksCount = concept.tasks.length;
  const theory = concept.theory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full gap-6 items-center justify-center max-w-4xl mx-auto py-2"
    >
      {/* Main Concept Lesson Card */}
      <div className="w-full bg-surface-container rounded-2xl border border-outline-variant/80 overflow-hidden relative shadow-xl">
        {/* Top Cyan Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-container" />

        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Top Breadcrumb & Status + Corner Next Button */}
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
            <div className="flex items-center gap-2 font-label-md text-xs sm:text-sm text-text-muted">
              <span className="text-primary font-bold">SQL Lesson {conceptIndex + 1}</span>
              <span>/</span>
              <span className="text-on-surface font-semibold">{concept.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-primary-container/15 text-primary px-3 py-1 rounded-full text-xs font-label-sm font-semibold border border-primary-container/30">
                Concept {conceptIndex + 1} of {totalConcepts}
              </span>
              <button
                onClick={onStartPractice}
                className="bg-primary-container hover:brightness-110 active:scale-95 transition-all text-on-primary-container text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Lesson Heading */}
          <div>
            <h1 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {concept.title}
            </h1>
            {concept.shortDescription && (
              <p className="text-sm text-text-muted mt-1 font-body-md">
                {concept.shortDescription}
              </p>
            )}
          </div>

          {/* Intro Summary */}
          {theory.summary && (
            <div className="text-on-surface font-body-lg text-sm sm:text-base leading-relaxed">
              <p className="text-on-surface font-normal leading-relaxed">
                {theory.summary}
              </p>
            </div>
          )}

          {/* Intro Visual Table (e.g. students table preview) */}
          {theory.introTable && (
            <div className="flex flex-col gap-2 rounded-xl bg-surface-base border border-outline-variant/70 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-surface-dim border-b border-outline-variant/60 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">table_chart</span>
                  <span>{theory.introTable.tableName}</span>
                </span>
                {theory.introTable.description && (
                  <span className="text-[11px] text-text-muted italic">
                    {theory.introTable.description}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-container-high text-on-surface font-bold border-b border-outline-variant/60">
                    <tr>
                      {theory.introTable.columns.map((col, idx) => (
                        <th key={idx} className="px-3.5 py-2 whitespace-nowrap text-primary">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-on-surface/90">
                    {theory.introTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface-container/50 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rich Formatted Explanation Paragraphs */}
          {theory.explanation && theory.explanation.length > 0 && (
            <FormattedExplanation content={theory.explanation} />
          )}

          {/* Step-by-Step Breakdown Visuals */}
          {theory.stepBreakdowns && theory.stepBreakdowns.length > 0 && (
            <div className="space-y-4 my-1">
              {theory.stepBreakdowns.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-xl bg-surface-base border border-outline-variant/70 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="px-4 py-2.5 bg-surface-dim border-b border-outline-variant/60 flex items-center justify-between">
                    <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold">
                        {step.stepNumber}
                      </span>
                      <span>{step.stepTitle}</span>
                    </span>
                    <code className="text-xs font-mono text-cyan-300 bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">
                      {step.sqlSnippet}
                    </code>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Smart explanation renderer:
                        Multi-line row evaluations → pill grid; single line → plain paragraph */}
                    {step.explanation.includes('\n') ? (
                      <div className="flex flex-col gap-1.5">
                        {step.explanation.split('\n').filter(Boolean).map((line, lIdx) => {
                          const isTrue = line.includes('TRUE') || line.includes('✅');
                          const isFalse = line.includes('FALSE') || line.includes('❌');
                          return (
                            <div
                              key={lIdx}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                                isTrue
                                  ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-200'
                                  : isFalse
                                  ? 'bg-zinc-800/60 border-zinc-700/40 text-zinc-400'
                                  : 'bg-surface-container/40 border-outline-variant/30 text-on-surface-variant'
                              }`}
                            >
                              <span className={`shrink-0 text-base leading-none ${isTrue ? 'text-emerald-400' : isFalse ? 'text-zinc-500' : ''}`}>
                                {isTrue ? '✅' : isFalse ? '✗' : '•'}
                              </span>
                              <span className="leading-snug">
                                {/* Strip the emoji from the line since we render it separately */}
                                {line.replace('✅', '').replace('❌', '').trim()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {step.explanation}
                      </p>
                    )}

                    {step.tableData && (
                      <div className="overflow-x-auto rounded-lg border border-outline-variant/50 bg-surface-dim">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-surface-container-high text-on-surface font-bold border-b border-outline-variant/60">
                            <tr>
                              {step.tableData.columns.map((col, idx) => {
                                const isHighlighted = step.tableData?.highlightedColumns?.includes(col);
                                return (
                                  <th
                                    key={idx}
                                    className={`px-3 py-2 whitespace-nowrap ${
                                      isHighlighted
                                        ? 'text-cyan-300 bg-primary-container/20 font-extrabold'
                                        : 'text-text-muted'
                                    }`}
                                  >
                                    {col}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/30 text-on-surface/90">
                            {step.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-surface-container/40">
                                {row.map((cell, cIdx) => {
                                  const colName = step.tableData?.columns[cIdx];
                                  const isHighlighted = step.tableData?.highlightedColumns?.includes(colName || '');
                                  return (
                                    <td
                                      key={cIdx}
                                      className={`px-3 py-1.5 whitespace-nowrap ${
                                        isHighlighted
                                          ? 'text-on-surface font-semibold bg-primary-container/10'
                                          : 'text-text-muted'
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Syntax Blocks Section */}
          {theory.syntaxBlocks && theory.syntaxBlocks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {theory.syntaxBlocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className="flex flex-col rounded-xl bg-surface-base border border-outline-variant/70 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 bg-surface-dim border-b border-outline-variant/60">
                    <span className="font-label-sm text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">code</span>
                      <span>{block.title}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(block.sql, bIdx)}
                      className="text-text-muted hover:text-on-surface text-[11px] flex items-center gap-1 transition px-2 py-0.5 rounded hover:bg-surface-container cursor-pointer"
                      title="Copy SQL"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === bIdx ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedIndex === bIdx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-surface-dim/90 font-mono text-xs sm:text-sm text-primary overflow-x-auto whitespace-pre leading-relaxed">
                    <code>{block.sql}</code>
                  </div>

                  {block.description && (
                    <div className="px-4 py-3 bg-surface-base text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/40">
                      {block.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : theory.syntaxDiagram ? (
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-xs text-text-muted uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
                <span>Syntax Pattern</span>
              </span>
              <div className="bg-surface-dim border border-outline-variant/80 rounded-xl p-4 font-mono text-xs sm:text-sm text-on-surface overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {theory.syntaxDiagram}
              </div>
            </div>
          ) : null}

          {/* Interactive Live Demo & Table Inspector */}
          <div className="flex flex-col rounded-xl bg-surface-base border border-primary-container/40 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-4 py-2.5 bg-primary-container/10 border-b border-primary-container/30">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Interactive Live Demo</span>
              </span>
              <button
                onClick={() => handleRunDemo()}
                className="bg-primary text-surface-base px-3 py-1 rounded-md text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1 shadow cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                <span>Run Query</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="bg-surface-dim rounded-lg p-3 border border-outline-variant/60 font-mono text-xs sm:text-sm text-primary">
                <input
                  type="text"
                  value={demoSql}
                  onChange={(e) => setDemoSql(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunDemo();
                  }}
                  className="w-full bg-transparent outline-none text-primary font-mono text-xs sm:text-sm"
                  placeholder="Enter a SQL query..."
                />
              </div>

              {(theory.liveDemoNotes || theory.exampleQueryExplanation) && (
                <p className="text-xs text-on-surface-variant font-body-md leading-relaxed px-1">
                  <span className="text-primary font-semibold">How it works: </span>
                  {theory.liveDemoNotes || theory.exampleQueryExplanation}
                </p>
              )}

              {demoError && (
                <div className="rounded-lg bg-error-container/20 border border-error/40 p-3 text-xs text-error">
                  {demoError}
                </div>
              )}

              {demoResult && demoResult.columns && demoResult.columns.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                    <span>Result ({demoResult.rowCount} rows returned)</span>
                    <span className="font-mono text-[10px]">
                      {demoResult.executionTimeMs?.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-56 rounded-lg border border-outline-variant/60 bg-surface-dim">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-container-high text-on-surface font-bold sticky top-0 border-b border-outline-variant/60">
                        <tr>
                          {demoResult.columns.map((col, cIdx) => (
                            <th key={cIdx} className="px-3 py-2 whitespace-nowrap text-primary">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30 text-on-surface/90">
                        {demoResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-surface-container/50">
                            {demoResult.columns.map((col, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                {row[col] !== null && row[col] !== undefined ? (
                                  String(row[col])
                                ) : (
                                  <span className="text-text-muted italic">NULL</span>
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
          </div>

          {/* Interactive Multiple Choice Questions (MCQ) */}
          {theory.mcqs && theory.mcqs.length > 0 && (
            <div className="rounded-xl bg-surface-base border border-outline-variant/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-label-sm text-xs uppercase tracking-wider font-bold border-b border-outline-variant/50 pb-2.5">
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                <span>MCQ — Test Yourself</span>
              </div>

              <div className="space-y-4">
                {theory.mcqs.map((mcq, mIdx) => {
                  const selected = selectedAnswers[mIdx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === mcq.correctIndex;

                  return (
                    <div
                      key={mIdx}
                      className="rounded-xl border border-outline-variant/60 bg-surface-dim/70 p-4 space-y-3"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-on-surface leading-relaxed whitespace-pre-line">
                        Question {mIdx + 1}: {mcq.question}
                      </p>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {mcq.options.map((opt, oIdx) => {
                          const isOptionSelected = selected === oIdx;
                          const isOptionCorrect = oIdx === mcq.correctIndex;

                          let btnClasses =
                            'text-left text-xs px-3.5 py-2.5 rounded-lg border transition flex items-center justify-between ';

                          if (!hasAnswered) {
                            btnClasses +=
                              'bg-surface-container hover:bg-surface-container-high border-outline-variant/60 text-on-surface cursor-pointer';
                          } else {
                            if (isOptionCorrect) {
                              btnClasses +=
                                'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnClasses +=
                                'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold';
                            } else {
                              btnClasses +=
                                'bg-surface-container/50 border-outline-variant/30 text-text-muted opacity-60';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [mIdx]: oIdx,
                                }));
                              }}
                              className={btnClasses}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrect && (
                                <span className="material-symbols-outlined text-[16px] text-emerald-400">
                                  check_circle
                                </span>
                              )}
                              {hasAnswered && isOptionSelected && !isCorrect && (
                                <span className="material-symbols-outlined text-[16px] text-rose-400">
                                  cancel
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && mcq.explanation && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
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
            </div>
          )}

          {/* Key Takeaway & Common Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {theory.keyTakeaway && (
              <div className="rounded-xl bg-surface-base border border-outline-variant/60 p-4 space-y-2">
                <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  <span>Key Takeaway</span>
                </h3>
                <p className="text-xs text-on-surface/90 leading-relaxed font-body-md">
                  {theory.keyTakeaway}
                </p>
              </div>
            )}

            {theory.commonMistakes && theory.commonMistakes.length > 0 && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 space-y-2">
                <h3 className="font-label-sm text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Watch Out For</span>
                </h3>
                <ul className="space-y-1 text-xs text-on-surface/90">
                  {theory.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-400 font-mono font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer: Back / Start Practice */}
          <div className="flex items-center justify-between gap-4 mt-2 pt-6 border-t border-outline-variant/60">
            <div>
              {onPrevious && canGoBack ? (
                <button
                  onClick={onPrevious}
                  className="text-text-muted hover:text-on-surface transition-colors font-label-md text-xs sm:text-sm flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-outline-variant/60 hover:border-outline-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Previous Concept</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Primary Action Button: Next (Tasks) */}
            <button
              onClick={onStartPractice}
              className="bg-primary-container hover:brightness-110 active:brightness-90 transition-all font-headline-sm text-xs sm:text-sm px-6 py-2.5 rounded-lg font-bold text-on-primary-container shadow-md shadow-primary-container/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
