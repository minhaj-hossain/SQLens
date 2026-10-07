import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 2 — Field Modifiers & Defaults.
 * Shape: Module -> 4 Concepts -> rich theory + tasks -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: Optional fields with `?` (Schema Mode)
 *   Concept 2: Default values with `@default()` and `@default(now())` (Schema Mode)
 *   Concept 3: Point lookup with `prisma.user.findUnique()` (Query Mode)
 *   Concept 4: Precise projection with `select` (Query Mode)
 *   Challenge: Single Member Inspector (Query Mode from scratch)
 */
export const Prisma_02_MODULE: ModuleData = {
  id: 'prisma-02',
  slug: 'field-modifiers-and-defaults',
  day: 2,
  title: 'Day 2 — Field Modifiers & Defaults',
  shortTitle: 'Modifiers & Defaults',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description:
    'Handle nullable fields with the ? modifier, attach default values with @default(), and perform your first point lookup using findUnique().',
  estimatedMinutes: 45,
  curriculumOrder: 2,
  displayLabel: 'Day 2',
  completionLearnings: [
    'Model nullable/optional fields using the ? modifier on the scalar type',
    'Assign static defaults (@default("USER")) and dynamic defaults (@default(now()))',
    'Execute targeted single-row queries using prisma.user.findUnique()',
    'Combine point lookups with select projections to return minimal safe payloads',
    'Understand the SQL difference between NULL columns, DEFAULT constraints, and WHERE id = 1',
  ],
  concepts: [
    {
      id: 'optional-fields',
      order: 1,
      title: 'Optional Fields with the ? Modifier',
      shortDescription:
        'Model nullable fields by appending the ? modifier directly to the scalar type.',
      theory: richPrismaTheory({
        summary:
          'In relational databases, columns are either required (`NOT NULL`) or optional (`NULL`). In Prisma Schema, fields are required by default. To make a field optional, append `?` directly to its scalar type: `bio String?`.',
        takeaway: 'Append ? to the scalar type (String?, Int?) to make a field nullable/optional.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode: 'model User {\n  id   Int     @id @default(autoincrement())\n  name String\n  bio  String?\n}',
        heroLang: 'prisma',
        heroWhy: 'The ? modifier allows the bio column to store NULL when omitted.',
        mentalModel:
          'In TypeScript, optional properties put the question mark on the key: `bio?: string`. In Prisma Schema, the question mark goes on the TYPE: `bio String?`. Writing `bio? String` is a syntax error.',
        explanation: [
          'All fields without a modifier are strictly required in both the schema and generated database tables.',
          'Appending `?` to a scalar type (`String?`, `Int?`, `DateTime?`) marks it as optional.',
          'When queried through Prisma Client, optional fields are typed as `T | null` (e.g. `string | null`).',
          'During inserts, optional fields can be safely omitted without triggering constraint violations.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Identify the optional column',
            codeSnippet: 'bio String?',
            explanation: 'The question mark immediately follows String, indicating nullable storage.',
          },
          {
            stepNumber: 2,
            stepTitle: 'SQL generation for nullable read',
            codeSnippet: 'SELECT id, name, bio FROM users WHERE id = 1;',
            explanation: 'Prisma maps String? to a nullable text column in SQL.',
            visualData: { type: 'sql_lens', title: 'Nullable Column Query', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Client type inference',
            codeSnippet: '{ bio: string | null }',
            explanation: 'TypeScript autocomplete and type checker enforce null handling.',
            visualData: { type: 'type_preview', title: 'TypeScript Inferred Type', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: '? Belongs to the Type',
              description: 'Always write `name String?`, never `name? String`. The modifier is part of the type definition in Prisma.',
              badge: 'Syntax',
            },
            {
              ruleNumber: 2,
              title: 'Prisma Uses null, Not undefined',
              description: 'In database queries, omitted optional values evaluate to `null` rather than JavaScript `undefined`.',
              badge: 'Runtime',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Nullability to Prisma Modifiers',
          mappings: [
            {
              sql: 'bio TEXT NULL',
              prisma: 'bio String?',
              note: 'Permits null values when a profile is created without a bio',
            },
            {
              sql: 'name VARCHAR(255) NOT NULL',
              prisma: 'name String',
              note: 'Required column, cannot contain null',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma02-c1-t1',
          title: 'Make a profile field optional: Add bio String?',
          description: 'Declare an optional bio field on the User model using the ? modifier on the scalar type.',
          instructions: [
            'Inside `model User`, declare a field named `bio`',
            'Make it an optional text field using `String?`',
          ],
          hintLadder: [
            'Place the question mark directly on the scalar type name.',
            'Declare the field on its own line: `bio String?`.',
            'Add `bio String?` inside the model User block.',
          ],
          scaffold: '-- Validating optional field bio String?:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'The ? modifier makes a field optional in the schema and nullable in the database.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n  // Add an optional bio field of type String below:\n\n}',
          code1: 'model User {\n  id   Int     @id @default(autoincrement())\n  name String\n  bio  String?\n}',
          need: ['bio String?'],
          ban: ['bio? String'],
        }),
        prismaSnippetTask({
          id: 'prisma02-c1-t2',
          title: 'Model optional profile attributes: Combine required and nullable fields',
          description: 'Model real-world user profiles with a mix of required identity fields and optional profile metadata.',
          instructions: [
            'In `model User`, keep `id`, `name`, and `email`',
            'Add an optional `avatarUrl` field with type `String?`',
            'Add an optional `age` field with type `Int?`',
          ],
          hintLadder: [
            'Each field takes its own line with no trailing punctuation.',
            'Declare `avatarUrl String?` and `age Int?`.',
            'Complete model with:\n  avatarUrl String?\n  age Int?',
          ],
          scaffold: '-- Validating mixed required and optional fields:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Nullable modifiers represent non-mandatory user attributes.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id        Int     @id @default(autoincrement())\n  name      String\n  email     String\n  // Add optional avatarUrl (String?) and optional age (Int?) below:\n\n}',
          code1: 'model User {\n  id        Int     @id @default(autoincrement())\n  name      String\n  email     String\n  avatarUrl String?\n  age       Int?\n}',
          need: ['avatarUrl String?', 'age Int?'],
        }),
      ],
    },
    {
      id: 'default-values',
      order: 2,
      title: 'Default Values with @default()',
      shortDescription:
        'Supply fallback values for omitted fields with static and dynamic @default() attributes.',
      theory: richPrismaTheory({
        summary:
          'The `@default()` attribute provides automatic fallback values when records are inserted without specifying a field. Defaults can be static primitives (`"USER"`, `true`) or database generator functions (`now()`, `autoincrement()`).',
        takeaway: '@default() sets automatic values on record insertion; now() generates current timestamps.',
        sql: 'SELECT id, name, email FROM users WHERE id = 1;',
        heroCode: 'model User {\n  id        Int      @id @default(autoincrement())\n  name      String\n  role      String   @default("USER")\n  createdAt DateTime @default(now())\n}',
        heroLang: 'prisma',
        heroWhy: 'Static default ("USER") and dynamic default (now()) automate data population.',
        mentalModel:
          'Defaults simplify mutations. Without defaults, every insert must supply values for role and timestamps. With @default(), callers can omit these fields, and the database fills them in reliably.',
        explanation: [
          'Static string defaults are quoted inside parentheses: `@default("USER")`.',
          'Static boolean and number defaults are unquoted: `@default(true)`, `@default(0)`.',
          'Dynamic timestamp defaults call the database time function: `@default(now())`.',
          'Defaults ensure data consistency even when application code forgets to supply values.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare field with scalar type',
            codeSnippet: 'createdAt DateTime',
            explanation: 'Use DateTime to store timestamp information.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Attach @default(now())',
            codeSnippet: 'createdAt DateTime @default(now())',
            explanation: 'Instructs the database to stamp the current time on record creation.',
            visualData: { type: 'type_preview', title: 'Default Generator', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'SQL insert with defaults',
            codeSnippet: 'INSERT INTO users (name, role, created_at) VALUES (\'Alex\', \'USER\', CURRENT_TIMESTAMP);',
            explanation: 'The database engine evaluates default expressions automatically.',
            visualData: { type: 'sql_lens', title: 'INSERT with DEFAULT', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Function Calls Need Parentheses',
              description: 'Generator defaults like now() and autoincrement() must include parentheses. Writing @default(now) is invalid.',
              badge: 'Syntax',
            },
            {
              ruleNumber: 2,
              title: 'String Quotes Inside Parentheses',
              description: 'String literals inside @default require double quotes: @default("USER").',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Defaults to Prisma Attributes',
          mappings: [
            {
              sql: 'role VARCHAR(50) DEFAULT \'USER\'',
              prisma: 'role String @default("USER")',
              note: 'Static string default value on insertion',
            },
            {
              sql: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
              prisma: 'createdAt DateTime @default(now())',
              note: 'Automatic timestamp generated at insertion time',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma02-c2-t1',
          title: 'Add an automatic timestamp: Configure createdAt with @default(now())',
          description: 'Attach a default timestamp to track when user records are created.',
          instructions: [
            'Inside `model User`, add a field named `createdAt`',
            'Set its type to `DateTime` with attribute `@default(now())`',
          ],
          hintLadder: [
            'The attribute follows the field type: `createdAt DateTime @default(now())`.',
            'Be sure to include parentheses on `now()`.',
            'Write: `createdAt DateTime @default(now())`.',
          ],
          scaffold: '-- Validating createdAt DateTime @default(now()):\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@default(now()) stamps the current timestamp automatically on insert.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n  // Add createdAt DateTime with default current timestamp below:\n\n}',
          code1: 'model User {\n  id        Int      @id @default(autoincrement())\n  name      String\n  createdAt DateTime @default(now())\n}',
          need: ['createdAt DateTime @default(now())'],
        }),
        prismaSnippetTask({
          id: 'prisma02-c2-t2',
          title: 'Model default user settings: Combine static and dynamic defaults',
          description: 'Configure standard default values for user roles and account activity status.',
          instructions: [
            'In `model User`, add `role String @default("USER")`',
            'Add `isActive Boolean @default(true)`',
          ],
          hintLadder: [
            'String defaults require quotes inside parentheses: `@default("USER")`.',
            'Boolean defaults are unquoted: `@default(true)`.',
            'Add both lines:\n  role String @default("USER")\n  isActive Boolean @default(true)',
          ],
          scaffold: '-- Validating static and boolean defaults:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Static defaults populate default settings without requiring caller input.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n  // Add role String defaulting to "USER" and isActive Boolean defaulting to true below:\n\n}',
          code1: 'model User {\n  id       Int     @id @default(autoincrement())\n  name     String\n  role     String  @default("USER")\n  isActive Boolean @default(true)\n}',
          need: ['role String @default("USER")', 'isActive Boolean @default(true)'],
        }),
      ],
    },
    {
      id: 'first-point-lookup',
      order: 3,
      title: 'Point Lookup with findUnique()',
      shortDescription:
        'Retrieve a single specific record by unique identifier with prisma.user.findUnique().',
      theory: richPrismaTheory({
        summary:
          '`findUnique()` searches for exactly one record using a unique identifier (`@id` or `@unique`). If a matching row exists, it returns the typed object; if no match exists, it returns `null`.',
        takeaway: 'findUnique({ where: { id } }) retrieves exactly one record or returns null.',
        sql: 'SELECT id, name, email FROM users WHERE id = 1;',
        heroCode: 'const user = await prisma.user.findUnique({\n  where: { id: 1 },\n});',
        heroLang: 'typescript',
        heroWhy: 'Fetch a single record by primary key without array wrappers.',
        mentalModel:
          '`findMany()` returns an array (`User[]`), which might be empty `[]`. In contrast, `findUnique()` returns a single entity or null (`User | null`). It requires a unique field in the where clause.',
        explanation: [
          '`findUnique()` is optimized for point lookups by unique key.',
          'The `where` argument requires a field marked with `@id` or `@unique`.',
          'Prisma translates `findUnique` into a SQL query with `LIMIT 1`.',
          'You can add `select` to specify exactly which columns are returned.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Call findUnique on model delegate',
            codeSnippet: 'prisma.user.findUnique',
            explanation: 'Targets the user model for a single-record lookup.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Provide unique where criteria',
            codeSnippet: 'where: { id: userId }',
            explanation: 'Locates the row by its unique primary key.',
          },
          {
            stepNumber: 3,
            stepTitle: 'SQL generation',
            codeSnippet: 'SELECT id, name, email FROM users WHERE id = 1 LIMIT 1;',
            explanation: 'The Query Engine emits an exact point query.',
            visualData: { type: 'sql_lens', title: 'WHERE id = 1 LIMIT 1', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Only Unique Fields in findUnique',
              description: 'You cannot use non-unique fields (like name) in findUnique where clauses. Use findFirst for non-unique criteria.',
              badge: 'Constraint',
            },
            {
              ruleNumber: 2,
              title: 'Nullable Return Value',
              description: 'Because a record might not exist, findUnique return types always include null: User | null.',
              badge: 'TypeScript',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Point Lookups to Prisma Client',
          mappings: [
            {
              sql: 'SELECT * FROM users WHERE id = 1 LIMIT 1;',
              prisma: 'await prisma.user.findUnique({ where: { id: 1 } })',
              note: 'Point query returning single object or null',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma02-c3-t1',
          title: 'Target an exact record: Retrieve user by ID with findUnique()',
          description: 'Fetch and return a single user using their unique ID with findUnique.',
          instructions: [
            'Inside `getUserById`, call `await prisma.user.findUnique()`',
            'Pass `where: { id: userId }` to locate the user',
            'Return the resulting record',
          ],
          hintLadder: [
            'Use `findUnique` on the user model delegate: `prisma.user.findUnique({ where: { id: userId } })`.',
            'Await the call and return its result.',
            'Write: `return await prisma.user.findUnique({ where: { id: userId } });`',
          ],
          scaffold: '-- Retrieve user by id:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'findUnique fetches a single record matching a unique key.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 1,
          code0: 'export async function getUserById(userId: number) {\n  // Fetch and return the unique user with the given id:\n\n}',
          code1: 'export async function getUserById(userId: number) {\n  return await prisma.user.findUnique({\n    where: { id: userId },\n  });\n}',
          rtype: '{ id: number; name: string; email: string } | null',
          workspaceMode: 'query',
        }),
      ],
    },
    {
      id: 'precise-projection',
      order: 4,
      title: 'Precise Projection with select',
      shortDescription:
        'Use the select object to return only the specific columns you need, instead of fetching the entire row.',
      theory: richPrismaTheory({
        summary:
          'By default, Prisma queries return all scalar fields of a record. Using the `select` object allows you to project only the fields you actually need. This improves performance and prevents over-fetching sensitive data.',
        takeaway: 'Pass a select object with true values to explicitly choose which fields are returned.',
        sql: 'SELECT id, email FROM users WHERE id = 1;',
        heroCode: 'const userEmail = await prisma.user.findUnique({\n  where: { id: 1 },\n  select: {\n    id: true,\n    email: true,\n  },\n});',
        heroLang: 'typescript',
        heroWhy: 'Reduces database load and prevents accidental exposure of sensitive data like passwords.',
        mentalModel:
          'Think of `select` as the `SELECT column1, column2` part of a SQL query. If you do not provide `select`, Prisma runs `SELECT *`.',
        explanation: [
          'The `select` object is passed alongside `where` in query methods.',
          'Set a field to `true` to include it in the returned object.',
          'If you use `select`, ONLY the specified fields are returned. All other fields are omitted.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Add a select block',
            codeSnippet: 'select: { }',
            explanation: 'Include a select block in your query arguments.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Specify fields',
            codeSnippet: 'email: true',
            explanation: 'Set the fields you want to return to true.',
          },
          {
            stepNumber: 3,
            stepTitle: 'SQL generation',
            codeSnippet: 'SELECT id, email FROM users WHERE id = 1 LIMIT 1;',
            explanation: 'Only the requested columns are fetched from the database.',
            visualData: { type: 'sql_lens', title: 'Targeted Select', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Boolean Values Only',
              description: 'You must use boolean `true` in the select object to include a field.',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL SELECT to Prisma select',
          mappings: [
            {
              sql: 'SELECT id, email FROM users;',
              prisma: 'await prisma.user.findMany({ select: { id: true, email: true } })',
              note: 'Explicitly requesting specific columns',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma02-c4-t1',
          title: 'Precise projection: Point lookup with select',
          description: 'Retrieve a single user and project only their id and email fields.',
          instructions: [
            'Call `await prisma.user.findUnique()` with `where: { id: userId }`',
            'Add a `select` block projecting `id: true` and `email: true`',
            'Return the query result',
          ],
          hintLadder: [
            'Combine `where` and `select` inside the argument object.',
            'Include `select: { id: true, email: true }`.',
            'Write: `return await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- Retrieve user id and email:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: 'Pairing findUnique with select produces a minimal typed record.',
          select: ['id', 'email'],
          cols: ['id', 'email'],
          rows: 1,
          code0: 'export async function getUserEmail(userId: number) {\n  // Fetch user by id and return only id and email:\n  return await prisma.user.findUnique({\n\n  });\n}',
          code1: 'export async function getUserEmail(userId: number) {\n  return await prisma.user.findUnique({\n    where: { id: userId },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
          workspaceMode: 'query',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma02-challenge',
    title: 'Final Challenge: Fetch Name and Email, Omit ID',
    scenario:
      'Given member ID 1, write a typed query from scratch that returns only their name and email, omitting id to adhere to the principle of least privilege.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaReadTask({
        id: 'prisma02-hw-1',
        title: 'Final Challenge: Fetch Name and Email, Omit ID',
        description: 'Fetch user 1 by ID and return ONLY name and email from scratch. DO NOT return the id.',
        instructions: [
          'Write the query from scratch inside `inspectMember(id: number)`',
          'Use `prisma.user.findUnique` with `where: { id }`',
          'Project ONLY `name` and `email` using `select`',
          'Ensure `id` is OMITTED from the select object',
        ],
        hintLadder: [
          'Call `prisma.user.findUnique` passing `where: { id }` and `select: { name: true, email: true }`.',
          'Do not include `id: true` in the select object.',
          'Complete function: `return await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });`',
        ],
        scaffold: '-- Inspect user without id:\nSELECT name, email FROM users WHERE id = 99;',
        solutionSql: 'SELECT name, email FROM users WHERE id = 1;',
        why: 'Least-privilege point lookups prevent leaking internal table IDs.',
        select: ['name', 'email'],
        cols: ['name', 'email'],
        noCols: ['id'],
        rows: 1,
        code0: 'export async function inspectMember(id: number) {\n  // Write the query from scratch:\n  // IMPORTANT: Return ONLY `name` and `email`. Omit `id`!\n\n}',
        code1: 'export async function inspectMember(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: {\n      name: true,\n      email: true,\n    },\n  });\n}',
        rtype: '{ name: string; email: string } | null',
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'query',
      }),
    ],
  },
};
