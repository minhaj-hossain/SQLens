import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/**
 * Prisma Day 7 — Referential Actions & Lifecycle Integrity (Phase 4.2).
 * Shape: Module -> 3 Concepts -> rich theory + 2 tasks each -> challenge.
 *
 * Pedagogical Sequence:
 *   Concept 1: The Lifecycle of Related Records & onDelete Basics (Cascade)
 *   Concept 2: Referential Action Trade-offs (Cascade vs Restrict vs SetNull)
 *   Concept 3: Enforcing & Testing Referential Integrity
 *   Challenge: Production Multi-Tier Referential Integrity Architecture
 */
export const Prisma_07_MODULE: ModuleData = {
  id: 'prisma-07',
  slug: 'referential-actions-lifecycle',
  day: 7,
  title: 'Day 7 — Referential Actions & Lifecycle Integrity',
  shortTitle: 'Referential Actions',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description:
    'Safeguard database consistency when parents are deleted or updated: configure schema-level onDelete and onUpdate actions, master Cascade, Restrict, and SetNull, and prevent orphaned records.',
  estimatedMinutes: 50,
  curriculumOrder: 7,
  displayLabel: 'Day 7',
  completionLearnings: [
    'Understand orphan row hazards and how foreign key referential integrity prevents them',
    'Configure automatic cleanup of child records using onDelete: Cascade',
    'Sever parent connections cleanly with onDelete: SetNull on optional foreign keys',
    'Protect critical audit and transactional records from accidental deletion with onDelete: Restrict',
    'Enforce and verify referential constraints during record deletion in the client',
  ],
  concepts: [
    {
      id: 'relational-lifecycle',
      order: 1,
      title: 'The Relational Lifecycle & Deletion Cascades',
      shortDescription:
        'Prevent orphan records by configuring onDelete: Cascade on child relations.',
      theory: richPrismaTheory({
        summary:
          'When a parent record is deleted from a relational database, any child records referencing that parent are left in an invalid state unless explicit referential actions are declared. By defining `onDelete: Cascade` inside the child model\'s `@relation` directive, you instruct the database engine to automatically delete all dependent child records whenever their parent is removed, eliminating orphaned rows without manual cleanup loops.',
        takeaway:
          'onDelete: Cascade automatically removes child records when their parent record is deleted.',
        sql: 'ALTER TABLE posts ADD CONSTRAINT fk_posts_users FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;',
        heroCode:
          'model Post {\n  id       Int  @id @default(autoincrement())\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n}',
        heroLang: 'prisma',
        heroWhy: 'Instructs the database engine to cascade deletes from User down to Post.',
        mentalModel:
          '**The Domino Effect.** Imagine deleting a user account. If that user authored 50 posts and 200 comments, leaving those posts in the database creates "orphan rows" (foreign keys pointing to non-existent users). `onDelete: Cascade` tells the database: "If the parent falls, bring down all associated children automatically in the same atomic operation."',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Declare the standard relation',
            codeSnippet: 'author User @relation(fields: [authorId], references: [id])',
            explanation: 'Without onDelete specified, relational databases default to Restrict / NoAction.',
            visualData: { type: 'type_preview', title: 'Default Relation', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Attach the onDelete: Cascade argument',
            codeSnippet: 'author User @relation(fields: [authorId], references: [id], onDelete: Cascade)',
            explanation: 'Configures the relational constraint to automatically delete child rows on parent deletion.',
            visualData: { type: 'type_preview', title: 'Cascade Action', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Database enforces cascade atomically',
            codeSnippet: 'DELETE FROM users WHERE id = 1;\n-- Database engine triggers ON DELETE CASCADE for all posts',
            explanation: 'The database engine removes both the user and all associated posts in one transaction.',
            visualData: { type: 'sql_lens', title: 'Atomic Cascade DDL', details: null },
          },
        ],
        littleDetails: {
          title: 'Referential Action Rules',
          rules: [
            {
              ruleNumber: 1,
              title: 'onDelete is defined on the foreign key side',
              description: 'Always specify `onDelete` on the child model that holds the physical foreign key scalar (`Post`), not on the parent model (`User`).',
              badge: 'Placement',
            },
            {
              ruleNumber: 2,
              title: 'onUpdate synchronizes primary key updates',
              description: 'While rare when using immutable surrogate IDs, `onUpdate: Cascade` ensures changes to the parent primary key propagate to all child foreign keys.',
              badge: 'onUpdate',
            },
            {
              ruleNumber: 3,
              title: 'Database-level vs Prisma-level enforcement',
              description: 'In PostgreSQL and SQLite, referential actions are enforced by foreign key constraints in the database engine. In serverless PlanetScale, `relationMode = "prisma"` emulates this in application code.',
              badge: 'Engine',
            },
          ],
        },
        sqlBridge: {
          title: 'From Foreign Key DDL to Prisma onDelete',
          mappings: [
            {
              sql: 'FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE',
              prisma: '@relation(fields: [authorId], references: [id], onDelete: Cascade)',
              note: 'Standard SQL ON DELETE CASCADE foreign key constraint',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma07-c1-t1',
          title: 'Configure Deletion Cascade: Add onDelete: Cascade to Post',
          description: 'Attach onDelete: Cascade to the author relation on Post to remove posts when a user is deleted.',
          instructions: [
            'Inside `model Post`, locate the `author User @relation(...)` attribute',
            'Add the argument `onDelete: Cascade` inside `@relation(...)`',
          ],
          hintLadder: [
            'Add `onDelete: Cascade` inside `@relation(...)`.',
            'Write: `@relation(fields: [authorId], references: [id], onDelete: Cascade)`.',
            'Ensure the argument is separated from `references` with a comma.',
          ],
          scaffold: '-- Validating onDelete: Cascade on Post:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'onDelete: Cascade guarantees dependent posts are purged when their author is removed.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Post {\n  id       Int  @id @default(autoincrement())\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id])\n}',
          code1: 'model Post {\n  id       Int  @id @default(autoincrement())\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n}',
          need: ['onDelete: Cascade'],
        }),
        prismaSnippetTask({
          id: 'prisma07-c1-t2',
          title: 'Full Lifecycle Integrity: Configure onDelete and onUpdate',
          description: 'Configure both onDelete: Cascade and onUpdate: Cascade on the Comment model.',
          instructions: [
            'Inside `model Comment`, update the `post Post @relation(...)` attribute',
            'Add `onDelete: Cascade` and `onUpdate: Cascade`',
          ],
          hintLadder: [
            'Add both `onDelete: Cascade` and `onUpdate: Cascade` to `@relation(...)`.',
            'Write: `@relation(fields: [postId], references: [id], onDelete: Cascade, onUpdate: Cascade)`.',
            'Ensure all relation arguments are separated by commas.',
          ],
          scaffold: '-- Validating onUpdate and onDelete on Comment:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Coordinating onDelete and onUpdate guarantees complete relational lifecycle safety.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Comment {\n  id     Int    @id @default(autoincrement())\n  text   String\n  postId Int\n  post   Post   @relation(fields: [postId], references: [id])\n}',
          code1: 'model Comment {\n  id     Int    @id @default(autoincrement())\n  text   String\n  postId Int\n  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n}',
          need: ['onDelete: Cascade', 'onUpdate: Cascade'],
        }),
      ],
    },
    {
      id: 'cascade-restrict-setnull',
      order: 2,
      title: 'Referential Action Trade-offs: Cascade vs Restrict vs SetNull',
      shortDescription:
        'Choose between Cascade (delete children), Restrict (prevent deletion), and SetNull (orphan safely).',
      theory: richPrismaTheory({
        summary:
          'Different domain entities require different deletion policies. Use `Cascade` for tightly owned children that have no independent meaning (e.g. comments or posts). Use `Restrict` for critical resources that must never be deleted while references exist (e.g. invoices or team accounts). Use `SetNull` when child records should survive parent deletion by severing the foreign key link (e.g. reassigning a ticket to unassigned). Crucially, `SetNull` strictly requires the foreign key scalar to be optional (`authorId Int?`).',
        takeaway:
          'Cascade deletes children; Restrict rejects parent deletion; SetNull orphans children safely (requires optional foreign key).',
        sql: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT;',
        heroCode:
          'model Order {\n  id         Int   @id @default(autoincrement())\n  customerId Int?\n  customer   User? @relation(fields: [customerId], references: [id], onDelete: SetNull)\n}',
        heroLang: 'prisma',
        heroWhy: 'Shows SetNull on an optional foreign key to preserve orders even if a user account is deleted.',
        mentalModel:
          '**The Three Deletion Philosophies:**\n1. *Cascade:* "If the parent dies, the child dies too." (e.g. Post -> PostTags)\n2. *Restrict:* "You cannot delete the parent while children exist; clean them up first." (e.g. Customer -> Invoices)\n3. *SetNull:* "The parent is gone, but the child survives anonymously." (e.g. Ticket -> AssignedAgent)',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'onDelete: Restrict prevents parent deletion',
            codeSnippet: 'author User @relation(fields: [authorId], references: [id], onDelete: Restrict)',
            explanation: 'Throws a foreign key constraint violation if an attempt is made to delete a parent with children.',
            visualData: { type: 'type_preview', title: 'Restrict Action', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'onDelete: SetNull requires optional scalar',
            codeSnippet: 'authorId Int?\nauthor   User? @relation(fields: [authorId], references: [id], onDelete: SetNull)',
            explanation: 'The scalar column must be nullable (Int?) so the database engine can set it to NULL.',
            visualData: { type: 'type_preview', title: 'SetNull Action', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Prisma compiler rejects SetNull on required fields',
            codeSnippet: '// ERROR: Field `authorId` is not optional. `onDelete: SetNull` requires an optional field.\nauthorId Int\nauthor User @relation(..., onDelete: SetNull)',
            explanation: 'Prisma Schema AST compiler catches invalid SetNull configurations at authoring time.',
            visualData: { type: 'type_preview', title: 'Compiler Guard', details: null },
          },
        ],
        littleDetails: {
          title: 'Action Selection Criteria',
          rules: [
            {
              ruleNumber: 1,
              title: 'SetNull requires optional foreign keys',
              description: 'You cannot use `onDelete: SetNull` if the foreign key scalar is required (`Int` or `String`). You must make both the scalar (`Int?`) and relation (`User?`) optional.',
              badge: 'Schema Rule',
            },
            {
              ruleNumber: 2,
              title: 'Restrict vs NoAction',
              description: 'In Prisma and PostgreSQL, `Restrict` prevents parent deletion immediately. `NoAction` defers the check to the end of the transaction in databases that support deferred constraints.',
              badge: 'Constraint Timing',
            },
            {
              ruleNumber: 3,
              title: 'Legal and financial records require Restrict',
              description: 'In accounting, healthcare, and compliance applications, records like payments and audit logs should always use `Restrict` to prevent accidental history loss.',
              badge: 'Compliance',
            },
          ],
        },
        sqlBridge: {
          title: 'Referential Action SQL Directives',
          mappings: [
            {
              sql: 'ON DELETE RESTRICT',
              prisma: 'onDelete: Restrict',
              note: 'Blocks parent deletion while child references exist',
            },
            {
              sql: 'ON DELETE SET NULL',
              prisma: 'onDelete: SetNull',
              note: 'Nulls foreign key column in dependent child rows',
            },
          ],
        },
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma07-c2-t1',
          title: 'Configure SetNull: Preserve child documents with optional foreign key',
          description: 'Configure onDelete: SetNull on Document so documents survive user deletion.',
          instructions: [
            'In `model Document`, make `authorId Int?` optional with `?`',
            'Make `author User?` optional with `?`',
            'Add `onDelete: SetNull` to `@relation(...)` inside Document',
          ],
          hintLadder: [
            'Make the foreign key optional: `authorId Int?`.',
            'Make the relation field optional: `author User?`.',
            'Add `onDelete: SetNull`: `@relation(fields: [authorId], references: [id], onDelete: SetNull)`.',
          ],
          scaffold: '-- Validating onDelete: SetNull configuration:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'SetNull requires an optional foreign key scalar so the database engine can write NULL.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Document {\n  id       Int  @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id])\n}',
          code1: 'model Document {\n  id       Int   @id @default(autoincrement())\n  title    String\n  authorId Int?\n  author   User? @relation(fields: [authorId], references: [id], onDelete: SetNull)\n}',
          need: ['authorId Int?', 'author User?', 'onDelete: SetNull'],
        }),
        prismaSnippetTask({
          id: 'prisma07-c2-t2',
          title: 'Configure Restrict: Protect financial Invoices from deletion',
          description: 'Configure onDelete: Restrict on Invoice to reject customer account deletion when invoices exist.',
          instructions: [
            'Inside `model Invoice`, keep `customerId Int` required',
            'Update `customer User @relation(...)` to include `onDelete: Restrict`',
          ],
          hintLadder: [
            'Add `onDelete: Restrict` inside `@relation(...)`.',
            'Write: `@relation(fields: [customerId], references: [id], onDelete: Restrict)`.',
            'Keep `customerId Int` required.',
          ],
          scaffold: '-- Validating onDelete: Restrict constraint:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Restrict prevents deletion of customers who have active financial records.',
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'schema',
          code0: 'model Invoice {\n  id         Int  @id @default(autoincrement())\n  amount     Int\n  customerId Int\n  customer   User @relation(fields: [customerId], references: [id])\n}',
          code1: 'model Invoice {\n  id         Int  @id @default(autoincrement())\n  amount     Int\n  customerId Int\n  customer   User @relation(fields: [customerId], references: [id], onDelete: Restrict)\n}',
          need: ['onDelete: Restrict'],
        }),
      ],
    },
    {
      id: 'referential-action-enforcement',
      order: 3,
      title: 'Enforcing & Testing Referential Constraints',
      shortDescription:
        'Delete records with prisma.user.delete() and handle foreign key constraint behavior.',
      theory: richPrismaTheory({
        summary:
          'When executing mutations like `prisma.user.delete({ where: { id } })`, Prisma triggers the configured referential actions at the database level. If `onDelete: Cascade` is configured, dependent rows are removed automatically. If `onDelete: Restrict` is configured, the database rejects the operation and Prisma throws error code `P2003` (Foreign key constraint failed). Knowing how to invoke deletes safely is essential for production operations.',
        takeaway:
          'prisma.user.delete() triggers database referential actions; Restrict throws error P2003 if children exist.',
        sql: 'DELETE FROM users WHERE id = 3;',
        heroCode:
          'const deletedUser = await prisma.user.delete({\n  where: { id: 3 },\n  select: { id: true, email: true },\n});',
        heroLang: 'typescript',
        heroWhy: 'Deletes a parent record, triggering database referential integrity rules.',
        mentalModel:
          '**The Deletion Gate.** Deleting through Prisma Client is not merely a single-table command. It is a contract with your database\'s constraint graph. Either the entire graph adapts according to your rules (cascading or nulling), or the database raises a constraint error to protect data integrity.',
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Single record deletion requires unique where',
            codeSnippet: 'await prisma.user.delete({\n  where: { id: 1 },\n});',
            explanation: 'The delete() method requires a unique identifier (@id or @unique) in the where clause.',
            visualData: { type: 'sql_lens', title: 'Targeted DELETE', details: null },
          },
          {
            stepNumber: 2,
            stepTitle: 'Project return data on deletion',
            codeSnippet: 'await prisma.user.delete({\n  where: { id: 1 },\n  select: { id: true, email: true },\n});',
            explanation: 'Prisma returns the deleted record attributes, useful for audit logging or notifications.',
            visualData: { type: 'type_preview', title: 'Deleted Payload', details: null },
          },
          {
            stepNumber: 3,
            stepTitle: 'Bulk deletion with deleteMany',
            codeSnippet: 'await prisma.post.deleteMany({\n  where: { authorId: 1 },\n});',
            explanation: 'Used for manual child cleanup before parent deletion when Restrict is active.',
            visualData: { type: 'sql_lens', title: 'Batch Deletion', details: null },
          },
        ],
        littleDetails: {
          title: 'Deletion Invariants',
          rules: [
            {
              ruleNumber: 1,
              title: 'delete() requires unique selector',
              description: 'Unlike `deleteMany()`, `delete()` requires a unique filter (`id` or unique field) and throws `P2025` if the target record does not exist.',
              badge: 'Selector Rule',
            },
            {
              ruleNumber: 2,
              title: 'Error P2003 on Restrict violations',
              description: 'If you attempt to delete a parent whose relations have `onDelete: Restrict`, Prisma throws `PrismaClientKnownRequestError` with code `P2003`.',
              badge: 'Error Code',
            },
            {
              ruleNumber: 3,
              title: 'deleteMany does not cascade on some databases',
              description: 'In some databases or relation modes, bulk `deleteMany` skips cascade triggers unless database-level foreign key constraints are active.',
              badge: 'Performance',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma delete to SQL DELETE',
          mappings: [
            {
              sql: 'DELETE FROM users WHERE id = 1 RETURNING id, email;',
              prisma: 'prisma.user.delete({ where: { id: 1 }, select: { id: true, email: true } })',
              note: 'Atomic record deletion with returning projection',
            },
          ],
        },
      }),
      tasks: [
        prismaReadTask({
          id: 'prisma07-c3-t1',
          title: 'Targeted Deletion: Remove user record by unique identifier',
          description: 'Delete user with id 3 and return their id and email using prisma.user.delete().',
          instructions: [
            'Inside `deleteUserById`, call `await prisma.user.delete()` for user id 3',
            'Use `select` to return `id: true` and `email: true`',
            'Return the deleted record payload',
          ],
          hintLadder: [
            'Use `prisma.user.delete()` with `where: { id: 3 }`.',
            'Add `select: { id: true, email: true }`.',
            'Write: `return await prisma.user.delete({ where: { id: 3 }, select: { id: true, email: true } });`',
          ],
          scaffold: '-- Delete user 3:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 3;',
          why: 'delete() safely removes a unique record and returns projected fields.',
          method: 'delete',
          select: ['id', 'email'],
          cols: ['id', 'email'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function deleteUserById() {\n  // Delete user 3 and return id and email:\n\n}',
          code1: 'export async function deleteUserById() {\n  return await prisma.user.delete({\n    where: { id: 3 },\n    select: {\n      id: true,\n      email: true,\n    },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaReadTask({
          id: 'prisma07-c3-t2',
          title: 'Safe Cascade Verification: Remove user 1 and project remaining data',
          description: 'Delete user with id 1 using prisma.user.delete() projecting id and name.',
          instructions: [
            'Call `await prisma.user.delete()` targeting `where: { id: 1 }`',
            'Use `select` to return `id: true` and `name: true`',
            'Return the result',
          ],
          hintLadder: [
            'Target user 1 with `where: { id: 1 }`.',
            'Project `id: true` and `name: true` in `select`.',
            'Write: `return await prisma.user.delete({ where: { id: 1 }, select: { id: true, name: true } });`',
          ],
          scaffold: '-- Delete user 1:\nSELECT id, name FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
          why: 'Deleting user 1 tests referential action triggers in the database.',
          method: 'delete',
          select: ['id', 'name'],
          cols: ['id', 'name'],
          rows: 1,
          workspaceMode: 'query',
          code0: 'export async function purgeUserAccount() {\n  // Delete user 1:\n\n}',
          code1: 'export async function purgeUserAccount() {\n  return await prisma.user.delete({\n    where: { id: 1 },\n    select: {\n      id: true,\n      name: true,\n    },\n  });\n}',
          rtype: '{ id: number; name: string }',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma07-challenge',
    title: 'Final Challenge — Production Multi-Tier Referential Integrity Architecture',
    scenario:
      'You are authoring the relational integrity rules for an enterprise platform with User, Post, and AuditLog models. Posts belong to Users and must cascade on deletion. Audit logs belong to Users but must NEVER be deleted when a user is removed (using SetNull on an optional userId). Author the complete schema specification.',
    databaseLifecycle: 'fresh',
    tasks: [
      prismaSnippetTask({
        id: 'prisma07-hw-1',
        title: 'Architect Multi-Tier Referential Integrity Rules',
        description:
          'Declare the complete Post and AuditLog models with appropriate onDelete rules: Post cascades on User deletion; AuditLog sets foreign key to null on User deletion.',
        instructions: [
          'In `model Post`, add `authorId Int` and `author User @relation(fields: [authorId], references: [id], onDelete: Cascade)`',
          'In `model AuditLog`, make `userId Int?` optional',
          'Add `user User? @relation(fields: [userId], references: [id], onDelete: SetNull)` on AuditLog',
          'Include standard `id Int @id @default(autoincrement())` on both models',
        ],
        hintLadder: [
          'Post uses `onDelete: Cascade` with required `authorId Int`.',
          'AuditLog uses `onDelete: SetNull` with optional `userId Int?` and `user User?`.',
          'Ensure both models are complete with their respective `@relation` directives.',
        ],
        scaffold: '-- Validating complete multi-tier referential actions:\nSELECT id, name FROM users WHERE id = 99;',
        solutionSql: 'SELECT id, name FROM users WHERE id = 1;',
        why: 'Combines Cascade and SetNull referential actions into an airtight enterprise schema.',
        cols: ['id', 'name'],
        rows: 1,
        skillType: 'assess',
        fromScratch: true,
        workspaceMode: 'schema',
        code0: '// Architect Post (Cascade) and AuditLog (SetNull) below:\n\n',
        code1:
          'model Post {\n  id       Int  @id @default(autoincrement())\n  title    String\n  authorId Int\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n}\n\nmodel AuditLog {\n  id     Int    @id @default(autoincrement())\n  action String\n  userId Int?\n  user   User?  @relation(fields: [userId], references: [id], onDelete: SetNull)\n}',
        need: [
          'model Post',
          'onDelete: Cascade',
          'model AuditLog',
          'userId Int?',
          'user User?',
          'onDelete: SetNull',
        ],
      }),
    ],
  },
};
