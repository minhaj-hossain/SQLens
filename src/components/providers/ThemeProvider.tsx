'use client';
/**
 * ThemeProvider — owns the app-wide color theme (see src/lib/theme-system.ts).
 *
 * The FOUC-guard script in the root layout's <head> applies the persisted
 * `data-theme` to <html> BEFORE hydration; on mount this provider syncs its
 * React state with that attribute, then keeps both in step on every change
 * (attribute + localStorage + mobile theme-color meta).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_THEME,
  THEME_COLORS,
  applyTheme,
  getStoredTheme,
  isValidTheme,
  type ThemeId,
} from '@/lib/theme-system';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  /** Cycles graphite -> sky -> graphite. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start at the default; the mount effect adopts whatever the pre-hydration
  // script already applied to <html> (avoids any flash of the wrong palette).
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (isValidTheme(attr)) {
      setThemeState(attr);
    } else {
      const stored = getStoredTheme();
      if (stored && stored !== DEFAULT_THEME) applyTheme(stored);
      setThemeState(stored ?? DEFAULT_THEME);
    }
  }, []);

  // Keep the mobile browser chrome in sync with the active palette.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[theme];
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeId = prev === 'sky' ? 'graphite' : 'sky';
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export default ThemeProvider;
