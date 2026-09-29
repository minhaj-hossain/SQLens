import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 7 — Reading Data + `select` vs `include`. */
export const Prisma_07_MODULE: ModuleData = {
  id: 'prisma-07',
  slug: 'reading-data-select-include',
  day: 7,
  title: 'Day 7 — Reading Data + select vs include',
  shortTitle: 'Reading Data',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description: 'Pick the right read method, then decide between a precise `select` and a relation `include`.',
  estimatedMinutes: 55,
  curriculumOrder: 7,
  displayLabel: 'Day 7',
  completionLearnings: [
    'Choose between findUnique, findFirst and findMany',
    'Return only the columns the screen needs',
    'Know when `include` is the right answer',
    'Predict the SQL each read method generates',
  ],
  concepts: [
    {
      id: 'read-methods',
      order: 1,
      title: 'findUnique, findFirst & findMany',
      shortDescription: 'One row by unique key, one row by filter, or many rows.',
      theory: prismaTheory(
        'Prisma gives you three reads: `findUnique` (one row, unique key only, may be null), `findFirst` (one row by any filter, may be null) and `findMany` (an array, never null). Picking the wrong one is either a runtime error or an accidental table scan.',
        'findUnique needs a unique key; findFirst takes any filter; findMany returns an array.',
        'SELECT id, name\nFROM users\nWHERE id = 1;',
        'const byId = await prisma.user.findUnique({ where: { id: 1 } });\nconst first = await prisma.user.findFirst({ where: { name: \'Alex\' } });\nconst all = await prisma.user.findMany();',
        'typescript',
        'Three methods, three SQL shapes — all parameterized.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma07-c1-t1',
          title: 'One row by its unique key',
          description: 'Return id + name for user 1 without scanning the table.',
          instructions: ['Use `findUnique`', 'Select `id` and `name` only'],
          hint: '`findUnique` only accepts a unique `where`.',
          scaffold: '-- Unique-key read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A unique key produces a single-row lookup.',
          cols: ['id', 'name'],
          noCols: ['email'],
          rows: 1,
          code0:
            'export async function getOne(id: number) {\n  return await prisma.user.findFirst({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function getOne(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string } | null',
        }),
        prismaReadTask({
          id: 'prisma07-c1-t2',
          title: 'One row by a non-unique filter',
          description: 'Find the first user called Alex.',
          instructions: ['Use `findFirst`', 'Filter on `where: { name: "Alex" }`'],
          hint: '`name` is not unique — `findUnique` would refuse it.',
          scaffold: '-- Filtered read:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE name = 'Alex';",
          why: 'findFirst accepts any filter and still returns a single row.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function getAlex() {\n  return await prisma.user.findUnique({\n    where: { name: \'Alex\' },\n    select: { id: true, name: true },\n  });\n}',
          code1:
            'export async function getAlex() {\n  return await prisma.user.findFirst({\n    where: { name: \'Alex\' },\n    select: { id: true, name: true },\n  });\n}',
          rtype: '{ id: number; name: string } | null',
        }),
      ],
    },
    {
      id: 'select-vs-include',
      order: 2,
      title: 'Data Shaping (`select`) vs Relation Loading (`include`)',
      shortDescription: '`select` trims the row; `include` adds the relation.',
      theory: prismaTheory(
        '`select` is a projection: name the fields you want and Prisma sends exactly those columns. `include` returns every scalar column plus the relation you asked for. You cannot use both at the same level — that is the whole decision.',
        '`select` trims, `include` widens — never both at once.',
        'SELECT id, email\nFROM users\nWHERE id = 3;',
        'const lean = await prisma.user.findUnique({\n  where: { id: 3 },\n  select: { id: true, email: true },\n});\n\nconst fat = await prisma.user.findUnique({\n  where: { id: 3 },\n  include: { posts: true },\n});',
        'typescript',
        'The lean read sends two columns; the include read sends all of them plus a second query.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma07-c2-t1',
          title: 'Trim the payload',
          description: 'The login screen needs id + email and nothing else.',
          instructions: ['Use `select` with `id` and `email`'],
          hint: 'Every selected field must be set to `true`.',
          scaffold: '-- Lean projection:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 3;',
          why: 'Naming the columns keeps card data and wide fields off the wire.',
          cols: ['id', 'email'],
          noCols: ['name'],
          rows: 1,
          code0:
            'export async function loginRow(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true },\n  });\n}',
          code1:
            'export async function loginRow(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
        }),
        prismaReadTask({
          id: 'prisma07-c2-t2',
          title: 'Load the relation instead',
          description: 'This screen needs the whole user plus their posts.',
          instructions: ['Use `include` for `posts`', 'Keep every scalar column'],
          hint: '`include: { posts: true }` — no `select` at the same level.',
          scaffold: '-- Parent row of the include read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'include keeps the scalars and adds one relation query.',
          cols: ['id', 'email'],
          select: [],
          includes: ['posts'],
          rows: 1,
          code0:
            'export async function feed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function feed(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma07-challenge',
    title: 'Final Challenge — Profile & Feed Loader',
    scenario: 'One request, one unique lookup, one relation load.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma07-hw-1',
          title: 'Profile page payload',
          description: 'Load rafi@prisma.io with their posts, but never leak `name`.',
          instructions: ['findUnique on `where: { email }`', '`include` the posts relation'],
          hint: 'Unique lookup plus `include` — no `select` at the top level.',
          scaffold: '-- Parent row of the profile read:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'The profile read is a unique lookup plus exactly one relation query.',
          cols: ['id', 'email'],
          select: [],
          includes: ['posts'],
          noCols: ['name'],
          rows: 1,
          code0:
            'export async function profile(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function profile(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    include: { posts: true },\n  });\n}',
          rtype: 'User & { posts: Post[] } | null',
        }),
        type: 'challenge',
      },
    ],
  },
};
