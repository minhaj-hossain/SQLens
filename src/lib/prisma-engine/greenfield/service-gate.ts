/**
 * Greenfield Exam — Gate 3: Service Happy Path Evaluator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates standard checkout execution:
 *  - Calculates order total correctly in integer cents.
 *  - Debits buyer's wallet atomically.
 *  - Decrements inventory stock.
 *  - Creates Order and OrderItem records.
 */

import { prepareGreenfieldCode, AsyncFunction } from './prepare-code';
import { MarketplaceDatabaseSimulator } from './mock-marketplace-db';
import type { GateResult } from '../../../types/greenfield-exam';

export async function evaluateServiceGate(serviceCode: string): Promise<GateResult> {
  const start = Date.now();

  const db = new MarketplaceDatabaseSimulator({
    users: [{ id: 1, email: 'buyer@marketplace.io', name: 'Buyer One' }],
    wallets: [{ id: 1, userId: 1, balanceCents: 10000 }], // $100.00
    products: [
      { id: 1, title: 'Mechanical Keyboard', priceCents: 3000, stock: 5 }, // $30.00
      { id: 2, title: 'Keycap Set', priceCents: 1500, stock: 10 }, // $15.00
    ],
  });

  const prisma = db.createPrismaClient();
  const prepared = prepareGreenfieldCode(serviceCode);

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

  let mod: any;
  try {
    mod = await runner(prisma, exports);
  } catch (err: any) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Compilation/execution error in marketplace-service.ts: ${err?.message ?? String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  const checkoutFn = mod.checkout ?? mod.default?.checkout;
  if (typeof checkoutFn !== 'function') {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `marketplace-service.ts must export a function named 'checkout'.`,
      durationMs: Date.now() - start,
    };
  }

  // Execute checkout helper supporting (prisma, options) or (options)
  async function runCheckout(opts: any) {
    if (checkoutFn.length >= 2) {
      return await checkoutFn(prisma, opts);
    }
    const res = checkoutFn(opts);
    if (res === undefined || res === null) {
      // Fallback try (prisma, opts)
      return await checkoutFn(prisma, opts);
    }
    return res;
  }

  let order: any;
  try {
    order = await runCheckout({
      buyerId: 1,
      items: [
        { productId: 1, quantity: 1 }, // 3000
        { productId: 2, quantity: 1 }, // 1500
      ],
      idempotencyKey: 'happy-path-test-order',
    });
  } catch (err: any) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `checkout() threw an unexpected error on happy path: ${err?.message ?? String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  if (!order || typeof order !== 'object') {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `checkout() must return the created Order record. Returned: ${typeof order}`,
      durationMs: Date.now() - start,
    };
  }

  // 1. Order Total Verification
  if (order.totalCents !== 4500) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Order total is incorrect: expected 4500 cents ($45.00), found ${order.totalCents} cents.`,
      durationMs: Date.now() - start,
    };
  }

  if (order.buyerId !== 1 || order.idempotencyKey !== 'happy-path-test-order') {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Order record has mismatched buyerId or idempotencyKey.`,
      durationMs: Date.now() - start,
    };
  }

  // 2. Buyer Wallet Debit Verification
  const buyerWallet = db.data.wallets.find((w) => w.userId === 1);
  if (!buyerWallet || buyerWallet.balanceCents !== 5500) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Buyer wallet was not debited accurately. Expected balanceCents: 5500, found: ${buyerWallet?.balanceCents}.`,
      durationMs: Date.now() - start,
    };
  }

  // 3. Product Inventory Decrement Verification
  const p1 = db.data.products.find((p) => p.id === 1);
  const p2 = db.data.products.find((p) => p.id === 2);
  if (!p1 || p1.stock !== 4 || !p2 || p2.stock !== 9) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Product inventory was not decremented. Product 1 stock: expected 4, found ${p1?.stock}; Product 2 stock: expected 9, found ${p2?.stock}.`,
      durationMs: Date.now() - start,
    };
  }

  // 4. Order Item Verification
  const orderItems = db.data.orderItems.filter((oi) => oi.orderId === order.id);
  if (orderItems.length !== 2) {
    return {
      gateNumber: 3,
      gateName: 'Service Happy Path',
      passed: false,
      feedback: `Expected 2 OrderItem records created for order #${order.id}. Found: ${orderItems.length}.`,
      durationMs: Date.now() - start,
    };
  }

  return {
    gateNumber: 3,
    gateName: 'Service Happy Path',
    passed: true,
    feedback: 'Gate 3 Passed: Checkout service successfully charged wallet, decremented stock, and created Order + OrderItem records.',
    durationMs: Date.now() - start,
  };
}
