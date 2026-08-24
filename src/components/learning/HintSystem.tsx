import React, { useState, useRef, useEffect } from 'react';
import { TaskHint, ConceptTheory } from '../../types/curriculum';

interface HelpDropdownProps {
  hints: TaskHint[];
  solutionSql: string;
  solutionExplanation: string;
  conceptTheory?: ConceptTheory;
  onUseHint?: (level: number) => void;
  onViewSolution?: () => void;
}

export const HelpDropdown: React.FC<HelpDropdownProps> = ({
  hints,
  solutionSql,
  solutionExplanation,
  conceptTheory,
  onUseHint,
  onViewSolution,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'none' | 'hints' | 'syntax' | 'solution'>('none');
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRequestHint = () => {
    const nextLevel = Math.min(unlockedHintLevel + 1, hints.length);
    setUnlockedHintLevel(nextLevel);
    if (onUseHint) {
      onUseHint(nextLevel);
    }
    setActiveView('hints');
    setIsOpen(false);
  };

  const handleReviewSyntax = () => {
    setActiveView('syntax');
    setIsOpen(false);
  };

  const handleViewSolution = () => {
    setActiveView('solution');
    setIsOpen(false);
    if (onViewSolution) {
      onViewSolution();
    }
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(solutionSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 w-full" ref={dropdownRef}>
      {/* Help Trigger Button */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-on-surface hover:bg-surface-container border border-outline-variant/50 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-text-muted">help_outline</span>
          <span>Help</span>
          <span className="material-symbols-outlined text-[15px]">
            {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 bottom-full mb-1 z-30 w-48 rounded-xl bg-surface-container-high border border-outline-variant shadow-2xl py-1 text-xs">
            {hints && hints.length > 0 && (
              <button
                onClick={handleRequestHint}
                className="w-full text-left px-3.5 py-2.5 text-on-surface hover:bg-surface-variant flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">lightbulb</span>
                  <span>
                    {unlockedHintLevel === 0 ? 'Request hint' : `Next hint (${unlockedHintLevel + 1}/${hints.length})`}
                  </span>
                </div>
              </button>
            )}

            {conceptTheory && (
              <button
                onClick={handleReviewSyntax}
                className="w-full text-left px-3.5 py-2.5 text-on-surface hover:bg-surface-variant flex items-center gap-2 transition cursor-pointer border-t border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[16px] text-cyan-400">menu_book</span>
                <span>Review syntax</span>
              </button>
            )}

            <button
              onClick={handleViewSolution}
              className="w-full text-left px-3.5 py-2.5 text-on-surface hover:bg-surface-variant flex items-center gap-2 transition cursor-pointer border-t border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-[16px] text-text-muted">visibility</span>
              <span>View solution</span>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Help Panel (Single cleanly formatted card if active) */}
      {activeView !== 'none' && (
        <div className="rounded-xl border border-outline-variant/60 bg-surface-base p-4 text-xs space-y-3 relative shadow-md">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
            <span className="font-semibold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              {activeView === 'hints' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-amber-400">lightbulb</span>
                  <span>Hints ({unlockedHintLevel} of {hints.length})</span>
                </>
              )}
              {activeView === 'syntax' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">menu_book</span>
                  <span>Syntax Reference</span>
                </>
              )}
              {activeView === 'solution' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-text-muted">visibility</span>
                  <span>Reference Solution</span>
                </>
              )}
            </span>

            <div className="flex items-center gap-2">
              {activeView === 'hints' && unlockedHintLevel < hints.length && (
                <button
                  onClick={handleRequestHint}
                  className="text-amber-400 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Next Hint →
                </button>
              )}

              {activeView === 'solution' && (
                <button
                  onClick={handleCopySolution}
                  className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('none')}
                className="text-text-muted hover:text-on-surface p-0.5 rounded cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* View: Hints */}
          {activeView === 'hints' && (
            <div className="space-y-2">
              {hints.slice(0, unlockedHintLevel).map((hint, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400">Hint {hint.level}:</span>
                  <p className="text-on-surface/90 leading-relaxed">{hint.text}</p>
                  {hint.codeSnippet && (
                    <code className="block rounded bg-surface-dim p-2 font-mono text-[11px] text-primary border border-outline-variant/40 mt-1">
                      {hint.codeSnippet}
                    </code>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* View: Syntax */}
          {activeView === 'syntax' && conceptTheory && (
            <div className="space-y-2">
              <pre className="rounded bg-surface-dim p-2.5 font-mono text-cyan-300 text-xs border border-outline-variant/40 overflow-x-auto leading-relaxed">
                {conceptTheory.exampleQuery || conceptTheory.syntaxDiagram}
              </pre>
              {conceptTheory.exampleQueryExplanation && (
                <p className="text-text-muted text-xs leading-relaxed">
                  {conceptTheory.exampleQueryExplanation}
                </p>
              )}
            </div>
          )}

          {/* View: Solution */}
          {activeView === 'solution' && (
            <div className="space-y-2">
              <pre className="rounded bg-surface-dim p-2.5 font-mono text-cyan-300 text-xs border border-outline-variant/40 overflow-x-auto leading-relaxed">
                {solutionSql}
              </pre>
              {solutionExplanation && (
                <p className="text-text-muted text-xs leading-relaxed">
                  {solutionExplanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export HintSystem as alias to HelpDropdown for backward compatibility
export const HintSystem = HelpDropdown;
