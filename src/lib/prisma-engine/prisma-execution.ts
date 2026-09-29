/**
 * Prisma execution grading — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * The layer `prisma-validator.ts` points at: static checks
 * (`validatePrismaCode`) run first, then the surviving execution-only rules
 * (`expectFailure` / `expectedErrorCode` / `expectedRowCount` /
 * `expectedResultSnippet` / `customValidator`) are checked against an
 * already-executed result.
 *
 * Separated from the validator so static-only surfaces (UI imports, audit
 * scripts) never pull in `SqlExecutor`.
 */

import type { PrismaValidationRule } from '../../types/prisma-curriculum';
import type { QueryExecutionResult } from '../../types/database';
import {
  validatePrismaCode,
  type PrismaValidationOutcome,
} from './prisma-validator';

export function gradePrismaExecution(
  rule: PrismaValidationRule,
  result: QueryExecutionResult,
  rawSql: string,
): PrismaValidationOutcome {
  if (rule.expectFailure) {
    if (result.success) {
      return {
        passed: false,
        feedback:
          'This lab expects the operation to FAIL (e.g. a constraint violation). Your code succeeded — trigger the failing case.',
      };
    }
    if (rule.expectedErrorCode && !matchesPrismaErrorCode(result.error ?? '', rule.expectedErrorCode)) {
      return {
        passed: false,
        feedback: `Expected Prisma error ${rule.expectedErrorCode}, but the engine reported: "${result.error ?? 'unknown error'}".`,
      };
    }
    return { passed: true };
  }

  if (rule.expectedRowCount !== undefined) {
    const counted =
      result.affectedRows !== undefined && result.affectedRows !== null
        ? result.affectedRows
        : result.rowCount;
    const want = rule.expectedRowCount;
    const ok =
      typeof want === 'number'
        ? counted === want
        : (want.min === undefined || counted >= want.min) &&
          (want.max === undefined || counted <= want.max);
    if (!ok) {
      const label =
        typeof want === 'number' ? `${want}` : `min ${want.min ?? '—'} / max ${want.max ?? '—'}`;
      return { passed: false, feedback: `Expected ${label} row(s), got ${counted}.` };
    }
  }

  if (rule.expectedResultSnippet) {
    const first = result.rows?.[0];
    if (!first) {
      return { passed: false, feedback: 'Expected a result row, but the query returned none.' };
    }
    for (const [key, value] of Object.entries(rule.expectedResultSnippet)) {
      if (!Object.is(first[key], value)) {
        return {
          passed: false,
          feedback: `Expected ${key} to be ${JSON.stringify(value)}, got ${JSON.stringify(first[key])}.`,
        };
      }
    }
  }

  if (rule.customValidator) {
    const verdict = rule.customValidator(null, result, rawSql);
    if (!verdict.valid) {
      return { passed: false, feedback: verdict.message ?? 'Custom check failed.' };
    }
  }

  return { passed: true };
}

/**
 * Full Phase-4 grade: static checks first, then the execution layer above.
 * Callers execute the generated SQL themselves (so seed/setup runs on the
 * same executor the UI uses) and hand the result back here.
 */
export function gradePrismaCode(
  code: string,
  rule: PrismaValidationRule,
  result: QueryExecutionResult,
  rawSql: string,
): PrismaValidationOutcome {
  const staticOutcome = validatePrismaCode(code, rule);
  if (!staticOutcome.passed) return staticOutcome;
  return gradePrismaExecution(rule, result, rawSql);
}

/** Map a Prisma error code to the failure the SQL engine reports on the seed. */
export function matchesPrismaErrorCode(engineError: string, code: string): boolean {
  const err = engineError.toLowerCase();
  switch (code.toUpperCase()) {
    case 'P2002':
      return /duplicate entry.*for unique|unique constraint/.test(err);
    case 'P2025':
      return /not found|no such|does not exist|0 rows|no rows/.test(err);
    case 'P2003':
      return /foreign key/.test(err);
    default:
      return err.includes(code.toLowerCase());
  }
}
