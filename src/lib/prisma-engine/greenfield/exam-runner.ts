/**
 * Greenfield Exam — Unified 4-Gate Orchestrator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Sequentially executes all 4 evaluation gates against a candidate submission:
 *  Gate 1: Schema DDL & AST Invariants
 *  Gate 2: Deterministic Seeding (Idempotency)
 *  Gate 3: Service Happy Path
 *  Gate 4: Concurrency, Rollback & Idempotency
 */

import { evaluateSchemaGate } from './schema-gate';
import { evaluateSeedGate } from './seed-gate';
import { evaluateServiceGate } from './service-gate';
import { evaluateConcurrencyGate } from './concurrency-gate';
import type {
  GreenfieldSubmission,
  GreenfieldExamResult,
  GateResult,
} from '../../../types/greenfield-exam';

export async function runGreenfieldExam(
  submission: GreenfieldSubmission,
): Promise<GreenfieldExamResult> {
  const startTime = Date.now();
  const gateResults: GateResult[] = [];

  // Gate 1: Schema DDL & AST
  const g1 = evaluateSchemaGate(submission.schemaPrisma);
  gateResults.push(g1);
  if (!g1.passed) {
    return {
      passed: false,
      failedGate: 1,
      feedback: `Gate 1 Failed: ${g1.feedback}`,
      gateResults,
      totalDurationMs: Date.now() - startTime,
    };
  }

  // Gate 2: Deterministic Seeding
  const g2 = await evaluateSeedGate(submission.seedCode);
  gateResults.push(g2);
  if (!g2.passed) {
    return {
      passed: false,
      failedGate: 2,
      feedback: `Gate 2 Failed: ${g2.feedback}`,
      gateResults,
      totalDurationMs: Date.now() - startTime,
    };
  }

  // Gate 3: Service Happy Path
  const g3 = await evaluateServiceGate(submission.serviceCode);
  gateResults.push(g3);
  if (!g3.passed) {
    return {
      passed: false,
      failedGate: 3,
      feedback: `Gate 3 Failed: ${g3.feedback}`,
      gateResults,
      totalDurationMs: Date.now() - startTime,
    };
  }

  // Gate 4: Concurrency, Rollback & Idempotency
  const g4 = await evaluateConcurrencyGate(submission.serviceCode);
  gateResults.push(g4);
  if (!g4.passed) {
    return {
      passed: false,
      failedGate: 4,
      feedback: `Gate 4 Failed: ${g4.feedback}`,
      gateResults,
      totalDurationMs: Date.now() - startTime,
    };
  }

  return {
    passed: true,
    feedback:
      'All 4 Greenfield Marketplace Exam gates passed! Complete production-grade data modeling, seeding idempotency, service checkout, and concurrency invariants verified.',
    gateResults,
    totalDurationMs: Date.now() - startTime,
  };
}
