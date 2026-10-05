import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 7 — Reading Data + `select` vs `include`. */
export const Prisma_07_MODULE: ModuleData = {
  id: 'prisma-07',
  slug: 'reading-data-select-include',
  day: 7,
  title: 'Day 7 — Reading Data + select vs include',
  shortTitle: 'Reading Data',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description: 'Pick the right read method, then decide between a precise `select` and a relation `include`.',
  estimatedMinutes: 55,
  curriculumOrder: 7,
  displayLabel: 'Day 7',
  completionLearnings: [
    'Choose between findUnique, findUniqueOrThrow, findFirst and findMany',
    'Return only the columns the screen needs',
    'Know when `include` is the right answer',
    'Use select to trim payloads or include to load relations',
  ],
  concepts: [
    {
      id: 'read-methods',
      order: 1,
      title: 'findUnique, findUniqueOrThrow, findFirst & findMany',
      shortDescription: 'One row by unique key, one row by filter, or many rows.',
      theory: richPrismaTheory({
        summary:
          'Prisma provides targeted read methods: `findUnique` (one row, unique selector only, returns `T | null`), `findUniqueOrThrow` (one row by unique selector, returns `T` or throws P2025 NotFoundError), `findFirst` (one row by any criteria, returns `T | null`), and `findMany` (an array, never null). Crucially, `findUnique` and `findUniqueOrThrow` only accept `where` selectors marked `@id` or `@unique` in your schema—enforced at compile time by TypeScript.',
        takeaway:
          'findUnique requires an @id/@unique key; findUniqueOrThrow eliminates null checks; findFirst takes any filter; findMany returns an array.',
        sql: 'SELECT id, name\nFROM users\nWHERE id = 1;',
        heroCode:
          "const byId = await prisma.user.findUnique({ where: { id: 1 } });\nconst guaranteed = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });\nconst first = await prisma.user.findFirst({ where: { name: 'Alex' } });\nconst all = await prisma.user.findMany();",
        heroLang: 'typescript',
        heroWhy: 'Targeted read methods compile to optimal SQL while TypeScript enforces selector uniqueness.',
        mentalModel:
          '**Uniqueness & Nullability Contract Matrix.** When reading a single row, the compiler checks your intent: if querying by a unique index (`@id` or `@unique`), use `findUnique` so the database performs an indexed point lookup. If the row must exist (e.g. user editing their own profile), `findUniqueOrThrow` unwraps the type to `T` directly and throws P2025 on absence. For arbitrary non-unique searches, use `findFirst`. For collections, `findMany` returns `T[]` (empty list `[]` when no rows match, never `null`).',
        littleDetails: {
          title: 'Read Method Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Compile-time uniqueness enforcement',
              description: '`findUnique` and `findUniqueOrThrow` will fail TypeScript compilation if you pass a non-unique field into `where` (e.g. `{ where: { name: "Alex" } }` will produce a type error unless `name` has `@unique` in schema.prisma). Use `findFirst` for non-unique search criteria.',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 2,
              title: 'findUniqueOrThrow eliminates defensive null checks',
              description: 'In API route handlers, instead of writing `const user = await prisma.user.findUnique(...); if (!user) throw new NotFoundException();`, calling `findUniqueOrThrow` automatically rejects with a `PrismaClientKnownRequestError` (code P2025) and returns a non-nullable type.',
              badge: 'Productivity',
            },
            {
              ruleNumber: 3,
              title: 'findMany returns [] and is never null',
              description: 'When `findMany` matches 0 records, it returns an empty array `[]`. Never write `if (users === null)`—always check `if (users.length === 0)`.',
              badge: 'Null Safety',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Read Methods to SQL Queries',
          mappings: [
            {
              prisma: 'prisma.user.findUnique({ where: { id: 1 } })',
              sql: 'SELECT ... FROM users WHERE id = 1 LIMIT 1',
              note: 'Point lookup using primary key or unique index, compiled with a LIMIT 1 guard.',
            },
            {
              prisma: 'prisma.user.findFirst({ where: { name: "Alex" } })',
              sql: 'SELECT ... FROM users WHERE name = \'Alex\' LIMIT 1',
              note: 'Searches by arbitrary non-unique criteria and returns the first row encountered.',
            },
            {
              prisma: 'prisma.user.findMany({ where: { active: true } })',
              sql: 'SELECT ... FROM users WHERE active = true',
              note: 'Fetches all rows matching the filter predicate into an array.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Am I looking for a single row using its primary key or an @unique field?',
              answer: 'Use `findUnique` (if absence is normal) or `findUniqueOrThrow` (if absence is an error).',
            },
            {
              questionNumber: 2,
              question: 'Am I searching for a single record using non-unique criteria (e.g. status, category, date)?',
              answer: 'Use `findFirst`. TypeScript will not allow `findUnique` on non-unique fields.',
            },
            {
              questionNumber: 3,
              question: 'Do I expect zero, one, or multiple records?',
              answer: 'Use `findMany`. It always returns an array `T[]` and never returns null.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Select unique key in where argument',
            codeSnippet: 'await prisma.user.findUnique({\n  where: { id: 1 },\n});',
            explanation: 'TypeScript verifies that id is marked @id or @unique in schema.prisma before allowing compilation.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Query engine emits parameterized single-row lookup',
            codeSnippet: 'SELECT id, name\nFROM users\nWHERE id = 1;',
            explanation: 'The query engine generates a fast indexed lookup targeting exactly one row.',
            visualData: {
              type: 'sql_lens',
              title: 'Targeted Point Lookup',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Compiler infers nullable or unwrapped return type',
            codeSnippet: 'type Result = { id: number; name: string } | null;\n// or { id: number; name: string } with findUniqueOrThrow',
            explanation: 'TypeScript forces you to handle null checks unless findUniqueOrThrow is used.',
            visualData: {
              type: 'type_preview',
              title: 'Inferred Return Type',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma07-c1-t1',
          title: 'One row by its unique key',
          description: 'Return id + name for user 1 without scanning the table.',
          instructions: ['Use `findUnique`', 'Select `id` and `name` only'],
          hint: '`findUnique` only accepts a unique `where`.',
          scaffold: '-- Unique-key read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A unique key produces a single-row lookup.',
          cols: ['id', 'name'],
          noCols: ['email'],
          rows: 1,
          code0:
            'export async function getOne(id: number) {\n  return await prisma.user.findFirst({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function getOne(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string } | null',
        }),
        prismaReadTask({
          id: 'prisma07-c1-t2',
          title: 'One row by a non-unique filter',
          description: 'Find the first user called Alex.',
          instructions: ['Use `findFirst`', 'Filter on `where: { name: "Alex" }`'],
          hint: '`name` is not unique — `findUnique` would refuse it.',
          scaffold: '-- Filtered read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE name = 'Alex';",
          why: 'findFirst accepts any filter and still returns a single row.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function getAlex() {\n  return await prisma.user.findUnique({\n    where: { name: \'Alex\' },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function getAlex() {\n  return await prisma.user.findFirst({\n    where: { name: \'Alex\' },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string } | null',
        }),
        prismaReadTask({
          id: 'prisma07-c1-t3',
          title: 'Guaranteed lookup with findUniqueOrThrow',
          description:
            'Retrieve User 1 by unique id without returning a nullable type. Use findUniqueOrThrow so the compiler guarantees the record exists or throws an exception if missing.',
          instructions: [
            'Use `prisma.user.findUniqueOrThrow` with `where: { id }`',
            'Select `id` and `name`',
          ],
          hint: '`findUniqueOrThrow` avoids manual null checks by throwing NotFoundError when the row is absent.',
          scaffold: '-- Unique read requiring non-null record:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'findUniqueOrThrow removes defensive "if (!user)" guards in API services by throwing directly on record absence.',
          cols: ['id', 'name'],
          noCols: ['email'],
          rows: 1,
          code0:
            'export async function getRequiredUser(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function getRequiredUser(id: number) {\n  return await prisma.user.findUniqueOrThrow({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string }',
        }),
      ],
    },
    {
      id: 'select-vs-include',
      order: 2,
      title: 'Data Shaping (`select`) vs Relation Loading (`include`)',
      shortDescription: '`select` defines returned shape; `include` attaches relations to base shape.',
      theory: richPrismaTheory({
        summary:
          '`select` is a projection: you explicitly define the exact shape of the returned object by choosing which fields to retrieve. `include` is relation attachment: it preserves all scalar columns of the model and appends the requested relation. Combining both at the root level is rejected by TypeScript because `select` declares an exclusive field set while `include` implies a full base model. To shape both the parent model and related records without over-fetching, nest a `select` inside the relation field.\n\n**TypeScript Payload Typing:** Generated model interfaces (e.g. `User`) represent base scalar tables only—never joined relations. To type service helpers and components that consume relation-loaded models without compile errors, derive the exact payload type using `Prisma.UserGetPayload<{ include: { posts: true } }>` or `{ select: ... }`.',
        takeaway:
          '`select` projects specific fields; `include` appends relations. Derive payload types with `Prisma.UserGetPayload<{ include: ... }>` for end-to-end type safety.',
        sql: 'SELECT id, email\nFROM users\nWHERE id = 3;',
        heroCode:
          "import { Prisma } from '@prisma/client';\n\ntype UserWithPosts = Prisma.UserGetPayload<{\n  include: { posts: true };\n}>;\n\nexport function renderFeed(user: UserWithPosts) {\n  console.log(`${user.email} authored ${user.posts.length} posts`);\n}",
        heroLang: 'typescript',
        heroWhy: 'Prisma.UserGetPayload infers exact relational types, eliminating manual interface drift.',
        mentalModel:
          '**Projection vs Relation Attachment.** `select` restricts scalar columns to a lean subset (`SELECT id, email`). `include` retrieves all base columns and issues relation queries (`SELECT * FROM users` + `SELECT * FROM posts WHERE authorId IN (...)`). Use `Prisma.UserGetPayload<T>` to derive strong TypeScript types matching exact query selections.',
        littleDetails: {
          title: 'Data Shaping Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'select and include are mutually exclusive at the root level',
              description: 'You cannot pass both `{ select: { name: true }, include: { posts: true } }` in the same query. TypeScript will reject this with a compile error. To fetch specific scalars AND relations, nest the relation selection inside `select: { name: true, posts: { select: { title: true } } }`.',
              badge: 'Syntax Rule',
            },
            {
              ruleNumber: 2,
              title: 'Derive relational types with Prisma.UserGetPayload',
              description: 'The base `User` type generated by Prisma only includes scalar fields. When you query with `include` or `select`, extract the exact TypeScript return type using `type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>` to prevent interface drift across your codebase.',
              badge: 'Typing',
            },
            {
              ruleNumber: 3,
              title: 'Prisma prevents N+1 query traps',
              description: 'When using `include: { posts: true }`, Prisma does not execute one query per row. It executes 1 query for the parent rows and 1 batch query for all related posts (`WHERE authorId IN (...)`), combining them in memory.',
              badge: 'Performance',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Selection to SQL Queries',
          mappings: [
            {
              prisma: 'select: { id: true, email: true }',
              sql: 'SELECT id, email FROM users',
              note: 'Projects only the requested columns, keeping unwanted fields off the network.',
            },
            {
              prisma: 'include: { posts: true }',
              sql: 'SELECT * FROM users; SELECT * FROM posts WHERE authorId IN (...);',
              note: 'Eagerly loads related models via secondary batch queries without N+1 overhead.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Do I only need 1 or 2 specific columns for a compact UI widget or dropdown?',
              answer: 'Use `select`. Unselected columns are excluded from the SQL SELECT statement.',
            },
            {
              questionNumber: 2,
              question: 'Do I need the complete model plus its related entities?',
              answer: 'Use `include: { relation: true }`. All base scalar columns are preserved.',
            },
            {
              questionNumber: 3,
              question: 'Do I need specific columns from the parent AND specific columns from the child relation?',
              answer: 'Use nested `select`: `select: { id: true, posts: { select: { title: true } } }`.',
            },
          ],
        },
        explanation: [
          'Root-level `select` and `include` cannot be mixed — choose either a custom projection or full-model relation inclusion.',
          'To prune fields on joined relations, nest `select` inside relation properties.',
          'Always use `Prisma.ModelGetPayload<{ include: ... }>` instead of writing manual TypeScript interfaces for relation queries.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Scalar projection with `select`',
            codeSnippet: 'SELECT id, email\nFROM users\nWHERE id = 3;',
            explanation:
              'Specifying `select: { id: true, email: true }` compiles directly to a narrow SQL SELECT query, keeping unneeded columns off the network.',
            visualData: {
              type: 'sql_lens',
              title: 'Generated SQL Projection',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Relation query generation with `include`',
            codeSnippet: 'SELECT id, title, content, "authorId"\nFROM posts\nWHERE "authorId" = 3;',
            explanation:
              'Specifying `include: { posts: true }` retains base user scalars and issues a parameterized relation query for related posts.',
            visualData: {
              type: 'sql_lens',
              title: 'Related Posts Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'TypeScript payload extraction with `Prisma.UserGetPayload`',
            codeSnippet:
              'type UserWithPosts = Prisma.UserGetPayload<{\n  include: { posts: true };\n}>;\n// Inferred: User & { posts: Post[] }',
            explanation:
              'Deriving payload types prevents type drift across API handlers and React component props without manual interface duplication.',
            visualData: {
              type: 'type_preview',
              title: 'Inferred Relational Payload',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma07-c2-t1',
          title: 'Trim the payload',
          description: 'The login screen needs id + email and nothing else.',
          instructions: ['Use `select` with `id` and `email`'],
          hint: 'Every selected field must be set to `true`.',
          scaffold: '-- Lean projection:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 3;',
          why: 'Naming the columns keeps card data and wide fields off the wire.',
          cols: ['id', 'email'],
          noCols: ['name'],
          rows: 1,
          code0:
            'export async function loginRow(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true },\n  });\n}',
          code1:
            'export async function loginRow(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
        }),
        prismaReadTask({
          id: 'prisma07-c2-t2',
          title: 'Load the relation instead',
          description: 'This screen needs the whole user plus their posts.',
          instructions: ['Use `include` for `posts`', 'Keep every scalar column'],
          hint: '`include: { posts: true }` — no `select` at the same level.',
          scaffold: '-- Parent row of the include read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'include keeps the scalars and adds one relation query.',
          cols: ['id', 'email'],
          select: [],
          includes: ['posts'],
          rows: 1,
          code0:
            'export async function feed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function feed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
        prismaSnippetTask({
          id: 'prisma07-c2-t3',
          title: 'Fine-grained nested relation projection',
          description: 'Fetch user posts while restricting columns on both the parent and child models.',
          instructions: ['Use `select` with `id: true`', 'Nest `select: { title: true }` under `posts`'],
          hint: '`posts: { select: { title: true } }` inside your outer `select`.',
          scaffold: '-- Lean parent row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'Nested select avoids over-fetching on both parent and related models.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function userFeed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true },\n  });\n}',
          code1:
            'export async function userFeed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: {\n      id: true,\n      posts: { select: { title: true } },\n    },\n  });\n}',
          need: ['posts: {', 'select: { title: true }'],
          ban: ['include:'],
          rtype: '{ id: number; posts: { title: string }[] } | null',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma07-challenge',
    title: 'Final Challenge — Profile & Feed Loader',
    scenario: 'One request, one unique lookup, one relation load.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma07-hw-1',
          title: 'Fine-Grained Profile Payload — Selective Relation Projection',
          description:
            'Load user rafi@prisma.io projecting only `id` and `email`, while nesting a selective projection on `posts` to retrieve only their `title`. Prevent over-fetching on both parent and related models.',
          instructions: [
            'findUnique on `where: { email }`',
            'Select `id: true` and `email: true`',
            'Nest `posts: { select: { title: true } }` inside your outer `select`',
          ],
          hint: 'Use `select` instead of `include`. Inside `select`, nest `posts: { select: { title: true } }`.',
          scaffold: '-- Lean parent row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Nested select avoids over-fetching on both parent and related models, omitting sensitive scalars and relation IDs.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function profile(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    include: { posts: true },\n  });\n}',
          code1:
            'export async function profile(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: {\n      id: true,\n      email: true,\n      posts: { select: { title: true } },\n    },\n  });\n}',
          need: ['where: { email }', 'posts: {', 'select: { title: true }'],
          ban: ['include:'],
          rtype: '{ id: number; email: string; posts: { title: string }[] } | null',
        }),
        type: 'challenge',
      },
    ],
  },
};
