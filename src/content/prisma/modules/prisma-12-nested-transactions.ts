import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 12 — Nested Writes & Transactions. */
export const Prisma_12_MODULE: ModuleData = {
  id: 'prisma-12',
  slug: 'nested-writes-transactions',
  day: 12,
  title: 'Day 12 — Nested Writes & Transactions',
  shortTitle: 'Nested Writes',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Write across relations in one call, and wrap multi-step writes in a transaction.',
  estimatedMinutes: 60,
  curriculumOrder: 12,
  displayLabel: 'Day 12',
  completionLearnings: [
    'Create a parent and its children in one call',
    'Attach existing rows with `connect`, create-or-attach with `connectOrCreate`',
    'Batch related writes with the array form of `$transaction`',
    'Use an interactive transaction for logic between steps',
  ],
  concepts: [
    {
      id: 'nested-writes',
      order: 1,
      title: 'Nested Writes — create, connect, connectOrCreate',
      shortDescription: 'One call, several tables, still a single round trip.',
      theory: richPrismaTheory({
        summary: 'A nested write follows the relation: `create` inserts a new child, `connect` attaches an existing one by unique key, and `connectOrCreate` does whichever applies. Prisma wraps the work in a transaction for you.',
        takeaway: 'create inserts, connect attaches, connectOrCreate decides.',
        sql: 'SELECT id, email\nFROM users\nWHERE id = 1;',
        heroCode: 'await prisma.user.create({\n  data: {\n    name,\n    email,\n    posts: { create: [{ title }] },\n  },\n  select: { id: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'One INSERT for the user, one for the post — inside a single transaction.',
        mentalModel: '**Follow the relation, not the code path.** A nested write is one call that walks the relation graph: `create` inserts a new child, `connect` attaches an existing row by key, `connectOrCreate` checks-then-decides. Every nested step runs inside ONE transaction — the whole graph lands, or none of it does.',
        littleDetails: {
          title: 'Nested Write Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'connect attaches existing records by unique key',
              description: 'The `connect` block accepts only unique identifiers (`@id` or `@unique`). If the target row does not exist, Prisma throws error code P2025.',
              badge: 'Lookup Contract',
            },
            {
              ruleNumber: 2,
              title: 'connectOrCreate eliminates check-then-insert races',
              description: 'Combines a unique `where` lookup with an insert fallback (`create`). Prisma handles concurrency safely so parallel requests cannot create duplicates.',
              badge: 'Idempotency',
            },
            {
              ruleNumber: 3,
              title: 'All nested writes execute in an implicit transaction',
              description: 'Whether inserting 1 child or 20 related entities across 4 models, Prisma wraps the entire operation in a single database transaction. If any write fails, all roll back.',
              badge: 'Atomicity',
            },
          ],
        },
        sqlBridge: {
          title: 'Nested Write vs Relational SQL',
          mappings: [
            {
              prisma: 'posts: { create: [{ title: "First Post" }] }',
              sql: 'INSERT INTO posts (title, author_id) VALUES ($1, $2);',
              note: 'Child INSERT uses generated parent ID in the same transaction',
            },
            {
              prisma: 'categories: { connect: { id: 5 } }',
              sql: 'INSERT INTO _CategoryToPost (A, B) VALUES ($1, $2);',
              note: 'Links existing row in join table or updates foreign key',
            },
            {
              prisma: 'categories: { connectOrCreate: { where: { id: 5 }, create: { name: "Tech" } } }',
              sql: 'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (id) DO NOTHING;',
              note: 'Ensures relation target exists before linking',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I use create vs connect in a nested relation write?',
              answer: 'Use `create` when the related row is brand new and belongs to this write. Use `connect` when linking to an existing record that already has a primary key.',
            },
            {
              questionNumber: 2,
              question: 'What happens if a nested child creation fails (e.g. invalid column value)?',
              answer: 'Prisma aborts the entire transaction: the parent record is NOT saved, and the database remains in its pre-query state.',
            },
          ],
        },
        explanation: [
          'Nested writes follow the relation: `create` inserts a child row, `connect` attaches an existing one, `connectOrCreate` does whichever applies.',
          'The parent and its children are written atomically — you never see a half-built graph.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the data graph is built in one object',
            codeSnippet: 'await prisma.user.create({\n  data: {\n    name,\n    email,\n    posts: { create: [{ title }] },\n  },\n});',
            explanation: 'The nested `posts.create` describes a whole graph — the parent row plus its child rows in a single call.',
          },
          {
            stepNumber: 2,
            stepTitle: 'connectOrCreate decides per row',
            codeSnippet: 'categories: {\n  connectOrCreate: {\n    where: { id: categoryId },\n    create: { name: categoryName },\n  },\n}',
            explanation: 'Existing key → attach; missing → insert. One call replaces the "does it exist?" round trip.',
          },
          {
            stepNumber: 3,
            stepTitle: 'one transaction wraps the whole graph',
            codeSnippet: 'BEGIN;\n-- INSERT the parent row\n-- INSERT the child rows\nCOMMIT;',
            explanation: 'Parent and children are written in one transaction — if any nested step fails, the whole graph rolls back.',
          },
          {
            stepNumber: 4,
            stepTitle: 'the result is narrowed by `select`',
            codeSnippet: '{ id: number }',
            explanation: 'The nested call returns the parent you selected — asking for only the id keeps the type (and the payload) small.',
            visualData: { type: 'type_preview', title: 'Inferred type', details: null },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma12-c1-t1',
          title: 'Create a user and their first post in a single Prisma operation',
          description: 'Register a user and their first post in one call.',
          instructions: ['Nest `posts: { create: [...] }` inside `data`'],
          hint: '`data: { name, email, posts: { create: [{ title }] } }`.',
          hintLadder: [
            'Nested writes walk relation graphs to create parents and children atomically in a single client call. If the child model contains foreign keys pointing to the parent, Prisma automatically coordinates the generated identifiers.',
            'Inside the data payload, add the relation field name with a nested create block containing the child records array.',
            'Nest posts create inside data:\ndata: {\n  name,\n  email,\n  posts: { create: [{ title: /* post title */ }] },\n}',
          ],
          scaffold: '-- The parent row of the nested write:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'Nested writes keep parent and child together, atomically.',
          cols: ['id', 'email'],
          select: [],
          method: 'create',
          rows: 1,
          code0:
            'export async function signUp(name: string, email: string, title: string) {\n  return await prisma.user.create({\n    data: { name, email },\n  });\n}',
          code1:
            'export async function signUp(name: string, email: string, title: string) {\n  return await prisma.user.create({\n    data: {\n      name,\n      email,\n      posts: { create: [{ title }] },\n    },\n  });\n}',
          need: ['posts: { create:'],
          // Task 0.2: nested write params (`name`, `title`) must not render NULL.
          demoVariables: { name: 'Alexandra', title: 'Hello Prisma' },
        }),
        prismaSnippetTask({
          id: 'prisma12-c1-t2',
          title: 'Connect a post to an existing category: Or create it if it does not exist',
          description: 'The category may already exist — you only have its key.',
          instructions: ['Use `connectOrCreate`', 'Match existing rows with `where: { id: categoryId }`'],
          hint: '`connectOrCreate: { where, create }`.',
          hintLadder: [
            'The connectOrCreate directive eliminates race conditions when associating a record with a relation that might or might not exist yet. It attempts a lookup by unique key and creates the record if absent in one atomic operation.',
            'Under categories, replace connect with connectOrCreate containing where for the id lookup and create for the fallback fields.',
            'Provide where and create inside connectOrCreate:\ncategories: {\n  connectOrCreate: {\n    where: { id: categoryId },\n    create: { name: /* category title */ },\n  },\n}',
          ],
          scaffold: '-- The new post hangs off the same user:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'connectOrCreate removes the "does it exist?" round trip from your code.',
          cols: ['id', 'email'],
          select: [],
          model: 'post',
          method: 'create',
          rows: 1,
          code0:
            'export async function publish(title: string, categoryId: number, categoryName: string) {\n  return await prisma.post.create({\n    data: {\n      title,\n      categories: {\n        connect: { id: categoryId },\n      },\n    },\n  });\n}',
          code1:
            'export async function publish(title: string, categoryId: number, categoryName: string) {\n  return await prisma.post.create({\n    data: {\n      title,\n      categories: {\n        connectOrCreate: {\n          where: { id: categoryId },\n          create: { name: categoryName },\n        },\n      },\n    },\n  });\n}',
          need: ['connectOrCreate:', 'where: { id: categoryId }'],
          // Task 0.2: the created child's `title` must not render NULL.
          demoVariables: { title: 'Hello Prisma', categoryName: 'General' },
          ban: ['connect: { id: categoryId }'],
        }),
      ],
    },
    {
      id: 'transactions',
      order: 2,
      title: 'ACID Transactions — Sequential & Interactive',
      shortDescription: 'All-or-nothing across several statements.',
      theory: richPrismaTheory({
        summary: 'The array form `$transaction([...])` runs a fixed list of queries atomically, while the interactive form `$transaction(async (tx) => …)` lets you read, decide and write inside one transaction — every call on `tx`, never on `prisma`, or you leave the transaction.',
        takeaway: 'Array form for a fixed list; interactive form for logic between steps.',
        sql: 'SELECT id, name\nFROM users\nWHERE id IN (1, 2);',
        heroCode: 'await prisma.$transaction([\n  prisma.user.update({ where: { id: fromId }, data: { name: \'Sent\' } }),\n  prisma.user.update({ where: { id: toId }, data: { name: \'Received\' } }),\n]);',
        heroLang: 'typescript',
        heroWhy: 'If the second UPDATE fails the first is rolled back — both or neither.',
        mentalModel: '**One transaction, two shapes.** The array form runs a fixed list of queries atomically; the interactive form runs your callback inside one transaction — read, decide, write, with every call on `tx`. Both make the same promise: all of it lands, or none of it does.',
        littleDetails: {
          title: 'Transaction Rules & Safety Checks',
          rules: [
            {
              ruleNumber: 1,
              title: 'Array form takes unawaited Prisma promises',
              description: 'In `prisma.$transaction([op1, op2])`, do not put `await` before individual operations inside the array. Passing promises allows Prisma to bundle and execute them in one database transaction.',
              badge: 'Array Syntax',
            },
            {
              ruleNumber: 2,
              title: 'Always use the tx parameter inside interactive callbacks',
              description: 'Inside `prisma.$transaction(async (tx) => { ... })`, calling `prisma.user.*` executes outside the transaction on a separate connection pool slot. Only calls on `tx` participate in the transaction.',
              badge: 'Critical Invariant',
            },
            {
              ruleNumber: 3,
              title: 'Unhandled errors trigger automatic rollback',
              description: 'If any promise rejects or an error is thrown inside the callback, Prisma issues a ROLLBACK to the database engine before rejecting the outer transaction promise.',
              badge: 'Rollback Guarantee',
            },
            {
              ruleNumber: 4,
              title: 'Transactions alone do not prevent lost updates under default isolation',
              description: 'In PostgreSQL (and most RDBMS), default transaction isolation is READ COMMITTED. Wrapping a read-then-write sequence in $transaction(async (tx) => ...) alone DOES NOT prevent race conditions between concurrent transactions reading the same row. To eliminate lost updates, use atomic operations (tx.wallet.update({ data: { balance: { decrement: amount } } })), conditional WHERE guards (updateMany({ where: { id, stock: { gte: qty } } })), or explicit row locking.',
              badge: 'Isolation Hazard',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Transactions vs SQL ACID Blocks',
          mappings: [
            {
              prisma: 'await prisma.$transaction([p1, p2])',
              sql: 'BEGIN;\nUPDATE ...;\nUPDATE ...;\nCOMMIT;',
              note: 'Sequential execution in a single transaction block',
            },
            {
              prisma: 'await prisma.$transaction(async (tx) => { const u = await tx.user...; await tx.order...; })',
              sql: 'BEGIN;\nSELECT ...;\n-- application decision logic\nINSERT ...;\nCOMMIT;',
              note: 'Interactive multi-turn transaction with runtime branch evaluation',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I choose the array form over the interactive form?',
              answer: 'Use the array form `$transaction([...])` when the operations are independent writes known ahead of time. Use the interactive form when later operations require the return values of earlier queries.',
            },
            {
              questionNumber: 2,
              question: 'What is the danger of running slow code (like external HTTP calls or hashing) inside an interactive transaction?',
              answer: 'Interactive transactions hold open a database connection and lock tables/rows. If the callback takes longer than the configured transaction timeout (default 5000ms), Prisma automatically rolls back and terminates the transaction.',
            },
          ],
        },
        explanation: [
          'The array form `$transaction([...])` is for a fixed list of writes you already know.',
          'The interactive form `$transaction(async (tx) => …)` is for logic between steps — and every statement must use `tx`, never `prisma`.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'the array form lists the statements',
            codeSnippet: 'await prisma.$transaction([\n  prisma.user.update({ where: { id: fromId }, data: { name: \'Sent\' } }),\n  prisma.user.update({ where: { id: toId }, data: { name: \'Received\' } }),\n]);',
            explanation: 'Both updates are queued in one atomic batch — the list is fixed before it starts.',
          },
          {
            stepNumber: 2,
            stepTitle: 'the interactive form reads before it writes',
            codeSnippet: 'await prisma.$transaction(async (tx) => {\n  const sender = await tx.user.findUnique({ where: { id: fromId } });\n  if (!sender) throw new Error(\'no sender\');\n  await tx.user.update({\n    where: { id: fromId },\n    data: { name: \'Sent\' },\n  });\n});',
            explanation: 'Every call inside the callback uses `tx` — a call on `prisma` would run OUTSIDE the transaction and break atomicity.',
          },
          {
            stepNumber: 3,
            stepTitle: 'the engine sends both statements in one transaction',
            codeSnippet: 'UPDATE users SET name = ? WHERE id = ?;\nUPDATE users SET name = ? WHERE id = ?;',
            explanation: 'Two parameterized statements, one transaction — a failure in the second rolls the first back.',
            visualData: { type: 'sql_lens', title: 'Statements in the batch', details: null },
          },
          {
            stepNumber: 4,
            stepTitle: 'the read shows both rows landed together',
            codeSnippet: 'SELECT id, name\nFROM users\nWHERE id IN (1, 2);',
            explanation: 'After COMMIT both updates are visible at once; after a rollback neither is — that is what atomic means.',
            visualData: { type: 'sql_lens', title: 'Generated SQL', details: null },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma12-c2-t1',
          title: 'Two database writes must succeed together: Can you make them atomic?',
          description: 'Both updates must land, or neither should.',
          instructions: ['Wrap the calls in `$transaction([...])`'],
          hint: 'Array form: `await prisma.$transaction([…])`.',
          hintLadder: [
            'The array form of transaction combines multiple independent query operations into a single atomic database transaction. All queries succeed together or roll back together if any statement encounters a constraint or connection failure.',
            'Pass an array of unawaited client calls to prisma.$transaction([ ... ]).',
            'Wrap both updates in an array without awaiting them individually:\nawait prisma.$transaction([\n  prisma.user.update({ where: { id: fromId }, data: { name: \'Sent\' } }),\n  /* second update call */,\n]);',
          ],
          scaffold: '-- Both rows the transfer touches:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id IN (1, 2);',
          why: 'Grouping the statements is what makes the pair atomic.',
          cols: ['id', 'name'],
          rows: 2,
          code0:
            'export async function transfer(fromId: number, toId: number) {\n  await prisma.user.update({ where: { id: fromId }, data: { name: \'Sent\' } });\n  await prisma.user.update({ where: { id: toId }, data: { name: \'Received\' } });\n}',
          code1:
            'export async function transfer(fromId: number, toId: number) {\n  await prisma.$transaction([\n    prisma.user.update({ where: { id: fromId }, data: { name: \'Sent\' } }),\n    prisma.user.update({ where: { id: toId }, data: { name: \'Received\' } }),\n  ]);\n}',
          need: ['$transaction(['],
          noModelContract: true,
        }),
        prismaSnippetTask({
          id: 'prisma12-c2-t2',
          title: 'The next database step depends on the previous result: Can you decide inside a transaction?',
          description: 'Read one value, then write another — in the same transaction.',
          instructions: ['Use the interactive form', 'Only ever call `tx.user.*` inside it'],
          hint: '`await prisma.$transaction(async (tx) => { … })`.',
          hintLadder: [
            'Interactive transactions provide a dedicated transaction client instance passed into an asynchronous callback. Any query intended to execute within the transaction boundary must be called on that callback argument rather than the root client.',
            'Use await prisma.$transaction(async (tx) => { ... }) and replace every prisma call with tx.',
            'Wrap the read and write inside the callback using tx:\nreturn await prisma.$transaction(async (tx) => {\n  const existing = await tx.user.findFirst({ where: { email } });\n  if (existing) return existing;\n  return await tx.user.create({ data: { /* fields */ } });\n});',
          ],
          scaffold: '-- The row created inside the transaction:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: "SELECT id, name FROM users WHERE email = 'mina@prisma.io';",
          why: 'Every statement on `tx` joins the transaction; `prisma` would not.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function promote(name: string, email: string) {\n  const user = await prisma.user.findFirst({ where: { email } });\n  return await prisma.user.create({ data: { name, email } });\n}',
          code1:
            'export async function promote(name: string, email: string) {\n  return await prisma.$transaction(async (tx) => {\n    const existing = await tx.user.findFirst({ where: { email } });\n    if (existing) return existing;\n    return await tx.user.create({ data: { name, email } });\n  });\n}',
          need: ['$transaction(async (tx)', 'tx.user.create('],
          // Task 0.2: the in-transaction `create` param must not render NULL.
          demoVariables: { name: 'Alexandra' },
          noModelContract: true,
          ban: ['await prisma.user.create('],
        }),
        prismaSnippetTask({
          id: 'prisma12-c2-t3',
          title: 'The second operation fails: Can you prove the first operation was rolled back?',
          description:
            'When an error is thrown inside an interactive transaction, every write in that transaction is rolled back, leaving database state completely untouched.',
          instructions: [
            'Use interactive `$transaction(async (tx) => { ... })`',
            'Perform the write using `tx.user.update`',
            'Throw an error to trigger automatic rollback and catch it outside',
          ],
          hint: 'Any unhandled error inside the $transaction callback triggers a ROLLBACK before propagating to your catch block.',
          hintLadder: [
            'When an exception is thrown inside an interactive transaction callback, Prisma sends a rollback command to the database engine before rejecting the outer transaction promise. Unhandled rejections preserve initial state without leaking partial mutations.',
            'Wrap the interactive transaction in a try-catch block, execute the mutation on tx, and throw an error when the failure flag is true.',
            'Execute the update on tx and throw inside try:\ntry {\n  await prisma.$transaction(async (tx) => {\n    await tx.user.update({ where: { id }, data: { name: newName } });\n    if (shouldFail) {\n      throw new Error(/* message */);\n    }\n  });\n} catch (err) { /* log or handle */ }',
          ],
          scaffold:
            '-- Database state invariant: User 1 name is preserved after rollback:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'ACID atomicity guarantees that either all operations succeed or the database state remains completely unmodified.',
          cols: ['id', 'name'],
          rows: 1,
          code0:
            'export async function executeWithRollback(id: number, newName: string, shouldFail: boolean) {\n  // BUG: Direct write without transaction persists partial state even if an error throws\n  await prisma.user.update({ where: { id }, data: { name: newName } });\n  if (shouldFail) throw new Error(\'Simulated failure\');\n}',
          code1:
            'export async function executeWithRollback(id: number, newName: string, shouldFail: boolean) {\n  try {\n    await prisma.$transaction(async (tx) => {\n      await tx.user.update({ where: { id }, data: { name: newName } });\n      if (shouldFail) {\n        throw new Error(\'Simulated failure: rolling back\');\n      }\n    });\n  } catch (err) {\n    console.log(\'Rollback preserved invariant state.\');\n  }\n}',
          need: ['prisma.$transaction(async (tx)', 'tx.user.update(', 'throw new Error(', 'catch (err)'],
          ban: ['await prisma.user.update('],
          demoVariables: { newName: 'Alex Updated', name: 'Alex Updated' },
          noModelContract: true,
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma12-challenge',
    title: 'Final Challenge — Multi-Vendor Checkout Engine',
    scenario: 'One transaction: touch the buyer, create the vendor row, return the buyer.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma12-hw-1',
          title: 'Build a checkout that never leaves a half completed order',
          description: 'Both writes belong to the same transaction, and only `tx` may be used.',
          instructions: ['Use the interactive `$transaction`', 'Call `tx.user.update` and `tx.user.create`'],
          hint: 'Everything inside the callback must use `tx`, never `prisma`.',
          hintLadder: [
            'Multi-party financial or checkout flows require interactive transactions so reading, updating, and inserting dependent records commit together. Running both actions through the transactional client prevents ledger inconsistency if any mutation fails.',
            'Return the promise from prisma.$transaction(async (tx) => { ... }), updating the buyer and creating the vendor on tx.',
            'Perform both updates on tx and return the buyer:\nreturn await prisma.$transaction(async (tx) => {\n  const buyer = await tx.user.update({\n    where: { email: buyerEmail },\n    data: { name: \'Buyer\' },\n    select: { id: true, email: true },\n  });\n  await tx.user.create({\n    data: { name: \'Vendor\', email: /* vendor email */ },\n  });\n  return buyer;\n});',
          ],
          fromScratch: true,
          scaffold: '-- The buyer row the transaction returns:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'A rollback takes both writes with it, so the ledger can never half-commit.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function checkout(buyerEmail: string) {\n  // Execute interactive transaction across buyer and vendor from scratch:\n\n}',
          code1:
            'export async function checkout(buyerEmail: string) {\n  return await prisma.$transaction(async (tx) => {\n    const buyer = await tx.user.update({\n      where: { email: buyerEmail },\n      data: { name: \'Buyer\' },\n      select: { id: true, email: true },\n    });\n\n    await tx.user.create({\n      data: { name: \'Vendor\', email: \'vendor@prisma.io\' },\n    });\n\n    return buyer;\n  });\n}',
          need: ['$transaction(async (tx)', 'tx.user.update(', 'await tx.user.create('],
          noModelContract: true,
          ban: ['await prisma.user.create('],
        }),
        type: 'challenge',
      },
    ],
  },
};
