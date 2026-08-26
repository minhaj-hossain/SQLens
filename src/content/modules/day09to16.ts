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
          'If 2 out of 5 customers have a NULL email, `COUNT(*)` returns 5, while `COUNT(email)` returns 3.',
        ],
        targetQuery: {
          sql: 'SELECT COUNT(*) AS total_rows, COUNT(email) AS emails_present\nFROM customers;',
          explanation: 'Count total customer rows versus how many have a non-NULL email address.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM customers (Evaluate table rows)',
            sqlSnippet: 'FROM customers',
            explanation: 'SQL visits customers table containing 5 records (3 with valid emails, 2 with NULL).',
            tableData: {
              tableName: 'customers (Candidate Rows)',
              columns: ['name', 'email'],
              rows: [
                ['Rafiul Islam', 'rafiul@example.com'],
                ['Priya Akter', 'priya.akter@example.com'],
                ['Tanvir Ahmed', null],
                ['Nusrat Jahan', 'nusrat.j@example.com'],
                ['Shakil Ahmed', null],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Aggregate COUNT(*) vs COUNT(email)',
            sqlSnippet: 'SELECT COUNT(*) AS total_rows, COUNT(email) AS emails_present',
            explanation: 'Processes customer rows: counts 5 total rows and 3 valid email entries.',
            tableData: {
              tableName: 'Count Summary Result',
              columns: ['total_rows', 'emails_present'],
              highlightedColumns: ['total_rows', 'emails_present'],
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
          'Like all summary aggregates, `MIN` ignores NULL values.',
        ],
        targetQuery: {
          sql: 'SELECT MIN(price) AS lowest_price\nFROM products;',
          explanation: 'Find the lowest product price in the catalog.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products (Scan price values)',
            sqlSnippet: 'FROM products',
            explanation: 'SQL visits all product records.',
            tableData: {
              tableName: 'products (Candidate Prices)',
              columns: ['name', 'price'],
              rows: [
                ['Wireless Mouse', 15.99],
                ['USB-C Charging Cable', 9.99],
                ['Sticky Notes Pack', 4.99],
                ['Office Chair', 120.00],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT MIN(price) (Identify minimum)',
            sqlSnippet: 'SELECT MIN(price) AS lowest_price',
            explanation: 'Scans all prices and finds $4.99.',
            tableData: {
              tableName: 'MIN Scalar Result',
              columns: ['lowest_price'],
              highlightedColumns: ['lowest_price'],
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
          'MAX works on numbers, strings (alphabetical latest), and timestamps (most recent dates).',
        ],
        targetQuery: {
          sql: 'SELECT MAX(price) AS highest_price\nFROM products;',
          explanation: 'Find the most expensive product price in the catalog.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products (Scan price list)',
            sqlSnippet: 'FROM products',
            explanation: 'SQL visits product prices in inventory.',
            tableData: {
              tableName: 'products (Candidate Prices)',
              columns: ['name', 'price'],
              rows: [
                ['Wireless Mouse', 15.99],
                ['Mechanical Keyboard', 65.00],
                ['Office Chair', 120.00],
                ['Filing Cabinet', 89.99],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT MAX(price) (Identify maximum)',
            sqlSnippet: 'SELECT MAX(price) AS highest_price',
            explanation: 'Scans all prices and finds $120.00.',
            tableData: {
              tableName: 'MAX Scalar Result',
              columns: ['highest_price'],
              highlightedColumns: ['highest_price'],
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
          'SUM only works on numeric data types (INT, DECIMAL, FLOAT).',
        ],
        targetQuery: {
          sql: 'SELECT SUM(quantity_in_stock) AS total_units\nFROM products;',
          explanation: 'Calculate the total inventory units across all products in stock.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products (Scan quantities)',
            sqlSnippet: 'FROM products',
            explanation: 'SQL visits the products table.',
            tableData: {
              tableName: 'products (Candidate Units)',
              columns: ['name', 'quantity_in_stock'],
              rows: [
                ['Wireless Mouse', 40],
                ['Bluetooth Speaker', 3],
                ['Mechanical Keyboard', 12],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT SUM(quantity_in_stock) (Sum counts)',
            sqlSnippet: 'SELECT SUM(quantity_in_stock) AS total_units',
            explanation: 'Adds 40 + 3 + 12 = 55 total units.',
            tableData: {
              tableName: 'SUM Scalar Result',
              columns: ['total_units'],
              highlightedColumns: ['total_units'],
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
          'If a row has `NULL`, it is excluded from BOTH the sum (numerator) and the count (denominator).',
        ],
        targetQuery: {
          sql: 'SELECT AVG(age) AS avg_age\nFROM students;',
          explanation: 'Compute the average age of all enrolled students.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students (Extract student ages)',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits all student age records.',
            tableData: {
              tableName: 'students (Ages)',
              columns: ['name', 'age'],
              rows: [
                ['Rahim', 21],
                ['Karim', 22],
                ['Ayesha', 20],
                ['Sumaiya', 23],
                ['Tanvir', 21],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT AVG(age) (Compute mean)',
            sqlSnippet: 'SELECT AVG(age) AS avg_age',
            explanation: 'Sums ages (107) and divides by 5 students = 21.4.',
            tableData: {
              tableName: 'AVG Scalar Result',
              columns: ['avg_age'],
              highlightedColumns: ['avg_age'],
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
          'If a column contains `NULL`, SQL places all NULL rows into their own separate group.',
        ],
        targetQuery: {
          sql: 'SELECT category_id, COUNT(*) AS total_products\nFROM products\nGROUP BY category_id;',
          explanation: 'Group products by category and calculate total items in each bucket.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products GROUP BY category_id (Partition buckets)',
            sqlSnippet: 'FROM products GROUP BY category_id',
            explanation: 'Partitions all products into groups sharing the same category_id.',
            tableData: {
              tableName: 'Categorized Product Groups',
              columns: ['category_id', 'name'],
              rows: [
                [1, 'Wireless Mouse, Speaker, Cable... (6 items)'],
                [2, 'Pan Set, Bowls... (5 items)'],
                [3, 'Desk Organizer, Chair... (5 items)'],
                [4, 'Sporting Goods... (5 items)'],
                [5, 'Books & Media... (6 items)'],
                [null, 'Uncategorized (1 item)'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: SELECT category_id, COUNT(*) (Compute per-group metric)',
            sqlSnippet: 'SELECT category_id, COUNT(*) AS total_products',
            explanation: 'Creates a summary row for each category with its item count.',
            tableData: {
              tableName: 'Category Summary Result',
              columns: ['category_id', 'total_products'],
              highlightedColumns: ['category_id', 'total_products'],
              highlightedRows: [0, 1, 2, 3, 4, 5],
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
          'Writing `WHERE COUNT(*) > 2` is an error because WHERE runs before aggregates exist. Always use `HAVING`.',
        ],
        targetQuery: {
          sql: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30;',
          explanation: 'Group products by category and filter for categories averaging over $30.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products GROUP BY category_id (Aggregate all categories)',
            sqlSnippet: 'FROM products GROUP BY category_id',
            explanation: 'Computes product count and average price for all categories.',
            tableData: {
              tableName: 'All Aggregated Categories',
              columns: ['category_id', 'total_products', 'avg_price'],
              rows: [
                [1, 6, 31.79],
                [2, 5, 28.56],
                [3, 5, 47.15],
                [4, 5, 29.10],
                [5, 6, 20.62],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: HAVING AVG(price) > 30 (Filter group averages)',
            sqlSnippet: 'HAVING AVG(price) > 30',
            explanation: 'Discards categories averaging under $30, keeping categories 1 and 3.',
            tableData: {
              tableName: 'Filtered Category Groups',
              columns: ['category_id', 'total_products', 'avg_price'],
              highlightedColumns: ['avg_price'],
              highlightedRows: [0, 1],
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
// DAY 10: Guided Practice: Reporting & Aggregation (Mode 2)
// =============================================================================
export const DAY_10_MODULE: ModuleData = {
  id: 'day-10',
  slug: 'practice-reporting',
  day: 10,
  title: 'Day 10 — Guided Practice: Reporting & Aggregation',
  shortTitle: 'Practice: Reporting & Aggregation',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Construct multi-metric reporting widgets and dashboards combining COUNT, SUM, AVG, GROUP BY, and HAVING post-aggregation thresholds.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Construct multi-metric category and inventory summary reports combining multiple aggregates in a single SELECT',
    'Differentiate between row-level WHERE filters and group-level HAVING filters in the same query',
    'Apply post-aggregation thresholds using HAVING to isolate high-volume categories',
  ],
  concepts: [
    {
      id: 'reporting-widgets',
      order: 1,
      title: '1. Multi-Metric Reporting Queries & Dashboards',
      shortDescription: 'Combine multiple aggregates into business summary widgets.',
      theory: {
        summary: 'Reporting queries combine multiple aggregate calculations (counts, totals, averages) with group-level filtering (HAVING) and sorting to power executive dashboards.',
        introTable: {
          tableName: 'products',
          description: 'Inventory metrics snapshot per category',
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
          '### 1. The Multi-Metric Dashboard Pattern',
          'A single SQL query can compute item count, average price, and total stock volume simultaneously:',
          '```sql\nSELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 25\nORDER BY product_count DESC;\n```',
          '### 2. The Dual-Filter Rule (WHERE vs HAVING)',
          '• **`WHERE`** filters individual rows *before* grouping (e.g. `WHERE quantity_in_stock > 0`).',
          '• **`HAVING`** filters aggregated group metrics *after* grouping (e.g. `HAVING COUNT(*) >= 5`).',
        ],
        targetQuery: {
          sql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY product_count DESC;',
          explanation: 'Generate an executive category audit report for categories averaging over $15, sorted by product count.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products GROUP BY category_id (Group and aggregate)',
            sqlSnippet: 'FROM products GROUP BY category_id',
            explanation: 'Computes product count, avg price, and total stock per category.',
            tableData: {
              tableName: 'products (Aggregated Groups)',
              columns: ['category_id', 'product_count', 'avg_price', 'total_units'],
              rows: [
                [1, 6, 31.79, 88],
                [5, 6, 20.62, 137],
                [2, 5, 28.56, 102],
                [3, 5, 47.15, 187],
                [4, 5, 29.10, 102],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: HAVING AVG(price) > 15 ORDER BY product_count DESC',
            sqlSnippet: 'HAVING AVG(price) > 15 ORDER BY product_count DESC',
            explanation: 'Filters categories averaging over $15 and sorts highest product volume first.',
            tableData: {
              tableName: 'Category Audit Report Result',
              columns: ['category_id', 'product_count', 'avg_price', 'total_units'],
              highlightedColumns: ['category_id', 'product_count', 'avg_price', 'total_units'],
              highlightedRows: [0, 1, 2, 3, 4],
              rows: [
                [1, 6, 31.79, 88],
                [5, 6, 20.62, 137],
                [2, 5, 28.56, 102],
                [3, 5, 47.15, 187],
                [4, 5, 29.10, 102],
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
            question: 'Can you use multiple aggregate functions like COUNT, AVG, and SUM in the same SELECT statement?',
            options: [
              'A. No, only one aggregate function per query',
              'B. Yes, you can calculate multiple metrics simultaneously',
              'C. Only if using subqueries',
              'D. Only in MySQL 8.0+',
            ],
            correctIndex: 1,
            explanation: 'SQL allows multiple aggregate expressions in a single query.',
          },
        ],
        masteryPoints: ['Construct multi-metric reporting widgets unaided'],
      },
      tasks: [
        {
          id: 'day10-c1-t1',
          title: 'Task 1 (High Guidance): Category Overview Widget',
          description: 'Calculate product count and average price per category for categories averaging above $15, sorted by product count descending.',
          instructions: [
            'Query the `products` table.',
            'Select `category_id`, `COUNT(*) AS product_count`, and `AVG(price) AS avg_price`.',
            'Group by `category_id`.',
            'Filter with `HAVING AVG(price) > 15`.',
            'Sort by `product_count DESC`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Task 1: High Guidance - Category overview widget\nSELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY product_count DESC;',
          solutionSql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;',
          solutionExplanation: 'Computes metrics, filters categories averaging > $15, and sorts by count descending.',
          hints: [
            { level: 1, text: 'Use `GROUP BY category_id` to aggregate per category.' },
            { level: 2, text: 'Add `HAVING AVG(price) > 15 ORDER BY product_count DESC;`.' },
          ],
          validation: {
            targetTable: 'products',
            requireGroupBy: true,
            requireHaving: true,
            requireOrderBy: [{ column: 'product_count', direction: 'DESC' }],
            expectedRowCount: 5,
          },
          successMessage: 'Task 1 completed! Category overview report generated.',
        },
        {
          id: 'day10-c1-t2',
          title: 'Task 2 (Partial Guidance): Order Status Breakdown',
          description: 'Count the total number of orders for each status in the orders table, sorted by count descending.',
          instructions: [
            'Query the `orders` table.',
            'Select `status` and `COUNT(*) AS order_count`.',
            'Group by `status`.',
            'Order by `order_count DESC`.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql: '-- Task 2: Partial Guidance - Order status metrics\n',
          solutionSql: 'SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;',
          solutionExplanation: 'Groups orders by status and calculates counts.',
          hints: [
            { level: 1, text: 'Select `status` and `COUNT(*) AS order_count`.' },
            { level: 2, text: 'Use `GROUP BY status ORDER BY order_count DESC;`.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['status', 'order_count'],
            requireGroupBy: true,
            requireOrderBy: [{ column: 'order_count', direction: 'DESC' }],
            expectedRowCount: 4,
          },
          successMessage: 'Task 2 completed! Order status breakdown generated.',
        },
        {
          id: 'day10-c1-t3',
          title: 'Task 3 (Goal Only): In-Stock Category Inventory Audit',
          description: 'For each `category_id`, count products where `quantity_in_stock` is greater than 0. Keep only categories with at least 4 such products (`HAVING COUNT(*) >= 4`) and sort by the count from highest to lowest.',
          instructions: [
            'Select `category_id` and `COUNT(*) AS in_stock_count` from `products`.',
            'Filter rows with `WHERE quantity_in_stock > 0` before grouping.',
            'Group by `category_id`.',
            'Filter groups with `HAVING COUNT(*) >= 4`.',
            'Order by `in_stock_count DESC`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Task 3: Goal Only - In-stock category inventory audit\n',
          solutionSql: 'SELECT category_id, COUNT(*) AS in_stock_count FROM products WHERE quantity_in_stock > 0 GROUP BY category_id HAVING COUNT(*) >= 4 ORDER BY in_stock_count DESC;',
          solutionExplanation: 'Combines row-level WHERE with group-level HAVING filter.',
          hints: [
            { level: 1, text: 'Use `WHERE quantity_in_stock > 0` before `GROUP BY category_id`.' },
            { level: 2, text: 'Add `HAVING COUNT(*) >= 4 ORDER BY in_stock_count DESC;`.' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requireGroupBy: true,
            requireHaving: true,
            expectedRowCount: 5,
          },
          successMessage: 'Task 3 completed! In-stock category inventory audit generated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 10 CHALLENGE: BUILD AN EXECUTIVE DASHBOARD WIDGET (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-10-homework',
    title: 'Day 10 — Build an Executive Dashboard Widget (Ending Activity)',
    scenario: 'Build the Category Overview dashboard widget independently (business requirements only):',
    tasks: [
      {
        id: 'day10-hw-1',
        title: 'Task 1: "Category Overview" Dashboard Widget',
        description: '"Category Overview" dashboard widget — product count and average price per category, only categories averaging above $15, sorted by product count descending.',
        instructions: [
          'Select `category_id`, `COUNT(*) AS product_count`, `AVG(price) AS avg_price` from `products` grouped by `category_id` having `AVG(price) > 15` order by `product_count DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Challenge: Category Overview dashboard widget\n',
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
        successMessage: 'Challenge completed! Category Overview widget verified.',
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
// DAY 12: Debugging Lab: Multi-Table Aggregations & Fan-Out (Mode 3)
// =============================================================================
export const DAY_12_MODULE: ModuleData = {
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

// =============================================================================
// DAY 13: Visual Concept Lab: Relational Architecture & 7-Stage Pipeline (Mode 1)
// =============================================================================
export const DAY_13_MODULE: ModuleData = {
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

// =============================================================================
// DAY 14: Applied Project: Business Intelligence Reporting Suite (Mode 4)
// =============================================================================
export const DAY_14_MODULE: ModuleData = {
  id: 'day-14',
  slug: 'project-part-2-multi-table-reporting',
  day: 14,
  title: 'Day 14 — Applied Project: Business Intelligence Reporting Suite',
  shortTitle: 'Project: BI Reporting Suite',
  type: 'project_part',
  milestoneId: 'milestone-2',
  description: 'As a BI Analyst, build production-ready analytics reports: product sales volume rankings, VIP customer leaderboard, and discover unpurchased inventory via anti-joins.',
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
        summary: 'Welcome to the Business Intelligence (BI) team! Today you build three key executive reports: sales volume by product, top spending VIP customers, and identifying catalog items that have never been ordered using anti-joins.',
        introTable: {
          tableName: 'products & order_items',
          description: 'Product catalog joined with order line items',
          columns: ['p.product_id', 'p.name', 'oi.quantity', 'oi.unit_price'],
          rows: [
            [1, 'Wireless Mouse', 2, 15.99],
            [2, 'Bluetooth Speaker', 1, 45.50],
            [4, 'Mechanical Keyboard', 2, 65.00],
            [28, 'Clearance Item', null, null],
          ],
        },
        explanation: [
          '### 1. The Anti-Join Pattern (Never Ordered)',
          'To find items that have never been purchased, `LEFT JOIN order_items` onto `products` and filter with `WHERE oi.order_item_id IS NULL`.',
          'Any product that has no matching row in `order_items` will have `NULL` for `oi.order_item_id`.',
        ],
        targetQuery: {
          sql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold\nFROM products p\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name\nORDER BY total_units_sold DESC;',
          explanation: 'Aggregate line-item sales across products and rank products by total volume sold.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products p JOIN order_items oi ON p.product_id = oi.product_id',
            sqlSnippet: 'FROM products p JOIN order_items oi ON p.product_id = oi.product_id',
            explanation: 'Matches products with their order line items.',
            tableData: {
              tableName: 'Matched Product Line Items',
              columns: ['p.name', 'oi.quantity', 'oi.unit_price'],
              rows: [
                ['Wireless Mouse', 2, 15.99],
                ['Wireless Mouse', 5, 15.99],
                ['Mechanical Keyboard', 4, 65.00],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC',
            sqlSnippet: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC',
            explanation: 'Sums total quantity per product and ranks top sellers first.',
            tableData: {
              tableName: 'Product Sales Volume Result',
              columns: ['name', 'total_units_sold'],
              highlightedColumns: ['name', 'total_units_sold'],
              highlightedRows: [0, 1, 2],
              rows: [
                ['Wireless Mouse', 7],
                ['Mechanical Keyboard', 4],
                ['USB-C Cable', 4],
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
          title: 'Mission 1 (Guided): Product Sales Volume Ranking',
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
          initialSql: '-- Mission 1: Product units sold ranking\n',
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
          successMessage: 'Mission 1 complete! Product unit sales ranked.',
        },
        {
          id: 'day14-c1-t2',
          title: 'Mission 2 (Independent): Unpurchased Products Discovery',
          description: 'Identify all products that have never appeared in any order using a LEFT JOIN and IS NULL filter.',
          instructions: [
            'Query `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
            'Select `p.product_id` and `p.name`.',
            'Filter where `oi.order_item_id IS NULL`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['order_items'],
          initialSql: '-- Mission 2: Anti-join for unpurchased products\n',
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
          successMessage: 'Mission 2 complete! Unpurchased inventory identified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 14 CHALLENGE: DELIVER THE 3-PART EXECUTIVE BI REPORTING SUITE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-14-homework',
    title: 'Day 14 — Deliver the 3-Part Executive BI Reporting Suite (Ending Activity)',
    scenario: 'Construct all 3 core multi-table reports independently:',
    tasks: [
      {
        id: 'day14-hw-1',
        title: 'Report 1: Product Sales Volume Ranking',
        description: 'Products with total units sold, highest first.',
        instructions: [
          'Select `p.name`, `SUM(oi.quantity) AS total_units_sold` from `products p` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `p.product_id`, `p.name` ORDER BY `total_units_sold DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['order_items'],
        initialSql: '-- Report 1: Products with total units sold\n',
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
        successMessage: 'Report 1 verified! Product sales volume calculated.',
      },
      {
        id: 'day14-hw-2',
        title: 'Report 2: Top 5 VIP Spenders Leaderboard',
        description: 'Find the 5 customers who have spent the most money overall: join `customers → orders → order_items`, compute each customer\'s total spend as `SUM(oi.quantity * oi.unit_price)`, then sort by that total from highest to lowest and return only the top 5 rows.',
        instructions: [
          'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` ORDER BY `total_spent DESC` LIMIT 5.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Report 2: Top 5 VIP customers by spend\n',
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
        successMessage: 'Report 2 verified! Top VIP customers identified.',
      },
      {
        id: 'day14-hw-3',
        title: 'Report 3: Unpurchased Products (Anti-Join)',
        description: 'Products that have never been ordered (LEFT JOIN + IS NULL anti-join).',
        instructions: [
          'Select `p.product_id`, `p.name` from `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` WHERE `oi.order_item_id IS NULL`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['order_items'],
        initialSql: '-- Report 3: Products that have never been ordered\n',
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
        successMessage: 'Report 3 verified! Unpurchased inventory identified.',
      },
    ],
  },
};

// =============================================================================
// DAY 15: Debugging Lab: Query Hardening & Temporal Filters (Mode 3)
// =============================================================================
export const DAY_15_MODULE: ModuleData = {
  id: 'day-15',
  slug: 'independent-work-debug',
  day: 15,
  title: 'Day 15 — Debugging Lab: Query Hardening & Temporal Filters',
  shortTitle: 'Debug: Temporal Filters & Audits',
  type: 'practice_day',
  milestoneId: 'milestone-2',
  description: 'Harden multi-table queries with date range boundaries and audit inactive customer accounts before Milestone 2 assessment.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Add date-range constraints to multi-table joined reporting queries',
    'Audit inactive zero-order customer accounts using LEFT JOIN and HAVING',
    'Harden query logic against data edge cases before assessment checkpoints',
  ],
  concepts: [
    {
      id: 'query-debugging-polish',
      order: 1,
      title: '1. Query Hardening & Date Range Constraints',
      shortDescription: 'Refine multi-table queries and add temporal filters.',
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
          initialSql: '-- Task 1: Recent customer spend with date filter\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;',
          solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
          solutionExplanation: 'Filters by date range, joins line items, and sums total spend per customer.',
          hints: [
            { level: 1, text: 'Use `WHERE o.order_date >= \'2026-06-25\'` before GROUP BY.' },
            { level: 2, text: 'Group by `c.customer_id, c.name ORDER BY recent_spend DESC;`.' },
          ],
          validation: {
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
    id: 'day-15-homework',
    title: 'Day 15 — Fix Broken & Date-Constrained Queries (Ending Activity)',
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
        solutionExplanation: 'Multi-table customer spend report with date interval filter.',
        hints: [{ level: 1, text: 'Use `WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;`' }],
        validation: {
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

// =============================================================================
// DAY 16: Milestone 2: Relational Mastery Checkpoint (Mode 5)
// =============================================================================
export const DAY_16_MODULE: ModuleData = {
  id: 'day-16',
  slug: 'milestone-2-assessment',
  day: 16,
  title: 'Day 16 — Milestone 2: Relational Mastery Checkpoint',
  shortTitle: 'Milestone 2 Checkpoint',
  type: 'assignment',
  milestoneId: 'milestone-2',
  description: 'Independent competency verification for Milestone 2: prove proficiency in multi-table relational queries, financial aggregations, and anti-joins.',
  estimatedMinutes: 90,
  completionLearnings: [
    'Calculate total database revenue across order line items',
    'Aggregate multi-table revenue breakdowns by product category',
    'Filter high-value customers with spend thresholds using HAVING',
    'Discover suppliers whose products have never been ordered using anti-joins',
  ],
  concepts: [
    {
      id: 'milestone-2-eval',
      order: 1,
      title: '1. Milestone 2 Core Competency Verification',
      shortDescription: 'Independent multi-table skill verification across Days 9–15.',
      theory: {
        summary: 'Milestone 2 Skill Verification: Prove your ability to independently answer real-world business questions using multi-table JOINs, financial aggregations, and anti-joins without templates or assistance.',
        introTable: {
          tableName: 'order_items',
          description: 'Line item financial transactions',
          columns: ['order_item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
          rows: [
            [1, 1, 1, 2, 15.99],
            [2, 1, 4, 1, 65.00],
            [3, 2, 6, 1, 55.00],
          ],
        },
        explanation: [
          '### 1. Milestone 2 Verification Objectives',
          '• **Core Skill**: Total database revenue calculation across all order line items.',
          '• **Combination**: Multi-table revenue breakdown by product category (`categories` $\\rightarrow$ `products` $\\rightarrow$ `order_items`).',
          '• **Transfer**: High-value customers filtering with post-aggregation thresholds (`HAVING total_spent > 200`).',
          '• **Hard Problem**: Anti-join discovery of suppliers with zero ordered products (find Unity Traders BD).',
        ],
        targetQuery: {
          sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC;',
          explanation: 'Aggregate multi-table revenue breakdown across categories, products, and line items, sorted highest revenue first.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM categories cat JOIN products p JOIN order_items oi',
            sqlSnippet: 'FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id',
            explanation: 'Joins 3 tables to link category names to product purchases.',
            tableData: {
              tableName: 'Matched Multi-Table Line Items',
              columns: ['cat.name', 'p.name', 'oi.quantity', 'oi.unit_price'],
              rows: [
                ['Electronics', 'Wireless Mouse', 2, 15.99],
                ['Electronics', 'Mechanical Keyboard', 1, 65.00],
                ['Kitchen & Dining', 'Stainless Steel Pan Set', 1, 55.00],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC',
            sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC',
            explanation: 'Computes total sales revenue generated per category.',
            tableData: {
              tableName: 'Category Revenue Summary Result',
              columns: ['name', 'category_revenue'],
              highlightedColumns: ['name', 'category_revenue'],
              highlightedRows: [0, 1, 2],
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
            options: ['A. LogiTech Direct', 'B. Unity Traders BD', 'C. KeyChron Components', 'D. SoundWave Acoustic'],
            correctIndex: 1,
            explanation: 'Unity Traders BD has products in the catalog, but none have ever been referenced in order_items.',
          },
        ],
        masteryPoints: ['Pass all 4 Milestone 2 independent verification deliverables'],
      },
      tasks: [
        {
          id: 'day16-c1-t1',
          title: 'Warmup 1: Total Revenue Calculation',
          description: 'Calculate the grand total revenue across all order line items.',
          instructions: [
            'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'order_items',
          initialSql: '-- Warmup 1: Grand total revenue\n',
          solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
          solutionExplanation: 'Calculates the sum product of quantity and unit_price for all order items.',
          hints: [{ level: 1, text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`' }],
          validation: {
            targetTable: 'order_items',
            expectedRowCount: 1,
          },
          successMessage: 'Warmup 1 completed! Total revenue calculated.',
        },
        {
          id: 'day16-c1-t2',
          title: 'Warmup 2: Category Revenue Breakdown',
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
          initialSql: '-- Warmup 2: Revenue by category\n',
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
          successMessage: 'Warmup 2 completed! Category revenue breakdown calculated.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 16 CHALLENGE: MILESTONE 2 MASTERY CHECKPOINT (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-16-homework',
    title: 'Day 16 — Milestone 2 Mastery Checkpoint (Ending Activity)',
    scenario: 'Complete all 4 deliverables independently to verify Milestone 2 relational mastery:',
    tasks: [
      {
        id: 'day16-hw-1',
        title: 'Deliverable 1 (Core): Grand total revenue across all orders',
        description: 'Total revenue (SUM across order_items).',
        instructions: [
          'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'order_items',
        initialSql: '-- Deliverable 1: Total revenue\n',
        solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
        solutionExplanation: 'Calculates grand total revenue across all order line items.',
        hints: [{ level: 1, text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`' }],
        validation: {
          targetTable: 'order_items',
          expectedRowCount: 1,
        },
        successMessage: 'Deliverable 1 verified! Grand total revenue calculated.',
      },
      {
        id: 'day16-hw-2',
        title: 'Deliverable 2 (Combination): Revenue by product category',
        description: 'Revenue by category (categories → products → order_items).',
        instructions: [
          'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'categories',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Deliverable 2: Revenue by category\n',
        solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;',
        solutionExplanation: 'Joins categories -> products -> order_items and sums revenue per category.',
        hints: [{ level: 1, text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;`' }],
        validation: {
          targetTable: 'categories',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 5,
        },
        successMessage: 'Deliverable 2 verified! Revenue by category calculated.',
      },
      {
        id: 'day16-hw-3',
        title: 'Deliverable 3 (Transfer): High-value customers who spent more than $200',
        description: 'Customers who\'ve spent more than $200.',
        instructions: [
          'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` HAVING `SUM(oi.quantity * oi.unit_price) > 200` ORDER BY `total_spent DESC`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'order_items'],
        initialSql: '-- Deliverable 3: Customers who spent more than $200\n',
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
        successMessage: 'Deliverable 3 verified! High-value customers identified.',
      },
      {
        id: 'day16-hw-4',
        title: 'Deliverable 4 (Hard Problem): Suppliers whose products have never been ordered',
        description: 'Suppliers whose products have never been ordered (find Unity Traders BD via anti-join).',
        instructions: [
          'Select `s.supplier_id`, `s.name` from `suppliers s` LEFT JOIN `products p` ON `s.supplier_id = p.supplier_id` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `s.supplier_id`, `s.name` HAVING `COUNT(oi.order_item_id) = 0`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'suppliers',
        secondaryTables: ['products', 'order_items'],
        initialSql: '-- Deliverable 4: Suppliers whose products have never been ordered\n',
        solutionSql: 'SELECT s.supplier_id, s.name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;',
        solutionExplanation: 'Anti-join identifying suppliers with zero order item records (Unity Traders BD).',
        hints: [{ level: 1, text: 'Use `GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;`' }],
        validation: {
          targetTable: 'suppliers',
          requireJoin: true,
          requireGroupBy: true,
          expectedRowCount: 1,
        },
        successMessage: 'Deliverable 4 verified! Unordered supplier Unity Traders BD found.',
      },
    ],
  },
};
