'use client';

import React from 'react';

interface SpotlightLayerProps {
  spotlight: string | null;
  children: React.ReactNode;
  activeLabel?: string;
  onClearSpotlight?: () => void;
}

export const SpotlightLayer: React.FC<SpotlightLayerProps> = ({
  spotlight,
  children,
  activeLabel,
  onClearSpotlight,
}) => {
  return (
    <div
      className={`relative w-full h-full min-w-0 transition-all duration-300 ${
        spotlight ? 'mentor-spotlight-active' : ''
      }`}
      data-active-spotlight={spotlight ?? 'none'}
    >
      {/* Ambient Spotlight Indicator Pill */}
      {spotlight && activeLabel && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-3/90 backdrop-blur-md border border-func/40 shadow-lg text-[11px] font-mono font-medium text-func animate-in fade-in zoom-in-95 duration-200">
          <span className="w-2 h-2 rounded-full bg-func animate-pulse" />
          <span>Focus: {activeLabel}</span>
          {onClearSpotlight && (
            <button
              type="button"
              onClick={onClearSpotlight}
              className="ml-1 text-text-muted hover:text-text focus:outline-none"
              title="Clear spotlight"
              aria-label="Clear focus"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Target Content Canvas */}
      {children}
    </div>
  );
};
