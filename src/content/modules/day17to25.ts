import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 17: Subqueries & CTEs
// =============================================================================
export const DAY_17_MODULE: ModuleData = {
  id: 'day-17',
  slug: 'subqueries-ctes',
  day: 17,
  title: 'Day 17 — Subqueries & CTEs',
  shortTitle: 'Subqueries & CTEs',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Master scalar subqueries, IN list subqueries, and Common Table Expressions (CTEs) using the WITH syntax to write modular, readable analytical queries.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Write scalar subqueries to compare individual rows against whole-table aggregates',
    'Filter rows against dynamic result sets using IN subqueries',
    'Structure complex multi-stage queries using Common Table Expressions (WITH syntax)',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: Scalar & IN Subqueries
    // =========================================================================
    {
      id: 'scalar-and-in-subqueries',
      order: 1,
      title: '1. Scalar Subqueries & Dynamic IN Lists',
      shortDescription: 'Nested queries that return single values or column lists.',
      theory: {
        summary: 'A subquery is a query nested inside another SQL statement. A scalar subquery returns a single value (e.g. `(SELECT AVG(price) FROM products)`). An IN subquery returns a list of values for filtering.',
        introTable: {
          tableName: 'products',
          description: 'Comparing items against table-wide average price.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 25.00],
            [2, 'Mechanical Keyboard', 89.99],
            [4, 'Ergonomic Desk Chair', 249.00],
            [6, '4K UltraHD Monitor', 349.99],
          ],
        },
        explanation: [
          '### 1. Scalar Subqueries',
          '`WHERE price > (SELECT AVG(price) FROM products)` dynamically calculates the table average ($114.62) and filters products priced above it.',
          '### 2. Multi-Row IN Subqueries',
          '`WHERE customer_id IN (SELECT customer_id FROM orders)` dynamically extracts customer IDs who have at least one recorded order.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Comparing with Table Average via Subquery',
            sqlSnippet: 'SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);',
            explanation: 'The inner subquery evaluates the average price once, and the outer query filters for items above that average.',
            tableData: {
              tableName: 'Above Average Products',
              columns: ['name', 'price'],
              rows: [
                ['Ergonomic Desk Chair', 249.00],
                ['4K UltraHD Monitor (27-inch)', 349.99],
                ['Adjustable Standing Desk', 420.00],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Scalar and IN subqueries',
            sql: '-- Scalar subquery\nSELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);\n\n-- IN subquery\nSELECT name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
            description: 'Subquery filtering patterns.',
          },
        ],
        keyTakeaway: 'Use subqueries to compute dynamic criteria without hardcoding magic numbers.',
        exampleQuery: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
        exampleQueryExplanation: 'Finds products priced above the overall average.',
        liveDemoSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
        liveDemoNotes: 'Displays above-average priced products.',
        mcqs: [
          {
            question: 'What is a scalar subquery?',
            options: [
              'A. A subquery that returns a full table',
              'B. A subquery that returns exactly one row and one column (a single value)',
              'C. A query with multiple joins',
              'D. A subquery that only works in MySQL',
            ],
            correctIndex: 1,
            explanation: 'Scalar subqueries evaluate to a single atomic value.',
          },
        ],
        masteryPoints: ['Write scalar and IN subqueries'],
      },
      tasks: [
        {
          id: 'day17-c1-t1',
          title: 'Task 1: Products Priced Above Overall Average',
          description: 'Select products priced higher than the overall average product price.',
          instructions: [
            'Select `name` and `price` from `products`.',
            'Where `price > (SELECT AVG(price) FROM products)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
          solutionExplanation: 'Uses a scalar subquery in the WHERE clause.',
          hints: [{ level: 1, text: 'Use `WHERE price > (SELECT AVG(price) FROM products);`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 10,
          },
          successMessage: 'Above-average products retrieved!',
        },
        {
          id: 'day17-c1-t2',
          title: 'Task 2: Customers with Recorded Orders (IN)',
          description: 'Retrieve customer_id and name for customers who have placed at least one order using an IN subquery.',
          instructions: [
            'Query the `customers` table.',
            'Select `customer_id` and `name`.',
            'Where `customer_id IN (SELECT customer_id FROM orders)`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Customers with orders via IN subquery\n',
          solutionSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
          solutionExplanation: 'Filters customers using an IN subquery against orders.',
          hints: [{ level: 1, text: 'Use `WHERE customer_id IN (SELECT customer_id FROM orders);`' }],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['customer_id', 'name'],
            requireWhere: true,
            expectedRowCount: 12,
          },
          successMessage: 'Perfect! Active customers identified via IN subquery.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Common Table Expressions (WITH syntax)
    // =========================================================================
    {
      id: 'common-table-expressions-cte',
      order: 2,
      title: '2. Common Table Expressions (WITH syntax)',
      shortDescription: 'Readable, modular multi-stage query architecture.',
      theory: {
        summary: 'A Common Table Expression (CTE) defined with `WITH name AS (...)` provides a named, readable temporary result set that exists for the duration of a single query.',
        introTable: {
          tableName: 'orders & customers',
          description: 'CTE pipeline input data',
          columns: ['customer_id', 'name', 'order_count'],
          rows: [
            [1, 'Rahim Chowdhury', 2],
            [2, 'Karim Ahmed', 1],
            [3, 'Ayesha Siddika', 2],
          ],
        },
        explanation: [
          '### 1. What is a CTE?',
          'A CTE is a named temporary result set defined with `WITH cte_name AS (...)` placed at the top of your query.',
          'QUESTION_BLOCK::Readability Advantage::CTEs eliminate deeply nested subqueries and allow you to break complex business logic into clean, readable steps.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Defining ActiveCustomers CTE',
            sqlSnippet: 'WITH ActiveCustomers AS (\n  SELECT DISTINCT customer_id FROM orders\n)\nSELECT c.customer_id, c.name\nFROM customers c\nJOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
            explanation: 'Defines the ActiveCustomers CTE and joins it cleanly to customers.',
            tableData: {
              tableName: 'CTE Output',
              columns: ['customer_id', 'name'],
              rows: [
                [1, 'Rahim Chowdhury'],
                [2, 'Karim Ahmed'],
                [3, 'Ayesha Siddika'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'CTE syntax',
            sql: 'WITH ActiveCustomers AS (\n  SELECT DISTINCT customer_id FROM orders\n)\nSELECT c.customer_id, c.name\nFROM customers c\nJOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
            description: 'Common Table Expression syntax.',
          },
        ],
        keyTakeaway: 'Use CTEs to structure complex queries linearly and improve code maintainability.',
        exampleQuery: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
        exampleQueryExplanation: 'Joins customers to a named CTE of active order placements.',
        liveDemoSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
        liveDemoNotes: 'Displays CTE query execution.',
        mcqs: [
          {
            question: 'What is the primary readability advantage of a CTE over deeply nested subqueries?',
            options: [
              'A. CTEs can be defined at the top with a clear name, avoiding nested parenthesis indents',
              'B. CTEs disable database security',
              'C. CTEs run in background threads',
              'D. CTEs only work on numbers',
            ],
            correctIndex: 0,
            explanation: 'CTEs give a descriptive name to intermediate queries, linearizing the logic.',
          },
        ],
        masteryPoints: ['Structure modular queries using WITH (CTEs)'],
      },
      tasks: [
        {
          id: 'day17-c2-t1',
          title: 'Task 1: Customer Order CTE',
          description: 'Rewrite the active customer order query using a WITH cte AS (...) clause.',
          instructions: [
            'Define `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders)`.',
            'Select `c.customer_id`, `c.name` from `customers c` JOIN `ActiveCustomers ac` ON `c.customer_id = ac.customer_id`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
          solutionExplanation: 'Uses a Common Table Expression to define active customer IDs.',
          hints: [{ level: 1, text: 'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) ...`' }],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 12,
          },
          successMessage: 'CTE query executed successfully!',
        },
        {
          id: 'day17-c2-t2',
          title: 'Task 2: Category Stats CTE',
          description: 'Create a CTE named CategoryStats that computes average price per category, then select categories with average price > 25.',
          instructions: [
            'Define `WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id)`.',
            'Select all columns from `CategoryStats` where `avg_price > 25`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Category stats CTE\n',
          solutionSql: 'WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id) SELECT * FROM CategoryStats WHERE avg_price > 25;',
          solutionExplanation: 'Computes category metrics inside a CTE and filters the resulting set.',
          hints: [{ level: 1, text: 'Use `WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id) SELECT * FROM CategoryStats WHERE avg_price > 25;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 4,
          },
          successMessage: 'Spot on! Category stats filtered via CTE.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 17 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-17-homework',
    title: 'Day 17 — Subqueries & CTEs (Homework)',
    scenario: 'Solve these analytical tasks using subqueries and CTEs:',
    tasks: [
      {
        id: 'day17-hw-1',
        title: 'Task 1: Products priced above the overall average price',
        description: 'Products priced above the overall average price.',
        instructions: [
          'Select `name`, `price` from `products` where `price > (SELECT AVG(price) FROM products)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Products priced above overall average\n',
        solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
        solutionExplanation: 'Filters products using a scalar subquery.',
        hints: [{ level: 1, text: 'Use `WHERE price > (SELECT AVG(price) FROM products);`' }],
        validation: {
          targetTable: 'products',
          requireWhere: true,
          expectedRowCount: 10,
        },
        successMessage: 'Task 1 completed! Above average products found.',
      },
      {
        id: 'day17-hw-2',
        title: 'Task 2: Customers who placed at least one order (IN subquery)',
        description: 'Customers who placed at least one order (using IN subquery).',
        instructions: [
          'Select `customer_id`, `name` from `customers` where `customer_id IN (SELECT customer_id FROM orders)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Task 2: Customers who placed at least one order (IN subquery)\n',
        solutionSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
        solutionExplanation: 'Uses an IN subquery against the orders table.',
        hints: [{ level: 1, text: 'Use `WHERE customer_id IN (SELECT customer_id FROM orders);`' }],
        validation: {
          targetTable: 'customers',
          requireWhere: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 2 completed! Ordered customers identified.',
      },
      {
        id: 'day17-hw-3',
        title: 'Task 3: Rewrite previous query as a CTE',
        description: 'Rewrite the customer order query using a WITH cte AS (...) clause.',
        instructions: [
          'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Task 3: Customer order query rewritten as CTE\n',
        solutionSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
        solutionExplanation: 'Uses a Common Table Expression to define active customer IDs.',
        hints: [{ level: 1, text: 'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) ...`' }],
        validation: {
          targetTable: 'customers',
          expectedRowCount: 12,
        },
        successMessage: 'Task 3 completed! CTE query verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 18: Practice Day: Subqueries & CTEs
// =============================================================================
export const DAY_18_MODULE: ModuleData = {
  id: 'day-18',
  slug: 'practice-subqueries-ctes',
  day: 18,
  title: 'Day 18 — Practice Day: Subqueries & CTEs',
  shortTitle: 'Practice: Correlated Subqueries & CTEs',
  type: 'practice_day',
  milestoneId: 'milestone-3',
  description: 'Write correlated subqueries comparing rows against category averages and build multi-stage CTE aggregations for customer spend tiering.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Write correlated subqueries linking inner and outer table references',
    'Calculate customer spend in a CTE and query high-value tiers above $150',
  ],
  concepts: [
    {
      id: 'correlated-and-staged-ctes',
      order: 1,
      title: '1. Correlated Subqueries & Staged CTEs',
      shortDescription: 'Category benchmarks and tiered spend CTEs.',
      theory: {
        summary: 'A correlated subquery references columns from the outer query (e.g. `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`). It computes a unique benchmark for each row.',
        introTable: {
          tableName: 'products (p1 vs p2)',
          description: 'Comparing product price against category-specific average',
          columns: ['p1.name', 'p1.category_id', 'p1.price', 'category_avg_price'],
          rows: [
            ['Ergonomic Desk Chair', 3, 249.00, 219.50],
            ['Wireless Mouse', 2, 25.00, 39.37],
            ['Mechanical Keyboard', 1, 89.99, 114.99],
          ],
        },
        explanation: [
          '### 1. Correlated Subquery Pattern',
          'For each product `p1`, compute the average price of products in that same category `p1.category_id`.',
          '### 2. Multi-Stage CTE Reporting',
          '```sql\nWITH CustomerSpend AS (\n  SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.customer_id = o.customer_id\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY c.customer_id, c.name\n)\nSELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Evaluating Category Averages Correlated per Row',
            sqlSnippet: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
            explanation: 'Computes category benchmark for each product dynamically.',
            tableData: {
              tableName: 'Above-Category-Average Items',
              columns: ['name', 'price', 'category_id'],
              rows: [
                ['Ergonomic Desk Chair', 249.00, 3],
                ['4K UltraHD Monitor (27-inch)', 349.99, 1],
                ['Thunderbolt 4 Docking Station', 185.00, 1],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Correlated subquery vs CTE',
            sql: '-- Correlated Subquery\nSELECT name, price FROM products p1\nWHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
            description: 'Comparing items against their specific category average.',
          },
        ],
        keyTakeaway: 'Correlated subqueries allow per-row dynamic comparisons, while CTEs modularize multi-stage pipelines.',
        exampleQuery: 'SELECT name, price FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        exampleQueryExplanation: 'Products priced above their specific category average.',
        liveDemoSql: 'SELECT name, price FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        liveDemoNotes: 'Displays products above their category average.',
        mcqs: [
          {
            question: 'What defines a correlated subquery?',
            options: [
              'A. It runs in a separate database',
              'B. It references a column from the outer query and re-evaluates for each outer row',
              'C. It only uses JOIN syntax',
              'D. It always returns a table',
            ],
            correctIndex: 1,
            explanation: 'Correlated subqueries depend on values from the outer query row.',
          },
        ],
        masteryPoints: ['Write correlated subqueries', 'Write staged analytical CTEs'],
      },
      tasks: [
        {
          id: 'day18-c1-t1',
          title: 'Task 1: Products Above Category Average',
          description: 'Find products priced higher than the average price within their own category.',
          instructions: [
            'Select `name`, `price`, `category_id` from `products p1`.',
            'Where `price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, price, category_id FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
          solutionExplanation: 'Correlated subquery compares each product against its own category average.',
          hints: [{ level: 1, text: 'Use `WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 12,
          },
          successMessage: 'Products above category average found!',
        },
        {
          id: 'day18-c1-t2',
          title: 'Task 2: High Spenders Tier CTE (> $150)',
          description: 'Build a CTE named CustomerSpend to calculate total spend per customer, then query customers who spent more than $150.',
          instructions: [
            'Define `WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name)`.',
            'Select all columns from `CustomerSpend` where `total_spent > 150` ordered by `total_spent DESC`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Staged CTE for high-spend tier\n',
          solutionSql: 'WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;',
          solutionExplanation: 'Calculates customer spend inside CTE and extracts customers above $150.',
          hints: [{ level: 1, text: 'Use `WHERE total_spent > 150 ORDER BY total_spent DESC;`' }],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 2,
          },
          successMessage: 'Spot on! High-spend customer tier analyzed with CTE.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 18 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-18-homework',
    title: 'Day 18 — Practice Day: Subqueries & CTEs (Homework)',
    scenario: 'Complete these 2 analytical challenges independently:',
    tasks: [
      {
        id: 'day18-hw-1',
        title: 'Task 1: Products priced above their own category average',
        description: 'Products priced above their own category average (correlated subquery).',
        instructions: [
          'Select `name`, `price` from `products p1` where `price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Products priced above their own category average\n',
        solutionSql: 'SELECT name, price FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        solutionExplanation: 'Executes a correlated subquery per category.',
        hints: [{ level: 1, text: 'Use `WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`' }],
        validation: {
          targetTable: 'products',
          requireWhere: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 1 completed! Correlated category query verified.',
      },
      {
        id: 'day18-hw-2',
        title: 'Task 2: CTE that calculates spend per customer, then queries for customers above $150',
        description: 'CTE that calculates total spend per customer, then queries that CTE for customers above $150.',
        instructions: [
          'Use `WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 2: Customer spend CTE filtered for > $150\n',
        solutionSql: 'WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;',
        solutionExplanation: 'Constructs the CustomerSpend CTE and filters for total_spent > 150.',
        hints: [{ level: 1, text: 'Use `WITH CustomerSpend AS (...) SELECT * FROM CustomerSpend WHERE total_spent > 150;`' }],
        validation: {
          targetTable: 'customers',
          expectedRowCount: 2,
        },
        successMessage: 'Task 2 completed! Staged CTE spending report verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 19: DML: INSERT, UPDATE, DELETE
// =============================================================================
export const DAY_19_MODULE: ModuleData = {
  id: 'day-19',
  slug: 'dml-insert-update-delete',
  day: 19,
  title: 'Day 19 — DML: INSERT, UPDATE, DELETE',
  shortTitle: 'DML (Data Modification)',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Learn safe data modification commands (INSERT, UPDATE, DELETE), transaction atomicity with BEGIN/COMMIT/ROLLBACK, and foreign key constraints.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Insert single and multi-row records using INSERT INTO',
    'Safely update records using UPDATE ... SET ... WHERE',
    'Safely delete records using DELETE FROM ... WHERE and understand foreign key cascade/restrict rules',
    'Understand transaction atomicity with BEGIN, COMMIT, and ROLLBACK',
  ],
  concepts: [
    {
      id: 'safe-dml-operations',
      order: 1,
      title: '1. Safe Data Modification & Transactions',
      shortDescription: 'INSERT, UPDATE, DELETE and transaction safety.',
      theory: {
        summary: 'DML modifies database state. Safe mutation rule: always run `SELECT * FROM table WHERE condition` first to see what you will affect before executing UPDATE or DELETE. In production, an UPDATE or DELETE without WHERE modifies or deletes EVERY row in the table.',
        introTable: {
          tableName: 'products',
          description: 'Inventory table before mutation',
          columns: ['product_id', 'name', 'price', 'quantity_in_stock'],
          rows: [
            [1, 'Wireless Mouse', 25.00, 42],
            [2, 'Mechanical Keyboard', 89.99, 15],
          ],
        },
        explanation: [
          '### 1. INSERT INTO',
          '`INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Mechanical Keyboard\', 1, 1, 129.99, 50, 10);`',
          '### 2. UPDATE ... SET ... WHERE',
          '`UPDATE products SET price = price * 1.10 WHERE product_id = 1;`',
          '### 3. DELETE FROM ... WHERE',
          '`DELETE FROM customers WHERE customer_id = 999;` (Foreign keys protect records in active use!).',
          'QUESTION_BLOCK::Transaction Atomicity::`BEGIN; ... COMMIT;` or `ROLLBACK;` ensures all steps succeed together or none take effect.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Targeted Update with WHERE',
            sqlSnippet: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
            explanation: 'Selectively updates only product 1 without altering the rest of the catalog.',
            tableData: {
              tableName: 'Updated Row',
              columns: ['product_id', 'name', 'price'],
              rows: [
                [1, 'Wireless Mouse', 27.50],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'DML operations',
            sql: '-- Insert\nINSERT INTO products (name, price) VALUES (\'Widget\', 19.99);\n\n-- Safe Update\nUPDATE products SET price = 24.99 WHERE product_id = 1;\n\n-- Safe Delete\nDELETE FROM products WHERE product_id = 999;',
            description: 'Core data modification commands.',
          },
        ],
        keyTakeaway: 'Always verify WHERE conditions before executing UPDATE or DELETE.',
        exampleQuery: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
        exampleQueryExplanation: 'Safely increases product 1 price by 10%.',
        liveDemoSql: 'SELECT * FROM products WHERE product_id = 1;',
        liveDemoNotes: 'Displays product before modification.',
        mcqs: [
          {
            question: 'What happens if you execute `UPDATE products SET price = 0;` without a WHERE clause?',
            options: [
              'A. Only the first row is updated',
              'B. SQL asks for confirmation',
              'C. Every single product in the table has its price changed to 0',
              'D. The database throws a syntax error',
            ],
            correctIndex: 2,
            explanation: 'Without a WHERE clause, UPDATE modifies all rows in the table.',
          },
        ],
        masteryPoints: ['Write safe INSERT, UPDATE, DELETE statements', 'Explain transaction atomicity'],
      },
      tasks: [
        {
          id: 'day19-c1-t1',
          title: 'Task 1: Insert a New Product',
          description: 'Insert a new item into the `products` table.',
          instructions: [
            'Insert into `products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)` values `(\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20);',
          solutionExplanation: 'Inserts a new product record.',
          hints: [{ level: 1, text: 'Use `INSERT INTO products (...) VALUES (...);`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'Product inserted successfully!',
        },
        {
          id: 'day19-c1-t2',
          title: 'Task 2: Targeted Price Increase',
          description: 'Safely update the price of product_id 1 by 10% (price = price * 1.10).',
          instructions: [
            'Update `products`.',
            'Set `price = price * 1.10`.',
            'Where `product_id = 1`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Targeted price update\n',
          solutionSql: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
          solutionExplanation: 'Safely applies a 10% price increase specifically to product 1.',
          hints: [{ level: 1, text: 'Use `UPDATE products SET price = price * 1.10 WHERE product_id = 1;`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Product price updated safely with WHERE.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 19 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-19-homework',
    title: 'Day 19 — DML Operations (Homework)',
    scenario: 'Demonstrate safe data modification operations:',
    tasks: [
      {
        id: 'day19-hw-1',
        title: 'Task 1: Insert a new product into products',
        description: 'Insert a new product into products.',
        instructions: [
          'Insert into `products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)` values `(\'Precision Stylus Pen\', 1, 1, 29.99, 80, 15)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Insert a new product into products\n',
        solutionSql: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Precision Stylus Pen\', 1, 1, 29.99, 80, 15);',
        solutionExplanation: 'Inserts new product with complete column attributes.',
        hints: [{ level: 1, text: 'Use `INSERT INTO products (...) VALUES (...);`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! New product added.',
      },
      {
        id: 'day19-hw-2',
        title: 'Task 2: Update the price of a product by 10%',
        description: 'Update the price of product_id = 1 by 10% (price = price * 1.10).',
        instructions: [
          'Update `products` set `price = price * 1.10` where `product_id = 1`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 2: Update the price of product 1 by 10%\n',
        solutionSql: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
        solutionExplanation: 'Safely applies targeted 10% price increase using WHERE product_id = 1.',
        hints: [{ level: 1, text: 'Use `UPDATE products SET price = price * 1.10 WHERE product_id = 1;`' }],
        validation: {
          targetTable: 'products',
          requireWhere: true,
          expectedRowCount: 1,
        },
        successMessage: 'Task 2 completed! Product price safely updated.',
      },
    ],
  },
};

// =============================================================================
// DAY 20: DDL: CREATE TABLE, ALTER TABLE, DROP TABLE
// =============================================================================
export const DAY_20_MODULE: ModuleData = {
  id: 'day-20',
  slug: 'ddl-schema-design',
  day: 20,
  title: 'Day 20 — DDL: CREATE TABLE, ALTER TABLE, DROP TABLE',
  shortTitle: 'DDL (Schema Design)',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Design robust table schemas with primary keys, foreign key references, data types, constraints (NOT NULL, UNIQUE, DEFAULT, CHECK), and alter existing tables.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Create normalized tables with PRIMARY KEY and AUTO_INCREMENT',
    'Enforce relational integrity using FOREIGN KEY ... REFERENCES',
    'Apply column constraints (NOT NULL, DEFAULT, CHECK)',
    'Alter tables using ADD COLUMN and DROP TABLE',
  ],
  concepts: [
    {
      id: 'ddl-schema-definitions',
      order: 1,
      title: '1. DDL & Relational Schema Design',
      shortDescription: 'CREATE TABLE, constraints, and ALTER TABLE.',
      theory: {
        summary: 'Data Definition Language (DDL) creates and modifies the structure of tables, indexes, and constraints. Choosing appropriate data types (`INT`, `VARCHAR(255)`, `DECIMAL(10,2)`, `DATETIME`) and constraints ensures database integrity.',
        introTable: {
          tableName: 'reviews (target schema)',
          description: 'Blueprint for customer product reviews',
          columns: ['review_id (PK)', 'product_id (FK)', 'customer_id (FK)', 'rating (1-5)', 'comment'],
          rows: [
            [1, 1, 1, 5, 'Great build quality!'],
            [2, 1, 2, 4, 'Solid keyboard.'],
            [3, 2, 3, 5, 'Best mouse I have used.'],
          ],
        },
        explanation: [
          '### 1. Creating a Table with Constraints',
          '```sql\nCREATE TABLE reviews (\n  review_id INT AUTO_INCREMENT PRIMARY KEY,\n  product_id INT NOT NULL,\n  customer_id INT NOT NULL,\n  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),\n  comment TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY (product_id) REFERENCES products(product_id),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Defining Schema with Primary and Foreign Keys',
            sqlSnippet: 'CREATE TABLE reviews (\n  review_id INT AUTO_INCREMENT PRIMARY KEY,\n  product_id INT NOT NULL,\n  customer_id INT NOT NULL,\n  rating INT NOT NULL,\n  comment TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
            explanation: 'Allocates structured table with auto-increment ID and constraint protections.',
            tableData: {
              tableName: 'Created reviews Schema',
              columns: ['Column', 'Type', 'Constraint'],
              rows: [
                ['review_id', 'INT', 'PRIMARY KEY AUTO_INCREMENT'],
                ['product_id', 'INT', 'NOT NULL FK'],
                ['rating', 'INT', 'NOT NULL'],
                ['created_at', 'DATETIME', 'DEFAULT CURRENT_TIMESTAMP'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'DDL schema syntax',
            sql: 'CREATE TABLE reviews (\n  review_id INT AUTO_INCREMENT PRIMARY KEY,\n  product_id INT NOT NULL,\n  rating INT CHECK (rating BETWEEN 1 AND 5),\n  comment TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
            description: 'Defines schema with constraints and defaults.',
          },
        ],
        keyTakeaway: 'Use rigorous constraints (PK, FK, NOT NULL, CHECK) to protect data integrity at the database layer.',
        exampleQuery: 'SELECT * FROM categories;',
        exampleQueryExplanation: 'Inspects existing category structure.',
        liveDemoSql: 'SELECT * FROM categories;',
        liveDemoNotes: 'Displays existing category table.',
        mcqs: [
          {
            question: 'What constraint prevents a column from storing NULL values?',
            options: ['A. UNIQUE', 'B. DEFAULT', 'C. NOT NULL', 'D. CHECK'],
            correctIndex: 2,
            explanation: 'NOT NULL enforces that every inserted or updated row must provide a valid value for that column.',
          },
        ],
        masteryPoints: ['Design schemas with foreign key relationships', 'Apply CHECK and DEFAULT constraints'],
      },
      tasks: [
        {
          id: 'day20-c1-t1',
          title: 'Task 1: Create the Reviews Table',
          description: 'Create a new `reviews` table with primary key, foreign keys, rating check, and timestamp default.',
          instructions: [
            'Write the CREATE TABLE statement for `reviews`.',
            'Include `review_id INT AUTO_INCREMENT PRIMARY KEY`, `product_id INT NOT NULL`, `customer_id INT NOT NULL`, `rating INT NOT NULL`, `comment TEXT`, `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'reviews',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
          solutionExplanation: 'Creates the reviews table schema with constraints.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE reviews (...);`' }],
          validation: {
            targetTable: 'reviews',
            expectedRowCount: 1,
          },
          successMessage: 'Reviews table created successfully!',
        },
        {
          id: 'day20-c1-t2',
          title: 'Task 2: Query Average Product Ratings',
          description: 'Join products with reviews to calculate the average rating and review count per product.',
          instructions: [
            'Query `products p` JOIN `reviews r` ON `p.product_id = r.product_id`.',
            'Select `p.product_id`, `p.name`, `AVG(r.rating) AS avg_rating`, and `COUNT(r.review_id) AS total_reviews`.',
            'Group by `p.product_id`, `p.name`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['reviews'],
          initialSql: '-- Average rating per product\n',
          solutionSql: 'SELECT p.product_id, p.name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS total_reviews FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
          solutionExplanation: 'Calculates review metrics per product.',
          hints: [{ level: 1, text: 'Use `JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 12,
          },
          successMessage: 'Spot on! Product ratings aggregated successfully.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 20 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-20-homework',
    title: 'Day 20 — DDL Operations (Homework)',
    scenario: 'Design and query the reviews table schema:',
    tasks: [
      {
        id: 'day20-hw-1',
        title: 'Task 1: Create a reviews table',
        description: 'Create a reviews table: review_id (PK, auto-increment), product_id (FK → products), customer_id (FK → customers), rating (1–5), comment (TEXT), created_at (DEFAULT CURRENT_TIMESTAMP).',
        instructions: [
          'Write `CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'reviews',
        initialSql: '-- Task 1: Create the reviews table\n',
        solutionSql: 'CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
        solutionExplanation: 'Creates the new reviews entity table.',
        hints: [{ level: 1, text: 'Use `CREATE TABLE reviews (...);`' }],
        validation: {
          targetTable: 'reviews',
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! Reviews table schema defined.',
      },
      {
        id: 'day20-hw-2',
        title: 'Task 2: Query average rating per product joining reviews and products',
        description: 'Query the average rating and review count per product joining reviews and products.',
        instructions: [
          'Select `p.product_id`, `p.name`, `AVG(r.rating) AS avg_rating`, `COUNT(r.review_id) AS total_reviews` from `products p` JOIN `reviews r` ON `p.product_id = r.product_id` GROUP BY `p.product_id`, `p.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['reviews'],
        initialSql: '-- Task 2: Average rating per product\n',
        solutionSql: 'SELECT p.product_id, p.name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS total_reviews FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
        solutionExplanation: 'Joins products to reviews to calculate rating metrics.',
        hints: [{ level: 1, text: 'Use `JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 2 completed! Product ratings aggregated.',
      },
    ],
  },
};

// =============================================================================
// DAY 21: Conceptual Session: Indexing, Transactions & Real-World SQL
// =============================================================================
export const DAY_21_MODULE: ModuleData = {
  id: 'day-21',
  slug: 'indexing-transactions-real-world',
  day: 21,
  title: 'Day 21 — Conceptual Session: Indexing, Transactions & Real-World SQL',
  shortTitle: 'Indexing, ACID & ORM vs SQL',
  type: 'conceptual_session',
  milestoneId: 'milestone-3',
  description: 'Understand B-tree indexing mechanics, read EXPLAIN plans, master ACID transaction guarantees, and understand when ORMs create N+1 performance issues.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Understand how B-Tree indexes speed up lookups (index vs table scan)',
    'Interpret EXPLAIN query plans (type: ALL vs type: ref/const)',
    'Explain the ACID transaction model in operational systems',
    'Recognize ORM pitfalls such as the N+1 query problem',
  ],
  concepts: [
    {
      id: 'indexes-acid-and-explain',
      order: 1,
      title: '1. B-Trees, EXPLAIN & ACID Guarantees',
      shortDescription: 'Performance optimization and transaction safety.',
      theory: {
        summary: 'An index is a B-tree data structure that allows the database to find rows in $O(\\log N)$ time rather than scanning every row ($O(N)$). Using `EXPLAIN` reveals whether a query performs a fast index lookup (`type: const` / `ref`) or an expensive full table scan (`type: ALL`).',
        introTable: {
          tableName: 'products (Indexed on price)',
          description: 'B-Tree index structure visualization',
          columns: ['B-Tree Key (price)', 'Row Pointer', 'product_name'],
          rows: [
            ['$12.50', 'Row 3', 'USB-C Cable (2m)'],
            ['$25.00', 'Row 1', 'Wireless Mouse'],
            ['$89.99', 'Row 2', 'Mechanical Keyboard'],
          ],
        },
        explanation: [
          '### 1. B-Tree Index Analogy',
          'Think of the index at the back of a textbook: instead of reading all 500 pages (Table Scan), you look up "PostgreSQL" on page 501 and jump straight to page 142.',
          '### 2. ACID Properties',
          '• **Atomicity**: All operations succeed, or all are rolled back.',
          '• **Consistency**: Database transitions only between valid constraint states.',
          '• **Isolation**: Concurrent transactions do not corrupt each other.',
          '• **Durability**: Committed data survives power failure.',
          'QUESTION_BLOCK::ORM vs Raw SQL::ORMs (like Prisma/Drizzle) are convenient, but careless loops cause N+1 query disasters (1 query to get 50 orders, plus 50 separate queries to get each order\'s items). A single SQL JOIN solves this in 1 fast query.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inspecting Query Plan with EXPLAIN',
            sqlSnippet: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
            explanation: 'Shows execution cost, estimated rows scanned, and index usage.',
            tableData: {
              tableName: 'EXPLAIN Output',
              columns: ['id', 'select_type', 'table', 'type', 'rows', 'Extra'],
              rows: [
                [1, 'SIMPLE', 'products', 'ALL', 20, 'Using where'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Query plan inspection and indexing',
            sql: '-- Inspect query execution plan\nEXPLAIN SELECT * FROM products WHERE price > 100;\n\n-- Create index on frequently filtered column\nCREATE INDEX idx_products_price ON products(price);',
            description: 'EXPLAIN output inspection and index creation.',
          },
        ],
        keyTakeaway: 'Indexes convert slow table scans into fast logarithmic searches; EXPLAIN shows you what the database is doing.',
        exampleQuery: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
        exampleQueryExplanation: 'Inspects execution plan for supplier_id lookup.',
        liveDemoSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
        liveDemoNotes: 'Displays query execution plan.',
        mcqs: [
          {
            question: 'In MySQL EXPLAIN output, what does `type: ALL` indicate?',
            options: [
              'A. All indexes were utilized',
              'B. A full table scan occurred, checking every row in the table',
              'C. The query ran in 0 milliseconds',
              'D. All columns were indexed',
            ],
            correctIndex: 1,
            explanation: '`type: ALL` signifies a full table scan without index acceleration.',
          },
        ],
        masteryPoints: ['Read EXPLAIN plans', 'Explain ACID transaction properties', 'Identify N+1 query patterns'],
      },
      tasks: [
        {
          id: 'day21-c1-t1',
          title: 'Task 1: Inspect Query Execution with EXPLAIN',
          description: 'Run EXPLAIN on a filtered query on the `products` table.',
          instructions: [
            'Run `EXPLAIN SELECT * FROM products WHERE price > 50;`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
          solutionExplanation: 'Inspects the query execution plan.',
          hints: [{ level: 1, text: 'Use `EXPLAIN SELECT * FROM products WHERE price > 50;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'EXPLAIN plan analyzed!',
        },
        {
          id: 'day21-c1-t2',
          title: 'Task 2: Supplier Lookup Plan Inspection',
          description: 'Inspect the query execution plan for finding products from supplier_id = 2.',
          instructions: [
            'Run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.',
            'End with a semicolon (;).',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Inspect supplier filter execution plan\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
          solutionExplanation: 'Generates execution plan for supplier_id lookup.',
          hints: [{ level: 1, text: 'Use `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Execution plan generated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 21 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-21-homework',
    title: 'Day 21 — Conceptual Session: Indexing & ACID (Homework)',
    scenario: 'Demonstrate your understanding of indexing and query plans:',
    tasks: [
      {
        id: 'day21-hw-1',
        title: 'Task 1: Run EXPLAIN on a product query',
        description: 'Run EXPLAIN on `SELECT * FROM products WHERE supplier_id = 2;`.',
        instructions: [
          'Run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Run EXPLAIN on supplier query\n',
        solutionSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
        solutionExplanation: 'Inspects index usage for supplier_id lookup.',
        hints: [{ level: 1, text: 'Use `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! Query plan verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 22: Project Part 3: Full-Stack Integration Queries
// =============================================================================
export const DAY_22_MODULE: ModuleData = {
  id: 'day-22',
  slug: 'project-part-3-integration-queries',
  day: 22,
  title: 'Day 22 — Project Part 3: Full-Stack Integration Queries',
  shortTitle: 'Project Part 3: Full-Stack Queries',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Write production-ready full-stack backend queries: Product Detail Page view, placing orders atomically, and multi-metric executive dashboard KPI summaries.',
  estimatedMinutes: 120,
  completionLearnings: [
    'Build a complete Product Detail Page query joining 4 entities',
    'Structure atomic order placement workflows',
    'Generate single-query executive KPI dashboard metrics',
  ],
  concepts: [
    {
      id: 'full-stack-query-patterns',
      order: 1,
      title: '1. Production Backend API Query Patterns',
      shortDescription: 'Product detail pages, order placement, and executive KPIs.',
      theory: {
        summary: 'In real full-stack web applications, backend route handlers issue rich SQL queries to hydrate entire UI screens in a single database round trip.',
        introTable: {
          tableName: 'products & categories & suppliers',
          description: 'Data sources for single-payload Product Detail View',
          columns: ['p.name', 'p.price', 'c.name (Category)', 's.name (Supplier)'],
          rows: [
            ['Wireless Mouse', 25.00, 'Electronics', 'Dhaka Tech Supplies'],
            ['Mechanical Keyboard', 89.99, 'Electronics', 'Dhaka Tech Supplies'],
          ],
        },
        explanation: [
          '### 1. Product Detail Page Query',
          'Joins product, category, and supplier into a single comprehensive record.',
          '### 2. Executive Dashboard KPI Query',
          'Aggregates total revenue, order count, and customer metrics.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Hydrating Product Detail Payload',
            sqlSnippet: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
            explanation: 'Consolidates product attributes, category label, and supplier info in 1 query.',
            tableData: {
              tableName: 'Hydrated View Payload',
              columns: ['product_id', 'name', 'price', 'category_name', 'supplier_name'],
              rows: [
                [1, 'Wireless Mouse', 25.00, 'Electronics', 'Dhaka Tech Supplies'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Product detail page backend query',
            sql: 'SELECT p.product_id, p.name, p.price, p.quantity_in_stock,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
            description: 'Hydrates a full product detail view in 1 round trip.',
          },
        ],
        keyTakeaway: 'Design comprehensive multi-table queries that satisfy full UI view requirements in a single round trip.',
        exampleQuery: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        exampleQueryExplanation: 'Hydrates detail view for product 1.',
        liveDemoSql: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        liveDemoNotes: 'Displays product detail payload.',
        mcqs: [
          {
            question: 'Why is it preferable to fetch all product page details in a single joined query rather than 4 separate queries?',
            options: [
              'A. It minimizes network latency and round trips between backend API and database',
              'B. SQL only allows 1 query per hour',
              'C. It saves hard drive space',
              'D. It disables indexes',
            ],
            correctIndex: 0,
            explanation: 'Consolidating into a single query eliminates unnecessary network latency round trips.',
          },
        ],
        masteryPoints: ['Write multi-entity UI hydration queries', 'Construct executive KPI summaries'],
      },
      tasks: [
        {
          id: 'day22-c1-t1',
          title: 'Task 1: Product Detail Page Query',
          description: 'Retrieve product information with category name and supplier name for `product_id = 1`.',
          instructions: [
            'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories', 'suppliers'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
          solutionExplanation: 'Hydrates the product detail view across 3 joined tables.',
          hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Product detail query verified!',
        },
        {
          id: 'day22-c1-t2',
          title: 'Task 2: Executive Dashboard Summary Query',
          description: 'Calculate overall total distinct orders and grand total revenue in a single query.',
          instructions: [
            'Query `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Select `COUNT(DISTINCT o.order_id) AS total_orders` and `SUM(oi.quantity * oi.unit_price) AS total_revenue`.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Executive dashboard summary\n',
          solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
          solutionExplanation: 'Calculates high-level executive KPI metrics.',
          hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
          validation: {
            targetTable: 'orders',
            requireJoin: true,
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Dashboard metrics calculated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 22 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-22-homework',
    title: 'Day 22 — Project Part 3: Integration Queries (Homework)',
    scenario: 'Construct the backend integration queries:',
    tasks: [
      {
        id: 'day22-hw-1',
        title: 'Task 1: "Get Product Detail Page" query',
        description: '"Get Product Detail Page": product info + category name + supplier name for product 1.',
        instructions: [
          'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories', 'suppliers'],
        initialSql: '-- Task 1: Product Detail Page query\n',
        solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        solutionExplanation: 'Multi-table join hydrating the full product page payload.',
        hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireWhere: true,
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! Product detail page query verified.',
      },
      {
        id: 'day22-hw-2',
        title: 'Task 2: "Dashboard KPI Query" (Total Revenue and Total Orders)',
        description: 'Dashboard KPI query: calculate total revenue and total order count.',
        instructions: [
          'Select `COUNT(DISTINCT o.order_id) AS total_orders`, `SUM(oi.quantity * oi.unit_price) AS total_revenue` from `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Task 2: Dashboard KPI Query\n',
        solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
        solutionExplanation: 'Computes high-level KPI metrics in a single query.',
        hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
        validation: {
          targetTable: 'orders',
          requireJoin: true,
          expectedRowCount: 1,
        },
        successMessage: 'Task 2 completed! Executive KPI metrics verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 23: Project Part 4: Polish, Edge Cases & Performance
// =============================================================================
export const DAY_23_MODULE: ModuleData = {
  id: 'day-23',
  slug: 'project-part-4-edge-cases-performance',
  day: 23,
  title: 'Day 23 — Project Part 4: Polish, Edge Cases & Performance',
  shortTitle: 'Project Part 4: Edge Cases & Performance',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Audit query execution with EXPLAIN, handle zero-value edge cases with LEFT JOIN and COALESCE, and create targeted indexes for high-traffic query paths.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Audit query execution plans using EXPLAIN to spot table scans',
    'Handle 0-review and 0-order edge cases using LEFT JOIN and COALESCE',
    'Create composite and single-column indexes on high-frequency filters',
  ],
  concepts: [
    {
      id: 'performance-and-edge-cases',
      order: 1,
      title: '1. Edge Case Handling & Index Optimization',
      shortDescription: 'COALESCE, LEFT JOIN, and performance indexing.',
      theory: {
        summary: 'Production queries must handle edge cases gracefully: products with 0 reviews must display 0 rather than vanishing, and high-frequency search columns must have indexes.',
        introTable: {
          tableName: 'products & reviews (with Nulls)',
          description: 'Catalog items with and without reviews',
          columns: ['p.name', 'r.rating', 'COALESCE(r.rating, 0)'],
          rows: [
            ['Wireless Mouse', 5, 5],
            ['Ergonomic Desk Chair', null, 0],
          ],
        },
        explanation: [
          '### 1. Graceful Edge Case Handling with COALESCE',
          '`COALESCE(AVG(r.rating), 0)` ensures that if a product has no reviews, the rating displays as 0.0 instead of NULL.',
          '### 2. Index Creation',
          '`CREATE INDEX idx_orders_customer_id ON orders(customer_id);` ensures instant lookups during customer history queries.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Preserving Zero-Review Products with LEFT JOIN',
            sqlSnippet: 'SELECT p.product_id, p.name, COUNT(r.review_id) AS review_count\nFROM products p\nLEFT JOIN reviews r ON p.product_id = r.product_id\nGROUP BY p.product_id, p.name;',
            explanation: 'Preserves all 20 catalog products regardless of review counts.',
            tableData: {
              tableName: 'Zero-Safe Review Counts',
              columns: ['product_id', 'name', 'review_count'],
              rows: [
                [1, 'Wireless Mouse', 2],
                [4, 'Ergonomic Desk Chair', 0],
                [6, '4K UltraHD Monitor (27-inch)', 0],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Robust edge-case query',
            sql: 'SELECT p.product_id, p.name,\n       COALESCE(COUNT(r.review_id), 0) AS review_count,\n       COALESCE(AVG(r.rating), 0) AS avg_rating\nFROM products p\nLEFT JOIN reviews r ON p.product_id = r.product_id\nGROUP BY p.product_id, p.name;',
            description: 'Preserves unreviewed products with clean 0 defaults.',
          },
        ],
        keyTakeaway: 'Use LEFT JOIN with COALESCE to prevent zero-state records from vanishing.',
        exampleQuery: 'SELECT p.name, COALESCE(COUNT(r.review_id), 0) AS reviews FROM products p LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
        exampleQueryExplanation: 'Lists all products with safe review counts.',
        liveDemoSql: 'SELECT p.name, COALESCE(COUNT(r.review_id), 0) AS reviews FROM products p LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name LIMIT 5;',
        liveDemoNotes: 'Displays products with 0 reviews preserved.',
        mcqs: [
          {
            question: 'What does `COALESCE(value, 0)` do when `value` is NULL?',
            options: ['A. Throws an error', 'B. Returns 0', 'C. Returns NULL', 'D. Deletes the row'],
            correctIndex: 1,
            explanation: 'COALESCE returns the first non-null argument in its list.',
          },
        ],
        masteryPoints: ['Use COALESCE for null-safety', 'Design targeted indexes'],
      },
      tasks: [
        {
          id: 'day23-c1-t1',
          title: 'Task 1: Null-Safe Product Review Summary',
          description: 'List all products with review count, using LEFT JOIN so products with 0 reviews remain in the list.',
          instructions: [
            'Select `p.product_id`, `p.name`, `COUNT(r.review_id) AS review_count` from `products p` LEFT JOIN `reviews r` ON `p.product_id = r.product_id`.',
            'Group by `p.product_id`, `p.name`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['reviews'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT p.product_id, p.name, COUNT(r.review_id) AS review_count FROM products p LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
          solutionExplanation: 'LEFT JOIN keeps all products with 0 review counts.',
          hints: [{ level: 1, text: 'Use `LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 28,
          },
          successMessage: 'Null-safe review report verified!',
        },
        {
          id: 'day23-c1-t2',
          title: 'Task 2: Customer Order Volume Audit',
          description: 'List all customers with their order count, using LEFT JOIN so customers with 0 orders are preserved.',
          instructions: [
            'Query `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
            'Select `c.customer_id`, `c.name`, and `COALESCE(COUNT(o.order_id), 0) AS total_orders`.',
            'Group by `c.customer_id`, `c.name`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Null-safe customer order audit\n',
          solutionSql: 'SELECT c.customer_id, c.name, COALESCE(COUNT(o.order_id), 0) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
          solutionExplanation: 'Preserves all customers with LEFT JOIN and COALESCE.',
          hints: [{ level: 1, text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`' }],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 15,
          },
          successMessage: 'Spot on! All customer records preserved with clean zero counts.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 23 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-23-homework',
    title: 'Day 23 — Project Part 4: Edge Cases (Homework)',
    scenario: 'Handle edge cases and create database indexes:',
    tasks: [
      {
        id: 'day23-hw-1',
        title: 'Task 1: Handle edge cases: products with 0 reviews (LEFT JOIN)',
        description: 'Products with 0 reviews (should show 0, not disappear — LEFT JOIN).',
        instructions: [
          'Select `p.product_id`, `p.name`, `COUNT(r.review_id) AS total_reviews` from `products p` LEFT JOIN `reviews r` ON `p.product_id = r.product_id` GROUP BY `p.product_id`, `p.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['reviews'],
        initialSql: '-- Task 1: Handle 0-review edge case with LEFT JOIN\n',
        solutionSql: 'SELECT p.product_id, p.name, COUNT(r.review_id) AS total_reviews FROM products p LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
        solutionExplanation: 'Preserves all products using LEFT JOIN and counts reviews accurately.',
        hints: [{ level: 1, text: 'Use `LEFT JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 28,
        },
        successMessage: 'Task 1 completed! Zero-review edge cases handled.',
      },
    ],
  },
};

// =============================================================================
// DAY 24: Milestone Assignment 3: Comprehensive Final Assessment
// =============================================================================
export const DAY_24_MODULE: ModuleData = {
  id: 'day-24',
  slug: 'milestone-3-final-assessment',
  day: 24,
  title: 'Day 24 — Milestone Assignment 3: Comprehensive Final Assessment',
  shortTitle: 'Milestone 3 Final Assessment',
  type: 'assignment',
  milestoneId: 'milestone-3',
  description: 'Comprehensive capstone assessment covering advanced multi-table CTEs, correlated benchmarks, safe data mutations, schema alterations, and query optimization.',
  estimatedMinutes: 120,
  completionLearnings: [
    'Write top-category revenue rankings with CTEs and multi-table joins',
    'Calculate correlated customer spend benchmarks against table-wide averages',
    'Safely update inventory stock batches',
    'Alter tables and add column defaults',
    'Identify slow queries and write CREATE INDEX fixes',
  ],
  concepts: [
    {
      id: 'capstone-evaluation',
      order: 1,
      title: '1. Milestone 3 Capstone Evaluation',
      shortDescription: 'Final comprehensive SQL certification assessment.',
      theory: {
        summary: 'Milestone 3 Capstone: "Can write advanced multi-table CTEs, correlated subqueries, manage schema and mutations safely, and optimize execution with indexes."',
        introTable: {
          tableName: 'categories & products & order_items',
          description: 'Multi-table revenue aggregation pipeline',
          columns: ['cat.name', 'p.name', 'oi.quantity', 'oi.unit_price'],
          rows: [
            ['Electronics', 'Wireless Mouse', 2, 25.00],
            ['Electronics', 'Mechanical Keyboard', 1, 89.99],
            ['Office Furniture', 'Ergonomic Desk Chair', 1, 249.00],
          ],
        },
        explanation: [
          '### 1. Final Assessment Deliverables',
          '1. **Complex Retrieval**: Top categories by revenue with product count and order value.',
          '2. **Correlated / CTE Query**: Customers whose average order spend exceeds the overall average.',
          '3. **Safe Mutation**: Stock level adjustments.',
          '4. **Schema Modification**: Adding status column with default.',
          '5. **Optimization**: Index creation for query acceleration.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Top 3 Categories by Revenue Ranking',
            sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC\nLIMIT 3;',
            explanation: 'Aggregates sales revenue per product category and limits to the top 3.',
            tableData: {
              tableName: 'Top 3 Revenue Categories',
              columns: ['name', 'category_revenue'],
              rows: [
                ['Electronics', 734.97],
                ['Office Furniture', 420.00],
                ['Accessories', 157.48],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Mastery SQL syntax',
            sql: 'WITH CategoryRevenue AS (\n  SELECT c.category_id, c.name, SUM(oi.quantity * oi.unit_price) AS rev\n  FROM categories c\n  JOIN products p ON c.category_id = p.category_id\n  JOIN order_items oi ON p.product_id = oi.product_id\n  GROUP BY c.category_id, c.name\n)\nSELECT * FROM CategoryRevenue ORDER BY rev DESC LIMIT 3;',
            description: 'Capstone multi-stage CTE analysis.',
          },
        ],
        keyTakeaway: 'Demonstrate complete fluency in advanced SQL.',
        exampleQuery: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_id, c.name ORDER BY rev DESC LIMIT 3;',
        exampleQueryExplanation: 'Top 3 categories by total revenue.',
        liveDemoSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_id, c.name ORDER BY rev DESC LIMIT 3;',
        liveDemoNotes: 'Displays top 3 revenue categories.',
        mcqs: [
          {
            question: 'What combination of tools enables optimal read performance in high-scale relational databases?',
            options: [
              'A. Targeted B-tree indexes, normalized schema design, and clean JOINs without Cartesian fan-out',
              'B. Removing all constraints',
              'C. Storing everything in 1 text column',
              'D. Disabling foreign keys',
            ],
            correctIndex: 0,
            explanation: 'Targeted indexes, normalization, and precise joins provide maximum efficiency.',
          },
        ],
        masteryPoints: ['Complete all Milestone 3 Capstone tasks'],
      },
      tasks: [
        {
          id: 'day24-c1-t1',
          title: 'Task 1: Top 3 Categories by Revenue',
          description: 'Calculate top 3 categories by total revenue generated across order items.',
          instructions: [
            'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Group by `cat.category_id`, `cat.name`.',
            'Order by `category_revenue DESC` LIMIT 3.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'categories',
          secondaryTables: ['products', 'order_items'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;',
          solutionExplanation: 'Ranks top 3 categories by revenue.',
          hints: [{ level: 1, text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;`' }],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireGroupBy: true,
            requireOrderBy: [{ column: 'category_revenue', direction: 'DESC' }],
            requireLimit: 3,
            expectedRowCount: 3,
          },
          successMessage: 'Top 3 revenue categories calculated!',
        },
        {
          id: 'day24-c1-t2',
          title: 'Task 2: Above-Average Customer Spenders',
          description: 'Find customers whose total spend is higher than the overall average customer spend using a CTE.',
          instructions: [
            'Define `WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name)`.',
            'Select all columns from `CustomerTotals` where `total_spent > (SELECT AVG(total_spent) FROM CustomerTotals)` ordered by `total_spent DESC`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- High-spending customer benchmark\n',
          solutionSql: 'WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;',
          solutionExplanation: 'Calculates high-value customers above average threshold.',
          hints: [{ level: 1, text: 'Use `WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;`' }],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 5,
          },
          successMessage: 'Spot on! Above-average spenders filtered with CTE benchmark.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 24 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-24-homework',
    title: 'Day 24 — Milestone Assignment 3: Final Assessment',
    scenario: 'Complete the comprehensive capstone assessment deliverables:',
    tasks: [
      {
        id: 'day24-hw-1',
        title: 'Task 1: Top 3 categories by revenue',
        description: 'Top 3 categories by revenue (categories → products → order_items).',
        instructions: [
          'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC` LIMIT 3.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'categories',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Task 1: Top 3 categories by revenue\n',
        solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;',
        solutionExplanation: 'Joins across 3 tables and sums revenue per category.',
        hints: [{ level: 1, text: 'Use `ORDER BY category_revenue DESC LIMIT 3;`' }],
        validation: {
          targetTable: 'categories',
          requireJoin: true,
          requireGroupBy: true,
          requireOrderBy: [{ column: 'category_revenue', direction: 'DESC' }],
          requireLimit: 3,
          expectedRowCount: 3,
        },
        successMessage: 'Task 1 completed! Top 3 revenue categories verified.',
      },
      {
        id: 'day24-hw-2',
        title: 'Task 2: Correlated / CTE query: Customers with above-average total spend',
        description: 'Find customers whose total spend is higher than the overall average customer spend.',
        instructions: [
          'Use `WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 2: Customers with above-average total spend\n',
        solutionSql: 'WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;',
        solutionExplanation: 'Uses CTE with subquery benchmark to filter high-spending accounts.',
        hints: [{ level: 1, text: 'Use `WITH CustomerTotals AS (...) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals);`' }],
        validation: {
          targetTable: 'customers',
          expectedRowCount: 5,
        },
        successMessage: 'Task 2 completed! High-value customer benchmark verified.',
      },
      {
        id: 'day24-hw-3',
        title: 'Task 3: Schema modification (ALTER TABLE products ADD COLUMN status)',
        description: 'Add a status column to products: `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
        instructions: [
          'Execute `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 3: Alter table products add status column\n',
        solutionSql: 'ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';',
        solutionExplanation: 'Alters products table schema by appending the status column with default value.',
        hints: [{ level: 1, text: 'Use `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 1,
        },
        successMessage: 'Task 3 completed! Schema altered with status column.',
      },
    ],
  },
};

// =============================================================================
// DAY 25: Graduation & Real-World Bridge
// =============================================================================
export const DAY_25_MODULE: ModuleData = {
  id: 'day-25',
  slug: 'graduation-real-world-bridge',
  day: 25,
  title: 'Day 25 — Graduation & Real-World Bridge',
  shortTitle: 'Graduation & Window Functions',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Celebrate your 25-day SQL journey, learn modern Window Functions (ROW_NUMBER OVER PARTITION BY), and bridge your skills to Node.js/TypeScript backend production development.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Write modern Window Functions using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)',
    'Bridge SQL skills to backend Node.js / TypeScript libraries (Drizzle, Prisma, pg, mysql2)',
    'Review the complete progression from Day 1 table basics to Day 25 full database engineering',
  ],
  concepts: [
    {
      id: 'window-functions-and-future',
      order: 1,
      title: '1. Window Functions (OVER & PARTITION BY)',
      shortDescription: 'Calculate running metrics without collapsing rows.',
      theory: {
        summary: 'Window functions perform calculations across a set of table rows related to the current row without collapsing them into a single summary row. `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC)` assigns ranks to products within each category.',
        introTable: {
          tableName: 'products (Ranked in Category)',
          description: 'Window function category partition output',
          columns: ['name', 'category_id', 'price', 'rank_in_category'],
          rows: [
            ['Mechanical Keyboard', 1, 89.99, 1],
            ['Wireless Mouse', 1, 25.00, 2],
            ['Ergonomic Desk Chair', 3, 249.00, 1],
          ],
        },
        explanation: [
          '### 1. The Power of Window Functions',
          'Unlike `GROUP BY` which collapses rows into buckets, a Window Function keeps all rows while adding analytical ranking or running totals:',
          '```sql\nSELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n```',
          '### 2. Congratulations on Completing the 25-Day SQL Master Curriculum!',
          'From Day 1 "What is a table?" to Day 25 "Multi-table CTEs, schema architecture, and window functions" — you have built genuine relational database mastery.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Partitioning Products by Category and Ranking by Price',
            sqlSnippet: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
            explanation: 'Assigns ranks 1, 2, 3... within each category partition ordered by price descending.',
            tableData: {
              tableName: 'Partitioned Product Rankings',
              columns: ['name', 'category_id', 'price', 'category_rank'],
              rows: [
                ['4K UltraHD Monitor (27-inch)', 1, 349.99, 1],
                ['Thunderbolt 4 Docking Station', 1, 185.00, 2],
                ['Mechanical Keyboard', 1, 89.99, 3],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Window function syntax',
            sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_in_category\nFROM products;',
            description: 'Ranks items inside each partition.',
          },
        ],
        keyTakeaway: 'Window functions calculate partition rankings and running aggregates without collapsing individual rows.',
        exampleQuery: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
        exampleQueryExplanation: 'Ranks products within each category.',
        liveDemoSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products LIMIT 10;',
        liveDemoNotes: 'Displays window function category rankings.',
        mcqs: [
          {
            question: 'What is the main difference between GROUP BY and a Window Function with PARTITION BY?',
            options: [
              'A. GROUP BY collapses rows into a single summary row per group; Window Functions retain individual rows and append calculated metrics',
              'B. Window Functions only work on strings',
              'C. GROUP BY is deprecated',
              'D. Window Functions delete duplicates',
            ],
            correctIndex: 0,
            explanation: 'Window functions compute partition metrics while preserving all individual rows.',
          },
        ],
        masteryPoints: ['Write Window Functions using PARTITION BY and ORDER BY', 'Graduate with full 25-day SQL mastery'],
      },
      tasks: [
        {
          id: 'day25-c1-t1',
          title: 'Task 1: Rank Products within Categories',
          description: 'Use ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) to rank products in each category.',
          instructions: [
            'Select `name`, `category_id`, `price`, `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
          solutionExplanation: 'Ranks products by price within each category.',
          hints: [{ level: 1, text: 'Use `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'category_id', 'price', 'category_rank'],
            expectedRowCount: 28,
          },
          successMessage: 'Window function ranking verified!',
        },
        {
          id: 'day25-c1-t2',
          title: 'Task 2: Top 2 Products per Category via CTE',
          description: 'Combine a Window Function with a CTE to extract only the top 2 highest priced products per category.',
          instructions: [
            'Define `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products)`.',
            'Select all columns from `RankedProducts` where `rank_num <= 2`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Top 2 products per category with window function\n',
          solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
          solutionExplanation: 'Extracts top 2 ranked products per category.',
          hints: [{ level: 1, text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 11,
          },
          successMessage: 'Congratulations! You have completed the entire 25-Day SQL Master Curriculum!',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 25 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-25-homework',
    title: 'Day 25 — Graduation & Real-World Bridge (Homework)',
    scenario: 'Complete the final Window Function challenge to earn your graduation certification:',
    tasks: [
      {
        id: 'day25-hw-1',
        title: 'Task 1: Top 2 most expensive products in each category (Window Function + CTE)',
        description: 'Find the top 2 most expensive products in each category using ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC).',
        instructions: [
          'Use `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories'],
        initialSql: '-- Task 1: Top 2 products in each category using Window Function\n',
        solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
        solutionExplanation: 'Combines a Window Function inside a CTE to slice the top 2 products per category.',
        hints: [{ level: 1, text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 11,
        },
        successMessage: 'Task 1 completed! Congratulations on graduating the 25-Day SQL Master Curriculum!',
      },
    ],
  },
};
