/**
 * scripts/audit-ddl-contracts.ts
 * -----------------------------------------------------------------------------
 * Workstream A gate (DDL audit, Days 25-30 review). Every DDL task's column
 * contract must be:
 *
 *   1. VISIBLE    — each column the solutionSql creates/alters appears in the
 *                   RENDERED prompt (title/description/instructions/scenario,
 *                   never hints), so nobody is graded on a ghost requirement;
 *   2. DECLARED   — validation.requiredColumns names those columns, so the
 *                   validator can fail fast with "Missing column 'x'" instead
 *                   of a generic final-state mismatch; and
 *   3. HONEST     — requiredColumns never names a column the statement does
 *                   not define (no phantom requirements hiding in code either).
 *
 * Scope: Days 27-30 block on findings; other days print ADVISORY findings only
 * (their content is Workstream-A follow-up, tracked in docs/DDL_AUDIT_TRACKER.md).
 *
 * Run: npx tsx scripts/audit-ddl-contracts.ts   (npm run audit:ddl-contracts)
 * Exit 1 on any blocking finding.
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { renderedTaskText } from '../src/lib/curriculum/taught-before-tested';
import { extractDdlTableColumns } from '../src/lib/sql-engine/ddl-columns';
import { ModuleData, PracticeTask } from '../src/types/curriculum';

/** Days whose DDL contract findings block CI (the Workstream A scope). */
const BLOCKING_DAYS = new Set([27, 28, 29, 30]);

/** A task is DDL when its reference solution defines/tears down schema. */
const DDL_RE = /\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i;

type FindingKind =
  | 'missing-column-in-prompt'
  | 'missing-required-columns'
  | 'ghost-required-columns';

interface Finding {
  day: number;
  where: 'lesson' | 'challenge';
  taskId: string;
  kind: FindingKind;
  detail: string;
  blocking: boolean;
}

/** Same masking the validator uses: literals first, then all comment styles. */
function stripSqlLiteralsAndComments(sql: string): string {
  let out = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === '\\') { j += 2; continue; }
        if (sql[j] === quote) {
          if (sql[j + 1] === quote) { j += 2; continue; }
          closed = true;
          break;
        }
        j++;
      }
      out += closed ? "''" : sql.slice(i, j);
      i = closed ? j + 1 : j;
      continue;
    }
    out += ch;
    i++;
  }
  return out
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n\r]*/g, ' ')
    .replace(/#[^\n\r]*/g, ' ');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `col` appears as a whole word in the rendered prompt. */
function promptNames(rendered: string, col: string): boolean {
  return new RegExp(`\\b${escapeRegExp(col)}\\b`, 'i').test(rendered);
}

const findings: Finding[] = [];
let checked = 0;
let ddlTasks = 0;
let columnContracts = 0;

function auditTask(
  module: ModuleData,
  where: 'lesson' | 'challenge',
  task: PracticeTask,
  scenario?: string,
): void {
  checked++;
  if (!DDL_RE.test(task.solutionSql || '')) return;
  ddlTasks++;

  const push = (kind: FindingKind, detail: string) =>
    findings.push({
      day: module.day,
      where,
      taskId: task.id,
      kind,
      detail,
      blocking: BLOCKING_DAYS.has(module.day),
    });

  const declared = extractDdlTableColumns(stripSqlLiteralsAndComments(task.solutionSql));
  const declaredCols = [...new Set(declared.flatMap((d) => d.columns))];
  const required = task.validation?.requiredColumns ?? [];

  if (declaredCols.length === 0) {
    // DROP-only solutions declare no columns. requiredColumns on such a task
    // would be phantoms — flag them; otherwise there is nothing to check.
    for (const col of required) {
      push(
        'ghost-required-columns',
        `requiredColumns names '${col}' but the solution is DROP-only (it declares no columns).`,
      );
    }
    return;
  }
  columnContracts++;

  // 1. VISIBLE: every declared column must be named in the rendered prompt.
  const rendered = renderedTaskText(task, scenario);
  for (const col of declaredCols) {
    if (!promptNames(rendered, col)) {
      push(
        'missing-column-in-prompt',
        `solutionSql declares column '${col}' but the rendered prompt never names it — the learner cannot discover the contract. Add it to instructions[].`,
      );
    }
  }

  // 2. DECLARED: validation.requiredColumns must cover every declared column.
  const requiredLower = new Set(required.map((c) => c.toLowerCase()));
  const missing = declaredCols.filter((c) => !requiredLower.has(c.toLowerCase()));
  if (missing.length > 0) {
    push(
      'missing-required-columns',
      `validation.requiredColumns is missing ${missing.length > 1 ? 'columns' : 'column'} ${missing
        .map((c) => `'${c}'`)
        .join(', ')} — the validator cannot say "Missing column 'x'" without it. Set requiredColumns: [${declaredCols
        .map((c) => `'${c}'`)
        .join(', ')}].`,
    );
  }

  // 3. HONEST: requiredColumns must not name columns the statement lacks.
  const declaredLower = new Set(declaredCols.map((c) => c.toLowerCase()));
  for (const col of required) {
    if (!declaredLower.has(col.toLowerCase())) {
      push(
        'ghost-required-columns',
        `requiredColumns names '${col}' but the solution statement never declares it.`,
      );
    }
  }
}

for (const module of ALL_MODULES) {
  for (const concept of module.concepts ?? []) {
    for (const task of concept.tasks ?? []) auditTask(module, 'lesson', task);
  }
  for (const task of module.challenge?.tasks ?? []) {
    auditTask(module, 'challenge', task, module.challenge?.scenario);
  }
}

const blocking = findings.filter((f) => f.blocking);
const advisory = findings.filter((f) => !f.blocking);

console.log('\n=== DDL contract audit (Workstream A) ===');
console.log('Prompt visibility + requiredColumns declaration for DDL tasks.\n');
console.log(`Tasks checked:             ${checked}`);
console.log(`DDL tasks:                 ${ddlTasks}`);
console.log(`Column contracts checked:  ${columnContracts}`);
console.log(`Blocking findings (27-30): ${blocking.length}`);
console.log(`Advisory findings (other): ${advisory.length}`);

if (findings.length) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    const tag = f.blocking ? '✗' : '·';
    console.log(`  ${tag} Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(16)} [${f.kind}]`);
    console.log(`      ${f.detail}`);
  }
}

if (blocking.length > 0) {
  console.log(
    '\nDDL CONTRACT AUDIT FAILED — every column a solution creates must be visible in the prompt AND declared in validation.requiredColumns (Days 27-30 block; see docs/DDL_AUDIT_TRACKER.md).',
  );
  process.exit(1);
}

console.log(
  `\nDDL contract audit passed (Days 27-30 clean${advisory.length ? `; ${advisory.length} advisory finding(s) outside scope — tracked` : ''}).`,
);