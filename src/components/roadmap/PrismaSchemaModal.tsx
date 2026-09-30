'use client';

/**
 * PrismaSchemaModal — Phase 0.1.1 (track-aware chrome).
 * ─────────────────────────────────────────────────────────────────────────────
 * Prisma counterpart to `SchemaModal.tsx` (SQL-only). Same modal shell
 * (fixed overlay, motion scale, close-on-outside, max-w-4xl) so
 * `UiChromeProvider` can swap 1:1 by track. Body draws the seed universe's
 * `schema.prisma` via `PrismaErdVisualizer` — the exact AST the translator
 * runs against — plus a collapsible raw schema source for copy/paste learning.
 *
 * P0.1 scope: global `PRISMA_SEED_SCHEMA` only. Optional `schemaSource` prop
 * is accepted for future per-task schemas (task.prisma.schemaSource) without
 * extra work today.
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { useCloseOnOutside } from '../../lib/use-close-on-outside';
import { PRISMA_SEED_SCHEMA } from '../../lib/prisma-engine/prisma-submit-pipeline';
import { PrismaErdVisualizer } from '../learning/prisma/PrismaErdVisualizer';

export interface PrismaSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Override the drawn schema. Defaults to the seed universe's schema. */
  schemaSource?: string;
}

export const PrismaSchemaModal: React.FC<PrismaSchemaModalProps> = ({
  isOpen,
  onClose,
  schemaSource,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking/tapping anywhere outside the modal panel.
  useCloseOnOutside(panelRef, isOpen, onClose);

  if (!isOpen) return null;

  const source = schemaSource && schemaSource.trim().length > 0 ? schemaSource : PRISMA_SEED_SCHEMA;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Prisma schema reference"
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-4xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft bg-ink px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon name="schema" className="text-[20px] text-text-dim" />
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
                Prisma Schema Reference
              </h2>
              <p className="font-mono text-[10.5px] text-text-faint mt-0.5">
                User &#8596; Post seed universe &mdash; the schema every probe runs against
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Prisma schema reference"
            className="rounded p-1 text-text-dim hover:bg-surface-2 hover:text-text transition cursor-pointer"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto bg-surface">
          <PrismaErdVisualizer source={source} />

          <details className="rounded-lg border border-border bg-ink overflow-hidden">
            <summary className="cursor-pointer px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-dim hover:text-text transition list-none">
              schema.prisma source
            </summary>
            <pre className="px-3.5 py-3 border-t border-border-soft font-mono text-[11.5px] leading-relaxed text-text overflow-x-auto whitespace-pre">
              {source}
            </pre>
          </details>
        </div>
      </motion.div>
    </div>
  );
};

export default PrismaSchemaModal;
