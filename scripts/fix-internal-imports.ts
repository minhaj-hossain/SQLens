import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/content/sql');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  content = content.replace(/(['"])((?:\.\.\/)+)(types\/|config\/|lib\/)/g, (match, quote, prefix, folder) => {
    return `${quote}../${prefix}${folder}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated internal relative imports in', file);
  }
});
