import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 8 — Filtering, Sorting & Pagination. */
export const Prisma_08_MODULE: ModuleData = {
  id: 'prisma-08',
  slug: 'filtering-sorting-pagination',
  day: 8,
  title: 'Day 8 — Filtering, Sorting & Pagination',
  shortTitle: 'Filter & Paginate',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description: 'Filter with operators, sort deterministically and page with offset or cursor.',
  estimatedMinutes: 60,
  curriculumOrder: 8,
  displayLabel: 'Day 8',
  completionLearnings: [
    'Compose scalar filters with `contains`/`in` and relational filters with `some`',
    'Always pair pagination with an ORDER BY',
    'Page with `skip`/`take` for small offsets',
    'Prefer `cursor` paging when the table grows',
  ],
  concepts: [
    {
      id: 'filter-operators',
      order: 1,
      title: 'Filter Hierarchy — Scalar & Relational Operators',
      shortDescription: 'Scalar filters (contains, in) vs relational filters (some, every, none).',
      theory: richPrismaTheory({
        summary:
          'Prisma filters follow a structured query hierarchy: scalar comparison/membership filters (`contains`, `in`, `gt`/`lt`) translate directly to SQL WHERE predicates, while relational filters (`some`, `every`, `none`) inspect child relations. All filters are strongly typed data objects rather than concatenated SQL strings.',
        takeaway:
          'Scalar filters (contains, in, comparison) vs relational filters (some, every, none) — structured, typed query data.',
        sql: "SELECT id, name\nFROM users\nWHERE email LIKE '%prisma.io';",
        heroCode:
          "await prisma.user.findMany({\n  where: { email: { contains: 'prisma.io' } },\n  select: { id: true, name: true },\n});",
        heroLang: 'typescript',
        heroWhy: '`contains` is a LIKE; the parameter is still bound, never concatenated.',
        mentalModel:
          '**The Query Modifier Hierarchy.** Prisma organizes query modifications into a clear taxonomy:\n```\nQuery Modifiers\n├── Filtering (where)\n│   ├── Scalar Filters (Executable)\n│   │   ├── Equality:       { field: value }\n│   │   ├── Comparison:     { gt, gte, lt, lte }\n│   │   ├── String:         { contains, startsWith, endsWith }\n│   │   ├── Membership:     { in, notIn }\n│   │   └── Logical:        { AND, OR, NOT }\n│   └── Relational Filters (Snippet-Lab)\n│       ├── some:           At least one related record matches\n│       ├── every:          All related records match\n│       └── none:           No related records match\n└── Pagination & Sorting\n    ├── Ordering:           orderBy: { field: "asc" | "desc" }\n    └── Offset:             skip + take\n```\nNothing is concatenated: scalar predicates become parameterized SQL, while relational predicates evaluate related entities.',
        explanation: [
          'The Query Modifier Hierarchy distinguishes scalar field operations from multi-table relational predicates.',
          'Each operator has one SQL equivalent, chosen by the engine — you never hand-write the WHERE.',
          'Relational filters (`some`, `every`, `none`) let you query parent records by conditions on their child relations.',
          'Because filters are objects, they can be composed, narrowed and unit-tested before they reach the database.',
          'CRITICAL HAZARD: Passing `undefined` to a filter field causes Prisma to ignore the condition completely (e.g. `{ email: undefined }` emits NO WHERE clause, returning all rows or leaking the first row in `findFirst`), whereas `null` explicitly compiles to `WHERE email IS NULL`.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the filter object describes the predicate',
            codeSnippet: "where: { email: { contains: 'prisma.io' } }",
            explanation: 'A typed object — `contains` says "substring"; the engine decides how to express it.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the engine picks the operator and binds the value',
            codeSnippet: 'contains → LIKE\nin → IN\nnot → <>',
            explanation: 'The value becomes a bound parameter — `%prisma.io%` is data, never SQL text.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the emitted read is a plain parameterized SELECT',
            codeSnippet: "SELECT id, name\nFROM users\nWHERE email LIKE '%prisma.io';",
            explanation: 'One predictable statement — the Lens shows it after every run.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the result is typed from `select`',
            codeSnippet: '{ id: number; name: string }[]',
            explanation: 'Only the selected fields appear — and the compiler knows exactly which.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma08-c1-t1',
          title: 'Substring filter',
          description: 'Return every user whose email contains prisma.io.',
          instructions: ['Filter with `email: { contains: "prisma.io" }`', 'Select `id` and `name`'],
          hint: '`contains` maps to LIKE \'%…%\'.',
          scaffold: '-- Substring filter -- the WHERE is still missing:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email LIKE '%prisma.io';",
          why: 'contains is a LIKE with a bound parameter.',
          cols: ['id', 'name'],
          rows: 3,
          code0:
            'export async function findByDomain() {\n  return await prisma.user.findMany({\n    where: {},\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function findByDomain() {\n  return await prisma.user.findMany({\n    where: { email: { contains: \'prisma.io\' } },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma08-c1-t2',
          title: 'Filter on a set of values',
          description: 'Return Alex and Mina, nobody else.',
          instructions: ['Filter with `name: { in: [\'Alex\', \'Mina\'] }`'],
          hint: '`in` takes an array of allowed values.',
          scaffold: '-- Set filter -- the WHERE is still missing:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE name IN ('Alex', 'Mina');",
          why: 'One IN list replaces a chain of ORs.',
          cols: ['id', 'name'],
          rows: 2,
          code0:
            'export async function findByNames() {\n  return await prisma.user.findMany({\n    where: {},\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function findByNames() {\n  return await prisma.user.findMany({\n    where: { name: { in: [\'Alex\', \'Mina\'] } },\n    select: { id: true, name: true },\n  });\n}',
          need: ['in:', "'Alex'", "'Mina'"],
          rtype: '{ id: number; name: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma08-c1-t3',
          title: 'Filter across relations (some)',
          description: 'Return users who have authored at least one post containing "Prisma".',
          instructions: [
            'Filter with `posts: { some: { title: { contains: \'Prisma\' } } }`',
            'Select `id` and `name`',
          ],
          hint: '`some` tests if at least one related record matches the condition.',
          scaffold: '-- Users with matching posts:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Relational filters let you query parent records by conditions on related records.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function authorsWithPrismaPosts() {\n  return await prisma.user.findMany({\n    where: {},\n    select: { id: true, name: true },\n  });\n}',
          code1:
            "export async function authorsWithPrismaPosts() {\n  return await prisma.user.findMany({\n    where: {\n      posts: {\n        some: {\n          title: { contains: 'Prisma' },\n        },\n      },\n    },\n    select: { id: true, name: true },\n  });\n}",
          need: ['posts: {', 'some: {', "contains: 'Prisma'"],
          rtype: '{ id: number; name: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma08-c1-t4',
          title: 'Diagnostic Repair — The undefined vs null Filter Hazard',
          description:
            'Passing undefined to a Prisma filter causes Prisma to ignore the WHERE condition completely, returning unexpected rows or risking data leaks. Guard optional search parameters explicitly so undefined is never passed unchecked into findFirst or findUnique.',
          instructions: [
            'Check `if (email === undefined)` and return `null` immediately',
            'Only query `prisma.user.findFirst` when `email` is defined',
          ],
          hint: '`undefined` strips the filter from the generated SQL; check for `if (email === undefined) return null;`.',
          scaffold: '-- Safe single-user read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'In Prisma, { where: { email: undefined } } strips the WHERE clause and matches the first row in the table instead of zero rows.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function findUserByEmail(email: string | undefined) {\n  // VULNERABILITY: If email is undefined, Prisma ignores the filter and returns the first row!\n  return await prisma.user.findFirst({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function findUserByEmail(email: string | undefined) {\n  if (email === undefined) {\n    return null;\n  }\n  return await prisma.user.findFirst({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
          need: ['if (email === undefined)', 'return null', 'where: { email }'],
          rtype: '{ id: number; email: string } | null',
        }),
      ],
    },
    {
      id: 'pagination-strategies',
      order: 2,
      title: 'Pagination — Offset vs Cursor',
      shortDescription: '`skip`/`take` for pages, `cursor` for streams.',
      theory: richPrismaTheory({
        summary: 'Offset paging (`skip`/`take`) is simple but re-reads everything before the page and shifts when rows are inserted. Cursor paging (`cursor` + `take`) asks for "everything after this row" and stays stable — which is why feeds use it and admin tables usually do not.',
        takeaway: 'Offset for pages, cursor for endless streams — both need an ORDER BY.',
        sql: 'SELECT id, name\nFROM users\nORDER BY id ASC\nLIMIT 1 OFFSET 1;',
        heroCode: "await prisma.user.findMany({\n  orderBy: { id: 'asc' },\n  skip: 1,\n  take: 1,\n  select: { id: true, name: true },\n});",
        heroLang: 'typescript',
        heroWhy: 'Without ORDER BY, offset paging has no defined page boundaries at all.',
        mentalModel: '**Offset counts rows, cursor points at one.** `skip`/`take` says "give me N rows after M"; `cursor` + `take` says "give me N rows after this row". Offset stays correct only until a row is inserted; cursor holds its place because it anchors to a key — and both are meaningless without an ORDER BY.',
        explanation: [
          'Offset paging compiles to `LIMIT` + `OFFSET`; cursor paging compiles to a `WHERE` on the key plus a `LIMIT`.',
          'Every paginated read needs an ORDER BY, or "page 2" has no defined boundaries.',
          'IMPORTANT: Prisma cursor pagination is inclusive by default. Without `skip: 1`, page turns re-include the cursor item itself.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'offset paging counts rows',
            codeSnippet: "await prisma.user.findMany({\n  orderBy: { id: 'asc' },\n  skip: 1,\n  take: 1,\n});",
            explanation: 'Sort, then skip M and take N — simple, but the database still walks everything before the page.',
          },
          {
            stepNumber: 2,
            stepTitle: 'cursor paging points at a row and skips it',
            codeSnippet: "await prisma.user.findMany({\n  cursor: { id: 1 },\n  skip: 1,\n  take: 2,\n  orderBy: { id: 'asc' },\n});",
            explanation: '`cursor` anchors to a key; `skip: 1` skips the cursor item itself so page turns do not duplicate the last item.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the offset page becomes LIMIT/OFFSET',
            codeSnippet: 'SELECT id, name\nFROM users\nORDER BY id ASC\nLIMIT 1 OFFSET 1;',
            explanation: 'ORDER BY plus LIMIT/OFFSET — the exact shape `skip`/`take` compiles to.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the cursor page becomes a keyed WHERE',
            codeSnippet: 'SELECT id, name\nFROM users\nWHERE id > 1\nORDER BY id ASC\nLIMIT 2;',
            explanation: 'A `WHERE id > 1` on the cursor key plus a `LIMIT 2` — `skip: 1` transforms the inclusive cursor into an exclusive page turn.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
        ],
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma08-c2-t1',
          title: 'Page two, one row per page',
          description: 'Return the second user when sorted by id.',
          instructions: ['`orderBy: { id: "asc" }`', '`skip: 1` with `take: 1`'],
          hint: '`skip: 1` skips the first row, `take: 1` keeps the next one.',
          scaffold: '-- Offset page:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users ORDER BY id ASC LIMIT 1 OFFSET 1;',
          why: 'ORDER BY plus LIMIT/OFFSET is exactly what skip/take compiles to.',
          cols: ['id', 'name'],
          pagination: { take: 1, skip: 1 },
          orderBy: [{ field: 'id', direction: 'asc' }],
          rows: 1,
          code0:
            'export async function page2() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function page2() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    skip: 1,\n    take: 1,\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma08-c2-t2',
          title: 'Cursor paging with skip: 1',
          description: 'Return the two rows after the user with id 1 without duplicating the cursor item.',
          instructions: [
            'Use `cursor: { id }` to anchor to the pivot row',
            'Add `skip: 1` so the cursor item itself is not repeated',
            '`take: 2` with `orderBy: { id: "asc" }`',
          ],
          hint: 'Prisma cursor is inclusive by default. Add `skip: 1` next to `cursor` to fetch subsequent rows.',
          scaffold: '-- Cursor page:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id > 1 ORDER BY id ASC LIMIT 2;',
          why: 'The cursor compiles to a WHERE on the key plus a LIMIT, and skip: 1 prevents duplicating the cursor item.',
          cols: ['id', 'name'],
          rows: 2,
          code0:
            'export async function afterRow(id: number) {\n  return await prisma.user.findMany({\n    cursor: { id },\n    take: 2,\n    orderBy: { id: \'asc\' },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function afterRow(id: number) {\n  return await prisma.user.findMany({\n    cursor: { id },\n    skip: 1,\n    take: 2,\n    orderBy: { id: \'asc\' },\n    select: { id: true, name: true },\n  });\n}',
          need: ['cursor: { id }', 'skip: 1', 'take: 2'],
          rtype: '{ id: number; name: string }[]',
        }),
      ],
    },
    {
      id: 'aggregating-grouping',
      order: 3,
      title: 'Optional Extension: Aggregating & Grouping — `groupBy`',
      shortDescription: 'Advanced analytics query shape: group rows by key and aggregate with _count.',
      theory: richPrismaTheory({
        summary:
          'Optional Extension: Aggregation is a specialized analytical query shape distinct from row-level filtering: `groupBy` returns one row per distinct group, with `_count` (and `_sum`, `_avg`) computed directly by the database engine.',
        takeaway: '`groupBy` computes per-group aggregates in the database, not in JavaScript.',
        sql: 'SELECT name, COUNT(*) AS total\nFROM users\nGROUP BY name;',
        heroCode: "await prisma.user.groupBy({\n  by: ['name'],\n  _count: true,\n});",
        heroLang: 'typescript',
        heroWhy: 'One row per group, with the count computed by the database.',
        mentalModel: '**Collapse the table into groups.** `groupBy` folds rows into one row per distinct value of `by`, and `_count` / `_sum` / `_avg` compute the aggregate in the database. The result is a new shape — a group per row, not a `User` — so its type is inferred from `by` plus the aggregations.',
        explanation: [
          'A plain `findMany` returns rows; `groupBy` returns GROUPS — one row per distinct value, each carrying its aggregate.',
          'Counting in the database (rather than looping in JavaScript) is what keeps a report to a single round trip.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the call names the grouping column',
            codeSnippet: "await prisma.user.groupBy({\n  by: ['name'],\n  _count: true,\n});",
            explanation: '`by` is the GROUP BY column; `_count: true` asks for the size of each group.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the engine emits GROUP BY + COUNT',
            codeSnippet: 'SELECT name, COUNT(*) AS total\nFROM users\nGROUP BY name;',
            explanation: 'One query, one aggregate — the database does the counting, not your code.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'the result has one row per group',
            codeSnippet: 'Alex  1\nMina  1\nRafi  1',
            explanation: 'Three distinct names in the seed → three groups. A bigger table would show multi-row groups.',
          },
          {
            stepNumber: 4,
            stepTitle: 'the type is a group shape, not a model',
            codeSnippet: '{ name: string; _count: { name: number } }[]',
            explanation: 'The inferred type follows `by` plus the requested aggregation — never the `User` model.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma08-c3-t1',
          title: 'Group and count',
          description: 'Return one row per distinct name, with the number of rows in each group.',
          instructions: ['Call `prisma.user.groupBy`', "Group with `by: ['name']`", 'Ask for `_count: true`'],
          hint: '`groupBy({ by: [...], _count: true })` compiles to GROUP BY + COUNT(*).',
          scaffold: '-- One row per name, counted:\nSELECT name, COUNT(*) AS total FROM users WHERE id = 99;',
          solutionSql: 'SELECT name, COUNT(*) AS total FROM users GROUP BY name;',
          why: 'The database collapses the rows into groups and counts each one in a single query.',
          cols: ['name', 'total'],
          rows: 3,
          code0:
            'export async function countsByName() {\n  return await prisma.user.findMany({\n    select: { name: true },\n  });\n}',
          code1:
            "export async function countsByName() {\n  return await prisma.user.groupBy({\n    by: ['name'],\n    _count: true,\n  });\n}",
          need: ['groupBy(', "'name'", '_count'],
          rtype: '{ name: string; _count: { name: number } }[]',
        }),
        prismaSnippetTask({
          id: 'prisma08-c3-t2',
          title: 'Order the groups by size',
          description: 'Return the same groups, biggest first.',
          instructions: ["Keep `by: ['name']` and `_count: true`", "Order with `orderBy: { _count: { name: 'desc' } }`"],
          hint: '`orderBy` can target the aggregation itself.',
          scaffold: '-- Biggest group first:\nSELECT name, COUNT(*) AS total FROM users WHERE id = 99;',
          solutionSql: 'SELECT name, COUNT(*) AS total FROM users GROUP BY name ORDER BY total DESC;',
          why: 'Sorting on the aggregate is what turns a count into a leaderboard.',
          cols: ['name', 'total'],
          rows: 3,
          code0:
            "export async function topGroups() {\n  return await prisma.user.groupBy({\n    by: ['name'],\n    _count: true,\n  });\n}",
          code1:
            "export async function topGroups() {\n  return await prisma.user.groupBy({\n    by: ['name'],\n    _count: true,\n    orderBy: { _count: { name: 'desc' } },\n  });\n}",
          need: ['orderBy', '_count'],
          rtype: '{ name: string; _count: { name: number } }[]',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma08-challenge',
    title: 'Final Challenge — Production Catalog Search',
    scenario: 'The newest two rows, newest first, without leaking unused columns.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma08-hw-1',
          title: 'Newest two members',
          description: 'Return id + email, sorted by id descending, limited to two rows.',
          instructions: ['`orderBy: { id: "desc" }`', '`take: 2`', 'Select `id` + `email` only'],
          hint: 'Sort desc, then take 2 — a stable "latest" list.',
          scaffold: '-- Latest-rows query:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id DESC LIMIT 2;',
          why: 'Descending order plus a LIMIT is the canonical latest-N query.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'desc' }],
          pagination: { take: 2 },
          rows: 2,
          code0:
            'export async function latest() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function latest() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'desc\' },\n    take: 2,\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        type: 'challenge',
      },
    ],
  },
};
