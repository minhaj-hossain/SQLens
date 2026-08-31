import { ModuleData } from '../../types/curriculum';

export const Day_25_MODULE: ModuleData = {
  id: 'day-25',
  slug: 'dml-insert-update-delete',
  day: 25,
  title: 'Day 25 - Modify Data Safely: INSERT, UPDATE, DELETE',
  shortTitle: 'DML (Data Modification)',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Learn the critical discipline of safe data modification. Master INSERT to add rows, UPDATE to change values, and DELETE to remove records - and why the missing WHERE clause is the costliest mistake in databases.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Insert single and multi-row records using INSERT INTO',
    'Safely modify records using UPDATE ... SET ... WHERE',
    'Safely delete records using DELETE FROM ... WHERE',
    'Understand and prevent catastrophic unbounded table mutations',
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
