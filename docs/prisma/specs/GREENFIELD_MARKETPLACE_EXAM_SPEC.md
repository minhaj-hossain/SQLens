# Greenfield Marketplace Exam: Specification & Prose Contract

## 1. Exam Overview

The **Greenfield Marketplace Exam** is the culminating practical capstone of the Prisma Learning Fluency curriculum. It evaluates whether a learner can translate architectural, relational, and transactional requirements into a production-grade backend service **from an empty directory**.

Learners are provided with zero starter code and zero copy-paste Prisma Schema Language (PSL) snippets. Instead, they receive this strict prose contract and must author three files:
1. `schema.prisma`: The complete relational data model.
2. `seed.ts`: A deterministic, idempotent database seeding module.
3. `marketplace-service.ts`: An atomic checkout service implementing concurrency guards, error classes, and idempotency deduplication.

Evaluation is executed server-side across **4 sequential gates** in an isolated sandbox.

---

## 2. Prose Domain Contract

### 2.1 Entities & Relational Invariants

The data model requires five relational entities:

1. **User**:
   - Represents an account identity on the marketplace.
   - Must have an auto-incrementing integer identifier.
   - Must have a unique string email address and a string display name.
   - Has a strict **one-to-one relationship** with `Wallet`.
   - Has a **one-to-many relationship** with `Order` (as the buyer).

2. **Wallet**:
   - Stores the available spending balance of a user.
   - Must have an auto-incrementing integer identifier.
   - Stores currency strictly in integer cents (`balanceCents`). Floating-point types are strictly forbidden.
   - Stores a foreign key referencing the associated `User`.
   - **Architectural Invariant:** In Prisma, a 1:1 relation requires a unique constraint on the foreign key column (`userId`). Omitting this constraint causes Prisma to model the relation as 1:N and fails Gate 1.

3. **Product**:
   - Represents an inventory item available for purchase.
   - Must have an auto-incrementing integer identifier, a string title, and an integer price in cents (`priceCents`).
   - Must track integer available inventory (`stock`).
   - Has a **one-to-many relationship** with `OrderItem`.

4. **Order**:
   - Represents a finalized checkout transaction.
   - Must have an auto-incrementing integer identifier.
   - References the purchasing user (`buyerId`) as a foreign key.
   - Stores total charged cents (`totalCents`).
   - Must store a unique string `idempotencyKey` provided by the client.
   - Must record creation timestamp (`createdAt`), defaulting to the current system timestamp.
   - **Performance Invariant:** To enable fast chronological lookup of orders by buyer, the model must declare a composite index over `[buyerId, createdAt]`.
   - Has a **one-to-many relationship** with `OrderItem`.

5. **OrderItem**:
   - Line-item record capturing an individual product snapshot inside an order.
   - Must have an auto-incrementing integer identifier.
   - References parent `Order` (`orderId`) and purchased `Product` (`productId`).
   - Stores integer `quantity` purchased and the locked integer unit price (`unitPriceCents`) at time of purchase.

---

## 3. Seeding Specification (`seed.ts`)

The seeder must export a default function or named `seed(prisma)` function satisfying:
1. **Deterministic State:** Seeds at least two users with corresponding wallets (each with positive `balanceCents`), and at least two products with initial inventory (`stock > 0`).
2. **Idempotency Guarantee:** Running the seed script twice in succession against the same database must complete cleanly with **zero unique constraint violations (`P2002`)** and produce the exact same final row counts.

---

## 4. Service Specification (`marketplace-service.ts`)

### 4.1 Custom Error Classes
The module must define and export two domain error classes inheriting from `Error`:
- `OutOfStockError`: Thrown whenever a requested product has insufficient inventory to fulfill the requested quantity.
- `InsufficientFundsError`: Thrown whenever the buyer's wallet `balanceCents` is less than the order's computed `totalCents`.

### 4.2 Checkout Method Signature
The service must export a function `checkout(prisma, options)` accepting:
- `buyerId`: Integer ID of the buyer.
- `items`: Array of items to purchase, each specifying `{ productId: number, quantity: number }`.
- `idempotencyKey`: Unique string identifying this checkout request.

### 4.3 Transactional & Concurrency Invariants
The checkout execution must satisfy the following atomic guarantees:
1. **All-or-Nothing Atomicity:** All writes (wallet debit, stock decrements, order creation, order items insertion) must occur within an interactive transaction (`$transaction`). If any step throws (e.g. insufficient funds or missing product), all partial writes must roll back completely.
2. **Race-Condition Immunity:** Under high concurrency with artificial read latency (50ms read delay), two concurrent checkout requests competing for the last remaining unit of stock must not oversell. Exactly one request must succeed, and the other must throw `OutOfStockError`. The final stock must equal 0, never negative.
3. **Concurrent Idempotency Interception:** Resubmitting an identical `idempotencyKey` must intercept the unique constraint violation (`P2002` on `idempotencyKey`), locate the previously created `Order` record, and return it. It must **never double-debit** the buyer's wallet or **double-decrement** product stock.

---

## 5. Evaluation Gates (Execution Protocol)

The test runner evaluates submissions against 4 sequential gates:

| Gate | Title | Description | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Gate 1** | **Schema DDL & AST Invariants** | Structural analysis of `schema.prisma`. | All 5 models exist; currency columns are integer `Int` (no `Float`); `Wallet.userId` is `@unique`; composite index `@@index([buyerId, createdAt])` exists. |
| **Gate 2** | **Deterministic Seeding** | Runs `seed(prisma)` twice against clean database. | Both runs succeed with 0 `P2002` errors; identical seed state verified. |
| **Gate 3** | **Service Happy Path** | Runs standard checkout flow. | Correct order and order items created; buyer wallet debited by exact `totalCents`; inventory decremented. |
| **Gate 4** | **Concurrency, Rollback & Idempotency** | Stress tests under 50ms synthetic read delay. | Stock race condition passes with 0 oversells; credit failure triggers complete rollback; duplicate `idempotencyKey` returns existing order without side effects. |
