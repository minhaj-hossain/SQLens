import { ModuleData } from '../../types/curriculum';

export const Day_09_MODULE: ModuleData = {
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
        exampleQuery: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 30 ORDER BY avg_price DESC;',
        exampleQueryExplanation: 'Groups products by category, keeps ONLY the categories whose average price exceeds $30, and sorts them highest first.',
        liveDemoSql: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 30 ORDER BY avg_price DESC;',
        liveDemoNotes: 'Displays only categories whose average price passes the HAVING threshold of $30.',
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
