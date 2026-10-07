import type { ModuleData } from '../../../types/curriculum';
import { prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 5 — Schema Constraints & Indexes (Phase 3).
 * Shape: Module -> 5 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: Primary Keys & Unique ID Generators (@id, autoincrement, cuid, uuid)
 *   Concept 2: Defaults & Temporal Attributes (@default, @default(now()), @updatedAt)
 *   Concept 3: Single-Field & Composite Uniqueness (@unique, @@unique)
 *   Concept 4: Secondary Query Performance Indexes (@@index)
 *   Concept 5: Database Mapping & Legacy Interop (@map, @@map)
 *   Challenge: Multi-Tenant Account Architecture
 */
export const Prisma_05_MODULE: ModuleData = {
  id: 'prisma-05',
  slug: 'schema-constraints-and-indexes',
  day: 5,
  title: 'Day 5 — Schema Constraints & Indexes',
  shortTitle: 'Constraints & Indexes',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-3',
  description:
    'Master production schema architecture: choose between autoincrement, CUID, and UUID primary keys, configure temporal timestamps, enforce single and composite uniqueness, optimize queries with @@index, and map legacy database tables.',
  estimatedMinutes: 55,
  curriculumOrder: 5,
  displayLabel: 'Day 5',
  completionLearnings: [
    'Choose the appropriate primary key strategy: autoincrement(), cuid(), or uuid()',
    'Automate timestamp tracking with @default(now()) and @updatedAt',
    'Enforce data integrity with single-field @unique and composite @@unique constraints',
    'Speed up frequent query lookups with single-field and composite @@index directives',
    'Bridge Prisma models and legacy database naming conventions using @map and @@map',
  ],
  concepts: [
    {
      id: 'primary-keys-and-identifiers',
      order: 1,
      title: 'Primary Keys & Unique ID Generators',
      shortDescription:
        'Choose between autoincrementing integers, CUIDs, and UUIDs for record identity.',
      theory: richPrismaTheory({
        summary:
          'Every relational table requires a Primary Key (`@id`) to guarantee entity uniqueness. While local development often starts with sequential integers via `@default(autoincrement())`, production and distributed systems frequently use collision-resistant identifiers like `cuid()` (ordered, web-friendly) or `uuid()` (universally unique 128-bit strings) to prevent enumeration attacks and simplify client-side ID generation.',
        takeaway:
          'Use @id for primary keys. Choose autoincrement() for sequential integers, cuid() for web apps, and uuid() for enterprise interop.',
        sql: 'CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT);',
        heroCode:
          'model User {\n  id   String @id @default(cuid())\n  name String\n}',
        heroLang: 'prisma',
        heroWhy: 'Declares a collision-resistant CUID primary key using Prisma schema attributes.',
        mentalModel:
          '**The Identity Strategy.** Sequential integer IDs (`1, 2, 3`) expose total record count and allow attackers to scrape resources sequentially (`/users/1`, `/users/2`). Cryptographic strings like CUID and UUID decouple ID generation from database locks, prevent enumeration, and allow client applications to generate valid IDs before network requests complete.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Integer sequential primary key',
            codeSnippet: 'id Int @id @default(autoincrement())',
            explanation: 'Maps to native auto-incrementing serial primary keys in PostgreSQL or SQLite.',
            visualData: { type: 'type_preview', title: 'Autoincrement ID', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Collision-resistant CUID',
            codeSnippet: 'id String @id @default(cuid())',
            explanation: 'Generates horizontally scalable, URL-safe, time-sortable collision-resistant string identifiers.',
            visualData: { type: 'type_preview', title: 'CUID ID', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Universal UUID v4',
            codeSnippet: 'id String @id @default(uuid())',
            explanation: 'Generates standard 36-character canonical UUID strings compatible with external services.',
            visualData: { type: 'type_preview', title: 'UUID ID', details: null },
          },
        ],
        littleDetails: {
          title: 'Primary Key Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'Exactly one @id per model',
              description: 'Every model must have either a single `@id` attribute on a scalar field or a composite `@@id([...])` block at the model level.',
              badge: 'Cardinality',
            },
            {
              ruleNumber: 2,
              title: 'CUID vs UUID Type Mapping',
              description: 'Both `cuid()` and `uuid()` require the field type to be `String`. Prisma automatically invokes the generator function on record creation.',
              badge: 'Type Contract',
            },
            {
              ruleNumber: 3,
              title: 'Prevent Enumeration Vulnerabilities',
              description: 'Public-facing user and account models should avoid sequential integers so external users cannot deduce account volume or iterate IDs.',
              badge: 'Security',
            },
          ],
        },
        sqlBridge: {
          title: 'SQL Primary Key Mappings',
          mappings: [
            {
              sql: 'id SERIAL PRIMARY KEY',
              prisma: 'id Int @id @default(autoincrement())',
              note: 'Standard sequential auto-incrementing integer key',
            },
            {
              sql: 'id VARCHAR(30) PRIMARY KEY',
              prisma: 'id String @id @default(cuid())',
              note: 'Prisma application-level generated CUID string',
            },
            {
              sql: 'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
              prisma: 'id String @id @default(uuid())',
              note: 'Universal UUID string identifier',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c1-t1',
          title: 'Define a CUID Primary Key: Secure the User model',
          description: 'Declare a User model with a String primary key using the cuid() generator.',
          instructions: [
            'Inside `model User`, declare a field named `id` with type `String`',
            'Attach the `@id` attribute to make it the primary key',
            'Add `@default(cuid())` to generate collision-resistant IDs',
            'Include the required `name String` field',
          ],
          hintLadder: [
            'Use `String` as the scalar type for CUID identifiers.',
            'Combine `@id` with `@default(cuid())` on the `id` field.',
            'Write: `id String @id @default(cuid())` followed by `name String`.',
          ],
          scaffold: '-- Validating User model with CUID primary key:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'CUIDs provide non-enumerable, URL-friendly unique identifiers.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  // Add CUID primary key and name below:\n\n}',
          code1: 'model User {\n  id   String @id @default(cuid())\n  name String\n}',
          need: ['model User', 'id String @id @default(cuid())', 'name String'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c1-t2',
          title: 'Universal UUID Identifiers: Configure an Account model',
          description: 'Declare an Account model that generates canonical UUIDs for its primary key.',
          instructions: [
            'Define `model Account` with field `id String @id @default(uuid())`',
            'Add a required `accountNumber String` field',
          ],
          hintLadder: [
            'UUID fields use scalar type `String` with `@default(uuid())`.',
            'Declare `id String @id @default(uuid())` inside `model Account`.',
            'Add `accountNumber String` on the next line.',
          ],
          scaffold: '-- Validating Account model with UUID identifier:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'UUIDs ensure global uniqueness across distributed microservices.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Account {\n  // Add UUID primary key and accountNumber below:\n\n}',
          code1: 'model Account {\n  id            String @id @default(uuid())\n  accountNumber String\n}',
          need: ['model Account', 'id String @id @default(uuid())', 'accountNumber String'],
        }),
      ],
    },
    {
      id: 'defaults-and-timestamps',
      order: 2,
      title: 'Defaults & Temporal Attributes',
      shortDescription:
        'Attach default values and manage creation/modification timestamps automatically.',
      theory: richPrismaTheory({
        summary:
          'Prisma simplifies column defaults and temporal lifecycle tracking. Use `@default("USER")` for static values, `@default(now())` to capture creation timestamps, and `@updatedAt` to instruct Prisma to automatically touch the column with the current timestamp on every record update.',
        takeaway:
          '@default() sets initial values; @default(now()) records creation; @updatedAt automatically updates timestamps.',
        sql: 'ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;',
        heroCode:
          'model Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  status    String   @default("DRAFT")\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}',
        heroLang: 'prisma',
        heroWhy: 'Automates creation and update audit timestamps at the schema level.',
        mentalModel:
          '**Zero-Effort Auditing.** Instead of having application logic explicitly pass `new Date()` on every mutation, the Prisma Client automatically injects the current timestamp into any `@updatedAt` field during updates, and the database engine populates `@default(now())` on creation.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Static enum or string default',
            codeSnippet: 'status String @default("DRAFT")',
            explanation: 'Populates the column with "DRAFT" whenever a write omits the status attribute.',
            visualData: { type: 'type_preview', title: 'Static Default', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Creation timestamp',
            codeSnippet: 'createdAt DateTime @default(now())',
            explanation: 'Saves the current timestamp upon initial row insertion.',
            visualData: { type: 'type_preview', title: 'Creation Timestamp', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Automatic modification timestamp',
            codeSnippet: 'updatedAt DateTime @updatedAt',
            explanation: 'Prisma Client automatically updates this field whenever the record is modified.',
            visualData: { type: 'type_preview', title: 'Auto-Update Timestamp', details: null },
          },
        ],
        littleDetails: {
          title: 'Temporal Attribute Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: '@updatedAt is managed by Prisma Client',
              description: '`@updatedAt` is a Prisma Client feature. In raw SQL inserts or external database triggers, the client does not intercept the write unless handled by database triggers.',
              badge: 'Client Feature',
            },
            {
              ruleNumber: 2,
              title: 'DateTime requires ISO timestamp format',
              description: 'Prisma DateTime fields map to TIMESTAMP or TIMESTAMPTZ in relational databases and accept JavaScript Date instances in queries.',
              badge: 'Format',
            },
            {
              ruleNumber: 3,
              title: 'Combining default values with optional types',
              description: 'Fields with `@default()` do not need the `?` modifier. If omitted in code, Prisma supplies the default value.',
              badge: 'Optionality',
            },
          ],
        },
        sqlBridge: {
          title: 'Default Constraint Equivalents',
          mappings: [
            {
              sql: 'status VARCHAR(20) DEFAULT \'DRAFT\'',
              prisma: 'status String @default("DRAFT")',
              note: 'Standard SQL DEFAULT column constraint',
            },
            {
              sql: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
              prisma: 'createdAt DateTime @default(now())',
              note: 'Auto-populated insertion timestamp',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c2-t1',
          title: 'Attach Defaults & Timestamps: Configure Post status and createdAt',
          description: 'Add a default status of "DRAFT" and automatic createdAt timestamp to the Post model.',
          instructions: [
            'Inside `model Post`, declare `id Int @id @default(autoincrement())`',
            'Add `title String`',
            'Add `status String @default("DRAFT")`',
            'Add `createdAt DateTime @default(now())`',
          ],
          hintLadder: [
            'Attach `@default("DRAFT")` to the status field.',
            'Use `DateTime` with `@default(now())` for the createdAt column.',
            'Include `status String @default("DRAFT")` and `createdAt DateTime @default(now())`.',
          ],
          scaffold: '-- Validating default values on Post model:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Defaults prevent undefined states and ensure every post starts as a draft.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Post {\n  id    Int    @id @default(autoincrement())\n  title String\n  // Add status with default "DRAFT" and createdAt below:\n\n}',
          code1: 'model Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  status    String   @default("DRAFT")\n  createdAt DateTime @default(now())\n}',
          need: ['status String @default("DRAFT")', 'createdAt DateTime @default(now())'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c2-t2',
          title: 'Automatic Modification Tracking: Add @updatedAt',
          description: 'Equip the Post model with an automatically updated modification timestamp.',
          instructions: [
            'In `model Post`, preserve existing fields (`id`, `title`, `createdAt`)',
            'Add `updatedAt DateTime @updatedAt`',
          ],
          hintLadder: [
            'The `@updatedAt` attribute requires a field with scalar type `DateTime`.',
            'Do not pass arguments to `@updatedAt` — write it directly on the field.',
            'Add `updatedAt DateTime @updatedAt` inside `model Post`.',
          ],
          scaffold: '-- Validating @updatedAt timestamp directive:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@updatedAt guarantees accurate audit logs without manual application code.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  createdAt DateTime @default(now())\n  // Add updatedAt with @updatedAt below:\n\n}',
          code1: 'model Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}',
          need: ['updatedAt DateTime @updatedAt'],
        }),
      ],
    },
    {
      id: 'uniqueness-constraints',
      order: 3,
      title: 'Single-Field & Composite Uniqueness',
      shortDescription:
        'Prevent duplicate records with attribute-level @unique and multi-field @@unique.',
      theory: richPrismaTheory({
        summary:
          'Uniqueness constraints prevent duplicate entries and create underlying database unique indexes. Use `@unique` on a single column (such as email or username), and use model-level `@@unique([col1, col2])` when uniqueness depends on the combination of multiple fields (such as tenantId and slug, or provider and providerId).',
        takeaway:
          '@unique guarantees single-column uniqueness; @@unique([a, b]) enforces composite uniqueness across multiple columns.',
        sql: 'ALTER TABLE accounts ADD CONSTRAINT uq_provider_account UNIQUE (provider, provider_id);',
        heroCode:
          'model Account {\n  id         Int    @id @default(autoincrement())\n  provider   String\n  providerId String\n  userId     Int\n\n  @@unique([provider, providerId])\n}',
        heroLang: 'prisma',
        heroWhy: 'Enforces that a user cannot link the same external OAuth provider account twice.',
        mentalModel:
          '**The Composite Constraint Barrier.** While two users might both have a post with the slug `"hello-world"`, no single user should have two posts with that exact slug. `@@unique([authorId, slug])` permits duplicate slugs across the table as long as each `(authorId, slug)` tuple remains unique.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Single field unique constraint',
            codeSnippet: 'email String @unique',
            explanation: 'Creates a unique index on email; findUnique can query by this field.',
            visualData: { type: 'type_preview', title: 'Single Column Unique', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Composite model-level constraint',
            codeSnippet: '@@unique([tenantId, slug])',
            explanation: 'Enforces that the pair of fields is unique across the entire database table.',
            visualData: { type: 'type_preview', title: 'Composite Unique Index', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Querying composite unique keys',
            codeSnippet: 'prisma.account.findUnique({\n  where: {\n    provider_providerId: {\n      provider: "google",\n      providerId: "12345"\n    }\n  }\n})',
            explanation: 'Prisma generates a compound filter key combining the field names with an underscore.',
            visualData: { type: 'sql_lens', title: 'Composite WHERE clause', details: null },
          },
        ],
        littleDetails: {
          title: 'Uniqueness Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: 'findUnique requires a unique constraint',
              description: 'Prisma Client only allows `findUnique` on fields marked `@id`, `@unique`, or compounds defined in `@@unique`.',
              badge: 'Type Safety',
            },
            {
              ruleNumber: 2,
              title: 'Double @@ prefix means Model-Level',
              description: 'Directives starting with `@` apply to the field on that line. Directives starting with `@@` apply to the model block as a whole and sit at the bottom of the block.',
              badge: 'Syntax Rule',
            },
            {
              ruleNumber: 3,
              title: 'Database Error Code P2002',
              description: 'Violating a `@unique` or `@@unique` constraint at runtime triggers Prisma error code `P2002` (Unique constraint failed).',
              badge: 'Error Code',
            },
          ],
        },
        sqlBridge: {
          title: 'SQL Unique Constraint Mappings',
          mappings: [
            {
              sql: 'email TEXT UNIQUE',
              prisma: 'email String @unique',
              note: 'Standard single-column unique constraint',
            },
            {
              sql: 'UNIQUE (provider, provider_id)',
              prisma: '@@unique([provider, providerId])',
              note: 'Composite unique index spanning multiple columns',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c3-t1',
          title: 'Single-Field Constraint: Make User email unique',
          description: 'Attach the @unique constraint to the email field in the User model.',
          instructions: [
            'Inside `model User`, locate the `email String` field',
            'Append `@unique` to ensure no two users can share the same email address',
          ],
          hintLadder: [
            'Add `@unique` right after the scalar type `String`.',
            'Write: `email String @unique`.',
            'The complete field line is: `email String @unique`.',
          ],
          scaffold: '-- Validating single-column unique constraint:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@unique prevents duplicates and enables fast point lookups via findUnique.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String\n}',
          code1: 'model User {\n  id    Int    @id @default(autoincrement())\n  name  String\n  email String @unique\n}',
          need: ['email String @unique'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c3-t2',
          title: 'Composite Uniqueness: Multi-field uniqueness on TenantPage',
          description: 'Declare composite uniqueness on [tenantId, slug] in a TenantPage model.',
          instructions: [
            'Inside `model TenantPage`, declare `id Int @id @default(autoincrement())`',
            'Add `tenantId Int` and `slug String`',
            'At the bottom of the model block, declare `@@unique([tenantId, slug])`',
          ],
          hintLadder: [
            'Model-level directives use two `@` symbols: `@@unique(...)`.',
            'Pass an array of field names: `@@unique([tenantId, slug])`.',
            'Write `@@unique([tenantId, slug])` at the end of the `TenantPage` model block.',
          ],
          scaffold: '-- Validating composite unique constraint:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Composite uniqueness allows different tenants to use the same slug while preventing duplicates per tenant.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model TenantPage {\n  id       Int    @id @default(autoincrement())\n  tenantId Int\n  slug     String\n  // Add composite uniqueness constraint below:\n\n}',
          code1: 'model TenantPage {\n  id       Int    @id @default(autoincrement())\n  tenantId Int\n  slug     String\n\n  @@unique([tenantId, slug])\n}',
          need: ['@@unique([tenantId, slug])'],
        }),
      ],
    },
    {
      id: 'secondary-indexes',
      order: 4,
      title: 'Secondary Query Performance Indexes',
      shortDescription:
        'Accelerate search and sorting queries with single and composite @@index directives.',
      theory: richPrismaTheory({
        summary:
          'While unique constraints implicitly build indexes, frequent filter (`where`) and sort (`orderBy`) operations on non-unique columns require secondary indexes to avoid full table scans. Declare model-level `@@index([column])` or composite `@@index([col1, col2])` to give the database query planner high-speed B-tree search paths.',
        takeaway:
          'Declare @@index([field]) to optimize high-frequency filtering and sorting queries without enforcing uniqueness.',
        sql: 'CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);',
        heroCode:
          'model AuditLog {\n  id        Int      @id @default(autoincrement())\n  action    String\n  actorId   Int\n  createdAt DateTime @default(now())\n\n  @@index([createdAt])\n  @@index([actorId, createdAt])\n}',
        heroLang: 'prisma',
        heroWhy: 'Creates B-tree indexes that dramatically accelerate time-range queries and actor audits.',
        mentalModel:
          '**The Telephone Directory Index.** Without an index, the database engine must inspect every row in the table (a sequential scan: $O(N)$). Declaring an index creates an ordered lookup structure ($O(\\log N)$), ensuring queries run in milliseconds even across millions of records.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Single field secondary index',
            codeSnippet: '@@index([createdAt])',
            explanation: 'Optimizes queries filtering or sorting by creation timestamp.',
            visualData: { type: 'type_preview', title: 'Single Index', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Composite secondary index',
            codeSnippet: '@@index([status, createdAt])',
            explanation: 'Optimizes compound queries filtering by status and sorting by date.',
            visualData: { type: 'type_preview', title: 'Composite Index', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Generated SQL CREATE INDEX',
            codeSnippet: 'CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");',
            explanation: 'Prisma Migrate compiles @@index directly into native DDL index definitions.',
            visualData: { type: 'sql_lens', title: 'Index DDL', details: null },
          },
        ],
        littleDetails: {
          title: 'Indexing Best Practices',
          rules: [
            {
              ruleNumber: 1,
              title: 'Do not index unique fields redundantly',
              description: 'Fields marked `@id` or `@unique` already have underlying unique indexes. Adding `@@index` on them is redundant and wastes storage.',
              badge: 'Performance',
            },
            {
              ruleNumber: 2,
              title: 'Left-to-right composite index matching',
              description: 'An index on `[status, createdAt]` can accelerate queries on `status` alone, or `status` + `createdAt`, but NOT queries on `createdAt` alone.',
              badge: 'Order Rule',
            },
            {
              ruleNumber: 3,
              title: 'Write costs vs Read speeds',
              description: 'Indexes speed up read operations but slightly slow down insertions and updates because the index tree must be recalculated.',
              badge: 'Trade-off',
            },
          ],
        },
        sqlBridge: {
          title: 'SQL Index Equivalents',
          mappings: [
            {
              sql: 'CREATE INDEX idx_created ON posts(created_at);',
              prisma: '@@index([createdAt])',
              note: 'Standard B-tree secondary index declaration',
            },
            {
              sql: 'CREATE INDEX idx_status_date ON posts(status, created_at);',
              prisma: '@@index([status, createdAt])',
              note: 'Compound multi-column secondary index',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c4-t1',
          title: 'Index High-Frequency Timestamps: Accelerate createdAt searches',
          description: 'Add a secondary index on createdAt in the EventLog model.',
          instructions: [
            'In `model EventLog`, add `@@index([createdAt])` at the bottom of the model',
          ],
          hintLadder: [
            'Use model-level directive `@@index` with bracket notation.',
            'Declare `@@index([createdAt])` at the end of the block.',
            'Write: `@@index([createdAt])`.',
          ],
          scaffold: '-- Validating secondary index on createdAt:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Indexing timestamps prevents costly full-table scans during date-range filtering.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model EventLog {\n  id        Int      @id @default(autoincrement())\n  message   String\n  createdAt DateTime @default(now())\n  // Add secondary index on createdAt below:\n\n}',
          code1: 'model EventLog {\n  id        Int      @id @default(autoincrement())\n  message   String\n  createdAt DateTime @default(now())\n\n  @@index([createdAt])\n}',
          need: ['@@index([createdAt])'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c4-t2',
          title: 'Composite Secondary Index: Optimize dashboard query performance',
          description: 'Declare a compound index on [status, createdAt] in the Order model.',
          instructions: [
            'Inside `model Order`, preserve `id`, `status`, and `createdAt`',
            'Add a composite index `@@index([status, createdAt])` at the bottom of the model',
          ],
          hintLadder: [
            'List both columns inside the array: `[status, createdAt]`.',
            'Write `@@index([status, createdAt])` inside `model Order`.',
            'Add: `@@index([status, createdAt])`.',
          ],
          scaffold: '-- Validating composite secondary index:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Compound indexes optimize queries that filter by status and order by creation time.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Order {\n  id        Int      @id @default(autoincrement())\n  status    String\n  createdAt DateTime @default(now())\n  // Add composite index below:\n\n}',
          code1: 'model Order {\n  id        Int      @id @default(autoincrement())\n  status    String\n  createdAt DateTime @default(now())\n\n  @@index([status, createdAt])\n}',
          need: ['@@index([status, createdAt])'],
        }),
      ],
    },
    {
      id: 'database-mapping',
      order: 5,
      title: 'Database Mapping & Legacy Interop',
      shortDescription:
        'Bridge TypeScript camelCase conventions and legacy snake_case database tables with @map and @@map.',
      theory: richPrismaTheory({
        summary:
          'Prisma applications prefer idiomatic TypeScript naming (`camelCase` for fields, `PascalCase` for models), while relational databases often enforce `snake_case` or plural table names (`app_users`, `first_name`). Using field-level `@map("db_column")` and model-level `@@map("db_table")` allows you to write clean TypeScript code while respecting existing database naming conventions without migrations or breaking changes.',
        takeaway:
          'Use @map to rename individual columns and @@map to rename tables in the underlying database.',
        sql: 'SELECT first_name AS firstName FROM user_accounts;',
        heroCode:
          'model UserAccount {\n  id        Int    @id @default(autoincrement())\n  firstName String @map("first_name")\n  lastName  String @map("last_name")\n\n  @@map("user_accounts")\n}',
        heroLang: 'prisma',
        heroWhy: 'Preserves idiomatic TypeScript identifiers in code while maintaining legacy snake_case database schema.',
        mentalModel:
          '**The Semantic Adapter.** In your TypeScript application code, you write `user.firstName` and `prisma.userAccount.findMany()`. Prisma acts as an automatic translation layer, generating SQL that queries table `user_accounts` and column `first_name`. Neither TypeScript nor database conventions are compromised.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Field mapping with @map',
            codeSnippet: 'firstName String @map("first_name")',
            explanation: 'Maps TypeScript field firstName to physical column first_name.',
            visualData: { type: 'type_preview', title: 'Column Mapping', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Model mapping with @@map',
            codeSnippet: '@@map("user_accounts")',
            explanation: 'Maps Prisma model UserAccount to physical table user_accounts.',
            visualData: { type: 'type_preview', title: 'Table Mapping', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Generated SQL translation',
            codeSnippet: 'SELECT "id", "first_name" AS "firstName" FROM "user_accounts";',
            explanation: 'Prisma Client automatically handles column aliasing and table name substitution.',
            visualData: { type: 'sql_lens', title: 'Mapped SQL Lens', details: null },
          },
        ],
        littleDetails: {
          title: 'Mapping Rules & Conventions',
          rules: [
            {
              ruleNumber: 1,
              title: '@map does not alter generated TypeScript types',
              description: 'In your TypeScript code, generated types and query methods will always use the Prisma field and model names (`firstName`, `prisma.userAccount`).',
              badge: 'Type Fidelity',
            },
            {
              ruleNumber: 2,
              title: '@@map belongs at the model level',
              description: '`@@map` must appear inside the model block, typically placed alongside `@@index` and `@@unique` at the bottom of the block.',
              badge: 'Placement',
            },
            {
              ruleNumber: 3,
              title: 'Essential for existing enterprise databases',
              description: 'When adopting Prisma with `prisma db pull` on a legacy database, Prisma automatically generates `@map` and `@@map` annotations to preserve compatibility.',
              badge: 'Legacy Interop',
            },
          ],
        },
        sqlBridge: {
          title: 'Mapping Directives to SQL Tables',
          mappings: [
            {
              sql: 'first_name TEXT',
              prisma: 'firstName String @map("first_name")',
              note: 'Column-level name substitution',
            },
            {
              sql: 'CREATE TABLE app_users (...);',
              prisma: '@@map("app_users")',
              note: 'Table-level name substitution',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma05-c5-t1',
          title: 'Column Mapping: Map postalCode to postal_code with @map',
          description: 'Map the camelCase field postalCode to the underlying snake_case database column postal_code.',
          instructions: [
            'Inside `model Address`, declare field `postalCode String`',
            'Attach `@map("postal_code")` to map it to the underlying column',
          ],
          hintLadder: [
            'Place `@map("postal_code")` after `String`.',
            'Write: `postalCode String @map("postal_code")`.',
            'Ensure the column name is wrapped in double quotes inside `@map`.',
          ],
          scaffold: '-- Validating field-level @map directive:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@map bridges application naming conventions with database schemas.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Address {\n  id         Int    @id @default(autoincrement())\n  street     String\n  // Add postalCode mapped to "postal_code" below:\n\n}',
          code1: 'model Address {\n  id         Int    @id @default(autoincrement())\n  street     String\n  postalCode String @map("postal_code")\n}',
          need: ['postalCode String @map("postal_code")'],
        }),
        prismaSnippetTask({
          id: 'prisma05-c5-t2',
          title: 'Table Mapping: Map SystemSetting model to system_settings',
          description: 'Use @@map to connect the SystemSetting model to the legacy table system_settings.',
          instructions: [
            'In `model SystemSetting`, preserve `id`, `key`, and `value`',
            'Add `@@map("system_settings")` at the bottom of the model block',
          ],
          hintLadder: [
            'Table mapping uses the model-level double-at directive `@@map`.',
            'Pass the table name string: `@@map("system_settings")`.',
            'Add: `@@map("system_settings")` at the end of the model block.',
          ],
          scaffold: '-- Validating model-level @@map directive:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: '@@map ensures Prisma connects to existing database tables without renaming them.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model SystemSetting {\n  id    Int    @id @default(autoincrement())\n  key   String @unique\n  value String\n  // Add table mapping below:\n\n}',
          code1: 'model SystemSetting {\n  id    Int    @id @default(autoincrement())\n  key   String @unique\n  value String\n\n  @@map("system_settings")\n}',
          need: ['@@map("system_settings")'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma05-challenge',
    title: 'Final Challenge — Production Multi-Tenant Membership Schema',
    scenario:
      'You are designing the authentication and membership database for a multi-tenant enterprise SaaS platform. Given strict security and performance requirements, you must author the complete OrgMember model adhering to UUID primary keys, composite uniqueness, temporal tracking, performance indexes, and legacy table naming.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaSnippetTask({
        id: 'prisma05-hw-1',
        title: 'Architect Enterprise OrgMember Model from Specification',
        description:
          'Construct the complete OrgMember model in schema.prisma with UUID primary key, composite uniqueness on [organizationId, email], temporal audit timestamps, secondary index on [role, createdAt], and mapped table name "org_members".',
        instructions: [
          'Declare `model OrgMember`',
          'Add primary key: `id String @id @default(uuid())`',
          'Add scalar fields: `organizationId String`, `email String`, and `role String @default("MEMBER")`',
          'Add temporal fields: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`',
          'Enforce composite uniqueness on `[organizationId, email]` using `@@unique`',
          'Add a secondary query index on `[role, createdAt]` using `@@index`',
          'Map the model to the physical table `"org_members"` using `@@map`',
        ],
        hintLadder: [
          'Combine field-level attributes (`@id @default(uuid())`, `@default("MEMBER")`, `@updatedAt`) with model-level directives (`@@unique`, `@@index`, `@@map`).',
          'Model directives go at the bottom: `@@unique([organizationId, email])`, `@@index([role, createdAt])`, and `@@map("org_members")`.',
          'Review the complete block: make sure all fields and the three model-level @@ blocks are declared.',
        ],
        scaffold: '-- Validating complete enterprise OrgMember schema:\nSELECT id, name FROM users WHERE id = 99;',
        solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
        why: 'Combines all primary keys, composite constraints, indexes, defaults, and mapping directives into a production-grade schema.',
        cols: ['id', 'name'],
        rows: 1,
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'schema',
        code0: '// Architect the OrgMember model from scratch below:\n\n',
        code1:
          'model OrgMember {\n  id             String   @id @default(uuid())\n  organizationId String\n  email          String\n  role           String   @default("MEMBER")\n  createdAt      DateTime @default(now())\n  updatedAt      DateTime @updatedAt\n\n  @@unique([organizationId, email])\n  @@index([role, createdAt])\n  @@map("org_members")\n}',
        need: [
          'model OrgMember',
          'id String @id @default(uuid())',
          'organizationId String',
          'email String',
          'role String @default("MEMBER")',
          'createdAt DateTime @default(now())',
          'updatedAt DateTime @updatedAt',
          '@@unique([organizationId, email])',
          '@@index([role, createdAt])',
          '@@map("org_members")',
        ],
      }),
    ],
  },
};
