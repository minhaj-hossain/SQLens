import type { ModuleData } from '../../../types/curriculum';
import { prismaReadTask, prismaSnippetTask, prismaTheory } from '../phase6-tasks';

/** Prisma Day 14 — Production REST API Capstone. */
export const Prisma_14_MODULE: ModuleData = {
  id: 'prisma-14',
  slug: 'production-rest-api-capstone',
  day: 14,
  title: 'Day 14 — Production REST API Capstone',
  shortTitle: 'REST API Capstone',
  type: 'module',
  track: 'prisma',
  milestoneId: 'prisma-milestone-4',
  description: 'Ship the data layer: layered architecture, one Prisma dependency, and the full CRUD lifecycle.',
  estimatedMinutes: 70,
  curriculumOrder: 14,
  displayLabel: 'Day 14',
  completionLearnings: [
    'Keep routers, controllers and services in separate layers',
    'Inject PrismaClient instead of importing it everywhere',
    'Cover the full CRUD lifecycle through the service',
    'Return relation-safe, minimal responses',
  ],
  concepts: [
    {
      id: 'clean-architecture',
      order: 1,
      title: 'Clean Architecture — Router → Controller → Service',
      shortDescription: 'Routing, HTTP concerns and data access, each in one layer.',
      theory: prismaTheory(
        'A production data layer has three seams: the router maps URLs to handlers, the controller owns HTTP (status codes, validation) and the service owns Prisma. PrismaClient is injected into the service, which is what makes the service testable.',
        'Router routes, controller speaks HTTP, service owns Prisma.',
        'SELECT id, email\nFROM users\nWHERE id = 1;',
        'router.get(\'/users\', userController.list);\n\nexport class UserService {\n  constructor(private prisma: PrismaClient) {}\n}',
        'typescript',
        'One import boundary per layer means the data access is swappable and mockable.',
      ),
      tasks: [
        prismaSnippetTask({
          id: 'prisma14-c1-t1',
          title: 'Move the handler out of the route',
          description: 'The route should route; the controller should handle.',
          instructions: ['Register with `router.get`', 'Delegate to `userController.list`'],
          hint: '`router.get("/users", userController.list)`.',
          scaffold: '-- The route still lists the same rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'alex@prisma.io';",
          why: 'A thin router is what lets controllers be unit-tested.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'router.get(\'/users\', async (req, res) => {\n  const users = await prisma.user.findMany();\n  res.json(users);\n});',
          code1: 'router.get(\'/users\', userController.list);',
          need: ['router.get(', 'userController.list'],
        }),
        prismaSnippetTask({
          id: 'prisma14-c1-t2',
          title: 'Inject the client into the service',
          description: 'The service must receive PrismaClient, not import a global one.',
          instructions: ['Export a class', 'Take `prisma` through the constructor'],
          hint: '`constructor(private prisma: PrismaClient) {}`.',
          scaffold: '-- Whatever the service reads, the seed still answers:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'mina@prisma.io';",
          why: 'Constructor injection is the seam every test doubles against.',
          cols: ['id', 'email'],
          rows: 1,
          code0:
            'export async function listUsers() {\n  return await prisma.user.findMany({ select: { id: true, email: true } });\n}',
          code1:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  async list() {\n    return await this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n}',
          need: ['export class UserService', 'constructor(private prisma: PrismaClient)'],
        }),
      ],
    },
    {
      id: 'crud-lifecycle',
      order: 2,
      title: 'Full CRUD Lifecycle & Relational Integrity',
      shortDescription: 'List, create, update, remove — all through the same service.',
      theory: prismaTheory(
        'A complete resource exposes four operations, and each one keeps relational integrity: reads project a stable column set, creates validate first, updates require a unique key and deletes respect the referential action declared the schema.',
        'Four operations, one service, integrity intact at every step.',
        'SELECT id, email\nFROM users\nORDER BY id ASC;',
        'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({\n      orderBy: { id: \'asc\' },\n      select: { id: true, email: true },\n    });\n  }\n}',
        'typescript',
        'One ORDER BY per list method keeps paging and tests reproducible.',
      ),
      tasks: [
        prismaReadTask({
          id: 'prisma14-c2-t1',
          title: 'Stable list endpoint',
          description: 'Return id + email for every user, ordered by id.',
          instructions: ['Use `findMany`', '`orderBy: { id: "asc" }`', 'Select `id` and `email`'],
          hint: 'A list endpoint without ORDER BY is not reproducible.',
          scaffold: '-- The roster this endpoint returns:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users ORDER BY id ASC;',
          why: 'ORDER BY plus a fixed projection is the contract clients depend on.',
          cols: ['id', 'email'],
          noCols: ['name'],
          orderBy: [{ field: 'id', direction: 'asc' }],
          rows: 3,
          code0:
            'export async function list() {\n  return await prisma.user.findMany({\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function list() {\n  return await prisma.user.findMany({\n    orderBy: { id: \'asc\' },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string }[]',
        }),
        prismaSnippetTask({
          id: 'prisma14-c2-t2',
          title: 'Complete the CRUD service',
          description: 'The service only lists so far — add create, update and remove.',
          instructions: ['Add `create`, `update` and `remove` methods', 'Each uses PrismaClient through `this.prisma`'],
          hint: 'Four methods, four Prisma calls, one injected client.',
          scaffold: '-- CRUD still ends on seeded rows:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: 'SELECT id, email FROM users;',
          why: 'One service owning all four operations keeps the API consistent.',
          cols: ['id', 'email'],
          rows: 3,
          code0:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n}',
          code1:
            'export class UserService {\n  constructor(private prisma: PrismaClient) {}\n\n  list() {\n    return this.prisma.user.findMany({ select: { id: true, email: true } });\n  }\n\n  create(data: { name: string; email: string }) {\n    return this.prisma.user.create({ data, select: { id: true, email: true } });\n  }\n\n  update(id: number, data: { name?: string }) {\n    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true } });\n  }\n\n  remove(id: number) {\n    return this.prisma.user.delete({ where: { id }, select: { id: true } });\n  }\n}',
          need: ['create(', 'update(', 'remove(', 'delete({'],
        }),
      ],
    },
  ],
  challenge: {
    id: 'prisma14-challenge',
    title: 'Capstone — Enterprise Publishing REST API',
    scenario: 'The published-record endpoint that closes the track.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        ...prismaReadTask({
          id: 'prisma14-hw-1',
          title: 'Published record read',
          description: 'One record by unique email, id + email only, never `name`.',
          instructions: ['findUnique on `where: { email }`', 'Select `id` and `email`'],
          hint: 'Unique lookup, minimal projection — the shape every client gets.',
          scaffold: '-- The published record:\nSELECT id, email FROM users WHERE id = 99;',
          solutionSql: "SELECT id, email FROM users WHERE email = 'rafi@prisma.io';",
          why: 'Fourteen days end with one typed, minimal, unique-key read.',
          cols: ['id', 'email'],
          noCols: ['name'],
          rows: 1,
          code0:
            'export async function published(email: string) {\n  return await prisma.user.findMany({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
          code1:
            'export async function published(email: string) {\n  return await prisma.user.findUnique({\n    where: { email },\n    select: { id: true, email: true },\n  });\n}',
          rtype: '{ id: number; email: string } | null',
        }),
        type: 'challenge',
      },
    ],
  },
};
