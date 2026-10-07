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
    subtitle: 'Models, Scalar Types & Your First Query',
    description:
      'Understand core schema models, primary keys, and experience immediate data retrieval with findMany() seeded queries.',
    daysRange: 'Days 1–2',
    moduleIds: ['prisma-01', 'prisma-02'],
  },
  {
    id: 'prisma-milestone-2',
    number: 2,
    title: 'Reading Data',
    subtitle: 'Filtering, Selecting & Pagination',
    description:
      'Master data retrieval with findUnique, findFirst, compound where clauses, selective field payloads, and cursor/offset pagination.',
    daysRange: 'Days 3–4',
    moduleIds: ['prisma-03', 'prisma-04'],
  },
  {
    id: 'prisma-milestone-3',
    number: 3,
    title: 'Schema Design',
    subtitle: 'Constraints, Defaults & Indexes',
    description:
      'Deepen schema architecture with single and composite @unique, default expressions, performance indexes @@index, and database mapping with @map.',
    daysRange: 'Day 5',
    moduleIds: ['prisma-05'],
  },
  {
    id: 'prisma-milestone-4',
    number: 4,
    title: 'Relations',
    subtitle: '1:1, 1:N, M:N & Referential Actions',
    description:
      'Model real-world relations with foreign key bridges, eager query loading via include/select, explicit join models, and onDelete referential integrity.',
    daysRange: 'Days 6–8',
    moduleIds: ['prisma-06', 'prisma-07', 'prisma-08'],
  },
  {
    id: 'prisma-milestone-5',
    number: 5,
    title: 'Writing Data',
    subtitle: 'Creates, Updates, Upserts & Nested Writes',
    description:
      'Persist and mutate data safely with create, update, atomic upsert, batch mutations, and nested relational writes in a single call.',
    daysRange: 'Days 9–10',
    moduleIds: ['prisma-09', 'prisma-10'],
  },
  {
    id: 'prisma-milestone-6',
    number: 6,
    title: 'Workflow & CLI',
    subtitle: 'Init, Client Generation, Migrations & Seeds',
    description:
      'Demystify the Prisma engine lifecycle: project initialization, client generation, declarative migration tracking with migrate dev, and seed automation.',
    daysRange: 'Days 11–12',
    moduleIds: ['prisma-11', 'prisma-12'],
  },
  {
    id: 'prisma-milestone-7',
    number: 7,
    title: 'Advanced Prisma',
    subtitle: 'Transactions, Extensions & Production Resilience',
    description:
      'Achieve production fluency with atomic sequential and interactive transactions, client extensions via $extends, error handling (P2002/P2025), and full capstone synthesis.',
    daysRange: 'Days 13–14',
    moduleIds: ['prisma-13', 'prisma-14'],
  },
];
