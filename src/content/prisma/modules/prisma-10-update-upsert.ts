import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

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
      theory: richPrismaTheory({
        summary:
          '`update()` requires a unique selector (`where`) and returns the mutated row. `updateMany()` accepts any filter, updates all matching rows, and returns a `{ count: number }`. For concurrency-safe math without race conditions, pass atomic operators like `{ increment: n }` in `data`.',
        takeaway:
          'update requires a unique key; updateMany updates behind a filter; atomic math prevents lost-update race conditions.',
        sql: "UPDATE users\nSET name = 'Alexandra'\nWHERE id = 1\nRETURNING id, name;",
        heroCode:
          'const user = await prisma.user.update({\n  where: { id: 1 },\n  data: { loginCount: { increment: 1 } },\n  select: { id: true, loginCount: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'Atomic increment rewrites to `login_count = login_count + 1` in SQL, keeping counter writes concurrency-safe.',
        mentalModel:
          '**Targeted Row Mutation vs Batch Transformations.** When updating an individual entity, `prisma.user.update()` targets an exact unique identifier and returns the updated model. When running bulk operations, `updateMany()` touches zero, one, or thousands of rows in a single UPDATE query without throwing if none match. Concurrency conflicts on counters are avoided by delegating math to the database engine via atomic operators.',
        littleDetails: {
          title: 'Update Rules & Atomic Safety',
          rules: [
            {
              ruleNumber: 1,
              title: 'update requires a unique selector',
              description: 'The `where` clause of `update()` only accepts fields marked `@id` or `@unique`. Attempting to filter on non-unique fields causes a TypeScript compile error (`UserWhereUniqueInput`).',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 2,
              title: 'updateMany returns count only and lacks nested writes',
              description: '`updateMany()` executes a single batch UPDATE and returns `{ count: number }`. Because it modifies an arbitrary row set, it cannot return hydrated records or execute nested relation mutations.',
              badge: 'Return Type',
            },
            {
              ruleNumber: 3,
              title: 'Use atomic operators to eliminate lost updates',
              description: 'Consider an account with $60 balance receiving two concurrent $50 debit requests. In a naive read-check-write flow in JavaScript: both requests read balance = $60 concurrently, both pass the "balance >= 50" check, both compute new balance = 60 - 50 = $10, and both write $10. The sender ends with $10 while the recipient received $100 ($50 created out of thin air)! In Prisma, passing atomic operators ({ decrement: 50 }) delegates calculation directly to the SQL engine (SET balance = balance - 50), preventing check-then-act lost updates.',
              badge: 'Concurrency',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Mutation vs SQL Equivalent',
          mappings: [
            {
              prisma: 'prisma.user.update({ where: { id: 1 }, data: { name: "Alex" } })',
              sql: "UPDATE users SET name = 'Alex' WHERE id = 1 RETURNING *;",
              note: 'Targets unique row; throws P2025 if missing',
            },
            {
              prisma: 'prisma.user.updateMany({ where: { role: "GUEST" }, data: { active: false } })',
              sql: "UPDATE users SET active = false WHERE role = 'GUEST';",
              note: 'Returns affected row count',
            },
            {
              prisma: 'data: { views: { increment: 1 } }',
              sql: 'SET views = views + 1',
              note: 'Atomic in-database arithmetic',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Do I have a unique key and need the updated record back?',
              answer: 'Use `prisma.user.update()`. If the record does not exist, it safely throws P2025 (Record to update not found).',
            },
            {
              questionNumber: 2,
              question: 'Do I need to update 0, 1, or many rows based on criteria without throwing if zero match?',
              answer: 'Use `prisma.user.updateMany()`. It returns `{ count: number }` indicating how many rows matched and were altered.',
            },
            {
              questionNumber: 3,
              question: 'Am I modifying a counter, inventory balance, or metric under concurrent traffic?',
              answer: 'Pass `{ increment: n }` or `{ decrement: n }` in `data` to let the database calculate the new value atomically.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Targeted Single-Row Mutation',
            codeSnippet: "UPDATE users\nSET name = 'Alexandra'\nWHERE id = 1\nRETURNING id, name;",
            explanation:
              'A single-row update requires targeting a primary key or unique index. The return value is the fully updated record shaped by your `select` projection.',
            visualData: {
              type: 'sql_lens',
              title: 'Targeted Update',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Batch Update with Filter',
            codeSnippet: "UPDATE users\nSET name = 'Alexandra'\nWHERE name = 'Alex';",
            explanation:
              'Batch updates do not throw if no rows match — they simply return `{ count: 0 }`. Always verify the filter logic first before running bulk mutations.',
            visualData: {
              type: 'sql_lens',
              title: 'Batch Update Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Atomic Arithmetic Execution',
            codeSnippet: 'UPDATE users\nSET login_count = login_count + 1\nWHERE id = 1\nRETURNING id;',
            explanation:
              'Delegating arithmetic to the SQL engine prevents read-modify-write race conditions where concurrent requests overwrite each other.',
            visualData: {
              type: 'sql_lens',
              title: 'Atomic Arithmetic Update',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c1-t1',
          title: 'Rename one user',
          description: 'Change user 1\'s name and return id + name only.',
          instructions: ['Use `prisma.user.update`', '`where: { id: 1 }`', 'Select `id` and `name`'],
          hintLadder: [
            'Updating single records requires a unique key in where so Prisma can ensure exactly one row is modified.',
            'Call prisma.user.update with where id, data name, and select id, name.',
            'Update single row: return await prisma.user.update({ where: { id }, data: { name }, select: { id: true, name: /* boolean flag */ } });',
          ],
          scaffold: '-- The row you are about to change:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Reading the row first is how you know the update hit exactly one.',
          cols: ['id', 'name'],
          select: ['id', 'name'],
          method: 'update',
          // Task 0.2: bind `name` so the reference renders `SET name = 'Alexandra'`.
          demoVariables: { name: 'Alexandra' },
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
          hintLadder: [
            'Batch updates execute a bulk UPDATE across all matching records and return the total modified count.',
            'Call prisma.user.updateMany passing the filter predicate in where and the changes in data.',
            'Update matching rows: return await prisma.user.updateMany({ where: { name: \'Alex\' }, data: { name: /* new name */ } });',
          ],
          scaffold: '-- Which rows would this batch update touch?\nSELECT id FROM users WHERE id = 99;',
          solutionSql: "SELECT id FROM users WHERE name = 'Alex';",
          why: 'The lens is the `where` of the batch update: one row matched.',
          cols: ['id'],
          select: [],
          method: 'updateMany',
          rows: 1,
          code0:
            'export async function renameAll() {\n  return await prisma.user.updateMany({\n    where: {},\n    data: { name: \'Alexandra\' },\n  });\n}',
          code1:
            'export async function renameAll() {\n  return await prisma.user.updateMany({\n    where: { name: \'Alex\' },\n    data: { name: \'Alexandra\' },\n  });\n}',
          rtype: '{ count: number }',
        }),
        prismaSnippetTask({
          id: 'prisma10-c1-t3',
          title: 'Atomic numeric increment on a domain counter',
          description:
            'Increment a domain counter atomically in the database without read-modify-write race conditions. Never apply numeric increments to surrogate primary keys; use them on metrics, view counters, or inventory balances.',
          instructions: [
            'Use `prisma.user.update`',
            '`where: { id: 1 }`',
            'Increment `loginCount` by 1 using `{ increment: 1 }`',
            'Select `id` and `loginCount`',
          ],
          hintLadder: [
            'Atomic operators instruct the database engine to perform arithmetic in SQL, eliminating concurrent read-modify-write lost updates.',
            'Inside data, set loginCount to an object with increment: 1.',
            'Increment counter atomically: return await prisma.user.update({ where: { id }, data: { loginCount: { increment: /* numeric step */ } }, select: { id: true, loginCount: true } });',
          ],
          scaffold: '-- The user before the counter update:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Atomic increment rewrites to login_count = login_count + 1 in SQL so concurrent updates cannot collide. Apply this pattern to business counters (views, login counts, inventory) rather than primary keys.',
          cols: ['id', 'name'],
          rows: 1,
          setupSql:
            'CREATE TABLE users (id INTEGER, name TEXT, email TEXT, loginCount INTEGER); ' +
            'INSERT INTO users (id, name, email, loginCount) VALUES ' +
            "(1, 'Alex', 'alex@prisma.io', 0), (2, 'Mina', 'mina@prisma.io', 0), (3, 'Rafi', 'rafi@prisma.io', 0);",
          schemaSource:
            'model User {\n  id         Int    @id @default(autoincrement())\n  name       String\n  email      String @unique\n  loginCount Int    @default(0)\n}',
          code0:
            'export async function bumpUserLoginCount(id: number) {\n  // Anti-pattern: hardcoding the value or reading then writing causes lost updates\n  return await prisma.user.update({\n    where: { id },\n    data: { loginCount: 2 },\n    select: { id: true, loginCount: true },\n  });\n}',
          code1:
            'export async function bumpUserLoginCount(id: number) {\n  return await prisma.user.update({\n    where: { id },\n    data: { loginCount: { increment: 1 } },\n    select: { id: true, loginCount: true },\n  });\n}',
          need: ['prisma.user.update', 'loginCount: { increment: 1 }'],
          rtype: '{ id: number; loginCount: number }',
        }),
      ],
    },
    {
      id: 'upsert-idempotent',
      order: 2,
      title: 'Idempotent Writes with upsert()',
      shortDescription: 'One statement that inserts or updates, depending on what it finds.',
      theory: richPrismaTheory({
        summary:
          '`upsert()` checks for an existing record by a unique key: if found, it executes `update`; if missing, it executes `create`. Because both operations are defined atomically in a single statement, replaying webhooks or seeding scripts is completely idempotent and immune to duplicate key conflicts.',
        takeaway:
          'upsert = unique key + update branch + create branch; safe for replays and webhook ingestion.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        heroCode:
          'const user = await prisma.user.upsert({\n  where: { email },\n  update: {},\n  create: { name, email },\n});',
        heroLang: 'typescript',
        heroWhy: '`update: {}` is the idiom for "create if missing, otherwise leave untouched".',
        mentalModel:
          '**Conditional Convergence.** In distributed systems and asynchronous event processing (e.g. Stripe webhooks), requests may arrive multiple times or out of order. `upsert()` guarantees that regardless of whether the record already exists, the database converges to the desired state in a single query without race conditions.',
        littleDetails: {
          title: 'Upsert Rules & Idempotency',
          rules: [
            {
              ruleNumber: 1,
              title: 'where requires a unique key',
              description: 'Just like `update()`, `upsert()` requires a unique identifier (primary key `@id` or `@unique` column/composite). The database needs this to evaluate `ON CONFLICT`.',
              badge: 'Constraint',
            },
            {
              ruleNumber: 2,
              title: 'Empty update: {} yields insert-or-ignore',
              description: 'Passing `update: {}` creates the record if absent, but leaves existing data untouched if already present. This corresponds to `ON CONFLICT DO NOTHING`.',
              badge: 'Pattern',
            },
            {
              ruleNumber: 3,
              title: 'Required fields must be satisfied in create',
              description: 'The `create` branch must supply all non-optional, non-default fields for the model, even if the `update` branch only modifies a single field.',
              badge: 'Validation',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Upsert vs SQL ON CONFLICT',
          mappings: [
            {
              prisma: 'prisma.user.upsert({ where: { email }, update: { name }, create: { name, email } })',
              sql: 'INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *;',
              note: 'Atomic insert or update in one round trip',
            },
            {
              prisma: 'prisma.user.upsert({ where: { email }, update: {}, create: { name, email } })',
              sql: 'INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING *;',
              note: 'Insert-or-ignore idempotency',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why not run findUnique() first, followed by create() or update() in application code?',
              answer: 'A read-then-write approach creates a concurrency race condition: two parallel requests can both see null and both attempt INSERT, causing a P2002 unique constraint violation. Upsert executes atomically in the database.',
            },
            {
              questionNumber: 2,
              question: 'When should I use update: {} with nothing inside?',
              answer: 'When your goal is "ensure this entity exists in the table" without overriding any subsequent edits made to the record.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define the Unique Identifier',
            codeSnippet: 'where: { email: "mina@prisma.io" }',
            explanation:
              'The where criteria must pinpoint at most one row. This maps directly to the conflict target of the underlying database.',
            visualData: {
              type: 'type_preview',
              title: 'Unique Key Selector',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Define the Insert Fallback',
            codeSnippet: "INSERT INTO users (name, email)\nVALUES ('Mina', 'mina@prisma.io')\nON CONFLICT (email) DO NOTHING;",
            explanation:
              'If the lookup fails, Prisma executes an INSERT with this data. All required non-default fields must be present.',
            visualData: {
              type: 'sql_lens',
              title: 'Insert Branch Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Define the Conflict Mutation',
            codeSnippet: "INSERT INTO users (name, email)\nVALUES ('Mina', 'mina@prisma.io')\nON CONFLICT (email) DO UPDATE SET name = 'Mina'\nRETURNING id, email;",
            explanation:
              'If a record with matching unique criteria already exists, Prisma executes an UPDATE with this data instead of failing.',
            visualData: {
              type: 'sql_lens',
              title: 'Conflict Update Branch Query',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c2-t1',
          title: 'Insert-or-leave',
          description: 'Create the user only if that email is free.',
          instructions: ['Use `prisma.user.upsert`', '`where: { email }`', 'Select `id` and `email`'],
          hintLadder: [
            'Passing an empty update object to upsert creates the record if absent while leaving existing data intact.',
            'Use prisma.user.upsert specifying where email, update: {}, and create: { name, email }.',
            'Insert or ignore: return await prisma.user.upsert({ where: { email }, update: {}, create: { name, email }, select: { id: true, email: /* boolean flag */ } });',
          ],
          scaffold: '-- The row upsert resolves to:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Either branch ends with exactly this row in the table.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'upsert',
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
          hintLadder: [
            'Idempotent synchronization requires defining what happens when the record already exists via the update branch.',
            'Add update: { name } alongside where: { email } and create in the upsert options.',
            'Supply the update branch: return await prisma.user.upsert({ where: { email }, update: { name: /* updated field */ }, create: { name, email } });',
          ],
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
          // Task 0.2: `update: { name }` must render a real value, not NULL.
          demoVariables: { name: 'Alexandra' },
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
          hintLadder: [
            'Idempotent writes converge to the desired record state regardless of whether the record already exists, preventing duplicate key errors.',
            'Call prisma.user.upsert with where email, update: { name }, create: { name, email }, and select id, email.',
            'Build the upsert call: return await prisma.user.upsert({ where: { email }, update: { name }, create: { name, email }, select: { id: true, email: /* boolean flag */ } });',
          ],
          fromScratch: true,
          scaffold: '-- The row a replay resolves to:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Replaying the same payload leaves the table untouched.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          noCols: ['name'],
          method: 'upsert',
          // Task 0.2: upsert's `update: { name }` branch must render a real value.
          demoVariables: { name: 'Rafi', email: 'rafi@prisma.io' },
          rows: 1,
          code0:
            'export async function reconcile(name: string, email: string) {\n  // Write idempotent upsert query from scratch:\n\n}',
          code1:
            'export async function reconcile(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: { name },\n    create: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma10-hw-2',
          title: 'Diagnostic Repair — Non-Unique Selector Rejection',
          description:
            'The following sync utility fails to compile with a TypeScript/Prisma error: "Property \'name\' does not exist in type \'UserWhereUniqueInput\'". Diagnose why Prisma rejects the selector and repair the query to use a valid unique criteria.',
          instructions: [
            'Diagnose why `where: { name }` is rejected by the compiler',
            'Repair the selector to target the unique `email` field',
          ],
          hintLadder: [
            'Prisma upsert requires a unique selector so the database can target a specific unique index for conflict resolution.',
            'Change where: { name } to where: { email } because email is unique in the schema.',
            'Fix the selector: return await prisma.user.upsert({ where: { email: /* unique field */ }, update: { name }, create: { name, email } });',
          ],
          scaffold: '-- Repaired upsert resolves to this record:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Prisma Client enforces database unique constraints at compile-time to prevent ambiguous multi-row updates.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function syncMember(name: string, email: string) {\n  // BUG: TypeScript error — name is not a unique input selector\n  return await prisma.user.upsert({\n    where: { name },\n    update: { name },\n    create: { name, email },\n  });\n}',
          code1:
            'export async function syncMember(name: string, email: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: { name },\n    create: { name, email },\n  });\n}',
          need: ['where: { email }', 'update: { name }', 'create: { name, email }'],
          ban: ['where: { name }'],
          demoVariables: { name: 'Alex', email: 'alex@prisma.io' },
        }),
        type: 'challenge',
      },
    ],
  },
};
