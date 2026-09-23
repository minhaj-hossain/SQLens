import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 57 — Production Capstone (id: day-57 — order 57)
// Milestone 4, Phase 5: Operate
//   Comprehensive Final Capstone: Architect, Harden & Scale
// =============================================================================
export const Day_57_MODULE: ModuleData = {
  id: 'day-57',
  slug: 'production-capstone',
  day: 57,
  title: 'Day 57 — Production Capstone: Architect, Harden & Scale',
  shortTitle: 'Production Capstone',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Congratulations on reaching the final capstone of the curriculum. In this capstone, you will apply everything you have mastered across transactions, indexing, execution plans, security boundaries, and schema migrations to architect, harden, and scale a production-grade database backend.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Architect robust database schemas with encapsulation boundaries and security roles',
    'Design and verify composite indexing strategies using execution plans',
    'Implement constant-time keyset pagination for high-throughput APIs',
    'Execute zero-downtime schema migrations on live production tables',
    'Demonstrate senior-level mastery of relational database engineering',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CAPSTONE DELIVERABLE 1 — Security & Encapsulation Boundary
    // -------------------------------------------------------------------------
    {
      id: 'capstone-security-boundary',
      order: 1,
      title: 'Deliverable 1: Tenant Security Boundary View',
      shortDescription: 'Build an airtight database boundary view isolating tenant data.',
      theory: {
        summary:
          'Multi-tenant systems must guarantee at the database layer that no tenant can inspect another\'s records. Encapsulate customer 1\'s orders behind an isolated reporting view.',
        targetQuery: {
          sql: 'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1;\nSELECT * FROM v_customer1_orders;',
          explanation: 'Define the tenant boundary, then read through it — only customer 1 rows come back.',
          badge: "The deliverable script we'll dissect",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Encode the tenant rule',
            sqlSnippet: 'WHERE customer_id = 1',
            clause: 'WHERE',
            explanation: 'The tenant filter lives inside the view definition — every future reader inherits it automatically.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Project only safe columns',
            sqlSnippet: 'SELECT order_id, customer_id, order_date, status',
            clause: 'SELECT',
            explanation: 'The view exposes exactly four columns — anything sensitive in orders never leaves the boundary.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Read through the boundary',
            sqlSnippet: 'SELECT * FROM v_customer1_orders',
            explanation: 'Engine output: three rows (orders 1, 14, 18), all customer_id = 1 — cross-tenant rows are physically unreachable.',
          },
        ],
        introTable: {
          tableName: 'v_customer1_orders (engine output)',
          description: "Engine output of the live demo: exactly customer 1's three orders — order 1's history and nothing from any other customer.",
          columns: ['order_id', 'customer_id', 'order_date', 'status'],
          rows: [
            [1, 1, '2026-06-10', 'delivered'],
            [14, 1, '2026-08-02', 'delivered'],
            [18, 1, '2026-08-23', 'pending'],
          ],
        },
        explanation: [
          'In this deliverable, you will create a dedicated security boundary view `v_customer1_orders` that projects `order_id`, `customer_id`, `order_date`, and `status` strictly for `customer_id = 1`.',
          'This provides a secure endpoint for customer-facing dashboards that physically prevents cross-tenant data leakage.',
        ],
        syntaxBlocks: [
          {
            title: 'Security view definition',
            sql: 'CREATE VIEW v_customer1_orders AS\nSELECT order_id, customer_id, order_date, status\nFROM orders\nWHERE customer_id = 1;',
            description:
              'Defines a boundary view scoped to customer 1.',
          },
        ],
        keyTakeaway:
          'Database views provide a verified security perimeter for multi-tenant applications.',
        exampleQuery:
          'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1;\nSELECT * FROM v_customer1_orders;',
        exampleQueryExplanation:
          'Exposes only customer 1 orders.',
        liveDemoSql:
          'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1;\nSELECT * FROM v_customer1_orders;',
        liveDemoNotes:
          'Verify only customer 1 orders appear in the result set.',
        mcqs: [
          {
            question: 'Why does an explicit view boundary provide stronger tenant isolation than application-level filtering?',
            options: [
              'A. Views disable write transactions',
              'B. A database view enforces the filter at the engine level, protecting against forgotten WHERE clauses in application code',
              'C. Views make database backups smaller',
              'D. Views automatically create primary keys',
            ],
            correctIndex: 1,
            explanation:
              'Engine-enforced boundaries eliminate human error in application queries.',
          },
        ],
        commonMistakes: [
          'Selecting columns not needed by the client, which can leak internal identifiers.',
        ],
      },
      tasks: [
        {
          id: 'day57-t1',
          title: 'Deploy the Tenant Security Boundary View',
          description:
            'Create a view named v_customer1_orders that selects order_id, customer_id, order_date, and status from orders where customer_id = 1, then query the view.',
          instructions: [
            'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1',
            'SELECT * FROM v_customer1_orders',
          ],
          type: 'guided',
          primaryTable: 'orders',
          setupSql: '',
          initialSql: '-- Deliverable 1: Deploy tenant isolation view\n\n\n',
          solutionSql:
            'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1;\nSELECT * FROM v_customer1_orders;',
          solutionExplanation:
            'This deploys the secure tenant view and verifies that only customer 1 orders are returned.',
          hints: [
            { level: 1, text: 'Create the view with CREATE VIEW v_customer1_orders AS SELECT ... WHERE customer_id = 1, then SELECT * FROM v_customer1_orders;' },
            { level: 2, text: 'CREATE VIEW v_customer1_orders AS SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1;\nSELECT * FROM v_customer1_orders;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Deliverable 1 accepted! Tenant security boundary view successfully deployed.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CAPSTONE DELIVERABLE 2 — High-Performance Composite Indexing
    // -------------------------------------------------------------------------
    {
      id: 'capstone-composite-indexing',
      order: 2,
      title: 'Deliverable 2: High-Performance Composite Indexing',
      shortDescription: 'Accelerate multi-column customer timeline searches with an optimal index.',
      theory: {
        summary:
          'Customer dashboards frequently query order histories filtered by customer and ordered by date. Design an optimal composite index adhering to the Leftmost Prefix Rule.',
        explanation: [
          'In this deliverable, you will create a composite index on `orders (customer_id, order_date)`.',
          'Because `customer_id` is an exact equality match and `order_date` represents a chronological timeline, placing `customer_id` first allows the database to locate the customer and immediately read orders in chronological sequence without a separate sort step.',
        ],
        syntaxBlocks: [
          {
            title: 'Composite indexing syntax',
            sql: 'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);\nSELECT * FROM orders WHERE customer_id = 1 ORDER BY order_date ASC;',
            description:
              'Puts the equality column first and the sort column second.',
          },
        ],
        keyTakeaway:
          'Place equality filter columns first and range/sort columns second in composite indexes.',
        exampleQuery:
          'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);\nSELECT order_id, customer_id, order_date FROM orders WHERE customer_id = 1;',
        exampleQueryExplanation:
          'Uses the composite index prefix to find customer 1 records.',
        liveDemoSql:
          'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);\nSELECT order_id, customer_id, order_date FROM orders WHERE customer_id = 1 ORDER BY order_date ASC;',
        liveDemoNotes:
          'Composite index eliminates both table scans and filesorts.',
        mcqs: [
          {
            question: 'For a query with WHERE customer_id = ? ORDER BY order_date ASC, what is the optimal composite index column order?',
            options: [
              'A. (order_date, customer_id)',
              'B. (customer_id, order_date)',
              'C. (status, customer_id)',
              'D. Two separate indexes on each column',
            ],
            correctIndex: 1,
            explanation:
              'Placing the equality column (customer_id) first isolates the customer, and the second column (order_date) satisfies the sort order directly from the index tree.',
          },
        ],
        commonMistakes: [
          'Placing the sort column before the equality filter column in the composite index.',
        ],
      },
      tasks: [
        {
          id: 'day57-t2',
          title: 'Deploy the Composite Timeline Index',
          description:
            'Create a composite index named idx_orders_cust_date on orders (customer_id, order_date) and run a customer timeline query.',
          instructions: [
            'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date)',
            'SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 ORDER BY order_date ASC',
          ],
          type: 'guided',
          primaryTable: 'orders',
          setupSql: '',
          initialSql: '-- Deliverable 2: Composite timeline index\n\n\n',
          solutionSql:
            'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);\nSELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 ORDER BY order_date ASC;',
          solutionExplanation:
            'The composite index optimizes both the customer_id filter and the order_date sort in a single index seek.',
          hints: [
            { level: 1, text: 'Run CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date); then the SELECT query.' },
            { level: 2, text: 'CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);\nSELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 ORDER BY order_date ASC;' },
          ],
          validation: { requireSelect: true, expectedRowCount: { min: 1 } },
          successMessage: 'Deliverable 2 accepted! Composite timeline index active.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CAPSTONE DELIVERABLE 3 — Constant-Time Keyset Pagination
    // -------------------------------------------------------------------------
    {
      id: 'capstone-keyset-pagination',
      order: 3,
      title: 'Deliverable 3: Constant-Time Keyset Pagination',
      shortDescription: 'Build a production-grade keyset cursor query for scalable feeds.',
      theory: {
        summary:
          'To support endless mobile scrolling and massive API request volume, eliminate OFFSET completely by implementing keyset pagination using the primary key cursor.',
        introTable: {
          tableName: 'Keyset page for customer 1 (engine output)',
          description: "Engine output of the live demo: the cursor order_id > 1 seeks straight to customer 1's next delivered order — no rows skipped, no OFFSET.",
          columns: ['order_id', 'customer_id', 'order_date', 'status'],
          rows: [[14, 1, '2026-08-02', 'delivered']],
        },
        explanation: [
          'In this deliverable, you will construct a keyset cursor query that fetches delivered orders for customer 1 starting after `order_id = 1`.',
          'By seeking on `WHERE customer_id = 1 AND status = \'delivered\' AND order_id > 1 ORDER BY order_id ASC LIMIT 2`, the database navigates directly to the target record in O(1) time.',
        ],
        syntaxBlocks: [
          {
            title: 'Keyset feed pattern',
            sql: 'SELECT order_id, customer_id, order_date, status\nFROM orders\nWHERE customer_id = 1 AND status = \'delivered\' AND order_id > 1\nORDER BY order_id ASC\nLIMIT 2;',
            description:
              'Combines user scope, status filter, and primary key cursor in one efficient seek.',
          },
        ],
        keyTakeaway:
          'Keyset pagination ensures stable, sub-millisecond response times at any depth in high-traffic feeds.',
        exampleQuery:
          "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2;",
        exampleQueryExplanation:
          'Fetches the next 2 delivered orders after order 1.',
        liveDemoSql:
          "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2;",
        liveDemoNotes:
          'Clean, deterministic, instant pagination.',
        mcqs: [
          {
            question: 'Why does keyset pagination prevent duplicate or skipped items when new records are inserted concurrently?',
            options: [
              'A. Because it uses table locks',
              'B. Because the cursor anchors to a specific unique row ID, so rows added before the cursor do not shift the offset window',
              'C. Because it converts data to JSON',
              'D. Because it only allows read-only transactions',
            ],
            correctIndex: 1,
            explanation:
              'OFFSET pagination suffers from "page drift" when rows are inserted or deleted. Keyset pagination anchors to an exact ID, guaranteeing zero drift.',
          },
        ],
        commonMistakes: [
          'Omitting the cursor condition (order_id > ?) when requesting subsequent pages.',
        ],
      },
      tasks: [
        {
          id: 'day57-t3',
          title: 'Implement the Keyset Feed Endpoint',
          description:
            'Write a keyset query retrieving the next 2 delivered orders for customer 1 where order_id > 1, ordered by order_id ASC.',
          instructions: [
            "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2",
          ],
          type: 'independent',
          primaryTable: 'orders',
          setupSql: '',
          initialSql: '-- Deliverable 3: Keyset cursor query\n',
          solutionSql:
            "SELECT order_id, customer_id, order_date, status FROM orders WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2;",
          solutionExplanation:
            'This keyset query combines user scope, status filter, and cursor anchor for constant-time performance.',
          hints: [
            { level: 1, text: "Filter with WHERE customer_id = 1 AND status = 'delivered' AND order_id > 1 ORDER BY order_id ASC LIMIT 2" },
          ],
          validation: { requireExactResult: true, requireSelect: true, expectedRowCount: 1 },
          successMessage: 'Deliverable 3 accepted! High-performance keyset pagination verified.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day57-challenge',
    title: 'Zero-Downtime SaaS Architecture Evolution',
    scenario:
      'The platform is rolling out an expedited shipping feature. As the lead database engineer, perform a zero-downtime schema evolution on the orders table: Expand the schema with an is_priority flag, Backfill all existing orders with 0 (standard priority), and verify the migrated state.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day57-ch1',
        title: 'Deliverable 4: Zero-Downtime Priority Flag Migration',
        description:
          'Alter the orders table to add is_priority INTEGER, backfill all rows where is_priority IS NULL with 0, and query order_id, customer_id, status, and is_priority.',
        instructions: [
          'ALTER TABLE orders ADD COLUMN is_priority INTEGER',
          'UPDATE orders SET is_priority = 0 WHERE is_priority IS NULL',
          'SELECT order_id, customer_id, status, is_priority FROM orders',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        setupSql: '',
        initialSql: '-- Deliverable 4: Zero-downtime expand & backfill migration\n\n\n\n',
        solutionSql:
          'ALTER TABLE orders ADD COLUMN is_priority INTEGER;\nUPDATE orders SET is_priority = 0 WHERE is_priority IS NULL;\nSELECT order_id, customer_id, status, is_priority FROM orders;',
        solutionExplanation:
          'This executes an Expand/Backfill zero-downtime migration on the orders table, initializing the priority flag across all historical orders.',
        hints: [
          { level: 1, text: 'Run ALTER TABLE to add is_priority INTEGER, then UPDATE to set is_priority = 0 where NULL, then SELECT.' },
          { level: 2, text: 'ALTER TABLE orders ADD COLUMN is_priority INTEGER;\nUPDATE orders SET is_priority = 0 WHERE is_priority IS NULL;\nSELECT order_id, customer_id, status, is_priority FROM orders;' },
        ],
        validation: {
          requiredColumns: ['is_priority'], requireSelect: true, expectedRowCount: { min: 1 },
          judgment: [
            { kind: 'compare-tradeoff', prompt: 'A tenant filter exists only in application code and the database enforces nothing. What is the core risk?', options: ['Any bug or raw query can read another tenant rows - the database is the last line of defense', 'It makes every query slower', 'It disables the primary keys', 'It prevents index creation'], correctIndex: 0, explanation: 'Application filters are advisory; a missing WHERE clause, a new endpoint or hand-written SQL skips them - isolation must be enforced by views or policies the database itself applies.' },
          ],
        },
        successMessage: 'Capstone complete! You have architected, secured, optimized, and evolved a production-grade database system. Milestone 4 is fully conquered!',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
