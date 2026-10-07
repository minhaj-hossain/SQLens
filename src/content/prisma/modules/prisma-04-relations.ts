import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 4 — Shaping & Paginating Data.
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: Field shaping with select (trimming payloads)
 *   Concept 2: Deterministic ordering with orderBy
 *   Concept 3: Offset pagination with take and skip
 *   Challenge: Paged Member Directory (Query Mode from scratch)
 */
export const Prisma_04_MODULE: ModuleData = {
  id: 'prisma-04',
  slug: 'shaping-and-pagination',
  day: 4,
  title: 'Day 4 — Shaping & Paginating Data',
  shortTitle: 'Shaping & Pagination',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description:
    'Shape network payloads with select, sort results deterministically with orderBy, and build offset pagination with take and skip.',
  estimatedMinutes: 50,
  curriculumOrder: 4,
  displayLabel: 'Day 4',
  completionLearnings: [
    'Use select to restrict returned columns and narrow TypeScript types',
    'Sort results deterministically using orderBy (asc and desc)',
    'Implement offset pagination using take (LIMIT) and skip (OFFSET)',
    'Understand why reliable pagination strictly requires deterministic sorting',
  ],
  concepts: [
    {
      id: 'payload-shaping',
      order: 1,
      title: 'Field Shaping with select',
      shortDescription:
        'Trim response payloads and narrow TypeScript return types with select.',
      theory: richPrismaTheory({
        summary:
          'By default, Prisma queries return all scalar columns from a model. Using `select: { [field]: true }`, you can project only the exact columns your application needs, eliminating overfetching and tightening network payloads.',
        takeaway: 'select projects only the requested fields and narrows the TypeScript return type.',
        sql: 'SELECT id, name FROM users;',
        heroCode: 'const users = await prisma.user.findMany({\n  select: {\n    id: true,\n    name: true,\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'Project only id and name, eliminating unnecessary email transfers.',
        mentalModel:
          'Think of `select` as the column list in a SQL `SELECT col1, col2` statement. Beyond saving database I/O and network bandwidth, Prisma uses your `select` object to dynamically generate an exact TypeScript type containing only those keys.',
        explanation: [
          'Without `select`, Prisma generates `SELECT *`, fetching every column in the table.',
          'With `select`, only fields explicitly flagged with `true` are requested from the database.',
          'Fields not included in `select` are completely omitted from the returned JavaScript object.',
          'Attempting to read an unselected property on the returned object triggers a compile-time error.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define the select block',
            codeSnippet: 'select: { id: true, name: true }',
            explanation: 'Maps each required property to boolean true.',
          },
          {
            stepNumber: 2,
            stepTitle: 'SQL translation',
            codeSnippet: 'SELECT id, name FROM users',
            explanation: 'The Query Engine translates select keys into the SQL column projection list.',
            visualData: { type: 'sql_lens', title: 'Column Projection', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Inferred return type',
            codeSnippet: '{ id: number; name: string }[]',
            explanation: 'TypeScript types reflect exactly the fields listed in select.',
            visualData: { type: 'type_preview', title: 'Pick<User, "id" | "name">[]', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'select vs include Mutual Exclusivity',
              description: 'In Prisma, you cannot specify both `select` and `include` at the same level of a query. To load relations within a shaped query, nest select inside select.',
              badge: 'Architecture',
            },
            {
              ruleNumber: 2,
              title: 'Always Use Boolean true',
              description: 'Field selections are turned on with `true`: `id: true`. Setting `id: false` is not supported; simply omit the field instead.',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Projection to Prisma select',
          mappings: [
            {
              sql: 'SELECT id, name FROM users;',
              prisma: 'await prisma.user.findMany({ select: { id: true, name: true } })',
              note: 'Exact column selection matching SQL column lists',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma04-c1-t1',
          title: 'Minimal user card: Select only id and name',
          description: 'Fetch all users but return only their id and name fields.',
          instructions: [
            'Inside `getMinimalUserCards`, call `await prisma.user.findMany()`',
            'Add a `select` option containing `id: true` and `name: true`',
            'Return the shaped user array',
          ],
          hintLadder: [
            'Pass `{ select: { id: true, name: true } }` into `findMany()`.',
            'Ensure only `id` and `name` are marked as `true`.',
            'Write: `return await prisma.user.findMany({ select: { id: true, name: true } });`',
          ],
          scaffold: '-- Project id and name:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users;',
          why: 'Field projection reduces network payloads and prevents leaking unused columns.',
          select: ['id', 'name'],
          cols: ['id', 'name'],
          rows: 3,
          code0: 'export async function getMinimalUserCards() {\n  // Fetch all users and project only id and name:\n\n}',
          code1: 'export async function getMinimalUserCards() {\n  return await prisma.user.findMany({\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma04-c1-t2',
          title: 'Email directory: Select email and name, excluding id',
          description: 'Construct a contact directory query selecting name and email while excluding id.',
          instructions: [
            'Inside `getEmailRoster`, call `await prisma.user.findMany()`',
            'Include `name: true` and `email: true` in the `select` block',
            'Ensure `id` is omitted from the selection',
          ],
          hintLadder: [
            'Only include fields you want in the returned objects.',
            'Select `name: true` and `email: true`.',
            'Write: `return await prisma.user.findMany({ select: { name: true, email: true } });`',
          ],
          scaffold: '-- Project name and email:\nSELECT name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT name, email FROM users;',
          why: 'Omitting internal primary keys from public roster views enforces data hygiene.',
          select: ['name', 'email'],
          cols: ['name', 'email'],
          noCols: ['id'],
          rows: 3,
          code0: 'export async function getEmailRoster() {\n  // Fetch users projecting name and email, excluding id:\n\n}',
          code1: 'export async function getEmailRoster() {\n  return await prisma.user.findMany({\n    select: {\n      name: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ name: string; email: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
    {
      id: 'deterministic-ordering',
      order: 2,
      title: 'Deterministic Ordering with orderBy',
      shortDescription:
        'Sort query results in ascending or descending order using orderBy.',
      theory: richPrismaTheory({
        summary:
          'In relational databases, rows have no inherent order. Without an explicit sort clause, the database may return rows in any sequence. In Prisma, `orderBy: { [field]: "asc" | "desc" }` enforces predictable row ordering.',
        takeaway: 'Use orderBy with "asc" or "desc" to ensure predictable, deterministic row ordering.',
        sql: 'SELECT id, name, email FROM users ORDER BY name ASC;',
        heroCode: 'const users = await prisma.user.findMany({\n  orderBy: {\n    name: "asc",\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'Sort users alphabetically by name in ascending order.',
        mentalModel:
          'Never rely on insertion order or primary key order unless you explicitly ask for it. Always specify `orderBy` whenever the visual presentation of results matters or before applying pagination.',
        explanation: [
          '`orderBy` accepts `"asc"` for ascending order (A-Z, 0-9) or `"desc"` for descending order (Z-A, 9-0).',
          'You can sort by any scalar column defined in your schema.',
          'Multi-column sorts are passed as an array: `orderBy: [{ role: "asc" }, { id: "desc" }]`.',
          'Deterministic sorting guarantees consistent results across repeated API calls.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Add orderBy clause',
            codeSnippet: 'orderBy: { name: "asc" }',
            explanation: 'Instructs the database to sort by name ascending.',
          },
          {
            stepNumber: 2,
            stepTitle: 'SQL generation',
            codeSnippet: 'SELECT id, name, email FROM users ORDER BY name ASC;',
            explanation: 'Prisma maps orderBy directly to the SQL ORDER BY statement.',
            visualData: { type: 'sql_lens', title: 'ORDER BY ASC/DESC', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Inferred sorted result type',
            codeSnippet: '{ id: number; name: string; email: string }[]',
            explanation: 'Prisma Client infers the full model array with predictable row ordering.',
            visualData: { type: 'type_preview', title: 'Sorted User[]', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Lower-case Sort Directions',
              description: 'In Prisma, sort directions are lowercase string literals: `"asc"` or `"desc"`.',
              badge: 'Syntax',
            },
            {
              ruleNumber: 2,
              title: 'Multi-field Tie Breaking',
              description: 'When sorting by non-unique fields (like name), always include a unique tie-breaker (like id): `orderBy: [{ name: "asc" }, { id: "asc" }]`.',
              badge: 'Best Practice',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL ORDER BY to Prisma orderBy',
          mappings: [
            {
              sql: 'ORDER BY name ASC',
              prisma: 'orderBy: { name: \'asc\' }',
              note: 'Ascending alphabetical sort',
            },
            {
              sql: 'ORDER BY id DESC',
              prisma: 'orderBy: { id: \'desc\' }',
              note: 'Descending numeric/chronological sort',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma04-c2-t1',
          title: 'Alphabetical ordering: Sort users by name ascending',
          description: 'Retrieve all users sorted alphabetically by name in ascending order.',
          instructions: [
            'Inside `getUsersSortedByName`, call `await prisma.user.findMany()`',
            'Add `orderBy: { name: "asc" }`',
            'Return the sorted user array',
          ],
          hintLadder: [
            'Pass `orderBy: { name: "asc" }` into the options object.',
            'Ensure the direction is `"asc"` in lowercase.',
            'Write: `return await prisma.user.findMany({ orderBy: { name: "asc" } });`',
          ],
          scaffold: '-- Order by name:\nSELECT id, name, email FROM users WHERE id = 99 ORDER BY name ASC;',
          solutionSql: 'SELECT id, name, email FROM users ORDER BY name ASC;',
          why: 'orderBy guarantees deterministic alphabetical sorting.',
          select: [],
          orderBy: [{ field: 'name', direction: 'asc' }],
          cols: ['id', 'name', 'email'],
          rows: 3,
          code0: 'export async function getUsersSortedByName() {\n  // Fetch all users sorted by name ascending:\n\n}',
          code1: 'export async function getUsersSortedByName() {\n  return await prisma.user.findMany({\n    orderBy: {\n      name: "asc",\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma04-c2-t2',
          title: 'Reverse chronology: Sort descending with id tie-breaker',
          description: 'Retrieve all users sorted in descending order by id, projecting id and name.',
          instructions: [
            'Call `await prisma.user.findMany()`',
            'Add `orderBy: { id: "desc" }`',
            'Add `select: { id: true, name: true }`',
            'Return the resulting records',
          ],
          hintLadder: [
            'Combine `orderBy: { id: "desc" }` and `select: { id: true, name: true }`.',
            'Both options live inside the single query options object.',
            'Write: `return await prisma.user.findMany({ orderBy: { id: "desc" }, select: { id: true, name: true } });`',
          ],
          scaffold: '-- Order by id descending:\nSELECT id, name FROM users WHERE id = 99 ORDER BY id DESC;',
          solutionSql: 'SELECT id, name FROM users ORDER BY id DESC;',
          why: 'Combining orderBy with select pairs deterministic order with compact payload size.',
          select: ['id', 'name'],
          orderBy: [{ field: 'id', direction: 'desc' }],
          cols: ['id', 'name'],
          rows: 3,
          code0: 'export async function getRecentUsers() {\n  // Fetch users sorted by id descending, selecting id and name:\n\n}',
          code1: 'export async function getRecentUsers() {\n  return await prisma.user.findMany({\n    orderBy: {\n      id: "desc",\n    },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
    {
      id: 'offset-pagination',
      order: 3,
      title: 'Offset Pagination with take and skip',
      shortDescription:
        'Paginate large datasets into clean pages using take (limit) and skip (offset).',
      theory: richPrismaTheory({
        summary:
          'Offset pagination allows applications to fetch data in small chunks (pages). `take` specifies how many records to return (SQL `LIMIT`), and `skip` specifies how many records to bypass (SQL `OFFSET`).',
        takeaway: 'take limits page size; skip offsets page position; always pair with orderBy.',
        sql: 'SELECT id, name, email FROM users ORDER BY id ASC LIMIT 2 OFFSET 0;',
        heroCode: 'const page1 = await prisma.user.findMany({\n  take: 2,\n  skip: 0,\n  orderBy: { id: "asc" },\n});',
        heroLang: 'typescript',
        heroWhy: 'Fetch the first page of 2 users with deterministic ordering.',
        mentalModel:
          'To calculate pagination: `skip = (pageNumber - 1) * pageSize`, and `take = pageSize`. Always pair pagination with `orderBy` — without sorting, rows can shift between pages unpredictably.',
        explanation: [
          '`take: n` restricts the result set to at most `n` records.',
          '`skip: m` bypasses the first `m` records before returning the remainder.',
          'Prisma translates `take` and `skip` into SQL `LIMIT` and `OFFSET` clauses.',
          'Pagination keeps API response times fast regardless of total table size.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Configure page size and offset',
            codeSnippet: 'take: 2, skip: 0',
            explanation: 'Requests 2 records starting from index 0.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Add deterministic sort',
            codeSnippet: 'orderBy: { id: "asc" }',
            explanation: 'Guarantees stable row order across pages.',
          },
          {
            stepNumber: 3,
            stepTitle: 'SQL generation',
            codeSnippet: 'SELECT id, name, email FROM users ORDER BY id ASC LIMIT 2 OFFSET 0;',
            explanation: 'The Query Engine emits standard pagination SQL.',
            visualData: { type: 'sql_lens', title: 'LIMIT & OFFSET', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always Pair with orderBy',
              description: 'Paginating without an orderBy clause can cause duplicate or missed rows between page transitions.',
              badge: 'Critical Rule',
            },
            {
              ruleNumber: 2,
              title: 'Zero-Based Offset',
              description: 'The first page always uses `skip: 0` (or omits skip entirely). Page 2 with size 10 uses `skip: 10`.',
              badge: 'Math',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Pagination to Prisma Keys',
          mappings: [
            {
              sql: 'LIMIT 2 OFFSET 0',
              prisma: 'take: 2, skip: 0',
              note: 'Page 1 with 2 items',
            },
            {
              sql: 'LIMIT 2 OFFSET 1',
              prisma: 'take: 2, skip: 1',
              note: 'Offset by 1 item',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma04-c3-t1',
          title: 'Fetch the first page: Limit results with take',
          description: 'Fetch the first 2 users in ascending ID order using take and orderBy.',
          instructions: [
            'Inside `getFirstTwoUsers`, call `await prisma.user.findMany()`',
            'Set `take: 2` to limit the results',
            'Sort by `orderBy: { id: "asc" }`',
            'Return the first page of users',
          ],
          hintLadder: [
            'Combine `take: 2` and `orderBy: { id: "asc" }` in the query options.',
            'Ensure the take limit is 2.',
            'Write: `return await prisma.user.findMany({ take: 2, orderBy: { id: "asc" } });`',
          ],
          scaffold: '-- Page 1 (limit 2):\nSELECT id, name, email FROM users WHERE id = 99 LIMIT 2;',
          solutionSql: 'SELECT id, name, email FROM users ORDER BY id ASC LIMIT 2;',
          why: 'take limits the maximum number of returned rows.',
          select: [],
          pagination: { take: 2 },
          orderBy: [{ field: 'id', direction: 'asc' }],
          cols: ['id', 'name', 'email'],
          rows: 2,
          code0: 'export async function getFirstTwoUsers() {\n  // Fetch the first 2 users sorted by id ascending:\n\n}',
          code1: 'export async function getFirstTwoUsers() {\n  return await prisma.user.findMany({\n    take: 2,\n    orderBy: {\n      id: "asc",\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma04-c3-t2',
          title: 'Navigate to page two: Combine take and skip',
          description: 'Fetch the next page by skipping 1 user and taking 2, selecting id and name.',
          instructions: [
            'Call `await prisma.user.findMany()`',
            'Set `skip: 1` and `take: 2`',
            'Sort by `orderBy: { id: "asc" }`',
            'Select `id: true` and `name: true`',
          ],
          hintLadder: [
            'Combine `skip: 1`, `take: 2`, `orderBy: { id: "asc" }`, and `select: { id: true, name: true }`.',
            'All options belong inside the single options object.',
            'Write: `return await prisma.user.findMany({ skip: 1, take: 2, orderBy: { id: "asc" }, select: { id: true, name: true } });`',
          ],
          scaffold: '-- Page 2 (offset 1, limit 2):\nSELECT id, name FROM users WHERE id = 99 LIMIT 2 OFFSET 1;',
          solutionSql: 'SELECT id, name FROM users ORDER BY id ASC LIMIT 2 OFFSET 1;',
          why: 'skip bypasses earlier rows to navigate between pages.',
          select: ['id', 'name'],
          pagination: { take: 2, skip: 1 },
          orderBy: [{ field: 'id', direction: 'asc' }],
          cols: ['id', 'name'],
          rows: 2,
          code0: 'export async function getSecondPage() {\n  // Skip 1, take 2, order by id asc, select id and name:\n\n}',
          code1: 'export async function getSecondPage() {\n  return await prisma.user.findMany({\n    skip: 1,\n    take: 2,\n    orderBy: {\n      id: "asc",\n    },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma04-challenge',
    title: 'Final Challenge — Paged Member Directory',
    scenario:
      'Build a production-ready paginated query from scratch: retrieve page 1 (size: 2), sorted alphabetically by name ascending, projecting only id and email.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaReadTask({
        id: 'prisma04-hw-1',
        title: 'Final Challenge — Paged Member Directory',
        description: 'Combine take, orderBy, and select to build a production paginated read from scratch.',
        instructions: [
          'Write the query from scratch inside `getPagedDirectory()`',
          'Use `prisma.user.findMany` with `take: 2` and `skip: 0`',
          'Sort alphabetically with `orderBy: { name: "asc" }`',
          'Project only `id` and `email` using `select`',
        ],
        hintLadder: [
          'Combine `take: 2`, `skip: 0`, `orderBy: { name: "asc" }`, and `select: { id: true, email: true }`.',
          'Project only `id` and `email`.',
          'Complete function: `return await prisma.user.findMany({ take: 2, skip: 0, orderBy: { name: "asc" }, select: { id: true, email: true } });`',
        ],
        scaffold: '-- Paged directory challenge:\nSELECT id, email FROM users WHERE id = 99 LIMIT 2;',
        solutionSql: 'SELECT id, email FROM users ORDER BY name ASC LIMIT 2 OFFSET 0;',
        why: 'Production pagination strictly unites page size, deterministic sorting, and minimal projection.',
        select: ['id', 'email'],
        pagination: { take: 2 },
        orderBy: [{ field: 'name', direction: 'asc' }],
        cols: ['id', 'email'],
        rows: 2,
        code0: 'export async function getPagedDirectory() {\n  // Write the query from scratch:\n\n}',
        code1: 'export async function getPagedDirectory() {\n  return await prisma.user.findMany({\n    take: 2,\n    skip: 0,\n    orderBy: {\n      name: "asc",\n    },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
        rtype: '{ id: number; email: string }[]',
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'query',
      }),
    ],
  },
};
