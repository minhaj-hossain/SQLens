import { ALL_MODULES } from '../src/content/curriculum-index';
import { ModuleData, PracticeTask } from '../src/types/curriculum';

interface Finding {
  day: number;
  moduleTitle: string;
  where: 'concept-task' | 'challenge-task';
  taskId: string;
  taskTitle: string;
  issueType: string;
  detail: string;
  sql: string;
  instructions: string[];
}

const findings: Finding[] = [];

// Feature introduction days
const FEATURE_INTRO = {
  GROUP_BY: 9,
  AGGREGATES: 9,
  CASE: 10,
  STRING_FUNCS: 11,
  DATE_FUNCS: 12,
  JOINS: 14,
  SET_OPS: 17,
  SUBQUERIES_CTES: 21,
  WINDOW_FUNCS: 23,
  DML: 25,
  TRANSACTIONS: 26,
  DDL: 27,
  INDEXES: 31,
};

function checkTask(task: PracticeTask, module: ModuleData, where: 'concept-task' | 'challenge-task') {
  const day = module.day;
  const sql = task.solutionSql || '';
  const initialSql = task.initialSql || '';
  const desc = task.description || '';
  const instrs = task.instructions || [];
  const textBlob = `${desc} ${instrs.join(' ')} ${sql} ${initialSql}`.toUpperCase();

  // Helper to test regex on SQL (excluding string literals)
  const sqlWithoutStrings = sql.replace(/'[^']*'/g, "''");

  // 1. JOIN check (< Day 14)
  if (day < FEATURE_INTRO.JOINS) {
    if (/\b(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|CROSS\s+JOIN|JOIN)\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'JOIN_BEFORE_DAY_14',
        detail: `Task uses JOIN in solution before Day 14`,
        sql,
        instructions: instrs,
      });
    } else if (task.validation?.requireJoin) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'JOIN_BEFORE_DAY_14',
        detail: `Task validation has requireJoin: true before Day 14`,
        sql,
        instructions: instrs,
      });
    } else if (/\bJOIN\b/i.test(textBlob)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'JOIN_BEFORE_DAY_14',
        detail: `Task mentions JOIN in text/instructions before Day 14`,
        sql,
        instructions: instrs,
      });
    }
    // Multiple tables referenced
    if (task.secondaryTables && task.secondaryTables.length > 0) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'MULTI_TABLE_BEFORE_DAY_14',
        detail: `Task specifies secondaryTables: [${task.secondaryTables.join(', ')}] before Day 14`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 2. GROUP BY / Aggregates (< Day 9)
  if (day < FEATURE_INTRO.GROUP_BY) {
    if (/\bGROUP\s+BY\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'GROUP_BY_BEFORE_DAY_9',
        detail: `Task uses GROUP BY before Day 9`,
        sql,
        instructions: instrs,
      });
    }
    if (/\bHAVING\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'HAVING_BEFORE_DAY_9',
        detail: `Task uses HAVING before Day 9`,
        sql,
        instructions: instrs,
      });
    }
    if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'AGGREGATE_BEFORE_DAY_9',
        detail: `Task uses aggregate function before Day 9`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 3. CASE (< Day 10)
  if (day < FEATURE_INTRO.CASE) {
    if (/\bCASE\s+WHEN\b/i.test(sqlWithoutStrings) || task.validation?.requireCase) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'CASE_BEFORE_DAY_10',
        detail: `Task uses CASE before Day 10`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 4. String functions (< Day 11)
  // Note: LIKE and concatenation may have nuances; check functions: UPPER, LOWER, TRIM, LENGTH, SUBSTRING, CONCAT, REPLACE
  if (day < FEATURE_INTRO.STRING_FUNCS) {
    const stringFuncs = ['UPPER', 'LOWER', 'TRIM', 'LENGTH', 'SUBSTRING', 'CONCAT', 'REPLACE'];
    const matched = stringFuncs.filter(fn => new RegExp(`\\b${fn}\\s*\\(`, 'i').test(sqlWithoutStrings));
    if (matched.length > 0) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'STRING_FUNC_BEFORE_DAY_11',
        detail: `Task uses string function(s) [${matched.join(', ')}] before Day 11`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 5. Date functions (< Day 12)
  if (day < FEATURE_INTRO.DATE_FUNCS) {
    const dateFuncs = ['EXTRACT', 'DATEDIFF', 'CURDATE', 'CURRENT_DATE', 'DATE_ADD', 'DATE_SUB', 'STRFTIME', 'DATE\\(', 'YEAR\\(', 'MONTH\\(', 'DAY\\('];
    const matched = dateFuncs.filter(fn => new RegExp(`\\b${fn}`, 'i').test(sqlWithoutStrings));
    if (matched.length > 0) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'DATE_FUNC_BEFORE_DAY_12',
        detail: `Task uses date function(s) [${matched.join(', ')}] before Day 12`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 6. Set operations (< Day 17)
  if (day < FEATURE_INTRO.SET_OPS) {
    if (/\b(UNION|EXCEPT|INTERSECT)\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'SET_OP_BEFORE_DAY_17',
        detail: `Task uses Set operation before Day 17`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 7. Subqueries & CTEs (< Day 21)
  if (day < FEATURE_INTRO.SUBQUERIES_CTES) {
    if (/\bWITH\s+[A-Za-z0-9_]+\s+AS\s*\(/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'CTE_BEFORE_DAY_21',
        detail: `Task uses WITH / CTE before Day 21`,
        sql,
        instructions: instrs,
      });
    }
    // Subqueries in FROM or WHERE: (SELECT ...)
    // Exclude string literals
    if (/\(\s*SELECT\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'SUBQUERY_BEFORE_DAY_21',
        detail: `Task uses subquery (SELECT ...) before Day 21`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 8. Window functions (< Day 23)
  if (day < FEATURE_INTRO.WINDOW_FUNCS) {
    if (/\bOVER\s*\(/i.test(sqlWithoutStrings) || /\b(ROW_NUMBER|DENSE_RANK|RANK|LAG|LEAD)\s*\(/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'WINDOW_FUNC_BEFORE_DAY_23',
        detail: `Task uses Window function before Day 23`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 9. DML (< Day 25)
  if (day < FEATURE_INTRO.DML) {
    if (/^\s*(INSERT\s+INTO|UPDATE\b|DELETE\s+FROM)\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'DML_BEFORE_DAY_25',
        detail: `Task uses DML before Day 25`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 10. Transactions (< Day 26)
  if (day < FEATURE_INTRO.TRANSACTIONS) {
    if (/\b(BEGIN|COMMIT|ROLLBACK|START\s+TRANSACTION)\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'TRANSACTION_BEFORE_DAY_26',
        detail: `Task uses Transaction statement before Day 26`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 11. DDL (< Day 27)
  if (day < FEATURE_INTRO.DDL) {
    if (/\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'DDL_BEFORE_DAY_27',
        detail: `Task uses DDL before Day 27`,
        sql,
        instructions: instrs,
      });
    }
  }

  // 12. Index / EXPLAIN (< Day 31)
  if (day < FEATURE_INTRO.INDEXES) {
    if (/\b(CREATE\s+INDEX|DROP\s+INDEX)\b/i.test(sqlWithoutStrings) || /^\s*EXPLAIN\b/i.test(sqlWithoutStrings)) {
      findings.push({
        day,
        moduleTitle: module.title,
        where,
        taskId: task.id,
        taskTitle: task.title,
        issueType: 'INDEX_OR_EXPLAIN_BEFORE_DAY_31',
        detail: `Task uses INDEX / EXPLAIN before Day 31`,
        sql,
        instructions: instrs,
      });
    }
  }
}

for (const module of ALL_MODULES) {
  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) {
      checkTask(task, module, 'concept-task');
    }
  }
  if (module.challenge?.tasks) {
    for (const task of module.challenge.tasks) {
      checkTask(task, module, 'challenge-task');
    }
  }
}

console.log(`\nFound ${findings.length} prerequisite violations/misplacements:\n`);
for (const f of findings) {
  console.log(`--- [Day ${f.day}] ${f.moduleTitle} (${f.where}: ${f.taskId} - ${f.taskTitle}) ---`);
  console.log(`  Issue: ${f.issueType}`);
  console.log(`  Detail: ${f.detail}`);
  console.log(`  SQL: ${f.sql.trim()}`);
  console.log(`  Instructions: ${f.instructions.join(' | ')}\n`);
}
