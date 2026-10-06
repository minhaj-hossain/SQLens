/**
 * Day 6 Client Singleton Behavioral Grader — Phase 2 (Task 2.2).
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates learner's client singleton module across multiple simulated
 * reloads in development and production environments.
 *
 * Verifications:
 *  1. In development (`NODE_ENV !== 'production'`), importing/evaluating the
 *     module twice produces strictly identical instances (`instance1 === instance2`).
 *  2. `PrismaClient` constructor is called exactly once.
 *  3. In production (`NODE_ENV === 'production'`), `globalThis.prisma` is NOT cached.
 *  4. For the final gateway challenge (`prisma06-hw-1`), inspects constructor
 *     arguments for pool tuning parameters (`connection_limit=5`, `pool_timeout=10`)
 *     and query logging configuration.
 */

import { cleanTypeScriptCode } from './clean-ts';

export interface BehavioralGraderResult {
  passed: boolean;
  feedback?: string;
  details?: Record<string, unknown>;
}

export function gradeDay6Singleton(code: string, taskId: string): BehavioralGraderResult {
  try {
    const prepared = cleanTypeScriptCode(code);

    if (taskId === 'prisma06-hw-1') {
      return gradeGatewayChallenge(prepared);
    }

    if (taskId === 'prisma06-c1-1' || taskId === 'prisma06-c1-t1') {
      return gradeBasicSingleton(prepared);
    }

    if (taskId === 'prisma06-c1-2' || taskId === 'prisma06-c1-t2') {
      return gradeDevGuardedSingleton(prepared);
    }

    // Default to dev-guarded singleton check for any other Day 6 singleton task
    return gradeDevGuardedSingleton(prepared);
  } catch (err: any) {
    return {
      passed: false,
      feedback: `Execution error while testing client singleton: ${err?.message ?? String(err)}`,
    };
  }
}

/** Basic Singleton (prisma06-c1-t1) */
function gradeBasicSingleton(preparedCode: string): BehavioralGraderResult {
  let constructorCallCount = 0;
  class MockPrismaClient {
    id = Math.random();
    constructor() {
      constructorCallCount++;
    }
  }

  const mockGlobalThis: Record<string, unknown> = {};

  function runModule(globalScope: Record<string, unknown>) {
    const exports: Record<string, any> = {};
    const runner = new Function(
      'globalThis',
      'PrismaClient',
      'exports',
      'process',
      `
      try {
        ${preparedCode}
        if (typeof prisma !== 'undefined' && !exports.prisma) exports.prisma = prisma;
      } catch(e) {
        throw e;
      }
      return exports;
    `,
    );
    return runner(globalScope, MockPrismaClient, exports, { env: { NODE_ENV: 'development' } });
  }

  // First import (clean global)
  const mod1 = runModule(mockGlobalThis);
  const client1 = mod1.prisma ?? mockGlobalThis.prisma;

  if (!client1) {
    return {
      passed: false,
      feedback: 'The module must export a `prisma` client instance or define it on `globalThis`.',
    };
  }

  if (constructorCallCount === 0) {
    return {
      passed: false,
      feedback: '`new PrismaClient()` was not called to initialize the client fallback.',
    };
  }

  // Pre-populate global cache if the user pattern expects caller or module to cache it
  if (!mockGlobalThis.prisma && client1) {
    mockGlobalThis.prisma = client1;
  }

  // Second import (simulated hot module reload with existing globalThis)
  const mod2 = runModule(mockGlobalThis);
  const client2 = mod2.prisma ?? mockGlobalThis.prisma;

  if (constructorCallCount > 1) {
    return {
      passed: false,
      feedback:
        'PrismaClient was instantiated multiple times across reloads. Read the cached instance using `globalForPrisma.prisma ?? new PrismaClient()`.',
    };
  }

  if (client1 !== client2) {
    return {
      passed: false,
      feedback:
        'The exported prisma instance did not preserve identity across reloads. Expected `instance1 === instance2`.',
    };
  }

  return { passed: true };
}

/** Dev-guarded Singleton (prisma06-c1-t2) */
function gradeDevGuardedSingleton(preparedCode: string): BehavioralGraderResult {
  let constructorCallCount = 0;
  class MockPrismaClient {
    id = Math.random();
    constructor() {
      constructorCallCount++;
    }
  }

  function runModule(globalScope: Record<string, unknown>, nodeEnv: string) {
    const exports: Record<string, any> = {};
    const runner = new Function(
      'globalThis',
      'PrismaClient',
      'exports',
      'process',
      `
      try {
        ${preparedCode}
        if (typeof prisma !== 'undefined' && !exports.prisma) exports.prisma = prisma;
      } catch(e) {
        throw e;
      }
      return exports;
    `,
    );
    return runner(globalScope, MockPrismaClient, exports, { env: { NODE_ENV: nodeEnv } });
  }

  // Scenario 1: Development reload
  const devGlobalThis: Record<string, unknown> = {};
  const devMod1 = runModule(devGlobalThis, 'development');
  const devClient1 = devMod1.prisma ?? devGlobalThis.prisma;

  if (!devClient1) {
    return {
      passed: false,
      feedback: 'The module must export `prisma`.',
    };
  }

  if (!devGlobalThis.prisma) {
    return {
      passed: false,
      feedback:
        'In development, the client must be stored back onto `globalThis` (`if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;`).',
    };
  }

  const devMod2 = runModule(devGlobalThis, 'development');
  const devClient2 = devMod2.prisma ?? devGlobalThis.prisma;

  if (constructorCallCount > 1) {
    return {
      passed: false,
      feedback:
        'In development, `new PrismaClient()` was called on reload instead of reusing `globalForPrisma.prisma`.',
    };
  }

  if (devClient1 !== devClient2) {
    return {
      passed: false,
      feedback: 'Exported client references differed between development reloads.',
    };
  }

  // Scenario 2: Production mode
  const prodGlobalThis: Record<string, unknown> = {};
  runModule(prodGlobalThis, 'production');

  if (prodGlobalThis.prisma) {
    return {
      passed: false,
      feedback:
        'Security/Architecture hazard: `prisma` was attached to `globalThis` in production. Guard the cache assignment with `if (process.env.NODE_ENV !== "production")`.',
    };
  }

  return { passed: true };
}

/** Gateway Connection Pool Challenge (prisma06-hw-1) */
function gradeGatewayChallenge(preparedCode: string): BehavioralGraderResult {
  let constructorArgs: any = null;
  class MockPrismaClient {
    constructor(options?: any) {
      constructorArgs = options;
    }
  }

  const exports: Record<string, any> = {};
  const runner = new Function(
    'PrismaClient',
    'exports',
    'URL',
    'require',
    `
    ${preparedCode}
    if (typeof createPooledClient !== 'undefined') exports.createPooledClient = createPooledClient;
    return exports;
  `,
  );

  const mod = runner(MockPrismaClient, exports, URL, () => ({ PrismaClient: MockPrismaClient }));
  if (typeof mod.createPooledClient !== 'function') {
    return {
      passed: false,
      feedback: 'The module must export a `createPooledClient(databaseUrl: string)` function.',
    };
  }

  const testDbUrl = 'postgresql://admin:secret@localhost:5432/store?schema=public';
  mod.createPooledClient(testDbUrl);

  if (!constructorArgs) {
    return {
      passed: false,
      feedback: '`createPooledClient` must return a newly configured `new PrismaClient({ ... })`.',
    };
  }

  const datasourcesUrl = constructorArgs?.datasources?.db?.url;
  if (!datasourcesUrl) {
    return {
      passed: false,
      feedback: 'Pass configured URL through `datasources: { db: { url: ... } }` in PrismaClient constructor.',
    };
  }

  try {
    const parsed = new URL(datasourcesUrl);
    if (parsed.searchParams.get('connection_limit') !== '5') {
      return {
        passed: false,
        feedback: `Expected URL search param \`connection_limit=5\`, got \`${parsed.searchParams.get('connection_limit') ?? 'missing'}\`.`,
      };
    }
    if (parsed.searchParams.get('pool_timeout') !== '10') {
      return {
        passed: false,
        feedback: `Expected URL search param \`pool_timeout=10\`, got \`${parsed.searchParams.get('pool_timeout') ?? 'missing'}\`.`,
      };
    }
  } catch {
    return {
      passed: false,
      feedback: 'The datasource URL provided to PrismaClient is not a valid URL string.',
    };
  }

  const log = constructorArgs?.log;
  if (!Array.isArray(log) || !log.includes('query') || !log.includes('error')) {
    return {
      passed: false,
      feedback: "Enable query and error logging with `log: ['query', 'error']` in PrismaClient options.",
    };
  }

  return { passed: true };
}
