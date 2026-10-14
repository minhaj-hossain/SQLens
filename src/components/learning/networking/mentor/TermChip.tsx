'use client';

import React from 'react';

interface TermChipProps {
  termKey: string;
  label: string;
  partId: string;
  isActive?: boolean;
  onHover?: (partId: string | null) => void;
  onClick?: (partId: string) => void;
}

export const TermChip: React.FC<TermChipProps> = ({
  label,
  partId,
  isActive = false,
  onHover,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(partId)}
      onMouseEnter={() => onHover?.(partId)}
      onMouseLeave={() => onHover?.(null)}
      className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono font-semibold transition-all duration-150 border-b-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-func/50 ${
        isActive
          ? 'bg-func/20 text-func border-func shadow-sm'
          : 'bg-surface-2 hover:bg-func/15 text-text border-dashed border-func/60 hover:border-func hover:text-func'
      }`}
      title={`Inspect ${label} on canvas`}
      aria-label={`Highlight ${label}`}
    >
      <span className="text-[10px] text-func/70 mr-1 select-none">#</span>
      {label}
    </button>
  );
};
