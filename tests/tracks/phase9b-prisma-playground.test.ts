import { describe, it, expect } from 'vitest';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import {
  defaultEditorTab,
  editorSchemaTab,
  editorSurface,
  idleLensState,
  isPrismaTask,
  typeInspectorState,
} from '../../src/lib/track-submit';
import {
  PRISMA_PLAYGROUND_EXAMPLE,
  prismaPlaygroundSchemaSource,
  prismaPlaygroundSeedSql,
  runPrismaPlaygroundCode,
} from '../../src/lib/prisma-playground';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import type { PracticeTask } from '../../src/types/curriculum';
import {
  PRISMA_SEED_SCHEMA,
  prismaSchemaSourceForTask,
} from '../../src/lib/prisma-engine/prisma-submit-pipeline';

function firstPrismaTask(): PracticeTask {
  const mod = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
  return mod.concepts[0].tasks[0];
}

function sqlTask(): PracticeTask {
  return { id: 'sql-1', validation: {} } as PracticeTask;
}

describe('Phase 9 — schema tab + type inspector decisions', () => {
  it('keeps the SQL track single-file: no schema tab, no inspector', () => {
    const task = sqlTask();
    expect(isPrismaTask(task)).toBe(false);
    expect(editorSchemaTab(task)).toBeUndefined();
    expect(typeInspectorState(task, null)).toBeUndefined();
    expect(editorSurface(task).fileLabel).toBe('query.sql');
    expect(idleLensState(task)).toBeUndefined();
  });

  it('offers the schema tab on Prisma with a seed caption by default', () => {
    const task = firstPrismaTask();
    const tab = editorSchemaTab(task)!;
    expect(tab.label).toBe('schema.prisma');
    expect(tab.source).toBe(prismaSchemaSourceForTask(task));
    expect(tab.caption).toMatch(/seed universe/i);
    expect(defaultEditorTab(task)).toBe('editor');
  });

  it('reports observed types from rows, never faked before a run', () => {
    const task = firstPrismaTask();
    expect(typeInspectorState(task, null)!.inferred.observed).toBe(false);
    const after = typeInspectorState(task, {
      columns: ['id'],
      rows: [{ id: 1 }],
      rowCount: 1,
    } as never)!;
    expect(after.inferred.tsType).toBe('{ id: number }');
  });
});

describe('Phase 11 — Prisma playground contract', () => {
  it('ships a runnable example against the seed schema', () => {
    expect(prismaPlaygroundSchemaSource()).toBe(PRISMA_SEED_SCHEMA);
    expect(prismaPlaygroundSeedSql()).toContain('CREATE TABLE users');
    expect(PRISMA_PLAYGROUND_EXAMPLE).toContain('include: { posts: true }');
  });

  it('runs the example through the curriculum translator + session DB', () => {
    const ex = new SqlExecutor();
    ex.execute(prismaPlaygroundSeedSql());
    const out = runPrismaPlaygroundCode(PRISMA_PLAYGROUND_EXAMPLE, {
      executeQuery: (stmt: string) => ex.execute(stmt),
    });
    expect(out.ok).toBe(true);
    expect(out.steps.length).toBeGreaterThan(0);
    expect(out.touchedRelation).toBe(true);
    expect(out.mainResult).toBeDefined();
  });

  it('is honest about untranslatable code and grades nothing', () => {
    const ex = new SqlExecutor();
    ex.execute(prismaPlaygroundSeedSql());
    const out = runPrismaPlaygroundCode('npx prisma migrate dev', {
      executeQuery: (stmt: string) => ex.execute(stmt),
    });
    expect(out.ok).toBe(false);
    expect(out.steps).toHaveLength(0);
    expect('passed' in out).toBe(false);
  });
});
