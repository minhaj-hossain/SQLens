import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 3 — Models, Fields, Enums & Constraints. */
export const Prisma_03_MODULE: ModuleData = {
  id: 'prisma-03',
  slug: 'models-fields-enums-constraints',
  day: 3,
  title: 'Day 3 — Models, Fields, Enums & Constraints',
  shortTitle: 'Models & Constraints',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description: 'Model scalar types, optionality, enums and table-level constraints in schema.prisma.',
  estimatedMinutes: 50,
  curriculumOrder: 3,
  displayLabel: 'Day 3',
  completionLearnings: [
    'Pick the scalar type and optionality for every column',
    'Declare primary keys with @id and @default',
    'Replace magic strings with a closed enum',
    'Enforce composite uniqueness with @@unique and @@index',
  ],
  concepts: [
    {
      id: 'scalar-types-optionality',
      order: 1,
      title: 'Scalar Types, Optionality & Primary Keys',
      shortDescription: 'Int / String / DateTime, the `?` modifier, and @id @default.',
      theory: prismaTheory(
        'Every Prisma field maps 1:1 onto a column: the scalar type picks the column type, `?` makes the column nullable, and `@id @default(...)` tells the database how to key each row.',
        'Type + optionality + @id @default is the whole column contract.',
        'SELECT id, name, email\nFROM users\nWHERE id = 1;',
        'model User {\n  id        Int      @id @default(autoincrement())\n  name      String\n  email     String   @unique\n  createdAt DateTime @default(now())\n}',
        'prisma',
        'One model, four columns: an auto-increment key, two required strings and a defaulted timestamp.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma03-c1-t1',
          title: 'Read the typed column set',
          description: 'Return the id, name and email columns of user 1.',
          instructions: ['findUnique on `where: { id: 1 }`', 'select `id`, `name`, `email`'],
          hint: '`where: { id }` plus `select: { id: true, name: true, email: true }`.',
          scaffold:
            '-- The column contract you just declared:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'The typed read returns exactly the columns the model declares.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'export async function getUser(id: number) {\n  return await prisma.user.findMany({\n    where: { id },\n    select: { id: true, name: true, email: true },\n  });\n}',
          code1: 'export async function getUser(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, name: true, email: true },\n  });\n}',
          rtype: '{ id: number; name: string; email: string } | null',
        }),
        prismaSnippetTask({
          id: 'prisma03-c1-t2',
          title: 'Make the timestamp nullable',
          description: 'A user may not have confirmed their email yet — allow NULL.',
          instructions: ['Use the `DateTime?` scalar', 'Keep `@default(now())`'],
          hint: 'A `?` after the scalar type marks the column nullable.',
          scaffold: '-- Same column set, one nullable timestamp:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Optionality is declared once in the schema and enforced on every insert.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'model User {\n  id          Int      @id @default(autoincrement())\n  email       String   @unique\n  confirmedAt DateTime @default(now())\n}',
          code1:
            'model User {\n  id          Int       @id @default(autoincrement())\n  email       String    @unique\n  confirmedAt DateTime? @default(now())\n}',
          need: ['DateTime?'],
          ban: ['confirmedAt DateTime @default'],
        }),
      ],
    },
    {
      id: 'enums-and-constraints',
      order: 2,
      title: 'Enums & Multi-Field Constraints',
      shortDescription: 'A closed `enum Role` plus @@unique / @@index at model level.',
      theory: prismaTheory(
        'Enums replace magic strings with a closed set the database enforces, while `@@unique` and `@@index` move uniqueness and lookup guarantees from application code to the table itself.',
        'Enums for closed sets; @@unique and @@index for table-level guarantees.',
        "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        'enum Role {\n  ADMIN\n  MEMBER\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n  role  Role   @default(MEMBER)\n\n  @@unique([name, email])\n  @@index([email])\n}',
        'prisma',
        'The enum, the composite unique key and the index all live in the model block.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma03-c2-t1',
          title: 'Declare the role enum',
          description: 'Replace the free-text role with a closed set of two values.',
          instructions: ['`enum Role { ADMIN, MEMBER }`', 'Type the column as `Role`'],
          hint: 'Declare `enum Role` above the model, then use `role Role`.',
          scaffold: '-- Configuration and schema validation runs automatically against the engine.\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'A closed enum makes an invalid role impossible to insert.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  role  String @default("MEMBER")\n}',
          code1:
            'enum Role {\n  ADMIN\n  MEMBER\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  role  Role   @default(MEMBER)\n}',
          need: ['enum Role', 'role  Role'],
          ban: ['@default("MEMBER")'],
        }),
        prismaSnippetTask({
          id: 'prisma03-c2-t2',
          title: 'Composite unique key + index',
          description: 'Two people may share a name, but never a name AND an email.',
          instructions: ['`@@unique([name, email])`', '`@@index([email])` for lookups'],
          hint: 'Model-level attributes are written with two @ signs.',
          scaffold: '-- The lookup the index exists for:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'mina@prisma.io';",
          why: 'The composite key blocks the duplicate, the index makes the lookup cheap.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  name  String @unique\n  email String @unique\n}',
          code1:
            'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n\n  @@unique([name, email])\n  @@index([email])\n}',
          need: ['@@unique([name, email])', '@@index([email])'],
          ban: ['name  String @unique'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma03-challenge',
    title: 'Final Challenge — Blueprint the users Table',
    scenario: 'Write the model block every later task will query.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma03-hw-1',
          title: 'Full table blueprint',
          description: 'Auto-increment key, unique + indexed email, optional name.',
          instructions: [
            '`@id @default(autoincrement())`',
            'email must be `@unique` and indexed',
            'name must be optional',
          ],
          hint: 'Combine `@id`, `@unique`, `@@index` and one nullable scalar.',
          scaffold: '-- The blueprint has to survive this read:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 2;',
          why: 'A unique, indexed email is what makes every later lookup cheap and safe.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'model User {\n  id    Int    @id\n  name  String\n  email String\n}',
          code1:
            'model User {\n  id    Int     @id @default(autoincrement())\n  name  String?\n  email String  @unique\n\n  @@index([email])\n}',
          need: ['@id @default(autoincrement())', 'String?', '@unique', '@@index([email])'],
        }),
        type: 'challenge',
      },
    ],
  },
};
