/**
 * Greenfield Marketplace Exam — Types & Interfaces.
 * ─────────────────────────────────────────────────────────────────────────────
 * Contracts for the multi-file marketplace exam evaluation (Phase 5).
 */

export interface GreenfieldSubmission {
  schemaPrisma: string;
  seedCode: string;
  serviceCode: string;
}

export interface GateResult {
  gateNumber: 1 | 2 | 3 | 4;
  gateName: string;
  passed: boolean;
  feedback: string;
  durationMs: number;
  details?: Record<string, unknown>;
}

export interface GreenfieldExamResult {
  passed: boolean;
  failedGate?: 1 | 2 | 3 | 4;
  feedback: string;
  gateResults: GateResult[];
  totalDurationMs: number;
}

export interface MockUser {
  id: number;
  email: string;
  name: string;
}

export interface MockWallet {
  id: number;
  userId: number;
  balanceCents: number;
}

export interface MockProduct {
  id: number;
  title: string;
  priceCents: number;
  stock: number;
}

export interface MockOrder {
  id: number;
  buyerId: number;
  totalCents: number;
  idempotencyKey: string;
  createdAt: Date;
}

export interface MockOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPriceCents: number;
}

export interface MockMarketplaceDatabase {
  users: MockUser[];
  wallets: MockWallet[];
  products: MockProduct[];
  orders: MockOrder[];
  orderItems: MockOrderItem[];
}
