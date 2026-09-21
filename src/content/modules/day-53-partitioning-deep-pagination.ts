import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 53 — Partitioning & Deep Pagination (id: day-53 — order 53)
// Milestone 4, Phase 4: Diagnose Then Scale
//   C1 Why OFFSET Breaks at Scale (the O(N) hidden cost)
//   C2 Keyset (Cursor) Pagination (O(1) constant-time seeks)
//   C3 Partitioning Schemes & Partition Pruning
// =============================================================================
export const Day_53_MODULE: ModuleData = {
  id: 'day-53',
  slug: 'partitioning-deep-pagination',
  day: 53,
  title: 'Day 53 — Deep Pagination & Table Partitioning',
  shortTitle: 'Pagination & Partitioning',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Why does LIMIT 20 OFFSET 50000 take 5 seconds to load? Why does page 1 load in 2ms while page 500 crashes your server? In this module, you will uncover the hidden O(N) cost of OFFSET, learn the industry-standard Keyset (Cursor) pagination technique, and explore how table partitioning divides massive datasets into manageable slices.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Explain why LIMIT ... OFFSET degrades linearly as page depth increases',
    'Implement Keyset (Cursor-based) pagination using indexed WHERE id > ? filters',
    'Achieve constant-time O(1) pagination at any depth (page 1 or page 10,000)',
    'Understand table partitioning schemes (RANGE, LIST, HASH) and partition pruning',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Why OFFSET Breaks at Scale
    // -------------------------------------------------------------------------
    {
      id: 'offset-limitation',
      order: 1,
      title: 'The Hidden Cost of OFFSET',
      shortDescription: 'Why LIMIT 10 OFFSET 10000 reads and discards 10,000 rows.',
      theory: {
        summary:
          'When you run `LIMIT 10 OFFSET 1000`, the database does NOT jump to row 1001. It must read, sort, and process all 1,000 preceding rows, only to throw them away and return the remaining 10. As OFFSET increases, queries get slower and slower.',
        explanation: [
          'Consider flipping through a physical ledger. If someone asks for page 500, a naive reader starts at page 1 and counts 499 pages before looking at page 500.',
          'Under the hood with OFFSET:',
          '- `LIMIT 10 OFFSET 0` -> Reads 10 rows. Fast! (1ms)',
          '- `LIMIT 10 OFFSET 10,000` -> Reads 10,010 rows, throws away 10,000. Slow! (150ms)',
          '- `LIMIT 10 OFFSET 1,000,000` -> Reads 1,000,010 rows, throws away 1,000,000. Out of memory! (5000ms+)',
          'This is why modern feeds (Twitter, Instagram, Slack) never use page numbers — they use cursor-based pagination.',
          'QUESTION_BLOCK::BEFORE::If a user is on page 50 with page_size = 20, what is the OFFSET?',
          'QUESTION_BLOCK::AFTER::OFFSET = (page - 1) * page_size = (50 - 1) * 20 = 980 rows to skip.',
        ],
        syntaxBlocks: [
          {
            title: 'Offset-based pagination (convenient for small pages)',
            sql: '-- Page 2 with 5 items per page:\nSELECT product_id, name, price\nFROM products\nORDER BY product_id ASC\nLIMIT 5 OFFSET 5;',
            description:
              'OFFSET specifies the number of rows to skip before beginning to return rows from the query.',
          },
        ],
        keyTakeaway:
          'OFFSET is simple to write and fine for page 1 or 2, but it has O(N) complexity because the database must scan and discard all skipped rows.',
        exampleQuery:
          'SELECT product_id, name, price FROM products ORDER BY product_id ASC LIMIT 5 OFFSET 10;',
        exampleQueryExplanation:
          'This fetches items 11 through 15 by skipping the first 10 rows.',
        liveDemoSql:
          'SELECT product_id, name, price FROM products ORDER BY product_id ASC LIMIT 5 OFFSET 5;',
        liveDemoNotes:
          'Rows 6 through 10 are returned.',
        mcqs: [
          {
            question: 'What does the database engine do when executing LIMIT 20 OFFSET 50000?',
            options: [
              'A. It jumps directly to row 50,001 using a pointer table',
              'B. It scans and evaluates 50,020 rows, then discards the first 50,000',
              'C. It divides the table into 20 partitions',
              'D. It caches all 50,000 rows in memory forever',
            ],
            correctIndex: 1,
            explanation:
              'The engine must process 50,020 rows in order, discarding the first 50,000. This causes heavy disk I/O and CPU usage.',
          },
        ],
        commonMistakes: [
          'Using OFFSET pagination on endless-scroll feeds or public API endpoints without a maximum page cap.',
          'Forgetting ORDER BY with pagination — without ORDER BY, the row order is non-deterministic and items can appear twice or be skipped across pages.',
        ],
      },
      tasks: [
        {
          id: 'day53-t1',
          title: 'Fetch Page 2 Using Standard OFFSET',
          description:
            'Write a query to fetch the second page of products (page size 5) using LIMIT and OFFSET.',
          instructions: [
            'SELECT product_id, name, price FROM products',
            'ORDER BY product_id ASC',
            'LIMIT 5 OFFSET 5',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Fetch page 2 (items 6 to 10)\n\n\n\n',
          solutionSql:
            'SELECT product_id, name, price FROM products ORDER BY product_id ASC LIMIT 5 OFFSET 5;',
          solutionExplanation:
            'LIMIT 5 OFFSET 5 skips the first 5 rows and returns the next 5 rows ordered by product_id.',
          hints: [
            { level: 1, text: 'Use ORDER BY product_id ASC LIMIT 5 OFFSET 5' },
            { level: 2, text: 'SELECT product_id, name, price FROM products ORDER BY product_id ASC LIMIT 5 OFFSET 5;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 5 },
          successMessage: 'Page 2 retrieved! Now let us learn how to eliminate the OFFSET cost entirely.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Keyset (Cursor) Pagination
    // -------------------------------------------------------------------------
    {
      id: 'keyset-pagination',
      order: 2,
      title: 'Keyset (Cursor) Pagination: Constant-Time O(1)',
      shortDescription: 'Paginate by remembering the last seen item instead of counting from the beginning.',
      theory: {
        summary:
          'Keyset pagination (also called cursor-based pagination) replaces OFFSET with a WHERE condition on an indexed column. Instead of "skip 10,000 rows", you tell the database "give me the first 10 rows WHERE id > 10000".',
        explanation: [
          'How Keyset pagination works:',
          '1. Page 1: `SELECT * FROM products ORDER BY product_id ASC LIMIT 5;` -> Last seen `product_id = 5`',
          '2. Page 2: `SELECT * FROM products WHERE product_id > 5 ORDER BY product_id ASC LIMIT 5;` -> Last seen `product_id = 10`',
          '3. Page 3: `SELECT * FROM products WHERE product_id > 10 ORDER BY product_id ASC LIMIT 5;`',
          'Why this is instant:',
          'Because `product_id` is the PRIMARY KEY (a B-tree index), the database uses a B-tree search to jump directly to `product_id > 5` in microseconds. It never reads or touches rows 1 through 5!',
          'Whether you are fetching page 2 or page 2,000,000, query time remains **identical and constant** (O(1)).',
          'QUESTION_BLOCK::BEFORE::What is the cursor value passed from page 1 to fetch page 2?',
          'QUESTION_BLOCK::AFTER::The ID (or sorting key value) of the very last item on page 1.',
        ],
        syntaxBlocks: [
          {
            title: 'Keyset pagination query pattern',
            sql: '-- Fetch next batch after product_id = :last_seen_id:\nSELECT product_id, name, price\nFROM products\nWHERE product_id > 5\nORDER BY product_id ASC\nLIMIT 5;',
            description:
              'By filtering on product_id > :last_seen_id with an index, the database jumps directly to the starting point without scanning prior rows.',
          },
        ],
        keyTakeaway:
          'Keyset pagination uses WHERE id > :last_seen_id to seek directly to the next page using an index, delivering true constant-time O(1) performance at any page depth.',
        exampleQuery:
          'SELECT product_id, name, price FROM products WHERE product_id > 10 ORDER BY product_id ASC LIMIT 5;',
        exampleQueryExplanation:
          'This fetches the next 5 products starting right after product_id 10.',
        liveDemoSql:
          'SELECT product_id, name, price FROM products WHERE product_id > 5 ORDER BY product_id ASC LIMIT 5;',
        liveDemoNotes:
          'Notice how clean and deterministic this query is.',
        mcqs: [
          {
            question: 'Why is Keyset pagination faster than OFFSET pagination for deep pages?',
            options: [
              'A. Because it converts integers into strings',
              'B. Because it uses an index seek to jump directly to the target row without scanning skipped rows',
              'C. Because it caches the entire table in redis',
              'D. Because it bypasses the transaction log',
            ],
            correctIndex: 1,
            explanation:
              'The B-tree index seek takes logarithmic time to jump straight to WHERE id > N, completely avoiding the need to read and discard earlier rows.',
          },
        ],
        commonMistakes: [
          'Using a non-unique column alone for cursor pagination — if multiple rows share the exact same value, items can be skipped. Use a tiebreaker like (timestamp, id).',
        ],
      },
      tasks: [
        {
          id: 'day53-t2',
          title: 'Implement Keyset Pagination',
          description:
            'Write a keyset query to fetch the 5 products that follow product_id = 5, ordered by product_id ASC.',
          instructions: [
            'SELECT product_id, name, price FROM products',
            'WHERE product_id > 5',
            'ORDER BY product_id ASC',
            'LIMIT 5',
          ],
          type: 'guided',
          primaryTable: 'products',
          setupSql: '',
          initialSql: '-- Keyset pagination query (page 2 without OFFSET)\n\n\n\n',
          solutionSql:
            'SELECT product_id, name, price FROM products WHERE product_id > 5 ORDER BY product_id ASC LIMIT 5;',
          solutionExplanation:
            'Using WHERE product_id > 5 allows the engine to seek straight to item 6 using the primary key index.',
          hints: [
            { level: 1, text: 'Filter with WHERE product_id > 5, ORDER BY product_id ASC, LIMIT 5' },
            { level: 2, text: 'SELECT product_id, name, price FROM products WHERE product_id > 5 ORDER BY product_id ASC LIMIT 5;' },
          ],
          validation: { requireSelect: true, expectedRowCount: 5 },
          successMessage: 'Keyset pagination query executed! Instant seek, zero skipped-row waste.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Partitioning Schemes & Pruning
    // -------------------------------------------------------------------------
    {
      id: 'partitioning-concepts',
      order: 3,
      title: 'Table Partitioning & Partition Pruning',
      shortDescription: 'Dividing one logical table into physical sub-tables for massive data volume.',
      theory: {
        summary:
          'Table partitioning splits a large table into smaller physical pieces called partitions, while presenting a single unified table to applications. Partition pruning allows queries to touch only the specific partitions containing relevant data.',
        explanation: [
          'Common partitioning strategies:',
          '- **RANGE Partitioning**: Data is split into ranges of values (e.g. by year: `p2024`, `p2025`, `p2026`). Ideal for time-series logs and audit tables.',
          '- **LIST Partitioning**: Data is split by explicit discrete values (e.g. by region: `Asia`, `Europe`, `Americas`).',
          '- **HASH Partitioning**: Data is evenly distributed across N partitions using a hash function on a key (e.g. `user_id`).',
          '**Partition Pruning**:',
          'When a query includes `WHERE created_at >= \'2026-01-01\' AND created_at < \'2027-01-01\'`, the query optimizer immediately knows to scan ONLY the `p2026` partition. All other partitions are completely ignored ("pruned").',
          'Benefits:',
          '1. Smaller B-tree indexes per partition.',
          '2. Dropping old data (`ALTER TABLE logs DROP PARTITION p2020;`) is instantaneous (metadata operation), whereas `DELETE FROM logs WHERE year = 2020` would lock the table and generate gigabytes of undo logs.',
          'QUESTION_BLOCK::BEFORE::Why is dropping a partition faster than running a DELETE query?',
          'QUESTION_BLOCK::AFTER::Dropping a partition simply unlinks the physical file from the filesystem. DELETE must inspect each row, write undo/redo logs, update indexes, and trigger locks.',
        ],
        syntaxBlocks: [
          {
            title: 'RANGE Partitioning syntax (reference)',
            sql: 'CREATE TABLE orders_partitioned (\n  order_id INT,\n  order_date DATE,\n  total DECIMAL(10,2),\n  PRIMARY KEY (order_id, order_date)\n)\nPARTITION BY RANGE (YEAR(order_date)) (\n  PARTITION p2024 VALUES LESS THAN (2025),\n  PARTITION p2025 VALUES LESS THAN (2026),\n  PARTITION p2026 VALUES LESS THAN (2027),\n  PARTITION p_future VALUES LESS THAN MAXVALUE\n);',
            description:
              'The partition key must be part of the table\'s primary key. Queries filtering by order_date prune all partitions outside the requested range.',
          },
        ],
        keyTakeaway:
          'Partitioning splits large tables physically by RANGE, LIST, or HASH while keeping one logical table. Partition pruning skips irrelevant partitions entirely during queries.',
        exampleQuery:
          'SELECT order_id, customer_id, order_date, status FROM orders WHERE order_id > 10 ORDER BY order_id ASC LIMIT 5;',
        exampleQueryExplanation:
          'Keyset query retrieving the next page of orders after order 10.',
        liveDemoSql:
          'SELECT order_id, customer_id, order_date, status FROM orders WHERE order_id > 5 ORDER BY order_id ASC LIMIT 5;',
        liveDemoNotes:
          'Demonstrating keyset navigation across the orders table.',
        mcqs: [
          {
            question: 'What is "partition pruning" in a database query execution plan?',
            options: [
              'A. Deleting corrupted partitions',
              'B. The optimizer skipping partitions that cannot contain data matching the query filters',
              'C. Re-indexing partitions in the background',
              'D. Converting a RANGE partition into a HASH partition',
            ],
            correctIndex: 1,
            explanation:
              'Partition pruning is an optimization where the database engine only reads partitions that match the WHERE clause filters, skipping all others.',
          },
        ],
        commonMistakes: [
          'Partitioning a table with only 10,000 rows — partitioning adds metadata overhead and is only beneficial for tables with millions of rows.',
          'Not including the partition column in the primary key — in MySQL, all unique/primary keys must include every column in the partition expression.',
        ],
      },
      tasks: [
        {
          id: 'day53-t3',
          title: 'Keyset Pagination on Orders with Filtering',
          description:
            'Write a keyset pagination query on the orders table to retrieve 5 delivered orders where order_id > 3, ordered by order_id ASC.',
          instructions: [
            "SELECT order_id, customer_id, order_date, status FROM orders WHERE order_id > 3 AND status = 'delivered' ORDER BY order_id ASC LIMIT 5",
          ],
          type: 'independent',
          primaryTable: 'orders',
          setupSql: '',
          initialSql: '-- Filtered keyset query on orders\n',
          solutionSql:
            "SELECT order_id, customer_id, order_date, status FROM orders WHERE order_id > 3 AND status = 'delivered' ORDER BY order_id ASC LIMIT 5;",
          solutionExplanation:
            'This combines a cursor condition (order_id > 3) with a business filter (status = delivered) for efficient paginated results.',
          hints: [
            { level: 1, text: "Combine WHERE order_id > 3 AND status = 'delivered' ORDER BY order_id ASC LIMIT 5" },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Filtered keyset query executed successfully!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day53-challenge',
    title: 'High-Volume Customer Activity Feed',
    scenario:
      'Build a production-grade cursor query for a customer activity feed. The client currently has customer_id 1 with order_id 1. Fetch the next batch of delivered orders for this customer using keyset pagination.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day53-ch1',
        title: 'Customer Feed Keyset Cursor',
        description:
          'Fetch the next delivered orders for customer_id = 1 with order_id > 1, ordered by order_id ASC, limited to 2 items.',
        instructions: [
          "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2",
        ],
        type: 'challenge',
        primaryTable: 'orders',
        setupSql: '',
        initialSql: '-- Build a customer feed keyset query\n\n\n',
        solutionSql:
          "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2;",
        solutionExplanation:
          'The query combines the user boundary (customer_id = 1), state filter (status = delivered), and cursor (order_id > 1).',
        hints: [
          { level: 1, text: "Filter by customer_id = 1 AND status = 'delivered' AND order_id > 1" },
          { level: 2, text: "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2;" },
        ],
        validation: { requireSelect: true, expectedRowCount: 1 },
        successMessage: 'Feed pagination complete! Keyset cursors provide scalable pagination for high-volume apps.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
