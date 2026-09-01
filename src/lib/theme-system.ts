/**
 * theme-system — the SQLens theme registry.
 *
 * Two palettes exist, both defined in `src/app/globals.css` as CSS custom
 * properties (Tailwind v4 `@theme` mirrors included):
 *
 *   graphite (default) — monochrome grays + gold #f4c430 accent
 *   sky                — the ORIGINAL SQLens palette restored from git
 *                        history (commit 902874c): dark navy surfaces,
 *                        sky-blue #38BDF8 accent, cyan SQL keywords,
 *                        emerald string literals, amber numbers,
 *                        zinc-gray comments, near-white identifiers.
 *
 * A theme is activated by setting `data-theme="<id>"` on <html>. `:root`
 * holds the graphite values, `:root[data-theme='sky']` overrides every
 * token — so the entire UI (utilities, base layer, keyframes, inline
 * var() usages) re-themes with zero component changes.
 */

export const THEMES = ['graphite', 'sky'] as const;

export type ThemeId = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeId = 'graphite';

export const STORAGE_KEY = 'sqlens:theme';

/** Browser theme-color (mobile chrome) per theme. */
export const THEME_COLORS: Record<ThemeId, string> = {
  graphite: '#0a0a0a',
  sky: '#0a0d12',
};

export function isValidTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Reads the persisted theme; returns null when absent/corrupt/SSR. */
export function getStoredTheme(): ThemeId | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isValidTheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Applies a theme to the document and persists the choice. */
export function applyTheme(theme: ThemeId): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode etc.) — theme still applies */
    }
  }
}
