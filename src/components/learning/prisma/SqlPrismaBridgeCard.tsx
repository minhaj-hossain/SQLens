'use client';

import React from 'react';
import { ArrowLeftRight, Database, Code, Info } from 'lucide-react';
import type { PrismaSqlBridge } from '../../../types/prisma-curriculum';
import { highlightSql } from '../sql-blocks';

interface SqlPrismaBridgeCardProps {
  bridge: PrismaSqlBridge;
}

export const SqlPrismaBridgeCard: React.FC<SqlPrismaBridgeCardProps> = ({ bridge }) => {
  if (!bridge || !bridge.mappings || bridge.mappings.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-2/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface-2 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-func shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-text font-semibold">
            {bridge.title || 'From SQL to Prisma'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-faint">
          Concept Comparison
        </span>
      </div>

      {bridge.description && (
        <div className="px-4 py-2.5 bg-surface-1/50 border-b border-border-soft text-xs text-text-dim leading-relaxed">
          {bridge.description}
        </div>
      )}

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-soft bg-surface-3/30 font-mono text-[10.5px] uppercase tracking-wider text-text-faint">
              <th className="py-2.5 px-4 w-1/2">
                <div className="flex items-center gap-1.5 text-text-dim">
                  <Database className="w-3 h-3 text-func" />
                  <span>SQL (Physical Database)</span>
                </div>
              </th>
              <th className="py-2.5 px-4 w-1/2">
                <div className="flex items-center gap-1.5 text-text-dim">
                  <Code className="w-3 h-3 text-emerald-400" />
                  <span>Prisma Schema / Client</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft font-mono text-xs">
            {bridge.mappings.map((mapping, idx) => (
              <tr
                key={idx}
                className="hover:bg-surface-3/20 transition-colors"
              >
                {/* SQL Side */}
                <td className="py-3 px-4 align-top">
                  <div className="text-editor-text leading-relaxed whitespace-pre-wrap">
                    {mapping.sql === '(no equivalent)' ? (
                      <span className="italic text-text-faint opacity-80">
                        (no equivalent)
                      </span>
                    ) : (
                      <span
                        dangerouslySetInnerHTML={{ __html: highlightSql(mapping.sql) }}
                      />
                    )}
                  </div>
                  {mapping.sql === '(no equivalent)' && (
                    <div className="mt-1 font-sans text-[11px] text-text-faint">
                      No physical table or column exists
                    </div>
                  )}
                </td>

                {/* Prisma Side */}
                <td className="py-3 px-4 align-top">
                  <div className="text-emerald-300 leading-relaxed font-semibold whitespace-pre-wrap">
                    {mapping.prisma}
                  </div>
                  {mapping.note && (
                    <div className="mt-1 font-sans text-[11px] text-text-dim flex items-center gap-1">
                      <Info className="w-3 h-3 text-text-faint shrink-0" />
                      <span>{mapping.note}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
