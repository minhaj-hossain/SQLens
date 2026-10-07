import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 10 — Updating, Upserting & Deleting (Phase 5: Mutations & Writes).
 *
 * Pedagogical Sequence:
 *   Concept 1: Targeted Updates & Atomic Operators (update, updateMany, increment)
 *   Concept 2: Idempotent Writes with upsert()
 *   Concept 3: Record Deletion — delete() and deleteMany()
 *   Challenge: Inventory / Profile Reconciliation & Selector Diagnostics
 */
export const Prisma_10_MODULE: ModuleData = {
  id: 'prisma-10',
  slug: 'updating-and-deleting',
  day: 10,
  title: 'Day 10 — Updating, Upserting & Deleting',
  shortTitle: 'Updating & Deleting',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-5',
  description:
    'Change individual records safely by unique key, batch edits with filters, eliminate lost updates using atomic operators, achieve idempotency with upsert, and perform clean deletions.',
  estimatedMinutes: 55,
  curriculumOrder: 10,
  displayLabel: 'Day 10',
  completionLearnings: [
    'Update a single row by unique selector and shape return attributes using select',
    'Batch updates with updateMany and avoid table-wide unconstrained mutations',
    'Perform concurrency-safe math using atomic operators like increment',
    'Ensure webhook replay idempotency using upsert() with create and update branches',
    'Distinguish single-record deletion with delete() from bulk pruning with deleteMany()',
  ],
  concepts: [
    {
      id: 'update-atomic',
      order: 1,
      title: 'Targeted Updates & Atomic Operators — update() & updateMany()',
      shortDescription: 'One row by unique key, or every row the filter matches, with concurrency-safe math.',
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
              description: 'In a naive read-check-write flow in JavaScript: two concurrent requests read counter = 10, both increment to 11 in memory, and both write 11 (lost update). Passing `{ increment: 1 }` delegates calculation directly to the SQL engine (`login_count = login_count + 1`), preventing lost updates.',
              badge: 'Concurrency',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Updates to SQL Statements',
          mappings: [
            {
              prisma: 'prisma.user.update({ where: { id: 1 }, data: { name: "Alexandra" } })',
              sql: 'UPDATE users SET name = $1 WHERE id = 1 RETURNING *;',
              note: 'Point update targeting unique primary key.',
            },
            {
              prisma: 'prisma.user.update({ where: { id: 1 }, data: { loginCount: { increment: 1 } } })',
              sql: 'UPDATE users SET login_count = login_count + 1 WHERE id = 1;',
              note: 'Atomic in-database increment preventing race conditions.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use update vs updateMany?',
              answer: 'Use `update` when modifying an entity by its primary key or unique attribute and you need the updated record back. Use `updateMany` for batch status updates across multiple rows.',
            },
            {
              questionNumber: 2,
              question: 'How do I increment a view count or inventory without race conditions?',
              answer: 'Always use atomic operators: `{ increment: 1 }` or `{ decrement: 1 }`. Never read the value in JavaScript, add 1, and write it back.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define unique selector and update payload',
            codeSnippet: "await prisma.user.update({\n  where: { id: 1 },\n  data: { name: 'Alexandra' },\n  select: { id: true, name: true },\n});",
            explanation: 'The where block uniquely identifies the row; data carries the modifications.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Database executes targeted UPDATE',
            codeSnippet: "UPDATE users SET name = 'Alexandra' WHERE id = 1 RETURNING id, name;",
            explanation: 'The query engine updates the row and returns the requested projection.',
            visualData: {
              type: 'sql_lens',
              title: 'Updated Record View',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Apply atomic arithmetic for concurrent counters',
            codeSnippet: 'data: { loginCount: { increment: 1 } }',
            explanation: 'Delegates arithmetic directly to SQL without reading first.',
            visualData: {
              type: 'type_preview',
              title: 'Atomic Math Contract',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c1-t1',
          title: 'Update Single User: Change a member name by unique ID',
          description: 'Update user 1 with a new name and return id + name only.',
          instructions: ['Use `prisma.user.update`', 'Select `id` and `name`'],
          hintLadder: [
            'The update method takes a unique where selector and a data payload to apply the change.',
            'Target id: 1 in where and provide name in data, selecting id and name.',
            'Shape the update call: return await prisma.user.update({ where: { id: 1 }, data: { name }, select: { id: true, name: /* boolean flag */ } });',
          ],
          scaffold: '-- Which row would this update touch?\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'The lens isolates the single row your update modified.',
          cols: ['id', 'name'],
          select: ['id', 'name'],
          method: 'update',
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
          title: 'Batch Rename: Update all users matching a filter',
          description: 'Rename all users named Alex to Alexandra.',
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
          title: 'Concurrency-Safe Counter: Atomically increment user login count',
          description:
            'Increment a domain counter atomically in the database without read-modify-write race conditions.',
          instructions: [
            'Use `prisma.user.update`',
            '`where: { id }`',
            'Increment `loginCount` by 1 using `{ increment: 1 }`',
            'Select `id` and `loginCount`',
          ],
          hintLadder: [
            'Atomic operators instruct the database engine to perform arithmetic in SQL, eliminating concurrent read-modify-write lost updates.',
            'Inside data, set loginCount to an object with increment: 1.',
            'Increment counter atomically: return await prisma.user.update({ where: { id }, data: { loginCount: { increment: 1 } }, select: { id: true, loginCount: true } });',
          ],
          scaffold: '-- The user before the counter update:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Atomic increment rewrites to login_count = login_count + 1 in SQL so concurrent updates cannot collide.',
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
          'const user = await prisma.user.upsert({\n  where: { email },\n  update: { name },\n  create: { name, email },\n});',
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
              title: 'Empty update object creates or ignores',
              description: 'Passing `update: {}` performs an insert-or-ignore operation, ensuring an initial record exists without overwriting any existing modifications.',
              badge: 'Pattern',
            },
            {
              ruleNumber: 3,
              title: 'Create branch requires all non-nullable columns',
              description: 'The `create` branch must supply all required fields for model instantiation, while the `update` branch only supplies the fields to be changed.',
              badge: 'Schema Contract',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma upsert() to SQL ON CONFLICT',
          mappings: [
            {
              prisma: 'prisma.user.upsert({ where: { email }, update: { name }, create: { name, email } })',
              sql: 'INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = $1 RETURNING *;',
              note: 'Atomic insert-or-update in a single SQL round trip.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use upsert instead of create?',
              answer: 'Use `upsert` whenever a write might be re-executed with the same unique identifier, such as incoming webhook retries, OAuth logins, or seed scripts.',
            },
            {
              questionNumber: 2,
              question: 'What if I only want to create the record if missing, and do nothing if it already exists?',
              answer: 'Pass `update: {}` (an empty object) in the update branch.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define unique selector',
            codeSnippet: 'where: { email: "mina@prisma.io" }',
            explanation: 'The lookup selector must resolve to at most one record in the database.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Provide update and create branches',
            codeSnippet: "update: { name: 'Mina' },\ncreate: { name: 'Mina', email: 'mina@prisma.io' }",
            explanation: 'Declares what happens when the record is found versus when it is missing.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Execute atomic upsert',
            codeSnippet: 'INSERT INTO users ... ON CONFLICT (email) DO UPDATE ...;',
            explanation: 'Converges the database state in a single query.',
            visualData: {
              type: 'sql_lens',
              title: 'Upsert Result View',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c2-t1',
          title: 'Insert or Ignore: Ensure user exists without overwriting existing data',
          description: 'Create the user only if that email is free; otherwise leave existing data untouched.',
          instructions: ['Use `prisma.user.upsert`', '`where: { email }`', 'Select `id` and `email`'],
          hintLadder: [
            'Passing an empty update object to upsert creates the record if absent while leaving existing data intact.',
            'Use prisma.user.upsert specifying where email, update: {}, and create: { name, email }.',
            'Insert or ignore: return await prisma.user.upsert({ where: { email }, update: {}, create: { name, email }, select: { id: true, email: true } });',
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
          title: 'Synchronize Member: Update profile name on conflict in upsert',
          description: 'Make upsert update the name when the user already exists.',
          instructions: ['Add `update: { name }`', 'Keep the unique `where` on email'],
          hintLadder: [
            'Idempotent synchronization requires defining what happens when the record already exists via the update branch.',
            'Add update: { name } alongside where: { email } and create in the upsert options.',
            'Supply the update branch: return await prisma.user.upsert({ where: { email }, update: { name }, create: { name, email } });',
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
          demoVariables: { name: 'Alexandra' },
        }),
      ],
    },
    {
      id: 'record-deletion',
      order: 3,
      title: 'Record Deletion — delete() & deleteMany()',
      shortDescription: 'Remove single rows by unique key or clean up collections with filters.',
      theory: richPrismaTheory({
        summary:
          '`delete()` requires a unique selector (`where`) and returns the deleted record. If no matching record is found, it throws a `P2025` error. `deleteMany()` accepts general filters, removes all matching records, and returns `{ count: number }` without throwing if zero records match.',
        takeaway:
          'delete() throws P2025 if missing; deleteMany() returns { count: number } and never throws on empty match.',
        sql: "SELECT id FROM users WHERE email LIKE '%spam%';",
        heroCode:
          '// Point delete (throws P2025 if missing)\nconst deleted = await prisma.user.delete({\n  where: { id: 1 },\n  select: { id: true, email: true },\n});\n\n// Bulk delete (returns count, safe on zero matches)\nconst { count } = await prisma.user.deleteMany({\n  where: { email: { contains: "spam" } },\n});',
        heroLang: 'typescript',
        heroWhy: 'delete() returns the deleted entity; deleteMany() returns the affected row count.',
        mentalModel:
          '**Deterministic Removal vs Bulk Pruning.** Use `delete()` when handling single-resource API routes (e.g. `DELETE /api/users/:id`), catching `P2025` to return a 404 response. Use `deleteMany()` for background maintenance jobs, cleanup tasks, or clearing test databases where zero matching records is expected.',
        littleDetails: {
          title: 'Deletion Rules & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'delete requires unique selector',
              description: 'Just like `update()`, `delete()` only accepts unique fields (`@id` or `@unique`). Passing non-unique fields causes a compile-time TypeScript error.',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 2,
              title: 'deleteMany never throws P2025',
              description: 'If no rows match the filter in `deleteMany()`, the call succeeds and returns `{ count: 0 }`.',
              badge: 'Error Invariant',
            },
            {
              ruleNumber: 3,
              title: 'Referential integrity on child records',
              description: 'Deleting a parent record with existing children will fail with error `P2003` unless the relation schema specifies `onDelete: Cascade` or children are deleted first.',
              badge: 'Referential',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Delete to SQL Statements',
          mappings: [
            {
              prisma: 'prisma.user.delete({ where: { id: 1 }, select: { id: true } })',
              sql: 'DELETE FROM users WHERE id = 1 RETURNING id;',
              note: 'Point delete returning projected attributes.',
            },
            {
              prisma: 'prisma.user.deleteMany({ where: { name: "Alex" } })',
              sql: 'DELETE FROM users WHERE name = $1;',
              note: 'Bulk deletion returning affected row count.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'How do I handle deleting a resource that might already be deleted?',
              answer: 'If you use `delete()`, catch `PrismaClientKnownRequestError` with code `P2025` and return a 404. Alternatively, `deleteMany()` will not throw.',
            },
            {
              questionNumber: 2,
              question: 'Can I select returned fields from deleteMany()?',
              answer: 'No. `deleteMany()` returns only `{ count: number }`.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define deletion criteria',
            codeSnippet: 'await prisma.user.delete({ where: { id: 1 } });',
            explanation: 'Targets the record by its unique primary key.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Database executes DELETE statement',
            codeSnippet: 'DELETE FROM users WHERE id = 1 RETURNING id, email;',
            explanation: 'Removes the record and returns the selected fields.',
            visualData: {
              type: 'sql_lens',
              title: 'Deleted Record Return',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Execute bulk pruning with filter',
            codeSnippet: 'const { count } = await prisma.user.deleteMany({ where: { email: { contains: "spam" } } });',
            explanation: 'Prunes all matching records in a single query.',
            visualData: {
              type: 'type_preview',
              title: 'Bulk Deletion Result',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma10-c3-t1',
          title: 'Point Deletion: Remove a user by unique ID and return proof',
          description: 'Delete user 1 and return their id and email.',
          instructions: ['Call `await prisma.user.delete()`', '`where: { id: 1 }`', 'Select `id` and `email`'],
          hintLadder: [
            'Use prisma.user.delete with where: { id: 1 }.',
            'Select id and email to return the removed record.',
            'Write: `return await prisma.user.delete({ where: { id: 1 }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- The user before removal:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'delete() returns the removed record according to your select projection.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'delete',
          rows: 1,
          code0:
            'export async function removeUser(id: number) {\n  // Delete user by id:\n\n}',
          code1:
            'export async function removeUser(id: number) {\n  return await prisma.user.delete({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaSnippetTask({
          id: 'prisma10-c3-t2',
          title: 'Bulk Cleanup: Prune inactive records with deleteMany()',
          description: 'Delete all users matching the name "Alex" using deleteMany.',
          instructions: [
            'Call `await prisma.user.deleteMany()`',
            'Filter with `where: { name: "Alex" }`',
            'Return the result object',
          ],
          hintLadder: [
            'Use prisma.user.deleteMany with the filter condition in where.',
            'Pass `{ where: { name: "Alex" } }`.',
            'Write: `return await prisma.user.deleteMany({ where: { name: "Alex" } });`',
          ],
          scaffold: '-- Which rows will be pruned?\nSELECT id FROM users WHERE id = 99;',
          solutionSql: "SELECT id FROM users WHERE name = 'Alex';",
          why: 'deleteMany executes a filtered DELETE and returns { count: number }.',
          cols: ['id'],
          rows: 1,
          code0:
            'export async function purgeUsers() {\n  // Delete users by filter:\n\n}',
          code1:
            'export async function purgeUsers() {\n  return await prisma.user.deleteMany({\n    where: { name: "Alex" },\n  });\n}',
          need: ['prisma.user.deleteMany', 'name: "Alex"'],
          rtype: '{ count: number }',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma10-challenge',
    title: 'Final Challenge — Mutation Resilience & Selector Diagnostics',
    scenario: 'Execute idempotent reconciliation and diagnose compiler unique selector errors.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma10-hw-1',
          title: 'Idempotent Sync: Reconcile member records from scratch',
          description: 'Upsert by email and return id + email only from scratch.',
          instructions: ['Use `prisma.user.upsert`', 'Select `id` and `email`'],
          hintLadder: [
            'Idempotent writes converge to the desired record state regardless of whether the record already exists.',
            'Call prisma.user.upsert with where email, update: { name }, create: { name, email }, and select id, email.',
            'Write: `return await prisma.user.upsert({ where: { email }, update: { name }, create: { name, email }, select: { id: true, email: true } });`',
          ],
          fromScratch: true,
          scaffold: '-- The row a replay resolves to:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Replaying the same payload leaves the table untouched.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          noCols: ['name'],
          method: 'upsert',
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
          title: 'Selector Diagnostics: Repair invalid unique lookup on upsert',
          description:
            'Diagnose why Prisma rejects `where: { name }` and repair the selector to target the unique `email` field.',
          instructions: [
            'Diagnose why `where: { name }` is rejected by the compiler',
            'Repair the selector to target the unique `email` field',
          ],
          hintLadder: [
            'Prisma upsert requires a unique selector so the database can target a specific unique index for conflict resolution.',
            'Change where: { name } to where: { email } because email is unique in the schema.',
            'Write: `return await prisma.user.upsert({ where: { email }, update: { name }, create: { name, email } });`',
          ],
          scaffold: '-- Repaired upsert resolves to this record:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Prisma Client enforces database unique constraints at compile-time to prevent ambiguous updates.',
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
