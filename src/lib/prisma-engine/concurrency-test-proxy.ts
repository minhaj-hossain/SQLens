/**
 * Concurrency Test Proxy — Phase 2 (Task 2.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Intercepts Prisma client query methods, injecting a deterministic delay
 * (default 50ms) into READ operations (`findUnique`, `findFirst`, `findMany`,
 * `count`, `groupBy`).
 *
 * Pedagogical Purpose:
 * When testing concurrent scenarios (e.g., wallet transfers, stock decrements),
 * naive check-then-act code (read balance -> check -> write new balance)
 * is vulnerable to race conditions when two async requests interleave.
 *
 * By delaying the READ phase of the query, concurrent requests are guaranteed
 * to interleave their reads before writes execute:
 *   Request 1: reads stock = 1 (delayed 50ms)
 *   Request 2: reads stock = 1 (delayed 50ms)
 *   Request 1: writes stock = 0
 *   Request 2: writes stock = 0 (lost update / oversell!)
 *
 * In contrast, single conditional atomic operations:
 *   updateMany({ where: { stock: { gte: 1 } }, data: { stock: { decrement: 1 } } })
 * bypass the read phase or execute atomically in the database engine,
 * passing cleanly without requiring special learner test hooks.
 */

export interface ConcurrencyOperationRecord {
  id: number;
  timestamp: number;
  model: string;
  method: string;
  phase: 'start' | 'complete';
  args?: unknown;
}

export interface ConcurrencyProxyOptions {
  /** Milliseconds to delay read operations. Default: 50ms. */
  readDelayMs?: number;
  /** Custom delay for specific methods if needed. */
  methodDelays?: Record<string, number>;
  /** Specific models to target (default: all models). */
  targetModels?: string[];
  /** Callback fired whenever an operation is recorded. */
  onOperation?: (record: ConcurrencyOperationRecord) => void;
}

const READ_METHODS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
]);

/**
 * Wraps a Prisma client (or mock client) in a Proxy that delays read operations.
 */
export function createConcurrencyTestProxy<T extends object>(
  client: T,
  options: ConcurrencyProxyOptions = {},
): { proxy: T; getOperationLog: () => ConcurrencyOperationRecord[]; clearLog: () => void } {
  const readDelay = options.readDelayMs ?? 50;
  const targetModels = options.targetModels ? new Set(options.targetModels.map((m) => m.toLowerCase())) : null;
  const operationLog: ConcurrencyOperationRecord[] = [];
  let opSeq = 0;

  function record(model: string, method: string, phase: 'start' | 'complete', args?: unknown) {
    const entry: ConcurrencyOperationRecord = {
      id: ++opSeq,
      timestamp: Date.now(),
      model,
      method,
      phase,
      args,
    };
    operationLog.push(entry);
    options.onOperation?.(entry);
  }

  // Model-level proxy handler
  function createModelProxy(modelName: string, modelTarget: any) {
    return new Proxy(modelTarget, {
      get(target, methodProp, receiver) {
        const method = String(methodProp);
        const originalMethod = Reflect.get(target, methodProp, receiver);

        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        const isRead = READ_METHODS.has(method);
        const delay = options.methodDelays?.[method] ?? (isRead ? readDelay : 0);

        return async function (...args: any[]) {
          record(modelName, method, 'start', args);

          try {
            const result = await originalMethod.apply(target, args);

            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            record(modelName, method, 'complete', { result });
            return result;
          } catch (error) {
            record(modelName, method, 'complete', { error });
            throw error;
          }
        };
      },
    });
  }

  // Client-level proxy handler
  const proxy = new Proxy(client, {
    get(target, prop, receiver) {
      const propStr = String(prop);
      const originalValue = Reflect.get(target, prop, receiver);

      // Model delegates are objects (e.g. prisma.user, prisma.product, prisma.wallet)
      if (
        originalValue &&
        typeof originalValue === 'object' &&
        !propStr.startsWith('$') &&
        (!targetModels || targetModels.has(propStr.toLowerCase()))
      ) {
        return createModelProxy(propStr, originalValue);
      }

      // Handle interactive $transaction proxying
      if (propStr === '$transaction' && typeof originalValue === 'function') {
        return async function (arg: any, ...rest: any[]) {
          if (typeof arg === 'function') {
            // Interactive transaction callback: tx => ...
            return originalValue.call(
              target,
              async (tx: any) => {
                const txWrapped = createConcurrencyTestProxy(tx, options).proxy;
                return await arg(txWrapped);
              },
              ...rest,
            );
          }
          return originalValue.apply(target, [arg, ...rest]);
        };
      }

      return originalValue;
    },
  });

  return {
    proxy: proxy as T,
    getOperationLog: () => [...operationLog],
    clearLog: () => {
      operationLog.length = 0;
    },
  };
}

/**
 * Concurrency Test Runner:
 * Runs two actions concurrently through the interleaving proxy and evaluates
 * whether an invariant is preserved.
 */
export async function runConcurrentSimulation<TClient extends object, TResult>(
  client: TClient,
  actionA: (client: TClient) => Promise<TResult>,
  actionB: (client: TClient) => Promise<TResult>,
  options: ConcurrencyProxyOptions = {},
): Promise<{
  results: [PromiseSettledResult<TResult>, PromiseSettledResult<TResult>];
  operationLog: ConcurrencyOperationRecord[];
  interleaved: boolean;
}> {
  const { proxy, getOperationLog } = createConcurrencyTestProxy(client, options);

  const [resA, resB] = await Promise.allSettled([
    actionA(proxy),
    actionB(proxy),
  ]);

  const log = getOperationLog();
  // Check if operations from different actions interleaved (i.e., multiple 'start's before a 'complete')
  let activeOps = 0;
  let interleaved = false;
  for (const entry of log) {
    if (entry.phase === 'start') {
      activeOps++;
      if (activeOps > 1) interleaved = true;
    } else if (entry.phase === 'complete') {
      activeOps = Math.max(0, activeOps - 1);
    }
  }

  return {
    results: [resA, resB],
    operationLog: log,
    interleaved,
  };
}
