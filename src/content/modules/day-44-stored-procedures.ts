import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 44 — Stored Procedures: Multi-Step Actions (id: day-44 — order 44)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   C1 What a stored procedure is — an action routine invoked with CALL
//   C2 Multi-statement procedures — bundling operational steps
//   C3 Managing and dropping procedures
// =============================================================================
export const Day_44_MODULE: ModuleData = {
  id: 'day-44',
  slug: 'stored-procedures',
  day: 44,
  title: 'Day 44 — Multi-Step Operations: Stored Procedures',
  shortTitle: 'Stored Procedures',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'When a real-world task requires multiple changes — like receiving inventory, updating stock levels, and recording a log — sending individual queries is slow and prone to partial updates. Stored procedures bundle these steps into a single routine executed with CALL.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Understand the difference between a function (computes a value) and a procedure (performs actions)',
    'Create stored procedures using CREATE PROCEDURE with parameters',
    'Execute stored procedures using CALL',
    'Bundle multi-statement updates into a single reusable database routine',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — What a stored procedure is
    // -------------------------------------------------------------------------
    {
      id: 'procedure-what-it-is',
      order: 1,
      title: 'What a Stored Procedure Is',
      shortDescription: 'A stored procedure performs a set of actions and is executed with CALL.',
      theory: {
        summary:
          'While a function computes and returns a single value, a stored procedure performs an action: updating tables, inserting records, or running administrative tasks. You execute a stored procedure using the CALL statement.',
        introTable: {
          tableName: 'products (sample)',
          description: 'Stock levels we want to update safely using procedures.',
          columns: ['product_id', 'name', 'quantity_in_stock'],
          rows: [
            [1, 'Wireless Mouse', 45],
            [2, 'Bluetooth Speaker', 12],
          ],
        },
        explanation: [
          'Think of the difference this way:',
          '- A **Function** is like a calculator: you give it numbers, it hands you back an answer (e.g. `fn_calculate_tax`).',
          '- A **Procedure** is like a script: you tell it "restock warehouse item #1 with 20 units", and it modifies the database tables for you.',
          'Syntax for a procedure in SQL:',
          '```sql\nCREATE PROCEDURE sp_restock_item(p_id INT, qty INT)\nBEGIN\n  UPDATE products\n  SET quantity_in_stock = quantity_in_stock + qty\n  WHERE product_id = p_id;\nEND;\n```',
          'QUESTION_BLOCK::BEFORE::How do you run a stored procedure once it is created?',
          'QUESTION_BLOCK::AFTER::Using the CALL command: CALL sp_restock_item(1, 20);',
          'Using `sp_` as a prefix is a standard convention that tells developers this object is a stored procedure.',
        ],
        syntaxBlocks: [
          {
            title: 'CREATE PROCEDURE & CALL',
            sql: 'CREATE PROCEDURE procedure_name(param1 TYPE, param2 TYPE)\nBEGIN\n  UPDATE table_name SET col = col + param2 WHERE id = param1;\nEND;\n\n-- Running it:\nCALL procedure_name(arg1, arg2);',
            description:
              'CREATE PROCEDURE registers the routine. CALL executes it with your arguments.',
          },
        ],
        keyTakeaway:
          'Functions compute values; procedures perform actions. Execute procedures using CALL procedure_name(args).',
        exampleQuery:
          'CREATE PROCEDURE sp_restock(p_id INT, qty INT)\nBEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + qty WHERE product_id = p_id;\nEND;\nCALL sp_restock(1, 10);',
        exampleQueryExplanation:
          'Creates a restocking procedure and calls it to add 10 units to product #1.',
        liveDemoSql:
          'CREATE PROCEDURE sp_restock(p_id INT, qty INT)\nBEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + qty WHERE product_id = 1;\nEND;\nCALL sp_restock(1, 10);\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
        liveDemoNotes:
          'Notice how the quantity increases by 10 after the CALL executes.',
        mcqs: [
          {
            question: 'Which SQL keyword is used to execute a stored procedure?',
            options: ['A. RUN', 'B. EXECUTE FUNCTION', 'C. CALL', 'D. SELECT FROM'],
            correctIndex: 2,
            explanation: 'The CALL statement executes a stored procedure in SQL (e.g. CALL sp_name(arg);).',
          },
          {
            question: 'What is the main conceptual difference between a stored function and a stored procedure?',
            options: [
              'A. A function cannot accept parameters',
              'B. A function returns a single computed value, while a procedure performs actions like updates or inserts',
              'C. A procedure cannot modify data',
              'D. A procedure can only run once',
            ],
            correctIndex: 1,
            explanation:
              'Functions compute and return a value (used in SELECT/WHERE). Procedures carry out actions and data changes.',
          },
        ],
        commonMistakes: [
          'Trying to use SELECT * FROM procedure_name — procedures must be invoked with CALL, not SELECT.',
          'Forgetting to pass arguments when the procedure expects parameters.',
        ],
      },
      tasks: [
        {
          id: 'day44-t1',
          title: 'Create and Call a Restocking Procedure',
          description:
            'Create a procedure named sp_restock_product(p_id INT, p_qty INT) that increases quantity_in_stock by p_qty for product_id = p_id. Then call it to add 15 units to product 1, and verify with a SELECT.',
          instructions: [
            'Create the procedure: CREATE PROCEDURE sp_restock_product(p_id INT, p_qty INT) BEGIN UPDATE products SET quantity_in_stock = quantity_in_stock + p_qty WHERE product_id = p_id; END;',
            'Call the procedure: CALL sp_restock_product(1, 15);',
            'Query products to verify: SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the procedure\n\n\n-- Step 2: Call the procedure\n\n\n-- Step 3: Verify the update\n',
          solutionSql:
            'CREATE PROCEDURE sp_restock_product(p_id INT, p_qty INT)\nBEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + p_qty WHERE product_id = p_id;\nEND;\nCALL sp_restock_product(1, 15);\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
          solutionExplanation:
            'The procedure wraps the UPDATE statement with parameters. The CALL command passes 1 and 15, adding 15 units of stock to product 1.',
          hints: [
            { level: 1, text: 'The body of the procedure is: UPDATE products SET quantity_in_stock = quantity_in_stock + p_qty WHERE product_id = p_id;' },
            { level: 2, text: 'Follow the CREATE PROCEDURE with CALL sp_restock_product(1, 15); and then SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;' },
          ],
          validation: {
            requireProcedure: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Stored procedure created and called successfully! Stock level was updated through the procedure.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Multi-statement procedures
    // -------------------------------------------------------------------------
    {
      id: 'procedure-multi-statement',
      order: 2,
      title: 'Packaging Multi-Step Operations',
      shortDescription: 'Bundle several related table updates into a single call.',
      theory: {
        summary:
          'In business applications, a single action often touches multiple tables. A stored procedure allows you to write all the steps in sequence between BEGIN and END so they can be triggered with one network call.',
        explanation: [
          'Consider updating order status: when an order is cancelled, you might want to:',
          '1. Set order status = "cancelled"',
          '2. Return items back to stock',
          'Instead of sending two separate SQL statements from your application, you package them together:',
          '```sql\nCREATE PROCEDURE sp_cancel_order(target_id INT)\nBEGIN\n  UPDATE orders SET status = "cancelled" WHERE order_id = target_id;\nEND;\n```',
          'QUESTION_BLOCK::BEFORE::Why is it safer to do multi-step operations in a procedure rather than individual application queries?',
          'QUESTION_BLOCK::AFTER::A procedure executes directly inside the database server in one round-trip, avoiding network lag and ensuring all steps follow consistent rules.',
        ],
        syntaxBlocks: [
          {
            title: 'Multi-step procedure',
            sql: 'CREATE PROCEDURE procedure_name(param1 TYPE)\nBEGIN\n  UPDATE table1 SET status = "processed" WHERE id = param1;\nEND;',
            description:
              'Procedures centralize business operations inside the database.',
          },
        ],
        keyTakeaway:
          'Procedures let you centralize complex business workflows in the database where data lives, reducing network round-trips.',
        exampleQuery:
          'CREATE PROCEDURE sp_mark_shipped(target_order_id INT)\nBEGIN\n  UPDATE orders SET status = "shipped" WHERE order_id = target_order_id;\nEND;\nCALL sp_mark_shipped(1);',
        exampleQueryExplanation:
          'Encapsulates the action of marking an order as shipped.',
        liveDemoSql:
          'CREATE PROCEDURE sp_mark_shipped(target_order_id INT)\nBEGIN\n  UPDATE orders SET status = "shipped" WHERE order_id = target_order_id;\nEND;\nCALL sp_mark_shipped(1);\nSELECT order_id, status FROM orders WHERE order_id = 1;',
        liveDemoNotes:
          'Notice order 1 now has status "shipped".',
        mcqs: [
          {
            question: 'Why do engineering teams prefer stored procedures for core business workflows?',
            options: [
              'A. Because procedures cannot make any changes to data',
              'B. They centralize operations in one place and avoid multiple round-trips from client apps',
              'C. They make tables smaller',
              'D. They eliminate the need for primary keys',
            ],
            correctIndex: 1,
            explanation:
              'Centralizing multi-step operations in procedures keeps business logic consistent and reduces network trips between application and database.',
          },
        ],
        commonMistakes: [
          'Hardcoding values inside the procedure instead of using parameters.',
        ],
      },
      tasks: [
        {
          id: 'day44-t2',
          title: 'Build an Order Status Procedure',
          description:
            'Create a procedure sp_update_order_status(target_order_id INT, new_status TEXT) that updates the status of the specified order. Then call it to set order_id = 2 to "completed". Verify with a SELECT on order 2.',
          instructions: [
            'Create sp_update_order_status(target_order_id INT, new_status TEXT) BEGIN UPDATE orders SET status = new_status WHERE order_id = target_order_id; END;',
            'CALL sp_update_order_status(2, "completed");',
            'SELECT order_id, customer_id, status FROM orders WHERE order_id = 2;',
          ],
          type: 'guided',
          primaryTable: 'orders',
          initialSql:
            '-- Step 1: Create procedure\n\n\n-- Step 2: Call procedure\n\n\n-- Step 3: Verify\n',
          solutionSql:
            'CREATE PROCEDURE sp_update_order_status(target_order_id INT, new_status TEXT)\nBEGIN\n  UPDATE orders SET status = new_status WHERE order_id = target_order_id;\nEND;\nCALL sp_update_order_status(2, "completed");\nSELECT order_id, customer_id, status FROM orders WHERE order_id = 2;',
          solutionExplanation:
            'The procedure accepts the target order ID and the new status string. The CALL command updates order 2 to "completed".',
          hints: [
            { level: 1, text: 'The UPDATE statement is: UPDATE orders SET status = new_status WHERE order_id = target_order_id;' },
            { level: 2, text: 'CALL sp_update_order_status(2, "completed"); then SELECT order_id, customer_id, status FROM orders WHERE order_id = 2;' },
          ],
          validation: {
            requireProcedure: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Order status updated cleanly via stored procedure!',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Managing and dropping procedures
    // -------------------------------------------------------------------------
    {
      id: 'procedure-cleanup',
      order: 3,
      title: 'Managing and Dropping Procedures',
      shortDescription: 'Use DROP PROCEDURE IF EXISTS to clean up routines.',
      theory: {
        summary:
          'When workflows are retired or procedures are replaced, use DROP PROCEDURE to remove them from the database schema.',
        explanation: [
          'To remove a procedure:',
          '```sql\nDROP PROCEDURE IF EXISTS sp_old_routine;\n```',
          'QUESTION_BLOCK::BEFORE::Does dropping a procedure undo any data changes the procedure previously made?',
          'QUESTION_BLOCK::AFTER::No. Dropping a procedure only removes the stored routine instructions. All previous changes made to real tables stay in place.',
        ],
        syntaxBlocks: [
          {
            title: 'DROP PROCEDURE',
            sql: 'DROP PROCEDURE IF EXISTS procedure_name;',
            description:
              'Removes the stored procedure from the schema.',
          },
        ],
        keyTakeaway:
          'DROP PROCEDURE IF EXISTS safely removes obsolete procedures without affecting existing data.',
        exampleQuery: 'DROP PROCEDURE IF EXISTS sp_temp_routine;',
        exampleQueryExplanation:
          'Safely drops sp_temp_routine.',
        liveDemoSql:
          'CREATE PROCEDURE sp_temp() BEGIN UPDATE products SET price = price WHERE product_id = 1; END;\nDROP PROCEDURE IF EXISTS sp_temp;',
        liveDemoNotes:
          'Creates and drops a temporary procedure cleanly.',
        mcqs: [
          {
            question: 'What happens to previously updated table rows when a procedure is dropped?',
            options: [
              'A. All previous changes are rolled back',
              'B. The table rows remain unchanged — only the procedure definition is removed',
              'C. The affected table is dropped',
              'D. The database enters read-only mode',
            ],
            correctIndex: 1,
            explanation:
              'Dropping a procedure removes the routine itself. The data already written to tables is durable and unaffected.',
          },
        ],
        commonMistakes: [
          'Leaving unused experimental procedures in production schemas.',
        ],
      },
      tasks: [
        {
          id: 'day44-t3',
          title: 'Create, Call, and Drop a Procedure',
          description:
            'Create a temporary procedure sp_discount_product(p_id INT, amt DECIMAL) that reduces a product price by amt. Call it on product_id = 2 with amt = 5.00, verify the change, then drop the procedure.',
          instructions: [
            'Create sp_discount_product(p_id INT, amt DECIMAL) BEGIN UPDATE products SET price = price - amt WHERE product_id = p_id; END;',
            'CALL sp_discount_product(2, 5.00);',
            'SELECT product_id, name, price FROM products WHERE product_id = 2;',
            'DROP PROCEDURE sp_discount_product;',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create procedure\n\n\n-- Step 2: Call procedure\n\n\n-- Step 3: Verify price\n\n\n-- Step 4: Drop procedure\n',
          solutionSql:
            'CREATE PROCEDURE sp_discount_product(p_id INT, amt DECIMAL)\nBEGIN\n  UPDATE products SET price = price - amt WHERE product_id = p_id;\nEND;\nCALL sp_discount_product(2, 5.00);\nSELECT product_id, name, price FROM products WHERE product_id = 2;\nDROP PROCEDURE sp_discount_product;',
          solutionExplanation:
            'The procedure executes the price reduction, you verify the result, and drop the procedure so the schema stays clean.',
          hints: [
            { level: 1, text: 'Write the 4 statements in order: CREATE PROCEDURE ..., CALL ..., SELECT ..., and DROP PROCEDURE sp_discount_product;' },
            { level: 2, text: 'UPDATE products SET price = price - amt WHERE product_id = p_id; inside the procedure body.' },
          ],
          validation: {
            requireProcedure: true,
            whereContainsTerms: ['DROP PROCEDURE'],
          },
          successMessage: 'Procedure created, executed, and cleanly removed!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day44-challenge',
    title: 'Automating Inventory Clearance',
    scenario:
      'The warehouse wants a routine to mark clearance prices: any product with over 100 items in stock should have its price reduced by 15% (price * 0.85). Package this operational rule into a stored procedure.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day44-ch1',
        title: 'Build the Inventory Clearance Procedure',
        description:
          'Create a procedure sp_apply_clearance() that updates products with quantity_in_stock > 100, setting price = price * 0.85. Call the procedure, then select product_id, name, price, and quantity_in_stock for products with quantity_in_stock > 100.',
        instructions: [
          'CREATE PROCEDURE sp_apply_clearance() BEGIN UPDATE products SET price = price * 0.85 WHERE quantity_in_stock > 100; END;',
          'CALL sp_apply_clearance();',
          'SELECT product_id, name, price, quantity_in_stock FROM products WHERE quantity_in_stock > 100;',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql:
          '-- Create and execute sp_apply_clearance\n',
        solutionSql:
          'CREATE PROCEDURE sp_apply_clearance()\nBEGIN\n  UPDATE products SET price = price * 0.85 WHERE quantity_in_stock > 100;\nEND;\nCALL sp_apply_clearance();\nSELECT product_id, name, price, quantity_in_stock FROM products WHERE quantity_in_stock > 100;',
        solutionExplanation:
          'The clearance procedure applies a 15% price cut to overstocked items. Calling it updates the matching products in one clean step.',
        hints: [
          { level: 1, text: 'The UPDATE statement is: UPDATE products SET price = price * 0.85 WHERE quantity_in_stock > 100;' },
          { level: 2, text: 'CALL sp_apply_clearance(); then write the SELECT with WHERE quantity_in_stock > 100;' },
        ],
        validation: {
          requireProcedure: true,
          requireWhere: true,
        },
        successMessage: 'Clearance procedure executed! High-inventory products were discounted automatically.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
