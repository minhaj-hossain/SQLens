import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 12 — Database Evolution & Seeding (Phase 6: Workflow & CLI).
 *
 * Pedagogical Sequence:
 *   Concept 1: The Prisma Migrate Workflow — db push vs migrate dev vs migrate deploy
 *   Concept 2: Migration Ledger & Development Resets — _prisma_migrations and migrate reset
 *   Concept 3: Programmatic Seed Pipelines — prisma/seed.ts and package.json configuration
 *   Challenge: Deterministic Dev Reset & Automation
 */
export const Prisma_12_MODULE: ModuleData = {
  id: 'prisma-12',
  slug: 'migrations-and-seeding',
  day: 12,
  title: 'Day 12 — Database Evolution & Seeding',
  shortTitle: 'Migrations & Seeding',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-6',
  description:
    'Evolve databases across team environments using versioned SQL migrations, shadow databases, production deployment commands, and programmatic seed scripts.',
  estimatedMinutes: 50,
  curriculumOrder: 12,
  displayLabel: 'Day 12',
  completionLearnings: [
    'Choose between disposable prototyping with db push and versioned team migrations with migrate dev',
    'Execute pre-committed migration files safely in CI/CD using prisma migrate deploy',
    'Track migration checksums and history via the _prisma_migrations ledger table',
    'Write reproducible, idempotent database seed scripts using prisma/seed.ts',
  ],
  concepts: [
    {
      id: 'migrate-workflow',
      order: 1,
      title: 'The Prisma Migrate Workflow — Prototyping vs Versioning',
      shortDescription: '`db push` for rapid spikes; `migrate dev` for versioned team migrations.',
      theory: richPrismaTheory({
        summary:
          'Prisma provides two primary workflows to synchronize your schema with the database: `prisma db push` syncs changes directly without writing migration files (ideal for rapid local prototyping). `prisma migrate dev` detects schema deltas using a shadow database, generates versioned SQL migration files stored in source control, and tracks execution in the `_prisma_migrations` table. Production environments strictly execute committed migrations with `prisma migrate deploy`.',
        takeaway:
          'Use db push to prototype; migrate dev to commit migrations; migrate deploy in production.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
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
          title: 'Prisma Migrate to SQL DDL Scripts',
          mappings: [
            {
              prisma: 'npx prisma migrate dev --name init_users',
              sql: 'CREATE TABLE users (id SERIAL PRIMARY KEY, ...); INSERT INTO _prisma_migrations ...;',
              note: 'Emits versioned migration.sql and records checksum in ledger.',
            },
            {
              prisma: 'npx prisma migrate deploy',
              sql: '-- Replays pending migration.sql files without interactive prompts',
              note: 'Deterministic execution in deployment pipelines.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I run db push vs migrate dev?',
              answer: 'Use `db push` for quick personal prototyping where table drops do not matter. Use `migrate dev` as soon as code will be shared with others or deployed.',
            },
            {
              questionNumber: 2,
              question: 'How do production deployments apply migrations?',
              answer: 'Run `npx prisma migrate deploy` in your build or release phase before restarting server containers.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Modify schema.prisma with new models or fields',
            codeSnippet: 'model Post {\n  id    Int    @id @default(autoincrement())\n  title String\n}',
            explanation: 'Update your declarative schema definition.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Generate versioned migration file via CLI',
            codeSnippet: 'npx prisma migrate dev --name add_post_model',
            explanation: 'Computes diff using shadow database, writes prisma/migrations/.../migration.sql, and applies it.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Deploy committed migrations to production',
            codeSnippet: 'npx prisma migrate deploy',
            explanation: 'Executes pending migration files idempotently in CI/CD.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma12-c1-t1',
          title: 'Versioned Migration: Generate tracked SQL migration with migrate dev',
          description: 'Run the Prisma CLI command to create a named migration for new user tables.',
          instructions: [
            'Use `npx prisma migrate dev`',
            'Provide the `--name` flag set to `init_users`',
          ],
          hintLadder: [
            'The migrate dev command detects schema deltas, creates SQL files, and executes them against your development database.',
            'Include the --name parameter with init_users.',
            'Write: `const cmd = "npx prisma migrate dev --name init_users";`',
          ],
          scaffold: '-- Table created by migration:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A named migration generates a reviewable SQL file and updates the ledger.',
          cols: ['id', 'name'],
          rows: 1,
          code0: 'const cmd = "npx prisma db push";',
          code1: 'const cmd = "npx prisma migrate dev --name init_users";',
          need: ['npx prisma migrate dev', '--name'],
          ban: ['db push'],
        }),
        prismaSnippetTask({
          id: 'prisma12-c1-t2',
          title: 'Production Deployment: Apply pending migrations with migrate deploy',
          description: 'Apply committed migrations safely in production without authoring new diffs.',
          instructions: [
            'Use `npx prisma migrate deploy`',
            'Do NOT use `migrate dev` in production',
          ],
          hintLadder: [
            'Production pipelines must apply pre-committed migration files without shadow databases or prompts.',
            'Use the migrate deploy command.',
            'Write: `const cmd = "npx prisma migrate deploy";`',
          ],
          scaffold: '-- Production migration applied:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'mina@prisma.io';",
          why: 'migrate deploy is idempotent and safe for automated deployment pipelines.',
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
      id: 'migration-ledger-resets',
      order: 2,
      title: 'Migration Ledger & Development Resets',
      shortDescription: 'Inspect _prisma_migrations and reset development state cleanly.',
      theory: richPrismaTheory({
        summary:
          'Prisma tracks every applied migration in the `_prisma_migrations` table, recording migration names, checksum hashes, and timestamps. When local schemas diverge significantly or developers switch branches with conflicting histories, `npx prisma migrate reset` drops the development database, replays all migrations from scratch, and triggers seeding.',
        takeaway:
          'migrate reset drops the dev database, replays migrations, and runs seeding automatically.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode:
          '# Reset development database non-interactively:\nnpx prisma migrate reset --force',
        heroLang: 'bash',
        heroWhy: 'Recreates the database from migration history and executes the seed runner.',
        mentalModel:
          '**Zero-Downtime Determinism.** When drift occurs (e.g. manual SQL edits or git branch switching), attempting to fix differences manually leads to elusive bugs. A clean `migrate reset` guarantees your environment matches the canonical source of truth in `prisma/migrations/`.',
        littleDetails: {
          title: 'Reset & Ledger Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: '--force bypasses interactive prompts',
              description: 'In automated scripts and CI pipelines, append `--force` to `npx prisma migrate reset` to avoid blocking on confirmation prompts.',
              badge: 'Automation',
            },
            {
              ruleNumber: 2,
              title: 'Reset triggers db seed automatically',
              description: 'After replaying all migrations, `migrate reset` automatically triggers the seed script registered in `package.json`.',
              badge: 'Seeding',
            },
            {
              ruleNumber: 3,
              title: 'Never run migrate reset in production',
              description: '`migrate reset` drops the entire database. It is strictly disabled on production connection strings to prevent catastrophic data loss.',
              badge: 'Caution',
            },
          ],
        },
        sqlBridge: {
          title: 'Migration Reset to SQL Actions',
          mappings: [
            {
              prisma: 'npx prisma migrate reset --force',
              sql: 'DROP SCHEMA public CASCADE; CREATE SCHEMA public; ...',
              note: 'Drops all tables, reapplies migration files, and executes seed.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use migrate reset?',
              answer: 'When switching branches with incompatible migration histories or when you need a pristine database to test features.',
            },
            {
              questionNumber: 2,
              question: 'What does migrate reset do under the hood?',
              answer: 'Drops the schema/database, replays all migrations in sequence, and runs `prisma db seed`.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Detect migration drift or conflict',
            codeSnippet: 'npx prisma migrate status',
            explanation: 'Checks if applied database state matches migration files on disk.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Execute development reset',
            codeSnippet: 'npx prisma migrate reset --force',
            explanation: 'Drops database, replays all migrations, and invokes the seed runner.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Verify restored baseline state',
            codeSnippet: 'SELECT id, email FROM users;',
            explanation: 'Confirms all baseline seeded entities are present.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma12-c2-t1',
          title: 'Drift Inspection: Check migration status with prisma migrate status',
          description: 'Inspect migration ledger status to verify all migrations are applied without drift.',
          instructions: [
            'Use `npx prisma migrate status`',
          ],
          hintLadder: [
            'The migrate status command inspects _prisma_migrations and compares with local migration files.',
            'Check ledger synchronization before applying new migrations.',
            'Write: `const cmd = "npx prisma migrate status";`',
          ],
          scaffold: '-- Migration status verified:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'migrate status reveals unapplied migrations and checksum drifts.',
          cols: ['id'],
          rows: 1,
          code0: 'const cmd = "npx prisma migrate";',
          code1: 'const cmd = "npx prisma migrate status";',
          need: ['npx prisma migrate status'],
        }),
        prismaSnippetTask({
          id: 'prisma12-c2-t2',
          title: 'Clean Dev Reset: Reset development database non-interactively',
          description: 'Reset a development database, re-apply all migrations, and run seeding with --force.',
          instructions: [
            'Use `npx prisma migrate reset`',
            'Include the `--force` flag',
          ],
          hintLadder: [
            'Use migrate reset to recreate the database from scratch.',
            'Append --force to bypass confirmation prompts.',
            'Write: `const cmd = "npx prisma migrate reset --force";`',
          ],
          scaffold: '-- Database freshly reset and re-seeded:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'migrate reset drops the database, runs migrations, and triggers seeding.',
          cols: ['id'],
          rows: 1,
          code0: 'const cmd = "npx prisma db push --force-reset";',
          code1: 'const cmd = "npx prisma migrate reset --force";',
          need: ['npx prisma migrate reset', '--force'],
          ban: ['db push'],
        }),
      ],
    },
    {
      id: 'seed-pipeline',
      order: 3,
      title: 'Configuring the Database Seed Pipeline',
      shortDescription: 'Author prisma/seed.ts and wire it into package.json for automated seeding.',
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
          '**The Automated Seed Contract.** Instead of manually inserting test records through a GUI, Prisma automates seeding through your project configuration. The script `prisma/seed.ts` executes baseline insertions. By registering `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json`, any developer running `npx prisma db seed` or `npx prisma migrate reset` receives a freshly seeded database automatically.',
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
              badge: 'Tooling',
            },
            {
              ruleNumber: 3,
              title: 'Clear stale records before baseline inserts',
              description: 'In initial development seed scripts, clearing previous runs with `deleteMany()` ensures sequential inserts do not crash with unique constraint conflicts.',
              badge: 'Idempotency',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Seeding to CLI Commands',
          mappings: [
            {
              prisma: 'npx prisma db seed',
              sql: 'npm/npx runner executing prisma/seed.ts',
              note: 'Executes the seed command registered in package.json.',
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
          id: 'prisma12-c3-t1',
          title: 'Repeatable Seed: Author seed script with clean wipe and creation',
          description: 'Ensure baseline seeding clears stale records and inserts initial users without colliding on existing data.',
          instructions: [
            'Clear existing rows using `await prisma.user.deleteMany()`',
            'Insert the baseline user with `await prisma.user.create`',
          ],
          hintLadder: [
            'Baseline seeds must run cleanly without crashing on unique constraints across repeated executions.',
            'Delete existing rows before inserting fresh baseline records with create.',
            'Write: await prisma.user.deleteMany(); return await prisma.user.create({ data: { email, name } });',
          ],
          scaffold: '-- Seed rows survive clean pipeline runs:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Clearing stale state before sequential creation guarantees reproducible baseline seeds.',
          cols: ['id', 'email'],
          rows: 1,
          demoVariables: { email: 'mina@prisma.io', name: 'Mina' },
          code0:
            'export async function seedBaselineUsers(email: string, name: string) {\n  // Bug: running create without clearing throws duplicate key errors!\n  return await prisma.user.create({\n    data: { email, name },\n  });\n}',
          code1:
            'export async function seedBaselineUsers(email: string, name: string) {\n  await prisma.user.deleteMany();\n  return await prisma.user.create({\n    data: { email, name },\n  });\n}',
          need: ['prisma.user.deleteMany()', 'prisma.user.create({'],
        }),
        prismaSnippetTask({
          id: 'prisma12-c3-t2',
          title: 'CLI Configuration: Register prisma/seed.ts entry point in package.json',
          description: 'Configure package.json to instruct the Prisma CLI how to run tsx prisma/seed.ts.',
          instructions: [
            'Add a top-level `"prisma"` block to package.json',
            'Point `"seed"` at `"tsx prisma/seed.ts"`',
          ],
          hintLadder: [
            'Prisma CLI discovers how to execute seed scripts via configuration keys in package.json.',
            'Add a prisma block with a seed script property executing tsx.',
            'Configure: { "prisma": { "seed": "tsx prisma/seed.ts" } }',
          ],
          scaffold: '-- Seeded rows readable straight away:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'prisma migrate reset and db seed both invoke the registered script.',
          cols: ['id', 'email'],
          rows: 1,
          code0: '{\n  "name": "api",\n  "scripts": {\n    "seed": "node seed.js"\n  }\n}',
          code1: '{\n  "name": "api",\n  "prisma": {\n    "seed": "tsx prisma/seed.ts"\n  }\n}',
          need: ['"prisma": {', '"seed": "tsx prisma/seed.ts"'],
          ban: ['"seed": "node seed.js"'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma12-challenge',
    title: 'Final Challenge — Deterministic Dev Reset',
    scenario: 'A development database must be completely reset and re-seeded in one command.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma12-hw-1',
          title: 'Deterministic Dev Reset: Reset development database and re-seed from scratch',
          description: 'Reset a development database, re-apply all migrations, and run seeding in one non-interactive step.',
          instructions: ['Use `npx prisma migrate reset`', 'Add `--force` to skip interactive confirmation'],
          hintLadder: [
            'A clean development reset drops all tables, replays every migration file, and triggers the registered seed runner.',
            'Use the Prisma CLI migrate reset command along with the non-interactive confirmation flag.',
            'Write: `const resetCmd = "npx prisma migrate reset --force";`',
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
