import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 11 — Workflow Fundamentals (Init & Generate) (Phase 6: Workflow & CLI).
 *
 * Pedagogical Sequence:
 *   Concept 1: Project Setup — prisma init, datasource, and provider configuration
 *   Concept 2: Code Generation — npx prisma generate and @prisma/client synchronization
 *   Concept 3: Client Lifecycle & Connection Pooling — globalThis singleton and pool limits
 *   Challenge: Production Pooled Client Gateway
 */
export const Prisma_11_MODULE: ModuleData = {
  id: 'prisma-11',
  slug: 'workflow-fundamentals',
  day: 11,
  title: 'Day 11 — Workflow Fundamentals (Init & Generate)',
  shortTitle: 'Workflow & Generate',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-6',
  description:
    'Initialize Prisma toolchains, generate strongly typed Prisma Client definitions, and manage process connection pool lifecycles across development and serverless environments.',
  estimatedMinutes: 50,
  curriculumOrder: 11,
  displayLabel: 'Day 11',
  completionLearnings: [
    'Bootstrap Prisma in modern applications using prisma init with specified datasource providers',
    'Compile schema.prisma into type-safe @prisma/client artifacts using npx prisma generate',
    'Prevent database connection starvation during development hot-reloads using globalThis singleton caching',
    'Configure connection pool parameters, timeouts, and graceful shutdown handlers',
  ],
  concepts: [
    {
      id: 'project-setup',
      order: 1,
      title: 'Project Setup & Datasource Configuration',
      shortDescription: 'Initialize Prisma and configure environment-driven database connectivity.',
      theory: richPrismaTheory({
        summary:
          'Running `npx prisma init` bootstraps your application: it creates the `prisma/` folder containing `schema.prisma` and writes a `.env` file with a placeholder `DATABASE_URL`. The `datasource` block defines the database dialect (`postgresql`, `sqlite`, `mysql`) and reads credentials from environment variables to keep secrets out of source control.',
        takeaway:
          'prisma init bootstraps schema.prisma and .env; datasources load connection strings from environment variables.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode:
          '# Bootstrap a PostgreSQL-backed Prisma project:\nnpx prisma init --datasource-provider postgresql',
        heroLang: 'bash',
        heroWhy: 'Initializes the schema file and provisions database environment configuration.',
        mentalModel:
          '**The Declarative Toolchain Anchor.** `schema.prisma` is the single source of truth for both your database schema and your application data layer. Initializing with a specific provider tailors the starter schema types to match database engine capabilities.',
        littleDetails: {
          title: 'Project Setup Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never commit raw database credentials to Git',
              description: 'The `datasource` block should always read URLs via `env("DATABASE_URL")`. Store actual usernames and passwords strictly in `.env`, which is ignored by `.gitignore`.',
              badge: 'Security',
            },
            {
              ruleNumber: 2,
              title: 'One datasource block per schema',
              description: 'Prisma schemas permit exactly one `datasource db` block defining the target database provider and URL.',
              badge: 'Constraint',
            },
            {
              ruleNumber: 3,
              title: 'Datasource provider flag speeds up setup',
              description: 'Passing `--datasource-provider <sqlite|postgresql|mysql>` sets the engine provider immediately, eliminating manual editing of `schema.prisma`.',
              badge: 'CLI Flag',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Setup to Database Connections',
          mappings: [
            {
              prisma: 'datasource db { provider = "postgresql", url = env("DATABASE_URL") }',
              sql: 'postgres://user:password@localhost:5432/mydb?schema=public',
              note: 'Establishes standard TCP or pooled connection socket parameters.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I run prisma init?',
              answer: 'Once when setting up a new project or integrating Prisma into an existing application codebase.',
            },
            {
              questionNumber: 2,
              question: 'How do I switch from local SQLite to PostgreSQL?',
              answer: 'Change `provider = "postgresql"` in `schema.prisma` and point `DATABASE_URL` in `.env` to your PostgreSQL database.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Initialize Prisma in the workspace',
            codeSnippet: 'npx prisma init --datasource-provider postgresql',
            explanation: 'Creates prisma/schema.prisma and sets up initial .env configuration.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Configure datasource block in schema.prisma',
            codeSnippet: 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
            explanation: 'Connects Prisma CLI and client to the database specified by the environment variable.',
            visualData: {
              type: 'type_preview',
              title: 'Datasource Definition',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Define connection credentials in .env',
            codeSnippet: 'DATABASE_URL="postgresql://postgres:secret@localhost:5432/devdb"',
            explanation: 'Guarantees sensitive connection secrets remain decoupled from source control.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c1-t1',
          title: 'Bootstrap Toolchain: Initialize Prisma with PostgreSQL provider',
          description: 'Run the Prisma CLI command to initialize a new project with PostgreSQL configured.',
          instructions: [
            'Use `npx prisma init`',
            'Specify `--datasource-provider postgresql`',
          ],
          hintLadder: [
            'The Prisma CLI provides an init command to scaffold the schema directory and env file.',
            'Supply the --datasource-provider flag set to postgresql.',
            'Write: `const cmd = "npx prisma init --datasource-provider postgresql";`',
          ],
          scaffold: '-- Database connection established:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'prisma init creates the required configuration files.',
          cols: ['id'],
          rows: 1,
          code0: 'const cmd = "npx prisma";',
          code1: 'const cmd = "npx prisma init --datasource-provider postgresql";',
          need: ['npx prisma init', '--datasource-provider postgresql'],
        }),
        prismaSnippetTask({
          id: 'prisma11-c1-t2',
          title: 'Environment Wiring: Configure datasource with env("DATABASE_URL")',
          description: 'Define the datasource block in schema.prisma to load credentials from the environment.',
          instructions: [
            'Define `datasource db`',
            'Set `provider = "postgresql"`',
            'Set `url = env("DATABASE_URL")`',
          ],
          hintLadder: [
            'Datasources specify the database provider and connection string.',
            'Use env("DATABASE_URL") for secure environment variable resolution.',
            'Configure the block with provider and url properties.',
          ],
          scaffold: '-- Valid datasource configuration:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'Environment variables protect credentials across development and production.',
          cols: ['id'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}',
          code1: 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
          need: ['provider = "postgresql"', 'url      = env("DATABASE_URL")'],
        }),
      ],
    },
    {
      id: 'code-generation',
      order: 2,
      title: 'Compiling Types with npx prisma generate',
      shortDescription: 'Translate schema models into strongly typed client TypeScript definitions.',
      theory: richPrismaTheory({
        summary:
          '`npx prisma generate` reads `schema.prisma` and generates a customized, tailored TypeScript client inside `node_modules/@prisma/client`. Every time you add a model, rename a field, or change a relation in your schema, you must run `prisma generate` to update autocomplete types and runtime validation contracts.',
        takeaway:
          'prisma generate compiles schema.prisma into typed TypeScript definitions in @prisma/client.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode:
          '# Compile updated schema into @prisma/client:\nnpx prisma generate',
        heroLang: 'bash',
        heroWhy: 'Re-generates TypeScript types whenever schema.prisma changes.',
        mentalModel:
          '**Schema to Code Compilation.** Unlike generic ORMs that infer types at runtime through reflection or require manual TypeScript interfaces, Prisma uses compile-time code generation. The generator reads your models and emits exact TypeScript interfaces with full autocomplete.',
        littleDetails: {
          title: 'Code Generation Rules & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'Generate must run after schema updates',
              description: 'Editing `schema.prisma` does not automatically update TypeScript types. Run `npx prisma generate` or include it in `postinstall` scripts (`"postinstall": "prisma generate"`).',
              badge: 'Workflow',
            },
            {
              ruleNumber: 2,
              title: 'Default output is node_modules/@prisma/client',
              description: 'Unless customized with `output`, Prisma outputs generated code to `@prisma/client`, making it immediately importable everywhere in your project.',
              badge: 'Location',
            },
            {
              ruleNumber: 3,
              title: 'Generator block declares target client',
              description: 'The `generator client { provider = "prisma-client-js" }` block instructs the compiler which code generator to invoke.',
              badge: 'Configuration',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Generate to TypeScript Artifacts',
          mappings: [
            {
              prisma: 'model User { id Int @id, email String @unique }',
              sql: 'type User = { id: number; email: string };',
              note: 'Generates zero-cost TypeScript types and typed query methods.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why does TypeScript show red squigglies under new model fields?',
              answer: 'You modified `schema.prisma` but have not re-run `npx prisma generate`. Run generate to update the TypeScript client.',
            },
            {
              questionNumber: 2,
              question: 'How do CI/CD environments obtain generated types during build?',
              answer: 'Add `"postinstall": "prisma generate"` in `package.json` so `npm install` generates the client automatically.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define generator block in schema.prisma',
            codeSnippet: 'generator client {\n  provider = "prisma-client-js"\n}',
            explanation: 'Declares that Prisma should emit TypeScript client bindings.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Run generate via CLI',
            codeSnippet: 'npx prisma generate',
            explanation: 'Parses models and compiles type definitions into @prisma/client.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Import strongly typed client in application code',
            codeSnippet: 'import { PrismaClient } from "@prisma/client";\nconst prisma = new PrismaClient();',
            explanation: 'Provides end-to-end type safety and autocomplete on all queries.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c2-t1',
          title: 'Type Synchronization: Compile schema changes into @prisma/client',
          description: 'Execute the generate command to synchronize the Prisma Client with updated schema models.',
          instructions: [
            'Use `npx prisma generate`',
          ],
          hintLadder: [
            'Whenever schema.prisma is updated, the client code must be recompiled.',
            'Use the generate command of the Prisma CLI.',
            'Write: `const cmd = "npx prisma generate";`',
          ],
          scaffold: '-- Types compiled successfully:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'prisma generate compiles the schema into @prisma/client in node_modules.',
          cols: ['id'],
          rows: 1,
          code0: 'const cmd = "npx prisma compile";',
          code1: 'const cmd = "npx prisma generate";',
          need: ['npx prisma generate'],
          ban: ['compile'],
        }),
        prismaSnippetTask({
          id: 'prisma11-c2-t2',
          title: 'Generator Configuration: Declare client generator in schema.prisma',
          description: 'Configure the generator client block with prisma-client-js provider.',
          instructions: [
            'Declare `generator client`',
            'Set `provider = "prisma-client-js"`',
          ],
          hintLadder: [
            'The generator block tells Prisma to create JavaScript/TypeScript client code.',
            'Set provider to "prisma-client-js".',
            'Write the generator block in schema.prisma.',
          ],
          scaffold: '-- Valid generator configuration:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'The generator block directs code generation output.',
          cols: ['id'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'generator client {\n  provider = ""\n}',
          code1: 'generator client {\n  provider = "prisma-client-js"\n}',
          need: ['generator client', 'provider = "prisma-client-js"'],
        }),
      ],
    },
    {
      id: 'client-lifecycle',
      order: 3,
      title: 'Client Lifecycle & Connection Pooling',
      shortDescription: 'Manage connection pool sockets and prevent hot-reload exhaustion.',
      theory: richPrismaTheory({
        summary:
          'Every `new PrismaClient()` creates an internal connection pool with dedicated database sockets. In development frameworks with Hot Module Reloading (Next.js, Vite, Remix), file saves re-evaluate modules and instantiate new clients, exhausting database connection limits in seconds. Caching the client on `globalThis` in development prevents connection leaks.',
        takeaway:
          'Cache PrismaClient on globalThis in development to reuse connection pools across hot reloads.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode:
          'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();\nif (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;',
        heroLang: 'typescript',
        heroWhy: 'Ensures exactly one connection pool exists per Node process during development.',
        mentalModel:
          '**One Process, One Pool.** A database connection is an expensive, stateful TCP socket. In production, Node processes run continuously with a stable singleton client. In local dev, HMR resets module-level variables on every edit unless anchored to `globalThis`.',
        littleDetails: {
          title: 'Client Lifecycle Rules & Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never instantiate new PrismaClient() inside request handlers',
              description: 'Creating a client per HTTP request rapidly exhausts database socket limits. Always export a shared singleton instance.',
              badge: 'Architecture',
            },
            {
              ruleNumber: 2,
              title: 'globalThis caching belongs only outside production',
              description: 'In production, process isolation guarantees clean state. Wrap `globalThis` assignment with `if (process.env.NODE_ENV !== "production")`.',
              badge: 'Environment',
            },
            {
              ruleNumber: 3,
              title: 'Serverless pooling parameters',
              description: 'When running on Vercel or AWS Lambda, append `?connection_limit=1` to the database URL or use PgBouncer / Driver Adapters to prevent socket exhaustion.',
              badge: 'Serverless',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Client to Database Socket Pools',
          mappings: [
            {
              prisma: 'new PrismaClient({ datasources: { db: { url } } })',
              sql: '-- Allocates connection pool (default: num_cpus * 2 + 1 sockets)',
              note: 'Pool sockets are maintained and reused across queries.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why do I see "Too many connections" errors during development?',
              answer: 'Hot module reloading creates a new PrismaClient on every save. Anchor the client to `globalThis` to reuse the existing connection pool.',
            },
            {
              questionNumber: 2,
              question: 'Do I need to call prisma.$disconnect() in normal server apps?',
              answer: 'No. Prisma manages pooling automatically. Only call `$disconnect()` in CLI scripts or process exit handlers (`SIGTERM`, `beforeExit`).',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Check globalThis for existing client instance',
            codeSnippet: 'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();',
            explanation: 'Reuses existing client if present; initializes only on first process boot.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Cache instance outside production',
            codeSnippet: 'if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;',
            explanation: 'Saves instance to globalThis so subsequent HMR evaluations reuse the socket pool.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Configure connection pool limits on datasource URL',
            codeSnippet: 'const url = new URL(databaseUrl);\nurl.searchParams.set("connection_limit", "5");',
            explanation: 'Restricts total simultaneous TCP connections to avoid overwhelming the database.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c3-t1',
          title: 'HMR Protection: Implement globalThis PrismaClient singleton',
          description: 'Ensure development hot-reloads reuse a single PrismaClient instance across file saves.',
          instructions: [
            'Reuse `globalForPrisma.prisma` if defined, else create `new PrismaClient()`',
            'Store client back onto `globalForPrisma.prisma` when `NODE_ENV !== "production"`',
          ],
          hintLadder: [
            'Hot module reloading creates a new client per file change unless anchored to globalThis.',
            'Export prisma assigned to globalForPrisma.prisma ?? new PrismaClient().',
            'Guard caching with if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;',
          ],
          scaffold: '-- Single pooled client serves queries:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'The global singleton prevents database socket exhaustion during development.',
          cols: ['id'],
          rows: 1,
          code0:
            'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const prisma = new PrismaClient();',
          code1:
            'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();\nif (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;',
          need: ['globalForPrisma.prisma ?? new PrismaClient()', 'process.env.NODE_ENV !== "production"'],
          behavioralGrader: 'day6-singleton',
        }),
        prismaSnippetTask({
          id: 'prisma11-c3-t2',
          title: 'Pool Parameterization: Configure connection pool limits on client',
          description: 'Construct a pooled client with connection_limit=5 and pool_timeout=10 URL parameters.',
          instructions: [
            'Parse databaseUrl with `new URL(databaseUrl)`',
            'Set `connection_limit` to "5"',
            'Set `pool_timeout` to "10"',
            'Pass modified URL to `datasources.db.url` in `new PrismaClient`',
          ],
          hintLadder: [
            'Use URL search parameters to tune pool size and timeout.',
            'Set connection_limit to "5" and pool_timeout to "10".',
            'Return new PrismaClient with the configured datasource url.',
          ],
          scaffold: '-- Pooled client connection parameters active:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'Tuning pool parameters optimizes throughput and prevents connection spikes.',
          cols: ['id'],
          rows: 1,
          code0:
            'export function createPooledClient(databaseUrl: string) {\n  return new PrismaClient();\n}',
          code1:
            'export function createPooledClient(databaseUrl: string) {\n  const url = new URL(databaseUrl);\n  url.searchParams.set("connection_limit", "5");\n  url.searchParams.set("pool_timeout", "10");\n  return new PrismaClient({\n    datasources: { db: { url: url.toString() } },\n  });\n}',
          need: ['connection_limit', 'pool_timeout', 'new PrismaClient'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma11-challenge',
    title: 'Final Challenge — Production Client Gateway',
    scenario: 'Build a production client factory with logging, connection limits, and timeout protection.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma11-hw-1',
          title: 'Production Gateway: Implement pooled client factory with logging',
          description:
            'Create a factory function that sets connection_limit=5, pool_timeout=10, and enables query logging.',
          instructions: [
            'Set `connection_limit` to 5 and `pool_timeout` to 10 on the URL',
            'Instantiate `new PrismaClient` with configured datasource URL',
            'Enable `log: ["query", "error"]`',
          ],
          hintLadder: [
            'Production gateways require bounded connection limits and observability logging.',
            'Configure URL search params with connection_limit and pool_timeout.',
            'Return new PrismaClient with datasources and log options.',
          ],
          fromScratch: true,
          scaffold: '-- Production gateway configured:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'The gateway bounds connection usage and enables database observability.',
          cols: ['id'],
          rows: 1,
          code0:
            'import { PrismaClient } from "@prisma/client";\nexport function createPooledClient(databaseUrl: string) {\n  // Build pooled client with logging from scratch:\n\n}',
          code1:
            'import { PrismaClient } from "@prisma/client";\nexport function createPooledClient(databaseUrl: string) {\n  const url = new URL(databaseUrl);\n  url.searchParams.set("connection_limit", "5");\n  url.searchParams.set("pool_timeout", "10");\n  return new PrismaClient({\n    datasources: { db: { url: url.toString() } },\n    log: ["query", "error"],\n  });\n}',
          need: ['connection_limit', 'pool_timeout', 'log:', 'new PrismaClient'],
          behavioralGrader: 'day6-singleton',
        }),
        type: 'challenge',
      },
    ],
  },
};
