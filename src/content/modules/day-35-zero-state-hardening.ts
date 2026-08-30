import { ModuleData } from '../../types/curriculum';

export const Day_35_MODULE: ModuleData = {
  id: 'day-23',
  slug: 'project-part-4-edge-cases-performance',
  day: 23,
  title: 'Day 23 — Debugging Lab & Polish: Zero-State Hardening & Edge Cases',
  shortTitle: 'Debug: Zero-State Hardening',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Harden production queries against zero-state edge cases: preserve inactive customers and unpurchased products using LEFT JOIN and understand when COALESCE is needed for SUM aggregates.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Handle 0-order customer edge cases using LEFT JOIN so inactive accounts remain in audits',
    'Understand COUNT() natural 0-behavior vs SUM() NULL-behavior and when to use COALESCE(SUM(...), 0)',
    'Harden analytical reporting pipelines against zero-record edge cases across the canonical 6-table schema',
  ],
  concepts: [
    {
      id: 'performance-and-edge-cases',
      order: 1,
      title: '1. Zero-State Hardening & NULL-Safe Aggregates',
      shortDescription: 'LEFT JOIN, COUNT natural 0s, and COALESCE with SUM.',
      theory: {
        summary: 'Production queries must handle zero-state edge cases gracefully: customers with 0 orders and products never ordered must not vanish from business reports. We master LEFT JOIN and understand the crucial difference between COUNT() and SUM() NULL behavior.',
        introTable: {
          tableName: 'customers & orders (Canonical Schema)',
          description: 'Customer records with and without orders',
          columns: ['c.name', 'COUNT(o.order_id)', 'SUM(quantity * unit_price)'],
          rows: [
            ['Rafiul Islam', 2, 262.48],
            ['Arif Chowdhury (0 orders)', 0, 'NULL -> COALESCE(..., 0) = $0.00'],
          ],
        },
        explanation: [
          '### 1. COUNT() vs SUM() Zero-State Rule',
          '• **`COUNT(o.order_id)`**: Naturally returns **`0`** when no matching rows exist in a `LEFT JOIN`. You do **NOT** need `COALESCE(COUNT(...), 0)`.',
          '• **`SUM(oi.quantity)`**: Returns **`NULL`** when there are no matching rows to sum. You **MUST** use `COALESCE(SUM(oi.quantity), 0)` to display `0`.',
          '### 2. Preserving Zero-Order Customers',
          '`SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`',
          'INNER JOIN silently drops inactive entities (e.g. customers with 0 orders). Always use LEFT JOIN when reporting rosters require 100% entity coverage.',
        ],
        targetQuery: {
          sql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
          explanation: 'Preserve inactive zero-order customers in audits using a LEFT JOIN with natural COUNT 0-behavior.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Preserving Inactive Customers with LEFT JOIN',
            sqlSnippet: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
            explanation: 'Preserves all 15 customers including zero-order accounts.',
            tableData: {
              tableName: 'Zero-Safe Customer Order Volume',
              columns: ['customer_id', 'name', 'order_count'],
              highlightedColumns: ['name', 'order_count'],
              rows: [
                [1, 'Rafiul Islam', 2],
                [13, 'Arif Chowdhury', 0],
                [14, 'Nadia Islam', 0],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Null-safe aggregate query',
            sql: 'SELECT p.product_id, p.name,\n       COUNT(oi.order_item_id) AS times_ordered,\n       COALESCE(SUM(oi.quantity), 0) AS total_units_sold\nFROM products p\nLEFT JOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name;',
            description: 'Preserves unpurchased products with clean zero counts and COALESCE(SUM, 0).',
          },
        ],
        keyTakeaway: 'Use LEFT JOIN to preserve zero-activity entities, and use COALESCE(SUM(...), 0) for null-safe financial totals.',
        exampleQuery: 'SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name;',
        exampleQueryExplanation: 'Lists every product — including never-ordered ones — with a null-safe unit total: SUM\'s NULL becomes 0 through COALESCE.',
        liveDemoSql: 'SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name;',
        liveDemoNotes: 'Displays every product with unit totals; never-ordered products show a clean 0 instead of NULL.',
        mcqs: [
          {
            question: 'Why does `SUM()` need `COALESCE(SUM(...), 0)` while `COUNT()` does not in a LEFT JOIN when 0 rows match?',
            options: [
              'A. Because COUNT() naturally counts 0 non-null values, while SUM() over an empty set evaluates to NULL',
              'B. Because SUM only works on integers',
              'C. Because COUNT is an ORM keyword',
              'D. Because SQL deletes null counts',
            ],
            correctIndex: 0,
            explanation: 'COUNT(col) returns 0 when all values are NULL, whereas SUM(col) returns NULL.',
          },
        ],
        masteryPoints: ['Use LEFT JOIN for zero-state preservation', 'Apply COALESCE(SUM(...), 0) appropriately'],
      },
      tasks: [
        {
          id: 'day23-c1-t1',
          title: 'Task 1 (Guided Fix): Customer Order Volume Audit',
          description: 'List every customer together with how many orders they have placed. Customers who have never placed an order must still appear in the results, showing 0 orders.',
          instructions: [
            'Query `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
            'Select `c.customer_id`, `c.name`, and `COUNT(o.order_id) AS total_orders`.',
            'Group by `c.customer_id`, `c.name`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Null-safe customer order audit\nSELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
          solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
          solutionExplanation: 'Preserves all 15 customers with clean 0 counts for inactive accounts.',
          hints: [{ level: 1, text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`' }],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 15,
          },
          successMessage: 'Task 1 completed! All customer accounts preserved with accurate zero counts.',
        },
        {
          id: 'day23-c1-t2',
          title: 'Task 2 (Transfer): Catalog Sales Volume Audit with COALESCE',
          description: 'Show the total units sold for every product. Products that have never been purchased must appear too — their total should show 0 instead of being empty or missing.',
          instructions: [
            'Query `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Select `p.product_id`, `p.name`, and `COALESCE(SUM(oi.quantity), 0) AS total_units_sold`.',
            'Group by `p.product_id`, `p.name`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: '-- Catalog sales volume with COALESCE\n',
          solutionSql: 'SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name;',
          solutionExplanation: 'Preserves all 28 products with null-safe COALESCE on SUM.',
          hints: [{ level: 1, text: 'Use `COALESCE(SUM(oi.quantity), 0) AS total_units_sold`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 28,
          },
          successMessage: 'Task 2 completed! Catalog sales audit hardened against NULL sums.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 23 CHALLENGE: ZERO-STATE HARDENING CHALLENGE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-23-homework',
    title: 'Day 23 — Zero-State Hardening Challenge (Ending Activity)',
    scenario: 'Harden analytical reporting queries against zero-state edge cases:',
    tasks: [
      {
        id: 'day23-hw-1',
        title: 'Task 1: Customer order roster with 0-order preservation',
        description: 'Customer order roster preserving all customers (LEFT JOIN).',
        instructions: [
          'Select `c.customer_id`, `c.name`, `COUNT(o.order_id) AS total_orders` from `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id` GROUP BY `c.customer_id`, `c.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders'],
        initialSql: '-- Challenge: Customer order audit with 0-order preservation\n',
        solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
        solutionExplanation: 'Preserves all customer accounts using LEFT JOIN.',
        hints: [{ level: 1, text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 15,
        },
        successMessage: 'Challenge completed! Zero-order accounts preserved.',
      },
    ],
  },
};
