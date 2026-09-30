'use client';
/**
 * Prisma ERD visualizer — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * Draws the `schema.prisma` the current surface actually runs against. The graph
 * is not a decorative picture: boxes are the models the translator resolves,
 * every edge is a relation WITH the FK column that makes it usable, and a
 * relation the generator cannot turn into SQL is drawn as an honest dashed edge
 * with the reason printed underneath.
 *
 * Interactivity is real state, not animation: click a model to focus it (its
 * relations stay bright, the rest dim; its fields are listed with their SQL
 * types), click again to clear.
 */
import React, { useMemo, useState } from 'react';
import { Network, Info, ArrowRight } from 'lucide-react';
import {
  buildErdDiagramFromSource,
  layoutErdDiagram,
  type ErdRelation,
} from '../../../lib/prisma-engine/prisma-erd';

/** Mirrors the `--color-*` tokens in `globals.css` (SVG cannot take the classes). */
const C = {
  box: '#0f1726',
  boxHeader: '#162032',
  border: 'rgba(56, 189, 248, 0.28)',
  text: '#f0f6fc',
  dim: '#94a3b8',
  faint: '#64748b',
  accent: '#38bdf8',
  warning: '#f59e0b',
};

export interface PrismaErdVisualizerProps {
  /** The `schema.prisma` source to draw. */
  source: string;
  className?: string;
}

/** `User.posts → Post` reads better than the raw relation id. */
function relationLabel(relation: ErdRelation): string {
  const arrow =
    relation.kind === 'one-to-many' ? '1 → ∞' : relation.kind === 'many-to-many' ? '∞ ↔ ∞' : '1 → 1';
  return `${relation.from}.${relation.fromField} ${arrow} ${relation.to}`;
}

export const PrismaErdVisualizer: React.FC<PrismaErdVisualizerProps> = ({
  source,
  className = '',
}) => {
  const [focused, setFocused] = useState<string | null>(null);

  const diagram = useMemo(() => buildErdDiagramFromSource(source), [source]);
  const layout = useMemo(
    () => layoutErdDiagram(diagram, { columns: diagram.models.length > 2 ? 2 : 1 }),
    [diagram],
  );

  const relatedModels = useMemo(() => {
    if (!focused) return null;
    const set = new Set<string>([focused]);
    for (const edge of diagram.relations) {
      if (edge.from === focused) set.add(edge.to);
      if (edge.to === focused) set.add(edge.from);
    }
    return set;
  }, [diagram.relations, focused]);

  const focusedBox = focused ? diagram.models.find((m) => m.name === focused) : undefined;

  if (diagram.models.length === 0) {
    return (
      <div
        className={`rounded-xl border border-border bg-surface p-4 font-mono text-[11.5px] text-text-dim ${className}`}
      >
        This schema declares no model, so there is no ERD to draw.
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border bg-surface overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-border-soft bg-surface-2">
        <div className="flex items-center gap-2 min-w-0">
          <Network className="w-3.5 h-3.5 text-func shrink-0" />
          <span className="font-mono text-[11px] font-semibold text-text-dim uppercase tracking-wider">
            Schema ERD
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-3 text-text-dim text-[10px] font-mono border border-border">
            {diagram.models.length} model{diagram.models.length === 1 ? '' : 's'} ·{' '}
            {diagram.relations.length} relation{diagram.relations.length === 1 ? '' : 's'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-faint hidden sm:inline">
          {focused ? `focused: ${focused}` : 'click a model to focus its relations'}
        </span>
      </div>

      <div className="overflow-x-auto bg-editor-bg">
        <svg
          role="img"
          aria-label={`Entity relationship diagram of ${diagram.models.length} models`}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="w-full h-auto min-w-[420px]"
        >
          {/* Edges first, so boxes sit on top of the curves. */}
          {layout.edges.map(({ relation, path, labelX, labelY }) => {
            const active =
              !focused || relatedModels?.has(relation.from) || relatedModels?.has(relation.to);
            const bright =
              focused !== null &&
              relatedModels?.has(relation.from) &&
              relatedModels?.has(relation.to);
            return (
              <g key={relation.id} opacity={active ? 1 : 0.25}>
                <path
                  d={path}
                  fill="none"
                  stroke={relation.executable ? C.accent : C.warning}
                  strokeWidth={bright ? 2 : 1.4}
                  strokeDasharray={relation.executable ? undefined : '5 4'}
                  markerEnd="url(#erd-arrow)"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize={10}
                  fill={relation.executable ? C.dim : C.warning}
                >
                  {relation.foreignKey
                    ? `${relation.foreignKey} → ${relation.referencedKey}`
                    : 'implicit FK'}
                </text>
              </g>
            );
          })}
          <defs>
            <marker
              id="erd-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.accent} />
            </marker>
          </defs>

          {layout.boxes.map((box) => {
            const dimmed = relatedModels !== null && !relatedModels.has(box.model.name);
            return (
              <g
                key={box.model.name}
                opacity={dimmed ? 0.35 : 1}
                onClick={() => setFocused((prev) => (prev === box.model.name ? null : box.model.name))}
                className="cursor-pointer"
              >
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={10}
                  fill={C.box}
                  stroke={focused === box.model.name ? C.accent : C.border}
                  strokeWidth={focused === box.model.name ? 2 : 1}
                />
                <rect x={box.x} y={box.y} width={box.width} height={32} rx={10} fill={C.boxHeader} />
                <text
                  x={box.x + 12}
                  y={box.y + 21}
                  fontFamily="ui-monospace, monospace"
                  fontSize={12}
                  fill={C.text}
                  fontWeight={700}
                >
                  {box.model.name}
                </text>
                <text
                  x={box.x + box.width - 12}
                  y={box.y + 21}
                  textAnchor="end"
                  fontFamily="ui-monospace, monospace"
                  fontSize={10}
                  fill={C.faint}
                >
                  {box.model.table}
                </text>
                {box.model.fields.map((field, index) => {
                  const y = box.y + 46 + index * 17;
                  const badges = [
                    field.flags.includes('pk') ? 'PK' : null,
                    field.flags.includes('fk') ? 'FK' : null,
                    field.flags.includes('unique') ? 'UQ' : null,
                  ].filter(Boolean) as string[];
                  return (
                    <g key={field.name}>
                      <text
                        x={box.x + 12}
                        y={y}
                        fontFamily="ui-monospace, monospace"
                        fontSize={11}
                        fill={field.flags.includes('fk') ? C.accent : C.text}
                      >
                        {field.name}
                      </text>
                      <text
                        x={box.x + box.width - 12}
                        y={y}
                        textAnchor="end"
                        fontFamily="ui-monospace, monospace"
                        fontSize={10}
                        fill={C.dim}
                      >
                        {`${field.sqlType}${field.flags.includes('list') ? '[]' : ''}${
                          field.flags.includes('optional') ? '?' : ''
                        }${badges.length > 0 ? ` ${badges.join(' ')}` : ''}`}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Focused model details — the field list the box had to abbreviate. */}
      {focusedBox && (
        <div className="px-3.5 py-2 border-t border-border-soft bg-surface-2 font-mono text-[11px] text-text-dim space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text font-semibold">{focusedBox.name}</span>
            <ArrowRight className="w-3 h-3 text-text-faint" />
            <span className="text-func">{focusedBox.table}</span>
            {focusedBox.relations.length > 0 && (
              <span className="text-text-faint">relations: {focusedBox.relations.join(', ')}</span>
            )}
          </div>
          {diagram.relations
            .filter((r) => r.from === focused)
            .map((r) => (
              <div key={r.id} className="leading-relaxed">
                <span className={r.executable ? 'text-text' : 'text-warning-text'}>
                  {relationLabel(r)}
                </span>
                {r.executable ? (
                  <span className="text-text-faint">
                    {' '}
                    · executable: FK {r.foreignKey} → {r.referencedKey}
                  </span>
                ) : (
                  <span className="text-warning-text"> · {r.note}</span>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Honest notes: targets the schema never declares, tables without columns. */}
      {diagram.notes.length > 0 && (
        <div className="px-3.5 py-2 border-t border-border-soft bg-warning-bg flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-warning-text shrink-0 mt-0.5" />
          <ul className="font-mono text-[10.5px] text-warning-text leading-relaxed space-y-0.5">
            {diagram.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrismaErdVisualizer;

