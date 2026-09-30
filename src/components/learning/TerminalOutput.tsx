import React from 'react';
import { Terminal } from 'lucide-react';

/**
 * P1.2 — simulated CLI output card for snippet labs (e.g. `npx prisma generate`).
 *
 * The browser has no shell: this renders the deterministic output the real
 * Prisma CLI prints for the taught command, visibly labelled as simulated so
 * it never reads as a claim that a process ran. Styling mirrors the SQL Lens
 * statement cards (editor-bg body, muted caption bar).
 */
export const TerminalOutput: React.FC<{ output: string; className?: string }> = ({
  output,
  className = '',
}) => (
  <div className={`rounded-lg border border-border bg-editor-bg overflow-hidden ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-1.5 bg-surface-2 border-b border-border-soft">
      <div className="flex items-center gap-1.5 min-w-0">
        <Terminal className="w-3 h-3 text-text-dim shrink-0" />
        <span className="font-mono text-[10.5px] text-text-dim uppercase tracking-wide">
          Terminal
        </span>
      </div>
      <span className="text-[10px] font-mono text-text-faint">
        Simulated CLI output — no shell ran in your browser
      </span>
    </div>
    <pre className="px-3 py-2.5 font-mono text-[11.5px] leading-[1.7] text-editor-text bg-editor-bg overflow-x-auto whitespace-pre-wrap break-words">
      {output}
    </pre>
  </div>
);
