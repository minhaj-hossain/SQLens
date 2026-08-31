import { ModuleData } from '../../types/curriculum';

export const Day_27_MODULE: ModuleData = {
  id: 'day-27',
  slug: 'ddl-schema-design',
  day: 27,
  title: 'Day 27 - Blueprint Tables and Schema: DDL Foundations',
  shortTitle: 'DDL I (Creating Tables)',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Learn Data Definition Language: create table structures with CREATE TABLE, choose the right column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN), and give every row a durable identity with PRIMARY KEY and AUTO_INCREMENT.',
  estimatedMinutes: 50,
  completionLearnings: [
    'Create structured tables using CREATE TABLE with column definitions',
    'Choose appropriate column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)',
    'Enforce row identity with PRIMARY KEY and AUTO_INCREMENT for surrogate keys',
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
  // DAY 27 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
  // ===========================================================================
  challenge: {
    id: 'day-27-homework',
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
          requireExactResult: true,
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
