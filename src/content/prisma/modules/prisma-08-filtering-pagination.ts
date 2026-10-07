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
  milestoneId: 'prisma-milestone-4',
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
          'CRITICAL HAZARD: In modern Prisma, passing `undefined` to `findUnique({ where: { email: undefined } })` throws a runtime validation error. BUT in `findFirst`, `findMany`, and `updateMany`, Prisma silently strips the condition entirely! `{ where: { email: undefined } }` in `findFirst` emits NO WHERE clause, returning the first record in the entire table instead of zero rows. In contrast, `null` compiles to SQL `WHERE email IS NULL`.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'The filter object describes the predicate',
            codeSnippet: "where: { email: { contains: 'prisma.io' } }",
            explanation: 'A typed object — `contains` says "substring"; the engine decides how to express it.',
          },
          {
            stepNumber: 2,
            stepTitle: 'The engine picks the operator and binds the value',
            codeSnippet: 'contains → LIKE\nin → IN\nnot → <>',
            explanation: 'The value becomes a bound parameter — `%prisma.io%` is data, never SQL text.',
          },
          {
            stepNumber: 3,
            stepTitle: 'The emitted read is a plain parameterized SELECT',
            codeSnippet: "SELECT id, name\nFROM users\nWHERE email LIKE '%prisma.io';",
            explanation: 'One predictable statement — the Lens shows it after every run.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'The result is typed from `select`',
            codeSnippet: '{ id: number; name: string }[]',
            explanation: 'Only the selected fields appear — and the compiler knows exactly which.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
        littleDetails: {
          title: 'Filtering Rules & Hazards',
          rules: [
            {
              ruleNumber: 1,
              title: 'CRITICAL HAZARD: undefined strips the WHERE clause in findFirst / findMany',
              description: 'In Prisma, passing undefined to findUnique throws a runtime validation error. But in findFirst, findMany, and updateMany, `{ where: { email: undefined } }` silently drops the filter! If req.query.email is undefined, findFirst returns the first user in the database instead of null. Always guard optional inputs before querying: `if (email === undefined) return null;`.',
              badge: 'Hazard',
            },
            {
              ruleNumber: 2,
              title: 'null compiles to WHERE column IS NULL',
              description: 'Unlike `undefined`, passing `null` explicitly compiles to SQL `IS NULL`. Use `null` when checking for nullable columns that contain no value.',
              badge: 'SQL Null',
            },
            {
              ruleNumber: 3,
              title: 'Relational filter quantifiers',
              description: 'Use `some` when at least one child record matches (SQL `EXISTS`), `every` when all child records match (SQL `NOT EXISTS (NOT condition)`), and `none` when zero child records match.',
              badge: 'Relations',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Filter Operators to SQL Conditions',
          mappings: [
            {
              prisma: "email: { contains: 'prisma.io' }",
              sql: "WHERE email LIKE '%prisma.io%'",
              note: 'Emits a parameterized LIKE pattern match. Add mode: "insensitive" for case-insensitive Postgres searches.',
            },
            {
              prisma: "name: { in: ['Alex', 'Mina'] }",
              sql: "WHERE name IN ('Alex', 'Mina')",
              note: 'Replaces multiple OR conditions with a clean, parameterized SQL IN clause.',
            },
            {
              prisma: "posts: { some: { title: { contains: 'Prisma' } } }",
              sql: 'WHERE EXISTS (SELECT 1 FROM posts WHERE ...)',
              note: 'Evaluates parent rows based on conditions matched in child relations.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Could the search argument be undefined (e.g. from an optional query param)?',
              answer: 'Guard it! In Prisma, `{ where: { field: undefined } }` strips the WHERE clause completely.',
            },
            {
              questionNumber: 2,
              question: 'Am I filtering based on properties of a child relation (e.g. users with active posts)?',
              answer: 'Use relational filters: `some` (at least 1 child matches), `every` (all match), or `none` (zero match).',
            },
            {
              questionNumber: 3,
              question: 'Do I need multiple conditions combined together?',
              answer: 'Prisma fields inside `where` are combined with AND by default. For OR logic, use `OR: [ { ... }, { ... } ]`.',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma08-c1-t1',
          title: 'Find every member whose email domain matches the search pattern',
          description: 'Return every user whose email contains prisma.io.',
          instructions: ['Filter with `email: { contains: "prisma.io" }`', 'Select `id` and `name`'],
          hintLadder: [
            'Prisma contains operator translates to a parameterized SQL LIKE condition matching substrings anywhere within the text column.',
            'Inside where, set the target field to an object with contains: "prisma.io".',
            'Add the contains filter: return await prisma.user.findMany({ where: { email: { contains: /* domain substring */ } }, select: { id: true, name: true } });',
          ],
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
          title: 'Filter members by a list of allowed names using the in operator',
          description: 'Return Alex and Mina, nobody else.',
          instructions: ['Filter with `name: { in: [\'Alex\', \'Mina\'] }`'],
          hintLadder: [
            'The in filter operator compares a column against a list of acceptable values, compiling to a clean parameterized SQL IN predicate.',
            'Specify in with an array containing the exact strings inside where.',
            'Add the in array: return await prisma.user.findMany({ where: { name: { in: [/* names array */] } }, select: { id: true, name: true } });',
          ],
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
          title: 'Find users who have at least one matching post',
          description: 'Return users who have authored at least one post containing "Prisma".',
          instructions: [
            'Filter with `posts: { some: { title: { contains: \'Prisma\' } } }`',
            'Select `id` and `name`',
          ],
          hintLadder: [
            'Relational filters like some check if at least one related child record satisfies a nested predicate condition.',
            'Filter the child relation using some containing a nested where condition on title.',
            'Filter parent records by child relation: return await prisma.user.findMany({ where: { posts: { some: { title: { contains: /* post keyword */ } } } }, select: { id: true, name: true } });',
          ],
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
          title: 'A missing search value is returning every record: Can you fix the undefined filter bug?',
          description:
            'Passing undefined to an optional filter in findFirst, findMany, or updateMany causes Prisma to silently drop the WHERE condition completely, returning unexpected rows or leaking data (while findUnique throws a validation error). Guard optional search parameters explicitly so undefined is never passed unchecked into findFirst.',
          instructions: [
            'Check `if (email === undefined)` and return `null` immediately',
            'Only query `prisma.user.findFirst` when `email` is defined',
          ],
          hintLadder: [
            'In findFirst and findMany, passing undefined for a filter property silently drops the WHERE clause entirely, potentially returning unwanted records.',
            'Guard the parameter before calling the query, returning null if email is undefined.',
            'Guard the undefined value: if (email === undefined) { return null; } return await prisma.user.findFirst({ where: { email }, select: /* select object */ });',
          ],
          scaffold: '-- Safe single-user read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'In Prisma findFirst/findMany/updateMany, { where: { email: undefined } } strips the WHERE clause and matches the first row in the table instead of zero rows. (findUnique throws a runtime validation error instead).',
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
            stepTitle: 'Offset paging counts rows',
            codeSnippet: "await prisma.user.findMany({\n  orderBy: { id: 'asc' },\n  skip: 1,\n  take: 1,\n});",
            explanation: 'Sort, then skip M and take N — simple, but the database still walks everything before the page.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Cursor paging points at a row and skips it',
            codeSnippet: "await prisma.user.findMany({\n  cursor: { id: 1 },\n  skip: 1,\n  take: 2,\n  orderBy: { id: 'asc' },\n});",
            explanation: '`cursor` anchors to a key; `skip: 1` skips the cursor item itself so page turns do not duplicate the last item.',
          },
          {
            stepNumber: 3,
            stepTitle: 'The offset page becomes LIMIT/OFFSET',
            codeSnippet: 'SELECT id, name\nFROM users\nORDER BY id ASC\nLIMIT 1 OFFSET 1;',
            explanation: 'ORDER BY plus LIMIT/OFFSET — the exact shape `skip`/`take` compiles to.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'The cursor page becomes a keyed WHERE',
            codeSnippet: 'SELECT id, name\nFROM users\nWHERE id > 1\nORDER BY id ASC\nLIMIT 2;',
            explanation: 'A `WHERE id > 1` on the cursor key plus a `LIMIT 2` — `skip: 1` transforms the inclusive cursor into an exclusive page turn.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
        ],
        littleDetails: {
          title: 'Pagination Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Prisma cursor is inclusive by default: always add skip: 1',
              description: 'Prisma\'s `cursor` argument anchors to the specified row and includes it in the results (`WHERE id >= cursor`). When requesting the next page after item 42, you must specify `skip: 1` alongside `cursor: { id: 42 }` so item 42 is not duplicated.',
              badge: 'Critical Rule',
            },
            {
              ruleNumber: 2,
              title: 'Pagination without orderBy is non-deterministic',
              description: 'SQL databases return rows in arbitrary order without an explicit `ORDER BY`. Always provide `orderBy: { id: "asc" }` so page boundaries remain stable across page turns.',
              badge: 'Deterministic',
            },
            {
              ruleNumber: 3,
              title: 'Cursor fields must be marked @id or @unique',
              description: 'You cannot use arbitrary non-unique columns for `cursor`. The cursor anchor requires a unique, indexed identifier so the database can seek directly to that row in O(1) time.',
              badge: 'Index Seek',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Pagination to SQL Queries',
          mappings: [
            {
              prisma: 'skip: 10, take: 10',
              sql: 'LIMIT 10 OFFSET 10',
              note: 'Offset pagination: simple for small pages, but reads and discards all preceding rows.',
            },
            {
              prisma: 'cursor: { id: 42 }, skip: 1, take: 10',
              sql: 'WHERE id > 42 ORDER BY id ASC LIMIT 10',
              note: 'Cursor pagination: seeks directly to the index key without scanning prior records.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Is this an administrative table with direct page-number buttons ("Go to page 5")?',
              answer: 'Use offset pagination (`skip: (page - 1) * pageSize, take: pageSize`).',
            },
            {
              questionNumber: 2,
              question: 'Is this an infinite-scroll mobile feed or a high-volume dataset (>10,000 rows)?',
              answer: 'Use cursor pagination (`cursor: { id: lastSeenId }, skip: 1, take: pageSize`).',
            },
            {
              questionNumber: 3,
              question: 'Could new rows be inserted while the user is browsing pages?',
              answer: 'Use cursor pagination. Offset pagination causes rows to shift, resulting in duplicate items across pages.',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma08-c2-t1',
          title: 'The UI asks for page 2: Can you fetch exactly the right records with skip and take?',
          description: 'Return the second user when sorted by id.',
          instructions: ['`orderBy: { id: "asc" }`', '`skip: 1` with `take: 1`'],
          hintLadder: [
            'Offset pagination pairs skip and take to paginate through deterministic sorted records.',
            'Specify skip to omit prior rows and take to limit page size alongside orderBy.',
            'Apply offset pagination: return await prisma.user.findMany({ orderBy: { id: \'asc\' }, skip: 1, take: /* page size */, select: { id: true, name: true } });',
          ],
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
          title: 'The feed is getting large: Can you replace offset paging with cursor pagination?',
          description: 'Return the two rows after the user with id 1 without duplicating the cursor item.',
          instructions: [
            'Use `cursor: { id }` to anchor to the pivot row',
            'Add `skip: 1` so the cursor item itself is not repeated',
            '`take: 2` with `orderBy: { id: "asc" }`',
          ],
          hintLadder: [
            'Prisma cursor pagination is inclusive by default; skip: 1 must be passed to avoid repeating the pivot item on subsequent pages.',
            'Include cursor: { id } and skip: 1 next to take and orderBy.',
            'Combine cursor and skip: return await prisma.user.findMany({ cursor: { id }, skip: 1, take: 2, orderBy: { id: /* sort direction */ }, select: { id: true, name: true } });',
          ],
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
            stepTitle: 'The call names the grouping column',
            codeSnippet: "await prisma.user.groupBy({\n  by: ['name'],\n  _count: true,\n});",
            explanation: '`by` is the GROUP BY column; `_count: true` asks for the size of each group.',
          },
          {
            stepNumber: 2,
            stepTitle: 'The engine emits GROUP BY + COUNT',
            codeSnippet: 'SELECT name, COUNT(*) AS total\nFROM users\nGROUP BY name;',
            explanation: 'One query, one aggregate — the database does the counting, not your code.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'The result has one row per group',
            codeSnippet: 'Alex  1\nMina  1\nRafi  1',
            explanation: 'Three distinct names in the seed → three groups. A bigger table would show multi-row groups.',
          },
          {
            stepNumber: 4,
            stepTitle: 'The type is a group shape, not a model',
            codeSnippet: '{ name: string; _count: { name: number } }[]',
            explanation: 'The inferred type follows `by` plus the requested aggregation — never the `User` model.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
        littleDetails: {
          title: 'Aggregation Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Return type is group-shaped, not a model',
              description: '`prisma.user.groupBy({ by: ["name"], _count: true })` does not return `User[]`. It returns `{ name: string; _count: { name: number } }[]`. The return shape strictly reflects the grouping columns and aggregations.',
              badge: 'Group Shape',
            },
            {
              ruleNumber: 2,
              title: 'Sorting directly on aggregates',
              description: 'You can sort groups by the calculated aggregate using `orderBy: { _count: { name: "desc" } }`. This compiles directly to SQL `ORDER BY COUNT(name) DESC`.',
              badge: 'Sorting',
            },
            {
              ruleNumber: 3,
              title: 'Filtering groups with having',
              description: 'To filter groups after aggregation (e.g. only show groups with more than 5 users), use `having: { _count: { id: { gt: 5 } } }` (equivalent to SQL `HAVING COUNT(id) > 5`).',
              badge: 'Having',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Aggregation to SQL Statements',
          mappings: [
            {
              prisma: "prisma.user.groupBy({ by: ['name'], _count: true })",
              sql: 'SELECT name, COUNT(*) AS total FROM users GROUP BY name;',
              note: 'Groups rows by distinct column values and counts items in each bucket in a single query.',
            },
            {
              prisma: "orderBy: { _count: { name: 'desc' } }",
              sql: 'ORDER BY COUNT(name) DESC',
              note: 'Orders groups by the computed aggregate size directly in the database engine.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Do I want summary statistics across the entire table (e.g. total users, average order value)?',
              answer: 'Use `prisma.model.aggregate({ _count: true, _avg: { amount: true } })` or `prisma.model.count()`.',
            },
            {
              questionNumber: 2,
              question: 'Do I want statistics broken down by category, author, status, or date?',
              answer: 'Use `prisma.model.groupBy({ by: [\'category\'], _count: true })`.',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma08-c3-t1',
          title: 'Group members by name and count the occurrences in each group',
          description: 'Return one row per distinct name, with the number of rows in each group.',
          instructions: ['Call `prisma.user.groupBy`', "Group with `by: ['name']`", 'Ask for `_count: true`'],
          hintLadder: [
            'The groupBy method collapses rows by shared values in the specified columns and computes database-level aggregations.',
            'Pass by with an array of grouping columns and set _count: true.',
            'Group and count: return await prisma.user.groupBy({ by: [\'name\'], _count: /* set boolean flag */ });',
          ],
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
          title: 'The groups are unordered: Can you rank them by their record count?',
          description: 'Return the same groups, biggest first.',
          instructions: ["Keep `by: ['name']` and `_count: true`", "Order with `orderBy: { _count: { name: 'desc' } }`"],
          hintLadder: [
            'Sorting on calculated aggregations in groupBy compiles directly to SQL ORDER BY COUNT(...) expressions.',
            'Add an orderBy clause nested inside _count specifying the sort direction.',
            'Order by aggregate: return await prisma.user.groupBy({ by: [\'name\'], _count: true, orderBy: { _count: { name: /* sort direction */ } } });',
          ],
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
          title: 'The dashboard needs the two newest members: Can you return exactly those two?',
          description: 'Return id + email, sorted by id descending, limited to two rows.',
          instructions: ['`orderBy: { id: "desc" }`', '`take: 2`', 'Select `id` + `email` only'],
          hintLadder: [
            'Retrieving the most recently created records requires an explicit descending sort order paired with a take limit.',
            'Call findMany on prisma.user with orderBy id desc, take 2, and select id, email.',
            'Build the latest query: return await prisma.user.findMany({ orderBy: { id: \'desc\' }, take: 2, select: { id: true, email: /* boolean flag */ } });',
          ],
          fromScratch: true,
          scaffold: '-- Latest-rows query:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id DESC LIMIT 2;',
          why: 'Descending order plus a LIMIT is the canonical latest-N query.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'desc' }],
          pagination: { take: 2 },
          rows: 2,
          code0:
            'export async function latest() {\n  // Write latest query with sorting and pagination from scratch:\n\n}',
          code1:
            'export async function latest() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'desc\' },\n    take: 2,\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        type: 'challenge',
      },
      {
        ...prismaSnippetTask({
          id: 'prisma08-hw-2',
          title: 'Milestone 2 Checkpoint: Build a production feed with category filtering and cursor pagination',
          description:
            'Implement a production feed query with M:N relational filtering, cursor pagination with skip: 1, and a secondary tiebreaker.',
          instructions: [
            'Filter products matching `categoryId` via `categories: { some: { id: categoryId } }`',
            'Apply `take` limit to bound page size',
            'When cursor is provided, set `cursor: { id: cursor.id }` and `skip: 1`',
            'Enforce deterministic ordering with unique tiebreaker: `orderBy: [{ createdAt: "desc" }, { id: "desc" }]`',
          ],
          hintLadder: [
            'Deterministic cursor pagination requires a relational filter to isolate the target category, an explicit skip of one when a cursor is provided to avoid repeating the pivot item, and a secondary unique tiebreaker to prevent unstable ordering when timestamps collide.',
            'Call prisma.product.findMany with where filtering categories with some, take, conditional spread for cursor with skip: 1, and an orderBy array with createdAt desc followed by id desc.',
            'Implement the deterministic feed query stopping one step short:\nreturn await prisma.product.findMany({\n  where: { categories: { some: { id: categoryId } } },\n  take,\n  ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),\n  orderBy: [{ createdAt: \'desc\' }, /* unique tiebreaker */],\n});',
          ],
          scaffold: '-- Validating Deterministic Feed Query:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Deterministic pagination requires relational filtering, skip: 1 to advance past the cursor item, and a secondary unique tiebreaker to prevent unstable ordering under timestamp collisions.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function getCategoryProductFeed(\n  categoryId: number,\n  take: number,\n  cursor?: { id: number },\n) {\n  // TODO: Implement deterministic category feed with cursor pagination and tiebreakers:\n\n}',
          code1:
            'export async function getCategoryProductFeed(\n  categoryId: number,\n  take: number,\n  cursor?: { id: number },\n) {\n  return await prisma.product.findMany({\n    where: {\n      categories: {\n        some: { id: categoryId },\n      },\n    },\n    take,\n    ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),\n    orderBy: [\n      { createdAt: \'desc\' },\n      { id: \'desc\' },\n    ],\n  });\n}',
          need: ['findMany', 'categories', 'some', 'orderBy', 'createdAt', 'id'],
          behavioralGrader: 'checkpoint2-feed',
          noModelContract: true,
          rtype: 'Product[]',
        }),
        type: 'challenge',
      },
    ],
  },
};
