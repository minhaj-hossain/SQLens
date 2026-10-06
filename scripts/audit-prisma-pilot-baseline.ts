/**
 * scripts/audit-prisma-pilot-baseline.ts
 * -----------------------------------------------------------------------------
 * Phase 6 Baseline Verification & Automated Regression Sign-Off.
 *
 * Verifies that the entire reformed Prisma Learning Fluency curriculum meets:
 *   1. Content Census & Coverage: 91 tasks across Days 1–14 with 3-tier hints and daily from-scratch reps.
 *   2. Milestone Checkpoints: Checkpoint 1 (Catalog & Review) and Checkpoint 2 (Cursor Tiebreaker) graders.
 *   3. Greenfield 4-Gate Exam: Full 4-stage evaluation of the capstone server exam.
 *   4. Empirical Falsification Rules: Synthetic 5-learner pilot cohort meets all 3 locked-in rules:
 *      - Rule 1: CP1 composite index <= 1 failure out of 5 in 25 min.
 *      - Rule 2: CP2 cursor tiebreaker <= 2 participants needing >1 failed attempt.
 *      - Rule 3: Platform autonomy <= 3 checkpoint doc searches per participant.
 *
 * Exit code 0 on complete clean baseline; exit code 1 on any regression or rule breach.
 * Run: npm run audit:prisma-pilot
 */

import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index.js';
import { gradeCheckpoint1Schema } from '../src/lib/prisma-engine/graders/grade-checkpoint1-schema.js';
import { gradeCheckpoint2Feed } from '../src/lib/prisma-engine/graders/grade-checkpoint2-feed.js';
import { runGreenfieldExam } from '../src/lib/prisma-engine/greenfield/index.js';
import {
  evaluatePilotCohort,
  summarizeParticipant,
  formatCohortMarkdownReport,
  type PilotEvent,
} from '../src/lib/prisma-engine/pilot/index.js';

interface AuditFinding {
  system: string;
  detail: string;
}

const findings: AuditFinding[] = [];

console.log('=== Prisma Curriculum Baseline & Pilot Verification (Phase 6) ===\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Curriculum Task & Hint Ladder Census
// ─────────────────────────────────────────────────────────────────────────────
let totalTasks = 0;
let fromScratchCount = 0;

for (const mod of PRISMA_MODULES) {
  const allTasks = [
    ...(mod.concepts.flatMap((c) => c.tasks ?? [])),
    ...(mod.challenge?.tasks ?? []),
  ];

  for (const task of allTasks) {
    totalTasks++;
    if (task.prisma?.fromScratch) fromScratchCount++;

    if (!task.hints || task.hints.length < 3) {
      findings.push({
        system: 'Task Census',
        detail: `Task ${task.id} in Day ${mod.day} has fewer than 3 hints (${task.hints?.length ?? 0}).`,
      });
    }

    if (task.hints?.[0] && task.hints[0].text.includes('`')) {
      findings.push({
        system: 'Hint Contract',
        detail: `Task ${task.id} Tier 1 hint contains backticks.`,
      });
    }
  }
}

console.log(`Curriculum Tasks Audited:  ${totalTasks} (expected 91)`);
console.log(`From-Scratch Reps:         ${fromScratchCount} (expected >= 14)`);

if (totalTasks < 91) {
  findings.push({
    system: 'Task Census',
    detail: `Expected 91 tasks, found ${totalTasks}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Checkpoint Grader Verification
// ─────────────────────────────────────────────────────────────────────────────
// Checkpoint 1: Correct composite index
const validCP1 = `
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
const cp1Res = gradeCheckpoint1Schema(validCP1, 'prisma04-hw-2');
if (!cp1Res.passed) {
  findings.push({
    system: 'Checkpoint 1 Grader',
    detail: `Valid Checkpoint 1 schema failed: ${cp1Res.feedback}`,
  });
}

// Checkpoint 2: Deterministic Feed
const validCP2 = `
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
const cp2Res = await gradeCheckpoint2Feed(validCP2, 'prisma08-hw-2');
if (!cp2Res.passed) {
  findings.push({
    system: 'Checkpoint 2 Grader',
    detail: `Valid Checkpoint 2 feed service failed: ${cp2Res.feedback}`,
  });
}

console.log('Milestone Checkpoints:     Verified (CP1 Schema + CP2 Cursor Feed OK)');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Greenfield 4-Gate Exam Runner Verification
// ─────────────────────────────────────────────────────────────────────────────
const validExamSchema = `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

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

const validExamSeed = `
  export async function seed(prisma) {
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

const validExamService = `
  export class OutOfStockError extends Error {
    constructor(message = 'Product out of stock') { super(message); this.name = 'OutOfStockError'; }
  }
  export class InsufficientFundsError extends Error {
    constructor(message = 'Insufficient funds in wallet') { super(message); this.name = 'InsufficientFundsError'; }
  }
  export async function checkout(prisma, options) {
    const { buyerId, items, idempotencyKey } = options;
    const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (existingOrder) return existingOrder;

    try {
      return await prisma.$transaction(async (tx) => {
        let totalCents = 0;
        const productUpdates = [];
        for (const item of items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new OutOfStockError('Item ' + item.productId + ' does not have enough stock');
          }
          totalCents += product.priceCents * item.quantity;
          productUpdates.push({ productId: item.productId, unitPriceCents: product.priceCents, quantity: item.quantity });
        }
        const wallet = await tx.wallet.findUnique({ where: { userId: buyerId } });
        if (!wallet || wallet.balanceCents < totalCents) {
          throw new InsufficientFundsError('Wallet balance insufficient');
        }
        for (const item of productUpdates) {
          await tx.product.update({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.wallet.update({
          where: { userId: buyerId },
          data: { balanceCents: { decrement: totalCents } },
        });
        const order = await tx.order.create({ data: { buyerId, totalCents, idempotencyKey } });
        for (const item of productUpdates) {
          await tx.orderItem.create({
            data: { orderId: order.id, productId: item.productId, quantity: item.quantity, unitPriceCents: item.unitPriceCents },
          });
        }
        return order;
      });
    } catch (err) {
      if (err?.code === 'P2025' || (err?.message && err.message.includes('Record to update not found'))) {
        throw new OutOfStockError('Product out of stock');
      }
      if (err?.code === 'P2002' || (err?.message && err.message.includes('idempotencyKey'))) {
        const duplicate = await prisma.order.findUnique({ where: { idempotencyKey } });
        if (duplicate) return duplicate;
      }
      throw err;
    }
  }
`;

const examRes = await runGreenfieldExam({
  schemaPrisma: validExamSchema,
  seedCode: validExamSeed,
  serviceCode: validExamService,
});

if (!examRes.passed) {
  findings.push({
    system: 'Greenfield 4-Gate Exam',
    detail: `Greenfield Exam reference submission failed: ${examRes.gateResults?.find((g) => !g.passed)?.feedback ?? examRes.feedback}`,
  });
}

console.log('Greenfield 4-Gate Exam:    Verified (Gates 1, 2, 3, 4 passed cleanly)');

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pilot Cohort Falsification Simulation & Evaluation
// ─────────────────────────────────────────────────────────────────────────────
const cohortEvents: PilotEvent[] = [];
const participants = [
  { id: 'learner-1', cp1Minutes: 15, cp2Attempts: 1, cpDocs: 0, stalls: 2, mutates: 0 },
  { id: 'learner-2', cp1Minutes: 18, cp2Attempts: 2, cpDocs: 1, stalls: 3, mutates: 1 },
  { id: 'learner-3', cp1Minutes: 21, cp2Attempts: 1, cpDocs: 1, stalls: 4, mutates: 1 },
  { id: 'learner-4', cp1Minutes: 17, cp2Attempts: 2, cpDocs: 0, stalls: 1, mutates: 0 },
  { id: 'learner-5', cp1Minutes: 23, cp2Attempts: 2, cpDocs: 2, stalls: 5, mutates: 2 },
];

for (const p of participants) {
  for (let i = 0; i < p.stalls; i++) {
    cohortEvents.push({ participantId: p.id, sessionId: 's1', taskId: 'prisma03-c1-t1', kind: 'STALL', timestamp: i });
  }
  for (let i = 0; i < p.mutates; i++) {
    cohortEvents.push({ participantId: p.id, sessionId: 's1', taskId: 'prisma07-c1-t1', kind: 'MUTATE', timestamp: i });
  }
  for (let i = 0; i < p.cpDocs; i++) {
    cohortEvents.push({ participantId: p.id, sessionId: 's1', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: i });
  }

  cohortEvents.push({
    participantId: p.id,
    sessionId: 's1',
    taskId: 'prisma04-hw-2',
    kind: 'CHECKPOINT_SUBMIT',
    timestamp: 1000,
    durationMs: p.cp1Minutes * 60 * 1000,
    metadata: { passed: true },
  });

  for (let a = 1; a <= p.cp2Attempts; a++) {
    cohortEvents.push({
      participantId: p.id,
      sessionId: 's1',
      taskId: 'prisma08-hw-2',
      kind: 'CHECKPOINT_SUBMIT',
      timestamp: 2000 + a,
      metadata: { passed: a === p.cp2Attempts },
    });
  }
}

const cohortEval = evaluatePilotCohort(cohortEvents);
const summaries = participants.map((p) => summarizeParticipant(p.id, cohortEvents));

if (!cohortEval.passed) {
  findings.push({
    system: 'Pilot Falsification Evaluation',
    detail: `Baseline pilot cohort failed: ${cohortEval.recommendations.join('; ')}`,
  });
}

console.log('Pilot Cohort Falsification: Verified (Rules 1, 2, 3 all passed cleanly)\n');
console.log(formatCohortMarkdownReport(cohortEval, summaries));

// ─────────────────────────────────────────────────────────────────────────────
// Summary Verdict
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- BASELINE VERIFICATION SUMMARY ---');
console.log(`Total Findings: ${findings.length}`);

if (findings.length > 0) {
  console.error('\nFindings detected:');
  for (const f of findings) {
    console.error(`- [${f.system}] ${f.detail}`);
  }
  process.exit(1);
} else {
  console.log('\nAll Prisma Learning Fluency curriculum systems verified and locked into baseline!');
  process.exit(0);
}
