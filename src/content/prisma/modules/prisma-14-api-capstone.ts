import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 14 — Production REST API Capstone. */
export const Prisma_14_MODULE: ModuleData = {
  id: 'prisma-14',
  slug: 'production-rest-api-capstone',
  day: 14,
  title: 'Day 14 — Production REST API Capstone',
  shortTitle: 'REST API Capstone',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Ship the data layer: layered architecture, one Prisma dependency, and the full CRUD lifecycle.',
  estimatedMinutes: 70,
  curriculumOrder: 14,
  displayLabel: 'Day 14',
  completionLearnings: [
    'Delegate route handlers to controller methods and service classes',
    'Inject PrismaClient instead of importing it everywhere',
    'Cover the full CRUD lifecycle through the service',
    'Return relation-safe, minimal responses',
  ],
  concepts: [
    {
      id: 'clean-architecture',
      order: 1,
      title: 'Clean Architecture — Router → Controller → Service',
      shortDescription: 'Routing, HTTP concerns and data access, each in one layer.',
      theory: prismaTheory(
        'A production data layer has three seams: the router maps URLs to handlers, the controller owns HTTP (status codes, validation) and the service owns Prisma. PrismaClient is injected into the service, which is what makes the service testable.',
        'Router routes, controller speaks HTTP, service owns Prisma.',
        'SELECT id, email\nFROM users\nWHERE id = 1;',
        'router.get(\'/users\', userController.list);\n\nexport class UserService {\n  constructor(private prisma: PrismaClient) {}\n}',
        'typescript',
        'One import boundary per layer means the data access is swappable and mockable.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c1-t1',
          title: 'Move the handler out of the route',
          description: 'The route should route; the controller should handle.',
          instructions: ['Register with `router.get`', 'Delegate to `userController.list`'],
          hint: '`router.get("/users", userController.list)`.',
          scaffold: '-- The route still lists the same rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'A thin router is what lets controllers be unit-tested.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'router.get(\'/users\', async (req, res) => {\n  const users = await prisma.user.findMany();\n  res.json(users);\n});',
          code1: 'router.get(\'/users\', userController.list);',
          need: ['router.get(', 'userController.list'],
        }),
        prismaSnippetTask({
          id: 'prisma14-c1-t2',
          title: 'Inject the client into the service',
          description: 'The service must receive PrismaClient, not import a global one.',
          instructions: ['Export a class', 'Take `prisma` through the constructor'],
          hint: '`constructor(private prisma: PrismaClient) {}`.',
          scaffold: '-- Whatever the service reads, the seed still answers:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'Constructor injection is the seam every test doubles against.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function listUsers() {\n  return await prisma.user.findMany({ select: { id: true, email: true } });\n}',
          code1:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  async list() {\n    return await this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n}',
          need: ['export class UserService', 'constructor(private prisma: PrismaClient)'],
        }),
      ],
    },
    {
      id: 'crud-lifecycle',
      order: 2,
      title: 'Full CRUD Lifecycle & Relational Integrity',
      shortDescription: 'List, create, update, remove — all through the same service.',
      theory: prismaTheory(
        'A complete resource exposes four operations, and each one keeps relational integrity: reads project a stable column set, creates validate first, updates require a unique key and deletes respect the referential action declared the schema.',
        'Four operations, one service, integrity intact at every step.',
        'SELECT id, email\nFROM users\nORDER BY id ASC;',
        'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({\n      orderBy: { id: \'asc\' },\n      select: { id: true, email: true },\n    });\n  }\n}',
        'typescript',
        'One ORDER BY per list method keeps paging and tests reproducible.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c2-t1',
          title: 'Stable list endpoint',
          description: 'Return id + email for every user, ordered by id.',
          instructions: ['Use `findMany`', '`orderBy: { id: "asc" }`', 'Select `id` and `email`'],
          hint: 'A list endpoint without ORDER BY is not reproducible.',
          scaffold: '-- The roster this endpoint returns:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC;',
          why: 'ORDER BY plus a fixed projection is the contract clients depend on.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'asc' }],
          rows: 3,
          code0:
            'export async function list() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function list() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma14-c2-t2',
          title: 'Complete the CRUD service',
          description: 'The service only lists so far — add create, update and remove.',
          instructions: ['Add `create`, `update` and `remove` methods', 'Each uses PrismaClient through `this.prisma`'],
          hint: 'Four methods, four Prisma calls, one injected client.',
          scaffold: '-- CRUD still ends on seeded rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'One service owning all four operations keeps the API consistent.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n}',
          code1:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n\n  create(data: { name: string; email: string }) {\n    return this.prisma.user.create({ data, select: { id: true, email: true } });\n  }\n\n  update(id: number, data: { name?: string }) {\n    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true } });\n  }\n\n  remove(id: number) {\n    return this.prisma.user.delete({ where: { id }, select: { id: true } });\n  }\n}',
          need: ['create(', 'update(', 'remove(', 'delete({'],
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
