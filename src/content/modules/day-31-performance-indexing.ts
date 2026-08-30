import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 31 (id: day-21, frozen legacy ID) — Performance & Indexing
// -----------------------------------------------------------------------------
// REWORKED by the atomic-rule review: the original single-concept day (B-trees
// + EXPLAIN + ACID + N+1 in one go) is split into three atomic concepts —
//   1. The problem: full table scans
//   2. The tool: indexes & reading EXPLAIN (lookup vs scan)
//   3. The loop: EXPLAIN → CREATE INDEX → EXPLAIN
// ACID/live transactions now live in their own module (dml-transactions);
// the N+1 discussion lives in the Backend API project day.
// The EXPLAIN output is the real engine simulation (docs/DIALECT.md §6) —
// type ALL → ref / range → const as indexes are created and dropped.
// =============================================================================
export const Day_31_MODULE: ModuleData = {
  id: 'day-21',
  slug: 'performance-indexing',
  day: 21,
  title: 'Day 31 — Performance, Indexing & EXPLAIN',
  shortTitle: 'Performance & Indexing',
  type: 'conceptual_session',
  milestoneId: 'milestone-3',
  description:
    'Discover why queries get slow (full table scans), learn the mental model of index lookups, read EXPLAIN plans like a DBA, and run the optimization loop: EXPLAIN → CREATE INDEX → EXPLAIN.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Explain why a full table scan is O(N) and when it becomes a bottleneck',
    'Read an EXPLAIN plan: type ALL / ref / range / const, possible_keys, key, rows',
    'Create a B-tree index and watch the plan type change in the real engine simulation',
  ],
  concepts: [
    {
      id: 'perf-scan-problem',
      order: 1,
      title: '1. The Problem: Full Table Scans',
      shortDescription: 'Why SQL slows down when it reads every row.',
      theory: {
        summary: 'Your queries feel instant on 28 products. Real tables hold millions of rows. When SQL needs rows that match a condition, it can read every row one by one — a full table scan, O(N) — or jump straight to the right rows — an index lookup, O(log N). Before you meet indexes, see the slow way for what it is: a scan reads EVERY row, and EXPLAIN is the tool that tells you when it happens.',
        introTable: {
          tableName: 'products',
          description: 'Answering WHERE price > 50 with no index means inspecting every row.',
          columns: ['name', 'price', 'examined?'],
          rows: [
            ['Wireless Mouse', 15.99, 'checked'],
            ['Mechanical Keyboard', 65.00, 'checked'],
            ['USB-C Charging Cable', 9.99, 'checked'],
            ['Office Chair', 120.00, 'checked'],
            ['... 24 more rows', '...', 'checked'],
          ],
        },
        explanation: [
          'A full table scan visits rows top-to-bottom, from the first to the last, testing the WHERE condition on every single row.',
          '```sql\nSELECT * FROM products WHERE price > 50;\n```',
          'Without an index SQL has no idea which rows are expensive, so it examines all 28 rows and keeps the 7 that match. With 28 million rows, that is 28 million examinations.',
          'QUESTION_BLOCK::SCAN::How many rows does a full table scan examine?',
          'You can see it happen: prefix any query with **EXPLAIN** and the first result column, `type`, reports the access method. `type: ALL` is the database saying "I scanned the whole table".',
        ],
        targetQuery: {
          sql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
          explanation: 'The engine reports a full scan (type: ALL) because no index helps this filter.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: EXPLAIN prefaces the real query',
            sqlSnippet: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
            explanation: 'EXPLAIN does not return data — it returns a plan. Your later query runs exactly as written.',
            tableData: {
              tableName: 'EXPLAIN output',
              columns: ['table', 'type', 'key', 'rows'],
              rows: [['products', 'ALL', 'null', '28']],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The filter targets price, but price has no index',
            sqlSnippet: 'WHERE price > 50',
            explanation: 'The PRIMARY index only helps product_id lookups. Nothing shortens a price search.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: type: ALL = full table scan',
            sqlSnippet: 'type: ALL · key: null · rows: 28',
            explanation: 'key is null (no index used) and rows estimates 28 — the whole table is examined. This is the flag to look for.',
          },
        ],
        keyTakeaway: 'A full table scan reads every row (O(N)). EXPLAIN reporting type: ALL is the warning flag that a scan happened.',
        exampleQuery: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
        exampleQueryExplanation: 'The plan row returns type ALL, key NULL, rows 28 — a full scan of products.',
        mcqs: [
          {
            question: 'In an EXPLAIN plan, what does type: ALL mean?',
            options: ['The query returned every column', 'The engine scanned the whole table row by row', 'The query used an index', 'The query is still running'],
            correctIndex: 1,
            explanation: 'type ALL = full table scan: every row examined with no index.',
          },
          {
            question: 'A products table grows from 28 rows to 28 million. A scan that took 0.1 ms now takes roughly…',
            options: ['The same time (scans ignore table size)', 'About a million times longer', 'Exactly 1 second', 'Half the time'],
            correctIndex: 1,
            explanation: 'Scans are O(N): a million times more rows means a million times more work.',
          },
        ],
      },
      tasks: [
        {
          id: 'perf-c1-t1',
          title: 'Task 1 (Guided): Confirm a scan on the whole products table',
          description: 'Run EXPLAIN on a query that reads all of products. You should see type: ALL and key: null.',
          instructions: ['Run `EXPLAIN SELECT * FROM products;`.', 'Look at the plan row: type ALL, key null, rows 28.', 'End with a semicolon.'],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- See how the engine plans a whole-table read\nEXPLAIN SELECT * FROM products;',
          solutionSql: 'EXPLAIN SELECT * FROM products;',
          solutionExplanation: 'No filter and no index — the plan is a full scan (ALL).',
          hints: [{ level: 1, text: 'Prefix the SELECT with EXPLAIN: EXPLAIN SELECT * FROM products;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows', 'possible_keys'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'ALL' && row.key == null
                ? { valid: true }
                : { valid: false, message: `Expected a full scan (type: ALL, key: null). You got type: ${row?.type ?? '?'}, key: ${row?.key ?? '?'}.` };
            },
          },
          successMessage: 'Confirmed — type ALL means the whole table is being scanned.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'perf-c1-t2',
          title: 'Task 2 (Independent): A filtered query can still scan',
          description: 'Even with a WHERE clause, a column without an index causes a scan. Run EXPLAIN on WHERE price > 50 and confirm type stays ALL.',
          instructions: ['Run `EXPLAIN SELECT * FROM products WHERE price > 50;`.', 'price has no index yet, so SQL still examines all 28 rows.', 'End with a semicolon.'],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- price has no index: expect ALL\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
          solutionExplanation: 'The WHERE clause constrains rows, but without an index on price SQL scans the whole table.',
          hints: [{ level: 1, text: 'EXPLAIN SELECT * FROM products WHERE price > 50;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'ALL' && row.key == null
                ? { valid: true }
                : { valid: false, message: `Expected a full scan (type: ALL, key: null). You got type: ${row?.type ?? '?'}, key: ${row?.key ?? '?'}.` };
            },
          },
          successMessage: 'Right — a WHERE clause is not enough; without an index SQL still scans the whole table.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'perf-index-lookup',
      order: 2,
      title: '2. The Tool: Indexes & Reading the Plan',
      shortDescription: 'Jump straight to the right rows with a B-tree index.',
      theory: {
        summary: 'A full scan is slow at scale. The fix is an index: a tiny, ordered structure of (column value → row pointer) that lets SQL jump straight to matching rows without scanning. Every PRIMARY KEY already has one — and EXPLAIN shows the difference: const / ref / range mean "index used", ALL means "scanned".',
        introTable: {
          tableName: 'index on supplier_id',
          description: 'A B-tree index works like a textbook index: ordered keys that point to rows. Lookups jump in O(log N) instead of scanning all N.',
          columns: ['supplier_id (key)', 'row pointer'],
          rows: [
            [1, 'Row 1, 7, 21'],
            [2, 'Row 3, 12, 19'],
            [3, 'Row 5, 9, 25'],
          ],
        },
        explanation: [
          'An index stores chosen column values in sorted order, each pointing back to its row. To find supplier_id = 2, SQL drops into the tree, lands on the "2" entry, and jumps to those rows — it never touches the rows in between.',
          '```sql\nEXPLAIN SELECT * FROM products WHERE product_id = 7;\n```',
          'The products primary key ships with a PRIMARY index automatically. An equality lookup on a unique index reports `type: const`, `key: PRIMARY`, `rows: 1` — one row examined, not 28.',
          'Plan types at a glance: **const** (unique equality), **ref** (non-unique equality on an index), **range** (BETWEEN / > / < on an index), **ALL** (full scan).',
          'Read `possible_keys` as "candidate indexes", `key` as "the one actually used", and `rows` as "estimated rows examined".',
        ],
        targetQuery: {
          sql: 'EXPLAIN SELECT * FROM products WHERE product_id = 7;',
          explanation: 'A primary-key lookup is the cheapest possible plan: const, key PRIMARY, rows 1.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The WHERE targets the primary key',
            sqlSnippet: 'WHERE product_id = 7',
            explanation: 'The PRIMARY index was created automatically when the table was built. Its keys are the product_id values.',
            tableData: {
              tableName: 'EXPLAIN output',
              columns: ['table', 'type', 'key', 'rows'],
              rows: [['products', 'const', 'PRIMARY', '1']],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SQL jumps straight to the key',
            sqlSnippet: 'type: const',
            explanation: 'const means the lookup hits at most one matching unique row.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Check the plan columns',
            sqlSnippet: 'possible_keys: PRIMARY · key: PRIMARY · rows: 1',
            explanation: 'PRIMARY was the only candidate and it was used; exactly 1 row was examined.',
          },
        ],
        keyTakeaway: 'An index turns O(N) scans into O(log N) jumps. EXPLAIN reveals which happened: const / ref / range = index used, ALL = scan.',
        exampleQuery: 'EXPLAIN SELECT * FROM products WHERE product_id = 7;',
        exampleQueryExplanation: 'Plan shows type const, key PRIMARY, rows 1 — a direct indexed lookup.',
        mcqs: [
          {
            question: 'What is the difference between key and possible_keys in an EXPLAIN row?',
            options: ['They are identical', 'possible_keys are candidates; key is the index actually used', 'key lists all columns; possible_keys lists all indexes', 'key is always PRIMARY'],
            correctIndex: 1,
            explanation: 'possible_keys = options SQL could use; key = the one it actually chose.',
          },
          {
            question: 'Which plan type means "non-unique index used for an equality filter"?',
            options: ['ALL', 'const', 'ref', 'range'],
            correctIndex: 2,
            explanation: 'ref = non-unique equality on an indexed column. const = unique (PK) equality. range = ordered comparison.',
          },
        ],
      },
      tasks: [
        {
          id: 'perf-c2-t1',
          title: 'Task 1 (Guided): A PRIMARY KEY lookup — the cheapest plan',
          description: 'Run EXPLAIN on a product_id = 7 lookup and confirm the PK index is used (type: const, key: PRIMARY, rows: 1).',
          instructions: ['Run `EXPLAIN SELECT * FROM products WHERE product_id = 7;`.', 'Check: type const, key PRIMARY, rows 1.', 'End with a semicolon.'],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- A PRIMARY KEY lookup\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE product_id = 7;',
          solutionExplanation: 'The PK index answers product_id = 7 directly — 1 row examined.',
          hints: [{ level: 1, text: 'EXPLAIN SELECT * FROM products WHERE product_id = 7;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows', 'possible_keys'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'const' && String(row.key).toUpperCase() === 'PRIMARY' && row.rows === 1
                ? { valid: true }
                : { valid: false, message: `Expected an indexed unique lookup (type: const, key: PRIMARY, rows: 1). You got type: ${row?.type ?? '?'}, key: ${row?.key ?? '?'}.` };
            },
          },
          successMessage: 'const + PRIMARY + rows 1 — SQL jumped straight to the single matching row.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'perf-c2-t2',
          title: 'Task 2 (Independent): Create an index and watch the plan change',
          description: 'supplier_id has no index yet. Create one, then re-explain a supplier lookup — the plan should flip from ALL to ref.',
          instructions: ['First run `CREATE INDEX idx_products_supplier ON products(supplier_id);`.', 'Then run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.', 'The plan now shows type: ref and key: idx_products_supplier.'],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Create the index, then inspect the plan\nCREATE INDEX idx_products_supplier ON products(supplier_id);\nEXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
          solutionSql: 'CREATE INDEX idx_products_supplier ON products(supplier_id);\nEXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
          solutionExplanation: 'The new index turns the supplier filter from a scan (ALL) into a lookup (ref).',
          hints: [{ level: 1, text: 'CREATE INDEX idx_products_supplier ON products(supplier_id); then EXPLAIN SELECT * FROM products WHERE supplier_id = 2;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows', 'possible_keys'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'ref' && row.key === 'idx_products_supplier'
                ? { valid: true }
                : { valid: false, message: `After creating the index, the supplier lookup should be ref with key idx_products_supplier. You got type: ${row?.type ?? '?'}, key: ${row?.key ?? '?'}. Did you CREATE INDEX before EXPLAIN?` };
            },
          },
          successMessage: 'ALL → ref. One CREATE INDEX changed how SQL finds these rows.',
        },
      ],
    },
    {
      id: 'perf-optimization-loop',
      order: 3,
      title: '3. The Loop: EXPLAIN → CREATE INDEX → EXPLAIN',
      shortDescription: 'The DBA workflow for tuning a slow query.',
      theory: {
        summary: 'Fixing a slow query is a repeatable loop: EXPLAIN it, spot type: ALL on a filtered column, create an index on that exact column, then EXPLAIN again to verify the plan changed (ALL → ref / range). Clean up with DROP INDEX when you want to undo. Indexes are not free — every INSERT / UPDATE must maintain them — so index the columns your filters actually use.',
        introTable: {
          tableName: 'plan before / after',
          description: 'The same query before and after adding an index on supplier_id.',
          columns: ['phase', 'type', 'key', 'rows'],
          rows: [
            ['Before', 'ALL', 'null', '28'],
            ['After', 'ref', 'idx_products_supplier', '7'],
          ],
        },
        explanation: [
          'The loop, step by step:',
          '1️⃣ `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;` → type ALL → a scan.',
          '2️⃣ `CREATE INDEX idx_products_supplier ON products(supplier_id);`',
          '3️⃣ `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;` → type ref, key idx_products_supplier, rows 7.',
          '```sql\nCREATE INDEX idx_products_supplier ON products(supplier_id);\nEXPLAIN SELECT * FROM products WHERE supplier_id = 2;\n```',
          'To undo, run `DROP INDEX idx_products_supplier ON products;` and the plan returns to ALL.',
          'One rule: `DROP INDEX` on an index that does not exist is an error — drop exactly what you created, in order.',
        ],
        targetQuery: {
          sql: 'CREATE INDEX idx_products_supplier ON products(supplier_id);\nEXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
          explanation: 'The full two-step loop in one script: create the index, then confirm the plan changed.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Spot the scan',
            sqlSnippet: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
            explanation: 'Before the index: type ALL, rows 28.',
            tableData: {
              tableName: 'EXPLAIN output',
              columns: ['table', 'type', 'key', 'rows'],
              rows: [['products', 'ALL', 'null', '28']],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Create the index',
            sqlSnippet: 'CREATE INDEX idx_products_supplier ON products(supplier_id);',
            explanation: 'supplier_id is the column the WHERE actually filters on — a perfect index target.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Re-explain to confirm the change',
            sqlSnippet: 'type: ref · key: idx_products_supplier',
            explanation: 'The plan now proves the index is used. That evidence is the whole point of the loop.',
            tableData: {
              tableName: 'EXPLAIN output',
              columns: ['table', 'type', 'key', 'rows'],
              rows: [['products', 'ref', 'idx_products_supplier', '7']],
            },
          },
        ],
        keyTakeaway: 'The optimization loop is EXPLAIN → CREATE INDEX → EXPLAIN: confirm the scan, add the index, then prove the plan changed.',
        exampleQuery: 'CREATE INDEX idx_products_supplier ON products(supplier_id);\nEXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
        exampleQueryExplanation: 'Creates the index, then shows the plan flipped to ref — the loop in action.',
        mcqs: [
          {
            question: 'After DROP INDEX removes idx_products_supplier, what does the supplier query plan become?',
            options: ['ref forever', 'ALL again', 'range', 'rows becomes 0'],
            correctIndex: 1,
            explanation: 'Without the index the supplier filter scans again: type ALL returns.',
          },
          {
            question: 'Why not create an index on every column?',
            options: ['Indexes are completely free', 'Every write must maintain each index, so too many slow down INSERT / UPDATE', 'Indexes only work on numbers', 'SQL refuses more than one index'],
            correctIndex: 1,
            explanation: 'Each index costs write-time and storage. Index the columns you actually filter on.',
          },
        ],
      },
      tasks: [
        {
          id: 'perf-c3-t1',
          title: 'Task 1 (Guided): Run the loop on a category filter',
          description: 'category_id has no index. Create one and prove the plan changed: ALL → ref.',
          instructions: ['Run `CREATE INDEX idx_products_category ON products(category_id);`.', 'Then `EXPLAIN SELECT * FROM products WHERE category_id = 1;`.', 'Confirm type: ref with key: idx_products_category.'],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Optimize the category filter\nCREATE INDEX idx_products_category ON products(category_id);\nEXPLAIN SELECT * FROM products WHERE category_id = 1;',
          solutionSql: 'CREATE INDEX idx_products_category ON products(category_id);\nEXPLAIN SELECT * FROM products WHERE category_id = 1;',
          solutionExplanation: 'The category index turns the scan into a ref lookup.',
          hints: [{ level: 1, text: 'CREATE INDEX idx_products_category ON products(category_id); then EXPLAIN SELECT * FROM products WHERE category_id = 1;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'ref' && row.key === 'idx_products_category'
                ? { valid: true }
                : { valid: false, message: `Expected type ref with key idx_products_category after creating the index. You got ${row?.type ?? '?'}/${row?.key ?? '?'}.` };
            },
          },
          successMessage: 'Loop executed — the category filter is now ref, not ALL.',
        },
        {
          id: 'perf-c3-t2',
          title: 'Task 2 (Independent): Convert a range scan into range',
          description: 'The price > 50 filter was ALL earlier. Create an index on price and watch type become range.',
          instructions: ['Run `CREATE INDEX idx_products_price ON products(price);`.', 'Then `EXPLAIN SELECT * FROM products WHERE price > 50;`.', 'An ordered index turns a > / < / BETWEEN filter into type: range.'],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- price: ALL → range\n',
          solutionSql: 'CREATE INDEX idx_products_price ON products(price);\nEXPLAIN SELECT * FROM products WHERE price > 50;',
          solutionExplanation: 'The price index turns the ordered filter into a range scan — much cheaper than ALL.',
          hints: [{ level: 1, text: 'CREATE INDEX idx_products_price ON products(price); then EXPLAIN SELECT * FROM products WHERE price > 50;' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['type', 'key', 'rows'],
            expectedRowCount: 1,
            customValidator: (parsed: any, result: any) => {
              const row = result?.rows?.[0];
              return row && row.type === 'range' && row.key === 'idx_products_price'
                ? { valid: true }
                : { valid: false, message: `Expected type range with key idx_products_price after indexing price. You got ${row?.type ?? '?'}/${row?.key ?? '?'}. Equality → ref; ordered comparisons → range.` };
            },
          },
          successMessage: 'ALL → range. Ordered filters love ordered indexes.',
        },
      ],
    },
    ],

  // ===========================================================================
  // DAY 31 CHALLENGE: PERFORMANCE & INDEXING LAB (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-21-homework',
    title: 'Day 31 — Performance & Indexing Lab (Ending Activity)',
    scenario: 'You are the DBA on call. A slow dashboard query filters orders by customer_id. Run the full optimization loop: confirm the scan, add the index, watch the plan change, clean it up, then verify a PRIMARY KEY lookup stays fast.',
    tasks: [
      {
        id: 'perf-hw-1',
        title: 'Task 1: Confirm the slow query scans (orders.customer_id)',
        description: 'Run EXPLAIN on a customer_id filter in orders. There is no index on customer_id → you should see type: ALL.',
        instructions: ['Run `EXPLAIN SELECT * FROM orders WHERE customer_id = 3;`.', 'Confirm type: ALL, key: null (customer_id has no index).'],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Step 1: confirm the scan\n',
        solutionSql: 'EXPLAIN SELECT * FROM orders WHERE customer_id = 3;',
        solutionExplanation: 'Before any index, customer_id filters scan the whole orders table.',
        hints: [{ level: 1, text: 'EXPLAIN SELECT * FROM orders WHERE customer_id = 3;' }],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['type', 'key', 'rows', 'possible_keys'],
          expectedRowCount: 1,
          customValidator: (parsed: any, result: any) => {
            const row = result?.rows?.[0];
            return row && row.type === 'ALL' && row.key == null
              ? { valid: true }
              : { valid: false, message: `Expected a baseline scan (type: ALL, key: null). Got ${row?.type ?? '?'}/${row?.key ?? '?'}.` };
          },
        },
        successMessage: 'Baseline captured: orders.customer_id scans.',
        databaseLifecycle: 'fresh',
      },
      {
        id: 'perf-hw-2',
        title: 'Task 2: Create the index on orders.customer_id',
        description: 'CREATE INDEX idx_orders_customer ON orders(customer_id), then EXPLAIN the same query — type must become ref.',
        instructions: ['Run `CREATE INDEX idx_orders_customer ON orders(customer_id);`.', 'Then `EXPLAIN SELECT * FROM orders WHERE customer_id = 3;`.', 'Expect type: ref, key: idx_orders_customer.'],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Step 2: create + confirm\n',
        solutionSql: 'CREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN SELECT * FROM orders WHERE customer_id = 3;',
        solutionExplanation: 'The new index turns the filter from a scan into a ref lookup.',
        hints: [{ level: 1, text: 'CREATE INDEX idx_orders_customer ON orders(customer_id); then EXPLAIN SELECT * FROM orders WHERE customer_id = 3;' }],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['type', 'key', 'rows'],
          expectedRowCount: 1,
          customValidator: (parsed: any, result: any) => {
            const row = result?.rows?.[0];
            return row && row.type === 'ref' && row.key === 'idx_orders_customer'
              ? { valid: true }
              : { valid: false, message: `Expected ref with key idx_orders_customer. Got ${row?.type ?? '?'}/${row?.key ?? '?'}.` };
          },
        },
        successMessage: 'ALL → ref on orders.customer_id.',
        databaseLifecycle: 'inherit',
      },
      {
        id: 'perf-hw-3',
        title: 'Task 3: Clean up — DROP the index and confirm reversion',
        description: 'Drop the index you just created (state carries over between tasks), then EXPLAIN again. The plan must return to ALL.',
        instructions: ['Run `DROP INDEX idx_orders_customer ON orders;`.', 'Then `EXPLAIN SELECT * FROM orders WHERE customer_id = 3;`.', 'type must flip back to ALL — the loop is reversible.'],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Step 3: drop + confirm\n',
        solutionSql: 'DROP INDEX idx_orders_customer ON orders;\nEXPLAIN SELECT * FROM orders WHERE customer_id = 3;',
        solutionExplanation: 'Removing the index restores the scan plan.',
        hints: [{ level: 1, text: 'DROP INDEX idx_orders_customer ON orders; then EXPLAIN SELECT * FROM orders WHERE customer_id = 3;' }],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['type', 'key', 'rows'],
          expectedRowCount: 1,
          customValidator: (parsed: any, result: any) => {
            const row = result?.rows?.[0];
            return row && row.type === 'ALL' && row.key == null
              ? { valid: true }
              : { valid: false, message: `After DROP INDEX the plan should return to ALL / key null. Got ${row?.type ?? '?'}/${row?.key ?? '?'}. Did you drop the exact index you created?` };
          },
        },
        successMessage: 'Reversible loop complete — DROP INDEX brought the scan back.',
        databaseLifecycle: 'inherit',
      },
      {
        id: 'perf-hw-4',
        title: 'Task 4: Prove a PRIMARY KEY lookup never needed a custom index',
        description: 'orders.order_id is the primary key — show its plan is const / PRIMARY without any custom index.',
        instructions: ['Run `EXPLAIN SELECT * FROM orders WHERE order_id = 3;`.', 'Expect type: const, key: PRIMARY, rows: 1.'],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Step 4: PK lookup\n',
        solutionSql: 'EXPLAIN SELECT * FROM orders WHERE order_id = 3;',
        solutionExplanation: 'The PK auto-index answers directly.',
        hints: [{ level: 1, text: 'EXPLAIN SELECT * FROM orders WHERE order_id = 3;' }],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['type', 'key', 'rows'],
          expectedRowCount: 1,
          customValidator: (parsed: any, result: any) => {
            const row = result?.rows?.[0];
            return row && row.type === 'const' && String(row.key).toUpperCase() === 'PRIMARY'
              ? { valid: true }
              : { valid: false, message: `Expected const with key PRIMARY. Got ${row?.type ?? '?'}/${row?.key ?? '?'}.` };
          },
        },
        successMessage: 'PRIMARY KEY = automatic index. const + rows 1 — the cheapest plan.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};