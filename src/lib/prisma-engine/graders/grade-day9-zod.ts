/**
 * Day 9 Zod Boundary Validation Behavioral Grader — Phase 2 (Task 2.3).
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates learner's Zod schemas and defensive route handlers against a
 * 4-payload test matrix.
 *
 * Matrix:
 *  1. Valid payload -> success: true / HTTP 201 Created.
 *  2. Malformed email -> success: false / HTTP 400 Bad Request.
 *  3. Missing required field -> success: false / HTTP 400 Bad Request.
 *  4. Mass-assignment / extra keys -> sanitized parsed.data (never leaks to Prisma).
 *
 * Handler Verifications:
 *  - On validation failure, HTTP 400 is returned immediately.
 *  - `prisma` database queries are NEVER dispatched on invalid payloads.
 *  - Only sanitized `parsed.data` attributes reach the database.
 */

import { z } from 'zod';
import type { BehavioralGraderResult } from './grade-day6-singleton';
import { cleanTypeScriptCode } from './clean-ts';

export function gradeDay9Zod(code: string, taskId: string): BehavioralGraderResult {
  try {
    const prepared = cleanTypeScriptCode(code);

    if (taskId === 'prisma09-c2-t1') {
      return gradeSchemaDefinition(prepared);
    }

    if (taskId === 'prisma09-c2-t2') {
      return gradeCreateUserHandler(prepared);
    }

    if (taskId === 'prisma09-c2-t3') {
      return gradeSafeParseFunction(prepared);
    }

    if (taskId === 'prisma09-hw-1') {
      return gradeRegisterWithPostHandler(prepared);
    }

    // Default fallback based on detected declarations
    if (/createUser\b/.test(prepared)) {
      return gradeCreateUserHandler(prepared);
    }
    if (/validateInput\b/.test(prepared)) {
      return gradeSafeParseFunction(prepared);
    }
    return gradeSchemaDefinition(prepared);
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Execution error while testing Zod boundary: ${err?.message ?? String(err)}`,
    };
  }
}

/** Task 1: Schema definition (prisma09-c2-t1) */
function gradeSchemaDefinition(preparedCode: string): BehavioralGraderResult {
  const exports: Record<string, any> = {};
  const runner = new Function(
    'z',
    'exports',
    `
    ${preparedCode}
    if (typeof CreateUserSchema !== 'undefined') exports.CreateUserSchema = CreateUserSchema;
    return exports;
  `,
  );

  const mod = runner(z, exports);
  const schema = mod.CreateUserSchema;

  if (!schema || typeof schema.safeParse !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `CreateUserSchema` defined with `z.object({...})`.',
    };
  }

  // 1. Valid payload
  const valid = schema.safeParse({ name: 'Alex', email: 'alex@prisma.io' });
  if (!valid.success) {
    return {
      passed: false,
      feedback: 'CreateUserSchema rejected a valid payload: `{ name: "Alex", email: "alex@prisma.io" }`.',
    };
  }

  // 2. Malformed email
  const badEmail = schema.safeParse({ name: 'Alex', email: 'not-an-email' });
  if (badEmail.success) {
    return {
      passed: false,
      feedback: 'CreateUserSchema accepted a malformed email ("not-an-email"). Use `z.string().email()`.',
    };
  }

  // 3. Missing name
  const missingName = schema.safeParse({ email: 'alex@prisma.io' });
  if (missingName.success) {
    return {
      passed: false,
      feedback: 'CreateUserSchema accepted a payload missing the required `name` field.',
    };
  }

  // 4. Empty name
  const emptyName = schema.safeParse({ name: '', email: 'alex@prisma.io' });
  if (emptyName.success) {
    return {
      passed: false,
      feedback: 'CreateUserSchema accepted an empty name (""). Use `z.string().min(1)`.',
    };
  }

  return { passed: true };
}

/** Mock Express Response helper */
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
  };
  return { res, state };
}

/** Task 2: Route handler with safeParse (prisma09-c2-t2) */
function gradeCreateUserHandler(preparedCode: string): BehavioralGraderResult {
  let prismaCreateCalled = false;
  let receivedData: any = null;

  const mockPrisma = {
    user: {
      create({ data }: any) {
        prismaCreateCalled = true;
        receivedData = data;
        return { id: 1, ...data };
      },
    },
  };

  const defaultSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  const exports: Record<string, any> = {};
  const runner = new Function(
    'z',
    'prisma',
    'CreateUserSchema',
    'exports',
    `
    ${preparedCode}
    if (typeof createUser !== 'undefined') exports.createUser = createUser;
    return exports;
  `,
  );

  const mod = runner(z, mockPrisma, defaultSchema, exports);
  const createUser = mod.createUser;

  if (typeof createUser !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export an `async function createUser(req, res)` handler.',
    };
  }

  // Test 1: Invalid payload -> Expect HTTP 400 and ZERO prisma calls
  prismaCreateCalled = false;
  const invalidRes = createMockRes();
  const invalidReq = { body: { name: '', email: 'invalid-email' } };

  createUser(invalidReq, invalidRes.res);

  if (invalidRes.state.statusCode !== 400) {
    return {
      passed: false,
      feedback: `Expected HTTP 400 Bad Request on invalid payload, but got HTTP ${invalidRes.state.statusCode}.`,
    };
  }

  if (prismaCreateCalled) {
    return {
      passed: false,
      feedback:
        'Security bug: `prisma.user.create` was invoked with an invalid payload! Check `if (!parsed.success)` and return status 400 before calling Prisma.',
    };
  }

  // Test 2: Valid payload with extra injected property (Mass-Assignment attempt)
  prismaCreateCalled = false;
  receivedData = null;
  const validRes = createMockRes();
  const validReq = {
    body: {
      name: 'Mina',
      email: 'mina@prisma.io',
      role: 'ADMIN',
      injectedField: true,
    },
  };

  createUser(validReq, validRes.res);

  if (validRes.state.statusCode !== 201 && validRes.state.statusCode !== 200) {
    return {
      passed: false,
      feedback: `Expected HTTP 201 Created on valid payload, got HTTP ${validRes.state.statusCode}.`,
    };
  }

  if (!prismaCreateCalled) {
    return {
      passed: false,
      feedback: '`prisma.user.create` was not called for a valid payload.',
    };
  }

  if (receivedData && ('role' in receivedData || 'injectedField' in receivedData)) {
    return {
      passed: false,
      feedback:
        'Mass-assignment vulnerability: raw `req.body` was passed to Prisma instead of sanitized `parsed.data`.',
    };
  }

  return { passed: true };
}

/** Task 3: validateInput helper (prisma09-c2-t3) */
function gradeSafeParseFunction(preparedCode: string): BehavioralGraderResult {
  const UserCreateInput = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  const exports: Record<string, any> = {};
  const runner = new Function(
    'z',
    'UserCreateInput',
    'exports',
    `
    ${preparedCode}
    if (typeof validateInput !== 'undefined') exports.validateInput = validateInput;
    return exports;
  `,
  );

  const mod = runner(z, UserCreateInput, exports);
  const validateInput = mod.validateInput;

  if (typeof validateInput !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `validateInput(data)`.',
    };
  }

  // Valid
  const resValid = validateInput({ name: 'Alex', email: 'alex@prisma.io' });
  if (!resValid || resValid.ok !== true || !resValid.data) {
    return {
      passed: false,
      feedback: '`validateInput` did not return `{ ok: true, data }` for valid input.',
    };
  }

  // Invalid (must not throw, returns { ok: false, errors })
  let resInvalid: any;
  try {
    resInvalid = validateInput({ name: '', email: 'not-email' });
  } catch (err: any) {
    return {
      passed: false,
      feedback: `\`validateInput\` threw an unhandled exception instead of returning a safe result: ${err?.message ?? String(err)}. Use \`safeParse\` instead of \`.parse()\`.`,
    };
  }

  if (!resInvalid || resInvalid.ok !== false || !resInvalid.errors) {
    return {
      passed: false,
      feedback: '`validateInput` must return `{ ok: false, errors: result.error.flatten() }` on invalid input.',
    };
  }

  return { passed: true };
}

/** Challenge: registerWithPost (prisma09-hw-1) */
function gradeRegisterWithPostHandler(preparedCode: string): BehavioralGraderResult {
  let prismaCreateArgs: any = null;

  const mockPrisma = {
    user: {
      create(args: any) {
        prismaCreateArgs = args;
        return { id: 10, email: args?.data?.email };
      },
    },
  };

  const RegisterPayloadSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    title: z.string().min(1),
  });

  const exports: Record<string, any> = {};
  const runner = new Function(
    'z',
    'prisma',
    'RegisterPayloadSchema',
    'exports',
    `
    ${preparedCode}
    if (typeof registerWithPost !== 'undefined') exports.registerWithPost = registerWithPost;
    return exports;
  `,
  );

  const mod = runner(z, mockPrisma, RegisterPayloadSchema, exports);
  const registerWithPost = mod.registerWithPost;

  if (typeof registerWithPost !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export `registerWithPost(req, res)`.',
    };
  }

  // 1. Invalid payload -> 400 and no prisma write
  const invalidRes = createMockRes();
  registerWithPost({ body: { name: 'Mina' } }, invalidRes.res);

  if (invalidRes.state.statusCode !== 400) {
    return {
      passed: false,
      feedback: 'Expected HTTP 400 on invalid registration payload.',
    };
  }

  if (prismaCreateArgs !== null) {
    return {
      passed: false,
      feedback: '`prisma.user.create` was invoked when validation failed.',
    };
  }

  // 2. Valid payload -> 201 with nested posts relation
  const validRes = createMockRes();
  registerWithPost(
    { body: { name: 'Mina', email: 'mina@prisma.io', title: 'First Post' } },
    validRes.res,
  );

  if (validRes.state.statusCode !== 201) {
    return {
      passed: false,
      feedback: `Expected HTTP 201 Created, got HTTP ${validRes.state.statusCode}.`,
    };
  }

  const postsCreate = prismaCreateArgs?.data?.posts?.create;
  if (!postsCreate || postsCreate.title !== 'First Post') {
    return {
      passed: false,
      feedback:
        'Child post relation was not created. Expected `posts: { create: { title: parsed.data.title } }`.',
    };
  }

  const select = prismaCreateArgs?.select;
  if (!select || !select.id || !select.email) {
    return {
      passed: false,
      feedback: 'Expected `select: { id: true, email: true }` projection.',
    };
  }

  return { passed: true };
}
