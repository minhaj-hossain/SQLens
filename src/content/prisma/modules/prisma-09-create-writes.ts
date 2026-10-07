import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 9 — Creating & Writing Data (Phase 5: Mutations & Writes).
 *
 * Pedagogical Sequence:
 *   Concept 1: Single Record Creation — prisma.user.create({ data, select })
 *   Concept 2: High-Throughput Batch Inserts — prisma.user.createMany({ data })
 *   Concept 3: Relational Nested Writes — create, connect, connectOrCreate
 *   Challenge: Multi-Relation Nested Author & Post Creation from scratch
 */
export const Prisma_09_MODULE: ModuleData = {
  id: 'prisma-09',
  slug: 'creating-data',
  day: 9,
  title: 'Day 9 — Creating & Writing Data',
  shortTitle: 'Creating Data',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-5',
  description:
    'Master single record creation with safe select projections, bulk insertions with createMany, and atomic nested relation writes.',
  estimatedMinutes: 55,
  curriculumOrder: 9,
  displayLabel: 'Day 9',
  completionLearnings: [
    'Insert single entities and return generated primary keys using create()',
    'Batch insert large collections in a single round trip with createMany()',
    'Walk relation graphs atomically with nested writes: create, connect, and connectOrCreate',
    'Protect sensitive attributes by pairing write mutations with explicit select projections',
  ],
  concepts: [
    {
      id: 'single-record-creation',
      order: 1,
      title: 'Single Record Creation — create() & Projections',
      shortDescription: 'One INSERT statement returning the newly created row with generated keys.',
      theory: richPrismaTheory({
        summary:
          '`create()` sends a single SQL INSERT statement and immediately hydrates the created row. By pairing `create()` with an explicit `select` projection, you determine precisely which columns leave the database, preventing sensitive columns (like password hashes or internal status flags) from leaking back to the caller.',
        takeaway:
          'create() writes one entity and returns the hydrated record; shape the return value with select.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'const user = await prisma.user.create({\n  data: { name, email },\n  select: { id: true, email: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'One INSERT, and select decides which fields are hydrated and returned.',
        mentalModel:
          '**Single-Row Hydration.** When creating a single entity, Prisma coordinates default values, auto-incrementing or UUID/CUID primary keys, and updated timestamps in one query. The returned TypeScript object is automatically narrowed to match your `select` projection.',
        littleDetails: {
          title: 'Single Create Rules & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always shape created records with select',
              description: 'Never return raw database entities directly to API callers. Pairing `create` with `select: { id: true, email: true }` prevents internal database fields from leaking.',
              badge: 'Security',
            },
            {
              ruleNumber: 2,
              title: 'Required fields must be supplied in data',
              description: 'Any schema field without a `@default` directive or optional `?` modifier must be supplied in `data`. Omitting a required column causes a compile-time TypeScript error.',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 3,
              title: 'Unique constraints throw P2002 on conflict',
              description: 'Attempting to insert a duplicate value into an `@id` or `@unique` field throws a `PrismaClientKnownRequestError` with code `P2002`.',
              badge: 'Integrity',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma create() to SQL INSERT',
          mappings: [
            {
              prisma: 'prisma.user.create({ data: { name, email }, select: { id: true } })',
              sql: 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id;',
              note: 'Translates to a parameterized INSERT with SQL RETURNING projection.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Do I need the generated primary key or timestamp immediately after insertion?',
              answer: 'Use `prisma.model.create({ data, select: { id: true } })`. It returns the hydrated entity.',
            },
            {
              questionNumber: 2,
              question: 'What if a user with this email already exists?',
              answer: '`create()` will reject duplicate unique keys with P2002. If you want idempotent insert-or-update, use `upsert()` instead.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define insert payload and projection',
            codeSnippet:
              'await prisma.user.create({\n  data: { name: "Rafi", email: "rafi@prisma.io" },\n  select: { id: true, email: true },\n});',
            explanation: 'The data property supplies model attributes, while select restricts what leaves the database.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Database executes parameterized INSERT',
            codeSnippet: "INSERT INTO users (name, email) VALUES ('Rafi', 'rafi@prisma.io') RETURNING id, email;",
            explanation: 'The database engine writes the record and returns the selected columns.',
            visualData: {
              type: 'sql_lens',
              title: 'Inserted Record View',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'TypeScript infers narrowed result shape',
            codeSnippet: 'type Result = { id: number; email: string };',
            explanation: 'The return type matches your select block with zero boilerplate.',
            visualData: {
              type: 'type_preview',
              title: 'Inferred Entity Contract',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma09-c1-t1',
          title: 'Register Member: Create user and return safe projection',
          description: 'Insert a new user record and return only id and email to the caller.',
          instructions: [
            'Call `await prisma.user.create()`',
            'Pass `data: { name, email }`',
            'Add `select: { id: true, email: true }`',
            'Return the resulting record',
          ],
          hintLadder: [
            'Use `prisma.user.create` passing the data and select blocks.',
            'Inside create: `{ data: { name, email }, select: { id: true, email: true } }`.',
            'Write: `return await prisma.user.create({ data: { name, email }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- The row your insert just created:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The unique email locates the newly inserted record.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'create',
          demoVariables: { name: 'Rafi', email: 'rafi@prisma.io' },
          rows: 1,
          code0:
            'export async function registerUser(name: string, email: string) {\n  // Insert user and return id + email:\n\n}',
          code1:
            'export async function registerUser(name: string, email: string) {\n  return await prisma.user.create({\n    data: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaSnippetTask({
          id: 'prisma09-c1-t2',
          title: 'Profile Initialization: Insert user with optional biography',
          description: 'Create a user with an optional bio field and verify the generated payload.',
          instructions: [
            'Call `await prisma.user.create()`',
            'Pass `name`, `email`, and `bio` inside `data`',
            'Select `id`, `name`, and `email`',
          ],
          hintLadder: [
            'Include `bio` in the `data` payload.',
            'Select `id: true, name: true, email: true`.',
            'Write: `return await prisma.user.create({ data: { name, email, bio }, select: { id: true, name: true, email: true } });`',
          ],
          scaffold: '-- Created profile record:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'The profile record is created with optional attributes intact.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0:
            'export async function createMember(name: string, email: string, bio: string) {\n  // Create member with bio:\n\n}',
          code1:
            'export async function createMember(name: string, email: string, bio: string) {\n  return await prisma.user.create({\n    data: { name, email, bio },\n    select: { id: true, name: true, email: true },\n  });\n}',
          need: ['prisma.user.create', 'bio', 'select: { id: true, name: true, email: true }'],
          demoVariables: { name: 'Mina', email: 'mina@prisma.io', bio: 'Database architect' },
        }),
      ],
    },
    {
      id: 'batch-creation',
      order: 2,
      title: 'High-Throughput Batch Inserts — createMany()',
      shortDescription: 'Insert an entire collection in a single database round trip.',
      theory: richPrismaTheory({
        summary:
          '`createMany()` compiles an array of objects into a single multi-row SQL `INSERT INTO ... VALUES (...), (...)` statement. Because standard database drivers return only the total number of affected rows rather than generated primary keys, `createMany()` returns `{ count: number }`. It does not support nested relation writes.',
        takeaway:
          'createMany() executes a single bulk INSERT and returns { count: number } for maximum throughput.',
        sql: 'SELECT id, email FROM users ORDER BY id ASC;',
        heroCode:
          'const result = await prisma.user.createMany({\n  data: [\n    { name: "Alex", email: "alex@prisma.io" },\n    { name: "Mina", email: "mina@prisma.io" },\n  ],\n  skipDuplicates: true,\n});',
        heroLang: 'typescript',
        heroWhy: 'One multi-row INSERT query replaces hundreds of individual round trips.',
        mentalModel:
          '**Bulk Ingestion Throughput.** In scenarios like CSV imports, seed pipelines, or webhook processing, calling `create()` in a loop creates an N-round-trip bottleneck. `createMany()` sends all records in a single SQL payload, optimizing database IO and socket lease times.',
        littleDetails: {
          title: 'Batch Insert Rules & Limitations',
          rules: [
            {
              ruleNumber: 1,
              title: 'Returns count only, not generated entities',
              description: 'Because database drivers do not reliably return auto-generated IDs across multi-row inserts on all engines, `createMany()` returns `{ count: number }`. Use `create()` if callers require the inserted IDs.',
              badge: 'Return Type',
            },
            {
              ruleNumber: 2,
              title: 'Nested relation writes are not supported',
              description: 'You cannot use `posts: { create: [...] }` inside `createMany()`. Bulk operations can only populate scalar columns on a single target table.',
              badge: 'Limitation',
            },
            {
              ruleNumber: 3,
              title: 'skipDuplicates ignores existing unique records',
              description: 'Adding `skipDuplicates: true` emits `ON CONFLICT DO NOTHING` in PostgreSQL/SQLite, preventing the entire batch from aborting if one record collides on a unique constraint.',
              badge: 'Idempotency',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma createMany() to Multi-Row SQL',
          mappings: [
            {
              prisma: 'prisma.user.createMany({ data: users, skipDuplicates: true })',
              sql: 'INSERT INTO users (name, email) VALUES ($1, $2), ($3, $4) ON CONFLICT DO NOTHING;',
              note: 'Single multi-value INSERT statement with conflict handling.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Should I loop over create() or call createMany()?',
              answer: 'Call `createMany()` whenever you do not need the returned IDs. It executes in 1 round trip instead of N.',
            },
            {
              questionNumber: 2,
              question: 'What if some records in the batch have existing emails?',
              answer: 'Pass `skipDuplicates: true` so existing records are ignored and the remaining valid rows are saved.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Package records into an array',
            codeSnippet: 'const users = [{ name: "Alex", email: "alex@prisma.io" }, { name: "Mina", email: "mina@prisma.io" }];',
            explanation: 'All records must satisfy required scalar columns.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Execute batch insert',
            codeSnippet: 'const { count } = await prisma.user.createMany({ data: users });',
            explanation: 'The query engine batches all values into a single multi-row SQL INSERT statement.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Inspect affected row count',
            codeSnippet: 'console.log(`Inserted ${count} users`);',
            explanation: 'Returns the total count of successfully inserted records.',
            visualData: {
              type: 'type_preview',
              title: 'Batch Return Contract',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma09-c2-t1',
          title: 'Import Records: Bulk insert an array of users with createMany()',
          description: 'Insert an array of user objects in a single round trip.',
          instructions: [
            'Call `await prisma.user.createMany()`',
            'Pass `data: users`',
            'Return the result object (`{ count: number }`)',
          ],
          hintLadder: [
            'Use `prisma.user.createMany` with the `data` option.',
            'Pass `{ data: users }` to createMany.',
            'Write: `return await prisma.user.createMany({ data: users });`',
          ],
          scaffold: '-- The batch landed multiple rows:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users;',
          why: 'A batch insert populates the entire table in one round trip.',
          cols: ['id'],
          rows: 3,
          code0:
            'export async function importUsers(users: { name: string; email: string }[]) {\n  // Batch insert users:\n\n}',
          code1:
            'export async function importUsers(users: { name: string; email: string }[]) {\n  return await prisma.user.createMany({\n    data: users,\n  });\n}',
          need: ['prisma.user.createMany', 'data: users'],
          rtype: '{ count: number }',
        }),
        prismaSnippetTask({
          id: 'prisma09-c2-t2',
          title: 'Resilient Bulk Load: Skip duplicate keys in batch inserts',
          description: 'Insert users in bulk while safely skipping any records that collide on unique emails.',
          instructions: [
            'Call `await prisma.user.createMany()`',
            'Pass `data: users`',
            'Set `skipDuplicates: true`',
          ],
          hintLadder: [
            'Add `skipDuplicates: true` inside the createMany arguments object.',
            'Pass `{ data: users, skipDuplicates: true }`.',
            'Write: `return await prisma.user.createMany({ data: users, skipDuplicates: true });`',
          ],
          scaffold: '-- Unique records survive without aborting:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users;',
          why: 'skipDuplicates translates to ON CONFLICT DO NOTHING, protecting the batch.',
          cols: ['id'],
          rows: 3,
          code0:
            'export async function importSafeUsers(users: { name: string; email: string }[]) {\n  // Batch insert with duplicate skip:\n\n}',
          code1:
            'export async function importSafeUsers(users: { name: string; email: string }[]) {\n  return await prisma.user.createMany({\n    data: users,\n    skipDuplicates: true,\n  });\n}',
          need: ['prisma.user.createMany', 'skipDuplicates: true'],
          rtype: '{ count: number }',
        }),
      ],
    },
    {
      id: 'nested-writes',
      order: 3,
      title: 'Relational Nested Writes — create, connect, connectOrCreate',
      shortDescription: 'Write across relation graphs atomically in a single client call.',
      theory: richPrismaTheory({
        summary:
          'A nested write walks your schema relation graph: `create` inserts a brand new child record using the parent’s generated foreign key, `connect` attaches an existing child by its unique key, and `connectOrCreate` checks whether the target exists before deciding. Prisma wraps the entire operation in an implicit database transaction — either the complete graph lands, or none of it does.',
        takeaway:
          'Nested writes coordinate parent and child records in a single atomic transaction.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'await prisma.user.create({\n  data: {\n    name: "Alex",\n    email: "alex@prisma.io",\n    posts: {\n      create: [{ title: "Deep Dive into Prisma" }],\n    },\n  },\n  select: { id: true, email: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'Parent and child inserts are executed inside a single atomic transaction.',
        mentalModel:
          '**Follow the Relation Graph.** Instead of authoring manual multi-step transactions where you insert a user, retrieve their `id`, and pass it to a post insert, Prisma’s query engine automates foreign key coordination. If any child insert fails, the parent creation is rolled back automatically.',
        littleDetails: {
          title: 'Nested Write Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'Automatic Transaction Boundary',
              description: 'Whether writing 1 child or 20 nested records across 4 models, Prisma wraps the entire operation in a single database transaction. If any nested record fails validation or constraints, everything rolls back.',
              badge: 'Atomicity',
            },
            {
              ruleNumber: 2,
              title: 'connect attaches existing records by unique key',
              description: 'The `connect` directive requires a unique identifier (`@id` or `@unique`). If the target record does not exist in the database, Prisma throws error code P2025.',
              badge: 'Referential',
            },
            {
              ruleNumber: 3,
              title: 'connectOrCreate eliminates race conditions',
              description: 'Combines a unique `where` lookup with an insert fallback (`create`), ensuring relations like categories or tags are never duplicated under concurrent traffic.',
              badge: 'Idempotency',
            },
          ],
        },
        sqlBridge: {
          title: 'Nested Writes to SQL Execution Steps',
          mappings: [
            {
              prisma: 'posts: { create: [{ title }] }',
              sql: 'INSERT INTO posts (title, author_id) VALUES ($1, $2);',
              note: 'Child insert automatically receives the generated parent primary key.',
            },
            {
              prisma: 'posts: { connect: [{ id: 10 }] }',
              sql: 'UPDATE posts SET author_id = $1 WHERE id = 10;',
              note: 'Attaches existing record by updating foreign key scalar.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use create vs connect in nested writes?',
              answer: 'Use `create` when the child entity is brand new. Use `connect` when associating an existing entity by its unique ID.',
            },
            {
              questionNumber: 2,
              question: 'What happens if a child write fails?',
              answer: 'Prisma rolls back the entire transaction: the parent record is not saved, preserving database integrity.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define parent data and nested child block',
            codeSnippet:
              'await prisma.user.create({\n  data: {\n    name: "Alex",\n    email: "alex@prisma.io",\n    posts: { create: [{ title: "First Post" }] },\n  },\n});',
            explanation: 'The nested posts block declares child records to create alongside the parent.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Query engine executes batched transaction',
            codeSnippet: 'BEGIN;\nINSERT INTO users (name, email) VALUES ...;\nINSERT INTO posts (title, author_id) VALUES ...;\nCOMMIT;',
            explanation: 'Prisma binds the parent generated ID to the child foreign key automatically.',
            visualData: {
              type: 'sql_lens',
              title: 'Transaction Sequence',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Select projected parent fields',
            codeSnippet: 'select: { id: true, email: true }',
            explanation: 'Keeps returned payload compact and secure.',
            visualData: {
              type: 'type_preview',
              title: 'Narrowed Type Return',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma09-c3-t1',
          title: 'Atomic Author & Article: Create user with nested posts',
          description: 'Register a user and their initial post in a single atomic nested create operation.',
          instructions: [
            'Call `await prisma.user.create()`',
            'Pass `name` and `email`',
            'Nest `posts: { create: [{ title }] }` inside `data`',
            'Select `id: true, email: true`',
          ],
          hintLadder: [
            'Inside data, add `posts: { create: [{ title }] }`.',
            'Select `id: true, email: true` on the created user.',
            'Write: `return await prisma.user.create({ data: { name, email, posts: { create: [{ title }] } }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- Parent user created with child post:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Nested create ties parent and child records together in one atomic transaction.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function registerWithPost(name: string, email: string, title: string) {\n  // Create user and nested post:\n\n}',
          code1:
            'export async function registerWithPost(name: string, email: string, title: string) {\n  return await prisma.user.create({\n    data: {\n      name,\n      email,\n      posts: { create: [{ title }] },\n    },\n    select: { id: true, email: true },\n  });\n}',
          need: ['prisma.user.create', 'posts: { create:', 'select: { id: true, email: true }'],
          demoVariables: { name: 'Alex', email: 'alex@prisma.io', title: 'Hello Prisma' },
        }),
        prismaSnippetTask({
          id: 'prisma09-c3-t2',
          title: 'Relational Link: Attach an existing child record using connect',
          description: 'Create a post and connect it to an existing author using their unique ID.',
          instructions: [
            'Call `await prisma.post.create()`',
            'Pass `title: title` inside `data`',
            'Use `author: { connect: { id: authorId } }` to link the existing author',
          ],
          hintLadder: [
            'Use `author: { connect: { id: authorId } }` inside `data`.',
            'Call `prisma.post.create` with title and author connect block.',
            'Write: `return await prisma.post.create({ data: { title, author: { connect: { id: authorId } } } });`',
          ],
          scaffold: '-- Author linked to post:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'connect associates existing parent rows without creating duplicates.',
          cols: ['id', 'email'],
          rows: 1,
          model: 'post',
          code0:
            'export async function publishPost(title: string, authorId: number) {\n  // Create post connected to existing author:\n\n}',
          code1:
            'export async function publishPost(title: string, authorId: number) {\n  return await prisma.post.create({\n    data: {\n      title,\n      author: { connect: { id: authorId } },\n    },\n  });\n}',
          need: ['prisma.post.create', 'author: { connect: { id: authorId } }'],
          demoVariables: { title: 'First Article', authorId: 1 },
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma09-challenge',
    title: 'Final Challenge — Atomic Entity Graph Onboarding',
    scenario: 'Create a complete author entity with profile and first publication in one atomic operation.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma09-hw-1',
          title: 'Onboard Author: Atomically create user with profile and initial post',
          description: 'Create a new user with an initial post and return safe user projection from scratch.',
          instructions: [
            'Call `await prisma.user.create()`',
            'Pass `name` and `email` inside `data`',
            'Nest `posts: { create: [{ title }] }`',
            'Select only `id: true` and `email: true`',
          ],
          hintLadder: [
            'Author onboarding requires writing parent and child entities together.',
            'Supply data with name, email, and nested posts create array.',
            'Write: `return await prisma.user.create({ data: { name, email, posts: { create: [{ title }] } }, select: { id: true, email: true } });`',
          ],
          fromScratch: true,
          scaffold: '-- Created user record:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'The user and related records are created atomically in a single transaction.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'create',
          demoVariables: { name: 'Mina', email: 'mina@prisma.io', title: 'Architectural Musings' },
          rows: 1,
          code0:
            'export async function onboardAuthor(name: string, email: string, title: string) {\n  // Onboard author with initial post:\n\n}',
          code1:
            'export async function onboardAuthor(name: string, email: string, title: string) {\n  return await prisma.user.create({\n    data: {\n      name,\n      email,\n      posts: { create: [{ title }] },\n    },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        type: 'challenge',
      },
    ],
  },
};
