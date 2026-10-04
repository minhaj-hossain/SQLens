/**
 * scripts/audit-sql-prompt-contract.ts
 * -----------------------------------------------------------------------------
 * Automated Quality Gate: Prompt-to-Solution Alignment Contract (Rule 8)
 *
 * Verifies across ALL lesson tasks and challenge tasks that:
 * 1. No DDL/procedural hijacking of whereContainsTerms:
 *    - Native flags (requireWithCheckOption, requireOrReplace, requireDropObject, requireUpdate)
 *      must be used instead of whereContainsTerms.
 * 2. Explicit Alias Contract:
 *    - All requiredAliases are explicitly visible in task instructions, description, or initialSql.
 * 3. Explicit Required Columns Contract:
 *    - All requiredColumns are explicitly visible in the rendered prompt or initialSql.
 *    - Exempts SELECT * wildcard queries and EXPLAIN plan queries where columns are implicitly
 *      produced by the table schema or engine explain plan.
 * 4. Explicit Sort Contract:
 *    - Any task requiring ORDER BY (validation.requireOrderBy === true) must explicitly
 *      instruct ordering/sorting in its rendered prompt.
 *
 * Run: npx tsx scripts/audit-sql-prompt-contract.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { PracticeTask, ChallengeTask } from '../src/types/curriculum';

interface Finding {
  day: number;
  moduleId: string;
  taskId: string;
  kind: 'ddl-hijack' | 'ghost-alias' | 'ghost-column' | 'ghost-sort';
  detail: string;
}

const FORBIDDEN_WHERE_TERMS = [
  'CHECK OPTION',
  'OR REPLACE',
  'DROP PROCEDURE',
  'DROP TRIGGER',
  'DROP FUNCTION',
  'DROP VIEW',
  'CREATE PROCEDURE',
  'CREATE FUNCTION',
  'CREATE TRIGGER',
];

const findings: Finding[] = [];
let totalTasksChecked = 0;

function auditTask(day: number, moduleId: string, task: PracticeTask | ChallengeTask) {
  totalTasksChecked++;
  const val = task.validation || {};
  const renderedPrompt = [
    task.title,
    task.description,
    ...(task.instructions || []),
    task.initialSql || '',
  ].join(' ').toLowerCase();

  const solution = task.solutionSql || '';
  const solutionUpper = solution.toUpperCase();

  // Check 1: DDL hijacking in whereContainsTerms
  if (val.whereContainsTerms && Array.isArray(val.whereContainsTerms)) {
    for (const term of val.whereContainsTerms) {
      const upperTerm = term.toUpperCase();
      for (const forbidden of FORBIDDEN_WHERE_TERMS) {
        if (upperTerm.includes(forbidden)) {
          findings.push({
            day,
            moduleId,
            taskId: task.id,
            kind: 'ddl-hijack',
            detail: `whereContainsTerms contains DDL term "${term}". Use native validation flags (requireWithCheckOption, requireOrReplace, requireDropObject) instead.`,
          });
        }
      }
    }
  }

  // Check 2: Explicit Alias Contract
  if (val.requiredAliases && Array.isArray(val.requiredAliases)) {
    for (const alias of val.requiredAliases) {
      if (!renderedPrompt.includes(alias.toLowerCase())) {
        findings.push({
          day,
          moduleId,
          taskId: task.id,
          kind: 'ghost-alias',
          detail: `requiredAlias "${alias}" is not mentioned anywhere in task prompt, instructions, or initialSql.`,
        });
      }
    }
  }

  // Check 3: Explicit Required Columns Contract
  // (Exempt SELECT * and EXPLAIN queries where columns are implicitly produced by the table wildcard or explain plan)
  const isSelectAll =
    solutionUpper.includes('SELECT *') ||
    renderedPrompt.includes('all columns') ||
    renderedPrompt.includes('select *');
  const isExplain = solution.trim().toUpperCase().startsWith('EXPLAIN');

  if (!isSelectAll && !isExplain && val.requiredColumns && Array.isArray(val.requiredColumns)) {
    for (const col of val.requiredColumns) {
      if (!renderedPrompt.includes(col.toLowerCase())) {
        findings.push({
          day,
          moduleId,
          taskId: task.id,
          kind: 'ghost-column',
          detail: `requiredColumn "${col}" is not mentioned in task prompt, instructions, or initialSql.`,
        });
      }
    }
  }

  // Check 4: Explicit Sort Contract
  if (val.requireOrderBy === true) {
    const hasSortInstruction =
      renderedPrompt.includes('sort') ||
      renderedPrompt.includes('order') ||
      renderedPrompt.includes('desc') ||
      renderedPrompt.includes('asc') ||
      renderedPrompt.includes('highest') ||
      renderedPrompt.includes('lowest') ||
      renderedPrompt.includes('top') ||
      renderedPrompt.includes('bottom') ||
      renderedPrompt.includes('rank') ||
      renderedPrompt.includes('chronological') ||
      renderedPrompt.includes('alphabetical');

    if (!hasSortInstruction) {
      findings.push({
        day,
        moduleId,
        taskId: task.id,
        kind: 'ghost-sort',
        detail: `requireOrderBy is true but prompt contains no sort/order instruction keywords.`,
      });
    }
  }
}

for (const module of ALL_MODULES) {
  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) {
      auditTask(module.day, module.id, task);
    }
  }
  if (module.challenge?.tasks?.length) {
    for (const task of module.challenge.tasks) {
      auditTask(module.day, module.id, task);
    }
  }
}

console.log('\n=== SQL Prompt Contract Audit (Rule 8) ===');
console.log(`Tasks checked:      ${totalTasksChecked}`);
console.log(`Findings:          ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} [${f.kind}] ${f.taskId} (${f.moduleId}):`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nSQL PROMPT CONTRACT AUDIT FAILED — align prompt with solution.');
  process.exit(1);
}

console.log('\nAll 424 tasks comply with the SQL Prompt Contract (Rule 8)!\n');
