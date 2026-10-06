/**
 * Day 13 Error Handling Behavioral Grader — Phase 2 (Task 2.5).
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates learner's Prisma error handlers using real prototype-inheriting
 * error instances.
 *
 * Verifications:
 *  1. Prototype inheritance: `err instanceof Prisma.PrismaClientKnownRequestError`
 *     and `err instanceof Prisma.PrismaClientValidationError` resolve to true.
 *  2. 4-scenario status mapping matrix:
 *     - P2002 (Unique collision) -> HTTP 409 Conflict
 *     - P2025 (Not found) -> HTTP 404 Not Found
 *     - P2003 (Foreign key) -> HTTP 409 Conflict
 *     - ValidationError -> HTTP 400 Bad Request
 *     - Unknown / native Error -> HTTP 500 or next(err)
 *  3. Unsafe Property Access Guard: feeding a standard `new Error()` does not
 *     crash with "Cannot read properties of undefined (reading 'code')".
 *  4. Security Check: response body does NOT leak internal schema identifiers
 *     from `error.meta` (e.g. `meta.target` or `meta.field_name`).
 */

import type { BehavioralGraderResult } from './grade-day6-singleton';
import { cleanTypeScriptCode } from './clean-ts';

export class PrismaClientKnownRequestError extends Error {
  code: string;
  clientVersion: string;
  meta?: Record<string, unknown>;

  constructor(
    message: string,
    {
      code,
      clientVersion = '5.22.0',
      meta,
    }: { code: string; clientVersion?: string; meta?: Record<string, unknown> },
  ) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.clientVersion = clientVersion;
    this.meta = meta;
    Object.setPrototypeOf(this, PrismaClientKnownRequestError.prototype);
  }
}

export class PrismaClientValidationError extends Error {
  clientVersion: string;

  constructor(message: string, { clientVersion = '5.22.0' }: { clientVersion?: string } = {}) {
    super(message);
    this.name = 'PrismaClientValidationError';
    this.clientVersion = clientVersion;
    Object.setPrototypeOf(this, PrismaClientValidationError.prototype);
  }
}

function createMockRes() {
  const state = {
    statusCode: 200,
    body: null as any,
  };
  const res = {
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(data: any) {
      state.body = data;
      return res;
    },
    send(data?: any) {
      state.body = data;
      return res;
    },
  };
  return { res, state };
}

export function gradeDay13Errors(code: string, taskId: string): BehavioralGraderResult {
  try {
    const prepared = cleanTypeScriptCode(code);

    if (taskId === 'prisma13-c1-t1') {
      return gradeCreateConflictCatch(prepared);
    }
    if (taskId === 'prisma13-c1-t2') {
      return gradeRenameHandler(prepared);
    }
    if (taskId === 'prisma13-c1-t3') {
      return gradeValidationErrorCatch(prepared);
    }
    if (taskId === 'prisma13-c2-t1') {
      return gradeRemoveUserHandler(prepared);
    }
    if (taskId === 'prisma13-c2-t2') {
      return gradePublishFkHandler(prepared);
    }
    if (taskId === 'prisma13-hw-1') {
      return gradeExpressErrorHandler(prepared);
    }
    if (taskId === 'prisma13-hw-2') {
      return gradeSafeErrorMiddleware(prepared);
    }

    // Default heuristics
    if (/errorHandler\b/.test(prepared)) return gradeExpressErrorHandler(prepared);
    if (/safeErrorHandler\b/.test(prepared)) return gradeSafeErrorMiddleware(prepared);
    if (/rename\b/.test(prepared)) return gradeRenameHandler(prepared);
    if (/removeUser\b/.test(prepared)) return gradeRemoveUserHandler(prepared);
    if (/publish\b/.test(prepared)) return gradePublishFkHandler(prepared);

    return gradeExpressErrorHandler(prepared);
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Execution error while testing error handler: ${err?.message ?? String(err)}`,
    };
  }
}

/** Task 1.1: Catch P2002 and throw ConflictError */
function gradeCreateConflictCatch(preparedCode: string): BehavioralGraderResult {
  class ConflictError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'ConflictError';
    }
  }

  const Prisma = {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
  };

  // Scenario 1: Prisma throws P2002 -> catch block throws ConflictError
  let thrownError: any = null;
  const mockPrismaP2002 = {
    user: {
      create() {
        throw new PrismaClientKnownRequestError('Unique constraint failed on the fields: (`email`)', {
          code: 'P2002',
          meta: { target: ['email'] },
        });
      },
    },
  };

  const runner = new Function(
    'prisma',
    'Prisma',
    'ConflictError',
    'name',
    'email',
    `
    return (() => {
      try {
        ${preparedCode}
      } catch (err) {
        return err;
      }
    })();
  `,
  );

  thrownError = runner(mockPrismaP2002, Prisma, ConflictError, 'Alex', 'alex@prisma.io');

  if (!thrownError || thrownError.name !== 'ConflictError') {
    return {
      passed: false,
      feedback:
        'When Prisma throws P2002, the handler must catch it and throw `new ConflictError(\'Email already registered\')`.',
    };
  }

  // Scenario 2: Prisma throws generic error -> rethrown verbatim
  const genericErr = new Error('Database disconnected');
  const mockPrismaGeneric = {
    user: {
      create() {
        throw genericErr;
      },
    },
  };

  const rethrown = runner(mockPrismaGeneric, Prisma, ConflictError, 'Alex', 'alex@prisma.io');
  if (rethrown !== genericErr) {
    return {
      passed: false,
      feedback: 'Unrecognized errors must be rethrown rather than swallowed or converted to ConflictError.',
    };
  }

  return { passed: true };
}

/** Task 1.2: Rename handler mapping P2025 -> 404 */
function gradeRenameHandler(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  let simulateError: Error | null = null;

  const mockPrisma = {
    user: {
      update() {
        if (simulateError) throw simulateError;
        return { id: 1, name: 'Renamed' };
      },
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof rename !== 'undefined') exports.rename = rename;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, Prisma, exports);
  if (typeof mod.rename !== 'function') {
    return { passed: false, feedback: 'The module must export `rename(req, res)`.' };
  }

  // 1. P2025 -> 404
  simulateError = new PrismaClientKnownRequestError('An operation failed because it depends on one or more records that were required but not found.', {
    code: 'P2025',
  });
  const res404 = createMockRes();
  mod.rename({ params: { id: '99' }, body: { name: 'New' } }, res404.res);

  if (res404.state.statusCode !== 404) {
    return {
      passed: false,
      feedback: `When P2025 occurs on update, expected HTTP 404 Not Found, got HTTP ${res404.state.statusCode}.`,
    };
  }

  // 2. Generic Error -> 500
  simulateError = new Error('Socket timeout');
  const res500 = createMockRes();
  mod.rename({ params: { id: '1' }, body: { name: 'New' } }, res500.res);

  if (res500.state.statusCode !== 500) {
    return {
      passed: false,
      feedback: `When an unexpected error occurs, expected HTTP 500, got HTTP ${res500.state.statusCode}.`,
    };
  }

  return { passed: true };
}

/** Task 1.3: PrismaClientValidationError -> 400 */
function gradeValidationErrorCatch(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  let simulateError: Error | null = null;

  const mockPrisma = {
    user: {
      create() {
        if (simulateError) throw simulateError;
        return { id: 1, name: 'Created' };
      },
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof handlePayload !== 'undefined') exports.handlePayload = handlePayload;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, Prisma, exports);
  if (typeof mod.handlePayload !== 'function') {
    return { passed: false, feedback: 'The module must export `handlePayload(req, res)`.' };
  }

  // ValidationError -> 400
  simulateError = new PrismaClientValidationError('Argument `email` is missing.');
  const res400 = createMockRes();
  mod.handlePayload({ body: {} }, res400.res);

  if (res400.state.statusCode !== 400) {
    return {
      passed: false,
      feedback: `When PrismaClientValidationError is thrown, expected HTTP 400 Bad Request, got HTTP ${res400.state.statusCode}.`,
    };
  }

  return { passed: true };
}

/** Task 2.1: removeUser mapping P2025 -> 404 */
function gradeRemoveUserHandler(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  let simulateError: Error | null = null;

  const mockPrisma = {
    user: {
      delete() {
        if (simulateError) throw simulateError;
        return { id: 1 };
      },
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof removeUser !== 'undefined') exports.removeUser = removeUser;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, Prisma, exports);
  if (typeof mod.removeUser !== 'function') {
    return { passed: false, feedback: 'The module must export `removeUser(id, res)`.' };
  }

  // P2025 on delete -> 404
  simulateError = new PrismaClientKnownRequestError('Record to delete does not exist.', { code: 'P2025' });
  const res404 = createMockRes();
  mod.removeUser(99, res404.res);

  if (res404.state.statusCode !== 404) {
    return {
      passed: false,
      feedback: `Deleting a non-existent record (P2025) must return HTTP 404, got HTTP ${res404.state.statusCode}.`,
    };
  }

  return { passed: true };
}

/** Task 2.2: publish mapping P2003 -> 409 */
function gradePublishFkHandler(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  let simulateError: Error | null = null;

  const mockPrisma = {
    post: {
      create() {
        if (simulateError) throw simulateError;
        return { id: 1, title: 'Post' };
      },
    },
  };

  const exports: Record<string, any> = {};
  const runner = new Function(
    'prisma',
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof publish !== 'undefined') exports.publish = publish;
    return exports;
  `,
  );

  const mod = runner(mockPrisma, Prisma, exports);
  if (typeof mod.publish !== 'function') {
    return { passed: false, feedback: 'The module must export `publish(title, authorId, res)`.' };
  }

  // P2003 on create -> 409
  simulateError = new PrismaClientKnownRequestError('Foreign key constraint failed on the field: (`authorId`)', {
    code: 'P2003',
    meta: { field_name: 'authorId' },
  });
  const res409 = createMockRes();
  mod.publish('Post Title', 9999, res409.res);

  if (res409.state.statusCode !== 409) {
    return {
      passed: false,
      feedback: `Foreign key violation (P2003) must return HTTP 409 Conflict, got HTTP ${res409.state.statusCode}.`,
    };
  }

  return { passed: true };
}

/** Challenge 1: Express error middleware (prisma13-hw-1) */
function gradeExpressErrorHandler(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  const exports: Record<string, any> = {};
  const runner = new Function(
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof errorHandler !== 'undefined') exports.errorHandler = errorHandler;
    return exports;
  `,
  );

  const mod = runner(Prisma, exports);
  if (typeof mod.errorHandler !== 'function') {
    return { passed: false, feedback: 'The module must export `errorHandler(err, req, res, next)`.' };
  }

  // 1. P2002 -> 409 Conflict
  const p2002 = new PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    meta: { target: ['email_unique_idx'] },
  });
  const res2002 = createMockRes();
  let nextCalledWith: any = null;
  mod.errorHandler(p2002, {}, res2002.res, (e: any) => {
    nextCalledWith = e;
  });

  if (res2002.state.statusCode !== 409) {
    return {
      passed: false,
      feedback: `P2002 must return status 409 Conflict, got HTTP ${res2002.state.statusCode}.`,
    };
  }

  // Security check: verify no internal column names leaked
  const bodyStr = JSON.stringify(res2002.state.body ?? '');
  if (bodyStr.includes('email_unique_idx') || bodyStr.includes('target')) {
    return {
      passed: false,
      feedback:
        'Security Hazard: Error response leaked internal database metadata (`error.meta.target`). Return a clean user-facing error message.',
    };
  }

  // 2. P2025 -> 404 Not Found
  const p2025 = new PrismaClientKnownRequestError('Record not found', { code: 'P2025' });
  const res2025 = createMockRes();
  mod.errorHandler(p2025, {}, res2025.res, () => {});

  if (res2025.state.statusCode !== 404) {
    return {
      passed: false,
      feedback: `P2025 must return status 404 Not Found, got HTTP ${res2025.state.statusCode}.`,
    };
  }

  // 3. P2003 -> 409 Conflict
  const p2003 = new PrismaClientKnownRequestError('FK failed', { code: 'P2003', meta: { field_name: 'authorId' } });
  const res2003 = createMockRes();
  mod.errorHandler(p2003, {}, res2003.res, () => {});

  if (res2003.state.statusCode !== 409) {
    return {
      passed: false,
      feedback: `P2003 must return status 409 Conflict, got HTTP ${res2003.state.statusCode}.`,
    };
  }

  // 4. Unknown error -> forwarded to next(err)
  const unknownErr = new Error('Disk failure');
  nextCalledWith = null;
  const resUnknown = createMockRes();
  mod.errorHandler(unknownErr, {}, resUnknown.res, (e: any) => {
    nextCalledWith = e;
  });

  if (nextCalledWith !== unknownErr) {
    return {
      passed: false,
      feedback: 'Unrecognized errors must be forwarded to Express error handling via `next(err)`.',
    };
  }

  return { passed: true };
}

/** Challenge 2: Safe discrimination guard (prisma13-hw-2) */
function gradeSafeErrorMiddleware(preparedCode: string): BehavioralGraderResult {
  const Prisma = { PrismaClientKnownRequestError, PrismaClientValidationError };
  const exports: Record<string, any> = {};
  const runner = new Function(
    'Prisma',
    'exports',
    `
    ${preparedCode}
    if (typeof safeErrorHandler !== 'undefined') exports.safeErrorHandler = safeErrorHandler;
    return exports;
  `,
  );

  const mod = runner(Prisma, exports);
  if (typeof mod.safeErrorHandler !== 'function') {
    return { passed: false, feedback: 'The module must export `safeErrorHandler(err, req, res, next)`.' };
  }

  // Test 1: Native error without .code property (MUST NOT CRASH)
  const nativeErr = new Error('Native generic crash');
  let nextCalledWith: any = null;
  const resNative = createMockRes();

  try {
    mod.safeErrorHandler(nativeErr, {}, resNative.res, (e: any) => {
      nextCalledWith = e;
    });
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Your error handler crashed when given a native Error: ${err?.message ?? String(err)}. Add an \`instanceof Prisma.PrismaClientKnownRequestError\` guard before checking \`err.code\`.`,
    };
  }

  if (nextCalledWith !== nativeErr) {
    return {
      passed: false,
      feedback: 'Native errors must be forwarded to `next(err)`.',
    };
  }

  // Test 2: PrismaClientValidationError -> 400
  const validationErr = new PrismaClientValidationError('Invalid field input');
  const resValidation = createMockRes();
  mod.safeErrorHandler(validationErr, {}, resValidation.res, () => {});

  if (resValidation.state.statusCode !== 400) {
    return {
      passed: false,
      feedback: `PrismaClientValidationError must return HTTP 400 Bad Request, got HTTP ${resValidation.state.statusCode}.`,
    };
  }

  // Test 3: P2003 -> 409
  const p2003 = new PrismaClientKnownRequestError('FK constraint', { code: 'P2003' });
  const resP2003 = createMockRes();
  mod.safeErrorHandler(p2003, {}, resP2003.res, () => {});

  if (resP2003.state.statusCode !== 409) {
    return {
      passed: false,
      feedback: `P2003 must return HTTP 409, got HTTP ${resP2003.state.statusCode}.`,
    };
  }

  return { passed: true };
}
