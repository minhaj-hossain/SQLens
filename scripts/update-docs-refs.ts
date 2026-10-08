import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.kilo') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');

const replacements: Record<string, string> = {
  'docs/sql/DIALECT.md': 'docs/sql/DIALECT.md',
  'docs/sql/GRADING_POLICY.md': 'docs/sql/GRADING_POLICY.md',
  'docs/sql/SQL_VALIDATION_AND_CURRICULUM_OVERHAUL_TRACKER.md': 'docs/sql/SQL_VALIDATION_AND_CURRICULUM_OVERHAUL_TRACKER.md',
  'docs/sql/curriculum-map.md': 'docs/sql/curriculum-map.md',
  
  'docs/prisma/PILOT_EXECUTION_RESULTS.md': 'docs/prisma/PILOT_EXECUTION_RESULTS.md',
  'docs/prisma/PRISMA_CURRICULUM_AND_WORKSPACE_OVERHAUL_PLAN.md': 'docs/prisma/PRISMA_CURRICULUM_AND_WORKSPACE_OVERHAUL_PLAN.md',
  'docs/prisma/PRISMA_CURRICULUM_REVIEW_AND_OVERHAUL_TRACKER.md': 'docs/prisma/PRISMA_CURRICULUM_REVIEW_AND_OVERHAUL_TRACKER.md',
  'docs/prisma/PRISMA_LEARNING_FLUENCY_IMPLEMENTATION_TRACKER.md': 'docs/prisma/PRISMA_LEARNING_FLUENCY_IMPLEMENTATION_TRACKER.md',
  'docs/prisma/PRISMA_PEDAGOGY_AND_PROGRESSIVE_BUILD_TRACKER.md': 'docs/prisma/PRISMA_PEDAGOGY_AND_PROGRESSIVE_BUILD_TRACKER.md',
  
  'docs/prisma/specs/GREENFIELD_MARKETPLACE_EXAM_SPEC.md': 'docs/prisma/specs/GREENFIELD_MARKETPLACE_EXAM_SPEC.md',
  'docs/prisma/specs/PILOT_TESTING_PROTOCOL_SPEC.md': 'docs/prisma/specs/PILOT_TESTING_PROTOCOL_SPEC.md'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  for (const [oldPath, newPath] of Object.entries(replacements)) {
    // We want to replace exactly `docs/XYZ` without matching things that already say `docs/sql/XYZ`
    // We can just use split and join.
    content = content.split(oldPath).join(newPath);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated docs references in', file);
  }
});
