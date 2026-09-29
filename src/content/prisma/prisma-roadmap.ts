/**
 * Prisma roadmap milestones — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. `src/config/roadmap.ts` (ROADMAP_MILESTONES, SQL) is untouched.
 * Milestone ids are prefixed `prisma-milestone-*` so admin/availability maps
 * can never confuse them with SQL milestones. Module ids use `prisma-NN`.
 */

import { MilestoneData } from '../../types/curriculum';

export const PRISMA_ROADMAP_MILESTONES: MilestoneData[] = [
  {
    id: 'prisma-milestone-1',
    number: 1,
    title: 'Foundations',
    subtitle: 'Why Prisma — Models, Client & Type Safety',
    description:
      'Understand the problems Prisma solves over raw SQL, model your first schema, and read/write data with type-safe client queries.',
    daysRange: 'Days 1–4',
    moduleIds: ['prisma-01', 'prisma-02', 'prisma-03', 'prisma-04'],
  },
  {
    id: 'prisma-milestone-2',
    number: 2,
    title: 'Querying',
    subtitle: 'Filter, Relate & Paginate Like Production Code',
    description:
      'Master where/orderBy/select/include, relations, and pagination patterns that power real application screens.',
    daysRange: 'Days 5–8',
    moduleIds: ['prisma-05', 'prisma-06', 'prisma-07', 'prisma-08'],
  },
  {
    id: 'prisma-milestone-3',
    number: 3,
    title: 'Writing',
    subtitle: 'Mutations, Transactions & Error Handling',
    description:
      'Create, update, upsert and delete safely; wrap related writes in transactions and handle Prisma error codes.',
    daysRange: 'Days 9–11',
    moduleIds: ['prisma-09', 'prisma-10', 'prisma-11'],
  },
  {
    id: 'prisma-milestone-4',
    number: 4,
    title: 'Production',
    subtitle: 'Migrations, Performance & API Architecture',
    description:
      'Evolve schemas with migrations, kill N+1 queries, validate at the API boundary, and ship a production-ready data layer.',
    daysRange: 'Days 12–14',
    moduleIds: ['prisma-12', 'prisma-13', 'prisma-14'],
  },
];
