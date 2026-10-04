import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

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
      theory: prismaTheory(
        'A one-to-many relation is a foreign key plus a list. The many-side owns the FK column (`authorId`), the one-side only declares the list (`posts Post[]`), and `include` loads the related rows in a second query.',
        'FK lives on the many-side; `include` loads the list.',
        'SELECT id, name\nFROM users\nWHERE id = 1;',
        'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}\n\nmodel Post {\n  id       Int  @id @default(autoincrement())\n  title    String\n  author   User @relation(fields: [authorId], references: [id])\n  authorId Int\n}',
        'prisma',
        '`posts Post[]` on the one-side, `authorId` on the many-side — nothing else is stored.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma04-c1-t1',
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
          code0:
            'export async function getAuthorWithPosts(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n  });\n}',
          code1:
            'export async function getAuthorWithPosts(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
        prismaSnippetTask({
          id: 'prisma04-c1-t2',
          title: 'Own the foreign key',
          description: 'The Post model must store the FK column it is keyed by.',
          instructions: ['`@relation(fields: [authorId], references: [id])`', '`authorId Int`'],
          hint: '`fields` names the FK column, `references` names the target key.',
          scaffold: '-- The relation still resolves to this read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 3;',
          why: 'The many-side owns the FK column — that is what makes 1:N possible.',
          cols: ['id', 'name'],
          rows: 1,
          activeTab: 'schema',
          code0:
            'model Post {\n  id     Int  @id @default(autoincrement())\n  title  String\n  author User\n}',
          code1:
            'model Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n}',
          need: ['@relation(fields: [authorId], references: [id])', 'authorId Int'],
        }),
      ],
    },
    {
      id: 'relation-one-to-one',
      order: 2,
      title: 'One-to-One (1:1)',
      shortDescription: 'Same FK shape as 1:N — but the FK column is `@unique`.',
      theory: prismaTheory(
        'A one-to-one relation is a one-to-many relation whose foreign key is unique. That single `@unique` is what stops a user from owning two profiles.',
        'One-to-one = FK + `@unique` on the FK column.',
        "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        'model User {\n  id      Int      @id @default(autoincrement())\n  email   String   @unique\n  profile Profile?\n}\n\nmodel Profile {\n  id     Int    @id @default(autoincrement())\n  bio    String?\n  user   User   @relation(fields: [userId], references: [id])\n  userId Int    @unique\n}',
        'prisma',
        'Identical to 1:N except for `@unique` on `userId` — and `profile Profile?` on the back side.',
      ),
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
      theory: prismaTheory(
        'Prisma supports many-to-many two ways: implicit (a list on each side, Prisma owns the hidden join table) and explicit (you declare the join model). Choose explicit the moment the join row needs columns of its own.',
        'Lists on both sides = implicit; a join model = explicit.',
        'SELECT id, name\nFROM users\nWHERE id = 2;',
        'model Post {\n  id         Int        @id @default(autoincrement())\n  title      String\n  categories Category[]\n}\n\nmodel Category {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
        'prisma',
        'Two lists, one hidden join table — nothing for you to migrate by hand.',
      ),
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
