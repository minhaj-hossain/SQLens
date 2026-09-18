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
  },
});
