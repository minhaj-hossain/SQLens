/**
 * Greenfield Exam — Gate 1: Schema DDL & AST Validation.
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects `schema.prisma` AST against structural, currency, and index invariants.
 */

import { parsePrismaSchema, findModel } from '../prisma-schema-parser';
import type { GateResult } from '../../../types/greenfield-exam';

export function evaluateSchemaGate(schemaPrisma: string): GateResult {
  const start = Date.now();
  const schema = parsePrismaSchema(schemaPrisma);

  const requiredModels = ['User', 'Wallet', 'Product', 'Order', 'OrderItem'];
  for (const modelName of requiredModels) {
    if (!findModel(schema, modelName)) {
      return {
        gateNumber: 1,
        gateName: 'Schema DDL & AST Invariants',
        passed: false,
        feedback: `Missing model '${modelName}' in schema.prisma. The marketplace requires: User, Wallet, Product, Order, OrderItem.`,
        durationMs: Date.now() - start,
      };
    }
  }

  const userModel = findModel(schema, 'User')!;
  const walletModel = findModel(schema, 'Wallet')!;
  const productModel = findModel(schema, 'Product')!;
  const orderModel = findModel(schema, 'Order')!;
  const orderItemModel = findModel(schema, 'OrderItem')!;

  // 1. Strict Integer Currency Invariant (No Float!)
  const currencyFields: [string, string][] = [
    ['Wallet', 'balanceCents'],
    ['Product', 'priceCents'],
    ['Order', 'totalCents'],
    ['OrderItem', 'unitPriceCents'],
  ];

  for (const [mName, fName] of currencyFields) {
    const model = findModel(schema, mName)!;
    const field = model.fields.find((f) => f.name === fName);
    if (!field) {
      return {
        gateNumber: 1,
        gateName: 'Schema DDL & AST Invariants',
        passed: false,
        feedback: `Model '${mName}' is missing integer currency field '${fName}'.`,
        durationMs: Date.now() - start,
      };
    }

    if (field.baseType.toLowerCase() === 'float') {
      return {
        gateNumber: 1,
        gateName: 'Schema DDL & AST Invariants',
        passed: false,
        feedback: `Model '${mName}.${fName}' uses Float. Financial transactions must strictly use integer cents (Int) to prevent IEEE 754 floating-point rounding errors.`,
        durationMs: Date.now() - start,
      };
    }

    if (field.baseType !== 'Int') {
      return {
        gateNumber: 1,
        gateName: 'Schema DDL & AST Invariants',
        passed: false,
        feedback: `Model '${mName}.${fName}' must be scalar type 'Int' representing cents. Found: '${field.type}'.`,
        durationMs: Date.now() - start,
      };
    }
  }

  // 2. Strict 1:1 Invariant: Wallet.userId @unique
  const userIdFk = walletModel.fields.find((f) => f.name === 'userId');
  if (!userIdFk) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Wallet must define foreign key column 'userId Int'.`,
      durationMs: Date.now() - start,
    };
  }

  const hasUniqueOnWalletFk =
    userIdFk.attributes.some((attr) => attr.startsWith('@unique')) ||
    (walletModel.blockAttributes &&
      walletModel.blockAttributes.some((attr) =>
        /@@unique\s*\(\s*\[\s*userId\s*\]\s*\)/.test(attr),
      ));

  if (!hasUniqueOnWalletFk) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Wallet.userId must have @unique. In Prisma, a 1:1 relation requires a unique constraint on the foreign key column; otherwise Prisma models it as 1:N.`,
      durationMs: Date.now() - start,
    };
  }

  // 3. Order.idempotencyKey @unique
  const idempotencyField = orderModel.fields.find((f) => f.name === 'idempotencyKey');
  if (!idempotencyField) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Order must define unique string field 'idempotencyKey String @unique'.`,
      durationMs: Date.now() - start,
    };
  }

  const hasUniqueOnIdempotency =
    idempotencyField.attributes.some((attr) => attr.startsWith('@unique')) ||
    (orderModel.blockAttributes &&
      orderModel.blockAttributes.some((attr) =>
        /@@unique\s*\(\s*\[\s*idempotencyKey\s*\]\s*\)/.test(attr),
      ));

  if (!hasUniqueOnIdempotency) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Order.idempotencyKey must declare @unique to enforce idempotency at the database constraint level.`,
      durationMs: Date.now() - start,
    };
  }

  // 4. Composite Index on Order: @@index([buyerId, createdAt])
  const compositePattern =
    /@@index\s*\(\s*\[\s*buyerId\s*,\s*createdAt(?:\s*\(\s*sort\s*:\s*(?:Desc|Asc)\s*\))?\s*\]\s*\)/i;
  const hasCompositeIndex = (orderModel.blockAttributes ?? []).some((attr) =>
    compositePattern.test(attr),
  );

  if (!hasCompositeIndex) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Order is missing composite index @@index([buyerId, createdAt]). Add this index to support fast chronological order lookups per buyer.`,
      durationMs: Date.now() - start,
    };
  }

  // 5. Relations integrity
  const userWalletRel = userModel.fields.find((f) => f.baseType === 'Wallet');
  const walletUserRel = walletModel.fields.find((f) => f.baseType === 'User');
  if (!userWalletRel || !walletUserRel) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Missing 1:1 relation handles between User and Wallet.`,
      durationMs: Date.now() - start,
    };
  }

  const orderItemsRel = orderModel.fields.find((f) => f.baseType === 'OrderItem' && f.isList);
  const itemOrderRel = orderItemModel.fields.find((f) => f.baseType === 'Order');
  if (!orderItemsRel || !itemOrderRel) {
    return {
      gateNumber: 1,
      gateName: 'Schema DDL & AST Invariants',
      passed: false,
      feedback: `Missing 1:N relation between Order and OrderItem (Order must list items OrderItem[]).`,
      durationMs: Date.now() - start,
    };
  }

  return {
    gateNumber: 1,
    gateName: 'Schema DDL & AST Invariants',
    passed: true,
    feedback: 'Gate 1 Passed: Schema DDL, integer currency, 1:1 unique foreign key, and composite indexes verified.',
    durationMs: Date.now() - start,
  };
}
