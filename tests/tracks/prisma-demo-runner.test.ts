import { describe, it, expect } from 'vitest';
import { executePrismaDemo } from '../../src/lib/prisma-engine/prisma-demo-runner';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

describe('Phase 4: Concept Theory Live Demo Runner', () => {
  it('executes a basic findMany query against the seeded universe', () => {
    const executor = new SqlExecutor();
    const res = executePrismaDemo({
      code: 'await prisma.user.findMany();',
      executor: { executeQuery: (sql: string) => executor.executeQuery(sql) },
    });

    expect(res.ok).toBe(true);
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.steps[0].sql).toContain('SELECT');
    expect(res.steps[0].sql).toContain('users');
    expect(Array.isArray(res.stitchedJson)).toBe(true);
    const users = res.stitchedJson as Array<{ id: number; name: string }>;
    expect(users.length).toBe(3);
    expect(users[0].name).toBe('Alex');
  });

  it('executes an include relation query and returns stitched in-memory JSON', () => {
    const executor = new SqlExecutor();
    const res = executePrismaDemo({
      code: 'await prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } });',
      executor: { executeQuery: (sql: string) => executor.executeQuery(sql) },
    });

    expect(res.ok).toBe(true);
    expect(res.steps.length).toBe(2);
    expect(res.steps[0].role).toBe('main');
    expect(res.steps[1].role).toBe('relation');
    expect(res.steps[1].label).toBe('include posts');

    const user = res.stitchedJson as {
      id: number;
      name: string;
      posts: Array<{ id: number; title: string }>;
    };
    expect(user.id).toBe(1);
    expect(user.name).toBe('Alex');
    expect(Array.isArray(user.posts)).toBe(true);
    expect(user.posts.length).toBe(2);
    expect(user.posts[0].title).toBe('Hello Prisma');
  });

  it('handles untranslatable code gracefully without throwing', () => {
    const executor = new SqlExecutor();
    const res = executePrismaDemo({
      code: 'const x = 42; console.log(x);',
      executor: { executeQuery: (sql: string) => executor.executeQuery(sql) },
    });

    expect(res.ok).toBe(false);
    expect(res.steps).toEqual([]);
    expect(typeof res.reason).toBe('string');
  });

  it('handles empty code input', () => {
    const executor = new SqlExecutor();
    const res = executePrismaDemo({
      code: '   ',
      executor: { executeQuery: (sql: string) => executor.executeQuery(sql) },
    });

    expect(res.ok).toBe(false);
    expect(res.steps).toEqual([]);
  });

  it('executes against custom schema definitions', () => {
    const executor = new SqlExecutor();
    // Pre-create the custom table in the executor
    executor.executeQuery('CREATE TABLE articles (id INTEGER, title TEXT);');
    executor.executeQuery('INSERT INTO articles (id, title) VALUES (1, "Prisma Engine Deep Dive");');

    const customSchema = `
model Article {
  id    Int    @id @default(autoincrement())
  title String
}
`;

    const res = executePrismaDemo({
      code: 'await prisma.article.findUnique({ where: { id: 1 } });',
      executor: { executeQuery: (sql: string) => executor.executeQuery(sql) },
      schemaSource: customSchema,
    });

    expect(res.ok).toBe(true);
    expect(res.steps.length).toBe(1);
    expect(res.steps[0].sql).toContain('articles');
    const article = res.stitchedJson as { id: number; title: string };
    expect(article.id).toBe(1);
    expect(article.title).toBe('Prisma Engine Deep Dive');
  });
});
