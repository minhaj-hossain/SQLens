/**
 * Pilot Telemetry & Friction Logger (Phase 6, Task 6.2)
 *
 * A local-only ring buffer for tracking participant behavior, friction timestamps,
 * and evaluating locked-in falsification rules during uncoached pilot sessions.
 * Follows the same zero-PII, fail-safe conventions as `grading-telemetry` and `suggest-telemetry`.
 */

export type PilotEventKind =
  | 'STALL'
  | 'DOC'
  | 'MUTATE'
  | 'HINT_REVEAL'
  | 'CHECKPOINT_SUBMIT';

export interface PilotEvent {
  participantId: string;
  sessionId: string;
  taskId: string;
  kind: PilotEventKind;
  timestamp: number;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface ParticipantSummary {
  participantId: string;
  totalStalls: number;
  totalDocSearches: number;
  totalMutations: number;
  totalHintReveals: number;
  cp1DurationMs: number;
  cp1Passed: boolean;
  cp2Attempts: number;
  cp2Passed: boolean;
  checkpointDocSearches: number;
}

export interface CohortEvaluation {
  rule1Passed: boolean;
  rule1Failures: number; // threshold: <= 1 of 5
  rule2Passed: boolean;
  rule2ExcessiveRetries: number; // threshold: <= 2 of 5
  rule3Passed: boolean;
  rule3DocViolations: number; // threshold: 0 participants with >3 searches
  passed: boolean;
  recommendations: string[];
}

const STORAGE_KEY = 'sqlens:pilot-telemetry';
export const MAX_PILOT_EVENTS = 500;

/** In-memory fallback if localStorage is unavailable (e.g., in node/unit-test environments). */
let memoryBuffer: PilotEvent[] = [];

/** Check if running in a real browser with localStorage. */
function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Record a friction or progress event into the local ring buffer. */
export function recordPilotEvent(
  event: Omit<PilotEvent, 'timestamp'> & { timestamp?: number },
): void {
  const fullEvent: PilotEvent = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  };

  if (!hasLocalStorage()) {
    memoryBuffer.unshift(fullEvent);
    if (memoryBuffer.length > MAX_PILOT_EVENTS) {
      memoryBuffer = memoryBuffer.slice(0, MAX_PILOT_EVENTS);
    }
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: PilotEvent[] = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(parsed) ? parsed : [];
    valid.unshift(fullEvent);
    const trimmed = valid.slice(0, MAX_PILOT_EVENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Local storage full or private mode — safe no-op
  }
}

/** Read all recorded pilot events from the buffer. */
export function readPilotEvents(): PilotEvent[] {
  if (!hasLocalStorage()) {
    return [...memoryBuffer];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Clear all events from storage and memory. */
export function clearPilotEvents(): void {
  memoryBuffer = [];
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

/** Summarize session performance and friction events for a single participant. */
export function summarizeParticipant(
  participantId: string,
  events: PilotEvent[],
): ParticipantSummary {
  const pEvents = events.filter((e) => e.participantId === participantId);

  let totalStalls = 0;
  let totalDocSearches = 0;
  let totalMutations = 0;
  let totalHintReveals = 0;
  let cp1DurationMs = 0;
  let cp1Passed = false;
  let cp2Attempts = 0;
  let cp2Passed = false;
  let checkpointDocSearches = 0;

  for (const e of pEvents) {
    if (e.kind === 'STALL') totalStalls++;
    if (e.kind === 'DOC') {
      totalDocSearches++;
      if (e.taskId === 'prisma04-hw-2' || e.taskId === 'prisma08-hw-2') {
        checkpointDocSearches++;
      }
    }
    if (e.kind === 'MUTATE') totalMutations++;
    if (e.kind === 'HINT_REVEAL') totalHintReveals++;

    if (e.taskId === 'prisma04-hw-2' && e.kind === 'CHECKPOINT_SUBMIT') {
      if (e.durationMs) cp1DurationMs = Math.max(cp1DurationMs, e.durationMs);
      if (e.metadata?.passed) cp1Passed = true;
    }

    if (e.taskId === 'prisma08-hw-2' && e.kind === 'CHECKPOINT_SUBMIT') {
      cp2Attempts++;
      if (e.metadata?.passed) cp2Passed = true;
    }
  }

  return {
    participantId,
    totalStalls,
    totalDocSearches,
    totalMutations,
    totalHintReveals,
    cp1DurationMs,
    cp1Passed,
    cp2Attempts,
    cp2Passed,
    checkpointDocSearches,
  };
}

/**
 * Evaluate the entire 5-learner pilot cohort against the 3 locked-in falsification rules.
 */
export function evaluatePilotCohort(events: PilotEvent[]): CohortEvaluation {
  // Collect all unique participant IDs
  const pIds = Array.from(new Set(events.map((e) => e.participantId)));
  const summaries = pIds.map((id) => summarizeParticipant(id, events));

  const recommendations: string[] = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // Rule 1: Checkpoint 1 Composite Indexing Scaffolding
  // Threshold: If >1 of 5 fails to construct @@index([productId, createdAt]) within 25 min (1,500,000 ms)
  // ─────────────────────────────────────────────────────────────────────────────
  const MAX_CP1_TIME_MS = 25 * 60 * 1000;
  let rule1Failures = 0;

  for (const s of summaries) {
    const failedOrTimedOut = !s.cp1Passed || s.cp1DurationMs > MAX_CP1_TIME_MS;
    if (failedOrTimedOut) {
      rule1Failures++;
    }
  }

  const rule1Passed = rule1Failures <= 1;
  if (!rule1Passed) {
    recommendations.push(
      `Rule 1 Breached: ${rule1Failures}/5 learners failed Checkpoint 1 within 25m. Mandatory action: Rework Days 3 & 4 scaffolding to include compound index diagnostic drills.`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Rule 2: Checkpoint 2 Cursor Tiebreaker Diagnostic
  // Threshold: If >2 of 5 learners require more than 1 failed attempt to diagnose tiebreaker bug
  // (i.e. > 2 total attempts to pass)
  // ─────────────────────────────────────────────────────────────────────────────
  let rule2ExcessiveRetries = 0;

  for (const s of summaries) {
    // If they needed >2 attempts total (i.e., failed on attempt 1 and attempt 2, or never passed)
    if (s.cp2Attempts > 2 || (!s.cp2Passed && s.cp2Attempts > 0)) {
      rule2ExcessiveRetries++;
    }
  }

  const rule2Passed = rule2ExcessiveRetries <= 2;
  if (!rule2Passed) {
    recommendations.push(
      `Rule 2 Breached: ${rule2ExcessiveRetries}/5 learners required >1 failed attempt to diagnose the cursor tiebreaker bug. Mandatory action: Add an explicit break-it tiebreaker task to Day 8.`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Rule 3: Platform Autonomy & Zero-Search Policy
  // Threshold: If ANY learner leaves platform to search Prisma docs >3 times during either checkpoint
  // ─────────────────────────────────────────────────────────────────────────────
  let rule3DocViolations = 0;

  for (const s of summaries) {
    if (s.checkpointDocSearches > 3) {
      rule3DocViolations++;
    }
  }

  const rule3Passed = rule3DocViolations === 0;
  if (!rule3Passed) {
    recommendations.push(
      `Rule 3 Breached: ${rule3DocViolations} learner(s) searched external docs >3 times during checkpoints. Mandatory action: Expand in-editor reference cards for relation syntax and cursor pagination.`,
    );
  }

  const passed = rule1Passed && rule2Passed && rule3Passed;

  return {
    rule1Passed,
    rule1Failures,
    rule2Passed,
    rule2ExcessiveRetries,
    rule3Passed,
    rule3DocViolations,
    passed,
    recommendations,
  };
}

/** Format evaluation metrics and participant performance into a clean GitHub Markdown table. */
export function formatCohortMarkdownReport(
  evaluation: CohortEvaluation,
  summaries: ParticipantSummary[],
): string {
  let md = `### Pilot Cohort Evaluation Summary\n\n`;
  md += `| Participant | CP1 Duration | CP1 Status | CP2 Attempts | CP2 Status | Checkpoint Docs | Stalls | Mutates |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const s of summaries) {
    const mins = (s.cp1DurationMs / 60000).toFixed(1);
    const cp1Str = s.cp1Passed ? '✅ Pass' : '❌ Fail';
    const cp2Str = s.cp2Passed ? '✅ Pass' : '❌ Fail';
    md += `| \`${s.participantId}\` | ${mins}m | ${cp1Str} | ${s.cp2Attempts} | ${cp2Str} | ${s.checkpointDocSearches} | ${s.totalStalls} | ${s.totalMutations} |\n`;
  }

  md += `\n#### Falsification Rules Status\n\n`;
  md += `- **Rule 1 (CP1 Index Scaffolding $\\le 1$ fail):** ${evaluation.rule1Passed ? '✅ PASSED' : '❌ FALSIFIED'} (${evaluation.rule1Failures}/5 failures)\n`;
  md += `- **Rule 2 (CP2 Cursor Tiebreaker $\\le 2$ excess retries):** ${evaluation.rule2Passed ? '✅ PASSED' : '❌ FALSIFIED'} (${evaluation.rule2ExcessiveRetries}/5 excessive retries)\n`;
  md += `- **Rule 3 (Doc Dependency $\\le 3$ searches in CPs):** ${evaluation.rule3Passed ? '✅ PASSED' : '❌ FALSIFIED'} (${evaluation.rule3DocViolations} violations)\n\n`;

  if (evaluation.recommendations.length > 0) {
    md += `**Remediation Action Items:**\n`;
    for (const r of evaluation.recommendations) {
      md += `- ${r}\n`;
    }
  } else {
    md += `**Status:** All 3 locked-in falsification rules satisfied cleanly with zero curriculum remediations required.\n`;
  }

  return md;
}
