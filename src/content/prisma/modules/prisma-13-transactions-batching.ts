import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 13 — Transactions & Batching (Phase 7: Advanced Patterns & Production).
 *
 * Pedagogical Sequence:
 *   Concept 1: Sequential Batch Transactions — prisma.$transaction([...])
 *   Concept 2: Interactive Transactions — prisma.$transaction(async (tx) => ...)
 *   Concept 3: Transaction Isolation, Timeouts & Rollback Mechanics
 *   Challenge: Multi-Account Financial Settlement with Atomic Rollback
 */
export const Prisma_13_MODULE: ModuleData = {
  id: 'prisma-13',
  slug: 'transactions-and-batching',
  day: 13,
  title: 'Day 13 — Transactions & Batching',
  shortTitle: 'Transactions',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-7',
  description:
    'Execute operations atomically using sequential batch transactions and interactive callback transactions with strict connection isolation, timeouts, and guaranteed rollbacks.',
  estimatedMinutes: 60,
  curriculumOrder: 13,
  displayLabel: 'Day 13',
  completionLearnings: [
    'Bundle independent queries into atomic all-or-nothing array transactions with $transaction([...])',
    'Execute complex conditional application logic within interactive transactions with $transaction(async (tx) => ...)',
    'Enforce scoping boundaries: always invoke tx inside the callback to prevent connection deadlocks',
    'Configure maxWait and timeout parameters, and verify atomic rollback behavior on unhandled exceptions',
  ],
  concepts: [
    {
      id: 'batch-transactions',
      order: 1,
      title: 'Sequential Batch Transactions — $transaction([...])',
      shortDescription: 'All-or-nothing array execution in a single database round trip.',
      theory: richPrismaTheory({
        summary:
          '`prisma.$transaction([...])` accepts an array of Prisma operations and executes them inside a single database transaction. If any query in the array fails, all operations roll back automatically. Operations inside the array are NOT awaited individually — Prisma batches them together for optimal network efficiency.',
        takeaway:
          'Pass unawaited operations to prisma.$transaction([...]) for atomic, all-or-nothing execution.',
        sql: 'SELECT id, name FROM users WHERE id IN (1, 2);',
        heroCode:
          'const [userA, userB] = await prisma.$transaction([\n  prisma.user.update({ where: { id: 1 }, data: { name: "Alice" } }),\n  prisma.user.update({ where: { id: 2 }, data: { name: "Bob" } }),\n]);',
        heroLang: 'typescript',
        heroWhy: 'Executes both updates inside a single BEGIN ... COMMIT block.',
        mentalModel:
          '**Atomic Array Pipeline.** When queries do not depend on each other’s return values (e.g. debiting account A and crediting account B without dynamic branching), the array form of `$transaction` is the cleanest, fastest choice. Because promises are not awaited before passing to the array, Prisma executes the batch in a single database conversation.',
        littleDetails: {
          title: 'Array Transaction Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Do not await operations inside the array',
              description: 'Pass unawaited query promises: `prisma.$transaction([prisma.user.update(...), ...])`. Awaiting inside the array executes queries immediately before the transaction wrapper can bind them.',
              badge: 'Syntax Rule',
            },
            {
              ruleNumber: 2,
              title: 'Returns typed results tuple',
              description: 'TypeScript infers a tuple type matching the exact return shapes of each operation in the array: `[User, User]`.',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 3,
              title: 'All-or-nothing rollback',
              description: 'If the tenth query in a 10-item batch violates a unique constraint or foreign key, all previous 9 queries are rolled back in the database.',
              badge: 'Atomicity',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma $transaction to SQL Blocks',
          mappings: [
            {
              prisma: 'prisma.$transaction([op1, op2])',
              sql: 'BEGIN;\nUPDATE users SET ...;\nUPDATE users SET ...;\nCOMMIT;',
              note: 'Guarantees total atomicity across all operations in the batch.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use array $transaction vs interactive $transaction?',
              answer: 'Use the array form when you have a list of independent operations and do not need to read data to decide the next step. Use interactive when step 2 depends on step 1.',
            },
            {
              questionNumber: 2,
              question: 'What happens if the second operation in the array fails?',
              answer: 'Prisma sends a SQL ROLLBACK. The database reverts to its exact state prior to the transaction.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Create unawaited query definitions',
            codeSnippet: 'const op1 = prisma.user.update({ where: { id: 1 }, data: { name: "Alice" } });\nconst op2 = prisma.user.update({ where: { id: 2 }, data: { name: "Bob" } });',
            explanation: 'Construct operations without awaiting them.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Pass operations to $transaction array',
            codeSnippet: 'const results = await prisma.$transaction([op1, op2]);',
            explanation: 'Prisma opens a transaction, executes both statements, and commits atomically.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Receive typed tuple return',
            codeSnippet: 'const [alice, bob] = results;',
            explanation: 'Hydrated results for all queries are returned together.',
            visualData: {
              type: 'type_preview',
              title: 'Tuple Return Contract',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c1-t1',
          title: 'Batch Updates: Atomically transfer user state with array $transaction',
          description: 'Transfer data between two accounts in an atomic array transaction.',
          instructions: [
            'Use `prisma.$transaction([ ... ])`',
            'Update user `fromId` and user `toId` inside the array',
            'Do not await individual operations inside the array',
          ],
          hintLadder: [
            'Array transactions execute multiple queries atomically in a single round trip.',
            'Wrap both prisma.user.update calls in an array passed to prisma.$transaction.',
            'Write: `return await prisma.$transaction([prisma.user.update(...), prisma.user.update(...)]);`',
          ],
          scaffold: '-- Users before atomic transfer:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id IN (1, 2);',
          why: 'Array $transaction ensures both updates succeed or both fail together.',
          cols: ['id', 'name'],
          rows: 2,
          code0:
            'export async function transfer(fromId: number, toId: number) {\n  // Execute atomic transfer:\n\n}',
          code1:
            'export async function transfer(fromId: number, toId: number) {\n  return await prisma.$transaction([\n    prisma.user.update({ where: { id: fromId }, data: { name: "Sender" } }),\n    prisma.user.update({ where: { id: toId }, data: { name: "Recipient" } }),\n  ]);\n}',
          need: ['prisma.$transaction([', 'where: { id: fromId }', 'where: { id: toId }'],
          behavioralGrader: 'day12-transaction',
        }),
        prismaSnippetTask({
          id: 'prisma13-c1-t2',
          title: 'Atomic Multi-Write: Batch create and update in array $transaction',
          description: 'Insert an audit record and update a user status in a single atomic batch transaction.',
          instructions: [
            'Call `await prisma.$transaction([ ... ])`',
            'Include `prisma.user.update` and `prisma.user.create` in the batch',
          ],
          hintLadder: [
            'Array $transaction can mix different operation types (create, update, delete).',
            'Pass the unawaited operations inside the array to $transaction.',
            'Write: return await prisma.$transaction([prisma.user.update(...), prisma.user.create(...)]);',
          ],
          scaffold: '-- All writes in the batch landed:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id IN (1, 2);',
          why: 'Batching operations guarantees cross-entity state consistency.',
          cols: ['id'],
          rows: 2,
          code0:
            'export async function auditBatch(id: number, email: string) {\n  // Batch update and create:\n\n}',
          code1:
            'export async function auditBatch(id: number, email: string) {\n  return await prisma.$transaction([\n    prisma.user.update({ where: { id }, data: { name: "Audited" } }),\n    prisma.user.create({ data: { name: "LogEntry", email } }),\n  ]);\n}',
          need: ['prisma.$transaction([', 'prisma.user.update', 'prisma.user.create'],
        }),
      ],
    },
    {
      id: 'interactive-transactions',
      order: 2,
      title: 'Interactive Transactions — $transaction(async (tx) => ...)',
      shortDescription: 'Execute conditional application logic inside an open database transaction.',
      theory: richPrismaTheory({
        summary:
          'Interactive transactions allow you to read data, perform business calculations, and execute conditional queries within an ongoing database transaction: `await prisma.$transaction(async (tx) => { ... })`. **CRITICAL RULE:** All operations inside the callback MUST be called on the transaction client `tx`, NEVER on the root `prisma` client. Calling `prisma` bypasses the transaction lock and can lead to immediate deadlocks.',
        takeaway:
          'Always invoke tx inside $transaction(async (tx) => ...); never call the root prisma client.',
        sql: "SELECT id, email\nFROM users\nWHERE email = 'alex@prisma.io';",
        heroCode:
          'const result = await prisma.$transaction(async (tx) => {\n  const user = await tx.user.findFirst({ where: { email } });\n  if (user) return user;\n  return await tx.user.create({ data: { name, email } });\n});',
        heroLang: 'typescript',
        heroWhy: 'Reads and writes share the same transaction connection leased by tx.',
        mentalModel:
          '**The Dedicated Connection Lease.** When `prisma.$transaction(async (tx) => ...)` begins, Prisma leases a single database socket exclusively for that closure. The `tx` argument is a scoped proxy bound to that socket. If you accidentally call `prisma.user.*` inside the callback, you attempt to lease a second connection that may wait on locks held by the first, causing deadlock starvation.',
        littleDetails: {
          title: 'Interactive Transaction Rules & Gotchas',
          rules: [
            {
              ruleNumber: 1,
              title: 'Never invoke root prisma inside the callback',
              description: 'Always use `tx.model.method(...)`. Calling `prisma.model.method(...)` executes outside the transaction, risking race conditions and connection pool exhaustion.',
              badge: 'Scoping Rule',
            },
            {
              ruleNumber: 2,
              title: 'Default timeout is 5000ms',
              description: 'Interactive transactions hold open database connections. To prevent rogue queries from holding sockets indefinitely, Prisma enforces a default 5-second timeout.',
              badge: 'Timeout',
            },
            {
              ruleNumber: 3,
              title: 'Unhandled error triggers rollback',
              description: 'Throwing an exception inside the callback automatically rolls back all queries executed by `tx` up to that point.',
              badge: 'Atomicity',
            },
          ],
        },
        sqlBridge: {
          title: 'Interactive Transactions to SQL Isolation',
          mappings: [
            {
              prisma: 'prisma.$transaction(async (tx) => { ... })',
              sql: 'BEGIN TRANSACTION; -- holds leased connection socket\n-- statements run on leased socket\nCOMMIT;',
              note: 'Interactive closure running under dedicated transaction connection.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Why should I avoid slow external API calls inside an interactive transaction?',
              answer: 'The transaction holds an active database socket lease. If an external API takes 3 seconds, that connection is unavailable to other requests, bottlenecking the entire pool.',
            },
            {
              questionNumber: 2,
              question: 'How do I roll back an interactive transaction intentionally?',
              answer: 'Throw an error inside the callback (`throw new Error("Insufficient funds")`). Prisma intercepts the error and issues a SQL ROLLBACK.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Open interactive transaction callback',
            codeSnippet: 'await prisma.$transaction(async (tx) => {',
            explanation: 'Leases a dedicated connection and passes the scoped tx proxy.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Execute dependent queries using tx',
            codeSnippet: '  const existing = await tx.user.findFirst({ where: { email } });\n  if (existing) return existing;\n  return await tx.user.create({ data: { name, email } });',
            explanation: 'All operations execute on the leased transaction socket.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Return result or throw to roll back',
            codeSnippet: '});',
            explanation: 'Prisma commits on return, or rolls back on unhandled error.',
            visualData: {
              type: 'sql_lens',
              title: 'Transaction Boundary',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c2-t1',
          title: 'Conditional Promotion: Promote user inside interactive $transaction',
          description: 'Check if a user exists and create them if absent inside an interactive transaction callback.',
          instructions: [
            'Use `await prisma.$transaction(async (tx) => { ... })`',
            'Find user using `await tx.user.findFirst({ where: { email } })`',
            'If user exists, return them; otherwise call `await tx.user.create({ data: { name, email } })`',
            'Do NOT call `prisma` inside the callback',
          ],
          hintLadder: [
            'Interactive transactions use an async callback receiving tx.',
            'Check existing user with tx.user.findFirst; if found return it; else tx.user.create.',
            'Ensure all calls use tx and not prisma.',
          ],
          scaffold: '-- User promoted or created:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Interactive transactions maintain consistency across conditional read-and-write logic.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function promote(name: string, email: string) {\n  // Interactive promote:\n\n}',
          code1:
            'export async function promote(name: string, email: string) {\n  return await prisma.$transaction(async (tx) => {\n    const existing = await tx.user.findFirst({ where: { email } });\n    if (existing) return existing;\n    return await tx.user.create({ data: { name, email } });\n  });\n}',
          need: ['prisma.$transaction(async (tx)', 'tx.user.findFirst', 'tx.user.create'],
          demoVariables: { name: 'Alexandra' },
          behavioralGrader: 'day12-transaction',
        }),
        prismaSnippetTask({
          id: 'prisma13-c2-t2',
          title: 'Scoping Invariant: Verify strict tx usage inside transaction callback',
          description: 'Ensure all operations inside the callback strictly use tx to avoid deadlocks.',
          instructions: [
            'Identify any calls made on root `prisma` inside the transaction',
            'Replace them with `tx` to maintain connection isolation',
          ],
          hintLadder: [
            'Calling root prisma inside a transaction callback breaches isolation and can deadlock.',
            'Replace prisma.user calls with tx.user calls.',
            'Return the result of the scoped transaction.',
          ],
          scaffold: '-- Clean transaction executed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Strict tx usage preserves isolation and prevents connection pool exhaustion.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function promote(name: string, email: string) {\n  return await prisma.$transaction(async (tx) => {\n    // BUG: calling root prisma instead of tx!\n    const existing = await prisma.user.findFirst({ where: { email } });\n    if (existing) return existing;\n    return await prisma.user.create({ data: { name, email } });\n  });\n}',
          code1:
            'export async function promote(name: string, email: string) {\n  return await prisma.$transaction(async (tx) => {\n    const existing = await tx.user.findFirst({ where: { email } });\n    if (existing) return existing;\n    return await tx.user.create({ data: { name, email } });\n  });\n}',
          need: ['tx.user.findFirst', 'tx.user.create'],
          ban: ['prisma.user.'],
          demoVariables: { name: 'Alexandra' },
          behavioralGrader: 'day12-transaction',
        }),
        prismaSnippetTask({
          id: 'prisma13-c2-t3',
          title: 'Atomic Rollback: Guarantee zero partial state on unhandled exception',
          description: 'Throw an error inside the transaction callback and observe complete state rollback.',
          instructions: [
            'Call `await prisma.$transaction(async (tx) => ...)`',
            'Update user name with `await tx.user.update`',
            'If `shouldFail` is true, throw an Error',
            'Catch the error in an outer try/catch and log rollback confirmation',
          ],
          hintLadder: [
            'Throwing an error inside the transaction triggers automatic rollback.',
            'Use tx.user.update, check shouldFail, and throw if true.',
            'Log "Rollback preserved invariant state." on catch.',
          ],
          scaffold: '-- Database state remains uncorrupted:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'Unhandled errors trigger SQL ROLLBACK, guaranteeing database invariants.',
          cols: ['id'],
          rows: 1,
          code0:
            'export async function executeWithRollback(id: number, newName: string, shouldFail: boolean) {\n  // Transaction with simulated rollback:\n\n}',
          code1:
            'export async function executeWithRollback(id: number, newName: string, shouldFail: boolean) {\n  try {\n    await prisma.$transaction(async (tx) => {\n      await tx.user.update({ where: { id }, data: { name: newName } });\n      if (shouldFail) {\n        throw new Error("Simulated failure: rolling back");\n      }\n    });\n  } catch (err) {\n    console.log("Rollback preserved invariant state.");\n  }\n}',
          need: ['prisma.$transaction(async (tx)', 'tx.user.update', 'throw new Error'],
          demoVariables: { newName: 'Alex Updated', name: 'Alex Updated' },
          behavioralGrader: 'day12-transaction',
        }),
      ],
    },
    {
      id: 'transaction-options',
      order: 3,
      title: 'Timeouts, Isolation Levels & Deadlock Avoidance',
      shortDescription: 'Configure maxWait, timeout, and handle concurrent locking cleanly.',
      theory: richPrismaTheory({
        summary:
          'Interactive transactions accept configuration options as a second argument: `maxWait` (maximum time in ms to wait to acquire a connection from the pool) and `timeout` (maximum time in ms the transaction can run before Prisma aborts it and rolls back). Tuning these bounds protects high-concurrency systems from runaway queries.',
        takeaway:
          'Configure maxWait and timeout on $transaction to prevent connection lock starvation.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode:
          'await prisma.$transaction(\n  async (tx) => {\n    await tx.user.update({ where: { id: 1 }, data: { name: "Alice" } });\n  },\n  {\n    maxWait: 5000, // 5s to acquire a connection\n    timeout: 10000, // 10s execution budget\n  }\n);',
        heroLang: 'typescript',
        heroWhy: 'Explicit timeouts protect connection pools during heavy database load.',
        mentalModel:
          '**The SLA Budget.** Every transaction must have bounded lifecycle guarantees. If traffic spikes and all database sockets are busy, `maxWait` fails fast rather than queueing requests indefinitely. If a transaction encounters a lock wait, `timeout` aborts and rolls back to free resources.',
        littleDetails: {
          title: 'Transaction Options Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'maxWait guards connection acquisition',
              description: 'Specifies the maximum time (default: 2000ms) Prisma Client will wait to lease a socket from the internal connection pool before throwing.',
              badge: 'Lease SLA',
            },
            {
              ruleNumber: 2,
              title: 'timeout bounds total execution duration',
              description: 'Specifies the maximum time (default: 5000ms) the transaction can remain open before Prisma cancels it with a timeout error and sends ROLLBACK.',
              badge: 'Timeout',
            },
            {
              ruleNumber: 3,
              title: 'Isolation levels depend on database provider',
              description: 'PostgreSQL supports `ReadCommitted`, `RepeatableRead`, and `Serializable`. SQLite defaults to `Serializable`.',
              badge: 'Isolation',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Transaction Options to SQL Settings',
          mappings: [
            {
              prisma: '{ maxWait: 5000, timeout: 10000 }',
              sql: 'SET LOCAL statement_timeout = 10000;',
              note: 'Bounds database lock hold times to prevent pool exhaustion.',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I increase the transaction timeout?',
              answer: 'Only for scheduled batch operations or complex financial reconciliation. Keep user-facing web request transactions well under 5 seconds.',
            },
            {
              questionNumber: 2,
              question: 'What happens if a transaction times out?',
              answer: 'Prisma throws a `P2028` transaction API error, rolls back all changes, and returns the socket to the pool.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Define options object with timeout parameters',
            codeSnippet: 'const options = { maxWait: 5000, timeout: 10000 };',
            explanation: 'Declares maximum connection wait and total execution budget in milliseconds.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Pass options as second argument to $transaction',
            codeSnippet: 'await prisma.$transaction(async (tx) => { ... }, options);',
            explanation: 'Configures transaction engine watchdog for the closure.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Execute queries under watchdog supervision',
            codeSnippet: 'await tx.user.update({ where: { id }, data });',
            explanation: 'Guarantees execution terminates within SLA bounds.',
            visualData: {
              type: 'type_preview',
              title: 'Watched Transaction SLA',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma13-c3-t1',
          title: 'SLA Guard: Configure maxWait and timeout on interactive transaction',
          description: 'Configure an interactive transaction with maxWait: 5000 and timeout: 10000 options.',
          instructions: [
            'Pass options object as second argument to `prisma.$transaction`',
            'Set `maxWait: 5000`',
            'Set `timeout: 10000`',
          ],
          hintLadder: [
            'The options object is passed after the async transaction callback.',
            'Include maxWait: 5000 and timeout: 10000.',
            'Write: await prisma.$transaction(async (tx) => { ... }, { maxWait: 5000, timeout: 10000 });',
          ],
          scaffold: '-- Transaction executed with SLA bounds:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id = 1;',
          why: 'Timeouts prevent rogue transactions from holding sockets indefinitely.',
          cols: ['id'],
          rows: 1,
          code0:
            'export async function executeBounded(id: number, name: string) {\n  return await prisma.$transaction(async (tx) => {\n    return await tx.user.update({ where: { id }, data: { name } });\n  });\n}',
          code1:
            'export async function executeBounded(id: number, name: string) {\n  return await prisma.$transaction(\n    async (tx) => {\n      return await tx.user.update({ where: { id }, data: { name } });\n    },\n    { maxWait: 5000, timeout: 10000 }\n  );\n}',
          need: ['maxWait: 5000', 'timeout: 10000'],
          demoVariables: { id: 1, name: 'Alex Bounded' },
        }),
        prismaSnippetTask({
          id: 'prisma13-c3-t2',
          title: 'Deadlock Avoidance: Order mutations consistently across concurrent transactions',
          description: 'Order updates by ascending ID to avoid database deadlocks under concurrent execution.',
          instructions: [
            'Ensure the lower ID is updated before the higher ID',
            'Update account A then account B consistently across all services',
          ],
          hintLadder: [
            'Sorting resource IDs before locking prevents cyclic deadlock waits.',
            'Update smaller ID first, then larger ID.',
            'Order operations consistently in code.',
          ],
          scaffold: '-- Deterministic ordering applied:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: 'SELECT id FROM users WHERE id IN (1, 2);',
          why: 'Consistent lock acquisition order eliminates distributed deadlocks.',
          cols: ['id'],
          rows: 2,
          code0:
            'export async function transferOrdered(idA: number, idB: number) {\n  // Inconsistent order creates deadlocks!\n  return await prisma.$transaction([\n    prisma.user.update({ where: { id: idB }, data: { name: "B" } }),\n    prisma.user.update({ where: { id: idA }, data: { name: "A" } }),\n  ]);\n}',
          code1:
            'export async function transferOrdered(idA: number, idB: number) {\n  const [firstId, secondId] = idA < idB ? [idA, idB] : [idB, idA];\n  return await prisma.$transaction([\n    prisma.user.update({ where: { id: firstId }, data: { name: "First" } }),\n    prisma.user.update({ where: { id: secondId }, data: { name: "Second" } }),\n  ]);\n}',
          need: ['idA < idB', 'firstId', 'secondId'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma13-challenge',
    title: 'Final Challenge — Multi-Account Financial Settlement',
    scenario: 'Execute a multi-account settlement with balance checks, audit logging, and guaranteed rollback.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma13-hw-1',
          title: 'Financial Settlement: Execute checkout with balance deduction and audit entry',
          description: 'Deduct buyer balance and credit vendor account atomically inside an interactive transaction.',
          instructions: [
            'Export `async function checkout(buyerEmail: string, vendorEmail?: string)`',
            'Use `await prisma.$transaction(async (tx) => { ... })`',
            'Update buyer with `tx.user.update({ where: { email: buyerEmail }, data: { name: "Buyer" } })`',
            'Create vendor with `tx.user.create({ data: { name: "Vendor", email: vendorEmail } })`',
            'Return the updated buyer record from the transaction callback',
            'Ensure zero root `prisma` calls are made inside the transaction',
          ],
          hintLadder: [
            'Financial settlements require interactive transactions with atomic guarantees.',
            'Execute buyer update and vendor creation using tx inside the transaction callback.',
            'Write: export async function checkout(buyerEmail: string, vendorEmail: string = "vendor@prisma.io") { return await prisma.$transaction(async (tx) => { const buyer = await tx.user.update(...); await tx.user.create(...); return buyer; }); }',
          ],
          fromScratch: true,
          scaffold: '-- Settlement completed atomically:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'The settlement guarantees neither account is mutated in isolation.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function checkout(buyerEmail: string, vendorEmail: string = "vendor@prisma.io") {\n  // Execute interactive settlement from scratch and return the updated buyer record:\n\n}',
          code1:
            'export async function checkout(buyerEmail: string, vendorEmail: string = "vendor@prisma.io") {\n  return await prisma.$transaction(async (tx) => {\n    const buyer = await tx.user.update({\n      where: { email: buyerEmail },\n      data: { name: "Buyer" },\n    });\n    await tx.user.create({\n      data: { name: "Vendor", email: vendorEmail },\n    });\n    return buyer;\n  });\n}',
          need: ['prisma.$transaction(async (tx)', 'tx.user.update', 'tx.user.create'],
          ban: ['prisma.user.'],
          demoVariables: { buyerEmail: 'mina@prisma.io', vendorEmail: 'vendor@prisma.io' },
          behavioralGrader: 'day12-transaction',
        }),
        type: 'challenge',
      },
    ],
  },
};
