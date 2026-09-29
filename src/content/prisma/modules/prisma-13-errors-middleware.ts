import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

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
    ],
  },
};
