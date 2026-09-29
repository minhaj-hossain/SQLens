import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

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
    'Compose filters with `contains`, `in` and `not`',
    'Always pair pagination with an ORDER BY',
    'Page with `skip`/`take` for small offsets',
    'Prefer `cursor` paging when the table grows',
  ],
  concepts: [
    {
      id: 'filter-operators',
      order: 1,
      title: 'Advanced Filtering Operators',
      shortDescription: '`contains`, `in`, `not`, `AND` / `OR` — filters as data.',
      theory: prismaTheory(
        'A Prisma filter is an object, not a string: `contains` compiles to LIKE, `in` to IN, `not` to <>, and `AND`/`OR` nest them without string concatenation — so a filter can be built, typed and tested.',
        'Filters are objects: `contains`, `in`, `not`, nested with AND/OR.',
        "SELECT id, name\nFROM users\nWHERE email LIKE '%prisma.io';",
        "await prisma.user.findMany({\n  where: { email: { contains: 'prisma.io' } },\n  select: { id: true, name: true },\n});",
        'typescript',
        '`contains` is a LIKE; the parameter is still bound, never concatenated.',
      ),
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
        prismaReadTask({
          id: 'prisma08-c1-t2',
          title: 'Filter on a set of values',
          description: 'Return Alex and Mina, nobody else.',
          instructions: ['Filter with `name: { in: ["Alex", "Mina"] }`'],
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
          rtype: '{ id: number; name: string }[]',
        }),
      ],
    },
    {
      id: 'pagination-strategies',
      order: 2,
      title: 'Pagination — Offset vs Cursor',
      shortDescription: '`skip`/`take` for pages, `cursor` for streams.',
      theory: prismaTheory(
        'Offset paging (`skip`/`take`) is simple but re-reads everything before the page and shifts when rows are inserted. Cursor paging (`cursor` + `take`) asks for "everything after this row" and stays stable — which is why feeds use it and admin tables usually do not.',
        'Offset for pages, cursor for endless streams — both need an ORDER BY.',
        'SELECT id, name\nFROM users\nORDER BY id ASC\nLIMIT 1 OFFSET 1;',
        "await prisma.user.findMany({\n  orderBy: { id: 'asc' },\n  skip: 1,\n  take: 1,\n  select: { id: true, name: true },\n});",
        'typescript',
        'Without ORDER BY, offset paging has no defined page boundaries at all.',
      ),
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
        prismaReadTask({
          id: 'prisma08-c2-t2',
          title: 'Cursor paging',
          description: 'Return the two rows after the user with id 1.',
          instructions: ['Use `cursor: { id: 1 }`', '`take: 2` with `orderBy: { id: "asc" }`'],
          hint: 'A cursor is a unique key, not an offset.',
          scaffold: '-- Cursor page:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id > 1 ORDER BY id ASC LIMIT 2;',
          why: 'The cursor compiles to a WHERE on the key plus a LIMIT.',
          cols: ['id', 'name'],
          pagination: { take: 2, cursor: true },
          orderBy: [{ field: 'id', direction: 'asc' }],
          rows: 2,
          code0:
            'export async function afterRow(id: number) {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    skip: 2,\n    take: 2,\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function afterRow(id: number) {\n  return await prisma.user.findMany({\n    cursor: { id },\n    take: 2,\n    orderBy: { id: \'asc\' },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string }[]',
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
