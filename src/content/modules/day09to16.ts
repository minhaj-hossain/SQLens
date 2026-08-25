import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 9: Aggregation & Grouping
// =============================================================================
export const DAY_09_MODULE: ModuleData = {
  id: 'day-09',
  slug: 'aggregation-grouping',
  day: 9,
  title: 'Day 9 — Aggregation & Grouping',
  shortTitle: 'Aggregation & Grouping',
  type: 'module',
  milestoneId: 'milestone-2',
  description: 'Learn aggregate functions (COUNT, SUM, AVG, MIN, MAX), group calculations using GROUP BY, filter aggregate results with HAVING, and understand how GROUP BY handles NULL values.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Calculate counts, totals, averages, minimums, and maximums across datasets',
    'Group rows by common categories using GROUP BY',
    'Filter grouped aggregate results using HAVING (and know when to use WHERE vs HAVING)',
    'Understand how GROUP BY handles NULL category values',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1a: Counting Rows with COUNT
    // =========================================================================
    {
      id: 'aggregate-count',
      order: 1,
      title: '1. Counting Rows with COUNT',
      shortDescription: 'Count total rows and non-NULL column values.',
      theory: {
        summary: '`COUNT(*)` counts every row in a table. `COUNT(column)` counts only rows where that specific column is NOT NULL.',
        introTable: {
          tableName: 'customers',
          description: 'Customers snapshot with optional emails',
          columns: ['customer_id', 'name', 'email', 'city'],
          rows: [
            [1, 'Rafiul Islam', 'rafiul@example.com', 'Dhaka'],
            [2, 'Priya Akter', 'priya.akter@example.com', 'Dhaka'],
            [3, 'Tanvir Ahmed', null, 'Chittagong'],
            [4, 'Nusrat Jahan', 'nusrat.j@example.com', 'Chittagong'],
            [7, 'Shakil Ahmed', null, 'Khulna'],
          ],
        },
        explanation: [
          '### 1. COUNT(*) vs COUNT(column)',
          '• `COUNT(*)` counts **every single row** in the table, regardless of what values columns hold.',
          '• `COUNT(column_name)` counts **only non-NULL values** in that specific column.',
          'QUESTION_BLOCK::NULL Handling in COUNT::If 2 out of 5 customers have a NULL email, `COUNT(*)` returns 5, while `COUNT(email)` returns 3.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Comparing COUNT(*) and COUNT(email)',
            sqlSnippet: 'SELECT COUNT(*) AS total_rows, COUNT(email) AS emails_present FROM customers;',
            explanation: 'Processes customer rows: counts 5 total rows and 3 valid email entries.',
            tableData: {
              tableName: 'Count Summary',
              columns: ['total_rows', 'emails_present'],
              rows: [[5, 3]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Counting rows syntax',
            sql: 'SELECT COUNT(*) AS total_records FROM products;\nSELECT COUNT(email) AS non_null_emails FROM customers;',
            description: 'COUNT(*) counts rows; COUNT(column) ignores NULLs.',
          },
        ],
        keyTakeaway: 'COUNT(*) counts all rows; COUNT(column) ignores NULL entries.',
        exampleQuery: 'SELECT COUNT(*) AS total_products FROM products;',
        exampleQueryExplanation: 'Counts total number of products in the inventory catalog.',
        liveDemoSql: 'SELECT COUNT(*) AS total_products, COUNT(category_id) AS categorized_products FROM products;',
        liveDemoNotes: 'Displays overall row count vs categorized products.',
        mcqs: [
          {
            question: 'What is the difference between COUNT(*) and COUNT(email)?',
            options: [
              'A. COUNT(*) is faster but less accurate',
              'B. COUNT(*) counts all rows; COUNT(email) counts only rows where email is NOT NULL',
              'C. COUNT(email) counts only distinct emails',
              'D. There is no difference',
            ],
            correctIndex: 1,
            explanation: '`COUNT(*)` counts every row regardless of content, whereas `COUNT(column)` ignores NULL values.',
          },
        ],
        masteryPoints: ['Use COUNT(*) for total row count', 'Use COUNT(column) to count non-NULL entries'],
      },
      tasks: [
        {
          id: 'day09-c1a-t1',
          title: 'Task 1: Total Product Count',
          description: 'Calculate the total number of products in the products table using COUNT(*).',
          instructions: [
            'Select `COUNT(*) AS total_products` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Total product count\n',
          solutionSql: 'SELECT COUNT(*) AS total_products FROM products;',
          solutionExplanation: '`COUNT(*)` computes the total number of catalog rows (28).',
          hints: [{ level: 1, text: 'Use `SELECT COUNT(*) AS total_products FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['total_products'],
            expectedRowCount: 1,
          },
          successMessage: 'Total products counted successfully!',
        },
        {
          id: 'day09-c1a-t2',
          title: 'Task 2: Count Customers with Valid Email',
          description: 'Use COUNT(email) to count how many customers have provided a valid (non-NULL) email address without using a WHERE clause.',
          instructions: [
            'Query the `customers` table.',
            'Select `COUNT(email) AS customers_with_email`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Count non-NULL emails with COUNT(email)\n',
          solutionSql: 'SELECT COUNT(email) AS customers_with_email FROM customers;',
          solutionExplanation: '`COUNT(email)` ignores NULL email values, returning 13 for 15 customer rows.',
          hints: [{ level: 1, text: 'Use `SELECT COUNT(email) AS customers_with_email FROM customers;`' }],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['customers_with_email'],
            expectedRowCount: 1,
          },
          successMessage: 'Perfect! You used COUNT(column) to count non-NULL entries.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1b: Finding the Smallest Value with MIN
    // =========================================================================
    {
      id: 'aggregate-min',
      order: 2,
      title: '2. Finding the Smallest Value with MIN',
      shortDescription: 'Find the lowest numerical, alphabetical, or chronological value.',
      theory: {
        summary: '`MIN(column)` scans all non-NULL values in a column and returns the single lowest scalar value.',
        introTable: {
          tableName: 'products',
          description: 'Products price scan',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [3, 'USB-C Charging Cable', 9.99],
            [12, 'Sticky Notes Pack', 4.99],
            [14, 'Office Chair', 120.00],
          ],
        },
        explanation: [
          '### 1. The MIN Function',
          '`MIN(price)` examines every price value in the table and outputs the lowest one ($4.99).',
          'QUESTION_BLOCK::NULL Handling::Like all summary aggregates, `MIN` ignores NULL values.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Evaluating MIN(price)',
            sqlSnippet: 'SELECT MIN(price) AS lowest_price FROM products;',
            explanation: 'Scans all prices and finds $4.99.',
            tableData: {
              tableName: 'MIN Result',
              columns: ['lowest_price'],
              rows: [[4.99]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'MIN syntax',
            sql: 'SELECT MIN(price) AS lowest_price FROM products;',
            description: 'Returns the minimum numeric value in the price column.',
          },
        ],
        keyTakeaway: 'MIN(column) finds the lowest value in a column across all non-NULL rows.',
        exampleQuery: 'SELECT MIN(price) AS lowest_price FROM products;',
        exampleQueryExplanation: 'Returns the cheapest product price in inventory.',
        liveDemoSql: 'SELECT MIN(price) AS lowest_price FROM products;',
        liveDemoNotes: 'Displays lowest catalog price ($4.99).',
        mcqs: [
          {
            question: 'What does `SELECT MIN(price) FROM products;` return if prices are $15, $4.99, and $120?',
            options: ['A. $15.00', 'B. $4.99', 'C. $120.00', 'D. $46.66'],
            correctIndex: 1,
            explanation: 'MIN selects the lowest value ($4.99).',
          },
        ],
        masteryPoints: ['Use MIN to identify lowest prices, earliest dates, or alphabetical minimums'],
      },
      tasks: [
        {
          id: 'day09-c1b-t1',
          title: 'Task 1: Minimum Product Price',
          description: 'Find the lowest product price in the products table using MIN(price).',
          instructions: [
            'Select `MIN(price) AS lowest_price` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Find lowest price\n',
          solutionSql: 'SELECT MIN(price) AS lowest_price FROM products;',
          solutionExplanation: '`MIN(price)` identifies the lowest catalog price ($4.99).',
          hints: [{ level: 1, text: 'Use `SELECT MIN(price) AS lowest_price FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['lowest_price'],
            expectedRowCount: 1,
          },
          successMessage: 'Lowest price found successfully!',
        },
        {
          id: 'day09-c1b-t2',
          title: 'Task 2: Youngest Student Age',
          description: 'Find the youngest student age in the students table using MIN(age).',
          instructions: [
            'Query the `students` table.',
            'Select `MIN(age) AS youngest_age`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Find youngest student age\n',
          solutionSql: 'SELECT MIN(age) AS youngest_age FROM students;',
          solutionExplanation: '`MIN(age)` identifies age 20 (Ayesha).',
          hints: [{ level: 1, text: 'Use `SELECT MIN(age) AS youngest_age FROM students;`' }],
          validation: {
            targetTable: 'students',
            requiredColumns: ['youngest_age'],
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Youngest student age identified.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1c: Finding the Largest Value with MAX
    // =========================================================================
    {
      id: 'aggregate-max',
      order: 3,
      title: '3. Finding the Largest Value with MAX',
      shortDescription: 'Find the highest numerical, alphabetical, or latest chronological value.',
      theory: {
        summary: '`MAX(column)` scans all non-NULL values in a column and returns the single highest scalar value.',
        introTable: {
          tableName: 'products',
          description: 'Products price scan',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [4, 'Mechanical Keyboard', 65.00],
            [14, 'Office Chair', 120.00],
            [15, 'Filing Cabinet', 89.99],
          ],
        },
        explanation: [
          '### 1. The MAX Function',
          '`MAX(price)` examines every price value in the table and outputs the highest one ($120.00).',
          'QUESTION_BLOCK::Latest Dates::`MAX(date_column)` finds the most recent timestamp or calendar date.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Evaluating MAX(price)',
            sqlSnippet: 'SELECT MAX(price) AS highest_price FROM products;',
            explanation: 'Scans all prices and finds $120.00.',
            tableData: {
              tableName: 'MAX Result',
              columns: ['highest_price'],
              rows: [[120.00]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'MAX syntax',
            sql: 'SELECT MAX(price) AS highest_price FROM products;',
            description: 'Returns the maximum numeric value in the price column.',
          },
        ],
        keyTakeaway: 'MAX(column) finds the highest value in a column across all non-NULL rows.',
        exampleQuery: 'SELECT MAX(price) AS highest_price FROM products;',
        exampleQueryExplanation: 'Returns the most expensive product price in inventory.',
        liveDemoSql: 'SELECT MAX(price) AS highest_price FROM products;',
        liveDemoNotes: 'Displays highest catalog price ($120.00).',
        mcqs: [
          {
            question: 'Which query finds the maximum inventory quantity across all products?',
            options: [
              'A. SELECT MAX(quantity_in_stock) AS max_stock FROM products;',
              'B. SELECT MIN(quantity_in_stock) AS max_stock FROM products;',
              'C. SELECT COUNT(quantity_in_stock) AS max_stock FROM products;',
              'D. SELECT SUM(quantity_in_stock) AS max_stock FROM products;',
            ],
            correctIndex: 0,
            explanation: 'MAX(column) computes the highest value in that column.',
          },
        ],
        masteryPoints: ['Use MAX to identify highest prices, latest dates, or top capacities'],
      },
      tasks: [
        {
          id: 'day09-c1c-t1',
          title: 'Task 1: Maximum Product Price',
          description: 'Find the highest product price in the products table using MAX(price).',
          instructions: [
            'Select `MAX(price) AS highest_price` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Find highest price\n',
          solutionSql: 'SELECT MAX(price) AS highest_price FROM products;',
          solutionExplanation: '`MAX(price)` identifies the top catalog price ($120.00).',
          hints: [{ level: 1, text: 'Use `SELECT MAX(price) AS highest_price FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['highest_price'],
            expectedRowCount: 1,
          },
          successMessage: 'Highest price found successfully!',
        },
        {
          id: 'day09-c1c-t2',
          title: 'Task 2: Oldest Student Age',
          description: 'Find the oldest student age in the students table using MAX(age).',
          instructions: [
            'Query the `students` table.',
            'Select `MAX(age) AS oldest_age`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Find oldest student age\n',
          solutionSql: 'SELECT MAX(age) AS oldest_age FROM students;',
          solutionExplanation: '`MAX(age)` identifies age 23 (Sumaiya).',
          hints: [{ level: 1, text: 'Use `SELECT MAX(age) AS oldest_age FROM students;`' }],
          validation: {
            targetTable: 'students',
            requiredColumns: ['oldest_age'],
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Oldest student age identified.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1d: Adding Values with SUM
    // =========================================================================
    {
      id: 'aggregate-sum',
      order: 4,
      title: '4. Adding Values with SUM',
      shortDescription: 'Calculate the mathematical sum of numeric values across rows.',
      theory: {
        summary: '`SUM(column)` adds together all non-NULL numeric values in a column, outputting a single total scalar value.',
        introTable: {
          tableName: 'products',
          description: 'Products price list',
          columns: ['product_id', 'name', 'price', 'quantity_in_stock'],
          rows: [
            [1, 'Wireless Mouse', 15.99, 40],
            [2, 'Bluetooth Speaker', 45.50, 3],
            [4, 'Mechanical Keyboard', 65.00, 12],
          ],
        },
        explanation: [
          '### 1. The SUM Function',
          '`SUM(quantity_in_stock)` adds up all inventory units across all products.',
          'QUESTION_BLOCK::Non-numeric Columns::SUM only works on numeric data types (INT, DECIMAL, FLOAT). Running SUM on text or date columns causes an error.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Adding quantities',
            sqlSnippet: 'SELECT SUM(quantity_in_stock) AS total_units FROM products;',
            explanation: 'Adds 40 + 3 + 12 = 55 total units.',
            tableData: {
              tableName: 'SUM Result',
              columns: ['total_units'],
              rows: [[55]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'SUM syntax',
            sql: 'SELECT SUM(quantity_in_stock) AS total_inventory FROM products;',
            description: 'Computes arithmetic sum of numeric values.',
          },
        ],
        keyTakeaway: 'SUM(column) calculates the total sum of all non-NULL numbers in a column.',
        exampleQuery: 'SELECT SUM(price) AS total_catalog_price FROM products;',
        exampleQueryExplanation: 'Sums all individual product prices.',
        liveDemoSql: 'SELECT SUM(quantity_in_stock) AS total_units FROM products;',
        liveDemoNotes: 'Displays total units in stock across all products.',
        mcqs: [
          {
            question: 'What happens if SUM(column) encounters rows with NULL values?',
            options: [
              'A. The entire sum becomes NULL',
              'B. The query fails with an error',
              'C. NULL values are ignored and the remaining non-NULL numbers are summed',
              'D. NULL is converted to 10',
            ],
            correctIndex: 2,
            explanation: 'SUM ignores NULL values and sums only the valid numeric numbers.',
          },
        ],
        masteryPoints: ['Use SUM for grand totals and financial sums'],
      },
      tasks: [
        {
          id: 'day09-c1d-t1',
          title: 'Task 1: Total Catalog Price Sum',
          description: 'Calculate the sum of all product prices using SUM(price).',
          instructions: [
            'Select `SUM(price) AS total_catalog_price` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Sum all prices\n',
          solutionSql: 'SELECT SUM(price) AS total_catalog_price FROM products;',
          solutionExplanation: '`SUM(price)` calculates the total value of all catalog item list prices.',
          hints: [{ level: 1, text: 'Use `SELECT SUM(price) AS total_catalog_price FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['total_catalog_price'],
            expectedRowCount: 1,
          },
          successMessage: 'Total catalog price summed!',
        },
        {
          id: 'day09-c1d-t2',
          title: 'Task 2: Total Units in Stock',
          description: 'Calculate the total number of stock units across all products in inventory.',
          instructions: [
            'Query the `products` table.',
            'Select `SUM(quantity_in_stock) AS total_units`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Total stock units\n',
          solutionSql: 'SELECT SUM(quantity_in_stock) AS total_units FROM products;',
          solutionExplanation: '`SUM(quantity_in_stock)` adds up all inventory counts.',
          hints: [{ level: 1, text: 'Use `SELECT SUM(quantity_in_stock) AS total_units FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['total_units'],
            expectedRowCount: 1,
          },
          successMessage: 'Well done! Total inventory units computed.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 1e: Calculating an Average with AVG
    // =========================================================================
    {
      id: 'aggregate-avg',
      order: 5,
      title: '5. Calculating an Average with AVG',
      shortDescription: 'Calculate the arithmetic mean across non-NULL numeric values.',
      theory: {
        summary: '`AVG(column)` divides the sum of all non-NULL values by the count of non-NULL values.',
        introTable: {
          tableName: 'students',
          description: 'Students age table',
          columns: ['id', 'name', 'age'],
          rows: [
            [1, 'Rahim', 21],
            [2, 'Karim', 22],
            [3, 'Ayesha', 20],
            [4, 'Sumaiya', 23],
            [5, 'Tanvir', 21],
          ],
        },
        explanation: [
          '### 1. How AVG Calculates',
          '`AVG(age)` computes $(21 + 22 + 20 + 23 + 21) / 5 = 21.40$.',
          'QUESTION_BLOCK::NULL Exclusion in Divisor::If a row has `NULL`, it is excluded from BOTH the sum (numerator) and the count (denominator).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Calculating AVG(age)',
            sqlSnippet: 'SELECT AVG(age) AS avg_age FROM students;',
            explanation: 'Sums ages (107) and divides by 5 students = 21.4.',
            tableData: {
              tableName: 'AVG Result',
              columns: ['avg_age'],
              rows: [[21.4]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'AVG syntax',
            sql: 'SELECT AVG(price) AS avg_price FROM products;',
            description: 'Computes arithmetic average of the price column.',
          },
        ],
        keyTakeaway: 'AVG(column) divides the sum of non-NULL values by the count of non-NULL values.',
        exampleQuery: 'SELECT AVG(price) AS avg_price FROM products;',
        exampleQueryExplanation: 'Calculates the average product price in the catalog.',
        liveDemoSql: 'SELECT AVG(price) AS avg_price FROM products;',
        liveDemoNotes: 'Displays average catalog price.',
        mcqs: [
          {
            question: 'Prices are $10, $20, NULL, and $30. What does `AVG(price)` return?',
            options: [
              'A. $15.00 (sum 60 / 4)',
              'B. $20.00 (sum 60 / 3, since NULL is excluded from count)',
              'C. NULL',
              'D. Error',
            ],
            correctIndex: 1,
            explanation: 'AVG excludes NULL from both numerator and denominator: $60 / 3 = $20.00.',
          },
        ],
        masteryPoints: ['Use AVG to compute arithmetic means accurately'],
      },
      tasks: [
        {
          id: 'day09-c1e-t1',
          title: 'Task 1: Average Product Price',
          description: 'Calculate the average price of all products in the catalog.',
          instructions: [
            'Select `AVG(price) AS avg_price` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Average price\n',
          solutionSql: 'SELECT AVG(price) AS avg_price FROM products;',
          solutionExplanation: '`AVG(price)` calculates the mean product price.',
          hints: [{ level: 1, text: 'Use `SELECT AVG(price) AS avg_price FROM products;`' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['avg_price'],
            expectedRowCount: 1,
          },
          successMessage: 'Average price calculated!',
        },
        {
          id: 'day09-c1e-t2',
          title: 'Task 2: Average Student Age',
          description: 'Calculate the average age of all students in the students table.',
          instructions: [
            'Query the `students` table.',
            'Select `AVG(age) AS avg_age`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Average student age\n',
          solutionSql: 'SELECT AVG(age) AS avg_age FROM students;',
          solutionExplanation: '`AVG(age)` computes the average student age (21.4).',
          hints: [{ level: 1, text: 'Use `SELECT AVG(age) AS avg_age FROM students;`' }],
          validation: {
            targetTable: 'students',
            requiredColumns: ['avg_age'],
            expectedRowCount: 1,
          },
          successMessage: 'Spot on! Average student age calculated.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Grouping with GROUP BY
    // =========================================================================
    {
      id: 'grouping-with-group-by',
      order: 6,
      title: '6. Grouping Rows with GROUP BY',
      shortDescription: 'Segment calculations by category, status, or location.',
      theory: {
        summary: 'When combined with `GROUP BY`, aggregate calculations are performed separately for each category or bucket.',
        introTable: {
          tableName: 'products',
          description: 'Products grouped by category_id',
          columns: ['product_id', 'name', 'category_id', 'price'],
          rows: [
            [1, 'Wireless Mouse', 1, 15.99],
            [2, 'Bluetooth Speaker', 1, 45.50],
            [6, 'Stainless Steel Pan Set', 2, 55.00],
            [7, 'Ceramic Mixing Bowls', 2, 22.30],
            [11, 'Desk Organizer', 3, 14.25],
          ],
        },
        explanation: [
          '### 1. How GROUP BY Works',
          'SQL sorts rows into buckets sharing the same `category_id`, then calculates aggregates per bucket.',
          'QUESTION_BLOCK::Handling NULLs in GROUP BY::If a column contains `NULL`, SQL places all NULL rows into their own separate group.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Grouping by category_id',
            sqlSnippet: 'SELECT category_id, COUNT(*) AS total_products\nFROM products\nGROUP BY category_id;',
            explanation: 'Creates a summary row for each category with its item count.',
            tableData: {
              tableName: 'Category Summary',
              columns: ['category_id', 'total_products'],
              rows: [
                [1, 6],
                [2, 5],
                [3, 5],
                [4, 5],
                [5, 6],
                [null, 1],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Grouping syntax',
            sql: 'SELECT category_id, COUNT(*) AS product_count\nFROM products\nGROUP BY category_id;',
            description: 'Calculates product count per category.',
          },
        ],
        keyTakeaway: 'GROUP BY divides rows into buckets so aggregates compute per group.',
        exampleQuery: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
        exampleQueryExplanation: 'Counts total products in each category.',
        liveDemoSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
        liveDemoNotes: 'Displays product counts per category.',
        mcqs: [
          {
            question: 'How does GROUP BY treat rows where the grouping column is NULL?',
            options: [
              'A. It discards them completely',
              'B. It groups them together into their own single NULL group row',
              'C. It throws a runtime syntax error',
              'D. It puts them in group 0',
            ],
            correctIndex: 1,
            explanation: 'SQL groups NULL values together into a single group row.',
          },
        ],
        masteryPoints: ['Use GROUP BY with aggregate functions', 'Understand NULL handling in GROUP BY'],
      },
      tasks: [
        {
          id: 'day09-c2-t1',
          title: 'Task 1: Total Products per Category',
          description: 'Count the total number of products in each category.',
          instructions: [
            'Select `category_id` and `COUNT(*) AS total_products` from `products`.',
            'Group by `category_id`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
          solutionExplanation: '`GROUP BY category_id` computes the count for each category.',
          hints: [{ level: 1, text: 'Use `SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;`' }],
          validation: {
            targetTable: 'products',
            requireGroupBy: true,
            expectedRowCount: 6,
          },
          successMessage: 'Products per category counted!',
        },
        {
          id: 'day09-c2-t2',
          title: 'Task 2: Customer Distribution by City',
          description: 'Count the number of customers residing in each city.',
          instructions: [
            'Query the `customers` table.',
            'Select `city` and `COUNT(*) AS customer_count`.',
            'Group by `city`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Customer count by city\n',
          solutionSql: 'SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city;',
          solutionExplanation: 'Groups customers by city and counts them.',
          hints: [{ level: 1, text: 'Use `SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city;`' }],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['city', 'customer_count'],
            requireGroupBy: true,
            expectedRowCount: 6,
          },
          successMessage: 'Perfect! Customer distribution computed.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3: Filtering Groups with HAVING
    // =========================================================================
    {
      id: 'having-filter',
      order: 7,
      title: '7. Filtering Groups with HAVING',
      shortDescription: 'Filter aggregate summaries after grouping.',
      theory: {
        summary: '`WHERE` filters individual rows BEFORE grouping. `HAVING` filters aggregate group values AFTER grouping.',
        introTable: {
          tableName: 'products',
          description: 'Aggregated category pricing',
          columns: ['category_id', 'total_products', 'avg_price'],
          rows: [
            [1, 6, 31.79],
            [2, 5, 28.56],
            [3, 5, 47.15],
            [4, 5, 29.10],
            [5, 6, 20.62],
          ],
        },
        explanation: [
          '### 1. WHERE vs HAVING Timing',
          '• **WHERE** filters individual raw records *before* `GROUP BY` aggregates them.',
          '• **HAVING** filters grouped summary rows *after* `GROUP BY` aggregates them.',
          'QUESTION_BLOCK::Invalid Query Error::Writing `WHERE COUNT(*) > 2` is a syntax error because WHERE executes before COUNT(*) exists. Always write `HAVING COUNT(*) > 2`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Filtering Categories with HAVING',
            sqlSnippet: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30;',
            explanation: 'Computes category averages and discards categories averaging under $30.',
            tableData: {
              tableName: 'Filtered Categories',
              columns: ['category_id', 'total_products', 'avg_price'],
              rows: [
                [1, 6, 31.79],
                [3, 5, 47.15],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'HAVING syntax',
            sql: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30\nORDER BY avg_price DESC;',
            description: 'Full aggregation pipeline: GROUP BY -> HAVING -> ORDER BY.',
          },
        ],
        keyTakeaway: 'Use WHERE for raw row filtering and HAVING for aggregate summary filtering.',
        exampleQuery: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
        exampleQueryExplanation: 'Calculates average price per category sorted highest first.',
        liveDemoSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
        liveDemoNotes: 'Displays average price per category.',
        mcqs: [
          {
            question: 'Why can you NOT write `WHERE COUNT(*) > 5` in SQL?',
            options: [
              'A. Because COUNT is only allowed in SELECT',
              'B. Because WHERE evaluates individual rows before groups or aggregate counts exist; you must use HAVING',
              'C. Because 5 is a magic number in SQL',
              'D. Because WHERE only accepts text',
            ],
            correctIndex: 1,
            explanation: 'WHERE filters rows before aggregation. To filter on aggregate values, you must use HAVING.',
          },
        ],
        masteryPoints: ['Filter aggregates with HAVING', 'Understand WHERE vs HAVING timing'],
      },
      tasks: [
        {
          id: 'day09-c3-t1',
          title: 'Task 1: Average Price per Category',
          description: 'Calculate the average price for each category, sorted highest first.',
          instructions: [
            'Select `category_id` and `AVG(price) AS avg_price` from `products`.',
            'Group by `category_id` and order by `avg_price DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
          solutionExplanation: 'Computes average price per category and sorts descending.',
          hints: [{ level: 1, text: 'Use `GROUP BY category_id ORDER BY avg_price DESC;`' }],
          validation: {
            targetTable: 'products',
            requireGroupBy: true,
            requireOrderBy: [{ column: 'avg_price', direction: 'DESC' }],
            expectedRowCount: 6,
          },
          successMessage: 'Average price per category computed!',
        },
        {
          id: 'day09-c3-t2',
          title: 'Task 2: High Density Cities (HAVING)',
          description: 'Find cities with 2 or more customers, sorted by customer count descending.',
          instructions: [
            'Query the `customers` table.',
            'Select `city` and `COUNT(*) AS customer_count`.',
            'Group by `city`.',
            'Filter with `HAVING COUNT(*) >= 2`.',
            'Order by `customer_count DESC`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Cities with at least 2 customers\n',
          solutionSql: 'SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city HAVING COUNT(*) >= 2 ORDER BY customer_count DESC;',
          solutionExplanation: 'Groups by city and uses HAVING to keep cities with >= 2 customers.',
          hints: [{ level: 1, text: 'Use `HAVING COUNT(*) >= 2 ORDER BY customer_count DESC;`' }],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['city', 'customer_count'],
            requireGroupBy: true,
            requireHaving: true,
            requireOrderBy: [{ column: 'customer_count', direction: 'DESC' }],
            expectedRowCount: 4,
          },
          successMessage: 'Great job! You filtered aggregate groups with HAVING.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 9 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-09-homework',
    title: 'Day 9 — Aggregation & Grouping (Homework)',
    scenario: 'Answer these business questions using aggregation, GROUP BY, and HAVING:',
    tasks: [
      {
        id: 'day09-hw-1',
        title: 'Task 1: Total products per category',
        description: 'Total products per category.',
        instructions: [
          'Select `category_id` and `COUNT(*) AS total_products` from `products` grouped by `category_id`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Total products per category\n',
        solutionSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
        solutionExplanation: 'Counts total products for each category_id.',
        hints: [{ level: 1, text: 'Use `SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;`' }],
        validation: {
          targetTable: 'products',
          requireGroupBy: true,
          expectedRowCount: 6,
        },
        successMessage: 'Task 1 completed! Product counts per category retrieved.',
      },
      {
        id: 'day09-hw-2',
        title: 'Task 2: Average price per category, sorted highest first',
        description: 'Average price per category, sorted highest first.',
        instructions: [
          'Select `category_id` and `AVG(price) AS avg_price` from `products` grouped by `category_id` ordered by `avg_price DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 2: Average price per category, sorted highest first\n',
        solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
        solutionExplanation: 'Groups by category, calculates average price, and sorts descending.',
        hints: [{ level: 1, text: 'Use `GROUP BY category_id ORDER BY avg_price DESC;`' }],
        validation: {
          targetTable: 'products',
          requireGroupBy: true,
          requireOrderBy: [{ column: 'avg_price', direction: 'DESC' }],
          expectedRowCount: 6,
        },
        successMessage: 'Task 2 completed! Category average prices sorted.',
      },
      {
        id: 'day09-hw-3',
        title: 'Task 3: Categories with average price above $25 (HAVING)',
        description: 'Categories with average price above $25 (HAVING).',
        instructions: [
          'Select `category_id` and `AVG(price) AS avg_price` from `products` grouped by `category_id` having `AVG(price) > 25`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 3: Categories with average price > 25 (HAVING)\n',
        solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 25;',
        solutionExplanation: 'Uses `HAVING AVG(price) > 25` to filter for premium categories.',
        hints: [{ level: 1, text: 'Use `GROUP BY category_id HAVING AVG(price) > 25;`' }],
        validation: {
          targetTable: 'products',
          requireGroupBy: true,
          requireHaving: true,
          expectedRowCount: 4,
        },
        successMessage: 'Task 3 completed! Premium categories identified.',
      },
    ],
  },
};

// =============================================================================
// DAY 10: Practice Day: Reporting
// =============================================================================
export const DAY_10_MODULE: ModuleData = {
  id: 'day-10',
  slug: 'practice-reporting',
  day: 10,
  title: 'Day 10 — Practice Day: Reporting',
  shortTitle: 'Practice: Reporting',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Build practical multi-clause reporting widgets combining GROUP BY, multiple aggregate functions, HAVING filters, and multi-column sorting.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Build multi-metric category and inventory summary reports unaided',
    'Combine COUNT, AVG, MIN, and MAX in a single reporting query',
    'Apply post-aggregation thresholds using HAVING',
  ],
  concepts: [
    {
      id: 'reporting-widgets',
      order: 1,
      title: '1. Multi-Metric Reporting Queries',
      shortDescription: 'Combine multiple aggregates into business dashboards.',
      theory: {
        summary: 'Reporting queries combine multiple aggregates (counts, averages, minimums, maximums) with group-level filtering and sorting to power executive dashboards.',
        introTable: {
          tableName: 'products',
          description: 'Inventory metrics snapshot',
          columns: ['category_id', 'COUNT(*)', 'AVG(price)', 'SUM(quantity_in_stock)'],
          rows: [
            [1, 6, 31.79, 88],
            [2, 5, 28.56, 102],
            [3, 5, 47.15, 187],
            [4, 5, 29.10, 102],
            [5, 6, 20.62, 137],
          ],
        },
        explanation: [
          '### 1. Dashboard Widget Pattern',
          'A single query can compute product count, average price, min price, and total inventory simultaneously:',
          '```sql\nSELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30\nORDER BY product_count DESC;\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Multi-Metric Category Audit',
            sqlSnippet: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30\nORDER BY avg_price DESC;',
            explanation: 'Aggregates multiple metrics per category and keeps categories with average price > $30.',
            tableData: {
              tableName: 'Category Audit Report',
              columns: ['category_id', 'product_count', 'avg_price', 'total_units'],
              rows: [
                [3, 5, 47.15, 187],
                [1, 6, 31.79, 88],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Multi-metric dashboard query',
            sql: 'SELECT category_id, COUNT(*) AS item_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_stock\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY item_count DESC;',
            description: 'Comprehensive category health metric.',
          },
        ],
        keyTakeaway: 'Combine multiple aggregate functions in a single SELECT to build rich summaries.',
        exampleQuery: 'SELECT category_id, COUNT(*) AS total_items, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY total_items DESC;',
        exampleQueryExplanation: 'Produces category overview for categories with average price above $15.',
        liveDemoSql: 'SELECT category_id, COUNT(*) AS total_items, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY total_items DESC;',
        liveDemoNotes: 'Displays category overview report.',
        mcqs: [
          {
            question: 'Can you use multiple aggregate functions like COUNT and AVG in the same SELECT statement?',
            options: ['A. No, only one aggregate function per query', 'B. Yes, you can calculate multiple metrics simultaneously', 'C. Only if using subqueries', 'D. Only in MySQL 8.0+'],
            correctIndex: 1,
            explanation: 'SQL allows multiple aggregate expressions in a single query.',
          },
        ],
        masteryPoints: ['Construct multi-metric reporting widgets unaided'],
      },
      tasks: [
        {
          id: 'day10-c1-t1',
          title: 'Task 1: Category Overview Widget',
          description: 'Calculate product count and average price per category, for categories averaging above $15, sorted by product count descending.',
          instructions: [
            'Select `category_id`, `COUNT(*) AS product_count`, `AVG(price) AS avg_price` from `products`.',
            'Group by `category_id`.',
            'Filter with `HAVING AVG(price) > 15`.',
            'Sort by `product_count DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;',
          solutionExplanation: 'Computes metrics, filters categories averaging > $15, and sorts by count descending.',
          hints: [{ level: 1, text: 'Use `GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;`' }],
          validation: {
            targetTable: 'products',
            requireGroupBy: true,
            requireHaving: true,
            requireOrderBy: [{ column: 'product_count', direction: 'DESC' }],
            expectedRowCount: 5,
          },
          successMessage: 'Category overview report generated!',
        },
        {
          id: 'day10-c1-t2',
          title: 'Task 2: Order Status Breakdown',
          description: 'Count the total number of orders for each status in the orders table, sorted by count descending.',
          instructions: [
            'Query the `orders` table.',
            'Select `status` and `COUNT(*) AS order_count`.',
            'Group by `status`.',
            'Order by `order_count DESC`.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql: '-- Order status metrics\n',
          solutionSql: 'SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;',
          solutionExplanation: 'Groups orders by status and calculates counts.',
          hints: [{ level: 1, text: 'Use `GROUP BY status ORDER BY order_count DESC;`' }],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['status', 'order_count'],
            requireGroupBy: true,
            requireOrderBy: [{ column: 'order_count', direction: 'DESC' }],
            expectedRowCount: 4,
          },
          successMessage: 'Perfect! Order status breakdown generated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 10 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-10-homework',
    title: 'Day 10 — Practice Day: Reporting (Homework)',
    scenario: 'Build the Category Overview dashboard widget independently:',
    tasks: [
      {
        id: 'day10-hw-1',
        title: 'Task 1: "Category Overview" dashboard widget',
        description: '"Category Overview" dashboard widget — product count and average price per category, only categories averaging above $15, sorted by product count descending.',
        instructions: [
          'Select `category_id`, `COUNT(*) AS product_count`, `AVG(price) AS avg_price` from `products` grouped by `category_id` having `AVG(price) > 15` order by `product_count DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Category Overview dashboard widget\n',
        solutionSql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;',
        solutionExplanation: 'Constructs the full multi-clause category overview report.',
        hints: [{ level: 1, text: 'Use `SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;`' }],
        validation: {
          targetTable: 'products',
          requireGroupBy: true,
          requireHaving: true,
          requireOrderBy: [{ column: 'product_count', direction: 'DESC' }],
          expectedRowCount: 5,
        },
        successMessage: 'Task 1 completed! Category Overview widget verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 11: JOINs
// =============================================================================
export const DAY_11_MODULE: ModuleData = {
  id: 'day-11',
  slug: 'joins-relational-data',
  day: 11,
  title: 'Day 11 — JOINs',
  shortTitle: 'JOINs (INNER & LEFT)',
  type: 'module',
  milestoneId: 'milestone-2',
  description: 'Understand relational keys (PK & FK), connect tables using INNER JOIN and LEFT JOIN, and master the Anti-JOIN pattern for finding unmatched rows.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Understand primary keys (PK) and foreign keys (FK) in one-to-many relationships',
    'Combine matching rows across tables using INNER JOIN',
    'Preserve unmatched left-table records using LEFT JOIN',
    'Master the Anti-JOIN pattern (LEFT JOIN ... WHERE right.pk IS NULL) to isolate unmatched rows',
    'Use clean table aliases (e.g. customers c, orders o)',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: PK/FK Primer & INNER JOIN
    // =========================================================================
    {
      id: 'relational-keys-inner-join',
      order: 1,
      title: '1. Relational Keys (PK/FK) & INNER JOIN',
      shortDescription: 'Connect records across tables wherever keys match.',
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
          'QUESTION_BLOCK::Table Aliases::Use short aliases for readability: `FROM products p INNER JOIN categories c ON p.category_id = c.category_id`',
          '### 2. The ON Condition',
          'The `ON` clause specifies how the tables link: `ON p.category_id = c.category_id`. If an ID does not exist in both tables, it is excluded from the result.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Lining up rows with INNER JOIN',
            sqlSnippet: 'SELECT p.name AS product_name, c.name AS category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;',
            explanation: 'Lining up each product with its parent category name.',
            tableData: {
              tableName: 'Joined Result',
              columns: ['product_name', 'category_name'],
              highlightedColumns: ['product_name', 'category_name'],
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
          'QUESTION_BLOCK::Left vs Right Table::The table before LEFT JOIN is the "left table". The table after LEFT JOIN is the "right table". All left rows are guaranteed to appear.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Preserving Unmatched Left Rows',
            sqlSnippet: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
            explanation: 'Returns all customers; customers with 0 orders have NULL in order_id.',
            tableData: {
              tableName: 'LEFT JOIN Output',
              columns: ['name', 'order_id'],
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
            targetTable: 'suppliers',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 6,
          },
          successMessage: 'Perfect! All suppliers preserved with product counts.',
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

// =============================================================================
// DAY 12: Practice Day: JOINs + Aggregates
// =============================================================================
export const DAY_12_MODULE: ModuleData = {
  id: 'day-12',
  slug: 'practice-joins-aggregates',
  day: 12,
  title: 'Day 12 — Practice Day: JOINs + Aggregates',
  shortTitle: 'Practice: JOINs + Aggregates & Fan-Out',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Master multi-table aggregations, COUNT(DISTINCT), and understand how cartesian row multiplication (fan-out) can corrupt aggregate calculations.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Calculate per-customer order counts and spend totals across multiple joins',
    'Understand why COUNT(o.order_id) overcounts when joining order_items and how COUNT(DISTINCT o.order_id) fixes it',
    'Demonstrate fan-out overcounting when combining multiple one-to-many relationships',
  ],
  concepts: [
    {
      id: 'fan-out-and-distinct-counts',
      order: 1,
      title: '1. Multi-Table Aggregation & Fan-Out Prevention',
      shortDescription: 'Why joining multiple one-to-many tables duplicates rows.',
      theory: {
        summary: 'When you join `customers → orders → order_items`, each order row is duplicated for every line item it contains. Running `COUNT(o.order_id)` counts rows in the joined result set, overcounting orders! Fix: `COUNT(DISTINCT o.order_id)` correctly counts distinct orders.',
        introTable: {
          tableName: 'orders & order_items',
          description: 'Joined rows showing row duplication across items',
          columns: ['o.order_id', 'o.customer_id', 'oi.product_id', 'oi.quantity', 'oi.unit_price'],
          rows: [
            [101, 1, 1, 2, 25.00],
            [101, 1, 3, 1, 12.50],
            [103, 3, 6, 1, 349.99],
            [103, 3, 10, 1, 65.00],
          ],
        },
        explanation: [
          '### 1. Row Duplication in Multi-Table Joins',
          'Before JOIN: Order 101 (1 row)',
          'After JOIN with order_items (2 items):',
          '• Order 101 | Item 1 ($50.00)\n• Order 101 | Item 3 ($12.50)',
          'QUESTION_BLOCK::The Fan-Out Rule::`COUNT(o.order_id)` yields 2! You must use `COUNT(DISTINCT o.order_id)` to count 1 order.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Multi-Table Spend Calculation',
            sqlSnippet: 'SELECT c.customer_id, c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name;',
            explanation: 'Computes distinct order count and total money spent per customer.',
            tableData: {
              tableName: 'Customer Spend Report',
              columns: ['customer_id', 'name', 'order_count', 'total_spent'],
              rows: [
                [1, 'Rahim Chowdhury', 2, 252.50],
                [2, 'Karim Ahmed', 1, 89.99],
                [3, 'Ayesha Siddika', 2, 464.99],
                [6, 'David Miller', 1, 284.00],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Accurate multi-table aggregation',
            sql: 'SELECT c.customer_id, c.name,\n       COUNT(DISTINCT o.order_id) AS order_count,\n       SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
            description: 'Accurate customer spending report.',
          },
        ],
        keyTakeaway: 'Use COUNT(DISTINCT) when joining down a one-to-many relationship to avoid overcounting parent entities.',
        exampleQuery: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
        exampleQueryExplanation: 'Accurately calculates order count and spend per customer.',
        liveDemoSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
        liveDemoNotes: 'Displays customer spend metrics.',
        mcqs: [
          {
            question: 'Why does COUNT(o.order_id) overcount when joining orders with order_items?',
            options: [
              'A. Because SQL adds an extra row for headers',
              'B. Because each order row is duplicated for every line item in order_items',
              'C. Because order_items has no primary key',
              'D. Because COUNT requires single quotes',
            ],
            correctIndex: 1,
            explanation: 'Joining a one-to-many relationship multiplies the parent rows by the number of children.',
          },
        ],
        masteryPoints: ['Use COUNT(DISTINCT) to prevent fan-out overcounting'],
      },
      tasks: [
        {
          id: 'day12-c1-t1',
          title: 'Task 1: Total Spend Per Customer',
          description: 'Calculate total money spent and distinct order count per customer.',
          instructions: [
            'Query `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, and `SUM(oi.quantity * oi.unit_price) AS total_spent`.',
            'Group by `c.customer_id`, `c.name`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
          solutionExplanation: 'Multi-table join calculating customer order totals.',
          hints: [{ level: 1, text: 'Use `COUNT(DISTINCT o.order_id)` and `SUM(oi.quantity * oi.unit_price)`.' }],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 12,
          },
          successMessage: 'Customer spend and order count accurately calculated!',
        },
        {
          id: 'day12-c1-t2',
          title: 'Task 2: Category Product Inventory Valuation',
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
          solutionExplanation: 'Aggregates stock units and average price per category.',
          hints: [{ level: 1, text: 'Use `FROM categories c JOIN products p ON c.category_id = p.category_id GROUP BY c.category_id, c.name;`' }],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireGroupBy: true,
            expectedRowCount: 5,
          },
          successMessage: 'Perfect! Category metrics aggregated across tables.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 12 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-12-homework',
    title: 'Day 12 — Practice Day: JOINs + Aggregates (Homework)',
    scenario: 'Solve these 4 multi-table reporting queries with fan-out prevention:',
    tasks: [
      {
        id: 'day12-hw-1',
        title: 'Task 1: Per-customer order counts and spend totals across multiple joins',
        description: 'Per-customer order counts and spend totals across multiple joins.',
        instructions: [
          'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 1: Per-customer order counts and spend totals\n',
        solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
        solutionExplanation: 'Multi-table join calculating customer spend.',
        hints: [{ level: 1, text: 'Use `COUNT(DISTINCT o.order_id)` and `SUM(oi.quantity * oi.unit_price)`.' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 1 completed! Multi-table customer spend computed.',
      },
    ],
  },
};

// =============================================================================
// DAY 13: Conceptual Session: Relational Thinking + Logical Order (Expanded)
// =============================================================================
export const DAY_13_MODULE: ModuleData = {
  id: 'day-13',
  slug: 'relational-thinking-logical-order-expanded',
  day: 13,
  title: 'Day 13 — Conceptual Session: Relational Thinking + Logical Query Processing Order (Expanded)',
  shortTitle: 'Relational Thinking & Full Execution Order',
  type: 'conceptual_session',
  milestoneId: 'milestone-2',
  description: 'Understand the full 7-step logical query processing order (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT) and connect SQL relational design to document models.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Master the expanded 7-step logical query processing order',
    'Trace multi-table queries through all 7 stages',
    'Compare SQL relational PK/FK relationships to document database embedding/refs',
  ],
  concepts: [
    {
      id: 'expanded-logical-order',
      order: 1,
      title: '1. The Full 7-Step Logical Query Processing Order',
      shortDescription: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
      theory: {
        summary: 'Now that JOINs, GROUP BY, and HAVING exist in our toolkit, we revisit logical query processing with the full 7-step model. This model defines which clause "sees" what data.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Sample data for 7-stage query tracing',
          columns: ['c.name', 'o.order_id', 'o.status'],
          rows: [
            ['Rahim Chowdhury', 101, 'delivered'],
            ['Rahim Chowdhury', 104, 'pending'],
            ['Elena Rostova', 106, 'cancelled'],
          ],
        },
        explanation: [
          '### 1. The Full 7-Step Logical Pipeline',
          '1. **FROM & JOIN**: Line up tables and produce intermediate dataset.',
          '2. **WHERE**: Filter individual rows before grouping.',
          '3. **GROUP BY**: Collapse rows into buckets.',
          '4. **HAVING**: Filter aggregated groups.',
          '5. **SELECT**: Compute projections, aggregates, and assign aliases.',
          '6. **ORDER BY**: Sort the resulting rows (can see SELECT aliases!).',
          '7. **LIMIT / OFFSET**: Slice the final sorted output.',
          'QUESTION_BLOCK::Relational vs Document Thinking::In document databases (like MongoDB), related items are often embedded inside a single document. In relational SQL, entities are normalized into separate tables and linked dynamically with foreign keys.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM & JOIN',
            sqlSnippet: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id',
            explanation: 'Loads and matches rows between customers and orders.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: WHERE',
            sqlSnippet: 'WHERE o.status != \'cancelled\'',
            explanation: 'Filters out cancelled orders.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: GROUP BY',
            sqlSnippet: 'GROUP BY c.customer_id, c.name',
            explanation: 'Groups active orders by customer.',
          },
          {
            stepNumber: 4,
            stepTitle: 'Step 4: HAVING',
            sqlSnippet: 'HAVING COUNT(o.order_id) >= 1',
            explanation: 'Filters for customers with at least 1 valid order.',
          },
          {
            stepNumber: 5,
            stepTitle: 'Step 5: SELECT',
            sqlSnippet: 'SELECT c.name, COUNT(o.order_id) AS total_orders',
            explanation: 'Projects name and assigns the total_orders alias.',
          },
          {
            stepNumber: 6,
            stepTitle: 'Step 6: ORDER BY',
            sqlSnippet: 'ORDER BY total_orders DESC',
            explanation: 'Sorts using the total_orders alias created in SELECT.',
          },
          {
            stepNumber: 7,
            stepTitle: 'Step 7: LIMIT',
            sqlSnippet: 'LIMIT 5',
            explanation: 'Takes the top 5 customers.',
          },
        ],
        syntaxBlocks: [
          {
            title: 'The 7-step logical query order',
            sql: '1. FROM (and JOINs)\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT\n6. ORDER BY\n7. LIMIT / OFFSET',
            description: 'The definitive logical execution order of SQL.',
          },
        ],
        keyTakeaway: 'Understanding the 7-step logical processing order prevents alias errors and logic bugs.',
        exampleQuery: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
        exampleQueryExplanation: 'Full 7-clause query pipeline in action.',
        liveDemoSql: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
        liveDemoNotes: 'Displays top customers by active order count.',
        mcqs: [
          {
            question: 'In the expanded 7-step order, when does HAVING execute relative to SELECT?',
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
          title: 'Task 1: Trace Multi-Table 7-Step Query',
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
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT c.name, COUNT(o.order_id) AS valid_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY valid_orders DESC LIMIT 5;',
          solutionExplanation: 'Demonstrates the complete 7-clause logical pipeline.',
          hints: [{ level: 1, text: 'Use `WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY valid_orders DESC LIMIT 5;`' }],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            requireHaving: true,
            requireLimit: 5,
            expectedRowCount: 5,
          },
          successMessage: 'Full 7-step logical query executed!',
        },
        {
          id: 'day13-c1-t2',
          title: 'Task 2: Category Product Sales Filter',
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
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT c.name AS category_name, COUNT(p.product_id) AS item_count FROM categories c JOIN products p ON c.category_id = p.category_id WHERE p.quantity_in_stock > 0 GROUP BY c.category_id, c.name HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;',
          solutionExplanation: 'Demonstrates WHERE (in-stock) -> GROUP BY (category) -> HAVING (item_count >= 2) -> ORDER BY (alias).',
          hints: [{ level: 1, text: 'Use `WHERE p.quantity_in_stock > 0 GROUP BY c.category_id, c.name HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;`' }],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            requireHaving: true,
            requiredColumns: ['category_name', 'item_count'],
            expectedRowCount: 5,
          },
          successMessage: 'Spot on! You constructed an end-to-end 7-clause analytical query.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 13 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-13-homework',
    title: 'Day 13 — Conceptual Session: Relational Thinking (Homework)',
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
        initialSql: '-- Write your SQL query here\n',
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
        successMessage: 'Task 1 completed! Full execution pipeline verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 14: Project Part 2: Multi-Table Reporting
// =============================================================================
export const DAY_14_MODULE: ModuleData = {
  id: 'day-14',
  slug: 'project-part-2-multi-table-reporting',
  day: 14,
  title: 'Day 14 — Project Part 2: Multi-Table Reporting',
  shortTitle: 'Project Part 2: Multi-Table Reports',
  type: 'project_part',
  milestoneId: 'milestone-2',
  description: 'Build production-ready multi-table reports: product unit sales rankings, top customer spenders, and identifying products that have never been ordered using LEFT JOIN + IS NULL.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Aggregate line-item sales across products and order_items',
    'Rank top customers by total monetary spend across 3 joined tables',
    'Identify unpurchased inventory using the LEFT JOIN + IS NULL anti-join pattern',
  ],
  concepts: [
    {
      id: 'multi-table-reporting-patterns',
      order: 1,
      title: '1. Multi-Table Business Analytics & Anti-Joins',
      shortDescription: 'Sales volume, revenue rankings, and unpurchased item discovery.',
      theory: {
        summary: 'Today is an application day. You build three key business reports: units sold by product, top spending customers, and finding products that have never been ordered using `LEFT JOIN ... WHERE right_table.key IS NULL`.',
        introTable: {
          tableName: 'products & order_items',
          description: 'Product catalog joined with order line items',
          columns: ['p.product_id', 'p.name', 'oi.quantity', 'oi.unit_price'],
          rows: [
            [1, 'Wireless Mouse', 2, 25.00],
            [2, 'Mechanical Keyboard', 1, 89.99],
            [3, 'USB-C Cable (2m)', 3, 12.50],
            [4, 'Ergonomic Desk Chair', null, null],
          ],
        },
        explanation: [
          '### 1. The Anti-Join Pattern (Never Ordered)',
          'To find items that have never been purchased, LEFT JOIN `order_items` onto `products` and filter with `WHERE oi.order_item_id IS NULL`.',
          'Any product that has no matching row in `order_items` will have NULL for `oi.order_item_id`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Product Sales Volume Ranking',
            sqlSnippet: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold\nFROM products p\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name\nORDER BY total_units_sold DESC;',
            explanation: 'Aggregates item quantities per product and sorts by sales volume descending.',
            tableData: {
              tableName: 'Product Sales Volume',
              columns: ['name', 'total_units_sold'],
              rows: [
                ['USB-C Cable (2m)', 5],
                ['Wireless Mouse', 4],
                ['Mechanical Keyboard', 2],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Anti-join pattern (never ordered)',
            sql: 'SELECT p.product_id, p.name\nFROM products p\nLEFT JOIN order_items oi ON p.product_id = oi.product_id\nWHERE oi.order_item_id IS NULL;',
            description: 'Finds products with 0 purchase history.',
          },
        ],
        keyTakeaway: 'Use LEFT JOIN + IS NULL to detect non-existent relationships (anti-joins).',
        exampleQuery: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
        exampleQueryExplanation: 'Ranks products by total units sold.',
        liveDemoSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC LIMIT 5;',
        liveDemoNotes: 'Displays top selling products.',
        mcqs: [
          {
            question: 'How does `LEFT JOIN order_items oi ... WHERE oi.order_item_id IS NULL` find unpurchased products?',
            options: [
              'A. By deleting purchased items',
              'B. Because unpurchased products have no match in order_items, so all order_items columns are filled with NULL',
              'C. By checking if price is 0',
              'D. By counting stock',
            ],
            correctIndex: 1,
            explanation: 'LEFT JOIN keeps unmatched left-table rows with NULLs for all right-table columns.',
          },
        ],
        masteryPoints: ['Write multi-table aggregate rankings', 'Master the LEFT JOIN + IS NULL anti-join pattern'],
      },
      tasks: [
        {
          id: 'day14-c1-t1',
          title: 'Task 1: Products with Total Units Sold',
          description: 'List products with their total units sold, sorted highest first.',
          instructions: [
            'Select `p.name`, `SUM(oi.quantity) AS total_units_sold` from `products p` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Group by `p.product_id`, `p.name`.',
            'Order by `total_units_sold DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
          solutionExplanation: 'Sums item quantities per product and sorts descending.',
          hints: [{ level: 1, text: 'Use `GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireGroupBy: true,
            requireOrderBy: [{ column: 'total_units_sold', direction: 'DESC' }],
            expectedRowCount: 22,
          },
          successMessage: 'Product unit sales ranked!',
        },
        {
          id: 'day14-c1-t2',
          title: 'Task 2: Unpurchased Products (Anti-Join)',
          description: 'Identify all products that have never appeared in any order using a LEFT JOIN and IS NULL filter.',
          instructions: [
            'Query `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Select `p.product_id` and `p.name`.',
            'Filter where `oi.order_item_id IS NULL`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: '-- Anti-join for unpurchased products\n',
          solutionSql: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;',
          solutionExplanation: 'Finds products with 0 recorded purchases.',
          hints: [{ level: 1, text: 'Use `WHERE oi.order_item_id IS NULL;`' }],
          validation: {
            targetTable: 'products',
            requireJoin: true,
            requireWhere: true,
            whereContainsTerms: ['IS NULL'],
            expectedRowCount: 6,
          },
          successMessage: 'Spot on! You mastered the anti-join pattern.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 14 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-14-homework',
    title: 'Day 14 — Project Part 2: Multi-Table Reporting (Homework)',
    scenario: 'Construct all 3 core multi-table reports independently:',
    tasks: [
      {
        id: 'day14-hw-1',
        title: 'Task 1: Products with total units sold, highest first',
        description: 'Products with total units sold, highest first.',
        instructions: [
          'Select `p.name`, `SUM(oi.quantity) AS total_units_sold` from `products p` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `p.product_id`, `p.name` ORDER BY `total_units_sold DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['order_items'],
        initialSql: '-- Task 1: Products with total units sold, highest first\n',
        solutionSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
        solutionExplanation: 'Calculates total units sold for each product.',
        hints: [{ level: 1, text: 'Use `GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireGroupBy: true,
          requireOrderBy: [{ column: 'total_units_sold', direction: 'DESC' }],
          expectedRowCount: 22,
        },
        successMessage: 'Task 1 completed! Unit sales report verified.',
      },
      {
        id: 'day14-hw-2',
        title: 'Task 2: Top 5 customers by total spend',
        description: 'Top 5 customers by total spend.',
        instructions: [
          'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` ORDER BY `total_spent DESC` LIMIT 5.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 2: Top 5 customers by total spend\n',
        solutionSql: 'SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name ORDER BY total_spent DESC LIMIT 5;',
        solutionExplanation: 'Joins customers -> orders -> order_items, sums spending, and returns top 5.',
        hints: [{ level: 1, text: 'Use `GROUP BY c.customer_id, c.name ORDER BY total_spent DESC LIMIT 5;`' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          requireOrderBy: [{ column: 'total_spent', direction: 'DESC' }],
          requireLimit: 5,
          expectedRowCount: 5,
        },
        successMessage: 'Task 2 completed! Top spending customers identified.',
      },
      {
        id: 'day14-hw-3',
        title: 'Task 3: Products that have never been ordered (LEFT JOIN + IS NULL)',
        description: 'Products that have never been ordered (LEFT JOIN + IS NULL anti-join).',
        instructions: [
          'Select `p.product_id`, `p.name` from `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` WHERE `oi.order_item_id IS NULL`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['order_items'],
        initialSql: '-- Task 3: Products that have never been ordered (LEFT JOIN + IS NULL)\n',
        solutionSql: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;',
        solutionExplanation: 'Anti-join with `WHERE oi.order_item_id IS NULL` finds products that have never appeared in any order.',
        hints: [{ level: 1, text: 'Use `WHERE oi.order_item_id IS NULL;`' }],
        validation: {
          targetTable: 'products',
          requireJoin: true,
          requireWhere: true,
          whereContainsTerms: ['IS NULL'],
          expectedRowCount: 6,
        },
        successMessage: 'Task 3 completed! Unordered products identified.',
      },
    ],
  },
};

// =============================================================================
// DAY 15: Independent Work / Debug Day
// =============================================================================
export const DAY_15_MODULE: ModuleData = {
  id: 'day-15',
  slug: 'independent-work-debug',
  day: 15,
  title: 'Day 15 — Independent Work / Debug Day',
  shortTitle: 'Debug & Independent Polish',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Polish multi-table reporting queries, debug joins, add extra date range filters, and ensure total query comprehension before the Milestone 2 assessment.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Debug and optimize complex multi-table queries',
    'Add date-range constraints to joined reporting queries',
    'Verify data accuracy and check for potential fan-out issues',
  ],
  concepts: [
    {
      id: 'query-debugging-polish',
      order: 1,
      title: '1. Query Debugging & Date Range Extensions',
      shortDescription: 'Refine multi-table queries and add temporal filters.',
      theory: {
        summary: 'Debug day: review and polish your multi-table queries. Add temporal filters (e.g. orders placed in the last 60 days) to verify that your JOIN logic remains robust.',
        introTable: {
          tableName: 'customers & orders',
          description: 'Multi-table customer orders with timestamps',
          columns: ['c.name', 'o.order_id', 'o.order_date', 'o.status'],
          rows: [
            ['Rahim Chowdhury', 101, '2026-08-01', 'delivered'],
            ['Rahim Chowdhury', 104, '2026-08-15', 'pending'],
            ['Ayesha Siddika', 103, '2026-08-10', 'delivered'],
          ],
        },
        explanation: [
          '### 1. Extending Multi-Table Reports with Date Filters',
          'Combine JOINs, WHERE date filters, and GROUP BY:',
          '```sql\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= CURDATE() - INTERVAL 60 DAY\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Multi-Table Spend with Date Boundaries',
            sqlSnippet: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= CURDATE() - INTERVAL 60 DAY\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;',
            explanation: 'Filters recent orders, aggregates total spend per customer, and sorts descending.',
            tableData: {
              tableName: 'Recent Spend Breakdown',
              columns: ['name', 'recent_spend'],
              rows: [
                ['Ayesha Siddika', 464.99],
                ['David Miller', 284.00],
                ['Rahim Chowdhury', 252.50],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Filtered multi-table report',
            sql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= CURDATE() - INTERVAL 60 DAY\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
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
        masteryPoints: ['Debug multi-table queries and add temporal constraints'],
      },
      tasks: [
        {
          id: 'day15-c1-t1',
          title: 'Task 1: Recent Customer Spending (Last 60 Days)',
          description: 'Calculate customer spend for orders placed in the last 60 days.',
          instructions: [
            'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
            'Where `o.order_date >= CURDATE() - INTERVAL 60 DAY` (or `o.order_date >= \'2026-06-25\'`).',
            'Group by `c.customer_id`, `c.name`.',
            'Order by `recent_spend DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          secondaryTables: ['orders', 'order_items'],
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= CURDATE() - INTERVAL 60 DAY GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
          solutionExplanation: 'Filters by date range, joins line items, and sums total spend per customer.',
          hints: [{ level: 1, text: 'Use `WHERE o.order_date >= CURDATE() - INTERVAL 60 DAY GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;`' }],
          validation: {
            targetTable: 'customers',
            requireJoin: true,
            requireWhere: true,
            requireGroupBy: true,
            expectedRowCount: 12,
          },
          successMessage: 'Recent spend query verified!',
        },
        {
          id: 'day15-c1-t2',
          title: 'Task 2: Inactive Customer Audit',
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
            targetTable: 'customers',
            requireJoin: true,
            requireGroupBy: true,
            requireHaving: true,
            expectedRowCount: 3,
          },
          successMessage: 'Perfect! Zero-order accounts identified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 15 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-15-homework',
    title: 'Day 15 — Independent Work / Debug Day (Homework)',
    scenario: 'Polish and refine your multi-table reporting queries:',
    tasks: [
      {
        id: 'day15-hw-1',
        title: 'Task 1: Polish Project Part 2 multi-table reports',
        description: 'Verify and run the multi-table customer spend report with date range constraints.',
        instructions: [
          'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` WHERE `o.order_date >= CURDATE() - INTERVAL 60 DAY` GROUP BY `c.customer_id`, `c.name` ORDER BY `recent_spend DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 1: Polish multi-table customer spend report\n',
        solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= CURDATE() - INTERVAL 60 DAY GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
        solutionExplanation: 'Multi-table customer spend report with 60-day date interval filter.',
        hints: [{ level: 1, text: 'Use `WHERE o.order_date >= CURDATE() - INTERVAL 60 DAY GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;`' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireWhere: true,
          requireGroupBy: true,
          expectedRowCount: 12,
        },
        successMessage: 'Task 1 completed! Polished multi-table report verified.',
      },
    ],
  },
};

// =============================================================================
// DAY 16: Milestone Assignment 2 (Checkpoint)
// =============================================================================
export const DAY_16_MODULE: ModuleData = {
  id: 'day-16',
  slug: 'milestone-2-assessment',
  day: 16,
  title: 'Day 16 — Milestone Assignment 2 (Checkpoint)',
  shortTitle: 'Milestone 2 Assessment',
  type: 'assignment',
  milestoneId: 'milestone-2',
  description: 'Independent assessment for Milestone 2: prove proficiency in working with multiple related tables, answering real business questions using JOINs and aggregations, and checking results for red flags.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Calculate total database revenue across order line items',
    'Aggregate multi-table revenue breakdowns by product category',
    'Filter high-value customers with spend thresholds',
    'Discover suppliers whose products have never been ordered using anti-joins',
  ],
  concepts: [
    {
      id: 'milestone-2-eval',
      order: 1,
      title: '1. Milestone 2 Core Competency Assessment',
      shortDescription: 'Independent multi-table evaluation.',
      theory: {
        summary: 'Milestone 2 Checkpoint: "Can work with multiple related tables and answer real business questions using JOINs and aggregations, and checks results for red flags."',
        introTable: {
          tableName: 'order_items',
          description: 'Line item financial transactions',
          columns: ['order_item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
          rows: [
            [1, 101, 1, 2, 25.00],
            [2, 101, 3, 1, 12.50],
            [3, 102, 2, 1, 89.99],
            [4, 103, 6, 1, 349.99],
          ],
        },
        explanation: [
          '### 1. Assessment Deliverables',
          '1. Total revenue (SUM across order_items).',
          '2. Revenue by category (products → categories → order_items).',
          '3. Customers who\'ve spent more than $200.',
          '4. Suppliers whose products have never been ordered (the seed data has exactly one: Unity Traders BD).',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Category Revenue Aggregation',
            sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC;',
            explanation: 'Multi-table join calculating revenue per category.',
            tableData: {
              tableName: 'Category Revenue Summary',
              columns: ['name', 'category_revenue'],
              rows: [
                ['Electronics', 734.97],
                ['Office Furniture', 420.00],
                ['Accessories', 157.48],
                ['Audio & Video', 89.50],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Multi-table join and aggregate competency',
            sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC;',
            description: 'Multi-table category revenue reporting.',
          },
        ],
        keyTakeaway: 'Demonstrate multi-table JOIN and aggregation mastery.',
        exampleQuery: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
        exampleQueryExplanation: 'Calculates grand total revenue.',
        liveDemoSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
        liveDemoNotes: 'Displays grand total revenue across all orders.',
        mcqs: [
          {
            question: 'Which supplier in the seed dataset has products that have never been ordered?',
            options: ['A. Dhaka Tech Supplies', 'B. Unity Traders BD', 'C. Apex Logistics', 'D. Bengal Components'],
            correctIndex: 1,
            explanation: 'Unity Traders BD has products in the catalog, but none have ever been referenced in order_items.',
          },
        ],
        masteryPoints: ['Pass all 4 Milestone 2 independent assessment tasks'],
      },
      tasks: [
        {
          id: 'day16-c1-t1',
          title: 'Task 1: Total Revenue Calculation',
          description: 'Calculate the total grand revenue across all order items.',
          instructions: [
            'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'order_items',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
          solutionExplanation: 'Calculates the sum product of quantity and unit_price for all order items.',
          hints: [{ level: 1, text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`' }],
          validation: {
            targetTable: 'order_items',
            expectedRowCount: 1,
          },
          successMessage: 'Total revenue calculated!',
        },
        {
          id: 'day16-c1-t2',
          title: 'Task 2: Category Revenue Breakdown',
          description: 'Join categories, products, and order_items to compute total revenue generated per category, sorted highest first.',
          instructions: [
            'Query `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue`.',
            'Group by `cat.category_id`, `cat.name`.',
            'Order by `category_revenue DESC`.',
          ],
          type: 'independent',
          primaryTable: 'categories',
          secondaryTables: ['products', 'order_items'],
          initialSql: '-- Revenue by category\n',
          solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;',
          solutionExplanation: 'Joins 3 tables and computes revenue per category.',
          hints: [{ level: 1, text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;`' }],
          validation: {
            targetTable: 'categories',
            requireJoin: true,
            requireGroupBy: true,
            requireOrderBy: [{ column: 'category_revenue', direction: 'DESC' }],
            expectedRowCount: 5,
          },
          successMessage: 'Spot on! Category revenue breakdown calculated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 16 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-16-homework',
    title: 'Day 16 — Milestone Assignment 2 (Assessment)',
    scenario: 'Complete all 4 deliverables independently to clear Milestone 2:',
    tasks: [
      {
        id: 'day16-hw-1',
        title: 'Task 1: Total revenue (SUM across order_items)',
        description: 'Total revenue (SUM across order_items).',
        instructions: [
          'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'order_items',
        initialSql: '-- Task 1: Total revenue\n',
        solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
        solutionExplanation: 'Calculates grand total revenue across all order line items.',
        hints: [{ level: 1, text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`' }],
        validation: {
          targetTable: 'order_items',
          expectedRowCount: 1,
        },
        successMessage: 'Task 1 completed! Grand total revenue verified.',
      },
      {
        id: 'day16-hw-2',
        title: 'Task 2: Revenue by category (products -> categories -> order_items)',
        description: 'Revenue by category (products → categories → order_items).',
        instructions: [
          'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'categories',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Task 2: Revenue by category\n',
        solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;',
        solutionExplanation: 'Joins categories -> products -> order_items and sums revenue per category.',
        hints: [{ level: 1, text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;`' }],
        validation: {
          targetTable: 'categories',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 5,
        },
        successMessage: 'Task 2 completed! Revenue by category calculated.',
      },
      {
        id: 'day16-hw-3',
        title: 'Task 3: Customers who\'ve spent more than $200',
        description: 'Customers who\'ve spent more than $200.',
        instructions: [
          'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` HAVING `SUM(oi.quantity * oi.unit_price) > 200` ORDER BY `total_spent DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Task 3: Customers who\'ve spent more than $200\n',
        solutionSql: 'SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name HAVING SUM(oi.quantity * oi.unit_price) > 200 ORDER BY total_spent DESC;',
        solutionExplanation: 'Filters aggregated customer spending with `HAVING SUM(...) > 200`.',
        hints: [{ level: 1, text: 'Use `HAVING SUM(oi.quantity * oi.unit_price) > 200 ORDER BY total_spent DESC;`' }],
        validation: {
          targetTable: 'customers',
          requireJoin: true,
          requireGroupBy: true,
          requireHaving: true,
          expectedRowCount: 1,
        },
        successMessage: 'Task 3 completed! High value customers identified.',
      },
      {
        id: 'day16-hw-4',
        title: 'Task 4: Suppliers whose products have never been ordered',
        description: 'Suppliers whose products have never been ordered (find Unity Traders BD via anti-join).',
        instructions: [
          'Select `s.supplier_id`, `s.name` from `suppliers s` LEFT JOIN `products p` ON `s.supplier_id = p.supplier_id` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `s.supplier_id`, `s.name` HAVING `COUNT(oi.order_item_id) = 0`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'suppliers',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Task 4: Suppliers whose products have never been ordered\n',
        solutionSql: 'SELECT s.supplier_id, s.name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;',
        solutionExplanation: 'Anti-join identifying suppliers with zero order item records (Unity Traders BD).',
        hints: [{ level: 1, text: 'Use `GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;`' }],
        validation: {
          targetTable: 'suppliers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 1,
        },
        successMessage: 'Task 4 completed! Unordered supplier Unity Traders BD found.',
      },
    ],
  },
};
