import { describe, expect, it } from 'vitest';
import {
  gradeCheckpoint1Schema,
  gradeCheckpoint2Feed,
} from '../../src/lib/prisma-engine/graders';

describe('Milestone Checkpoint Graders (Phase 4)', () => {
  // ───────────────────────────────────────────────────────────────────────────
  // Task 4.1: Milestone 1 Checkpoint (Catalog & Review Modeling — End of Day 4)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Milestone 1 Checkpoint: gradeCheckpoint1Schema', () => {
    const validSchema = `
      enum ProductStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
      }

      model Product {
        id         Int            @id @default(autoincrement())
        title      String
        status     ProductStatus  @default(DRAFT)
        detail     ProductDetail?
        reviews    Review[]
        categories Category[]
        createdAt  DateTime       @default(now())
      }

      model ProductDetail {
        id          Int     @id @default(autoincrement())
        description String
        productId   Int     @unique
        product     Product @relation(fields: [productId], references: [id])
      }

      model Review {
        id        Int      @id @default(autoincrement())
        rating    Int
        comment   String?
        productId Int
        product   Product  @relation(fields: [productId], references: [id])
        createdAt DateTime @default(now())

        @@index([productId, createdAt])
      }

      model Category {
        id       Int       @id @default(autoincrement())
        name     String
        products Product[]
      }
    `;

    it('passes for complete valid catalog and review schema', () => {
      const res = gradeCheckpoint1Schema(validSchema, 'prisma04-hw-2');
      expect(res.passed).toBe(true);
    });

    it('passes when composite index specifies sort direction on createdAt', () => {
      const schemaWithSort = validSchema.replace(
        '@@index([productId, createdAt])',
        '@@index([productId, createdAt(sort: Desc)])',
      );
      const res = gradeCheckpoint1Schema(schemaWithSort, 'prisma04-hw-2');
      expect(res.passed).toBe(true);
    });

    it('fails when enum ProductStatus is missing', () => {
      const broken = validSchema.replace(/enum ProductStatus\s*\{[^}]*\}/, '');
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Missing enum ProductStatus');
      expect(res.feedback).toContain('Revisit Day 3 Concept 2');
    });

    it('fails when enum ProductStatus is missing required variants', () => {
      const broken = validSchema.replace('ARCHIVED', '');
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('enum ProductStatus must include DRAFT, PUBLISHED, and ARCHIVED');
    });

    it('fails with strict remediation when ProductDetail.productId lacks @unique', () => {
      const broken = validSchema.replace('productId   Int     @unique', 'productId   Int');
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('ProductDetail.productId must have @unique');
      expect(res.feedback).toContain('In Prisma, a 1:1 relation requires a unique constraint');
      expect(res.feedback).toContain('otherwise Prisma models it as 1:N');
      expect(res.feedback).toContain('Revisit Day 4 Concept 2: 1:1 Relations');
    });

    it('fails with remediation when a single-column index on createdAt is used', () => {
      const broken = validSchema.replace(
        '@@index([productId, createdAt])',
        '@@index([createdAt])',
      );
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain(
        'A single-column index on createdAt cannot serve both the filter (where productId) and sort (orderBy createdAt) efficiently',
      );
      expect(res.feedback).toContain('Revisit Day 3 Concept 2: Indexes');
    });

    it('fails when composite index is missing on Review', () => {
      const broken = validSchema.replace('@@index([productId, createdAt])', '');
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Missing composite index on Review');
      expect(res.feedback).toContain('add @@index([productId, createdAt])');
    });

    it('fails when many-to-many relationship is missing', () => {
      const broken = validSchema
        .replace('categories Category[]', '')
        .replace('products Product[]', '');
      const res = gradeCheckpoint1Schema(broken, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Missing many-to-many relationship between Product and Category');
      expect(res.feedback).toContain('Revisit Day 4 Concept 3: Many-to-Many Relations');
    });

    it('fails for starter scaffold', () => {
      const starter = `
        enum ProductStatus {
          // TODO
        }
        model Product {
          // TODO
        }
      `;
      const res = gradeCheckpoint1Schema(starter, 'prisma04-hw-2');
      expect(res.passed).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Task 4.2: Milestone 2 Checkpoint (Deterministic Feed with Tiebreakers — End of Day 8)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Milestone 2 Checkpoint: gradeCheckpoint2Feed', () => {
    const validFeed = `
      export async function getCategoryProductFeed(
        categoryId: number,
        take: number,
        cursor?: { id: number },
      ) {
        return await prisma.product.findMany({
          where: {
            categories: {
              some: { id: categoryId },
            },
          },
          take,
          ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
          orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' },
          ],
        });
      }
    `;

    it('passes for complete deterministic feed implementation with boundary walk', () => {
      const res = gradeCheckpoint2Feed(validFeed, 'prisma08-hw-2');
      expect(res.passed).toBe(true);
    });

    it('fails with exact remediation when skip: 1 is omitted on cursor pagination', () => {
      const omittedSkip = `
        export async function getCategoryProductFeed(
          categoryId: number,
          take: number,
          cursor?: { id: number },
        ) {
          return await prisma.product.findMany({
            where: {
              categories: {
                some: { id: categoryId },
              },
            },
            take,
            ...(cursor ? { cursor: { id: cursor.id } } : {}),
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
          });
        }
      `;
      const res = gradeCheckpoint2Feed(omittedSkip, 'prisma08-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Page 2 repeated item 4');
      expect(res.feedback).toContain('Prisma cursor pagination is inclusive by default');
      expect(res.feedback).toContain('add skip: 1 when a cursor is provided');
      expect(res.feedback).toContain('Revisit Day 8 Concept 2');
    });

    it('fails with exact remediation when secondary unique tiebreaker is omitted', () => {
      const missingTiebreaker = `
        export async function getCategoryProductFeed(
          categoryId: number,
          take: number,
          cursor?: { id: number },
        ) {
          return await prisma.product.findMany({
            where: {
              categories: {
                some: { id: categoryId },
              },
            },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
            orderBy: { createdAt: 'desc' },
          });
        }
      `;
      const res = gradeCheckpoint2Feed(missingTiebreaker, 'prisma08-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Products with identical timestamps produced an unstable sort order');
      expect(res.feedback).toContain('Add a secondary unique tiebreaker: orderBy: [{ createdAt: \'desc\' }, { id: \'desc\' }]');
      expect(res.feedback).toContain('Revisit Day 8 Concept 2 & OrderBy');
    });

    it('fails when orderBy array is missing id tiebreaker', () => {
      const missingTiebreakerInArray = `
        export async function getCategoryProductFeed(
          categoryId: number,
          take: number,
          cursor?: { id: number },
        ) {
          return await prisma.product.findMany({
            where: {
              categories: {
                some: { id: categoryId },
              },
            },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
            orderBy: [{ createdAt: 'desc' }],
          });
        }
      `;
      const res = gradeCheckpoint2Feed(missingTiebreakerInArray, 'prisma08-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Products with identical timestamps produced an unstable sort order');
    });

    it('fails with remediation when relational filter on categories is missing', () => {
      const missingFilter = `
        export async function getCategoryProductFeed(
          categoryId: number,
          take: number,
          cursor?: { id: number },
        ) {
          return await prisma.product.findMany({
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
          });
        }
      `;
      const res = gradeCheckpoint2Feed(missingFilter, 'prisma08-hw-2');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Expected relational filter on categories');
      expect(res.feedback).toContain('Revisit Day 8 Concept 1');
    });

    it('fails for starter scaffold', () => {
      const starter = `
        export async function getCategoryProductFeed(
          categoryId: number,
          take: number,
          cursor?: { id: number },
        ) {
          // TODO
        }
      `;
      const res = gradeCheckpoint2Feed(starter, 'prisma08-hw-2');
      expect(res.passed).toBe(false);
    });
  });
});
