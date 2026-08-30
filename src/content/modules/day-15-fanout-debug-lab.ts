import { ModuleData } from '../../types/curriculum';

export const Day_15_MODULE: ModuleData = {
  id: 'day-12',
  slug: 'practice-joins-aggregates',
  day: 12,
  title: 'Day 12 — Debugging Lab: Multi-Table Aggregation & Fan-Out',
  shortTitle: 'Debug: Fan-Out & Aggregations',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Diagnose and fix cartesian fan-out row multiplication bugs when joining one-to-many tables, and master COUNT(DISTINCT) for safe multi-table aggregations.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Diagnose cartesian fan-out row multiplication when joining one-to-many parent and child tables',
    'Understand why COUNT(o.order_id) overcounts and how COUNT(DISTINCT o.order_id) guarantees accurate metrics',
    'Calculate per-customer order counts and financial spend totals across 3 joined tables',
  ],
  concepts: [
    {
      id: 'fan-out-and-distinct-counts',
      order: 1,
      title: '1. Diagnosing Row Multiplication & Fan-Out Bugs',
      shortDescription: 'Why joining multiple one-to-many tables duplicates rows.',
      theory: {
        summary: 'When you join customers → orders → order_items, each order row is duplicated for every line item it contains. Running COUNT(o.order_id) counts joined result rows, inflating order counts! Fix: COUNT(DISTINCT o.order_id) counts distinct orders accurately.',
        introTable: {
          tableName: 'orders & order_items (Joined Output)',
          description: 'Row duplication across line items',
          columns: ['c.name', 'o.order_id', 'oi.order_item_id', 'oi.quantity', 'oi.unit_price'],
          rows: [
            ['Rahim Chowdhury', 1, 1, 2, 15.99],
            ['Rahim Chowdhury', 1, 2, 1, 65.00],
            ['Rahim Chowdhury', 14, 22, 1, 45.50],
            ['Rahim Chowdhury', 14, 23, 1, 55.00],
            ['Rahim Chowdhury', 14, 24, 1, 65.00],
          ],
        },
        explanation: [
          '### 1. 🚨 The Production Bug: Expected 2 Orders, Query Returned 5!',
          'Look at Rahim\'s orders in the joined output above:',
          '• Rahim placed **2 orders** (Order #1 and Order #14).',
          '• Order #1 has 2 line items $\\rightarrow$ creates 2 rows.',
          '• Order #14 has 3 line items $\\rightarrow$ creates 3 rows.',
          '• Running `COUNT(o.order_id)` returns **5** ❌ (it counts duplicate joined rows!).',
          '### 2. The Solution: COUNT(DISTINCT o.order_id)',
          '`COUNT(DISTINCT o.order_id)` ignores duplicate order IDs and returns **2** ✅.',
          'Whenever you aggregate parent entities while joining down a one-to-many relationship, ALWAYS use `COUNT(DISTINCT parent_pk)`.',
        ],
        targetQuery: {
          sql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS distinct_orders, SUM(oi.quantity * oi.unit_price) AS total_spend\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nINNER JOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name;',
          explanation: 'Calculate accurate order counts and spend per customer, avoiding fan-out row inflation.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Multi-Table Joins (Fan-Out Multiplication)',
            sqlSnippet: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id',
            explanation: 'Joining down to line items duplicates order rows for every item purchased.',
            tableData: {
              tableName: 'Multiplied Joined Line Items',
              columns: ['c.name', 'o.order_id', 'oi.quantity', 'oi.unit_price'],
              rows: [
                ['Rahim Chowdhury', 1, 2, 15.99],
                ['Rahim Chowdhury', 1, 1, 65.00],
                ['Rahim Chowdhury', 14, 1, 45.50],
                ['Rahim Chowdhury', 14, 1, 55.00],
                ['Rahim Chowdhury', 14, 1, 65.00],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: COUNT(DISTINCT o.order_id) & SUM(...) GROUP BY c.customer_id',
            sqlSnippet: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS distinct_orders, SUM(oi.quantity * oi.unit_price) AS total_spend',
            explanation: 'Deduplicates order count to 2 while correctly summing all line item financial values.',
            tableData: {
              tableName: 'Accurate Customer Summary Result',
              columns: ['name', 'distinct_orders', 'total_spend'],
              highlightedColumns: ['distinct_orders', 'total_spend'],
              highlightedRows: [0, 1, 2, 3],
              rows: [
                ['Rafiul Islam', 2, 262.48],
                ['Priya Akter', 1, 55.00],
                ['Tanvir Ahmed', 2, 94.79],
                ['Nusrat Jahan', 1, 56.97],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Accurate multi-table aggregation',
            sql: 'SELECT c.customer_id, c.name,\n       COUNT(DISTINCT o.order_id) AS order_count,\n       SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
            description: 'Accurate customer spend with fan-out prevention.',
          },
        ],
        keyTakeaway: 'Use COUNT(DISTINCT) when joining one-to-many relationships to avoid overcounting parent entities.',
        exampleQuery: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
        exampleQueryExplanation: 'Accurately calculates order count and spend per customer.',
        liveDemoSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name LIMIT 5;',
        liveDemoNotes: 'Displays customer spend metrics with fan-out prevention.',
        mcqs: [
          {
            question: 'Why does COUNT(o.order_id) overcount when joining orders with order_items?',
            options: [
              'A. Because SQL adds an extra row for table headers',
              'B. Because each order row is duplicated for every line item in order_items',
              'C. Because order_items has no primary key',
              'D. Because COUNT requires single quotes',
            ],
            correctIndex: 1,
            explanation: 'Joining a one-to-many relationship multiplies parent rows by the number of children.',
          },
        ],
        masteryPoints: ['Use COUNT(DISTINCT) to prevent fan-out overcounting'],
      },
      tasks: [
        {
          id: 'day12-c1-t1',
          title: 'Task 1 (Guided Fix): Fix Customer Order Count & Spend',
          description: 'Calculate distinct order count and total money spent per customer across 3 joined tables.',
          instructions: [
            'Query `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, and `SUM(oi.quantity * oi.unit_price) AS total_spent`.',
            'Group by `c.customer_id`, `c.name`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Fix the overcounting query below\nSELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name;',
          solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
          solutionExplanation: 'Multi-table join calculating accurate customer order totals using COUNT(DISTINCT).',
          hints: [
            { level: 1, text: 'Use `COUNT(DISTINCT o.order_id)` to avoid counting duplicate order line items.' },
            { level: 2, text: 'Use `SUM(oi.quantity * oi.unit_price)` to compute total financial spend.' },
          ],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 12,
          },
          successMessage: 'Task 1 completed! Customer spend and order counts accurately calculated.',
        },
        {
          id: 'day12-c1-t2',
          title: 'Task 2 (Transfer): Category Product Inventory Valuation',
          description: 'Join categories with products to calculate total inventory units and average product price per category.',
          instructions: [
            'Query `categories c` JOIN `products p` ON `c.category_id = p.category_id`.',
            'Select `c.name AS category_name`, `SUM(p.quantity_in_stock) AS total_units`, and `AVG(p.price) AS avg_price`.',
            'Group by `c.category_id`, `c.name`.',
          ],
          type: 'independent',
          primaryTable: 'categories',
          secondaryTables: ['products'],
          initialSql: '-- Category inventory metrics\n',
          solutionSql: 'SELECT c.name AS category_name, SUM(p.quantity_in_stock) AS total_units, AVG(p.price) AS avg_price FROM categories c JOIN products p ON c.category_id = p.category_id GROUP BY c.category_id, c.name;',
          solutionExplanation: 'Aggregates stock units and average price per category across joined tables.',
          hints: [
            { level: 1, text: 'Join `categories c` with `products p` on `c.category_id = p.category_id`.' },
            { level: 2, text: 'Group by `c.category_id, c.name`.' },
          ],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 5,
          },
          successMessage: 'Task 2 completed! Category inventory valuation generated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 12 CHALLENGE: DEBUG THE PRODUCTION OVERCOUNTING BUG (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-12-homework',
    title: 'Day 12 — Debug the Production Overcounting Bug (Ending Activity)',
    scenario: 'Solve these multi-table reporting queries with fan-out prevention:',
    tasks: [
      {
        id: 'day12-hw-1',
        title: 'Task 1: Per-customer order counts and spend totals across multiple joins',
        description: 'Per-customer distinct order counts and spend totals across customers, orders, and order_items.',
        instructions: [
          'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Challenge: Per-customer spend totals with fan-out prevention\n',
        solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
        solutionExplanation: 'Multi-table join calculating customer spend with distinct order counts.',
        hints: [{ level: 1, text: 'Use `COUNT(DISTINCT o.order_id)` and `SUM(oi.quantity * oi.unit_price)`.' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 12,
        },
        successMessage: 'Challenge completed! Multi-table customer spend computed accurately.',
      },
    ],
  },
};
