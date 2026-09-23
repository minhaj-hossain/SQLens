import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 46 — Triggers: Automatic Auditing (id: day-46 — order 46)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   C1 What a trigger is — automated actions on table changes
//   C2 Comparing OLD and NEW values in audit logs
//   C3 BEFORE vs AFTER timing and dropping triggers
// =============================================================================
export const Day_46_MODULE: ModuleData = {
  id: 'day-46',
  slug: 'triggers-audit',
  day: 46,
  title: 'Day 46 — Automatic Event Triggers: Audit Logging',
  shortTitle: 'Triggers & Auditing',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Relying on developers to remember to log changes in every application query leads to missing audit histories. Event triggers run automatically inside the database whenever rows are inserted, updated, or deleted, guaranteeing 100% complete audit trails.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Create database triggers that fire automatically on INSERT, UPDATE, or DELETE',
    'Use OLD and NEW pseudo-records to inspect previous and incoming column values',
    'Distinguish between BEFORE triggers (validation) and AFTER triggers (auditing)',
    'Remove triggers safely using DROP TRIGGER IF EXISTS',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — What a trigger is
    // -------------------------------------------------------------------------
    {
      id: 'trigger-what-it-is',
      order: 1,
      title: 'What an Event Trigger Is',
      shortDescription: 'A trigger is SQL code that executes automatically when table data changes.',
      theory: {
        summary:
          'Unlike procedures that you must manually run with CALL, a trigger runs automatically in the background whenever a specific event occurs — such as an INSERT, UPDATE, or DELETE on a table.',
        targetQuery: {
          sql: 'CREATE TRIGGER trg_on_product_update\nAFTER UPDATE ON products\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log (table_name, action) VALUES ("products", "UPDATE");\nEND;',
          explanation: 'Registers the automatic rule: every future UPDATE on products writes one audit row — no application code involved.',
          badge: "The statement we'll break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Choose the event',
            sqlSnippet: 'AFTER UPDATE ON products',
            explanation: 'The trigger fires after each UPDATE statement on products — never on SELECT, never on a schedule.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Per-row scope',
            sqlSnippet: 'FOR EACH ROW',
            explanation: 'A statement touching 5 rows fires the body 5 times — once per changed row.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: The automatic action',
            sqlSnippet: 'INSERT INTO audit_log (table_name, action)',
            clause: 'INSERT',
            explanation: 'The body runs inside the database itself, so the audit trail cannot be skipped by a forgetful developer.',
          },
        ],
        introTable: {
          tableName: 'products (sample)',
          description: 'Products table whose changes should be logged automatically.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [2, 'Bluetooth Speaker', 45.5],
          ],
        },
        explanation: [
          'In many companies, regulatory compliance requires tracking whenever sensitive data changes (like product prices or user roles). If you leave logging to application developers, someone will eventually forget.',
          'A database trigger eliminates this risk: the moment an UPDATE happens on the products table, the trigger immediately runs an INSERT into an audit table.',
          '```sql\nCREATE TRIGGER trg_log_update\nAFTER UPDATE ON products\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log (table_name, action)\n  VALUES ("products", "UPDATE");\nEND;\n```',
          'QUESTION_BLOCK::BEFORE::Does a developer need to write CALL trg_log_update() to make the trigger run?',
          'QUESTION_BLOCK::AFTER::No! Triggers run automatically whenever the specified event occurs. You never CALL a trigger.',
          'A common naming convention is to prefix triggers with `trg_` so their purpose is immediately obvious in schema listings.',
        ],
        syntaxBlocks: [
          {
            title: 'CREATE TRIGGER',
            sql: 'CREATE TRIGGER trigger_name\nAFTER INSERT | UPDATE | DELETE ON target_table\nFOR EACH ROW\nBEGIN\n  -- action to run automatically\nEND;',
            description:
              'Defines an automated hook that runs whenever data in target_table changes.',
          },
        ],
        keyTakeaway:
          'Triggers execute automatically on table mutations. They guarantee audit logs and validations are never skipped.',
        exampleQuery:
          'CREATE TRIGGER trg_on_product_update\nAFTER UPDATE ON products\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log (table_name, action) VALUES ("products", "UPDATE");\nEND;',
        exampleQueryExplanation:
          'Whenever any product row is updated, an entry is automatically written to audit_log.',
        liveDemoSql:
          'CREATE TABLE audit_log (log_id INT PRIMARY KEY AUTO_INCREMENT, note TEXT);\nCREATE TRIGGER trg_audit AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO audit_log (note) VALUES ("Product updated"); END;\nUPDATE products SET price = 16.99 WHERE product_id = 1;\nSELECT * FROM audit_log;',
        liveDemoNotes:
          'Updating the product automatically added a row to audit_log without any extra query.',
        mcqs: [
          {
            question: 'How is an event trigger executed?',
            options: [
              'A. By running CALL trigger_name;',
              'B. Automatically by the database when the specified table event (INSERT, UPDATE, DELETE) happens',
              'C. By selecting it in a WHERE clause',
              'D. In a scheduled cron job only',
            ],
            correctIndex: 1,
            explanation:
              'Triggers fire automatically when their triggering table event occurs.',
          },
        ],
        commonMistakes: [
          'Trying to execute a trigger with CALL — triggers fire automatically and cannot be called manually.',
        ],
      },
      tasks: [
        {
          id: 'day46-t1',
          title: 'Create an Automatic Update Trigger',
          description:
            'Create an audit table named product_audit with columns: audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, action TEXT. Then create an AFTER UPDATE trigger trg_audit_product on products that inserts into product_audit (product_id, action) VALUES (NEW.product_id, "PRICE_UPDATED"). Update product 1 to trigger it, and query product_audit.',
          instructions: [
            'Create table: CREATE TABLE product_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, action TEXT);',
            'Create trigger: CREATE TRIGGER trg_audit_product AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO product_audit (product_id, action) VALUES (NEW.product_id, "PRICE_UPDATED"); END;',
            'Update product: UPDATE products SET price = 19.99 WHERE product_id = 1;',
            'Query audit: SELECT product_id, action FROM product_audit;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create audit table\n\n\n-- Step 2: Create trigger\n\n\n-- Step 3: Trigger the update\n\n\n-- Step 4: Verify audit log\n',
          solutionSql:
            'CREATE TABLE product_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, action TEXT);\nCREATE TRIGGER trg_audit_product AFTER UPDATE ON products FOR EACH ROW\nBEGIN\n  INSERT INTO product_audit (product_id, action) VALUES (NEW.product_id, "PRICE_UPDATED");\nEND;\nUPDATE products SET price = 19.99 WHERE product_id = 1;\nSELECT product_id, action FROM product_audit;',
          solutionExplanation:
            'The trigger listens for UPDATE on products. When product 1 is updated, the trigger automatically inserts a record into product_audit.',
          hints: [
            { level: 1, text: 'Run the 4 statements in order: CREATE TABLE ..., CREATE TRIGGER ..., UPDATE ..., and SELECT ...;' },
            { level: 2, text: 'INSERT INTO product_audit (product_id, action) VALUES (NEW.product_id, "PRICE_UPDATED"); goes inside the trigger body.' },
          ],
          validation: {
            requiredColumns: ['audit_id', 'product_id', 'action'],
            requireTrigger: true,
            expectedRowCount: 1,
          },
          successMessage: 'The trigger executed automatically! The price change was recorded in your audit log.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Comparing OLD and NEW values
    // -------------------------------------------------------------------------
    {
      id: 'trigger-old-new',
      order: 2,
      title: 'Comparing OLD and NEW Values',
      shortDescription: 'Triggers can inspect both previous and incoming values of any column.',
      theory: {
        summary:
          'When updating a row, you often need to know both what the value WAS and what it BECAME. In an UPDATE trigger, SQL provides two special records: OLD (the row before the update) and NEW (the row after the update).',
        introTable: {
          tableName: 'price_log (written automatically by the trigger)',
          description: "Engine output after the live demo's UPDATE products SET price = 25.00 WHERE product_id = 1, plus a second price change on product 2 — OLD.price and NEW.price captured for each.",
          columns: ['product_id', 'old_price', 'new_price'],
          rows: [
            [1, 15.99, 25],
            [2, 45.5, 41],
          ],
        },
        explanation: [
          'The transition records give you complete visibility:',
          '- `OLD.column_name`: the value before the modification',
          '- `NEW.column_name`: the incoming value after the modification',
          'Example in a price change trigger:',
          '```sql\nCREATE TRIGGER trg_price_history\nAFTER UPDATE ON products\nFOR EACH ROW\nBEGIN\n  INSERT INTO price_history (product_id, old_price, new_price)\n  VALUES (OLD.product_id, OLD.price, NEW.price);\nEND;\n```',
          'QUESTION_BLOCK::BEFORE::In an INSERT trigger, does the OLD record exist?',
          'QUESTION_BLOCK::AFTER::No! For an INSERT, there was no previous row, so only NEW exists. Conversely, for a DELETE, there is no incoming row, so only OLD exists.',
        ],
        syntaxBlocks: [
          {
            title: 'OLD vs NEW in Triggers',
            sql: '-- INSERT trigger: NEW only\n-- DELETE trigger: OLD only\n-- UPDATE trigger: both OLD and NEW exist\nINSERT INTO history (old_val, new_val) VALUES (OLD.col, NEW.col);',
            description:
              'OLD holds pre-update values; NEW holds post-update values.',
          },
        ],
        keyTakeaway:
          'Use OLD.col and NEW.col in UPDATE triggers to capture historical changes and track exact before-and-after values.',
        exampleQuery:
          'INSERT INTO price_log (product_id, old_price, new_price) VALUES (OLD.product_id, OLD.price, NEW.price);',
        exampleQueryExplanation:
          'Stores the before-and-after price comparison in a historical log.',
        liveDemoSql:
          'CREATE TABLE price_log (log_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_price DECIMAL, new_price DECIMAL);\nCREATE TRIGGER trg_log AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO price_log (product_id, old_price, new_price) VALUES (OLD.product_id, OLD.price, NEW.price); END;\nUPDATE products SET price = 25.00 WHERE product_id = 1;\nSELECT product_id, old_price, new_price FROM price_log;',
        liveDemoNotes:
          'The log clearly records old_price (15.99) and new_price (25.00).',
        mcqs: [
          {
            question: 'In an UPDATE trigger, what does OLD.price refer to?',
            options: [
              'A. The price of the product from 10 years ago',
              'B. The price the row had immediately before this update occurred',
              'C. The price in the new update query',
              'D. The average price of all products',
            ],
            correctIndex: 1,
            explanation:
              'OLD represents the existing row data before the current statement made changes.',
          },
        ],
        commonMistakes: [
          'Trying to read OLD in an INSERT trigger — INSERT rows have no prior state.',
          'Trying to read NEW in a DELETE trigger — deleted rows have no new state.',
        ],
      },
      tasks: [
        {
          id: 'day46-t2',
          title: 'Track Before-and-After Prices in Audit Log',
          description:
            'Create a table price_history with columns: hist_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_price DECIMAL, new_price DECIMAL. Create an AFTER UPDATE trigger trg_track_price that logs OLD.product_id, OLD.price, and NEW.price. Update product 1 setting price = 29.99, then select product_id, old_price, and new_price from price_history.',
          instructions: [
            'Create table: CREATE TABLE price_history (hist_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_price DECIMAL, new_price DECIMAL);',
            'Create trigger: CREATE TRIGGER trg_track_price AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO price_history (product_id, old_price, new_price) VALUES (OLD.product_id, OLD.price, NEW.price); END;',
            'Update: UPDATE products SET price = 29.99 WHERE product_id = 1;',
            'Select: SELECT product_id, old_price, new_price FROM price_history WHERE product_id = 1;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create history table\n\n\n-- Step 2: Create trigger\n\n\n-- Step 3: Update price\n\n\n-- Step 4: Verify log\n',
          solutionSql:
            'CREATE TABLE price_history (hist_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_price DECIMAL, new_price DECIMAL);\nCREATE TRIGGER trg_track_price AFTER UPDATE ON products FOR EACH ROW\nBEGIN\n  INSERT INTO price_history (product_id, old_price, new_price) VALUES (OLD.product_id, OLD.price, NEW.price);\nEND;\nUPDATE products SET price = 29.99 WHERE product_id = 1;\nSELECT product_id, old_price, new_price FROM price_history WHERE product_id = 1;',
          solutionExplanation:
            'The trigger captures both OLD.price and NEW.price. When product 1 is updated to 29.99, the audit table records the original 15.99 and the new 29.99.',
          hints: [
            { level: 1, text: 'Use VALUES (OLD.product_id, OLD.price, NEW.price) in your INSERT.' },
            { level: 2, text: 'The SELECT at the end should pick product_id, old_price, new_price from price_history WHERE product_id = 1;' },
          ],
          validation: {
            requiredColumns: ['hist_id', 'product_id', 'old_price', 'new_price'],
            requireTrigger: true,
            expectedRowCount: 1,
          },
          successMessage: 'Before-and-after prices captured! Your audit trail preserves the exact price transition.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Dropping triggers
    // -------------------------------------------------------------------------
    {
      id: 'trigger-cleanup',
      order: 3,
      title: 'Managing and Dropping Triggers',
      shortDescription: 'Remove triggers cleanly using DROP TRIGGER IF EXISTS.',
      theory: {
        summary:
          'Triggers add overhead to every insert or update. If an audit workflow is deprecated or replaced, remove the trigger cleanly using DROP TRIGGER IF EXISTS.',
        introTable: {
          tableName: 'Schema state — trigger lifecycle',
          description: 'Engine responses from the live demo: the trigger is registered on products, then removed; existing rows are untouched.',
          columns: ['statement', 'engine response'],
          rows: [
            ['CREATE TRIGGER trg_dummy AFTER UPDATE ON products …', "Trigger 'trg_dummy' created successfully on products"],
            ['DROP TRIGGER IF EXISTS trg_dummy;', "Trigger 'trg_dummy' dropped"],
          ],
        },
        explanation: [
          'To remove a trigger:',
          '```sql\nDROP TRIGGER IF EXISTS trg_audit_product;\n```',
          'QUESTION_BLOCK::BEFORE::What happens to existing audit records when you drop the trigger?',
          'QUESTION_BLOCK::AFTER::All audit records previously written to tables remain intact. Only future automatic trigger executions stop.',
        ],
        syntaxBlocks: [
          {
            title: 'DROP TRIGGER',
            sql: 'DROP TRIGGER IF EXISTS trigger_name;',
            description:
              'Removes the automated trigger from the database schema.',
          },
        ],
        keyTakeaway:
          'Use DROP TRIGGER IF EXISTS to clean up automated hooks that are no longer needed.',
        exampleQuery: 'DROP TRIGGER IF EXISTS trg_audit_product;',
        exampleQueryExplanation:
          'Removes trg_audit_product so it stops running on future table updates.',
        liveDemoSql:
          'CREATE TRIGGER trg_dummy AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO products (name) VALUES ("test"); END;\nDROP TRIGGER IF EXISTS trg_dummy;',
        liveDemoNotes:
          'Creates and immediately drops a trigger cleanly.',
        mcqs: [
          {
            question: 'What is the command to delete a trigger named trg_log?',
            options: [
              'A. DELETE TRIGGER trg_log;',
              'B. DROP TRIGGER IF EXISTS trg_log;',
              'C. REMOVE TRIGGER trg_log;',
              'D. ALTER TABLE products DROP trg_log;',
            ],
            correctIndex: 1,
            explanation:
              'Triggers are schema objects and are removed using DROP TRIGGER [IF EXISTS].',
          },
        ],
        commonMistakes: [
          'Writing DELETE TRIGGER instead of DROP TRIGGER.',
        ],
      },
      tasks: [
        {
          id: 'day46-t3',
          title: 'Create and Remove a Trigger',
          description:
            'Create a temporary trigger trg_temp_check AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO categories (name) VALUES ("Temp"); END; and then immediately remove it using DROP TRIGGER.',
          instructions: [
            'Create the trigger: CREATE TRIGGER trg_temp_check AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO categories (name) VALUES ("Temp"); END;',
            'Drop the trigger: DROP TRIGGER trg_temp_check;',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create temporary trigger\n\n\n-- Step 2: Drop the trigger\n',
          solutionSql:
            'CREATE TRIGGER trg_temp_check AFTER UPDATE ON products FOR EACH ROW\nBEGIN\n  INSERT INTO categories (name) VALUES ("Temp");\nEND;\nDROP TRIGGER trg_temp_check;',
          solutionExplanation:
            'The trigger is created and then immediately removed using DROP TRIGGER, leaving the schema clean.',
          hints: [
            { level: 1, text: 'Write the CREATE TRIGGER statement followed by DROP TRIGGER trg_temp_check;' },
            { level: 2, text: 'CREATE TRIGGER trg_temp_check AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO categories (name) VALUES ("Temp"); END;\nDROP TRIGGER trg_temp_check;' },
          ],
          validation: {
            requireTrigger: true,
            whereContainsTerms: ['DROP TRIGGER'],
          },
          successMessage: 'Trigger created and removed cleanly!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day46-challenge',
    title: 'Automated Deletion Audit Log',
    scenario:
      'To prevent unauthorized data loss, build a deletion safeguard: whenever an order item is deleted, an automated trigger must log the deleted order_id and product_id to an audit table.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day46-ch1',
        title: 'Build the Deletion Audit Trigger',
        description:
          'Create a table deleted_items_log with columns: log_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT, product_id INT. Create an AFTER DELETE trigger trg_log_delete on order_items that logs OLD.order_id and OLD.product_id. Delete the row with order_item_id = 1 from order_items, then query deleted_items_log.',
        instructions: [
          'Create table: CREATE TABLE deleted_items_log (log_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT, product_id INT);',
          'Create trigger: CREATE TRIGGER trg_log_delete AFTER DELETE ON order_items FOR EACH ROW BEGIN INSERT INTO deleted_items_log (order_id, product_id) VALUES (OLD.order_id, OLD.product_id); END;',
          'Delete item: DELETE FROM order_items WHERE order_item_id = 1;',
          'Query log: SELECT order_id, product_id FROM deleted_items_log;',
        ],
        type: 'challenge',
        primaryTable: 'order_items',
        initialSql:
          '-- Create table, trigger, delete item, and query log\n',
        solutionSql:
          'CREATE TABLE deleted_items_log (log_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT, product_id INT);\nCREATE TRIGGER trg_log_delete AFTER DELETE ON order_items FOR EACH ROW\nBEGIN\n  INSERT INTO deleted_items_log (order_id, product_id) VALUES (OLD.order_id, OLD.product_id);\nEND;\nDELETE FROM order_items WHERE order_item_id = 1;\nSELECT order_id, product_id FROM deleted_items_log;',
        solutionExplanation:
          'The AFTER DELETE trigger uses the OLD record to preserve the deleted row details into deleted_items_log automatically.',
        hints: [
          { level: 1, text: 'Use OLD.order_id and OLD.product_id in the trigger INSERT.' },
          { level: 2, text: 'Follow the CREATE TABLE and CREATE TRIGGER with DELETE FROM order_items WHERE order_item_id = 1; and SELECT order_id, product_id FROM deleted_items_log;' },
        ],
        validation: {
          judgment: [             { kind: 'choose-and-defend', prompt: 'Why should an AFTER UPDATE trigger on products avoid running UPDATE products on that same table?', options: ['The update can re-fire the trigger and recurse until the engine stops it with an error', 'Triggers are not allowed to contain UPDATE at all', 'The inner update would run before the original row change', 'It would silently convert the trigger to BEFORE'], correctIndex: 0, explanation: 'Each UPDATE fires the AFTER UPDATE trigger again; without a guard the chain recurses until the engine aborts the statement.' },           ],
          requiredColumns: ['log_id', 'order_id', 'product_id'],
          requireTrigger: true,
          expectedRowCount: 1,
        },
        successMessage: 'Deletion audit trigger activated! The deleted item was captured in the historical log.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
