import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 13 — Errors + Express Error Middleware. */
export const Prisma_13_MODULE: ModuleData = {
  id: 'prisma-13',
  slug: 'errors-and-error-middleware',
  day: 13,
  title: 'Day 13 — Errors + Express Error Middleware',
  shortTitle: 'Error Handling',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Turn Prisma error codes into the right HTTP status, in one place.',
  estimatedMinutes: 55,
  curriculumOrder: 13,
  displayLabel: 'Day 13',
  completionLearnings: [
    'Recognise `PrismaClientKnownRequestError`',
    'Map `P2002` to 409 and `P2025` to 404',
    'Never leak a stack trace to a client',
    'Centralise the mapping in Express error middleware',
  ],
  concepts: [
    {
      id: 'error-classification',
      order: 1,
      title: 'Prisma Error Classification',
      shortDescription: 'The `code` field is the contract — P2002, P2025, and friends.',
      theory: prismaTheory(
        'Prisma throws typed errors: `PrismaClientKnownRequestError` carries a `code` such as `P2002` (unique constraint) or `P2025` (record not found). You cannot branch on the message, but you can always branch on the code.',
        'Branch on `error.code`, never on the error message.',
        "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        "try {\n  await prisma.user.create({ data: { name, email } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError) {\n    if (error.code === 'P2002') throw new ConflictError('Email already registered');\n    if (error.code === 'P2025') throw new NotFoundError('User not found');\n  }\n  throw error;\n}",
        'typescript',
        'Two codes cover the vast majority of real API failures.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c1-t1',
          title: 'Catch the unique violation',
          description: 'A duplicate email must become a 409, not a 500.',
          instructions: ['Check `instanceof Prisma.PrismaClientKnownRequestError`', "Branch on `code === 'P2002'`"],
          hint: '`P2002` is the unique-constraint code.',
          scaffold: '-- The row that collides:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The code identifies the failure; the message does not.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'try {\n  await prisma.user.create({ data: { name, email } });\n} catch (error) {\n  throw new Error(\'Create failed\');\n}',
          code1:
            "try {\n  await prisma.user.create({ data: { name, email } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {\n    throw new ConflictError('Email already registered');\n  }\n  throw error;\n}",
          need: ['Prisma.PrismaClientKnownRequestError', "code === 'P2002'"],
          // Task 0.2: the failing `create` param must not render NULL.
          demoVariables: { name: 'Alexandra' },
        }),
        prismaSnippetTask({
          id: 'prisma13-c1-t2',
          title: 'Map a missing record',
          description: 'Updating a row that does not exist should return 404.',
          instructions: ["Branch on `code === 'P2025'`", 'Respond with `res.status(404)`'],
          hint: '`P2025` means the operation found nothing to act on.',
          scaffold: '-- The row a retry would find:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'A missing row is a client error, not a server failure.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            "export async function rename(req: Request, res: Response) {\n  try {\n    const user = await prisma.user.update({\n      where: { id: Number(req.params.id) },\n      data: { name: req.body.name },\n    });\n    return res.json(user);\n  } catch (error) {\n    return res.status(500).json({ error: 'Server error' });\n  }\n}",
          code1:
            "export async function rename(req: Request, res: Response) {\n  try {\n    const user = await prisma.user.update({\n      where: { id: Number(req.params.id) },\n      data: { name: req.body.name },\n    });\n    return res.json(user);\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {\n      return res.status(404).json({ error: 'User not found' });\n    }\n    return res.status(500).json({ error: 'Server error' });\n  }\n}",
          need: ["code === 'P2025'", 'res.status(404)'],
          // Task 0.2: `data: { name: req.body.name }` must render a real value.
          demoVariables: { name: 'Alexandra' },
        }),
      ],
    },
    {
      id: 'error-middleware',
      order: 2,
      title: 'Centralised Express Error Middleware',
      shortDescription: 'One handler, four arguments, every route covered.',
      theory: prismaTheory(
        'Express recognises error middleware by arity: four parameters, `err` first. Controllers call `next(err)` and the middleware translates the code into a status — so no route invents its own error shape.',
        'Controllers `next(err)`; one 4-argument middleware answers.',
        "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        "app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {\n    return res.status(409).json({ error: 'Conflict' });\n  }\n  return res.status(500).json({ error: 'Server error' });\n});",
        'typescript',
        '`next(err)` from anywhere lands in exactly one place.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c2-t1',
          title: 'Declare the error handler',
          description: 'Four parameters, and errors keep flowing.',
          instructions: ['Signature `(err, req, res, next)`', 'Call `next(err)` when unsure'],
          hint: 'Express detects error middleware by the 4-argument signature.',
          scaffold: '-- Requests still resolve to this row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Unknown errors are forwarded, so nothing is silently swallowed.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function errorHandler(err: unknown, req: Request, res: Response) {\n  return res.status(500).json({ error: \'Server error\' });\n}',
          code1:
            'export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  if (err instanceof HttpError) {\n    return res.status(err.status).json({ error: err.message });\n  }\n  return next(err);\n}',
          need: ['next: NextFunction', 'next(err)'],
        }),
        prismaSnippetTask({
          id: 'prisma13-c2-t2',
          title: 'Translate the code centrally',
          description: 'The middleware decides the status; controllers stay thin.',
          instructions: ['Branch on `instanceof Prisma.PrismaClientKnownRequestError`', 'Answer 409 for `P2002`'],
          hint: 'One mapping table, one place to change.',
          scaffold: '-- Conflict responses refer to this row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Centralising the mapping removes duplicated catch blocks.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  return res.status(500).json({ error: \'Server error\' });\n}',
          code1:
            "export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {\n    return res.status(409).json({ error: 'Conflict' });\n  }\n  return res.status(500).json({ error: 'Server error' });\n}",
          need: ['err instanceof Prisma.PrismaClientKnownRequestError', 'res.status(409)'],
        }),
      ],
    },
    {
      id: 'client-extensions',
      order: 3,
      title: 'Architectural Transition: Client Extensions — `$extends`',
      shortDescription:
        'From HTTP route error boundaries to engine-level query extensions — the typed successor to $use.',
      theory: richPrismaTheory({
        summary:
          'Architectural Transition: While Concepts 1 & 2 handle runtime errors at the HTTP routing boundary, Client Extensions operate at the engine client layer. `prisma.$extends({ … })` returns a new client that wraps every call: a `query` hook can rewrite args or results, a `model` hook adds methods, and a `result` hook adds computed fields. It serves as the modern, type-safe successor to deprecated `$use` middleware and forms the architectural bridge into Day 14.',
        takeaway: '`$extends` is the modern `$use`: intercept every query in one typed place.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          "const xprisma = prisma.$extends({\n  query: {\n    user: {\n      async $allOperations({ args, query }) {\n        const rows = await query(args);\n        return rows;\n      },\n    },\n  },\n});",
        heroLang: 'typescript',
        heroWhy: 'Every `user` query now flows through one interception point — typed, not stringly.',
        mentalModel:
          '**Intercept once, not at every call site.** `query` hooks receive `{ args, query }` and return the result, so logging, soft-delete filters and tenant scoping live in ONE place. The deprecated `$use` middleware did the same job with `any` everywhere — `$extends` keeps the types.',
        explanation: [
          'Architectural Transition: Concepts 1 & 2 address perimeter HTTP errors; $extends operates internally at the client execution engine.',
          '`query` hooks wrap execution (args in, result out); `model` hooks add methods; `result` hooks add computed fields.',
          'Extend once at startup and hand the extended client around — the base `prisma` client stays untouched.',
          'This advanced client customization concept completes our core curriculum, serving as the bridge to enterprise service design in Day 14.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the extension declares a query hook',
            codeSnippet: "prisma.$extends({\n  query: {\n    user: {\n      async $allOperations({ args, query }) { /* … */ },\n    },\n  },\n});",
            explanation: '`$allOperations` intercepts every `user` call — find, create, update and delete alike.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the hook receives the args and runs the query',
            codeSnippet: 'async $allOperations({ args, query }) {\n  const rows = await query(args);\n  return rows;\n}',
            explanation: '`args` are the original call arguments; `query(args)` executes the real query. Change either to rewrite behaviour.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the wrapped call still emits one plain read',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
            explanation: 'An audit/logging hook does not change the SQL — the Lens still shows the ordinary statement.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the extended client keeps the model types',
            codeSnippet: '{ id: number; email: string } | null',
            explanation: 'The interception is typed end-to-end — no `any`, unlike the old `$use` middleware.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c3-t1',
          title: 'Add an audit hook',
          description: 'Wrap every user query with a timing hook — and drop the deprecated `$use`.',
          instructions: ['Extend with `$extends`', 'Add a `query` hook using `$allOperations`'],
          hint: 'Extend with a query hook keyed on the model, and call the injected query(args).',
          scaffold: '-- The wrapped read still hits this row:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'One interception point replaces duplicated logging in every service method.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function audit() {\n  return prisma.$use(async (params, next) => {\n    return next(params);\n  });\n}',
          code1:
            'export function audit() {\n  return prisma.$extends({\n    query: {\n      user: {\n        async $allOperations({ args, query }) {\n          const started = Date.now();\n          const rows = await query(args);\n          console.log(`${Date.now() - started}ms`);\n          return rows;\n        },\n      },\n    },\n  });\n}',
          need: ['$extends', 'query:', '$allOperations'],
          ban: ['$use'],
          rtype: '{ id: number; email: string } | null',
        }),
        prismaSnippetTask({
          id: 'prisma13-c3-t2',
          title: 'Add a model method',
          description: 'Give the extended client a `findByName` helper on `user`.',
          instructions: ['Extend with `$extends`', 'Add a `model: { user: { … } }` method'],
          hint: 'Model methods can call sibling delegates through `this`.',
          scaffold: '-- The helper still reads the seed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'A named model method keeps call sites readable and typed.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function lookup(name: string) {\n  return await prisma.user.findMany({\n    where: { name },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            "const xprisma = prisma.$extends({\n  model: {\n    user: {\n      findByName(name: string) {\n        return this.findMany({\n          where: { name },\n          select: { id: true, email: true },\n        });\n      },\n    },\n  },\n});",
          need: ['$extends', 'model:', 'findByName'],
          rtype: '{ id: number; email: string }[]',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma13-challenge',
    title: 'Final Challenge — Production API Error Hardening',
    scenario: 'One middleware that turns Prisma codes into honest HTTP statuses.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma13-hw-1',
          title: 'Complete the mapping',
          description: 'P2002 → 409, P2025 → 404, everything else → 500 without leaking internals.',
          instructions: ["Handle `'P2002'` and `'P2025'`", 'Only unknown errors become 500'],
          hint: 'Check the code first, then fall through to a generic 500.',
          scaffold: '-- Rows behind the conflict and the 404:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'A client never sees a stack trace, only a status and a message.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  return res.status(500).json({ error: \'Server error\' });\n}',
          code1:
            "export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  if (err instanceof Prisma.PrismaClientKnownRequestError) {\n    if (err.code === 'P2002') return res.status(409).json({ error: 'Conflict' });\n    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });\n  }\n  return next(err);\n}",
          need: ["code === 'P2002'", 'res.status(409)', "code === 'P2025'", 'next(err)'],
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma13-hw-2',
          title: 'Diagnostic Repair — Unsafe Error Property Access',
          description:
            'The following error middleware crashes at runtime with "Cannot read properties of undefined (reading \'code\')" whenever an ordinary Error or Zod validation error reaches it. Diagnose the bug and add the appropriate type guard so Prisma error codes are only checked on genuine PrismaClientKnownRequestError instances.',
          instructions: [
            'Diagnose why accessing `err.code` directly crashes on non-Prisma errors',
            'Add `err instanceof Prisma.PrismaClientKnownRequestError` type guard before reading `err.code`',
            'Forward any error that does not match via `next(err)`',
          ],
          hint: 'Use `instanceof` to narrow `err` from `unknown` to `Prisma.PrismaClientKnownRequestError`.',
          scaffold: '-- Safe error handling protects route availability:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Type guards ensure that untyped runtime errors never cause unhandled secondary exceptions in middleware.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            "export function safeErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  // BUG: Runtime crash on native Error or ZodError (err.code is undefined or err is not an object)\n  if ((err as any).code === 'P2002') {\n    return res.status(409).json({ error: 'Unique conflict' });\n  }\n  return next(err);\n}",
          code1:
            "export function safeErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {\n    return res.status(409).json({ error: 'Unique conflict' });\n  }\n  return next(err);\n}",
          need: [
            'err instanceof Prisma.PrismaClientKnownRequestError',
            "err.code === 'P2002'",
            'res.status(409)',
            'next(err)',
          ],
          ban: ['(err as any)'],
        }),
        type: 'challenge',
      },
    ],
  },
};
