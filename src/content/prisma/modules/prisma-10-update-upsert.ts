import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 10 — update(), updateMany() & upsert(). */
export const Prisma_10_MODULE: ModuleData = {
  id: 'prisma-10',
  slug: 'update-updateMany-upsert',
  day: 10,
  title: 'Day 10 — update(), updateMany() & upsert()',
  shortTitle: 'Updating Data',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-3',
  description: 'Change single rows, batch edits with a filter, and make writes idempotent with upsert.',
  estimatedMinutes: 55,
  curriculumOrder: 10,
  displayLabel: 'Day 10',
  completionLearnings: [
    'Update one row by its unique key',
    'Batch updates with `updateMany` and prove the filter first',
    'Do arithmetic atomically with `increment`',
    'Make a write idempotent with `upsert`',
  ],
  concepts: [
    {
      id: 'update-atomic',
      order: 1,
      title: 'Updating Rows — update() & updateMany()',
      shortDescription: 'One row by unique key, or every row the filter matches.',
      theory: prismaTheory(
        '`update()` needs a unique `where` and returns the changed row. `updateMany()` takes any filter and returns a count — so the safest habit is to read the `where` as a SELECT first, exactly like the SQL lens does.',
        'update = unique key + returned row; updateMany = filter + count.',
        'SELECT id, name\nFROM users\nWHERE id = 1;',
        'await prisma.user.update({\n  where: { id: 1 },\n  data: { name: \'Alexandra\' },\n  select: { id: true, name: true },\n});',
        'typescript',
        'One UPDATE on the primary key, and `select` shapes what comes back.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c1-t1',
          title: 'Rename one user',
          description: 'Change user 1\'s name and return id + name only.',
          instructions: ['Use `prisma.user.update`', '`where: { id: 1 }`', 'Select `id` and `name`'],
          hint: 'A single-row update needs a unique `where`.',
          scaffold: '-- The row you are about to change:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Reading the row first is how you know the update hit exactly one.',
          cols: ['id', 'name'],
          select: ['id', 'name'],
          method: 'update',
          generatedSql: "UPDATE users SET name = 'Alexandra' WHERE id = 1;",
          rows: 1,
          code0:
            'export async function rename(id: number, name: string) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function rename(id: number, name: string) {\n  return await prisma.user.update({\n    where: { id },\n    data: { name },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string }',
        }),
        prismaReadTask({
          id: 'prisma10-c1-t2',
          title: 'Batch edit behind a filter',
          description: 'Update every user called Alex — prove the filter first.',
          instructions: ['Use `prisma.user.updateMany`', 'Filter with `where: { name: "Alex" }`'],
          hint: 'Read the `where` as a SELECT before running the batch update.',
          scaffold: '-- Which rows would this batch update touch?\nSELECT id FROM users WHERE id = 99;',
          solutionSql: "SELECT id FROM users WHERE name = 'Alex';",
          why: 'The lens is the `where` of the batch update: one row matched.',
          cols: ['id'],
          select: [],
          method: 'updateMany',
          generatedSql: "UPDATE users SET name = 'Alexandra' WHERE name = 'Alex';",
          rows: 1,
          code0:
            'export async function renameAll() {\n  return await prisma.user.updateMany({\n    where: {},\n    data: { name: \'Alexandra\' },\n  });\n}',
          code1:
            'export async function renameAll() {\n  return await prisma.user.updateMany({\n    where: { name: \'Alex\' },\n    data: { name: \'Alexandra\' },\n  });\n}',
          rtype: '{ count: number }',
        }),
      ],
    },
    {
      id: 'upsert-idempotent',
      order: 2,
      title: 'Idempotent Writes with upsert()',
      shortDescription: 'One statement that inserts or updates, depending on what it finds.',
      theory: prismaTheory(
        '`upsert()` looks up a unique key and then either runs `update` or `create`. Because both branches live in one statement, a retried request cannot produce a duplicate — which is what makes webhooks and seeders safe.',
        'upsert = unique key + update branch + create branch.',
        "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        'await prisma.user.upsert({\n  where: { email },\n  update: {},\n  create: { name, email },\n});',
        'typescript',
        '`update: {}` is the trick for "create if missing, otherwise leave it alone".',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c2-t1',
          title: 'Insert-or-leave',
          description: 'Create the user only if that email is free.',
          instructions: ['Use `prisma.user.upsert`', '`where: { email }`', 'Select `id` and `email`'],
          hint: 'An empty `update: {}` makes the second run a no-op.',
          scaffold: '-- The row upsert resolves to:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Either branch ends with exactly this row in the table.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'upsert',
          generatedSql:
            "INSERT INTO users (id, name, email) VALUES (2, 'Mina', 'mina@prisma.io');",
          rows: 1,
          code0:
            'export async function ensureUser(name: string, email: string) {\n  return await prisma.user.create({\n    data: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function ensureUser(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: {},\n    create: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaSnippetTask({
          id: 'prisma10-c2-t2',
          title: 'Give the update branch a body',
          description: 'The upsert currently has no update branch, so it is not idempotent.',
          instructions: ['Add `update: { name }`', 'Keep the unique `where` on email'],
          hint: 'An upsert without `update` cannot be replayed.',
          scaffold: '-- Both branches land on the same row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'name is refreshed on every replay, email stays the identity.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function syncUser(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    create: { name, email },\n  });\n}',
          code1:
            'export async function syncUser(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: { name },\n    create: { name, email },\n  });\n}',
          need: ['update: { name }', 'where: { email }'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma10-challenge',
    title: 'Final Challenge — Inventory Reconciliation',
    scenario: 'Replay a payload without duplicating or leaking columns.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma10-hw-1',
          title: 'Replayable write',
          description: 'Upsert by email and return id + email only.',
          instructions: ['Use `prisma.user.upsert`', 'Select `id` and `email`'],
          hint: 'Unique `where`, `update` branch, `create` branch — all three.',
          scaffold: '-- The row a replay resolves to:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Replaying the same payload leaves the table untouched.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          noCols: ['name'],
          method: 'upsert',
          generatedSql:
            "INSERT INTO users (id, name, email) VALUES (3, 'Rafi', 'rafi@prisma.io');",
          rows: 1,
          code0:
            'export async function reconcile(name: string, email: string) {\n  return await prisma.user.update({\n    where: { email },\n    data: { name },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function reconcile(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: { name },\n    create: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        type: 'challenge',
      },
    ],
  },
};
