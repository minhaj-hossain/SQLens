import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, richPrismaTheory } from '../phase6-tasks';

/** Prisma Day 11 — Delete & Referential Actions. */
export const Prisma_11_MODULE: ModuleData = {
  id: 'prisma-11',
  slug: 'delete-and-referential-actions',
  day: 11,
  title: 'Day 11 — Delete & Referential Actions',
  shortTitle: 'Delete & Cascades',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-6',
  description: 'Delete safely: chosen referential actions at the schema level, soft deletes at the app level.',
  estimatedMinutes: 55,
  curriculumOrder: 11,
  displayLabel: 'Day 11',
  completionLearnings: [
    'Delete a single row with `delete()` using a unique selector',
    'Predict what happens to children when a parent is deleted',
    'Choose between Cascade, SetNull and Restrict',
    'Filter before you delete in bulk',
    'Implement a soft delete with `deletedAt`',
  ],
  concepts: [
    {
      id: 'referential-actions',
      order: 1,
      title: 'Referential Actions',
      shortDescription: '`onDelete: Cascade | SetNull | Restrict` decides the children\'s fate.',
      theory: richPrismaTheory({
        summary:
          'Deleting a parent leaves dependent child records in one of three states configured at the schema level: `Cascade` deletes children automatically, `SetNull` severs the link by nulling foreign keys, and `Restrict` rejects parent deletion with a constraint violation while children exist.',
        takeaway:
          'Cascade removes children, SetNull orphans them (FK must be optional), Restrict refuses deletion.',
        sql: "SELECT id\nFROM users\nWHERE email LIKE '%spam%';",
        heroCode:
          'model Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}',
        heroLang: 'prisma',
        heroWhy: 'The delete rule is declared on the relation, so foreign key integrity is guaranteed by the database engine.',
        mentalModel:
          '**The Lifecycle of Child Entities.** When a parent row is removed, relational integrity mandates a deterministic fate for any row referencing that parent. By defining `onDelete` on the child model\'s relation attribute, you instruct the database engine to enforce this lifecycle automatically without application-layer cleanup loops.',
        littleDetails: {
          title: 'Referential Action Rules',
          rules: [
            {
              ruleNumber: 1,
              title: 'SetNull requires an optional foreign key',
              description: 'You can only configure `onDelete: SetNull` if the underlying foreign key scalar is optional (e.g. `authorId Int?`). Prisma rejects the schema if applied to a required column.',
              badge: 'Schema Rule',
            },
            {
              ruleNumber: 2,
              title: 'onDelete is defined on the foreign key holder',
              description: 'Always specify `onDelete` on the model that physically holds the foreign key scalar (the child side), inside its `@relation(fields: [...], references: [...])` attribute.',
              badge: 'Placement',
            },
            {
              ruleNumber: 3,
              title: 'delete() requires a unique selector; deleteMany() takes filters',
              description: '`prisma.user.delete({ where: { id } })` throws P2025 if missing and returns the deleted record. Bulk deletion using `prisma.user.deleteMany({ where: { ... } })` returns `{ count: number }`.',
              badge: 'API Contract',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Referential Actions vs DDL Foreign Keys',
          mappings: [
            {
              prisma: 'onDelete: Cascade',
              sql: 'FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE',
              note: 'Deletes dependent child rows automatically',
            },
            {
              prisma: 'onDelete: SetNull',
              sql: 'FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL',
              note: 'Nulls foreign key column; requires nullable column',
            },
            {
              prisma: 'onDelete: Restrict',
              sql: 'FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT',
              note: 'Raises foreign key violation error if children exist',
            },
            {
              prisma: 'prisma.user.delete({ where: { id: 1 } })',
              sql: 'DELETE FROM users WHERE id = 1 RETURNING *;',
              note: 'Removes unique parent record',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'Should child records survive without the parent entity?',
              answer: 'If children are conceptually part of the parent (e.g. Invoice -> LineItems, User -> Profile), use `Cascade`. If children can be re-assigned or orphaned (e.g. Organization -> Projects), use `SetNull`. If deletion should be strictly blocked until children are cleared manually, use `Restrict`.',
            },
            {
              questionNumber: 2,
              question: 'Why does prisma.user.delete() fail when run on a record with dependent children?',
              answer: 'If the relation defaults to `Restrict` / `NoAction`, the database engine blocks the deletion with error code P2003 (Foreign key constraint violation) to protect relational integrity.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Cascade Deletion',
            codeSnippet: 'DELETE FROM users WHERE id = 1;',
            explanation:
              'When the parent row is deleted, the database automatically removes all referencing child rows in the same transaction.',
            visualData: {
              type: 'sql_lens',
              title: 'Cascade Delete Query',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Set Null Disconnection',
            codeSnippet: 'UPDATE posts SET author_id = NULL WHERE author_id = 1;',
            explanation:
              'The child records remain in the database, but their foreign key column is updated to NULL. Requires a nullable foreign key scalar.',
            visualData: {
              type: 'sql_lens',
              title: 'Set Null Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Restrict Prevention',
            codeSnippet: 'DELETE FROM users WHERE id = 1;\n-- Aborts with error if child records exist',
            explanation:
              'The database engine aborts the DELETE statement and raises a constraint error if any child record still references the parent.',
            visualData: {
              type: 'sql_lens',
              title: 'Restrict Delete Query',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c1-t1',
          title: 'A user is deleted: Can Prisma automatically remove their posts too?',
          description: 'Deleting a user must not leave orphaned posts behind.',
          instructions: ['Add `onDelete: Cascade` to the relation'],
          hint: '`@relation(fields: […], references: […], onDelete: Cascade)`.',
          hintLadder: [
            'Referential actions dictate the lifecycle of dependent child records when a parent record is deleted. Configuring cascading deletes guarantees that removing a parent record removes all linked child records automatically without leaving orphaned foreign keys.',
            'Inside the @relation attribute on the child model, add the onDelete property set to Cascade.',
            'Update the author relation in Post to declare cascading deletes: author User @relation(fields: [authorId], references: [id], onDelete: /* specify action */)',
          ],
          scaffold: '-- The row whose children disappear with it:\nSELECT id FROM users WHERE id = 99;',
          solutionSql: "SELECT id FROM users WHERE email = 'alex@prisma.io';",
          why: 'A cascade turns one DELETE into two, and nothing dangles.',
          cols: ['id'],
          rows: 1,
          code0:
            'model Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id])\n  authorId Int\n}',
          code1:
            'model Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}',
          need: ['onDelete: Cascade'],
        }),
        prismaReadTask({
          id: 'prisma11-c1-t0',
          title: 'A member requested deletion: Can you remove exactly their record?',
          description: 'Remove a single user — the selector must be unique or Prisma refuses to compile.',
          instructions: ['Use `prisma.user.delete`', '`where: { id: 1 }`', 'Select `id` and `email`'],
          hint: '`delete()` works exactly like `findUnique` and `update` — it demands a unique `where`.',
          hintLadder: [
            'Prisma single-record deletion requires an unambiguous unique filter and deletes the target row while returning its selected attributes. Calling delete with an identifier acts like findUnique but issues a SQL DELETE statement.',
            'Replace findUnique with delete, passing where with the unique identifier and selecting the needed fields.',
            'Invoke prisma.user.delete with the unique id and projection:\nreturn await prisma.user.delete({\n  where: { id },\n  select: { id: true, email: /* boolean */ },\n});',
          ],
          scaffold: '-- The row about to be deleted:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users WHERE id = 1;',
          why: '`delete()` returns the deleted row, confirming exactly one record was removed.',
          cols: ['id', 'email'],
          select: ['id', 'email'],
          method: 'delete',
          rows: 1,
          code0:
            'export async function removeUser(id: number) {\n  return await prisma.user.findUnique({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function removeUser(id: number) {\n  return await prisma.user.delete({\n    where: { id },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }',
        }),
        prismaReadTask({
          id: 'prisma11-c1-t2',
          title: 'Before deleting hundreds of records: Can you verify exactly what will be removed?',
          description: 'Delete every spam account — first prove which rows match.',
          instructions: ['Use `prisma.user.deleteMany`', 'Filter with `email: { contains: "spam" }`'],
          hint: 'The lens is the WHERE of the delete: how many rows would go?',
          hintLadder: [
            'Bulk deletion removes all records matching a filter and returns a count object rather than individual rows. If the filter matches zero rows, the operation succeeds with a count of zero.',
            'In deleteMany, provide a where object containing a string filter on the target column.',
            'Add the contains filter inside where:\nreturn await prisma.user.deleteMany({\n  where: { email: { contains: /* search string */ } },\n});',
          ],
          scaffold: '-- The table you are about to filter:\nSELECT id FROM users;',
          solutionSql: "SELECT id FROM users WHERE email LIKE '%spam%';",
          why: 'A bulk delete is exactly its WHERE clause — the lens shows zero matches.',
          cols: ['id'],
          select: [],
          method: 'deleteMany',
          rows: 0,
          code0:
            'export async function purgeSpam() {\n  return await prisma.user.deleteMany({\n    where: {},\n  });\n}',
          code1:
            'export async function purgeSpam() {\n  return await prisma.user.deleteMany({\n    where: { email: { contains: \'spam\' } },\n  });\n}',
          rtype: '{ count: number }',
        }),
      ],
    },
    {
      id: 'soft-delete',
      order: 2,
      title: 'The Soft Deletion Pattern',
      shortDescription: 'Delete by writing a timestamp, filter it out everywhere else.',
      theory: richPrismaTheory({
        summary:
          'When data must remain recoverable or audited for compliance, physical deletion is prohibited. Instead, the application implements soft deletion: a nullable timestamp `deletedAt DateTime?` is added to the model, deletion is an `update` writing the current timestamp, and active reads filter `where: { deletedAt: null }`.',
        takeaway:
          'Soft delete = `deletedAt` timestamp + `deletedAt: null` predicate on active reads.',
        sql: 'SELECT id, email\nFROM users;',
        heroCode:
          'model User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n}\n\nawait prisma.user.findMany({\n  where: { deletedAt: null },\n  select: { id: true, email: true },\n});',
        heroLang: 'prisma',
        heroWhy: 'The tombstone column is nullable, so "deleted" is a state change rather than irreversible data loss.',
        mentalModel:
          '**Tombstones vs Purges.** Hard delete (`DELETE FROM ...`) removes bytes from storage permanently. Soft delete updates an entity status flag (`deletedAt = NOW()`), keeping historical foreign key references valid and allowing immediate rollback. Every business read in the application simply scopes its query to non-tombstoned entities.',
        littleDetails: {
          title: 'Soft Deletion Rules & Gotchas',
          rules: [
            {
              ruleNumber: 1,
              title: 'deletedAt must be an optional DateTime',
              description: 'Declare `deletedAt DateTime?` in schema.prisma. Active rows hold `null`; soft-deleted rows store the timestamp when deletion occurred.',
              badge: 'Schema Design',
            },
            {
              ruleNumber: 2,
              title: 'Soft deletion executes an update, not a delete',
              description: 'Application code marks soft deletion with `prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })`. It never calls `prisma.user.delete()`.',
              badge: 'Mutation',
            },
            {
              ruleNumber: 3,
              title: 'Unique constraints collide across soft-deleted rows',
              description: 'If `email` has `@unique`, a soft-deleted user still occupies that email value, preventing new signups with that same email unless partial unique indexes or surrogate emails are used.',
              badge: 'Constraint Gotcha',
            },
          ],
        },
        sqlBridge: {
          title: 'Prisma Soft Delete vs SQL Equivalent',
          mappings: [
            {
              prisma: 'prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })',
              sql: 'UPDATE users SET deleted_at = NOW() WHERE id = $1;',
              note: 'Tombstones row without physical loss',
            },
            {
              prisma: 'prisma.user.findMany({ where: { deletedAt: null } })',
              sql: 'SELECT * FROM users WHERE deleted_at IS NULL;',
              note: 'Scopes read to live records only',
            },
          ],
        },
        howToThink: {
          decisionQuestions: [
            {
              questionNumber: 1,
              question: 'When should I choose soft deletion over hard deletion?',
              answer: 'Choose soft deletion when business rules require audit trails, GDPR grace periods, or "undo" functionality. Choose hard deletion when data privacy requires immediate physical erasure.',
            },
            {
              questionNumber: 2,
              question: 'How do I avoid forgetting where: { deletedAt: null } in my queries?',
              answer: 'Wrap your queries in centralized repository methods or use Prisma Client Extensions (`$extends.query`) to inject the `deletedAt: null` filter automatically.',
            },
          ],
        },
        steps: [
          {
            stepNumber: 1,
            stepTitle: 'Tombstone Schema Field',
            codeSnippet: 'deletedAt DateTime?',
            explanation:
              'The nullable datetime column acts as a tombstone. Null signifies active; non-null indicates when the row was deactivated.',
            visualData: {
              type: 'type_preview',
              title: 'Tombstone Field',
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Tombstone Mutation Execution',
            codeSnippet: 'UPDATE users\nSET deleted_at = NOW()\nWHERE id = 1\nRETURNING id, deleted_at;',
            explanation:
              'Soft deletion is a mutation that sets the timestamp rather than sending a destructive DELETE query.',
            visualData: {
              type: 'sql_lens',
              title: 'Tombstone Update Query',
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Active Entity Filtering',
            codeSnippet: 'SELECT id, email\nFROM users\nWHERE deleted_at IS NULL;',
            explanation:
              'Any business queries for active users explicitly filter out rows where the tombstone timestamp is set.',
            visualData: {
              type: 'sql_lens',
              title: 'Active Entity Read',
            },
          },
        ],
      }),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c2-t1',
          title: 'The business wants recovery after deletion: Can you add a soft delete timestamp?',
          description: 'Keep the row, mark the deletion.',
          instructions: ['Add `deletedAt DateTime?`', 'Filter live rows with `deletedAt: null`'],
          hint: 'A nullable timestamp is the whole mechanism.',
          hintLadder: [
            'Soft deletion preserves records in storage while treating them as inactive. By adding an optional timestamp field, active queries can filter for records where the timestamp is null without permanently destroying historical data.',
            'Add deletedAt DateTime? to the User model, and update findMany to filter where deletedAt is null.',
            'Declare deletedAt DateTime? in User, and query live rows:\nreturn await prisma.user.findMany({\n  where: { deletedAt: /* active condition */ },\n});',
          ],
          scaffold: '-- Live rows are the ones this read returns:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'A tombstone column keeps the history without keeping the row visible.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n}\n\nexport async function live() {\n  return await prisma.user.findMany();\n}',
          code1:
            'model User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n}\n\nexport async function live() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n  });\n}',
          need: ['deletedAt DateTime?', 'deletedAt: null'],
        }),
        prismaSnippetTask({
          id: 'prisma11-c2-t2',
          title: 'Deleted accounts keep appearing: Can you hide them from normal queries?',
          description: 'Return id + email for every user that is not soft-deleted.',
          instructions: ['filter with `where: { deletedAt: null }`', 'select `id` and `email`'],
          hint: 'Every read in the app gets this `where`.',
          hintLadder: [
            'Reading from a soft-deleted model requires an explicit predicate checking that the tombstone field is null. Combining this predicate with projection returns only active records and their requested columns.',
            'In findMany, keep where: { deletedAt: null } and add the required field to select.',
            'Extend the select object to include email:\nreturn await prisma.user.findMany({\n  where: { deletedAt: null },\n  select: { id: true, email: /* boolean */ },\n});',
          ],
          scaffold: '-- The live rows, keyed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'The seeded rows are all live, so the filtered read returns all three.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function live() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    select: { id: true },\n  });\n}',
          code1:
            'export async function live() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    select: { id: true, email: true },\n  });\n}',
          need: ['where: { deletedAt: null }', 'email: true'],
          rtype: '{ id: number; email: string }[]',
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma11-challenge',
    title: 'Final Challenge — GDPR Account Deletion',
    scenario: 'A deletion worker: tombstone the account, keep the audit trail, keep children sane.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaSnippetTask({
          id: 'prisma11-hw-1',
          title: 'A user requests account deletion: Deactivate the account without destroying its database record',
          description: 'Mark the account deleted and let children cascade when it is finally purged.',
          instructions: ['Cascade deletes at the schema level', 'Hide the account with `deletedAt: null`'],
          hint: 'Two mechanisms: `onDelete: Cascade` for purge, `deletedAt` for the grace period.',
          hintLadder: [
            'An enterprise deletion strategy combines application-level soft deletion for recovery periods with schema-level cascading referential actions for clean automated purges when a parent record is physically removed.',
            'In the User model add deletedAt DateTime? and posts Post[]. In the Post model, configure author User @relation(fields: [authorId], references: [id], onDelete: Cascade).',
            'Declare both models with tombstone and cascade properties:\nmodel User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n  posts     Post[]\n}\n\nmodel Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: /* action */)\n  authorId Int\n}',
          ],
          fromScratch: true,
          scaffold: '-- The account marked, not dropped:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Soft delete today, cascade purge tomorrow — both declared, neither forgotten.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            '// Declare User with deletedAt and Post with cascading relation from scratch:\nmodel User {\n  id Int @id @default(autoincrement())\n}\n',
          code1:
            'model User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n  posts     Post[]\n}\n\nmodel Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}',
          need: ['deletedAt DateTime?', 'onDelete: Cascade'],
        }),
        type: 'challenge',
      },
    ],
  },
};
