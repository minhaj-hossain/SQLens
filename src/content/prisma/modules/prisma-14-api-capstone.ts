import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 14 — Prisma Capstone & Synthesis. */
export const Prisma_14_MODULE: ModuleData = {
  id: 'prisma-14',
  slug: 'prisma-capstone-synthesis',
  day: 14,
  title: 'Day 14 — Prisma Capstone & Synthesis',
  shortTitle: 'Capstone',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Synthesise the full Prisma curriculum: reads, writes, relations, transactions, error trapping, and the raw SQL escape hatch.',
  estimatedMinutes: 70,
  curriculumOrder: 14,
  displayLabel: 'Day 14',
  completionLearnings: [
    'Survey the five Prisma query families in one mental model',
    'Combine `select` projection, `orderBy`, and `take` for deterministic reads',
    'Wrap multi-step writes in `$transaction` and trap `P2002` inline',
    'Choose the right deletion strategy: hard delete, soft delete, or cascade',
  ],
  concepts: [
    {
      // NOTE: 'clean-architecture' (Router → Controller → Service OOP layering) and
      // 'crud-lifecycle' (organizing CRUD into class methods) are out-of-scope per the
      // transformation plan. Replaced with Prisma-native synthesis concepts.
      id: 'prisma-query-toolbox',
      order: 1,
      title: 'The Prisma Query Toolbox — Full Survey',
      shortDescription: 'Five query families, one mental model map.',
      theory: prismaTheory(
        'You now have five query families at hand. **Reads:** `findUnique / findFirst / findMany / findUniqueOrThrow`. **Writes:** `create / update / delete / upsert / createMany / updateMany / deleteMany`. **Nested writes:** `create`, `connect`, `connectOrCreate` inside a relation field. **Transactions:** `$transaction([...])` for a fixed batch; `$transaction(async tx => ...)` for interactive logic. **Raw SQL:** `$queryRaw` tagged template when the builder cannot express the query. Every write returns the row shaped by `select`; every error is a typed code.',
        'Five families. All compose. All return typed results.',
        'SELECT id, email\nFROM users\nORDER BY id ASC;',
        '// Read     prisma.user.findMany(...)\n// Write    prisma.user.create({ data, select })\n// Nested   prisma.user.create({ data: { posts: { create } } })\n// Tx       prisma.$transaction([...])\n// Raw      prisma.$queryRaw`SELECT ...`',
        'typescript',
        'Knowing which family fits the problem is the whole skill.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c1-t1',
          title: 'Lookup that throws instead of returning null',
          description: 'Fetch user by id. If missing, throw a typed P2025 error instead of returning null.',
          instructions: ['Use `prisma.user.findUniqueOrThrow`', 'Select `id` and `email`'],
          hint: '`findUniqueOrThrow` raises `P2025` on a miss — no null check needed.',
          scaffold: '-- The row the lookup must resolve:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: '`findUniqueOrThrow` pairs with a P2025 catch block instead of an explicit null guard.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'findUniqueOrThrow',
          rows: 1,
          code0:
            'export async function getUser(id: number) {\n  const user = await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n  if (!user) throw new Error(\'Not found\');\n  return user;\n}',
          code1:
            'export async function getUser(id: number) {\n  return await prisma.user.findUniqueOrThrow({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaSnippetTask({
          id: 'prisma14-c1-t2',
          title: 'Soft-delete then filter',
          description: 'Mark an account as deleted with `deletedAt`, then list only live accounts.',
          instructions: [
            'Use `prisma.user.update` to set `deletedAt: new Date()`',
            'Use `prisma.user.findMany` with `where: { deletedAt: null }` to list live accounts',
          ],
          hint: 'Two operations: one update to tombstone, one read to filter. Both use `select`.',
          scaffold: '-- Only live accounts appear in the roster:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'Soft-delete (Day 11) + filtered read is a complete tombstone lifecycle in two calls.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function softDeleteAndList(id: number) {\n  await prisma.user.update({ where: { id }, data: {} });\n  return await prisma.user.findMany({ select: { id: true, email: true } });\n}',
          code1:
            'export async function softDeleteAndList(id: number) {\n  await prisma.user.update({\n    where: { id },\n    data: { deletedAt: new Date() },\n  });\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    select: { id: true, email: true },\n  });\n}',
          need: ['deletedAt: new Date()', 'where: { deletedAt: null }'],
        }),
      ],
    },
    {
      id: 'capstone-patterns',
      order: 2,
      title: 'Capstone Patterns — Integration Exercises',
      shortDescription: 'Reads + writes + error trapping, working together.',
      theory: prismaTheory(
        'Four principles tie the whole curriculum together. **Reads always project:** use `select` to return only the columns the caller needs. **Writes always handle errors:** catch `PrismaClientKnownRequestError` and branch on the code. **Multi-step writes always use `$transaction`:** isolation guarantees the whole graph or nothing lands. **Deletions have two layers:** schema-level `onDelete` enforced by the engine, and application-level `deletedAt` tombstones preserving audit trails.',
        'Project. Trap. Transact. Distinguish deletion strategies.',
        'SELECT id, email\nFROM users\nORDER BY id ASC;',
        'const users = await prisma.user.findMany({\n  where: { deletedAt: null },\n  orderBy: { id: \'asc\' },\n  select: { id: true, email: true },\n  take: 10,\n});',
        'typescript',
        'Every clause has a reason: `where` scopes, `orderBy` determinises, `select` projects, `take` pages.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c2-t1',
          title: 'Deterministic paginated roster',
          description: 'Return the first 2 live users ordered by id, projecting id + email only.',
          instructions: ['`orderBy: { id: "asc" }`', '`take: 2`', 'Select `id` and `email` only'],
          hint: 'ORDER BY + LIMIT is the combination that makes pagination reproducible.',
          scaffold: '-- The two users returned by page 1:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC LIMIT 2;',
          why: 'Ordered projection is the contract every paginated API must honour.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'asc' }],
          pagination: { take: 2 },
          rows: 2,
          code0:
            'export async function roster() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true, name: true },\n  });\n}',
          code1:
            'export async function roster() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    select: { id: true, email: true },\n    take: 2,\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma14-c2-t2',
          title: 'Atomic write with inline conflict trapping',
          description: 'Register a user in a transaction. If the email already exists, catch P2002 and respond 409.',
          instructions: [
            'Wrap the `create` in `prisma.$transaction(async (tx) => ...)`',
            "Catch `PrismaClientKnownRequestError` with `code === 'P2002'` and return 409",
          ],
          hint: 'Interactive transaction + inline P2002 trap = atomic + conflict-safe registration.',
          scaffold: '-- The row a successful registration creates:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Transaction guarantees atomicity; P2002 catch prevents 500 on duplicate email.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function register(email: string, name: string, res: Response) {\n  const user = await prisma.user.create({ data: { email, name } });\n  return res.status(201).json(user);\n}',
          code1:
            "export async function register(email: string, name: string, res: Response) {\n  try {\n    const user = await prisma.$transaction(async (tx) => {\n      return await tx.user.create({\n        data: { email, name },\n        select: { id: true, email: true },\n      });\n    });\n    return res.status(201).json(user);\n  } catch (err) {\n    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {\n      return res.status(409).json({ error: 'Email already registered' });\n    }\n    throw err;\n  }\n}",
          need: ['prisma.$transaction(async (tx)', 'tx.user.create(', "err.code === 'P2002'", 'res.status(409)'],
          ban: ['await prisma.user.create('],
          demoVariables: { email: 'mina@prisma.io', name: 'Mina' },
        }),
      ],
    },
    {
      id: 'raw-sql-escape-hatch',
      order: 3,
      title: 'The Raw SQL Escape Hatch',
      shortDescription: '`$queryRaw` + `Prisma.sql` — drop to SQL without giving up parameterization.',
      theory: richPrismaTheory({
        summary: 'When the query builder cannot express something, `prisma.$queryRaw` runs SQL you write — and the tagged template (or `Prisma.sql`) keeps your values parameterized. `$executeRaw` is the write-side twin.',
        takeaway: '`$queryRaw` for reads, `$executeRaw` for writes — always parameterized.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        heroCode: "const rows = await prisma.$queryRaw`\n  SELECT id, email FROM users WHERE email = ${email}\n`;",
        heroLang: 'typescript',
        heroWhy: 'The tagged template binds the interpolated value as a parameter — never concatenated into the SQL.',
        mentalModel: '**Escape hatch, seatbelt on.** `$queryRaw` hands you raw SQL, but the tagged template still binds every interpolated value as a parameter. Concatenating values into the string is the one thing you must never do; `Prisma.sql` composes fragments while keeping them bound.',
        explanation: [
          'Reach for `$queryRaw` only when the query builder cannot express the query — a database-specific function, a complex report, an index hint.',
          '`$executeRaw` returns the affected-row count instead of rows, for writes.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the tagged template carries the SQL',
            codeSnippet: "prisma.$queryRaw`\n  SELECT id, email FROM users WHERE email = ${email}\n`",
            explanation: 'The template literal is the query — `$queryRaw` executes it and returns rows.',
          },
          {
            stepNumber: 2,
            stepTitle: 'every interpolation becomes a bound parameter',
            codeSnippet: 'WHERE email = $1',
            explanation: 'The value is sent separately from the SQL text, so injection is impossible by construction.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the database runs your SQL as written',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
            explanation: 'Nothing is rewritten — raw means raw. The Lens shows exactly what ran.',
            visualData: { type: 'sql_lens', title: 'Executed SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the raw result carries a declared row type',
            codeSnippet: '{ id: number; email: string }[]',
            explanation: 'You annotate the row type yourself — `$queryRaw` cannot infer it the way a model call does.',
            visualData: { type: 'type_preview', title: 'Declared type', details: null },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c3-t1',
          title: 'One raw read',
          description: 'Fetch a user with a tagged-template query — no string concatenation.',
          instructions: ['Use `prisma.$queryRaw` with a template literal', 'Bind the email as an interpolated parameter'],
          hint: 'Write the SQL inside a $queryRaw tagged template; the value stays a bound parameter.',
          scaffold: '-- The raw read still hits this row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The tagged template keeps the value bound while you write the SQL yourself.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function findRaw() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function findRaw(email: string) {\n  return await prisma.$queryRaw`\n    SELECT id, email FROM users WHERE email = ${email}\n  `;\n}',
          need: ['$queryRaw', 'SELECT id, email FROM users'],
          ban: ['$queryRawUnsafe'],
          rtype: '{ id: number; email: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma14-c3-t2',
          title: 'Compose with Prisma.sql',
          description: 'Build a reusable WHERE fragment and stitch it into the query.',
          instructions: ['Use `Prisma.sql` for the fragment', 'Interpolate it into `$queryRaw`'],
          hint: 'Prisma.sql returns a composable fragment; embed it in the tagged template.',
          scaffold: '-- The composed query reads the seed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'Composable fragments keep dynamic SQL parameterized and readable.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function findAll() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function findWhere(id: number) {\n  const where = Prisma.sql`WHERE id = ${id}`;\n  return await prisma.$queryRaw`\n    SELECT id, email FROM users ${where}\n  `;\n}',
          need: ['Prisma.sql', '$queryRaw'],
          rtype: '{ id: number; email: string }[]',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma14-challenge',
    title: 'Final Capstone — Member Management API',
    scenario:
      'Architect a production-grade Member Management API synthesizing query projection, transactional writes, and defensive conflict translation.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma14-hw-1',
          title: 'Member Directory — Deterministic Public Roster',
          description:
            'Implement a privacy-compliant member directory endpoint. Return the first 2 registered users ordered by ID ascending. Protect personal identifying details: only id and email may leave the database.',
          instructions: [
            'Retrieve the first 2 users ordered by `id` ascending',
            'Project `id` and `email` only — never include `name`',
          ],
          hint: 'Use projection to omit sensitive columns and offset/ordering modifiers to enforce determinism.',
          scaffold:
            '-- Directory contract (initial probe):\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC LIMIT 2;',
          why:
            'Projection discipline prevents column leaks while deterministic ordering guarantees consistent pagination.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'asc' }],
          pagination: { take: 2 },
          rows: 2,
          code0:
            'export async function getDirectoryPage() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true, name: true },\n  });\n}',
          code1:
            'export async function getDirectoryPage() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n    orderBy: { id: \'asc\' },\n    take: 2,\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma14-hw-2',
          title: 'Onboarding Pipeline — Atomic Registration & Initial Post',
          description:
            'When a new user registers, create their account and publish an initial onboarding post. Both writes must execute atomically in an all-or-nothing transaction so a failure in post creation never leaves an orphaned user.',
          instructions: [
            'Wrap both write operations in an interactive transaction callback',
            'Create the user and the initial post using the transaction client `tx`',
          ],
          hint: '`prisma.$transaction(async (tx) => { ... })` guarantees atomicity across related writes.',
          scaffold:
            '-- All-or-nothing registration verification:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why:
            'Atomic transactions prevent partial writes and database corruption when operations consist of multiple steps.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function registerWithWelcomePost(email: string, title: string) {\n  // BUG: Disconnected writes can fail halfway and leave orphaned records\n  const user = await prisma.user.create({ data: { email, name: \'New Member\' } });\n  const post = await prisma.post.create({ data: { title, authorId: user.id } });\n  return { user, post };\n}',
          code1:
            'export async function registerWithWelcomePost(email: string, title: string) {\n  return await prisma.$transaction(async (tx) => {\n    const user = await tx.user.create({ data: { email, name: \'New Member\' } });\n    const post = await tx.post.create({ data: { title, authorId: user.id } });\n    return { user, post };\n  });\n}',
          need: ['prisma.$transaction(async (tx)', 'tx.user.create(', 'tx.post.create('],
          ban: ['await prisma.user.create('],
          demoVariables: { title: 'Welcome to the Community', authorId: 1, email: 'newuser@prisma.io' },
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma14-hw-3',
          title: 'Member Service Route — Validation & Conflict Mapping',
          description:
            'Construct an Express route controller for member creation. Validate the payload using Zod. If the database rejects the write due to a unique constraint violation, translate that error into an HTTP 409 Conflict response. Forward unknown errors to the global error middleware.',
          instructions: [
            'Validate `req.body` using `MemberSchema.safeParse`',
            'Handle `Prisma.PrismaClientKnownRequestError` with code `P2002` and respond with status 409',
            'Pass unhandled errors down the pipeline with `next(err)`',
          ],
          hint: 'Check schema validity before writing to the database, and inspect known request errors for duplicate keys.',
          scaffold:
            "-- Conflict handling protects uniqueness:\nSELECT id, email FROM users WHERE email = 'nobody@prisma.io';",
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why:
            'A production service cleanly separates input validation, database constraint translation, and unexpected crashes.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function createMemberHandler(req: Request, res: Response, next: NextFunction) {\n  // BUG: Crashes server on invalid payload or duplicate email\n  const user = await prisma.user.create({ data: req.body });\n  return res.status(201).json(user);\n}',
          code1:
            'export async function createMemberHandler(req: Request, res: Response, next: NextFunction) {\n  const parsed = MemberSchema.safeParse(req.body);\n  if (!parsed.success) {\n    return res.status(400).json({ errors: parsed.error.flatten() });\n  }\n  try {\n    const user = await prisma.user.create({ data: parsed.data });\n    return res.status(201).json(user);\n  } catch (err) {\n    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === \'P2002\') {\n      return res.status(409).json({ error: \'Email already registered\' });\n    }\n    return next(err);\n  }\n}',
          need: [
            'MemberSchema.safeParse',
            'err instanceof Prisma.PrismaClientKnownRequestError',
            "err.code === 'P2002'",
            'res.status(409)',
            'next(err)',
          ],
        }),
        type: 'challenge',
      },
    ],
  },
};
