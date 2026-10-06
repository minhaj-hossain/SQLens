import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index.js';
import * as fs from 'fs';

interface TaskPromptAudit {
  day: number;
  dayTitle: string;
  taskId: string;
  title: string;
  description: string;
  displayedStatement: string;
  instructions: string[];
  isAbstractOrCryptic: boolean;
  critique: string;
  suggestedClearQuestion: string;
}

const auditResults: TaskPromptAudit[] = [];

for (const mod of PRISMA_MODULES) {
  const allTasks = [
    ...(mod.concepts.flatMap((c) => c.tasks ?? [])),
    ...(mod.challenge?.tasks ?? []),
  ];

  for (const t of allTasks) {
    const rawTitle = (t.title || '').replace(/^Task\s+\d+:\s*/i, '').replace(/[`]/g, '').trim();
    const rawDesc = (t.description || '').replace(/[`]/g, '').trim();
    const displayed = rawDesc || rawTitle;

    // Detect abstract, aphoristic, or non-actionable descriptions
    // E.g. "One parent row, one extra query...", "The category may already exist...",
    // "Both updates must land...", "A duplicate email must become a 409..."
    // or statements that lack action verbs (e.g. Write, Query, Fetch, Update, Add, Define, Return, Filter)
    const actionVerbs = ['fetch', 'query', 'write', 'return', 'add', 'create', 'update', 'delete', 'filter', 'paginate', 'define', 'load', 'retrieve', 'build', 'sort', 'implement', 'catch', 'wrap', 'run', 'extract', 'find', 'upsert'];
    const startsWithAction = actionVerbs.some(v => displayed.toLowerCase().startsWith(v));
    const isFragment = displayed.endsWith('...') || displayed.split(' ').length < 5 || !startsWithAction;
    
    // Check specific patterns
    const isAphorism = 
      displayed.includes('One parent row') ||
      displayed.includes('Both updates must land') ||
      displayed.includes('The category may already exist') ||
      displayed.includes('A duplicate email must become') ||
      displayed.includes('Read one value, then write') ||
      displayed.includes('Updating a row that does not exist') ||
      displayed.includes('All or nothing') ||
      displayed.includes('Wrap every user query') ||
      !startsWithAction;

    let critique = '';
    let suggested = '';

    if (isAphorism) {
      critique = `The displayed statement "${displayed}" is a passive observation or abstract theory note rather than an explicit, actionable task prompt.`;
      suggested = rawTitle.length > 5 ? `${rawTitle}.` : `Write the query to ${rawTitle.toLowerCase()}.`;
    }

    auditResults.push({
      day: mod.day,
      dayTitle: mod.title,
      taskId: t.id,
      title: rawTitle,
      description: rawDesc,
      displayedStatement: displayed,
      instructions: t.instructions ?? [],
      isAbstractOrCryptic: isAphorism,
      critique,
      suggestedClearQuestion: suggested,
    });
  }
}

fs.writeFileSync(
  'scripts/audit_prompts_result.json',
  JSON.stringify(auditResults, null, 2),
);

const crypticTasks = auditResults.filter((r) => r.isAbstractOrCryptic);
console.log(`Audited ${auditResults.length} tasks across ${PRISMA_MODULES.length} days.`);
console.log(`Identified ${crypticTasks.length} tasks with abstract, passive, or confusing question phrasing.`);
