import { ModuleData } from '../../types/curriculum';

export const Day_16_MODULE: ModuleData = {
  id: 'day-13',
  slug: 'relational-thinking-logical-order-expanded',
  day: 13,
  title: 'Day 13 — Visual Concept Lab: Relational Architecture & 7-Stage Pipeline',
  shortTitle: 'Relational Thinking & Full Execution Order',
  type: 'conceptual_session',
  milestoneId: 'milestone-2',
  description: 'Master the full 7-step logical query processing order (FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT) and understand relational schema architecture.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Master the expanded 7-step logical query processing order across all SQL clauses',
    'Trace multi-table queries through all 7 stages to eliminate clause ordering bugs',
    'Distinguish standard logical visibility rules from database-specific convenience extensions (such as MySQL)',
  ],
  concepts: [
    {
      id: 'expanded-logical-order',
      order: 1,
      title: '1. The Full 7-Step Logical Execution Lifecycle',
      shortDescription: 'FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
      theory: {
        summary: 'Now that JOINs, GROUP BY, and HAVING are in our toolkit, we integrate all 7 clauses into a single unified execution model. Understanding this lifecycle ensures you know when data is created, filtered, and sorted.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Sample data for 7-stage query tracing',
          columns: ['c.name', 'o.order_id', 'o.status'],
          rows: [
            ['Rafiul Islam', 1, 'delivered'],
            ['Rafiul Islam', 14, 'delivered'],
            ['Kamal Hossain', 6, 'cancelled'],
          ],
        },
        explanation: [
          '### 1. The Definitive 7-Step Logical Pipeline',
          '1. **`FROM & JOIN`** (Step 1): Tables are joined to produce the intermediate dataset.',
          '2. **`WHERE`** (Step 2): Individual rows are filtered *before* any grouping.',
          '3. **`GROUP BY`** (Step 3): Remaining rows are collapsed into category buckets.',
          '4. **`HAVING`** (Step 4): Aggregated group metrics are filtered.',
          '5. **`SELECT`** (Step 5): Columns are computed, aggregated, and assigned aliases.',
          '6. **`ORDER BY`** (Step 6): The resulting rows are sorted (can see `SELECT` aliases!).',
          '7. **`LIMIT / OFFSET`** (Step 7): The final sorted output is sliced.',
        ],
        targetQuery: {
          sql: "SELECT c.name, COUNT(o.order_id) AS valid_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status != 'cancelled'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(o.order_id) >= 1\nORDER BY valid_orders DESC\nLIMIT 5;",
          explanation: 'Filter non-cancelled orders, group by customer, keep customers with >= 1 order, and return top 5 by order count.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM & JOIN (Combine candidate entities)',
            sqlSnippet: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id',
            explanation: 'Loads and matches rows between customers and orders.',
            tableData: {
              tableName: 'Joined Order Candidates',
              columns: ['c.name', 'o.order_id', 'o.status'],
              rows: [
                ['Rafiul Islam', 1, 'delivered'],
                ['Rafiul Islam', 14, 'delivered'],
                ['Kamal Hossain', 6, 'cancelled'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: WHERE (Filter raw records)',
            sqlSnippet: "WHERE o.status != 'cancelled'",
            explanation: 'Filters out cancelled orders before any grouping occurs.',
            tableData: {
              tableName: 'Non-Cancelled Orders',
              columns: ['c.name', 'o.order_id', 'o.status'],
              rows: [
                ['Rafiul Islam', 1, 'delivered'],
                ['Rafiul Islam', 14, 'delivered'],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: GROUP BY (Partition customer buckets)',
            sqlSnippet: 'GROUP BY c.customer_id, c.name',
            explanation: 'Groups active orders by customer.',
            tableData: {
              tableName: 'Customer Order Groups',
              columns: ['customer', 'orders'],
              rows: [
                ['Rafiul Islam', 'Orders #1, #14 (2 orders)'],
              ],
            },
          },
          {
            stepNumber: 4,
            stepTitle: 'Step 4: HAVING (Filter aggregate groups)',
            sqlSnippet: 'HAVING COUNT(o.order_id) >= 1',
            explanation: 'Filters for customers with at least 1 valid order.',
            tableData: {
              tableName: 'Qualified Customer Groups',
              columns: ['customer', 'order_count'],
              rows: [
                ['Rafiul Islam', 2],
              ],
            },
          },
          {
            stepNumber: 5,
            stepTitle: 'Step 5: SELECT (Extract columns and aliases)',
            sqlSnippet: 'SELECT c.name, COUNT(o.order_id) AS valid_orders',
            explanation: 'Projects name and assigns the valid_orders alias.',
            tableData: {
              tableName: 'Projected Columns',
              columns: ['name', 'valid_orders'],
              rows: [
                ['Rafiul Islam', 2],
              ],
            },
          },
          {
            stepNumber: 6,
            stepTitle: 'Step 6: ORDER BY (Sort by alias)',
            sqlSnippet: 'ORDER BY valid_orders DESC',
            explanation: 'Sorts using the valid_orders alias created in SELECT.',
            tableData: {
              tableName: 'Sorted Customers',
              columns: ['name', 'valid_orders'],
              highlightedColumns: ['valid_orders'],
              rows: [
                ['Rafiul Islam', 2],
              ],
            },
          },
          {
            stepNumber: 7,
            stepTitle: 'Step 7: LIMIT (Slice final rows)',
            sqlSnippet: 'LIMIT 5',
            explanation: 'Takes the top 5 customers.',
            tableData: {
              tableName: 'Final Query Result',
              columns: ['name', 'valid_orders'],
              highlightedColumns: ['name', 'valid_orders'],
              highlightedRows: [0],
              rows: [
                ['Rafiul Islam', 2],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'The 7-step logical query order',
            sql: '1. FROM (and JOINs)\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT\n6. ORDER BY\n7. LIMIT / OFFSET',
            description: 'The definitive logical execution order of SQL.',
          },
        ],
        keyTakeaway: 'Understanding the 7-step logical processing order prevents alias errors and logic bugs across multi-clause queries.',
        exampleQuery: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
        exampleQueryExplanation: 'Full 7-clause query pipeline in action.',
        liveDemoSql: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
        liveDemoNotes: 'Displays top customers by active order count.',
        mcqs: [
          {
            question: 'In the standard 7-step order, when does HAVING execute relative to SELECT?',
            options: [
              'A. After SELECT',
              'B. Before SELECT (Step 4 vs Step 5)',
              'C. Simultaneously with WHERE',
              'D. At the very end after LIMIT',
            ],
            correctIndex: 1,
            explanation: 'Logically, HAVING executes at Step 4, before SELECT executes at Step 5.',
          },
        ],
        masteryPoints: ['Master all 7 logical query processing steps', 'Explain relational normalization'],
      },
      tasks: [
        {
          id: 'day13-c1-t1',
          title: 'Task 1 (Guided): Trace Multi-Table 7-Step Query',
          description: 'Construct a multi-table query using WHERE, GROUP BY, HAVING, and ORDER BY with aliases.',
          instructions: [
            'Select `c.name`, `COUNT(o.order_id) AS valid_orders` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id`.',
            'Where `o.status != \'cancelled\'`.',
            'Group by `c.customer_id`, `c.name`.',
            'Having `COUNT(o.order_id) >= 1`.',
            'Order by `valid_orders DESC` LIMIT 5.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Task 1: Complete 7-clause query pipeline\nSELECT c.name, COUNT(o.order_id) AS valid_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status != \'cancelled\'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(o.order_id) >= 1\nORDER BY valid_orders DESC\nLIMIT 5;',
          solutionSql: 'SELECT c.name, COUNT(o.order_id) AS valid_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY valid_orders DESC LIMIT 5;',
          solutionExplanation: 'Demonstrates the complete 7-clause logical pipeline.',
          hints: [
            { level: 1, text: 'Filter pre-grouping with `WHERE o.status != \'cancelled\'`.' },
            { level: 2, text: 'Group by customer and filter groups with `HAVING COUNT(o.order_id) >= 1`.' },
          ],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            requireHaving: true,
            requireLimit: 5,
            expectedRowCount: 5,
          },
          successMessage: 'Task 1 completed! Full 7-step logical query executed.',
        },
        {
          id: 'day13-c1-t2',
          title: 'Task 2 (Transfer): Category Product Sales Filter',
          description: 'Join categories with products to count in-stock items per category, keeping categories with at least 2 items, ordered by category name.',
          instructions: [
            'Query `categories c` JOIN `products p` ON `c.category_id = p.category_id`.',
            'Where `p.quantity_in_stock > 0`.',
            'Select `c.name AS category_name`, `COUNT(p.product_id) AS item_count`.',
            'Group by `c.category_id`, `c.name`.',
            'Having `COUNT(p.product_id) >= 2`.',
            'Order by `category_name ASC`.',
          ],
          type: 'independent',
          primaryTable: 'categories',
          secondaryTables: ['products'],
          initialSql: '-- 7-clause category filter\n',
          solutionSql: 'SELECT c.name AS category_name, COUNT(p.product_id) AS item_count FROM categories c JOIN products p ON c.category_id = p.category_id WHERE p.quantity_in_stock > 0 GROUP BY c.category_id, c.name HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;',
          solutionExplanation: 'Demonstrates WHERE (in-stock) -> GROUP BY (category) -> HAVING (item_count >= 2) -> ORDER BY (alias).',
          hints: [
            { level: 1, text: 'Use `WHERE p.quantity_in_stock > 0` before grouping.' },
            { level: 2, text: 'Add `HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;`.' },
          ],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            requireHaving: true,
            requiredColumns: ['category_name', 'item_count'],
            expectedRowCount: 5,
          },
          successMessage: 'Task 2 completed! End-to-end 7-clause analytical query verified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 13 CHALLENGE: FULL 7-CLAUSE PIPELINE ASSEMBLY (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-13-homework',
    title: 'Day 13 — Full 7-Clause Pipeline Assembly (Ending Activity)',
    scenario: 'Solidify your mastery of relational design and query execution order:',
    tasks: [
      {
        id: 'day13-hw-1',
        title: 'Task 1: Full 7-clause pipeline query',
        description: 'Select customer name, count of valid orders aliased as active_orders, grouped by customer, having active_orders >= 1, sorted by active_orders DESC, limit 5.',
        instructions: [
          'Select `c.name`, `COUNT(o.order_id) AS active_orders` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` WHERE `o.status != \'cancelled\'` GROUP BY `c.customer_id`, `c.name` HAVING `COUNT(o.order_id) >= 1` ORDER BY `active_orders DESC` LIMIT 5.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders'],
        initialSql: '-- Challenge: Complete 7-clause SQL pipeline\n',
        solutionSql: 'SELECT c.name, COUNT(o.order_id) AS active_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY active_orders DESC LIMIT 5;',
        solutionExplanation: 'Executes the complete 7-clause SQL pipeline.',
        hints: [{ level: 1, text: 'Use `WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY active_orders DESC LIMIT 5;`' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireWhere: true,
          requireGroupBy: true,
          requireHaving: true,
          requireLimit: 5,
          expectedRowCount: 5,
        },
        successMessage: 'Challenge completed! Full execution pipeline verified.',
      },
    ],
  },
};
