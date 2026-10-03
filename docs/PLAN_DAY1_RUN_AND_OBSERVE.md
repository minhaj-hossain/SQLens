# Day 1 Guided "Run & Observe" Track & Implementation Plan

> **Document Status:** Approved Design / Execution Spec  
> **Target Module:** [`src/content/prisma/modules/prisma-01-why-prisma.ts`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/content/prisma/modules/prisma-01-why-prisma.ts)  
> **Related Design Map:** [`docs/PRISMA_CURRICULUM_REVIEW.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/PRISMA_CURRICULUM_REVIEW.md)  
> **Pedagogical Strategy:** Option A — "Run & Observe" Guided First Touch  

---

## 1. Context & Pedagogical Justification

### The Core Problem in Current Day 1
In the current curriculum, Day 1 introduces learners to the conceptual benefits of an ORM over raw SQL strings ("From Raw SQL Strings to Type-Safe Reads"). However, the very first interactive task immediately demands that a beginner write multi-argument Prisma syntax from scratch:
- Changing method invocations (`findMany` → `findUnique`)
- Constructing query objects (`where: { id: userId }`)
- Projecting fields (`select: { id: true, name: true, email: true }`)

Before learners have even observed what a returned Prisma object looks like or felt the compiler/runtime feedback loop, they face cold-start syntax errors. Furthermore, deep syntax for `findUnique` and `select` is formally introduced later in the track (Day 7).

### The "Run & Observe" Solution (Option A)
The onboarding interaction should lower cognitive friction while maximizing immediate value:
1. **First Touch:** Provide a 100% working query. The learner clicks **Run Query** and immediately inspects the typed JSON output and the generated SQL in the SQL Lens.
2. **Minimal Modification:** The learner makes a targeted, single-attribute adjustment (e.g. toggling a column or adjusting an argument) with instantaneous feedback.
3. **Scaffolded Progression:**
   - **Task 1 (Introduce):** Working query provided. Learner runs it, observes output, and adds a single field (`email: true`) to the existing select projection.
   - **Task 2 (Practice):** Pre-written query with a single diagnostic error (e.g., mistyped property or invalid field name) that TypeScript highlights. Learner fixes the typo to observe autocompletion / compile-time safety.
   - **Challenge (Assess):** A self-contained, minimal lookup that reinforces the two concepts learned without asking for unintroduced advanced options.

---

## 2. Detailed Task Specification

### Task 1: "First Touch — Run, Observe & Expand Selection" (`prisma01-c1-t1`)

* **Learning Objective:** Run your first Prisma query, see that it returns typed objects (not raw tuples), and add one field to the returned object.
* **Skill Type:** `introduce`
* **Grading Type:** `executable`
* **Starter Code (`initialCode`):**
  ```typescript
  export async function getUserById(userId: number) {
    // 1. Click "Run" to see the generated SQL and returned object!
    // 2. Then add `email: true` inside `select` to include the user's email.
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    });
  }
  ```
* **Solution Code (`solutionCode`):**
  ```typescript
  export async function getUserById(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
  ```
* **Validation Spec:**
  - `targetModel`: `'user'`
  - `requiredMethod`: `'findUnique'`
  - `requiredFieldsInSelect`: `['id', 'name', 'email']`
  - `requiredWhereClauses`: `['id']`
  - `expectedRowCount`: 1
* **SQL Parallel (`initialSql` / `solutionSql`):**
  - Initial: `SELECT id, name FROM users WHERE id = 1;`
  - Solution: `SELECT id, name, email FROM users WHERE id = 1;`
* **Why this works:** The user is guaranteed instant success on their first click. To pass, they only type `email: true,`, experiencing the `select` projection mental model without syntax overwhelm.

---

### Task 2: "Catching Runtime Errors at Compile Time" (`prisma01-c1-t2`)

* **Learning Objective:** Experience Prisma's type safety. In raw SQL, querying an invalid column fails at runtime or returns `undefined`. In Prisma, the IDE flags non-existent schema fields immediately.
* **Skill Type:** `practice`
* **Grading Type:** `executable`
* **Scenario:** A developer accidentally queried `user_email` (which does not exist on the Prisma schema).
* **Starter Code (`initialCode`):**
  ```typescript
  export async function getActiveMember(email: string) {
    // Notice how the schema only knows `email`, not `user_email`.
    // Fix the property name in `where` so the query succeeds!
    return await prisma.user.findUnique({
      where: { user_email: email } as any,
      select: {
        id: true,
        email: true,
      },
    });
  }
  ```
* **Solution Code (`solutionCode`):**
  ```typescript
  export async function getActiveMember(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });
  }
  ```
* **Validation Spec:**
  - `targetModel`: `'user'`
  - `requiredMethod`: `'findUnique'`
  - `requiredFieldsInSelect`: `['id', 'email']`
  - `requiredWhereClauses`: `['email']`
  - `expectedRowCount`: 1
* **Why this works:** Directly connects back to the theory point: *"Raw drivers allow typo bugs into production; Prisma catches them at compile time."*

---

### Challenge Task: "Safe Member Lookup" (`prisma01-hw-1`)

* **Learning Objective:** Combine the two skills: query by a unique field and select only necessary properties to protect sensitive data.
* **Skill Type:** `assess`
* **Grading Type:** `executable`
* **Starter Code (`initialCode`):**
  ```typescript
  export async function lookupMember(email: string) {
    // Complete the lookup for a user by email, selecting only `id` and `email`
    return await prisma.user.findUnique({
      where: { email },
      select: {
        // Choose the fields to return
      },
    });
  }
  ```
* **Solution Code (`solutionCode`):**
  ```typescript
  export async function lookupMember(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });
  }
  ```
* **Validation Spec:**
  - `targetModel`: `'user'`
  - `requiredMethod`: `'findUnique'`
  - `requiredFieldsInSelect`: `['id', 'email']`
  - `forbiddenFieldsInSelect`: `['name']`
  - `requiredWhereClauses`: `['email']`
  - `expectedRowCount`: 1
* **Why this works:** Doesn't leave the user with an empty method body. Provides the structural shell (`where: { email }`) and prompts for the safe projection.

---

## 3. Tracker & Milestone Integration

| ID | Item | Target File | Type | Expected Status |
|:---:|---|---|:---:|:---:|
| **P0-A** | Day 1 Task 1 Run & Observe Transition | `src/content/prisma/modules/prisma-01-why-prisma.ts` | Executable | Planned |
| **P0-B** | Day 1 Task 2 Scaffolded Type Fix | `src/content/prisma/modules/prisma-01-why-prisma.ts` | Executable | Planned |
| **P0-C** | Day 1 Challenge Scaffold Polish | `src/content/prisma/modules/prisma-01-why-prisma.ts` | Executable | Planned |

---

## 4. Verification & Testing Plan

1. **Unit / Integration Tests:**
   - Execute test suite targeting Day 1 module validations:
     `npm test` or `npx vitest run src/content/prisma/__tests__/prisma-01.test.ts`
2. **Interactive UI Verification:**
   - Launch local development server (`npm run dev`).
   - Open Day 1 Concept 1.
   - Verify that clicking "Run Query" on Task 1 immediately executes, populates the result table/JSON view, and displays the generated SQL lens without throwing.
   - Verify that adding `email: true` triggers the green pass state.
   - Verify hint progression and error messaging.
