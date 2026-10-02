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
    'Explain the object-relational impedance mismatch in one minute',
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
          title: 'Rewrite raw SQL as a Prisma read',
          description: 'Convert a brittle raw SQL string into a type-safe findUnique call.',
          instructions: [
            'Match `where: { id: userId }` to filter the row',
            'Use `select: { id: true, name: true, email: true }` to limit columns',
          ],
          type: 'guided',
          skillType: 'introduce',
          gradingType: 'executable',
          primaryTable: 'users',
          initialSql: '-- Prisma reads generate a single-row SELECT — fill in the id filter:\nSELECT id, name, email\nFROM users\nWHERE ;\n',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          solutionExplanation: 'The Prisma call generates exactly this parameterized SELECT.',
          hints: [
            { level: 1, text: 'Use the `where` argument to match `id: userId`.' },
            { level: 2, text: 'Use `select: { id: true, name: true, email: true }`.' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'users',
            requiredColumns: ['id', 'name', 'email'],
            expectedRowCount: 1,
          },
          successMessage: 'Converted! Same SQL underneath, now with types on top.',
          prisma: {
            skillType: 'introduce',
            gradingType: 'executable',
            initialCode:
              "export async function getUserById(userId: number) {\n  return await prisma.user.findUnique({\n    // Complete the query\n  });\n}",
            solutionCode:
              'export async function getUserById(userId: number) {\n  return await prisma.user.findUnique({\n    where: { id: userId },\n    select: { id: true, name: true, email: true },\n  });\n}',
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
          title: 'Fix the wrong field name',
          description: 'The field is `email`, not `user_mail`. Fix the lookup.',
          instructions: [
            'Query by the real field: `where: { email }`',
            'Keep the select to `id` and `email`',
          ],
          type: 'independent',
          skillType: 'practice',
          gradingType: 'executable',
          primaryTable: 'users',
          initialSql: "-- The real column is email — fix the filter:\nSELECT id, email\nFROM users\nWHERE user_mail = 'mina@prisma.io';\n",
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          solutionExplanation: 'Filtering by the real `email` field returns one row.',
          hints: [{ level: 1, text: 'Replace `user_mail` with `email` in `where`.' }],
          validation: {
            requireExactResult: true,
            targetTable: 'users',
            requiredColumns: ['id', 'email'],
            expectedRowCount: 1,
          },
          successMessage: 'Fixed — the compiler is now your safety net.',
          prisma: {
            skillType: 'practice',
            gradingType: 'executable',
            initialCode:
              'export async function getActiveMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { user_mail: email } as any,\n  });\n}',
            solutionCode:
              'export async function getActiveMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
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
    scenario: 'Given an email, return only id + email for exactly one member.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'prisma01-hw-1',
        title: 'Lookup by email, minimal fields',
        description: 'Return id + email for mina@prisma.io with findUnique.',
        instructions: [
          'Use `prisma.user.findUnique` with `where: { email }`',
          'Select only `id` and `email`',
        ],
        type: 'challenge',
        skillType: 'assess',
        gradingType: 'executable',
        primaryTable: 'users',
        databaseLifecycle: 'fresh',
        initialSql: "-- Expected shape: one row with id + email — fill in the email filter:\nSELECT id, email\nFROM users\nWHERE ;\n",
        solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
        solutionExplanation: 'One row, two columns — the minimal safe lookup.',
        hints: [{ level: 1, text: 'where on email, select id + email.' }],
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
            'export async function lookupMember(email: string) {\n  return await prisma.user.findUnique({\n    // TODO: where + select\n  });\n}',
          solutionCode:
            'export async function lookupMember(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
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
