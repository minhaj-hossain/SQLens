import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 4 — Relations (1:N, 1:1, M:N implicit vs explicit). */
export const Prisma_04_MODULE: ModuleData = {
  id: 'prisma-04',
  slug: 'relations',
  day: 4,
  title: 'Day 4 — Relations (1:N, 1:1, M:N)',
  shortTitle: 'Relations',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description: 'Model one-to-many, one-to-one and many-to-many relations, and load them safely.',
  estimatedMinutes: 55,
  curriculumOrder: 4,
  displayLabel: 'Day 4',
  completionLearnings: [
    'Explain how the many-side owns the foreign key',
    'Load a relation with `include` instead of a second manual query',
    'Enforce one-to-one with a unique foreign key',
    'Choose between an implicit and an explicit join table',
  ],
  concepts: [
    {
      id: 'relation-one-to-many',
      order: 1,
      title: 'One-to-Many (1:N)',
      shortDescription: 'The many-side stores `authorId`; the one-side lists `Post[]`.',
      theory: richPrismaTheory({
        summary:
          'A one-to-many relation is a foreign key plus a list. The many-side owns the physical FK column (`authorId`), the one-side declares the list (`posts Post[]`), and `include` loads the related rows in a second query.',
        takeaway:
          'The foreign key lives physically on the many-side; the list on the one-side is a virtual code convenience handle.',
        sql: 'SELECT id, name\nFROM users\nWHERE id = 1;',
        heroCode:
          'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User   @relation(fields: [authorId], references: [id])\n}',
        heroLang: 'prisma',
        heroWhy:
          'Only authorId is a real column in the database. posts and author are virtual handles for application code.',
        mentalModel:
          '**One foreign key, two code handles.** The database only stores `authorId` on `Post`. Prisma requires both sides of the relationship declared in `schema.prisma` so your application code can traverse in both directions (`user.posts` and `post.author`).',
        explanation: [
          'The many-side owns the physical column: Post has many rows, each pointing back to one User via `authorId`.',
          'Read the relation line as a sentence: "author is a User, found by matching my authorId to their id."',
          'Only `authorId` exists in the database. `author` and `posts` take zero bytes of database storage.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Two separate models',
            codeSnippet:
              'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n}\n\nmodel Post {\n  id    Int    @id @default(autoincrement())\n  title String\n}',
            explanation:
              'These are two unrelated tables, just like two CREATE TABLE statements with no link between them.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Add the foreign key column',
            codeSnippet:
              'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int    // NEW\n}',
            explanation:
              'authorId is the same foreign key column from SQL, a plain integer on Post matching User.id. Right now Prisma sees only a number, not a link.',
            isPhysicalColumn: true,
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Add the relation field on the many side',
            codeSnippet:
              'model Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User   @relation(fields: [authorId], references: [id]) // NEW\n}',
            explanation:
              'fields: [authorId] names the column on this model (Post). references: [id] names the column on the other model (User).',
            sentenceReading:
              'author is a User, found by matching my authorId to their id.',
            isVirtualRelation: true,
          },
          {
            stepNumber: 4,
            stepTitle: 'Step 4: Add the back-relation on the one side',
            codeSnippet:
              'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[] // NEW\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User   @relation(fields: [authorId], references: [id])\n}',
            explanation:
              'posts Post[] lets you write user.posts. This line adds NO column to the User table because the foreign key already lives on Post.',
            sentenceReading:
              'posts Post[] is a virtual list handle allowing code to load all posts belonging to this user.',
            isVirtualRelation: true,
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Name the foreign key after what it points to (<relationName>Id)',
              description:
                'Naming it `commentId` on Comment reads as "the id of a comment." Name it `postId` because it stores a Post\'s id. The convention is the singular name of the model it points to, plus Id.',
              codeSnippet: '// On Comment pointing to Post:\npostId Int\npost   Post @relation(fields: [postId], references: [id])',
              badge: 'Convention',
            },
            {
              ruleNumber: 2,
              title: 'Type names are capitalized',
              description:
                'Prisma scalar types are `Int`, `String`, `Boolean`, and `DateTime`, never lowercase `int` or `string`.',
              badge: 'Syntax',
            },
            {
              ruleNumber: 3,
              title: 'One field per line & closing braces',
              description:
                'Prisma rejects multiple fields on one line, and each model must have its matching closing `}`.',
              badge: 'Format',
            },
            {
              ruleNumber: 4,
              title: 'Physical column vs virtual relation',
              description:
                'Only `authorId` becomes a real column in the database table. `author` and `posts` are virtual code handles that take zero bytes of database storage.',
              badge: 'Storage',
            },
          ],
        },
        howToThink: {
          bidirectionalCheck: {
            forward: 'One User has many Posts.',
            reverse: 'Each Post has exactly one User.',
          },
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Which side is "many"?',
              answer:
                'Post. Everything stored goes there, and the foreign key column (`authorId`) lives on that model.',
            },
            {
              questionNumber: 2,
              question: 'What does the foreign key point to?',
              answer:
                'User.id. Copy that type exactly for `authorId` (`Int`).',
            },
            {
              questionNumber: 3,
              question: 'Write the relation field on the many side:',
              answer:
                'Use the template: name OtherModel @relation(fields: [myFkColumn], references: [theirPrimaryKey]).',
              template: 'author User @relation(fields: [authorId], references: [id])',
            },
            {
              questionNumber: 4,
              question: 'Write the list on the one side:',
              answer:
                'Use the template: plural ManyModel[].',
              template: 'posts Post[]',
            },
          ],
          toolingTip:
            'If you forget step 4, run `npx prisma format`. It automatically adds the missing back-relation field for you!',
        },
        sqlBridge: {
          title: 'From SQL to Prisma',
          description:
            'How foreign key constraints in relational databases map onto Prisma Schema definitions.',
          mappings: [
            {
              sql: 'authorId INT',
              prisma: 'authorId Int',
              note: 'Physical foreign key integer column on posts table',
            },
            {
              sql: 'FOREIGN KEY (authorId) REFERENCES users(id)',
              prisma: 'author User @relation(fields: [authorId], references: [id])',
              note: 'Relationship definition matching child FK to parent PK',
            },
            {
              sql: '(no equivalent)',
              prisma: 'posts Post[]',
              note: 'Code convenience handle only (no column in users table)',
              isVirtual: true,
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma04-c1-t1',
          title: 'Own the foreign key',
          description: 'The Post model must store the FK column it is keyed by.',
          instructions: [
            'Declare `authorId Int` on the Post model',
            'Add `@relation(fields: [authorId], references: [id])` to `author User`',
          ],
          hint: '`authorId Int` plus `author User @relation(fields: [authorId], references: [id])`.',
          scaffold: '-- The relation resolves to this read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 3;',
          why: 'The many-side owns the FK column — that is what makes 1:N possible.',
          cols: ['id', 'name'],
          rows: 1,
          activeTab: 'schema',
          skillType: 'introduce',
          code0:
            'model Post {\n  id     Int    @id @default(autoincrement())\n  title  String\n  author User\n}',
          code1:
            'model Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User   @relation(fields: [authorId], references: [id])\n}',
          need: ['@relation(fields: [authorId], references: [id])', 'authorId Int'],
        }),
        prismaReadTask({
          id: 'prisma04-c1-t2',
          title: 'Load an author with their posts',
          description: 'One parent row, one extra query for the related rows.',
          instructions: ['findUnique on `where: { id }`', 'Load the relation with `include`'],
          hint: '`include: { posts: true }` loads the relation.',
          scaffold:
            '-- The first of the two queries Prisma sends:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Prisma reads the parent row first and the related rows second.',
          cols: ['id', 'name'],
          select: [],
          includes: ['posts'],
          rows: 1,
          skillType: 'practice',
          code0:
            'export async function getAuthorWithPosts(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n  });\n}',
          code1:
            'export async function getAuthorWithPosts(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
      ],
    },
    {
      id: 'relation-one-to-one',
      order: 2,
      title: 'One-to-One (1:1)',
      shortDescription: 'Same FK shape as 1:N — but the FK column is `@unique`.',
      theory: richPrismaTheory({
        summary:
          'A one-to-one relation is a one-to-many relation whose foreign key is unique. That single `@unique` is what stops a user from owning two profiles.',
        takeaway: 'One-to-one = FK + `@unique` on the FK column.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        heroCode:
          'model User {\n  id      Int      @id @default(autoincrement())\n  email   String   @unique\n  profile Profile?\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String?\n  user   User   @relation(fields: [userId], references: [id])\n  userId Int    @unique\n}',
        heroLang: 'prisma',
        heroWhy:
          'Identical to 1:N except for @unique on userId — and profile Profile? on the back side.',
        mentalModel:
          '**A unique foreign key turns 1:N into 1:1.** The physical storage is identical to a one-to-many relation: one table stores the foreign key column. Adding `@unique` guarantees the database will reject any second row pointing to the same parent.',
        explanation: [
          'In a 1:1 relation, decide which model owns the foreign key: Profile is child to User, so `userId` lives on Profile.',
          'Add `@unique` to `userId Int @unique` — this prevents duplicate foreign key values.',
          'The back-relation `profile Profile?` on User is singular and optional with `?`.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The 1:N starting point',
            codeSnippet:
              'model Profile {\n  id     Int  @id @default(autoincrement())\n  userId Int\n  user   User @relation(fields: [userId], references: [id])\n}',
            explanation:
              'Without @unique, one user could own multiple profile records (a standard 1:N relation).',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Make the foreign key unique',
            codeSnippet:
              'model Profile {\n  id     Int  @id @default(autoincrement())\n  userId Int  @unique // NEW\n  user   User @relation(fields: [userId], references: [id])\n}',
            explanation:
              'Adding @unique tells the database engine to enforce a unique constraint on userId, converting 1:N into 1:1.',
            isPhysicalColumn: true,
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Declare the back-relation on User',
            codeSnippet:
              'model User {\n  id      Int      @id @default(autoincrement())\n  profile Profile? // NEW\n}',
            explanation:
              'profile Profile? is singular (not a list) and optional with `?`, because a user may exist before creating a profile.',
            sentenceReading:
              'profile is an optional Profile, found by matching User.id to Profile.userId.',
            isVirtualRelation: true,
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: '1:1 = FK + @unique',
              description:
                'A 1:1 relation is simply a 1:N relation where the foreign key column is marked `@unique`.',
              badge: 'Core Rule',
            },
            {
              ruleNumber: 2,
              title: 'The back-relation is optional (?)',
              description:
                'Because a user is usually registered before their profile is filled out, `profile Profile?` uses `?` to allow null values.',
              badge: 'Optionality',
            },
          ],
        },
        howToThink: {
          bidirectionalCheck: {
            forward: 'One User has at most one Profile.',
            reverse: 'Each Profile belongs to exactly one User.',
          },
        },
        sqlBridge: {
          title: 'From SQL to Prisma',
          mappings: [
            {
              sql: 'userId INT UNIQUE',
              prisma: 'userId Int @unique',
              note: 'Physical unique foreign key column on profiles table',
            },
            {
              sql: 'FOREIGN KEY (userId) REFERENCES users(id)',
              prisma: 'user User @relation(fields: [userId], references: [id])',
              note: 'Relation attribute linking profile to user',
            },
            {
              sql: '(no equivalent)',
              prisma: 'profile Profile?',
              note: 'Singular optional code handle (no column in users table)',
              isVirtual: true,
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma04-c2-t1',
          title: 'Read a user with their profile',
          description: 'An optional relation loads as one nested object, not a list.',
          instructions: ['findUnique on `where: { id }`', 'Load the relation with `include`'],
          hint: '`include: { profile: true }` — singular, because the relation is 1:1.',
          scaffold: '-- Parent row of the 1:1 read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Only one profile can exist, so the loader returns an object.',
          cols: ['id', 'email'],
          select: [],
          includes: ['profile'],
          rows: 1,
          code0:
            'export async function getUserWithProfile(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n  });\n}',
          code1:
            'export async function getUserWithProfile(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { profile: true },\n  });\n}',
          rtype: 'User & { profile: Profile | null } | null',
        }),
        prismaSnippetTask({
          id: 'prisma04-c2-t2',
          title: 'Make the FK unique',
          description: 'Stop a user from owning two profiles.',
          instructions: ['Add `@unique` to `userId Int` on the Profile model'],
          hint: 'One extra `@unique` converts 1:N into 1:1.',
          scaffold: '-- The row the profile hangs off:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'A unique FK is the whole difference between 1:N and 1:1.',
          cols: ['id', 'email'],
          rows: 1,
          activeTab: 'schema',
          schemaSource:
            'model User {\n  id      Int      @id @default(autoincrement())\n  email   String   @unique\n  profile Profile?\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String?\n  user   User   @relation(fields: [userId], references: [id])\n  userId Int    @unique\n}',
          code0:
            'model Profile {\n  id     Int  @id @default(autoincrement())\n  user   User @relation(fields: [userId], references: [id])\n  userId Int\n}',
          code1:
            'model Profile {\n  id     Int  @id @default(autoincrement())\n  user   User @relation(fields: [userId], references: [id])\n  userId Int @unique\n}',
          need: ['userId Int @unique'],
        }),
      ],
    },
    {
      id: 'relation-many-to-many',
      order: 3,
      title: 'Many-to-Many — Implicit vs Explicit',
      shortDescription: 'A list on both sides, or a join model you own.',
      theory: richPrismaTheory({
        summary:
          'Prisma supports many-to-many two ways: implicit (a list on each side, Prisma owns the hidden join table) and explicit (you declare the join model). Choose explicit the moment the join row needs columns of its own.',
        takeaway: 'Lists on both sides = implicit; a join model = explicit.',
        sql: 'SELECT id, name\nFROM users\nWHERE id = 2;',
        heroCode:
          'model Post {\n  id         Int        @id @default(autoincrement())\n  title      String\n  categories Category[]\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
        heroLang: 'prisma',
        heroWhy: 'Two lists, one hidden join table — nothing for you to migrate by hand.',
        mentalModel:
          '**Who owns the join table?** In an implicit M:N relation, Prisma creates and manages `_CategoryToPost` under the hood. In an explicit relation, you declare `PostCategory` yourself with `@@id([postId, categoryId])`, enabling extra columns like `assignedAt DateTime`.',
        explanation: [
          'Implicit relations require lists on both sides: `categories Category[]` on Post and `posts Post[]` on Category.',
          'Explicit relations are required as soon as the link needs attributes (e.g. timestamp, role, or order index).',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Implicit many-to-many',
            codeSnippet:
              'model Post {\n  id         Int        @id @default(autoincrement())\n  categories Category[] // NEW\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  posts Post[]     // NEW\n}',
            explanation:
              'Prisma recognizes lists on both models and automatically generates a hidden junction table (_CategoryToPost).',
            isVirtualRelation: true,
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The limitation — storing relation metadata',
            codeSnippet:
              '// Implicit tables CANNOT store extra columns:\n// assignedAt DateTime\n// assignedBy String',
            explanation:
              'When you need to store data about the relationship itself (such as who assigned the tag or when), implicit join tables cannot hold those columns.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Explicit join table with custom columns',
            codeSnippet:
              'model PostCategory {\n  postId     Int\n  categoryId Int\n  post       Post     @relation(fields: [postId], references: [id])\n  category   Category @relation(fields: [categoryId], references: [id])\n  assignedAt DateTime @default(now()) // NEW: custom column!\n\n  @@id([postId, categoryId])\n}',
            explanation:
              'By defining the join model explicitly, you gain full control to store metadata on the relationship and key it with a composite primary key.',
            isPhysicalColumn: true,
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Implicit = Pure Linking',
              description:
                'Use implicit M:N when relations are pure links with no extra properties.',
              badge: 'Decision',
            },
            {
              ruleNumber: 2,
              title: 'Explicit = Custom Metadata',
              description:
                'Switch to an explicit join table the moment you need columns like `assignedAt` or `role`.',
              badge: 'Decision',
            },
            {
              ruleNumber: 3,
              title: 'Composite Primary Key (@@id)',
              description:
                'Explicit join models use `@@id([postId, categoryId])` to uniquely identify each link.',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL to Prisma',
          mappings: [
            {
              sql: 'CREATE TABLE _CategoryToPost (A INT, B INT)',
              prisma: 'categories Category[] + posts Post[]',
              note: 'Implicit M:N: Prisma manages the junction table automatically',
            },
            {
              sql: 'CREATE TABLE post_categories (post_id INT, category_id INT, PRIMARY KEY (post_id, category_id))',
              prisma: 'model PostCategory { ... @@id([postId, categoryId]) }',
              note: 'Explicit M:N: Developer defines and owns the junction model',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma04-c3-t1',
          title: 'Implicit join table',
          description: 'Posts and categories relate many-to-many without a join model.',
          instructions: ['`categories Category[]` on Post', '`posts Post[]` on Category'],
          hint: 'A relation needs a list on BOTH sides.',
          scaffold: '-- The rows behind the relation:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Both sides list the other, so Prisma generates the hidden join table.',
          cols: ['id', 'name'],
          rows: 1,
          activeTab: 'schema',
          schemaSource:
            'model Post {\n  id         Int        @id @default(autoincrement())\n  title      String\n  categories Category[]\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
          code0:
            'model Post {\n  id       Int      @id @default(autoincrement())\n  title    String\n  category Category\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post\n}',
          code1:
            'model Post {\n  id         Int        @id @default(autoincrement())\n  title      String\n  categories Category[]\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
          need: ['categories Category[]', 'posts Post[]'],
        }),
        prismaSnippetTask({
          id: 'prisma04-c3-t2',
          title: 'Explicit join model',
          description: 'Take ownership of the join table with a composite primary key.',
          instructions: ['Declare `model PostCategory`', 'Key it with `@@id([postId, categoryId])`'],
          hint: 'An explicit join model is a normal model holding two foreign keys.',
          scaffold: '-- The rows the join table points at:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 3;',
          why: 'Owning the join model lets the join row grow real columns later.',
          cols: ['id', 'name'],
          rows: 1,
          activeTab: 'schema',
          schemaSource:
            'model Post {\n  id         Int            @id @default(autoincrement())\n  title      String\n  categories PostCategory[]\n}\n\nmodel Category {\n  id    Int            @id @default(autoincrement())\n  name  String\n  posts PostCategory[]\n}\n\nmodel PostCategory {\n  postId     Int\n  categoryId Int\n  post       Post     @relation(fields: [postId], references: [id])\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  @@id([postId, categoryId])\n}',
          code0:
            'model Post {\n  id         Int            @id @default(autoincrement())\n  categories PostCategory[]\n}\n\nmodel Category {\n  id    Int            @id @default(autoincrement())\n  posts PostCategory[]\n}',
          code1:
            'model Post {\n  id         Int            @id @default(autoincrement())\n  categories PostCategory[]\n}\n\nmodel Category {\n  id    Int            @id @default(autoincrement())\n  posts PostCategory[]\n}\n\nmodel PostCategory {\n  postId     Int\n  categoryId Int\n  post       Post     @relation(fields: [postId], references: [id])\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  @@id([postId, categoryId])\n}',
          need: ['model PostCategory', '@@id([postId, categoryId])'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma04-challenge',
    title: 'Final Challenge — Social Graph Read',
    scenario: 'Load one member by email together with everything they authored.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma04-hw-1',
          title: 'Member feed loader',
          description: 'Return id + email for rafi@prisma.io and include their posts.',
          instructions: ['findUnique on `where: { email }`', 'Load `posts` with `include`'],
          hint: '`include: { posts: true }` next to `where`.',
          scaffold: '-- Parent half of the feed query:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'A unique lookup plus one relation load — no N+1, no manual join.',
          cols: ['id', 'email'],
          select: [],
          includes: ['posts'],
          noCols: ['name'],
          rows: 1,
          code0:
            'export async function loadFeed(email: string) {\n  return await prisma.user.findFirst({\n    where: { email },\n  });\n}',
          code1:
            'export async function loadFeed(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
        type: 'challenge',
      },
    ],
  },
};
