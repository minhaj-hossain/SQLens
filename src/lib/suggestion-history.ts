/**
 * Recency-boosted completion memory (Batch 2).
 * Remembers the user's last N accepted suggestion texts in localStorage so
 * `buildSuggestions` can float repeated picks (e.g. `users.email`) to the top.
 * Pure helpers stay SSR-safe: all storage access is try/catch guarded.
 */

const STORAGE_KEY = 'sqlens:suggest-history';
const MAX_ENTRIES = 20;

/** Most-recent-first list of accepted suggestion texts (upper-cased). */
export function readSuggestionHistory(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is string => typeof e === 'string').slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

/** Record one accepted suggestion; newest-first, deduped, capped. */
export function recordSuggestionPick(text: string): string[] {
  const key = text.toUpperCase();
  const next = [key, ...readSuggestionHistory().filter((e) => e !== key)].slice(0, MAX_ENTRIES);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* private mode / quota — recency is best-effort */
  }
  return next;
}

/**
 * Build a `HistoryBoost` for `buildSuggestions`: returns how many times
 * `text` appears in history weighted by recency (newest = heaviest).
 */
export function historyBoostFromList(history: string[]): (text: string) => number {
  return (text: string) => {
    const key = text.toUpperCase();
    const idx = history.indexOf(key);
    if (idx < 0) return 0;
    return MAX_ENTRIES - idx;
  };
}

/** Live boost reading straight from storage (for editor wiring). */
export function liveHistoryBoost(): (text: string) => number {
  return historyBoostFromList(readSuggestionHistory());
}
