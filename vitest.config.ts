import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The legacy audit worktree is intentionally kept in the repo for reference.
    // It ships its own copy of src/tests — never run those duplicates.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.kilo/**',
      '**/jumbled-harp/**',
    ],
    // Batch 10: raise the per-test budget above vitest's 5s default. The
    // curriculum-replay suites (`solutionSql passes validation for every practice
    // + challenge task`, and the task-equivalence audit) execute all 343 tasks
    // through the real engine and legitimately take ~3s alone; when 30 files run
    // in parallel on a loaded machine that can exceed 5s and flake a passing test
    // (observed once: `1 failed | 343 passed` on a 12s run, then clean 4x).
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
