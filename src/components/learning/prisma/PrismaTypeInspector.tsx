'use client';
/**
 * Prisma Type Inspector — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * Two types, clearly labelled, because they are not the same thing:
 *
 *   · REFERENCE — the task's authored `prisma.expectedType`: what the reference
 *     call resolves to (`{ id: number; name: string } | null`).
 *   · OBSERVED  — inferred from the rows the engine actually returned, with the
 *     per-column runtime types and nullability (`prisma-type-inference.ts`).
 *
 * The panel says which one it is showing and refuses to fake the missing half:
 * before a Run there is no observed type, and when a task authors none there is
 * no reference type — an empty result set never invents a shape.
 */
import React from 'react';
import { Braces, Eye, Info } from 'lucide-react';
import type { TypeInspectorState } from '../../../lib/track-submit';

export interface PrismaTypeInspectorProps {
  state: TypeInspectorState;
  className?: string;
}

export const PrismaTypeInspector: React.FC<PrismaTypeInspectorProps> = ({ state, className = '' }) => {
  const { expectedType, inferred } = state;

  return (
    <div
      id="prisma-type-inspector"
      className={`border-b border-border-soft bg-surface-2/50 px-3 sm:px-4 py-2.5 space-y-2 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Braces className="w-3.5 h-3.5 text-func shrink-0" />
        <span className="font-mono text-[11px] font-semibold text-text-dim uppercase tracking-wider">
          Type Inspector
        </span>
        {inferred.observed && inferred.tsType && (
          <span className="px-2 py-0.5 rounded bg-surface-3 text-text text-[10px] font-mono border border-border">
            observed {inferred.tsType}
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="w-3 h-3 text-text-faint" />
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wide">
              Reference type (authored)
            </span>
          </div>
          <p className="font-mono text-[11.5px] text-text break-words">
            {expectedType ?? 'No reference type authored for this lab.'}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Braces className="w-3 h-3 text-text-faint" />
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wide">
              Observed result (this run)
            </span>
          </div>
          <p className="font-mono text-[11.5px] text-text break-words">
            {inferred.tsType ?? 'Not observed yet.'}
          </p>
        </div>
      </div>

      {inferred.fields.length > 0 && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <table className="w-full border-collapse font-mono text-[10.5px]">
            <thead>
              <tr className="bg-surface-2 text-text-faint">
                <th className="text-left font-semibold px-2.5 py-1.5 border-b border-border-soft">column</th>
                <th className="text-left font-semibold px-2.5 py-1.5 border-b border-border-soft">type</th>
                <th className="text-left font-semibold px-2.5 py-1.5 border-b border-border-soft">null</th>
                <th className="text-left font-semibold px-2.5 py-1.5 border-b border-border-soft">sample</th>
              </tr>
            </thead>
            <tbody>
              {inferred.fields.map((field) => (
                <tr key={field.name} className="text-text-dim">
                  <td className="px-2.5 py-1 border-b border-border-soft text-text">{field.name}</td>
                  <td className="px-2.5 py-1 border-b border-border-soft text-func">{field.tsType}</td>
                  <td className="px-2.5 py-1 border-b border-border-soft">
                    {field.nullable ? 'yes' : 'no'}
                  </td>
                  <td className="px-2.5 py-1 border-b border-border-soft truncate max-w-[160px]">
                    {field.sample === null || field.sample === undefined
                      ? '—'
                      : String(field.sample)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="flex items-start gap-1.5 font-mono text-[10.5px] text-text-faint leading-relaxed">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        <span>{inferred.note}</span>
      </p>
    </div>
  );
};

export default PrismaTypeInspector;
