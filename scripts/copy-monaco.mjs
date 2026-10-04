import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'node_modules', 'monaco-editor', 'min', 'vs');
const destDir = path.join(rootDir, 'public', 'monaco', 'vs');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`[copy-monaco] Successfully synced Monaco assets to ${destDir}`);
} else {
  console.warn(`[copy-monaco] Warning: ${srcDir} not found. Ensure monaco-editor is installed.`);
}
