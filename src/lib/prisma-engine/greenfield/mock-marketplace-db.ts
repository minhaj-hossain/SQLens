/**
 * In-Memory Mock Marketplace Database & Prisma Simulator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates a PostgreSQL database running Prisma Client for the 5 marketplace models.
 * Supports:
 *  - Primary keys & unique constraint enforcement (throwing P2002).
 *  - Atomic transactions with automatic rollback on error.
 *  - Atomic numeric operations ({ decrement: N }, { increment: N }).
 *  - Synthetic read delays (50ms) for race-condition testing.
 */

import { PrismaClientKnownRequestError } from '../graders';
import type {
  MockMarketplaceDatabase,
  MockUser,
  MockWallet,
  MockProduct,
  MockOrder,
  MockOrderItem,
} from '../../../types/greenfield-exam';

export class MarketplaceDatabaseSimulator {
  public data: MockMarketplaceDatabase;
  private nextId = {
    user: 1,
    wallet: 1,
    product: 1,
    order: 1,
    orderItem: 1,
  };

  constructor(initialData?: Partial<MockMarketplaceDatabase>) {
    this.data = {
      users: initialData?.users ? JSON.parse(JSON.stringify(initialData.users)) : [],
      wallets: initialData?.wallets ? JSON.parse(JSON.stringify(initialData.wallets)) : [],
      products: initialData?.products ? JSON.parse(JSON.stringify(initialData.products)) : [],
      orders: initialData?.orders ? JSON.parse(JSON.stringify(initialData.orders)) : [],
      orderItems: initialData?.orderItems ? JSON.parse(JSON.stringify(initialData.orderItems)) : [],
    };
    this.syncNextIds();
  }

  private syncNextIds() {
    this.nextId.user = Math.max(0, ...this.data.users.map((u) => u.id)) + 1;
    this.nextId.wallet = Math.max(0, ...this.data.wallets.map((w) => w.id)) + 1;
    this.nextId.product = Math.max(0, ...this.data.products.map((p) => p.id)) + 1;
    this.nextId.order = Math.max(0, ...this.data.orders.map((o) => o.id)) + 1;
    this.nextId.orderItem = Math.max(0, ...this.data.orderItems.map((oi) => oi.id)) + 1;
  }

  public cloneSnapshot(): MockMarketplaceDatabase {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreSnapshot(snapshot: MockMarketplaceDatabase) {
    this.data = JSON.parse(JSON.stringify(snapshot));
    this.syncNextIds();
  }

  public createPrismaClient(options: { readDelayMs?: number } = {}) {
    const db = this;
    const readDelay = options.readDelayMs ?? 0;

    const delayIfNeeded = async () => {
      if (readDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, readDelay));
      }
    };

    const client: any = {
      user: {
        async findUnique({ where }: any) {
          await delayIfNeeded();
          return (
            db.data.users.find(
              (u) =>
                (where.id !== undefined && u.id === where.id) ||
                (where.email !== undefined && u.email === where.email),
            ) ?? null
          );
        },
        async findFirst({ where }: any) {
          await delayIfNeeded();
          if (!where) return db.data.users[0] ?? null;
          return (
            db.data.users.find(
              (u) =>
                (where.id !== undefined && u.id === where.id) ||
                (where.email !== undefined && u.email === where.email),
            ) ?? null
          );
        },
        async create({ data }: any) {
          if (db.data.users.some((u) => u.email === data.email)) {
            throw new PrismaClientKnownRequestError(
              'Unique constraint failed on the fields: (`email`)',
              { code: 'P2002', clientVersion: '5.22.0' },
            );
          }
          const user: MockUser = {
            id: data.id ?? db.nextId.user++,
            email: data.email,
            name: data.name ?? 'User',
          };
          db.data.users.push(user);
          return { ...user };
        },
        async upsert({ where, create, update }: any) {
          const existing = db.data.users.find(
            (u) =>
              (where.id !== undefined && u.id === where.id) ||
              (where.email !== undefined && u.email === where.email),
          );
          if (existing) {
            Object.assign(existing, update);
            return { ...existing };
          }
          return client.user.create({ data: create });
        },
      },

      wallet: {
        async findUnique({ where }: any) {
          await delayIfNeeded();
          return (
            db.data.wallets.find(
              (w) =>
                (where.id !== undefined && w.id === where.id) ||
                (where.userId !== undefined && w.userId === where.userId),
            ) ?? null
          );
        },
        async findFirst({ where }: any) {
          await delayIfNeeded();
          if (!where) return db.data.wallets[0] ?? null;
          return (
            db.data.wallets.find(
              (w) =>
                (where.id !== undefined && w.id === where.id) ||
                (where.userId !== undefined && w.userId === where.userId),
            ) ?? null
          );
        },
        async create({ data }: any) {
          if (db.data.wallets.some((w) => w.userId === data.userId)) {
            throw new PrismaClientKnownRequestError(
              'Unique constraint failed on the fields: (`userId`)',
              { code: 'P2002', clientVersion: '5.22.0' },
            );
          }
          const wallet: MockWallet = {
            id: data.id ?? db.nextId.wallet++,
            userId: data.userId,
            balanceCents: data.balanceCents ?? 0,
          };
          db.data.wallets.push(wallet);
          return { ...wallet };
        },
        async update({ where, data }: any) {
          const wallet = db.data.wallets.find(
            (w) =>
              (where.id !== undefined && w.id === where.id) ||
              (where.userId !== undefined && w.userId === where.userId),
          );
          if (!wallet) {
            throw new PrismaClientKnownRequestError('Record to update not found', {
              code: 'P2025',
              clientVersion: '5.22.0',
            });
          }
          if (data.balanceCents !== undefined) {
            if (typeof data.balanceCents === 'object') {
              if ('decrement' in data.balanceCents) {
                wallet.balanceCents -= data.balanceCents.decrement;
              } else if ('increment' in data.balanceCents) {
                wallet.balanceCents += data.balanceCents.increment;
              }
            } else {
              wallet.balanceCents = data.balanceCents;
            }
          }
          return { ...wallet };
        },
        async upsert({ where, create, update }: any) {
          const existing = db.data.wallets.find(
            (w) =>
              (where.id !== undefined && w.id === where.id) ||
              (where.userId !== undefined && w.userId === where.userId),
          );
          if (existing) {
            return client.wallet.update({ where, data: update });
          }
          return client.wallet.create({ data: create });
        },
      },

      product: {
        async findUnique({ where }: any) {
          await delayIfNeeded();
          return db.data.products.find((p) => p.id === where.id) ?? null;
        },
        async findFirst({ where }: any) {
          await delayIfNeeded();
          if (!where) return db.data.products[0] ?? null;
          return db.data.products.find((p) => p.id === where.id) ?? null;
        },
        async findMany({ where }: any = {}) {
          await delayIfNeeded();
          if (!where) return [...db.data.products];
          return db.data.products.filter((p) => {
            if (where.id !== undefined && p.id !== where.id) return false;
            return true;
          });
        },
        async create({ data }: any) {
          const product: MockProduct = {
            id: data.id ?? db.nextId.product++,
            title: data.title,
            priceCents: data.priceCents,
            stock: data.stock,
          };
          db.data.products.push(product);
          return { ...product };
        },
        async update({ where, data }: any) {
          const product = db.data.products.find((p) => {
            if (where.id !== undefined && p.id !== where.id) return false;
            if (where.stock !== undefined && typeof where.stock === 'object') {
              if (where.stock.gte !== undefined && p.stock < where.stock.gte) return false;
            }
            return true;
          });

          if (!product) {
            throw new PrismaClientKnownRequestError('Record to update not found', {
              code: 'P2025',
              clientVersion: '5.22.0',
            });
          }

          if (data.stock !== undefined) {
            if (typeof data.stock === 'object') {
              if ('decrement' in data.stock) {
                product.stock -= data.stock.decrement;
              } else if ('increment' in data.stock) {
                product.stock += data.stock.increment;
              }
            } else {
              product.stock = data.stock;
            }
          }
          return { ...product };
        },
        async upsert({ where, create, update }: any) {
          const existing = db.data.products.find((p) => p.id === where.id);
          if (existing) {
            return client.product.update({ where, data: update });
          }
          return client.product.create({ data: create });
        },
      },

      order: {
        async findUnique({ where }: any) {
          await delayIfNeeded();
          return (
            db.data.orders.find(
              (o) =>
                (where.id !== undefined && o.id === where.id) ||
                (where.idempotencyKey !== undefined && o.idempotencyKey === where.idempotencyKey),
            ) ?? null
          );
        },
        async findFirst({ where }: any) {
          await delayIfNeeded();
          if (!where) return db.data.orders[0] ?? null;
          return (
            db.data.orders.find(
              (o) =>
                (where.id !== undefined && o.id === where.id) ||
                (where.idempotencyKey !== undefined && o.idempotencyKey === where.idempotencyKey),
            ) ?? null
          );
        },
        async findMany({ where }: any = {}) {
          await delayIfNeeded();
          if (!where) return [...db.data.orders];
          return db.data.orders.filter((o) => {
            if (where.buyerId !== undefined && o.buyerId !== where.buyerId) return false;
            return true;
          });
        },
        async create({ data }: any) {
          if (db.data.orders.some((o) => o.idempotencyKey === data.idempotencyKey)) {
            throw new PrismaClientKnownRequestError(
              'Unique constraint failed on the fields: (`idempotencyKey`)',
              { code: 'P2002', clientVersion: '5.22.0' },
            );
          }

          const orderId = data.id ?? db.nextId.order++;
          const order: MockOrder = {
            id: orderId,
            buyerId: data.buyerId,
            totalCents: data.totalCents,
            idempotencyKey: data.idempotencyKey,
            createdAt: data.createdAt ?? new Date(),
          };
          db.data.orders.push(order);

          // Handle nested order items if present
          if (data.items?.create) {
            const items = Array.isArray(data.items.create) ? data.items.create : [data.items.create];
            for (const item of items) {
              await client.orderItem.create({
                data: {
                  ...item,
                  orderId,
                },
              });
            }
          }

          return { ...order };
        },
      },

      orderItem: {
        async create({ data }: any) {
          const item: MockOrderItem = {
            id: data.id ?? db.nextId.orderItem++,
            orderId: data.orderId,
            productId: data.productId,
            quantity: data.quantity,
            unitPriceCents: data.unitPriceCents,
          };
          db.data.orderItems.push(item);
          return { ...item };
        },
        async createMany({ data }: any) {
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            await client.orderItem.create({ data: item });
          }
          return { count: items.length };
        },
      },

      async $transaction(arg: any) {
        if (Array.isArray(arg)) {
          const results = [];
          for (const op of arg) {
            results.push(await op);
          }
          return results;
        }

        if (typeof arg === 'function') {
          const undoStack: (() => void)[] = [];
          const txClient = db.wrapTxClient(client, undoStack);
          try {
            const result = await arg(txClient);
            return result;
          } catch (err) {
            // Revert only mutations performed by this transaction in reverse order
            while (undoStack.length > 0) {
              const undo = undoStack.pop()!;
              undo();
            }
            throw err;
          }
        }

        throw new Error('Unsupported $transaction argument');
      },
    };

    return client;
  }

  private wrapTxClient(baseClient: any, undoStack: (() => void)[]): any {
    const db = this;
    return {
      ...baseClient,
      user: {
        ...baseClient.user,
        async create(args: any) {
          const res = await baseClient.user.create(args);
          undoStack.push(() => {
            const idx = db.data.users.findIndex((u) => u.id === res.id);
            if (idx !== -1) db.data.users.splice(idx, 1);
          });
          return res;
        },
      },
      wallet: {
        ...baseClient.wallet,
        async update(args: any) {
          const target = db.data.wallets.find(
            (w) =>
              (args.where.id !== undefined && w.id === args.where.id) ||
              (args.where.userId !== undefined && w.userId === args.where.userId),
          );
          const prevBalance = target?.balanceCents;
          const res = await baseClient.wallet.update(args);
          undoStack.push(() => {
            if (target && prevBalance !== undefined) {
              target.balanceCents = prevBalance;
            }
          });
          return res;
        },
      },
      product: {
        ...baseClient.product,
        async update(args: any) {
          const target = db.data.products.find((p) => p.id === args.where.id);
          const prevStock = target?.stock;
          const res = await baseClient.product.update(args);
          undoStack.push(() => {
            if (target && prevStock !== undefined) {
              target.stock = prevStock;
            }
          });
          return res;
        },
      },
      order: {
        ...baseClient.order,
        async create(args: any) {
          const res = await baseClient.order.create(args);
          undoStack.push(() => {
            const idx = db.data.orders.findIndex((o) => o.id === res.id);
            if (idx !== -1) db.data.orders.splice(idx, 1);
          });
          return res;
        },
      },
      orderItem: {
        ...baseClient.orderItem,
        async create(args: any) {
          const res = await baseClient.orderItem.create(args);
          undoStack.push(() => {
            const idx = db.data.orderItems.findIndex((oi) => oi.id === res.id);
            if (idx !== -1) db.data.orderItems.splice(idx, 1);
          });
          return res;
        },
      },
    };
  }
}
