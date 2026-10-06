/**
 * Greenfield Exam — Gate 4: Concurrency, Rollback & Idempotency Evaluator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates high-concurrency resilience, transactional integrity, and idempotency:
 *  1. Stock race condition immunity under 50ms synthetic read delay.
 *  2. Atomic rollback on insufficient funds (zero partial state mutations).
 *  3. Concurrent idempotency interception: duplicate key returns existing order without re-charging.
 */

import { prepareGreenfieldCode, AsyncFunction } from './prepare-code';
import { MarketplaceDatabaseSimulator } from './mock-marketplace-db';
import type { GateResult } from '../../../types/greenfield-exam';

export async function evaluateConcurrencyGate(serviceCode: string): Promise<GateResult> {
  const start = Date.now();

  const prepared = prepareGreenfieldCode(serviceCode);

  async function createServiceRunner(prisma: any) {
    const exports: Record<string, any> = {};
    const runner = new AsyncFunction(
      'prisma',
      'exports',
      `
      ${prepared}
      if (typeof checkout !== 'undefined') exports.checkout = checkout;
      if (typeof OutOfStockError !== 'undefined') exports.OutOfStockError = OutOfStockError;
      if (typeof InsufficientFundsError !== 'undefined') exports.InsufficientFundsError = InsufficientFundsError;
      return exports;
    `,
    );
    const mod = await runner(prisma, exports);
    const checkoutFn = mod.checkout ?? mod.default?.checkout;
    const OutOfStockError = mod.OutOfStockError;
    const InsufficientFundsError = mod.InsufficientFundsError;

    async function runCheckout(opts: any) {
      if (typeof checkoutFn !== 'function') {
        throw new Error("marketplace-service.ts must export 'checkout' function");
      }
      if (checkoutFn.length >= 2) {
        return await checkoutFn(prisma, opts);
      }
      const res = checkoutFn(opts);
      if (res === undefined || res === null) {
        return await checkoutFn(prisma, opts);
      }
      return res;
    }

    return { runCheckout, OutOfStockError, InsufficientFundsError };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Part 1: Stock Race Condition under 50ms Read Delay
  // ───────────────────────────────────────────────────────────────────────────
  const dbRace = new MarketplaceDatabaseSimulator({
    users: [
      { id: 1, email: 'buyer1@test.io', name: 'Buyer 1' },
      { id: 2, email: 'buyer2@test.io', name: 'Buyer 2' },
    ],
    wallets: [
      { id: 1, userId: 1, balanceCents: 50000 },
      { id: 2, userId: 2, balanceCents: 50000 },
    ],
    products: [
      { id: 10, title: 'Limited Item', priceCents: 1000, stock: 1 }, // Only 1 in stock!
    ],
  });

  const prismaRace = dbRace.createPrismaClient({ readDelayMs: 40 });
  const serviceRace = await createServiceRunner(prismaRace);

  const [res1, res2] = await Promise.allSettled([
    serviceRace.runCheckout({
      buyerId: 1,
      items: [{ productId: 10, quantity: 1 }],
      idempotencyKey: 'race-key-1',
    }),
    serviceRace.runCheckout({
      buyerId: 2,
      items: [{ productId: 10, quantity: 1 }],
      idempotencyKey: 'race-key-2',
    }),
  ]);

  const p10 = dbRace.data.products.find((p) => p.id === 10);
  if (!p10) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: 'Product 10 missing during race condition test.',
      durationMs: Date.now() - start,
    };
  }

  // Both succeeded = oversell bug!
  if (res1.status === 'fulfilled' && res2.status === 'fulfilled') {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Concurrency race condition detected: both buyers successfully checked out the last unit of stock (final stock: ${p10.stock}). Naive check-then-act allows overselling under latency. Use atomic conditional updates or interactive transaction checks.`,
      durationMs: Date.now() - start,
    };
  }

  // Exactly one must succeed, one must fail
  const fulfilledCount = (res1.status === 'fulfilled' ? 1 : 0) + (res2.status === 'fulfilled' ? 1 : 0);
  if (fulfilledCount !== 1) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Expected exactly 1 buyer to succeed on the last stock unit. Succeeded: ${fulfilledCount}.`,
      durationMs: Date.now() - start,
    };
  }

  const failedResult = res1.status === 'rejected' ? res1 : res2;
  const errorObj = (failedResult as PromiseRejectedResult).reason;
  const isOutOfStock =
    errorObj?.name === 'OutOfStockError' ||
    (errorObj?.message && errorObj.message.toLowerCase().includes('stock')) ||
    (serviceRace.OutOfStockError && errorObj instanceof serviceRace.OutOfStockError);

  if (!isOutOfStock) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `The losing buyer in the stock race must receive an OutOfStockError. Received: ${errorObj?.name ?? errorObj?.message ?? String(errorObj)}`,
      durationMs: Date.now() - start,
    };
  }

  if (p10.stock !== 0) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Final product stock should be exactly 0 after purchasing the last unit. Found: ${p10.stock}.`,
      durationMs: Date.now() - start,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Part 2: Atomic Rollback on Insufficient Funds
  // ───────────────────────────────────────────────────────────────────────────
  const dbRollback = new MarketplaceDatabaseSimulator({
    users: [{ id: 1, email: 'poor@test.io', name: 'Poor Buyer' }],
    wallets: [{ id: 1, userId: 1, balanceCents: 500 }], // Only $5.00
    products: [{ id: 20, title: 'Expensive Item', priceCents: 2000, stock: 5 }], // $20.00
  });

  const prismaRollback = dbRollback.createPrismaClient();
  const serviceRollback = await createServiceRunner(prismaRollback);

  let rollbackErrorThrown = false;
  try {
    await serviceRollback.runCheckout({
      buyerId: 1,
      items: [{ productId: 20, quantity: 1 }],
      idempotencyKey: 'rollback-test-key',
    });
  } catch (err: any) {
    rollbackErrorThrown = true;
    const isInsufficient =
      err?.name === 'InsufficientFundsError' ||
      (err?.message && err.message.toLowerCase().includes('funds')) ||
      (serviceRollback.InsufficientFundsError && err instanceof serviceRollback.InsufficientFundsError);

    if (!isInsufficient) {
      return {
        gateNumber: 4,
        gateName: 'Concurrency, Rollback & Idempotency',
        passed: false,
        feedback: `Expected InsufficientFundsError when wallet balance is lower than total price. Received: ${err?.name ?? err?.message}`,
        durationMs: Date.now() - start,
      };
    }
  }

  if (!rollbackErrorThrown) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: 'checkout() allowed purchase when wallet balance was less than total cents.',
      durationMs: Date.now() - start,
    };
  }

  // Assert zero partial mutations
  const walletRollback = dbRollback.data.wallets.find((w) => w.userId === 1);
  const p20 = dbRollback.data.products.find((p) => p.id === 20);

  if (walletRollback?.balanceCents !== 500) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Transaction rollback failed: buyer wallet balance was partially mutated (expected 500, found ${walletRollback?.balanceCents}). Ensure all operations run inside $transaction.`,
      durationMs: Date.now() - start,
    };
  }

  if (p20?.stock !== 5) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Transaction rollback failed: product stock was partially decremented despite insufficient funds.`,
      durationMs: Date.now() - start,
    };
  }

  if (dbRollback.data.orders.length > 0 || dbRollback.data.orderItems.length > 0) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Transaction rollback failed: orphan Order or OrderItem records were persisted after failure.`,
      durationMs: Date.now() - start,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Part 3: Idempotency Key Interception (Zero Double-Charge)
  // ───────────────────────────────────────────────────────────────────────────
  const dbIdemp = new MarketplaceDatabaseSimulator({
    users: [{ id: 1, email: 'buyer@test.io', name: 'Buyer' }],
    wallets: [{ id: 1, userId: 1, balanceCents: 10000 }], // $100.00
    products: [{ id: 30, title: 'Idempotent Item', priceCents: 2000, stock: 10 }], // $20.00
  });

  const prismaIdemp = dbIdemp.createPrismaClient();
  const serviceIdemp = await createServiceRunner(prismaIdemp);

  // First checkout request
  const order1 = await serviceIdemp.runCheckout({
    buyerId: 1,
    items: [{ productId: 30, quantity: 1 }],
    idempotencyKey: 'idemp-duplicate-test',
  });

  const walletAfterFirst = dbIdemp.data.wallets.find((w) => w.userId === 1)?.balanceCents;
  const stockAfterFirst = dbIdemp.data.products.find((p) => p.id === 30)?.stock;

  // Second checkout request with identical idempotencyKey
  let order2: any;
  try {
    order2 = await serviceIdemp.runCheckout({
      buyerId: 1,
      items: [{ productId: 30, quantity: 1 }],
      idempotencyKey: 'idemp-duplicate-test',
    });
  } catch (err: any) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Resubmitting duplicate idempotencyKey crashed with: ${err?.message}. The service must catch P2002 unique constraint violations and return the existing order.`,
      durationMs: Date.now() - start,
    };
  }

  if (!order2 || order2.id !== order1.id) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Duplicate idempotencyKey must return the existing Order record (order1 id: ${order1?.id}, order2 id: ${order2?.id}).`,
      durationMs: Date.now() - start,
    };
  }

  const walletAfterSecond = dbIdemp.data.wallets.find((w) => w.userId === 1)?.balanceCents;
  const stockAfterSecond = dbIdemp.data.products.find((p) => p.id === 30)?.stock;

  if (walletAfterSecond !== walletAfterFirst) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Idempotency failure: buyer was double-charged! Wallet balance after second call: ${walletAfterSecond} (expected: ${walletAfterFirst}).`,
      durationMs: Date.now() - start,
    };
  }

  if (stockAfterSecond !== stockAfterFirst) {
    return {
      gateNumber: 4,
      gateName: 'Concurrency, Rollback & Idempotency',
      passed: false,
      feedback: `Idempotency failure: stock was double-decremented! Stock after second call: ${stockAfterSecond} (expected: ${stockAfterFirst}).`,
      durationMs: Date.now() - start,
    };
  }

  return {
    gateNumber: 4,
    gateName: 'Concurrency, Rollback & Idempotency',
    passed: true,
    feedback: 'Gate 4 Passed: Protected against stock race conditions under latency, verified atomic transaction rollback, and intercepted duplicate idempotency keys without double-charging.',
    durationMs: Date.now() - start,
  };
}
