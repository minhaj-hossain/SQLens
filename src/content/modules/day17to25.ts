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
    // CONCEPT 1a: Scalar Subqueries (Single-Value Comparison)
    // =========================================================================
    {
      id: 'subqueries-scalar',
      order: 1,
      title: '1. Scalar Subqueries (Single-Value Comparison)',
      shortDescription: 'Compare individual rows dynamically against whole-table aggregates.',
      theory: {
        summary: 'A subquery is a query nested inside another SQL statement. A scalar subquery returns exactly one value (one row and one column), allowing you to use it wherever a constant or literal value is expected.',
        introTable: {
          tableName: 'products',
          description: 'Comparing items against table-wide average price.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [4, 'Mechanical Keyboard', 65.00],
            [14, 'Office Chair', 120.00],
            [15, 'Filing Cabinet', 89.99],
          ],
        },
        explanation: [
          '### 1. The Dynamic Comparison Pattern',
          'Instead of hardcoding a magic number like `WHERE price > 30.00`, a scalar subquery computes the threshold dynamically:\n```sql\nSELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);\n```',
          '### 2. Execution Order',
          '1. The database evaluates the inner query `(SELECT AVG(price) FROM products)` first to get the scalar value ($30.13).\n2. The outer query then filters rows where `price > 30.13`.',
          'QUESTION_BLOCK::Scalar Rule::A scalar subquery MUST return exactly one row and one column. If it returns multiple rows or columns, SQL will halt with an error.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inner Query Computes Average',
            sqlSnippet: 'SELECT AVG(price) FROM products;',
            explanation: 'Computes overall catalog average price ($30.13).',
            tableData: {
              tableName: 'Inner Result',
              columns: ['AVG(price)'],
              rows: [[30.13]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Outer Query Filters for price > $30.13',
            sqlSnippet: 'SELECT name, price FROM products WHERE price > 30.13;',
            explanation: 'Retains only items priced above the average.',
            tableData: {
              tableName: 'Above Average Items',
              columns: ['name', 'price'],
              rows: [
                ['Bluetooth Speaker', 45.50],
                ['Mechanical Keyboard', 65.00],
                ['Office Chair', 120.00],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Scalar subquery syntax',
            sql: 'SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);',
            description: 'Compares price against table-wide average price dynamically.',
          },
        ],
        keyTakeaway: 'A scalar subquery evaluates to a single value, enabling dynamic comparisons.',
        exampleQuery: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
        exampleQueryExplanation: 'Finds products priced above the overall average.',
        liveDemoSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) LIMIT 5;',
        liveDemoNotes: 'Displays above-average priced products.',
        mcqs: [
          {
            question: 'What is a scalar subquery in SQL?',
            options: [
              'A. A subquery that returns a full multi-column table',
              'B. A subquery that returns exactly one row and one column (a single atomic value)',
              'C. A query containing multiple JOINs',
              'D. A subquery that executes in a background thread',
            ],
            correctIndex: 1,
            explanation: 'Scalar subqueries evaluate to a single atomic value.',
          },
        ],
        masteryPoints: ['Write scalar subqueries in WHERE clauses', 'Compare rows against dynamic aggregates'],
      },
      tasks: [
        {
          id: 'day17-c1a-t1',
          title: 'Task 1: Products Priced Above Average',
          description: 'Select name and price for all products priced higher than the overall average product price.',
          instructions: [
            'Select `name` and `price` from `products`.',
            'Filter with `WHERE price > (SELECT AVG(price) FROM products)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Products above average price\n',
          solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
          solutionExplanation: 'Uses a scalar subquery `(SELECT AVG(price) FROM products)` to dynamically filter products.',
          hints: [{ level: 1, text: 'Use `WHERE price > (SELECT AVG(price) FROM products);`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'price'],
            expectedRowCount: 10,
          },
          successMessage: 'Above-average products retrieved!',
        },
        {
          id: 'day17-c1a-t2',
          title: 'Task 2: Students Older Than Average Student Age',
          description: 'Select name and age for students who are strictly older than the student average age.',
          instructions: [
            'Query the `students` table.',
            'Select `name` and `age`.',
            'Filter where `age > (SELECT AVG(age) FROM students)`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Students older than average\n',
          solutionSql: 'SELECT name, age FROM students WHERE age > (SELECT AVG(age) FROM students);',
          solutionExplanation: 'The average student age is 21.4; only Karim (22) and Sumaiya (23) are older.',
          hints: [{ level: 1, text: 'Use `WHERE age > (SELECT AVG(age) FROM students);`' }],
          validation: {
            targetTable: 'students',
            requireWhere: true,
            requiredColumns: ['name', 'age'],
            expectedRowCount: 2,
          },
          successMessage: 'Perfect! Above-average age students identified.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1b: Set Membership Subqueries with IN
    // =========================================================================
    {
      id: 'subqueries-in-set',
      order: 2,
      title: '2. Set Membership Subqueries with IN',
      shortDescription: 'Filter rows against dynamic lists produced by inner queries.',
      theory: {
        summary: 'When a subquery returns a column of multiple values, you can use `IN` to check if a row\'s column matches any value in that dynamic list.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Identifying customers with active orders',
          columns: ['customer_id', 'name', 'city'],
          rows: [
            [1, 'Rafiul Islam', 'Dhaka'],
            [2, 'Priya Akter', 'Dhaka'],
            [13, 'Arif Chowdhury', 'Rajshahi'],
          ],
        },
        explanation: [
          '### 1. The Dynamic IN Subquery',
          'Instead of hardcoding customer IDs `IN (1, 2, 3, 4...)`, the subquery supplies the list dynamically:\n```sql\nSELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);\n```',
          '### 2. How SQL Evaluates It',
          '1. The inner query produces a distinct set of customer IDs from `orders`.\n2. The outer query matches customer records against that set.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inner Query Generates Customer ID List',
            sqlSnippet: 'SELECT customer_id FROM orders;',
            explanation: 'Produces list: (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).',
            tableData: {
              tableName: 'Order Placer IDs',
              columns: ['customer_id'],
              rows: [[1], [2], [3], [4], [5]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'IN subquery syntax',
            sql: 'SELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);',
            description: 'Returns rows whose key matches any item in the subquery result.',
          },
        ],
        keyTakeaway: 'Use IN (SELECT ...) to match values against a dynamically generated list.',
        exampleQuery: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
        exampleQueryExplanation: 'Finds all customers who have placed at least one order.',
        liveDemoSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
        liveDemoNotes: 'Returns all 12 ordering customers.',
        mcqs: [
          {
            question: 'What type of result does an `IN (SELECT ...)` subquery expect?',
            options: [
              'A. Exactly one row and multiple columns',
              'B. A single column containing zero, one, or many rows',
              'C. A JSON object',
              'D. A table with at least 5 columns',
            ],
            correctIndex: 1,
            explanation: 'IN subqueries test a single column against a list of single-column values.',
          },
        ],
        masteryPoints: ['Write multi-row IN subqueries', 'Relate tables without writing explicit JOINs'],
      },
      tasks: [
        {
          id: 'day17-c1b-t1',
          title: 'Task 1: Customers with Recorded Orders (IN)',
          description: 'Retrieve customer_id and name for customers who have placed at least one order using an IN subquery.',
          instructions: [
            'Query the `customers` table.',
            'Select `customer_id` and `name`.',
            'Filter where `customer_id IN (SELECT customer_id FROM orders)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders'],
          initialSql: '-- Customers with orders via IN subquery\n',
          solutionSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
          solutionExplanation: 'Retrieves all 12 customers who have records in the orders table.',
          hints: [{ level: 1, text: 'Use `WHERE customer_id IN (SELECT customer_id FROM orders);`' }],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['customer_id', 'name'],
            requireWhere: true,
            expectedRowCount: 12,
          },
          successMessage: 'Active customers identified via IN subquery!',
        },
        {
          id: 'day17-c1b-t2',
          title: 'Task 2: Products in Large Categories',
          description: 'Select name, category_id, and price for products belonging to categories that contain 5 or more products.',
          instructions: [
            'Query the `products` table.',
            'Select `name`, `category_id`, and `price`.',
            'Filter where `category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5)`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Products in large categories (>= 5 items)\n',
          solutionSql: 'SELECT name, category_id, price FROM products WHERE category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5);',
          solutionExplanation: 'Categories 1, 2, 3, 4, 5 each have at least 5 products (27 items total).',
          hints: [{ level: 1, text: 'Use `WHERE category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5);`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'category_id', 'price'],
            requireWhere: true,
            expectedRowCount: 27,
          },
          successMessage: 'Spot on! Products in large categories selected dynamically.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1c: Exclusion Subqueries with NOT IN & The NULL Trap
    // =========================================================================
    {
      id: 'subqueries-not-in-null-trap',
      order: 3,
      title: '3. Exclusion Subqueries with NOT IN & The NULL Trap',
      shortDescription: 'Exclude matching rows safely and avoid the three-valued logic NULL trap.',
      theory: {
        summary: '`NOT IN` excludes rows that match values in a subquery. However, if the subquery returns even a single NULL value, the entire NOT IN condition collapses to UNKNOWN and returns 0 rows!',
        introTable: {
          tableName: 'products & order_items',
          description: 'Products checking for presence in order items',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [3, 'USB-C Charging Cable (0 orders)', 9.99],
            [9, 'Cutting Board Set (0 orders)', 18.00],
          ],
        },
        explanation: [
          '### 1. How NOT IN Evaluates Logically',
          '`WHERE product_id NOT IN (1, 2, NULL)` expands internally in SQL to chained inequality checks:\n```text\nproduct_id != 1 AND product_id != 2 AND product_id != NULL\n```',
          '### 2. The Three-Valued Logic NULL Trap',
          '1. In SQL three-valued logic, `product_id != NULL` evaluates to **UNKNOWN**.\n2. In boolean algebra: `TRUE AND UNKNOWN` evaluates to **UNKNOWN**.\n3. Because `WHERE` only retains rows evaluating to `TRUE`, the query **silently drops ALL rows and returns 0 results!**',
          '### 3. The Safe Pattern: Always Filter Out NULLs in Inner Queries',
          '```sql\n-- ✅ Always include WHERE col IS NOT NULL in subqueries used with NOT IN:\nSELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Finding Unordered Products Safely',
            sqlSnippet: 'SELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);',
            explanation: 'Isolates the 6 products that have never been ordered.',
            tableData: {
              tableName: 'Unordered Products',
              columns: ['name', 'price'],
              rows: [
                ['USB-C Charging Cable', 9.99],
                ['Cutting Board Set', 18.00],
                ['Football', 16.50],
                ['Wireless Doorbell', 38.00],
                ['Portable Charger', 21.99],
                ['Miscellaneous Clearance Item', 4.99],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Safe NOT IN subquery syntax',
            sql: 'SELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);',
            description: 'Safely excludes ordered products by guaranteeing no NULL values in the inner list.',
          },
        ],
        keyTakeaway: 'Always add WHERE column IS NOT NULL inside a NOT IN subquery to prevent the three-valued logic NULL trap.',
        exampleQuery: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
        exampleQueryExplanation: 'Finds products that have never been ordered.',
        liveDemoSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
        liveDemoNotes: 'Displays the 6 products with zero sales history.',
        mcqs: [
          {
            question: 'Why does `WHERE id NOT IN (1, 2, NULL)` return 0 rows even for id = 5?',
            options: [
              'A. Because SQL syntax requires quotes around NULL',
              'B. Because id != NULL evaluates to UNKNOWN, and TRUE AND UNKNOWN is UNKNOWN, which WHERE drops',
              'C. Because NULL is treated as 0',
              'D. Because the query has an invalid table alias',
            ],
            correctIndex: 1,
            explanation: 'Any equality or inequality comparison with NULL evaluates to UNKNOWN, causing NOT IN with NULL to never evaluate to TRUE.',
          },
        ],
        masteryPoints: [
          'Understand how three-valued logic affects NOT IN',
          'Always add WHERE col IS NOT NULL to subqueries used in NOT IN',
        ],
      },
      tasks: [
        {
          id: 'day17-c1c-t1',
          title: 'Task 1: Products Never Ordered (Safe NOT IN)',
          description: 'Find the name and price of all products that have never been ordered using a safe NOT IN subquery with `WHERE product_id IS NOT NULL`.',
          instructions: [
            'Select `name` and `price` from `products`.',
            'Where `product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: '-- Safe NOT IN subquery\n',
          solutionSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
          solutionExplanation: 'Safely finds the 6 products that have zero order records.',
          hints: [{ level: 1, text: 'Use `WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'price'],
            expectedRowCount: 6,
          },
          successMessage: 'Unordered products identified safely with NOT IN!',
        },
        {
          id: 'day17-c1c-t2',
          title: 'Task 2: Fix the Broken NOT IN Subquery',
          description: 'A developer wrote a query that returned 0 rows because of the NULL trap. Fix it by ensuring the subquery filters out NULL product IDs.',
          instructions: [
            'Query the `products` table.',
            'Select `name` and `price`.',
            'Fix the subquery filter: `WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items);\n',
          solutionSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
          solutionExplanation: 'Adding `WHERE product_id IS NOT NULL` prevents NULL values from destroying the NOT IN logic.',
          hints: [{ level: 1, text: 'Add `WHERE product_id IS NOT NULL` inside the inner subquery.' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'price'],
            expectedRowCount: 6,
          },
          successMessage: 'Spot on! You defeated the classic three-valued logic NOT IN NULL trap.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Common Table Expressions (WITH syntax)
    // =========================================================================
    {
      id: 'common-table-expressions-cte',
      order: 4,
      title: '4. Common Table Expressions (WITH syntax)',
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
          successMessage: 'Category stats CTE created and filtered!',
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
    scenario: 'Solve these complex analytical queries using subqueries and CTEs:',
    tasks: [
      {
        id: 'day17-hw-1',
        title: 'Task 1: Products priced higher than the category average',
        description: 'Products priced higher than the category average for their own category.',
        instructions: [
          'Select `p1.name`, `p1.category_id`, `p1.price` from `products p1` where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
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
  description: 'Learn safe data modification commands (INSERT, UPDATE, DELETE), the critical danger of missing WHERE clauses, and transaction safety.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Insert single and multi-row records using INSERT INTO',
    'Safely modify records using UPDATE ... SET ... WHERE',
    'Safely delete records using DELETE FROM ... WHERE',
    'Recognize and prevent catastrophic unbounded table mutations',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: Inserting New Records with INSERT INTO
    // =========================================================================
    {
      id: 'dml-insert-into',
      order: 1,
      title: '1. Inserting New Records with INSERT INTO',
      shortDescription: 'Add new rows of data into existing database tables.',
      theory: {
        summary: '`INSERT INTO table (col1, col2) VALUES (val1, val2)` appends new records into a database table.',
        introTable: {
          tableName: 'products (before insert)',
          description: 'Products table before appending new record',
          columns: ['product_id', 'name', 'price', 'quantity_in_stock'],
          rows: [
            [1, 'Wireless Mouse', 15.99, 40],
            [2, 'Bluetooth Speaker', 45.50, 3],
          ],
        },
        explanation: [
          '### 1. INSERT INTO Syntax',
          'Specify the target table, the column names in parentheses, followed by `VALUES (...)` with the matching data:',
          '```sql\nINSERT INTO products (\n  name, supplier_id, category_id, price, quantity_in_stock, reorder_level\n) VALUES (\n  \'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20\n);\n```',
          'QUESTION_BLOCK::Auto-Increment IDs::You typically omit the primary key column (e.g. `product_id`) if the database is configured to generate sequential auto-increment IDs automatically.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Appending New Record',
            sqlSnippet: 'INSERT INTO products (name, price) VALUES (\'Precision Stylus Pen\', 29.99);',
            explanation: 'Creates a new row in the products table with the specified attributes.',
            tableData: {
              tableName: 'Newly Inserted Row',
              columns: ['name', 'price'],
              rows: [['Precision Stylus Pen', 29.99]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'INSERT INTO syntax',
            sql: 'INSERT INTO table_name (column1, column2)\nVALUES (value1, value2);',
            description: 'Inserts a new record into table_name.',
          },
        ],
        keyTakeaway: 'INSERT INTO adds new rows. Match the order of values to the specified column list.',
        exampleQuery: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20);',
        exampleQueryExplanation: 'Appends a new mouse record to the catalog.',
        liveDemoSql: 'SELECT * FROM products ORDER BY product_id DESC LIMIT 1;',
        liveDemoNotes: 'Displays the most recently added product.',
        mcqs: [
          {
            question: 'What happens if the number of columns in the column list does not match the number of values in VALUES?',
            options: [
              'A. SQL fills missing columns with 0',
              'B. SQL throws a column count mismatch syntax error',
              'C. SQL inserts a blank row',
              'D. SQL ignores the extra values',
            ],
            correctIndex: 1,
            explanation: 'The number of specified columns and provided values must match exactly.',
          },
        ],
        masteryPoints: ['Write well-formed INSERT INTO statements with explicit column lists'],
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
          initialSql: '-- Insert a new product\n',
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
          title: 'Task 2: Insert a New Customer',
          description: 'Insert a new customer profile into the `customers` table.',
          instructions: [
            'Insert into `customers (name, email, city, signup_date)`.',
            'Values: `(\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\')`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Insert new customer\n',
          solutionSql: 'INSERT INTO customers (name, email, city, signup_date) VALUES (\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\');',
          solutionExplanation: 'Appends Sultana Begum to the customer roster.',
          hints: [{ level: 1, text: 'Use `INSERT INTO customers (name, email, city, signup_date) VALUES (\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\');`' }],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 1,
          },
          successMessage: 'Well done! New customer record inserted.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2a: Modifying Rows Safely with UPDATE ... SET ... WHERE
    // =========================================================================
    {
      id: 'dml-safe-update',
      order: 2,
      title: '2. Modifying Rows Safely with UPDATE ... SET ... WHERE',
      shortDescription: 'Update specific records and avoid unintended table-wide modifications.',
      theory: {
        summary: '`UPDATE table SET col = new_value WHERE condition` modifies existing data. Always verify the WHERE condition first, because omitting WHERE mutates EVERY row in the entire table!',
        introTable: {
          tableName: 'products (before update)',
          description: 'Product 1 before targeted price change',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [2, 'Bluetooth Speaker', 45.50],
          ],
        },
        explanation: [
          '### 1. The Anatomy of an UPDATE',
          '```sql\nUPDATE products\nSET price = 19.99\nWHERE product_id = 1;\n```',
          '### 2. The Danger of Missing WHERE',
          'QUESTION_BLOCK::Critical Warning::If you accidentally run `UPDATE products SET price = 19.99;` without a `WHERE` clause, **every product in the catalog will be set to $19.99**! Always write your `WHERE` clause first.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Targeted Update with WHERE',
            sqlSnippet: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
            explanation: 'Selectively increases product 1 price by 10% without altering other products.',
            tableData: {
              tableName: 'Updated Row',
              columns: ['product_id', 'name', 'price'],
              rows: [[1, 'Wireless Mouse', 17.59]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'UPDATE syntax',
            sql: 'UPDATE products\nSET price = 24.99\nWHERE product_id = 1;',
            description: 'Modifies specific rows matching the WHERE criteria.',
          },
        ],
        keyTakeaway: 'Always include a WHERE clause with UPDATE to prevent table-wide data overwrite.',
        exampleQuery: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
        exampleQueryExplanation: 'Safely increases product 1 price by 10%.',
        liveDemoSql: 'SELECT * FROM products WHERE product_id = 1;',
        liveDemoNotes: 'Displays product record.',
        mcqs: [
          {
            question: 'What happens if you run `UPDATE products SET price = 0;` without a WHERE clause?',
            options: [
              'A. Only the first row is updated',
              'B. SQL asks for user confirmation',
              'C. Every single product in the table has its price changed to 0',
              'D. The database throws an error',
            ],
            correctIndex: 2,
            explanation: 'Without a WHERE clause, UPDATE modifies all rows in the table.',
          },
        ],
        masteryPoints: ['Write targeted UPDATE statements', 'Prevent accidental full-table overwrites'],
      },
      tasks: [
        {
          id: 'day19-c2a-t1',
          title: 'Task 1: Targeted Price Increase',
          description: 'Safely update the price of product_id 1 by 10% (price = price * 1.10).',
          instructions: [
            'Update `products`.',
            'Set `price = price * 1.10`.',
            'Where `product_id = 1`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
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
          successMessage: 'Product price updated safely with WHERE!',
        },
        {
          id: 'day19-c2a-t2',
          title: 'Task 2: Restock Category 1 Products',
          description: 'Increase quantity_in_stock by 20 for all products belonging to category_id 1 (Electronics).',
          instructions: [
            'Update `products`.',
            'Set `quantity_in_stock = quantity_in_stock + 20`.',
            'Where `category_id = 1`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Restock category 1 products\n',
          solutionSql: 'UPDATE products SET quantity_in_stock = quantity_in_stock + 20 WHERE category_id = 1;',
          solutionExplanation: 'Updates all products in category 1.',
          hints: [{ level: 1, text: 'Use `UPDATE products SET quantity_in_stock = quantity_in_stock + 20 WHERE category_id = 1;`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 6,
          },
          successMessage: 'Well done! Batch category update executed safely.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2b: Removing Rows Safely with DELETE FROM ... WHERE
    // =========================================================================
    {
      id: 'dml-safe-delete',
      order: 3,
      title: '3. Removing Rows Safely with DELETE FROM ... WHERE',
      shortDescription: 'Remove specific rows and prevent accidental table wipes.',
      theory: {
        summary: '`DELETE FROM table WHERE condition` removes targeted rows. Omitting WHERE wipes all data in the table.',
        introTable: {
          tableName: 'orders (before deletion)',
          description: 'Orders table with temporary test order 18',
          columns: ['order_id', 'customer_id', 'status'],
          rows: [
            [17, 3, 'delivered'],
            [18, 1, 'pending'],
          ],
        },
        explanation: [
          '### 1. The Anatomy of a DELETE',
          '```sql\nDELETE FROM orders\nWHERE order_id = 18;\n```',
          '### 2. The Danger of Missing WHERE',
          'QUESTION_BLOCK::Catastrophic Data Loss::Executing `DELETE FROM orders;` without a `WHERE` clause deletes **every single row** in the table! Always specify the exact primary key or condition to delete.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Targeted Row Deletion',
            sqlSnippet: 'DELETE FROM orders WHERE order_id = 18;',
            explanation: 'Removes order #18 cleanly from the database.',
            tableData: {
              tableName: 'Surviving Orders',
              columns: ['order_id', 'status'],
              rows: [[17, 'delivered']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'DELETE syntax',
            sql: 'DELETE FROM table_name\nWHERE condition;',
            description: 'Deletes rows matching the condition.',
          },
        ],
        keyTakeaway: 'Always verify your WHERE clause before executing DELETE to avoid wiping entire tables.',
        exampleQuery: 'DELETE FROM orders WHERE order_id = 18;',
        exampleQueryExplanation: 'Deletes order #18.',
        liveDemoSql: 'SELECT * FROM orders WHERE order_id = 18;',
        liveDemoNotes: 'Displays order before deletion.',
        mcqs: [
          {
            question: 'What does `DELETE FROM customers;` do?',
            options: [
              'A. Deletes only inactive customers',
              'B. Drops the customer table schema',
              'C. Deletes every single row in the customers table',
              'D. Prompts for confirmation',
            ],
            correctIndex: 2,
            explanation: 'DELETE without WHERE deletes all rows from the table.',
          },
        ],
        masteryPoints: ['Write targeted DELETE statements', 'Guard against unbounded table deletion'],
      },
      tasks: [
        {
          id: 'day19-c2b-t1',
          title: 'Task 1: Delete Disposable Test Order',
          description: 'Delete the test order with order_id 18 from the orders table.',
          instructions: [
            'Delete from `orders`.',
            'Where `order_id = 18`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'orders',
          initialSql: '-- Delete order 18\n',
          solutionSql: 'DELETE FROM orders WHERE order_id = 18;',
          solutionExplanation: 'Safely removes order record 18.',
          hints: [{ level: 1, text: 'Use `DELETE FROM orders WHERE order_id = 18;`' }],
          validation: {
            targetTable: 'orders',
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Order 18 safely deleted!',
        },
        {
          id: 'day19-c2b-t2',
          title: 'Task 2: Guard an Unbounded Delete',
          description: 'A junior script has a dangerous query: `DELETE FROM products;`. Fix it so it only removes obsolete products that are completely out of stock (`quantity_in_stock = 0`).',
          instructions: [
            'Delete from `products`.',
            'Add the safeguard filter: `WHERE quantity_in_stock = 0`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: 'DELETE FROM products;\n',
          solutionSql: 'DELETE FROM products WHERE quantity_in_stock = 0;',
          solutionExplanation: 'Adds a WHERE condition to only delete items with 0 stock (3 items).',
          hints: [{ level: 1, text: 'Add `WHERE quantity_in_stock = 0;`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 3,
          },
          successMessage: 'Spot on! You guarded against an unbounded table wipe.',
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
  description: 'Deeply master Data Definition Language: CREATE TABLE, column data types, integrity constraints (PK, NOT NULL, UNIQUE, DEFAULT, CHECK), ALTER TABLE schema modifications, FOREIGN KEY relations, and DROP TABLE.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Create structured tables with CREATE TABLE',
    'Choose appropriate column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)',
    'Enforce entity identity with PRIMARY KEY and AUTO_INCREMENT',
    'Apply data integrity constraints: NOT NULL, UNIQUE, DEFAULT, and CHECK',
    'Modify existing table schemas using ALTER TABLE ... ADD COLUMN',
    'Establish relational foreign key constraints using ALTER TABLE ... ADD FOREIGN KEY',
    'Safely tear down temporary schemas using DROP TABLE IF EXISTS',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: Creating a Table with CREATE TABLE
    // =========================================================================
    {
      id: 'ddl-create-table',
      order: 1,
      title: '1. Creating a Table with CREATE TABLE',
      shortDescription: 'Define table structure and allocate new database entities.',
      theory: {
        summary: '`CREATE TABLE table_name (col1 type, col2 type)` creates a new empty table structure in your database.',
        introTable: {
          tableName: 'product_tags (blueprint)',
          description: 'Blueprint for tagging inventory items',
          columns: ['tag_id', 'tag_name'],
          rows: [
            [1, 'bestseller'],
            [2, 'clearance'],
          ],
        },
        explanation: [
          '### 1. The Core CREATE TABLE Syntax',
          '```sql\nCREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);\n```',
          'QUESTION_BLOCK::Table Names::Table names should be lowercase, descriptive, and pluralized by convention (e.g. `products`, `orders`, `tags`).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Creating Table',
            sqlSnippet: 'CREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);',
            explanation: 'Allocates storage structure with two columns: tag_id and tag_name.',
            tableData: {
              tableName: 'Created Structure',
              columns: ['Column Name', 'Type'],
              rows: [
                ['tag_id', 'INT'],
                ['tag_name', 'VARCHAR(50)'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'CREATE TABLE syntax',
            sql: 'CREATE TABLE table_name (\n  column1 datatype,\n  column2 datatype\n);',
            description: 'Creates a new table schema.',
          },
        ],
        keyTakeaway: 'CREATE TABLE defines the column blueprint for your database entity.',
        exampleQuery: 'CREATE TABLE product_tags ( tag_id INT, tag_name VARCHAR(50) );',
        exampleQueryExplanation: 'Creates a simple tag table.',
        liveDemoSql: 'SELECT * FROM categories LIMIT 1;',
        liveDemoNotes: 'Displays existing table structure.',
        mcqs: [
          {
            question: 'What is the minimum requirement to create a table in SQL?',
            options: [
              'A. Only a table name',
              'B. A table name and at least one column definition (name and data type)',
              'C. A table name and an existing CSV file',
              'D. A foreign key constraint',
            ],
            correctIndex: 1,
            explanation: 'Every CREATE TABLE requires a table name and at least one column with a defined data type.',
          },
        ],
        masteryPoints: ['Write clean CREATE TABLE statements'],
      },
      tasks: [
        {
          id: 'day20-c1-t1',
          title: 'Task 1: Create the Product Tags Table',
          description: 'Create a new table named `product_tags` with `tag_id INT` and `tag_name VARCHAR(50)`.',
          instructions: [
            'Write `CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'product_tags',
          initialSql: '-- Create product_tags table\n',
          solutionSql: 'CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));',
          solutionExplanation: 'Creates product_tags with tag_id and tag_name.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));`' }],
          validation: {
            targetTable: 'product_tags',
            expectedRowCount: 1,
          },
          successMessage: 'Product tags table created!',
        },
        {
          id: 'day20-c1-t2',
          title: 'Task 2: Create Quick Notes Table',
          description: 'Create a table named `quick_notes` with columns `note_id INT` and `content TEXT`.',
          instructions: [
            'Create table `quick_notes`.',
            'Define `note_id INT` and `content TEXT`.',
          ],
          type: 'independent',
          primaryTable: 'quick_notes',
          initialSql: '-- Create quick_notes table\n',
          solutionSql: 'CREATE TABLE quick_notes (note_id INT, content TEXT);',
          solutionExplanation: 'Allocates the quick_notes table schema.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE quick_notes (note_id INT, content TEXT);`' }],
          validation: {
            targetTable: 'quick_notes',
            expectedRowCount: 1,
          },
          successMessage: 'Well done! Quick notes table created.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Column Data Types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)
    // =========================================================================
    {
      id: 'ddl-data-types',
      order: 2,
      title: '2. Choosing Column Data Types',
      shortDescription: 'INT, VARCHAR, DECIMAL, DATETIME, and MySQL BOOLEAN / TINYINT(1).',
      theory: {
        summary: 'Choosing the correct data type ensures storage efficiency, query speed, and data accuracy.',
        introTable: {
          tableName: 'Common SQL Data Types',
          description: 'Standard SQL data types comparison',
          columns: ['Type', 'Usage', 'Example Values'],
          rows: [
            ['INT', 'Whole numbers / IDs', '1, 42, -500'],
            ['VARCHAR(255)', 'Variable-length text', "'Wireless Mouse'"],
            ['DECIMAL(10,2)', 'Exact financial numbers (10 digits, 2 decimals)', '49.99, 1200.50'],
            ['DATETIME', 'Timestamps with date & time', "'2026-08-25 14:30:00'"],
            ['BOOLEAN', 'True/False (In MySQL: TINYINT(1) where 1=TRUE, 0=FALSE)', 'TRUE (1), FALSE (0)'],
          ],
        },
        explanation: [
          '### 1. DECIMAL Precision & Scale',
          '`DECIMAL(10, 2)` means **10 total digits** with **2 digits after the decimal point** (maximum: 99,999,999.99). Never use FLOAT for currency because floating-point rounding causes financial inaccuracy!',
          '### 2. MySQL BOOLEAN Note',
          'QUESTION_BLOCK::MySQL BOOLEAN Engine Detail::In MySQL, `BOOLEAN` is an alias for `TINYINT(1)`. `TRUE` evaluates to `1` and `FALSE` evaluates to `0`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Multi-Type Schema Definition',
            sqlSnippet: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
            explanation: 'Demonstrates integer, decimal, boolean, and timestamp data types.',
            tableData: {
              tableName: 'Metrics Schema',
              columns: ['Column', 'Type'],
              rows: [
                ['product_id', 'INT'],
                ['weight_kg', 'DECIMAL(6,2)'],
                ['is_fragile', 'BOOLEAN / TINYINT(1)'],
                ['logged_at', 'DATETIME'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Data type declarations',
            sql: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
            description: 'Declares appropriate data types for varied business attributes.',
          },
        ],
        keyTakeaway: 'Always use DECIMAL for financial currency and appropriate string lengths for VARCHAR.',
        exampleQuery: 'CREATE TABLE product_metrics ( product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME );',
        exampleQueryExplanation: 'Creates a multi-type metrics table.',
        liveDemoSql: 'SELECT product_id, price FROM products LIMIT 3;',
        liveDemoNotes: 'Displays DECIMAL price columns.',
        mcqs: [
          {
            question: 'Why should monetary prices always use DECIMAL(10,2) instead of FLOAT?',
            options: [
              'A. Because FLOAT is deprecated',
              'B. Because FLOAT uses binary approximations that cause floating-point rounding errors on money calculations',
              'C. Because DECIMAL only works on positive numbers',
              'D. Because FLOAT cannot store decimals',
            ],
            correctIndex: 1,
            explanation: 'DECIMAL stores exact fixed-point numbers, preventing floating-point rounding inaccuracies.',
          },
        ],
        masteryPoints: ['Select appropriate data types', 'Understand DECIMAL precision and MySQL BOOLEAN/TINYINT(1)'],
      },
      tasks: [
        {
          id: 'day20-c2-t1',
          title: 'Task 1: Create Product Metrics Table',
          description: 'Create `product_metrics` with `product_id INT`, `weight_kg DECIMAL(6,2)`, `is_fragile BOOLEAN`, and `logged_at DATETIME`.',
          instructions: [
            'Write `CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'product_metrics',
          initialSql: '-- Create product_metrics table\n',
          solutionSql: 'CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);',
          solutionExplanation: 'Creates product_metrics schema with precision decimals and booleans.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);`' }],
          validation: {
            targetTable: 'product_metrics',
            expectedRowCount: 1,
          },
          successMessage: 'Product metrics table created!',
        },
        {
          id: 'day20-c2-t2',
          title: 'Task 2: Create Customer Preferences Table',
          description: 'Create `customer_preferences` with `customer_id INT`, `newsletter_subscribed BOOLEAN`, and `monthly_budget DECIMAL(10,2)`.',
          instructions: [
            'Create table `customer_preferences`.',
            'Include `customer_id INT`, `newsletter_subscribed BOOLEAN`, `monthly_budget DECIMAL(10,2)`.',
          ],
          type: 'independent',
          primaryTable: 'customer_preferences',
          initialSql: '-- Customer preferences table\n',
          solutionSql: 'CREATE TABLE customer_preferences (customer_id INT, newsletter_subscribed BOOLEAN, monthly_budget DECIMAL(10,2));',
          solutionExplanation: 'Defines preferences with boolean and currency decimal types.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE customer_preferences (customer_id INT, newsletter_subscribed BOOLEAN, monthly_budget DECIMAL(10,2));`' }],
          validation: {
            targetTable: 'customer_preferences',
            expectedRowCount: 1,
          },
          successMessage: 'Well done! Data types declared accurately.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3: The PRIMARY KEY Constraint
    // =========================================================================
    {
      id: 'ddl-primary-key',
      order: 3,
      title: '3. The PRIMARY KEY Constraint',
      shortDescription: 'Uniquely identify every row and configure AUTO_INCREMENT.',
      theory: {
        summary: 'A `PRIMARY KEY` uniquely identifies each record in a table. It cannot contain NULL values, cannot have duplicates, and creates an automatic clustered index.',
        introTable: {
          tableName: 'categories_new',
          description: 'Primary key identity demo',
          columns: ['category_id (PK)', 'name'],
          rows: [
            [1, 'Electronics'],
            [2, 'Kitchen & Dining'],
            [3, 'Office Supplies'],
          ],
        },
        explanation: [
          '### 1. PRIMARY KEY & AUTO_INCREMENT',
          '```sql\nCREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);\n```',
          'QUESTION_BLOCK::Auto-Incrementing Sequence::When you insert a row without specifying `category_id`, the database automatically generates the next sequential integer (1, 2, 3, 4...).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Primary Key Declaration',
            sqlSnippet: 'CREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
            explanation: 'Declares category_id as the unique row identifier.',
            tableData: {
              tableName: 'Primary Key Table',
              columns: ['Column', 'Constraint'],
              rows: [['category_id', 'PRIMARY KEY AUTO_INCREMENT']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'PRIMARY KEY syntax',
            sql: 'CREATE TABLE table_name (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
            description: 'Defines auto-increment primary key.',
          },
        ],
        keyTakeaway: 'A PRIMARY KEY guarantees uniqueness and provides a permanent identity for each record.',
        exampleQuery: 'CREATE TABLE categories_new ( category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) );',
        exampleQueryExplanation: 'Creates category table with auto-incrementing primary key.',
        liveDemoSql: 'SELECT customer_id, name FROM customers LIMIT 3;',
        liveDemoNotes: 'Displays customer primary key IDs.',
        mcqs: [
          {
            question: 'Can a PRIMARY KEY column contain NULL values?',
            options: [
              'A. Yes, at most one NULL',
              'B. No, PRIMARY KEY columns are implicitly NOT NULL and strictly unique',
              'C. Yes, if AUTO_INCREMENT is off',
              'D. Only in SQLite',
            ],
            correctIndex: 1,
            explanation: 'Primary keys strictly disallow NULL values and require unique scalar entries for every row.',
          },
        ],
        masteryPoints: ['Declare PRIMARY KEY with AUTO_INCREMENT'],
      },
      tasks: [
        {
          id: 'day20-c3-t1',
          title: 'Task 1: Create Categories Table with Primary Key',
          description: 'Create a table named `categories_new` with `category_id INT AUTO_INCREMENT PRIMARY KEY` and `name VARCHAR(100)`.',
          instructions: [
            'Write `CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'categories_new',
          initialSql: '-- Categories with PK\n',
          solutionSql: 'CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));',
          solutionExplanation: 'Creates table with auto-incrementing primary key.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));`' }],
          validation: {
            targetTable: 'categories_new',
            expectedRowCount: 1,
          },
          successMessage: 'Categories table created with Primary Key!',
        },
        {
          id: 'day20-c3-t2',
          title: 'Task 2: Create Departments Table with Primary Key',
          description: 'Create `departments` with `dept_id INT AUTO_INCREMENT PRIMARY KEY` and `title VARCHAR(80)`.',
          instructions: [
            'Create table `departments`.',
            'Define `dept_id INT AUTO_INCREMENT PRIMARY KEY` and `title VARCHAR(80)`.',
          ],
          type: 'independent',
          primaryTable: 'departments',
          initialSql: '-- Departments with PK\n',
          solutionSql: 'CREATE TABLE departments (dept_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(80));',
          solutionExplanation: 'Allocates departments with primary key.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE departments (dept_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(80));`' }],
          validation: {
            targetTable: 'departments',
            expectedRowCount: 1,
          },
          successMessage: 'Perfect! Primary key constraint configured.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 4: Mandatory Columns with NOT NULL
    // =========================================================================
    {
      id: 'ddl-not-null',
      order: 4,
      title: '4. Mandatory Columns with NOT NULL',
      shortDescription: 'Prevent missing values and enforce required business fields.',
      theory: {
        summary: 'The `NOT NULL` constraint enforces that a column must have a value on every INSERT or UPDATE. Attempting to insert a NULL value triggers a constraint violation error.',
        introTable: {
          tableName: 'employees (schema)',
          description: 'Employees with mandatory name and salary',
          columns: ['emp_id (PK)', 'full_name (NOT NULL)', 'salary (NOT NULL)'],
          rows: [
            [101, 'Arif Chowdhury', 55000.00],
            [102, 'Nadia Islam', 62000.00],
          ],
        },
        explanation: [
          '### 1. Enforcing NOT NULL',
          '```sql\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);\n```',
          'QUESTION_BLOCK::Data Hygiene::Use NOT NULL for essential data (names, prices, dates) to avoid dealing with NULL handling edge-cases later in analytics.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Applying NOT NULL',
            sqlSnippet: 'CREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);',
            explanation: 'Guarantees that no employee record can ever be saved without a name and salary.',
            tableData: {
              tableName: 'NOT NULL Schema',
              columns: ['Column', 'Requirement'],
              rows: [
                ['full_name', 'Mandatory (NOT NULL)'],
                ['salary', 'Mandatory (NOT NULL)'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'NOT NULL syntax',
            sql: 'CREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);',
            description: 'Enforces non-nullable column rules.',
          },
        ],
        keyTakeaway: 'Apply NOT NULL to every column that must always hold a concrete value.',
        exampleQuery: 'CREATE TABLE employees ( emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL );',
        exampleQueryExplanation: 'Creates employee table with NOT NULL constraints.',
        liveDemoSql: 'SELECT * FROM students WHERE age IS NOT NULL;',
        liveDemoNotes: 'Displays students with valid age entries.',
        mcqs: [
          {
            question: 'What happens when an INSERT query provides NULL for a column marked NOT NULL without a DEFAULT?',
            options: [
              'A. SQL inserts an empty string',
              'B. SQL aborts the query and throws a constraint violation error',
              'C. SQL inserts 0',
              'D. SQL prompts the terminal for input',
            ],
            correctIndex: 1,
            explanation: 'Violating a NOT NULL constraint raises a database error and rejects the insert.',
          },
        ],
        masteryPoints: ['Enforce mandatory columns using NOT NULL'],
      },
      tasks: [
        {
          id: 'day20-c4-t1',
          title: 'Task 1: Create Employees Table with NOT NULL',
          description: 'Create table `employees` with `emp_id INT PRIMARY KEY`, `full_name VARCHAR(100) NOT NULL`, and `salary DECIMAL(10,2) NOT NULL`.',
          instructions: [
            'Write `CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'employees',
          initialSql: '-- Employees with NOT NULL\n',
          solutionSql: 'CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);',
          solutionExplanation: 'Enforces NOT NULL on full_name and salary.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);`' }],
          validation: {
            targetTable: 'employees',
            expectedRowCount: 1,
          },
          successMessage: 'Employees table created with NOT NULL constraints!',
        },
        {
          id: 'day20-c4-t2',
          title: 'Task 2: Create User Logins Table',
          description: 'Create `user_logins` with `login_id INT PRIMARY KEY`, `username VARCHAR(50) NOT NULL`, and `password_hash VARCHAR(255) NOT NULL`.',
          instructions: [
            'Create table `user_logins`.',
            'Include `login_id INT PRIMARY KEY`, `username VARCHAR(50) NOT NULL`, `password_hash VARCHAR(255) NOT NULL`.',
          ],
          type: 'independent',
          primaryTable: 'user_logins',
          initialSql: '-- User logins table\n',
          solutionSql: 'CREATE TABLE user_logins (login_id INT PRIMARY KEY, username VARCHAR(50) NOT NULL, password_hash VARCHAR(255) NOT NULL);',
          solutionExplanation: 'Enforces required credentials using NOT NULL.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE user_logins (login_id INT PRIMARY KEY, username VARCHAR(50) NOT NULL, password_hash VARCHAR(255) NOT NULL);`' }],
          validation: {
            targetTable: 'user_logins',
            expectedRowCount: 1,
          },
          successMessage: 'Well done! Required fields protected with NOT NULL.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 5: Preventing Duplicates with UNIQUE
    // =========================================================================
    {
      id: 'ddl-unique',
      order: 5,
      title: '5. Preventing Duplicates with UNIQUE',
      shortDescription: 'Guarantee distinct column values across rows (emails, SKUs, usernames).',
      theory: {
        summary: 'The `UNIQUE` constraint ensures that all values in a column are distinct across all rows in the table. Unlike PRIMARY KEY, a table can have multiple UNIQUE columns.',
        introTable: {
          tableName: 'customer_emails (schema)',
          description: 'Enforcing unique email registration',
          columns: ['account_id (PK)', 'email (UNIQUE)'],
          rows: [
            [1, 'rafiul@example.com'],
            [2, 'priya.akter@example.com'],
          ],
        },
        explanation: [
          '### 1. UNIQUE Syntax',
          '```sql\nCREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);\n```',
          'QUESTION_BLOCK::UNIQUE vs PRIMARY KEY::A table can only have **one** PRIMARY KEY, but can have **multiple** UNIQUE columns (e.g. `username UNIQUE`, `email UNIQUE`, `phone_number UNIQUE`).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Applying UNIQUE Constraint',
            sqlSnippet: 'CREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);',
            explanation: 'Guarantees no duplicate emails can ever be inserted.',
            tableData: {
              tableName: 'UNIQUE Schema',
              columns: ['Column', 'Constraint'],
              rows: [['email', 'NOT NULL UNIQUE']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'UNIQUE syntax',
            sql: 'CREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);',
            description: 'Enforces column uniqueness.',
          },
        ],
        keyTakeaway: 'Use UNIQUE constraints to prevent duplicate emails, SKUs, slugs, and barcodes.',
        exampleQuery: 'CREATE TABLE customer_emails ( account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE );',
        exampleQueryExplanation: 'Creates customer emails table with UNIQUE constraint.',
        liveDemoSql: 'SELECT customer_id, email FROM customers WHERE email IS NOT NULL LIMIT 3;',
        liveDemoNotes: 'Displays distinct customer email addresses.',
        mcqs: [
          {
            question: 'How many UNIQUE constraints can a single table contain?',
            options: [
              'A. Exactly one',
              'B. As many as needed across different columns',
              'C. None if a PRIMARY KEY exists',
              'D. Maximum 2',
            ],
            correctIndex: 1,
            explanation: 'A table can have multiple UNIQUE constraints across any columns requiring distinct values.',
          },
        ],
        masteryPoints: ['Apply UNIQUE constraints to business keys'],
      },
      tasks: [
        {
          id: 'day20-c5-t1',
          title: 'Task 1: Create Customer Emails Table with UNIQUE',
          description: 'Create `customer_emails` with `account_id INT PRIMARY KEY` and `email VARCHAR(150) NOT NULL UNIQUE`.',
          instructions: [
            'Write `CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customer_emails',
          initialSql: '-- Customer emails with UNIQUE\n',
          solutionSql: 'CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);',
          solutionExplanation: 'Enforces email uniqueness with UNIQUE.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);`' }],
          validation: {
            targetTable: 'customer_emails',
            expectedRowCount: 1,
          },
          successMessage: 'Customer emails table created with UNIQUE constraint!',
        },
        {
          id: 'day20-c5-t2',
          title: 'Task 2: Create Product SKUs Table with UNIQUE',
          description: 'Create `product_skus` with `item_id INT PRIMARY KEY` and `sku_code VARCHAR(30) NOT NULL UNIQUE`.',
          instructions: [
            'Create table `product_skus`.',
            'Include `item_id INT PRIMARY KEY` and `sku_code VARCHAR(30) NOT NULL UNIQUE`.',
          ],
          type: 'independent',
          primaryTable: 'product_skus',
          initialSql: '-- Product SKUs with UNIQUE\n',
          solutionSql: 'CREATE TABLE product_skus (item_id INT PRIMARY KEY, sku_code VARCHAR(30) NOT NULL UNIQUE);',
          solutionExplanation: 'Prevents duplicate SKU codes.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE product_skus (item_id INT PRIMARY KEY, sku_code VARCHAR(30) NOT NULL UNIQUE);`' }],
          validation: {
            targetTable: 'product_skus',
            expectedRowCount: 1,
          },
          successMessage: 'Perfect! Product SKU uniqueness guaranteed.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 6: Automatic Fallback Values with DEFAULT
    // =========================================================================
    {
      id: 'ddl-default',
      order: 6,
      title: '6. Automatic Fallback Values with DEFAULT',
      shortDescription: 'Supply automatic fallback values when INSERT omits a column.',
      theory: {
        summary: 'The `DEFAULT` constraint specifies a fallback value for a column when an `INSERT` statement does not explicitly provide one.',
        introTable: {
          tableName: 'audit_logs (schema)',
          description: 'Logs table with automatic timestamp default',
          columns: ['log_id (PK)', 'action', 'created_at (DEFAULT CURRENT_TIMESTAMP)'],
          rows: [
            [1, 'user_login', '2026-08-25 15:00:00'],
            [2, 'item_checkout', '2026-08-25 15:05:12'],
          ],
        },
        explanation: [
          '### 1. DEFAULT Syntax Examples',
          '• Number default: `balance DECIMAL(10,2) DEFAULT 0.00`',
          '• String default: `status VARCHAR(20) DEFAULT \'active\'`',
          '• Timestamp default: `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Applying DEFAULT',
            sqlSnippet: 'CREATE TABLE audit_logs (\n  log_id INT PRIMARY KEY,\n  action VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
            explanation: 'Automatically fills created_at with current server timestamp when omitted.',
            tableData: {
              tableName: 'DEFAULT Schema',
              columns: ['Column', 'Default Value'],
              rows: [['created_at', 'CURRENT_TIMESTAMP']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'DEFAULT syntax',
            sql: 'CREATE TABLE audit_logs (\n  log_id INT PRIMARY KEY,\n  action VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
            description: 'Configures default values for column insertions.',
          },
        ],
        keyTakeaway: 'DEFAULT eliminates the need to manually pass timestamps or standard initial zero/active states.',
        exampleQuery: 'CREATE TABLE audit_logs ( log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
        exampleQueryExplanation: 'Creates audit logs with automatic timestamp default.',
        liveDemoSql: 'SELECT order_id, order_date, status FROM orders LIMIT 3;',
        liveDemoNotes: 'Displays orders with timestamps.',
        mcqs: [
          {
            question: 'What happens if you insert a row without mentioning a column that has a DEFAULT specified?',
            options: [
              'A. The query errors with a missing field warning',
              'B. SQL automatically populates that column with the configured DEFAULT value',
              'C. The column is set to NULL',
              'D. The whole table is reset',
            ],
            correctIndex: 1,
            explanation: 'When an inserted column is omitted, SQL automatically substitutes the DEFAULT value.',
          },
        ],
        masteryPoints: ['Configure DEFAULT values for timestamps, counters, and status flags'],
      },
      tasks: [
        {
          id: 'day20-c6-t1',
          title: 'Task 1: Create Audit Logs Table with DEFAULT',
          description: 'Create `audit_logs` with `log_id INT PRIMARY KEY`, `action VARCHAR(100) NOT NULL`, and `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`.',
          instructions: [
            'Write `CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'audit_logs',
          initialSql: '-- Audit logs with DEFAULT\n',
          solutionSql: 'CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);',
          solutionExplanation: 'Configures automatic CURRENT_TIMESTAMP default.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`' }],
          validation: {
            targetTable: 'audit_logs',
            expectedRowCount: 1,
          },
          successMessage: 'Audit logs table created with DEFAULT timestamp!',
        },
        {
          id: 'day20-c6-t2',
          title: 'Task 2: Create Store Credits Table with Defaults',
          description: 'Create `store_credits` with `account_id INT PRIMARY KEY`, `balance DECIMAL(10,2) DEFAULT 0.00`, and `status VARCHAR(20) DEFAULT \'active\'`.',
          instructions: [
            'Create table `store_credits`.',
            'Define `account_id INT PRIMARY KEY`, `balance DECIMAL(10,2) DEFAULT 0.00`, `status VARCHAR(20) DEFAULT \'active\'`.',
          ],
          type: 'independent',
          primaryTable: 'store_credits',
          initialSql: '-- Store credits with defaults\n',
          solutionSql: 'CREATE TABLE store_credits (account_id INT PRIMARY KEY, balance DECIMAL(10,2) DEFAULT 0.00, status VARCHAR(20) DEFAULT \'active\');',
          solutionExplanation: 'Configures default financial balance and status.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE store_credits (account_id INT PRIMARY KEY, balance DECIMAL(10,2) DEFAULT 0.00, status VARCHAR(20) DEFAULT \'active\');`' }],
          validation: {
            targetTable: 'store_credits',
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Default values configured cleanly.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 7: Business Rules with CHECK
    // =========================================================================
    {
      id: 'ddl-check',
      order: 7,
      title: '7. Business Rules with CHECK',
      shortDescription: 'Validate range conditions and rules directly at the database layer.',
      theory: {
        summary: 'A `CHECK` constraint validates that values inserted or updated in a column satisfy a boolean condition (e.g. `rating BETWEEN 1 AND 5`, `price >= 0`).',
        introTable: {
          tableName: 'product_ratings (schema)',
          description: 'Enforcing 1 to 5 star rating boundaries',
          columns: ['rating_id (PK)', 'score (CHECK 1..5)'],
          rows: [
            [1, 5],
            [2, 4],
          ],
        },
        explanation: [
          '### 1. CHECK Constraint Syntax',
          '```sql\nCREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);\n```',
          'QUESTION_BLOCK::Database-Level Safety::If a buggy frontend sends `score = 10` or `score = -1`, the database CHECK constraint instantly rejects the transaction and prevents corrupt data from ever entering your database.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Applying CHECK Constraint',
            sqlSnippet: 'CREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);',
            explanation: 'Guarantees ratings strictly stay between 1 and 5.',
            tableData: {
              tableName: 'CHECK Schema',
              columns: ['Column', 'Rule'],
              rows: [['score', 'CHECK (score BETWEEN 1 AND 5)']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'CHECK syntax',
            sql: 'CREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);',
            description: 'Enforces validation rule.',
          },
        ],
        keyTakeaway: 'Use CHECK constraints to guard business limits (positive prices, percentage ranges, rating bounds).',
        exampleQuery: 'CREATE TABLE product_ratings ( rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5) );',
        exampleQueryExplanation: 'Creates ratings table with boundary check.',
        liveDemoSql: 'SELECT product_id, price FROM products WHERE price > 0 LIMIT 3;',
        liveDemoNotes: 'Displays valid product prices.',
        mcqs: [
          {
            question: 'What happens if an application tries to insert rating = 6 into a column with `CHECK (rating BETWEEN 1 AND 5)`?',
            options: [
              'A. The database rounds it down to 5',
              'B. The database rejects the query with a CHECK constraint violation error',
              'C. It inserts NULL',
              'D. It logs a warning but allows the insert',
            ],
            correctIndex: 1,
            explanation: 'CHECK constraints strictly reject invalid data by throwing a violation error.',
          },
        ],
        masteryPoints: ['Write CHECK constraints for boundary and range validation'],
      },
      tasks: [
        {
          id: 'day20-c7-t1',
          title: 'Task 1: Create Product Ratings Table with CHECK',
          description: 'Create `product_ratings` with `rating_id INT PRIMARY KEY` and `score INT NOT NULL CHECK (score BETWEEN 1 AND 5)`.',
          instructions: [
            'Write `CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'product_ratings',
          initialSql: '-- Ratings with CHECK\n',
          solutionSql: 'CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));',
          solutionExplanation: 'Enforces valid 1-5 rating range with CHECK.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));`' }],
          validation: {
            targetTable: 'product_ratings',
            expectedRowCount: 1,
          },
          successMessage: 'Product ratings table created with CHECK constraint!',
        },
        {
          id: 'day20-c7-t2',
          title: 'Task 2: Create Employee Bonuses Table with CHECK',
          description: 'Create `employee_bonuses` with `bonus_id INT PRIMARY KEY` and `percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00)`.',
          instructions: [
            'Create table `employee_bonuses`.',
            'Define `bonus_id INT PRIMARY KEY` and `percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00)`.',
          ],
          type: 'independent',
          primaryTable: 'employee_bonuses',
          initialSql: '-- Employee bonuses with CHECK\n',
          solutionSql: 'CREATE TABLE employee_bonuses (bonus_id INT PRIMARY KEY, percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00));',
          solutionExplanation: 'Enforces bonus percentage between 0% and 100%.',
          hints: [{ level: 1, text: 'Use `CREATE TABLE employee_bonuses (bonus_id INT PRIMARY KEY, percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00));`' }],
          validation: {
            targetTable: 'employee_bonuses',
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! CHECK rule protects percentage boundaries.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 8: Modifying Existing Tables with ALTER TABLE ... ADD
    // =========================================================================
    {
      id: 'ddl-alter-table-add',
      order: 8,
      title: '8. Modifying Existing Tables with ALTER TABLE ... ADD',
      shortDescription: 'Add new columns to live tables without dropping existing data.',
      theory: {
        summary: 'As application requirements grow, you can add new columns to existing live tables using `ALTER TABLE table_name ADD COLUMN column_name data_type;`.',
        introTable: {
          tableName: 'products (adding is_featured)',
          description: 'Altering live products schema',
          columns: ['product_id', 'name', 'price', '+ is_featured (NEW)'],
          rows: [
            [1, 'Wireless Mouse', 15.99, 'FALSE (default)'],
            [2, 'Bluetooth Speaker', 45.50, 'FALSE (default)'],
          ],
        },
        explanation: [
          '### 1. ALTER TABLE ADD Syntax',
          '```sql\nALTER TABLE products\nADD COLUMN is_featured BOOLEAN DEFAULT FALSE;\n```',
          'QUESTION_BLOCK::Preserving Data::ALTER TABLE preserves all existing rows in the table, populating the new column with NULL (or the specified DEFAULT value).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Adding Column to Existing Table',
            sqlSnippet: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
            explanation: 'Appends is_featured to products without losing any existing catalog items.',
            tableData: {
              tableName: 'Altered Schema',
              columns: ['Existing Columns', 'New Column Added'],
              rows: [['product_id, name, price...', 'is_featured (BOOLEAN DEFAULT FALSE)']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'ALTER TABLE ADD syntax',
            sql: 'ALTER TABLE table_name\nADD COLUMN column_name datatype constraint;',
            description: 'Appends a new column to an existing table.',
          },
        ],
        keyTakeaway: 'ALTER TABLE allows schema evolution without destroying existing production data.',
        exampleQuery: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
        exampleQueryExplanation: 'Adds a featured flag column to products.',
        liveDemoSql: 'SELECT * FROM products LIMIT 2;',
        liveDemoNotes: 'Displays existing products schema.',
        mcqs: [
          {
            question: 'What happens to existing records when you execute `ALTER TABLE ... ADD COLUMN`?',
            options: [
              'A. All existing rows are deleted',
              'B. All existing rows are preserved, and the new column is filled with NULL or the column DEFAULT',
              'C. The database duplicates the table',
              'D. It fails if the table has data',
            ],
            correctIndex: 1,
            explanation: 'ALTER TABLE preserves existing records, populating new attributes with NULL or default values.',
          },
        ],
        masteryPoints: ['Evolve schemas safely using ALTER TABLE ADD COLUMN'],
      },
      tasks: [
        {
          id: 'day20-c8-t1',
          title: 'Task 1: Add Featured Flag to Products',
          description: 'Add a new column `is_featured BOOLEAN DEFAULT FALSE` to the `products` table using ALTER TABLE.',
          instructions: [
            'Write `ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Add is_featured column\n',
          solutionSql: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
          solutionExplanation: 'Appends is_featured to products.',
          hints: [{ level: 1, text: 'Use `ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'New column added to products safely!',
        },
        {
          id: 'day20-c8-t2',
          title: 'Task 2: Add Phone Number to Customers',
          description: 'Add a new column `phone_number VARCHAR(20)` to the `customers` table.',
          instructions: [
            'Alter table `customers`.',
            'Add column `phone_number VARCHAR(20)`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Add phone_number to customers\n',
          solutionSql: 'ALTER TABLE customers ADD COLUMN phone_number VARCHAR(20);',
          solutionExplanation: 'Adds phone_number column to customers.',
          hints: [{ level: 1, text: 'Use `ALTER TABLE customers ADD COLUMN phone_number VARCHAR(20);`' }],
          validation: {
            targetTable: 'customers',
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Customer schema extended with phone_number.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 9: Connecting Tables with ALTER TABLE ... ADD FOREIGN KEY
    // =========================================================================
    {
      id: 'ddl-foreign-key',
      order: 9,
      title: '9. Connecting Tables with FOREIGN KEY Constraints',
      shortDescription: 'Enforce relational integrity between child and parent tables.',
      theory: {
        summary: 'A `FOREIGN KEY` links a column in a child table to the `PRIMARY KEY` of a parent table, guaranteeing that orphaned records cannot be created.',
        introTable: {
          tableName: 'orders -> customers link',
          description: 'Relating orders to customers via foreign key',
          columns: ['Child Table Column (FK)', 'Parent Table Reference (PK)'],
          rows: [['orders.customer_id', 'customers.customer_id']],
        },
        explanation: [
          '### 1. Adding Foreign Key Constraints',
          '```sql\nALTER TABLE orders\nADD CONSTRAINT fk_orders_customer\nFOREIGN KEY (customer_id) REFERENCES customers(customer_id);\n```',
          'QUESTION_BLOCK::Referential Integrity::Once this constraint is active, SQL will prevent anyone from inserting an order with a non-existent `customer_id` (e.g. customer 9999).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Applying Foreign Key',
            sqlSnippet: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
            explanation: 'Enforces that all order customer_id values must exist in the customers table.',
            tableData: {
              tableName: 'Constraint Definition',
              columns: ['Constraint Name', 'FK Column', 'Target PK'],
              rows: [['fk_orders_customer', 'customer_id', 'customers(customer_id)']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'ADD FOREIGN KEY syntax',
            sql: 'ALTER TABLE child_table\nADD CONSTRAINT fk_name\nFOREIGN KEY (child_column) REFERENCES parent_table(parent_column);',
            description: 'Enforces relational referential integrity.',
          },
        ],
        keyTakeaway: 'Foreign keys protect relational integrity, preventing orphan or invalid records.',
        exampleQuery: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
        exampleQueryExplanation: 'Establishes foreign key constraint between orders and customers.',
        liveDemoSql: 'SELECT order_id, customer_id FROM orders LIMIT 3;',
        liveDemoNotes: 'Displays orders with parent customer IDs.',
        mcqs: [
          {
            question: 'What happens if you try to insert an order with customer_id = 999 when no customer 999 exists and a FOREIGN KEY is enabled?',
            options: [
              'A. The database creates a placeholder customer 999',
              'B. The insert is rejected with a foreign key constraint violation error',
              'C. The order is inserted with customer_id = NULL',
              'D. The database prompts for customer info',
            ],
            correctIndex: 1,
            explanation: 'Foreign keys guarantee referential integrity and strictly reject non-existent parent references.',
          },
        ],
        masteryPoints: ['Establish relational integrity with FOREIGN KEY constraints'],
      },
      tasks: [
        {
          id: 'day20-c9-t1',
          title: 'Task 1: Add Foreign Key from Orders to Customers',
          description: 'Add a foreign key constraint named `fk_orders_customer` on `orders(customer_id)` referencing `customers(customer_id)`.',
          instructions: [
            'Write `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'orders',
          secondaryTables: ['customers'],
          initialSql: '-- Add foreign key constraint\n',
          solutionSql: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
          solutionExplanation: 'Enforces foreign key link to customers.',
          hints: [{ level: 1, text: 'Use `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);`' }],
          validation: {
            targetTable: 'orders',
            expectedRowCount: 1,
          },
          successMessage: 'Foreign key constraint established successfully!',
        },
        {
          id: 'day20-c9-t2',
          title: 'Task 2: Add Foreign Key from Order Items to Products',
          description: 'Add a foreign key constraint named `fk_items_product` on `order_items(product_id)` referencing `products(product_id)`.',
          instructions: [
            'Alter table `order_items`.',
            'Add constraint `fk_items_product` foreign key `(product_id)` references `products(product_id)`.',
          ],
          type: 'independent',
          primaryTable: 'order_items',
          secondaryTables: ['products'],
          initialSql: '-- Add FK on order_items\n',
          solutionSql: 'ALTER TABLE order_items ADD CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(product_id);',
          solutionExplanation: 'Links order_items to products.',
          hints: [{ level: 1, text: 'Use `ALTER TABLE order_items ADD CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(product_id);`' }],
          validation: {
            targetTable: 'order_items',
            expectedRowCount: 1,
          },
          successMessage: 'Perfect! Relational integrity enforced on order_items.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 10: Removing Tables with DROP TABLE IF EXISTS
    // =========================================================================
    {
      id: 'ddl-drop-table',
      order: 10,
      title: '10. Removing Tables with DROP TABLE IF EXISTS',
      shortDescription: 'Permanently remove schemas and use IF EXISTS to prevent runtime errors.',
      theory: {
        summary: '`DROP TABLE table_name;` permanently destroys a table and all data inside it. Using `DROP TABLE IF EXISTS` avoids fatal errors if the table does not exist in migration scripts.',
        introTable: {
          tableName: 'Database Schema Cleanup',
          description: 'Dropping temporary staging entities',
          columns: ['Command', 'Behavior'],
          rows: [
            ['DROP TABLE table_name;', 'Fails with an error if table does not exist'],
            ['DROP TABLE IF EXISTS table_name;', 'Succeeds safely whether table exists or not'],
          ],
        },
        explanation: [
          '### 1. The Safe DROP TABLE Pattern',
          '```sql\nDROP TABLE IF EXISTS temp_order_staging;\n```',
          'QUESTION_BLOCK::Irreversible Deletion::Unlike deleting rows inside a transaction, dropping a table is a DDL operation that cannot typically be undone with a simple ROLLBACK. Use with care in production!',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Dropping Table Safely',
            sqlSnippet: 'DROP TABLE IF EXISTS temp_order_staging;',
            explanation: 'Permanently tears down table schema without throwing errors if already absent.',
            tableData: {
              tableName: 'Drop Status',
              columns: ['Target Table', 'Result'],
              rows: [['temp_order_staging', 'Destroyed cleanly']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'DROP TABLE syntax',
            sql: 'DROP TABLE IF EXISTS table_name;',
            description: 'Safely removes a table from the database.',
          },
        ],
        keyTakeaway: 'Always use IF EXISTS with DROP TABLE in reproducible migration and reset scripts.',
        exampleQuery: 'DROP TABLE IF EXISTS temp_order_staging;',
        exampleQueryExplanation: 'Safely drops staging table.',
        liveDemoSql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 2;',
        liveDemoNotes: 'Displays database tables.',
        mcqs: [
          {
            question: 'Why is `DROP TABLE IF EXISTS` preferred over plain `DROP TABLE` in migration scripts?',
            options: [
              'A. It executes twice as fast',
              'B. It prevents the entire migration script from crashing with an error if the table was already dropped or does not exist',
              'C. It backs up the data first',
              'D. It only drops empty tables',
            ],
            correctIndex: 1,
            explanation: '`IF EXISTS` suppresses missing-table errors, allowing scripts to run idempotently.',
          },
        ],
        masteryPoints: ['Safely tear down tables using DROP TABLE IF EXISTS'],
      },
      tasks: [
        {
          id: 'day20-c10-t1',
          title: 'Task 1: Drop Staging Table Safely',
          description: 'Safely drop the table named `temp_order_staging` if it exists.',
          instructions: [
            'Write `DROP TABLE IF EXISTS temp_order_staging;`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'temp_order_staging',
          initialSql: '-- Drop staging table\n',
          solutionSql: 'DROP TABLE IF EXISTS temp_order_staging;',
          solutionExplanation: 'Safely destroys temp_order_staging schema.',
          hints: [{ level: 1, text: 'Use `DROP TABLE IF EXISTS temp_order_staging;`' }],
          validation: {
            targetTable: 'temp_order_staging',
            expectedRowCount: 1,
          },
          successMessage: 'Staging table safely dropped!',
        },
        {
          id: 'day20-c10-t2',
          title: 'Task 2: Drop Legacy Grades Table',
          description: 'Safely drop the table named `legacy_student_grades` if it exists.',
          instructions: [
            'Drop table `legacy_student_grades` if it exists.',
          ],
          type: 'independent',
          primaryTable: 'legacy_student_grades',
          initialSql: '-- Drop legacy grades table\n',
          solutionSql: 'DROP TABLE IF EXISTS legacy_student_grades;',
          solutionExplanation: 'Safely drops legacy_student_grades.',
          hints: [{ level: 1, text: 'Use `DROP TABLE IF EXISTS legacy_student_grades;`' }],
          validation: {
            targetTable: 'legacy_student_grades',
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Legacy table destroyed cleanly.',
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
          'Write `CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'reviews',
        initialSql: '-- Task 1: Create the reviews table\n',
        solutionSql: 'CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
        solutionExplanation: 'Creates the new reviews entity table with complete constraints.',
        hints: [{ level: 1, text: 'Use `CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`' }],
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
