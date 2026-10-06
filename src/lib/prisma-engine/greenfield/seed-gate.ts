/**
 * Greenfield Exam — Gate 2: Deterministic Seeding Evaluator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates that learner's `seed.ts` script seeds required test data and is
 * strictly idempotent (can run twice consecutively without P2002 duplicate collision).
 */

import { prepareGreenfieldCode, AsyncFunction } from './prepare-code';
import { MarketplaceDatabaseSimulator } from './mock-marketplace-db';
import type { GateResult } from '../../../types/greenfield-exam';

export async function evaluateSeedGate(seedCode: string): Promise<GateResult> {
  const start = Date.now();
  const db = new MarketplaceDatabaseSimulator();
  const prisma = db.createPrismaClient();

  const prepared = prepareGreenfieldCode(seedCode);

  const exports: Record<string, any> = {};
  const runner = new AsyncFunction(
    'prisma',
    'exports',
    `
    ${prepared}
    if (typeof seed !== 'undefined') exports.seed = seed;
    if (typeof main !== 'undefined') exports.main = main;
    return exports;
  `,
  );

  let mod: any;
  try {
    mod = await runner(prisma, exports);
  } catch (err: any) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `Compilation/execution error in seed.ts: ${err?.message ?? String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  const seedFn = mod.seed ?? mod.default ?? mod.main;
  if (typeof seedFn !== 'function') {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts must export a function named 'seed' or default export.`,
      durationMs: Date.now() - start,
    };
  }

  // --- Run 1: First Seeding ---
  try {
    const res = seedFn(prisma);
    if (res && typeof res.then === 'function') await res;
  } catch (err: any) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts threw on initial execution: ${err?.message ?? String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  // Verify minimal required state
  if (db.data.users.length < 2) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts must seed at least 2 users (found: ${db.data.users.length}).`,
      durationMs: Date.now() - start,
    };
  }

  if (db.data.wallets.length < 2) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts must seed at least 2 wallets (found: ${db.data.wallets.length}).`,
      durationMs: Date.now() - start,
    };
  }

  if (db.data.products.length < 2) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts must seed at least 2 products with stock (found: ${db.data.products.length}).`,
      durationMs: Date.now() - start,
    };
  }

  const snapshotCounts = {
    users: db.data.users.length,
    wallets: db.data.wallets.length,
    products: db.data.products.length,
  };

  // --- Run 2: Idempotent Re-execution ---
  try {
    const res2 = seedFn(prisma);
    if (res2 && typeof res2.then === 'function') await res2;
  } catch (err: any) {
    if (err?.code === 'P2002' || (err?.message && err.message.includes('P2002'))) {
      return {
        gateNumber: 2,
        gateName: 'Deterministic Seeding',
        passed: false,
        feedback: `seed.ts is not idempotent: second run failed with P2002 unique constraint violation. Use upsert or clean existence checks.`,
        durationMs: Date.now() - start,
      };
    }
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts failed on second (idempotent) run: ${err?.message ?? String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  // Verify row counts did not duplicate
  if (
    db.data.users.length !== snapshotCounts.users ||
    db.data.wallets.length !== snapshotCounts.wallets ||
    db.data.products.length !== snapshotCounts.products
  ) {
    return {
      gateNumber: 2,
      gateName: 'Deterministic Seeding',
      passed: false,
      feedback: `seed.ts duplicated rows on second run. Seed scripts must be idempotent and produce identical row counts.`,
      durationMs: Date.now() - start,
    };
  }

  return {
    gateNumber: 2,
    gateName: 'Deterministic Seeding',
    passed: true,
    feedback: `Gate 2 Passed: Deterministic seeding succeeded twice without P2002 collisions. Verified ${snapshotCounts.users} users, ${snapshotCounts.wallets} wallets, and ${snapshotCounts.products} products.`,
    durationMs: Date.now() - start,
  };
}
