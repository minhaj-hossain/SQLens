'use client';
/**
 * ThemeToggle — one-click theme switcher (header + auth pages).
 * A single click cycles graphite (gray + gold) <-> sky (navy + blue).
 * The small corner dot shows the ACTIVE palette's accent so users can
 * see which theme they're on; the tooltip says what the next click does.
 */
import React from 'react';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { ThemeId } from '@/lib/theme-system';

/** Accent color dot per palette. */
const THEME_SWATCH: Record<ThemeId, string> = {
  graphite: '#f4c430',
  sky: '#38bdf8',
};

const THEME_LABEL: Record<ThemeId, string> = {
  graphite: 'Graphite',
  sky: 'Sky',
};

export interface ThemeToggleProps {
  round?: boolean;
  className?: string;
}

export function ThemeToggle({ round = false, className = '' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const nextTheme: ThemeId = theme === 'sky' ? 'graphite' : 'sky';

  if (round) {
    return (
      <button
        type="button"
        onClick={toggle}
        title={`Theme: ${THEME_LABEL[theme]} — click for ${THEME_LABEL[nextTheme]}`}
        aria-label={`Color theme: ${THEME_LABEL[theme]}. Switch to ${THEME_LABEL[nextTheme]}`}
        className={`w-9 h-9 rounded-full border border-[#1b2a47] bg-[#0d1526] text-[#8a9bbd] hover:text-[#e8eefb] hover:border-[#38bdf8] flex items-center justify-center cursor-pointer transition-colors p-0 ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="8.5" cy="10" r="1" />
          <circle cx="12" cy="7.5" r="1" />
          <circle cx="15.5" cy="10" r="1" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Theme: ${THEME_LABEL[theme]} — click for ${THEME_LABEL[nextTheme]}`}
      aria-label={`Color theme: ${THEME_LABEL[theme]}. Switch to ${THEME_LABEL[nextTheme]}`}
      className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-func hover:border-func/40 transition-colors cursor-pointer ${className}`}
    >
      <Icon name="palette" className="text-[14px] sm:text-[15px]" />
      {/* Active-palette accent dot */}
      <span
        className="absolute bottom-[3px] right-[3px] w-1.5 h-1.5 rounded-full ring-1 ring-ink/60"
        style={{ backgroundColor: THEME_SWATCH[theme] }}
        aria-hidden="true"
      />
    </button>
  );
}

export default ThemeToggle;
