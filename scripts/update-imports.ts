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
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // We are looking for anything ending with /content/modules/, /content/database/, or /content/curriculum-index
  // in import strings.
  // E.g. '../../src/content/sql/curriculum-index'
  // Let's use regex that matches imports to avoid replacing random text.
  content = content.replace(/(['"])(.*?)content\/modules\//g, (match, quote, prefix) => {
    if (prefix.endsWith('sql/')) return match;
    return `${quote}${prefix}content/sql/modules/`;
  });
  
  content = content.replace(/(['"])(.*?)content\/database\//g, (match, quote, prefix) => {
    if (prefix.endsWith('sql/')) return match;
    return `${quote}${prefix}content/sql/database/`;
  });

  content = content.replace(/(['"])(.*?)content\/curriculum-index/g, (match, quote, prefix) => {
    if (prefix.endsWith('sql/')) return match;
    return `${quote}${prefix}content/sql/curriculum-index`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated imports in', file);
  }
});
