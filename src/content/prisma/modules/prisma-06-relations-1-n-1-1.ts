import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 6 — One-to-Many & One-to-One Relations (Phase 4.1).
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: The Foreign Key Bridge in 1:N (authorId Int + @relation + posts Post[])
 *   Concept 2: Querying Relations with Eager Loading (include vs nested select)
 *   Concept 3: 1:1 Relations & Bi-directional Lookups (Profile with userId Int @unique)
 *   Challenge: Author Profile & Publication Projection (Query Mode from scratch)
 */
export const Prisma_06_MODULE: ModuleData = {
  id: 'prisma-06',
  slug: 'relations-one-to-many-one-to-one',
  day: 6,
  title: 'Day 6 — One-to-Many & One-to-One Relations',
  shortTitle: '1:N & 1:1 Relations',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description:
    'Bridge tables with physical foreign keys and virtual relation fields, eagerly load child records with include, craft leak-proof relational queries with nested select, and model 1:1 entities.',
  estimatedMinutes: 50,
  curriculumOrder: 6,
  displayLabel: 'Day 6',
  completionLearnings: [
    'Define the physical foreign key column (authorId Int) and relation attribute (@relation) together',
    'Add the back-relation collection field (posts Post[]) on the parent model',
    'Eagerly load related records in queries using include: { posts: true }',
    'Prevent data leaks by projecting relational fields with nested select',
    'Model 1:1 relationships using @unique on the child foreign key column',
  ],
  concepts: [
    {
      id: 'foreign-key-bridge',
      order: 1,
      title: 'The Foreign Key Bridge in 1:N Relations',
      shortDescription:
        'Connect models with the physical storage foreign key and the virtual relation field.',
      theory: richPrismaTheory({
        summary:
          'In relational databases, a One-to-Many (1:N) relationship is established when child rows store the primary key of their parent in a Foreign Key column. In Prisma, a relation requires three coordinated pieces: (1) the scalar foreign key column (`authorId Int`), (2) the virtual relation field with directive (`author User @relation(fields: [authorId], references: [id])`), and (3) the parent back-relation field (`posts Post[]`).',
        takeaway:
          '1:N relations require the physical FK scalar, the @relation field mapping it to the parent, and the parent collection array.',
        sql: 'ALTER TABLE posts ADD CONSTRAINT fk_posts_users FOREIGN KEY (author_id) REFERENCES users(id);',
        heroCode:
          'model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int  @id @default(autoincrement())\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id])\n}',
        heroLang: 'prisma',
        heroWhy: 'Shows the complete 1:N relation bridge linking Post to User.',
        mentalModel:
          '**Two Halves of the Same Coin.** Relational databases only understand columns. Prisma distinguishes between storage columns (`authorId Int`, which physically exists in the database table) and relation fields (`author User` and `posts Post[]`, which exist purely in Prisma schema and TypeScript to navigate the graph). You cannot have the virtual relation without its physical scalar anchor.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Add the physical foreign key column',
            codeSnippet: 'authorId Int',
            explanation: 'The scalar column that physically stores the referenced parent id in the database table.',
            visualData: { type: 'type_preview', title: 'Foreign Key Column', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Declare the relation directive',
            codeSnippet: 'author User @relation(fields: [authorId], references: [id])',
            explanation: 'Instructs Prisma how the foreign key authorId connects to the primary key id of User.',
            visualData: { type: 'type_preview', title: 'Relation Directive', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Declare the back-relation on parent',
            codeSnippet: 'posts Post[]',
            explanation: 'Gives the parent model a typed array to access all of its child records.',
            visualData: { type: 'erd_highlight', title: '1:N Relation Graph', details: null },
          },
        ],
        littleDetails: {
          title: 'Relation Invariants & Placement',
          rules: [
            {
              ruleNumber: 1,
              title: 'Foreign keys belong on the "Many" side',
              description: 'In a 1:N relation, the `@relation(fields: [...], references: [...])` directive always belongs on the child model that holds the foreign key scalar.',
              badge: 'Placement',
            },
            {
              ruleNumber: 2,
              title: 'Type matching between FK and PK',
              description: 'The type of the foreign key scalar (`Int` or `String`) must match the type of the referenced primary key exactly.',
              badge: 'Type Match',
            },
            {
              ruleNumber: 3,
              title: 'Virtual fields are never database columns',
              description: 'Fields like `posts Post[]` or `author User` do not create columns in the database table; they exist only in the Prisma client layer.',
              badge: 'Virtual Fields',
            },
          ],
        },
        sqlBridge: {
          title: 'From Foreign Key DDL to Prisma Schema',
          mappings: [
            {
              sql: 'author_id INTEGER REFERENCES users(id)',
              prisma: 'authorId Int\nauthor User @relation(fields: [authorId], references: [id])',
              note: 'Scalar foreign key paired with relation metadata directive',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c1-t1',
          title: 'Connect Child to Parent: Add authorId and @relation to Post',
          description: 'Establish the 1:N relation from Post to User by adding the foreign key and relation directive.',
          instructions: [
            'Inside `model Post`, declare the foreign key field `authorId Int`',
            'Add the relation field `author User @relation(fields: [authorId], references: [id])`',
          ],
          hintLadder: [
            'Declare `authorId Int` first.',
            'Add `author User @relation(fields: [authorId], references: [id])` on the following line.',
            'Ensure both `authorId Int` and the `@relation` attribute are present inside `model Post`.',
          ],
          scaffold: '-- Validating 1:N relation bridge on Post model:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'The foreign key scalar and relation directive together form the link to the parent table.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Post {\n  id    Int    @id @default(autoincrement())\n  title String\n  // Add foreign key authorId and author relation below:\n\n}',
          code1: 'model Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User   @relation(fields: [authorId], references: [id])\n}',
          need: ['authorId Int', '@relation(fields: [authorId], references: [id])'],
        }),
        prismaSnippetTask({
          id: 'prisma06-c1-t2',
          title: 'Complete 1:N Relation: Connect Department and Employee',
          description: 'Define the 1:N relation between Department (parent) and Employee (child).',
          instructions: [
            'In `model Department`, add the back-relation collection `employees Employee[]`',
            'In `model Employee`, add `departmentId Int`',
            'Add `department Department @relation(fields: [departmentId], references: [id])`',
          ],
          hintLadder: [
            'Add `employees Employee[]` to `model Department`.',
            'Add `departmentId Int` and the `@relation` directive to `model Employee`.',
            'Both sides of the relation must be completed.',
          ],
          scaffold: '-- Validating bi-directional 1:N relation:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Bi-directional relations allow navigation from either department to employees or employee to department.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Department {\n  id   Int    @id @default(autoincrement())\n  name String\n  // Add employees collection:\n\n}\n\nmodel Employee {\n  id   Int    @id @default(autoincrement())\n  name String\n  // Add departmentId and relation:\n\n}',
          code1: 'model Department {\n  id        Int        @id @default(autoincrement())\n  name      String\n  employees Employee[]\n}\n\nmodel Employee {\n  id           Int        @id @default(autoincrement())\n  name         String\n  departmentId Int\n  department   Department @relation(fields: [departmentId], references: [id])\n}',
          need: ['employees Employee[]', 'departmentId Int', '@relation(fields: [departmentId], references: [id])'],
        }),
      ],
    },
    {
      id: 'querying-relations',
      order: 2,
      title: 'Querying Relations: include vs Nested select',
      shortDescription:
        'Load related records eagerly using include, or project specific fields with nested select.',
      theory: richPrismaTheory({
        summary:
          'By default, Prisma queries return only scalar fields of the requested model and omit relations to prevent over-fetching. To load related records, you can pass `include: { posts: true }` to fetch all scalar fields of the related entity. However, in production APIs, you should use nested `select` to specify exactly which fields of the parent and child models are loaded, preventing accidental data leaks (e.g. hashed passwords or internal IDs).',
        takeaway:
          'include fetches all related columns; nested select restricts both parent and child fields for leak-proof responses.',
        sql: 'SELECT u.id, u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.author_id WHERE u.id = 1;',
        heroCode:
          'const user = await prisma.user.findUnique({\n  where: { id: 1 },\n  select: {\n    id: true,\n    name: true,\n    posts: {\n      select: { title: true },\n    },\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'Performs a type-safe nested relational projection without leaking unwanted columns.',
        mentalModel:
          '**The Selective Funnel.** Think of `include` as loading the entire related entity with all its columns. Think of nested `select` as a precise filter that carves out only the exact fields your client needs. Note that Prisma does not allow combining `include` and `select` at the same level of a query object.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Eager loading with include',
            codeSnippet: 'await prisma.user.findUnique({\n  where: { id: 1 },\n  include: { posts: true },\n});',
            explanation: 'Loads the user and all scalar fields of all related posts.',
            visualData: { type: 'sql_lens', title: 'Include Relational Load', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Selective projection with nested select',
            codeSnippet: 'await prisma.user.findUnique({\n  where: { id: 1 },\n  select: {\n    name: true,\n    posts: { select: { title: true } },\n  },\n});',
            explanation: 'Loads only user name and post titles, completely omitting user email or post ids.',
            visualData: { type: 'type_preview', title: 'Nested Type Contract', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Never mix include and select at the same level',
            codeSnippet: '// ERROR: Cannot use both `select` and `include` in the same operation\n{ select: { name: true }, include: { posts: true } }',
            explanation: 'Prisma compiler forbids mixing include and select at the same object level.',
            visualData: { type: 'type_preview', title: 'Syntax Constraint', details: null },
          },
        ],
        littleDetails: {
          title: 'Relational Query Rules',
          rules: [
            {
              ruleNumber: 1,
              title: 'Cannot mix select and include at the same level',
              description: 'You cannot provide both `select` and `include` at the root of a query. If you use `select`, all relational inclusions must be expressed as nested `select` blocks.',
              badge: 'Mutual Exclusion',
            },
            {
              ruleNumber: 2,
              title: 'TypeScript Return Type Narrows Automatically',
              description: 'When using nested `select`, TypeScript automatically narrows the return type to contain only the selected properties, eliminating runtime undefined errors.',
              badge: 'Type Narrowing',
            },
            {
              ruleNumber: 3,
              title: 'Nested filtering inside relations',
              description: 'Inside a nested `select` or `include` on a 1:N relation, you can pass `where`, `orderBy`, and `take` to filter and sort child records.',
              badge: 'Nested Filters',
            },
          ],
        },
        sqlBridge: {
          title: 'Relational Load to SQL Queries',
          mappings: [
            {
              sql: 'SELECT * FROM users WHERE id = 1;\nSELECT * FROM posts WHERE author_id = 1;',
              prisma: 'prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } })',
              note: 'Prisma optimizes 1:N loads by executing targeted batched queries',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma06-c2-t1',
          title: 'Eager Loading: Fetch user with all related posts',
          description: 'Fetch user with id 1 and include all their posts using include.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: 1 }`',
            'Pass `include: { posts: true }` to load the related posts',
            'Return the loaded record',
          ],
          hintLadder: [
            'Use `findUnique` on `prisma.user` targeting `where: { id: 1 }`.',
            'Add `include: { posts: true }` in the options object.',
            'Write: `return await prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } });`',
          ],
          scaffold: '-- Fetch user 1:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'include eagerly fetches all related child records.',
          includes: ['posts'],
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getUserWithPosts() {\n  // Fetch user id 1 with all related posts:\n\n}',
          code1: 'export async function getUserWithPosts() {\n  return await prisma.user.findUnique({\n    where: { id: 1 },\n    include: {\n      posts: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string; posts: { id: number; title: string; authorId: number }[] } | null',
        }),
        prismaReadTask({
          id: 'prisma06-c2-t2',
          title: 'Nested Projection: Fetch user name and post titles without email',
          description: 'Use nested select to project only user name and post titles, protecting user email.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: 1 }`',
            'Use `select` to return `name: true`',
            'Nest `posts: { select: { title: true } }` inside `select`',
            'Do NOT include `id` or `email` in the user selection',
          ],
          hintLadder: [
            'Do not use `include` when using `select`.',
            'Nest `posts: { select: { title: true } }` inside the main `select` block.',
            'Write: `return await prisma.user.findUnique({ where: { id: 1 }, select: { name: true, posts: { select: { title: true } } } });`',
          ],
          scaffold: '-- Fetch user name:\nSELECT name FROM users WHERE id = 99;',
          solutionSql: 'SELECT name FROM users WHERE id = 1;',
          why: 'Nested select guarantees only needed fields are returned across parent and children.',
          select: ['name'],
          cols: ['name'],
          noCols: ['id', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getUserPublicPosts() {\n  // Project user name and post titles only:\n\n}',
          code1: 'export async function getUserPublicPosts() {\n  return await prisma.user.findUnique({\n    where: { id: 1 },\n    select: {\n      name: true,\n      posts: {\n        select: {\n          title: true,\n        },\n      },\n    },\n  });\n}',
          rtype: '{ name: string; posts: { title: string }[] } | null',
        }),
      ],
    },
    {
      id: 'one-to-one-relations',
      order: 3,
      title: 'One-to-One Relations & Bi-directional Lookups',
      shortDescription:
        'Model 1:1 relationships using unique foreign keys and query related profiles.',
      theory: richPrismaTheory({
        summary:
          'A One-to-One (1:1) relationship models scenarios where a record in one table corresponds to at most one record in another table (e.g. `User` and `Profile`). Structurally, a 1:1 relation is defined like a 1:N relation, with one critical distinction: the foreign key scalar must be marked with `@unique` (`userId Int @unique`). This constraint guarantees that no two child rows can point to the same parent.',
        takeaway:
          '1:1 relations are created by placing @unique on the child foreign key column.',
        sql: 'ALTER TABLE profiles ADD CONSTRAINT uq_profiles_user_id UNIQUE (user_id);',
        heroCode:
          'model User {\n  id      Int      @id @default(autoincrement())\n  profile Profile?\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String\n  userId Int    @unique\n  user   User   @relation(fields: [userId], references: [id])\n}',
        heroLang: 'prisma',
        heroWhy: 'Defines a 1:1 relation with unique foreign key constraint.',
        mentalModel:
          '**The Enforced Monogamy Constraint.** Without `@unique` on `userId`, multiple `Profile` rows could reference the same `User`, making it a 1:N relation. Adding `@unique` on `userId` turns it into an airtight 1:1 relation, and Prisma allows declaring `profile Profile?` as a singular optional object rather than an array `Profile[]`.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare unique foreign key on child',
            codeSnippet: 'userId Int @unique',
            explanation: 'The @unique constraint on the foreign key enforces at most one profile per user.',
            visualData: { type: 'type_preview', title: 'Unique FK Column', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Attach relation attribute',
            codeSnippet: 'user User @relation(fields: [userId], references: [id])',
            explanation: 'Links the profile child to the parent User model.',
            visualData: { type: 'type_preview', title: '1:1 Child Directive', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Declare singular relation on parent',
            codeSnippet: 'profile Profile?',
            explanation: 'Parent references a single optional profile instance instead of an array.',
            visualData: { type: 'erd_highlight', title: '1:1 Relation ERD', details: null },
          },
        ],
        littleDetails: {
          title: '1:1 Design Rules',
          rules: [
            {
              ruleNumber: 1,
              title: 'One side must be optional',
              description: 'In relational databases, you cannot insert two mutually dependent required 1:1 rows in a single simple SQL insert. At least one side (usually the child) must be optional in application schemas.',
              badge: 'Optionality',
            },
            {
              ruleNumber: 2,
              title: 'Deciding which model holds the foreign key',
              description: 'Place the foreign key on the model that depends on the other. A `Profile` depends on a `User`, so `Profile` holds `userId Int @unique`.',
              badge: 'Dependency',
            },
            {
              ruleNumber: 3,
              title: 'Bi-directional singular queries',
              description: 'Because both sides are singular, querying `prisma.profile.findUnique({ ... }).user()` or `prisma.user.findUnique({ ... }).profile()` returns a single entity or null.',
              badge: 'Navigation',
            },
          ],
        },
        sqlBridge: {
          title: '1:1 SQL Constraint Equivalents',
          mappings: [
            {
              sql: 'user_id INTEGER UNIQUE REFERENCES users(id)',
              prisma: 'userId Int @unique\nuser User @relation(fields: [userId], references: [id])',
              note: 'Unique foreign key constraint creating a 1:1 mapping',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c3-t1',
          title: 'Define 1:1 Schema: Connect User and Profile with unique foreign key',
          description: 'Complete the 1:1 relationship between User and Profile in schema.prisma.',
          instructions: [
            'In `model User`, add the singular optional field `profile Profile?`',
            'In `model Profile`, add `userId Int @unique`',
            'Add `user User @relation(fields: [userId], references: [id])` inside Profile',
          ],
          hintLadder: [
            'Add `profile Profile?` to `model User`.',
            'Add `userId Int @unique` and `user User @relation(fields: [userId], references: [id])` to `model Profile`.',
            'Make sure `@unique` is attached to `userId Int`.',
          ],
          scaffold: '-- Validating 1:1 schema relation:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@unique on the foreign key ensures every user has at most one profile.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id      Int      @id @default(autoincrement())\n  name    String\n  // Add optional profile relation:\n\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String\n  // Add userId @unique and user relation:\n\n}',
          code1: 'model User {\n  id      Int      @id @default(autoincrement())\n  name    String\n  profile Profile?\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String\n  userId Int    @unique\n  user   User   @relation(fields: [userId], references: [id])\n}',
          need: ['profile Profile?', 'userId Int @unique', '@relation(fields: [userId], references: [id])'],
        }),
        prismaReadTask({
          id: 'prisma06-c3-t2',
          title: 'Query 1:1 Relations: Look up User along with their Profile',
          description: 'Fetch user id 2 including their profile and posts using include.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: 2 }`',
            'Pass `include: { posts: true }`',
            'Return the matched user',
          ],
          hintLadder: [
            'Filter by `where: { id: 2 }`.',
            'Add `include: { posts: true }` to eager load relations.',
            'Write: `return await prisma.user.findUnique({ where: { id: 2 }, include: { posts: true } });`',
          ],
          scaffold: '-- Fetch user 2 with relations:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 2;',
          why: 'Singular and plural relations can both be loaded via include.',
          includes: ['posts'],
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getUserProfileDetails() {\n  // Fetch user 2 with relations:\n\n}',
          code1: 'export async function getUserProfileDetails() {\n  return await prisma.user.findUnique({\n    where: { id: 2 },\n    include: {\n      posts: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string; posts: { id: number; title: string; authorId: number }[] } | null',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma06-challenge',
    title: 'Final Challenge — Author Profile & Publication Projection',
    scenario:
      'You are creating a secure public API endpoint for an author directory. You must write a query from scratch that retrieves user with id 1, returning their id, name, and their posts (projecting only title and id), while strictly omitting private email addresses.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaReadTask({
        id: 'prisma06-hw-1',
        title: 'Author Profile & Article Projection from Scratch',
        description:
          'Author a query from scratch using nested select to load user id 1, projecting only id, name, and related post titles, omitting email.',
        instructions: [
          'Inside `getAuthorPublicFeed()`, call `await prisma.user.findUnique()` for user id 1',
          'Use `select` to project `id: true` and `name: true`',
          'Nest `posts: { select: { title: true } }` inside `select`',
          'Do NOT select `email`',
          'Return the result',
        ],
        hintLadder: [
          'Use `prisma.user.findUnique({ where: { id: 1 }, select: { ... } })`.',
          'Inside `select`, include `id: true`, `name: true`, and `posts: { select: { title: true } }`.',
          'Do not include `email: true` anywhere in the query.',
        ],
        scaffold: '-- Public author feed without email:\nSELECT id, name FROM users WHERE id = 99;',
        solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
        why: 'Nested select allows precise field selection across multiple related tables simultaneously.',
        select: ['id', 'name'],
        cols: ['id', 'name'],
        noCols: ['email'],
        rows: 1,
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'query',
        code0: 'export async function getAuthorPublicFeed() {\n  // Write the nested relational query from scratch:\n\n}',
        code1: 'export async function getAuthorPublicFeed() {\n  return await prisma.user.findUnique({\n    where: { id: 1 },\n    select: {\n      id: true,\n      name: true,\n      posts: {\n        select: {\n          title: true,\n        },\n      },\n    },\n  });\n}',
        rtype: '{ id: number; name: string; posts: { title: string }[] } | null',
      }),
    ],
  },
};
