import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 11 — Delete & Referential Actions. */
export const Prisma_11_MODULE: ModuleData = {
  id: 'prisma-11',
  slug: 'delete-and-referential-actions',
  day: 11,
  title: 'Day 11 — Delete & Referential Actions',
  shortTitle: 'Delete & Cascades',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-3',
  description: 'Delete safely: chosen referential actions at the schema level, soft deletes at the app level.',
  estimatedMinutes: 55,
  curriculumOrder: 11,
  displayLabel: 'Day 11',
  completionLearnings: [
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
      theory: prismaTheory(
        'Deleting a parent leaves the children in one of three states, and Prisma makes you choose at schema level: `Cascade` deletes them too, `SetNull` orphans them (the FK must be optional), `Restrict` refuses the delete until they are gone.',
        'Cascade deletes children, SetNull orphans them, Restrict refuses.',
        "SELECT id\nFROM users\nWHERE email LIKE '%spam%';",
        'model Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}',
        'prisma',
        'The delete rule lives on the relation, so no service can forget it.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c1-t1',
          title: 'Cascade the children',
          description: 'Deleting a user must not leave orphaned posts behind.',
          instructions: ['Add `onDelete: Cascade` to the relation'],
          hint: '`@relation(fields: […], references: […], onDelete: Cascade)`.',
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
          id: 'prisma11-c1-t2',
          title: 'Read the filter before a bulk delete',
          description: 'Delete every spam account — first prove which rows match.',
          instructions: ['Use `prisma.user.deleteMany`', 'Filter with `email: { contains: "spam" }`'],
          hint: 'The lens is the WHERE of the delete: how many rows would go?',
          scaffold: '-- The table you are about to filter:\nSELECT id FROM users;',
          solutionSql: "SELECT id FROM users WHERE email LIKE '%spam%';",
          why: 'A bulk delete is exactly its WHERE clause — the lens shows zero matches.',
          cols: ['id'],
          select: [],
          method: 'deleteMany',
          generatedSql: "DELETE FROM users WHERE email LIKE '%spam%';",
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
      theory: prismaTheory(
        'When data must stay recoverable you delete nothing: you set `deletedAt`. Every read then filters `deletedAt: null`, so the row still exists for an audit trail but is invisible to the app.',
        'Soft delete = `deletedAt` timestamp + `deletedAt: null` on every read.',
        'SELECT id, email\nFROM users;',
        'model User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n}\n\nawait prisma.user.findMany({\n  where: { deletedAt: null },\n  select: { id: true, email: true },\n});',
        'prisma',
        'The column is nullable, so "deleted" is just a value — and restorable.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma11-c2-t1',
          title: 'Add the tombstone column',
          description: 'Keep the row, mark the deletion.',
          instructions: ['Add `deletedAt DateTime?`', 'Filter live rows with `deletedAt: null`'],
          hint: 'A nullable timestamp is the whole mechanism.',
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
        prismaReadTask({
          id: 'prisma11-c2-t2',
          title: 'Read only live rows',
          description: 'Return id + email for every user that is not soft-deleted.',
          instructions: ['filter with `where: { deletedAt: null }`', 'select `id` and `email`'],
          hint: 'Every read in the app gets this `where`.',
          scaffold: '-- The live rows, keyed:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'The seeded rows are all live, so the filtered read returns all three.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export async function live() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    select: { id: true },\n  });\n}',
          code1:
            'export async function live() {\n  return await prisma.user.findMany({\n    where: { deletedAt: null },\n    select: { id: true, email: true },\n  });\n}',
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
          title: 'Tombstone, do not drop',
          description: 'Mark the account deleted and let children cascade when it is finally purged.',
          instructions: ['Cascade deletes at the schema level', 'Hide the account with `deletedAt: null`'],
          hint: 'Two mechanisms: `onDelete: Cascade` for purge, `deletedAt` for the grace period.',
          scaffold: '-- The account marked, not dropped:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Soft delete today, cascade purge tomorrow — both declared, neither forgotten.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  posts Post[]\n}',
          code1:
            'model User {\n  id        Int       @id @default(autoincrement())\n  email     String    @unique\n  deletedAt DateTime?\n  posts     Post[]\n}\n\nmodel Post {\n  id       Int  @id @default(autoincrement())\n  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}',
          need: ['deletedAt DateTime?', 'onDelete: Cascade'],
        }),
        type: 'challenge',
      },
    ],
  },
};
