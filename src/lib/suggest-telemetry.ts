/**
 * Suggestion telemetry (Batch 5, item 2) â€” a LOCAL-ONLY ring buffer.
 *
 * Why: "which prefix does the suggestion engine fail?" should be data, not
 * guessing. Every pass that shows a list, every accept and every dismiss is
 * recorded with the prefix, the context, how long the pass took and how long
 * the user took to decide. Aggregates then surface slow passes and prefixes
 * that are shown but never accepted (`shown` with zero `accepted` = the engine
 * offered something the learner never wanted).
 *
 * Deliberately no network: the buffer lives in localStorage and is read by the
 * `/admin/query-debug` panel, matching how `suggestion-history` works. Every
 * storage access is try/catch guarded so SSR / private mode is a no-op.
 */

export type SuggestEventKind = 'shown' | 'accepted' | 'dismissed';

export interface SuggestEvent {
  kind: SuggestEventKind;
  /** Typed prefix (including any `alias.`), upper-cased and capped. */
  prefix: string;
  /** Suggestion context (`keyword` | `tables` | `columns` | ...). */
  ctx?: string;
  /** How many candidates were offered (`shown` only). */
  count?: number;
  /** Duration of the debounced suggestion pass in ms (`shown` only). */
  passMs?: number;
  /** Time from the list appearing to the user's decision, in ms. */
  decisionMs?: number;
  /** Accepted suggestion text (`accepted` only). */
  text?: string;
  /** Epoch ms. */
  t: number;
}

const STORAGE_KEY = 'sqlens:suggest-telemetry';

/** Ring-buffer capacity â€” newest first, oldest dropped. */
export const MAX_EVENTS = 200;

/** Longest prefix stored, so one pasted wall of text can't bloat the buffer. */
const MAX_PREFIX = 24;

function normalizePrefix(prefix: string): string {
  return prefix.trim().toUpperCase().slice(-MAX_PREFIX);
}

function isEvent(e: unknown): e is SuggestEvent {
  if (!e || typeof e !== 'object') return false;
  const c = e as Partial<SuggestEvent>;
  return (
    (c.kind === 'shown' || c.kind === 'accepted' || c.kind === 'dismissed') &&
    typeof c.prefix === 'string' &&
    typeof c.t === 'number'
  );
}

/** Newest-first list of recorded events. Never throws. */
export function readSuggestEvents(): SuggestEvent[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEvent).slice(0, MAX_EVENTS);
  } catch {
    return [];
  }
}

/**
 * Append one event, newest-first. The input is normalised (prefix trimmed /
 * upper-cased / length-capped) and the ring buffer is trimmed to `MAX_EVENTS`.
 * Returns the stored buffer so callers can re-render without a second read.
 */
export function recordSuggestEvent(
  event: Omit<SuggestEvent, 'prefix' | 't'> & { prefix: string; t?: number },
): SuggestEvent[] {
  const next: SuggestEvent = {
    ...event,
    prefix: normalizePrefix(event.prefix),
    t: event.t ?? Date.now(),
  };
  const buffer = [next, ...readSuggestEvents()].slice(0, MAX_EVENTS);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
    }
  } catch {
    /* private mode / quota â€” telemetry is best-effort */
  }
  return buffer;
}

export function clearSuggestEvents(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Nearest-rank percentile of a numeric sample; `null` for an empty sample. */
export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil(Math.min(Math.max(p, 0), 1) * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}

export interface PrefixStats {
  prefix: string;
  shown: number;
  accepted: number;
  dismissed: number;
  /** Shown but neither accepted nor dismissed â€” the learner kept typing. */
  ignored: number;
  /** accepted / shown, 0 when never shown. */
  acceptRate: number;
  /** Median duration of the suggestion pass, ms. */
  passP50: number | null;
  passP95: number | null;
  /** Median time-to-decision (accept or dismiss), ms. */
  decideP50: number | null;
}

/**
 * Per-prefix aggregates, busiest prefix first (ties broken alphabetically so
 * the panel's order is stable between reads).
 */
export function summarizeSuggestEvents(events: SuggestEvent[]): PrefixStats[] {
  const groups = new Map<string, SuggestEvent[]>();
  for (const e of events) {
    const list = groups.get(e.prefix);
    if (list) list.push(e);
    else groups.set(e.prefix, [e]);
  }

  const stats: PrefixStats[] = [];
  for (const [prefix, group] of groups) {
    const shown = group.filter((e) => e.kind === 'shown');
    const accepted = group.filter((e) => e.kind === 'accepted').length;
    const dismissed = group.filter((e) => e.kind === 'dismissed').length;
    const passTimes = shown
      .map((e) => e.passMs)
      .filter((n): n is number => typeof n === 'number');
    const decideTimes = group
      .filter((e) => e.kind !== 'shown')
      .map((e) => e.decisionMs)
      .filter((n): n is number => typeof n === 'number');
    stats.push({
      prefix,
      shown: shown.length,
      accepted,
      dismissed,
      ignored: Math.max(0, shown.length - accepted - dismissed),
      acceptRate: shown.length > 0 ? accepted / shown.length : 0,
      passP50: percentile(passTimes, 0.5),
      passP95: percentile(passTimes, 0.95),
      decideP50: percentile(decideTimes, 0.5),
    });
  }

  stats.sort((a, b) => b.shown - a.shown || a.prefix.localeCompare(b.prefix));
  return stats;
}

/**
 * Prefixes the engine shows but nobody accepts â€” the actionable list. A prefix
 * needs `minShown` appearances and zero accepts to qualify, so a single stray
 * dismissal never looks like a systemic miss.
 */
export function missedPrefixes(
  events: SuggestEvent[],
  minShown = 2,
  limit = 5,
): PrefixStats[] {
  return summarizeSuggestEvents(events)
    .filter((s) => s.shown >= minShown && s.accepted === 0)
    .sort((a, b) => b.ignored + b.dismissed - (a.ignored + a.dismissed) || b.shown - a.shown)
    .slice(0, limit);
}

/** Slowest suggestion passes by p95 â€” the perf watch-list. */
export function slowestPasses(events: SuggestEvent[], limit = 5): PrefixStats[] {
  return summarizeSuggestEvents(events)
    .filter((s) => s.passP95 !== null)
    .sort((a, b) => (b.passP95 ?? 0) - (a.passP95 ?? 0))
    .slice(0, limit);
}
