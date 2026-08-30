import { ModuleData } from '../../types/curriculum';

export const Day_22_MODULE: ModuleData = {
  id: 'day-18',
  slug: 'practice-subqueries-ctes',
  day: 18,
  title: 'Day 18 — Guided Practice: Advanced Subqueries & CTEs',
  shortTitle: 'Practice: Correlated Subqueries & CTEs',
  type: 'practice_day',
  milestoneId: 'milestone-3',
  description: 'Practice writing correlated subqueries, multi-stage CTE aggregations, and refactoring nested subqueries into clean Common Table Expressions.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Write correlated subqueries linking inner and outer table references with table aliases',
    'Calculate customer financial spend inside a CTE and extract tier segments',
    'Refactor nested subqueries into maintainable, staged Common Table Expressions',
  ],
  concepts: [
    {
      id: 'correlated-and-staged-ctes',
      order: 1,
      title: '1. Correlated Subqueries & CTE Refactoring',
      shortDescription: 'Category benchmarks and tiered spend CTEs.',
      theory: {
        summary: 'Reinforce advanced subqueries and CTEs: compare items against localized category averages using correlated subqueries, build tiered analytical customer segments, and refactor nested queries into clean CTEs.',
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
          '### 1. Correlated Subquery Scaffolding',
          'Remember: For each product row `p1`, the inner query runs `SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id`.',
          '### 2. Multi-Stage CTE Reporting',
          '```sql\nWITH CustomerSpend AS (\n  SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.customer_id = o.customer_id\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY c.customer_id, c.name\n)\nSELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;\n```',
          '### 3. CTE Refactoring Pattern',
          'When queries require multi-step aggregation, CTEs allow you to stage the metrics cleanly without deep nesting.',
        ],
        targetQuery: {
          sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
          explanation: 'Compare products against localized category benchmarks with a correlated subquery.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Evaluating Category Averages Correlated per Row',
            sqlSnippet: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
            explanation: 'Computes category benchmark for each product dynamically.',
            tableData: {
              tableName: 'Above-Category-Average Items',
              columns: ['name', 'price', 'category_id'],
              highlightedColumns: ['name', 'price', 'category_id'],
              rows: [
                ['Mechanical Keyboard', 65.00, 1],
                ['Gaming Headset', 55.00, 1],
                ['Office Chair', 120.00, 3],
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
        masteryPoints: ['Write correlated subqueries', 'Write staged analytical CTEs', 'Refactor nested subqueries into CTEs'],
      },
      tasks: [
        {
          id: 'day18-c1-t1',
          title: 'Task 1 (High Guidance): Products Above Category Average',
          description: 'Find products that cost more than the average price of the products in their own category. Show name, price, and category_id.',
          instructions: [
            'Query `products p1`.',
            'Select `p1.name`, `p1.price`, and `p1.category_id`.',
            'Where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Task 1: High Guidance - Products above category average\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
          solutionSql: 'SELECT p1.name, p1.price, p1.category_id FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
          solutionExplanation: 'Correlated subquery compares each product against its own category average.',
          hints: [
            { level: 1, text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 12,
          },
          successMessage: 'Task 1 completed! Products above category average found.',
        },
        {
          id: 'day18-c1-t2',
          title: 'Task 2 (Partial Guidance): High Spenders Tier CTE (> $150)',
          description: 'Build a CTE named CustomerSpend to calculate total spend per customer, then query customers who spent more than $150.',
          instructions: [
            'Define `WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name)`.',
            'Select all columns from `CustomerSpend` where `total_spent > 150` ordered by `total_spent DESC`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Task 2: Partial Guidance - Staged CTE for high-spend tier\n',
          solutionSql: 'WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;',
          solutionExplanation: 'Calculates customer spend inside CTE and extracts customers above $150.',
          hints: [
            { level: 1, text: 'Define the CTE at the top with `WITH CustomerSpend AS (...)`.' },
            { level: 2, text: 'Query `SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;`.' },
          ],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 2,
          },
          successMessage: 'Task 2 completed! High-spend customer tier analyzed with CTE.',
        },
        {
          id: 'day18-c1-t3',
          title: 'Task 3 (Goal Only): CTE Refactoring Challenge',
          description: 'Create a CTE named HighValueOrders that selects order_id and order_date from orders having status = "delivered", then join it with order_items to sum total revenue per order for delivered orders.',
          instructions: [
            'Define `WITH DeliveredOrders AS (SELECT order_id, order_date FROM orders WHERE status = \'delivered\')`.',
            'Select `d.order_id`, `d.order_date`, `SUM(oi.quantity * oi.unit_price) AS order_total` from `DeliveredOrders d` JOIN `order_items oi` ON `d.order_id = oi.order_id`.',
            'Group by `d.order_id`, `d.order_date`.',
            'Order by `order_total DESC`.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Task 3: Goal Only - CTE Refactoring Challenge\n',
          solutionSql: 'WITH DeliveredOrders AS (SELECT order_id, order_date FROM orders WHERE status = \'delivered\') SELECT d.order_id, d.order_date, SUM(oi.quantity * oi.unit_price) AS order_total FROM DeliveredOrders d JOIN order_items oi ON d.order_id = oi.order_id GROUP BY d.order_id, d.order_date ORDER BY order_total DESC;',
          solutionExplanation: 'Refactors delivered order filtering into a clean CTE, joined with order items.',
          hints: [
            { level: 1, text: 'Stage delivered orders in `WITH DeliveredOrders AS (...)`.' },
            { level: 2, text: 'Join `DeliveredOrders d` with `order_items oi` on `d.order_id = oi.order_id`.' },
          ],
          validation: {
            targetTable: 'orders',
            requireJoin: true,
            requireGroupBy: true,
            requireOrderBy: [{ column: 'order_total', direction: 'DESC' }],
            expectedRowCount: 11,
          },
          successMessage: 'Task 3 completed! Nested pipeline refactored into a clean CTE.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 18 CHALLENGE: SUBQUERIES & CTES PIPELINE CHALLENGE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-18-homework',
    title: 'Day 18 — Subqueries & CTEs Pipeline Challenge (Ending Activity)',
    scenario: 'Complete these 2 analytical challenges independently:',
    tasks: [
      {
        id: 'day18-hw-1',
        title: 'Task 1: Products priced above their own category average',
        description: 'Find products whose price is higher than the average price of the products in the same category. Show name and price.',
        instructions: [
          'Select `p1.name`, `p1.price` from `products p1` where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Products priced above their own category average\n',
        solutionSql: 'SELECT p1.name, p1.price FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        solutionExplanation: 'Executes a correlated subquery per category.',
        hints: [{ level: 1, text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`' }],
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
