import { ModuleData } from '../../types/curriculum';

export const DAY_02_MODULE: ModuleData = {
  id: 'day-02',
  slug: 'core-filtering',
  day: 2,
  title: 'Day 2 — WHERE & Core Filtering',
  shortTitle: 'WHERE & Core Filtering',
  type: 'module',
  milestoneId: 'milestone-1',
  description: 'Master single-condition row filtering using WHERE, numeric equality & inequality (=, !=, <>), numeric range comparisons (<, >, <=, >=), and string filtering with single quotes.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Understand how WHERE filters rows before SELECT picks columns',
    'Test exact numeric equality and inequality using = and !=',
    'Compare numeric values against thresholds using <, >, <=, and >=',
    'Filter text and strings safely using single quotes (\'value\')',
    'Understand why unquoted text causes "Unknown column" errors in SQL',
  ],
  concepts: [
    // =========================================================================
    // CONCEPT 1: The WHERE Clause & Numeric Equality (=, !=, <>)
    // =========================================================================
    {
      id: 'where-numeric-equality',
      order: 1,
      title: '1. The WHERE Clause & Exact Equality',
      shortDescription: 'How SQL filters specific rows based on exact numeric values.',
      theory: {
        summary: 'Imagine we have our database table called:',
        introTable: {
          tableName: 'students',
          description: 'Original table stored in the database (5 rows × 5 columns)',
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
          'In Day 1, we learned that `SELECT` controls which **columns** appear in the output.',
          'Now, what if we do not want every single student? What if we only want students whose age is **exactly 21**? That is what **WHERE** is for.',
          '### 1. The Three Questions of SQL\nWhen writing a filtered query:\n\n```sql\nSELECT name, age\nFROM students\nWHERE age = 21;\n```\n\nYou are answering three fundamental questions in sequence:',
          'QUESTION_BLOCK::FROM::Where should I get the data from?',
          'QUESTION_BLOCK::WHERE::Which rows meet my criteria?',
          'QUESTION_BLOCK::SELECT::What columns do I want in the final output?',
          '### 2. Exact Equality and Inequality\nWhen checking exact numbers in SQL, we write the numbers directly without quotes:',
          '| Operator | Meaning | Example | Matching Students |\n|---|---|---|---|\n| `=` | Equal to | `age = 21` | Rahim (21), Tanvir (21) |\n| `!=` or `<>` | Not equal to | `age != 21` | Karim (22), Ayesha (20), Sumaiya (23) |\n| `=` | Primary Key lookup | `id = 3` | Ayesha (exact 1 row) |',
          '### Notice: The Golden Rule of Row Filtering\n**SELECT controls columns. WHERE controls rows.**\n\nSQL first evaluates the `WHERE` condition row-by-row against the table to filter which records survive, and only then extracts the specific columns requested in `SELECT`.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students',
            sqlSnippet: 'FROM students',
            explanation: 'SQL visits the students table containing all 5 rows.',
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
            stepTitle: 'Step 2: WHERE age = 21 (Row-by-Row Evaluation)',
            sqlSnippet: 'WHERE age = 21',
            explanation: 'Row 1 (21 = 21): TRUE ✅\nRow 2 (22 = 21): FALSE ❌\nRow 3 (20 = 21): FALSE ❌\nRow 4 (23 = 21): FALSE ❌\nRow 5 (21 = 21): TRUE ✅',
            tableData: {
              tableName: 'Surviving Rows',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [5, 'Tanvir', 21, 'CSE', 'Rajshahi'],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: SELECT name, age',
            sqlSnippet: 'SELECT name, age',
            explanation: 'Only the requested columns (name and age) are extracted from the surviving rows:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'age'],
              highlightedColumns: ['name', 'age'],
              rows: [
                ['Rahim', 21],
                ['Tanvir', 21],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Basic WHERE equality syntax',
            sql: 'SELECT column1, column2\nFROM table_name\nWHERE numeric_column = value;',
            description: 'Only rows where numeric_column equals the value are returned.',
          },
          {
            title: 'Inequality filtering',
            sql: 'SELECT name, age\nFROM students\nWHERE age != 21;',
            description: 'Returns all students whose age is NOT 21.',
          },
        ],
        keyTakeaway: 'WHERE filters rows before SELECT chooses columns. Numbers are written directly without quotes.',
        exampleQuery: 'SELECT name, age FROM students WHERE age = 21;',
        exampleQueryExplanation: 'From students, keeps rows where age is exactly 21, displaying name and age.',
        liveDemoSql: 'SELECT name, age FROM students WHERE age = 21;',
        liveDemoNotes: 'Executes row filtering: Rahim and Tanvir pass the age = 21 test.',
        mcqs: [
          {
            question: 'What does the WHERE clause do in a SQL query?\nSELECT name FROM students WHERE age = 21;',
            options: [
              'A. Selects which columns to show in the output',
              'B. Evaluates each row and keeps only those where age is 21',
              'C. Changes the student age to 21 in the database',
              'D. Sorts the table by age',
            ],
            correctIndex: 1,
            explanation: 'WHERE acts as a row filter: it evaluates each row and retains only rows where the condition is TRUE.',
          },
          {
            question: 'How many rows will this query return?\nSELECT * FROM students WHERE id = 3;',
            options: [
              'A. 5 rows (all students)',
              'B. 3 rows',
              'C. Exactly 1 row (Ayesha)',
              'D. 0 rows',
            ],
            correctIndex: 2,
            explanation: 'Since id is a unique identifier, id = 3 matches exactly one record (Ayesha).',
          },
        ],
      },
      masteryPoints: [
        'Understand that WHERE filters rows while SELECT picks columns',
        'Use = for exact equality and != for inequality',
        'Remember that numeric values do not require quotes in SQL',
      ],
      tasks: [
        {
          id: 'day02-c1-t1',
          title: 'Task 1: Students aged exactly 22',
          description: 'Show the name and age of students whose age is exactly 22.',
          instructions: [
            'Write a query to select `name` and `age` from the `students` table.',
            'Filter rows where `age = 22`.',
            'End your query with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, age FROM students WHERE age = 22;',
          solutionExplanation: '`WHERE age = 22` isolates Karim (the only student who is 22).',
          hints: [
            { level: 1, text: 'Add `22` after `age =` in the WHERE clause.' },
            { level: 2, text: 'Write `SELECT name, age FROM students WHERE age = 22;` and click Submit.' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'age'],
            forbiddenColumns: ['id', 'department', 'city'],
            requireWhere: true,
            whereContainsTerms: ['age', '=', '22'],
            expectedRowCount: 1,
          },
          successMessage: 'Great job! You filtered rows by exact numeric equality.',
        },
        {
          id: 'day02-c1-t2',
          title: 'Task 2: Lookup Product by ID',
          description: 'Lookup product details for product_id 4 from the products table.',
          instructions: [
            'Query the `products` table.',
            'Select `product_id`, `name`, and `price`.',
            'Filter where `product_id = 4`.',
            'End with a semicolon (;).',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Lookup product #4\n',
          solutionSql: 'SELECT product_id, name, price FROM products WHERE product_id = 4;',
          solutionExplanation: '`SELECT product_id, name, price FROM products WHERE product_id = 4;` retrieves the Ergonomic Desk Chair record.',
          hints: [
            { level: 1, text: 'Start with `SELECT product_id, name, price FROM products WHERE product_id = 4;`' },
          ],
          validation: {
            targetTable: 'products',
            requiredColumns: ['product_id', 'name', 'price'],
            requireWhere: true,
            whereContainsTerms: ['product_id', '=', '4'],
            expectedRowCount: 1,
          },
          successMessage: 'Well done! You performed an exact numeric lookup on the products table.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 2: Numeric Range & Threshold Comparisons (<, >, <=, >=)
    // =========================================================================
    {
      id: 'where-numeric-ranges',
      order: 2,
      title: '2. Numeric Range & Threshold Comparisons',
      shortDescription: 'How to filter rows using comparison operators (<, >, <=, >=).',
      theory: {
        summary: 'Now let\'s explore filtering data with comparison thresholds:',
        introTable: {
          tableName: 'products',
          description: 'Sample products from the inventory database (5 items)',
          columns: ['product_id', 'name', 'price', 'quantity_in_stock', 'reorder_level'],
          rows: [
            [1, 'Wireless Mouse', 25.00, 42, 10],
            [2, 'Mechanical Keyboard', 89.99, 15, 5],
            [3, 'USB-C Cable (2m)', 12.50, 120, 20],
            [4, 'Ergonomic Desk Chair', 249.00, 8, 5],
            [5, 'Noise-Cancelling Headphones', 179.50, 22, 8],
          ],
        },
        explanation: [
          'In many scenarios, we do not want exact numbers, but rather thresholds: premium items over $100, budget items under $30, or low-stock items.',
          '### 1. The Comparison Operators\nSQL provides standard mathematical comparison operators:',
          '| Operator | Meaning | Example | Result on Products Table |\n|---|---|---|---|\n| `<` | Strictly less than | `price < 30.00` | Wireless Mouse ($25), USB-C Cable ($12.50) |\n| `>` | Strictly greater than | `price > 100.00` | Ergonomic Desk Chair ($249), Headphones ($179.50) |\n| `<=` | Less than or equal to | `price <= 25.00` | Includes Wireless Mouse ($25.00) and Cable ($12.50) |\n| `>=` | Greater than or equal to | `quantity_in_stock >= 40` | USB-C Cable (120), Wireless Mouse (42) |',
          '### 2. Strict vs. Inclusive Comparisons\nNotice the difference between `<` (strict) and `<=` (inclusive):\n\n• `price < 25.00` excludes an item priced exactly at $25.00.\n• `price <= 25.00` includes an item priced exactly at $25.00.',
          '### Notice: Filtering by Another Column\nYou can also compare two numeric columns against each other!\n\nFor example, to find items needing restocking:\n```sql\nSELECT name, quantity_in_stock, reorder_level\nFROM products\nWHERE quantity_in_stock <= reorder_level;\n```',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products',
            sqlSnippet: 'FROM products',
            explanation: 'SQL visits the products table with all rows.',
            tableData: {
              tableName: 'products',
              columns: ['product_id', 'name', 'price', 'quantity_in_stock'],
              rows: [
                [1, 'Wireless Mouse', 25.00, 42],
                [2, 'Mechanical Keyboard', 89.99, 15],
                [3, 'USB-C Cable (2m)', 12.50, 120],
                [4, 'Ergonomic Desk Chair', 249.00, 8],
                [5, 'Noise-Cancelling Headphones', 179.50, 22],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: WHERE price >= 100.00 (Threshold Check)',
            sqlSnippet: 'WHERE price >= 100.00',
            explanation: 'Wireless Mouse ($25.00 >= 100.00): FALSE ❌\nMechanical Keyboard ($89.99 >= 100.00): FALSE ❌\nUSB-C Cable ($12.50 >= 100.00): FALSE ❌\nErgonomic Desk Chair ($249.00 >= 100.00): TRUE ✅\nNoise-Cancelling Headphones ($179.50 >= 100.00): TRUE ✅',
            tableData: {
              tableName: 'Surviving Rows',
              columns: ['product_id', 'name', 'price', 'quantity_in_stock'],
              rows: [
                [4, 'Ergonomic Desk Chair', 249.00, 8],
                [5, 'Noise-Cancelling Headphones', 179.50, 22],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: SELECT name, price',
            sqlSnippet: 'SELECT name, price',
            explanation: 'Extracts the requested columns for premium products:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'price'],
              highlightedColumns: ['name', 'price'],
              rows: [
                ['Ergonomic Desk Chair', 249.00],
                ['Noise-Cancelling Headphones', 179.50],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Threshold comparison syntax',
            sql: 'SELECT name, price\nFROM products\nWHERE price >= 100.00;',
            description: 'Returns products with a price of $100.00 or higher.',
          },
          {
            title: 'Strict comparison syntax',
            sql: 'SELECT name, price\nFROM products\nWHERE price < 50.00;',
            description: 'Returns products costing strictly less than $50.00.',
          },
        ],
        keyTakeaway: 'Use <, >, <=, and >= to filter numeric columns against thresholds without quotes.',
        exampleQuery: 'SELECT name, price FROM products WHERE price >= 100.00;',
        exampleQueryExplanation: 'Filters for products priced at $100.00 or higher.',
        liveDemoSql: 'SELECT name, price, quantity_in_stock FROM products WHERE price >= 100.00;',
        liveDemoNotes: 'Displays premium items in the catalog.',
        mcqs: [
          {
            question: 'How many rows will this query return on the students table?\nSELECT * FROM students WHERE age > 21;',
            options: [
              'A. 5 rows (all students)',
              'B. 2 rows (Karim: 22, Sumaiya: 23)',
              'C. 3 rows (Rahim: 21, Karim: 22, Sumaiya: 23)',
              'D. 0 rows',
            ],
            correctIndex: 1,
            explanation: 'Strictly greater than (>) 21 excludes age 21. Only Karim (22) and Sumaiya (23) pass the filter.',
          },
          {
            question: 'Which query finds all products priced at $50.00 or less?',
            options: [
              'A. SELECT * FROM products WHERE price < 50.00;',
              'B. SELECT * FROM products WHERE price <= 50.00;',
              'C. SELECT * FROM products WHERE price = 50.00;',
              'D. SELECT * FROM products WHERE price > 50.00;',
            ],
            correctIndex: 1,
            explanation: '"$50.00 or less" is inclusive, requiring the less-than-or-equal operator (<=).',
          },
        ],
      },
      masteryPoints: [
        'Use < and > for strict numeric boundaries',
        'Use <= and >= for inclusive numeric boundaries',
        'Compare columns against numbers or other columns',
      ],
      tasks: [
        {
          id: 'day02-c2-t1',
          title: 'Task 1: Premium Products ($50 or more)',
          description: 'Show the name and price of products priced at $50.00 or more from the products table.',
          instructions: [
            'Select `name` and `price` from `products`.',
            'Filter rows where `price >= 50.00`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: 'SELECT name, price FROM products WHERE price >= 50.00;',
          solutionExplanation: '`WHERE price >= 50.00` extracts all items costing $50 or higher (5 items in full inventory).',
          hints: [
            { level: 1, text: 'Add `50.00` after `price >=`.' },
            { level: 2, text: '`SELECT name, price FROM products WHERE price >= 50.00;`' },
          ],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'price'],
            requireWhere: true,
            whereContainsTerms: ['price', '>=', '50'],
            expectedRowCount: 5,
          },
          successMessage: 'Great job! You filtered items using an inclusive threshold.',
        },
        {
          id: 'day02-c2-t2',
          title: 'Task 2: Younger Students (Under 22)',
          description: 'Show the name and age of students who are strictly younger than 22 years old.',
          instructions: [
            'Query the `students` table.',
            'Select `name` and `age`.',
            'Filter where `age < 22`.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Show students younger than 22\n',
          solutionSql: 'SELECT name, age FROM students WHERE age < 22;',
          solutionExplanation: '`WHERE age < 22` returns Rahim (21), Ayesha (20), and Tanvir (21).',
          hints: [
            { level: 1, text: 'Write `SELECT name, age FROM students WHERE age < 22;`' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'age'],
            requireWhere: true,
            whereContainsTerms: ['age', '<', '22'],
            expectedRowCount: 3,
          },
          successMessage: 'Perfect! You applied a strict less-than comparison.',
        },
      ],
    },

    // =========================================================================
    // CONCEPT 3: Filtering Text and Strings with Single Quotes
    // =========================================================================
    {
      id: 'where-text-strings',
      order: 3,
      title: '3. Filtering Text with Single Quotes',
      shortDescription: 'How to filter rows by string and text values safely.',
      theory: {
        summary: 'Now let\'s look at filtering text columns like city or department:',
        introTable: {
          tableName: 'students',
          description: 'Full table in database (5 students across Dhaka, Gazipur, Chattogram, Rajshahi)',
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
          'In SQL, numbers are written directly, but **text values (strings) MUST ALWAYS be enclosed in single quotes (\'...\')**.',
          '### 1. Filtering by Text Values\nFor example, to find all students located in Dhaka:\n\n```sql\nSELECT name, city\nFROM students\nWHERE city = \'Dhaka\';\n```',
          '### 2. Column Names vs. String Literals\nIf you write `WHERE city = Dhaka` without quotes, SQL assumes `Dhaka` is the name of another **column**!\n\nBecause no column named `Dhaka` exists in `students`, SQL will stop with an error (`Unknown column \'Dhaka\'`).',
          '| Identifier Type | Quoting Rule | Example | Status |\n|---|---|---|---|\n| Column Name | **Never quoted** | `name`, `city`, `age` | ✅ Valid column reference |\n| String Value | **Always single quotes** | `\'Dhaka\'`, `\'CSE\'`, `\'Electronics\'` | ✅ Valid text literal |\n| Number Value | **Never quoted** | `21`, `50.00`, `100` | ✅ Valid numeric literal |',
          '### 3. Text Inequality (!= or <>)\nTo find students who are NOT in the CSE department:\n\n```sql\nSELECT name, department\nFROM students\nWHERE department != \'CSE\';\n```\nThis retains Karim (EEE) and Sumaiya (BBA), excluding all CSE majors.',
          '### Notice: The Golden Rule for Text\nAlways use **single quotes** (`\'...\'`) for text literals. Double quotes (`"..."`) or unquoted text will cause errors in standard SQL queries.',
        ],
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM students',
            sqlSnippet: 'FROM students',
            explanation: 'SQL loads the entire students table.',
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
            stepTitle: "Step 2: WHERE city = 'Dhaka'",
            sqlSnippet: "WHERE city = 'Dhaka'",
            explanation: "Rahim ('Dhaka' = 'Dhaka'): TRUE ✅\nKarim ('Gazipur' = 'Dhaka'): FALSE ❌\nAyesha ('Dhaka' = 'Dhaka'): TRUE ✅\nSumaiya ('Chattogram' = 'Dhaka'): FALSE ❌\nTanvir ('Rajshahi' = 'Dhaka'): FALSE ❌",
            tableData: {
              tableName: 'Filtered Rows',
              columns: ['id', 'name', 'age', 'department', 'city'],
              rows: [
                [1, 'Rahim', 21, 'CSE', 'Dhaka'],
                [3, 'Ayesha', 20, 'CSE', 'Dhaka'],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: SELECT name, city',
            sqlSnippet: 'SELECT name, city',
            explanation: 'Result containing only the name and city columns of Dhaka students:',
            tableData: {
              tableName: 'Result',
              columns: ['name', 'city'],
              highlightedColumns: ['name', 'city'],
              rows: [
                ['Rahim', 'Dhaka'],
                ['Ayesha', 'Dhaka'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Exact string matching',
            sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka';",
            description: "Matches rows where the city column exactly equals 'Dhaka'.",
          },
          {
            title: 'Excluding a string value with !=',
            sql: "SELECT name, department\nFROM students\nWHERE department != 'CSE';",
            description: 'Returns rows where department is not CSE.',
          },
        ],
        keyTakeaway: "Always enclose string literals in single quotes ('...'). Never quote column names.",
        exampleQuery: "SELECT name, city FROM students WHERE city = 'Dhaka';",
        exampleQueryExplanation: "Retrieves only students who live in Dhaka.",
        liveDemoSql: "SELECT name, department, city FROM students WHERE city = 'Dhaka';",
        liveDemoNotes: "Returns Rahim and Ayesha, both residing in Dhaka.",
        mcqs: [
          {
            question: "Why does `SELECT * FROM students WHERE city = Dhaka;` cause an error?",
            options: [
              "A. Because WHERE cannot be used on cities",
              "B. Because Dhaka lacks single quotes, so SQL looks for a column named Dhaka",
              "C. Because SELECT * is not allowed with WHERE",
              "D. Because SQL requires double quotes around table names",
            ],
            correctIndex: 1,
            explanation: "Without single quotes, SQL interprets Dhaka as a column identifier rather than a string literal.",
          },
          {
            question: "Which query correctly finds all students NOT in the CSE department?",
            options: [
              "A. SELECT name FROM students WHERE department = 'NOT CSE';",
              "B. SELECT name FROM students WHERE department != 'CSE';",
              "C. SELECT name FROM students WHERE department IS CSE;",
              "D. SELECT name FROM students DROP 'CSE';",
            ],
            correctIndex: 1,
            explanation: "The `!=` (or `<>`) operator checks for inequality against the string literal 'CSE'.",
          },
        ],
      },
      masteryPoints: [
        "Wrap text literals in single quotes ('...')",
        "Distinguish column identifiers from string literals",
        "Use != or <> to exclude text matches",
      ],
      tasks: [
        {
          id: 'day02-c3-t1',
          title: 'Task 1: Dhaka students only',
          description: 'Show the name and city of students who live in Dhaka.',
          instructions: [
            'Select `name` and `city` from `students`.',
            "Filter for rows where `city = 'Dhaka'`.",
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Write your SQL query here\n',
          solutionSql: "SELECT name, city FROM students WHERE city = 'Dhaka';",
          solutionExplanation: "`WHERE city = 'Dhaka'` retrieves all students whose city is Dhaka (Rahim and Ayesha).",
          hints: [
            { level: 1, text: "Complete the single quote: `WHERE city = 'Dhaka';`" },
            { level: 2, text: "`SELECT name, city FROM students WHERE city = 'Dhaka';`" },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'city'],
            requireWhere: true,
            whereContainsTerms: ['city', '=', 'Dhaka'],
            expectedRowCount: 2,
          },
          successMessage: 'Great job! You filtered strings using single quotes.',
        },
        {
          id: 'day02-c3-t2',
          title: 'Task 2: Find Chittagong customers',
          description: 'The sales team needs a list of all customers located in Chittagong.',
          instructions: [
            'Query the `customers` table.',
            'Select `name`, `email`, and `city`.',
            "Filter for customers where `city = 'Chittagong'`.",
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Find all customers in Chittagong\n',
          solutionSql: "SELECT name, email, city FROM customers WHERE city = 'Chittagong';",
          solutionExplanation: "`WHERE city = 'Chittagong'` returns all Chittagong customer records.",
          hints: [
            { level: 1, text: "`SELECT name, email, city FROM customers WHERE city = 'Chittagong';`" },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'email', 'city'],
            requireWhere: true,
            whereContainsTerms: ['city', '=', 'Chittagong'],
            expectedRowCount: 3,
          },
          successMessage: 'Spot on! All Chittagong customer records retrieved.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 2 HOMEWORK / INDEPENDENT CHALLENGES
  // ===========================================================================
  challenge: {
    id: 'day-02-homework',
    title: 'Day 2 — Core Filtering (Homework Challenges)',
    scenario: 'In Workbench, with inventory_system selected, practice row filtering queries against our production tables:',
    tasks: [
      {
        id: 'day02-hw-1',
        title: 'Task 1: Products priced under $50',
        description: 'Find all products priced strictly under $50.00.',
        instructions: [
          'Select `name` and `price` from `products` where `price < 50`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Products priced under $50\n',
        solutionSql: 'SELECT name, price FROM products WHERE price < 50;',
        solutionExplanation: '`WHERE price < 50` selects all products priced strictly under $50.',
        hints: [
          { level: 1, text: 'Use `SELECT name, price FROM products WHERE price < 50;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price'],
          requireWhere: true,
          whereContainsTerms: ['price', '<', '50'],
          expectedRowCount: 23,
        },
        successMessage: 'Task 1 completed! Products under $50 retrieved.',
      },
      {
        id: 'day02-hw-2',
        title: 'Task 2: High-stock products (Stock > 20)',
        description: 'Find all products with quantity_in_stock greater than 20.',
        instructions: [
          'Select `name` and `quantity_in_stock` from `products` where `quantity_in_stock > 20`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 2: Products with quantity_in_stock greater than 20\n',
        solutionSql: 'SELECT name, quantity_in_stock FROM products WHERE quantity_in_stock > 20;',
        solutionExplanation: '`WHERE quantity_in_stock > 20` retrieves well-stocked items.',
        hints: [
          { level: 1, text: 'Use `SELECT name, quantity_in_stock FROM products WHERE quantity_in_stock > 20;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'quantity_in_stock'],
          requireWhere: true,
          whereContainsTerms: ['quantity_in_stock', '>', '20'],
          expectedRowCount: 8,
        },
        successMessage: 'Task 2 completed! Well-stocked items found.',
      },
      {
        id: 'day02-hw-3',
        title: 'Task 3: Products that are completely out of stock',
        description: 'Find all products that are completely out of stock (`quantity_in_stock = 0`).',
        instructions: [
          'Select `name`, `price`, and `quantity_in_stock` from `products` where `quantity_in_stock = 0`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 3: Products that are completely out of stock\n',
        solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock = 0;',
        solutionExplanation: '`WHERE quantity_in_stock = 0` identifies products with zero inventory.',
        hints: [
          { level: 1, text: 'Use `SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock = 0;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price', 'quantity_in_stock'],
          requireWhere: true,
          whereContainsTerms: ['quantity_in_stock', '=', '0'],
          expectedRowCount: 3,
        },
        successMessage: 'Task 3 completed! Out-of-stock items flagged.',
      },
      {
        id: 'day02-hw-4',
        title: 'Task 4: Find all customers in Chittagong',
        description: 'Retrieve name, email, and city of all customers residing in Chittagong.',
        instructions: [
          'Select `name`, `email`, and `city` from `customers`.',
          "Filter where `city = 'Chittagong'`.",
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Task 4: Customers in Chittagong\n',
        solutionSql: "SELECT name, email, city FROM customers WHERE city = 'Chittagong';",
        solutionExplanation: "`WHERE city = 'Chittagong'` selects all Chittagong customers.",
        hints: [
          { level: 1, text: "Write `SELECT name, email, city FROM customers WHERE city = 'Chittagong';`" },
        ],
        validation: {
          targetTable: 'customers',
          requiredColumns: ['name', 'email', 'city'],
          requireWhere: true,
          whereContainsTerms: ['city', '=', 'Chittagong'],
          expectedRowCount: 3,
        },
        successMessage: 'Task 4 completed! Chittagong customer records retrieved.',
      },
      {
        id: 'day02-hw-5',
        title: 'Task 5: Premium products ($50 or more)',
        description: 'Find all premium items in the catalog priced at $50.00 or higher.',
        instructions: [
          'Select `name`, `price`, and `quantity_in_stock` from `products`.',
          'Filter where `price >= 50.00`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 5: Premium items ($50+)\n',
        solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE price >= 50.00;',
        solutionExplanation: '`WHERE price >= 50.00` finds the highest tier catalog items.',
        hints: [
          { level: 1, text: 'Use `WHERE price >= 50.00;`' },
        ],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price', 'quantity_in_stock'],
          requireWhere: true,
          whereContainsTerms: ['price', '>=', '50'],
          expectedRowCount: 5,
        },
        successMessage: 'Task 5 completed! Premium items identified.',
      },
    ],
  },
};
