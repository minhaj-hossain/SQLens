import { describe, it, expect } from 'vitest';
import { parsePrismaSchema } from '../../src/lib/prisma-engine/prisma-schema-parser';
import { stitchPrismaExecution } from '../../src/lib/prisma-engine/prisma-in-memory-stitcher';
import { PRISMA_SEED_SCHEMA } from '../../src/lib/prisma-engine/prisma-submit-pipeline';
import { previewPrismaTask, submitForTask } from '../../src/lib/track-submit';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import type { PracticeTask } from '../../src/types/curriculum';
import type { QueryExecutionResult } from '../../src/types/database';

function mockResult(partial: Partial<QueryExecutionResult>): QueryExecutionResult {
  return {
    success: true,
    columns: [],
    rows: [],
    rowCount: partial.rows?.length ?? 0,
    executionTimeMs: 1,
    ...partial,
  };
}

function findTask(id: string): PracticeTask {
  for (const mod of PRISMA_MODULES) {
    for (const concept of mod.concepts) {
      const hit = concept.tasks.find((t) => t.id === id);
      if (hit) return hit;
    }
    const challengeHit = mod.challenge?.tasks.find((t) => t.id === id);
    if (challengeHit) return challengeHit;
  }
  throw new Error(`Task not found: ${id}`);
}

describe('Phase 3: Prisma In-Memory Result Stitcher', () => {
  const schema = parsePrismaSchema(PRISMA_SEED_SCHEMA);

  it('correctly stitches 1:N relations (User with posts)', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'read',
          sql: 'SELECT id, name, email FROM users WHERE id = 1;',
          result: mockResult({
            columns: ['id', 'name', 'email'],
            rows: [[1, 'Alice', 'alice@prisma.io']],
            success: true,
          }),
          role: 'main',
        },
        {
          label: 'include posts',
          sql: 'SELECT id, title, authorId FROM posts WHERE authorId IN (1);',
          result: mockResult({
            columns: ['id', 'title', 'authorId'],
            rows: [
              [101, 'Hello World', 1],
              [102, 'Prisma Tips', 1],
              [103, 'Bob Post', 2],
            ],
            success: true,
          }),
          role: 'relation',
        },
      ],
      schema,
      method: 'findUnique',
    });

    expect(stitched).toEqual({
      id: 1,
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: [
        { id: 101, title: 'Hello World', authorId: 1 },
        { id: 102, title: 'Prisma Tips', authorId: 1 },
      ],
    });
  });

  it('correctly stitches N:1 relations (Post with author)', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'read',
          sql: 'SELECT id, title, authorId FROM posts WHERE id = 101;',
          result: mockResult({
            columns: ['id', 'title', 'authorId'],
            rows: [[101, 'Hello World', 1]],
            success: true,
          }),
          role: 'main',
        },
        {
          label: 'include author',
          sql: 'SELECT id, name, email FROM users WHERE id IN (1);',
          result: mockResult({
            columns: ['id', 'name', 'email'],
            rows: [[1, 'Alice', 'alice@prisma.io']],
            success: true,
          }),
          role: 'relation',
        },
      ],
      schema,
      method: 'findUnique',
    });

    expect(stitched).toEqual({
      id: 101,
      title: 'Hello World',
      authorId: 1,
      author: {
        id: 1,
        name: 'Alice',
        email: 'alice@prisma.io',
      },
    });
  });

  it('handles findUnique returning 0 rows as null', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'read',
          sql: 'SELECT id, name FROM users WHERE id = 999;',
          result: mockResult({
            columns: ['id', 'name'],
            rows: [],
            success: true,
          }),
          role: 'main',
        },
      ],
      schema,
      method: 'findUnique',
    });

    expect(stitched).toBeNull();
  });

  it('handles findMany returning 0 rows as empty array', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'read',
          sql: 'SELECT id, name FROM users WHERE name = "Nobody";',
          result: mockResult({
            columns: ['id', 'name'],
            rows: [],
            success: true,
          }),
          role: 'main',
        },
      ],
      schema,
      method: 'findMany',
    });

    expect(stitched).toEqual([]);
  });

  it('formats count queries as scalar numbers', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'count',
          sql: 'SELECT COUNT(*) FROM users;',
          result: mockResult({
            columns: ['COUNT(*)'],
            rows: [[4]],
            success: true,
          }),
          role: 'main',
        },
      ],
      schema,
      method: 'count',
    });

    expect(stitched).toBe(4);
  });

  it('formats batch $transaction as an array of statement outcomes', () => {
    const stitched = stitchPrismaExecution({
      steps: [
        {
          label: 'tx step 1: create',
          sql: 'INSERT INTO users (name, email) VALUES ("Sam", "sam@prisma.io");',
          result: mockResult({
            columns: ['id', 'name'],
            rows: [[5, 'Sam']],
            affectedRows: 1,
            success: true,
          }),
          role: 'main',
        },
        {
          label: 'tx step 2: update',
          sql: 'UPDATE users SET name = "Samuel" WHERE id = 5;',
          result: mockResult({
            columns: [],
            rows: [],
            affectedRows: 1,
            success: true,
          }),
          role: 'main',
        },
      ],
      schema,
      method: '$transaction',
      rowEffect: 'sum',
    });

    expect(stitched).toEqual([
      { id: 5, name: 'Sam' },
      { count: 1 },
    ]);
  });

  it('threads stitchedJson through previewPrismaTask and submitForTask in the real pipeline', async () => {
    const task = findTask('prisma04-c1-t1');
    expect(task).toBeDefined();

    const executor = new SqlExecutor();
    const hooks = {
      execute: (sql: string) => executor.executeQuery(sql),
      resetDatabase: () => executor.resetDatabase(),
      getDatabaseState: () => executor.getDatabaseState(),
    };

    // Test preview
    const preview = previewPrismaTask(
      task!,
      'await prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } })',
      hooks,
    );

    expect(preview.lens.stitchedJson).toBeDefined();
    const previewJson = preview.lens.stitchedJson as {
      id: number;
      posts: Array<{ id: number; title: string }>;
    };
    expect(previewJson.id).toBe(1);
    expect(Array.isArray(previewJson.posts)).toBe(true);

    // Test submit
    const submit = submitForTask({
      task: task!,
      code: 'await prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } })',
      hooks,
      surface: 'lesson',
    });

    expect(submit.lens?.stitchedJson).toBeDefined();
    const submitJson = submit.lens?.stitchedJson as {
      id: number;
      posts: Array<{ id: number; title: string }>;
    };
    expect(submitJson.id).toBe(1);
    expect(Array.isArray(submitJson.posts)).toBe(true);
  });
});
