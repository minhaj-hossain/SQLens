/**
 * Day 12 Interactive Transaction Behavioral Grader — Phase 2 (Task 2.4).
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates learner's transaction code for:
 *  1. Scoping Isolation: inside interactive `$transaction(async (tx) => ...)`,
 *     all operations must be called on `tx`, NEVER on `prisma`.
 *  2. Atomic Rollback: when an error is thrown inside the callback, mutations
 *     are completely rolled back (zero partial state commits).
 *  3. Array Form Atomicity: for array transactions (`$transaction([...])`),
 *     queries are passed as unawaited operation batches.
 */

import type { BehavioralGraderResult } from './grade-day6-singleton';
import { cleanTypeScriptCode } from './clean-ts';

interface UserRow {
  id: number;
  name: string;
  email: string;
}

export function gradeDay12Transaction(code: string, taskId: string): BehavioralGraderResult {
  try {
    const prepared = cleanTypeScriptCode(code);

    if (taskId === 'prisma12-c2-t1') {
      return gradeArrayTransaction(prepared);
    }
    if (taskId === 'prisma12-c2-t2') {
      return gradeInteractivePromote(prepared);
    }
    if (taskId === 'prisma12-c2-t3') {
      return gradeRollbackBehavior(prepared);
    }
    if (taskId === 'prisma12-hw-1') {
      return gradeInteractiveCheckout(prepared);
    }

    // Default routing
    if (/transfer\b/.test(prepared)) return gradeArrayTransaction(prepared);
    if (/promote\b/.test(prepared)) return gradeInteractivePromote(prepared);
    if (/executeWithRollback\b/.test(prepared)) return gradeRollbackBehavior(prepared);
    return gradeInteractiveCheckout(prepared);
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Execution error while testing transaction: ${err?.message ?? String(err)}`,
    };
  }
}

/** Array form $transaction([op1, op2]) */
function gradeArrayTransaction(preparedCode: string): BehavioralGraderResult {
  let transactionReceivedArray = false;
  let batchLength = 0;

  const mockPrisma = {
    user: {
      update({ where, data }: any) {
        return { op: 'update', where, data };
      },
    },
    $transaction(arg: any) {
      if (Array.isArray(arg)) {
        transactionReceivedArray = true;
        batchLength = arg.length;
        return arg;
      }
      throw new Error('$transaction expected an array of operations.');
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof transfer !== 'undefined') exports.transfer = transfer;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, exports);
  if (typeof mod.transfer !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `transfer(fromId, toId)`.',
    };
  }

  mod.transfer(1, 2);

  if (!transactionReceivedArray) {
    return {
      passed: false,
      feedback: 'Both updates must be bundled in array form: `await prisma.$transaction([ ... ])`.',
    };
  }

  if (batchLength < 2) {
    return {
      passed: false,
      feedback: 'Expected 2 operations inside the `$transaction` array.',
    };
  }

  return { passed: true };
}

/** Interactive transaction: promote (prisma12-c2-t2) */
function gradeInteractivePromote(preparedCode: string): BehavioralGraderResult {
  let calledPrismaInsideTx = false;
  let txMethodCalls: string[] = [];

  const mockPrisma = {
    user: {
      findFirst() {
        calledPrismaInsideTx = true;
        return null;
      },
      create() {
        calledPrismaInsideTx = true;
        return { id: 1, name: 'Promoted' };
      },
    },
    $transaction(cb: (tx: any) => any) {
      const mockTx = {
        user: {
          findFirst(args: any) {
            txMethodCalls.push('findFirst');
            return null; // Simulate user does not exist
          },
          create(args: any) {
            txMethodCalls.push('create');
            return { id: 2, ...args?.data };
          },
        },
      };
      return cb(mockTx);
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof promote !== 'undefined') exports.promote = promote;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, exports);
  if (typeof mod.promote !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `promote(name, email)`.',
    };
  }

  mod.promote('Alexandra', 'alex@prisma.io');

  if (calledPrismaInsideTx) {
    return {
      passed: false,
      feedback:
        'Critical Isolation Bug: You called `prisma.user.*` inside the transaction callback! All operations inside the callback must use `tx.user.*`.',
    };
  }

  if (!txMethodCalls.includes('create')) {
    return {
      passed: false,
      feedback: '`tx.user.create` was not called within the transaction.',
    };
  }

  return { passed: true };
}

/** Atomic Rollback Verification (prisma12-c2-t3) */
function gradeRollbackBehavior(preparedCode: string): BehavioralGraderResult {
  let initialDb: UserRow[] = [{ id: 1, name: 'Initial Name', email: 'user@prisma.io' }];
  let stagingDb: UserRow[] = JSON.parse(JSON.stringify(initialDb));
  let calledOnTx = false;
  let calledOnPrisma = false;

  const mockPrisma = {
    user: {
      update({ where, data }: any) {
        calledOnPrisma = true;
        const row = initialDb.find((r) => r.id === where.id);
        if (row) row.name = data.name;
        return row;
      },
    },
    $transaction(cb: (tx: any) => any) {
      stagingDb = JSON.parse(JSON.stringify(initialDb));
      const mockTx = {
        user: {
          update({ where, data }: any) {
            calledOnTx = true;
            const row = stagingDb.find((r) => r.id === where.id);
            if (row) row.name = data.name;
            return row;
          },
        },
      };

      try {
        const result = cb(mockTx);
        // Commit staging on success
        initialDb = JSON.parse(JSON.stringify(stagingDb));
        return result;
      } catch (err) {
        // Rollback: discard stagingDb
        throw err;
      }
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof executeWithRollback !== 'undefined') exports.executeWithRollback = executeWithRollback;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, exports);
  if (typeof mod.executeWithRollback !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `executeWithRollback(id, newName, shouldFail)`.',
    };
  }

  // Run with shouldFail = true
  try {
    mod.executeWithRollback(1, 'Mutated Name', true);
  } catch {
    // Unhandled exception caught; verify whether operations joined transaction
  }

  if (calledOnPrisma) {
    return {
      passed: false,
      feedback:
        'The update was executed directly on `prisma.user.update` instead of `tx.user.update` inside `$transaction`.',
    };
  }

  if (!calledOnTx) {
    return {
      passed: false,
      feedback: 'The update operation must be executed on `tx.user.update`.',
    };
  }

  // Verify rollback preserved initial state
  if (initialDb[0].name !== 'Initial Name') {
    return {
      passed: false,
      feedback:
        'Atomicity breach: database state was modified despite simulated failure! Unhandled errors inside `$transaction` must trigger a rollback.',
    };
  }

  return { passed: true };
}

/** Final Checkout Challenge (prisma12-hw-1) */
function gradeInteractiveCheckout(preparedCode: string): BehavioralGraderResult {
  let calledPrismaDirectly = false;
  let txUpdatedBuyer = false;
  let txCreatedVendor = false;

  const mockPrisma = {
    user: {
      update() {
        calledPrismaDirectly = true;
        return { id: 1, name: 'Buyer' };
      },
      create() {
        calledPrismaDirectly = true;
        return { id: 2, name: 'Vendor' };
      },
    },
    $transaction(cb: (tx: any) => any) {
      const mockTx = {
        user: {
          update({ where, data, select }: any) {
            txUpdatedBuyer = true;
            return { id: 1, email: where.email, name: data.name };
          },
          create({ data }: any) {
            txCreatedVendor = true;
            return { id: 2, ...data };
          },
        },
      };
      return cb(mockTx);
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof checkout !== 'undefined') exports.checkout = checkout;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, exports);
  if (typeof mod.checkout !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `checkout(buyerEmail)`.',
    };
  }

  const result = mod.checkout('buyer@prisma.io');

  if (calledPrismaDirectly) {
    return {
      passed: false,
      feedback:
        'Operations inside checkout called `prisma.user` instead of `tx.user`. Both writes must participate in the transaction.',
    };
  }

  if (!txUpdatedBuyer) {
    return {
      passed: false,
      feedback: '`tx.user.update` was not invoked for the buyer.',
    };
  }

  if (!txCreatedVendor) {
    return {
      passed: false,
      feedback: '`tx.user.create` was not invoked for the vendor.',
    };
  }

  if (!result || result.name !== 'Buyer') {
    return {
      passed: false,
      feedback: 'The checkout function must return the updated buyer record.',
    };
  }

  return { passed: true };
}
