/**
 * Milestone 2 Checkpoint Behavioral Grader — Deterministic Category Product Feed.
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates learner's feed query implementation against strict pagination invariants:
 *  1. Relational filter on M:N categories: `where: { categories: { some: { id: categoryId } } }`.
 *  2. Secondary unique tiebreaker on `id`: `orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]`.
 *  3. Learner-owned cursor pagination with `skip: 1` when cursor is provided.
 *  4. Boundary walk verifying no duplicate or missing rows under millisecond timestamp collisions.
 */

import { cleanTypeScriptCode } from './clean-ts';
import type { BehavioralGraderResult } from './grade-day6-singleton';

interface MockProduct {
  id: number;
  title: string;
  categoryIds: number[];
  createdAt: Date;
}

export function gradeCheckpoint2Feed(code: string, _taskId: string): BehavioralGraderResult {
  try {
    const prepared = cleanTypeScriptCode(code);

    const mockProducts: MockProduct[] = [
      { id: 1, title: 'Item 1', categoryIds: [1], createdAt: new Date('2026-01-01T10:00:00.000Z') },
      { id: 2, title: 'Item 2', categoryIds: [1], createdAt: new Date('2026-01-01T09:00:00.000Z') }, // tied!
      { id: 3, title: 'Item 3', categoryIds: [1], createdAt: new Date('2026-01-01T09:00:00.000Z') }, // tied!
      { id: 4, title: 'Item 4', categoryIds: [1], createdAt: new Date('2026-01-01T09:00:00.000Z') }, // tied!
      { id: 5, title: 'Item 5', categoryIds: [2], createdAt: new Date('2026-01-01T08:00:00.000Z') }, // other category
    ];

    let lastArgs: any = null;
    let queryError: BehavioralGraderResult | null = null;

    const mockPrisma = {
      product: {
        findMany(args: any) {
          lastArgs = args;

          // 1. Relational filter inspection
          const categoryFilter = args?.where?.categories?.some;
          if (!categoryFilter || typeof categoryFilter !== 'object') {
            queryError = {
              passed: false,
              feedback:
                'Expected relational filter on categories. (Remediation: Revisit Day 8 Concept 1)',
            };
            return [];
          }

          // 2. OrderBy inspection
          const orderBy = args?.orderBy;
          if (!Array.isArray(orderBy)) {
            queryError = {
              passed: false,
              feedback:
                "Products with identical timestamps produced an unstable sort order. Add a secondary unique tiebreaker: orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]. (Remediation: Revisit Day 8 Concept 2 & OrderBy)",
            };
            return [];
          }

          const hasCreatedAt = orderBy.some(
            (c: any) => c && typeof c === 'object' && 'createdAt' in c,
          );
          if (!hasCreatedAt) {
            queryError = {
              passed: false,
              feedback:
                "Expected orderBy to sort primarily by createdAt descending. (Remediation: Revisit Day 8 Concept 2 & OrderBy)",
            };
            return [];
          }

          const hasIdTiebreaker = orderBy.some(
            (c: any) => c && typeof c === 'object' && 'id' in c,
          );
          if (!hasIdTiebreaker) {
            queryError = {
              passed: false,
              feedback:
                "Products with identical timestamps produced an unstable sort order. Add a secondary unique tiebreaker: orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]. (Remediation: Revisit Day 8 Concept 2 & OrderBy)",
            };
            return [];
          }

          // Execute query on mock dataset
          const catId = categoryFilter.id;
          const matched = mockProducts.filter((p) => p.categoryIds.includes(catId));

          const idClause = orderBy.find((c: any) => c && typeof c === 'object' && 'id' in c);
          const idDir =
            idClause?.id && typeof idClause.id === 'string' && idClause.id.toLowerCase() === 'asc'
              ? 'asc'
              : 'desc';

          matched.sort((a, b) => {
            const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
            if (timeDiff !== 0) return timeDiff;
            return idDir === 'asc' ? a.id - b.id : b.id - a.id;
          });

          let startIndex = 0;
          if (args?.cursor && typeof args.cursor === 'object') {
            const cursorId = args.cursor.id;
            const cursorIdx = matched.findIndex((p) => p.id === cursorId);
            if (cursorIdx !== -1) {
              // Prisma cursor pagination is inclusive by default!
              const skip = args.skip ?? 0;
              startIndex = cursorIdx + skip;
            }
          }

          const take = typeof args?.take === 'number' ? args.take : matched.length;
          return matched.slice(startIndex, startIndex + take);
        },
      },
    };

    const exports: Record<string, any> = {};
    const runner = new Function(
      'prisma',
      'exports',
      `
      ${prepared}
      if (typeof getCategoryProductFeed !== 'undefined') exports.getCategoryProductFeed = getCategoryProductFeed;
      return exports;
    `,
    );

    const mod = runner(mockPrisma, exports);
    const feedFn = mod.getCategoryProductFeed;

    if (typeof feedFn !== 'function') {
      return {
        passed: false,
        feedback:
          'The module must export `getCategoryProductFeed(categoryId, take, cursor)`. (Remediation: Revisit Day 8 Concept 2)',
      };
    }

    function callFeed(categoryId: number, take: number, cursor?: { id: number }): any {
      lastArgs = null;
      let res = feedFn(categoryId, take, cursor);
      if (lastArgs === null) {
        // Try (prisma, { categoryId, take, cursor })
        res = feedFn(mockPrisma, { categoryId, take, cursor });
      }
      if (lastArgs === null) {
        // Try ({ categoryId, take, cursor })
        res = feedFn({ categoryId, take, cursor });
      }
      return res;
    }

    // Step 1: Run Page 1
    const page1 = callFeed(1, 2);

    if (queryError) return queryError;
    if (lastArgs === null) {
      return {
        passed: false,
        feedback:
          'getCategoryProductFeed did not execute a query with prisma.product.findMany.',
      };
    }

    if (!Array.isArray(page1) || page1.length !== 2) {
      return {
        passed: false,
        feedback: 'Expected Page 1 to return 2 products matching category 1.',
      };
    }

    // Step 2: Run Page 2 with cursor
    const cursorItem = page1[page1.length - 1];
    const page2 = callFeed(1, 2, { id: cursorItem.id });

    if (queryError) return queryError;

    // Check learner-owned skip: 1
    if (lastArgs?.skip !== 1 || (Array.isArray(page2) && page2.length > 0 && page2[0]?.id === cursorItem.id)) {
      return {
        passed: false,
        feedback: `Page 2 repeated item ${cursorItem.id}. Prisma cursor pagination is inclusive by default; add skip: 1 when a cursor is provided. (Remediation: Revisit Day 8 Concept 2)`,
      };
    }

    if (!Array.isArray(page2) || page2.length !== 2) {
      return {
        passed: false,
        feedback: 'Expected Page 2 to return the remaining 2 products in category 1.',
      };
    }

    // Step 3: Run Page 3 (boundary completion)
    const cursorItem2 = page2[page2.length - 1];
    const page3 = callFeed(1, 2, { id: cursorItem2.id });

    if (queryError) return queryError;

    // Step 4: Verify full boundary walk
    const all = [...page1, ...page2, ...page3];
    const ids = all.map((p: any) => p.id);

    // Tied createdAt items (2, 3, 4) must be deterministically sorted by id: 'desc' -> 4, 3, 2
    const expectedIds = [1, 4, 3, 2];
    if (ids.length !== 4 || !ids.every((id, idx) => id === expectedIds[idx])) {
      return {
        passed: false,
        feedback: `Boundary walk failed: expected sequence [${expectedIds.join(', ')}] but got [${ids.join(', ')}]. Verify sorting order and pagination offsets.`,
      };
    }

    // Category isolation check: item 5 is in category 2 and should never appear
    if (all.some((p: any) => !p.categoryIds.includes(1))) {
      return {
        passed: false,
        feedback: 'Relational filter leaked items from other categories.',
      };
    }

    return { passed: true };
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Execution error while testing feed query: ${err?.message ?? String(err)}`,
    };
  }
}
