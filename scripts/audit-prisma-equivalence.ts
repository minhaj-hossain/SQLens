/**
 * scripts/audit-prisma-equivalence.ts — Task 0.4, the Phase-0 equivalence gate
 * (audit instrument; the Prisma mirror of `scripts/audit-equivalence.ts`).
 *
 * For EVERY Prisma curriculum task it proves the two properties a
 * "reference passes its own validator" check cannot:
 *
 *   1. APPROACH FAIRNESS (no false-reject) — a form-equivalent rewrite of the
 *      reference still PASSES. Families probed (each skipped as `inapplicable`
 *      on tasks it does not fit):
 *        · reorder-select-keys  — `select` keys reversed
 *        · wrap-assignment      — `return await prisma.…` → `const r = await ….`
 *        · reflow-multiline     — the call's argument object collapsed to one line
 *        · equals-form          — `where: { f: v }` → `where: { f: { equals: v } }`
 *        · normalize-strings    — string literals in the call args flipped `'` ⇄ `"`
 *      A variant is only generated when it keeps every authored
 *      `requiredCodeSnippets` fragment (the task's own literal contract defines
 *      its accepted language — dropping a fragment is Phase-1 normalization
 *      territory, not a fairness probe).
 *
 *   2. NO FALSE-ACCEPT — a submission that CHANGES the outcome must FAIL:
 *        · wrong-value   — first write value replaced with a sentinel
 *        · wrong-row     — first `where` target replaced with a sentinel
 *        · drop-where    — the load-bearing `where` clause deleted
 *        · drop-snippet  — one required code fragment removed (every task)
 *      plus a reference self-consistency check: no reference contains its own
 *      `forbiddenCodeSnippets` fragment.
 *
 * SCOPE (Task 0.4 "Option A" — strict now): quoted object keys (`"name": true`)
 * and CLI/snippet normalization (quote styles, `--flag=value`, alternate
 * runners) are KNOWN false-reject families that are NOT asserted here — the
 * validator's literal `String.includes` contract owns them until Phase 1.1
 * (CLI) and Phase 1.2 (quoted keys / structural normalization) land. They fail
 * today BY DESIGN of those tasks' authored fragments, so asserting them now
 * would only re-report a scheduled fix.
 *
 * POLICY NOTES (each surface is counted as a skip, never silently dropped):
 *   · flexible-insert — `compareFinalState`'s documented carve-out accepts
 *     custom VALUES on rows a reference INSERTs (`eRows > pRows` + pre-existing
 *     rows preserved), so wrong-value / wrong-row probes against a table the
 *     reference inserts into cannot be graded by state and are skipped.
 *   · non-equivalent — a probe whose run produces the reference's exact rows
 *     AND database state changed nothing (e.g. a sentinel where matching
 *     nothing already matched nothing): not a fairness/false-accept candidate.
 *
 * Every submission is routed through `submitForTask` (the SAME track router the
 * UI uses) with telemetry OFF (`record: false`), so a finding is a real
 * learner-visible defect, not an audit-only artifact.
 *
 * Exit code 1 on any finding, so CI blocks the regression instead of a human.
 *
 * Run: npm run audit:prisma-equivalence
 */
import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { serializeCellValue } from '../src/lib/sql-engine/state-verification';
import { submitForTask, type TrackSubmitOutcome } from '../src/lib/track-submit';
import {
  isExecutablePrismaTask,
  isStateGradedPrismaTask,
  prismaSeedContext,
  schemaForTask,
} from '../src/lib/prisma-engine/prisma-submit-pipeline';
import { generatePrismaSql } from '../src/lib/prisma-engine/prisma-sql-generator';
import type { ModuleData, PracticeTask } from '../src/types/curriculum';

// Local surface alias — matches the sibling pipeline audits.
type Surface = 'lesson' | 'challenge';

interface Finding {
  day: number;
  where: Surface;
  taskId: string;
  title: string;
  kind: 'FALSE_REJECT' | 'FALSE_ACCEPT' | 'EXEC_ERROR' | 'REFERENCE_FAIL';
  detail: string;
}

const findings: Finding[] = [];
let tasksChecked = 0;
let executableTasks = 0;
let stateGradedTasks = 0;
let fairnessProbes = 0;
let falseAcceptProbes = 0;
let caughtAt: Record<string, number> = {};
const skips: Record<string, number> = {};

// ── span utilities (bracket matching is string-aware, like the generator) ────

/** Index of the matching close for the bracket at `openIdx`; null if unbalanced. */
function balanced(code: string, openIdx: number): number | null {
  const open = code[openIdx];
  const close = open === '{' ? '}' : open === '(' ? ')' : open === '[' ? ']' : null;
  if (!close) return null;
  let depth = 0;
  let inStr: string | null = null;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return null;
}

interface Pair {
  key: string;
  value: string;
  text: string;
}

/** Top-level `key: value` / shorthand pairs of an object body. */
function splitPairs(body: string): Pair[] {
  const out: Pair[] = [];
  let depth = 0;
  let inStr: string | null = null;
  let current = '';
  const flush = () => {
    const text = current.trim().replace(/,$/, '').trim();
    current = '';
    if (!text) return;
    let d = 0;
    let s: string | null = null;
    let colon = -1;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (s) {
        if (ch === s && text[i - 1] !== '\\') s = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        s = ch;
        continue;
      }
      if (ch === '{' || ch === '[' || ch === '(') d++;
      if (ch === '}' || ch === ']' || ch === ')') d--;
      if (ch === ':' && d === 0) {
        colon = i;
        break;
      }
    }
    out.push(
      colon >= 0
        ? { key: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim(), text }
        : { key: text, value: '', text },
    );
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      current += ch;
      if (ch === inStr && body[i - 1] !== '\\') inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      current += ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    if (ch === '}' || ch === ']' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      flush();
      continue;
    }
    current += ch;
  }
  flush();
  return out;
}

/** First `key … { body }` block — indexOf-based, exactly like the validator's `extractBlock`. */
function firstBlock(code: string, key: string): { start: number; end: number; body: string } | null {
  const keyIdx = code.indexOf(key);
  if (keyIdx < 0) return null;
  const braceIdx = code.indexOf('{', keyIdx);
  if (braceIdx < 0) return null;
  const close = balanced(code, braceIdx);
  if (close === null) return null;
  return { start: braceIdx, end: close, body: code.slice(braceIdx + 1, close) };
}

/** The FIRST client call in `code` — `prisma.` / `tx.` / `this.prisma.`, `$transaction` included. */
function firstCallMatch(code: string): { targetStart: number; parenIdx: number } | null {
  const re = /(?:this\s*\.\s*)?(?:prisma|tx)\s*\.\s*(?:\$transaction|[A-Za-z_][A-Za-z0-9_]*\s*\.\s*[A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;
  const m = re.exec(code);
  return m ? { targetStart: m.index, parenIdx: m.index + m[0].length - 1 } : null;
}


// ── must-PASS transforms (null = inapplicable to this reference) ─────────────

/** `select: { a: true, b: true }` → keys reversed (projection order is not a contract). */
function reorderSelectKeys(code: string): string | null {
  const b = firstBlock(code, 'select');
  if (!b) return null;
  const pairs = splitPairs(b.body);
  if (pairs.length < 2) return null;
  const body = pairs
    .slice()
    .reverse()
    .map((p) => p.text)
    .join(', ');
  return code.slice(0, b.start + 1) + body + code.slice(b.end);
}

/** `return await prisma.…` → `const result = await prisma.…; return result;` */
function wrapAssignment(code: string): string | null {
  const call = firstCallMatch(code);
  if (!call) return null;
  const closeIdx = balanced(code, call.parenIdx);
  if (closeIdx === null) return null;
  const before = code.slice(0, call.targetStart);
  if (/=\s*await\s+$/.test(before)) return null; // already an assignment form
  const name = '__auditAssignment';
  const ret = /return\s+await\s+$/.exec(before);
  if (ret) {
    const replacement = `const ${name} = await `;
    const delta = replacement.length - ret[0].length;
    const wrapped = code.slice(0, ret.index) + replacement + code.slice(ret.index + ret[0].length);
    let j = closeIdx + 1 + delta;
    if (code[closeIdx + 1] === ';') j++;
    return wrapped.slice(0, j) + `\n  return ${name};` + wrapped.slice(j);
  }
  const aw = /await\s+$/.exec(before);
  if (aw) {
    return code.slice(0, aw.index) + `const ${name} = await ` + code.slice(aw.index + aw[0].length);
  }
  return null;
}

/** The call's argument object collapsed onto one line (line breaks are not a contract). */
function reflowMultiline(code: string): string | null {
  const call = firstCallMatch(code);
  if (!call) return null;
  const closeIdx = balanced(code, call.parenIdx);
  if (closeIdx === null) return null;
  const inner = code.slice(call.parenIdx, closeIdx + 1);
  if (!inner.includes('\n')) return null;
  let out = '';
  let i = 0;
  let inStr: string | null = null;
  while (i < inner.length) {
    const ch = inner[i];
    if (inStr) {
      out += ch;
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      out += ch;
      i++;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < inner.length && /\s/.test(inner[j])) j++;
      out += ' ';
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return code.slice(0, call.parenIdx) + out + code.slice(closeIdx + 1);
}

/** `where: { f: v }` → `where: { f: { equals: v } }` (every convertible pair). */
function toEqualsForm(code: string): string | null {
  const b = firstBlock(code, 'where');
  if (!b) return null;
  let converted = 0;
  const body = splitPairs(b.body)
    .map((p) => {
      if (p.value === '') {
        converted++;
        return `${p.key}: { equals: ${p.key} }`;
      }
      if (/^\{/.test(p.value)) return p.text; // already an operator form
      const v = p.value.trim();
      if (/^('\s*[^']*'|"[^"]*"|-?\d+(\.\d+)?|true|false|[A-Za-z_][A-Za-z0-9_]*)$/.test(v)) {
        converted++;
        return `${p.key}: { equals: ${p.value} }`;
      }
      return p.text;
    })
    .join(', ');
  if (converted === 0) return null;
  return code.slice(0, b.start + 1) + body + code.slice(b.end);
}

/** String literals inside the call args flipped `'` ⇄ `"` (quote style is not a contract). */
function normalizeStrings(code: string): string | null {
  const call = firstCallMatch(code);
  if (!call) return null;
  const closeIdx = balanced(code, call.parenIdx);
  if (closeIdx === null) return null;
  const inner = code.slice(call.parenIdx, closeIdx + 1);
  let out = '';
  let i = 0;
  let swapped = 0;
  while (i < inner.length) {
    const ch = inner[i];
    if (ch === "'" || ch === '"') {
      const q = ch;
      const o = q === "'" ? '"' : "'";
      let j = i + 1;
      let body = '';
      while (j < inner.length && inner[j] !== q) {
        if (inner[j] === '\\') {
          body += inner[j];
          j++;
        }
        body += inner[j];
        j++;
      }
      swapped++;
      out += o + body + o;
      i = j + 1;
      continue;
    }
    out += ch;
    i++;
  }
  if (swapped === 0) return null;
  return code.slice(0, call.parenIdx) + out + code.slice(closeIdx + 1);
}

const TRANSFORMS: [string, (code: string) => string | null][] = [
  ['reorder-select-keys', reorderSelectKeys],
  ['wrap-assignment', wrapAssignment],
  ['reflow-multiline', reflowMultiline],
  ['equals-form', toEqualsForm],
  ['normalize-strings', normalizeStrings],
];


// ── false-accept variant generators (null = inapplicable) ────────────────────

const WRONG_STRING = '__audit_wrong__';

function sentinelFor(value: string): string {
  return /^-?\d+(\.\d+)?$/.test(value.trim()) ? '999999' : `'${WRONG_STRING}'`;
}

/** Body with its FIRST pair's value replaced by a wrong sentinel (recurses one level). */
function mutateFirstPair(body: string): string | null {
  const pairs = splitPairs(body);
  if (pairs.length === 0) return null;
  const [first] = pairs;
  let rewritten: string;
  if (first.value === '') rewritten = `${first.key}: '${WRONG_STRING}'`;
  else if (/^\{/.test(first.value.trim())) {
    const innerMutated = mutateFirstPair(first.value.trim().slice(1, -1));
    if (innerMutated === null) return null;
    rewritten = `${first.key}: { ${innerMutated} }`;
  } else {
    rewritten = `${first.key}: ${sentinelFor(first.value)}`;
  }
  const at = body.indexOf(first.text);
  return body.slice(0, at) + rewritten + body.slice(at + first.text.length);
}

/** First write value (`data`, else upsert `update`) replaced with a wrong sentinel. */
function wrongValueVariant(code: string): string | null {
  const b = firstBlock(code, 'data') ?? firstBlock(code, 'update');
  if (!b) return null;
  const mutated = mutateFirstPair(b.body);
  if (mutated === null) return null;
  return code.slice(0, b.start + 1) + mutated + code.slice(b.end);
}

/** First `where` target replaced with a sentinel; a where-less call gets a match-nothing filter. */
function wrongRowVariant(code: string): string | null {
  const b = firstBlock(code, 'where');
  if (b) {
    const mutated = mutateFirstPair(b.body);
    if (mutated === null) return null;
    return code.slice(0, b.start + 1) + mutated + code.slice(b.end);
  }
  const call = firstCallMatch(code);
  if (!call) return null;
  const closeIdx = balanced(code, call.parenIdx);
  if (closeIdx === null) return null;
  const braceIdx = code.indexOf('{', call.parenIdx);
  if (braceIdx < 0 || braceIdx > closeIdx) return null;
  return code.slice(0, braceIdx + 1) + ` where: { id: 999999 },` + code.slice(braceIdx + 1);
}

/** The first top-level `where` pair deleted (its commas cleaned up). */
function dropWhereVariant(code: string): string | null {
  const b = firstBlock(code, 'where');
  if (!b) return null;
  let start = code.lastIndexOf('where', b.start);
  if (start < 0) return null;
  let end = b.end + 1;
  let w = end;
  while (w < code.length && /\s/.test(code[w])) w++;
  if (code[w] === ',') {
    let e = w + 1;
    while (e < code.length && code[e] === ' ') e++;
    end = e;
  } else {
    let s = start;
    while (s > 0 && /\s/.test(code[s - 1])) s--;
    if (code[s - 1] === ',') start = s - 1;
  }
  return code.slice(0, start) + code.slice(end);
}

/** The code with every occurrence of one required snippet removed. */
function dropSnippetVariant(code: string, snippet: string): string | null {
  if (!code.includes(snippet)) return null;
  const variant = code.split(snippet).join(' ');
  return variant === code ? null : variant;
}

// ── guard helpers ────────────────────────────────────────────────────────────

/** Required literal snippets the variant must keep to remain a fairness candidate. */
function snippetsPreserved(task: PracticeTask, variant: string): boolean {
  return (task.prisma!.validation.requiredCodeSnippets ?? []).every((s) => variant.includes(s));
}

/** Tables a plan touches (INSERT / UPDATE / DELETE / FROM), lowercased. */
function planTables(code: string, task: PracticeTask): string[] {
  const gen = generatePrismaSql(code, {
    schema: schemaForTask(task),
    seed: prismaSeedContext(task.prisma!.demoVariables),
  });
  if (!gen.ok) return [];
  const out = new Set<string>();
  for (const s of gen.statements) {
    const m = /(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|FROM)\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(s.sql);
    if (m) out.add(m[1].toLowerCase());
  }
  return [...out];
}

/** Tables the REFERENCE inserts into — the flexible-insert carve-out's territory. */
function referenceInsertTables(code: string, task: PracticeTask): Set<string> {
  const gen = generatePrismaSql(code, {
    schema: schemaForTask(task),
    seed: prismaSeedContext(task.prisma!.demoVariables),
  });
  const out = new Set<string>();
  if (!gen.ok) return out;
  for (const s of gen.statements) {
    const m = /^\s*INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(s.sql);
    if (m) out.add(m[1].toLowerCase());
  }
  return out;
}


// ── runner: every probe goes through the REAL track router, telemetry off ────

interface RunResult {
  outcome: TrackSubmitOutcome;
  passed: boolean;
  stage: string;
  feedback: string;
  rows: unknown[] | undefined;
  state: string;
}

/**
 * Hooks over a REAL session executor. Mirrors the UI provider
 * (`SqlExecutorProvider`) — `allowDdlOverwrite` + the state snapshot hooks the
 * final-state layer grades with — so verdicts cannot diverge from the learner's.
 */
function run(task: PracticeTask, code: string, surface: Surface): RunResult {
  const exec = new SqlExecutor();
  exec.allowDdlOverwrite = true;
  const hooks = {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    getCommittedState: () => exec.getCommittedState(),
    getTransactionState: () => exec.getTransactionState(),
    resetDatabase: () => exec.resetDatabase(),
  };
  const outcome = submitForTask({ task, code, hooks, surface, attempt: 1, record: false });
  return {
    outcome,
    passed: outcome.passed,
    stage: outcome.stage,
    feedback: outcome.feedback ?? '',
    rows: outcome.result?.rows as unknown[] | undefined,
    state: JSON.stringify(exec.getDatabaseState()),
  };
}

/** Canonical multiset key for a result set (column order-insensitive). */
function rowKeys(rows: unknown[] | undefined): string[] {
  return (rows ?? [])
    .map((r) =>
      Object.keys(r as object)
        .sort()
        .map((k) => serializeCellValue((r as Record<string, unknown>)[k]))
        .join('\u0001'),
    )
    .sort();
}

/** Form-equivalence guard: same graded rows AND same database state as the reference. */
function sameOutcome(ref: RunResult, got: RunResult): boolean {
  return JSON.stringify(rowKeys(ref.rows)) === JSON.stringify(rowKeys(got.rows)) && ref.state === got.state;
}

function report(module: ModuleData, where: Surface, task: PracticeTask, kind: Finding['kind'], detail: string) {
  findings.push({ day: module.day, where, taskId: task.id, title: task.title, kind, detail });
}

function hit(counter: Record<string, number>, key: string) {
  counter[key] = (counter[key] ?? 0) + 1;
}


// ── probe evaluation ─────────────────────────────────────────────────────────

type Probe = { name: string; code: string; expect: 'PASS' | 'FAIL' };

function evaluateProbe(
  module: ModuleData,
  where: Surface,
  task: PracticeTask,
  ref: RunResult,
  probe: Probe,
  insertTables: Set<string>,
) {
  let got: RunResult;
  try {
    got = run(task, probe.code, where);
  } catch (err) {
    report(module, where, task, 'EXEC_ERROR', `${probe.name}: submit pipeline threw: ${(err as Error).message}`);
    return;
  }
  if (probe.expect === 'PASS') {
    if (!got.passed) {
      report(
        module,
        where,
        task,
        'FALSE_REJECT',
        `${probe.name}: a form-equivalent rewrite was rejected (stage=${got.stage}) :: ${got.feedback}`,
      );
    } else if (!sameOutcome(ref, got)) {
      report(
        module,
        where,
        task,
        'FALSE_ACCEPT',
        `${probe.name}: the "equivalent" rewrite passed while producing a DIFFERENT graded outcome than the reference`,
      );
    } else {
      fairnessProbes++;
    }
    return;
  }

  // Expect FAIL — a pass is a false accept unless the probe provably changed
  // nothing or the flexible-insert policy owns the table it touches.
  if (!got.passed) {
    falseAcceptProbes++;
    hit(caughtAt, `${probe.name.split(':')[0]} → ${got.stage}`);
    return;
  }
  if (sameOutcome(ref, got)) {
    hit(skips, 'non-equivalent probe (passed; outcome identical to the reference)');
    return;
  }
  if (
    (probe.name === 'wrong-value' || probe.name === 'wrong-row') &&
    planTables(probe.code, task).some((t) => insertTables.has(t))
  ) {
    hit(skips, 'flexible-insert carve-out (the reference inserts into a touched table)');
    return;
  }
  report(
    module,
    where,
    task,
    'FALSE_ACCEPT',
    `${probe.name}: a submission that changes the outcome passed anyway (stage=${got.stage}) :: ${got.feedback}`,
  );
}

/** Grade ONE task: reference baseline, then every applicable probe. */
function auditTask(module: ModuleData, where: Surface, task: PracticeTask) {
  if (!task.prisma?.solutionCode?.trim()) return;
  tasksChecked++;
  const code = task.prisma.solutionCode;
  const executable = isExecutablePrismaTask(task);
  const stateGraded = isStateGradedPrismaTask(task);
  if (executable) executableTasks++;
  if (stateGraded) stateGradedTasks++;

  let ref: RunResult;
  try {
    ref = run(task, code, where);
  } catch (err) {
    report(module, where, task, 'EXEC_ERROR', `reference submit threw: ${(err as Error).message}`);
    return;
  }
  if (!ref.passed) {
    report(
      module,
      where,
      task,
      'REFERENCE_FAIL',
      `the authored reference does not pass its own task (stage=${ref.stage}) :: ${ref.feedback}`,
    );
    return;
  }

  // Reference self-consistency: a forbidden snippet in the task's OWN
  // reference is an authoring contradiction the learner can never satisfy.
  for (const f of task.prisma.validation.forbiddenCodeSnippets ?? []) {
    if (code.includes(f)) {
      report(
        module,
        where,
        task,
        'REFERENCE_FAIL',
        `the reference contains its own forbidden snippet \`${f}\` — the task is impossible as authored`,
      );
      return;
    }
  }

  const probes: Probe[] = [];
  for (const [name, transform] of TRANSFORMS) {
    const variant = transform(code);
    if (variant === null) {
      hit(skips, 'transform inapplicable');
      continue;
    }
    if (variant === code) {
      hit(skips, 'transform is a no-op');
      continue;
    }
    if (!snippetsPreserved(task, variant)) {
      hit(skips, 'variant drops a required code snippet (authored literal contract)');
      continue;
    }
    probes.push({ name, code: variant, expect: 'PASS' });
  }

  const insertTables = new Set<string>();
  if (executable) {
    for (const t of referenceInsertTables(code, task)) insertTables.add(t);
    // wrong-value: first write value (data / upsert update) sentineled.
    const wv = wrongValueVariant(code);
    if (wv === null) hit(skips, 'wrong-value variant inapplicable');
    else probes.push({ name: 'wrong-value', code: wv, expect: 'FAIL' });
    // wrong-row: the where target sentineled (match-nothing filter added when absent).
    const wr = wrongRowVariant(code);
    if (wr === null) hit(skips, 'wrong-row variant inapplicable');
    else probes.push({ name: 'wrong-row', code: wr, expect: 'FAIL' });
    // drop-where: the load-bearing filter deleted.
    const dw = dropWhereVariant(code);
    if (dw === null) hit(skips, 'drop-where variant inapplicable (no where block)');
    else probes.push({ name: 'drop-where', code: dw, expect: 'FAIL' });
  }

  // Static-contract drops: every required snippet removed (one at a time) must
  // FAIL — for snippet labs these fragments ARE the grading contract.
  for (const snippet of task.prisma.validation.requiredCodeSnippets ?? []) {
    const variant = dropSnippetVariant(code, snippet);
    const label = `drop-snippet:${snippet.length > 24 ? `${snippet.slice(0, 24)}…` : snippet}`;
    if (variant === null) {
      hit(skips, 'drop-snippet variant inapplicable');
      continue;
    }
    probes.push({ name: label, code: variant, expect: 'FAIL' });
  }

  for (const probe of probes) evaluateProbe(module, where, task, ref, probe, insertTables);
}


// ── walk the whole Prisma track ──────────────────────────────────────────────

console.log('\n=== Prisma equivalence audit (Task 0.4 — Phase 0 gate) ===');
console.log('Form-equivalent rewrites must PASS; outcome-changing variants must FAIL.');
console.log('Deferred by design to Phase 1.1/1.2: quoted select keys, CLI quote/= /runner normalization.\n');

for (const module of PRISMA_MODULES) {
  const before = findings.length;
  for (const concept of module.concepts) {
    for (const task of concept.tasks ?? []) auditTask(module, 'lesson', task);
  }
  for (const task of module.challenge?.tasks ?? []) auditTask(module, 'challenge', task);
  const filed = findings.length - before;
  console.log(
    `Day ${String(module.day).padStart(2, ' ')}: ${module.shortTitle.padEnd(40)} ${
      filed === 0 ? 'OK' : `${filed} ISSUE(S)`
    }`,
  );
}

console.log('\n--- SUMMARY ---');
console.log(
  `Tasks checked:        ${tasksChecked} (executable ${executableTasks}, state-graded ${stateGradedTasks}, read-through ${
    tasksChecked - executableTasks
  })`,
);
console.log(`Fairness probes:      ${fairnessProbes} passed`);
console.log(`False-accept probes:  ${falseAcceptProbes} caught`);
for (const [label, count] of Object.entries(caughtAt).sort()) {
  console.log(`      ${String(count).padStart(4)}  ${label}`);
}
const skipTotal = Object.values(skips).reduce((a, b) => a + b, 0);
console.log(`Skipped probes:       ${skipTotal} (counted, each with its reason)`);
for (const [reason, count] of Object.entries(skips).sort()) {
  console.log(`      ${String(count).padStart(4)}  ${reason}`);
}
console.log(`Findings:             ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.kind}]`);
    console.log(`      ${f.title}`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nPRISMA EQUIVALENCE AUDIT FAILED — a learner-visible grading defect exists.');
  process.exit(1);
}

console.log(
  '\nOK — every Prisma task is approach-fair, content-sensitive, and self-consistent (through the real submit router).',
);

