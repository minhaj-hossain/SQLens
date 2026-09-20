/**
 * Phase 5 (grading telemetry) — a LOCAL-ONLY ring buffer, same conventions as
 * `suggest-telemetry`: nothing leaves the browser, every storage access is
 * try/catch guarded, and the ring is bounded so a long session can't grow.
 *
 * Why: after the INSERT-grading bug (a correct query could not unlock Next) the
 * open question was "how do we find the NEXT broken task without hand-testing
 * 340+ of them?". Guessing is not a strategy, so every `Run & Check` records one
 * event with the verdict of BOTH grading layers:
 *
 *   validatorPassed = true, stateOk = false  -> the learner got the row COUNT
 *       right but the VALUES wrong. High rate = the instructions (or the diff
 *       message) confuse people, not the engine. Content work, not code work.
 *   stage = 'engine-error'                   -> the learner hit a SQL error.
 *   inconclusive = true                      -> the task's own reference
 *       solution failed to run: an AUTHORING bug, filed automatically.
 *   diffColumns                              -> which columns learners get wrong
 *       most, so instruction wording can be fixed where it actually matters.
 *
 * Read by the `/admin/query-debug` panel. No network, no PII: task ids only.
 */

/** Which layer decided the verdict for one submit. */
export type GradingStage = 'engine-error' | 'validation' | 'final-state' | 'pass';

/** Where the task came from (`lesson` practice vs `challenge` task). */
export type GradingSurface = 'lesson' | 'challenge';

export interface GradingEvent {
  /** Curriculum task id, e.g. `day19-c1-t1`. */
  taskId: string;
  /** Which layer produced the failure (or `pass`). */
  stage: GradingStage;
  surface: GradingSurface;
  /** Validator layer (row count, construct, exact-result) verdict. */
  validatorPassed: boolean;
  /**
   * Final-state layer verdict. `undefined` when the layer did not run (read-only
   * SELECT tasks are graded by result, not by database state).
   */
  stateOk?: boolean;
  /** Executor `affectedRows`/`rowCount` for the learner's statement. */
  affectedRows?: number;
  /** S3-11: the task's own reference solution errored — task needs review. */
  inconclusive?: boolean;
  /** Phase 1: columns whose VALUES differed on a same-size row mismatch. */
  diffColumns?: string[];
  /** 1-based attempt number within the current task session. */
  attempt: number;
  /** Epoch ms. */
  t: number;
}

const STORAGE_KEY = 'sqlens:grading-telemetry';

/** Ring-buffer capacity — newest first, oldest dropped. */
export const MAX_EVENTS = 300;

/** Cap the recorded diff-column list so one wide table can't bloat the buffer. */
const MAX_DIFF_COLUMNS = 6;

function isStage(v: unknown): v is GradingStage {
  return v === 'engine-error' || v === 'validation' || v === 'final-state' || v === 'pass';
}

function isEvent(e: unknown): e is GradingEvent {
  if (!e || typeof e !== 'object') return false;
  const c = e as Partial<GradingEvent>;
  return (
    typeof c.taskId === 'string' &&
    c.taskId.length > 0 &&
    isStage(c.stage) &&
    typeof c.validatorPassed === 'boolean' &&
    typeof c.attempt === 'number' &&
    typeof c.t === 'number'
  );
}

/** Newest-first list of recorded events. Never throws. */
export function readGradingEvents(): GradingEvent[] {
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
 * Append one event, newest-first, then trim the ring. Returns the stored buffer
 * so a caller can re-render without a second read. Best-effort: localStorage
 * failures (SSR, private mode, quota) are swallowed — telemetry must never break
 * a learner's submit.
 */
export function recordGradingEvent(
  event: Omit<GradingEvent, 't'> & { t?: number },
): GradingEvent[] {
  const next: GradingEvent = {
    ...event,
    diffColumns: event.diffColumns?.slice(0, MAX_DIFF_COLUMNS),
    t: event.t ?? Date.now(),
  };
  const buffer = [next, ...readGradingEvents()].slice(0, MAX_EVENTS);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
    }
  } catch {
    /* private mode / quota — telemetry is best-effort */
  }
  return buffer;
}

export function clearGradingEvents(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export interface TaskGradingStats {
  taskId: string;
  attempts: number;
  passes: number;
  /** Fails where the count/construct layer rejected the query. */
  validationFails: number;
  /** Fails where the database state did not match (wrong rows/values). */
  stateFails: number;
  /** Engine errors (typos, constraint violations) — not a grading signal. */
  engineErrors: number;
  /**
   * validatorPassed=true but the final state was wrong: the learner produced the
   * right COUNT but the wrong VALUES. The classic confusing case.
   */
  valueMismatches: number;
  /** Reference solution failed to run — authoring bug, must be fixed. */
  inconclusive: number;
  /** Column -> how many times a value differed there. */
  diffColumns: Record<string, number>;
  lastT: number;
}

/** Per-task aggregation of the ring buffer. */
export function summarizeGradingEvents(events: GradingEvent[]): TaskGradingStats[] {
  const byTask = new Map<string, TaskGradingStats>();
  // Events arrive newest-first; walk oldest-first so `lastT` ends on the newest.
  for (const e of [...events].reverse()) {
    let s = byTask.get(e.taskId);
    if (!s) {
      s = {
        taskId: e.taskId,
        attempts: 0,
        passes: 0,
        validationFails: 0,
        stateFails: 0,
        engineErrors: 0,
        valueMismatches: 0,
        inconclusive: 0,
        diffColumns: {},
        lastT: e.t,
      };
      byTask.set(e.taskId, s);
    }
    s.attempts++;
    s.lastT = e.t;
    if (e.stage === 'pass') s.passes++;
    else if (e.stage === 'engine-error') s.engineErrors++;
    else if (e.stage === 'final-state') s.stateFails++;
    else s.validationFails++;
    if (e.validatorPassed && e.stateOk === false) s.valueMismatches++;
    if (e.inconclusive) s.inconclusive++;
    for (const col of e.diffColumns ?? []) {
      s.diffColumns[col] = (s.diffColumns[col] ?? 0) + 1;
    }
  }
  return Array.from(byTask.values());
}

/**
 * Tasks whose failures are dominated by "right count, wrong values".
 *
 * These are the CONTENT problems: the learner understood the shape of the
 * statement and the engine agreed, but the exact values did not land. Fix by
 * re-wording the instructions (or showing the tuple), never by loosening the
 * grader. Sorted by rate desc, then attempts desc — worst first.
 */
export function confusingTasks(
  events: GradingEvent[],
  minAttempts = 3,
  threshold = 0.3,
): TaskGradingStats[] {
  return summarizeGradingEvents(events)
    .filter((s) => s.attempts >= minAttempts && s.valueMismatches / s.attempts >= threshold)
    .sort(
      (a, b) =>
        b.valueMismatches / b.attempts - a.valueMismatches / a.attempts || b.attempts - a.attempts,
    );
}

/**
 * Tasks whose reference solution failed to run (`inconclusive`).
 *
 * A learner is never punished for these (the verdict stays a pass), which is
 * exactly why they must be surfaced loudly: silently passing tasks never get
 * fixed. Each entry = one broken `solutionSql` to repair.
 */
export function inconclusiveTasks(events: GradingEvent[]): TaskGradingStats[] {
  return summarizeGradingEvents(events)
    .filter((s) => s.inconclusive > 0)
    .sort((a, b) => b.inconclusive - a.inconclusive);
}

/** Columns that learners most often get wrong, across all tasks. */
export function mismatchedColumns(events: GradingEvent[]): { column: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    for (const col of e.diffColumns ?? []) counts.set(col, (counts.get(col) ?? 0) + 1);
  }
  return Array.from(counts, ([column, count]) => ({ column, count })).sort(
    (a, b) => b.count - a.count || a.column.localeCompare(b.column),
  );
}

export interface GradingOverview {
  submits: number;
  passes: number;
  fails: number;
  engineErrorRate: number;
  /** Right count, wrong values — the confusing-feedback rate. */
  valueMismatchRate: number;
  inconclusive: number;
  distinctTasks: number;
}

/** Headline numbers for the admin panel. */
export function gradingOverview(events: GradingEvent[]): GradingOverview {
  const submits = events.length;
  const passes = events.filter((e) => e.stage === 'pass').length;
  const engineErrors = events.filter((e) => e.stage === 'engine-error').length;
  const valueMismatches = events.filter((e) => e.validatorPassed && e.stateOk === false).length;
  const rate = (n: number) => (submits > 0 ? n / submits : 0);
  return {
    submits,
    passes,
    fails: submits - passes,
    engineErrorRate: rate(engineErrors),
    valueMismatchRate: rate(valueMismatches),
    inconclusive: events.filter((e) => e.inconclusive).length,
    distinctTasks: new Set(events.map((e) => e.taskId)).size,
  };
}

