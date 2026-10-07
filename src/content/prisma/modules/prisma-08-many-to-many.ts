import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 8 — Many-to-Many Relations (Phase 4.3).
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: Implicit Many-to-Many Relations (categories Category[] & posts Post[])
 *   Concept 2: Explicit Many-to-Many with Join Models (PostTag with @@id([postId, tagId]))
 *   Concept 3: Join Models with Relationship Metadata (assignedAt, role, status)
 *   Challenge: Production Tagged Content Graph with Metadata
 */
export const Prisma_08_MODULE: ModuleData = {
  id: 'prisma-08',
  slug: 'many-to-many-relations',
  day: 8,
  title: 'Day 8 — Many-to-Many Relations',
  shortTitle: 'Many-to-Many Relations',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description:
    'Master Many-to-Many architectures: model zero-boilerplate implicit relations with automated join tables, build explicit join models with composite primary keys @@id, and store rich relationship metadata.',
  estimatedMinutes: 55,
  curriculumOrder: 8,
  displayLabel: 'Day 8',
  completionLearnings: [
    'Model effortless Many-to-Many relations using Prisma implicit relation conventions',
    'Understand how Prisma generates and manages hidden join tables (_CategoryToPost)',
    'Construct explicit join models using composite primary keys @@id([postId, tagId])',
    'Attach rich relationship metadata (assignedAt, role) to join entities',
    'Query and traverse complex Many-to-Many graphs efficiently in Prisma Client',
  ],
  concepts: [
    {
      id: 'implicit-many-to-many',
      order: 1,
      title: 'Implicit Many-to-Many Relations',
      shortDescription:
        'Connect models in Many-to-Many relationships with zero join-table boilerplate.',
      theory: richPrismaTheory({
        summary:
          'In standard SQL, a Many-to-Many (M:N) relationship strictly requires a third table (a join table) with two foreign keys. Prisma provides an elegant convention called **Implicit Many-to-Many Relations**: if you declare a list of model types on both models (`tags Tag[]` on Post, and `posts Post[]` on Tag) without `@relation` attributes, Prisma automatically provisions and manages an underlying database join table (`_PostToTag`) behind the scenes.',
        takeaway:
          'Implicit M:N relations require only list fields on both models (tags Tag[] and posts Post[]); Prisma manages the join table automatically.',
        sql: 'CREATE TABLE _PostToTag (A INTEGER REFERENCES posts(id), B INTEGER REFERENCES tags(id));',
        heroCode:
          'model Post {\n  id   Int   @id @default(autoincrement())\n  tags Tag[]\n}\n\nmodel Tag {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
        heroLang: 'prisma',
        heroWhy: 'Defines an implicit Many-to-Many relation with zero boilerplate.',
        mentalModel:
          '**The Invisible Bridge.** You do not have to write a `PostTag` join model or declare composite keys. Prisma looks at `tags Tag[]` on Post and `posts Post[]` on Tag, infers the M:N relationship, and creates a two-column join table (`A` pointing to Post, `B` pointing to Tag) with composite primary keys and cascading foreign keys automatically.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare list field on first model',
            codeSnippet: 'tags Tag[]',
            explanation: 'Post references an array of related Tag entities.',
            visualData: { type: 'type_preview', title: 'First List Field', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Declare matching list field on second model',
            codeSnippet: 'posts Post[]',
            explanation: 'Tag references an array of related Post entities.',
            visualData: { type: 'type_preview', title: 'Second List Field', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Prisma generates hidden join table',
            codeSnippet: 'CREATE TABLE "_PostToTag" ("A" INTEGER NOT NULL, "B" INTEGER NOT NULL);',
            explanation: 'Prisma Migrate provisions the table with composite indexes on A and B.',
            visualData: { type: 'sql_lens', title: 'Automated Join DDL', details: null },
          },
        ],
        littleDetails: {
          title: 'Implicit M:N Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Both sides must use single @id primary keys',
              description: 'Implicit Many-to-Many relations require both participating models to have a single-field primary key marked with `@id` (`Int` or `String`). Composite `@id` is not supported.',
              badge: 'Constraint',
            },
            {
              ruleNumber: 2,
              title: 'Customizing join table names',
              description: 'If you have multiple M:N relations between the same two models, you can differentiate them with a relation name: `@relation("PinnedPosts")`.',
              badge: 'Disambiguation',
            },
            {
              ruleNumber: 3,
              title: 'Cannot store metadata on implicit tables',
              description: 'Implicit join tables only store the two foreign keys `A` and `B`. If you need columns like `addedAt` or `role`, you must use an explicit join model.',
              badge: 'Limitation',
            },
          ],
        },
        sqlBridge: {
          title: 'Implicit M:N to SQL Join Tables',
          mappings: [
            {
              sql: 'CREATE TABLE _CategoryToPost (\n  A INTEGER REFERENCES categories(id) ON DELETE CASCADE,\n  B INTEGER REFERENCES posts(id) ON DELETE CASCADE\n);',
              prisma: 'model Post { categories Category[] }\nmodel Category { posts Post[] }',
              note: 'Prisma manages the join table and cascading foreign keys',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma08-c1-t1',
          title: 'Define Implicit M:N: Connect Post and Tag models',
          description: 'Establish an implicit Many-to-Many relation between Post and Tag in schema.prisma.',
          instructions: [
            'Inside `model Post`, add the list field `tags Tag[]`',
            'Inside `model Tag`, add the list field `posts Post[]`',
          ],
          hintLadder: [
            'Add `tags Tag[]` inside `model Post`.',
            'Add `posts Post[]` inside `model Tag`.',
            'Do not add any `@relation` attribute — Prisma infers the join table automatically.',
          ],
          scaffold: '-- Validating implicit M:N schema definition:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'List fields on both sides without relation attributes create an implicit M:N table.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Post {\n  id    Int    @id @default(autoincrement())\n  title String\n  // Add tags collection:\n\n}\n\nmodel Tag {\n  id    Int    @id @default(autoincrement())\n  name  String\n  // Add posts collection:\n\n}',
          code1: 'model Post {\n  id    Int    @id @default(autoincrement())\n  title String\n  tags  Tag[]\n}\n\nmodel Tag {\n  id    Int    @id @default(autoincrement())\n  name  String\n  posts Post[]\n}',
          need: ['tags Tag[]', 'posts Post[]'],
        }),
        prismaReadTask({
          id: 'prisma08-c1-t2',
          title: 'Query Relational Collections: Load user posts with title projection',
          description: 'Fetch user id 1 with their related posts using nested select.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: 1 }`',
            'Use `select` to project `name: true` and `posts: { select: { title: true } }`',
            'Return the resulting object',
          ],
          hintLadder: [
            'Target user 1 with `where: { id: 1 }`.',
            'Select `name: true` and nested `posts: { select: { title: true } }`.',
            'Write: `return await prisma.user.findUnique({ where: { id: 1 }, select: { name: true, posts: { select: { title: true } } } });`',
          ],
          scaffold: '-- Fetch user 1 posts:\nSELECT name FROM users WHERE id = 99;',
          solutionSql: 'SELECT name FROM users WHERE id = 1;',
          why: 'Nested select traverses relational collections safely and efficiently.',
          select: ['name'],
          cols: ['name'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getUserContentGraph() {\n  // Fetch user 1 with post titles:\n\n}',
          code1: 'export async function getUserContentGraph() {\n  return await prisma.user.findUnique({\n    where: { id: 1 },\n    select: {\n      name: true,\n      posts: {\n        select: {\n          title: true,\n        },\n      },\n    },\n  });\n}',
          rtype: '{ name: string; posts: { title: string }[] } | null',
        }),
      ],
    },
    {
      id: 'explicit-join-models',
      order: 2,
      title: 'Explicit Many-to-Many with Dedicated Join Models',
      shortDescription:
        'Build explicit join models with composite primary keys @@id([postId, tagId]).',
      theory: richPrismaTheory({
        summary:
          'When you need to control the join table directly or prepare for relationship metadata, you declare an **Explicit Many-to-Many Relation**. Instead of list fields pointing directly at each other, both models point to a dedicated join model (e.g. `PostTag`). The join model holds two physical foreign key scalars (`postId Int` and `tagId Int`), two 1:N relations, and a composite primary key directive: `@@id([postId, tagId])`.',
        takeaway:
          'Explicit M:N uses a dedicated model with two foreign keys and a composite primary key @@id([a, b]).',
        sql: 'CREATE TABLE post_tags (post_id INTEGER REFERENCES posts(id), tag_id INTEGER REFERENCES tags(id), PRIMARY KEY (post_id, tag_id));',
        heroCode:
          'model Post {\n  id   Int       @id @default(autoincrement())\n  tags PostTag[]\n}\n\nmodel Tag {\n  id    Int       @id @default(autoincrement())\n  posts PostTag[]\n}\n\nmodel PostTag {\n  postId Int\n  tagId  Int\n  post   Post @relation(fields: [postId], references: [id])\n  tag    Tag  @relation(fields: [tagId], references: [id])\n\n  @@id([postId, tagId])\n}',
        heroLang: 'prisma',
        heroWhy: 'Declares an explicit join model with composite primary key.',
        mentalModel:
          '**The Deconstructed Junction.** An explicit M:N relation is simply two standard 1:N relations meeting in the middle at a join table. `Post -> PostTag` is 1:N. `Tag -> PostTag` is 1:N. The composite primary key `@@id([postId, tagId])` ensures that any `(postId, tagId)` pair can exist at most once.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare the join model with two foreign keys',
            codeSnippet: 'model PostTag {\n  postId Int\n  tagId  Int\n}',
            explanation: 'Holds the scalar foreign keys pointing to both parent models.',
            visualData: { type: 'type_preview', title: 'Join Model FKs', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Add 1:N relation directives on join model',
            codeSnippet: 'post Post @relation(fields: [postId], references: [id])\ntag  Tag  @relation(fields: [tagId], references: [id])',
            explanation: 'Each side of the join model is a standard 1:N relation.',
            visualData: { type: 'type_preview', title: 'Join Model Directives', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Enforce composite primary key',
            codeSnippet: '@@id([postId, tagId])',
            explanation: 'Combines both foreign keys into a composite primary key, preventing duplicate links.',
            visualData: { type: 'type_preview', title: 'Composite @@id', details: null },
          },
        ],
        littleDetails: {
          title: 'Explicit Join Model Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Composite @@id replaces surrogate id',
              description: 'Because every `(postId, tagId)` combination is inherently unique, join models typically use `@@id([postId, tagId])` instead of a separate autoincrement `id Int @id`.',
              badge: 'Schema Design',
            },
            {
              ruleNumber: 2,
              title: 'Cascade deletes on join models',
              description: 'Join models should almost always attach `onDelete: Cascade` to both relation directives so deleting either parent automatically cleans up the join row.',
              badge: 'Lifecycle',
            },
            {
              ruleNumber: 3,
              title: 'Querying through the join model',
              description: 'In queries, traversing an explicit M:N requires nesting through the join model: `posts: { include: { tags: { include: { tag: true } } } }`.',
              badge: 'Query Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'Explicit Join Model to SQL DDL',
          mappings: [
            {
              sql: 'PRIMARY KEY (post_id, tag_id)',
              prisma: '@@id([postId, tagId])',
              note: 'Composite primary key spanning both foreign key columns',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma08-c2-t1',
          title: 'Build Explicit Join Model: Author PostTag with composite @@id',
          description: 'Declare the complete PostTag explicit join model linking Post and Tag.',
          instructions: [
            'Declare `model PostTag`',
            'Add foreign key fields `postId Int` and `tagId Int`',
            'Add relation `post Post @relation(fields: [postId], references: [id])`',
            'Add relation `tag Tag @relation(fields: [tagId], references: [id])`',
            'Declare composite primary key `@@id([postId, tagId])` at the bottom',
          ],
          hintLadder: [
            'Inside `model PostTag`, define `postId Int` and `tagId Int`.',
            'Add both `@relation` attributes.',
            'End with `@@id([postId, tagId])`.',
          ],
          scaffold: '-- Validating explicit join model with composite @@id:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Explicit join models give full control over table structure and composite constraints.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: '// Author the PostTag join model below:\n\n',
          code1:
            'model PostTag {\n  postId Int\n  tagId  Int\n  post   Post @relation(fields: [postId], references: [id])\n  tag    Tag  @relation(fields: [tagId], references: [id])\n\n  @@id([postId, tagId])\n}',
          need: [
            'model PostTag',
            'postId Int',
            'tagId Int',
            '@relation(fields: [postId], references: [id])',
            '@relation(fields: [tagId], references: [id])',
            '@@id([postId, tagId])',
          ],
        }),
        prismaReadTask({
          id: 'prisma08-c2-t2',
          title: 'Query Multi-Table Data: Retrieve user contact information',
          description: 'Fetch user id 2 projecting id and email using findUnique.',
          instructions: [
            'Call `await prisma.user.findUnique()` targeting `where: { id: 2 }`',
            'Use `select` to project `id: true` and `email: true`',
            'Return the user record',
          ],
          hintLadder: [
            'Target user 2: `where: { id: 2 }`.',
            'Select `id: true` and `email: true`.',
            'Write: `return await prisma.user.findUnique({ where: { id: 2 }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- Fetch user 2 contact:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 2;',
          why: 'findUnique retrieves specific user records by primary key.',
          select: ['id', 'email'],
          cols: ['id', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getUserContact() {\n  // Fetch user 2 id and email:\n\n}',
          code1: 'export async function getUserContact() {\n  return await prisma.user.findUnique({\n    where: { id: 2 },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
        }),
      ],
    },
    {
      id: 'join-model-metadata',
      order: 3,
      title: 'Join Models with Relationship Metadata',
      shortDescription:
        'Attach attributes like assignedAt, role, or order directly to the join table.',
      theory: richPrismaTheory({
        summary:
          'In many real-world applications, a relationship itself possesses state. For instance, a user does not merely belong to an organization — they have a `role` ("ADMIN", "MEMBER"), an `assignedAt` timestamp, and a `status` ("ACTIVE"). With explicit join models, adding relationship metadata is as straightforward as adding regular scalar fields directly onto the join model block.',
        takeaway:
          'Explicit join models allow you to store attributes on the relationship itself, such as timestamps and roles.',
        sql: 'ALTER TABLE memberships ADD COLUMN role VARCHAR(20) DEFAULT \'MEMBER\';',
        heroCode:
          'model Membership {\n  userId     Int\n  teamId     Int\n  role       String   @default("MEMBER")\n  assignedAt DateTime @default(now())\n\n  user User @relation(fields: [userId], references: [id])\n  team Team @relation(fields: [teamId], references: [id])\n\n  @@id([userId, teamId])\n  @@index([role])\n}',
        heroLang: 'prisma',
        heroWhy: 'Stores role and timestamp directly on the Membership join model.',
        mentalModel:
          '**The Relationship as an Entity.** When a connection between two models has its own attributes (when did they connect? what role do they play?), the relationship has matured into a first-class domain entity. Explicit join models provide the exact schema surface needed to capture this domain logic.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Add scalar attributes to join model',
            codeSnippet: 'role       String   @default("MEMBER")\nassignedAt DateTime @default(now())',
            explanation: 'Attributes belong to the relationship row itself.',
            visualData: { type: 'type_preview', title: 'Relationship Metadata', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Index metadata columns for filtering',
            codeSnippet: '@@index([role])',
            explanation: 'Accelerates queries filtering members by their role.',
            visualData: { type: 'type_preview', title: 'Metadata Index', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Traverse metadata in queries',
            codeSnippet: 'prisma.team.findUnique({\n  where: { id: 1 },\n  include: {\n    memberships: {\n      where: { role: "ADMIN" },\n      include: { user: true }\n    }\n  }\n})',
            explanation: 'Filter and inspect relationship metadata directly in Prisma Client queries.',
            visualData: { type: 'sql_lens', title: 'Traverse Join Metadata', details: null },
          },
        ],
        littleDetails: {
          title: 'Join Metadata Best Practices',
          rules: [
            {
              ruleNumber: 1,
              title: 'Default values on relationship fields',
              description: 'Always supply `@default()` for attributes like `assignedAt DateTime @default(now())` and `role String @default("MEMBER")` so connecting records does not require verbose inputs.',
              badge: 'Defaults',
            },
            {
              ruleNumber: 2,
              title: 'Querying join models directly',
              description: 'Because explicit join models are full Prisma models, you can query `prisma.membership.findMany({ where: { role: "ADMIN" } })` directly without going through Team or User.',
              badge: 'First-Class',
            },
            {
              ruleNumber: 3,
              title: 'Index high-cardinality metadata',
              description: 'If you frequently filter relationships by status or role, add `@@index([role])` or `@@index([userId, role])` to the join model.',
              badge: 'Performance',
            },
          ],
        },
        sqlBridge: {
          title: 'Join Attributes in SQL',
          mappings: [
            {
              sql: 'role VARCHAR(20) DEFAULT \'MEMBER\',\nassigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
              prisma: 'role String @default("MEMBER")\nassignedAt DateTime @default(now())',
              note: 'Metadata columns stored directly on the junction table',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma08-c3-t1',
          title: 'Add Relationship Metadata: Enrich Membership join model',
          description: 'Attach role and assignedAt attributes with defaults to the Membership join model.',
          instructions: [
            'Inside `model Membership`, keep `userId Int` and `teamId Int`',
            'Add `role String @default("MEMBER")`',
            'Add `assignedAt DateTime @default(now())`',
            'Preserve the relations and `@@id([userId, teamId])`',
          ],
          hintLadder: [
            'Add `role String @default("MEMBER")`.',
            'Add `assignedAt DateTime @default(now())`.',
            'Ensure `@@id([userId, teamId])` remains at the bottom of the block.',
          ],
          scaffold: '-- Validating relationship metadata on Membership:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Storing attributes on the join model captures relationship-specific state.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Membership {\n  userId Int\n  teamId Int\n  // Add role with default "MEMBER" and assignedAt below:\n\n  @@id([userId, teamId])\n}',
          code1: 'model Membership {\n  userId     Int\n  teamId     Int\n  role       String   @default("MEMBER")\n  assignedAt DateTime @default(now())\n\n  @@id([userId, teamId])\n}',
          need: ['role String @default("MEMBER")', 'assignedAt DateTime @default(now())'],
        }),
        prismaReadTask({
          id: 'prisma08-c3-t2',
          title: 'Selective Member Query: Fetch user profile directory',
          description: 'Fetch user id 1 projecting id, name, and email using findUnique.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: 1 }`',
            'Use `select` to return `id: true`, `name: true`, and `email: true`',
            'Return the user record',
          ],
          hintLadder: [
            'Filter by `where: { id: 1 }`.',
            'Select all three fields in `select`.',
            'Write: `return await prisma.user.findUnique({ where: { id: 1 }, select: { id: true, name: true, email: true } });`',
          ],
          scaffold: '-- Fetch user 1 full profile:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'findUnique efficiently projects specific fields on unique lookups.',
          select: ['id', 'name', 'email'],
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function getMemberDetails() {\n  // Fetch user 1 with id, name, email:\n\n}',
          code1: 'export async function getMemberDetails() {\n  return await prisma.user.findUnique({\n    where: { id: 1 },\n    select: {\n      id: true,\n      name: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string } | null',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma08-challenge',
    title: 'Final Challenge — Production Tagged Content Graph with Metadata',
    scenario:
      'You are building a content management tagging system. Articles and Topics have a Many-to-Many relationship with metadata: each connection records a relevance score and the timestamp it was linked. Author the complete explicit join model ArticleTopic in schema.prisma with composite primary key, metadata attributes, cascading relations, and a secondary index.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaSnippetTask({
        id: 'prisma08-hw-1',
        title: 'Architect ArticleTopic Join Model with Metadata from Scratch',
        description:
          'Author the complete ArticleTopic join model connecting Article and Topic: include foreign keys articleId Int and topicId Int, cascading relations, relevance Float @default(1.0), assignedAt DateTime @default(now()), composite primary key @@id([articleId, topicId]), and secondary index @@index([relevance]).',
        instructions: [
          'Declare `model ArticleTopic`',
          'Add foreign keys: `articleId Int` and `topicId Int`',
          'Add `article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)`',
          'Add `topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)`',
          'Add metadata: `relevance Float @default(1.0)` and `assignedAt DateTime @default(now())`',
          'Declare composite primary key `@@id([articleId, topicId])`',
          'Add secondary index `@@index([relevance])`',
        ],
        hintLadder: [
          'Declare both foreign keys and both `@relation` attributes with `onDelete: Cascade`.',
          'Add `relevance Float @default(1.0)` and `assignedAt DateTime @default(now())`.',
          'End the model block with `@@id([articleId, topicId])` and `@@index([relevance])`.',
        ],
        scaffold: '-- Validating complete ArticleTopic join model with metadata:\nSELECT id, name FROM users WHERE id = 99;',
        solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
        why: 'Combines explicit join models, composite primary keys, metadata scalars, cascading actions, and performance indexes.',
        cols: ['id', 'name'],
        rows: 1,
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'schema',
        code0: '// Architect ArticleTopic join model with metadata below:\n\n',
        code1:
          'model ArticleTopic {\n  articleId  Int\n  topicId    Int\n  article    Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)\n  topic      Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)\n  relevance  Float    @default(1.0)\n  assignedAt DateTime @default(now())\n\n  @@id([articleId, topicId])\n  @@index([relevance])\n}',
        need: [
          'model ArticleTopic',
          'articleId Int',
          'topicId Int',
          '@relation(fields: [articleId], references: [id], onDelete: Cascade)',
          '@relation(fields: [topicId], references: [id], onDelete: Cascade)',
          'relevance Float @default(1.0)',
          'assignedAt DateTime @default(now())',
          '@@id([articleId, topicId])',
          '@@index([relevance])',
        ],
      }),
    ],
  },
};
