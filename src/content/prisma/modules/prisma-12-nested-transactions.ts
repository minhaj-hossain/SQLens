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
          title: 'Create the parent and the child',
          description: 'Register a user and their first post in one call.',
          instructions: ['Nest `posts: { create: [...] }` inside `data`'],
          hint: '`data: { name, email, posts: { create: [{ title }] } }`.',
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
          title: 'Attach an existing row, or create it',
          description: 'The category may already exist — you only have its key.',
          instructions: ['Use `connectOrCreate`', 'Match existing rows with `where: { id: categoryId }`'],
          hint: '`connectOrCreate: { where, create }`.',
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
          title: 'Make a two-step write atomic',
          description: 'Both updates must land, or neither should.',
          instructions: ['Wrap the calls in `$transaction([...])`'],
          hint: 'Array form: `await prisma.$transaction([…])`.',
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
          title: 'Decide inside the transaction',
          description: 'Read one value, then write another — in the same transaction.',
          instructions: ['Use the interactive form', 'Only ever call `tx.user.*` inside it'],
          hint: '`await prisma.$transaction(async (tx) => { … })`.',
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
          title: 'Atomic rollback under failure',
          description:
            'When an error is thrown inside an interactive transaction, every write in that transaction is rolled back, leaving database state completely untouched.',
          instructions: [
            'Use interactive `$transaction(async (tx) => { ... })`',
            'Perform the write using `tx.user.update`',
            'Throw an error to trigger automatic rollback and catch it outside',
          ],
          hint: 'Any unhandled error inside the $transaction callback triggers a ROLLBACK before propagating to your catch block.',
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
          title: 'Atomic checkout',
          description: 'Both writes belong to the same transaction, and only `tx` may be used.',
          instructions: ['Use the interactive `$transaction`', 'Call `tx.user.update` and `tx.user.create`'],
          hint: 'Everything inside the callback must use `tx`, never `prisma`.',
          scaffold: '-- The buyer row the transaction returns:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'A rollback takes both writes with it, so the ledger can never half-commit.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function checkout(buyerEmail: string) {\n  const buyer = await prisma.user.update({\n    where: { email: buyerEmail },\n    data: { name: \'Buyer\' },\n  });\n  await prisma.user.create({ data: { name: \'Vendor\', email: \'vendor@prisma.io\' } });\n  return buyer;\n}',
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
