import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

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
      theory: richPrismaTheory({
        summary:
          'Prisma throws typed exception classes: `PrismaClientKnownRequestError` carries a machine-readable `code` such as `P2002` (unique constraint violation) or `P2025` (record not found). Never parse string error messages; always branch on `error.code` inside an `instanceof` check to map to HTTP status codes.',
        takeaway:
          'Branch on `error.code`, never on error messages: P2002 -> 409, P2025 -> 404.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        heroCode:
          "try {\n  await prisma.user.create({ data: { name, email } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError) {\n    if (error.code === 'P2002') throw new ConflictError('Email already registered');\n    if (error.code === 'P2025') throw new NotFoundError('User not found');\n  }\n  throw error;\n}",
        heroLang: 'typescript',
        heroWhy: 'Two codes cover the vast majority of real API failures without string parsing.',
        mentalModel:
          '**Typed Error Contracts.** Database drivers emit raw error codes (e.g. Postgres 23505). Prisma standardizes these into typed `P-codes` attached to `PrismaClientKnownRequestError`. Instead of brittle regex checks against error strings, your API boundary checks `error.code` with full TypeScript exhaustiveness.',
        littleDetails: {
          title: 'Error Handling Rules & Code Contracts',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always guard with instanceof PrismaClientKnownRequestError',
              description: 'Prisma throws distinct error classes: `PrismaClientKnownRequestError` for query errors, `PrismaClientValidationError` for invalid query arguments, and `PrismaClientInitializationError` for connection failures. Never access `error.code` without checking `instanceof`.',
              badge: 'Type Guard',
            },
            {
              ruleNumber: 2,
              title: 'Never branch on error.message strings',
              description: 'Error messages change between database connectors (Postgres vs MySQL vs SQLite) and Prisma minor releases. The `code` property (`P2002`, `P2025`) is an immutable, guaranteed API contract.',
              badge: 'Stability',
            },
            {
              ruleNumber: 3,
              title: 'Inspect error.meta to identify the offending field',
              description: 'For `P2002`, `error.meta?.target` is an array containing the names of the conflicting columns (e.g. `["email"]`), allowing you to return targeted form validation messages.',
              badge: 'Field Metadata',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma P-Codes vs SQL Error Codes',
          mappings: [
            {
              prisma: "error.code === 'P2002'",
              sql: 'SQLSTATE 23505 (unique_violation)',
              note: 'Unique constraint breached; map to HTTP 409 Conflict',
            },
            {
              prisma: "error.code === 'P2025'",
              sql: '0 rows returned/affected on required mutation',
              note: 'Record to update/delete not found; map to HTTP 404',
            },
            {
              prisma: "error.code === 'P2003'",
              sql: 'SQLSTATE 23503 (foreign_key_violation)',
              note: 'Referenced foreign key missing; map to HTTP 409/400',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why does PrismaClientValidationError not have an error.code?',
              answer: 'ValidationError is thrown at the client library layer before hitting the database engine (e.g. invalid arguments or missing required fields). KnownRequestErrors come from database execution and possess P-codes.',
            },
            {
              questionNumber: 2,
              question: 'What should my catch block do with errors that do not match known codes?',
              answer: 'Always re-throw unhandled errors at the end of the condition chain. If an error is not a known client mistake (4xx), it must bubble up to the global 500 handler as a genuine server exception.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Type Guard Verification',
            codeSnippet: 'if (error instanceof Prisma.PrismaClientKnownRequestError) { /* ... */ }',
            explanation:
              'Guarding with the known error class safely narrows TypeScript types and exposes the typed `code` and `meta` properties.',
            visualData: {
              type: 'type_preview',
              title: 'Known Request Error Type',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Catch Unique Conflict (P2002)',
            codeSnippet: "INSERT INTO users (email) VALUES ('rafi@prisma.io');\n-- Throws P2002 unique key violation",
            explanation:
              'Triggered when an INSERT or UPDATE violates a unique index (such as a duplicate email).',
            visualData: {
              type: 'sql_lens',
              title: 'Unique Key Violation Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Catch Missing Target (P2025)',
            codeSnippet: "UPDATE users SET name = 'New' WHERE id = 9999;\n-- Throws P2025 record not found",
            explanation:
              'Triggered when `update`, `delete`, or `findUniqueOrThrow` encounters 0 matching rows.',
            visualData: {
              type: 'sql_lens',
              title: 'Record Not Found Query',
            },
          },
        ],
      }),
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
      theory: richPrismaTheory({
        summary:
          'Prisma error codes provide granular distinction beyond simple existence. `P2025` fires when `update`, `delete`, or `findUniqueOrThrow` encounters zero matching records (mapping to HTTP 404). `P2003` fires when a write violates a foreign key constraint by pointing to a non-existent parent row (mapping to HTTP 409 or 400). Both are deterministic client errors deserving clear status codes.',
        takeaway:
          'P2025 = missing record (404); P2003 = foreign key violation (409).',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        heroCode:
          "try {\n  await prisma.user.update({ where: { id }, data: { name } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError) {\n    if (error.code === 'P2002') return res.status(409).json({ error: 'Conflict' });\n    if (error.code === 'P2025') return res.status(404).json({ error: 'Not found' });\n    if (error.code === 'P2003') return res.status(409).json({ error: 'Related record missing' });\n  }\n  throw error;\n}",
        heroLang: 'typescript',
        heroWhy: 'Three codes handle the vast majority of domain API write failures.',
        mentalModel:
          '**Routing Perimeter Defenses.** When mutations fail, the error must be translated into standard HTTP semantics at the route handler boundary. If a user deletes an already-deleted resource, returning 404 communicates accurate resource state. If an article refers to a missing category ID, 409/400 communicates referential rejection without crashing the node process.',
        littleDetails: {
          title: 'Foreign Key & Missing Record Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'P2025 occurs on single-record mutations',
              description: 'Methods expecting an existing record (`update`, `delete`, `findFirstOrThrow`, `findUniqueOrThrow`) throw `P2025` when zero rows match the `where` condition.',
              badge: 'Existence Check',
            },
            {
              ruleNumber: 2,
              title: 'P2003 identifies broken foreign keys',
              description: 'Inserting or updating a child record with a foreign key scalar that does not exist in the referenced parent table produces `P2003`. Check `error.meta?.field_name` to know which relation broke.',
              badge: 'Referential Integrity',
            },
            {
              ruleNumber: 3,
              title: 'Bulk deleteMany and updateMany never throw P2025',
              description: 'Bulk operations return `{ count: 0 }` if no rows match the filter. Only targeted unique operations throw `P2025`.',
              badge: 'Method Difference',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma In-Route Errors vs Database Failures',
          mappings: [
            {
              prisma: "error.code === 'P2025'",
              sql: 'DELETE FROM users WHERE id = 999; -- 0 rows affected',
              note: 'Target record does not exist -> 404 Not Found',
            },
            {
              prisma: "error.code === 'P2003'",
              sql: 'INSERT INTO posts (author_id) VALUES (999); -- FK violates users(id)',
              note: 'Parent row missing -> 409 Conflict',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why should P2003 return 409 rather than 500?',
              answer: 'A foreign key violation is caused by client input (providing an ID of an entity that does not exist or has been deleted). Returning 500 falsely suggests an internal server crash.',
            },
            {
              questionNumber: 2,
              question: 'How do I know which relation failed when P2003 is thrown?',
              answer: 'Read `error.meta?.field_name`. Prisma populates this property with the name of the foreign key constraint that rejected the write.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Delete / Update Target Missing (P2025)',
            codeSnippet: 'DELETE FROM users WHERE id = 9999;\n-- Zero rows affected raises P2025',
            explanation:
              'When `delete` or `update` cannot locate the record specified by the unique key, trap `P2025` and inform the client the resource does not exist.',
            visualData: {
              type: 'sql_lens',
              title: 'Zero Rows Target Delete Query',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Referential Foreign Key Failure (P2003)',
            codeSnippet: 'INSERT INTO posts (title, author_id) VALUES (\'Hello\', 9999);\n-- Violates foreign key constraint users(id)',
            explanation:
              'When linking a child to a non-existent parent primary key, trap `P2003` to report invalid relational references.',
            visualData: {
              type: 'sql_lens',
              title: 'Foreign Key Violation Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Fallback to 500 for Unexpected Failures',
            codeSnippet: 'catch (error) {\n  return res.status(500).json({ error: "Internal server error" });\n}',
            explanation:
              'Any error code not explicitly handled as a predictable client error is treated as an internal server failure.',
            visualData: {
              type: 'type_preview',
              title: 'Error Response Payload',
            },
          },
        ],
      }),
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
        littleDetails: {
          title: 'Client Extension Rules & Immutability',
          rules: [
            {
              ruleNumber: 1,
              title: '$extends produces a new client instance',
              description: 'Calling `prisma.$extends()` does not mutate the original `prisma` client. It returns a newly extended client instance (`xprisma`) that carries the additional hooks and typed signatures.',
              badge: 'Immutability',
            },
            {
              ruleNumber: 2,
              title: 'query hooks must await and return query(args)',
              description: 'In a query extension, calling `await query(args)` executes the underlying database operation. If you do not return the result of `query(args)`, caller queries resolve to undefined.',
              badge: 'Query Invocation',
            },
            {
              ruleNumber: 3,
              title: 'result hooks require needs declarations',
              description: 'When defining a virtual computed property in `result`, the `needs` object declares which physical database columns must be loaded for the computation to run.',
              badge: 'Computed Fields',
            },
          ],
        },
        sqlBridge: {
          title: 'Client Extensions vs Database Middleware',
          mappings: [
            {
              prisma: 'prisma.$extends({ query: { user: { $allOperations } } })',
              sql: '-- Engine query interception before database dispatch',
              note: 'Applies query logging, multi-tenancy, or soft-delete filtering',
            },
            {
              prisma: 'result: { user: { fullName: { needs: { firstName: true, lastName: true }, compute(u) { ... } } } }',
              sql: 'SELECT first_name, last_name FROM users;',
              note: 'Computes virtual properties in memory without schema DDL changes',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why did Prisma deprecate $use middleware in favor of $extends?',
              answer: '`$use` erased TypeScript types and typed query inputs as `any`. `$extends` is completely type-safe: extensions infer custom method inputs, returned shapes, and computed fields throughout your application.',
            },
            {
              questionNumber: 2,
              question: 'Where should an extended Prisma client live in a project?',
              answer: 'Initialize and extend your client once in a centralized database module (e.g. `src/lib/db.ts`), and export the extended client instance for import across routes and services.',
            },
          ],
        },
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
