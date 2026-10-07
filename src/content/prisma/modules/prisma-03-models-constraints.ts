import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 3 — Core Querying (Finding Data).
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: Point lookups vs General search: findUnique vs findFirst
 *   Concept 2: Filtering with where operators (contains, in, gt, lt)
 *   Concept 3: Compound boolean filters (AND, OR, NOT)
 *   Challenge: Compound Filter Query (Query Mode from scratch)
 */
export const Prisma_03_MODULE: ModuleData = {
  id: 'prisma-03',
  slug: 'finding-data',
  day: 3,
  title: 'Day 3 — Core Querying (Finding Data)',
  shortTitle: 'Finding Data',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description:
    'Master record retrieval with findUnique, findFirst, advanced where operators, and compound boolean filters.',
  estimatedMinutes: 50,
  curriculumOrder: 3,
  displayLabel: 'Day 3',
  completionLearnings: [
    'Distinguish between findUnique (unique indexed fields) and findFirst (arbitrary searches)',
    'Use comparison and collection operators (contains, in, gt, lt) inside where',
    'Compose multi-clause queries using boolean operators (AND, OR, NOT)',
    'Observe how Prisma transforms complex JavaScript query objects into clean parameterized SQL',
  ],
  concepts: [
    {
      id: 'find-unique-vs-first',
      order: 1,
      title: 'Point Lookups vs General Search: findUnique vs findFirst',
      shortDescription:
        'Know when to require unique keys (findUnique) versus searching arbitrary columns (findFirst).',
      theory: richPrismaTheory({
        summary:
          '`findUnique` enforces database-level uniqueness at compile time and requires querying by `@id` or `@unique` fields. `findFirst` searches by any field and returns the first record that matches, or `null` if none match.',
        takeaway: 'Use findUnique for unique IDs/emails; use findFirst when filtering by non-unique fields.',
        sql: "SELECT id, name, email FROM users WHERE name = 'Alex' LIMIT 1;",
        heroCode: 'const user = await prisma.user.findFirst({\n  where: { name: "Alex" },\n});',
        heroLang: 'typescript',
        heroWhy: 'findFirst allows searching by non-unique fields like name.',
        mentalModel:
          'If you know an attribute is guaranteed unique (primary key `id`, unique `email`), use `findUnique`. If you are searching by a general attribute that might match multiple people (like `name` or `role`), TypeScript forbids `findUnique`; you must use `findFirst`.',
        explanation: [
          '`findUnique` only accepts where selectors for `@id` or `@unique` fields.',
          'Attempting `findUnique({ where: { name } })` results in a TypeScript compilation error.',
          '`findFirst` accepts any model fields in its where clause and appends `LIMIT 1` in SQL.',
          'Both methods return `T | null`, requiring your application to handle non-existent matches.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Choose findFirst for non-unique filters',
            codeSnippet: 'prisma.user.findFirst',
            explanation: 'Allows querying by non-unique fields like name.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Specify search criteria',
            codeSnippet: 'where: { name: "Alex" }',
            explanation: 'Matches the first record where name equals Alex.',
          },
          {
            stepNumber: 3,
            stepTitle: 'SQL translation with LIMIT 1',
            codeSnippet: 'SELECT * FROM users WHERE name = ? LIMIT 1;',
            explanation: 'The database stops scanning as soon as the first match is found.',
            visualData: { type: 'sql_lens', title: 'Parameterized LIMIT 1', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'findFirst without where Returns First Row',
              description: 'Calling `prisma.user.findFirst()` without a where argument returns the very first row in table order.',
              badge: 'Behavior',
            },
            {
              ruleNumber: 2,
              title: 'TypeScript Type Guarding',
              description: 'Always check `if (!user)` before accessing properties to satisfy the strict TypeScript compiler.',
              badge: 'TypeScript',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Search to Prisma findFirst',
          mappings: [
            {
              sql: 'SELECT * FROM users WHERE name = \'Alex\' LIMIT 1;',
              prisma: 'await prisma.user.findFirst({ where: { name: \'Alex\' } })',
              note: 'Returns the first matching user object or null',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma03-c1-t1',
          title: 'Search non-unique fields: Use findFirst() to locate a user by name',
          description: 'Fetch the first user with the name "Alex" using findFirst.',
          instructions: [
            'Inside `findUserByName`, call `await prisma.user.findFirst()`',
            'Pass `where: { name: "Alex" }` to filter by name',
            'Return the matched user object',
          ],
          hintLadder: [
            'Use `findFirst` on `prisma.user` with a `where` filter on `name`.',
            'Pass `{ where: { name: "Alex" } }` to the method.',
            'Write: `return await prisma.user.findFirst({ where: { name: "Alex" } });`',
          ],
          scaffold: '-- Find user by name:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name, email FROM users WHERE name = 'Alex';",
          why: 'findFirst executes a general search and returns the first matching record.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'export async function findUserByName() {\n  // Find the first user with name "Alex":\n\n}',
          code1: 'export async function findUserByName() {\n  return await prisma.user.findFirst({\n    where: {\n      name: "Alex",\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string } | null',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma03-c1-t2',
          title: 'Targeted match: Combine findFirst with select',
          description: 'Locate user Alex and return only their id and email fields.',
          instructions: [
            'Call `await prisma.user.findFirst()` with `where: { name: "Alex" }`',
            'Add a `select` option to project `id: true` and `email: true`',
            'Return the resulting record',
          ],
          hintLadder: [
            'Combine `where` and `select` in the options object.',
            'Filter by `where: { name: "Alex" }` and select `id: true` and `email: true`.',
            'Write: `return await prisma.user.findFirst({ where: { name: "Alex" }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- Select contact for Alex:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE name = 'Alex';",
          why: 'select projects only the needed fields on general searches.',
          select: ['id', 'email'],
          cols: ['id', 'email'],
          rows: 1,
          code0: 'export async function getAlexContact() {\n  // Find user Alex and project only id and email:\n\n}',
          code1: 'export async function getAlexContact() {\n  return await prisma.user.findFirst({\n    where: { name: "Alex" },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
          workspaceMode: 'query',
        }),
      ],
    },
    {
      id: 'filtering-operators',
      order: 2,
      title: 'Filtering with where Operators',
      shortDescription:
        'Search with contains, in, gt, lt, and other Prisma filter operators.',
      theory: richPrismaTheory({
        summary:
          'Prisma where clauses support rich operators. Instead of simple equality, you can pass nested filter objects like `where: { email: { contains: "prisma.io" } }` or `where: { id: { in: [1, 2] } }`.',
        takeaway: 'Nested operator objects ({ contains, in, gt, lt }) enable expressive SQL filtering.',
        sql: "SELECT id, name, email FROM users WHERE email LIKE '%prisma.io%';",
        heroCode: 'const team = await prisma.user.findMany({\n  where: {\n    email: { contains: "prisma.io" },\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'The contains operator maps to SQL LIKE %...% with automatic parameterization.',
        mentalModel:
          'In SQL, you write `WHERE email LIKE \'%domain%\'` or `WHERE id IN (1, 2)`. In Prisma, the field name opens a nested operator object: `{ email: { contains: "domain" } }` or `{ id: { in: [...] } }`.',
        explanation: [
          '`contains` checks for substring presence inside text fields.',
          '`in` checks whether a field value is contained within a provided array of values.',
          '`gt`, `gte`, `lt`, and `lte` perform numeric and date comparisons.',
          'All values passed into operators are strictly parameterized to prevent SQL injection.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Specify field to filter',
            codeSnippet: 'where: { email: ... }',
            explanation: 'Targets the email column.',
          },
          {
            stepNumber: 2,
            stepTitle: 'SQL generation with LIKE',
            codeSnippet: 'SELECT id, name, email FROM users WHERE email LIKE \'%prisma.io%\';',
            explanation: 'Prisma generates parameterized wildcard matches.',
            visualData: { type: 'sql_lens', title: 'LIKE %pattern%', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Inferred list type',
            codeSnippet: '{ id: number; name: string; email: string }[]',
            explanation: 'findMany always returns an array of matched records.',
            visualData: { type: 'type_preview', title: 'User[]', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Mode Insensitivity',
              description: 'In PostgreSQL, you can add `mode: "insensitive"` for case-insensitive matching: `{ contains: "test", mode: "insensitive" }`.',
              badge: 'Optimization',
            },
            {
              ruleNumber: 2,
              title: 'Array Values for in Operator',
              description: 'The `in` operator strictly expects an array: `where: { id: { in: [1, 2, 3] } }`.',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Operators to Prisma Filter Objects',
          mappings: [
            {
              sql: 'WHERE email LIKE \'%prisma.io%\'',
              prisma: 'where: { email: { contains: \'prisma.io\' } }',
              note: 'Substring search pattern',
            },
            {
              sql: 'WHERE id IN (1, 2)',
              prisma: 'where: { id: { in: [1, 2] } }',
              note: 'Collection inclusion filter',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma03-c2-t1',
          title: 'Substring search: Filter emails with contains',
          description: 'Fetch all users whose email address contains the substring prisma.io.',
          instructions: [
            'Inside `findPrismaStaff`, call `await prisma.user.findMany()`',
            'Filter by `where: { email: { contains: "prisma.io" } }`',
            'Return all matching records',
          ],
          hintLadder: [
            'Use `contains` inside a nested object under `email`.',
            'Pass `where: { email: { contains: "prisma.io" } }`.',
            'Write: `return await prisma.user.findMany({ where: { email: { contains: "prisma.io" } } });`',
          ],
          scaffold: '-- Filter by email substring:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name, email FROM users WHERE email LIKE '%prisma.io%';",
          why: 'contains maps to SQL LIKE %substring% matching.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 3,
          code0: 'export async function findPrismaStaff() {\n  // Find all users whose email contains "prisma.io":\n\n}',
          code1: 'export async function findPrismaStaff() {\n  return await prisma.user.findMany({\n    where: {\n      email: { contains: "prisma.io" },\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma03-c2-t2',
          title: 'Batch identifier match: Filter records with in',
          description: 'Retrieve users whose IDs match a given list and project their id and name.',
          instructions: [
            'Inside `getSelectedUsers`, call `await prisma.user.findMany()`',
            'Filter using `where: { id: { in: ids } }`',
            'Select `id: true` and `name: true`',
          ],
          hintLadder: [
            'The `in` operator expects an array of numbers: `where: { id: { in: ids } }`.',
            'Combine the where filter with a select block for id and name.',
            'Write: `return await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });`',
          ],
          scaffold: '-- Filter by id list:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id IN (1, 2);',
          why: 'The in operator matches rows whose column value belongs to a target list.',
          select: ['id', 'name'],
          cols: ['id', 'name'],
          rows: 2,
          demoVariables: { ids: [1, 2] },
          code0: 'export async function getSelectedUsers(ids: number[]) {\n  // Find users whose id is in the ids array, projecting id and name:\n\n}',
          code1: 'export async function getSelectedUsers(ids: number[]) {\n  return await prisma.user.findMany({\n    where: {\n      id: { in: ids },\n    },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
    {
      id: 'compound-filters',
      order: 3,
      title: 'Compound Filters with AND, OR, NOT',
      shortDescription:
        'Combine multiple query conditions with boolean logic operators.',
      theory: richPrismaTheory({
        summary:
          'Prisma supports compound queries via boolean logic keys: `AND: [...]` (every condition must match), `OR: [...]` (at least one condition must match), and `NOT: {...}` (excludes matches).',
        takeaway: 'Combine conditions using OR: [...], AND: [...], and NOT: {...} in where.',
        sql: 'SELECT id, name, email FROM users WHERE id = 1 OR id = 2;',
        heroCode: 'const users = await prisma.user.findMany({\n  where: {\n    OR: [{ id: 1 }, { id: 2 }],\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'OR allows matching records satisfying any listed criteria.',
        mentalModel:
          'When multiple fields are placed at the root of `where` (e.g. `{ name: "Alex", role: "ADMIN" }`), Prisma applies an implicit `AND`. When you need alternative criteria or explicit negations, use `OR: [...]` or `NOT: {...}` blocks.',
        explanation: [
          '`OR` takes an array of filter conditions and returns records matching at least one.',
          '`AND` takes an array of conditions and requires every condition to be true.',
          '`NOT` negates the enclosed criteria, mapping to SQL `NOT (...)` or `<>`.',
          'Logical blocks can be nested to build complex business logic filters.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Use the OR array',
            codeSnippet: 'where: { OR: [{ id: 1 }, { id: 2 }] }',
            explanation: 'Evaluates each condition independently.',
          },
          {
            stepNumber: 2,
            stepTitle: 'SQL translation with OR',
            codeSnippet: 'SELECT id, name, email FROM users WHERE id = 1 OR id = 2;',
            explanation: 'Prisma generates parenthesized boolean expressions.',
            visualData: { type: 'sql_lens', title: 'WHERE id = 1 OR id = 2', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Inferred compound match type',
            codeSnippet: '{ id: number; name: string; email: string }[]',
            explanation: 'Returns an array of typed objects matching either condition.',
            visualData: { type: 'type_preview', title: 'User[]', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'OR and AND Expect Arrays',
              description: 'Both OR and AND accept an array of condition objects: `OR: [{ cond1 }, { cond2 }]`.',
              badge: 'Syntax',
            },
            {
              ruleNumber: 2,
              title: 'Root Fields Default to AND',
              description: 'Specifying `{ id: 1, name: "Alex" }` is equivalent to `{ AND: [{ id: 1 }, { name: "Alex" }] }`.',
              badge: 'Logic',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Logic to Prisma Compound Keys',
          mappings: [
            {
              sql: 'WHERE id = 1 OR id = 2',
              prisma: 'where: { OR: [{ id: 1 }, { id: 2 }] }',
              note: 'Disjunctive alternative matching',
            },
            {
              sql: 'WHERE NOT (id = 1)',
              prisma: 'where: { NOT: { id: 1 } }',
              note: 'Negation filter',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma03-c3-t1',
          title: 'Alternative criteria: Match either condition with OR',
          description: 'Fetch users whose ID is either 1 or 2 using an OR block.',
          instructions: [
            'Inside `getSpecificPair`, call `await prisma.user.findMany()`',
            'Filter with `where: { OR: [{ id: 1 }, { id: 2 }] }`',
            'Return the matching users',
          ],
          hintLadder: [
            'Use the `OR` key inside `where` with an array of objects.',
            'Pass `where: { OR: [{ id: 1 }, { id: 2 }] }`.',
            'Write: `return await prisma.user.findMany({ where: { OR: [{ id: 1 }, { id: 2 }] } });`',
          ],
          scaffold: '-- OR filter:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1 OR id = 2;',
          why: 'OR matches rows satisfying at least one criterion.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 2,
          code0: 'export async function getSpecificPair() {\n  // Find users with id = 1 OR id = 2:\n\n}',
          code1: 'export async function getSpecificPair() {\n  return await prisma.user.findMany({\n    where: {\n      OR: [{ id: 1 }, { id: 2 }],\n    },\n  });\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma03-c3-t2',
          title: 'Exclusion filter: Combine where with NOT',
          description: 'Fetch all users except user 1, projecting only their id and name.',
          instructions: [
            'Inside `excludeFirstUser`, call `await prisma.user.findMany()`',
            'Filter with `where: { NOT: { id: 1 } }`',
            'Select `id: true` and `name: true`',
          ],
          hintLadder: [
            'Use `NOT: { id: 1 }` inside `where` to exclude matching records.',
            'Pair the filter with a select block for `id` and `name`.',
            'Write: `return await prisma.user.findMany({ where: { NOT: { id: 1 } }, select: { id: true, name: true } });`',
          ],
          scaffold: '-- NOT filter:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id != 1;',
          why: 'NOT excludes records that match the specified criteria.',
          select: ['id', 'name'],
          cols: ['id', 'name'],
          rows: 2,
          code0: 'export async function excludeFirstUser() {\n  // Fetch all users except id 1, projecting id and name:\n\n}',
          code1: 'export async function excludeFirstUser() {\n  return await prisma.user.findMany({\n    where: {\n      NOT: { id: 1 },\n    },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma03-challenge',
    title: 'Final Challenge — Compound User Filter',
    scenario:
      'Filter the user database for members whose email contains "prisma.io" AND whose ID is greater than 1, projecting only id and email from scratch.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaReadTask({
        id: 'prisma03-hw-1',
        title: 'Final Challenge — Compound User Filter',
        description: 'Combine AND, contains, and gt to query specific users from scratch.',
        instructions: [
          'Write the query from scratch inside `getFilteredTeam()`',
          'Use `prisma.user.findMany` with `where: { AND: [{ email: { contains: "prisma.io" } }, { id: { gt: 1 } }] }`',
          'Project only `id` and `email` using `select`',
        ],
        hintLadder: [
          'Use `AND: [{ email: { contains: "prisma.io" } }, { id: { gt: 1 } }]` in the where clause.',
          'Project with `select: { id: true, email: true }`.',
          'Complete function: `return await prisma.user.findMany({ where: { AND: [{ email: { contains: "prisma.io" } }, { id: { gt: 1 } }] }, select: { id: true, email: true } });`',
        ],
        scaffold: '-- Compound challenge:\nSELECT id, email FROM users WHERE id = 99;',
        solutionSql: "SELECT id, email FROM users WHERE email LIKE '%prisma.io%' AND id > 1;",
        why: 'Compound filtering enforces multi-dimensional query criteria.',
        select: ['id', 'email'],
        cols: ['id', 'email'],
        rows: 2,
        code0: 'export async function getFilteredTeam() {\n  // Write the query from scratch:\n\n}',
        code1: 'export async function getFilteredTeam() {\n  return await prisma.user.findMany({\n    where: {\n      AND: [\n        { email: { contains: "prisma.io" } },\n        { id: { gt: 1 } },\n      ],\n    },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
        rtype: '{ id: number; email: string }[]',
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'query',
      }),
    ],
  },
};
