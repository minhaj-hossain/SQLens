import { ModuleData } from '../../types/curriculum';

export const Day_19_MODULE: ModuleData = {
  id: 'day-19',
  slug: 'independent-work-debug',
  day: 19,
  title: 'Day 19 — Debugging Lab: Harden Queries & Temporal Filters',
  shortTitle: 'Debug: Temporal Filters',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Production queries need date ranges and edge case handling. Add temporal constraints to your multi-table reports and audit inactive customers before the Milestone 2 checkpoint.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Add WHERE constraints with date ranges to multi-table joined queries',
    'Find inactive zero-order customers using LEFT JOIN and HAVING aggregate filters',
    'Harden real queries against edge cases before they hit production',
  ],
  concepts: [
    {
      id: 'query-debugging-polish',
      order: 1,
      title: '1. Production Query Hardening: Dates, Ranges & Audits',
      shortDescription: 'Add temporal constraints and edge case handling to multi-table queries.',
      theory: {
        summary: 'Production queries frequently require temporal constraints (such as orders placed in the last 60 days) and inactive account audits. Today we harden existing queries against these real-world requirements.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Multi-table customer orders with timestamps',
          columns: ['c.name', 'o.order_id', 'o.order_date', 'o.status'],
          rows: [
            ['Rafiul Islam', 1, '2026-06-10', 'delivered'],
            ['Rafiul Islam', 14, '2026-08-02', 'delivered'],
            ['Tanvir Ahmed', 3, '2026-05-15', 'delivered'],
          ],
        },
        explanation: [
          '### 1. Adding Temporal Filters to Multi-Table Queries',
          'Combine JOINs, WHERE date filters, and GROUP BY:',
          '```sql\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;\n```',
        ],
        targetQuery: {
          sql: "SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= '2026-06-25'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;",
          explanation: 'Calculate recent customer spend for orders placed on or after 2026-06-25, sorted highest first.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM ... JOIN ... WHERE o.order_date >= \'2026-06-25\'',
            sqlSnippet: "FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= '2026-06-25'",
            explanation: 'Joins customer line items and filters for transactions on or after 2026-06-25.',
            tableData: {
              tableName: 'Recent Qualifying Line Items',
              columns: ['c.name', 'o.order_date', 'oi.quantity', 'oi.unit_price'],
              rows: [
                ['Rafiul Islam', '2026-08-02', 1, 165.50],
                ['Farhana Rahman', '2026-07-14', 1, 144.97],
                ['Priya Akter', '2026-07-01', 1, 55.00],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC',
            sqlSnippet: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC',
            explanation: 'Aggregates spend per customer and sorts highest spenders first.',
            tableData: {
              tableName: 'Recent Spend Breakdown Result',
              columns: ['name', 'recent_spend'],
              highlightedColumns: ['name', 'recent_spend'],
              highlightedRows: [0, 1, 2],
              rows: [
                ['Rafiul Islam', 165.50],
                ['Farhana Rahman', 144.97],
                ['Priya Akter', 55.00],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Filtered multi-table report',
            sql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
            description: 'Combines multi-table joins with date constraints.',
          },
        ],
        keyTakeaway: 'Ensure multi-table queries run cleanly and withstand added filtering conditions.',
        exampleQuery: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
        exampleQueryExplanation: 'Calculates customer order count.',
        liveDemoSql: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name LIMIT 5;',
        liveDemoNotes: 'Displays customer order volume.',
        mcqs: [
          {
            question: 'Where should a date filter on order_date be placed in a query that groups by customer?',
            options: [
              'A. In the HAVING clause',
              'B. In the WHERE clause before GROUP BY',
              'C. In the ORDER BY clause',
              'D. In the SELECT clause',
            ],
            correctIndex: 1,
            explanation: 'Filtering raw order records by date occurs in the WHERE clause before aggregation.',
          },
        ],
        masteryPoints: ['Harden multi-table queries with temporal boundaries'],
      },
      tasks: [
        {
          id: 'day15-c1-t1',
          title: 'Task 1 (Guided): Recent Customer Spending (Last 60 Days)',
          description: 'Calculate customer spend for orders placed on or after 2026-06-25 (last 60 days).',
          instructions: [
            'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Where `o.order_date >= \'2026-06-25\'` (or `CURDATE() - INTERVAL 60 DAY`).',
            'Group by `c.customer_id`, `c.name`.',
            'Order by `recent_spend DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Task 1: Recent customer spend with date filter\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE ;',
          solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
          solutionExplanation: 'Filters by date range, joins line items, and sums total spend per customer.',
          hints: [
            { level: 1, text: 'Use `WHERE o.order_date >= \'2026-06-25\'` before GROUP BY.' },
            { level: 2, text: 'Group by `c.customer_id, c.name ORDER BY recent_spend DESC;`.' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'customers',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            expectedRowCount: 9,
          },
          successMessage: 'Task 1 completed! Recent spend query verified.',
        },
        {
          id: 'day15-c1-t2',
          title: 'Task 2 (Independent): Inactive Customer Audit',
          description: 'Identify customers who have placed 0 orders by grouping with a LEFT JOIN and filtering with HAVING.',
          instructions: [
            'Query `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
            'Select `c.customer_id`, `c.name`, and `COUNT(o.order_id) AS order_count`.',
            'Group by `c.customer_id`, `c.name`.',
            'Filter with `HAVING COUNT(o.order_id) = 0`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Find zero-order customers\n',
          solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) = 0;',
          solutionExplanation: 'Preserves all customers with LEFT JOIN and isolates zero-order accounts.',
          hints: [{ level: 1, text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) = 0;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            requireHaving: true,
            expectedRowCount: 3,
          },
          successMessage: 'Task 2 completed! Zero-order accounts identified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 15 CHALLENGE: FIX BROKEN & DATE-CONSTRAINED QUERIES (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-19-homework',
    title: 'Day 19 — Fix Broken & Date-Constrained Queries (Ending Activity)',
    scenario: 'Polish and refine your multi-table reporting queries:',
    tasks: [
      {
        id: 'day15-hw-1',
        title: 'Task 1: Polish multi-table customer spend report with date range',
        description: 'Verify and run the multi-table customer spend report with date range constraints.',
        instructions: [
          'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` WHERE `o.order_date >= \'2026-06-25\'` GROUP BY `c.customer_id`, `c.name` ORDER BY `recent_spend DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Challenge: Multi-table customer spend with date filter\n',
        solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
        solutionExplanation: 'Chains customers → orders → order_items and keeps only purchases on or after the cutoff — a true recency-weighted spend report.',
        hints: [{ level: 1, text: 'Use `WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'customers',
          requireJoin: true,
          requireWhere: true,
          requireGroupBy: true,
          expectedRowCount: 9,
        },
        successMessage: 'Challenge completed! Polished multi-table report verified.',
      },
    ],
  },
};
