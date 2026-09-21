import type { ModuleData, PracticeTask } from '../../types/curriculum';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { normLiteral, renderedTaskText } from './taught-before-tested';

/**
 * Batch 5 gate — the last grading surface no gate reads.
 *
 * Batches 1–4 made the *declarative* grading surface auditable (rendered
 * instructions, `solutionSql` literals, taught constructs, policy rules). But
 * some tasks grade partially through a hand-written JS predicate in
 * `validation.customValidator`. Those predicates are code, not data: no script,
 * type, or test ever read them, so they could
 *
 *   1. be DEAD — carry no failing path, so they grade nothing while reading as
 *      a requirement (`always-valid`), or sit on an `expectFailure` lab whose
 *      rule-14 call site is unreachable (`unreachable`);
 *   2. FAIL SILENTLY — return `valid: false` without a `message`, or with a
 *      message spelled under a key rule 14 never reads (`silent-failure`);
 *   3. HIDE A REQUIREMENT — key off a value that appears nowhere in the rendered
 *      prompt and nowhere in the schema (`ghost-value`). This is the Day-26
 *      `tx-c1-t1` class ("Flash Sale Mouse" enforced, "one flash-sale product"
 *      written) transplanted from data into code.
 *
 * Everything here is pure: it reads the curriculum and reports. The behavioural
 * half (does a predicate still accept its own reference solution?) is asserted
 * by `scripts/audit-custom-validators.ts` through the shared submit pipeline.
 */

export type CustomFindingKind =
  | 'always-valid'
  | 'unreachable'
  | 'silent-failure'
  | 'ghost-value'
  | 'no-solution';

export interface CustomFinding {
  day: number;
  where: 'lesson' | 'challenge';
  taskId: string;
  title: string;
  kind: CustomFindingKind;
  detail: string;
}

/** One authored predicate, flattened for analysis. */
export interface CustomValidatorSite {
  day: number;
  where: 'lesson' | 'challenge';
  taskId: string;
  title: string;
  task: PracticeTask;
  challengeScenario?: string;
  /** `fn.toString()` — the predicate's own source, the only reliable view of it. */
  source: string;
}

export interface CustomAuditResult {
  checked: number;
  sites: CustomValidatorSite[];
  findings: CustomFinding[];
}

/**
 * SQL syntax tokens a learner is expected to discover from the lesson itself.
 * A predicate keying off one of these is not hiding a requirement — the lesson
 * (and the construct gate in `taught-before-tested.ts`) already owns it.
 */
const SQL_TOKENS = new Set<string>(
  (
    'select from where group by having order join left right inner outer on as and or not null ' +
    'distinct limit offset union all except intersect with case when then else end over partition ' +
    'rows range between asc desc insert into values update set delete create table index view alter ' +
    'drop primary key foreign references check default unique auto increment begin commit rollback ' +
    'explain count sum avg min max coalesce ifnull length upper lower trim concat substring year ' +
    'month day datediff row number rank dense lag lead total running'
  ).split(/\s+/),
);

/** Language-level words that are never treated as hidden requirements. */
const NOISE_LITERALS = new Set([
  'true',
  'false',
  'undefined',
  'empty',
  'none',
  'object',
  'array',
  'string',
  'number',
  'boolean',
  'date',
  'function',
  'column',
  'columns',
  'table',
  'tables',
  'index',
  'indexes',
  'query',
  'result',
  'results',
  'message',
  'error',
  'ascending',
  'descending',
]);

/** Replace regex literals with spaces so their contents cannot be mistaken for
 *  code strings (a `/values\s*\(/i` test must not yield the literal `values`).
 *  Conservative: only `/`-runs closed by `/` + flags are blanked. */
export function stripRegexLiterals(source: string): string {
  let out = '';
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch !== '/') {
      out += ch;
      continue;
    }
    // A regex literal cannot begin right after an identifier/number/`)`/`]`.
    const prev = out.replace(/\s+$/, '').slice(-1);
    if (/[\w$)\]]/.test(prev)) {
      out += ch;
      continue;
    }
    let j = i + 1;
    let closed = -1;
    while (j < source.length) {
      if (source[j] === '\\') {
        j += 2;
        continue;
      }
      if (source[j] === '[') {
        while (j < source.length && source[j] !== ']') j += source[j] === '\\' ? 2 : 1;
        j++;
        continue;
      }
      if (source[j] === '/') {
        closed = j;
        break;
      }
      if (source[j] === '\n') break;
      j++;
    }
    if (closed === -1) {
      out += ch;
      continue;
    }
    const flags = /^[gimsuy]*/.exec(source.slice(closed + 1))?.[0] ?? '';
    out += ' '.repeat(closed - i + 1 + flags.length);
    i = closed + flags.length;
  }
  return out;
}

/**
 * Keys the ENGINE actually reads for a failed predicate, plus the sibling keys
 * authors reach for by mistake. `validator.ts` rule 14 reads `custom.message`
 * only — so a `feedback:`/`hint:` spelling silently degrades to the generic
 * sentence. The gate must flag any message spelled under one of these keys,
 * otherwise it would bless the very bug it exists to catch.
 */
const MESSAGE_KEYS =
  /\b(?:message|msg|feedback|hint|explanation|reason|detail|text)\w*\s*(?::|=|\(\s*(?:push|concat)?)/i;

/** A literal is prose feedback (not a graded value) when it reads like a sentence. */
function isProseLiteral(raw: string): boolean {
  const words = normLiteral(raw).split(' ').filter(Boolean);
  if (words.length < 4) return false;
  return /[.!?:]$/.test(raw.trim()) || raw.length >= 60;
}

/**
 * The string literals a predicate could plausibly KEY OFF — i.e. the ones used
 * as comparison values, never the human-readable feedback it returns. Regex
 * bodies are blanked first, message values are dropped by their key, and
 * sentence-shaped prose is dropped as feedback. Whatever survives is a candidate
 * hidden requirement.
 */
export function harvestValueLiterals(source: string): string[] {
  const clean = stripRegexLiterals(source);
  const out: string[] = [];
  for (let i = 0; i < clean.length; i++) {
    const quote = clean[i];
    if (quote !== "'" && quote !== '"' && quote !== '`') continue;
    let raw = '';
    let j = i + 1;
    let closed = false;
    while (j < clean.length) {
      const c = clean[j];
      if (c === '\\') {
        raw += clean[j + 1] ?? '';
        j += 2;
        continue;
      }
      if (c === quote) {
        closed = true;
        break;
      }
      if (c === '\n' && quote !== '`') break;
      raw += c;
      j++;
    }
    if (!closed) continue;
    // Look back through any `+ 'next part'` concatenation to the real key.
    let back = i;
    while (back > 0 && /[\s+[(,]/.test(clean[back - 1])) back--;
    const before = clean.slice(Math.max(0, back - 160), back);
    if (!MESSAGE_KEYS.test(before) && !isProseLiteral(raw)) out.push(raw);
    i = j;
  }
  return out;
}

/** Every table and column name the learner can read in the DB explorer. */
const SCHEMA_IDENTIFIERS = (() => {
  const ids = new Set<string>();
  for (const [table, schema] of Object.entries(DATABASE_SCHEMAS)) {
    ids.add(normLiteral(table));
    for (const col of schema.columns ?? []) ids.add(normLiteral(col.name));
  }
  return ids;
})();


/**
 * True when `source` contains a path that can return a failed validation.
 * Catches both `return false` and any `valid:` whose value is not the literal
 * `true` (a predicate may return `valid: hasId && hasName`).
 */
export function canFail(source: string): boolean {
  if (/\breturn\s+false\b/.test(source)) return true;
  const values = [...source.matchAll(/valid\s*:\s*([^,}\n]+)/g)].map((m) => m[1].trim());
  if (values.length === 0) return false;
  return values.some((v) => v !== 'true');
}

/** True when the predicate supplies a message the engine will actually read. */
export function suppliesEngineMessage(source: string): boolean {
  return /\bmessage\s*(?::|=)/.test(source);
}

/**
 * The values a predicate keys off that the learner has no way to discover:
 * comparison literals minus schema identifiers, SQL syntax tokens, language
 * noise, and anything the rendered prompt names.
 *
 * Discoverability is judged two ways, because prompts and predicates spell the
 * same value differently:
 *
 *  - word-level containment: "flash-sale product" teaches the token `flash`, so
 *    a predicate keying off `flash sale product` is fair;
 *  - compact containment: the prompt's "Student ID" must satisfy a predicate
 *    that lowercases and strips separators (`c.includes('studentid')`), so both
 *    sides are compared with spaces removed.
 */
export function undiscoverableLiterals(source: string, rendered: string): string[] {
  const shown = normLiteral(rendered);
  const shownCompact = shown.replace(/ /g, '');
  const out: string[] = [];
  for (const raw of harvestValueLiterals(source)) {
    if (raw.includes('${') || raw.includes('\n')) continue;
    const norm = normLiteral(raw);
    if (norm.length < 3 || SQL_TOKENS.has(norm) || NOISE_LITERALS.has(norm)) continue;
    if (SCHEMA_IDENTIFIERS.has(norm)) continue;
    if (shownCompact.includes(norm.replace(/ /g, ''))) continue;
    const tokens = norm
      .split(' ')
      .filter((t) => t.length >= 3 && !SQL_TOKENS.has(t) && !NOISE_LITERALS.has(t));
    if (tokens.length === 0) continue;
    if (tokens.every((t) => shown.includes(t))) continue;
    out.push(raw);
  }
  return out;
}

/** Flatten every authored predicate in canonical curriculum order. */
export function collectCustomValidatorSites(modules: ModuleData[]): CustomValidatorSite[] {
  const ordered = [...modules].sort(
    (a, b) => (a.curriculumOrder ?? a.day) - (b.curriculumOrder ?? b.day),
  );
  const sites: CustomValidatorSite[] = [];

  const add = (
    module: ModuleData,
    where: 'lesson' | 'challenge',
    task: PracticeTask,
    scenario?: string,
  ) => {
    const fn = task.validation?.customValidator;
    if (typeof fn !== 'function') return;
    sites.push({
      day: module.day,
      where,
      taskId: task.id,
      title: task.title,
      task,
      challengeScenario: scenario,
      source: fn.toString(),
    });
  };

  for (const module of ordered) {
    for (const concept of module.concepts ?? []) {
      for (const task of concept.tasks ?? []) add(module, 'lesson', task);
    }
    for (const task of module.challenge?.tasks ?? []) {
      add(module, 'challenge', task, module.challenge?.scenario);
    }
  }
  return sites;
}

/** One rung of the session ladder: a task in the order a learner meets it. */
export interface LadderRung {
  day: number;
  where: 'lesson' | 'challenge';
  taskId: string;
  task: PracticeTask;
  challengeScenario?: string;
}

/**
 * Every task in the order a learner walks them, so a probe can rebuild the
 * prerequisite state a task depends on.
 *
 * Why this exists: `inherit` tasks grade against state built by EARLIER tasks —
 * Day 31's `perf-hw-3` drops the index `perf-c3-*` created, Day 33's `cap-c5-*`
 * need the `books` table `cap-c1-*` created. Grading such a task on a bare
 * executor makes its own reference solution ERROR, the pipeline stops at
 * `engine-error`, rule 14 of the validator never runs, and the predicate looks
 * DEAD when it is merely unreachable-because-unbuilt. That is a probe defect, not
 * a content defect, and it is indistinguishable from the real thing unless the
 * probe rebuilds the ladder.
 *
 * The ladder mirrors the app exactly: concepts then challenge, and `fresh` resets
 * on entry while `inherit` keeps the session.
 */
export function collectTaskLadder(modules: ModuleData[]): LadderRung[] {
  const ordered = [...modules].sort(
    (a, b) => (a.curriculumOrder ?? a.day) - (b.curriculumOrder ?? b.day),
  );
  const rungs: LadderRung[] = [];
  const add = (
    module: ModuleData,
    where: 'lesson' | 'challenge',
    task: PracticeTask,
    challengeScenario?: string,
  ) => rungs.push({ day: module.day, where, taskId: task.id, task, challengeScenario });

  for (const module of ordered) {
    for (const concept of module.concepts ?? []) {
      for (const task of concept.tasks ?? []) add(module, 'lesson', task);
    }
    for (const task of module.challenge?.tasks ?? []) {
      add(module, 'challenge', task, module.challenge?.scenario);
    }
  }
  return rungs;
}

/**
 * Analyse one predicate against its own rendered prompt.
 *
 * A dead predicate (`expectFailure` labs) is reported once, as `unreachable`:
 * its ghost literals and missing message are symptoms of the same dead code, not
 * separate learner-facing defects.
 */
export function diagnoseCustomValidator(site: CustomValidatorSite): CustomFinding[] {
  const { source, task, day, where, taskId, title, challengeScenario } = site;
  const findings: CustomFinding[] = [];
  const push = (kind: CustomFindingKind, detail: string) =>
    findings.push({ day, where, taskId, title, kind, detail });

  if (!task.solutionSql) {
    push(
      'no-solution',
      'the task carries a customValidator but no solutionSql, so the predicate can never be regression-tested.',
    );
  }

  if (task.validation?.expectFailure) {
    push(
      'unreachable',
      'expectFailure is set, so the validator returns before rule 14 — this customValidator is dead code that reads as a requirement.',
    );
    return findings;
  }

  if (!canFail(source)) {
    push(
      'always-valid',
      'the predicate has no failing path (no `valid: false` / `return false`), so it grades nothing while reading as a requirement.',
    );
  } else if (!suppliesEngineMessage(source)) {
    push(
      'silent-failure',
      MESSAGE_KEYS.test(source)
        ? 'the predicate fails with a message-like key (e.g. `feedback:`) that rule 14 of the validator never reads — only `message` survives, so the learner sees the generic sentence.'
        : 'the predicate can fail but never supplies a `message`, so the learner only sees the generic "does not match all required criteria".',
    );
  }

  const rendered = renderedTaskText(task, challengeScenario);
  const ghosts = undiscoverableLiterals(source, rendered);
  if (ghosts.length > 0) {
    const shown = ghosts.slice(0, 3).map((g) => `'${g}'`).join(', ');
    const more = ghosts.length > 3 ? ` +${ghosts.length - 3} more` : '';
    push(
      'ghost-value',
      `the predicate keys off value(s) ${shown}${more} that are neither in the visible prompt nor in the schema. A learner who follows the prompt cannot satisfy it.`,
    );
  }

  return findings;
}

/** Walk the curriculum once and report every predicate defect. */
export function auditCustomValidators(modules: ModuleData[]): CustomAuditResult {
  const sites = collectCustomValidatorSites(modules);
  const findings: CustomFinding[] = [];
  for (const site of sites) findings.push(...diagnoseCustomValidator(site));
  return { checked: sites.length, sites, findings };
}

