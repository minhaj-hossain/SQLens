import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

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
      theory: richPrismaTheory({
        summary:
          'Prisma provides five unified query families. **Reads:** `findUnique`, `findFirst`, `findMany`, and `findUniqueOrThrow`. **Writes:** `create`, `update`, `delete`, `upsert`, and their `Many` batch counterparts. **Nested Writes:** `create`, `connect`, and `connectOrCreate` across relation graphs. **Transactions:** `$transaction([...])` for sequential batches and `$transaction(async (tx) => ...)` for interactive logic. **Raw SQL:** `$queryRaw` and `$executeRaw` parameterized escape hatches.',
        takeaway:
          'Five query families: reads, writes, nested relations, transactions, and raw escape hatches.',
        sql: "SELECT id, email\nFROM users\nORDER BY id ASC;",
        heroCode:
          '// Read     prisma.user.findMany(...)\n// Write    prisma.user.create({ data, select })\n// Nested   prisma.user.create({ data: { posts: { create } } })\n// Tx       prisma.$transaction([...])\n// Raw      prisma.$queryRaw`SELECT ...`',
        heroLang: 'typescript',
        heroWhy: 'Knowing which query family fits the requirement is the fundamental architectural skill.',
        mentalModel:
          '**The Complete Database Interface.** Modern applications navigate between high-level ORM type safety and raw relational performance. By selecting the optimal query family—leveraging `findUniqueOrThrow` for clean route handlers, nested writes for entity graphs, and interactive transactions for multi-step integrity—you eliminate boilerplate while preserving strict invariants.',
        littleDetails: {
          title: 'Query Toolbox Rules & Method Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'findUniqueOrThrow replaces verbose null checks',
              description: 'When looking up an entity that is required to exist (e.g. an authenticated user or active resource), use `findUniqueOrThrow()`. It automatically throws `P2025` on missing records, pairing cleanly with central error catch blocks.',
              badge: 'Clean Code',
            },
            {
              ruleNumber: 2,
              title: 'select and include are mutually exclusive at root',
              description: 'You cannot specify both `select` and `include` at the top level of the same query. To fetch related models alongside scalar fields, nest relation selection inside `select: { id: true, posts: { select: { title: true } } }`.',
              badge: 'Query Structure',
            },
            {
              ruleNumber: 3,
              title: 'Batch operations trade row returns for throughput',
              description: '`createMany`, `updateMany`, and `deleteMany` return `{ count: number }` rather than individual model instances. Use single-row methods when the caller needs generated IDs or mutated values.',
              badge: 'Throughput Trade-off',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Query Families vs Relational Statements',
          mappings: [
            {
              prisma: 'prisma.user.findUniqueOrThrow({ where: { id: 1 } })',
              sql: 'SELECT * FROM users WHERE id = 1; -- (asserts 1 row returned)',
              note: 'Reads entity; throws P2025 if missing',
            },
            {
              prisma: 'prisma.user.updateMany({ where: { role: "GUEST" }, data: { active: false } })',
              sql: 'UPDATE users SET active = false WHERE role = $1;',
              note: 'Bulk update returning affected row count',
            },
            {
              prisma: 'posts: { create: [{ title: "Hello" }] }',
              sql: 'INSERT INTO posts (title, author_id) VALUES ($1, $2);',
              note: 'Implicit transactional nested write',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I reach for findUnique vs findUniqueOrThrow?',
              answer: 'Use `findUnique` when absence is a regular business branch (e.g. checking whether an email is available during signup). Use `findUniqueOrThrow` when the record must exist (e.g. fetching a profile from a validated session ID).',
            },
            {
              questionNumber: 2,
              question: 'How do I paginate large result sets without memory spikes?',
              answer: 'Always pair `take` with `orderBy`. For infinite scrolling or high-scale feeds, use cursor-based pagination (`cursor: { id }`) rather than high offset numbers.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Read Family & Assertion Methods',
            codeSnippet: 'const user = await prisma.user.findUniqueOrThrow({ where: { id } });',
            explanation:
              'Lookup that throws a typed P2025 error on miss, eliminating redundant if-null guards in application code.',
            visualData: {
              type: 'type_preview',
              title: 'Asserted User Entity',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Write Family & Single vs Batch Semantics',
            codeSnippet: "UPDATE users\nSET name = 'Mina'\nWHERE id = 1\nRETURNING id, name;",
            explanation:
              'Single mutations return the full entity and support nested relation writes; batch mutations return row counts and maximize performance.',
            visualData: {
              type: 'sql_lens',
              title: 'Single Entity Update Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Transactions & Escape Hatches',
            codeSnippet: 'SELECT id, email\nFROM users\nORDER BY id ASC;',
            explanation:
              'Wrap multi-turn operations in `$transaction` and reach for `$queryRaw` when complex analytics require custom database features.',
            visualData: {
              type: 'sql_lens',
              title: 'Deterministic Query Execution',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c1-t1',
          title: 'Lookup that throws instead of returning null',
          description: 'Fetch user by id. If missing, throw a typed P2025 error instead of returning null.',
          instructions: ['Use `prisma.user.findUniqueOrThrow`', 'Select `id` and `email`'],
          hint: '`findUniqueOrThrow` raises `P2025` on a miss — no null check needed.',
          hintLadder: [
            'When looking up an entity that is required to exist for route execution, assertion lookup methods throw a typed not-found error rather than returning null. This eliminates manual existence branching in handler code.',
            'Use findUniqueOrThrow with where identifying the record and select projecting id and email.',
            'Replace findUnique with findUniqueOrThrow:\nreturn await prisma.user.findUniqueOrThrow({\n  where: { id },\n  select: { id: true, email: /* boolean */ },\n});',
          ],
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
          hintLadder: [
            'A complete soft-delete lifecycle mutates the record by setting its tombstone timestamp before subsequent business queries filter out non-active entities with a null check.',
            'Perform an update setting data: { deletedAt: new Date() }, then call findMany with where: { deletedAt: null } and projection.',
            'Tombstone with update and filter live rows with findMany:\nawait prisma.user.update({\n  where: { id },\n  data: { deletedAt: new Date() },\n});\nreturn await prisma.user.findMany({\n  where: { deletedAt: /* active condition */ },\n  select: { id: true, email: true },\n});',
          ],
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
      theory: richPrismaTheory({
        summary:
          'Production Prisma APIs combine four foundational pillars. **Deterministic Projections:** always specify `select` to prevent over-fetching and pair `take` with `orderBy`. **Transactional Integrity:** wrap multi-model workflows in `$transaction` to prevent partial state corruption. **Perimeter Conflict Trapping:** trap `P2002` and `P2025` into HTTP 409 and 404. **Dual-Layer Deletion:** declare `onDelete` cascades at schema level and use `deletedAt` tombstones for application-layer audit trails.',
        takeaway:
          'Project with select, order for determinism, transact multi-step writes, and trap error codes.',
        sql: "SELECT id, email\nFROM users\nORDER BY id ASC;",
        heroCode:
          'const users = await prisma.user.findMany({\n  where: { deletedAt: null },\n  orderBy: { id: \'asc\' },\n  select: { id: true, email: true },\n  take: 10,\n});',
        heroLang: 'typescript',
        heroWhy: 'Every clause has a distinct role: `where` scopes, `orderBy` determinises, `select` projects, `take` pages.',
        mentalModel:
          '**Architectural Synthesis.** A robust database layer does not treat queries in isolation. A paginated endpoint filters soft-deleted rows, sorts deterministically by primary key, limits result windows, and selects only public fields. Multi-step mutations execute inside transactional perimeters where conflict codes are transformed into clean HTTP status codes.',
        littleDetails: {
          title: 'Production API Patterns & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'Pagination requires deterministic ordering',
              description: 'Never call `take` or `skip` without an explicit `orderBy`. Relational databases do not guarantee row order without an explicit `ORDER BY` clause.',
              badge: 'Pagination Invariant',
            },
            {
              ruleNumber: 2,
              title: 'Inline error trapping inside controllers',
              description: 'Trap `PrismaClientKnownRequestError` immediately around writes. Map `P2002` to 409 Conflict with field-specific feedback, and pass unexpected errors down to global error middleware.',
              badge: 'Defensive Coding',
            },
            {
              ruleNumber: 3,
              title: 'Validate before writing with Zod',
              description: 'Catch missing or malformed fields at the request boundary using Zod schemas before calling Prisma, keeping database logs clean of preventable validation errors.',
              badge: 'Validation Boundary',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma API Query vs SQL Equivalent',
          mappings: [
            {
              prisma: "prisma.user.findMany({ where: { deletedAt: null }, orderBy: { id: 'asc' }, take: 10, select: { id: true, email: true } })",
              sql: "SELECT id, email FROM users WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 10;",
              note: 'Deterministic, paginated, filtered projection',
            },
            {
              prisma: "await prisma.$transaction(async (tx) => { ... })",
              sql: "BEGIN; ... COMMIT; (or ROLLBACK on failure)",
              note: 'Atomic execution boundary',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'What is the complete checklist for a production read endpoint?',
              answer: '1. Filter soft-deleted rows (`where: { deletedAt: null }`). 2. Deterministic sort (`orderBy: { id: "asc" }`). 3. Pagination ceiling (`take: N`). 4. Explicit projection (`select: { ... }`) omitting sensitive columns.',
            },
            {
              questionNumber: 2,
              question: 'How do transactions interact with error trapping?',
              answer: 'If an error occurs inside `$transaction(async (tx) => ...)`, let it throw so Prisma can ROLLBACK the transaction. Catch the error OUTSIDE the transaction call to map it to an HTTP response.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Deterministic Paginated Projection',
            codeSnippet: 'SELECT id, email FROM users ORDER BY id ASC LIMIT 2;',
            explanation:
              'Guarantees predictable pagination, prevents sensitive column leakage, and excludes soft-deleted rows in a single indexed query.',
            visualData: {
              type: 'sql_lens',
              title: 'Paginated Projection Query',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Atomic Multi-Step Writes',
            codeSnippet: 'BEGIN;\n-- User INSERT\n-- Post INSERT\nCOMMIT;',
            explanation:
              'Ensures that related entities are committed together, rolling back everything if any intermediate write fails.',
            visualData: {
              type: 'sql_lens',
              title: 'Atomic Transaction Block',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Defensive Conflict Translation',
            codeSnippet: 'if (err.code === "P2002") return res.status(409).json({ error: "Conflict" });',
            explanation:
              'Prevents application crashes and exposes clear API feedback when duplicate unique constraints are encountered.',
            visualData: {
              type: 'type_preview',
              title: 'Conflict Error Response',
            },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c2-t1',
          title: 'Deterministic paginated roster',
          description: 'Return the first 2 live users ordered by id, projecting id + email only.',
          instructions: ['`orderBy: { id: "asc" }`', '`take: 2`', 'Select `id` and `email` only'],
          hint: 'ORDER BY + LIMIT is the combination that makes pagination reproducible.',
          hintLadder: [
            'Deterministic pagination requires an explicit ordering column so database engines return identical page slices across subsequent calls. Combining ordering with a limit and column projection creates stable, leak-free paginated endpoints.',
            'In findMany, supply orderBy: { id: \'asc\' }, take: 2, and select: { id: true, email: true } while omitting unrequested attributes.',
            'Add orderBy and take while refining select:\nreturn await prisma.user.findMany({\n  orderBy: { id: \'asc\' },\n  select: { id: true, email: /* boolean */ },\n  take: 2,\n});',
          ],
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
          hintLadder: [
            'Wrapping registration in an interactive transaction guarantees that creating account records executes atomically, while catching unique key violations at the perimeter converts constraint failures into clean HTTP 409 Conflict responses.',
            'Wrap tx.user.create in prisma.$transaction(async (tx) => ...), wrapped in try-catch that inspects error.code === \'P2002\'.',
            'Execute create on tx inside transaction and trap P2002:\ntry {\n  const user = await prisma.$transaction(async (tx) => {\n    return await tx.user.create({\n      data: { email, name },\n      select: { id: true, email: true },\n    });\n  });\n  return res.status(201).json(user);\n} catch (err) {\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === \'P2002\') {\n    return res.status(409).json({ error: /* message */ });\n  }\n  throw err;\n}',
          ],
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
        littleDetails: {
          title: 'Raw SQL Rules & Injection Prevention',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always use tagged template literals',
              description: 'Always invoke `prisma.$queryRaw` using backticks as a tagged template: `prisma.$queryRaw\`SELECT * FROM users WHERE email = ${email}\``. Prisma converts variables into parameterized placeholders ($1, $2), making SQL injection impossible.',
              badge: 'Security',
            },
            {
              ruleNumber: 2,
              title: 'Avoid $queryRawUnsafe with concatenated strings',
              description: '`$queryRawUnsafe` accepts plain strings and bypasses parameterization. Using string concatenation (`+` or untagged template strings) introduces critical SQL injection vulnerabilities.',
              badge: 'Anti-Pattern',
            },
            {
              ruleNumber: 3,
              title: 'Compose dynamic clauses with Prisma.sql',
              description: 'To conditionally add WHERE or ORDER BY fragments, build them with the `Prisma.sql` helper. Composed fragments retain parameter binding across interpolation.',
              badge: 'Composition',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Raw SQL vs Database Prepared Statements',
          mappings: [
            {
              prisma: 'prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`',
              sql: 'PREPARE stmt(int) AS SELECT * FROM users WHERE id = $1; EXECUTE stmt(1);',
              note: 'Values bound safely as parameterized inputs',
            },
            {
              prisma: 'prisma.$executeRaw`DELETE FROM users WHERE id = ${id}`',
              sql: 'DELETE FROM users WHERE id = $1;',
              note: 'Executes raw write and returns affected row count',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I drop down to $queryRaw?',
              answer: 'Only when Prisma Query Builder cannot express the query: e.g. recursive CTEs, vendor-specific full-text search operators, window functions with custom frames, or specialized database performance hints.',
            },
            {
              questionNumber: 2,
              question: 'How do I type the returned records of $queryRaw?',
              answer: 'Pass a type argument: `await prisma.$queryRaw<UserDTO[]>\`SELECT id, email FROM users\``. Because raw SQL bypasses schema typing, verify that the SELECT columns match the TypeScript interface.',
            },
          ],
        },
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
          hintLadder: [
            'When complex SQL operations cannot be expressed with the standard query builder, tagged raw query templates execute custom SQL statements while automatically binding interpolated variables as secure parameterized inputs.',
            'Invoke prisma.$queryRaw as a tagged template with the raw SELECT statement and interpolated email parameter.',
            'Execute the raw query with template interpolation:\nreturn await prisma.$queryRaw`\n  SELECT id, email FROM users WHERE email = ${/* email variable */}\n`;',
          ],
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
          hintLadder: [
            'Dynamic SQL composition can lead to injection vulnerabilities if raw strings are concatenated. Helper SQL templates produce composable query fragments that preserve parameter binding when embedded inside outer raw queries.',
            'Construct the where fragment using Prisma.sql`WHERE id = ${id}` and embed it into the $queryRaw tagged template.',
            'Compose the fragment and interpolate into $queryRaw:\nconst where = Prisma.sql`WHERE id = ${id}`;\nreturn await prisma.$queryRaw`\n  SELECT id, email FROM users ${/* composable fragment */}\n`;',
          ],
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
        ...prismaSnippetTask({
          id: 'prisma14-hw-1',
          title: 'Member Directory — Multi-Model Paginated Service Synthesis',
          description:
            'Implement an enterprise member directory query synthesizing soft-delete filtering, deterministic pagination, and selective relational projection. Retrieve the first 2 active members (where deletedAt is null) ordered by ID ascending, projecting id, email, and related post titles while omitting sensitive columns.',
          instructions: [
            'Filter active members using `where: { deletedAt: null }`',
            'Order deterministically with `orderBy: { id: \'asc\' }` and limit to 2 using `take: 2`',
            'Project `id` and `email` on the parent model',
            'Nest `posts: { select: { title: true } }` to include post titles without over-fetching',
          ],
          hint: 'Combine `where: { deletedAt: null }`, `orderBy: { id: \'asc\' }`, `take: 2`, and nested `posts: { select: { title: true } }` inside `select`.',
          hintLadder: [
            'Enterprise data services synthesize multiple query concerns: filtering soft-deleted records, enforcing deterministic primary-key ordering, capping page window size, and projecting related entity collections without over-fetching sensitive columns.',
            'In prisma.user.findMany, configure where: { deletedAt: null }, orderBy: { id: \'asc\' }, take: 2, and select with id, email, and nested posts: { select: { title: true } }.',
            'Assemble the synthesis query options:\nreturn await prisma.user.findMany({\n  where: { deletedAt: null },\n  orderBy: { id: \'asc\' },\n  take: 2,\n  select: {\n    id: true,\n    email: true,\n    posts: { select: { title: /* boolean */ } },\n  },\n});',
          ],
          fromScratch: true,
          scaffold:
            '-- Directory synthesis (first two active members):\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC LIMIT 2;',
          why:
            'Combining soft-delete filtering, deterministic ordering, windowed pagination, and selective relation projection satisfies enterprise privacy, performance, and integrity contracts simultaneously.',
          cols: ['id', 'email'],
          rows: 2,
          code0:
            'export async function getDirectoryPage() {\n  // Write paginated member directory query with soft-delete and posts from scratch:\n\n}',
          code1:
            'export async function getDirectoryPage() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    orderBy: { id: \'asc\' },\n    take: 2,\n    select: {\n      id: true,\n      email: true,\n      posts: { select: { title: true } },\n    },\n  });\n}',
          need: [
            'where: { deletedAt: null }',
            "orderBy: { id: 'asc' }",
            'take: 2',
            'posts: {',
            'select: { title: true }',
          ],
          ban: ['name: true'],
          rtype: '{ id: number; email: string; posts: { title: string }[] }[]',
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
          hintLadder: [
            'Multi-table onboarding workflows must execute inside an interactive transaction callback so creating both the user account and the initial welcome post commits together. If post creation fails, the transaction rolls back without leaving an orphaned user record.',
            'Return the promise from prisma.$transaction(async (tx) => ...), creating the user with tx.user.create and the post with tx.post.create.',
            'Execute both writes on tx inside the callback:\nreturn await prisma.$transaction(async (tx) => {\n  const user = await tx.user.create({ data: { email, name: \'New Member\' } });\n  const post = await tx.post.create({ data: { title, authorId: /* link to user id */ } });\n  return { user, post };\n});',
          ],
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
          hintLadder: [
            'A production controller coordinates defensive perimeter validation with database error handling: parsing input schemas before database execution, trapping duplicate constraint codes into HTTP 409 responses, and passing unhandled errors to the next middleware.',
            'Validate body with MemberSchema.safeParse, wrap user creation in try-catch testing for PrismaClientKnownRequestError and code P2002, and pass errors to next(err).',
            'Structure validation, creation, and conflict translation:\nconst parsed = MemberSchema.safeParse(req.body);\nif (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });\ntry {\n  const user = await prisma.user.create({ data: parsed.data });\n  return res.status(201).json(user);\n} catch (err) {\n  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === \'P2002\') {\n    return res.status(409).json({ error: /* message */ });\n  }\n  return next(err);\n}',
          ],
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
