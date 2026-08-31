import { ModuleData } from '../../types/curriculum';

export const Day_14_MODULE: ModuleData = {
  id: 'day-14',
  slug: 'joins-relational-data',
  day: 14,
  title: 'Day 14 — Connect Tables with JOINs',
  shortTitle: 'JOINs (INNER & LEFT)',
  type: 'module',
  milestoneId: 'milestone-2',
  description: 'Connect related tables using INNER JOIN to find matching records, LEFT JOIN to preserve unmatched rows, and master anti-JOINs to find data that does not exist. This is how real analytics happens.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Understand primary keys (PK) and foreign keys (FK) in relationships',
    'Use INNER JOIN to combine matching rows across tables',
    'Use LEFT JOIN when you want unmatched rows from the left table too',
    'Master anti-JOIN (LEFT JOIN ... WHERE right.pk IS NULL) to find missing relationships',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: PK/FK Primer & INNER JOIN
    // =========================================================================
    {
      id: 'relational-keys-inner-join',
      order: 1,
      title: '1. Primary & Foreign Keys, INNER JOIN Basics',
      shortDescription: 'Connect tables where records match — understand one-to-many relationships.',
      theory: {
        summary: 'A primary key (PK) uniquely identifies a row in its own table. A foreign key (FK) points to the primary key of another table to establish a relationship.',
        introTable: {
          tableName: 'products & categories',
          description: 'Related product and category records.',
          columns: ['p.product_id', 'p.name', 'p.category_id', 'c.category_id', 'c.name'],
          rows: [
            [1, 'Wireless Mouse', 1, 1, 'Electronics'],
            [2, 'Bluetooth Speaker', 1, 1, 'Electronics'],
            [6, 'Stainless Steel Pan Set', 2, 2, 'Kitchen & Dining'],
            [11, 'Desk Organizer', 3, 3, 'Office Supplies'],
          ],
        },
        explanation: [
          '### 1. INNER JOIN Mechanics',
          '`INNER JOIN` combines rows from two tables **only when there is a match in both tables**.',
          '### 2. The ON Condition',
          'The `ON` clause specifies how the tables link: `ON p.category_id = c.category_id`. If an ID does not exist in both tables, it is excluded from the result.',
        ],
        targetQuery: {
          sql: 'SELECT p.name AS product_name, c.name AS category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;',
          explanation: 'Combine products with their category names wherever foreign keys match.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products p INNER JOIN categories c ON p.category_id = c.category_id',
            sqlSnippet: 'FROM products p INNER JOIN categories c ON p.category_id = c.category_id',
            explanation: 'Matches each product record to its parent category in the taxonomy table.',
            tableData: {
              tableName: 'Matched Joined Rows',
              columns: ['p.name', 'p.category_id', 'c.category_id', 'c.name'],
              rows: [
                ['Wireless Mouse', 1, 1, 'Electronics'],
                ['Bluetooth Speaker', 1, 1, 'Electronics'],
                ['Stainless Steel Pan Set', 2, 2, 'Kitchen & Dining'],
                ['Desk Organizer', 3, 3, 'Office Supplies'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT p.name AS product_name, c.name AS category_name',
            sqlSnippet: 'SELECT p.name AS product_name, c.name AS category_name',
            explanation: 'Extracts cleanly aliased product and category names.',
            tableData: {
              tableName: 'Final Joined Result',
              columns: ['product_name', 'category_name'],
              highlightedColumns: ['product_name', 'category_name'],
              highlightedRows: [0, 1, 2, 3],
              rows: [
                ['Wireless Mouse', 'Electronics'],
                ['Bluetooth Speaker', 'Electronics'],
                ['Stainless Steel Pan Set', 'Kitchen & Dining'],
                ['Desk Organizer', 'Office Supplies'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'INNER JOIN syntax',
            sql: 'SELECT p.name, c.name AS category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;',
            description: 'Matches product records to their category names.',
          },
        ],
        keyTakeaway: 'INNER JOIN combines rows from two tables whenever the ON condition is satisfied.',
        exampleQuery: 'SELECT p.name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id;',
        exampleQueryExplanation: 'Returns all products along with their category name.',
        liveDemoSql: 'SELECT p.name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id LIMIT 5;',
        liveDemoNotes: 'Displays products with matched category names.',
        mcqs: [
          {
            question: 'Spiral check from Day 3: in a LEFT JOIN result, how do you find the customers with NO matching orders?',
            options: [
              'A. WHERE o.order_id = 0',
              'B. WHERE o.order_id IS NULL - unmatched rows carry NULL in the right table\'s columns',
              'C. WHERE o.order_id != NULL',
              'D. They disappear from a LEFT JOIN',
            ],
            correctIndex: 1,
            explanation: 'NULL semantics from Day 3 return: unmatched LEFT JOIN rows are NULL-filled, and only IS NULL (never = NULL) can detect them. This is exactly the anti-join used later on Day 18.',
          },
          {
            question: 'What happens to a customer who has never placed an order when using INNER JOIN orders?',
            options: [
              'A. They appear with order_id = NULL',
              'B. They are excluded from the result because there is no matching row in orders',
              'C. The query errors with a foreign key violation',
              'D. They are matched to order 0',
            ],
            correctIndex: 1,
            explanation: 'INNER JOIN only returns rows that have matches in both tables.',
          },
        ],
        masteryPoints: ['Understand PK and FK roles', 'Write INNER JOIN queries with table aliases'],
      },
      tasks: [
        {
          id: 'day11-c1-t1',
          title: 'Task 1: Products with Category Names',
          description: 'Retrieve product name and category name by joining products with categories.',
          instructions: [
            'Select `p.name AS product_name` and `c.name AS category_name`.',
            'From `products p` INNER JOIN `categories c` ON `p.category_id = c.category_id`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT p.name AS product_name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id;',
          solutionExplanation: 'Joins products to categories on category_id.',
          hints: [{ level: 1, text: 'Use `INNER JOIN categories c ON p.category_id = c.category_id;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requireJoin: true,
            requiredColumns: ['product_name', 'category_name'],
            expectedRowCount: 27,
          },
          successMessage: 'Products joined with category names!',
        },
        {
          id: 'day11-c1-t2',
          title: 'Task 2: Orders with Customer Profiles',
          description: 'Retrieve order_id, customer name, and order_date by joining orders with customers.',
          instructions: [
            'Query `orders o` INNER JOIN `customers c` ON `o.customer_id = c.customer_id`.',
            'Select `o.order_id`, `c.name`, and `o.order_date`.',
            'End with a semicolon (;).',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['customers'],
          initialSql: '-- Join orders and customers\n',
          solutionSql: 'SELECT o.order_id, c.name, o.order_date FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;',
          solutionExplanation: 'Extracts all orders along with the customer who placed them.',
          hints: [{ level: 1, text: 'Use `FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'orders',
            requireJoin: true,
            requiredColumns: ['order_id', 'name', 'order_date'],
            expectedRowCount: 18,
          },
          successMessage: 'Spot on! Orders joined with customer profiles.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2a: Preserving All Left Rows with LEFT JOIN
    // =========================================================================
    {
      id: 'left-join-preserving-left',
      order: 2,
      title: '2. Preserving All Left Rows with LEFT JOIN',
      shortDescription: 'Keep every row from the left table even when no right-table match exists.',
      theory: {
        summary: 'A `LEFT JOIN` returns ALL rows from the left table. If there is no match in the right table, columns from the right table are filled with `NULL`.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Left join showing customer records with optional order IDs',
          columns: ['c.customer_id', 'c.name', 'o.order_id'],
          rows: [
            [1, 'Rafiul Islam', 1],
            [1, 'Rafiul Islam', 14],
            [13, 'Arif Chowdhury', null],
            [14, 'Nadia Islam', null],
          ],
        },
        explanation: [
          '### 1. LEFT JOIN Mechanics',
          '`FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id` keeps every customer in the database.',
          'For customers with no orders (such as newly registered users), right-side order columns are populated with `NULL`.',
        ],
        targetQuery: {
          sql: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
          explanation: 'List all customers and their order IDs, preserving customers with zero orders.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM customers c (Preserve all left rows)',
            sqlSnippet: 'FROM customers c',
            explanation: 'Identifies all registered customers in the database.',
            tableData: {
              tableName: 'customers (Left Table)',
              columns: ['customer_id', 'name'],
              rows: [
                [1, 'Rafiul Islam'],
                [13, 'Arif Chowdhury'],
                [14, 'Nadia Islam'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: LEFT JOIN orders o ON c.customer_id = o.customer_id (Pad unmatched with NULL)',
            sqlSnippet: 'LEFT JOIN orders o ON c.customer_id = o.customer_id',
            explanation: 'Joins orders where available; fills NULL for customers with zero orders.',
            tableData: {
              tableName: 'LEFT JOIN Output Result',
              columns: ['name', 'order_id'],
              highlightedColumns: ['name', 'order_id'],
              rows: [
                ['Rafiul Islam', 1],
                ['Rafiul Islam', 14],
                ['Arif Chowdhury', null],
                ['Nadia Islam', null],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'LEFT JOIN syntax',
            sql: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
            description: 'Preserves all customers, returning NULL for unmatched order IDs.',
          },
        ],
        keyTakeaway: 'LEFT JOIN retains all records from the left table, padding unmatched right columns with NULL.',
        exampleQuery: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;',
        exampleQueryExplanation: 'Shows every customer alongside their order IDs.',
        liveDemoSql: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id LIMIT 6;',
        liveDemoNotes: 'Displays customer records with NULL for zero-order users.',
        mcqs: [
          {
            question: 'In `FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id`, which table has all its rows preserved?',
            options: [
              'A. orders (the right table)',
              'B. customers (the left table)',
              'C. Both tables equally',
              'D. Neither table',
            ],
            correctIndex: 1,
            explanation: 'LEFT JOIN guarantees that every row from the left table (`customers`) is preserved.',
          },
        ],
        masteryPoints: ['Understand how LEFT JOIN preserves unmatched left rows with NULLs'],
      },
      tasks: [
        {
          id: 'day11-c2a-t1',
          title: 'Task 1: All Customers and Their Orders',
          description: 'Display customer name and order_id for all customers using a LEFT JOIN, ensuring customers with zero orders appear in the output.',
          instructions: [
            'Select `c.name` and `o.order_id`.',
            'From `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- All customers with orders (LEFT JOIN)\n',
          solutionSql: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;',
          solutionExplanation: 'Preserves all customers; non-ordering customers have NULL in order_id (19 rows).',
          hints: [{ level: 1, text: 'Use `SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'customers',
            requireJoin: true,
            requiredColumns: ['name', 'order_id'],
            expectedRowCount: 21,
          },
          successMessage: 'All customers and their orders listed!',
        },
        {
          id: 'day11-c2a-t2',
          title: 'Task 2: Suppliers and Their Products',
          description: 'Display supplier name and product name for all suppliers using LEFT JOIN, including suppliers with no products.',
          instructions: [
            'Query `suppliers s` LEFT JOIN `products p` ON `s.supplier_id = p.supplier_id`.',
            'Select `s.name AS supplier_name` and `p.name AS product_name`.',
          ],
          type: 'independent',
          primaryTable: 'suppliers',
          secondaryTables: ['products'],
          initialSql: '-- Suppliers and products (LEFT JOIN)\n',
          solutionSql: 'SELECT s.name AS supplier_name, p.name AS product_name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id;',
          solutionExplanation: 'Preserves all suppliers even if a supplier has 0 products.',
          hints: [{ level: 1, text: 'Use `SELECT s.name AS supplier_name, p.name AS product_name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'suppliers',
            requireJoin: true,
            requiredColumns: ['supplier_name', 'product_name'],
            expectedRowCount: 27,
          },
          successMessage: 'Perfect! All suppliers preserved with product names.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 11 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-11-homework',
    title: 'Day 11 — JOINs (Homework)',
    scenario: 'Master multi-table queries with INNER JOIN and LEFT JOIN:',
    tasks: [
      {
        id: 'day11-hw-1',
        title: 'Task 1: Every order with the customer\'s name and date',
        description: 'Every order with the customer\'s name and date.',
        instructions: [
          'Select `o.order_id`, `c.name`, `o.order_date` from `orders o` INNER JOIN `customers c` ON `o.customer_id = c.customer_id`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['customers'],
        initialSql: '-- Task 1: Every order with customer name and date\n',
        solutionSql: 'SELECT o.order_id, c.name, o.order_date FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;',
        solutionExplanation: 'Joins orders to customers to retrieve customer names alongside order details.',
        hints: [{ level: 1, text: 'Use `FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'orders',
          requireJoin: true,
          requiredColumns: ['order_id', 'name', 'order_date'],
          expectedRowCount: 18,
        },
        successMessage: 'Task 1 completed! Orders with customer names retrieved.',
      },
      {
        id: 'day11-hw-2',
        title: 'Task 2: Every customer with their order count, including customers with zero orders (LEFT JOIN)',
        description: 'Every customer with their order count, including customers with zero orders (LEFT JOIN).',
        instructions: [
          'Select `c.customer_id`, `c.name`, `COUNT(o.order_id) AS order_count` from `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id` GROUP BY `c.customer_id`, `c.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders'],
        initialSql: '-- Task 2: Every customer with order count (LEFT JOIN)\n',
        solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
        solutionExplanation: 'LEFT JOIN preserves customers with zero orders; COUNT(o.order_id) counts orders correctly.',
        hints: [{ level: 1, text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 15,
        },
        successMessage: 'Task 2 completed! Full customer order roster generated.',
      },
    ],
  },
};
