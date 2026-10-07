import { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 1 — Schema Foundations & Your First Query.
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: The `model` block, field names, and scalar types (Schema Mode)
 *   Concept 2: Primary Key (`@id`) and auto-increment identity (Schema Mode)
 *   Concept 3: The Model-to-Query Connection: `prisma.user.findMany()` (Query Mode)
 *   Challenge: Member Directory Projection (Query Mode from scratch)
 */
export const Prisma_01_MODULE: ModuleData = {
  id: 'prisma-01',
  slug: 'schema-foundations',
  day: 1,
  title: 'Day 1 — Schema Foundations & Your First Query',
  shortTitle: 'Schema Foundations',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-1',
  description:
    'Declare your first Prisma model with scalar types and primary keys, and experience instant data retrieval using findMany() with zero setup friction.',
  estimatedMinutes: 45,
  curriculumOrder: 1,
  displayLabel: 'Day 1',
  completionLearnings: [
    'Define database tables declaratively using model blocks in schema.prisma',
    'Assign scalar types (String, Int) to model fields',
    'Designate primary keys with @id and auto-incrementing identity with @default(autoincrement())',
    'Query seeded tables with prisma.user.findMany() to retrieve all records',
    'Observe the exact SQL Prisma generates in the SQL Lens',
  ],
  concepts: [
    {
      id: 'model-and-scalar-types',
      order: 1,
      title: 'The Model Block & Scalar Types',
      shortDescription:
        'Declare database tables as TypeScript-friendly models using field names and scalar types.',
      theory: richPrismaTheory({
        summary:
          'In Prisma, the schema file (`schema.prisma`) is the single source of truth for your database. Every database table is defined as a `model` block containing named fields and scalar types.',
        takeaway: 'Models define database tables; field names paired with scalar types define columns.',
        sql: 'SELECT id, name FROM users WHERE id = 1;',
        heroCode: 'model User {\n  name String\n  age  Int\n}',
        heroLang: 'prisma',
        heroWhy: 'A clean declarative model block mapping directly to a database table.',
        mentalModel:
          'Think of a Prisma model as a typed blueprint. Instead of writing verbose CREATE TABLE DDL strings, you declare the structure in schema.prisma, and Prisma generates matching database tables and typed client delegates.',
        explanation: [
          'A model begins with the `model` keyword followed by the model name in PascalCase (e.g. `model User`).',
          'Each field consists of a field name followed by its scalar type: `name String`, `age Int`, or `isAdmin Boolean`.',
          'Prisma scalar types map directly to native database types while providing compile-time type safety in TypeScript.',
          'In the learning workspace, you write schema models directly in the Schema Editor and receive instant structural AST feedback.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare the model container',
            codeSnippet: 'model User {\n  // fields go here\n}',
            explanation: 'The model block represents a relational table in your database.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Add scalar fields',
            codeSnippet: 'name String\nage  Int',
            explanation: 'Field names are followed by scalar types like String or Int without punctuation.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Prisma compiler validates structure',
            codeSnippet: '// AST validation ensures valid syntax and type declarations',
            explanation: 'The Schema AST engine validates your model definitions instantly.',
            visualData: { type: 'type_preview', title: 'Schema AST Validation', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'PascalCase for Model Names',
              description: 'Model names should use PascalCase (User, Post, Order). Prisma conventions use singular nouns.',
              badge: 'Convention',
            },
            {
              ruleNumber: 2,
              title: 'Core Scalar Types',
              description: 'The most common scalar types are String (text), Int (integer), Boolean (true/false), Float (floating-point decimal), and DateTime (timestamps).',
              badge: 'Types',
            },
            {
              ruleNumber: 3,
              title: 'No Commas or Semicolons',
              description: 'Prisma schema fields are separated by line breaks only. Do not add commas or semicolons at the end of field lines.',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL DDL to Prisma Schema',
          mappings: [
            {
              sql: 'CREATE TABLE users (name TEXT);',
              prisma: 'model User { name String }',
              note: 'Clean declarative syntax replacing verbose DDL statements',
            },
            {
              sql: 'age INTEGER',
              prisma: 'age Int',
              note: 'Prisma Int maps to standard database INTEGER columns',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma01-c1-t1',
          title: 'Define your first Prisma model: Add a String name field',
          description: 'Declare a simple User model with a required String name field in schema.prisma.',
          instructions: [
            'Inside the `model User` block, declare a field named `name`',
            'Assign it the scalar type `String`',
          ],
          hintLadder: [
            'A field declaration consists of the field name followed by its scalar type, separated by a space.',
            'Type `name String` on its own line inside the curly braces of `model User`.',
            'Write: `name String` inside the `model User { ... }` block.',
          ],
          scaffold: '-- Validating model User and scalar type String:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'A model field pairs a column name with its Prisma scalar type.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  // Add the name field with scalar type String below:\n\n}',
          code1: 'model User {\n  name String\n}',
          need: ['model User', 'name String'],
          ban: ['name String?'],
        }),
        prismaSnippetTask({
          id: 'prisma01-c1-t2',
          title: 'Expand the User model: Add multiple scalar types',
          description: 'Combine multiple scalar types into a single model to represent real user attributes.',
          instructions: [
            'In `model User`, keep the existing `name String` field',
            'Add an `email` field with scalar type `String`',
            'Add an `age` field with scalar type `Int`',
          ],
          hintLadder: [
            'Each field occupies its own line inside the model block with no trailing commas.',
            'Declare `email String` and `age Int` beneath `name String`.',
            'Complete the model with:\n  name String\n  email String\n  age Int',
          ],
          scaffold: '-- Validating multiple scalar types in User model:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Different scalar types map to appropriate SQL storage columns.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  name String\n  // Add email (String) and age (Int) below:\n\n}',
          code1: 'model User {\n  name String\n  email String\n  age Int\n}',
          need: ['model User', 'name String', 'email String', 'age Int'],
        }),
      ],
    },
    {
      id: 'primary-keys-identity',
      order: 2,
      title: 'Primary Keys & Auto-Increment Identity',
      shortDescription:
        'Guarantee unique row identification with @id and generate sequential numbers with @default(autoincrement()).',
      theory: richPrismaTheory({
        summary:
          'Every relational database table requires a Primary Key to uniquely identify every row. In Prisma, the `@id` attribute designates a field as the primary key, and `@default(autoincrement())` automates sequential ID generation.',
        takeaway: '@id designates primary keys; @default(autoincrement()) automates unique sequence generation.',
        sql: 'SELECT id, name, email FROM users WHERE id = 1;',
        heroCode: 'model User {\n  id   Int    @id @default(autoincrement())\n  name String\n}',
        heroLang: 'prisma',
        heroWhy: 'An auto-incrementing integer primary key provides durable unique record identity.',
        mentalModel:
          'Think of the primary key as a social security number or passport ID for database records. With @default(autoincrement()), the database engine automatically assigns 1, 2, 3... every time a new row is inserted, preventing duplicate identity conflicts.',
        explanation: [
          'Relational tables must have a primary key so individual rows can be queried, updated, and related.',
          'In Prisma schema, attributes begin with an `@` symbol and are placed after the field type.',
          'The `@id` attribute marks the field as the table primary key.',
          'Adding `@default(autoincrement())` instructs the database to generate monotonically increasing IDs automatically.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare an integer ID column',
            codeSnippet: 'id Int',
            explanation: 'The id column uses scalar type Int to store numeric identifiers.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Mark with @id',
            codeSnippet: 'id Int @id',
            explanation: 'The @id attribute informs Prisma that this column is the table Primary Key.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Attach auto-increment generator',
            codeSnippet: 'id Int @id @default(autoincrement())',
            explanation: 'Database automatically supplies the next integer on each insert.',
            visualData: { type: 'sql_lens', title: 'PRIMARY KEY AUTOINCREMENT', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: '@id is Mandatory for Models',
              description: 'In Prisma, every model must have at least one primary key declared via @id (or @@id for composite keys).',
              badge: 'Requirement',
            },
            {
              ruleNumber: 2,
              title: 'Default Function Call Syntax',
              description: 'Generator functions inside @default require trailing parentheses, such as autoincrement(), now(), or uuid().',
              badge: 'Syntax',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL to Prisma Attributes',
          mappings: [
            {
              sql: 'id INTEGER PRIMARY KEY',
              prisma: 'id Int @id',
              note: 'Designates the column as the primary key constraint',
            },
            {
              sql: 'id SERIAL PRIMARY KEY / AUTOINCREMENT',
              prisma: 'id Int @id @default(autoincrement())',
              note: 'Database automatically generates incrementing sequence values',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma01-c2-t1',
          title: 'Designate the primary key: Add @id to the id field',
          description: 'Ensure every user record can be uniquely referenced by marking id with the @id attribute.',
          instructions: [
            'Notice the `id Int` field in `model User`',
            'Append `@id` to mark it as the model primary key',
          ],
          hintLadder: [
            'Field attributes begin with an `@` sign and follow the field type.',
            'Add `@id` immediately after `id Int`.',
            'Update the line to: `id Int @id`',
          ],
          scaffold: '-- Validating primary key @id:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'The @id attribute marks the primary key for the model.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id Int\n  name String\n  email String\n}',
          code1: 'model User {\n  id Int @id\n  name String\n  email String\n}',
          need: ['id Int @id'],
          ban: ['@default(autoincrement())'],
        }),
        prismaSnippetTask({
          id: 'prisma01-c2-t2',
          title: 'Automate ID generation: Combine @id with @default(autoincrement())',
          description: 'Let the database generate IDs automatically when new records are inserted.',
          instructions: [
            'Update `id Int` so that it is both a primary key (`@id`) and auto-increments (`@default(autoincrement())`)',
            'Keep `name String` and `email String` as declared',
          ],
          hintLadder: [
            'Attributes can be chained together on the same line after the field type.',
            'Append `@default(autoincrement())` after `@id`.',
            'Declare the id line as: `id Int @id @default(autoincrement())`',
          ],
          scaffold: '-- Validating auto-incrementing identity:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users WHERE id = 1;',
          why: 'Auto-increment generates sequential IDs automatically on INSERT.',
          cols: ['id', 'name', 'email'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  // Update id to be an auto-incrementing primary key:\n  id Int\n  name String\n  email String\n}',
          code1: 'model User {\n  id Int @id @default(autoincrement())\n  name String\n  email String\n}',
          need: ['id Int @id @default(autoincrement())'],
        }),
      ],
    },
    {
      id: 'first-prisma-query',
      order: 3,
      title: 'Connecting Model to Query: Your First findMany()',
      shortDescription:
        'Experience immediate payoff: execute findMany() against seeded records without CLI friction.',
      theory: richPrismaTheory({
        summary:
          'Once your `User` model is defined, Prisma Client exposes `prisma.user` to query records. Calling `prisma.user.findMany()` retrieves all rows as typed objects with autocompletion and zero runtime boilerplate.',
        takeaway: 'Models become client delegates: prisma.user.findMany() retrieves all table rows.',
        sql: 'SELECT id, name, email FROM users;',
        heroCode: 'const users = await prisma.user.findMany();',
        heroLang: 'typescript',
        heroWhy: 'Retrieve all records from the users table in a single type-safe call.',
        mentalModel:
          'In raw SQL, querying requires establishing a connection pool, writing SELECT strings, and manually casting untyped row tuples. In Prisma, your model automatically generates the `prisma.user` delegate, which offers typed query methods like findMany().',
        explanation: [
          'Prisma Client generates a property on `prisma` for each model (e.g. `model User` -> `prisma.user`).',
          '`prisma.user.findMany()` is the Prisma equivalent of `SELECT * FROM users;`.',
          'The call returns a Promise resolving to an array of typed objects matching the seeded database.',
          'The generated array has strict TypeScript types automatically aligned with your schema definitions.',
        ],
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Access the model delegate',
            codeSnippet: 'prisma.user',
            explanation: 'Prisma Client exposes lowercase delegates for each schema model.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Call findMany()',
            codeSnippet: 'const users = await prisma.user.findMany();',
            explanation: 'Fetches all rows from the table as typed objects.',
            visualData: { type: 'type_preview', title: 'User[]', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Observe the generated SQL',
            codeSnippet: 'SELECT id, name, email FROM users;',
            explanation: 'The Query Engine translates your client method into clean, optimized SQL.',
            visualData: { type: 'sql_lens', title: 'Generated SQL Lens', details: null },
          },
        ],
        littleDetails: {
          title: 'Syntax Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Always Await Prisma Queries',
              description: 'All Prisma Client query methods return Promises and must be awaited inside async functions.',
              badge: 'Async',
            },
            {
              ruleNumber: 2,
              title: 'Lower-case Delegate Names',
              description: 'While models are PascalCase in schema.prisma (User), client delegates are camelCase (prisma.user).',
              badge: 'Convention',
            },
          ],
        },
        sqlBridge: {
          title: 'From SQL Queries to Prisma Client',
          mappings: [
            {
              sql: 'SELECT * FROM users;',
              prisma: 'await prisma.user.findMany()',
              note: 'Retrieves all rows and fields from the users table',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma01-c3-t1',
          title: 'Your first query: Retrieve all users with findMany()',
          description: 'Fetch the entire user roster using Prisma Client’s findMany() method.',
          instructions: [
            'Use `await prisma.user.findMany()` to fetch all records from the database',
            'Return the resulting user array from `getAllUsers()`',
          ],
          hintLadder: [
            'Prisma Client provides `prisma.user.findMany()` to retrieve multiple rows from the users table.',
            'Inside `getAllUsers`, return the awaited result of `prisma.user.findMany()`.',
            'Write: `return await prisma.user.findMany();`',
          ],
          scaffold: '-- Retrieve all users:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users;',
          why: 'findMany() retrieves all matching records from the model table.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 3,
          code0: 'export async function getAllUsers() {\n  // Retrieve and return all records from the user model:\n\n}',
          code1: 'export async function getAllUsers() {\n  return await prisma.user.findMany();\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
        prismaReadTask({
          id: 'prisma01-c3-t2',
          title: 'Write a complete query: Fetch all records from scratch',
          description: 'Practice writing your first Prisma query entirely from scratch.',
          instructions: [
            'Inside `fetchRoster()`, call `prisma.user.findMany()`',
            'Make sure to `await` the call and `return` the result',
          ],
          hintLadder: [
            'Call `prisma.user.findMany()` just like before.',
            'Ensure you return the awaited call.',
            'Write: `return await prisma.user.findMany();`',
          ],
          scaffold: '-- Fetch all users:\nSELECT id, name, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name, email FROM users;',
          why: 'Repetition builds muscle memory for core client delegates.',
          select: [],
          cols: ['id', 'name', 'email'],
          rows: 3,
          code0: 'export async function fetchRoster() {\n  // Write the query from scratch:\n\n}',
          code1: 'export async function fetchRoster() {\n  return await prisma.user.findMany();\n}',
          rtype: '{ id: number; name: string; email: string }[]',
          workspaceMode: 'query',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma01-challenge',
    title: 'Final Challenge — The Full Picture',
    scenario:
      'You have successfully modeled a user table and accessed it via Prisma Client. Now, prove you can bring it all together by writing the query to retrieve all member records from the database.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaReadTask({
        id: 'prisma01-hw-1',
        title: 'Final Challenge — The Full Picture',
        description: 'Write a complete query from scratch that fetches all users in the system.',
        instructions: [
          'Write the query from scratch inside `getAllMembers()`',
          'Query the `user` model with `findMany()`',
          'Return the awaited results directly',
        ],
        hintLadder: [
          'Use the `prisma.user.findMany()` delegate method.',
          'Make sure you include the `await` and `return` keywords.',
          'Complete function: `return await prisma.user.findMany();`',
        ],
        scaffold: '-- Fetch all members:\nSELECT id, name, email FROM users WHERE id = 99;',
        solutionSql: 'SELECT id, name, email FROM users;',
        why: 'The foundation of data retrieval is understanding how to ask Prisma for all records of a model.',
        select: [],
        cols: ['id', 'name', 'email'],
        rows: 3,
        code0: 'export async function getAllMembers() {\n  // Write the query from scratch:\n\n}',
        code1: 'export async function getAllMembers() {\n  return await prisma.user.findMany();\n}',
        rtype: '{ id: number; name: string; email: string }[]',
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'query',
      }),
    ],
  },
};
