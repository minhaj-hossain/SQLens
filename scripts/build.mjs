/**
 * Cross-platform build wrapper (tracker item 7).
 *
 * `next build` can OOM during SSG on small-heap machines. This bumps the
 * Node heap via NODE_OPTIONS before spawning the real build, so `npm run build`
 * works everywhere without the caller remembering a manual flag — including CI.
 *
 * Any NODE_OPTIONS already set in the environment is preserved and the heap
 * flag is appended (a later flag wins for max-old-space-size).
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const heapFlag = '--max-old-space-size=4096';

const existing = process.env.NODE_OPTIONS ?? '';
process.env.NODE_OPTIONS = existing.includes('--max-old-space-size')
  ? existing
  : `${existing} ${heapFlag}`.trim();

console.log(`[build] NODE_OPTIONS=${process.env.NODE_OPTIONS}`);
const child = spawnSync('npx', ['next', 'build'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(child.status ?? 1);