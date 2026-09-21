import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 51 — Reading Query Plans (id: day-51 — order 51)
// Milestone 4, Phase 4: Diagnose Then Scale
//   C1 Anatomy of a Query Plan (type, key, rows, Extra)
//   C2 From Table Scan to Index Seek (ALL vs range/ref)
//   C3 Instant Lookups with type = const (Primary & Unique Keys)
// =============================================================================
export const Day_51_MODULE: ModuleData = {
  id: 'day-51',
  slug: 'reading-query-plans',
  day: 51,
  title: 'Day 51 — Reading Query Plans',
  shortTitle: 'Query Plans & EXPLAIN',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Writing SQL is only half the craft. Understanding HOW the database engine actually executes your query is what prevents production outages. With EXPLAIN, you peek under the hood to see whether the database is scanning every row or doing an instant index lookup.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Run EXPLAIN before any SELECT query to inspect its execution strategy',
    'Identify full table scans (type = ALL) and know when they indicate a missing index',
    'Recognize index scans (type = range, ref, const) and check which key was chosen',
    'Understand estimated rows and cost metrics reported in query plans',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Anatomy of a Query Plan
    // -------------------------------------------------------------------------
    {
      id: 'plan-anatomy',
      order: 1,
      title: 'Anatomy of a Query Plan',
      shortDescription: 'How to read the columns produced by the EXPLAIN command.',
      theory: {
        summary:
          'When you prepend EXPLAIN to a SELECT query, the database does not return data. Instead, it reports its planned execution strategy — which tables it accesses, what indexes it considered, and how many rows it expects to inspect.',
        explanation: [
          'Every SQL query gets compiled by a query optimizer before running. The optimizer chooses the fastest way to fetch the data based on available indexes and table statistics.',
          'Key columns in MySQL / standard EXPLAIN output:',
          '- `table`: The table being accessed.',
          '- `type`: The join / access type. This is the MOST IMPORTANT column! From best to worst:',
          '  - `const`: 1-row lookup via Primary Key or UNIQUE index (fastest possible).',
          '  - `eq_ref`: 1-row lookup per parent row in a join.',
          '  - `ref`: Non-unique index lookup (matches multiple rows).',
          '  - `range`: Index range scan (e.g. `price > 30`, `BETWEEN`, `IN`).',
          '  - `index`: Full index scan (scans the whole index tree).',
          '  - `ALL`: Full table scan (reads every single row from disk — slowest!).',
          '- `possible_keys`: Indexes the optimizer considered using.',
          '- `key`: The actual index chosen (or NULL if scanning the whole table).',
          '- `rows`: Estimated number of rows the engine expects to examine.',
          '- `Extra`: Helpful details (e.g. `Using where`, `Using index`, `Using filesort`).',
          'QUESTION_BLOCK::BEFORE::If an EXPLAIN plan shows type = ALL and key = NULL, what does that mean?',
          'QUESTION_BLOCK::AFTER::The database had to read every single row in the table because no usable index existed for that query filter.',
        ],
        syntaxBlocks: [
          {
            title: 'Using EXPLAIN',
            sql: '-- Inspect the plan for any query:\nEXPLAIN SELECT * FROM products WHERE price > 30;\n\n-- In PostgreSQL / modern engines:\n-- EXPLAIN ANALYZE SELECT * FROM products WHERE price > 30;',
            description:
              'Place EXPLAIN right before the SELECT statement. The engine returns the plan without returning customer or product data.',
          },
        ],
        keyTakeaway:
          'EXPLAIN shows how the database will execute your query. The type column tells you the access method — ALL means a full table scan, while ref, range, and const mean index usage.',
        exampleQuery:
          'EXPLAIN SELECT product_id, name, price FROM products WHERE price > 40;',
        exampleQueryExplanation:
          'Because price is not currently indexed, this query plan shows type = ALL and key = NULL, meaning the database inspects all 28 rows.',
        liveDemoSql:
          'EXPLAIN SELECT product_id, name FROM products WHERE price > 20;',
        liveDemoNotes:
          'Notice type is ALL, possible_keys is NULL, and rows shows all table rows.',
        mcqs: [
          {
            question: 'Which access type indicates that the database is reading every row in the table from disk?',
            options: [
              'A. const — single row lookup',
              'B. range — scans an index interval',
              'C. ALL — full table scan',
              'D. ref — non-unique index scan',
            ],
            correctIndex: 2,
            explanation:
              'type = ALL is the full table scan. The database must read every row from the table heap because no suitable index was available.',
          },
        ],
        commonMistakes: [
          'Assuming a query is fast because it returns quickly on a tiny dev database with 20 rows — on production with 20 million rows, type = ALL causes severe slowdowns.',
          'Ignoring the key column — possible_keys shows candidates, but key shows what was actually used.',
        ],
      },
      tasks: [
        {
          id: 'day51-t1',
          title: 'Inspect an Unindexed Query with EXPLAIN',
          description:
            'Use EXPLAIN to inspect the execution plan for an unindexed filter on the products table.',
          instructions: [
            'Write EXPLAIN SELECT * FROM products WHERE price > 30',
            'Observe that the plan reports type = ALL and key = NULL',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Inspect the query plan for a price filter\n\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE price > 30;',
          solutionExplanation:
            'The optimizer has no index on price, so it plans a full table scan (type = ALL, key = NULL, inspecting all rows).',
          hints: [
            { level: 1, text: 'Prepend EXPLAIN to the SELECT query.' },
            { level: 2, text: 'EXPLAIN SELECT * FROM products WHERE price > 30;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 1 },
          successMessage: 'You inspected the plan! Notice type = ALL and key = NULL — a textbook full table scan.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — From Table Scan to Index Seek
    // -------------------------------------------------------------------------
    {
      id: 'index-adoption',
      order: 2,
      title: 'Turning Table Scans into Index Seeks',
      shortDescription: 'Create an index and verify with EXPLAIN that the optimizer adopts it.',
      theory: {
        summary:
          'Adding an index gives the optimizer a fast binary-search or B-tree path. When you create an index on a filtered column, subsequent EXPLAIN plans switch from ALL to range or ref.',
        explanation: [
          'An index is like an alphabetized index in the back of a book. Without it, you have to read the book page by page (ALL). With it, you jump directly to the target entries (range or ref).',
          'Comparing access types after indexing:',
          '- Equality filter (`WHERE category_id = 1`) on a secondary index -> `type = ref`',
          '- Range filter (`WHERE price > 30`, `BETWEEN`, `IN (...)`) -> `type = range`',
          'Notice how the rows estimate drops: instead of scanning 100% of rows, the database only scans the matching subset.',
          'QUESTION_BLOCK::BEFORE::Why does WHERE price > 30 produce type = range instead of ref?',
          'QUESTION_BLOCK::AFTER::Because it is an inequality filter (>). An inequality spans an interval or range of keys in the B-tree index, so the access method is range.',
        ],
        syntaxBlocks: [
          {
            title: 'Creating an index and checking adoption',
            sql: 'CREATE INDEX idx_products_price ON products (price);\nEXPLAIN SELECT * FROM products WHERE price > 30;',
            description:
              'After creating the index, EXPLAIN shows key = idx_products_price and type = range instead of ALL.',
          },
        ],
        keyTakeaway:
          'Creating an index on frequently filtered columns changes the access plan from a full scan (ALL) to an index scan (range or ref), dramatically reducing rows inspected.',
        exampleQuery:
          'CREATE INDEX idx_products_cat ON products (category_id);\nEXPLAIN SELECT * FROM products WHERE category_id = 2;',
        exampleQueryExplanation:
          'After indexing category_id, the plan selects key = idx_products_cat with type = ref.',
        liveDemoSql:
          'CREATE INDEX idx_prod_price ON products (price);\nEXPLAIN SELECT * FROM products WHERE price > 30;',
        liveDemoNotes:
          'See how key changed from NULL to idx_prod_price and type is now range.',
        mcqs: [
          {
            question: 'After adding an index on price, a query with WHERE price BETWEEN 10 AND 50 runs. What type is expected?',
            options: [
              'A. ALL — still scans the whole table',
              'B. const — matches only one row',
              'C. range — scans the bounded interval in the index',
              'D. index_merge — joins two indexes',
            ],
            correctIndex: 2,
            explanation:
              'BETWEEN is a range comparison. The optimizer traverses the B-tree to the lower bound and walks to the upper bound, which is type = range.',
          },
        ],
        commonMistakes: [
          'Creating an index on a column that is never filtered in WHERE or JOIN — indexes cost write overhead on every INSERT/UPDATE/DELETE.',
          'Assuming the optimizer always uses an index — if a table is very small or if a query matches >30% of all rows, the optimizer may still choose a sequential scan because it is faster than random index lookups.',
        ],
      },
      tasks: [
        {
          id: 'day51-t2',
          title: 'Create an Index and Verify Plan Improvement',
          description:
            'Create an index on the products price column, then run EXPLAIN to prove the engine switches from ALL to range.',
          instructions: [
            'Create an index named idx_prod_price on products (price)',
            'Run EXPLAIN SELECT * FROM products WHERE price > 30',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Create an index on price and inspect the improved plan\n\n\n',
          solutionSql:
            'CREATE INDEX idx_prod_price ON products (price);\nEXPLAIN SELECT * FROM products WHERE price > 30;',
          solutionExplanation:
            'Creating the index allows the optimizer to use a range scan on idx_prod_price, avoiding a full table scan.',
          hints: [
            { level: 1, text: 'Use CREATE INDEX idx_prod_price ON products (price); then EXPLAIN SELECT ...' },
            { level: 2, text: 'CREATE INDEX idx_prod_price ON products (price);\nEXPLAIN SELECT * FROM products WHERE price > 30;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 1 },
          successMessage: 'Great job! The plan now uses idx_prod_price with type = range!',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Primary Key and Unique Lookups
    // -------------------------------------------------------------------------
    {
      id: 'const-lookups',
      order: 3,
      title: 'Instant Lookups: type = const',
      shortDescription: 'The fastest access method in relational databases.',
      theory: {
        summary:
          'When you query by a table\'s PRIMARY KEY or a UNIQUE column with an equality filter (=), the database knows in advance that at most ONE row can match. This is type = const — an instant, constant-time lookup.',
        explanation: [
          'The optimizer treats `const` queries as having a cost of essentially zero. Because the key is unique, once the row is found, search stops immediately.',
          'Characteristics of `type = const`:',
          '- `key`: PRIMARY (or the unique constraint name)',
          '- `rows`: 1',
          '- `type`: const',
          'Every well-designed table has a PRIMARY KEY precisely so single-entity lookups (`WHERE id = ?`) run at `const` speed.',
          'QUESTION_BLOCK::BEFORE::Why does WHERE id = 5 give type = const, but WHERE id > 5 does not?',
          'QUESTION_BLOCK::AFTER::Because WHERE id = 5 can match AT MOST ONE row by definition of a primary key. WHERE id > 5 can match many rows, so it requires an index range scan (type = range).',
        ],
        syntaxBlocks: [
          {
            title: 'Primary Key lookup plan',
            sql: 'EXPLAIN SELECT * FROM customers WHERE customer_id = 3;',
            description:
              'Filtering by primary key equality produces type = const and rows = 1.',
          },
        ],
        keyTakeaway:
          'type = const is the holy grail of access types. It occurs when filtering by primary key or unique key equality, guaranteeing a single-row lookup in constant time.',
        exampleQuery:
          'EXPLAIN SELECT * FROM categories WHERE category_id = 2;',
        exampleQueryExplanation:
          'category_id is the primary key of categories, so the plan reports type = const, key = PRIMARY, and rows = 1.',
        liveDemoSql:
          'EXPLAIN SELECT * FROM categories WHERE category_id = 1;',
        liveDemoNotes:
          'Inspect the output: key is PRIMARY and rows is 1.',
        mcqs: [
          {
            question: 'What access type does EXPLAIN show when you filter on a PRIMARY KEY column using = ?',
            options: [
              'A. ALL',
              'B. range',
              'C. const',
              'D. ref',
            ],
            correctIndex: 2,
            explanation:
              'Equality lookups on unique or primary keys always resolve to type = const because at most one row can ever match.',
          },
        ],
        commonMistakes: [
          'Using a function on the primary key in WHERE (e.g. WHERE UPPER(code) = ...), which disables the index and drops type back down to ALL.',
        ],
      },
      tasks: [
        {
          id: 'day51-t3',
          title: 'Observe a type = const Lookup',
          description:
            'Run an EXPLAIN query looking up a category by its primary key category_id to observe the const access type.',
          instructions: [
            'Write EXPLAIN SELECT * FROM categories WHERE category_id = 1',
          ],
          type: 'independent',
          primaryTable: 'categories',
          setupSql: '',
          initialSql: '-- Inspect a Primary Key lookup\n',
          solutionSql: 'EXPLAIN SELECT * FROM categories WHERE category_id = 1;',
          solutionExplanation:
            'Because category_id is the PRIMARY KEY, the optimizer plans a type = const lookup inspecting exactly 1 row.',
          hints: [
            { level: 1, text: 'Use EXPLAIN SELECT * FROM categories WHERE category_id = 1;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 1 },
          successMessage: 'type = const! The database uses the PRIMARY key index to fetch the row instantly.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day51-challenge',
    title: 'Diagnose and Index an Analytics Bottleneck',
    scenario:
      'The customer support dashboard is running slow when searching for customers by city. Your job is to inspect the unindexed plan, add an index, and verify that the optimizer adopts it.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day51-ch1',
        title: 'Optimize the Customer City Filter',
        description:
          'Create an index on the customers table for the city column, then run an EXPLAIN query filtering by city to verify the index is used.',
        instructions: [
          'CREATE INDEX idx_customers_city ON customers (city)',
          "EXPLAIN SELECT * FROM customers WHERE city = 'Dhaka'",
        ],
        type: 'challenge',
        primaryTable: 'customers',
        setupSql: '',
        initialSql: '-- Create an index on customers.city and verify with EXPLAIN\n\n\n',
        solutionSql:
          "CREATE INDEX idx_customers_city ON customers (city);\nEXPLAIN SELECT * FROM customers WHERE city = 'Dhaka';",
        solutionExplanation:
          'Creating idx_customers_city allows the engine to do an index lookup (type = ref) on Dhaka instead of scanning all customer records.',
        hints: [
          { level: 1, text: 'First CREATE INDEX idx_customers_city ON customers (city);' },
          { level: 2, text: "Then EXPLAIN SELECT * FROM customers WHERE city = 'Dhaka';" },
        ],
        validation: { requireSelect: true, expectedRowCount: 1 },
        successMessage: 'The city search is now optimized! The query plan uses idx_customers_city with type = ref.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
