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
          title: 'Transition from prototyping to versioned history: Can you create your first migration?',
          description: 'Create a named migration from the current schema, transitioning from rapid prototyping to versioned migrations.',
          instructions: [
            'Transition from rapid prototyping to versioned migrations',
            'Use `npx prisma migrate dev` with `--name init_users`',
          ],
          hintLadder: [
            'Versioned migrations preserve an auditable ledger of database structure changes in version control.',
            'Call migrate dev with the name parameter specifying a descriptive migration identifier.',
            'Set the CLI string: const cmd = "/* invoke migrate dev with --name flag */";',
          ],
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
          title: 'A production server has pending migrations: Can you safely apply them?',
          description: 'Apply committed migrations to production without authoring new ones.',
          instructions: ['Use `migrate deploy`', 'Never author migrations in production'],
          hintLadder: [
            'Production and CI environments must apply only pre-committed migration files without calculating diffs or prompting.',
            'Use the migrate deploy command to execute pending migration files against the target database.',
            'Set the deploy command: const cmd = "/* invoke migrate deploy with npx */";',
          ],
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
      id: 'seed-pipeline',
      order: 2,
      title: 'Configuring the Database Seed Pipeline',
      shortDescription: 'Wire prisma/seed.ts into package.json and run deterministic baseline seeds.',
      theory: richPrismaTheory({
        summary:
          'A development seed script populates baseline records so team members and CI environments start with predictable test data. In Prisma, seed scripts live in `prisma/seed.ts` and are registered in `package.json` under `"prisma": { "seed": "tsx prisma/seed.ts" }`. Running `npx prisma db seed` or `npx prisma migrate reset` executes the script automatically.',
        takeaway:
          'Register prisma/seed.ts in package.json to automate baseline database seeding.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          '// prisma/seed.ts\nawait prisma.user.deleteMany();\nawait prisma.user.create({\n  data: { email: "alex@prisma.io", name: "Alex" },\n});',
        heroLang: 'typescript',
        heroWhy: 'A baseline seed clears stale data and populates predictable initial records.',
        mentalModel:
          '**The Seed Pipeline Workflow.** Instead of manually inserting test records through a GUI, Prisma automates seeding through your project configuration. The script `prisma/seed.ts` executes baseline insertions. By registering `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json`, any developer running `npx prisma db seed` or `npx prisma migrate reset` receives a freshly seeded database automatically.',
        littleDetails: {
          title: 'Seeding Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Seed scripts live in prisma/seed.ts',
              description: 'The standard convention in modern TypeScript projects is storing your seed logic at `prisma/seed.ts`, executed via `tsx` or `ts-node`.',
              badge: 'Convention',
            },
            {
              ruleNumber: 2,
              title: 'Register the seed command in package.json',
              description: 'The Prisma CLI discovers seed scripts via `"prisma": { "seed": "tsx prisma/seed.ts" }` inside your `package.json`. When configured, `npx prisma db seed` and `npx prisma migrate reset` trigger it automatically.',
              badge: 'CLI Tooling',
            },
            {
              ruleNumber: 3,
              title: 'Clear stale records before baseline inserts',
              description: 'In initial development seed scripts, clearing previous runs with `deleteMany()` ensures sequential inserts do not crash with unique constraint conflicts.',
              badge: 'Clean State',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Seeding to CLI Commands',
          mappings: [
            {
              prisma: 'npx prisma db seed',
              sql: 'npm/npx runner executing prisma/seed.ts',
              note: 'Executes the seed command registered in package.json',
            },
            {
              prisma: 'prisma.user.deleteMany() -> prisma.user.create()',
              sql: 'DELETE FROM users; INSERT INTO users ...',
              note: 'Clears stale rows and inserts baseline records sequentially',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'How does the Prisma CLI know how to run our TypeScript seed script?',
              answer: 'Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json`. The CLI invokes this command whenever seeding is needed.',
            },
            {
              questionNumber: 2,
              question: 'When is the seed script executed automatically?',
              answer: 'Whenever `npx prisma migrate reset` is run (or manually via `npx prisma db seed`).',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Author baseline seed logic in prisma/seed.ts',
            codeSnippet: "await prisma.user.deleteMany();\nawait prisma.user.create({\n  data: { email: 'alex@prisma.io', name: 'Alex' },\n});",
            explanation: 'The script clears existing state and inserts the required baseline entities.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Register the script in package.json',
            codeSnippet: '"prisma": {\n  "seed": "tsx prisma/seed.ts"\n}',
            explanation: 'Tells the Prisma CLI toolchain which runtime command executes your seed.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Execute the seed pipeline via CLI',
            codeSnippet: 'npx prisma db seed',
            explanation: 'The CLI discovers the configuration, runs the script, and populates the database.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c2-t1',
          title: 'The development database is empty: Can you create a repeatable seed script?',
          description: 'Ensure baseline seeding clears stale records and inserts initial users without colliding on existing data.',
          instructions: [
            'Clear existing rows using `await prisma.user.deleteMany()`',
            'Insert the baseline user with `await prisma.user.create`',
          ],
          hintLadder: [
            'Baseline seeds must run cleanly without crashing on unique constraints across repeated executions.',
            'Delete existing rows before inserting fresh baseline records with create.',
            'Wipe before creating: await prisma.user.deleteMany(); return await prisma.user.create({ data: /* baseline data */ });',
          ],
          scaffold: '-- Seed rows survive clean pipeline runs:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Clearing stale state before sequential creation guarantees reproducible baseline seeds.',
          cols: ['id', 'email'],
          rows: 1,
          demoVariables: { email: 'mina@prisma.io', name: 'Mina' },
          code0:
            'export async function seedBaselineUsers(email: string, name: string) {\n  // Bug: running create without clearing throws duplicate key errors on subsequent runs!\n  return await prisma.user.create({\n    data: { email, name },\n  });\n}',
          code1:
            'export async function seedBaselineUsers(email: string, name: string) {\n  await prisma.user.deleteMany();\n  return await prisma.user.create({\n    data: { email, name },\n  });\n}',
          need: ['prisma.user.deleteMany()', 'prisma.user.create({'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c2-t2',
          title: 'Prisma needs a seed entry point: Can you wire up the seed command in package.json?',
          description: 'Tell the Prisma CLI which command seeds a fresh database.',
          instructions: ['Add a `prisma` block to package.json', 'Point `seed` at tsx prisma/seed.ts'],
          hintLadder: [
            'Prisma CLI discovers how to execute seed scripts via configuration keys in package.json.',
            'Add a prisma top-level block with a seed script property executing tsx.',
            'Configure the JSON block stopping 1 step short: { "name": "api", "prisma": { "seed": "/* command running tsx prisma/seed.ts */" } }',
          ],
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
          title: 'Reset the development database and recreate the exact same dataset every time',
          description: 'Reset a development database, re-apply all migrations, and run seeding in one step.',
          instructions: ['Use `npx prisma migrate reset`', 'Add `--force` to skip interactive confirmation'],
          hintLadder: [
            'A clean development reset drops all tables, replays every migration file from scratch, and triggers the registered seed runner.',
            'Use the Prisma CLI migrate reset command along with the non-interactive confirmation flag.',
            'Supply the command string: const resetCmd = "npx prisma migrate reset /* add non-interactive flag */";',
          ],
          fromScratch: true,
          scaffold: '-- The reset database with freshly seeded rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id IN (1, 2, 3);',
          why: 'migrate reset drops the database, runs all migrations, and invokes db seed automatically.',
          cols: ['id', 'email'],
          rows: 3,
          code0: 'const resetCmd = "";',
          code1: 'const resetCmd = "npx prisma migrate reset --force";',
          need: ['npx prisma migrate reset', '--force'],
          ban: ['db push'],
        }),
        type: 'challenge',
      },
    ],
  },
};
