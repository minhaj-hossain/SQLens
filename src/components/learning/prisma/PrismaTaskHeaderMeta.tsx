'use client';

import React from 'react';
import type { PracticeTask, Concept } from '../../../types/curriculum';
import { taskWorkspaceMode } from '../../../lib/track-submit';

interface PrismaTaskHeaderMetaProps {
  task: PracticeTask;
  concept?: Concept;
}

export const PrismaTaskHeaderMeta: React.FC<PrismaTaskHeaderMetaProps> = ({ task }) => {
  const mode = taskWorkspaceMode(task);
  const isSchemaMode = mode === 'schema';
  const isCliMode = mode === 'cli';

  const modelName =
    task.prisma?.validation?.targetModel
      ? task.prisma.validation.targetModel.charAt(0).toUpperCase() +
        task.prisma.validation.targetModel.slice(1)
      : task.primaryTable
        ? task.primaryTable.charAt(0).toUpperCase() + task.primaryTable.slice(1)
        : 'Model';

  const surface = isSchemaMode
    ? 'schema.prisma'
    : isCliMode
      ? 'Terminal'
      : 'TypeScript Client';

  const method = task.prisma?.validation?.requiredMethod;
  const includes = task.prisma?.validation?.requiredIncludes;
  const snippets = task.prisma?.validation?.requiredCodeSnippets;

  let targetFocus = '';
  if (snippets && snippets.length > 0) {
    targetFocus = snippets[0].replace(/[`\\]/g, '');
    if (targetFocus.length > 35) targetFocus = targetFocus.slice(0, 32) + '...';
  } else if (includes && includes.length > 0) {
    targetFocus = `include: { ${includes.join(', ')} }`;
  } else if (method) {
    targetFocus = `prisma.${modelName.toLowerCase()}.${method}()`;
  }

  const role = task.skillType || task.prisma?.skillType;
  const roleLabel =
    role === 'introduce'
      ? 'Foundation'
      : role === 'assess'
        ? 'Challenge'
        : 'Practice';

  return (
    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 font-mono text-xs bg-surface-2/80 border border-border-soft rounded-lg p-2 sm:p-2.5 min-w-0">
      {/* Model: Shown in Query mode. Hidden in Schema and CLI modes to reduce noise */}
      {!isSchemaMode && !isCliMode && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-soft shrink-0">
          <span className="text-text-faint text-[10px] tracking-wider uppercase font-semibold">MODEL</span>
          <span className="text-text font-semibold text-[11px] sm:text-xs">{modelName}</span>
        </div>
      )}

      {/* Surface / Editor Tab */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-soft shrink-0">
        <span className="text-text-faint text-[10px] tracking-wider uppercase font-semibold">TARGET</span>
        <span className="text-func font-medium text-[11px] sm:text-xs">{surface}</span>
      </div>

      {/* Contract / Focus */}
      {targetFocus && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-soft min-w-0 max-w-full">
          <span className="text-text-faint text-[10px] tracking-wider uppercase font-semibold shrink-0">FOCUS</span>
          <span className="text-text font-semibold text-[11px] sm:text-xs truncate">
            {targetFocus}
          </span>
        </div>
      )}

      {/* Role / Stage */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-soft shrink-0">
        <span className="text-text-faint text-[10px] tracking-wider uppercase font-semibold">STAGE</span>
        <span className="text-text font-semibold text-[11px] sm:text-xs">{roleLabel}</span>
      </div>
    </div>
  );
};
