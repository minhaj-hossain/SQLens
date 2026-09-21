import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 52 — Composite & Covering Indexes (id: day-52 — order 52)
// Milestone 4, Phase 4: Diagnose Then Scale
//   C1 The Leftmost Prefix Rule (multi-column index hierarchy)
//   C2 Leftmost Prefix in Action (reusing composite indexes)
//   C3 Covering Indexes (eliminating table lookups)
// =============================================================================
export const Day_52_MODULE: ModuleData = {
  id: 'day-52',
  slug: 'composite-covering-indexes',
  day: 52,
  title: 'Day 52 — Composite & Covering Indexes',
  shortTitle: 'Composite & Covering Indexes',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Single-column indexes can only take you so far. Real applications often filter by multiple criteria — like finding electronics priced under $50. A composite index indexes multiple columns together in a specific order. Master the Leftmost Prefix Rule and learn how covering indexes can eliminate table lookups altogether.',
  estimatedMinutes: 65,
  completionLearnings: [
    'Create composite (multi-column) indexes for queries that filter on multiple columns',
    'Apply the Leftmost Prefix Rule to predict whether an index will be used',
    'Understand why column ordering matters in a composite index',
    'Design covering indexes where all requested columns live in the index itself',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — The Leftmost Prefix Rule
    // -------------------------------------------------------------------------
    {
      id: 'composite-indexes',
      order: 1,
      title: 'Multi-Column Indexes & The Leftmost Prefix Rule',
      shortDescription: 'How indexes on multiple columns work, and why column order is everything.',
      theory: {
        summary:
          'A composite index is an index on two or more columns. The database sorts entries by the first column, then by the second within matching values of the first. Because of this sorting, the index can only be used if your query filters on the leftmost columns.',
        explanation: [
          'Think of a phone directory: names are sorted by `(last_name, first_name)`.',
          '- Can you quickly find all people with `last_name = "Smith"`? Yes! (Leftmost column)',
          '- Can you quickly find `last_name = "Smith" AND first_name = "John"`? Yes! (Both columns)',
          '- Can you quickly find all people with `first_name = "John"`? No! You would have to scan the entire phonebook from start to finish.',
          'This is the **Leftmost Prefix Rule**:',
          'An index on `(colA, colB, colC)` can accelerate queries filtering on:',
          '1. `colA`',
          '2. `colA AND colB`',
          '3. `colA AND colB AND colC`',
          'It CANNOT be used to jump to records when querying `colB` alone or `colC` alone.',
          'QUESTION_BLOCK::BEFORE::If you have an index on (status, created_at), will a query filtering ONLY on created_at use this index efficiently?',
          'QUESTION_BLOCK::AFTER::No. Because created_at is the second column, without a filter on status the database cannot use the index to seek directly to the rows.',
        ],
        syntaxBlocks: [
          {
            title: 'Creating a composite index',
            sql: 'CREATE INDEX idx_products_cat_price ON products (category_id, price);\n\n-- Uses the index:\nSELECT * FROM products WHERE category_id = 1 AND price < 30;\n\n-- Also uses the index (leftmost prefix):\nSELECT * FROM products WHERE category_id = 1;\n\n-- Does NOT use the index for seeking:\n-- SELECT * FROM products WHERE price < 30;',
            description:
              'Specify multiple columns inside parentheses, separated by commas. Put the most selective equality column first.',
          },
        ],
        keyTakeaway:
          'Column order in composite indexes matters. The index sorts by column 1, then column 2. Queries must filter on the leftmost column to take advantage of index seeks.',
        exampleQuery:
          'CREATE INDEX idx_prod_cat_price ON products (category_id, price);\nEXPLAIN SELECT * FROM products WHERE category_id = 1 AND price <= 25;',
        exampleQueryExplanation:
          'Both category_id and price match the composite index, allowing the engine to filter both dimensions at index speed.',
        liveDemoSql:
          'CREATE INDEX idx_cp ON products (category_id, price);\nEXPLAIN SELECT * FROM products WHERE category_id = 1 AND price <= 20;',
        liveDemoNotes:
          'The plan shows key = idx_cp and type = ref.',
        mcqs: [
          {
            question: 'An index is created on (country, city, postal_code). Which WHERE clause CANNOT use this index for seeking?',
            options: [
              'A. WHERE country = "BD"',
              'B. WHERE country = "BD" AND city = "Dhaka"',
              'C. WHERE city = "Dhaka" AND postal_code = "1200"',
              'D. WHERE country = "BD" AND city = "Dhaka" AND postal_code = "1200"',
            ],
            correctIndex: 2,
            explanation:
              'Option C skips the leftmost column (country). Without country, the B-tree cannot be navigated from the root.',
          },
        ],
        commonMistakes: [
          'Creating two separate single-column indexes on (colA) and (colB) instead of one composite index (colA, colB) — a composite index is significantly faster for queries that filter on both.',
          'Putting a range column before an equality column — always put equality columns first, then range columns.',
        ],
      },
      tasks: [
        {
          id: 'day52-t1',
          title: 'Create a Composite Index and Filter on Both Columns',
          description:
            'Create a composite index on products covering category_id and price, then write a query that filters on both columns.',
          instructions: [
            'Create an index named idx_cat_price on products (category_id, price)',
            'SELECT * FROM products WHERE category_id = 1 AND price < 30',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Create composite index and filter on both columns\n\n\n',
          solutionSql:
            'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT * FROM products WHERE category_id = 1 AND price < 30;',
          solutionExplanation:
            'The composite index indexes category_id and price together, speeding up this multi-column filter.',
          hints: [
            { level: 1, text: 'Use CREATE INDEX idx_cat_price ON products (category_id, price); then SELECT * ...' },
            { level: 2, text: 'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT * FROM products WHERE category_id = 1 AND price < 30;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Composite index created! Both category_id and price are now indexed together.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Leftmost Prefix in Action
    // -------------------------------------------------------------------------
    {
      id: 'prefix-reuse',
      order: 2,
      title: 'Reusing a Composite Index via Leftmost Prefix',
      shortDescription: 'A composite index on (A, B) eliminates the need for a separate index on (A).',
      theory: {
        summary:
          'Because the composite index is sorted primarily by column A, any query that filters ONLY on column A can use the composite index just as effectively as a standalone index on (A). You do not need both!',
        explanation: [
          'A common database anti-pattern is creating redundant indexes:',
          '- Index 1: `(category_id)`',
          '- Index 2: `(category_id, price)`',
          'Index 1 is 100% redundant! Index 2 already supports any query filtering on `category_id`. Eliminating Index 1 saves disk space and speeds up INSERT/UPDATE operations.',
          'QUESTION_BLOCK::BEFORE::If a table has an index on (user_id, status, created_at), do you need a separate index on (user_id)?',
          'QUESTION_BLOCK::AFTER::No! user_id is the leftmost column of the composite index, so queries on user_id alone will happily use the composite index.',
        ],
        syntaxBlocks: [
          {
            title: 'Querying only the leftmost prefix',
            sql: '-- Reusing (category_id, price) when only filtering on category_id:\nSELECT * FROM products WHERE category_id = 2;',
            description:
              'The optimizer uses the first column of the composite index to find matching rows instantly.',
          },
        ],
        keyTakeaway:
          'A composite index on (A, B) already serves as an index on (A). Do not create duplicate single-column indexes on the leading column.',
        exampleQuery:
          'SELECT product_id, name, price FROM products WHERE category_id = 3;',
        exampleQueryExplanation:
          'Even though price is not specified, category_id is the leading column of the composite index, so search is fast.',
        liveDemoSql:
          'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT product_id, name, price FROM products WHERE category_id = 1;',
        liveDemoNotes:
          'The query succeeds using the leftmost prefix of idx_cat_price.',
        mcqs: [
          {
            question: 'You have an index on (department_id, hire_date). Which separate index is redundant?',
            options: [
              'A. (hire_date)',
              'B. (department_id)',
              'C. (salary)',
              'D. None — both are needed',
            ],
            correctIndex: 1,
            explanation:
              'An index on (department_id) is redundant because (department_id, hire_date) already begins with department_id.',
          },
        ],
        commonMistakes: [
          'Creating single-column indexes on every column in a table "just in case" — this bloats index storage and slows writes.',
        ],
      },
      tasks: [
        {
          id: 'day52-t2',
          title: 'Query Using the Leftmost Column Alone',
          description:
            'Create the composite index on (category_id, price), then write a query that filters ONLY on category_id to demonstrate leftmost prefix usage.',
          instructions: [
            'Create index idx_cat_price on products (category_id, price)',
            'SELECT product_id, name, category_id, price FROM products WHERE category_id = 2',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Filter only on the leading column of the composite index\n\n\n',
          solutionSql:
            'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT product_id, name, category_id, price FROM products WHERE category_id = 2;',
          solutionExplanation:
            'The composite index serves queries on category_id alone because category_id is the leftmost column in the index definition.',
          hints: [
            { level: 1, text: 'Create idx_cat_price on products (category_id, price), then SELECT ... WHERE category_id = 2' },
            { level: 2, text: 'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT product_id, name, category_id, price FROM products WHERE category_id = 2;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Leftmost prefix query successful! The single composite index handles both single and multi-column lookups.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Covering Indexes
    // -------------------------------------------------------------------------
    {
      id: 'covering-indexes',
      order: 3,
      title: 'Covering Indexes: Zero Heap Lookups',
      shortDescription: 'When the index contains every column the query needs, the table itself is never touched.',
      theory: {
        summary:
          'Normally, an index lookup finds matching row pointers, then visits the main table ("heap") to read the remaining columns. A covering index contains ALL columns requested in the SELECT statement, so the database can answer the query entirely from the index.',
        explanation: [
          'In standard EXPLAIN plans, a covering index shows `Extra: Using index` (or in Postgres, `Index Only Scan`).',
          'Benefits of a covering index:',
          '1. **Zero random I/O**: The database reads sequential index blocks and never looks up the table rows.',
          '2. **Cache efficiency**: Indexes are much smaller than full tables and fit easily into RAM (buffer pool).',
          '3. **Maximum throughput**: High-frequency APIs often use covering indexes to serve hundreds of thousands of requests per second.',
          'QUESTION_BLOCK::BEFORE::If a query is `SELECT name, price FROM products WHERE category_id = 1`, what columns must the covering index include?',
          'QUESTION_BLOCK::AFTER::All three: category_id, name, and price. If even one requested column is missing from the index, the engine must look up the table row.',
        ],
        syntaxBlocks: [
          {
            title: 'Covering index pattern',
            sql: '-- Index contains all projected and filtered columns:\nCREATE INDEX idx_prod_cat_price ON products (category_id, price);\n\n-- Query requests ONLY columns present in the index:\nSELECT category_id, price FROM products WHERE category_id = 1;',
            description:
              'Because category_id and price are both in the index, the query can be satisfied 100% from index data.',
          },
        ],
        keyTakeaway:
          'A covering index contains all columns requested by a query. The database answers the query directly from the index without reading table rows.',
        exampleQuery:
          'SELECT category_id, price FROM products WHERE category_id = 1 AND price > 15;',
        exampleQueryExplanation:
          'Only category_id and price are selected, matching the columns stored in idx_prod_cat_price.',
        liveDemoSql:
          'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT category_id, price FROM products WHERE category_id = 1;',
        liveDemoNotes:
          'The engine serves this directly from the index entries.',
        mcqs: [
          {
            question: 'What is the primary advantage of a covering index over a regular index?',
            options: [
              'A. It allows duplicate values in primary keys',
              'B. It eliminates the need to visit the table heap to fetch unindexed columns',
              'C. It automatically partitions the table',
              'D. It disables locking during transactions',
            ],
            correctIndex: 1,
            explanation:
              'A covering index contains all requested columns, avoiding the secondary lookup into the table storage (heap).',
          },
        ],
        commonMistakes: [
          'Writing `SELECT *` on queries intended to be covering — `SELECT *` fetches all columns, which almost always forces a table lookup.',
        ],
      },
      tasks: [
        {
          id: 'day52-t3',
          title: 'Execute a Covering Query',
          description:
            'Create the composite index on (category_id, price), then write a covering query that selects ONLY those two columns.',
          instructions: [
            'Create index idx_cat_price on products (category_id, price)',
            'SELECT category_id, price FROM products WHERE category_id = 1',
          ],
          type: 'independent',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Select only indexed columns for a covering query\n',
          solutionSql:
            'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT category_id, price FROM products WHERE category_id = 1;',
          solutionExplanation:
            'Because only category_id and price are in the SELECT and WHERE, the database can answer the query purely from the index.',
          hints: [
            { level: 1, text: 'Do not use SELECT * — select only category_id, price.' },
            { level: 2, text: 'CREATE INDEX idx_cat_price ON products (category_id, price);\nSELECT category_id, price FROM products WHERE category_id = 1;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Covering index query complete! Only the index was needed to return the results.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day52-challenge',
    title: 'Order Lookup Acceleration',
    scenario:
      'The orders table receives heavy traffic searching for orders by customer and status. Design an optimal composite index that satisfies both filters in one seek.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day52-ch1',
        title: 'Build and Query a Composite Index on Orders',
        description:
          'Create a composite index named idx_orders_cust_status on orders (customer_id, status), then query all delivered orders for customer_id = 1.',
        instructions: [
          'CREATE INDEX idx_orders_cust_status ON orders (customer_id, status)',
          "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered'",
        ],
        type: 'challenge',
        primaryTable: 'orders',
        setupSql: '',
        initialSql: '-- Create composite index on orders and run the targeted query\n\n\n',
        solutionSql:
          "CREATE INDEX idx_orders_cust_status ON orders (customer_id, status);\nSELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered';",
        solutionExplanation:
          'The composite index pairs customer_id with status, allowing the engine to pinpoint customer 1 delivered orders directly.',
        hints: [
          { level: 1, text: 'Put customer_id first in the index column list, followed by status, and separate the DDL statement from your SELECT with a semicolon (;).' },
          { level: 2, text: "CREATE INDEX idx_orders_cust_status ON orders (customer_id, status);\nSELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered';" },
        ],
        validation: { requireSelect: true, expectedRowCount: { min: 1 } },
        successMessage: 'Challenge complete! The orders table now has an optimal composite index for customer status queries.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
