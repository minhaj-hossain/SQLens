import { describe, expect, it } from 'vitest';
import { runGreenfieldExam } from '../../src/lib/prisma-engine/greenfield/exam-runner';
import { evaluateSchemaGate } from '../../src/lib/prisma-engine/greenfield/schema-gate';
import { evaluateSeedGate } from '../../src/lib/prisma-engine/greenfield/seed-gate';
import { evaluateServiceGate } from '../../src/lib/prisma-engine/greenfield/service-gate';
import { evaluateConcurrencyGate } from '../../src/lib/prisma-engine/greenfield/concurrency-gate';
import type { GreenfieldSubmission } from '../../src/types/greenfield-exam';

describe('Phase 5: Greenfield Marketplace Exam Runner (4 Staged Gates)', () => {
  const validSchema = `
    model User {
      id      Int      @id @default(autoincrement())
      email   String   @unique
      name    String
      wallet  Wallet?
      orders  Order[]
    }

    model Wallet {
      id           Int  @id @default(autoincrement())
      balanceCents Int
      userId       Int  @unique
      user         User @relation(fields: [userId], references: [id])
    }

    model Product {
      id         Int         @id @default(autoincrement())
      title      String
      priceCents Int
      stock      Int
      items      OrderItem[]
    }

    model Order {
      id             Int         @id @default(autoincrement())
      buyerId        Int
      totalCents     Int
      idempotencyKey String      @unique
      createdAt      DateTime    @default(now())
      items          OrderItem[]

      @@index([buyerId, createdAt])
    }

    model OrderItem {
      id             Int     @id @default(autoincrement())
      orderId        Int
      productId      Int
      quantity       Int
      unitPriceCents Int
      order          Order   @relation(fields: [orderId], references: [id])
      product        Product @relation(fields: [productId], references: [id])
    }
  `;

  const validSeed = `
    export async function seed(prisma: any) {
      await prisma.user.upsert({
        where: { email: 'buyer1@test.io' },
        update: { name: 'Buyer 1' },
        create: { id: 1, email: 'buyer1@test.io', name: 'Buyer 1' },
      });

      await prisma.user.upsert({
        where: { email: 'buyer2@test.io' },
        update: { name: 'Buyer 2' },
        create: { id: 2, email: 'buyer2@test.io', name: 'Buyer 2' },
      });

      await prisma.wallet.upsert({
        where: { userId: 1 },
        update: { balanceCents: 50000 },
        create: { id: 1, userId: 1, balanceCents: 50000 },
      });

      await prisma.wallet.upsert({
        where: { userId: 2 },
        update: { balanceCents: 50000 },
        create: { id: 2, userId: 2, balanceCents: 50000 },
      });

      await prisma.product.upsert({
        where: { id: 1 },
        update: { title: 'Keyboard', priceCents: 3000, stock: 10 },
        create: { id: 1, title: 'Keyboard', priceCents: 3000, stock: 10 },
      });

      await prisma.product.upsert({
        where: { id: 2 },
        update: { title: 'Mouse', priceCents: 1500, stock: 15 },
        create: { id: 2, title: 'Mouse', priceCents: 1500, stock: 15 },
      });
    }
  `;

  const validService = `
    export class OutOfStockError extends Error {
      constructor(message = 'Product out of stock') {
        super(message);
        this.name = 'OutOfStockError';
      }
    }

    export class InsufficientFundsError extends Error {
      constructor(message = 'Insufficient funds in wallet') {
        super(message);
        this.name = 'InsufficientFundsError';
      }
    }

    export async function checkout(
      prisma: any,
      options: {
        buyerId: number;
        items: { productId: number; quantity: number }[];
        idempotencyKey: string;
      },
    ) {
      const { buyerId, items, idempotencyKey } = options;

      // Catch duplicate idempotency key before re-processing
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
      });
      if (existingOrder) {
        return existingOrder;
      }

      try {
        return await prisma.$transaction(async (tx: any) => {
          // 1. Fetch products & calculate total
          let totalCents = 0;
          const productUpdates = [];

          for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product || product.stock < item.quantity) {
              throw new OutOfStockError('Item ' + item.productId + ' does not have enough stock');
            }
            totalCents += product.priceCents * item.quantity;
            productUpdates.push({
              productId: item.productId,
              unitPriceCents: product.priceCents,
              quantity: item.quantity,
            });
          }

          // 2. Check buyer wallet balance
          const wallet = await tx.wallet.findUnique({ where: { userId: buyerId } });
          if (!wallet || wallet.balanceCents < totalCents) {
            throw new InsufficientFundsError('Wallet balance insufficient');
          }

          // 3. Atomically decrement stock with conditional guards
          for (const item of productUpdates) {
            await tx.product.update({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
          }

          // 4. Atomically debit wallet balance
          await tx.wallet.update({
            where: { userId: buyerId },
            data: { balanceCents: { decrement: totalCents } },
          });

          // 5. Create Order + OrderItems
          const order = await tx.order.create({
            data: {
              buyerId,
              totalCents,
              idempotencyKey,
            },
          });

          for (const item of productUpdates) {
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPriceCents: item.unitPriceCents,
              },
            });
          }

          return order;
        });
      } catch (err: any) {
        if (err?.code === 'P2025' || (err?.message && err.message.includes('Record to update not found'))) {
          throw new OutOfStockError('Product out of stock');
        }
        // Intercept concurrent P2002 duplicate insertion
        if (err?.code === 'P2002' || (err?.message && err.message.includes('idempotencyKey'))) {
          const duplicate = await prisma.order.findUnique({ where: { idempotencyKey } });
          if (duplicate) return duplicate;
        }
        throw err;
      }
    }
  `;

  const validSubmission: GreenfieldSubmission = {
    schemaPrisma: validSchema,
    seedCode: validSeed,
    serviceCode: validService,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Comprehensive End-to-End Exam Run
  // ───────────────────────────────────────────────────────────────────────────
  it('passes all 4 gates cleanly for a complete valid marketplace submission', async () => {
    const outcome = await runGreenfieldExam(validSubmission);
    expect(outcome.passed).toBe(true);
    expect(outcome.gateResults.length).toBe(4);
    expect(outcome.gateResults.every((g) => g.passed)).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Gate 1: Schema Invariant Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('Gate 1: Schema Invariants', () => {
    it('fails when currency uses Float instead of integer cents', () => {
      const floatSchema = validSchema.replace('priceCents Int', 'priceCents Float');
      const res = evaluateSchemaGate(floatSchema);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('uses Float');
      expect(res.feedback).toContain('Financial transactions must strictly use integer cents (Int)');
    });

    it('fails when Wallet.userId lacks @unique', () => {
      const nonUniqueWallet = validSchema.replace('userId       Int  @unique', 'userId       Int');
      const res = evaluateSchemaGate(nonUniqueWallet);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Wallet.userId must have @unique');
    });

    it('fails when Order composite index is missing', () => {
      const missingIndex = validSchema.replace('@@index([buyerId, createdAt])', '');
      const res = evaluateSchemaGate(missingIndex);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('missing composite index @@index([buyerId, createdAt])');
    });

    it('fails when Order.idempotencyKey lacks @unique', () => {
      const nonUniqueIdemp = validSchema.replace(
        'idempotencyKey String      @unique',
        'idempotencyKey String',
      );
      const res = evaluateSchemaGate(nonUniqueIdemp);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Order.idempotencyKey must declare @unique');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Gate 2: Deterministic Seeding Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('Gate 2: Deterministic Seeding', () => {
    it('fails when seed script is non-idempotent and crashes on second run with P2002', async () => {
      const nonIdempotentSeed = `
        export async function seed(prisma: any) {
          // Naive create throws P2002 on second execution
          await prisma.user.create({ data: { id: 1, email: 'buyer1@test.io', name: 'Buyer 1' } });
          await prisma.user.create({ data: { id: 2, email: 'buyer2@test.io', name: 'Buyer 2' } });
          await prisma.wallet.create({ data: { id: 1, userId: 1, balanceCents: 1000 } });
          await prisma.wallet.create({ data: { id: 2, userId: 2, balanceCents: 1000 } });
          await prisma.product.create({ data: { id: 1, title: 'Item 1', priceCents: 100, stock: 5 } });
          await prisma.product.create({ data: { id: 2, title: 'Item 2', priceCents: 100, stock: 5 } });
        }
      `;
      const res = await evaluateSeedGate(nonIdempotentSeed);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('seed.ts is not idempotent');
      expect(res.feedback).toContain('P2002');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Gate 3: Service Happy Path Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('Gate 3: Service Happy Path', () => {
    it('fails when checkout fails to debit buyer wallet', async () => {
      // Service that creates order but forgets wallet debit
      const missingDebitService = validService.replace(
        `await tx.wallet.update({\n            where: { userId: buyerId },\n            data: { balanceCents: { decrement: totalCents } },\n          });`,
        '// omitted debit',
      );
      const res = await evaluateServiceGate(missingDebitService);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Buyer wallet was not debited accurately');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Gate 4: Concurrency, Rollback & Idempotency Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('Gate 4: Concurrency, Rollback & Idempotency', () => {
    it('fails under latency race condition when using naive check-then-act stock update', async () => {
      // Replaces atomic decrement with naive read-then-write
      const naiveRaceService = validService.replace(
        `await tx.product.update({\n              where: { id: item.productId, stock: { gte: item.quantity } },\n              data: { stock: { decrement: item.quantity } },\n            });`,
        `const cur = await tx.product.findUnique({ where: { id: item.productId } });\n            await tx.product.update({ where: { id: item.productId }, data: { stock: cur.stock - item.quantity } });`,
      );

      const res = await evaluateConcurrencyGate(naiveRaceService);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Concurrency race condition detected');
    });

    it('fails when transactions do not roll back on insufficient funds', async () => {
      // Service that mutates stock outside of transaction on insufficient funds before throwing
      const nonRollbackService = validService.replace(
        "throw new InsufficientFundsError('Wallet balance insufficient');",
        "await prisma.product.update({ where: { id: items[0].productId }, data: { stock: { decrement: items[0].quantity } } }); throw new InsufficientFundsError('Wallet balance insufficient');",
      );

      const res = await evaluateConcurrencyGate(nonRollbackService);
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('Transaction rollback failed');
    });

    it('fails when duplicate idempotencyKey causes double-charge or crash', async () => {
      // Service that does not catch P2002 on duplicate idempotency key and omits pre-check
      const crashingIdempService = validService
        .replace(/const existingOrder = await prisma\.order\.findUnique[\s\S]*?return existingOrder;\s*\}/, '// omitted pre-check')
        .replace(/if\s*\(err\?\.code === 'P2002'[\s\S]*?return duplicate;\s*\}/, '// omitted duplicate catch');

      const res = await evaluateConcurrencyGate(crashingIdempService);
      expect(res.passed).toBe(false);
      expect(res.feedback.toLowerCase()).toContain('idempotency');
    });
  });
});
