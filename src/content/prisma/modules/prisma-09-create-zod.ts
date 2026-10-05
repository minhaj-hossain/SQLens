import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 9 — create() + Zod Validation. */
export const Prisma_09_MODULE: ModuleData = {
  id: 'prisma-09',
  slug: 'create-and-zod-validation',
  day: 9,
  title: 'Day 9 — create() + Zod Validation',
  shortTitle: 'Create & Validate',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-3',
  description: 'Insert single rows and batches, then validate every payload before it reaches Prisma.',
  estimatedMinutes: 55,
  curriculumOrder: 9,
  displayLabel: 'Day 9',
  completionLearnings: [
    'Use `create()` when the caller needs the inserted row back',
    'Batch inserts with `createMany()`',
    'Validate the request body with Zod before Prisma sees it',
    'Return `400` with structured issues on a bad payload',
  ],
  concepts: [
    {
      id: 'create-writes',
      order: 1,
      title: 'Inserting Data — create() & createMany()',
      shortDescription: '`create` returns the new row; `createMany` returns a count.',
      theory: prismaTheory(
        '`create()` sends one INSERT and returns the inserted row (shaped by `select`). `createMany()` sends one INSERT for the whole batch and returns only a count — which is why it cannot return the rows it wrote.',
        'create returns the row; createMany returns only a count.',
        "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        'const user = await prisma.user.create({\n  data: { name, email },\n  select: { id: true, email: true },\n});',
        'typescript',
        'One INSERT, and `select` decides how much of the new row comes back.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma09-c1-t1',
          title: 'Insert one row and shape the response',
          description: 'Register a user and return id + email only.',
          instructions: ['Use `prisma.user.create`', 'Select `id` and `email`'],
          hint: '`select` on a create shapes the returned row.',
          scaffold: '-- The row your insert just wrote:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The unique email identifies the row that was inserted.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'create',
          // Task 0.2: bind the write params the translator cannot see, so the
          // reference renders the intended row instead of `INSERT … NULL`.
          demoVariables: { name: 'Rafi', email: 'rafi@prisma.io' },
          rows: 1,
          code0:
            'export async function registerUser(name: string, email: string) {\n  return await prisma.user.create({\n    data: { name, email },\n  });\n}',
          code1:
            'export async function registerUser(name: string, email: string) {\n  return await prisma.user.create({\n    data: { name, email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaSnippetTask({
          id: 'prisma09-c1-t2',
          title: 'Batch insert',
          description: 'Write all three users in a single round trip.',
          instructions: ['Use `prisma.user.createMany`', 'Return only the id column'],
          hint: '`createMany({ data: users })` — one INSERT, one count.',
          scaffold: '-- The batch landed three rows:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users;',
          why: 'A batch insert is one statement, so the lens shows the whole table.',
          cols: ['id'],
          select: [],
          rows: 3,
          code0:
            'export async function importUsers() {\n  return await prisma.user.findMany({\n    select: { id: true },\n  });\n}',
          code1:
            'export async function importUsers(users: { name: string; email: string }[]) {\n  return await prisma.user.createMany({\n    data: users,\n  });\n}',
          need: ['prisma.user.createMany', 'data: users'],
          rtype: '{ count: number }',
        }),
      ],
    },
    {
      id: 'zod-validation',
      order: 2,
      title: 'Validating Input with Zod',
      shortDescription: 'Reject bad payloads at the boundary, not with a Prisma error.',
      theory: prismaTheory(
        'Prisma types the data you pass — but it types `req.body` as `any`. Zod closes that gap: parse the payload first, hand `parsed.data` to Prisma, and a malformed request becomes a `400` instead of a database error.',
        'Parse with Zod, then pass `parsed.data` to Prisma.',
        "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        "const CreateUserSchema = z.object({\n  name: z.string().min(1),\n  email: z.string().email(),\n});\n\nconst parsed = CreateUserSchema.safeParse(req.body);\nif (!parsed.success) {\n  return res.status(400).json({ errors: parsed.error.issues });\n}\n\nconst user = await prisma.user.create({ data: parsed.data });",
        'typescript',
        'The boundary validates once, and every layer below can trust the shape.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma09-c2-t1',
          title: 'Write the payload schema',
          description: 'Name is required, email must be a real address.',
          instructions: ['Build `CreateUserSchema` with `z.object`', 'Validate `email` with `z.string().email()`'],
          hint: '`z.string().min(1)` for the name, `z.string().email()` for the address.',
          scaffold: '-- A validated payload still reaches this row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'The schema is the single description of a valid payload.',
          cols: ['id', 'email'],
          rows: 1,
          code0: 'export const CreateUserSchema = z.object({\n  name: z.string(),\n});',
          code1:
            'export const CreateUserSchema = z.object({\n  name: z.string().min(1),\n  email: z.string().email(),\n});',
          need: ['z.object(', 'z.string().email()'],
        }),
        prismaSnippetTask({
          id: 'prisma09-c2-t2',
          title: 'Fail before the database',
          description: 'Turn an invalid payload into a 400 instead of a P2002 crash.',
          instructions: ['Use `safeParse`', 'Return 400 when validation fails'],
          hint: '`if (!parsed.success) return res.status(400)…`.',
          scaffold: '-- Only valid payloads reach the insert:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Nothing invalid reaches Prisma once the boundary parses it.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function createUser(req: Request, res: Response) {\n  const user = await prisma.user.create({\n    data: req.body,\n  });\n  return res.status(201).json(user);\n}',
          code1:
            'export async function createUser(req: Request, res: Response) {\n  const parsed = CreateUserSchema.safeParse(req.body);\n  if (!parsed.success) {\n    return res.status(400).json({ errors: parsed.error.issues });\n  }\n\n  const user = await prisma.user.create({ data: parsed.data });\n  return res.status(201).json(user);\n}',
          need: ['CreateUserSchema.safeParse(', 'if (!parsed.success)', 'parsed.data'],
        }),
        prismaSnippetTask({
          id: 'prisma09-c2-t3',
          title: 'Non-Throwing Validation with safeParse',
          description:
            'Validate incoming untrusted input using `UserCreateInput.safeParse()`. If validation fails, return structured errors instead of throwing unhandled exceptions.',
          instructions: [
            'Parse untrusted data using `UserCreateInput.safeParse(data)`',
            'If validation fails (`!result.success`), return `{ ok: false, errors: result.error.flatten() }`',
            'If validation succeeds, return `{ ok: true, data: result.data }`',
          ],
          hint: '`safeParse` returns a discriminated union: check `result.success` to access `result.data` or `result.error`.',
          scaffold: '-- Validated input allows database operations:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'safeParse prevents server crashes and eliminates try/catch overhead for anticipated user input errors.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function validateInput(data: unknown) {\n  // BUG: .parse() throws on invalid data, crashing routes without explicit try/catch\n  const valid = UserCreateInput.parse(data);\n  return { ok: true, data: valid };\n}',
          code1:
            'export function validateInput(data: unknown) {\n  const result = UserCreateInput.safeParse(data);\n  if (!result.success) {\n    return { ok: false, errors: result.error.flatten() };\n  }\n  return { ok: true, data: result.data };\n}',
          need: ['UserCreateInput.safeParse(', '!result.success', 'result.error', 'result.data'],
          ban: ['UserCreateInput.parse('],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma09-challenge',
    title: 'Final Challenge — Secure Registration Pipeline',
    scenario: 'Validate, insert, and hand the caller a minimal response.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma09-hw-1',
          title: 'Nested Schema Validation — User with Initial Post',
          description:
            'Validate an incoming registration payload containing user info and an initial post (`RegisterPayloadSchema.safeParse(req.body)`). Reject invalid payloads with HTTP 400. On success, persist the user and child post using a nested relational create, returning only id and email.',
          instructions: [
            'Validate `req.body` using `RegisterPayloadSchema.safeParse(req.body)`',
            'If validation fails (`!parsed.success`), respond with status 400 and validation errors',
            'Persist user with nested `posts: { create: { title: parsed.data.title } }` and project `select: { id: true, email: true }`',
          ],
          hint: 'Validate first with safeParse, then write `data: { email: parsed.data.email, name: parsed.data.name, posts: { create: { title: parsed.data.title } } }`.',
          scaffold: '-- The row only a valid nested payload can create:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Validating nested payloads before writing guarantees that both parent and child relations satisfy schema constraints atomically.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function registerWithPost(req: Request, res: Response) {\n  // BUG: Inserting unvalidated body with unhandled nested post structure\n  const user = await prisma.user.create({ data: req.body });\n  return res.status(201).json(user);\n}',
          code1:
            'export async function registerWithPost(req: Request, res: Response) {\n  const parsed = RegisterPayloadSchema.safeParse(req.body);\n  if (!parsed.success) {\n    return res.status(400).json({ errors: parsed.error.issues });\n  }\n\n  const user = await prisma.user.create({\n    data: {\n      email: parsed.data.email,\n      name: parsed.data.name,\n      posts: {\n        create: { title: parsed.data.title },\n      },\n    },\n    select: { id: true, email: true },\n  });\n  return res.status(201).json(user);\n}',
          need: [
            'RegisterPayloadSchema.safeParse(',
            'if (!parsed.success)',
            'posts: {',
            'create: { title: parsed.data.title }',
            'select: { id: true, email: true }',
          ],
          demoVariables: { name: 'Mina', email: 'mina@prisma.io', title: 'Hello Prisma' },
        }),
        type: 'challenge',
      },
    ],
  },
};
