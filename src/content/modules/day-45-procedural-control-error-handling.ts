import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 45 — Guardrails: Procedural Control & Error Handling (id: day-45 — order 45)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   C1 Validating before mutating — guarding changes with checks
//   C2 Safe transaction rollbacks — preventing half-done updates
//   C3 Signaling custom errors when business rules fail
// =============================================================================
export const Day_45_MODULE: ModuleData = {
  id: 'day-45',
  slug: 'procedural-control-error-handling',
  day: 45,
  title: 'Day 45 — Guardrails: Procedural Control & Error Handling',
  shortTitle: 'Control Flow & Errors',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'What happens when someone orders 50 items but only 5 are in stock? Or a payment step crashes halfway through checkout? Learn how to guard your database procedures with validation checks and ensure failed operations roll back cleanly without leaving corrupt records.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Validate inputs and preconditions before modifying database tables',
    'Embed transaction control (BEGIN, COMMIT, ROLLBACK) inside routines',
    'Prevent partial updates when a multi-step operation runs into an error',
    'Signal clear business errors when data violates application rules',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Validating before mutating
    // -------------------------------------------------------------------------
    {
      id: 'guardrails-validation',
      order: 1,
      title: 'Validating Before Mutating',
      shortDescription: 'Always check rules and stock levels before applying updates.',
      theory: {
        summary:
          'Blindly updating tables is dangerous. If an application asks to deduct 100 units from an inventory that only has 10, the stock becomes negative. In database routines, you protect data by checking conditions before modifying rows.',
        introTable: {
          tableName: 'products (sample)',
          description: 'Stock levels that must never become negative.',
          columns: ['product_id', 'name', 'quantity_in_stock'],
          rows: [
            [1, 'Wireless Mouse', 45],
            [2, 'Bluetooth Speaker', 5],
          ],
        },
        explanation: [
          'A guarded update checks that sufficient stock exists in the WHERE condition:',
          '```sql\nUPDATE products\nSET quantity_in_stock = quantity_in_stock - 10\nWHERE product_id = 1 AND quantity_in_stock >= 10;\n```',
          'QUESTION_BLOCK::BEFORE::What happens if quantity_in_stock is 5 and you run the query above?',
          'QUESTION_BLOCK::AFTER::The WHERE condition (quantity_in_stock >= 10) is false, so 0 rows are updated. The inventory remains safe at 5 instead of becoming -5.',
          'By including the safety condition in the UPDATE itself, you prevent race conditions and impossible negative quantities.',
        ],
        syntaxBlocks: [
          {
            title: 'Guarded UPDATE',
            sql: 'UPDATE table_name\nSET column = column - amount\nWHERE id = target_id AND column >= amount;',
            description:
              'The extra condition (column >= amount) ensures the update only executes if enough inventory is present.',
          },
        ],
        keyTakeaway:
          'Include validation guards (like quantity >= requested) directly in your UPDATE statements to prevent corrupted negative numbers.',
        exampleQuery:
          'UPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE product_id = 2 AND quantity_in_stock >= 5;',
        exampleQueryExplanation:
          'Only deducts 5 items if at least 5 items exist in stock.',
        liveDemoSql:
          'UPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE product_id = 2 AND quantity_in_stock >= 5;\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 2;',
        liveDemoNotes:
          'Notice the quantity changes from 5 to 0. If you run it a second time, 0 rows change because stock is 0.',
        mcqs: [
          {
            question: 'Why should you include `AND quantity_in_stock >= requested_qty` in an inventory deduction?',
            options: [
              'A. To speed up the database engine',
              'B. To ensure stock never drops below zero even if an invalid request arrives',
              'C. To automatically double the quantity',
              'D. To bypass table locks',
            ],
            correctIndex: 1,
            explanation:
              'The guard condition stops the UPDATE from modifying rows when there is not enough stock, preventing negative inventory.',
          },
        ],
        commonMistakes: [
          'Deducting quantity without checking if enough stock is available.',
        ],
      },
      tasks: [
        {
          id: 'day45-t1',
          title: 'Execute a Guarded Inventory Deduction',
          description:
            'Deduct 10 units from product_id = 1, but only if quantity_in_stock is at least 10. Then select product_id, name, and quantity_in_stock for product 1 to confirm the new stock level.',
          instructions: [
            'Write an UPDATE on products: SET quantity_in_stock = quantity_in_stock - 10',
            'Add the guard in WHERE: WHERE product_id = 1 AND quantity_in_stock >= 10',
            'Select product_id, name, quantity_in_stock FROM products WHERE product_id = 1',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Guarded update\n\n\n-- Step 2: Verify stock\n',
          solutionSql:
            'UPDATE products\nSET quantity_in_stock = quantity_in_stock - 10\nWHERE product_id = 1 AND quantity_in_stock >= 10;\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
          solutionExplanation:
            'The UPDATE checks quantity_in_stock >= 10 before subtracting. Because product 1 has 45 units, the update succeeds and leaves 35 units.',
          hints: [
            { level: 1, text: 'UPDATE products SET quantity_in_stock = quantity_in_stock - 10 WHERE product_id = 1 AND quantity_in_stock >= 10;' },
            { level: 2, text: 'Follow the UPDATE with: SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;' },
          ],
          validation: {
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Guarded update applied safely! Inventory was reduced without risk of dropping below zero.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Safe transaction rollbacks
    // -------------------------------------------------------------------------
    {
      id: 'guardrails-rollback',
      order: 2,
      title: 'Safe Transaction Rollbacks',
      shortDescription: 'Wrap multi-step changes so an error cancels all pending mutations.',
      theory: {
        summary:
          'When an operation performs multiple mutations, an error on step 2 must cancel step 1. Wrapping operations in a transaction (BEGIN / COMMIT / ROLLBACK) ensures all changes happen together or none at all.',
        explanation: [
          'Consider transferring stock between warehouses or placing an order:',
          '1. Step 1: Deduct $50 from customer balance',
          '2. Step 2: Create the order record',
          'If Step 2 fails, you MUST NOT keep the deducted $50 from Step 1! You issue a ROLLBACK to undo Step 1 cleanly.',
          '```sql\nBEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE product_id = 1;\n-- If something fails:\nROLLBACK;\n```',
          'QUESTION_BLOCK::BEFORE::What happens to the database after a ROLLBACK is executed?',
          'QUESTION_BLOCK::AFTER::All mutations made since the BEGIN statement are completely discarded. The database looks exactly as it did before the transaction started.',
        ],
        syntaxBlocks: [
          {
            title: 'Transactional Safety',
            sql: 'BEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 10 WHERE product_id = 1;\n-- On success:\nCOMMIT;\n-- On error:\nROLLBACK;',
            description:
              'Transactions guarantee all-or-nothing atomicity.',
          },
        ],
        keyTakeaway:
          'Wrap critical multi-step changes in transactions. If any step fails, ROLLBACK discards partial changes so data never gets corrupted.',
        exampleQuery:
          'BEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE product_id = 1;\nROLLBACK;',
        exampleQueryExplanation:
          'Deducts 5 units inside a transaction, then rolls back. The product stock remains unchanged.',
        liveDemoSql:
          'BEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE product_id = 1;\nROLLBACK;\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
        liveDemoNotes:
          'Notice quantity_in_stock remains 45 because the rollback undid the change.',
        mcqs: [
          {
            question: 'What is the primary benefit of wrapping multi-step database changes in a transaction?',
            options: [
              'A. It makes columns invisible to other users',
              'B. It guarantees all-or-nothing execution: if any step fails, all previous steps are rolled back cleanly',
              'C. It speeds up disk reads',
              'D. It avoids using primary keys',
            ],
            correctIndex: 1,
            explanation:
              'Atomicity guarantees that if an error occurs partway through, no partial data remains saved.',
          },
        ],
        commonMistakes: [
          'Forgetting COMMIT after successful changes — uncommitted rows are not permanently saved.',
        ],
      },
      tasks: [
        {
          id: 'day45-t2',
          title: 'Protect Mutations with Rollback',
          description:
            'Start a transaction with BEGIN. Update product_id = 1 setting price = 999.99. Then execute ROLLBACK to cancel the mistake, and query product 1 to confirm its original price is preserved.',
          instructions: [
            'Write BEGIN; to start a transaction',
            'Write UPDATE products SET price = 999.99 WHERE product_id = 1;',
            'Write ROLLBACK; to discard the update',
            'SELECT product_id, name, price FROM products WHERE product_id = 1;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Protect with transaction and rollback\n',
          solutionSql:
            'BEGIN;\nUPDATE products SET price = 999.99 WHERE product_id = 1;\nROLLBACK;\nSELECT product_id, name, price FROM products WHERE product_id = 1;',
          solutionExplanation:
            'The transaction isolates the price modification. The ROLLBACK cancels the pending update, ensuring product 1 retains its original price.',
          hints: [
            { level: 1, text: 'Use BEGIN; followed by the UPDATE, then ROLLBACK;, and finish with the SELECT.' },
            { level: 2, text: 'BEGIN;\nUPDATE products SET price = 999.99 WHERE product_id = 1;\nROLLBACK;\nSELECT product_id, name, price FROM products WHERE product_id = 1;' },
          ],
          validation: {
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Transaction rolled back! The erroneous price was never permanently written.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Custom error signaling
    // -------------------------------------------------------------------------
    {
      id: 'guardrails-errors',
      order: 3,
      title: 'Enforcing Rules with Constraints and Errors',
      shortDescription: 'Let the database enforce non-negotiable business rules.',
      theory: {
        summary:
          'The most reliable way to prevent bad data from ever entering your database is by setting schema constraints (like CHECK constraints). When an update violates a rule, the database immediately halts the operation with a clear error.',
        explanation: [
          'In earlier milestones, you saw how CHECK constraints block invalid data automatically:',
          '```sql\nALTER TABLE products ADD CONSTRAINT chk_positive_price CHECK (price > 0);\n```',
          'If someone tries to update a product to have a negative price, the database rejects the command with an error.',
          'QUESTION_BLOCK::BEFORE::Why is it better for the database to reject a bad query with an error than to silently do nothing?',
          'QUESTION_BLOCK::AFTER::An explicit error alerts the application immediately that something went wrong so developers can fix the bug, instead of silently corrupting records or pretending an action succeeded.',
        ],
        syntaxBlocks: [
          {
            title: 'Constraint error enforcement',
            sql: 'UPDATE products SET price = -10 WHERE product_id = 1;\n-- Fails: CHECK constraint violation',
            description:
              'Database constraints enforce non-negotiable business rules at the storage engine level.',
          },
        ],
        keyTakeaway:
          'Explicit errors stop invalid operations in their tracks, protecting data integrity at the database layer.',
        exampleQuery:
          'UPDATE products SET price = 10.00 WHERE product_id = 1;',
        exampleQueryExplanation:
          'A valid price update that complies with schema rules.',
        liveDemoSql:
          'UPDATE products SET price = 19.99 WHERE product_id = 1;\nSELECT product_id, price FROM products WHERE product_id = 1;',
        liveDemoNotes:
          'Valid update complies with schema rules.',
        mcqs: [
          {
            question: 'Why should business invariants (like non-negative prices) be enforced at the database layer?',
            options: [
              'A. Because client apps can be bypassed or have bugs; database constraints guarantee data is always valid',
              'B. To make the database file smaller',
              'C. To prevent SELECT queries from running',
              'D. To avoid having indexes',
            ],
            correctIndex: 0,
            explanation:
              'Client-side code can fail or be bypassed. Enforcing rules in the database ensures no corrupted data can ever be saved.',
          },
        ],
        commonMistakes: [
          'Relying only on frontend form validation and leaving the database unprotected.',
        ],
      },
      tasks: [
        {
          id: 'day45-t3',
          title: 'Observe Constraint Rejection on Invalid Data',
          description:
            'An accounts table exists with a CHECK constraint requiring balance >= 0. Setting balance = -50 on the existing account violates that rule. Run this script and observe the failure.',
          instructions: [
            'Create a table accounts: CREATE TABLE accounts (acc_id INT PRIMARY KEY, balance DECIMAL CHECK (balance >= 0));',
            'Insert an initial valid account: INSERT INTO accounts (acc_id, balance) VALUES (1, 100);',
            'Attempt an invalid update that would violate the check: UPDATE accounts SET balance = -50 WHERE acc_id = 1;',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            'CREATE TABLE accounts (acc_id INT PRIMARY KEY, balance DECIMAL CHECK (balance >= 0));\nINSERT INTO accounts (acc_id, balance) VALUES (1, 100);\n-- Now attempt the invalid negative balance update:\nUPDATE accounts SET balance = -50 WHERE acc_id = 1;\n',
          solutionSql:
            'CREATE TABLE accounts (acc_id INT PRIMARY KEY, balance DECIMAL CHECK (balance >= 0));\nINSERT INTO accounts (acc_id, balance) VALUES (1, 100);\nUPDATE accounts SET balance = -50 WHERE acc_id = 1;',
          solutionExplanation:
            'The CHECK (balance >= 0) constraint rejects the UPDATE because -50 violates the rule. The database stops the invalid mutation immediately.',
          hints: [
            { level: 1, text: 'Run the provided SQL script as-is to verify the constraint rejection.' },
            { level: 2, text: 'UPDATE accounts SET balance = -50 WHERE acc_id = 1; triggers the check violation.' },
          ],
          validation: {
            expectFailure: true,
            expectedErrorCategory: 'CHECK_CONSTRAINT',
          },
          successMessage: 'The database caught the invalid negative balance and rejected the update with a CHECK constraint error!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day45-challenge',
    title: 'Atomic Inventory Decrement Routine',
    scenario:
      'Build an atomic checkout script: in a single transaction, deduct 3 units from product 2 with a safety check ensuring quantity_in_stock >= 3, and commit the transaction. Verify the final stock level.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day45-ch1',
        title: 'Execute Safe Atomic Checkout',
        description:
          'Wrap the inventory deduction in a transaction: BEGIN, update product 2 subtracting 3 units with the safety guard quantity_in_stock >= 3, COMMIT, and select product 2 to verify the final quantity.',
        instructions: [
          'BEGIN;',
          'UPDATE products SET quantity_in_stock = quantity_in_stock - 3 WHERE product_id = 2 AND quantity_in_stock >= 3;',
          'COMMIT;',
          'SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 2;',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql:
          '-- Write atomic checkout transaction\n',
        solutionSql:
          'BEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 3 WHERE product_id = 2 AND quantity_in_stock >= 3;\nCOMMIT;\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 2;',
        solutionExplanation:
          'The transaction wraps the guarded update. The COMMIT makes the 3-unit deduction permanent, leaving the inventory safely updated.',
        hints: [
          { level: 1, text: 'Start with BEGIN; and end with COMMIT; before your SELECT.' },
          { level: 2, text: 'BEGIN;\nUPDATE products SET quantity_in_stock = quantity_in_stock - 3 WHERE product_id = 2 AND quantity_in_stock >= 3;\nCOMMIT;\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 2;' },
        ],
        validation: {
          requireWhere: true,
          expectedRowCount: 1,
        },
        successMessage: 'Atomic checkout completed safely! The database guarded against overdraft and committed cleanly.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
