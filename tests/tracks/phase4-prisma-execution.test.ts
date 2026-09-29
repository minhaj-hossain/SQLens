import { describe, it, expect } from 'vitest';
import { PRISMA_TASK_SETUP_SQL } from '../../src/content/prisma/phase6-tasks';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { parsePrismaSchema, findModel } from '../../src/lib/prisma-engine/prisma-schema-parser';
import { generatePrismaSql } from '../../src/lib/prisma-engine/prisma-sql-generator';
import { executePrismaCode } from '../../src/lib/prisma-engine/prisma-proxy-executor';
import {
  gradePrismaCode,
  matchesPrismaErrorCode,
} from '../../src/lib/prisma-engine/prisma-execution';
import type { SeedContext } from '../../src/lib/prisma-engine/prisma-sql-generator';

const SCHEMA = parsePrismaSchema(`
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
`);

const SEED: SeedContext = {
  tables: {
    users: [
      { id: 1, name: 'Alex', email: 'alex@prisma.io' },
      { id: 2, name: 'Mina', email: 'mina@prisma.io' },
      { id: 3, name: 'Rafi', email: 'rafi@prisma.io' },
    ],
  },
  variables: { id: 1, email: 'mina@prisma.io', userId: 1 },
};

function fresh() {
  const ex = new SqlExecutor();
  const boot = ex.executeQuery(PRISMA_TASK_SETUP_SQL);
  expect(boot.success, boot.error).toBe(true);
  return ex;
}


describe('Phase 4 — Prisma execution engine', () => {
  it('parses schema.prisma models, columns, relations, enums', () => {
    expect(SCHEMA.models.map((m) => m.name).sort()).toEqual(['Post', 'User']);
    const user = findModel(SCHEMA, 'user')!;
    expect(user.columns).toEqual(['id', 'name', 'email']);
    expect(user.relations).toEqual(['posts']);
    expect(findModel(SCHEMA, 'Post')!.relations).toEqual(['author']);
    const withEnum = parsePrismaSchema('enum Role { ADMIN USER }');
    expect(withEnum.enums[0]).toEqual({ name: 'Role', values: ['ADMIN', 'USER'] });
    expect(parsePrismaSchema('(((unbalanced').models).toEqual([]);
    expect(findModel(SCHEMA, 'Nope')).toBeUndefined();
  });

  it('generates reads: select/where/orderBy/take+skip/operators', () => {
    const r1 = generatePrismaSql(
      'export async function f(id: number) { return await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } }); }',
      { schema: SCHEMA, seed: SEED },
    );
    expect(r1.ok).toBe(true);
    expect(r1.statements[0].sql).toBe('SELECT id, email FROM users WHERE id = 1;');

    const r2 = generatePrismaSql(
      "return await prisma.user.findMany({ where: { OR: [{ name: 'Alex' }, { email: { contains: 'mina' } }] }, orderBy: { id: 'desc' }, take: 2, skip: 1 });",
      { schema: SCHEMA },
    );
    expect(r2.ok).toBe(true);
    expect(r2.statements[0].sql).toBe(
      "SELECT id, name, email FROM users WHERE ((name = 'Alex') OR (email LIKE '%mina%')) ORDER BY id DESC LIMIT 2 OFFSET 1;",
    );

    const noSelect = generatePrismaSql('return await prisma.user.findMany();', {
      schema: SCHEMA,
    });
    expect(noSelect.statements[0].sql).toBe('SELECT id, name, email FROM users;');
  });

  it('generates writes: create/createMany/update/updateMany/upsert/delete/deleteMany', () => {
    const create = generatePrismaSql(
      "return await prisma.user.create({ data: { name: 'Rafi', email: 'rafi@prisma.io' } });",
      { schema: SCHEMA },
    );
    expect(create.statements[0].sql).toBe(
      "INSERT INTO users (name, email) VALUES ('Rafi', 'rafi@prisma.io');",
    );

    const many = generatePrismaSql(
      "return await prisma.user.createMany({ data: [{ name: 'A' }, { name: 'B', email: 'b@x.io' }] });",
      { schema: SCHEMA },
    );
    expect(many.statements[0].sql).toBe(
      "INSERT INTO users (name, email) VALUES ('A', NULL), ('B', 'b@x.io');",
    );

    const upd = generatePrismaSql(
      'return await prisma.user.update({ where: { id: 1 }, data: { name: { increment: 0 } } });',
      { schema: SCHEMA },
    );
    expect(upd.statements[0].sql).toBe('UPDATE users SET name = name + 0 WHERE id = 1;');

    const del = generatePrismaSql(
      "return await prisma.user.deleteMany({ where: { email: { endsWith: '@spam.io' } } });",
      { schema: SCHEMA },
    );
    expect(del.statements[0].sql).toBe("DELETE FROM users WHERE email LIKE '%@spam.io';");

    const upsert = generatePrismaSql(
      "return await prisma.user.upsert({ where: { id: 9 }, update: { name: 'X' }, create: { name: 'X', email: 'x@x.io' } });",
      { schema: SCHEMA },
    );
    expect(upsert.ok).toBe(true);
    expect(upsert.statements[0].sql).toBe("UPDATE users SET name = 'X' WHERE id = 9;");
  });
}); // ← closes 'Phase 4 — Prisma execution engine'

describe('Phase 4 — transactions, proxy, grading', () => {
  it('sequences $transaction array + interactive forms; fans out nested writes', () => {
    const tx = generatePrismaSql(
      "await prisma.$transaction([ prisma.user.update({ where: { id: 1 }, data: { name: 'A' } }), prisma.user.delete({ where: { id: 2 } }) ]);",
      { schema: SCHEMA },
    );
    expect(tx.ok).toBe(true);
    expect(tx.statements.map((s) => s.sql)).toEqual([
      "UPDATE users SET name = 'A' WHERE id = 1;",
      'DELETE FROM users WHERE id = 2;',
    ]);

    const nested = generatePrismaSql(
      'return await prisma.user.create({ data: { name, email, posts: { create: [{ title }] } } });',
      { schema: SCHEMA, seed: SEED },
    );
    expect(nested.ok).toBe(true);
    expect(nested.statements[0].sql).toContain('INSERT INTO users');
    expect(nested.statements[1].label).toBe('nested posts');
  });

  it('is honest about the untranslatable: snippets, select+include, cursors, bare deletes', () => {
    expect(generatePrismaSql('npx prisma migrate dev', {}).ok).toBe(false);
    expect(
      generatePrismaSql(
        'return await prisma.user.findUnique({ where: { id }, select: { id: true }, include: { posts: true } });',
        {},
      ).ok,
    ).toBe(false);
    expect(
      generatePrismaSql('return await prisma.user.findMany({ cursor: { id: 1 } });', {}).ok,
    ).toBe(false);
    expect(generatePrismaSql('return await prisma.user.deleteMany();', { schema: SCHEMA }).ok).toBe(
      false,
    );
  });

  it('proxy executor runs generated SQL on the real engine, stopping at first failure', () => {
    const ex = fresh();
    const out = executePrismaCode(
      "return await prisma.user.update({ where: { id: 1 }, data: { name: 'Alexandra' } });",
      ex,
      { schema: SCHEMA },
    );
    expect(out.ok).toBe(true);
    expect(out.success).toBe(true);
    expect(ex.executeQuery('SELECT name FROM users WHERE id = 1;').rows[0]).toEqual({
      name: 'Alexandra',
    });

    const bad = executePrismaCode('npx prisma migrate dev', fresh(), {});
    expect(bad.ok).toBe(false);
    expect(bad.steps).toEqual([]);
  });

  it('grades execution rules: row counts, snippets, custom validators, error codes', () => {
    const ex = fresh();
    const upd = executePrismaCode(
      "return await prisma.user.updateMany({ where: { name: 'Alex' }, data: { name: 'Alexandra' } });",
      ex,
      { schema: SCHEMA },
    );
    const updSql = upd.steps.map((s) => s.sql).join('\n');
    expect(
      gradePrismaCode('prisma.user.updateMany', { expectedRowCount: 1 }, upd.steps[0].result, updSql)
        .passed,
    ).toBe(true);
    expect(
      gradePrismaCode('prisma.user.updateMany', { expectedRowCount: 5 }, upd.steps[0].result, updSql)
        .passed,
    ).toBe(false);
    expect(
      gradePrismaCode(
        'code',
        { expectedResultSnippet: { name: 'Alexandra' } },
        ex.executeQuery('SELECT * FROM users WHERE id = 1;'),
        'SELECT * FROM users WHERE id = 1;',
      ).passed,
    ).toBe(true);
    expect(
      gradePrismaCode(
        'code',
        {
          customValidator: (_ast, result) => ({
            valid: (result as { rowCount: number }).rowCount === 3,
            message: 'want 3',
          }),
        },
        ex.executeQuery('SELECT * FROM users;'),
        'SELECT * FROM users;',
      ).passed,
    ).toBe(true);

    expect(matchesPrismaErrorCode('duplicate entry for unique `email`', 'P2002')).toBe(true);
    expect(matchesPrismaErrorCode('table users does not exist', 'P2002')).toBe(false);
    expect(matchesPrismaErrorCode('Record to update not found.', 'P2025')).toBe(true);
  });

  it('proxy substitutes param markers from the seed context, NULL for the unresolvable', () => {
    // `getId()` cannot resolve at translation time → marker → NULL at run time.
    const out = executePrismaCode(
      'return await prisma.user.findMany({ where: { id: getId() } });',
      fresh(),
      { schema: SCHEMA },
    );
    expect(out.ok).toBe(true);
    expect(out.success).toBe(true);
    expect(out.steps[0].sql).toBe('SELECT id, name, email FROM users WHERE id = NULL;');

    // Late-bound variable missing at translation, present at execution time.
    const late = executePrismaCode(
      'return await prisma.user.findMany({ where: { email } });',
      fresh(),
      { schema: SCHEMA, seed: { tables: {}, variables: { email: 'mina@prisma.io' } } },
    );
    expect(late.ok).toBe(true);
    expect(late.steps[0].sql).toBe(
      "SELECT id, name, email FROM users WHERE email = 'mina@prisma.io';",
    );
    expect(late.steps[0].result.rows).toHaveLength(1);
  });

  it('static-first: gradePrismaCode rejects bad shapes before touching the engine', () => {
    const rule = { targetModel: 'user', requiredMethod: 'findUnique' } as const;
    const res = fresh().executeQuery('SELECT 1;');
    expect(gradePrismaCode('prisma.user.findMany()', rule, res, 'SELECT 1;').passed).toBe(false);
    expect(
      gradePrismaCode('prisma.user.findUnique({ where: { id } })', rule, res, 'SELECT 1;').passed,
    ).toBe(true);
  });
});
