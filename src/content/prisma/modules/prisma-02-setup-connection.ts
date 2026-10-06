import type { ModuleData } from '../../../types/curriculum';
import { prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 2 — Setup & Connection. CLI lifecycle + pooled datasource. */
export const Prisma_02_MODULE: ModuleData = {
  id: 'prisma-02',
  slug: 'setup-and-connection',
  day: 2,
  title: 'Day 2 — Setup & Connection',
  shortTitle: 'Setup & Connection',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description: 'Run the CLI lifecycle and connect PostgreSQL with pooling.',
  estimatedMinutes: 45,
  curriculumOrder: 2,
  displayLabel: 'Day 2',
  completionLearnings: [
    'Run init, generate, migrate dev in order',
    'Regenerate the client after schema edits',
    'Build a pooled PostgreSQL connection string',
    'Prove the connection with a seeded read',
  ],
  concepts: [
    {
      id: 'cli-lifecycle',
      order: 1,
      title: 'The Prisma CLI Lifecycle',
      shortDescription: 'init scaffolds, generate compiles, migrate moves the schema.',
      theory: richPrismaTheory({
        summary:
          'schema.prisma compiles into two distinct targets: `prisma generate` compiles TypeScript types and query builders into application code, while `prisma migrate dev` creates and runs versioned SQL migrations against your live database.',
        takeaway:
          'generate compiles client application code; migrate dev applies database schema migrations.',
        sql: 'SELECT id, name, email FROM users;',
        heroCode: 'export function resolveTypeDesync(): string {\n  return "npx prisma generate";\n}',
        heroLang: 'typescript',
        heroWhy: 'The command that recompiles client types after schema changes.',
        mentalModel:
          '**The Dual Compilation Pipeline.** `schema.prisma` is the single source of truth that branches into two parallel compilation targets:\n```\nschema.prisma (Single Source of Truth)\n     │\n     ├── npx prisma generate   ──▶  Prisma Client (TypeScript types + query builder)\n     │                              Target: node_modules/@prisma/client (Application Code)\n     │\n     └── npx prisma migrate dev ──▶  Database Schema (SQL migration files + DB tables)\n                                    Target: prisma/migrations/*.sql + Live Database\n```\nConflating them is the most common beginner mistake: `generate` builds your TypeScript autocomplete; `migrate dev` updates the tables your database actually stores.',
        explanation: [
          'The Dual Pipeline: `generate` compiles application client code; `migrate dev` updates the database schema.',
          'Re-run `generate` after every schema edit — the client in TypeScript is a generated build artifact, not a live runtime reflection.',
          'Run `migrate dev` to generate versioned SQL migrations and apply them to your database.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'init writes the source of truth',
            codeSnippet: '// prisma/schema.prisma\nmodel User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String @unique\n}',
            explanation: 'Every CLI command reads this one file — it defines the models the whole toolchain speaks in.',
          },
          {
            stepNumber: 2,
            stepTitle: 'generate compiles the typed client',
            codeSnippet: 'npx prisma generate',
            explanation: 'Prisma reads the schema and emits a client whose types mirror the models — `User` fields reach your editor as real autocomplete.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the compiled client turns reads into calls',
            codeSnippet: 'const user = await prisma.user.findUnique({\n  where: { id: 1 },\n  select: { id: true, name: true, email: true },\n});',
            explanation: '`where` picks the row, `select` picks the fields — and the compiler already knows the result type.',
          },
          {
            stepNumber: 4,
            stepTitle: 'each call sends one parameterized SELECT',
            codeSnippet: 'SELECT id, name, email\nFROM users\nWHERE id = 1;',
            explanation: 'The Query Engine translates the call to SQL with bound parameters — the SQL Lens shows this exact statement after every run.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'generate vs migrate dev (The Dual Pipeline)',
              description:
                '`prisma generate` compiles TypeScript types and query builders into application code (`node_modules/@prisma/client`). `prisma migrate dev` applies SQL schema migrations to the live database.',
              badge: 'CLI',
            },
            {
              ruleNumber: 2,
              title: 'Re-run generate after every schema edit',
              description:
                'Because Prisma Client is a generated build artifact, your TypeScript autocomplete only updates after running `npx prisma generate`.',
              badge: 'Workflow',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma02-c1-t1',
          title: 'Your Prisma types are outdated: Can you bring the client back in sync?',
          description:
            'You added `bio String?` to `schema.prisma`. In your application code, TypeScript raises: `Property \'bio\' does not exist on type \'User\'`. Provide the CLI command that compiles the updated models into `node_modules/@prisma/client` to resolve the compile-time type desync.',
          instructions: [
            'Identify the CLI command that compiles TypeScript types into node_modules/@prisma/client',
            'Return `"npx prisma generate"`',
          ],
          hintLadder: [
            'Prisma Client is a generated build artifact. When models change in the schema, TypeScript autocomplete cannot see them until the client generator recompiles into node_modules.',
            'Call the Prisma CLI generator command with npx.',
            'Return the generation CLI string: return "/* run prisma generate with npx */";',
          ],
          scaffold: '-- Validating CLI compilation target:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Client regeneration compiles the schema into TypeScript autocomplete and query builder methods.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0:
            'export function resolveTypeDesync(): string {\n  // TypeScript compile error: Property "bio" does not exist on type "User".\n  // Return the command that compiles schema.prisma into node_modules/@prisma/client:\n  return "";\n}',
          code1:
            'export function resolveTypeDesync(): string {\n  return "npx prisma generate";\n}',
          need: ['npx prisma generate'],
        }),
        prismaSnippetTask({
          id: 'prisma02-c1-t2',
          title: 'Your database and Prisma schema disagree: Can you fix the mismatch?',
          description:
            'After running `prisma generate`, TypeScript autocomplete recognizes `user.bio`. However, executing the application query crashes at runtime with: `column "bio" does not exist in table "User"`. Provide the CLI command that detects the schema difference, creates an SQL migration, and applies the physical column to your database.',
          instructions: [
            'Identify the command that generates versioned SQL and alters the physical database table',
            'Return `"npx prisma migrate dev"`',
          ],
          hintLadder: [
            'The Prisma dual compilation pipeline separates client code from physical storage. Compiling client types does not alter physical tables on disk; a migration command is required to apply DDL changes.',
            'Invoke the migration development workflow command using the Prisma CLI.',
            'Return the migration development command: return "/* run prisma migrate dev with npx */";',
          ],
          scaffold: '-- Prove the dual pipeline:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 2;',
          why: 'migrate dev alters the physical database schema, whereas generate alters application client code.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0:
            'export function resolveDatabaseDesync(): string {\n  // Runtime database error: column "bio" does not exist in table "User".\n  // Return the command that creates and applies versioned SQL migrations to the database:\n  return "";\n}',
          code1:
            'export function resolveDatabaseDesync(): string {\n  return "npx prisma migrate dev";\n}',
          need: ['npx prisma migrate dev'],
        }),
      ],
    },
    {
      id: 'datasource-mapping',
      order: 2,
      title: 'Datasource & Schema Mapping',
      shortDescription: 'Env-sourced URL plus @map for legacy tables.',
      theory: richPrismaTheory({
        summary: 'Datasource reads the URL from env; @map keeps snake_case tables queryable.',
        takeaway: 'Datasource via env; legacy names via @map.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
        heroCode: 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
        heroLang: 'prisma',
        heroWhy: 'Provider plus env-sourced URL.',
        mentalModel: '**Shape vs names.** The model defines the SHAPE your code sees; `@map`/`@@map` define the NAMES the database actually stores. The engine resolves both before it sends any SQL.',
        explanation: [
          'The datasource block points at the environment: `env("DATABASE_URL")` keeps credentials out of the schema and lets one schema run in every environment.',
          '`@map`/`@@map` keep TypeScript names clean while the table keeps its legacy `snake_case` name.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the datasource picks provider + URL',
            codeSnippet: 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
            explanation: '`provider` selects the SQL dialect; `url` defers the connection string to the environment.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the URL is resolved from the environment',
            codeSnippet: '// .env\nDATABASE_URL="postgresql://user:pass@host:5432/app"',
            explanation: 'The same schema runs everywhere — only the environment variable changes between dev and production.',
          },
          {
            stepNumber: 3,
            stepTitle: '@@map maps the table; @map maps the column',
            codeSnippet: 'model Customer {\n  id    Int    @id @default(autoincrement())\n  email String @map("cust_email")\n\n  @@map("tbl_customers")\n}',
            explanation: 'Use `@map("cust_email")` on the field for the column name; use `@@map("tbl_customers")` at the model level for the table name. Resolved at query time.',
          },
          {
            stepNumber: 4,
            stepTitle: 'the read is still plain SQL',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'mina@prisma.io';",
            explanation: 'Mapping changes names only — the statement the engine sends is ordinary SQL, which the Lens shows after every run.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: '@map (field) vs @@map (model)',
              description:
                'Use `@map("column_name")` on a specific field to map it to a legacy database column. Use `@@map("table_name")` at the bottom of the model to map the entire table name.',
              badge: 'Mapping',
            },
            {
              ruleNumber: 2,
              title: 'Connection String URL Anatomy',
              description:
                '`postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public` defines the full connection topology. Store this in `.env` and load via `env("DATABASE_URL")`.',
              badge: 'Config',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma02-c2-t1',
          title: 'The database URL is hardcoded: Can you move it into the environment?',
          description: 'Point schema.prisma at PostgreSQL via the environment.',
          instructions: ['Set datasource provider to "postgresql"', 'Set url to read env("DATABASE_URL")'],
          hintLadder: [
            'Datasource blocks configure dialect translation and credentials. Sourcing connection secrets from environment variables keeps credentials safe and portable.',
            'Set provider to postgresql and wrap the connection string in the env helper function.',
            'Configure the datasource block: provider = "postgresql", url = env("/* environment variable name */")',
          ],
          scaffold: '-- Configuration and schema validation runs automatically against the engine.\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Env-wired datasource still reads the seed.',
          cols: ['id', 'email'],
          rows: 1,
          code0: 'datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}',
          code1: 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
          need: ['postgresql', 'DATABASE_URL'],
          ban: ['sqlite'],
        }),
        prismaSnippetTask({
          id: 'prisma02-c2-t2',
          title: 'The legacy database uses tbl_customers: Can you map it to Customer in Prisma?',
          description: 'Keep model Customer while the table stays tbl_customers.',
          instructions: [
            'Add `@map("cust_email")` to the email field to map the column',
            'Add `@@map("tbl_customers")` to the model to map the table name',
          ],
          hintLadder: [
            'Prisma decouples application model names from physical database identifiers using mapping attributes without breaking idiomatic TypeScript naming conventions.',
            'Use single @map on the field declaration and double @@map at the model block level.',
            'Attach the mappings: email String @map("cust_email"), @@map("/* legacy table name */")',
          ],
          scaffold: '-- Configuration and schema validation runs automatically against the engine.\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 3;',
          why: 'Mapping is cosmetic; the seed still reads.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'model Customer {\n  id    Int    @id @default(autoincrement())\n  email String\n}',
          code1: 'model Customer {\n  id    Int    @id @default(autoincrement())\n  email String @map("cust_email")\n\n  @@map("tbl_customers")\n}',
          need: ['@map("cust_email")', '@@map("tbl_customers")'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma02-challenge',
    title: 'Final Challenge — Configure Enterprise Datasource & Environment Wire',
    scenario: 'Wire the enterprise client to production PostgreSQL and map legacy database tables.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma02-hw-1',
          title: 'Connect Prisma to an existing enterprise database without changing its naming conventions',
          description:
            'Complete the schema configuration by declaring an env-sourced PostgreSQL datasource and mapping the User model to legacy tbl_users.',
          instructions: [
            'Set datasource provider to "postgresql"',
            'Source the database connection url from env("DATABASE_URL")',
            'Map the User model to table "tbl_users" using @@map',
          ],
          hintLadder: [
            'Enterprise configuration decouples deployment environments via environment variables and aligns Prisma models with legacy database naming conventions.',
            'Define a datasource block with provider and env url, followed by a User model with @@map pointing to tbl_users.',
            'Draft the schema block stopping 1 step short: datasource db { provider = "postgresql", url = env("DATABASE_URL") } model User { ... @@map("/* legacy table name */") }',
          ],
          fromScratch: true,
          scaffold: '-- Validates schema configuration against the engine:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Configuring the datasource via environment variables and mapping legacy tables enables zero-code database portability.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            '// Configure datasource and User model mapping from scratch:\n\n',
          code1:
            'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n\n  @@map("tbl_users")\n}',
          need: ['provider = "postgresql"', 'env("DATABASE_URL")', '@@map("tbl_users")'],
          ban: ['provider = "sqlite"', '"file:./dev.db"'],
        }),
        type: 'challenge',
      },
    ],
  },
};
