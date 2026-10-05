import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 5 — Migrations + Seeding. */
export const Prisma_05_MODULE: ModuleData = {
  id: 'prisma-05',
  slug: 'migrations-and-seeding',
  day: 5,
  title: 'Day 5 — Migrations + Seeding',
  shortTitle: 'Migrations & Seeding',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description: 'Turn schema.prisma into versioned SQL migrations and seed data deterministically.',
  estimatedMinutes: 50,
  curriculumOrder: 5,
  displayLabel: 'Day 5',
  completionLearnings: [
    'Prototyping with `db push` vs versioned migrations with `migrate dev`',
    'Promote migrations with `migrate deploy` instead of re-authoring them',
    'Write idempotent seed scripts using `prisma.user.upsert`',
    'Reset and re-seed a development database with `migrate reset`',
  ],
  concepts: [
    {
      id: 'migrate-workflow',
      order: 1,
      title: 'The Prisma Migrate Workflow & Prototyping',
      shortDescription: '`db push` for rapid prototyping; `migrate dev` for versioned team migrations.',
      theory: richPrismaTheory({
        summary:
          'Prisma offers two ways to sync your schema to the database: `prisma db push` syncs changes directly without writing migration files (ideal for rapid local prototyping). `prisma migrate dev` detects schema deltas using a shadow database, generates versioned SQL migration files stored in source control, and tracks execution in the `_prisma_migrations` table. Production environments strictly execute committed migrations with `prisma migrate deploy`.',
        takeaway:
          'Use db push to prototype; migrate dev to commit migrations; migrate deploy in production.',
        sql: 'SELECT id, name\nFROM users\nWHERE id = 1;',
        heroCode:
          '# Rapid local prototyping (no migration files created):\nnpx prisma db push\n\n# Versioned team migration (creates migration.sql via shadow DB):\nnpx prisma migrate dev --name add_user_model\n\n# Production CI/CD execution (applies committed files only):\nnpx prisma migrate deploy',
        heroLang: 'bash',
        heroWhy: 'db push modifies the database directly; migrate dev creates tracked SQL migration files.',
        mentalModel:
          '**The Migration Lifecycle & Shadow Database.** When you run `npx prisma migrate dev`, Prisma spins up a temporary shadow database in the background, replays all existing migrations to reach current baseline state, applies your new `schema.prisma` draft, calculates the SQL diff, writes a timestamped `migration.sql` file, executes it on your dev database, and logs a checksum row into `_prisma_migrations`. In production, `migrate deploy` skips schema inspection and directly replays any pending migrations recorded in your repo.',
        littleDetails: {
          title: 'Migration Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never run migrate dev in production or CI/CD',
              description: '`migrate dev` is interactive and requires a shadow database with superuser privileges to create and drop temporary databases. Production environments should strictly run `npx prisma migrate deploy`, which only applies pre-generated, committed migration files.',
              badge: 'Production',
            },
            {
              ruleNumber: 2,
              title: 'The _prisma_migrations ledger table',
              description: 'Prisma stores migration history inside the target database in a table named `_prisma_migrations`. Each row stores the migration name, checksum hash, and execution timestamp. If someone edits an already-applied migration file in Git, Prisma will detect a checksum mismatch and raise a migration drift error.',
              badge: 'Ledger',
            },
            {
              ruleNumber: 3,
              title: 'db push for disposable spikes, migrate dev for team code',
              description: 'Use `prisma db push` when exploring ideas or hacking on features where database resets are acceptable. Once your schema stabilizes or needs to be shared with teammates, generate a clean migration with `prisma migrate dev --name <descriptive_name>`.',
              badge: 'Workflow',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma CLI Commands to Database Actions',
          mappings: [
            {
              prisma: 'npx prisma db push',
              sql: 'ALTER TABLE / CREATE TABLE (direct DDL sync)',
              note: 'Inspects your live database schema and executes DDL directly to match schema.prisma without saving SQL history files.',
            },
            {
              prisma: 'npx prisma migrate dev --name init',
              sql: 'CREATE TABLE ... + INSERT INTO _prisma_migrations',
              note: 'Uses shadow DB to calculate SQL diff, saves timestamped migration.sql, and records checksum row in _prisma_migrations table.',
            },
            {
              prisma: 'npx prisma migrate deploy',
              sql: 'Executes unapplied migration.sql files in sequence',
              note: 'Non-interactive production runner: compares committed migration folders against _prisma_migrations and applies missing files.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Am I quickly exploring a new feature or drafting disposable model changes?',
              answer: 'Use `npx prisma db push`. It modifies the dev database in-place without cluttering your repo with throwaway migration files.',
            },
            {
              questionNumber: 2,
              question: 'Are my schema changes tested and ready for team review in source control?',
              answer: 'Use `npx prisma migrate dev --name <feature_name>`. This creates a permanent, reviewable SQL migration in `prisma/migrations/`.',
            },
            {
              questionNumber: 3,
              question: 'Is this running inside a production container startup script or CI pipeline?',
              answer: 'Use `npx prisma migrate deploy`. It does not require a shadow database and never prompts for user confirmation.',
            },
            {
              questionNumber: 4,
              question: 'Has my local development database drifted or accumulated invalid mock data?',
              answer: 'Use `npx prisma migrate reset --force`. It drops the entire database, replays all migrations from scratch, and runs the seed script.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Author schema changes in schema.prisma',
            codeSnippet: 'model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  name  String\n}',
            explanation: 'Your schema.prisma file is the declarative source of truth for the desired database structure.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Shadow database computes the migration delta',
            codeSnippet: '-- Generated migration.sql:\nCREATE TABLE "User" (\n  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\n  "email" TEXT NOT NULL,\n  "name" TEXT NOT NULL\n);\nCREATE UNIQUE INDEX "User_email_key" ON "User"("email");',
            explanation: 'Prisma Migrate replays history on a shadow DB, compares it to schema.prisma, and generates deterministic SQL.',
            visualData: {
              type: 'sql_lens',
              title: 'Generated Migration DDL',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Execution ledger records migration completion',
            codeSnippet: 'SELECT id, migration_name, finished_at\nFROM _prisma_migrations\nWHERE rolled_back_at IS NULL;',
            explanation: 'The _prisma_migrations table records the migration checksum, ensuring it is never re-run on subsequent deploys.',
            visualData: {
              type: 'sql_lens',
              title: 'Migration Tracking Ledger',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c1-t1',
          title: 'Author the first migration',
          description: 'Create a named migration from the current schema, transitioning from rapid prototyping to versioned migrations.',
          instructions: [
            'Transition from rapid prototyping to versioned migrations',
            'Use `npx prisma migrate dev` with `--name init_users`',
          ],
          hint: '`npx prisma migrate dev --name init_users`.',
          scaffold: '-- The table the migration creates:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A named migration is a reviewable SQL file plus a row in the migration table.',
          cols: ['id', 'name'],
          rows: 1,
          code0: 'const cmd = "npx prisma db push";',
          code1: 'const cmd = "npx prisma migrate dev --name init_users";',
          need: ['npx prisma migrate dev', '--name'],
          ban: ['db push'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c1-t2',
          title: 'Promote migrations to production',
          description: 'Apply committed migrations to production without authoring new ones.',
          instructions: ['Use `migrate deploy`', 'Never author migrations in production'],
          hint: '`npx prisma migrate deploy` applies what is already committed.',
          scaffold: '-- The migration already created this row:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'mina@prisma.io';",
          why: 'Deploy is idempotent: applied migrations are skipped.',
          cols: ['id', 'name'],
          rows: 1,
          code0: 'const cmd = "npx prisma migrate dev --name prod_sync";',
          code1: 'const cmd = "npx prisma migrate deploy";',
          need: ['npx prisma migrate deploy'],
          ban: ['migrate dev'],
        }),
      ],
    },
    {
      id: 'idempotent-seed',
      order: 2,
      title: 'Writing Idempotent Seed Scripts',
      shortDescription: 'Write reproducible seeds using `upsert` so re-running never throws P2002 errors.',
      theory: richPrismaTheory({
        summary:
          'A seed script must be idempotent: executing it twice on the same database should never throw a unique constraint error (P2002). Using `prisma.user.upsert({ where, update, create })` guarantees that missing records are inserted and existing ones are left intact or updated cleanly. Registering the seed script in package.json enables `prisma db seed` and automatic seeding on `migrate reset`.',
        takeaway:
          'Use upsert for idempotent seeding: insert if missing, do nothing or update if present.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'await prisma.user.upsert({\n  where: { email: "alex@prisma.io" },\n  update: {},\n  create: { email: "alex@prisma.io", name: "Alex" },\n});',
        heroLang: 'typescript',
        heroWhy: 'upsert ensures your seed script can be run dozens of times without crashing.',
        mentalModel:
          '**Idempotency & Safe Database Seeding.** In development and CI, seeding must be repeatable. If you write `prisma.user.create(...)`, the first run succeeds, but the second run crashes with error `P2002: Unique constraint failed on the fields: (email)`. The `upsert` method takes three objects: `where` (the unique identifier to check), `update` (fields to modify if the row already exists—pass `{}` to leave existing records untouched), and `create` (the full payload to insert if no record exists).',
        littleDetails: {
          title: 'Seeding Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'The where clause in upsert must target a unique field',
              description: 'You cannot upsert on non-unique fields like `name` or `age`. The `where` argument requires an `@id` or `@unique` field (e.g. `where: { email: ... }` or `where: { id: ... }`).',
              badge: 'Unique Key',
            },
            {
              ruleNumber: 2,
              title: 'Empty update: {} preserves existing record data',
              description: 'Setting `update: {}` makes your seed non-destructive: if the user already exists (perhaps modified during local testing), their data is preserved while missing prerequisite records are cleanly inserted.',
              badge: 'Non-destructive',
            },
            {
              ruleNumber: 3,
              title: 'Register the seed command in package.json',
              description: 'The Prisma CLI discovers seed scripts via `"prisma": { "seed": "tsx prisma/seed.ts" }` inside your `package.json`. When configured, `npx prisma db seed` and `npx prisma migrate reset` trigger it automatically.',
              badge: 'CLI Tooling',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Upsert to SQL Statements',
          mappings: [
            {
              prisma: 'prisma.user.upsert({ where, update, create })',
              sql: 'INSERT INTO users ... ON CONFLICT (email) DO UPDATE / NOTHING',
              note: 'Compiles to an atomic insert with conflict resolution in Postgres and SQLite.',
            },
            {
              prisma: 'npx prisma db seed',
              sql: 'npm/npx runner executing seed script',
              note: 'Executes the tsx/node command defined in the "prisma.seed" configuration of package.json.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Can this seed script run safely on a database that already has partial data?',
              answer: 'Always use `upsert` keyed by unique attributes (`email`, `slug`, `sku`) instead of `create`.',
            },
            {
              questionNumber: 2,
              question: 'Should the seed script overwrite manual changes during development?',
              answer: 'If you want to preserve local test changes, provide `update: {}`. If you want deterministic resets, populate `update` with standard default attributes.',
            },
            {
              questionNumber: 3,
              question: 'Is the seed script registered in package.json?',
              answer: 'Add `"prisma": { "seed": "tsx prisma/seed.ts" }` so `prisma migrate reset` re-seeds the database automatically in one step.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Anchor on a unique key in the where clause',
            codeSnippet: "where: { email: 'alex@prisma.io' }",
            explanation: 'Prisma queries the table for a record matching the unique selector before deciding whether to insert or update.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Specify update payload for existing rows',
            codeSnippet: 'update: {} // or { name: "Alex (Default)" }',
            explanation: 'If a user with this email already exists, Prisma applies this payload or leaves the row untouched if empty.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Define full insert payload for missing rows',
            codeSnippet: "create: { email: 'alex@prisma.io', name: 'Alex' }",
            explanation: 'If no matching record is found, Prisma executes an INSERT with all required schema fields.',
          },
          {
            stepNumber: 4,
            stepTitle: 'Emitted SQL query verifies idempotency',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
            explanation: 'The seed guarantees that the row exists with the specified email regardless of how many times the script executes.',
            visualData: {
              type: 'sql_lens',
              title: 'Seed Verification Read',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c2-t1',
          title: 'Write an idempotent user seed with upsert',
          description: 'Ensure seeding a user will not fail with unique constraint violations if the record already exists.',
          instructions: [
            'Use `prisma.user.upsert` to make the insert idempotent',
            'Match `where: { email }`',
            'Leave `update: {}` empty so existing data is untouched',
            'Define `create: { email, name }` for fresh environments',
          ],
          hint: '`prisma.user.upsert({ where: { email }, update: {}, create: { email, name } })`.',
          scaffold: '-- Seed rows survive multiple idempotent runs:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'upsert checks uniqueness before inserting, preventing P2002 errors on subsequent runs.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function seedUser(email: string, name: string) {\n  // Bug: this throws on second run if user exists!\n  return await prisma.user.create({\n    data: { email, name },\n  });\n}',
          code1:
            'export async function seedUser(email: string, name: string) {\n  return await prisma.user.upsert({\n    where: { email },\n    update: {},\n    create: { email, name },\n  });\n}',
          need: ['prisma.user.upsert', 'where: { email }', 'update: {}', 'create: { email, name }'],
          ban: ['prisma.user.create({'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c2-t2',
          title: 'Register the seed script in package.json',
          description: 'Tell the Prisma CLI which command seeds a fresh database.',
          instructions: ['Add a `prisma` block to package.json', 'Point `seed` at tsx prisma/seed.ts'],
          hint: '`"seed": "tsx prisma/seed.ts"` inside `"prisma": { ... }`.',
          scaffold: '-- Seeded rows are readable straight away:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: '`prisma migrate reset` and `db seed` both call the registered script.',
          cols: ['id', 'email'],
          rows: 1,
          code0: '{\n  "name": "api",\n  "scripts": {\n    "seed": "node seed.js"\n  }\n}',
          code1:
            '{\n  "name": "api",\n  "prisma": {\n    "seed": "tsx prisma/seed.ts"\n  }\n}',
          need: ['"prisma": {', '"seed": "tsx prisma/seed.ts"'],
          ban: ['"seed": "node seed.js"'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma05-challenge',
    title: 'Final Challenge — Deterministic Dev Reset',
    scenario: 'A development database must be completely reset and re-seeded in one command.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma05-hw-1',
          title: 'Deterministic Database Reset & Seed',
          description: 'Reset a development database, re-apply all migrations, and run seeding in one step.',
          instructions: ['Use `npx prisma migrate reset`', 'Add `--force` to skip interactive confirmation'],
          hint: '`npx prisma migrate reset --force` drops the schema, applies migrations, and executes the seed script.',
          scaffold: '-- The reset database with freshly seeded rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id IN (1, 2, 3);',
          why: 'migrate reset drops the database, runs all migrations, and invokes db seed automatically.',
          cols: ['id', 'email'],
          rows: 3,
          code0: 'const resetCmd = "npx prisma db push --force-reset";',
          code1: 'const resetCmd = "npx prisma migrate reset --force";',
          need: ['npx prisma migrate reset', '--force'],
          ban: ['db push'],
        }),
        type: 'challenge',
      },
    ],
  },
};
