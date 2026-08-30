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
          'A scalar subquery MUST return exactly one row and one column. If it returns multiple rows or columns, SQL will halt with an error.',
        ],
        targetQuery: {
          sql: 'SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);',
          explanation: 'Find all products priced higher than the overall catalog average price.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inner Query Computes Average (Scalar Value)',
            sqlSnippet: 'SELECT AVG(price) FROM products;',
            explanation: 'Computes overall catalog average price ($30.13).',
            tableData: {
              tableName: 'Inner Subquery Scalar Result',
              columns: ['AVG(price)'],
              highlightedColumns: ['AVG(price)'],
              rows: [[30.13]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Outer Query Filters for price > $30.13',
            sqlSnippet: 'SELECT name, price FROM products WHERE price > 30.13;',
            explanation: 'Retains only items priced above the calculated average.',
            tableData: {
              tableName: 'Above Average Products Result',
              columns: ['name', 'price'],
              highlightedColumns: ['name', 'price'],
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
        targetQuery: {
          sql: 'SELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);',
          explanation: 'Find all customers who have placed at least one order using a dynamic IN subquery.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inner Query Generates Customer ID Set',
            sqlSnippet: 'SELECT customer_id FROM orders;',
            explanation: 'Produces dynamic ID list: (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).',
            tableData: {
              tableName: 'Order Placer IDs',
              columns: ['customer_id'],
              rows: [[1], [2], [3], [4], [5]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Outer Query Filters for Matching IDs',
            sqlSnippet: 'SELECT customer_id, name FROM customers WHERE customer_id IN (...)',
            explanation: 'Matches customer records against the active buyer list.',
            tableData: {
              tableName: 'Active Buyers Result',
              columns: ['customer_id', 'name'],
              highlightedColumns: ['customer_id', 'name'],
              rows: [
                [1, 'Rafiul Islam'],
                [2, 'Priya Akter'],
                [3, 'Tanvir Ahmed'],
              ],
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
        targetQuery: {
          sql: 'SELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);',
          explanation: 'Safely find products that have never been ordered, guarding against NULL trap failures.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inner Query Generates Non-NULL Product IDs',
            sqlSnippet: 'SELECT product_id FROM order_items WHERE product_id IS NOT NULL',
            explanation: 'Produces clean non-NULL list of ordered product IDs.',
            tableData: {
              tableName: 'Non-NULL Ordered Product IDs',
              columns: ['product_id'],
              rows: [[1], [2], [4], [5]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Outer Query Filters for product_id NOT IN (...)',
            sqlSnippet: 'SELECT name, price FROM products WHERE product_id NOT IN (...)',
            explanation: 'Isolates the 6 products that have never been ordered.',
            tableData: {
              tableName: 'Unordered Products Result',
              columns: ['name', 'price'],
              highlightedColumns: ['name', 'price'],
              rows: [
                ['USB-C Charging Cable', 9.99],
                ['Cutting Board Set', 18.00],
                ['Football', 16.50],
                ['Wireless Doorbell', 38.00],
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
    // CONCEPT 4: Correlated Subqueries (Per-Row Dynamic Benchmarks)
    // =========================================================================
    {
      id: 'subqueries-correlated',
      order: 4,
      title: '4. Correlated Subqueries (Per-Row Dynamic Benchmarks)',
      shortDescription: 'Compare each row dynamically against its own category or parent benchmark.',
      theory: {
        summary: 'Unlike an independent subquery that runs once, a correlated subquery references a column from the outer query table. It re-evaluates dynamically for every single row of the outer query.',
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
          '### 1. The Anatomy of a Correlated Subquery',
          '```sql\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);\n```',
          '• **Outer Query (`products p1`)**: Iterates through each product row one by one.',
          '• **Correlation Condition (`p2.category_id = p1.category_id`)**: Links the inner calculation specifically to `p1`\'s category.',
          '• **Inner Query (`products p2`)**: Calculates the average price only for products in that specific category.',
          'QUESTION_BLOCK::Repeated Execution Model::A regular subquery runs once for the whole query. A correlated subquery runs once for each outer row, comparing each item against its localized peer group.',
        ],
        targetQuery: {
          sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
          explanation: 'Compare each product against its own specific category average price dynamically.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Outer Query Evaluates Row Candidate',
            sqlSnippet: '-- Inspecting Product: "Office Chair" (Category 3, Price $120.00)',
            explanation: 'Outer query provides p1.category_id = 3 to the inner query.',
            tableData: {
              tableName: 'Outer Candidate Row (p1)',
              columns: ['name', 'price', 'category_id'],
              rows: [['Office Chair', 120.00, 3]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Inner Query Computes Category 3 Average',
            sqlSnippet: 'SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = 3;',
            explanation: 'Inner query evaluates to $47.15 (Category 3 average).',
            tableData: {
              tableName: 'Category 3 Benchmark (p2)',
              columns: ['AVG(price)'],
              highlightedColumns: ['AVG(price)'],
              rows: [[47.15]],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: WHERE Condition Evaluates ($120.00 > $47.15)',
            sqlSnippet: 'WHERE p1.price > 47.15 -- TRUE',
            explanation: 'Product is kept because its price exceeds its category average.',
            tableData: {
              tableName: 'Surviving Qualified Products',
              columns: ['name', 'price', 'category_id'],
              highlightedColumns: ['name', 'price'],
              rows: [
                ['Mechanical Keyboard', 65.00, 1],
                ['Office Chair', 120.00, 3],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Correlated subquery pattern',
            sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
            description: 'Compares each row dynamically to its category average.',
          },
        ],
        keyTakeaway: 'Correlated subqueries use outer table aliases to calculate localized, row-specific benchmarks.',
        exampleQuery: 'SELECT name, price, category_id FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        exampleQueryExplanation: 'Products priced above their specific category average.',
        liveDemoSql: 'SELECT name, price, category_id FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id) LIMIT 5;',
        liveDemoNotes: 'Displays products above their category average.',
        mcqs: [
          {
            question: 'How does a correlated subquery differ from an independent scalar subquery?',
            options: [
              'A. It runs in a separate database process',
              'B. It references a column from the outer query and evaluates once per outer row',
              'C. It requires single quotes around all table names',
              'D. It can only execute in MySQL 8.0+',
            ],
            correctIndex: 1,
            explanation: 'Correlated subqueries depend on values from the outer query row and execute repeatedly.',
          },
        ],
        masteryPoints: ['Write correlated subqueries using table aliases', 'Compare rows against localized category benchmarks'],
      },
      tasks: [
        {
          id: 'day17-c1d-t1',
          title: 'Task 1: Products Above Category Average',
          description: 'Find products that are more expensive than the average price of the products in their own category. Show each product\'s name, price, and category_id.',
          instructions: [
            'Query `products p1`.',
            'Select `p1.name`, `p1.price` and `p1.category_id`.',
            'Filter where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Products above their own category average\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
          solutionSql: 'SELECT p1.name, p1.price, p1.category_id FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
          solutionExplanation: 'Correlated subquery compares each product against its own category average price.',
          hints: [
            { level: 1, text: 'Use table aliases `p1` for the outer query and `p2` for the inner subquery.' },
            { level: 2, text: 'Correlate with `WHERE p2.category_id = p1.category_id` inside the AVG subquery.' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'price', 'category_id'],
            expectedRowCount: 12,
          },
          successMessage: 'Task 1 completed! Above-category-average products retrieved via correlated subquery.',
        },
        {
          id: 'day17-c1d-t2',
          title: 'Task 2: Products with Above-Average Stock in Category',
          description: 'Find products whose stock is higher than the average stock of the products in their own category. Show each product\'s name, quantity_in_stock, and category_id.',
          instructions: [
            'Query `products p1`.',
            'Select `p1.name`, `p1.quantity_in_stock`, and `p1.category_id`.',
            'Filter where `p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Products with stock above category average\n',
          solutionSql: 'SELECT p1.name, p1.quantity_in_stock, p1.category_id FROM products p1 WHERE p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id);',
          solutionExplanation: 'Calculates category-specific stock averages and filters high-inventory products.',
          hints: [{ level: 1, text: 'Use `WHERE p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id);`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'quantity_in_stock', 'category_id'],
            expectedRowCount: 13,
          },
          successMessage: 'Task 2 completed! Correlated inventory benchmark verified.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 5: Common Table Expressions (WITH syntax)
    // =========================================================================
    {
      id: 'common-table-expressions-cte',
      order: 5,
      title: '5. Common Table Expressions (WITH syntax)',
      shortDescription: 'Readable, modular multi-stage query architecture.',
      theory: {
        summary: 'A Common Table Expression (CTE) defined with `WITH name AS (...)` provides a named, readable temporary result set that exists for the duration of a single query.',
        introTable: {
          tableName: 'orders & customers',
          description: 'CTE pipeline input data',
          columns: ['customer_id', 'name', 'order_count'],
          rows: [
            [1, 'Rafiul Islam', 2],
            [2, 'Priya Akter', 1],
            [3, 'Tanvir Ahmed', 2],
          ],
        },
        explanation: [
          '### 1. What is a CTE?',
          'A CTE is a named temporary result set defined with `WITH cte_name AS (...)` placed at the top of your query.',
          'CTEs eliminate deeply nested subqueries and allow you to break complex business logic into clean, readable steps.',
        ],
        targetQuery: {
          sql: 'WITH ActiveCustomers AS (\n  SELECT DISTINCT customer_id FROM orders\n)\nSELECT c.customer_id, c.name\nFROM customers c\nJOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
          explanation: 'Stage active customer IDs in a clean CTE and join them with the customers table.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Staging ActiveCustomers CTE',
            sqlSnippet: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders)',
            explanation: 'Evaluates the named temporary CTE containing distinct buyer IDs.',
            tableData: {
              tableName: 'ActiveCustomers (Staged CTE)',
              columns: ['customer_id'],
              rows: [[1], [2], [3], [4]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Joining CTE with Customers Table',
            sqlSnippet: 'SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id',
            explanation: 'Joins customers table with the staged CTE result set.',
            tableData: {
              tableName: 'Final Joined Result',
              columns: ['customer_id', 'name'],
              highlightedColumns: ['customer_id', 'name'],
              rows: [
                [1, 'Rafiul Islam'],
                [2, 'Priya Akter'],
                [3, 'Tanvir Ahmed'],
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
        title: 'Task 1: Products priced higher than the overall average',
        description: 'Products priced higher than the catalog-wide average product price.',
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
        title: 'Task 3: Products priced above their own category average (Correlated Subquery)',
        description: 'Products priced higher than their own category average using a correlated subquery.',
        instructions: [
          'Select `p1.name`, `p1.price` from `products p1` where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 3: Correlated subquery per category\n',
        solutionSql: 'SELECT p1.name, p1.price FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
        solutionExplanation: 'Uses a correlated subquery to dynamically calculate the average for each product\'s category.',
        hints: [{ level: 1, text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`' }],
        validation: {
          targetTable: 'products',
          requireWhere: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 3 completed! Correlated category query verified.',
      },
      {
        id: 'day17-hw-4',
        title: 'Task 4: Customer Order CTE',
        description: 'Rewrite the active customer order query using a WITH cte AS (...) clause.',
        instructions: [
          'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Task 4: Customer order query rewritten as CTE\n',
        solutionSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
        solutionExplanation: 'Uses a Common Table Expression to define active customer IDs.',
        hints: [{ level: 1, text: 'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) ...`' }],
        validation: {
          targetTable: 'customers',
          expectedRowCount: 12,
        },
        successMessage: 'Task 4 completed! CTE query verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 18: Guided Practice: Advanced Subqueries & CTEs (Mode 2)
// =============================================================================
export const DAY_18_MODULE: ModuleData = {
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
          'You typically omit the primary key column (e.g. `product_id`) if the database is configured to generate sequential auto-increment IDs automatically.',
        ],
        targetQuery: {
          sql: "INSERT INTO products (\n  name, supplier_id, category_id, price, quantity_in_stock, reorder_level\n) VALUES (\n  'Ultra Wireless Mouse', 1, 1, 49.99, 100, 20\n);",
          explanation: 'Append a new wireless mouse record into the products inventory catalog.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Appending New Record (INSERT INTO)',
            sqlSnippet: "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);",
            explanation: 'Creates a new row in the products table with the specified attributes.',
            tableData: {
              tableName: 'Newly Inserted Product Row',
              columns: ['name', 'supplier_id', 'category_id', 'price', 'quantity_in_stock'],
              highlightedColumns: ['name', 'price', 'quantity_in_stock'],
              rows: [['Ultra Wireless Mouse', 1, 1, 49.99, 100]],
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
            question: 'Spiral check from Day 9: right after an INSERT, what is the fastest way to prove the row actually landed?',
            options: [
              'A. Trust the "1 row affected" message and move on',
              'B. Run a verification SELECT with COUNT or a direct filter on the new key',
              'C. Re-run the INSERT again and compare',
              'D. DELETE the row to see if it was there',
            ],
            correctIndex: 1,
            explanation: 'Retrieval is the verification tool (Day 9): a targeted SELECT/COUNT against the new row confirms state the way aggregates confirmed data health. Mutations and retrieval always travel together.',
          },
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
          databaseLifecycle: 'fresh',
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
          databaseLifecycle: 'fresh',
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
          'If you accidentally run `UPDATE products SET price = 19.99;` without a `WHERE` clause, **every product in the catalog will be set to $19.99**! Always write your `WHERE` clause first.',
        ],
        targetQuery: {
          sql: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
          explanation: 'Safely apply a 10% price increase specifically to product 1 using a targeted WHERE condition.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Targeted Update with WHERE',
            sqlSnippet: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
            explanation: 'Selectively increases product 1 price by 10% without altering other products.',
            tableData: {
              tableName: 'Updated Row',
              columns: ['product_id', 'name', 'price'],
              highlightedColumns: ['price'],
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
          databaseLifecycle: 'fresh',
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
            expectedRowCount: 7,
          },
          successMessage: 'Well done! Batch category update executed safely.',
          databaseLifecycle: 'fresh',
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
          'Executing `DELETE FROM orders;` without a `WHERE` clause deletes **every single row** in the table! Always specify the exact primary key or condition to delete.',
        ],
        targetQuery: {
          sql: 'DELETE FROM orders\nWHERE order_id = 18;',
          explanation: 'Safely delete temporary test order 18 from the orders table.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Targeted Row Deletion',
            sqlSnippet: 'DELETE FROM orders WHERE order_id = 18;',
            explanation: 'Removes order #18 cleanly from the database.',
            tableData: {
              tableName: 'Surviving Orders',
              columns: ['order_id', 'status'],
              highlightedColumns: ['order_id'],
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
          databaseLifecycle: 'fresh',
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
          initialSql: '-- Warning: DELETE FROM products; wipes the whole catalog.\n-- Now write the SAME delete but ONLY for quantity_in_stock = 0\n',
          solutionSql: 'DELETE FROM products WHERE quantity_in_stock = 0;',
          solutionExplanation: 'Adds a WHERE condition to only delete items with 0 stock (3 items).',
          hints: [{ level: 1, text: 'Add `WHERE quantity_in_stock = 0;`' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 3,
          },
          successMessage: 'Spot on! You guarded against an unbounded table wipe.',
          databaseLifecycle: 'fresh',
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
    databaseLifecycle: 'inherit',
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
  title: 'Day 27 — DDL I: Creating Tables',
  shortTitle: 'DDL I (Creating Tables)',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Foundations of Data Definition Language: blueprint a new table with CREATE TABLE, choose the right column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN), and give every row a durable identity with PRIMARY KEY (plus AUTO_INCREMENT as the usual implementation detail).',
  estimatedMinutes: 50,
  completionLearnings: [
    'Create structured tables with CREATE TABLE',
    'Choose appropriate column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)',
    'Enforce entity identity with PRIMARY KEY and AUTO_INCREMENT',
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
          'Table names should be lowercase, descriptive, and pluralized by convention (e.g. `products`, `orders`, `tags`).',
        ],
        targetQuery: {
          sql: 'CREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);',
          explanation: 'Allocate a new table structure for tagging catalog items with integer IDs and descriptive names.',
          badge: "The query we're going to break down",
        },
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
          databaseLifecycle: 'fresh',
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
          databaseLifecycle: 'fresh',
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
          'In MySQL, `BOOLEAN` is an alias for `TINYINT(1)`. `TRUE` evaluates to `1` and `FALSE` evaluates to `0`.',
        ],
        targetQuery: {
          sql: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
          explanation: 'Define appropriate data types (INT, exact DECIMAL, BOOLEAN, and DATETIME) for a metrics table.',
          badge: "The query we're going to break down",
        },
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
          databaseLifecycle: 'fresh',
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
          databaseLifecycle: 'fresh',
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
          'When you insert a row without specifying `category_id`, the database automatically generates the next sequential integer (1, 2, 3, 4...).',
        ],
        targetQuery: {
          sql: 'CREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
          explanation: 'Establish unique row identity and automatic sequential numbering with AUTO_INCREMENT PRIMARY KEY.',
          badge: "The query we're going to break down",
        },
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
          databaseLifecycle: 'fresh',
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
          databaseLifecycle: 'fresh',
        },
      ],
    },

  ],

  // ===========================================================================
  // DAY 20 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-20-homework',
    title: 'Day 27 — DDL I Challenge: Creating Tables (Ending Activity)',
    scenario: 'Design a new table schema, then analyze the seeded review data:',
    databaseLifecycle: 'inherit',
    tasks: [
      {
        id: 'day20-hw-1',
        title: 'Task 1: Create a product_reviews table',
        description: 'Create a product_reviews table: review_id (PK, auto-increment), product_id (FK → products), customer_id (FK → customers), rating (1–5), comment (TEXT), created_at (DEFAULT CURRENT_TIMESTAMP).',
        instructions: [
          'Write `CREATE TABLE product_reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'product_reviews',
        initialSql: '-- Task 1: Create the product_reviews table\n',
        solutionSql: 'CREATE TABLE product_reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
        solutionExplanation: 'Creates the new product_reviews entity table with complete constraints.',
        hints: [{ level: 1, text: 'Use `CREATE TABLE product_reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`' }],
        validation: {
          targetTable: 'product_reviews',
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! product_reviews table schema defined.',
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
// DAY 21: Visual Concept Lab: Performance, Indexing & Safety (Mode 1)
// =============================================================================
export const DAY_21_MODULE: ModuleData = {
  id: 'day-21',
  slug: 'indexing-transactions-real-world',
  day: 21,
  title: 'Day 21 — Visual Concept Lab: Performance, Indexing & Safety',
  shortTitle: 'Performance, Indexing & Safety',
  type: 'conceptual_session',
  milestoneId: 'milestone-3',
  description: 'Understand B-tree indexing mechanics, read EXPLAIN query plans, master ACID transaction guarantees, and understand how single relational queries prevent N+1 performance bottlenecks.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Understand how B-Tree indexes speed up lookups (index scan vs full table scan)',
    'Interpret EXPLAIN query plans (type: ALL vs type: ref/const)',
    'Explain the ACID transaction model for operational database integrity',
    'Recognize application pitfalls such as the N+1 query problem and solve them with relational queries',
  ],
  concepts: [
    {
      id: 'indexes-acid-and-explain',
      order: 1,
      title: '1. B-Trees, EXPLAIN & Operational Query Efficiency',
      shortDescription: 'Performance optimization and query safety.',
      theory: {
        summary: 'An index is a B-tree data structure that allows the database to find rows in logarithmic time rather than scanning every row sequentially. Using `EXPLAIN` reveals whether a query performs a fast index lookup (`type: const` / `ref`) or an expensive full table scan (`type: ALL`).',
        introTable: {
          tableName: 'products (Indexed on price)',
          description: 'B-Tree index structure visualization',
          columns: ['B-Tree Key (price)', 'Row Pointer', 'product_name'],
          rows: [
            ['$4.99', 'Row 28', 'Miscellaneous Clearance Item'],
            ['$15.99', 'Row 1', 'Wireless Mouse'],
            ['$65.00', 'Row 4', 'Mechanical Keyboard'],
            ['$120.00', 'Row 14', 'Office Chair'],
          ],
        },
        explanation: [
          '### 1. B-Tree Index Analogy',
          'Think of the index at the back of a textbook: instead of reading all 500 pages (Table Scan), you look up "PostgreSQL" on page 501 and jump directly to page 142.',
          '### 2. ACID Properties',
          '• **Atomicity**: All operations in a transaction succeed, or all are completely rolled back.',
          '• **Consistency**: Database transitions only between valid constraint states.',
          '• **Isolation**: Concurrent transactions do not corrupt or interfere with each other.',
          '• **Durability**: Committed transactions are permanently saved and survive system reboots.',
          '### 3. Application Efficiency (N+1 Problem vs Single Relational Query)',
          '• **Approach A (Loop of queries)**: 1 query to get 50 orders, plus 50 separate round-trip queries to get line items (51 network requests).',
          '• **Approach B (Single SQL JOIN)**: 1 well-designed relational query fetching all data in a single network round trip.',
          'Reducing unnecessary database round trips can significantly improve performance across production backend applications.',
        ],
        targetQuery: {
          sql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
          explanation: 'Inspect query execution plans to identify whether SQL utilizes fast B-tree index scans or slow full table scans.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Inspecting Query Plan with EXPLAIN',
            sqlSnippet: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
            explanation: 'Shows execution cost, estimated rows scanned, and index usage.',
            tableData: {
              tableName: 'EXPLAIN Execution Plan Output',
              columns: ['id', 'select_type', 'table', 'type', 'rows', 'Extra'],
              highlightedColumns: ['type', 'rows'],
              rows: [
                [1, 'SIMPLE', 'products', 'ALL', 28, 'Using where'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Query plan inspection and indexing',
            sql: '-- Inspect query execution plan\nEXPLAIN SELECT * FROM products WHERE price > 50;\n\n-- Create index on frequently filtered column\nCREATE INDEX idx_products_price ON products(price);',
            description: 'EXPLAIN output inspection and index creation.',
          },
        ],
        keyTakeaway: 'Indexes convert slow table scans into fast logarithmic lookups; EXPLAIN reveals how the database executes your SQL.',
        exampleQuery: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
        exampleQueryExplanation: 'Inspects execution plan for supplier_id lookup.',
        liveDemoSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
        liveDemoNotes: 'Displays query execution plan.',
        mcqs: [
          {
            question: 'In database EXPLAIN output, what does `type: ALL` indicate?',
            options: [
              'A. All indexes were utilized',
              'B. A full table scan occurred, sequentially checking every row in the table',
              'C. The query ran in 0 milliseconds',
              'D. All columns were indexed',
            ],
            correctIndex: 1,
            explanation: '`type: ALL` signifies a full table scan without index acceleration.',
          },
        ],
        masteryPoints: ['Read EXPLAIN plans', 'Explain ACID transaction properties', 'Identify N+1 query patterns and solve them with JOINs'],
      },
      tasks: [
        {
          id: 'day21-c1-t1',
          title: 'Task 1 (Guided): Inspect Query Execution with EXPLAIN',
          description: 'Run EXPLAIN on a filtered query on the `products` table.',
          instructions: [
            'Run `EXPLAIN SELECT * FROM products WHERE price > 50;`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Task 1: Inspect query execution plan\nEXPLAIN SELECT * FROM products WHERE price > 50;\n',
          solutionSql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
          solutionExplanation: 'Inspects the query execution plan for a price filter.',
          hints: [{ level: 1, text: 'Use `EXPLAIN SELECT * FROM products WHERE price > 50;`' }],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'Task 1 completed! EXPLAIN plan analyzed.',
        },
        {
          id: 'day21-c1-t2',
          title: 'Task 2 (Independent): Supplier Lookup Plan Inspection',
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
          successMessage: 'Task 2 completed! Execution plan generated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 21 CHALLENGE: PERFORMANCE & INDEXING LAB (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-21-homework',
    title: 'Day 21 — Performance & Indexing Lab (Ending Activity)',
    scenario: 'Demonstrate your understanding of indexing and query plans:',
    tasks: [
      {
        id: 'day21-hw-1',
        title: 'Task 1: Run EXPLAIN on a product supplier query',
        description: 'Run EXPLAIN on `SELECT * FROM products WHERE supplier_id = 2;`.',
        instructions: [
          'Run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Challenge: Run EXPLAIN on supplier query\n',
        solutionSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
        solutionExplanation: 'Inspects index usage for supplier_id lookup.',
        hints: [{ level: 1, text: 'Use `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 1,
        },
        successMessage: 'Challenge completed! Query execution plan verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 22: Applied Project: Full-Stack Backend Integration Queries (Mode 4)
// =============================================================================
export const DAY_22_MODULE: ModuleData = {
  id: 'day-22',
  slug: 'project-part-3-integration-queries',
  day: 22,
  title: 'Day 22 — Applied Project: Full-Stack Backend Integration Queries',
  shortTitle: 'Project: Backend API Queries',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'As a Backend API Engineer, write production-ready integration queries: product detail view payload, customer profile order history, and executive dashboard KPIs in single round trips.',
  estimatedMinutes: 120,
  completionLearnings: [
    'Build a single-payload Product Detail Page query joining products, categories, and suppliers',
    'Hydrate customer profile screens with distinct order counts and monetary spend',
    'Generate single-query executive KPI dashboard metrics to eliminate API round-trip latency',
  ],
  concepts: [
    {
      id: 'full-stack-query-patterns',
      order: 1,
      title: '1. Production Backend API Query Patterns',
      shortDescription: 'Product detail pages, customer profiles, and executive KPIs.',
      theory: {
        summary: 'In real full-stack web applications, backend route handlers issue rich SQL queries to hydrate entire UI screens in a single database round trip, avoiding chatty network calls.',
        introTable: {
          tableName: 'products & categories & suppliers',
          description: 'Data sources for single-payload Product Detail View',
          columns: ['p.name', 'p.price', 'c.name (Category)', 's.name (Supplier)'],
          rows: [
            ['Wireless Mouse', 15.99, 'Accessories', 'LogiTech Direct'],
            ['Mechanical Keyboard', 65.00, 'Electronics', 'KeyChron Components'],
          ],
        },
        explanation: [
          '### 1. The Single-Payload Product Detail View (`GET /api/products/:id`)',
          'Instead of 3 separate queries, join `products` $\\rightarrow$ `categories` $\\rightarrow$ `suppliers` in one query.',
          '### 2. The Customer Profile Endpoint (`GET /api/customers/:id`)',
          'Combines customer attributes with distinct order counts and lifetime spend totals.',
          '### 3. The Executive Dashboard KPI Endpoint (`GET /api/admin/dashboard`)',
          'Aggregates total distinct orders and grand total revenue in a single pass.',
        ],
        targetQuery: {
          sql: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
          explanation: 'Hydrate an entire production product detail view across 3 joined tables in 1 database round trip.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Hydrating Product Detail Payload',
            sqlSnippet: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
            explanation: 'Consolidates product attributes, category label, and supplier info in 1 query.',
            tableData: {
              tableName: 'Hydrated View Payload',
              columns: ['product_id', 'name', 'price', 'category_name', 'supplier_name'],
              highlightedColumns: ['name', 'category_name', 'supplier_name'],
              rows: [
                [1, 'Wireless Mouse', 15.99, 'Accessories', 'LogiTech Direct'],
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
            question: 'Why is it preferable to fetch all product page details in a single joined query rather than multiple separate queries?',
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
          title: 'Mission 1 (Guided): Product Detail View Endpoint Query',
          description: 'Retrieve product information with category name and supplier name for `product_id = 1`.',
          instructions: [
            'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories', 'suppliers'],
          initialSql: '-- Mission 1: Product detail page query\n',
          solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
          solutionExplanation: 'Hydrates the product detail view across 3 joined tables in one round trip.',
          hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Mission 1 complete! Product detail endpoint query verified.',
        },
        {
          id: 'day22-c1-t2',
          title: 'Mission 2 (Independent): Executive Dashboard KPI Summary Query',
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
          solutionExplanation: 'Calculates high-level executive KPI metrics in a single pass.',
          hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
          validation: {
            targetTable: 'orders',
            requireJoin: true,
            expectedRowCount: 1,
          },
          successMessage: 'Mission 2 complete! Executive dashboard KPI query verified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 22 CHALLENGE: DELIVER THE BACKEND API ENDPOINT QUERY SUITE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-22-homework',
    title: 'Day 22 — Deliver the Backend API Endpoint Query Suite (Ending Activity)',
    scenario: 'Construct the production backend integration queries independently:',
    tasks: [
      {
        id: 'day22-hw-1',
        title: 'Endpoint 1: "Get Product Detail Page" Query',
        description: 'Product info + category name + supplier name for product 1.',
        instructions: [
          'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories', 'suppliers'],
        initialSql: '-- Endpoint 1: Product Detail Page query\n',
        solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
        solutionExplanation: 'Multi-table join hydrating the full product page payload.',
        hints: [{ level: 1, text: 'Use `WHERE p.product_id = 1;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireWhere: true,
          expectedRowCount: 1,
        },
        successMessage: 'Endpoint 1 verified! Product detail query active.',
      },
      {
        id: 'day22-hw-2',
        title: 'Endpoint 2: "Executive Dashboard KPI Query" (Revenue & Orders)',
        description: 'Calculate grand total revenue and total distinct order count in a single query.',
        instructions: [
          'Select `COUNT(DISTINCT o.order_id) AS total_orders`, `SUM(oi.quantity * oi.unit_price) AS total_revenue` from `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Endpoint 2: Executive Dashboard KPI Query\n',
        solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
        solutionExplanation: 'Computes high-level KPI metrics in a single query.',
        hints: [{ level: 1, text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`' }],
        validation: {
          targetTable: 'orders',
          requireJoin: true,
          expectedRowCount: 1,
        },
        successMessage: 'Endpoint 2 verified! Executive KPI summary verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 23: Debugging Lab & Project Polish: Zero-State Hardening (Mode 3/4)
// =============================================================================
export const DAY_23_MODULE: ModuleData = {
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

// =============================================================================
// DAY 24: Milestone 3: Comprehensive Final Assessment (Mode 5)
// =============================================================================
export const DAY_24_MODULE: ModuleData = {
  id: 'day-24',
  slug: 'milestone-3-final-assessment',
  day: 24,
  title: 'Day 24 — Milestone 3: Comprehensive Final Assessment',
  shortTitle: 'Milestone 3 Final Assessment',
  type: 'assignment',
  milestoneId: 'milestone-3',
  description: 'Comprehensive capstone assessment covering advanced multi-table CTEs, correlated subqueries, schema DDL modifications, index creation, and DML data integrity.',
  estimatedMinutes: 120,
  completionLearnings: [
    'Write top-category revenue rankings with multi-table joins',
    'Calculate correlated customer spend benchmarks using Common Table Expressions',
    'Execute schema DDL alterations (ALTER TABLE with column defaults)',
    'Create targeted performance B-tree indexes for query optimization',
  ],
  concepts: [
    {
      id: 'capstone-evaluation',
      order: 1,
      title: '1. Milestone 3 Capstone Skill Verification',
      shortDescription: 'Final comprehensive SQL certification assessment across all 24 days.',
      theory: {
        summary: 'Milestone 3 Capstone: Prove full database engineering proficiency across multi-table JOINs, subqueries, Common Table Expressions, schema architecture, and query optimization.',
        introTable: {
          tableName: 'categories & products & order_items',
          description: 'Multi-table revenue aggregation pipeline',
          columns: ['cat.name', 'p.name', 'oi.quantity', 'oi.unit_price'],
          rows: [
            ['Electronics', 'Wireless Mouse', 2, 15.99],
            ['Electronics', 'Mechanical Keyboard', 1, 65.00],
            ['Office Furniture', 'Office Chair', 1, 120.00],
          ],
        },
        explanation: [
          '### 1. Final Assessment Deliverables',
          '• **Deliverable 1 (Complex Retrieval)**: Top 3 product categories by total sales revenue.',
          '• **Deliverable 2 (CTE Analysis)**: Customers with above-average total spending.',
          '• **Deliverable 3 (Schema DDL)**: Add a `status` column with a default value to `products`.',
          '• **Deliverable 4 (Index DDL)**: Create an index on `orders(customer_id)` for lookup acceleration.',
        ],
        targetQuery: {
          sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC\nLIMIT 3;',
          explanation: 'Aggregate total sales revenue per product category across 3 joined tables and limit to top 3 rankings.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Top 3 Categories by Revenue Ranking',
            sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC\nLIMIT 3;',
            explanation: 'Aggregates sales revenue per product category and limits to the top 3.',
            tableData: {
              tableName: 'Top 3 Revenue Categories',
              columns: ['name', 'category_revenue'],
              highlightedColumns: ['name', 'category_revenue'],
              rows: [
                ['Electronics', 448.47],
                ['Office Furniture', 209.99],
                ['Accessories', 161.42],
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
        masteryPoints: ['Complete all Milestone 3 Capstone deliverables'],
      },
      tasks: [
        {
          id: 'day24-c1-t1',
          title: 'Warmup 1: Top 3 Categories by Revenue',
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
          initialSql: '-- Warmup 1: Top 3 categories by revenue\n',
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
          successMessage: 'Warmup 1 completed! Top 3 revenue categories calculated.',
        },
        {
          id: 'day24-c1-t2',
          title: 'Warmup 2: Above-Average Customer Spenders (CTE)',
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
          successMessage: 'Warmup 2 completed! Above-average spenders filtered with CTE benchmark.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 24 CHALLENGE: MILESTONE 3 CAPSTONE ASSESSMENT (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-24-homework',
    title: 'Day 24 — Milestone 3 Capstone Assessment (Ending Activity)',
    scenario: 'Complete all 4 capstone deliverables independently to achieve SQL certification:',
    tasks: [
      {
        id: 'day24-hw-1',
        title: 'Deliverable 1 (Complex Retrieval): Top 3 categories by revenue',
        description: 'Top 3 categories by revenue (categories → products → order_items).',
        instructions: [
          'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC` LIMIT 3.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'categories',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Deliverable 1: Top 3 categories by revenue\n',
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
        successMessage: 'Deliverable 1 verified! Top 3 revenue categories calculated.',
      },
      {
        id: 'day24-hw-2',
        title: 'Deliverable 2 (CTE Analysis): Customers with above-average total spend',
        description: 'Find customers whose total spend is higher than the overall average customer spend.',
        instructions: [
          'Use `WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Deliverable 2: Customers with above-average total spend\n',
        solutionSql: 'WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;',
        solutionExplanation: 'Uses CTE with subquery benchmark to filter high-spending accounts.',
        hints: [{ level: 1, text: 'Use `WITH CustomerTotals AS (...) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals);`' }],
        validation: {
          targetTable: 'customers',
          expectedRowCount: 5,
        },
        successMessage: 'Deliverable 2 verified! High-value customer benchmark verified.',
      },
      {
        id: 'day24-hw-3',
        title: 'Deliverable 3 (Schema DDL): Add status column to products with default',
        description: 'Add a status column to products: `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
        instructions: [
          'Execute `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Deliverable 3: Alter table products add status column\n',
        solutionSql: 'ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';',
        solutionExplanation: 'Alters products table schema by appending the status column with default value.',
        hints: [{ level: 1, text: 'Use `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 1,
        },
        successMessage: 'Deliverable 3 verified! Schema altered with status column.',
      },
      {
        id: 'day24-hw-4',
        title: 'Deliverable 4 (Index Optimization): Create index on orders(customer_id)',
        description: 'Create an index named idx_orders_customer_id on orders(customer_id).',
        instructions: [
          'Execute `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Deliverable 4: Create index on orders(customer_id)\n',
        solutionSql: 'CREATE INDEX idx_orders_customer_id ON orders(customer_id);',
        solutionExplanation: 'Creates a B-tree index on orders foreign key customer_id.',
        hints: [{ level: 1, text: 'Use `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`' }],
        validation: {
          targetTable: 'orders',
          expectedRowCount: 1,
        },
        successMessage: 'Deliverable 4 verified! Index created on orders(customer_id).',
      },
    ],
  },
};

// =============================================================================
// DAY 25: Beyond the Course: Window Functions Preview & Graduation Bridge
// =============================================================================
export const DAY_25_MODULE: ModuleData = {
  id: 'day-25',
  slug: 'graduation-real-world-bridge',
  day: 25,
  title: 'Day 25 — Beyond the Course: Window Functions Preview & Graduation',
  shortTitle: 'Graduation & Window Functions',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Celebrate your 25-day SQL journey! Preview advanced Window Functions (ROW_NUMBER OVER PARTITION BY) and bridge your skills to Node.js/TypeScript backend production development.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Understand the difference between GROUP BY (collapses rows) and Window Functions (preserves all rows while appending analytical ranks)',
    'Write modern Window Functions using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)',
    'Bridge SQL skills to backend Node.js / TypeScript libraries (Drizzle, Prisma, pg, mysql2)',
    'Review the complete progression from Day 1 table basics to Day 25 full relational engineering',
  ],
  concepts: [
    {
      id: 'window-functions-and-future',
      order: 1,
      title: '1. Beyond the Course: Window Functions Preview',
      shortDescription: 'Calculate analytical ranks and running metrics without collapsing rows.',
      theory: {
        summary: 'Congratulations on reaching Day 25! Today is a celebration and a bridge to advanced SQL: preview Window Functions, which calculate rankings and running totals across rows while keeping every individual row visible in the result.',
        introTable: {
          tableName: 'products (Ranked in Category)',
          description: 'Window function category partition output',
          columns: ['name', 'category_id', 'price', 'rank_in_category'],
          rows: [
            ['Mechanical Keyboard', 1, 65.00, 1],
            ['Gaming Headset', 1, 55.00, 2],
            ['Office Chair', 3, 120.00, 1],
          ],
        },
        explanation: [
          '### 1. The Core Difference: GROUP BY vs Window Functions',
          '• **`GROUP BY`**: **Collapses** multiple rows into a single summary bucket row.',
          '• **`Window Function (OVER / PARTITION BY)`**: **Preserves** all original rows and appends an analytical rank or running calculation alongside each row.',
          '```sql\nSELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n```',
          '### 2. Bridging SQL to Full-Stack Production Development',
          'In modern TypeScript/Node.js stacks, your SQL mastery translates directly into production database workflows using tools like **Drizzle ORM**, **Prisma**, **Kysely**, and raw drivers like **pg** and **mysql2**.',
          '### 3. Graduation Celebration 🎓',
          'You have progressed through 25 comprehensive days: from single-table retrieval and filtering, to multi-table joins, relational aggregation, subqueries, CTEs, DML mutations, DDL schema architecture, and performance indexing!',
        ],
        targetQuery: {
          sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
          explanation: 'Compute analytical in-category price ranks dynamically without collapsing individual product rows.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Partitioning Products by Category and Ranking by Price',
            sqlSnippet: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
            explanation: 'Assigns ranks 1, 2, 3... within each category partition ordered by price descending.',
            tableData: {
              tableName: 'Partitioned Product Rankings',
              columns: ['name', 'category_id', 'price', 'category_rank'],
              highlightedColumns: ['category_id', 'category_rank'],
              rows: [
                ['Mechanical Keyboard', 1, 65.00, 1],
                ['Gaming Headset', 1, 55.00, 2],
                ['Wireless Mouse', 1, 15.99, 3],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Window function syntax',
            sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_in_category\nFROM products;',
            description: 'Ranks items inside each partition while preserving all rows.',
          },
        ],
        keyTakeaway: 'Window functions calculate partition rankings and running aggregates without collapsing individual rows.',
        exampleQuery: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
        exampleQueryExplanation: 'Ranks products within each category.',
        liveDemoSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products LIMIT 10;',
        liveDemoNotes: 'Displays window function category rankings.',
        mcqs: [
          {
            question: 'What is the main conceptual difference between GROUP BY and a Window Function with PARTITION BY?',
            options: [
              'A. GROUP BY collapses rows into a single summary row per group; Window Functions retain individual rows and append calculated metrics',
              'B. Window Functions only work on strings',
              'C. GROUP BY is deprecated',
              'D. Window Functions delete duplicate records',
            ],
            correctIndex: 0,
            explanation: 'Window functions compute partition metrics while preserving all individual rows.',
          },
        ],
        masteryPoints: ['Write Window Functions using PARTITION BY and ORDER BY', 'Graduate with full 25-day SQL relational mastery'],
      },
      tasks: [
        {
          id: 'day25-c1-t1',
          title: 'Exploration 1: Rank Products within Categories',
          description: 'Use ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) to rank products in each category.',
          instructions: [
            'Select `name`, `category_id`, `price`, `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Exploration 1: Rank products inside categories\nSELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n',
          solutionSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
          solutionExplanation: 'Ranks products by price within each category.',
          hints: [{ level: 1, text: 'Use `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'category_id', 'price', 'category_rank'],
            expectedRowCount: 28,
          },
          successMessage: 'Exploration 1 verified! Window function ranking calculated.',
        },
        {
          id: 'day25-c1-t2',
          title: 'Exploration 2: Top 2 Products per Category via CTE',
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
  // DAY 25: OPTIONAL EXPLORATION SANDBOX (GRADUATION)
  // ===========================================================================
  challenge: {
    id: 'day-25-homework',
    title: 'Day 25 — Optional Exploration Sandbox (Graduation)',
    scenario: 'Optional Exploration: Run the final Window Function query to complete your graduation portfolio:',
    tasks: [
      {
        id: 'day25-hw-1',
        title: 'Graduation Milestone: Top 2 Most Expensive Products in Each Category',
        description: 'Find the top 2 most expensive products in each category using ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC).',
        instructions: [
          'Use `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories'],
        initialSql: '-- Graduation Milestone: Top 2 products in each category using Window Function\n',
        solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
        solutionExplanation: 'Combines a Window Function inside a CTE to slice the top 2 products per category.',
        hints: [{ level: 1, text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 11,
        },
        successMessage: 'Congratulations on graduating the 25-Day SQL Master Curriculum! 🎓',
      },
    ],
  },
};

