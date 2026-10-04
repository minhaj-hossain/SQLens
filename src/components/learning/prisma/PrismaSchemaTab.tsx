'use client';
/**
 * schema.prisma tab — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * The dedicated schema surface of the Prisma editor: the exact `schema.prisma`
 * the current task is translated against, next to the live ERD of that same
 * string. Both views come from ONE source of truth (the task's schema), so the
 * text and the diagram can never drift apart.
 */
import React, { useState } from 'react';
import { Check, Copy, FileCode2, Network } from 'lucide-react';
import { PrismaErdVisualizer } from './PrismaErdVisualizer';
import { MonacoCodeEditor } from '../MonacoCodeEditor';

export interface PrismaSchemaTabProps {
  /** The `schema.prisma` source shown (and drawn). */
  source: string;
  /** File label for the header (`schema.prisma`). */
  label?: string;
  /** One line saying WHICH schema this is (task-authored vs seed universe). */
  caption?: string;
  className?: string;
  /** Controlled active view ('source' or 'diagram' / ERD). */
  activeView?: 'source' | 'diagram';
  /** Callback when user changes the view. */
  onViewChange?: (view: 'source' | 'diagram') => void;
}

export const PrismaSchemaTab: React.FC<PrismaSchemaTabProps> = ({
  source,
  label = 'schema.prisma',
  caption,
  className = '',
  activeView,
  onViewChange,
}) => {
  const [internalView, setInternalView] = useState<'source' | 'diagram'>(activeView ?? 'source');
  const view = activeView ?? internalView;

  const handleViewChange = (nextView: 'source' | 'diagram') => {
    setInternalView(nextView);
    onViewChange?.(nextView);
  };

  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — nothing to report */
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-surface-2 border-b border-border-soft select-none">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode2 className="w-3.5 h-3.5 text-text-faint shrink-0" />
          <span className="text-[11px] font-mono text-text font-semibold tracking-wide truncate">
            {label}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-text-faint px-2 py-0.5 rounded bg-surface border border-border shrink-0">
            read-only
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => handleViewChange('source')}
              className={`px-2.5 py-1 text-[10.5px] font-mono transition cursor-pointer ${
                view === 'source' ? 'bg-surface-3 text-text' : 'text-text-dim hover:text-text'
              }`}
            >
              Source
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('diagram')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-mono transition cursor-pointer ${
                view === 'diagram' ? 'bg-surface-3 text-text' : 'text-text-dim hover:text-text'
              }`}
            >
              <Network className="w-3 h-3" /> ERD
            </button>
          </div>
          <button
            type="button"
            onClick={() => void copy()}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface rounded transition cursor-pointer"
            title="Copy the schema source"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {caption && (
        <p className="px-4 py-2 font-mono text-[10.5px] text-text-faint bg-surface border-b border-border-soft leading-relaxed">
          {caption}
        </p>
      )}

      {view === 'source' ? (
        <MonacoCodeEditor
          value={source}
          onChange={() => {}}
          readOnly
          language="prisma"
          minHeight="360px"
        />
      ) : (
        <div className="p-3 bg-surface">
          <PrismaErdVisualizer source={source} />
        </div>
      )}
    </div>
  );
};

export default PrismaSchemaTab;
