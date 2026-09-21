import { ALL_MODULES } from '../src/content/curriculum-index';

console.log('=== PHRASING AND TEXTUAL AUDIT: DAYS 20 TO 38 ===\n');

for (const m of ALL_MODULES) {
  if (m.day < 20) continue;

  const tasks = [];
  m.concepts.forEach(c => (c.tasks || []).forEach(t => tasks.push({ t, ctx: `C: ${c.title}` })));
  if (m.challenge) {
    (m.challenge.tasks || []).forEach(t => tasks.push({ t, ctx: 'Challenge' }));
  }

  tasks.forEach(({ t, ctx }) => {
    // Check title patterns
    // Check descriptions
    // Check instructions
    // Print anything with awkward grammar or informal styling
    const issues: string[] = [];

    // Check instructions phrasing: should be imperative, clear, well-punctuated
    t.instructions.forEach((inst: string, idx: number) => {
      if (!inst.endsWith('.') && !inst.endsWith(':') && !inst.endsWith('?')) {
        issues.push(`Instruction ${idx + 1} lacks ending punctuation: "${inst}"`);
      }
      if (inst.startsWith('write a query') || inst.startsWith('Write query')) {
        issues.push(`Instruction ${idx + 1} repetitive framing: "${inst}"`);
      }
      if (inst.includes('Feel the') || inst.includes('Watch it') || inst.includes('Witness')) {
        issues.push(`Unprofessional/dramatic phrasing: "${inst}"`);
      }
    });

    if (t.title.includes('Feel the') || t.title.includes('Witness') || t.title.includes('Lab:')) {
      issues.push(`Dramatic/informal title phrasing: "${t.title}"`);
    }

    if (t.hints.some((h: any) => h.text.length < 15)) {
      issues.push(`Very brief hint (<15 chars)`);
    }

    if (issues.length > 0) {
      console.log(`[Day ${m.day}] [${t.id}] "${t.title}" (${ctx}):`);
      issues.forEach(i => console.log(`   - ${i}`));
    }
  });
}
