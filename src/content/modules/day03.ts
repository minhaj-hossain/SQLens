import { ModuleData } from '../../types/curriculum';

export const DAY_03_MODULE: ModuleData = {
  id: 'day-03',
  slug: 'specialized-filtering',
  day: 3,
  title: 'Day 3 — Specialized Filtering',
  shortTitle: 'Specialized Filtering',
  type: 'module',
  milestoneId: 'milestone-1',
  description: 'Master advanced filtering: compound logic (AND, OR, NOT, Parentheses), discrete sets (IN), continuous intervals (BETWEEN), wildcard patterns (LIKE), NULL safety (IS NULL / IS NOT NULL), and temporal date filtering.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Combine multiple criteria using AND (intersection) and OR (union)',
    'Master operator precedence and force evaluation order with parentheses',
    'Replace repetitive OR chains with clean IN (...) lists',
    'Filter inclusive numeric and date intervals with BETWEEN ... AND ...',
    'Perform partial string searches using LIKE with % and _ wildcards',
    'Safely detect missing data with IS NULL and IS NOT NULL without = NULL failures',
    'Filter recent temporal records using MySQL date arithmetic and intervals',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: Compound Logic (AND, OR, NOT & Parentheses)
    // =========================================================================
    {
      id: 'where-and-or-not',
      order: 1,
      title: '1. Compound Logic (AND, OR, NOT & Parentheses)',
      shortDescription: 'How to combine multiple criteria and control precedence with parentheses.',
      theory: {
        summary: 'In real applications, a single filter is rarely enough. What if we want CSE students who also live in Dhaka?',
        introTable: {
          tableName: 'students',
          description: 'Original students table stored in database (5 records)',
          columns: ['id', 'name', 'age', 'department', 'city'],
          rows: [
            [1, 'Rahim', 21, 'CSE', 'Dhaka'],
            [2, 'Karim', 22, 'EEE', 'Gazipur'],
            [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
            [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
            [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
          ],
        },
        explanation: [
          'In real applications, decisions depend on multiple conditions simultaneously.',
          '### 1. AND (Both Conditions Must Be TRUE)\n`AND` narrows down your results. A row survives only if **every** condition passes:\n\n```sql\nSELECT name, department, city\nFROM students\nWHERE department = \'CSE\' AND city = \'Dhaka\';\n```',
          '### 2. OR (At Least One Condition Must Be TRUE)\n`OR` broadens your results. A row survives if **either** condition (or both) passes:\n\n```sql\nSELECT name, city\nFROM students\nWHERE city = \'Dhaka\' OR city = \'Gazipur\';\n```',
          '### 3. Operator Precedence: AND Before OR\nIn SQL, **`AND` is evaluated before `OR`**, just like multiplication comes before addition.\n\nTo avoid subtle bugs when mixing `AND` and `OR`, always wrap your `OR` clauses in parentheses `( ... )`:\n\n```sql\n-- ✅ Explicit & safe:\nSELECT name, age, city\nFROM students\nWHERE (city = \'Dhaka\' OR city = \'Gazipur\') AND age >= 21;\n```',
          '### 4. Inverting Logic with NOT\n`NOT` flips a boolean condition:\n`WHERE NOT (department = \'CSE\')` is identical to `WHERE department != \'CSE\'`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table.',
            tableData: {
              tableName: 'students',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [2, 'Karim', 22, 'EEE', 'Gazipur'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
                [4, 'Sumaiya', 23, 'BBA', 'Chattogram'],
                [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: "Step 2: WHERE department = 'CSE' AND city = 'Dhaka'",
            sqlSnippet: "WHERE department = 'CSE' AND city = 'Dhaka'",
            explanation: "1. Rahim: (CSE = TRUE) AND (Dhaka = TRUE) ➔ TRUE ✅\n2. Karim: (EEE = FALSE) ➔ FALSE ❌\n3. Ayesha: (CSE = TRUE) AND (Dhaka = TRUE) ➔ TRUE ✅\n4. Sumaiya: (BBA = FALSE) ➔ FALSE ❌\n5. Tanvir: (CSE = TRUE) AND (Rajshahi = FALSE) ➔ FALSE ❌",
            tableData: {
              tableName: 'Surviving Rows',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: SELECT name, department, city',
            sqlSnippet: 'SELECT name, department, city',
            explanation: 'Only the 2 matching CSE students in Dhaka are returned:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'department', 'city'],
              highlightedColumns: ['name', 'department', 'city'],
              rows: [
                ['Rahim', 'CSE', 'Dhaka'],
                ['Ayesha', 'CSE', 'Dhaka'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'AND syntax',
            sql: "SELECT name FROM students WHERE department = 'CSE' AND age >= 21;",
            description: 'Returns CSE students who are 21 or older.',
          },
          {
            title: 'OR with Parentheses syntax',
            sql: "SELECT name FROM students WHERE (city = 'Dhaka' OR city = 'Gazipur') AND age >= 21;",
            description: 'Parentheses guarantee that city check is grouped before applying age filter.',
          },
        ],
        keyTakeaway: 'AND narrows queries (both TRUE), OR expands queries (either TRUE). Always use parentheses when mixing AND and OR.',
        exampleQuery: "SELECT name, department, city FROM students WHERE department = 'CSE' AND city = 'Dhaka';",
        exampleQueryExplanation: 'Finds students in CSE who live in Dhaka.',
        liveDemoSql: "SELECT name, department, city FROM students WHERE department = 'CSE' AND city = 'Dhaka';",
        liveDemoNotes: 'Returns Rahim and Ayesha.',
        mcqs: [
          {
            question: "Why are parentheses needed in:\nWHERE (city = 'Dhaka' OR city = 'Gazipur') AND age >= 21",
            options: [
              "A. Because SQL requires parentheses on all WHERE clauses",
              "B. Because AND has higher precedence than OR, so without parentheses SQL would bind Gazipur with age >= 21 first",
              "C. Because OR cannot be used without parentheses",
              "D. To make the query execute faster",
            ],
            correctIndex: 1,
            explanation: "AND binds more tightly than OR. Parentheses force SQL to evaluate the OR union first.",
          },
          {
            question: "What does `WHERE NOT (price < 50)` evaluate to?",
            options: [
              "A. WHERE price = 50",
              "B. WHERE price > 50",
              "C. WHERE price >= 50",
              "D. WHERE price <= 50",
            ],
            correctIndex: 2,
            explanation: "The opposite of strictly less than (< 50) is greater than or equal to (>= 50).",
          },
        ],
      },
      masteryPoints: [
        'Use AND when both conditions must be TRUE',
        'Use OR when at least one condition must be TRUE',
        'Always wrap OR conditions in parentheses when combined with AND',
      ],
      tasks: [
        {
          id: 'day03-c1-t1',
          title: 'Task 1: CSE Students Aged 21',
          description: 'Show name, age, and department for students in CSE who are exactly 21 years old.',
          instructions: [
            'Select `name`, `age`, and `department` from `students`.',
            "Filter where `department = 'CSE' AND age = 21`.",
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
          solutionExplanation: "Returns Rahim and Tanvir (both in CSE and 21 years old).",
          hints: [
            { level: 1, text: "Add `21` after `age =`." },
            { level: 2, text: "`SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;`" },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'age', 'department'],
            requireWhere: true,
            whereContainsTerms: ['department', 'CSE', 'AND', 'age', '21'],
            expectedRowCount: 2,
          },
          successMessage: 'Great job! You combined conditions using AND.',
        },
        {
          id: 'day03-c1-t2',
          title: 'Task 2: In-Stock Budget Accessories',
          description: 'Find products in category 2 (Accessories) priced under $30.00 that are currently in stock (quantity_in_stock > 0).',
          instructions: [
            'Query the `products` table.',
            'Select `name`, `price`, and `quantity_in_stock`.',
            'Filter where `category_id = 2 AND price < 30 AND quantity_in_stock > 0`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Find in-stock budget accessories\n',
          solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE category_id = 2 AND price < 30 AND quantity_in_stock > 0;',
          solutionExplanation: 'Extracts Wireless Mouse ($25), USB-C Cable ($12.50), and Gaming Mousepad XL ($18).',
          hints: [
            { level: 1, text: 'Use `WHERE category_id = 2 AND price < 30 AND quantity_in_stock > 0;`' },
          ],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'price', 'quantity_in_stock'],
            requireWhere: true,
            whereContainsTerms: ['category_id', 'price', 'quantity_in_stock'],
            expectedRowCount: 3,
          },
          successMessage: 'Perfect! You applied multi-attribute filtering on the catalog.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Set Membership (IN) & Continuous Ranges (BETWEEN)
    // =========================================================================
    {
      id: 'where-in-between',
      order: 2,
      title: '2. Range & Set Inclusion (IN, BETWEEN)',
      shortDescription: 'Simplify queries using discrete set lists (IN) and inclusive intervals (BETWEEN).',
      theory: {
        summary: 'Instead of writing long chains of OR statements or multiple comparisons, SQL gives us clean shortcuts:',
        introTable: {
          tableName: 'products',
          description: 'Sample products snapshot',
          columns: ['product_id', 'name', 'category_id', 'price'],
          rows: [
            [1, 'Wireless Mouse', 2, 25.00],
            [2, 'Mechanical Keyboard', 1, 89.99],
            [3, 'USB-C Cable (2m)', 2, 12.50],
            [4, 'Ergonomic Desk Chair', 3, 249.00],
            [5, 'Noise-Cancelling Headphones', 5, 179.50],
          ],
        },
        explanation: [
          '### 1. The IN Operator (Discrete Sets)',
          'Instead of writing verbose chains like:\n```sql\nWHERE city = \'Dhaka\' OR city = \'Chittagong\' OR city = \'Sylhet\'\n```\nYou can write the clean, readable equivalent:\n```sql\nWHERE city IN (\'Dhaka\', \'Chittagong\', \'Sylhet\')\n```',
          '### 2. The BETWEEN Operator (Inclusive Intervals)',
          'To test if a number or date falls inside a range, use `BETWEEN min AND max`:\n```sql\nWHERE price BETWEEN 20.00 AND 100.00\n```\n\n**CRITICAL**: `BETWEEN` is **inclusive**—it includes both 20.00 and 100.00.',
          '### 3. Inverting with NOT IN and NOT BETWEEN',
          '• `WHERE category_id NOT IN (1, 2)` excludes categories 1 and 2.\n• `WHERE price NOT BETWEEN 10 AND 50` excludes items in that price band.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Check discrete set with IN',
            sqlSnippet: 'SELECT name, category_id, price\nFROM products\nWHERE category_id IN (1, 5);',
            explanation: 'SQL matches products belonging to either category 1 (Electronics) or category 5 (Audio).',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'category_id', 'price'],
              highlightedColumns: ['category_id'],
              rows: [
                ['Mechanical Keyboard', 1, 89.99],
                ['Noise-Cancelling Headphones', 5, 179.50],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Inclusive interval with BETWEEN',
            sqlSnippet: 'SELECT name, price\nFROM products\nWHERE price BETWEEN 20.00 AND 90.00;',
            explanation: 'Matches products priced between $20.00 and $90.00 inclusive.',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'price'],
              highlightedColumns: ['price'],
              rows: [
                ['Wireless Mouse', 25.00],
                ['Mechanical Keyboard', 89.99],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'IN syntax',
            sql: "SELECT * FROM customers WHERE city IN ('Dhaka', 'Chittagong');",
            description: 'Matches rows where city equals any item in the list.',
          },
          {
            title: 'BETWEEN syntax',
            sql: 'SELECT * FROM products WHERE price BETWEEN 25.00 AND 100.00;',
            description: 'Matches values greater than or equal to 25 and less than or equal to 100.',
          },
        ],
        keyTakeaway: 'Use IN for discrete lists instead of chained ORs. Use BETWEEN for inclusive intervals.',
        exampleQuery: 'SELECT name, price FROM products WHERE price BETWEEN 20 AND 100;',
        exampleQueryExplanation: 'Finds products priced between $20.00 and $100.00 inclusive.',
        liveDemoSql: 'SELECT name, price FROM products WHERE price BETWEEN 20 AND 100;',
        liveDemoNotes: 'Displays all products in the $20 to $100 price bracket.',
        mcqs: [
          {
            question: 'What does `WHERE price BETWEEN 10 AND 50` include in standard SQL?',
            options: [
              'A. Numbers strictly between 11 and 49 only',
              'B. Both 10.00 and 50.00 as well as all values in between (inclusive)',
              'C. Only integer numbers',
              'D. Only 10 and 50 exactly',
            ],
            correctIndex: 1,
            explanation: 'BETWEEN in SQL is inclusive of both boundary endpoints.',
          },
          {
            question: 'Which query is cleaner and equivalent to `WHERE id = 1 OR id = 3 OR id = 5`?',
            options: [
              'A. WHERE id BETWEEN 1 AND 5',
              'B. WHERE id IN (1, 3, 5)',
              'C. WHERE id = 1 AND id = 3 AND id = 5',
              'D. WHERE id LIKE 135',
            ],
            correctIndex: 1,
            explanation: '`IN (1, 3, 5)` tests if the column value equals any member in the discrete set.',
          },
        ],
      },
      masteryPoints: [
        'Use IN for discrete candidate lists',
        'Use BETWEEN for inclusive intervals',
        'Use NOT IN and NOT BETWEEN to invert range/set logic',
      ],
      tasks: [
        {
          id: 'day03-c2-t1',
          title: 'Task 1: Products in Price Band $25 to $100',
          description: 'Show name and price for products priced between $25.00 and $100.00 inclusive.',
          instructions: [
            'Select `name` and `price` from `products`.',
            'Filter with `WHERE price BETWEEN 25.00 AND 100.00`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;',
          solutionExplanation: '`BETWEEN 25.00 AND 100.00` captures all mid-tier products (8 items).',
          hints: [
            { level: 1, text: 'Complete the query with `100.00;`' },
            { level: 2, text: '`SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;`' },
          ],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'price'],
            requireWhere: true,
            whereContainsTerms: ['BETWEEN', '25', '100'],
            expectedRowCount: 8,
          },
          successMessage: 'Great job! You executed an inclusive range query.',
        },
        {
          id: 'day03-c2-t2',
          title: 'Task 2: Customers in Key Regional Hubs',
          description: 'Retrieve customer name, email, and city for customers living in Dhaka, Chittagong, or Sylhet using the IN operator.',
          instructions: [
            'Query the `customers` table.',
            'Select `name`, `email`, and `city`.',
            "Filter where `city IN ('Dhaka', 'Chittagong', 'Sylhet')`.",
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Filter customers in key cities using IN\n',
          solutionSql: "SELECT name, email, city FROM customers WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');",
          solutionExplanation: "Returns the 9 domestic customers in Dhaka, Chittagong, and Sylhet.",
          hints: [
            { level: 1, text: "Use `WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');`" },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'email', 'city'],
            requireWhere: true,
            whereContainsTerms: ['city', 'IN', 'Dhaka', 'Chittagong', 'Sylhet'],
            expectedRowCount: 9,
          },
          successMessage: 'Perfect! You filtered candidate sets cleanly with IN.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3: Pattern Matching (LIKE) & NULL Handling (IS NULL)
    // =========================================================================
    {
      id: 'where-like-null-safety',
      order: 3,
      title: '3. Pattern Matching (LIKE) & NULL Safety',
      shortDescription: 'Wildcard string searches and safe missing value detection.',
      theory: {
        summary: 'In real datasets, text searches are often partial, and records frequently contain missing data (NULL):',
        introTable: {
          tableName: 'customers',
          description: 'Customer profiles with optional email addresses',
          columns: ['customer_id', 'name', 'email', 'city'],
          rows: [
            [1, 'Rahim Chowdhury', 'rahim@email.com', 'Dhaka'],
            [5, 'Fatima Noor', null, 'Dhaka'],
            [10, 'Nafis Iqbal', null, 'Dhaka'],
            [12, 'Liam O’Connor', 'liam@dublindev.ie', 'Dublin'],
          ],
        },
        explanation: [
          '### 1. Wildcard Searches with LIKE',
          '`%` represents zero, one, or many characters. `_` represents exactly one character.',
          '| Pattern | Matches | Example |\n|---|---|---|\n| `LIKE \'%Desk%\'` | Any string containing "Desk" | "Ergonomic Desk Chair", "Desk LED Lamp" |\n| `LIKE \'Steel%\'` | Starts with "Steel" | "Steel Monitor Arm", "Steel Frame Footrest" |\n| `LIKE \'%@gmail.com\'` | Ends with "@gmail.com" | "sara.k@gmail.com" |',
          '### 2. NULL Safety: = NULL Always Fails Silently!',
          '`NULL` represents unknown or missing data. It is **not** an empty string `\'\'` and **not** zero `0`.',
          'QUESTION_BLOCK::Critical Rule::Never write `WHERE email = NULL`. In SQL, `= NULL` evaluates to UNKNOWN, returning 0 rows! Always write `IS NULL` or `IS NOT NULL`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Finding missing emails with IS NULL',
            sqlSnippet: 'SELECT name, city FROM customers WHERE email IS NULL;',
            explanation: 'SQL identifies records where the email column holds no data (NULL).',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'city'],
              rows: [
                ['Fatima Noor', 'Dhaka'],
                ['Nafis Iqbal', 'Dhaka'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Substring matching with LIKE',
            sqlSnippet: "SELECT name, price FROM products WHERE name LIKE '%Mouse%';",
            explanation: 'Finds all products with "Mouse" in their name.',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'price'],
              highlightedColumns: ['name'],
              rows: [
                ['Wireless Mouse', 25.00],
                ['Gaming Mousepad XL', 18.00],
                ['Ergonomic Vertical Mouse', 32.50],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'LIKE wildcard search',
            sql: "SELECT name, price FROM products WHERE name LIKE '%wireless%';",
            description: '% matches any characters before and after the keyword.',
          },
          {
            title: 'Safe NULL checks',
            sql: "SELECT name FROM customers WHERE email IS NULL;\nSELECT name FROM customers WHERE email IS NOT NULL;",
            description: 'Always use IS NULL and IS NOT NULL. Never use = NULL.',
          },
        ],
        keyTakeaway: 'Use LIKE with % for partial text searches. Always use IS NULL / IS NOT NULL to check for missing data.',
        exampleQuery: 'SELECT name, city FROM customers WHERE email IS NULL;',
        exampleQueryExplanation: 'Finds customer accounts missing an email address.',
        liveDemoSql: 'SELECT name, city FROM customers WHERE email IS NULL;',
        liveDemoNotes: 'Returns Fatima Noor and Nafis Iqbal.',
        mcqs: [
          {
            question: 'Why does `SELECT * FROM customers WHERE email = NULL;` fail to return rows with missing emails?',
            options: [
              'A. Because SQL syntax requires quotes around NULL',
              'B. Because NULL represents unknown, so = NULL evaluates to UNKNOWN and silently returns 0 rows',
              'C. Because the table must be sorted first',
              'D. Because NULL can only be checked on numeric columns',
            ],
            correctIndex: 1,
            explanation: 'In SQL, NULL can never equal anything. You must use `IS NULL`.',
          },
          {
            question: "Which query matches any product starting with the word 'Wireless'?",
            options: [
              "A. WHERE name LIKE '%Wireless'",
              "B. WHERE name LIKE 'Wireless%'",
              "C. WHERE name = 'Wireless*'",
              "D. WHERE name IN ('Wireless')",
            ],
            correctIndex: 1,
            explanation: "'Wireless%' matches strings beginning with Wireless followed by any characters.",
          },
        ],
      },
      masteryPoints: [
        'Use LIKE with % for wildcard searches',
        'Use IS NULL and IS NOT NULL to detect missing values',
        'Never use = NULL or != NULL in SQL',
      ],
      tasks: [
        {
          id: 'day03-c3-t1',
          title: 'Task 1: Search Mouse Products with LIKE',
          description: 'Find all products containing the word "Mouse" anywhere in their name.',
          instructions: [
            'Select `name` and `price` from `products`.',
            "Filter with `WHERE name LIKE '%Mouse%'`.",
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: "SELECT name, price FROM products WHERE name LIKE '%Mouse%';",
          solutionExplanation: "Matches Wireless Mouse, Gaming Mousepad XL, and Ergonomic Vertical Mouse.",
          hints: [
            { level: 1, text: "Use `WHERE name LIKE '%Mouse%';`" },
          ],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'price'],
            requireWhere: true,
            whereContainsTerms: ['LIKE', '%Mouse%'],
            expectedRowCount: 3,
          },
          successMessage: 'Great job! You executed a wildcard substring search.',
        },
        {
          id: 'day03-c3-t2',
          title: 'Task 2: Customers Without Email (IS NULL)',
          description: 'Show name and city for customers who do not have an email address recorded.',
          instructions: [
            'Query the `customers` table.',
            'Select `name` and `city`.',
            'Filter where `email IS NULL`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Find customers with missing emails\n',
          solutionSql: 'SELECT name, city FROM customers WHERE email IS NULL;',
          solutionExplanation: '`WHERE email IS NULL` identifies Fatima Noor and Nafis Iqbal.',
          hints: [
            { level: 1, text: 'Use `WHERE email IS NULL;`' },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'city'],
            requireWhere: true,
            whereContainsTerms: ['email', 'IS', 'NULL'],
            expectedRowCount: 2,
          },
          successMessage: 'Spot on! You detected missing records safely using IS NULL.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 3 HOMEWORK / INDEPENDENT CHALLENGES
  // ===========================================================================
  challenge: {
    id: 'day-03-homework',
    title: 'Day 3 — Specialized Filtering (Homework)',
    scenario: 'Apply specialized filtering techniques across our production inventory and customer tables:',
    tasks: [
      {
        id: 'day03-hw-1',
        title: 'Task 1: Mid-tier products ($25 to $100)',
        description: 'Find products priced between $25.00 and $100.00 using BETWEEN.',
        instructions: [
          'Select `name` and `price` from `products`.',
          'Filter where `price BETWEEN 25.00 AND 100.00`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Products priced between $25 and $100 (BETWEEN)\n',
        solutionSql: 'SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;',
        solutionExplanation: 'Retrieves all 8 products in the $25 to $100 price range.',
        hints: [
          { level: 1, text: 'Use `WHERE price BETWEEN 25.00 AND 100.00;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price'],
          requireWhere: true,
          whereContainsTerms: ['BETWEEN', '25', '100'],
          expectedRowCount: 8,
        },
        successMessage: 'Task 1 completed! Mid-tier catalog products retrieved.',
      },
      {
        id: 'day03-hw-2',
        title: 'Task 2: Target European & US Customers (IN)',
        description: 'Find customers located in London, Boston, or Dublin using IN.',
        instructions: [
          'Select `name`, `email`, and `city` from `customers`.',
          "Filter where `city IN ('London', 'Boston', 'Dublin')`.",
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Task 2: Customers in London, Boston, or Dublin (IN)\n',
        solutionSql: "SELECT name, email, city FROM customers WHERE city IN ('London', 'Boston', 'Dublin');",
        solutionExplanation: 'Returns the 5 customers in London, Boston, and Dublin.',
        hints: [
          { level: 1, text: "Write `WHERE city IN ('London', 'Boston', 'Dublin');`" },
        ],
        validation: {
          targetTable: 'customers',
          requiredColumns: ['name', 'email', 'city'],
          requireWhere: true,
          whereContainsTerms: ['city', 'IN', 'London', 'Boston', 'Dublin'],
          expectedRowCount: 5,
        },
        successMessage: 'Task 2 completed! Multi-city customer audience selected.',
      },
      {
        id: 'day03-hw-3',
        title: 'Task 3: Steel Products Search (LIKE)',
        description: 'Find all products whose name starts with "Steel" using the LIKE operator.',
        instructions: [
          'Select `name`, `price`, and `quantity_in_stock` from `products`.',
          "Filter where `name LIKE 'Steel%'`.",
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 3: Products starting with Steel (LIKE)\n',
        solutionSql: "SELECT name, price, quantity_in_stock FROM products WHERE name LIKE 'Steel%';",
        solutionExplanation: "Matches Steel Monitor Arm Dual, Steel Cable Management Tray, and Steel Frame Footrest (3 products).",
        hints: [
          { level: 1, text: "Use `WHERE name LIKE 'Steel%';`" },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price', 'quantity_in_stock'],
          requireWhere: true,
          whereContainsTerms: ['LIKE', 'Steel%'],
          expectedRowCount: 3,
        },
        successMessage: 'Task 3 completed! Steel product family retrieved.',
      },
      {
        id: 'day03-hw-4',
        title: 'Task 4: Suppliers with Missing Emails (IS NULL)',
        description: 'Find suppliers that do not have a contact email recorded.',
        instructions: [
          'Select `supplier_id`, `name`, and `contact_email` from `suppliers`.',
          'Filter where `contact_email IS NULL`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'suppliers',
        initialSql: '-- Task 4: Suppliers missing contact email (IS NULL)\n',
        solutionSql: 'SELECT supplier_id, name, contact_email FROM suppliers WHERE contact_email IS NULL;',
        solutionExplanation: 'Identifies GreenPack Logistics (supplier #9).',
        hints: [
          { level: 1, text: 'Use `WHERE contact_email IS NULL;`' },
        ],
        validation: {
          targetTable: 'suppliers',
          requiredColumns: ['supplier_id', 'name', 'contact_email'],
          requireWhere: true,
          whereContainsTerms: ['contact_email', 'IS', 'NULL'],
          expectedRowCount: 1,
        },
        successMessage: 'Task 4 completed! Supplier missing contact details flagged.',
      },
      {
        id: 'day03-hw-5',
        title: 'Task 5: Compound Filter with Parentheses',
        description: 'Find products in categories 1 or 5 priced under $100 that are currently in stock (quantity_in_stock > 0).',
        instructions: [
          'Select `name`, `category_id`, `price`, and `quantity_in_stock` from `products`.',
          'Filter where `(category_id = 1 OR category_id = 5) AND price < 100 AND quantity_in_stock > 0`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 5: In-stock Electronics or Audio under $100\n',
        solutionSql: 'SELECT name, category_id, price, quantity_in_stock FROM products WHERE (category_id = 1 OR category_id = 5) AND price < 100 AND quantity_in_stock > 0;',
        solutionExplanation: 'Returns Mechanical Keyboard ($89.99) and Webcam 1080p Pro ($58.00).',
        hints: [
          { level: 1, text: 'Wrap categories in parentheses: `(category_id = 1 OR category_id = 5) AND price < 100 AND quantity_in_stock > 0;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'category_id', 'price', 'quantity_in_stock'],
          requireWhere: true,
          whereContainsTerms: ['category_id', '1', 'OR', '5', 'AND', 'price', '100', 'quantity_in_stock'],
          expectedRowCount: 2,
        },
        successMessage: 'Task 5 completed! You mastered multi-clause compound query filters.',
      },
    ],
  },
};
