import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 13 — Prisma Error Classification. */
export const Prisma_13_MODULE: ModuleData = {
  id: 'prisma-13',
  slug: 'prisma-error-classification',
  day: 13,
  title: 'Day 13 — Prisma Error Classification',
  shortTitle: 'Error Codes',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Branch on typed Prisma error codes — P2002, P2025, P2003 — and turn them into correct HTTP responses without ever reading the error message.',
  estimatedMinutes: 55,
  curriculumOrder: 13,
  displayLabel: 'Day 13',
  completionLearnings: [
    'Recognise `PrismaClientKnownRequestError` and guard with `instanceof`',
    'Map `P2002` to 409 Conflict and `P2025` to 404 Not Found',
    'Map `P2003` to 409 Conflict for foreign-key violations',
    'Never branch on the error message string — always use the code',
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
        prismaSnippetTask({
          id: 'prisma13-c1-t3',
          title: 'Catch client validation errors',
          description:
            'When invalid field types or missing required fields bypass application validation, Prisma raises PrismaClientValidationError before querying the database. Catch it and respond with HTTP 400 Bad Request.',
          instructions: [
            'Check for `error instanceof Prisma.PrismaClientValidationError`',
            'Respond with status 400 Bad Request',
          ],
          hint: '`PrismaClientValidationError` represents query structural/type mismatches, distinct from runtime database constraint failures.',
          scaffold: '-- Valid requests resolve to this record:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Catching PrismaClientValidationError prevents unhandled 500 crashes caused by malformed queries.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function handlePayload(req: Request, res: Response) {\n  try {\n    return await prisma.user.create({ data: req.body });\n  } catch (error) {\n    return res.status(500).json({ error: \'Internal error\' });\n  }\n}',
          code1:
            'export async function handlePayload(req: Request, res: Response) {\n  try {\n    return await prisma.user.create({ data: req.body });\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientValidationError) {\n      return res.status(400).json({ error: \'Invalid query arguments or missing fields\' });\n    }\n    return res.status(500).json({ error: \'Internal error\' });\n  }\n}',
          need: ['Prisma.PrismaClientValidationError', 'res.status(400)'],
          demoVariables: { name: 'Alexandra', email: 'alex@prisma.io' },
        }),
      ],
    },
    {
      // NOTE: 'error-middleware' (Express 4-arg arity mechanics) is out-of-scope per the
      // transformation plan. Replaced with 'error-trapping': pure Prisma in-route error
      // branching covering P2025 (not found) and P2003 (foreign key violation).
      id: 'error-trapping',
      order: 2,
      title: 'In-Route Error Trapping — P2025 & P2003',
      shortDescription: 'Add the missing branches: `P2025` is not found, `P2003` is a broken foreign key.',
      theory: prismaTheory(
        'The `code` field covers more than uniqueness violations. `P2025` fires when `update`, `delete`, or `findUniqueOrThrow` finds no matching row. `P2003` fires when a write violates a foreign-key constraint — the referenced record does not exist. Both are predictable failures that deserve precise HTTP status codes, not generic 500s.',
        'P2025 = record missing (404); P2003 = broken FK (409).',
        "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        "try {\n  await prisma.user.update({ where: { id }, data: { name } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError) {\n    if (error.code === 'P2002') return res.status(409).json({ error: 'Conflict' });\n    if (error.code === 'P2025') return res.status(404).json({ error: 'Not found' });\n    if (error.code === 'P2003') return res.status(409).json({ error: 'Related record missing' });\n  }\n  throw error;\n}",
        'typescript',
        'Three codes handle the vast majority of API failures.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c2-t1',
          title: 'Trap missing record on delete',
          description:
            'Deleting a record that does not exist throws P2025. Trap it and respond with HTTP 404 instead of letting it crash as a 500.',
          instructions: [
            'Check for `error instanceof Prisma.PrismaClientKnownRequestError`',
            "Branch on `error.code === 'P2025'`",
            'Respond with `res.status(404)`',
          ],
          hint: '`P2025` is raised when `delete` finds no row matching the `where` condition.',
          scaffold: '-- The row a successful delete would target:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'P2025 applies to both update and delete operations when the target record does not exist.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            "export async function removeUser(id: number, res: Response) {\n  try {\n    await prisma.user.delete({ where: { id } });\n    return res.status(204).send();\n  } catch (error) {\n    return res.status(500).json({ error: 'Server error' });\n  }\n}",
          code1:
            "export async function removeUser(id: number, res: Response) {\n  try {\n    await prisma.user.delete({ where: { id } });\n    return res.status(204).send();\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {\n      return res.status(404).json({ error: 'User not found' });\n    }\n    return res.status(500).json({ error: 'Server error' });\n  }\n}",
          need: ['Prisma.PrismaClientKnownRequestError', "error.code === 'P2025'", 'res.status(404)'],
        }),
        prismaSnippetTask({
          id: 'prisma13-c2-t2',
          title: 'Trap the foreign-key violation',
          description: 'Creating a post with a non-existent `authorId` throws P2003. Map it to 409.',
          instructions: ["Branch on `error.code === 'P2003'`", "Respond 409 with `{ error: 'Related record not found' }`"],
          hint: '`P2003` = a referenced record does not exist in the parent table.',
          scaffold: '-- A post that landed under a real author:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'A broken foreign key is the caller\'s fault — a 409 is more honest than a 500.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function publish(title: string, authorId: number, res: Response) {\n  try {\n    return await prisma.post.create({ data: { title, authorId } });\n  } catch (error) {\n    return res.status(500).json({ error: \'Server error\' });\n  }\n}',
          code1:
            "export async function publish(title: string, authorId: number, res: Response) {\n  try {\n    return await prisma.post.create({ data: { title, authorId } });\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {\n      return res.status(409).json({ error: 'Related record not found' });\n    }\n    return res.status(500).json({ error: 'Server error' });\n  }\n}",
          need: ['Prisma.PrismaClientKnownRequestError', "error.code === 'P2003'", 'res.status(409)'],
          demoVariables: { title: 'Hello Prisma', authorId: 1 },
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
          {
            stepNumber: 5,
            stepTitle: 'result extensions attach computed fields',
            codeSnippet: "result: {\n  user: {\n    displayName: {\n      needs: { name: true, email: true },\n      compute(u) { return u.name ?? u.email; },\n    },\n  },\n}",
            explanation: '`needs` specifies required database columns; `compute()` evaluates the virtual property on returned rows.',
            visualData: { type: 'type_preview', title: 'Computed property', details: null },
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
          title: 'Computed fields via result extensions',
          description:
            'Add a virtual computed field `displayName` to the `user` model using `$extends({ result: { user: { ... } } })`. Declare its dependencies with `needs: { name: true, email: true }` and compute the fallback value `user.name ?? user.email`.',
          instructions: [
            'Extend the client with `prisma.$extends`',
            'Add a `result` extension for the `user` model',
            'Define `displayName` with `needs: { name: true, email: true }` and `compute(user)`',
          ],
          hint: '`prisma.$extends({ result: { user: { displayName: { needs: { name: true, email: true }, compute(u) { return u.name ?? u.email; } } } } })`.',
          scaffold: '-- The computed field attaches to resolved user rows:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Result extensions calculate virtual domain properties on-the-fly without database column duplication or manual DTO mapping.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0:
            '// Legacy manual helper or ad-hoc mapping function\nexport function getDisplayName(user: { name: string | null; email: string }) {\n  return user.name ?? user.email;\n}',
          code1:
            "const xprisma = prisma.$extends({\n  result: {\n    user: {\n      displayName: {\n        needs: { name: true, email: true },\n        compute(user) {\n          return user.name ?? user.email;\n        },\n      },\n    },\n  },\n});",
          need: ['$extends', 'result:', 'displayName:', 'needs:', 'compute('],
          rtype: '{ id: number; name: string | null; email: string; displayName: string }',
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
          title: 'Complete the mapping — P2002, P2025 & P2003',
          description:
            'P2002 → 409 Conflict, P2025 → 404 Not Found, P2003 → 409 Foreign Key Failure. Everything else forwards to next(err) without leaking internal database exceptions.',
          instructions: [
            "Handle `'P2002'` (409) and `'P2025'` (404)",
            "Handle `'P2003'` (409) for foreign-key constraint failures",
            'Forward unhandled errors via `next(err)`',
          ],
          hint: 'Check the error code within PrismaClientKnownRequestError, mapping P2002/P2003 to 409 and P2025 to 404.',
          scaffold: '-- Rows behind the conflict and the 404:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'A client never sees a database stack trace, only an honest HTTP status and message.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  return res.status(500).json({ error: \'Server error\' });\n}',
          code1:
            "export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (!err) return next();\n  if (err instanceof Prisma.PrismaClientKnownRequestError) {\n    if (err.code === 'P2002') return res.status(409).json({ error: 'Conflict' });\n    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });\n    if (err.code === 'P2003') return res.status(409).json({ error: 'Foreign key failure' });\n  }\n  return next(err);\n}",
          need: [
            "code === 'P2002'",
            'res.status(409)',
            "code === 'P2025'",
            'res.status(404)',
            "code === 'P2003'",
            'next(err)',
          ],
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma13-hw-2',
          title: 'Diagnostic Repair — Multi-Error Class Discrimination',
          description:
            'The following error middleware crashes at runtime with "Cannot read properties of undefined (reading \'code\')" whenever a non-Prisma error or query validation error reaches it. Diagnose the bug and add type guards to discriminate between database constraint errors (KnownRequestError with P2003) and query structural errors (PrismaClientValidationError returning 400).',
          instructions: [
            'Add `err instanceof Prisma.PrismaClientKnownRequestError` guard before checking `err.code === \'P2003\'`',
            'Add `err instanceof Prisma.PrismaClientValidationError` guard and respond with status 400',
            'Forward unmatched errors via `next(err)`',
            'Eliminate unsafe `(err as any)` type casts',
          ],
          hint: 'Use `instanceof` to narrow `err` to PrismaClientKnownRequestError and PrismaClientValidationError before accessing properties.',
          scaffold: '-- Safe error handling protects route availability:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Type guards ensure that untyped runtime errors never cause secondary unhandled exceptions in middleware.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            "export function safeErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  // BUG: Runtime crash on native Error or PrismaClientValidationError (err.code is undefined)\n  if ((err as any).code === 'P2003') {\n    return res.status(409).json({ error: 'Foreign key failure' });\n  }\n  return next(err);\n}",
          code1:
            "export function safeErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {\n    return res.status(409).json({ error: 'Foreign key failure' });\n  }\n  if (err instanceof Prisma.PrismaClientValidationError) {\n    return res.status(400).json({ error: 'Invalid query input' });\n  }\n  return next(err);\n}",
          need: [
            'err instanceof Prisma.PrismaClientKnownRequestError',
            "err.code === 'P2003'",
            'err instanceof Prisma.PrismaClientValidationError',
            'res.status(400)',
            'next(err)',
          ],
          ban: ['(err as any)'],
        }),
        type: 'challenge',
      },
    ],
  },
};
