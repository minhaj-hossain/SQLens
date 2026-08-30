import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 26 - DML + Transactions (id: dml-transactions - order 26)
// Inserts right after day-19 (DML) and before day-20 (DDL). Atomic chain:
//   C1 Transaction boundaries - BEGIN / COMMIT (provisional until committed)
//   C2 ROLLBACK - the undo (restores the pre-BEGIN snapshot)
//   C3 Atomic failure - all-or-nothing (a failed step, then ROLLBACK)
// Spiral: Day 19 INSERT/UPDATE safety, Day 20 FK constraints, Day 1 verify-with-SELECT.
// =============================================================================
export const Day_26_MODULE: ModuleData = {
  id: 'dml-transactions',
  slug: 'dml-transactions',
  day: 0, // ordering uses curriculumOrder (Day 26)
  title: 'Day 26 - DML + Transactions',
  shortTitle: 'Transactions & Atomicity',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Group multiple data-modification statements into one atomic unit. Changes stay provisional until you COMMIT, ROLLBACK undoes everything since BEGIN, and a failed statement inside a transaction leaves nothing half-applied.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Open a transaction with BEGIN and make its changes permanent with COMMIT',
    'Undo everything since BEGIN with ROLLBACK - it restores the exact pre-transaction state',
    'Explain why a failed statement inside a transaction is not half-applied but all-or-nothing',
    'Write a multi-row INSERT to seed a batch of records in one statement',
  ],
  concepts: [
    {
      id: 'tx-begin-commit',
      order: 1,
      title: '1. Transaction Boundaries: BEGIN / COMMIT',
      shortDescription: 'Changes are provisional until you COMMIT them.',
      theory: {
        summary:
          'Day 19 taught you to mutate rows carefully. But what if a business operation needs FIVE statements that must all succeed together? A flash sale needs a product insert, a stock decrement, and a feature flag all at once. A transaction wraps them: BEGIN opens the group, and only COMMIT makes the changes permanent. Before COMMIT, everything you did is provisional - visible to you, but not durable.',
        introTable: {
          tableName: 'products (before the sale)',
          description: 'The catalog before a transaction inserts flash-sale items.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [2, 'Bluetooth Speaker', 45.5],
          ],
        },
        explanation: [
          'The mental model: a transaction is a **workspace**. BEGIN creates the workspace. Inside it you can INSERT, UPDATE, DELETE - nothing leaves the workspace yet. COMMIT ships the whole workspace to the real database; ROLLBACK throws the workspace away.',
          "```sql\nBEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)\nVALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);\nCOMMIT;\n```",
          'QUESTION_BLOCK::BEFORE::Between BEGIN and COMMIT, is the INSERT visible to other connections?',
          'QUESTION_BLOCK::AFTER::What single keyword makes the change permanent?',
          'COMMIT is the moment of no return: after it, the rows are durable and the transaction is closed. The snapshot the engine took at BEGIN is discarded - there is no going back. That is exactly why real systems require an explicit COMMIT instead of assuming every statement is permanent.',
          'When to wrap in a transaction: any operation with MULTIPLE dependent mutations (an order plus its line items, a transfer across two accounts, a sale plus its stock changes). A single standalone statement is already atomic on its own.',
        ],
        targetQuery: {
          sql: "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);\nCOMMIT;",
          explanation: 'A full mini-transaction: open the workspace, add a flash-sale product, and ship it to the database with COMMIT.',
          badge: 'The lifecycle we are going to break down',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: BEGIN opens the workspace',
            sqlSnippet: 'BEGIN;',
            explanation: 'The engine snapshots the current database. From now on, every mutation lands in a provisional workspace. Your session can see it; nothing is durable yet.',
            tableData: {
              tableName: 'After BEGIN',
              columns: ['statement', 'result'],
              rows: [
                ['BEGIN;', 'Transaction started (atomicity active)'],
                ['INSERT ...', 'pending - visible here, not durable'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The INSERT lands in the workspace',
            sqlSnippet: "INSERT INTO products (...) VALUES ('Flash Sale Mouse', ...);",
            explanation: 'The row is added to the workspace. A SELECT right now would show it - but another connection, or a crash, would not see it until COMMIT.',
            tableData: {
              tableName: 'Workspace contents',
              columns: ['product_id', 'name', 'price'],
              rows: [['...', 'Flash Sale Mouse', 9.99]],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: COMMIT ships it to the database',
            sqlSnippet: 'COMMIT;',
            explanation: 'The workspace is written to the real database and becomes durable. The snapshot taken at BEGIN is discarded. From here there is no undo.',
            tableData: {
              tableName: 'After COMMIT',
              columns: ['name', 'status'],
              rows: [['Flash Sale Mouse', 'durable']],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Transaction boundaries',
            sql: 'BEGIN;\n-- statements...\nCOMMIT;\n-- or\nROLLBACK;',
            description: 'BEGIN starts the transaction, COMMIT makes the changes permanent, ROLLBACK discards them. All three are their own statement.',
          },
        ],
        keyTakeaway:
          'BEGIN opens a provisional workspace; nothing you do inside it is durable until COMMIT. COMMIT is the point of no return - after it the snapshot is gone and the changes are permanent.',
        exampleQuery:
          "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);\nCOMMIT;",
        exampleQueryExplanation: 'Three statements, one atomic unit: open, insert, commit. The Flash Sale Mouse becomes durable exactly at COMMIT.',
        liveDemoSql: 'BEGIN;',
        liveDemoNotes: "Run BEGIN first - you should see 'Transaction started'. Everything you do next is provisional until you COMMIT.",
        mcqs: [
          {
            question: 'When does a row inserted inside a transaction become permanent?',
            options: [
              'A. As soon as the INSERT statement runs',
              'B. Only when you run COMMIT',
              'C. When you run BEGIN',
              'D. Only after the database restarts',
            ],
            correctIndex: 1,
            explanation: 'Between BEGIN and COMMIT the change is provisional. COMMIT is what makes it durable.',
          },
          {
            question: 'You run BEGIN, then INSERT, then close your editor without COMMIT. What happens to the inserted row?',
            options: [
              'A. It is committed automatically',
              'B. It stays permanently',
              'C. It is discarded - nothing was committed',
              'D. It waits forever',
            ],
            correctIndex: 2,
            explanation: 'Uncommitted work is lost when the session ends. That is why real systems make you commit explicitly - never assume.',
          },
        ],
        commonMistakes: [
          'Forgetting the COMMIT - the changes look right in your session but vanish later.',
          'Committing too early, before all the dependent statements have run - you cannot un-commit.',
        ],
        debuggingExercise: {
          brokenSql:
            "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ghost Product', 1, 1, 5.99, 10, 5); -- no BEGIN, no COMMIT",
          bugs: [
            'There is no BEGIN so the statement is immediately durable - if the rest of the batch fails later, this row is already committed and cannot be undone.',
          ],
          fixDescription: 'Wrap the operation in a transaction: BEGIN; INSERT ...; COMMIT; - so the insert can be rolled back if a later step fails.',
        },
        masteryPoints: [
          'Explain why an explicit COMMIT is required for durability',
          'Identify when a multi-statement operation deserves a transaction',
        ],
      },
      tasks: [
        {
          id: 'tx-c1-t1',
          title: 'Task 1 (Guided): The minimal committed insert',
          description: 'Run the smallest useful transaction: open it, insert one flash-sale product, then commit. Feel the three keywords working together.',
          instructions: [
            'Run `BEGIN;`',
            "Run `INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);`",
            'Run `COMMIT;` - now the row is durable.',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- BEGIN;  INSERT ...;  COMMIT;\n',
          solutionSql:
            "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20);\nCOMMIT;",
          solutionExplanation: 'A complete atomic unit: BEGIN opened the workspace, the INSERT landed there provisionally, COMMIT made it durable. After this, a SELECT finds the Flash Sale Mouse.',
          hints: [
            { level: 1, text: 'Three statements in order: BEGIN; then the INSERT; then COMMIT;' },
            { level: 2, text: 'Run each as its own statement - the engine tracks that you are inside a transaction.' },
          ],
          validation: {
            targetTable: 'products',
            expectedRowCount: 1,
          },
          successMessage: 'The three-step lifecycle - BEGIN, mutate, COMMIT - is now muscle memory.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'tx-c1-t2',
          title: 'Task 2 (Independent): Commit a batch of flash-sale items',
          description: 'The marketing team approved THREE flash-sale products. Insert them together in one multi-row INSERT, wrapped in BEGIN/COMMIT.',
          instructions: [
            'Run `BEGIN;`',
            "Run one multi-row INSERT with three tuples: `('Flash Sale Mouse', 1, 1, 9.99, 100, 20)`, `('Flash Sale Speaker', 2, 1, 19.99, 80, 15)`, `('Flash Sale Pan', 3, 2, 24.99, 60, 10)`.",
            "Run `COMMIT;` then verify with `SELECT name FROM products WHERE name LIKE 'Flash Sale%';` - expect 3 rows.",
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- BEGIN;  INSERT (3 tuples);  COMMIT;\n',
          solutionSql:
            "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20), ('Flash Sale Speaker', 2, 1, 19.99, 80, 15), ('Flash Sale Pan', 3, 2, 24.99, 60, 10);\nCOMMIT;",
          solutionExplanation: 'One statement seeded three rows; COMMIT made all three durable. Multi-row INSERT is how real batches are loaded.',
          hints: [
            { level: 1, text: 'The multi-row INSERT writes all tuples in one statement - separate them with commas inside the VALUES list.' },
            { level: 2, text: 'Wrap it in BEGIN; ... COMMIT; so all three either survive together or not at all.' },
          ],
          validation: {
            targetTable: 'products',
            expectedRowCount: 3,
          },
          successMessage: 'A committed batch - you just loaded a sale catalog atomically.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'tx-c1-t3',
          title: 'Task 3 (Independent): Verify durability with your own SELECT',
          description: 'After the commit, prove the rows survived by querying them back. Write the SELECT that counts your flash-sale products.',
          instructions: [
            "Run `SELECT name FROM products WHERE name LIKE 'Flash Sale%';`",
            'Expect exactly 3 rows - the proof that COMMIT made them durable.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Verify the committed batch\n',
          solutionSql: "SELECT name FROM products WHERE name LIKE 'Flash Sale%';",
          solutionExplanation: 'Retrieval after a DML statement is the classic "verify-with-SELECT" habit - the rows are still there because COMMIT persisted them.',
          hints: [{ level: 1, text: "Filter products by name LIKE 'Flash Sale%' to count your committed batch." }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 3,
          },
          successMessage: 'You verified your own write - the habit that catches half-committed systems.',
          databaseLifecycle: 'inherit',
        },
        {
          id: 'tx-c1-t4',
          title: 'Task 4 (Challenge): Commit an order as one unit',
          description: 'An order is never one row: it needs a row in `orders` AND rows in `order_items`. Insert a new order plus one line item, and commit them together so the order is never left half-built.',
          instructions: [
            'Run `BEGIN;`',
            "Insert into `orders (customer_id, order_date, status)` values `(2, '2026-08-26', 'pending')`.",
            "Insert into `order_items (order_id, product_id, quantity, unit_price)` values `(19, 1, 2, 15.99)`.",
            'Run `COMMIT;`.',
          ],
          type: 'challenge',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- BEGIN; INSERT order; INSERT item; COMMIT;\n',
          solutionSql:
            "BEGIN;\nINSERT INTO orders (customer_id, order_date, status) VALUES (2, '2026-08-26', 'pending');\nINSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (19, 1, 2, 15.99);\nCOMMIT;",
          solutionExplanation: 'The order and its line item are one atomic unit - if either insert failed, COMMIT would never run and nothing would be half-applied.',
          hints: [{ level: 1, text: 'BEGIN, then the orders INSERT, then the order_items INSERT, then COMMIT - four statements, one unit.' }],
          validation: {
            targetTable: 'orders',
            expectedRowCount: 1,
          },
          successMessage: 'A parent+child insert inside one transaction - this is exactly how real checkout systems work.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
    {
      id: 'tx-rollback',
      order: 2,
      title: '2. ROLLBACK: The Undo',
      shortDescription: 'Undo everything since BEGIN by restoring the snapshot.',
      theory: {
        summary: 'COMMIT makes changes permanent; ROLLBACK throws them away. While a transaction is open, the engine keeps the pre-BEGIN snapshot. ROLLBACK restores that exact snapshot - every INSERT, UPDATE, and DELETE since BEGIN is reversed, as if it never happened. It is the safety net that makes experimentation safe.',
        introTable: {
          tableName: 'products (before ROLLBACK)',
          description: 'A change applied inside a transaction, about to be undone.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [2, 'Bluetooth Speaker', 45.5],
          ],
        },
        explanation: [
          'The mental model: BEGIN took a photograph of the database. ROLLBACK pastes that photograph back - everything you did since is gone. The keyword is the mirror of COMMIT: same unit, opposite destination.',
          '```sql\nBEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\n-- whoops - wrong call\nROLLBACK;\n```',
          'QUESTION_BLOCK::BEFORE::After the UPDATE but before ROLLBACK, what price does product 1 show?',
          'QUESTION_BLOCK::AFTER::After ROLLBACK, what price does product 1 show?',
          'After ROLLBACK the price is back to 15.99 - the snapshot won. This is how you try a change, measure the impact with a SELECT, and abandon it cleanly if it is wrong.',
          'The pairing is strict: COMMIT discards the snapshot and keeps the work; ROLLBACK keeps the snapshot and discards the work. They are the only two exits from an open transaction.',
        ],
        targetQuery: {
          sql: 'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nROLLBACK;',
          explanation: 'A change inside a transaction, then undone - product 1 returns to 15.99.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The UPDATE lands in the workspace',
            sqlSnippet: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
            explanation: 'Inside the transaction the price is now 17.59. You look at the result and realize the raise was wrong.',
            tableData: {
              tableName: 'Workspace (provisional)',
              columns: ['product_id', 'name', 'price'],
              rows: [[1, 'Wireless Mouse', 17.59]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: ROLLBACK restores the snapshot',
            sqlSnippet: 'ROLLBACK;',
            explanation: 'The pre-BEGIN snapshot is pasted back: price 15.99 again, every change since BEGIN reversed.',
            tableData: {
              tableName: 'After ROLLBACK',
              columns: ['product_id', 'name', 'price'],
              highlightedRows: [0],
              rows: [[1, 'Wireless Mouse', 15.99]],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'ROLLBACK syntax',
            sql: 'BEGIN;\n-- provisional work...\nROLLBACK;',
            description: 'ROLLBACK discards everything since BEGIN and closes the transaction. No confirmation, no partial undo - the whole workspace is dropped.',
          },
        ],
        keyTakeaway: 'ROLLBACK restores the exact pre-BEGIN snapshot. COMMIT and ROLLBACK are the only two exits from a transaction: one keeps the work, one keeps the snapshot.',
        exampleQuery: 'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nROLLBACK;',
        exampleQueryExplanation: 'The 10% raise is tried and abandoned - product 1 ends exactly where it started, at 15.99.',
        liveDemoSql: 'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nSELECT price FROM products WHERE product_id = 1;\nROLLBACK;\nSELECT price FROM products WHERE product_id = 1;',
        liveDemoNotes: 'Run these in order: the first SELECT shows 17.59 (provisional), the second shows 15.99 (restored).',
        mcqs: [
          {
            question: 'What exactly does ROLLBACK restore?',
            options: [
              'A. Only the last statement',
              'B. The exact state of the database as it was at BEGIN',
              'C. Only deleted rows',
              'D. Nothing - it just closes the transaction',
            ],
            correctIndex: 1,
            explanation: 'The engine snapshots the database at BEGIN. ROLLBACK restores that snapshot - all statements since are reversed.',
          },
          {
            question: 'You ran BEGIN, made 3 changes, then ROLLBACK. How many changes are durable?',
            options: ['A. 3', 'B. 2', 'C. 1', 'D. 0'],
            correctIndex: 3,
            explanation: 'ROLLBACK discards the entire workspace - zero of the three changes survive.',
          },
        ],
        commonMistakes: [
          'ROLLBACK after COMMIT - the snapshot was discarded at COMMIT, so there is nothing to restore.',
          'Rolling back when you meant to commit - double-check which exit you are taking.',
        ],
        masteryPoints: [
          'Explain what state ROLLBACK restores and why',
          'Use BEGIN + measure + ROLLBACK to try a change safely',
        ],
      },
      tasks: [
        {
          id: 'tx-c2-t1',
          title: 'Task 1 (Guided): Undo a price change',
          description: 'Product 1 got an unplanned 10% raise. Try it inside a transaction, look at the provisional price, then ROLLBACK it away.',
          instructions: [
            'Run `BEGIN;`',
            'Run `UPDATE products SET price = price * 1.10 WHERE product_id = 1;`',
            "Run `SELECT price FROM products WHERE product_id = 1;` - it shows the provisional new price.",
            'Run `ROLLBACK;` then the same SELECT again - the price is back to 15.99.',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- BEGIN; UPDATE; SELECT; ROLLBACK; SELECT\n',
          solutionSql: 'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nROLLBACK;',
          solutionExplanation: 'The UPDATE was provisional; ROLLBACK pasted the pre-BEGIN snapshot back and the price returned to 15.99.',
          hints: [
            { level: 1, text: 'BEGIN first, then the UPDATE, then ROLLBACK - three statements in order.' },
            { level: 2, text: 'The SELECT between UPDATE and ROLLBACK shows the provisional price - the one after shows the restored price.' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'You just used a transaction as a safe sandbox - try, verify, abandon.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'tx-c2-t2',
          title: 'Task 2 (Independent): Prove the revert with your own SELECT',
          description: 'Write the SELECT that proves product 1 is back at its original price of 15.99 after the rollback.',
          instructions: [
            'Run `SELECT name, price FROM products WHERE product_id = 1;`',
            'The price column must show 15.99 - the pre-transaction value.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Prove the price is restored\n',
          solutionSql: 'SELECT name, price FROM products WHERE product_id = 1;',
          solutionExplanation: 'One row: Wireless Mouse at 15.99. The rollback was complete.',
          hints: [{ level: 1, text: 'Filter products by product_id = 1 and select name and price.' }],
          validation: {
            targetTable: 'products',
            requiredColumns: ['name', 'price'],
            requireWhere: true,
            expectedRowCount: 1,
            customValidator: (_ast: unknown, result: { rows?: { price?: number }[] }) => {
              const price = Number(result?.rows?.[0]?.price);
              return price === 15.99
                ? { valid: true }
                : { valid: false, message: `Product 1 shows price ${price} - the rollback did not restore 15.99. Did you COMMIT instead of ROLLBACK?` };
            },
          },
          successMessage: '15.99 restored - you verified the undo, not just trusted it.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
    {
      id: 'tx-atomic-failure',
      order: 3,
      title: '3. Atomic Failure: All or Nothing',
      shortDescription: 'A failed step mid-batch undoes nothing and half-applies nothing.',
      theory: {
        summary: 'The real payoff of transactions: when one statement inside a batch FAILS, nothing is half-applied. You ROLLBACK, and the database is exactly as it was at BEGIN. The alternative - some rows inserted, others rejected - is data corruption. Atomicity means a multi-statement operation has only two outcomes: all of it, or none of it.',
        introTable: {
          tableName: 'A batch with one bad row',
          description: 'Row 1 is valid; row 2 references a category that does not exist (999).',
          columns: ['name', 'category_id', 'verdict'],
          rows: [
            ['Limited Edition Mug', 5, 'valid'],
            ['Broken Item', 999, 'FK violation'],
          ],
        },
        explanation: [
          'The mental model: think of a bank transfer - debit account A, credit account B. If the debit succeeds but the credit fails, money has vanished. Atomicity forbids that state: either both steps commit, or the transfer is rolled back entirely.',
          '```sql\nBEGIN;\nINSERT INTO products (...) VALUES (...);        -- valid\nINSERT INTO products (...) VALUES (..., 999, ...); -- FK violation\nROLLBACK;\n```',
          'QUESTION_BLOCK::FAIL::When the second INSERT fails, what happened to the first one?',
          'QUESTION_BLOCK::EXIT::Which statement guarantees the first insert disappears?',
          'The FK violation surfaces as an engine error - the failed statement does not run. But the FIRST insert is still sitting in the open transaction. Only ROLLBACK removes it. This is the failure lab: run the broken statement on purpose, watch the constraint fire, then roll back and verify nothing survived.',
          'This is why teams wrap multi-row seeds and checkout flows in transactions: the engine itself becomes the guardian of consistency instead of your code hoping every statement succeeds.',
        ],
        targetQuery: {
          sql: "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Limited Edition Mug', 3, 5, 12.99, 25, 5);\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);\nROLLBACK;",
          explanation: 'Row 1 is valid; row 2 trips the foreign-key constraint on category 999; ROLLBACK then removes row 1 too - nothing half-applied.',
          badge: 'The failure lab we are going to break down',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The valid insert lands in the workspace',
            sqlSnippet: "INSERT INTO products (...) VALUES ('Limited Edition Mug', 3, 5, 12.99, ...);",
            explanation: 'Category 5 exists, so the insert is accepted - provisionally.',
            tableData: {
              tableName: 'Workspace',
              columns: ['name', 'category_id'],
              rows: [['Limited Edition Mug', 5]],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The broken insert trips the constraint',
            sqlSnippet: 'INSERT INTO products (...) VALUES (..., 999, ...);',
            explanation: 'Category 999 does not exist. The engine rejects the statement with a foreign-key error - and the transaction stays open.',
            tableData: {
              tableName: 'Error',
              columns: ['statement', 'result'],
              rows: [['INSERT (category_id = 999)', 'FK violation - rejected']],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: ROLLBACK erases the whole batch',
            sqlSnippet: 'ROLLBACK;',
            explanation: 'The valid insert is undone along with everything else since BEGIN. Final state: exactly as it was at BEGIN - zero new rows.',
            tableData: {
              tableName: 'After ROLLBACK',
              columns: ['name', 'exists?'],
              rows: [
                ['Limited Edition Mug', 'no'],
                ['Broken Item', 'no'],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'The failure-lab pattern',
            sql: 'BEGIN;\n-- valid statement(s)\n-- deliberately broken statement\nROLLBACK;\n-- verify with SELECT',
            description: 'Trigger the failure, observe the error, ROLLBACK, then SELECT to confirm zero partial rows survived.',
          },
        ],
        keyTakeaway: 'A failed statement inside a transaction does not run, and ROLLBACK erases everything that did. The batch ends exactly where it started - that is atomicity.',
        exampleQuery: "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Limited Edition Mug', 3, 5, 12.99, 25, 5);\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);\nROLLBACK;",
        exampleQueryExplanation: 'The valid row and the broken row end up equally nonexistent - the whole batch was undone.',
        liveDemoSql: "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Limited Edition Mug', 3, 5, 12.99, 25, 5);\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);\nROLLBACK;\nSELECT name FROM products WHERE name IN ('Limited Edition Mug', 'Broken Item');",
        liveDemoNotes: 'The final SELECT returns zero rows - proof that the failure took the whole batch down with it.',
        mcqs: [
          {
            question: 'Statement 1 succeeds inside a transaction; statement 2 fails. What does the database contain after you ROLLBACK?',
            options: [
              'A. Only the changes from statement 1',
              'B. The changes from statement 1 and the error message',
              'C. Nothing - the database is exactly as it was at BEGIN',
              'D. Both statements half-applied',
            ],
            correctIndex: 2,
            explanation: 'ROLLBACK restores the pre-BEGIN snapshot: statement 1 is undone too. All or nothing.',
          },
          {
            question: 'Why is a half-applied batch dangerous even if every row that DID land is valid?',
            options: [
              'A. It uses extra disk space',
              'B. Because dependent operations expect the whole batch - a missing piece corrupts business state (e.g. an order with no line items)',
              'C. It slows down future queries',
              'D. It is not dangerous',
            ],
            correctIndex: 1,
            explanation: 'Correctness is about the SET of changes, not each row in isolation. Atomicity protects that set.',
          },
        ],
        commonMistakes: [
          'Treating a failed statement as harmless and continuing to COMMIT - you would commit a partial batch.',
          'Forgetting to ROLLBACK after a failure - the transaction stays open and later statements silently join it.',
        ],
        masteryPoints: [
          'Explain the all-or-nothing guarantee with the bank-transfer example',
          'Run a deliberate-failure lab: trigger a constraint error, ROLLBACK, verify zero rows survived',
        ],
      },
      tasks: [
        {
          id: 'tx-c3-t1',
          title: 'Task 1 (Guided): The failure lab',
          description: 'Deliberately trigger a foreign-key violation inside a transaction. This task EXPECTS your query to fail - that is the point.',
          instructions: [
            'Run `BEGIN;`',
            "Run `INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);` - category 999 does not exist.",
            'Watch the foreign-key error fire. Do not fix it yet - this task wants the error.',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- This insert is SUPPOSED to fail\n',
          solutionSql:
            "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);",
          solutionExplanation: 'The engine rejected the insert: category_id 999 does not exist in categories. Constraint violations are how the database guards itself.',
          hints: [{ level: 1, text: 'Just run the INSERT exactly as instructed - the error IS the expected result.' }],
          validation: {
            targetTable: 'products',
            expectFailure: true,
          },
          successMessage: 'The constraint fired exactly as designed - now roll the whole thing back.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'tx-c3-t2',
          title: 'Task 2 (Independent): ROLLBACK the failed batch',
          description: 'A valid insert went in before the failure. Roll the transaction back and prove nothing survived.',
          instructions: [
            'Your transaction is still open from Task 1.',
            'Run `ROLLBACK;`',
            "Then run `SELECT name FROM products WHERE name IN ('Limited Edition Mug', 'Broken Item');` - expect ZERO rows.",
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- ROLLBACK, then verify nothing survived\n',
          solutionSql: "SELECT name FROM products WHERE name IN ('Limited Edition Mug', 'Broken Item');",
          solutionExplanation: 'Zero rows: the valid insert was undone together with the failed one. The batch was all-or-nothing.',
          hints: [{ level: 1, text: 'ROLLBACK first - then the verification SELECT should return an empty result.' }],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            expectedRowCount: 0,
          },
          successMessage: 'Zero rows survived - you have now felt atomicity instead of memorizing the word.',
          databaseLifecycle: 'inherit',
        },
      ],
    },
  ],
  challenge: {
    id: 'dml-transactions-homework',
    title: 'Day 26 - Transaction Challenge (Ending Activity)',
    scenario:
      'Flash-sale go-live. The catalog update must land as ONE atomic unit: open a transaction, seed the three sale products with a single multi-row INSERT, commit, and then prove durability by querying the batch back.',
    databaseLifecycle: 'inherit',
    tasks: [
      {
        id: 'tx-hw-1',
        title: 'Task 1: Open the go-live transaction',
        description: 'The catalog change starts now. Open a transaction so the batch is provisional until you commit it.',
        instructions: ['Run `BEGIN;`'],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Open the go-live transaction\n',
        solutionSql: 'BEGIN;',
        solutionExplanation: 'The engine snapshots the database. Every statement until COMMIT or ROLLBACK is provisional.',
        hints: [{ level: 1, text: 'A single keyword opens the workspace.' }],
        validation: {
          expectedRowCount: 1,
        },
        successMessage: 'Workspace open - the go-live batch is now provisional.',
      },
      {
        id: 'tx-hw-2',
        title: 'Task 2: Seed all three flash-sale products in one statement',
        description: 'One multi-row INSERT adds the whole sale catalog. If any tuple were invalid, none would land - that is the protection you want on go-live day.',
        instructions: [
          "Run one multi-row INSERT into `products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)` with tuples: `('Flash Sale Mouse', 1, 1, 9.99, 100, 20)`, `('Flash Sale Speaker', 2, 1, 19.99, 80, 15)`, `('Flash Sale Pan', 3, 2, 24.99, 60, 10)`.",
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Seed the flash-sale catalog\n',
        solutionSql:
          "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Flash Sale Mouse', 1, 1, 9.99, 100, 20), ('Flash Sale Speaker', 2, 1, 19.99, 80, 15), ('Flash Sale Pan', 3, 2, 24.99, 60, 10);",
        solutionExplanation: 'Three tuples, one statement, three provisional rows - the batch lives or dies together.',
        hints: [{ level: 1, text: 'Write the column list once, then three comma-separated tuples in the VALUES section.' }],
        validation: {
          targetTable: 'products',
          expectedRowCount: 3,
        },
        successMessage: 'Three products seeded provisionally - now make them real.',
      },
      {
        id: 'tx-hw-3',
        title: 'Task 3: Commit the go-live',
        description: 'The batch is complete and correct. Ship it to the database.',
        instructions: ['Run `COMMIT;`'],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Ship it\n',
        solutionSql: 'COMMIT;',
        solutionExplanation: 'The snapshot is discarded and the three flash-sale products are durable.',
        hints: [{ level: 1, text: 'One keyword makes the batch permanent.' }],
        validation: {
          expectedRowCount: 1,
        },
        successMessage: 'Go-live committed - the snapshot is gone, the rows are real.',
      },
      {
        id: 'tx-hw-4',
        title: 'Task 4: Prove durability with your own SELECT',
        description: 'Verify-with-SELECT, one last time: query the flash-sale catalog back and confirm all three rows are durable.',
        instructions: [
          "Run `SELECT name, price FROM products WHERE name LIKE 'Flash Sale%' ORDER BY name;`",
          'Expect exactly 3 rows.',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Verify the durable batch\n',
        solutionSql: "SELECT name, price FROM products WHERE name LIKE 'Flash Sale%' ORDER BY name;",
        solutionExplanation: 'Three rows returned after the commit - the batch is durable, not provisional.',
        hints: [{ level: 1, text: "Filter by name LIKE 'Flash Sale%' and select name and price." }],
        validation: {
          targetTable: 'products',
          requiredColumns: ['name', 'price'],
          requireWhere: true,
          expectedRowCount: 3,
        },
        successMessage: 'The flash-sale go-live is complete: begin, batch, commit, verify. That is the production loop.',
      },
    ],
  },
};