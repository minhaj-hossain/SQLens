import { ModuleData } from '../../../types/curriculum';

/**
 * Prisma Day 1 — Why Prisma? (Pilot module, Phase 1).
 * Shape mirrors SQL Day 1: Module → Concepts → theory + ≥2 tasks + challenge.
 * Prisma-only content rides on OPTIONAL `prisma` extensions; SQL fields stay
 * populated so shared components render and execute without forks.
 * IDs use `prisma-NN` — never collides with SQL `day-NN`.
 */
export const Prisma_01_MODULE: ModuleData = {
  id: 'prisma-01',
  slug: 'why-prisma',
  day: 1,
  title: 'Day 1 — Why Prisma?',
  shortTitle: 'Why Prisma?',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description:
    'Understand the database problems Prisma solves, compare raw SQL vs query builders vs ORMs, and run your first type-safe Prisma read.',
  estimatedMinutes: 45,
  curriculumOrder: 1,
  displayLabel: 'Day 1',
  completionLearnings: [
    'Convert raw SQL queries into type-safe findUnique calls',
    'Compare raw SQL drivers vs query builders vs Prisma ORM',
    'Read one user with prisma.user.findUnique + select',
    'See the exact SQL Prisma generates (Generated SQL Lens)',
  ],
  concepts: [
    {
      id: 'raw-sql-vs-prisma',
      order: 1,
      title: 'From Raw SQL Strings to Type-Safe Reads',
      shortDescription:
        'Raw SQL drivers return untyped tuples and brittle strings; Prisma returns typed objects with autocompletion.',
      theory: {
        summary:
          'Applications work with nested objects, databases store flat tables. Raw drivers force you to bridge that gap by hand with untyped query strings. Prisma bridges it with a type-safe client.',
        introTable: {
          tableName: 'users',
          description: 'Seeded table the pilot tasks read from.',
          columns: ['id', 'name', 'email'],
          rows: [
            [1, 'Alex', 'alex@prisma.io'],
            [2, 'Mina', 'mina@prisma.io'],
            [3, 'Rafi', 'rafi@prisma.io'],
          ],
        },
        explanation: [
          'With a raw driver you write raw query strings and get back `any[]` — rename a column and you find out at runtime.',
          'With Prisma you write `prisma.user.findUnique({ where, select })` and get back a typed `User` object with autocompletion.',
          'Under the hood Prisma still sends parameterized SQL — the SQL Lens shows exactly what it generates.',
          'Interactive Onboarding: In your first task, run the query directly to observe how Prisma translates TypeScript into SQL and JSON results, then customize it with a single property!',
        ],
        targetQuery: {
          sql: 'SELECT id, name, email\nFROM users\nWHERE id = 1;',
          explanation: 'The exact SQL Prisma generates for the hero read.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM users (Find the source table)',
            sqlSnippet: 'FROM users',
            explanation: 'Both raw SQL and Prisma start from the users table.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: WHERE id = 1 + SELECT id, name, email',
            sqlSnippet: 'SELECT id, name, email',
            explanation: 'The `where` argument becomes WHERE; `select` becomes the column list.',
          },
        ],
        syntaxBlocks: [
          {
            title: 'Prisma read maps to generated SQL',
            sql: 'SELECT id, name, email\nFROM users\nWHERE id = 1;',
            description: 'One Prisma call, one predictable parameterized query.',
          },
        ],
        keyTakeaway: 'Prisma generates precise SQL and adds compile-time type safety on top.',
        exampleQuery: 'SELECT id, name, email FROM users WHERE id = 1;',
        exampleQueryExplanation: 'Fetch exactly one user with exactly three columns.',
        liveDemoSql: 'SELECT id, name, email FROM users WHERE id = 1;',
        liveDemoNotes: 'Run it — the grid shows one row with id, name, email.',
        prisma: {
          targetHero: {
            code: 'const user = await prisma.user.findUnique({\n  where: { id: 1 },\n  select: { id: true, name: true, email: true },\n});',
            language: 'typescript',
            explanation: 'Type-safe read: where picks the row, select picks the columns.',
            badge: 'Target Pattern We Dissect',
          },
          liveDemoCode:
            'export async function getUserById(userId: number) {\n  return await prisma.user.findUnique({\n    where: { id: userId },\n    select: { id: true, name: true, email: true },\n  });\n}',
        },
        mcqs: [
          {
            question: 'What does `select: { id: true, name: true }` do in a Prisma read?',
            options: [
              'A. Filters which rows are returned',
              'B. Picks which columns/fields come back (and types the result)',
              'C. Sorts the result set',
              'D. Creates a database index',
            ],
            correctIndex: 1,
            explanation: '`select` projects fields and drives the inferred TypeScript type.',
          },
        ],
      },
      masteryPoints: [
        'Know that raw drivers return untyped results',
        'Know that where maps to the WHERE clause',
        'Know that select maps to the column list + result type',
      ],
      tasks: [
        {
          id: 'prisma01-c1-t1',
          title: 'First Touch — Run, Observe & Expand Selection',
          description:
            'Run your first Prisma query to inspect the generated SQL and returned object, then add email to the selection.',
          instructions: [
            'Click Run Query to observe how Prisma executes the query and generates clean SQL',
            'Add `email: true` inside the `select` block to include the email field in the returned object',
          ],
          type: 'guided',
          skillType: 'introduce',
          gradingType: 'executable',
          primaryTable: 'users',
          initialSql:
            '-- Step 1: Run this query to observe the initial 2-column result\n-- Step 2: Add email to the SELECT list to match the final requirement\nSELECT id, name\nFROM users\nWHERE id = 1;\n',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          solutionExplanation:
            'Adding email to select instructs Prisma to include the email column in the generated SELECT statement.',
          hints: [
            { level: 1, text: 'Click Run first to see the current output: id and name for user 1.' },
            { level: 2, text: 'Add `email: true,` right below `name: true,` in the `select` block.' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'users',
            requiredColumns: ['id', 'name', 'email'],
            expectedRowCount: 1,
          },
          successMessage: 'First query executed! Notice how adding a field in select instantly updates the generated SQL.',
          prisma: {
            skillType: 'introduce',
            gradingType: 'executable',
            initialCode:
              'export async function getUserById(userId: number) {\n  // 1. Click "Run Query" to see the generated SQL and returned object!\n  // 2. Then add `email: true` inside `select` to include the user\'s email.\n  return await prisma.user.findUnique({\n    where: { id: userId },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
            solutionCode:
              'export async function getUserById(userId: number) {\n  return await prisma.user.findUnique({\n    where: { id: userId },\n    select: {\n      id: true,\n      name: true,\n      email: true,\n    },\n  });\n}',
            expectedType: '{ id: number; name: string; email: string } | null',
            validation: {
              targetModel: 'user',
              requiredMethod: 'findUnique',
              requiredFieldsInSelect: ['id', 'name', 'email'],
              requiredWhereClauses: ['id'],
              expectedRowCount: 1,
            },
          },
        },
        {
          id: 'prisma01-c1-t2',
          title: 'Catching Schema Errors at Compile Time',
          description:
            'A raw SQL query with a wrong column name only crashes at runtime. Prisma prevents invalid column lookups at compile time.',
          instructions: [
            'Notice the query is looking up `user_mail` which does not exist in the schema',
            'Change `where: { user_mail: email }` to use the valid schema field `where: { email }`',
            'Keep `select` returning `id` and `email`',
          ],
          type: 'independent',
          skillType: 'practice',
          gradingType: 'executable',
          primaryTable: 'users',
          initialSql:
            "-- In raw SQL, a typo like user_mail causes a database error.\n-- Fix the filter to use the real column `email`:\nSELECT id, email\nFROM users\nWHERE user_mail = 'mina@prisma.io';\n",
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          solutionExplanation: 'Filtering by the real `email` field matches the unique constraint and returns the user.',
          hints: [{ level: 1, text: 'Replace `user_mail: email` with `email: email` (or shorthand `email`) in `where`.' }],
          validation: {
            requireExactResult: true,
            targetTable: 'users',
            requiredColumns: ['id', 'email'],
            expectedRowCount: 1,
          },
          successMessage: 'Error caught and fixed! The schema guarantees that you can only query fields that truly exist.',
          prisma: {
            skillType: 'practice',
            gradingType: 'executable',
            initialCode:
              'export async function getActiveMember(email: string) {\n  // `user_mail` is invalid. Fix the lookup property to use the real schema field `email`:\n  return await prisma.user.findUnique({\n    where: { user_mail: "mina@prisma.io" } as any,\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
            solutionCode:
              'export async function getActiveMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
            expectedType: '{ id: number; email: string } | null',
            validation: {
              targetModel: 'user',
              requiredMethod: 'findUnique',
              requiredFieldsInSelect: ['id', 'email'],
              requiredWhereClauses: ['email'],
              expectedRowCount: 1,
            },
          },
        },
      ],
    },
  ],
  challenge: {
    id: 'prisma01-challenge',
    title: 'Final Challenge — Safe Member Lookup',
    scenario: 'Given an email, return only id + email for exactly one member to follow the principle of least privilege.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'prisma01-hw-1',
        title: 'Lookup by email, minimal fields',
        description: 'Return id + email for mina@prisma.io with findUnique, omitting name.',
        instructions: [
          'Filter by the user email: mina@prisma.io',
          'Complete the `select` block to project only `id` and `email`',
        ],
        type: 'challenge',
        skillType: 'assess',
        gradingType: 'executable',
        primaryTable: 'users',
        databaseLifecycle: 'fresh',
        initialSql:
          "-- Expected shape: one row with id + email — fill in the email filter:\nSELECT id, email\nFROM users\nWHERE ;\n",
        solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
        solutionExplanation: 'One row, two columns — the minimal safe lookup.',
        hints: [{ level: 1, text: 'Inside `select`, specify `id: true` and `email: true`.' }],
        validation: {
          requireExactResult: true,
          targetTable: 'users',
          requiredColumns: ['id', 'email'],
          forbiddenColumns: ['name'],
          expectedRowCount: 1,
        },
        successMessage: 'Challenge complete — minimal, typed, exact.',
        prisma: {
          skillType: 'assess',
          gradingType: 'executable',
          initialCode:
            'export async function lookupMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: {\n      // Select only id and email\n    },\n  });\n}',
          solutionCode:
            'export async function lookupMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
          expectedType: '{ id: number; email: string } | null',
          validation: {
            targetModel: 'user',
            requiredMethod: 'findUnique',
            requiredFieldsInSelect: ['id', 'email'],
            forbiddenFieldsInSelect: ['name'],
            requiredWhereClauses: ['email'],
            expectedRowCount: 1,
          },
        },
      },
    ],
  },
};
