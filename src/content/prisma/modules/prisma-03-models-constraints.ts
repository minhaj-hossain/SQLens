import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

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
      theory: richPrismaTheory({
        summary: 'Every Prisma field maps 1:1 onto a column: the scalar type picks the column type, `?` makes the column nullable, and `@id @default(...)` tells the database how to key each row.',
        takeaway: 'Type + optionality + @id @default is the whole column contract.',
        sql: 'SELECT id, name, email\nFROM users\nWHERE id = 1;',
        heroCode: 'model User {\n  id        Int      @id @default(autoincrement())\n  name      String\n  email     String   @unique\n  createdAt DateTime @default(now())\n}',
        heroLang: 'prisma',
        heroWhy: 'One model, four columns: an auto-increment key, two required strings and a defaulted timestamp.',
        mentalModel: '**One line per column, one contract for both sides.** A field is the column: `name String` is required text, `confirmedAt DateTime?` is nullable, `@id @default(...)` decides how rows are keyed. The client and the database read this same contract — there is nowhere else to declare it.',
        explanation: [
          'The scalar type picks the column type, `?` makes the column nullable, and `@id @default(...)` decides how each row is identified.',
          'The @default modifier family: `@default(autoincrement())` for serial numbers, `@default(uuid())` or `@default(cuid())` for distributed keys, and `@default(now())` for automatic creation timestamps.',
          'Reads and writes are type-checked against the same model, so a renamed field cannot silently desync from the database.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'scalar types + `?` declare the columns',
            codeSnippet: 'model User {\n  id          String    @id @default(uuid())\n  email       String    @unique\n  confirmedAt DateTime?\n}',
            explanation: 'Everything without `?` is `NOT NULL`; the type picks the column type — `Int`→INTEGER, `String`→TEXT, `DateTime`→TIMESTAMP.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the call reads the declared column set',
            codeSnippet: 'const user = await prisma.user.findUnique({\n  where: { id },\n  select: { id: true, name: true, email: true },\n});',
            explanation: '`select` mirrors the model fields — the compiler types `user` from exactly this list.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the engine sends the declared projection',
            codeSnippet: 'SELECT id, name, email\nFROM users\nWHERE id = 1;',
            explanation: 'One parameterized SELECT over the column set you declared — the Lens shows it after every run.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the result is typed, never `any`',
            codeSnippet: '{ id: number; name: string; email: string } | null',
            explanation: 'The inferred type comes straight from `select` — rename a field in the model and the compiler flags every use.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'The ? goes on the type, not the field name',
              description:
                'In TypeScript you write `bio?: string`. In Prisma Schema, the `?` goes directly on the scalar type: `bio String?`. Writing `bio? String` is a syntax error.',
              codeSnippet: '// Correct:\nbio String?\n\n// Error:\nbio? String',
              badge: 'Syntax',
            },
            {
              ruleNumber: 2,
              title: 'Generator functions require parentheses',
              description:
                '@default(autoincrement()) and @default(now()) are function calls evaluated by the database engine at insert time.',
              badge: 'Modifier',
            },
            {
              ruleNumber: 3,
              title: 'UUIDs vs Serial Auto-increment',
              description:
                'Use @default(autoincrement()) for sequential numeric IDs (Int). Use @default(uuid()) or @default(cuid()) for collision-resistant distributed keys (String).',
              badge: 'Primary Key',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL to Prisma',
          mappings: [
            {
              sql: 'id SERIAL PRIMARY KEY',
              prisma: 'id Int @id @default(autoincrement())',
              note: 'Auto-incrementing integer primary key',
            },
            {
              sql: 'name VARCHAR(255) NOT NULL',
              prisma: 'name String',
              note: 'Required text column (no ? modifier)',
            },
            {
              sql: 'bio TEXT',
              prisma: 'bio String?',
              note: 'Nullable column (stores NULL when omitted)',
            },
            {
              sql: 'created_at TIMESTAMP DEFAULT NOW()',
              prisma: 'createdAt DateTime @default(now())',
              note: 'Automatic timestamp generated at insertion',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma03-c1-t1',
          title: 'Read the typed column set',
          description: 'Return the id, name and email columns of user 1.',
          instructions: ['findUnique on `where: { id }`', 'select `id`, `name`, `email`'],
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
          title: 'Model distributed UUID keys and timestamps',
          description: 'Use a UUID primary key and make the confirmation timestamp nullable.',
          instructions: [
            'Change id to `String @id @default(uuid())`',
            'Use `DateTime? @default(now())` for confirmedAt',
          ],
          hint: '`id String @id @default(uuid())` and `confirmedAt DateTime? @default(now())`.',
          scaffold: '-- Validating UUID and timestamp modifiers:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'UUIDs enable collision-resistant distributed primary key generation at insert time.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'model User {\n  id          Int      @id @default(autoincrement())\n  email       String   @unique\n  confirmedAt DateTime @default(now())\n}',
          code1:
            'model User {\n  id          String    @id @default(uuid())\n  email       String    @unique\n  confirmedAt DateTime? @default(now())\n}',
          need: ['@default(uuid())', 'DateTime?'],
          ban: ['@default(autoincrement())', 'confirmedAt DateTime @default'],
        }),
      ],
    },
    {
      id: 'enums-and-constraints',
      order: 2,
      title: 'Enums & Multi-Field Constraints',
      shortDescription: 'A closed `enum Role` plus @@unique / @@index at model level.',
      theory: richPrismaTheory({
        summary: 'Enums replace magic strings with a closed set the database enforces, while `@@unique` and `@@index` move uniqueness and lookup guarantees from application code to the table itself.',
        takeaway: 'Enums for closed sets; @@unique and @@index for table-level guarantees.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        heroCode: 'enum Role {\n  ADMIN\n  MEMBER\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n  role  Role   @default(MEMBER)\n\n  @@unique([name, email])\n  @@index([email])\n}',
        heroLang: 'prisma',
        heroWhy: 'The enum, the composite unique key and the index all live in the model block.',
        mentalModel: '**Closed values, table-level promises.** An enum makes an invalid value impossible to write; `@@unique` and `@@index` make duplicate rows and slow lookups impossible to ship. All three live in the model block — the database enforces what the schema declares.',
        explanation: [
          'An `enum` is a closed set: the database rejects anything outside it, so no validation code has to.',
          '`@@unique` and `@@index` are table-level — the database, not your application, enforces the guarantee.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the enum closes the set of allowed values',
            codeSnippet: 'enum Role {\n  ADMIN\n  MEMBER\n}',
            explanation: '`role Role` accepts exactly these two values — a free-text `role String` could hold typos the compiler never sees.',
          },
          {
            stepNumber: 2,
            stepTitle: 'model-level attributes add the table guarantees',
            codeSnippet: '@@unique([name, email])\n@@index([email])',
            explanation: '`@@unique` blocks duplicate name+email pairs; `@@index` makes the lookups your queries actually run cheap.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the lookup rides the index',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
            explanation: 'With `@@index([email])` this WHERE becomes a direct seek instead of a full table scan.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the selected row stays narrow',
            codeSnippet: '{ id: number; email: string } | null',
            explanation: '`select` keeps the type narrow — the enum field only appears in the result when you ask for it.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'No quotes and no commas in Enums',
              description:
                'Inside an `enum`, values are listed without quotes or commas. Writing `ADMIN, MEMBER` or `"ADMIN"` triggers schema syntax errors.',
              codeSnippet: '// Correct:\nenum Role {\n  ADMIN\n  MEMBER\n}',
              badge: 'Enum',
            },
            {
              ruleNumber: 2,
              title: 'Single @ vs Double @@ Scope Rule',
              description:
                'A single `@` modifies a single field (like `@unique` or `@id`). A double `@@` modifies the whole model across multiple fields (like `@@unique([tenantId, email])` or `@@index([createdAt])`).',
              badge: 'Scope',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL to Prisma',
          mappings: [
            {
              sql: "CREATE TYPE role_enum AS ENUM ('ADMIN', 'MEMBER')",
              prisma: 'enum Role { ADMIN MEMBER }',
              note: 'Database-level enumerated type',
            },
            {
              sql: 'UNIQUE (name, email)',
              prisma: '@@unique([name, email])',
              note: 'Composite uniqueness across multiple columns',
            },
            {
              sql: 'CREATE INDEX ON users (email)',
              prisma: '@@index([email])',
              note: 'Index on specific lookup columns',
            },
          ],
        },
      }),
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
          schemaSource:
            'enum Role {\n  ADMIN\n  MEMBER\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  role  Role   @default(MEMBER)\n}',
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  role  String @default("MEMBER")\n}',
          code1:
            'enum Role {\n  ADMIN\n  MEMBER\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  role  Role   @default(MEMBER)\n}',
          need: ['enum Role', 'role Role'],
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
          schemaSource:
            'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n\n  @@unique([name, email])\n  @@index([email])\n}',
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  name  String @unique\n  email String @unique\n}',
          code1:
            'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n\n  @@unique([name, email])\n  @@index([email])\n}',
          need: ['@@unique([name, email])', '@@index([email])'],
          ban: ['name String @unique'],
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
          description: 'Auto-increment key, unique email, and indexed optional name.',
          instructions: [
            '`@id @default(autoincrement())`',
            'email must be `@unique`',
            'name must be optional (`String?`) and indexed with `@@index([name])`',
          ],
          hint: 'Combine `@id`, `@unique`, `String?`, and `@@index([name])`.',
          scaffold: '-- The blueprint has to survive this read:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 2;',
          why: 'A unique constraint already builds an index on email; @@index([name]) optimizes non-unique name lookups without index duplication.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'model User {\n  id    Int    @id\n  name  String\n  email String\n}',
          code1:
            'model User {\n  id    Int     @id @default(autoincrement())\n  name  String?\n  email String  @unique\n\n  @@index([name])\n}',
          need: ['@id @default(autoincrement())', 'String?', '@unique', '@@index([name])'],
          ban: ['@@index([email])'],
        }),
        type: 'challenge',
      },
    ],
  },
};
