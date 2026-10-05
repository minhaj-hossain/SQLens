import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

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
      theory: richPrismaTheory({
        summary:
          '`create()` sends one INSERT statement and returns the newly inserted row (shaped by `select`). `createMany()` sends one bulk INSERT statement for an entire array of records and returns only a `{ count: number }` — which is why it cannot return the generated rows it wrote.',
        takeaway:
          'create returns the row; createMany returns only a count.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        heroCode:
          'const user = await prisma.user.create({\n  data: { name, email },\n  select: { id: true, email: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'One INSERT, and `select` decides how much of the new row comes back.',
        mentalModel:
          '**Single-Row Hydration vs Bulk Throughput.** When inserting a single entity, `prisma.user.create()` returns the full model instance with its generated primary key, default values, and computed fields. When importing large datasets (e.g. CSVs, batch feeds), `prisma.user.createMany()` executes a multi-row SQL INSERT in one round trip, sacrificing individual row return objects in favor of throughput ({ count: number }).',
        littleDetails: {
          title: 'Insert Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'create returns the entity; createMany returns a count',
              description: 'Because `createMany` bundles records into a single multi-value INSERT, standard database drivers return only the affected row count, not the auto-generated primary keys. Use `create` when the caller needs the new id.',
              badge: 'Return Type',
            },
            {
              ruleNumber: 2,
              title: 'createMany does not support nested relation writes',
              description: 'You cannot nest child relation writes (e.g. `posts: { create: [...] }`) inside `createMany`. Nested writes require individual `create` calls or transaction batching so foreign keys can be resolved.',
              badge: 'Limitation',
            },
            {
              ruleNumber: 3,
              title: 'Always shape created records with select',
              description: 'Prevent sensitive fields like `passwordHash` or internal flags from being returned to clients by pairing `create` with an explicit `select: { id: true, email: true }` projection.',
              badge: 'Security',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Inserts to SQL Statements',
          mappings: [
            {
              prisma: 'prisma.user.create({ data, select: { id: true } })',
              sql: 'INSERT INTO users (name, email) VALUES (?, ?) RETURNING id;',
              note: 'Inserts one row and returns the requested columns using SQL RETURNING.',
            },
            {
              prisma: 'prisma.user.createMany({ data: users })',
              sql: 'INSERT INTO users (name, email) VALUES (?, ?), (?, ?);',
              note: 'Bulk multi-row insert returning the count of successfully created rows.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Do I need the generated id or default timestamps immediately after inserting?',
              answer: 'Use `prisma.model.create({ data, select: { id: true } })`.',
            },
            {
              questionNumber: 2,
              question: 'Am I inserting hundreds or thousands of records from an import or queue?',
              answer: 'Use `prisma.model.createMany({ data: records })`. It writes all items in a single database round trip.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define insert payload and projection',
            codeSnippet: 'await prisma.user.create({\n  data: { name: "Rafi", email: "rafi@prisma.io" },\n  select: { id: true, email: true },\n});',
            explanation: 'The data property specifies field values, while select restricts what leaves the database.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Query engine emits parameterized INSERT with RETURNING',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
            explanation: 'Prisma issues a parameterized INSERT and hydrates only the selected fields into memory.',
            visualData: {
              type: 'sql_lens',
              title: 'Inserted Row Read',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Compiler infers typed return shape',
            codeSnippet: 'type CreatedUser = { id: number; email: string };',
            explanation: 'TypeScript strongly types the result based exclusively on your select block.',
            visualData: {
              type: 'type_preview',
              title: 'Inferred Entity Shape',
            },
          },
        ],
      }),
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
      theory: richPrismaTheory({
        summary:
          'Prisma types the data you pass — but in web frameworks, `req.body` arrives as untyped `any`. Zod creates a defensive boundary: parse the payload first, hand `parsed.data` to Prisma, and a malformed request becomes a clean HTTP 400 Bad Request instead of an unhandled database exception.',
        takeaway:
          'Parse with Zod, then pass `parsed.data` to Prisma.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          "const CreateUserSchema = z.object({\n  name: z.string().min(1),\n  email: z.string().email(),\n});\n\nconst parsed = CreateUserSchema.safeParse(req.body);\nif (!parsed.success) {\n  return res.status(400).json({ errors: parsed.error.issues });\n}\n\nconst user = await prisma.user.create({ data: parsed.data });",
        heroLang: 'typescript',
        heroWhy: 'The boundary validates once, and every layer below can trust the shape.',
        mentalModel:
          '**The Defensive API Pipeline.** Never allow raw user input to touch your database queries. Incoming HTTP requests pass through three distinct stages: (1) Contract Validation with Zod (`safeParse`), (2) Immediate Error Termination on failure (HTTP 400 with structured issue paths), and (3) Guaranteed-Clean Persistence via Prisma. This prevents mass-assignment exploits, type errors, and constraint crashes.',
        littleDetails: {
          title: 'Validation Rules & Gotchas',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never pass req.body directly to Prisma',
              description: '`req.body` can contain malicious injected fields (e.g. `{ role: "ADMIN" }`). Zod schema parsing automatically strips unrecognised fields, protecting against mass-assignment vulnerabilities.',
              badge: 'Security',
            },
            {
              ruleNumber: 2,
              title: 'safeParse avoids try/catch boilerplate',
              description: '`schema.parse()` throws a ZodError that requires try/catch. `schema.safeParse()` returns `{ success: true, data } | { success: false, error }`, making control flow clean and explicit.',
              badge: 'Best Practice',
            },
            {
              ruleNumber: 3,
              title: 'Derive TypeScript types from the Zod schema',
              description: 'Use `type CreateUserInput = z.infer<typeof CreateUserSchema>` to ensure your compile-time types always reflect your runtime validation rules with zero duplication.',
              badge: 'Type Parity',
            },
          ],
        },
        sqlBridge: {
          title: 'Validation Boundary to Database Protection',
          mappings: [
            {
              prisma: 'CreateUserSchema.safeParse(req.body)',
              sql: 'Prevents malformed inputs before socket lease',
              note: 'Rejects invalid strings, emails, and missing fields in Node memory before opening a database transaction.',
            },
            {
              prisma: 'prisma.user.create({ data: parsed.data })',
              sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
              note: 'Only sanitized, type-checked attributes reach the database query engine.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Does the data come from an untrusted client (HTTP body, query param, webhook)?',
              answer: 'Always validate with Zod first: parse with `safeParse`, return 400 on failure, and pass `parsed.data` to Prisma.',
            },
            {
              questionNumber: 2,
              question: 'How should validation errors be returned to the client?',
              answer: 'Return HTTP 400 Bad Request with `parsed.error.issues` so the client receives field-specific error messages.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define schema contract with Zod',
            codeSnippet: "const CreateUserSchema = z.object({\n  name: z.string().min(1),\n  email: z.string().email(),\n});",
            explanation: 'The schema declaratively specifies data types, formats, and constraint rules for the request body.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Parse defensively and guard with safeParse',
            codeSnippet: "const parsed = CreateUserSchema.safeParse(req.body);\nif (!parsed.success) {\n  return res.status(400).json({ errors: parsed.error.issues });\n}",
            explanation: 'If validation fails, the API responds with 400 immediately, protecting Prisma from malformed queries.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Persist validated data safely into database',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
            explanation: 'Only clean, validated records are written to the database.',
            visualData: {
              type: 'sql_lens',
              title: 'Validated Record Read',
            },
          },
        ],
      }),
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
