import type { ConceptTheory, ModuleData, PracticeTask } from '../../types/curriculum';

/** One construct tracked from first teaching to first use. */
export interface ConstructCheck {
  id: string;
  label: string;
  solutionRe: RegExp;
  taughtRe: RegExp;
  fixHint: string;
}

const C = (
  id: string,
  label: string,
  pat: RegExp,
  fixHint: string,
): ConstructCheck => ({ id, label, solutionRe: pat, taughtRe: pat, fixHint });

export const CONSTRUCT_CHECKS: ConstructCheck[] = [
  {
    id: 'multi-row-insert',
    label: 'multi-row INSERT (VALUES (...), (...))',
    solutionRe: /VALUES\s*\([\s\S]*?\)\s*,\s*\(/i,
    taughtRe: /VALUES\s*\([\s\S]*?\)\s*,\s*\(/i,
    fixHint: 'teach multi-row VALUES in Day 25 C1 theory (syntaxBlock + example + MCQ) before its first use',
  },
  C('insert', 'INSERT INTO', /\bINSERT\s+INTO\b/i, 'teach single-row INSERT before its first use'),

  C('update', 'UPDATE … SET', /\bUPDATE\s+\w+\s+SET\b/i, 'teach UPDATE … SET … WHERE before its first use'),
  C('delete', 'DELETE FROM', /\bDELETE\s+FROM\b/i, 'teach DELETE FROM … WHERE before its first use'),
  C('begin', 'BEGIN (transaction open)', /\bBEGIN\b/i, 'teach BEGIN before its first use'),
  C('commit', 'COMMIT', /\bCOMMIT\b/i, 'teach COMMIT before its first use'),
  C('rollback', 'ROLLBACK', /\bROLLBACK\b/i, 'teach ROLLBACK before its first use'),
  C('create-table', 'CREATE TABLE', /\bCREATE\s+TABLE\b/i, 'teach CREATE TABLE before its first use'),
  C('alter-table', 'ALTER TABLE', /\bALTER\s+TABLE\b/i, 'teach ALTER TABLE before its first use'),
  C('drop-table', 'DROP TABLE', /\bDROP\s+TABLE\b/i, 'teach DROP TABLE before its first use'),
  C('create-index', 'CREATE INDEX', /\bCREATE\s+(?:UNIQUE\s+)?INDEX\b/i, 'teach CREATE INDEX before its first use'),
  C('auto-increment', 'AUTO_INCREMENT', /\bAUTO_INCREMENT\b/i, 'teach AUTO_INCREMENT before its first use'),
  C('foreign-key', 'FOREIGN KEY', /\bFOREIGN\s+KEY\b/i, 'teach FOREIGN KEY before its first use'),
  C('check', 'CHECK constraint', /\bCHECK\s*\(/i, 'teach CHECK constraints before first use'),
  C('default-val', 'DEFAULT', /\bDEFAULT\b/i, 'teach DEFAULT before its first use'),
  C('unique', 'UNIQUE', /\bUNIQUE\b/i, 'teach UNIQUE before its first use'),
  C('not-null', 'NOT NULL', /\bNOT\s+NULL\b/i, 'teach NOT NULL before its first use'),
  C('primary-key', 'PRIMARY KEY', /\bPRIMARY\s+KEY\b/i, 'teach PRIMARY KEY before its first use'),
  C('join', 'JOIN', /\bJOIN\b/i, 'teach JOIN before its first use'),
  C('group-by', 'GROUP BY', /\bGROUP\s+BY\b/i, 'teach GROUP BY before its first use'),
  C('having', 'HAVING', /\bHAVING\b/i, 'teach HAVING before its first use'),
  C('distinct', 'SELECT DISTINCT', /\bSELECT\s+DISTINCT\b/i, 'teach SELECT DISTINCT before its first use'),
  C('order-by', 'ORDER BY', /\bORDER\s+BY\b/i, 'teach ORDER BY before its first use'),
  C('limit', 'LIMIT', /\bLIMIT\b/i, 'teach LIMIT before its first use'),
  C('offset', 'OFFSET', /\bOFFSET\b/i, 'teach OFFSET before its first use'),
  C('where', 'WHERE', /\bWHERE\b/i, 'teach WHERE before its first use'),
  C('case', 'CASE … WHEN', /\bCASE\b/i, 'teach CASE before its first use'),

  C('set-op', 'set operation (UNION / EXCEPT / INTERSECT)', /\b(?:UNION(?:\s+ALL)?|EXCEPT|INTERSECT)\b/i, 'teach set operations before first use'),
  C('cte', 'CTE (WITH … AS (...))', /\bWITH\s+\w+\s+AS\s*\(/i, 'teach CTEs before first use'),
  C('subquery', 'subquery ((SELECT …))', /\(\s*SELECT\b/i, 'teach subqueries before first use'),
  C('window', 'window function (… OVER (...))', /\bOVER\s*\(/i, 'teach window functions before first use'),
  C('explain', 'EXPLAIN', /\bEXPLAIN\b/i, 'teach EXPLAIN before its first use'),
  C('aggregation', 'aggregate function (COUNT/SUM/AVG/MIN/MAX(...))', /\b(?:COUNT|SUM|AVG|MIN|MAX)\s*\(/i, 'teach aggregate functions before first use'),
  C('like', 'LIKE', /\bLIKE\b/i, 'teach LIKE before its first use'),
  C('in-list', 'IN (...) list', /\bIN\s*\(/i, 'teach IN-lists before first use'),
];

export interface TaughtFinding {
  day: number;
  where: 'lesson' | 'challenge';
  taskId: string;
  kind: 'construct' | 'literal';
  constructId?: string;
  detail: string;
}

/** SQL CODE taught by one concept's theory (never prose — "join the tables"
 *  in English must not count as teaching JOIN). */
export function theoryCode(theory: ConceptTheory | undefined): string {
  if (!theory) return '';
  const parts: string[] = [];
  if (theory.targetQuery?.sql) parts.push(theory.targetQuery.sql);
  for (const s of theory.stepBreakdowns ?? []) {
    if (s.sqlSnippet) parts.push(s.sqlSnippet);
  }
  for (const s of theory.syntaxBlocks ?? []) {
    if (s.sql) parts.push(s.sql);
  }
  if (theory.exampleQuery) parts.push(theory.exampleQuery);
  if (theory.liveDemoSql) parts.push(theory.liveDemoSql);
  for (const e of theory.explanation ?? []) {
    // Fenced SQL blocks count as taught code…
    for (const m of e.matchAll(/```(?:sql)?\s*([\s\S]*?)```/gi)) parts.push(m[1]);
    // …but so do inline `CODE` spans: Day 31 C3 teaches CREATE INDEX via
    // numbered backtick steps ("2 `CREATE INDEX …`") with no fenced block.
    // Plain prose stays excluded — only backtick spans are harvested.
    for (const m of e.matchAll(/`([^`]+)`/g)) parts.push(m[1]);
  }
  for (const q of theory.interactiveDemo?.queries ?? []) {
    if (q.sql) parts.push(q.sql);
  }
  if (theory.debuggingExercise?.brokenSql) parts.push(theory.debuggingExercise.brokenSql);
  return parts.join('\n');
}

/** What the learner SEES: title + description + instructions (+ scenario).
 *  Hints/solution stay hidden — they must NOT satisfy this check. */
export function renderedTaskText(task: PracticeTask, challengeScenario?: string): string {
  return [
    task.title ?? '',
    task.description ?? '',
    ...((task.instructions ?? []) as string[]),
    challengeScenario ?? '',
  ].join('\n');
}

export function normLiteral(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Quoted literals in a solution (single- AND double-quoted). */
export function solutionLiterals(solutionSql: string | undefined): string[] {
  if (!solutionSql) return [];
  const out: string[] = [];
  for (const m of solutionSql.matchAll(/'((?:[^']|'')+)'/g)) out.push(m[1].replace(/''/g, "'"));
  for (const m of solutionSql.matchAll(/"([^"]+)"/g)) out.push(m[1]);
  return out;
}

/** Quasi-unique literal cores worth checking (drop wildcards/short codes). */
export function checkableLiteralCores(solutionSql: string | undefined): string[] {
  const cores = new Set<string>();
  for (const lit of solutionLiterals(solutionSql)) {
    const core = normLiteral(lit.replace(/[%_]/g, ' '));
    if (core.length >= 3) cores.add(core);
  }
  return [...cores];
}

export interface TaughtAuditResult {
  checked: number;
  findings: TaughtFinding[];
}

/** Walk modules in canonical order, accumulating taught CODE.
 *
 * Challenge exemption (construct half only): a challenge task may introduce a
 * construct its module teaches LATER in the same module (Day 27's day20-hw-1
 * uses CHECK/DEFAULT before Day 28 teaches them; Day 31's perf-c2-t2 uses
 * CREATE INDEX before Day 31 C3's loop). Challenge tasks are allowed to be
 * self-contained — their own visible instructions spell out the exact
 * statement — but ONLY when that statement is fully specified in the rendered
 * prompt. The literal half still applies to every task, exempt or not.
 */
export function auditTaughtBeforeTested(modules: ModuleData[]): TaughtAuditResult {
  const ordered = [...modules].sort(
    (a, b) => (a.curriculumOrder ?? a.day) - (b.curriculumOrder ?? b.day),
  );
  const findings: TaughtFinding[] = [];
  let checked = 0;
  let taughtCode = '';
  // Full-corpus theory code per module index — lets a challenge task look
  // AHEAD to a later module's theory (Day 28 teaches CHECK/DEFAULT that Day
  // 27's challenge already uses). Static and cheap: computed once.
  const moduleCodes: string[] = ordered.map((m) =>
    (m.concepts ?? []).map((c) => theoryCode(c.theory)).join('\n'),
  );

  const checkTask = (
    module: ModuleData,
    moduleIdx: number,
    where: 'lesson' | 'challenge',
    task: PracticeTask,
    challengeScenario?: string,
    conceptIdx?: number,
  ): void => {
    checked++;
    const solution = task.solutionSql ?? '';
    for (const c of CONSTRUCT_CHECKS) {
      const solRe = new RegExp(c.solutionRe.source, c.solutionRe.flags);
      const taughtRe = new RegExp(c.taughtRe.source, c.taughtRe.flags);
      if (!solRe.test(solution) || taughtRe.test(taughtCode)) continue;
      // Challenge exemption (construct half only): the construct is taught by
      // LATER theory — a later concept of the same module (Day 31 C3's CREATE
      // INDEX loop, ordered after perf-c2-t2's concept) or a later module
      // (Day 28's CHECK/DEFAULT for Day 27's challenge) — AND the task's own
      // rendered prompt spells out the exact statement (self-contained: the
      // learner can succeed by following the visible text). Lesson tasks get
      // no exemption — a lesson must teach before it tests, in order.
      if (where === 'challenge' && statesConstruct(task, c)) {
        const laterSame = laterConceptTeaches(ordered[moduleIdx], -1, c);
        const laterModule = laterModuleTeaches(ordered, moduleCodes, moduleIdx, c);
        if (laterSame || laterModule) continue;
      }
      // Lesson-task forward reference: the construct is taught by a LATER
      // concept of the SAME module (Day 31's perf-c2-t2 needs CREATE INDEX,
      // taught in Day 31 C3's loop two concepts later) AND the task's own
      // rendered prompt spells out the exact statement (guided, copyable).
      // Cross-module forward references still fail — a lesson must not test
      // what an earlier module never taught.
      if (where === 'lesson' && statesConstruct(task, c)) {
        if (laterConceptTeaches(ordered[moduleIdx], conceptIdx ?? -1, c)) continue;
      }
      findings.push({
        day: module.day,
        where,
        taskId: task.id,
        kind: 'construct',
        constructId: c.id,
        detail: `solution uses ${c.label}, but no theory up to Day ${module.day} shows that syntax in code. ${c.fixHint}.`,
      });
    }
    if (!task.validation?.expectFailure) {
      const rendered = normLiteral(renderedTaskText(task, challengeScenario));
      const missing = checkableLiteralCores(solution).filter((core) => !rendered.includes(core));
      if (missing.length > 0) {
        const shown = missing.slice(0, 3).map((m) => `'${m}'`).join(', ');
        const more = missing.length > 3 ? ` +${missing.length - 3} more` : '';
        findings.push({
          day: module.day,
          where,
          taskId: task.id,
          kind: 'literal',
          detail: `the grader enforces value(s) ${shown}${more} that never appear in the visible prompt (title/description/instructions). Name the exact tuple in the task text.`,
        });
      }
    }
  };

  for (let mi = 0; mi < ordered.length; mi++) {
    const module = ordered[mi];
    const concepts = module.concepts ?? [];
    for (let i = 0; i < concepts.length; i++) {
      taughtCode += '\n' + theoryCode(concepts[i].theory);
      for (const task of concepts[i].tasks ?? []) checkTask(module, mi, 'lesson', task, undefined, i);
    }
    for (const task of module.challenge?.tasks ?? []) {
      checkTask(module, mi, 'challenge', task, module.challenge?.scenario);
    }
  }

  return { checked, findings };

  /** True when a concept AFTER afterIdx in the same module teaches it. */
  function laterConceptTeaches(module: ModuleData, afterIdx: number, c: ConstructCheck): boolean {
    const concepts = module.concepts ?? [];
    const taughtRe = new RegExp(c.taughtRe.source, c.taughtRe.flags);
    for (let i = afterIdx + 1; i < concepts.length; i++) {
      if (taughtRe.test(theoryCode(concepts[i].theory))) return true;
    }
    return false;
  }

  /** True when any LATER module's theory teaches it. */
  function laterModuleTeaches(
    orderedMods: ModuleData[],
    codes: string[],
    moduleIdx: number,
    c: ConstructCheck,
  ): boolean {
    const taughtRe = new RegExp(c.taughtRe.source, c.taughtRe.flags);
    for (let i = moduleIdx + 1; i < orderedMods.length; i++) {
      if (taughtRe.test(codes[i] ?? '')) return true;
    }
    return false;
  }

  /** True when the task's own rendered prompt states the construct's syntax
   *  (not just prose about it): the exact statement pattern appears in
   *  title/description/instructions/scenario. */
  function statesConstruct(task: PracticeTask, c: ConstructCheck): boolean {
    const rendered = renderedTaskText(task);
    const re = new RegExp(c.solutionRe.source, c.solutionRe.flags);
    return re.test(rendered);
  }
}

