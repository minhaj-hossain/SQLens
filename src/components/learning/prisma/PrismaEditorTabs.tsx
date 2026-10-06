'use client';
/**
 * Prisma editor tabs — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * The tab strip both Prisma surfaces share: `query.ts` and `schema.prisma`.
 * Kept as one component so the practice view and the challenge view can never
 * offer different tabs, and so the SQL track simply never renders it.
 */
import React from 'react';
import { FileCode2, FileText } from 'lucide-react';
import type { PrismaEditorTab } from '../../../lib/track-submit';

export interface PrismaEditorTabsProps {
  active: PrismaEditorTab;
  onChange: (tab: PrismaEditorTab) => void;
  /** Mode label for the code file (`TYPESCRIPT` on both current surfaces). */
  codeLabel?: string;
  className?: string;
}

export const PrismaEditorTabs: React.FC<PrismaEditorTabsProps> = ({
  active,
  onChange,
  codeLabel = 'TYPESCRIPT',
  className = '',
}) => {
  const base =
    'inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10.5px] transition cursor-pointer rounded-md whitespace-nowrap shrink-0';
  return (
    <div
      role="tablist"
      aria-label="Prisma editor tabs"
      className={`flex items-center gap-1 shrink-0 ${className}`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === 'editor'}
        onClick={() => onChange('editor')}
        className={`${base} ${
          active === 'editor'
            ? 'bg-surface-3 text-text border border-border'
            : 'text-text-dim hover:text-text border border-transparent'
        }`}
      >
        <FileText className="w-3 h-3" />
        {codeLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'schema'}
        onClick={() => onChange('schema')}
        className={`${base} ${
          active === 'schema'
            ? 'bg-surface-3 text-text border border-border'
            : 'text-text-dim hover:text-text border border-transparent'
        }`}
      >
        <FileCode2 className="w-3 h-3" />
        SCHEMA
      </button>
    </div>
  );
};

export default PrismaEditorTabs;
