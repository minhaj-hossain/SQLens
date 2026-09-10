# PrismaLens: Complete Engineering Specification & Curriculum Master Plan
### *An Interactive, Browser-First Learning Platform for Mastering Prisma ORM & Production Database Engineering*

---

## 1. Project Overview & Core Philosophy

**PrismaLens** is an interactive, browser-first web application designed to teach modern **Prisma ORM (v7)**, schema modeling, relational database design, query optimization, and REST API architecture from the ground up.

### The Problem It Solves
Learning an Object-Relational Mapper (ORM) is notoriously plagued by the "Black Box" problem:
- Developers learn high-level methods like `prisma.user.findMany({ include: { posts: true } })` without understanding the underlying SQL queries, leading to hidden N+1 query bottlenecks and severe production latency.
- Developers struggle with the strict relationship syntax (`@relation(fields: [...], references: [...])`) and foreign key constraints.
- Developers misunderstand TypeScript type inference with `select` vs `include` and fail to pair ORM data access with runtime validation (Zod) and error middleware.

### The Non-Negotiable Core Principle
> **The learner must never have to guess what Prisma or the database is doing.**
> 1. **Target Hero Banner:** Before any theory explanation or step-by-step breakdown, the learner is shown the exact, formatted target code snippet being taught.
> 2. **Generated SQL Lens:** For every Prisma query executed, the learner can instantly view the exact raw SQL query that Prisma generated under the hood.
> 3. **TypeScript Type Inspector:** The learner can see the inferred TypeScript interface generated for any query result.
> 4. **Live ERD (Entity Relationship Diagram):** Schema changes instantly update an interactive visual graph showing models, fields, types, and foreign key relations.
> 5. **Dual-Task Mastery & Daily Final Challenges:** Every atomic concept must have at least **two** hands-on practice tasks (Task 1: Guided; Task 2: Independent), followed by a multi-step **Final Challenge** at the end of each day.

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   NEXT.JS 15 APP ROUTER                                │
│                                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────┐ │
│  │   Learning Experience   │  │    Curriculum & Schema      │  │     Auth & State    │ │
│  │  - Interactive Workspace│  │  - 14 Structured Modules    │  │  - LocalStorage /   │ │
│  │  - Monaco Editor        │  │  - Atomic Concepts & Tasks  │  │    IndexedDB Sync   │ │
│  │  - Live ERD Visualizer  │  │  - Seed Database Fixtures   │  │  - Streaks, Points  │ │
│  └────────────┬────────────┘  └──────────────┬──────────────┘  └──────────┬──────────┘ │
│               │                              │                            │            │
│  ┌────────────▼──────────────────────────────▼────────────────────────────▼──────────┐ │
│  │                       IN-BROWSER PRISMA SIMULATION ENGINE                         │ │
│  │  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐  │ │
│  │  │   TypeScript Parser    │  │  Prisma Query Proxy &  │  │ In-Memory SQLite    │  │ │
│  │  │  (Babel / TS Compiler) │  │  SQL Query Generator   │  │ WebAssembly (Wasm)  │  │ │
│  └───────────────────────────┴───────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Specifications
- **Framework:** Next.js 15 (React 19, App Router, TypeScript strict mode).
- **Styling:** Vanilla CSS / Tailwind CSS with modern custom HSL design tokens:
  - Background Base: `#0B0F19` (Deep Obsidian)
  - Surface Elevated: `#111827` (Charcoal Slate)
  - Border Subdued: `#1F2937`
  - Prisma Primary Brand: `#5A67D8` (Indigo)
  - Accent / Prisma Cyan: `#16A394` / `#00B4D8`
  - Success / Mastery Emerald: `#10B981`
  - Warning / Warning Amber: `#F59E0B`
  - Error Coral: `#EF4444`
  - Typography: Google Fonts `Inter` (UI) and `JetBrains Mono` / `Fira Code` (Code editor).
- **Code Editor:** Monaco Editor (`@monaco-editor/react`):
  - Tab 1: TypeScript code editor (`index.ts`) with custom Monaco language diagnostics and auto-completion.
  - Tab 2: Prisma Schema editor (`schema.prisma`) with keyword highlighting (`model`, `enum`, `datasource`, `generator`, `@id`, `@relation`).
- **Relational Visualizer (ERD):** SVG / HTML Canvas rendering model cards with field lists, types, primary key badges (`PK`), and animated SVG cubic-bezier connection curves indicating foreign keys.
- **Client-Side Database & Query Simulation:**
  - Standard SQLite WebAssembly (`sql.js` or PGlite) running directly in the browser's Web Worker or main thread.
  - An AST-based **Prisma Client Proxy** that interprets method calls (`prisma.user.findMany(...)`), translates them into parameterized SQL statements, executes them against the in-memory database, records execution duration, and returns typed JSON results.
  - Generates the raw SQL string for display in the **Generated SQL Lens** tab.

---

## 3. UI Layout & Component Architecture

### The Learning Workspace (Split-Pane View)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [▲ PrismaLens]  [Day 04: Relations ▾]  [Concept 2/3: 1-to-Many]  [● Database: ecom_db]  [🔥 3 Day Streak]  [850 XP]    │
├───────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┤
│ LEFT PANEL: THEORY & PEDAGOGY (45% Width)                 │ RIGHT PANEL: CODE WORKSPACE & CONSOLE (55% Width)         │
│                                                           │                                                           │
│ ┌───────────────────────────────────────────────────────┐ │ ┌─ TABS: [index.ts] [schema.prisma] [Generated SQL] [ERD]──┐│
│ │ TARGET PRISMA HERO CARD                               │ │ │ 1  import { prisma } from './lib/prisma';               ││
│ │ const users = await prisma.user.findMany({            │ │ │ 2                                                       ││
│ │   include: { posts: true }                            │ │ │ 3  export async function getAuthorFeed() {              ││
│ │ });                                                   │ │ │ 4    // Task: Retrieve users with their posts           ││
│ │ Badge: "Target Query Dissection"                      │ │ │ 5    return await prisma.user.findMany({                ││
│ └───────────────────────────────────────────────────────┘ │ │ 6      // Write your code here                          ││
│                                                           │ │ │ 7    });                                              ││
│ ┌───────────────────────────────────────────────────────┐ │ │ 8  }                                                    ││
│ │ PEDAGOGICAL STEP BREAKDOWNS                           │ │ └─────────────────────────────────────────────────────────┘│
│ │ Step 1: Base Table Query (users)                      │ │ ┌─ ACTION BAR ────────────────────────────────────────────┐│
│ │ Step 2: Relation Join / Foreign Key lookup (posts)    │ │ │ [ ▶ Run Query (Ctrl+Enter) ] [ ↺ Reset ] [ 💡 Hint (1/2)]││
│ └───────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────┘│
│                                                           │ ┌─ BOTTOM OUTPUT CONSOLE ─────────────────────────────────┐│
│ ┌───────────────────────────────────────────────────────┐ │ │ TABS: [ Query Result (JSON) ] [ Inferred Type ] [Console] ││
│ │ TASK INSTRUCTIONS & CHECKLIST                         │ │ │ ┌─────────────────────────────────────────────────────┐ ││
│ │ [x] Call prisma.user.findMany                         │ │ │ │ [                                                   │ ││
│ │ [ ] Include the 'posts' relation                      │ │ │ │   {                                                 │ ││
│ │ [ ] Only return posts where published is true         │ │ │ │     "id": 1, "name": "Alice",                       │ ││
│ └───────────────────────────────────────────────────────┘ │ │ │     "posts": [{ "id": 10, "title": "Prisma v7" }]  │ ││
│                                                           │ │ │   }                                                 │ ││
│ ┌───────────────────────────────────────────────────────┐ │ │ │ ]                                                   │ ││
│ │ HINT CARD (Collapsible)                               │ │ │ └─────────────────────────────────────────────────────┘ ││
│ │ Level 1: "Use the include property inside findMany"   │ │ └─────────────────────────────────────────────────────────┘│
│ └───────────────────────────────────────────────────────┘ │                                                           │
│ [ ‹ Previous Step ]                  [ Next Step 🠚 ]      │                                                           │
└───────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

### Core Page Routes
1. `/` — Landing page with curriculum overview, interactive feature preview, and resume-learning CTA.
2. `/roadmap` — Visual curriculum map showing 14 days grouped into 4 milestones, unlock state, completion progress, and XP.
3. `/learn/[dayId]` — Main module entry point (redirects to the user's current step: `theory`, `practice`, or `challenge`).
4. `/learn/[dayId]/theory/[conceptId]` — Concept theory, hero target code, step-by-step breakdown, and interactive MCQs.
5. `/learn/[dayId]/practice/[taskId]` — Hands-on coding task with editor, hints, live evaluation, and success modal.
6. `/learn/[dayId]/challenge` — Day Final Challenge (multi-step capstone scenario testing independence).
7. `/learn/[dayId]/complete` — Day completion summary card, key takeaways checklist, XP award, and next module unlock.
8. `/playground` — Sandbox environment with preloaded schemas, custom `schema.prisma` editor, TypeScript query console, and raw SQL viewer.

---

## 4. TypeScript Data Model & Curriculum Specification

Any AI or developer implementing this platform must use the following strictly typed data contracts:

```typescript
// =============================================================================
// CURRICULUM CORE TYPES
// =============================================================================

export type TaskType = 'guided' | 'independent' | 'stretch' | 'challenge' | 'project';

export interface TaskHint {
  level: number; // 1 = subtle direction, 2 = direct syntax hint
  text: string;
}

export interface PrismaValidationRule {
  targetModel?: string;                     // e.g. "user", "post", "product"
  requiredMethod?: 'findMany' | 'findUnique' | 'findFirst' | 'create' | 'createMany' | 'update' | 'updateMany' | 'upsert' | 'delete' | 'deleteMany' | '$transaction';
  requiredFieldsInSelect?: string[];        // e.g. ['id', 'email', 'name']
  forbiddenFieldsInSelect?: string[];       // e.g. ['password', 'hash']
  requiredIncludes?: string[];              // e.g. ['posts', 'profile', 'categories']
  requiredWhereClauses?: string[];          // e.g. ['email', 'status', 'createdAt']
  requiredOrderBy?: { field: string; direction?: 'asc' | 'desc' }[];
  requirePagination?: { take?: number; skip?: number; cursor?: boolean };
  expectFailure?: boolean;                  // Deliberate error lab (e.g. unique constraint violation)
  expectedErrorCode?: string;               // e.g. 'P2002' (unique key error), 'P2025' (not found)
  expectedRowCount?: number | { min?: number; max?: number };
  expectedResultSnippet?: Record<string, any>;
  customValidator?: (codeAst: any, result: any, rawSql: string) => { valid: boolean; message?: string };
}

export interface PracticeTask {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  type: TaskType;
  targetModel: string;
  activeTab?: 'editor' | 'schema';          // Whether task edits TypeScript or schema.prisma
  initialCode: string;
  solutionCode: string;
  solutionExplanation: string;
  hints: TaskHint[];
  validation: PrismaValidationRule;
  successMessage: string;
}

export interface TargetHeroCode {
  code: string;
  language: 'typescript' | 'prisma' | 'bash';
  explanation: string;
  badge?: string; // e.g. "Target Pattern We'll Dissect", "The Production Query"
}

export interface StepBreakdown {
  stepNumber: number;
  stepTitle: string;
  codeSnippet: string;
  explanation: string;
  visualData?: {
    type: 'sql_lens' | 'type_preview' | 'table_diff' | 'erd_highlight';
    title: string;
    details: any;
  };
}

export interface ConceptMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ConceptTheory {
  summary: string;
  targetHero: TargetHeroCode;
  explanation: string[];
  stepBreakdowns?: StepBreakdown[];
  keyTakeaway: string;
  commonMistakes?: string[];
  mcqs?: ConceptMCQ[];
  liveDemoCode?: string;
  liveDemoNotes?: string;
}

export interface Concept {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  theory: ConceptTheory;
  tasks: PracticeTask[]; // MUST HAVE AT LEAST 2 TASKS
  masteryPoints?: string[];
}

export interface DayChallenge {
  id: string;
  title: string;
  scenario: string;
  tasks: PracticeTask[];
}

export interface MilestoneData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  daysRange: string;
  moduleIds: string[];
}

export interface ModuleData {
  id: string;
  slug: string;
  day: number;
  title: string;
  shortTitle: string;
  milestoneId: string;
  description: string;
  estimatedMinutes: number;
  completionLearnings: string[];
  concepts: Concept[];
  challenge: DayChallenge;
}
```

---

## 5. The Complete 14-Day Curriculum Specification

Below is the complete, exhaustive specification for all 14 Days. Every day contains atomic concepts with full theory, target hero code, **minimum 2 tasks per concept** (with starter code, solution code, hints, and validation rules), and a comprehensive **Day Final Challenge**.

---

### MILESTONE 1: Foundations & Schema Modeling (Days 1 to 4)

---

#### DAY 1: Why Prisma? (Mental Models, ORMs & Prisma Architecture)
- **Module ID:** `day-01` | **Slug:** `why-prisma` | **Milestone:** `milestone-1` | **Est:** 45 mins
- **Description:** Understand the core database problems Prisma solves, comparing Raw SQL vs Query Builders vs ORMs, and mastering Prisma's 3-part engine architecture.

##### Concept 1: The Object-Relational Impedance Mismatch
- **Theory:** In relational databases, data is organized in flat 2D tables with foreign keys. In JavaScript/TypeScript, applications work with rich, nested object graphs. Raw SQL drivers (`pg`, `mysql2`) return untyped string tuples that require manual boilerplate parsing. Prisma bridges this gap with compile-time type safety.
- **Target Hero:**
  ```typescript
  // Type-safe, auto-completed database access with zero manual type casting
  const user = await prisma.user.findUnique({
    where: { email: 'alex@prisma.io' },
    select: { id: true, name: true, email: true }
  });
  ```
- **Step Breakdown:**
  1. *Raw SQL Approach:* `db.query('SELECT * FROM users WHERE email = $1', [email])` $\to$ Returns `any[]`, runtime errors if column is renamed.
  2. *Prisma Approach:* `prisma.user.findUnique(...)` $\to$ Generates parameterized SQL, validates at compile time, returns typed `User` object.
- **Task 1 (Guided):** Convert a brittle raw SQL query string into a type-safe `prisma.user.findUnique` call.
  - *Starter Code:*
    ```typescript
    // TODO: Rewrite this raw SQL query using Prisma Client:
    // SELECT id, name, email FROM users WHERE id = 1;
    export async function getUserById(userId: number) {
      // return rawDb.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
      return await prisma.user.findUnique({
        // Complete the query
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getUserById(userId: number) {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      });
    }
    ```
  - *Hints:*
    - Level 1: "Use the `where` argument to match `id: userId`."
    - Level 2: "Use `select: { id: true, name: true, email: true }` to limit the returned columns."
  - *Validation:* Target model `user`, required method `findUnique`, required fields `id`, `name`, `email`.
- **Task 2 (Independent):** Fix a broken query where a nonexistent column was queried, replacing it with valid Prisma model attributes.
  - *Starter Code:*
    ```typescript
    export async function getActiveMember(email: string) {
      // Bug: 'user_mail' does not exist on model User; the field is named 'email'
      return await prisma.user.findUnique({
        where: { user_mail: email } as any,
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getActiveMember(email: string) {
      return await prisma.user.findUnique({
        where: { email },
      });
    }
    ```
  - *Validation:* Target model `user`, method `findUnique`, where clause must check `email`.

##### Concept 2: The Three Pillars of Prisma (Schema, Client & Migrate)
- **Theory:** Prisma is composed of 3 parts:
  1. `schema.prisma`: The declarative single source of truth for your database models and configuration.
  2. `Prisma Client`: The auto-generated, type-safe query builder tailored to your schema.
  3. `Prisma Migrate`: The declarative migration tool that turns your schema into versioned SQL files.
- **Target Hero:**
  ```prisma
  // schema.prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }
  ```
- **Task 1 (Guided):** Configure a clean `schema.prisma` file with a PostgreSQL datasource using `env("DATABASE_URL")` and the standard client generator.
  - *Starter Code:*
    ```prisma
    // Configure the datasource and generator blocks below:
    ```
  - *Solution Code:*
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }
    ```
  - *Hints:*
    - Level 1: "Define `datasource db` with provider `'postgresql'` and `url = env('DATABASE_URL')`."
    - Level 2: "Define `generator client` with provider `'prisma-client-js'`."
  - *Validation:* Check that datasource provider is postgresql and client generator is defined.
- **Task 2 (Independent):** Update a schema configuration to switch from SQLite to PostgreSQL and add a custom generator output path.
  - *Starter Code:*
    ```prisma
    datasource db {
      provider = "sqlite"
      url      = "file:./dev.db"
    }

    generator client {
      provider = "prisma-client-js"
    }
    ```
  - *Solution Code:*
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }
    ```
  - *Validation:* Datasource provider must be `postgresql`.

##### Day 1 Final Challenge: The Startup Tech Audit
- **Scenario:** A team is migrating their prototype from an untyped driver to Prisma.
  - **Task 1:** Inspect the legacy queries and replace a raw user lookup with `prisma.user.findFirst`.
  - **Task 2:** Set up the initial `schema.prisma` datasource block reading from environment variable `DATABASE_URL`.
  - **Task 3:** Implement an audit query that fetches only the `id` and `createdAt` of the newest registered account.

---

#### DAY 2: Modern Prisma v7 Setup & Configuration
- **Module ID:** `day-02` | **Slug:** `prisma-setup-v7` | **Milestone:** `milestone-1` | **Est:** 45 mins
- **Description:** Create a working Prisma + PostgreSQL project, understand Prisma CLI tooling, manage connection pooling, and use introspection (`db pull`).

##### Concept 1: Prisma CLI Commands & Lifecycle
- **Theory:** Prisma CLI powers the developer lifecycle: `npx prisma init`, `npx prisma generate` (compiles types into `node_modules`), `npx prisma db pull` (reverse-engineers existing DB into schema), and `npx prisma studio` (visual data browser).
- **Target Hero:**
  ```bash
  npx prisma init --datasource-provider postgresql
  npx prisma generate
  ```
- **Task 1 (Guided):** Identify and invoke the correct Prisma CLI command to regenerate the TypeScript client after a schema modification.
  - *Starter Code:*
    ```typescript
    // Return the exact CLI command string needed to generate client types:
    export function getGenerateCommand(): string {
      return "";
    }
    ```
  - *Solution Code:*
    ```typescript
    export function getGenerateCommand(): string {
      return "npx prisma generate";
    }
    ```
  - *Hints:*
    - Level 1: "The command starts with `npx prisma ...` and ends with `generate`."
  - *Validation:* Output string equals `"npx prisma generate"`.
- **Task 2 (Independent):** Configure connection string URL parameters for production connection pooling with PgBouncer (`?pgbouncer=true&connection_limit=10`).
  - *Starter Code:*
    ```typescript
    export function formatPooledDbUrl(basePostgresUrl: string): string {
      // Append required query parameters for connection pooling (pgbouncer=true, connection_limit=10)
      return basePostgresUrl;
    }
    ```
  - *Solution Code:*
    ```typescript
    export function formatPooledDbUrl(basePostgresUrl: string): string {
      const url = new URL(basePostgresUrl);
      url.searchParams.set('pgbouncer', 'true');
      url.searchParams.set('connection_limit', '10');
      return url.toString();
    }
    ```
  - *Validation:* Returned URL includes `pgbouncer=true` and `connection_limit=10`.

##### Concept 2: Database Introspection (`prisma db pull`) & Field Mapping
- **Theory:** When connecting Prisma to a legacy database, `prisma db pull` reads database catalogs. Often, database tables use `snake_case` (`user_accounts`). Prisma allows you to use idiomatic `camelCase` in TypeScript while retaining `snake_case` in SQL using `@map` and `@@map`.
- **Target Hero:**
  ```prisma
  model UserAccount {
    id        Int      @id @default(autoincrement())
    firstName String   @map("first_name")
    createdAt DateTime @default(now()) @map("created_at")

    @@map("user_accounts")
  }
  ```
- **Task 1 (Guided):** Map a legacy database table `tbl_customers` to a model `Customer` and column `cust_email` to field `email`.
  - *Starter Code:*
    ```prisma
    model Customer {
      id    Int    @id @default(autoincrement())
      email String // Map this to "cust_email"

      // Map this model to "tbl_customers"
    }
    ```
  - *Solution Code:*
    ```prisma
    model Customer {
      id    Int    @id @default(autoincrement())
      email String @map("cust_email")

      @@map("tbl_customers")
    }
    ```
  - *Validation:* Check for `@map("cust_email")` and `@@map("tbl_customers")`.
- **Task 2 (Independent):** Add snake_case mapping for `phoneNumber` $\to$ `phone_number` and `registeredAt` $\to$ `registered_at`.
  - *Starter Code:*
    ```prisma
    model Customer {
      id           Int      @id @default(autoincrement())
      phoneNumber  String
      registeredAt DateTime

      @@map("tbl_customers")
    }
    ```
  - *Solution Code:*
    ```prisma
    model Customer {
      id           Int      @id @default(autoincrement())
      phoneNumber  String   @map("phone_number")
      registeredAt DateTime @map("registered_at")

      @@map("tbl_customers")
    }
    ```
  - *Validation:* Fields mapped to `phone_number` and `registered_at`.

##### Day 2 Final Challenge: Legacy DB Migration Setup
- **Scenario:** Take an introspected database schema with raw table names (`auth_users`, `sys_logs`), rename models into PascalCase TypeScript entities, apply `@map` to all columns, and verify connection string configuration.

---

#### DAY 3: Models, Fields, Enums & Constraints
- **Module ID:** `day-03` | **Slug:** `models-fields-enums` | **Milestone:** `milestone-1` | **Est:** 50 mins
- **Description:** Design proper database schemas with primary keys, optional fields, native database types, enums, composite unique constraints, and indexes.

##### Concept 1: Scalar Types, Optionality & Primary Keys
- **Theory:** Prisma models support core scalars: `String`, `Boolean`, `Int`, `BigInt`, `Float`, `Decimal`, `DateTime`, `Json`, and `Bytes`. Fields are required by default unless marked with `?`. Primary keys are designated with `@id` (e.g. `@default(autoincrement())`, `@default(cuid())`, `@default(uuid())`).
- **Target Hero:**
  ```prisma
  model Product {
    id          String   @id @default(cuid())
    sku         String   @unique
    title       String
    description String?
    price       Decimal  @db.Decimal(10, 2)
    inStock     Boolean  @default(true)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```
- **Task 1 (Guided):** Create a `Product` model with `cuid()` id, required `title`, optional `description`, `price` (Decimal), and automatic `createdAt` / `updatedAt` timestamps.
  - *Starter Code:*
    ```prisma
    // Define the Product model here:
    ```
  - *Solution Code:*
    ```prisma
    model Product {
      id          String   @id @default(cuid())
      title       String
      description String?
      price       Decimal
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    ```
  - *Validation:* Model `Product` exists with `@id`, optional `description?`, and `@updatedAt`.
- **Task 2 (Independent):** Create an `Article` model with an integer autoincrement ID, a unique `slug` string, and a `@default(false)` boolean `isPublished`.
  - *Starter Code:*
    ```prisma
    // Define the Article model:
    ```
  - *Solution Code:*
    ```prisma
    model Article {
      id          Int      @id @default(autoincrement())
      slug        String   @unique
      title       String
      isPublished Boolean  @default(false)
      createdAt   DateTime @default(now())
    }
    ```
  - *Validation:* `slug` has `@unique`, `isPublished` has `@default(false)`.

##### Concept 2: Enums & Multi-Field Constraints (`@@unique`, `@@index`)
- **Theory:** Enums enforce a strictly controlled set of constant values at the database level. Composite constraints (`@@unique([fieldA, fieldB])`) ensure uniqueness across multiple columns simultaneously, and `@@index` speeds up query performance.
- **Target Hero:**
  ```prisma
  enum Role {
    USER
    EDITOR
    ADMIN
  }

  model Membership {
    userId String
    orgId  String
    role   Role   @default(USER)

    @@id([userId, orgId])
    @@index([role])
  }
  ```
- **Task 1 (Guided):** Define an enum `OrderStatus` with values `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` and attach it to an `Order` model.
  - *Starter Code:*
    ```prisma
    // Define enum OrderStatus and model Order:
    ```
  - *Solution Code:*
    ```prisma
    enum OrderStatus {
      PENDING
      PROCESSING
      SHIPPED
      DELIVERED
      CANCELLED
    }

    model Order {
      id     Int         @id @default(autoincrement())
      status OrderStatus @default(PENDING)
      total  Decimal
    }
    ```
  - *Validation:* Enum `OrderStatus` exists with 5 members; `Order.status` defaults to `PENDING`.
- **Task 2 (Independent):** Add a composite unique constraint to a `CourseEnrollment` model ensuring a student cannot enroll in the same course twice (`@@unique([studentId, courseId])`).
  - *Starter Code:*
    ```prisma
    model CourseEnrollment {
      id        Int      @id @default(autoincrement())
      studentId String
      courseId  String
      enrolledAt DateTime @default(now())
      // Add composite unique constraint
    }
    ```
  - *Solution Code:*
    ```prisma
    model CourseEnrollment {
      id         Int      @id @default(autoincrement())
      studentId  String
      courseId   String
      enrolledAt DateTime @default(now())

      @@unique([studentId, courseId])
    }
    ```
  - *Validation:* Model has `@@unique([studentId, courseId])`.

##### Day 3 Final Challenge: Complete E-Commerce Schema Blueprint
- **Scenario:** Design the full schema for `DigitalGoodsStore` with:
  1. `User` model with `cuid()` ID, unique `email`, optional `avatarUrl`, and `Role` enum.
  2. `Category` model with unique `slug`.
  3. `Product` model with `Decimal(10, 2)` price, relation fields, and `@@index([status])`.
  4. Composite constraint on `UserFavorite` (`@@id([userId, productId])`).

---

#### DAY 4: Relations (1-to-1, 1-to-Many, Many-to-Many)
- **Module ID:** `day-04` | **Slug:** `relations-modeling` | **Milestone:** `milestone-1` | **Est:** 55 mins
- **Description:** Model real-world relationships in Prisma schemas, understand foreign keys, `@relation` attributes, and implicit vs explicit join tables.

##### Concept 1: One-to-Many (1:N) Relations
- **Theory:** The most common relational pattern. One user has many posts. The child table (`Post`) holds the foreign key scalar field (`authorId Int`) and the relation field (`author User @relation(fields: [authorId], references: [id]))`. The parent table holds the relation collection field (`posts Post[]`).
- **Target Hero:**
  ```prisma
  model User {
    id    Int    @id @default(autoincrement())
    posts Post[]
  }

  model Post {
    id       Int  @id @default(autoincrement())
    title    String
    authorId Int
    author   User @relation(fields: [authorId], references: [id])
  }
  ```
- **Task 1 (Guided):** Connect `Author` and `Book` in a 1-to-Many relationship by defining the foreign key `authorId` on `Book`.
  - *Starter Code:*
    ```prisma
    model Author {
      id    Int    @id @default(autoincrement())
      name  String
      books Book[]
    }

    model Book {
      id    Int    @id @default(autoincrement())
      title String
      // Add authorId and author relation
    }
    ```
  - *Solution Code:*
    ```prisma
    model Author {
      id    Int    @id @default(autoincrement())
      name  String
      books Book[]
    }

    model Book {
      id       Int    @id @default(autoincrement())
      title    String
      authorId Int
      author   Author @relation(fields: [authorId], references: [id])
    }
    ```
  - *Validation:* `Book.authorId` scalar exists; `Book.author` has `@relation(fields: [authorId], references: [id])`.
- **Task 2 (Independent):** Model a 1-to-Many relation between `Company` and `Employee` where `companyId` is optional (allowing unassigned employees).
  - *Starter Code:*
    ```prisma
    model Company {
      id        Int        @id @default(autoincrement())
      name      String
      employees Employee[]
    }

    model Employee {
      id   Int    @id @default(autoincrement())
      name String
      // Define optional companyId and company relation
    }
    ```
  - *Solution Code:*
    ```prisma
    model Company {
      id        Int        @id @default(autoincrement())
      name      String
      employees Employee[]
    }

    model Employee {
      id        Int      @id @default(autoincrement())
      name      String
      companyId Int?
      company   Company? @relation(fields: [companyId], references: [id])
    }
    ```
  - *Validation:* `companyId` is `Int?`, relation is `Company?`.

##### Concept 2: One-to-One (1:1) Relations
- **Theory:** In a 1:1 relationship (e.g. `User` and `Profile`), exactly one side holds the foreign key, and that foreign key **must be marked with `@unique`**.
- **Target Hero:**
  ```prisma
  model User {
    id      Int      @id @default(autoincrement())
    profile Profile?
  }

  model Profile {
    id     Int  @id @default(autoincrement())
    bio    String
    userId Int  @unique // @unique turns 1:N into 1:1!
    user   User @relation(fields: [userId], references: [id])
  }
  ```
- **Task 1 (Guided):** Create a 1:1 relation between `Account` and `AccountSettings`, enforcing `@unique` on `accountId`.
  - *Starter Code:*
    ```prisma
    model Account {
      id       Int              @id @default(autoincrement())
      email    String           @unique
      settings AccountSettings?
    }

    model AccountSettings {
      id        Int     @id @default(autoincrement())
      darkMode  Boolean @default(false)
      // Add foreign key accountId and relation to Account
    }
    ```
  - *Solution Code:*
    ```prisma
    model Account {
      id       Int              @id @default(autoincrement())
      email    String           @unique
      settings AccountSettings?
    }

    model AccountSettings {
      id        Int     @id @default(autoincrement())
      darkMode  Boolean @default(false)
      accountId Int     @unique
      account   Account @relation(fields: [accountId], references: [id])
    }
    ```
  - *Validation:* `accountId` has `@unique` constraint.
- **Task 2 (Independent):** Fix a schema error where omitting `@unique` caused Prisma to throw a "Missing unique constraint on foreign key field for 1:1 relation" error.
  - *Starter Code:*
    ```prisma
    model Driver {
      id      Int      @id @default(autoincrement())
      license License?
    }

    model License {
      id       Int    @id @default(autoincrement())
      number   String @unique
      driverId Int    // BUG: Missing @unique!
      driver   Driver @relation(fields: [driverId], references: [id])
    }
    ```
  - *Solution Code:*
    ```prisma
    model Driver {
      id      Int      @id @default(autoincrement())
      license License?
    }

    model License {
      id       Int    @id @default(autoincrement())
      number   String @unique
      driverId Int    @unique
      driver   Driver @relation(fields: [driverId], references: [id])
    }
    ```
  - *Validation:* `driverId` has `@unique`.

##### Concept 3: Many-to-Many (M:N) Relations (Implicit vs Explicit)
- **Theory:**
  - *Implicit M:N:* Defined simply as `posts Post[]` and `tags Tag[]`. Prisma automatically creates and manages a hidden join table (`_PostToTag`).
  - *Explicit M:N:* Required when the relationship itself carries data (e.g. `assignedAt`, `role`, `quantity`). An explicit model is created with composite primary key `@@id([postId, tagId])`.
- **Target Hero:**
  ```prisma
  // Explicit M:N Join Model with extra attribute
  model PostTag {
    postId     Int
    tagId      Int
    assignedAt DateTime @default(now())
    post       Post     @relation(fields: [postId], references: [id])
    tag        Tag      @relation(fields: [tagId], references: [id])

    @@id([postId, tagId])
  }
  ```
- **Task 1 (Guided):** Define an implicit M:N relation between `Post` and `Category`.
  - *Starter Code:*
    ```prisma
    model Post {
      id Int @id @default(autoincrement())
      // Add categories relation
    }

    model Category {
      id Int @id @default(autoincrement())
      // Add posts relation
    }
    ```
  - *Solution Code:*
    ```prisma
    model Post {
      id         Int        @id @default(autoincrement())
      categories Category[]
    }

    model Category {
      id    Int    @id @default(autoincrement())
      posts Post[]
    }
    ```
  - *Validation:* Both models contain array fields pointing to each other.
- **Task 2 (Independent):** Define an explicit M:N relation between `Student` and `ClassRoom` via join model `ClassEnrollment` holding `grade Decimal?`.
  - *Starter Code:*
    ```prisma
    model Student {
      id          Int               @id @default(autoincrement())
      name        String
      enrollments ClassEnrollment[]
    }

    model ClassRoom {
      id          Int               @id @default(autoincrement())
      roomNumber  String
      enrollments ClassEnrollment[]
    }

    // Define model ClassEnrollment with studentId, classRoomId, grade, and @@id:
    ```
  - *Solution Code:*
    ```prisma
    model Student {
      id          Int               @id @default(autoincrement())
      name        String
      enrollments ClassEnrollment[]
    }

    model ClassRoom {
      id          Int               @id @default(autoincrement())
      roomNumber  String
      enrollments ClassEnrollment[]
    }

    model ClassEnrollment {
      studentId   Int
      classRoomId Int
      grade       Decimal?
      student     Student   @relation(fields: [studentId], references: [id])
      classRoom   ClassRoom @relation(fields: [classRoomId], references: [id])

      @@id([studentId, classRoomId])
    }
    ```
  - *Validation:* `ClassEnrollment` contains `@@id([studentId, classRoomId])` and foreign key `@relation`s.

##### Day 4 Final Challenge: Social Network Relational Core
- **Scenario:** Build the complete relational schema for a social network:
  1. `User` to `Profile` (1:1).
  2. `User` to `Post` (1:N).
  3. `Post` to `Comment` (1:N).
  4. `PostLike` explicit join table holding `userId`, `postId`, and `likedAt` timestamp.

---

### MILESTONE 2: Migrations, Operations & Controlled Reads (Days 5 to 8)

---

#### DAY 5: Migrations + Seeding
- **Module ID:** `day-05` | **Slug:** `migrations-and-seeding` | **Milestone:** `milestone-2` | **Est:** 45 mins
- **Description:** Safely evolve database schemas with `prisma migrate dev`, understand migration SQL files, and build idempotent seeders with `prisma/seed.ts`.

##### Concept 1: Prisma Migrate Workflow (`migrate dev`, `migrate deploy`)
- **Theory:** `npx prisma migrate dev` compares `schema.prisma` against your database, computes the diff, creates a timestamped SQL migration file in `prisma/migrations/`, and applies it. In production CI/CD, `npx prisma migrate deploy` executes pending migrations without re-generating schema files.
- **Target Hero:**
  ```bash
  # Development: detect changes, create migration, apply, and regenerate client
  npx prisma migrate dev --name add_user_profiles
  ```
- **Task 1 (Guided):** Match migration commands to their proper environments (dev vs production CI/CD).
  - *Starter Code:*
    ```typescript
    export function getProductionMigrationCommand(): string {
      // Return the command used in production CI/CD pipelines
      return "";
    }
    ```
  - *Solution Code:*
    ```typescript
    export function getProductionMigrationCommand(): string {
      return "npx prisma migrate deploy";
    }
    ```
  - *Validation:* Equals `"npx prisma migrate deploy"`.
- **Task 2 (Independent):** Add a required column with a `@default` value to avoid failing migrations when existing rows are present.
  - *Starter Code:*
    ```prisma
    // Model has existing production rows. Add required field 'status' safely:
    model Order {
      id     Int    @id @default(autoincrement())
      amount Decimal
      // Add status String with default "PENDING"
    }
    ```
  - *Solution Code:*
    ```prisma
    model Order {
      id     Int    @id @default(autoincrement())
      amount Decimal
      status String @default("PENDING")
    }
    ```
  - *Validation:* `status` field has `@default("PENDING")`.

##### Concept 2: Idempotent Seeding with `prisma/seed.ts`
- **Theory:** Seeding populates dummy or initial configuration data. To prevent errors when seeding repeatedly, operations should be **idempotent** (using `upsert` rather than plain `create`).
- **Target Hero:**
  ```typescript
  // prisma/seed.ts
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator' },
  });
  ```
- **Task 1 (Guided):** Write an idempotent seed function using `prisma.user.upsert` that creates an initial administrator account if it does not already exist.
  - *Starter Code:*
    ```typescript
    export async function seedAdminUser() {
      // Use prisma.user.upsert to ensure email 'admin@prisma.io' exists
      return await prisma.user.upsert({
        // Complete the upsert query
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function seedAdminUser() {
      return await prisma.user.upsert({
        where: { email: 'admin@prisma.io' },
        update: {},
        create: {
          email: 'admin@prisma.io',
          name: 'Super Admin',
        }
      });
    }
    ```
  - *Validation:* Calls `user.upsert`, `where` checks `email`, has both `update` and `create`.
- **Task 2 (Independent):** Seed 3 default categories (`Electronics`, `Books`, `Clothing`) using a `Promise.all` mapping of `upsert` calls.
  - *Starter Code:*
    ```typescript
    const defaultCategories = ['Electronics', 'Books', 'Clothing'];

    export async function seedCategories() {
      // Return a Promise.all array of upsert operations
    }
    ```
  - *Solution Code:*
    ```typescript
    const defaultCategories = ['Electronics', 'Books', 'Clothing'];

    export async function seedCategories() {
      return await Promise.all(
        defaultCategories.map((name) =>
          prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
          })
        )
      );
    }
    ```
  - *Validation:* Resolves upsert for each category name.

##### Day 5 Final Challenge: Schema Evolution & Deterministic Seeder
- **Scenario:** Add an `AuditLog` table to the database, generate the migration schema, and build a `seed.ts` script that populates 5 users, 10 articles, and 20 comments with foreign key referential integrity.

---

#### DAY 6: PrismaClient Lifecycle & Connections
- **Module ID:** `day-06` | **Slug:** `client-lifecycle-connections` | **Milestone:** `milestone-2` | **Est:** 40 mins
- **Description:** Understand connection management, connection pooling limits, singleton patterns in Next.js/Express, query logging, and graceful shutdown.

##### Concept 1: The Global PrismaClient Singleton Pattern
- **Theory:** Each `new PrismaClient()` establishes a connection pool. In development environments with Hot Module Reloading (HMR) like Next.js, refreshing code repeatedly creates new client instances until the database throws `Error: Too many connections`. The global singleton pattern caches the client instance on Node's `globalThis`.
- **Target Hero:**
  ```typescript
  // src/lib/prisma.ts
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  export const prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
  ```
- **Task 1 (Guided):** Implement the production-ready `lib/prisma.ts` singleton pattern with TypeScript typing.
  - *Starter Code:*
    ```typescript
    import { PrismaClient } from '@prisma/client';

    // Implement the global singleton pattern below:
    ```
  - *Solution Code:*
    ```typescript
    import { PrismaClient } from '@prisma/client';

    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };

    export const prisma = globalForPrisma.prisma ?? new PrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    ```
  - *Validation:* Assigns to `globalThis` / `globalForPrisma` when `NODE_ENV !== 'production'`.
- **Task 2 (Independent):** Fix a database connection exhaustion bug in an Express application caused by instantiating `new PrismaClient()` inside an API request handler.
  - *Starter Code:*
    ```typescript
    // BUG: Instantiating client inside route handler exhausts connections!
    export async function handleRequest(req: any, res: any) {
      const client = new PrismaClient();
      const users = await client.user.findMany();
      return res.json(users);
    }
    ```
  - *Solution Code:*
    ```typescript
    import { prisma } from './lib/prisma';

    export async function handleRequest(req: any, res: any) {
      const users = await prisma.user.findMany();
      return res.json(users);
    }
    ```
  - *Validation:* Imports singleton `prisma` and removes inline `new PrismaClient()`.

##### Concept 2: Query Logging & Graceful Disconnect
- **Theory:** Configuring query performance logging (`log: ['query', 'info', 'warn', 'error']`) and handling Node.js `SIGINT` / `SIGTERM` signals with `await prisma.$disconnect()`.
- **Target Hero:**
  ```typescript
  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' }
    ]
  });

  prisma.$on('query', (e) => {
    console.log(`Query: ${e.query} | Duration: ${e.duration}ms`);
  });
  ```
- **Task 1 (Guided):** Instantiate a `PrismaClient` configured to emit an event whenever a query executes, printing query duration.
  - *Starter Code:*
    ```typescript
    export function createLoggedClient() {
      // Return PrismaClient with query event logging
    }
    ```
  - *Solution Code:*
    ```typescript
    export function createLoggedClient() {
      const client = new PrismaClient({
        log: [{ emit: 'event', level: 'query' }]
      });
      return client;
    }
    ```
  - *Validation:* Config includes `log: [{ emit: 'event', level: 'query' }]`.
- **Task 2 (Independent):** Create a process termination handler that calls `prisma.$disconnect()` on `beforeExit`.
  - *Starter Code:*
    ```typescript
    export function setupGracefulShutdown(client: PrismaClient) {
      // Register process.on('beforeExit') to disconnect client cleanly
    }
    ```
  - *Solution Code:*
    ```typescript
    export function setupGracefulShutdown(client: PrismaClient) {
      process.on('beforeExit', async () => {
        await client.$disconnect();
      });
    }
    ```
  - *Validation:* Calls `client.$disconnect()` inside event handler.

##### Day 6 Final Challenge: Enterprise Database Gateway
- **Scenario:** Build an enterprise database gateway module with connection pooling URL validation, slow-query duration alerts (>100ms), and clean teardown listeners.

---

#### DAY 7: Reading Data + `select` vs `include`
- **Module ID:** `day-07` | **Slug:** `reading-data-select-include` | **Milestone:** `milestone-2` | **Est:** 50 mins
- **Description:** Build controlled queries with `findMany`, `findUnique`, `findFirst`, understand data pruning with `select`, and master relation loading with `include`.

##### Concept 1: Query Execution: `findUnique`, `findFirst`, `findMany`
- **Theory:**
  - `findUnique`: Finds exactly 0 or 1 record by `@id` or `@unique` key.
  - `findFirst`: Finds the first record matching arbitrary criteria.
  - `findMany`: Returns an array of all matching records.
- **Target Hero:**
  ```typescript
  // Fast indexed single lookup
  const user = await prisma.user.findUnique({
    where: { email: 'alice@prisma.io' }
  });
  ```
- **Task 1 (Guided):** Find a product by its unique `sku` code using `findUnique`.
  - *Starter Code:*
    ```typescript
    export async function getProductBySku(sku: string) {
      return await prisma.product.findUnique({
        // Complete query
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getProductBySku(sku: string) {
      return await prisma.product.findUnique({
        where: { sku }
      });
    }
    ```
  - *Validation:* Calls `product.findUnique`, `where: { sku }`.
- **Task 2 (Independent):** Find the most recently created active discount code using `findFirst` with `orderBy: { createdAt: 'desc' }`.
  - *Starter Code:*
    ```typescript
    export async function getLatestDiscount() {
      // Return first active discount code ordered by createdAt descending
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getLatestDiscount() {
      return await prisma.discount.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    }
    ```
  - *Validation:* Method `findFirst`, `where: { isActive: true }`, `orderBy: { createdAt: 'desc' }`.

##### Concept 2: Data Shaping (`select`) vs Relation Loading (`include`)
- **Theory:**
  - `select`: Chooses specific scalar fields to return (e.g. exclude passwords).
  - `include`: Eager-loads related models.
  - **The Golden Rule:** You cannot use `select` and `include` at the same top-level object! To select specific fields from a relation, nest `select` inside `select` or inside `include`.
- **Target Hero:**
  ```typescript
  // Nesting relation selection inside select
  const userWithPosts = await prisma.user.findUnique({
    where: { id: 1 },
    select: {
      id: true,
      name: true,
      posts: {
        select: { id: true, title: true }
      }
    }
  });
  ```
- **Task 1 (Guided):** Retrieve an author by `id`, selecting only `id` and `name`, and including their published `posts` (selecting only post `title`).
  - *Starter Code:*
    ```typescript
    export async function getAuthorPublicProfile(authorId: number) {
      return await prisma.user.findUnique({
        where: { id: authorId },
        // Select id, name, and nested posts (id, title)
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getAuthorPublicProfile(authorId: number) {
      return await prisma.user.findUnique({
        where: { id: authorId },
        select: {
          id: true,
          name: true,
          posts: {
            select: { id: true, title: true }
          }
        }
      });
    }
    ```
  - *Validation:* `select` contains `id`, `name`, and nested `posts.select`.
- **Task 2 (Independent):** Fix a query that crashed with Prisma error: `"Please either use select or include on an object, you cannot use both"`.
  - *Starter Code:*
    ```typescript
    export async function getAuthorWithPostsBuggy(id: number) {
      return await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true },
        include: { posts: true } // ILLEGAL: Cannot combine select and include at root
      } as any);
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getAuthorWithPostsBuggy(id: number) {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          posts: true
        }
      });
    }
    ```
  - *Validation:* Removes simultaneous top-level `select` and `include`.

##### Day 7 Final Challenge: High-Performance Profile & Feed Loader
- **Scenario:** Build a public user profile query that retrieves a user's details, their latest 5 posts, and each post's comment count, strictly excluding user password hashes and private emails.

---

#### DAY 8: Filtering, Sorting & Pagination
- **Module ID:** `day-08` | **Slug:** `filtering-sorting-pagination` | **Milestone:** `milestone-2` | **Est:** 55 mins
- **Description:** Build production-style list queries using complex operators, case-insensitive string search, multi-column sorting, and scalable pagination.

##### Concept 1: Advanced Filtering Operators (`where`, `in`, `contains`, `AND`, `OR`)
- **Theory:** Prisma provides rich condition operators: `equals`, `not`, `in`, `notIn`, `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `endsWith`, `mode: 'insensitive'`. Compound conditions use `AND: [...]` or `OR: [...]`.
- **Target Hero:**
  ```typescript
  const results = await prisma.product.findMany({
    where: {
      AND: [
        { price: { gte: 25, lte: 150 } },
        { status: 'IN_STOCK' },
        { title: { contains: 'wireless', mode: 'insensitive' } }
      ]
    }
  });
  ```
- **Task 1 (Guided):** Query all users whose age is greater than or equal to 18 AND status is `'ACTIVE'`.
  - *Starter Code:*
    ```typescript
    export async function getActiveAdults() {
      return await prisma.user.findMany({
        // Filter age >= 18 and status 'ACTIVE'
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getActiveAdults() {
      return await prisma.user.findMany({
        where: {
          age: { gte: 18 },
          status: 'ACTIVE'
        }
      });
    }
    ```
  - *Validation:* `where` contains `age: { gte: 18 }` and `status: 'ACTIVE'`.
- **Task 2 (Independent):** Search articles where title OR content contains a keyword, using case-insensitive mode.
  - *Starter Code:*
    ```typescript
    export async function searchArticles(keyword: string) {
      // Return articles matching keyword in title OR content (case-insensitive)
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function searchArticles(keyword: string) {
      return await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } }
          ]
        }
      });
    }
    ```
  - *Validation:* Uses `OR` array with `{ contains: keyword, mode: 'insensitive' }`.

##### Concept 2: Pagination Strategies (Offset vs Cursor-Based)
- **Theory:**
  - *Offset Pagination:* Uses `take` (limit) and `skip` (offset). Easy to jump to page numbers, but gets slow on large tables (`OFFSET 100000`).
  - *Cursor-Based Pagination:* Uses `take: N`, `skip: 1`, and `cursor: { id: lastSeenId }`. Extremely fast and stable for infinite scrolling feeds.
- **Target Hero:**
  ```typescript
  // High-performance cursor pagination
  const feed = await prisma.post.findMany({
    take: 10,
    skip: 1, // Skip the cursor itself
    cursor: { id: lastPostId },
    orderBy: { id: 'asc' }
  });
  ```
- **Task 1 (Guided):** Implement offset pagination returning page $N$ with a page size of 20 items.
  - *Starter Code:*
    ```typescript
    export async function getPaginatedProducts(page: number, pageSize: number = 20) {
      return await prisma.product.findMany({
        // Calculate skip and take
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getPaginatedProducts(page: number, pageSize: number = 20) {
      return await prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' }
      });
    }
    ```
  - *Validation:* `skip` equals `(page - 1) * pageSize` and `take` equals `pageSize`.
- **Task 2 (Independent):** Implement cursor pagination for an activity stream given a `cursorId`.
  - *Starter Code:*
    ```typescript
    export async function getActivityStream(cursorId?: number, limit: number = 15) {
      // If cursorId is provided, use cursor pagination; otherwise take the first page
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getActivityStream(cursorId?: number, limit: number = 15) {
      return await prisma.activity.findMany({
        take: limit,
        ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
        orderBy: { id: 'desc' }
      });
    }
    ```
  - *Validation:* Configures `cursor: { id: cursorId }` when present.

##### Day 8 Final Challenge: Production Catalog Search & Filter Engine
- **Scenario:** Create a production-ready search and filter endpoint that accepts price bounds, status enums, sort direction (`asc`/`desc`), and cursor token, returning both items and a `nextCursor` value.

---

### MILESTONE 3: Mutations, Data Integrity & Transactions (Days 9 to 12)

---

#### DAY 9: `create()` + Zod Validation
- **Module ID:** `day-09` | **Slug:** `create-and-zod-validation` | **Milestone:** `milestone-3` | **Est:** 50 mins
- **Description:** Safely accept user input, validate payloads with Zod schemas, and persist single and batch records with `create()` and `createMany()`.

##### Concept 1: Inserting Data (`create()`, `createMany()`)
- **Theory:** `prisma.model.create({ data: { ... } })` creates a single record and returns the inserted object. `createMany({ data: [...], skipDuplicates: true })` creates batches efficiently in a single `INSERT` statement.
- **Target Hero:**
  ```typescript
  const newUser = await prisma.user.create({
    data: {
      email: 'newuser@prisma.io',
      name: 'Taylor Developer'
    }
  });
  ```
- **Task 1 (Guided):** Insert a new `Category` record with `name` and auto-generated `slug`.
  - *Starter Code:*
    ```typescript
    export async function createCategory(name: string, slug: string) {
      return await prisma.category.create({
        // Fill data
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function createCategory(name: string, slug: string) {
      return await prisma.category.create({
        data: { name, slug }
      });
    }
    ```
  - *Validation:* Method `create`, `data` contains `name` and `slug`.
- **Task 2 (Independent):** Bulk insert a list of tags using `createMany` with `skipDuplicates: true`.
  - *Starter Code:*
    ```typescript
    export async function importTags(tags: { name: string }[]) {
      // Use createMany to insert tags without failing on duplicate names
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function importTags(tags: { name: string }[]) {
      return await prisma.tag.createMany({
        data: tags,
        skipDuplicates: true
      });
    }
    ```
  - *Validation:* Calls `createMany`, specifies `skipDuplicates: true`.

##### Concept 2: Validating Input Payloads with Zod
- **Theory:** Never trust client input. ORMs do not validate email formatting, password strength, or string lengths. Zod validates runtime payloads before data ever touches the database, guaranteeing clean types.
- **Target Hero:**
  ```typescript
  import { z } from 'zod';

  export const CreateUserSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(18),
    role: z.enum(['USER', 'ADMIN']).default('USER')
  });

  export type CreateUserInput = z.infer<typeof CreateUserSchema>;
  ```
- **Task 1 (Guided):** Define a Zod schema for `CreateProductInput` requiring `title` (min 3 chars), positive `price` (number), and optional `sku`.
  - *Starter Code:*
    ```typescript
    import { z } from 'zod';

    export const CreateProductSchema = z.object({
      // Define schema fields
    });
    ```
  - *Solution Code:*
    ```typescript
    import { z } from 'zod';

    export const CreateProductSchema = z.object({
      title: z.string().min(3),
      price: z.number().positive(),
      sku: z.string().optional()
    });
    ```
  - *Validation:* Zod schema validates `title` min 3, positive `price`.
- **Task 2 (Independent):** Build an endpoint handler that parses input with `CreateProductSchema` and passes the validated data to `prisma.product.create`.
  - *Starter Code:*
    ```typescript
    export async function handleCreateProduct(rawBody: unknown) {
      // 1. Validate rawBody with CreateProductSchema
      // 2. Insert into DB and return created product
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function handleCreateProduct(rawBody: unknown) {
      const validatedData = CreateProductSchema.parse(rawBody);
      return await prisma.product.create({
        data: validatedData
      });
    }
    ```
  - *Validation:* Parses via Zod schema, passes result to `product.create`.

##### Day 9 Final Challenge: Secure User Registration Pipeline
- **Scenario:** Build an end-to-end user registration workflow: define a strict Zod schema (password length, email validation), parse request body, check email uniqueness, hash the password, and create the user record.

---

#### DAY 10: `update()`, `updateMany()` & `upsert()`
- **Module ID:** `day-10` | **Slug:** `updates-and-upserts` | **Milestone:** `milestone-3` | **Est:** 45 mins
- **Description:** Handle real update workflows, prevent race conditions with atomic numeric operations, apply bulk updates, and master idempotent upserts.

##### Concept 1: Updating Single Records & Atomic Numeric Operations
- **Theory:** `prisma.model.update({ where: { id }, data: { ... } })` modifies a single record. To prevent race conditions when modifying numbers (e.g. inventory stock or page views), Prisma provides atomic operators: `increment`, `decrement`, `multiply`, and `divide`.
- **Target Hero:**
  ```typescript
  // Atomic increment prevents lost updates in concurrent environments
  const post = await prisma.post.update({
    where: { id: 42 },
    data: {
      views: { increment: 1 },
      title: 'Updated Title'
    }
  });
  ```
- **Task 1 (Guided):** Update a customer's email address by their primary key `id`.
  - *Starter Code:*
    ```typescript
    export async function updateCustomerEmail(id: number, newEmail: string) {
      return await prisma.customer.update({
        // Update customer email
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function updateCustomerEmail(id: number, newEmail: string) {
      return await prisma.customer.update({
        where: { id },
        data: { email: newEmail }
      });
    }
    ```
  - *Validation:* Method `update`, `where: { id }`, `data: { email }`.
- **Task 2 (Independent):** Decrement a product's `stock` by $N$ using the atomic `{ decrement: quantity }` operator upon purchase.
  - *Starter Code:*
    ```typescript
    export async function purchaseItem(productId: number, quantity: number) {
      // Atomically decrement stock
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function purchaseItem(productId: number, quantity: number) {
      return await prisma.product.update({
        where: { id: productId },
        data: {
          stock: { decrement: quantity }
        }
      });
    }
    ```
  - *Validation:* Data specifies `stock: { decrement: quantity }`.

##### Concept 2: Idempotent Workflows with `upsert()`
- **Theory:** The "Update or Insert" pattern: tests for existence by unique key. If found, executes `update: { ... }`; if not found, executes `create: { ... }`.
- **Target Hero:**
  ```typescript
  const userSetting = await prisma.userSetting.upsert({
    where: { userId: 10 },
    update: { theme: 'DARK' },
    create: { userId: 10, theme: 'DARK', notifications: true }
  });
  ```
- **Task 1 (Guided):** Implement `upsert` for a user's notification preferences.
  - *Starter Code:*
    ```typescript
    export async function setPreference(userId: number, emailNotify: boolean) {
      return await prisma.userPreference.upsert({
        // Complete upsert
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function setPreference(userId: number, emailNotify: boolean) {
      return await prisma.userPreference.upsert({
        where: { userId },
        update: { emailNotify },
        create: { userId, emailNotify }
      });
    }
    ```
  - *Validation:* Method `upsert`, defines `where`, `update`, and `create`.
- **Task 2 (Independent):** Build an analytics page-view recorder using `upsert` combined with atomic `increment`.
  - *Starter Code:*
    ```typescript
    export async function recordPageView(pagePath: string) {
      // Upsert: if pagePath exists, increment views by 1; if not, create with views = 1
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function recordPageView(pagePath: string) {
      return await prisma.pageView.upsert({
        where: { path: pagePath },
        update: { views: { increment: 1 } },
        create: { path: pagePath, views: 1 }
      });
    }
    ```
  - *Validation:* Upsert with `views: { increment: 1 }` on update and `views: 1` on create.

##### Day 10 Final Challenge: E-Commerce Inventory Reconciliation
- **Scenario:** Build an automated shipment reconciliation handler: receives a shipment list of SKUs and quantities, checks existing product records, increments quantities for existing items, and inserts newly arrived SKUs using `upsert`.

---

#### DAY 11: Delete & Referential Actions
- **Module ID:** `day-11` | **Slug:** `delete-referential-actions` | **Milestone:** `milestone-3` | **Est:** 45 mins
- **Description:** Understand data integrity upon deletion, cascade deletes vs foreign key protection, referential action rules, and the soft-delete pattern.

##### Concept 1: Referential Actions (`onDelete: Cascade`, `SetNull`, `Restrict`)
- **Theory:**
  - `Cascade`: When parent is deleted, all dependent child rows are automatically deleted.
  - `SetNull`: When parent is deleted, child foreign key is set to `null` (requires optional field `userId Int?`).
  - `Restrict`: Database blocks deletion of parent if child records exist.
- **Target Hero:**
  ```prisma
  model Post {
    id       Int       @id @default(autoincrement())
    authorId Int?
    author   User?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
    comments Comment[] // Comments configure onDelete: Cascade in Comment model
  }

  model Comment {
    id     Int  @id @default(autoincrement())
    postId Int
    post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  }
  ```
- **Task 1 (Guided):** Configure `onDelete: Cascade` on the `Order` $\to$ `OrderItem` relation so deleting an order removes its items.
  - *Starter Code:*
    ```prisma
    model OrderItem {
      id      Int   @id @default(autoincrement())
      orderId Int
      order   Order @relation(fields: [orderId], references: [id])
      // Add onDelete: Cascade
    }
    ```
  - *Solution Code:*
    ```prisma
    model OrderItem {
      id      Int   @id @default(autoincrement())
      orderId Int
      order   Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
    }
    ```
  - *Validation:* Relation specifies `onDelete: Cascade`.
- **Task 2 (Independent):** Configure an `Article` relation to use `onDelete: SetNull` when an `Author` is deleted, ensuring articles remain published.
  - *Starter Code:*
    ```prisma
    model Article {
      id       Int     @id @default(autoincrement())
      authorId Int?
      author   Author? @relation(fields: [authorId], references: [id])
      // Configure onDelete: SetNull
    }
    ```
  - *Solution Code:*
    ```prisma
    model Article {
      id       Int     @id @default(autoincrement())
      authorId Int?
      author   Author? @relation(fields: [authorId], references: [id], onDelete: SetNull)
    }
    ```
  - *Validation:* Relation specifies `onDelete: SetNull`.

##### Concept 2: Soft Deletion Pattern
- **Theory:** In production, physical `DELETE` queries destroy financial and audit trails. The soft delete pattern sets `deletedAt: new Date()` and filters queries using `where: { deletedAt: null }`.
- **Target Hero:**
  ```typescript
  // Soft delete execution
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });
  ```
- **Task 1 (Guided):** Implement a soft-delete function that updates `deletedAt` with the current timestamp.
  - *Starter Code:*
    ```typescript
    export async function softDeleteUser(id: number) {
      // Update user setting deletedAt to new Date()
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function softDeleteUser(id: number) {
      return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    }
    ```
  - *Validation:* Updates `deletedAt` field.
- **Task 2 (Independent):** Write a query helper that retrieves active accounts, strictly ensuring `deletedAt: null`.
  - *Starter Code:*
    ```typescript
    export async function getActiveAccounts() {
      // Find all accounts where deletedAt is null
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function getActiveAccounts() {
      return await prisma.account.findMany({
        where: { deletedAt: null }
      });
    }
    ```
  - *Validation:* Filter specifies `deletedAt: null`.

##### Day 11 Final Challenge: GDPR Account Deletion Worker
- **Scenario:** Implement an account deletion service: cascade-delete sensitive user tokens, anonymize forum posts by setting author to `null`, and soft-delete billing transaction history.

---

#### DAY 12: Nested Writes & Transactions
- **Module ID:** `day-12` | **Slug:** `nested-writes-transactions` | **Milestone:** `milestone-3` | **Est:** 55 mins
- **Description:** Perform atomic multi-step operations using nested `create`/`connect`, sequential `$transaction` arrays, and interactive transaction functions.

##### Concept 1: Nested Writes (`create`, `connect`, `connectOrCreate`)
- **Theory:** Prisma allows creating parent and child records in a single operation without manually extracting foreign keys. `connect` links an existing record; `create` makes a new child inline.
- **Target Hero:**
  ```typescript
  const post = await prisma.post.create({
    data: {
      title: 'Prisma v7 Deep Dive',
      author: { connect: { email: 'alex@prisma.io' } },
      tags: {
        create: [{ name: 'typescript' }, { name: 'orm' }]
      }
    }
  });
  ```
- **Task 1 (Guided):** Create a new `Order` with two nested `OrderItem` records in a single `prisma.order.create` call.
  - *Starter Code:*
    ```typescript
    export async function createOrderWithItems(customerId: number, items: { title: string; price: number }[]) {
      return await prisma.order.create({
        // Create order with customerId and nested items
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function createOrderWithItems(customerId: number, items: { title: string; price: number }[]) {
      return await prisma.order.create({
        data: {
          customerId,
          items: {
            create: items
          }
        }
      });
    }
    ```
  - *Validation:* Calls `order.create` with nested `items: { create: ... }`.
- **Task 2 (Independent):** Create a post connecting an existing author by ID and connecting an existing category by ID.
  - *Starter Code:*
    ```typescript
    export async function createConnectedPost(title: string, authorId: number, categoryId: number) {
      // Connect author and category
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function createConnectedPost(title: string, authorId: number, categoryId: number) {
      return await prisma.post.create({
        data: {
          title,
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } }
        }
      });
    }
    ```
  - *Validation:* Uses `connect: { id }` for author and category.

##### Concept 2: ACID Transactions (Sequential vs Interactive)
- **Theory:**
  - *Sequential Transaction:* `prisma.$transaction([op1, op2])`. Executes queries in an array; if any query fails, all are rolled back.
  - *Interactive Transaction:* `prisma.$transaction(async (tx) => { ... })`. Allows subsequent queries to read values from earlier queries while holding the transaction open.
- **Target Hero:**
  ```typescript
  // Interactive transaction for balance transfer
  const transfer = await prisma.$transaction(async (tx) => {
    const sender = await tx.account.findUniqueOrThrow({ where: { id: senderId } });
    if (sender.balance < amount) throw new Error('Insufficient balance');

    await tx.account.update({ where: { id: senderId }, data: { balance: { decrement: amount } } });
    return await tx.account.update({ where: { id: receiverId }, data: { balance: { increment: amount } } });
  });
  ```
- **Task 1 (Guided):** Wrap an inventory decrement and an audit log insertion in a sequential `$transaction` array.
  - *Starter Code:*
    ```typescript
    export async function recordInventoryChange(productId: number, qty: number) {
      // Wrap both updates into prisma.$transaction([ ... ])
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function recordInventoryChange(productId: number, qty: number) {
      return await prisma.$transaction([
        prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } }),
        prisma.auditLog.create({ data: { message: `Decremented product ${productId} by ${qty}` } })
      ]);
    }
    ```
  - *Validation:* Calls `prisma.$transaction` with array of two operations.
- **Task 2 (Independent):** Implement an interactive transaction that books an event seat: checks if seat is available, marks it as booked, and creates a ticket.
  - *Starter Code:*
    ```typescript
    export async function bookSeat(seatId: number, userId: number) {
      return await prisma.$transaction(async (tx) => {
        // 1. Find seat, verify !isBooked
        // 2. Mark seat isBooked = true
        // 3. Create ticket
      });
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function bookSeat(seatId: number, userId: number) {
      return await prisma.$transaction(async (tx) => {
        const seat = await tx.seat.findUniqueOrThrow({ where: { id: seatId } });
        if (seat.isBooked) throw new Error('Seat already booked');

        await tx.seat.update({ where: { id: seatId }, data: { isBooked: true } });
        return await tx.ticket.create({ data: { seatId, userId } });
      });
    }
    ```
  - *Validation:* Uses `prisma.$transaction(async (tx) => ...)` and checks `isBooked`.

##### Day 12 Final Challenge: Multi-Vendor Checkout Engine
- **Scenario:** Build a bulletproof checkout transaction: verify stock for multiple line items, calculate total, decrement stock atomically, create the order with nested items, and log a payment record—guaranteeing 100% rollback if any single item is out of stock.

---

### MILESTONE 4: Production REST APIs & Resilience (Days 13 to 14)

---

#### DAY 13: Errors + Express Error Middleware
- **Module ID:** `day-13` | **Slug:** `errors-and-middleware` | **Milestone:** `milestone-4` | **Est:** 50 mins
- **Description:** Intercept Prisma error codes (`P2002`, `P2025`), prevent leaking database internals, and build clean Express HTTP error middleware.

##### Concept 1: Prisma Error Classification & Error Codes
- **Theory:** Prisma throws typed errors inheriting from `Prisma.PrismaClientKnownRequestError`. Common production error codes:
  - `P2002`: Unique constraint violation (e.g. duplicate email).
  - `P2025`: Record to update or delete not found.
  - `P2003`: Foreign key constraint failed.
- **Target Hero:**
  ```typescript
  import { Prisma } from '@prisma/client';

  try {
    await prisma.user.create({ data: { email: 'duplicate@test.com' } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.error(`Unique constraint failed on: ${error.meta?.target}`);
      }
    }
  }
  ```
- **Task 1 (Guided):** Intercept a `P2002` error when creating a user and return a friendly error message `{ error: "Email already taken" }`.
  - *Starter Code:*
    ```typescript
    export async function safeCreateUser(data: { email: string; name: string }) {
      try {
        return await prisma.user.create({ data });
      } catch (error: any) {
        // Catch P2002 and return { error: "Email already taken" }
      }
    }
    ```
  - *Solution Code:*
    ```typescript
    import { Prisma } from '@prisma/client';

    export async function safeCreateUser(data: { email: string; name: string }) {
      try {
        return await prisma.user.create({ data });
      } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return { error: 'Email already taken' };
        }
        throw error;
      }
    }
    ```
  - *Validation:* Checks `error.code === 'P2002'`.
- **Task 2 (Independent):** Catch `P2025` when deleting a post by ID and return `{ error: "Post not found" }` instead of an unhandled crash.
  - *Starter Code:*
    ```typescript
    export async function safeDeletePost(id: number) {
      // Handle P2025 record not found
    }
    ```
  - *Solution Code:*
    ```typescript
    import { Prisma } from '@prisma/client';

    export async function safeDeletePost(id: number) {
      try {
        return await prisma.post.delete({ where: { id } });
      } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return { error: 'Post not found' };
        }
        throw error;
      }
    }
    ```
  - *Validation:* Checks `error.code === 'P2025'`.

##### Concept 2: Centralized Express Error Middleware
- **Theory:** In production APIs, individual route controllers should never manually format database errors. A centralized Express error middleware intercepts all errors, maps Prisma codes to HTTP status codes (`P2002` $\to$ 409, `P2025` $\to$ 404), and sanitizes messages.
- **Target Hero:**
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  import { Prisma } from '@prisma/client';

  export function prismaErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return res.status(409).json({ error: 'Conflict: Record already exists' });
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not Found: Target record does not exist' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  ```
- **Task 1 (Guided):** Write an Express error handler that converts `P2002` into HTTP 409 and `P2025` into HTTP 404.
  - *Starter Code:*
    ```typescript
    export function errorHandler(err: any, req: any, res: any, next: any) {
      // Implement handler
    }
    ```
  - *Solution Code:*
    ```typescript
    import { Prisma } from '@prisma/client';

    export function errorHandler(err: any, req: any, res: any, next: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          return res.status(409).json({ error: 'Resource already exists' });
        }
        if (err.code === 'P2025') {
          return res.status(404).json({ error: 'Resource not found' });
        }
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
    ```
  - *Validation:* Handles 409 for P2002 and 404 for P2025.
- **Task 2 (Independent):** Extend the middleware to handle Zod validation errors, returning HTTP 400 with field issue details.
  - *Starter Code:*
    ```typescript
    import { ZodError } from 'zod';

    export function extendedErrorHandler(err: any, req: any, res: any, next: any) {
      // Add ZodError handling returning 400
    }
    ```
  - *Solution Code:*
    ```typescript
    import { ZodError } from 'zod';
    import { Prisma } from '@prisma/client';

    export function extendedErrorHandler(err: any, req: any, res: any, next: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ error: 'Validation Error', issues: err.issues });
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'Conflict' });
        if (err.code === 'P2025') return res.status(404).json({ error: 'Not Found' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    ```
  - *Validation:* Catches `ZodError` and returns 400.

##### Day 13 Final Challenge: Production API Error Hardening
- **Scenario:** Harden an Express CRUD router against all failure scenarios: ensure zero internal stack traces leak to the client, database errors map to RFC 7807 problem details, and invalid JSON bodies return 400 Bad Request.

---

#### DAY 14: Production REST API Capstone
- **Module ID:** `day-14` | **Slug:** `production-rest-api` | **Milestone:** `milestone-4` | **Est:** 60 mins
- **Description:** Put everything together to build an enterprise-grade REST API with Express/Next.js, Prisma, Zod, transactions, relations, and centralized error handling.

##### Concept 1: Clean Architecture Layering (Router $\to$ Controller $\to$ Service)
- **Theory:** Scalable applications decouple HTTP transport from database logic:
  1. *Router:* Defines URL paths and HTTP verbs.
  2. *Middleware:* Validates input bodies with Zod.
  3. *Controller:* Handles HTTP request/response formatting.
  4. *Service:* Interacts directly with `PrismaClient`.
- **Target Hero:**
  ```typescript
  // Service Layer: pure database interaction
  export class PostService {
    static async getFeed(cursor?: number, limit = 10) {
      return await prisma.post.findMany({
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
  }
  ```
- **Task 1 (Guided):** Assemble the `PostService.getFeed` method supporting cursor pagination and author data shaping.
  - *Starter Code:*
    ```typescript
    export class PostService {
      static async getFeed(cursor?: number, limit: number = 10) {
        // Implement feed retrieval
      }
    }
    ```
  - *Solution Code:*
    ```typescript
    export class PostService {
      static async getFeed(cursor?: number, limit: number = 10) {
        return await prisma.post.findMany({
          take: limit,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        });
      }
    }
    ```
  - *Validation:* Includes cursor handling, author select, and `orderBy: { createdAt: 'desc' }`.
- **Task 2 (Independent):** Implement `PostService.createPost` accepting validated Zod input and linking tags using `connectOrCreate`.
  - *Starter Code:*
    ```typescript
    export class PostService {
      static async createPost(authorId: number, title: string, tagNames: string[]) {
        // Create post and connect or create tags
      }
    }
    ```
  - *Solution Code:*
    ```typescript
    export class PostService {
      static async createPost(authorId: number, title: string, tagNames: string[]) {
        return await prisma.post.create({
          data: {
            title,
            authorId,
            tags: {
              connectOrCreate: tagNames.map((name) => ({
                where: { name },
                create: { name }
              }))
            }
          },
          include: { tags: true }
        });
      }
    }
    ```
  - *Validation:* Uses `connectOrCreate` for tags array.

##### Concept 2: Full CRUD Lifecycle & Relational Integrity
- **Theory:** Tying together GET (list/detail), POST (creation), PATCH (partial update + atomic counters), and DELETE (referential safety).
- **Target Hero:**
  ```typescript
  // PATCH /api/posts/:id/view - atomic view counter increment
  router.patch('/posts/:id/view', async (req, res, next) => {
    try {
      const updated = await prisma.post.update({
        where: { id: Number(req.params.id) },
        data: { views: { increment: 1 } }
      });
      res.json(updated);
    } catch (err) { next(err); }
  });
  ```
- **Task 1 (Guided):** Write the controller handler for `DELETE /api/posts/:id` that returns 204 No Content on success.
  - *Starter Code:*
    ```typescript
    export async function deletePostHandler(req: any, res: any, next: any) {
      // Implement delete with 204 status
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function deletePostHandler(req: any, res: any, next: any) {
      try {
        await prisma.post.delete({
          where: { id: Number(req.params.id) }
        });
        return res.status(204).send();
      } catch (err) {
        next(err);
      }
    }
    ```
  - *Validation:* Returns status 204, forwards errors to `next`.
- **Task 2 (Independent):** Write the controller handler for `PATCH /api/posts/:id` validating input against `UpdatePostSchema` and updating the post.
  - *Starter Code:*
    ```typescript
    export async function updatePostHandler(req: any, res: any, next: any) {
      // Validate with UpdatePostSchema, update in DB, return 200 JSON
    }
    ```
  - *Solution Code:*
    ```typescript
    export async function updatePostHandler(req: any, res: any, next: any) {
      try {
        const validated = UpdatePostSchema.parse(req.body);
        const updated = await prisma.post.update({
          where: { id: Number(req.params.id) },
          data: validated
        });
        return res.status(200).json(updated);
      } catch (err) {
        next(err);
      }
    }
    ```
  - *Validation:* Validates body, updates record, returns 200.

##### Day 14 Capstone Project: Enterprise Publishing REST API
- **Scenario:** Implement the full backend for `TechPulse Publishing`:
  1. Models: `User`, `Post`, `Category`, `Tag`, `Comment`.
  2. Endpoints:
     - `GET /api/posts`: Cursor pagination, title search, category filter.
     - `POST /api/posts`: Zod validation, nested tags.
     - `GET /api/posts/:id`: Read with author profile and comments.
     - `PATCH /api/posts/:id`: Update with atomic view counter.
     - `DELETE /api/posts/:id`: Cascade delete with 204.
  3. Centralized error middleware handling `P2002`, `P2025`, and `ZodError`.

---

## 6. Automated Curriculum Audit & Verification Script

To guarantee that the curriculum never suffers from missing tasks, broken hints, or incomplete validation rules, any implementation must include an automated verification script: `scripts/verify-curriculum.ts`.

```typescript
// scripts/verify-curriculum.ts
import { ALL_MODULES } from '../src/content/modules';

export function verifyCurriculum() {
  console.log('🔍 Auditing PrismaLens Curriculum...');
  let totalErrors = 0;
  let totalTasks = 0;

  if (ALL_MODULES.length !== 14) {
    console.error(`❌ Expected exactly 14 modules, found ${ALL_MODULES.length}`);
    totalErrors++;
  }

  for (const module of ALL_MODULES) {
    console.log(`Checking Day ${module.day}: ${module.title}`);

    // Check challenge
    if (!module.challenge || module.challenge.tasks.length === 0) {
      console.error(`  ❌ Day ${module.day} is missing its Final Challenge!`);
      totalErrors++;
    } else {
      totalTasks += module.challenge.tasks.length;
    }

    for (const concept of module.concepts) {
      // Check Target Hero
      if (!concept.theory.targetHero || !concept.theory.targetHero.code) {
        console.error(`  ❌ Concept '${concept.id}' is missing its Target Hero code banner!`);
        totalErrors++;
      }

      // Check Task Count (Minimum 2 tasks per concept)
      if (!concept.tasks || concept.tasks.length < 2) {
        console.error(`  ❌ Concept '${concept.id}' has only ${concept.tasks?.length ?? 0} tasks. Minimum required is 2!`);
        totalErrors++;
      }

      for (const task of concept.tasks) {
        totalTasks++;
        if (!task.initialCode && task.initialCode !== '') {
          console.error(`    ❌ Task '${task.id}' is missing initialCode.`);
          totalErrors++;
        }
        if (!task.solutionCode) {
          console.error(`    ❌ Task '${task.id}' is missing solutionCode.`);
          totalErrors++;
        }
        if (!task.hints || task.hints.length === 0) {
          console.error(`    ❌ Task '${task.id}' is missing hints.`);
          totalErrors++;
        }
        if (!task.validation) {
          console.error(`    ❌ Task '${task.id}' is missing validation rules.`);
          totalErrors++;
        }
      }
    }
  }

  console.log(`\nAudit Complete: ${totalTasks} total tasks verified across 14 days.`);
  if (totalErrors > 0) {
    console.error(`💥 Found ${totalErrors} verification errors!`);
    process.exit(1);
  } else {
    console.log('✅ All 14 days passed strict verification with 100% compliance!');
  }
}

verifyCurriculum();
```

---

## 7. Recommended Project File & Folder Structure

```
prismalens/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── scripts/
│   └── verify-curriculum.ts          # Automated curriculum audit script
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── page.tsx                  # Landing page
│   │   ├── roadmap/
│   │   │   └── page.tsx              # 14-Day interactive roadmap view
│   │   ├── learn/
│   │   │   └── [dayId]/
│   │   │       ├── layout.tsx        # Learning workspace layout (Header, split-pane)
│   │   │       ├── page.tsx          # Day redirect / overview
│   │   │       ├── theory/
│   │   │       │   └── [conceptId]/page.tsx  # Theory & step breakdowns
│   │   │       ├── practice/
│   │   │       │   └── [taskId]/page.tsx     # Coding task workspace
│   │   │       ├── challenge/
│   │   │       │   └── page.tsx      # Day Final Challenge
│   │   │       └── complete/
│   │   │           └── page.tsx      # Day completion & XP summary
│   │   └── playground/
│   │       └── page.tsx              # Unrestricted sandbox editor
│   ├── components/
│   │   ├── learning/
│   │   │   ├── TargetHeroBanner.tsx  # Hero code card before theory
│   │   │   ├── StepBreakdownView.tsx # Pedagogical step-by-step cards
│   │   │   ├── TaskInstructions.tsx  # Left panel instruction checklist
│   │   │   ├── MonacoCodeEditor.tsx  # Dual-mode (TS & Prisma) editor
│   │   │   ├── GeneratedSqlLens.tsx  # Tab showing exact SQL generated
│   │   │   ├── TypeInspector.tsx     # Tab showing TypeScript return type
│   │   │   ├── ErdVisualizer.tsx     # Live interactive relation diagram
│   │   │   ├── ResultConsole.tsx     # JSON results & error display
│   │   │   └── ConceptMCQCard.tsx    # Interactive multiple choice questions
│   │   └── layout/
│   │       ├── Header.tsx            # Navigation, streak, XP badge
│   │       └── RoadmapModal.tsx      # Quick jump curriculum modal
│   ├── content/
│   │   ├── modules/
│   │   │   ├── day-01-why-prisma.ts
│   │   │   ├── day-02-setup-v7.ts
│   │   │   ├── day-03-models-enums.ts
│   │   │   ├── day-04-relations.ts
│   │   │   ├── day-05-migrations-seed.ts
│   │   │   ├── day-06-lifecycle.ts
│   │   │   ├── day-07-reading-data.ts
│   │   │   ├── day-08-filtering-pagination.ts
│   │   │   ├── day-09-create-zod.ts
│   │   │   ├── day-10-updates-upserts.ts
│   │   │   ├── day-11-delete-actions.ts
│   │   │   ├── day-12-transactions.ts
│   │   │   ├── day-13-errors-middleware.ts
│   │   │   ├── day-14-rest-api.ts
│   │   │   └── index.ts              # Exports ALL_MODULES
│   │   └── database/
│   │       └── seed-schemas.ts       # Mock SQLite database tables & fixtures
│   ├── lib/
│   │   ├── prisma-engine/
│   │   │   ├── proxy-executor.ts     # In-browser query translator & runner
│   │   │   ├── sql-generator.ts      # Translates Prisma calls into raw SQL
│   │   │   ├── schema-ast-parser.ts  # Parses schema.prisma into ERD models
│   │   │   └── validator.ts          # Evaluates tasks against PrismaValidationRule
│   │   └── progress/
│   │       ├── storage.ts            # LocalStorage & IndexedDB progress cache
│   │       └── state.ts              # Streak, unlocked days, and XP logic
│   └── types/
│       └── curriculum.ts             # All TypeScript contracts from Section 4
```
