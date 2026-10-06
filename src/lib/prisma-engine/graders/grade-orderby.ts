/**
 * AST OrderBy & Cursor Tiebreaker Grader — Phase 2.
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects `orderBy` arguments and cursor pagination options structurally:
 *  1. Checks array vs object shape of `orderBy` (supports bare and quoted keys).
 *  2. Enforces unique secondary tiebreaker (`id`) for non-unique sorts (e.g. `createdAt`).
 *  3. Verifies `skip: 1` presence when `cursor` is used to prevent page repetition.
 */

import type { BehavioralGraderResult } from './grade-day6-singleton';

export interface OrderByRuleOptions {
  /** Require secondary unique tiebreaker (default: 'id') */
  requireTiebreaker?: boolean;
  tiebreakerField?: string;
  /** Primary field expected in sort */
  primaryField?: string;
  /** Primary sort direction ('asc' | 'desc') */
  primaryDirection?: 'asc' | 'desc';
  /** Require skip: 1 if cursor is present */
  requireSkipOnCursor?: boolean;
}

export function gradeOrderByStructure(
  code: string,
  options: OrderByRuleOptions = {},
): BehavioralGraderResult {
  const tiebreakerField = options.tiebreakerField ?? 'id';

  // 1. Cursor pagination skip check (bare or quoted keys)
  const hasCursor = /(?:["']?cursor["']?)\s*:\s*\{/.test(code);
  if (hasCursor && options.requireSkipOnCursor !== false) {
    const hasSkipOne = /(?:["']?skip["']?)\s*:\s*1\b/.test(code);
    if (!hasSkipOne) {
      return {
        passed: false,
        feedback:
          'Prisma cursor pagination is inclusive by default; add `skip: 1` when a cursor is provided to avoid repeating the pivot item.',
      };
    }
  }

  // 2. OrderBy extraction (bare or quoted key)
  const orderByMatch = /(?:["']?orderBy["']?)\s*:\s*(\[[^\]]*\]|\{[^}]*\})/s.exec(code);
  if (!orderByMatch) {
    return {
      passed: false,
      feedback: 'Missing `orderBy` clause in query arguments.',
    };
  }

  const rawOrderBy = orderByMatch[1].trim();

  // 3. Primary field check
  if (options.primaryField) {
    const primaryPattern = new RegExp(`["']?${options.primaryField}["']?\\s*:\\s*['"]?(${options.primaryDirection ?? 'asc|desc'})['"]?`, 'i');
    if (!primaryPattern.test(rawOrderBy)) {
      const dirText = options.primaryDirection ? ` ${options.primaryDirection}` : '';
      return {
        passed: false,
        feedback: `Expected \`orderBy\` to sort by \`${options.primaryField}${dirText}\`.`,
      };
    }
  }

  // 4. Tiebreaker check
  if (options.requireTiebreaker) {
    const isArray = rawOrderBy.startsWith('[') && rawOrderBy.endsWith(']');
    if (!isArray) {
      return {
        passed: false,
        feedback: `Sorting on non-unique fields produces non-deterministic pagination for rows with identical values. Wrap in an array with a secondary unique tiebreaker: \`orderBy: [{ ${options.primaryField ?? 'createdAt'}: 'desc' }, { ${tiebreakerField}: 'desc' }]\`.`,
      };
    }

    const tiebreakerPattern = new RegExp(`["']?${tiebreakerField}["']?\\s*:\\s*['"]?(?:asc|desc)['"]?`, 'i');
    if (!tiebreakerPattern.test(rawOrderBy)) {
      return {
        passed: false,
        feedback: `Missing secondary unique tiebreaker \`${tiebreakerField}\`. Add \`{ ${tiebreakerField}: 'desc' }\` as the final entry in the \`orderBy\` array.`,
      };
    }
  }

  return { passed: true };
}
