import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 14 — Production Prisma & Capstone (Phase 7: Advanced Patterns & Production).
 *
 * Pedagogical Sequence:
 *   Concept 1: Typed Error Classification — PrismaClientKnownRequestError, P2002, P2025, P2003
 *   Concept 2: Client Extensions ($extends) — Modern type-safe middleware and computed fields
 *   Concept 3: Raw SQL Escape Hatches — prisma.$queryRaw and Prisma.sql composable fragments
 *   Challenge: The Ultimate Prisma Fluency Capstone
 */
export const Prisma_14_MODULE: ModuleData = {
  id: 'prisma-14',
  slug: 'production-prisma-capstone',
  day: 14,
  title: 'Day 14 — Production Prisma & Capstone',
  shortTitle: 'Production Capstone',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-7',
  description:
    'Complete your Prisma mastery with typed error classification, type-safe client extensions with $extends, secure raw SQL escape hatches, and the ultimate enterprise capstone.',
  estimatedMinutes: 70,
  curriculumOrder: 14,
  displayLabel: 'Day 14',
  completionLearnings: [
    'Classify runtime database failures using PrismaClientKnownRequestError and typed codes P2002, P2025, and P2003',
    'Extend the Prisma Client using type-safe $extends hooks for computed fields and query interception',
    'Execute parameterized custom SQL queries using the $queryRaw tagged template and composable Prisma.sql fragments',
    'Synthesize schema design, relations, transactions, and error classification in a complete production API service',
  ],
  concepts: [
    {
      id: 'error-classification',
      order: 1,
      title: 'Typed Error Classification — P2002, P2025, P2003',
      shortDescription: 'Branch on machine-readable error codes instead of brittle string parsing.',
      theory: richPrismaTheory({
        summary:
          'Prisma throws typed exception classes: `PrismaClientKnownRequestError` carries a machine-readable `code` such as `P2002` (unique constraint violation), `P2025` (record not found), or `P2003` (foreign key violation). Never inspect error message strings; always branch on `error.code` inside an `instanceof` check to map cleanly to HTTP status codes (409 Conflict, 404 Not Found).',
        takeaway:
          'Branch on error.code, never on message strings: P2002 -> 409, P2025 -> 404, P2003 -> 409.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'try {\n  await prisma.user.create({ data: { name, email } });\n} catch (error) {\n  if (error instanceof Prisma.PrismaClientKnownRequestError) {\n    if (error.code === "P2002") return res.status(409).json({ error: "Email exists" });\n    if (error.code === "P2025") return res.status(404).json({ error: "Not found" });\n  }\n  throw error;\n}',
        heroLang: 'typescript',
        heroWhy: 'Machine-readable codes provide an immutable contract across database engines.',
        mentalModel:
          '**Immutable Error Protocols.** Database drivers emit engine-specific error numbers (e.g. Postgres 23505, SQLite 19). Prisma standardizes these into universal `P-codes` attached to `PrismaClientKnownRequestError`. At the HTTP perimeter, you translate these codes directly into REST semantics without guessing.',
        littleDetails: {
          title: 'Error Handling Rules & Code Contracts',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always guard with instanceof check',
              description: 'Prisma throws distinct error classes: `PrismaClientKnownRequestError` for query failures, `PrismaClientValidationError` for argument type issues, and `PrismaClientInitializationError` for connection errors.',
              badge: 'Type Guard',
            },
            {
              ruleNumber: 2,
              title: 'Never branch on error.message',
              description: 'Error messages vary between database dialects and Prisma minor releases. The `code` property (`P2002`, `P2025`) is guaranteed stable.',
              badge: 'Stability',
            },
            {
              ruleNumber: 3,
              title: 'Inspect error.meta for column specifics',
              description: 'For `P2002`, `error.meta?.target` lists the conflicting field names (e.g. `["email"]`), allowing you to highlight the exact input field in user interfaces.',
              badge: 'Metadata',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Error Codes to Database Violations',
          mappings: [
            {
              prisma: "error.code === 'P2002'",
              sql: 'SQLSTATE 23505 (unique_violation) -> HTTP 409 Conflict',
              note: 'Unique index collision on primary or secondary unique fields.',
            },
            {
              prisma: "error.code === 'P2025'",
              sql: 'Zero rows affected in targeted UPDATE/DELETE -> HTTP 404 Not Found',
              note: 'Expected record does not exist in the database.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Which status code should I return when P2002 is caught?',
              answer: 'Return HTTP 409 Conflict with details on which unique field was duplicated.',
            },
            {
              questionNumber: 2,
              question: 'Why do deleteMany() and updateMany() never throw P2025?',
              answer: 'Bulk operations modify 0 to N rows and return `{ count: number }`. Only single-entity unique methods (`update`, `delete`, `findUniqueOrThrow`) throw P2025.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Wrap mutation in try/catch block',
            codeSnippet: 'try {\n  return await prisma.user.create({ data });\n} catch (error) {',
            explanation: 'Catches database exceptions thrown by the query engine.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Verify error is PrismaClientKnownRequestError',
            codeSnippet: 'if (error instanceof Prisma.PrismaClientKnownRequestError) {',
            explanation: 'Narrows the exception to an engine request error carrying a typed code.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Branch on error.code and map to HTTP status',
            codeSnippet: 'if (error.code === "P2002") return res.status(409).json({ error: "Conflict" });',
            explanation: 'Converts database constraint violation into standard HTTP response.',
            visualData: {
              type: 'type_preview',
              title: 'Error Classification Contract',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c1-t1',
          title: 'Conflict Guard: Trap P2002 unique constraint violations as HTTP 409',
          description: 'Catch PrismaClientKnownRequestError and return HTTP 409 when error.code is P2002.',
          instructions: [
            'Check `if (error instanceof Prisma.PrismaClientKnownRequestError)`',
            'If `error.code === "P2002"`, return `res.status(409).json({ error: "Conflict" })`',
          ],
          hintLadder: [
            'Check for PrismaClientKnownRequestError using instanceof.',
            'Branch on error.code === "P2002".',
            'Return status 409 with error object.',
          ],
          scaffold: '-- Valid requests survive without error:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Trapping P2002 prevents server 500 crashes on duplicate unique inputs.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function handleCreate(req: Request, res: Response) {\n  try {\n    return await prisma.user.create({ data: req.body });\n  } catch (error) {\n    return res.status(500).json({ error: "Server error" });\n  }\n}',
          code1:
            'export async function handleCreate(req: Request, res: Response) {\n  try {\n    return await prisma.user.create({ data: req.body });\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError) {\n      if (error.code === "P2002") {\n        return res.status(409).json({ error: "Conflict" });\n      }\n    }\n    return res.status(500).json({ error: "Server error" });\n  }\n}',
          need: ['Prisma.PrismaClientKnownRequestError', 'error.code === "P2002"', 'res.status(409)'],
        }),
        prismaSnippetTask({
          id: 'prisma14-c1-t2',
          title: 'Not Found Handler: Trap P2025 missing record errors as HTTP 404',
          description: 'Catch P2025 on single record update and respond with HTTP 404 Not Found.',
          instructions: [
            'Inside catch, check `error.code === "P2025"`',
            'Respond with status 404 Not Found',
          ],
          hintLadder: [
            'When an update target does not exist, Prisma raises P2025.',
            'Branch on error.code === "P2025" and respond with status 404.',
            'Write: if (error.code === "P2025") return res.status(404).json({ error: "Not found" });',
          ],
          scaffold: '-- Targeted row resolves if present:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'P2025 communicates resource absence cleanly to callers.',
          cols: ['id'],
          rows: 1,
          code0:
            'export async function handleUpdate(id: number, name: string, res: Response) {\n  try {\n    return await prisma.user.update({ where: { id }, data: { name } });\n  } catch (error) {\n    return res.status(500).json({ error: "Server error" });\n  }\n}',
          code1:
            'export async function handleUpdate(id: number, name: string, res: Response) {\n  try {\n    return await prisma.user.update({ where: { id }, data: { name } });\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError) {\n      if (error.code === "P2025") {\n        return res.status(404).json({ error: "Not found" });\n      }\n    }\n    return res.status(500).json({ error: "Server error" });\n  }\n}',
          need: ['error.code === "P2025"', 'res.status(404)'],
          demoVariables: { id: 1, name: 'Alex Updated' },
        }),
      ],
    },
    {
      id: 'client-extensions',
      order: 2,
      title: 'Client Extensions ($extends) — Computed Fields & Hooks',
      shortDescription: 'Type-safe client extension replacing deprecated $use middleware.',
      theory: richPrismaTheory({
        summary:
          'Prisma Client Extensions (`prisma.$extends({ ... })`) provide a type-safe way to customize the client. A `result` extension computes virtual fields in memory without altering database DDL; a `query` extension intercepts operations for centralized logging, multi-tenancy, or soft deletion. Calling `$extends()` does not mutate the base client — it returns a new extended client instance with complete TypeScript type inference.',
        takeaway:
          '$extends is the modern, type-safe replacement for deprecated $use middleware.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'const xprisma = prisma.$extends({\n  result: {\n    user: {\n      fullName: {\n        needs: { firstName: true, lastName: true },\n        compute(user) {\n          return `${user.firstName} ${user.lastName}`;\n        },\n      },\n    },\n  },\n});',
        heroLang: 'typescript',
        heroWhy: '$extends preserves end-to-end TypeScript types across queries and computed properties.',
        mentalModel:
          '**Immutable Client Extension.** Instead of monkey-patching client methods or relying on untyped runtime hooks, `$extends` derives an augmented client whose type definitions reflect the added methods and virtual fields. The old `$use` middleware erased TypeScript types and typed query inputs as `any` — `$extends` maintains full type safety.',
        littleDetails: {
          title: 'Client Extension Rules & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: '$extends returns a new client instance',
              description: 'Calling `prisma.$extends()` does not mutate the root `prisma` client. Always export and import the derived extended client (`xprisma`).',
              badge: 'Immutability',
            },
            {
              ruleNumber: 2,
              title: 'result hooks require needs declarations',
              description: 'When defining computed properties, the `needs` object declares which database columns must be selected for the computation function to receive them.',
              badge: 'Computed Fields',
            },
            {
              ruleNumber: 3,
              title: 'Never use deprecated $use middleware',
              description: 'Prisma deprecated `$use` because it erased compiler types. Always use `$extends` for intercepting queries or enhancing models.',
              badge: 'Modern Standard',
            },
          ],
        },
        sqlBridge: {
          title: 'Client Extensions vs Database Columns',
          mappings: [
            {
              prisma: 'result: { user: { fullName: { needs: { firstName: true, lastName: true }, compute } } }',
              sql: 'SELECT first_name, last_name FROM users;',
              note: 'Loads physical database columns; computation runs in Node memory.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why should I use $extends instead of $use?',
              answer: '`$use` is deprecated and erased TypeScript types. `$extends` is completely type-safe and adds autocomplete for computed fields.',
            },
            {
              questionNumber: 2,
              question: 'Where should the extended client be instantiated?',
              answer: 'Instantiate and extend once in your centralized database library (e.g. `src/lib/db.ts`) and export the extended client across your application.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Call prisma.$extends with result or query block',
            codeSnippet: 'const xprisma = prisma.$extends({\n  result: {\n    user: {\n      fullName: {\n        needs: { firstName: true, lastName: true },\n        compute(u) { return `${u.firstName} ${u.lastName}`; }\n      }\n    }\n  }\n});',
            explanation: 'Declares computed properties and required underlying database fields.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Query using extended client',
            codeSnippet: 'const user = await xprisma.user.findFirst();',
            explanation: 'The resulting object includes the computed fullName property with full TypeScript typing.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Access virtual property with full type safety',
            codeSnippet: 'console.log(user.fullName);',
            explanation: 'Computed in memory on access without DDL migrations.',
            visualData: {
              type: 'type_preview',
              title: 'Extended Type Shape',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c2-t1',
          title: 'Computed Attributes: Implement fullName extension with $extends',
          description:
            'Use $extends to add a virtual fullName field to User. The legacy $use middleware is deprecated and forbidden.',
          instructions: [
            'Call `prisma.$extends` with a `result.user` block',
            'Define `fullName` requiring `firstName` and `lastName`',
            'Return `${user.firstName} ${user.lastName}` in `compute`',
            'Never use deprecated `$use`',
          ],
          hintLadder: [
            'Use prisma.$extends({ result: { user: { ... } } }).',
            'Specify needs: { firstName: true, lastName: true } and compute(user) { ... }.',
            'Export xprisma assigned to the extended client.',
          ],
          scaffold: '-- Physical columns loaded by extended client:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: '$extends computes fields in memory while maintaining TypeScript types.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            '// Anti-pattern: deprecated $use middleware\nexport function extendClient(prisma: any) {\n  return prisma.$use(async (params: any, next: any) => next(params));\n}',
          code1:
            'export function extendClient(prisma: any) {\n  return prisma.$extends({\n    result: {\n      user: {\n        fullName: {\n          needs: { firstName: true, lastName: true },\n          compute(user: any) {\n            return `${user.firstName} ${user.lastName}`;\n          },\n        },\n      },\n    },\n  });\n}',
          need: ['$extends', 'result:', 'fullName:', 'needs:', 'compute'],
          ban: ['$use'],
        }),
        prismaSnippetTask({
          id: 'prisma14-c2-t2',
          title: 'Query Interception: Log operations with $extends query hook',
          description: 'Intercept and log all user model queries using an extended client query hook.',
          instructions: [
            'Call `prisma.$extends` with `query.user`',
            'Use `$allOperations({ args, query })`',
            'Await and return `query(args)`',
          ],
          hintLadder: [
            'Inside query extension, define user: { async $allOperations({ args, query }) { ... } }.',
            'Call await query(args) and return the result.',
            'Return the extended client instance.',
          ],
          scaffold: '-- Operations intercepted and executed:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'Query hooks provide a centralized interception point for logging and metrics.',
          cols: ['id'],
          rows: 1,
          code0:
            'export function createLoggedClient(prisma: any) {\n  // Intercept operations:\n\n}',
          code1:
            'export function createLoggedClient(prisma: any) {\n  return prisma.$extends({\n    query: {\n      user: {\n        async $allOperations({ args, query }: any) {\n          const result = await query(args);\n          return result;\n        },\n      },\n    },\n  });\n}',
          need: ['$extends', 'query:', '$allOperations', 'await query(args)'],
          ban: ['$use'],
        }),
      ],
    },
    {
      id: 'raw-sql-escape-hatch',
      order: 3,
      title: 'Raw SQL Escape Hatches — $queryRaw & Prisma.sql',
      shortDescription: 'Execute custom parameterized queries when ORM abstractions are not enough.',
      theory: richPrismaTheory({
        summary:
          'When you need complex database-specific features (e.g. window functions, recursive CTEs, full-text ranking) that Prisma’s query builder does not support, use `prisma.$queryRaw`. The `$queryRaw` tagged template literal automatically turns JavaScript expressions into secure parameterized SQL variables. The unsafe string concatenation method `$queryRawUnsafe` is forbidden to prevent SQL injection.',
        takeaway:
          'Use prisma.$queryRaw tagged templates with parameterized inputs; never concatenate raw strings.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'const email = "alex@prisma.io";\nconst users = await prisma.$queryRaw<User[]>`\n  SELECT id, email\n  FROM users\n  WHERE email = ${email};\n`;',
        heroLang: 'typescript',
        heroWhy: 'Tagged template automatically binds ${email} as a parameterized database variable.',
        mentalModel:
          '**Secure Parameterization by Construction.** A tagged template literal is not a normal string interpolation. JavaScript decomposes `prisma.$queryRaw` into strings and parameter values separately. Prisma transmits the SQL query with placeholders (`$1`) and sends the values out-of-band, rendering SQL injection mathematically impossible.',
        littleDetails: {
          title: 'Raw SQL Invariants & Safety',
          rules: [
            {
              ruleNumber: 1,
              title: 'Tagged templates are safe; $queryRawUnsafe is hazardous',
              description: '`prisma.$queryRaw` automatically parameterizes interpolated variables. Never pass concatenated strings to `$queryRawUnsafe` in production.',
              badge: 'Security',
            },
            {
              ruleNumber: 2,
              title: 'Prisma.sql builds reusable query fragments',
              description: 'To dynamically construct raw queries, compose fragments using the `Prisma.sql` helper instead of string concatenation.',
              badge: 'Composition',
            },
            {
              ruleNumber: 3,
              title: 'Type assertions required on raw queries',
              description: 'Because raw queries bypass schema generation, supply an explicit generic type: `prisma.$queryRaw<User[]>` to type the returned rows.',
              badge: 'Type Safety',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma $queryRaw to Parameterized SQL Protocol',
          mappings: [
            {
              prisma: 'prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`',
              sql: 'PREPARE stmt AS SELECT * FROM users WHERE email = $1; EXECUTE stmt(email);',
              note: 'Transmits query text and parameters in separate protocol packets.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I reach for $queryRaw?',
              answer: 'Only when Prisma’s native methods cannot express the query (e.g. advanced analytics, window functions, recursive CTEs, specialized database functions).',
            },
            {
              questionNumber: 2,
              question: 'How do I dynamically append WHERE clauses to a raw query safely?',
              answer: 'Use `Prisma.sql` fragments. Concatenating strings reintroduces SQL injection vulnerabilities.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Write query using $queryRaw tagged template',
            codeSnippet: 'await prisma.$queryRaw`SELECT id, email FROM users WHERE id = ${id}`;',
            explanation: 'The query engine extracts ${id} as a parameter placeholder.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Compose fragments with Prisma.sql if dynamic',
            codeSnippet: 'const condition = Prisma.sql`WHERE id = ${id}`;\nawait prisma.$queryRaw`SELECT id FROM users ${condition}`;',
            explanation: 'Preserves parameter bindings across composed fragments.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Annotate returned row types',
            codeSnippet: 'type UserRow = { id: number; email: string };',
            explanation: 'Strongly types raw database query results.',
            visualData: {
              type: 'type_preview',
              title: 'Raw Query Return Type',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c3-t1',
          title: 'Raw Query Parameterization: Execute custom query with $queryRaw',
          description: 'Fetch user by email using prisma.$queryRaw with template parameterization.',
          instructions: [
            'Use `prisma.$queryRaw` with template literal',
            'Bind the email as an interpolated parameter',
            'Do NOT use `$queryRawUnsafe`',
          ],
          hintLadder: [
            'Tagged template literals in $queryRaw automatically parameterize variables.',
            'Pass the SQL statement directly as a template literal string.',
            'Write: return await prisma.$queryRaw`SELECT id, email FROM users WHERE email = ${email}`;',
          ],
          scaffold: '-- Raw parameterized query executed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The tagged template keeps values bound out-of-band, preventing SQL injection.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function findRaw(email: string) {\n  // Execute raw query:\n\n}',
          code1:
            'export async function findRaw(email: string) {\n  return await prisma.$queryRaw`\n    SELECT id, email FROM users WHERE email = ${email}\n  `;\n}',
          need: ['$queryRaw', 'SELECT id, email FROM users'],
          ban: ['$queryRawUnsafe'],
          rtype: '{ id: number; email: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma14-c3-t2',
          title: 'Composable SQL Fragments: Build dynamic query with Prisma.sql',
          description: 'Build a reusable WHERE fragment with Prisma.sql and interpolate into $queryRaw.',
          instructions: [
            'Use `Prisma.sql` to build the condition fragment',
            'Embed the fragment into `prisma.$queryRaw`',
          ],
          hintLadder: [
            'Prisma.sql constructs safe composable SQL fragments.',
            'Create const whereClause = Prisma.sql`WHERE email = ${email}`.',
            'Embed whereClause in prisma.$queryRaw.',
          ],
          scaffold: '-- Dynamic query composed safely:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Prisma.sql safely composes query fragments without string concatenation.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function findDynamic(email: string) {\n  // Build composable raw query:\n\n}',
          code1:
            'export async function findDynamic(email: string) {\n  const condition = Prisma.sql`WHERE email = ${email}`;\n  return await prisma.$queryRaw`\n    SELECT id, email FROM users ${condition}\n  `;\n}',
          need: ['Prisma.sql', '$queryRaw'],
          ban: ['$queryRawUnsafe'],
          rtype: '{ id: number; email: string }[]',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma14-challenge',
    title: 'Final Challenge — Production Enterprise Fluency Capstone',
    scenario: 'Synthesize the complete Prisma curriculum in a resilient production service.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma14-hw-1',
          title: 'Production Service: Synthesize paginated read, transaction write, and error guard',
          description:
            'Implement a robust member service that retrieves live users ordered by id, with safe projections from scratch.',
          instructions: [
            'Query `prisma.user.findMany()`',
            'Order by `id: "asc"`',
            'Take `2` records',
            'Select only `id: true` and `email: true`',
          ],
          hintLadder: [
            'Production read endpoints require deterministic ordering, pagination bounds, and safe projections.',
            'Combine orderBy: { id: "asc" }, take: 2, and select: { id: true, email: true }.',
            'Write: return await prisma.user.findMany({ orderBy: { id: "asc" }, take: 2, select: { id: true, email: true } });',
          ],
          fromScratch: true,
          scaffold: '-- First 2 members in deterministic order:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC LIMIT 2;',
          why: 'The capstone validates production pagination, sorting, and projection contracts.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          rows: 2,
          code0:
            'export async function getProductionFeed() {\n  // Write production query from scratch:\n\n}',
          code1:
            'export async function getProductionFeed() {\n  return await prisma.user.findMany({\n    orderBy: { id: "asc" },\n    take: 2,\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        type: 'challenge',
      },
    ],
  },
};
