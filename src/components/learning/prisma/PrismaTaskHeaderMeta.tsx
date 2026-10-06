'use client';

import React from 'react';
import type { PracticeTask, Concept } from '../../../types/curriculum';

interface PrismaTaskHeaderMetaProps {
  task: PracticeTask;
  concept?: Concept;
}

export const PrismaTaskHeaderMeta: React.FC<PrismaTaskHeaderMetaProps> = ({ task }) => {
  const modelName =
    task.prisma?.validation?.targetModel
      ? task.prisma.validation.targetModel.charAt(0).toUpperCase() +
        task.prisma.validation.targetModel.slice(1)
      : task.primaryTable
        ? task.primaryTable.charAt(0).toUpperCase() + task.primaryTable.slice(1)
        : 'Model';

  const surface =
    task.prisma?.activeTab === 'schema'
      ? 'schema.prisma'
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
    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs bg-surface-2 border border-border-soft rounded-lg p-2.5 sm:px-4 sm:py-2.5 min-w-0">
      {/* Model */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:pr-4 sm:mr-0 sm:border-r sm:border-border shrink-0">
        <span className="text-text-faint text-[10px] sm:text-xs tracking-wider">MODEL</span>
        <span className="text-text font-semibold text-[11px] sm:text-xs">{modelName}</span>
      </div>

      {/* Surface / Editor Tab */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:pr-4 sm:mr-0 sm:border-r sm:border-border shrink-0">
        <span className="text-text-faint text-[10px] sm:text-xs tracking-wider">TARGET</span>
        <span className="text-text font-semibold text-[11px] sm:text-xs">{surface}</span>
      </div>

      {/* Contract / Focus */}
      {targetFocus && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:pr-4 sm:mr-0 sm:border-r sm:border-border min-w-0 max-w-full">
          <span className="text-text-faint text-[10px] sm:text-xs tracking-wider shrink-0">FOCUS</span>
          <span className="text-text font-semibold text-[11px] sm:text-xs truncate">
            {targetFocus}
          </span>
        </div>
      )}

      {/* Role / Stage */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border sm:border-none sm:bg-transparent sm:px-0 sm:py-0 shrink-0">
        <span className="text-text-faint text-[10px] sm:text-xs tracking-wider">STAGE</span>
        <span className="text-text font-semibold text-[11px] sm:text-xs">{roleLabel}</span>
      </div>
    </div>
  );
};
