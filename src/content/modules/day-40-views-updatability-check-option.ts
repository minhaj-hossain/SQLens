import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 40 — View Rules & Editable Views (id: day-40 — order 40)
// Milestone 4, Phase 1: Reusable Queries & Tree Exploration
//   C1 When can you INSERT/UPDATE through a view (updatability rules)
//   C2 WITH CHECK OPTION — block edits that break the view filter
//   C3 CREATE OR REPLACE VIEW — update a view without dropping it
// =============================================================================
export const Day_40_MODULE: ModuleData = {
  id: 'day-40',
  slug: 'views-updatability-check-option',
  day: 40,
  title: 'Day 40 — View Rules: When You Can Edit Data Through a View',
  shortTitle: 'View Rules & Check Option',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Some views let you INSERT and UPDATE data through them — others do not. Learn the simple rules that decide when a view is editable, how WITH CHECK OPTION stops bad edits from sneaking through, and how to update a view definition without dropping it.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Identify when a view is editable (single table, no GROUP BY, no DISTINCT, no aggregate)',
    'Use WITH CHECK OPTION to block rows that would violate the view filter',
    'Use CREATE OR REPLACE VIEW to update a view definition in place',
    'Explain why complex views (with JOINs or aggregates) are read-only',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Updatable views
    // -------------------------------------------------------------------------
    {
      id: 'view-updatability',
      order: 1,
      title: 'When Can You Edit Data Through a View?',
      shortDescription: 'Simple single-table views let you INSERT and UPDATE. Complex ones do not.',
      theory: {
        summary:
          'After creating a view, you might wonder: can I INSERT or UPDATE rows through it? Sometimes yes — if the view is simple enough. The rule of thumb is: if the database can trace exactly which table and which row to touch, the edit is allowed.',
        explanation: [
          'A view is editable when it meets ALL of these conditions:',
          '1. It reads from exactly ONE table (no JOINs)',
          '2. It has no GROUP BY, no HAVING, no DISTINCT',
          '3. It has no aggregate functions (no SUM, COUNT, AVG, etc.)',
          '4. It does not use a subquery in the SELECT list',
          'Example of an editable view:',
          '```sql\nCREATE VIEW v_cheap_products AS\n  SELECT product_id, name, price\n  FROM products\n  WHERE price <= 20;\n\n-- This UPDATE goes directly to the products table:\nUPDATE v_cheap_products SET price = 18 WHERE product_id = 3;\n```',
          'QUESTION_BLOCK::BEFORE::Why do you think a view with a JOIN cannot be updated through?',
          'QUESTION_BLOCK::AFTER::Because the database cannot know which of the two joined tables to actually change. The JOIN creates ambiguity.',
          'Example of a read-only view (JOIN makes it non-updatable):',
          '```sql\nCREATE VIEW v_order_summary AS\n  SELECT o.order_id, c.name\n  FROM orders o JOIN customers c ON o.customer_id = c.customer_id;\n\n-- This UPDATE would fail:\nUPDATE v_order_summary SET name = "Bob" WHERE order_id = 1;\n-- Error: view is not updatable\n```',
        ],
        introTable: {
          tableName: 'View updatability quick reference',
          columns: ['View Contains', 'Editable?'],
          rows: [
            ['Single table, WHERE only', 'Yes'],
            ['JOIN (multiple tables)', 'No'],
            ['GROUP BY or HAVING', 'No'],
            ['DISTINCT', 'No'],
            ['SUM / COUNT / AVG', 'No'],
          ],
        },
        syntaxBlocks: [
          {
            title: 'UPDATE through a simple view',
            sql: 'UPDATE simple_view\nSET column = value\nWHERE condition;',
            description:
              'The database translates this into an UPDATE on the underlying table automatically — as long as the view is simple enough.',
          },
        ],
        keyTakeaway:
          'A view is editable only if it maps rows 1-to-1 to a single underlying table with no aggregation or joins. If in doubt, try it — the database will give a clear error if it cannot do it.',
        exampleQuery:
          'UPDATE v_cheap_products SET price = 18.00 WHERE product_id = 3;',
        exampleQueryExplanation:
          'Because v_cheap_products reads from a single table with no aggregation, the database can update products directly through it.',
        liveDemoSql:
          'CREATE VIEW v_cheap_products AS\n  SELECT product_id, name, price FROM products WHERE price <= 20;\nUPDATE v_cheap_products SET price = 18.00 WHERE product_id = 3;\nSELECT * FROM products WHERE product_id = 3;',
        liveDemoNotes:
          'The UPDATE goes through the view and lands on the products table. Confirm with the final SELECT.',
        mcqs: [
          {
            question: 'Which view IS updatable (can accept INSERT/UPDATE)?',
            options: [
              'A. CREATE VIEW v AS SELECT customer_id, SUM(amount) FROM payments GROUP BY customer_id',
              'B. CREATE VIEW v AS SELECT order_id, status FROM orders WHERE status = "pending"',
              'C. CREATE VIEW v AS SELECT DISTINCT city FROM customers',
              'D. CREATE VIEW v AS SELECT o.order_id, c.name FROM orders o JOIN customers c ON o.customer_id = c.customer_id',
            ],
            correctIndex: 1,
            explanation:
              'Option B is a simple single-table view with only a WHERE filter — all rules for updatability are met. The others have GROUP BY, DISTINCT, or a JOIN.',
          },
        ],
        commonMistakes: [
          'Trying to UPDATE through a JOIN view — this always fails.',
          'Assuming all views are read-only — simple views ARE editable.',
        ],
      },
      tasks: [
        {
          id: 'day40-t1',
          title: 'Update Through a View',
          description:
            'Create a view v_pending_orders showing only pending orders, then update the status of order_id 1 to "shipped" through the view.',
          instructions: [
            "CREATE VIEW v_pending_orders AS SELECT order_id, customer_id, status FROM orders WHERE status = 'pending'",
            "UPDATE v_pending_orders SET status = 'shipped' WHERE order_id = 1",
            'Then SELECT from orders to confirm the change landed on the real table',
          ],
          type: 'guided',
          primaryTable: 'orders',
          initialSql:
            "-- Step 1: Create the view\n\n\n-- Step 2: Update through the view\n\n\n-- Step 3: Verify on the real table\n",
          solutionSql:
            "CREATE VIEW v_pending_orders AS\n  SELECT order_id, customer_id, status FROM orders WHERE status = 'pending';\nUPDATE v_pending_orders SET status = 'shipped' WHERE order_id = 1;\nSELECT order_id, status FROM orders WHERE order_id = 1;",
          solutionExplanation:
            'The UPDATE goes through the view and directly modifies the orders table. The final SELECT proves the change landed on the real table.',
          hints: [
            { level: 1, text: "After creating the view, write: UPDATE v_pending_orders SET status = 'shipped' WHERE order_id = 1;" },
            { level: 2, text: "UPDATE v_pending_orders SET status = 'shipped' WHERE order_id = 1;" },
          ],
          validation: { requireView: true, whereContainsTerms: ['UPDATE'] },
          successMessage: 'You just edited the real orders table through a view. Simple views are live portals into the real data.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — WITH CHECK OPTION
    // -------------------------------------------------------------------------
    {
      id: 'view-check-option',
      order: 2,
      title: 'WITH CHECK OPTION — Block Edits That Break the Rules',
      shortDescription: 'Add WITH CHECK OPTION to stop rows from sneaking outside the view filter.',
      theory: {
        summary:
          'There is a sneaky problem with editable views: you can INSERT or UPDATE a row so that it no longer matches the view filter — then it disappears from the view. WITH CHECK OPTION prevents this by rejecting any edit that would cause the row to fall outside the filter.',
        explanation: [
          'Without WITH CHECK OPTION, this works (but is surprising):',
          '```sql\nCREATE VIEW v_cheap_products AS\n  SELECT product_id, name, price FROM products WHERE price <= 20;\n\n-- This succeeds even though $999 is not "cheap":\nINSERT INTO v_cheap_products (product_id, name, price)\nVALUES (99, "Expensive Widget", 999.99);\n-- Row inserted into products, but vanishes from the view!\n```',
          'QUESTION_BLOCK::BEFORE::Why is it bad that the row disappears from the view after INSERT?',
          'QUESTION_BLOCK::AFTER::Because someone using the view as a "cheap products portal" just secretly inserted a $999 item into the real products table — without any warning.',
          'WITH CHECK OPTION fixes this:',
          '```sql\nCREATE VIEW v_cheap_products AS\n  SELECT product_id, name, price FROM products\n  WHERE price <= 20\n  WITH CHECK OPTION;\n\n-- This now FAILS with an error:\nINSERT INTO v_cheap_products (product_id, name, price)\nVALUES (99, "Expensive Widget", 999.99);\n-- Error: row does not satisfy the view WHERE condition\n```',
          'Think of WITH CHECK OPTION as a bouncer at the door: any INSERT or UPDATE must still pass the view filter, or it is rejected.',
        ],
        syntaxBlocks: [
          {
            title: 'WITH CHECK OPTION',
            sql: 'CREATE VIEW view_name AS\n  SELECT column1, column2\n  FROM table\n  WHERE condition\nWITH CHECK OPTION;',
            description:
              'Add WITH CHECK OPTION at the very end of the CREATE VIEW statement. Any INSERT or UPDATE that would violate the WHERE condition is rejected.',
          },
        ],
        keyTakeaway:
          'WITH CHECK OPTION blocks any INSERT or UPDATE through the view that would result in a row not satisfying the view filter. It prevents hidden data from slipping into the underlying table.',
        exampleQuery:
          "CREATE VIEW v_safe_cheap AS\n  SELECT product_id, name, price FROM products WHERE price <= 20\nWITH CHECK OPTION;",
        exampleQueryExplanation:
          'Any attempt to INSERT a product with price > 20 through this view will be rejected with an error.',
        liveDemoSql:
          "CREATE VIEW v_safe_cheap AS\n  SELECT product_id, name, price FROM products WHERE price <= 20\nWITH CHECK OPTION;\nINSERT INTO v_safe_cheap (product_id, name, price) VALUES (99, 'ExpensiveWidget', 999.99);",
        liveDemoNotes:
          'The INSERT should fail with a check option violation error. The products table is protected.',
        mcqs: [
          {
            question: 'What problem does WITH CHECK OPTION solve?',
            options: [
              'A. It stops users from querying the view',
              'B. It prevents rows from being inserted into the view that would not satisfy the view filter',
              'C. It blocks DROP VIEW commands',
              'D. It makes the view faster',
            ],
            correctIndex: 1,
            explanation:
              'WITH CHECK OPTION ensures every INSERT or UPDATE through the view must satisfy the same WHERE condition the view uses. Rows that would slip outside the filter are rejected.',
          },
        ],
        commonMistakes: [
          'Forgetting WITH CHECK OPTION — rows can silently slip through and pollute the real table.',
          'Placing WITH CHECK OPTION before WHERE — it must come at the very end of the CREATE VIEW statement.',
        ],
      },
      tasks: [
        {
          id: 'day40-t2',
          title: 'Create a View with CHECK OPTION',
          description:
            'Create a view v_active_customers that shows only customers from "New York". Add WITH CHECK OPTION so no customer from another city can be inserted through this view.',
          instructions: [
            'CREATE VIEW v_active_customers AS',
            "SELECT customer_id, name, city FROM customers WHERE city = 'New York'",
            'Add WITH CHECK OPTION at the end',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql:
            '-- Create v_active_customers for New York customers only\n-- Add WITH CHECK OPTION to protect the filter\n',
          solutionSql:
            "CREATE VIEW v_active_customers AS\n  SELECT customer_id, name, city\n  FROM customers\n  WHERE city = 'New York'\nWITH CHECK OPTION;",
          solutionExplanation:
            'The WITH CHECK OPTION at the end means any INSERT or UPDATE through v_active_customers must have city = "New York". Anything else is rejected.',
          hints: [
            { level: 1, text: 'Write the whole CREATE VIEW statement first, then add WITH CHECK OPTION on its own line at the very end.' },
            { level: 2, text: "CREATE VIEW v_active_customers AS SELECT customer_id, name, city FROM customers WHERE city = 'New York' WITH CHECK OPTION;" },
          ],
          validation: { requireView: true, requireWhere: true, whereContainsTerms: ['WITH CHECK OPTION'] },
          successMessage: 'The view is now protected. Any INSERT with a non-New York city will be blocked.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day40-t3',
          title: 'Verify the Check Option Works',
          description:
            'Using the v_active_customers view you created, try inserting a customer from "Boston". Observe that it is blocked. Then insert one from "New York" and confirm it succeeds.',
          instructions: [
            'First, create v_active_customers with WITH CHECK OPTION (reuse previous task)',
            "Try INSERT INTO v_active_customers (customer_id, name, city) VALUES (999, 'Bob', 'Boston') — expect an error",
            "Then try INSERT INTO v_active_customers (customer_id, name, city, email, signup_date) VALUES (998, 'Alice NY', 'New York', null, '2024-01-01') — expect success",
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql:
            "-- Step 1: Create v_active_customers with WITH CHECK OPTION\n\n\n-- Step 2: Try inserting Bob from Boston (should fail)\n-- INSERT INTO v_active_customers (customer_id, name, city) VALUES (999, 'Bob', 'Boston');\n\n-- Step 3: Insert valid customer from New York\n",
          solutionSql:
            "CREATE VIEW v_active_customers AS\n  SELECT customer_id, name, city FROM customers WHERE city = 'New York'\nWITH CHECK OPTION;\nINSERT INTO v_active_customers (customer_id, name, city, email, signup_date)\n  VALUES (998, 'Alice NY', 'New York', null, '2024-01-01');",
          solutionExplanation:
            'The Boston insert is blocked. The New York insert succeeds and lands in the real customers table.',
          hints: [
            { level: 1, text: 'Create the view with WITH CHECK OPTION, then write the INSERT statement for Alice NY.' },
            { level: 2, text: "INSERT INTO v_active_customers (customer_id, name, city, email, signup_date) VALUES (998, 'Alice NY', 'New York', null, '2024-01-01');" },
          ],
          validation: { requireView: true, whereContainsTerms: ['WITH CHECK OPTION'] },
          successMessage: 'The check option blocked the bad insert and allowed the valid one. Your view is self-enforcing!',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — CREATE OR REPLACE VIEW
    // -------------------------------------------------------------------------
    {
      id: 'view-replace',
      order: 3,
      title: 'Updating a View Without Dropping It',
      shortDescription: 'Use CREATE OR REPLACE VIEW to change a view definition in place.',
      theory: {
        summary:
          'Needs change. When your view definition is outdated, you can update it without going through DROP + CREATE. CREATE OR REPLACE VIEW overwrites the stored query in one step — if the view exists it is replaced, if it does not it is created fresh.',
        explanation: [
          'The full pattern:',
          '```sql\nCREATE OR REPLACE VIEW v_expensive_products AS\n  SELECT product_id, name, price, supplier_id\n  FROM products\n  WHERE price > 50;  -- changed from 30 to 50\n```',
          'QUESTION_BLOCK::BEFORE::If you use CREATE OR REPLACE VIEW on a view that does not exist yet, what happens?',
          'QUESTION_BLOCK::AFTER::It creates it — "OR REPLACE" just means: if there is already something with this name, replace it; otherwise create fresh.',
          'Important: you cannot change the number of columns or column names using OR REPLACE in some databases (PostgreSQL is stricter). In our engine and MySQL, you can replace the whole definition freely.',
          'When to use OR REPLACE: when you need to add a column to a view, change a filter threshold, or fix a bug in the stored query.',
        ],
        syntaxBlocks: [
          {
            title: 'CREATE OR REPLACE VIEW',
            sql: 'CREATE OR REPLACE VIEW view_name AS\n  SELECT column1, column2\n  FROM table\n  WHERE new_condition;',
            description:
              'If the view already exists, its definition is overwritten. If it does not exist, it is created. No DROP needed.',
          },
        ],
        keyTakeaway:
          'CREATE OR REPLACE VIEW updates a view definition in one statement — no need to DROP first. Safe and atomic.',
        exampleQuery:
          'CREATE OR REPLACE VIEW v_expensive_products AS\n  SELECT product_id, name, price, supplier_id\n  FROM products\n  WHERE price > 50;',
        exampleQueryExplanation:
          'Updates the view to use a higher price threshold ($50 instead of $30). Any existing code that queries v_expensive_products now gets the updated filter.',
        liveDemoSql:
          'CREATE VIEW v_expensive_products AS SELECT product_id, name, price FROM products WHERE price > 30;\nSELECT COUNT(*) FROM v_expensive_products;\nCREATE OR REPLACE VIEW v_expensive_products AS SELECT product_id, name, price FROM products WHERE price > 50;\nSELECT COUNT(*) FROM v_expensive_products;',
        liveDemoNotes:
          'The row count changes between the two SELECTs because the filter threshold was updated from $30 to $50.',
        mcqs: [
          {
            question: 'What does CREATE OR REPLACE VIEW do if the view already exists?',
            options: [
              'A. Returns an error — you must DROP it first',
              'B. Creates a second view with the same name',
              'C. Overwrites the existing view definition with the new one',
              'D. Renames the old view and creates a new one',
            ],
            correctIndex: 2,
            explanation:
              'CREATE OR REPLACE VIEW overwrites the existing definition in place — no DROP required, no data is lost.',
          },
        ],
        commonMistakes: [
          'Typing CREATE OR REPLACE TABLE by mistake — this syntax is for VIEWs.',
          'Forgetting that OR REPLACE also creates the view if it does not exist — it is safe in both cases.',
        ],
      },
      tasks: [
        {
          id: 'day40-t4',
          title: 'Replace a View Definition',
          description:
            'A view v_high_stock currently shows products with quantity_in_stock > 50. The threshold needs to change to > 100. Use CREATE OR REPLACE VIEW to update it.',
          instructions: [
            'First create the original view: v_high_stock where quantity_in_stock > 50',
            'Then use CREATE OR REPLACE VIEW v_high_stock to change the threshold to > 100',
            'Query v_high_stock to confirm fewer rows now appear',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the original view (quantity > 50)\n\n\n-- Step 2: Replace it with a stricter filter (quantity > 100)\n\n\n-- Step 3: Query to confirm\n',
          solutionSql:
            'CREATE VIEW v_high_stock AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products WHERE quantity_in_stock > 50;\nCREATE OR REPLACE VIEW v_high_stock AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products WHERE quantity_in_stock > 100;\nSELECT * FROM v_high_stock;',
          solutionExplanation:
            'The second statement replaces the stored query in place. The final SELECT now uses the new filter (> 100) and returns fewer rows.',
          hints: [
            { level: 1, text: 'Write CREATE OR REPLACE VIEW v_high_stock AS — then paste the new SELECT with the updated threshold.' },
            { level: 2, text: 'CREATE OR REPLACE VIEW v_high_stock AS SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock > 100;' },
          ],
          validation: { requireView: true, whereContainsTerms: ['OR REPLACE'] },
          successMessage: 'View definition updated in one step. No DROP, no data loss — just a clean replacement.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day40-challenge',
    title: 'Build a Protected Inventory Reporting View',
    scenario:
      'The warehouse team has a view for low-stock products (quantity < 10). It was built without protection, so a careless intern could accidentally insert a product with quantity 500 through it. Your job is to lock it down properly.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day40-ch1',
        title: 'Create the Protected Low-Stock View',
        description:
          'Create a view v_low_stock showing product_id, name, and quantity_in_stock for products where quantity_in_stock < 10. Add WITH CHECK OPTION to protect the filter.',
        instructions: [
          'CREATE VIEW v_low_stock AS',
          'SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 10',
          'WITH CHECK OPTION',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Create v_low_stock with protection\n',
        solutionSql:
          'CREATE VIEW v_low_stock AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products\n  WHERE quantity_in_stock < 10\nWITH CHECK OPTION;',
        solutionExplanation:
          'WITH CHECK OPTION ensures any INSERT or UPDATE through this view must have quantity_in_stock < 10. The warehouse team cannot accidentally use this view to insert well-stocked items.',
        hints: [
          { level: 1, text: 'Add WITH CHECK OPTION on the line after WHERE quantity_in_stock < 10.' },
          { level: 2, text: 'CREATE VIEW v_low_stock AS SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 10 WITH CHECK OPTION;' },
        ],
        validation: { requireView: true, requireWhere: true, whereContainsTerms: ['WITH CHECK OPTION'] },
        successMessage: 'Low-stock view is now protected. Only genuinely low-stock items can be inserted through it.',
        databaseLifecycle: 'fresh',
      },
      {
        id: 'day40-ch2',
        title: 'Upgrade the View With OR REPLACE',
        description:
          'The business changed the "low stock" threshold to < 5. Use CREATE OR REPLACE VIEW to update v_low_stock to the new threshold, keeping WITH CHECK OPTION in place.',
        instructions: [
          'Use CREATE OR REPLACE VIEW v_low_stock AS',
          'SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 5',
          'WITH CHECK OPTION',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql:
          'CREATE VIEW v_low_stock AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products WHERE quantity_in_stock < 10\nWITH CHECK OPTION;\n\n-- Now update the threshold to < 5 using OR REPLACE:\n',
        solutionSql:
          'CREATE VIEW v_low_stock AS\n  SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 10\nWITH CHECK OPTION;\nCREATE OR REPLACE VIEW v_low_stock AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products\n  WHERE quantity_in_stock < 5\nWITH CHECK OPTION;',
        solutionExplanation:
          'CREATE OR REPLACE VIEW updates the definition in place. The new threshold is < 5, and WITH CHECK OPTION is preserved to maintain protection.',
        hints: [
          { level: 1, text: 'Use CREATE OR REPLACE VIEW (not DROP + CREATE) to swap the definition.' },
          { level: 2, text: 'CREATE OR REPLACE VIEW v_low_stock AS SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 5 WITH CHECK OPTION;' },
        ],
        validation: { requireView: true, whereContainsTerms: ['OR REPLACE'] },
        successMessage: 'Threshold updated and protection preserved in a single clean statement!',
        databaseLifecycle: 'inherit',
      },
    ],
  },
};
