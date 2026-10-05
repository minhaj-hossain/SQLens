import type { ModuleData } from '../../../types/curriculum';
import { prismaSnippetTask, prismaTheory, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 6 — PrismaClient Lifecycle & Connections. */
export const Prisma_06_MODULE: ModuleData = {
  id: 'prisma-06',
  slug: 'client-lifecycle-connections',
  day: 6,
  title: 'Day 6 — PrismaClient Lifecycle & Connections',
  shortTitle: 'Client Lifecycle',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-2',
  description: 'Keep one PrismaClient per process, log the queries you cannot see, and shut down cleanly.',
  estimatedMinutes: 45,
  curriculumOrder: 6,
  displayLabel: 'Day 6',
  completionLearnings: [
    'Explain why hot reload must not create a client per reload',
    'Cache the client on globalThis in development',
    'Turn on query logging to see real SQL',
    'Disconnect before the process exits',
  ],
  concepts: [
    {
      id: 'singleton-pattern',
      order: 1,
      title: 'The Global PrismaClient Singleton',
      shortDescription: 'One client per process — cached across hot reloads.',
      theory: richPrismaTheory({
        summary:
          'Every PrismaClient owns an internal database connection pool. A development server that reloads on file save (Next.js, Vite, Fastify) builds a new pool per reload until the database rejects new connections. Caching the client on `globalThis` outside production reuses a single connection pool across hot reloads.\n\n**Serverless & Edge Architectures:** In ephemeral serverless environments (Next.js, Vercel, AWS Lambda), hundreds of concurrent function instances can easily overwhelm database connection limits. Production deployments solve this using: (1) External connection poolers like PgBouncer with `?pgbouncer=true&connection_limit=1` to disable prepared statement caching and limit per-lambda connections, or (2) Driver Adapters (`@prisma/adapter-pg`, `@prisma/adapter-neon`) and Prisma Accelerate that route queries over HTTP/WebSockets rather than persistent TCP sockets.',
        takeaway:
          'One client per process in dev (globalThis.prisma); use connection_limit=1 with PgBouncer or Driver Adapters in serverless.',
        sql: 'SELECT id, name\nFROM users\nWHERE id = 1;',
        heroCode:
          'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();\nif (process.env.NODE_ENV !== \'production\') globalForPrisma.prisma = prisma;',
        heroLang: 'typescript',
        heroWhy: 'PgBouncer parameters and globalThis caching prevent connection pool exhaustion.',
        mentalModel:
          '**One pool per runtime process.** A PrismaClient manages physical TCP sockets in an internal pool. In dev, module reloads instantiate multiple clients unless pinned to `globalThis`. In serverless, concurrency scales horizontally, requiring PgBouncer (?pgbouncer=true&connection_limit=1) or Driver Adapters to prevent socket exhaustion.',
        explanation: [
          'Every `new PrismaClient()` opens a dedicated pool of database connections.',
          'Hot reloading without caching re-executes module code, leaking previous pools.',
          'In serverless lambdas, limit connections with PgBouncer or route via HTTP Driver Adapters.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'PrismaClient Connection Pool Lifecycle',
            codeSnippet:
              'type PrismaClientLifecycle = {\n  $connect(): Promise<void>;\n  $disconnect(): Promise<void>;\n  // Manages internal pool of TCP socket connections\n};',
            explanation:
              'Instantiating `new PrismaClient()` initializes connection pool state. Multiple instances consume database connection slots rapidly.',
            visualData: {
              type: 'type_preview',
              title: 'Client Connection Pool State',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Global Cache for Hot Module Reloading',
            codeSnippet: 'SELECT id, name\nFROM users\nWHERE id = 1;',
            explanation:
              '`globalThis.prisma` ensures every hot-reloaded route handler or server component reuses the same connection pool socket rather than exhausting the database.',
            visualData: {
              type: 'sql_lens',
              title: 'Pooled Query Execution',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Serverless Scaling with PgBouncer & Driver Adapters',
            codeSnippet:
              'type ServerlessDbConfig = {\n  url: "postgres://user:pass@pooler:6543/db?pgbouncer=true&connection_limit=1";\n  adapter?: "@prisma/adapter-pg" | "@prisma/adapter-neon";\n};',
            explanation:
              'Serverless lambdas scale out horizontally. `pgbouncer=true` disables prepared statements, `connection_limit=1` caps pool size per lambda, and driver adapters route queries over HTTP/WebSockets.',
            visualData: {
              type: 'type_preview',
              title: 'Serverless Pool Architecture',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c1-t1',
          title: 'Stop creating a client per reload',
          description: 'The current module builds a brand-new client on every reload.',
          instructions: ['Read the cached client from `globalThis`', 'Fall back to `new PrismaClient()`'],
          hint: '`globalForPrisma.prisma ?? new PrismaClient()`.',
          scaffold: '-- Pooled reads still hit the same rows:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A cached client reuses one connection pool instead of leaking many.',
          cols: ['id', 'name'],
          rows: 1,
          code0: 'export const prisma = new PrismaClient();',
          code1:
            'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\n\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();',
          need: ['globalThis', '?? new PrismaClient()'],
        }),
        prismaSnippetTask({
          id: 'prisma06-c1-t2',
          title: 'Cache it in development only',
          description: 'Production must keep a single module-scoped instance.',
          instructions: ['Write the client back to `globalThis`', 'Guard with `NODE_ENV`'],
          hint: '`if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;`',
          scaffold: '-- Production reads behave identically:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'mina@prisma.io';",
          why: 'The cache exists to serve hot reload, not to change production behaviour.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\n\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();\n\nglobalForPrisma.prisma = prisma;',
          code1:
            'const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\n\nexport const prisma = globalForPrisma.prisma ?? new PrismaClient();\n\nif (process.env.NODE_ENV !== \'production\') globalForPrisma.prisma = prisma;',
          need: ["NODE_ENV !== 'production'", 'globalForPrisma.prisma = prisma'],
        }),
      ],
    },
    {
      id: 'query-logging-disconnect',
      order: 2,
      title: 'Query Logging & Graceful Shutdown',
      shortDescription: '`log: [...]` shows the generated SQL; `$disconnect` releases the pool.',
      theory: prismaTheory(
        'The SQL Lens is authored — the log config is how you see it live. `log: [\'query\']` prints every statement Prisma sends, and `$disconnect()` closes the pool so a script can exit.',
        'Turn on query logging to see real SQL; disconnect before exit.',
        "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        "const prisma = new PrismaClient({ log: ['query', 'warn', 'error'] });\n\nprocess.on('beforeExit', async () => {\n  await prisma.$disconnect();\n});",
        'typescript',
        'The log array is your only window into the SQL Prisma actually sends.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c2-t1',
          title: 'Log every query',
          description: 'Print the SQL Prisma sends and keep warnings visible.',
          instructions: ["Add `log: ['query', 'warn', 'error']`"],
          hint: "`new PrismaClient({ log: ['query', 'warn', 'error'] })`.",
          scaffold: '-- The statement the log will print:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 2;',
          why: 'The query log is the ground truth behind the authored SQL lens.',
          cols: ['id', 'email'],
          rows: 1,
          code0: 'export const prisma = new PrismaClient();',
          code1: "export const prisma = new PrismaClient({ log: ['query', 'warn', 'error'] });",
          need: ["log: ['query'", "'error'"],
        }),
        prismaSnippetTask({
          id: 'prisma06-c2-t2',
          title: 'Disconnect before exit',
          description: 'A script that never disconnects hangs with open connections.',
          instructions: ['Listen for `beforeExit`', 'Call `$disconnect()`'],
          hint: "`process.on('beforeExit', async () => { await prisma.$disconnect(); });`",
          scaffold: '-- Reads complete, then the pool is released:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Disconnecting returns connections to the pool before the process dies.',
          cols: ['id', 'email'],
          rows: 1,
          code0: "process.on('beforeExit', async () => {\n  console.log('bye');\n});",
          code1: "process.on('beforeExit', async () => {\n  await prisma.$disconnect();\n});",
          need: ['prisma.$disconnect()', 'beforeExit'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma06-challenge',
    title: 'Final Challenge — Enterprise Database Gateway',
    scenario: 'A long-lived service that shares one client and closes it politely.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma06-hw-1',
          title: 'Production Gateway — Connection Pool Configuration',
          description:
            'In high-concurrency environments or containerized microservices, tune the database connection pool using connection parameters (`connection_limit=5` and `pool_timeout=10`) and attach structured query logging.',
          instructions: [
            'Configure `connection_limit` and `pool_timeout` parameters on the database URL',
            'Pass the configured URL via `datasources: { db: { url: ... } }` in the PrismaClient constructor',
            'Enable query and error logging with `log: [\'query\', \'error\']`',
          ],
          hint: 'Set `url.searchParams.set(\'connection_limit\', \'5\')` and pass `datasources: { db: { url: url.toString() } }` to `new PrismaClient()`.',
          scaffold: '-- Database gateway pooled client verification:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Tuning connection_limit and pool_timeout prevents connection pool starvation while logging monitors client health.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            "import { PrismaClient } from '@prisma/client';\n\nexport function createPooledClient(databaseUrl: string) {\n  // BUG: Default unpooled client risks pool starvation under load\n  return new PrismaClient();\n}",
          code1:
            "import { PrismaClient } from '@prisma/client';\n\nexport function createPooledClient(databaseUrl: string) {\n  const url = new URL(databaseUrl);\n  url.searchParams.set('connection_limit', '5');\n  url.searchParams.set('pool_timeout', '10');\n\n  return new PrismaClient({\n    datasources: {\n      db: { url: url.toString() },\n    },\n    log: ['query', 'error'],\n  });\n}",
          need: ['new PrismaClient({', 'datasources:', 'url:', 'connection_limit', 'pool_timeout'],
          ban: ['findMany', 'orderBy'],
          rtype: 'PrismaClient',
        }),
        type: 'challenge',
      },
    ],
  },
};
