import { ModuleData } from '../../types/curriculum';

export const Day_21_MODULE: ModuleData = {
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
