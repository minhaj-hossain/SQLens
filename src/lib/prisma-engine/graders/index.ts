/**
 * Prisma Behavioral Graders — Phase 2 Barrel & Dispatcher.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { gradeDay6Singleton, type BehavioralGraderResult } from './grade-day6-singleton';
import { gradeDay9Zod } from './grade-day9-zod';
import { gradeDay12Transaction } from './grade-day12-transaction';
import {
  gradeDay13Errors,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from './grade-day13-errors';
import { gradeOrderByStructure, type OrderByRuleOptions } from './grade-orderby';
import { gradeCheckpoint1Schema } from './grade-checkpoint1-schema';
import { gradeCheckpoint2Feed } from './grade-checkpoint2-feed';

export {
  gradeDay6Singleton,
  gradeDay9Zod,
  gradeDay12Transaction,
  gradeDay13Errors,
  gradeOrderByStructure,
  gradeCheckpoint1Schema,
  gradeCheckpoint2Feed,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  type BehavioralGraderResult,
  type OrderByRuleOptions,
};

/**
 * Dispatcher to route submission code to the appropriate behavioral grader.
 * Completely synchronous for millisecond in-browser and CLI execution.
 */
export function dispatchBehavioralGrader(
  graderType: string,
  code: string,
  taskId: string,
  options?: any,
): BehavioralGraderResult {
  switch (graderType) {
    case 'day6-singleton':
      return gradeDay6Singleton(code, taskId);
    case 'day9-zod':
      return gradeDay9Zod(code, taskId);
    case 'day12-transaction':
      return gradeDay12Transaction(code, taskId);
    case 'day13-errors':
      return gradeDay13Errors(code, taskId);
    case 'orderby-tiebreaker':
      return gradeOrderByStructure(code, options);
    case 'checkpoint1-schema':
      return gradeCheckpoint1Schema(code, taskId);
    case 'checkpoint2-feed':
      return gradeCheckpoint2Feed(code, taskId);
    default:
      return { passed: true };
  }
}
