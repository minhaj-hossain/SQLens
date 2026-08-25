import { ALL_MODULES } from '../src/content/curriculum-index';
import { DATABASE_SCHEMAS } from '../src/content/database/schema';
import { INITIAL_TABLES } from '../src/content/database/tables';

interface AuditResult {
  day: number;
  moduleId: string;
  moduleTitle: string;
  totalConcepts: number;
  totalTasks: number;
  totalMCQs: number;
  concepts: Array<{
    conceptId: string;
    title: string;
    hasTargetQuery: boolean;
    hasIntroTable: boolean;
    hasStepBreakdowns: boolean;
    stepCount: number;
    hasKeyTakeaway: boolean;
    hasExampleQuery: boolean;
    hasLiveDemoSql: boolean;
    taskCount: number;
    mcqCount: number;
    issues: string[];
  }>;
}

const auditResults: AuditResult[] = [];
const allIssues: string[] = [];
let totalConceptsCount = 0;
let totalTasksCount = 0;
let totalMCQsCount = 0;
let missingTargetQueryCount = 0;

console.log('\n🔍 ========================================================');
console.log('   SQLens Automated Curriculum Quality & Pedagogy Audit');
console.log('========================================================\n');

for (const module of ALL_MODULES) {
  const modResult: AuditResult = {
    day: module.day,
    moduleId: module.id,
    moduleTitle: module.title,
    totalConcepts: module.concepts.length,
    totalTasks: 0,
    totalMCQs: 0,
    concepts: [],
  };

  for (const concept of module.concepts) {
    totalConceptsCount++;
    const issues: string[] = [];
    const theory = concept.theory;

    const hasTargetQuery = !!(theory as any).targetQuery;
    const hasStepBreakdowns = !!(theory.stepBreakdowns && theory.stepBreakdowns.length > 0);
    const stepCount = theory.stepBreakdowns?.length || 0;
    const hasIntroTable = !!theory.introTable;
    const hasKeyTakeaway = !!theory.keyTakeaway && theory.keyTakeaway.trim().length > 0;
    const hasExampleQuery = !!theory.exampleQuery && theory.exampleQuery.trim().length > 0;
    const hasLiveDemoSql = !!theory.liveDemoSql && theory.liveDemoSql.trim().length > 0;
    const taskCount = concept.tasks?.length || 0;
    const mcqCount = theory.mcqs?.length || 0;

    modResult.totalTasks += taskCount;
    modResult.totalMCQs += mcqCount;
    totalTasksCount += taskCount;
    totalMCQsCount += mcqCount;

    // Rule 1: Step breakdown requires a targetQuery
    if (hasStepBreakdowns && !hasTargetQuery) {
      missingTargetQueryCount++;
      issues.push(`🔴 Has ${stepCount} step breakdowns but MISSING targetQuery`);
    }

    // Rule 2: Intro table validation
    if (theory.introTable) {
      const tName = theory.introTable.tableName?.toLowerCase().split(/[\s,&]+/)[0];
      if (tName && !DATABASE_SCHEMAS[tName] && !['result', 'inner', 'primary', 'category', 'custom', 'students', 'student_records'].includes(tName)) {
        issues.push(`⚠️ Intro table '${theory.introTable.tableName}' might not match standard schema`);
      }
    }

    // Rule 3: Practice task tables must exist in database schemas
    for (const task of concept.tasks || []) {
      if (!DATABASE_SCHEMAS[task.primaryTable] && !INITIAL_TABLES[task.primaryTable]) {
        issues.push(`🔴 Task '${task.id}' references unknown primaryTable '${task.primaryTable}'`);
      }
      for (const secTable of task.secondaryTables || []) {
        if (!DATABASE_SCHEMAS[secTable] && !INITIAL_TABLES[secTable]) {
          issues.push(`🔴 Task '${task.id}' references unknown secondaryTable '${secTable}'`);
        }
      }
    }

    // Rule 4: MCQ integrity check
    for (const mcq of theory.mcqs || []) {
      if (!mcq.options || mcq.options.length < 2) {
        issues.push(`🔴 MCQ has fewer than 2 options: "${mcq.question.substring(0, 30)}..."`);
      }
      if (mcq.correctIndex < 0 || mcq.correctIndex >= (mcq.options?.length || 0)) {
        issues.push(`🔴 MCQ correctIndex ${mcq.correctIndex} out of bounds for options count ${mcq.options?.length}`);
      }
    }

    if (issues.length > 0) {
      allIssues.push(`[Day ${module.day} - ${concept.title}] ${issues.join('; ')}`);
    }

    modResult.concepts.push({
      conceptId: concept.id,
      title: concept.title,
      hasTargetQuery,
      hasIntroTable,
      hasStepBreakdowns,
      stepCount,
      hasKeyTakeaway,
      hasExampleQuery,
      hasLiveDemoSql,
      taskCount,
      mcqCount,
      issues,
    });
  }

  // Count challenge tasks if present
  if (module.challenge?.tasks) {
    totalTasksCount += module.challenge.tasks.length;
    modResult.totalTasks += module.challenge.tasks.length;
  }

  auditResults.push(modResult);
}

// Summary Print
console.log(`📊 Total Modules Inspected:  ${ALL_MODULES.length}`);
console.log(`📚 Total Concepts:           ${totalConceptsCount}`);
console.log(`✏️  Total Practice Tasks:      ${totalTasksCount}`);
console.log(`❓ Total MCQs:                ${totalMCQsCount}`);
console.log(`⚠️ Concepts Missing Target Query before Steps: ${missingTargetQueryCount} / ${totalConceptsCount}\n`);

console.log('--- DAY-BY-DAY AUDIT SUMMARY ---');
for (const m of auditResults) {
  const statusIcon = m.concepts.every(c => c.issues.length === 0) ? '✅' : '⚠️';
  const targetQueryFraction = `${m.concepts.filter(c => c.hasTargetQuery).length}/${m.concepts.length}`;
  console.log(`Day ${String(m.day).padStart(2, ' ')}: ${m.moduleTitle.padEnd(45, ' ')} [Concepts: ${m.concepts.length}, TargetQueries: ${targetQueryFraction}, Tasks: ${m.totalTasks}] ${statusIcon}`);
}

if (allIssues.length > 0) {
  console.log('\n--- ISSUES IDENTIFIED TO RESOLVE ---');
  for (const iss of allIssues.slice(0, 20)) {
    console.log(iss);
  }
  if (allIssues.length > 20) {
    console.log(`... and ${allIssues.length - 20} more concepts to align.`);
  }
} else {
  console.log('\n🎉 All curriculum rules pass 100% cleanly!');
}

console.log('\n========================================================\n');
