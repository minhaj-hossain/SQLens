# Prisma Pedagogy, Explanation Archetypes & Progressive Build Tracker

> Living tracker for overhauling the Prisma curriculum pedagogy across all 14 modules (89 tasks) with tailored explanation archetypes, progressive step-by-step builds, beginner micro-rules ("Little Details"), diff highlighting, and Prisma-native task scaffolding.

---

## Pedagogical Archetypes & Beginner Micro-Details

Every concept across the curriculum is assigned to its optimal explanation archetype:
1. **Progressive Build Archetype** (e.g., Relations, Schema Modeling, Nested Writes): Built step by step from scratch, highlighting what is newly added with `// NEW`, distinguishing physical database storage from virtual code handles, providing plain-English sentence translations, and offering a concrete mental decision model.
2. **Lifecycle & Architecture Archetype** (e.g., Serverless Singleton, Migrations & Shadow DB, Transactions): Focused on connection pooling, request flows, hazards, and transaction boundaries (`BEGIN` $\rightarrow$ `COMMIT`).
3. **Contrast & Decision Matrix Archetype** (e.g., `findUnique` vs `findFirst` vs `findMany`, `select` vs `include`, Implicit vs Explicit M:N): Focused on performance trade-offs, security leaks, index lookups, and deterministic decision rules.
4. **Data-Flow Pipeline Archetype** (e.g., Zod Validation $\rightarrow$ Prisma Write, Error Trapping): Focused on runtime validation, type narrowing, and error status mapping.

### The "Little Details" (Beginner Mental Anchors)
In each concept, essential micro-rules are explicitly taught in a polished, organized box:
- **Foreign Key Naming**: Name after what it points to, plus `Id` (`<relationName>Id`). On `Comment`, it is `postId`, NOT `commentId`.
- **Type Capitalization**: PascalCase types (`Int`, `String`), never lowercase `int` or `string`.
- **Formatting**: One field per line, closing `}` on models and enums.
- **The `?` Placement**: On the type (`bio String?`), never on the field name (`bio? String`).
- **Scope of Attributes**: `@` is field-level (`@id`), `@@` is model-level (`@@unique([a, b])`).
- **`select` vs `include`**: Mutually exclusive at the root level; nested projections belong inside `select`.
- **`findUnique` Contract**: `where` only accepts fields marked `@id` or `@unique`.

> [!NOTE]
> The internal word "ladder" is **strictly omitted** from all student-facing UI and documentation. We use intuitive labels: **"Step-by-step breakdown"**, **"Build it step by step"**, **"Syntax Rules & Conventions"**, and **"How to think through this"**.

---

## Detailed Task Tracker

### Phase 1: UI Foundation & Visual Components (Complete 🟢)
- [x] **Task 1.1: Create `PrismaStepBreakdownCard.tsx`**
  - Path: `src/components/learning/prisma/PrismaStepBreakdownCard.tsx`
  - Features: Line-level diff detection for `// NEW` (green accent `bg-emerald-500/10 border-l-2 border-emerald-500`), physical vs virtual badges (`[DB Column: Physical Storage]` vs `[Virtual Relation: Code Convenience]`), plain-English sentence callouts ("Read this line as...").
- [x] **Task 1.2: Create `PrismaLittleDetailsCard.tsx`**
  - Path: `src/components/learning/prisma/PrismaLittleDetailsCard.tsx`
  - Features: Clean, numbered chips for micro-rules (FK naming rule `<relationName>Id`, PascalCase types, `@` vs `@@`, one field per line).
- [x] **Task 1.3: Create `SqlPrismaBridgeCard.tsx`**
  - Path: `src/components/learning/prisma/SqlPrismaBridgeCard.tsx`
  - Features: Side-by-side SQL $\leftrightarrow$ Prisma syntax token comparison, flags `(no database equivalent)` fields.
- [x] **Task 1.4: Create `PrismaMentalModelCard.tsx`**
  - Path: `src/components/learning/prisma/PrismaMentalModelCard.tsx`
  - Features: "How to think through this" card with bidirectional sentence tests, 4-step ordered decision checklist, and `npx prisma format` tooling pro-tips.
- [x] **Task 1.5: Create `PrismaTaskHeaderMeta.tsx`**
  - Path: `src/components/learning/prisma/PrismaTaskHeaderMeta.tsx`
  - Features: Replaces SQL metadata (`TABLE: users | COLUMNS: id, name`) with Prisma-native context (`MODEL: Post | FOCUS: authorId FK | TARGET: schema.prisma`).
- [x] **Task 1.6: UI Integration**
  - Paths: `src/components/learning/ConceptLessonView.tsx` & `src/components/learning/TaskInstructions.tsx`
  - Embed the new cards cleanly with zero regressions on SQL track lessons. Pass 21/21 vitest, 89/89 audit, clean build.

---

### Phase 2: Schema Modeling & Relations Overhaul (Milestone 1: Days 1–4) (Complete 🟢)
- [x] **Task 2.1: Day 4 Concept 1 (1:N Relations)**
  - Path: `src/content/prisma/modules/prisma-04-relations.ts`
  - Content: 4-step progressive build (Unlinked $\rightarrow$ `authorId Int` $\rightarrow$ `author User @relation(...)` $\rightarrow$ `posts Post[]`), bidirectional sentence check, 4-question decision tree, FK naming rule (`<relationName>Id`), SQL bridge table.
- [x] **Task 2.2: Day 4 Concept 2 (1:1 Relations)**
  - Path: `src/content/prisma/modules/prisma-04-relations.ts`
  - Content: 1:N base $\rightarrow$ add `@unique` to foreign key $\rightarrow$ optional back-relation `Profile?`.
- [x] **Task 2.3: Day 4 Concept 3 (M:N Relations)**
  - Path: `src/content/prisma/modules/prisma-04-relations.ts`
  - Content: Contrast matrix comparing implicit convenience tables against explicit join models with custom columns.
- [x] **Task 2.4: Day 4 Task 1 Refactoring (`prisma04-c1-t1`)**
  - Retarget Task 1 to **Active Schema Construction**: learner defines `authorId Int` and `@relation` in `schema.prisma`. Shift query loading with `include` to Task 2.
- [x] **Task 2.5: Day 3 (Models & Constraints)**
  - Path: `src/content/prisma/modules/prisma-03-models-constraints.ts`
  - Content: Progressive build for scalar types, primary keys, nullability (`?` on type), `@` vs `@@` scope rule, and enum formatting (no quotes/commas).
- [x] **Task 2.6: Days 1 & 2 (Why Prisma & Setup)**
  - Paths: `src/content/prisma/modules/prisma-01-why-prisma.ts` & `prisma-02-setup-connection.ts`
  - Content: Contrast matrix for raw SQL vs Prisma and progressive build for `schema.prisma` anatomy. Pass 21/21 vitest, 89/89 audit, clean build.

---

### Phase 3: Querying, Lifecycle & Pagination Overhaul (Milestone 2: Days 5–8) (Complete 🟢)
- [x] **Task 3.1: Day 6 (Client Lifecycle & Serverless Pooling)**
  - Path: `src/content/prisma/modules/prisma-06-client-lifecycle.ts`
  - Content: Serverless connection exhaustion lifecycle diagram, `globalThis` singleton scoping rule, and PgBouncer configuration.
- [x] **Task 3.2: Day 7 (Reading Data & Projections)**
  - Path: `src/content/prisma/modules/prisma-07-reading-data.ts`
  - Content: Uniqueness decision matrix (`findUnique` requires `@id`/`@unique`), `select` vs `include` mutual exclusivity rule, and payload typing.
- [x] **Task 3.3: Day 8 (Filtering & Pagination)**
  - Path: `src/content/prisma/modules/prisma-08-filtering-pagination.ts`
  - Content: Defensive filter parameter guarding (`undefined` vs `null` hazard card), cursor pagination with `skip: 1` duplicate prevention rule.
- [x] **Task 3.4: Day 5 (Migrations & Seeding)**
  - Path: `src/content/prisma/modules/prisma-05-migrations-seeding.ts`
  - Content: Shadow database lifecycle flowchart and migration replay breakdown.

---

### Phase 4: Mutations, Transactions & Production Polish (Milestone 3 & 4: Days 9–14) (Complete 🟢)
- [x] **Task 4.1: Day 9 (Create & Zod Validation)**
  - Path: `src/content/prisma/modules/prisma-09-create-zod.ts`
  - Content: `create` vs `createMany` throughput, Zod boundary validation pipeline, typed micro-rules, SQL bridge, and decision tree.
- [x] **Task 4.2: Day 10 (Update & Upsert)**
  - Path: `src/content/prisma/modules/prisma-10-update-upsert.ts`
  - Content: Atomic counter increment race condition breakdown, `update` (unique) vs `updateMany` (non-unique) rule, and upsert contract matrix.
- [x] **Task 4.3: Day 11 (Deletes & Cascades)**
  - Path: `src/content/prisma/modules/prisma-11-delete-cascades.ts`
  - Content: Referential actions decision tree (`onDelete: Cascade` vs `SetNull` vs `Restrict`) and soft delete tombstone lifecycle.
- [x] **Task 4.4: Day 12 (Transactions)**
  - Path: `src/content/prisma/modules/prisma-12-nested-transactions.ts`
  - Content: Sequential batching vs interactive closure lifecycle, `tx` parameter invariants, nested writes, and rollback boundaries.
- [x] **Task 4.5: Day 13 (Errors & Extensions)**
  - Path: `src/content/prisma/modules/prisma-13-errors-middleware.ts`
  - Content: KnownRequestError code discrimination (P2002/P2025/P2003), route perimeter error trapping, and `$extends` computed result fields.
- [x] **Task 4.6: Day 14 (API Capstone)**
  - Path: `src/content/prisma/modules/prisma-14-api-capstone.ts`
  - Content: End-to-end production service synthesis, 5 query families, deterministic paginated projections, and raw SQL escape hatch.

---

### Phase 5: Automated Verification & CI Parity (Complete 🟢)
- [x] **Task 5.1: Curriculum Content Suite**
  ```powershell
  npx vitest run tests/tracks/prisma-curriculum-content.test.ts
  ```
- [x] **Task 5.2: Complete Grading Pipeline Audit (All 89 Tasks)**
  ```powershell
  npm run audit:prisma-grading-pipeline
  ```
- [x] **Task 5.3: Production Build & Typecheck**
  ```powershell
  npm run build
  ```
