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
  milestoneId: 'prisma-milestone-4',
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
        littleDetails: {
          title: 'PrismaClient Singleton Rules & Gotchas',
          rules: [
            {
              ruleNumber: 1,
              title: 'Why `as unknown as { prisma?: PrismaClient }`?',
              description: 'In TypeScript, `globalThis` has strict typings that disallow assigning arbitrary unknown properties without global declaration files. Casting through `unknown` is the clean, standard pattern to stash a singleton on the Node.js global object.',
              badge: 'TypeScript',
            },
            {
              ruleNumber: 2,
              title: 'Only cache on globalThis during development',
              description: 'In production, your Node server or container runs a single long-lived process without file watchers. Wrapping the assignment in `if (process.env.NODE_ENV !== "production")` ensures we only use the global cache when Hot Module Replacement (HMR) is actively reloading modules.',
              badge: 'Environment',
            },
            {
              ruleNumber: 3,
              title: 'Serverless PgBouncer connection tuning',
              description: 'In serverless functions (AWS Lambda, Vercel), each cold start spins up a separate instance. Always append `?pgbouncer=true&connection_limit=1` to your connection URL. The `pgbouncer=true` flag tells Prisma to disable prepared statements, and `connection_limit=1` prevents each Lambda from monopolizing multiple database sockets.',
              badge: 'Serverless',
            },
          ],
        },
        sqlBridge: {
          title: 'PrismaClient to Database Sockets',
          mappings: [
            {
              prisma: 'new PrismaClient()',
              sql: 'Physical TCP connection pool (pg_stat_activity)',
              note: 'Allocates an internal pool of active TCP sockets to the database. Running multiple instances exhausts Postgres max_connections.',
            },
            {
              prisma: 'globalThis.prisma ?? new PrismaClient()',
              sql: 'Reused socket pool across dev reloads',
              note: 'Preserves the existing socket pool across file saves in Next.js / Vite development servers.',
            },
            {
              prisma: '?pgbouncer=true&connection_limit=1',
              sql: 'Transaction pooling mode (no prepared statements)',
              note: 'Optimizes Postgres connection pooling through PgBouncer/Supabase for ephemeral serverless lambdas.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Are you running a local development server with hot-reloading (Next.js, Vite)?',
              answer: 'Attach `prisma` to `globalThis` in development so file saves do not spawn duplicate connection pools.',
            },
            {
              questionNumber: 2,
              question: 'Are you deploying to ephemeral serverless lambdas (Vercel, AWS Lambda)?',
              answer: 'Use a connection pooler like PgBouncer or Supabase Pooler with `?pgbouncer=true&connection_limit=1`, or use Prisma Accelerate / Driver Adapters over HTTP.',
            },
            {
              questionNumber: 3,
              question: 'Are you deploying a traditional long-running Node container (Docker, Express, NestJS)?',
              answer: 'Instantiate a single module-scoped client. The default pool size (`num_physical_cpus * 2 + 1`) efficiently handles concurrent async requests.',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c1-t1',
          title: 'Every hot reload creates another database connection: Can you stop it?',
          description: 'The current module builds a brand-new client on every reload.',
          instructions: ['Read the cached client from `globalThis`', 'Fall back to `new PrismaClient()`'],
          hintLadder: [
            'Instantiating PrismaClient opens physical database connection pools; reusing an existing instance avoids leaking socket connections during hot reload.',
            'Cast globalThis to access the cached prisma property and fallback to new PrismaClient() with the nullish coalescing operator.',
            'Use globalThis fallback: const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }; export const prisma = globalForPrisma.prisma ?? /* instantiate new client */;',
          ],
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
          title: 'Your development server keeps recreating Prisma Client: Can you cache one safely?',
          description: 'Production must keep a single module-scoped instance.',
          instructions: ['Write the client back to `globalThis`', 'Guard with `NODE_ENV`'],
          hintLadder: [
            'Only hot-reloading development environments require global caching; production builds run as single long-lived container processes.',
            'Check process.env.NODE_ENV before assigning the initialized client back onto globalForPrisma.prisma.',
            'Add the environment guard: if (process.env.NODE_ENV !== \'production\') globalForPrisma.prisma = /* assign client */;',
          ],
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
      theory: richPrismaTheory({
        summary:
          'Prisma executes queries silently by default. Configuring `log: [\'query\', \'warn\', \'error\']` reveals every raw SQL statement, parameter binding, and execution duration sent over the wire. In CLI scripts, seed runners, and integration tests, calling `await prisma.$disconnect()` is mandatory to release the connection pool and allow the Node.js event loop to terminate gracefully.',
        takeaway:
          'Turn on query logging to see real SQL; disconnect before exit.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
        heroCode:
          "const prisma = new PrismaClient({ log: ['query', 'warn', 'error'] });\n\nprocess.on('beforeExit', async () => {\n  await prisma.$disconnect();\n});",
        heroLang: 'typescript',
        heroWhy: 'The log array is your only window into the SQL Prisma actually sends.',
        mentalModel:
          '**Observability & Teardown Lifecycle.** Prisma communicates with the database through its internal query engine. By enabling `query` logging, you inspect the exact parameterized SQL and execution timing for every ORM call. When a CLI process finishes, active open sockets in Prisma\'s connection pool keep the Node.js event loop alive. Attaching `prisma.$disconnect()` to the `beforeExit` signal drains and closes these sockets so the process can exit cleanly.',
        littleDetails: {
          title: 'Logging & Teardown Rules',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never call $disconnect() inside web request handlers',
              description: 'Calling `$disconnect()` inside an Express route, Next.js Server Action, or Fastify handler tears down the shared pool for all incoming user requests! Only call `$disconnect()` in batch scripts, tests, or process termination hooks.',
              badge: 'Architecture',
            },
            {
              ruleNumber: 2,
              title: 'Log levels and structured events',
              description: 'Passing `log: [\'query\']` prints directly to `stdout`. If you need structured logging (e.g. JSON in Datadog or Winston), configure `{ emit: \'event\', level: \'query\' }` and register a listener with `prisma.$on(\'query\', (e) => console.log(e.query, e.params, e.duration))`.',
              badge: 'Telemetry',
            },
            {
              ruleNumber: 3,
              title: 'Lazy connection initialization',
              description: 'You rarely need to call `prisma.$connect()` explicitly. Prisma connects lazily upon the very first database query.',
              badge: 'Performance',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Lifecycle Methods to Connection States',
          mappings: [
            {
              prisma: "new PrismaClient({ log: ['query'] })",
              sql: 'Live query telemetry (emits SQL statement to console)',
              note: 'Exposes the underlying parameterized SQL queries generated by the Prisma query engine.',
            },
            {
              prisma: 'await prisma.$disconnect()',
              sql: 'TCP FIN / connection pool teardown',
              note: 'Closes physical socket connections, allowing the Node process to terminate.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Is this a persistent web application server (Express, Fastify, Next.js)?',
              answer: 'Do NOT call `$disconnect()`. The connection pool must remain open to serve subsequent requests with zero cold connection overhead.',
            },
            {
              questionNumber: 2,
              question: 'Is this a one-shot CLI script, database seed, or Jest/Vitest test runner?',
              answer: 'Always call `await prisma.$disconnect()` in a `finally` block or `beforeExit` listener so the script exits without hanging.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Configure query logging in client options',
            codeSnippet: "const prisma = new PrismaClient({\n  log: ['query', 'warn', 'error'],\n});",
            explanation: 'The log array tells Prisma which telemetry events to capture from the underlying query engine.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Query execution emits real-time parameterized SQL',
            codeSnippet: "SELECT id, email\nFROM users\nWHERE email = 'rafi@prisma.io';",
            explanation: 'Prisma prints the exact compiled SQL statement along with parameter values and duration in milliseconds.',
            visualData: {
              type: 'sql_lens',
              title: 'Emitted Telemetry Statement',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Graceful shutdown releases socket pool',
            codeSnippet: "process.on('beforeExit', async () => {\n  await prisma.$disconnect();\n});",
            explanation: 'Calling $disconnect() returns all leased sockets and drains the pool before the Node.js process terminates.',
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma06-c2-t1',
          title: 'A query is behaving unexpectedly: Can you see the SQL Prisma actually sends?',
          description: 'Print the SQL Prisma sends and keep warnings visible.',
          instructions: ["Add `log: ['query', 'warn', 'error']`"],
          hintLadder: [
            'Configuring client telemetry logging surfaces the compiled SQL statements and query timing emitted by the engine.',
            'Pass an options object containing a log array specifying the query, warn, and error event levels.',
            'Add the log array: new PrismaClient({ log: [\'query\', \'warn\', /* add error level */] });',
          ],
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
          title: 'Your worker is shutting down: Can you close the Prisma connection cleanly?',
          description: 'A script that never disconnects hangs with open connections.',
          instructions: ['Listen for `beforeExit`', 'Call `$disconnect()`'],
          hintLadder: [
            'CLI and background scripts must release open TCP pool connections so the runtime event loop can exit cleanly.',
            'Register an async listener on the beforeExit process event and await the disconnect method.',
            'Call disconnect inside the handler: process.on(\'beforeExit\', async () => { await prisma./* call disconnect method */(); });',
          ],
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
          title: 'Build a production ready Prisma database gateway with safe connection handling',
          description:
            'In high-concurrency environments or containerized microservices, tune the database connection pool using connection parameters (`connection_limit=5` and `pool_timeout=10`) and attach structured query logging.',
          instructions: [
            'Configure `connection_limit` and `pool_timeout` parameters on the database URL',
            'Pass the configured URL via `datasources: { db: { url: ... } }` in the PrismaClient constructor',
            'Enable query and error logging with `log: [\'query\', \'error\']`',
          ],
          hintLadder: [
            'Enterprise clients tune connection pool sizing and connection timeouts directly on the connection string URL to survive sudden request surges.',
            'Parse the connection URL, append pool parameters, and instantiate PrismaClient with datasources and query logging.',
            'Configure the client stopping 1 step short: const url = new URL(databaseUrl); url.searchParams.set(\'connection_limit\', \'5\'); url.searchParams.set(\'pool_timeout\', \'10\'); return new PrismaClient({ datasources: { db: { url: url.toString() } }, log: /* add log array */ });',
          ],
          fromScratch: true,
          scaffold: '-- Database gateway pooled client verification:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Tuning connection_limit and pool_timeout prevents connection pool starvation while logging monitors client health.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            "import { PrismaClient } from '@prisma/client';\n\nexport function createPooledClient(databaseUrl: string) {\n  // Write pooled client creation from scratch:\n\n}",
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
