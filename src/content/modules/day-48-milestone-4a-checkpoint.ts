import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 48 — Milestone 4A Checkpoint: Automation & Encapsulation (id: day-48 — order 48)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   Capstone assessment covering Days 39–47:
//   - Deliverable 1: Filtered Business Intelligence VIEW
//   - Deliverable 2: Reusable Pricing FUNCTION
//   - Deliverable 3: Operational Procedure with CALL
//   - Deliverable 4: Automated Change Tracking TRIGGER
// =============================================================================
export const Day_48_MODULE: ModuleData = {
  id: 'day-48',
  slug: 'milestone-4a-checkpoint',
  day: 48,
  title: 'Day 48 — Milestone 4A Checkpoint: Reusability, Automation & Safety',
  shortTitle: 'Milestone 4A Checkpoint',
  type: 'assignment',
  milestoneId: 'milestone-4',
  description:
    'The ultimate assessment for Milestone 4A: prove that you can build enterprise-grade database solutions independently. You will deploy a reporting view, write a custom pricing function, package a business procedure, and wire up an automatic audit trigger.',
  estimatedMinutes: 75,
  completionLearnings: [
    'Design and deploy production-ready reporting views',
    'Write reusable mathematical formulas inside custom stored functions',
    'Package multi-step workflows inside stored procedures called with CALL',
    'Implement automated audit trails using event triggers with OLD and NEW pseudo-records',
  ],
  concepts: [
    {
      id: 'm4a-assessment',
      order: 1,
      title: 'Milestone 4A Engineering Assessment',
      shortDescription: 'Four core deliverables testing real-world database architecture skills.',
      theory: {
        summary:
          'Over the last 10 days, you moved from writing one-off queries to engineering permanent database components: Views for query reusability, Recursive CTEs for tree structures, Functions for formulas, Procedures for actions, and Triggers for automatic logging. Now put all these pieces together.',
        targetQuery: {
          sql: 'SELECT * FROM v_high_value_orders;',
          explanation: 'The assessment query: read one encapsulated view that hides a JOIN + GROUP BY + HAVING pipeline.',
          badge: 'The first deliverable you query',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Read the encapsulated name',
            sqlSnippet: 'FROM v_high_value_orders',
            clause: 'FROM',
            explanation: 'The view name is all the assessment sends — the complexity lives in its stored definition.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The stored pipeline',
            sqlSnippet: 'SUM(oi.quantity * oi.unit_price) AS total_value',
            clause: 'JOIN',
            explanation: 'orders joins order_items and sums line totals per order inside the view.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: The stored threshold',
            sqlSnippet: 'HAVING SUM(oi.quantity * oi.unit_price) > 100',
            clause: 'HAVING',
            explanation: 'Only orders above $100 survive — the HAVING filter is part of the view, not the caller\'s job.',
          },
        ],
        introTable: {
          tableName: 'Milestone 4A Core Deliverables',
          description: 'The four database components you will construct.',
          columns: ['Deliverable', 'Tool', 'Key Objective'],
          rows: [
            ['1. Reporting View', 'CREATE VIEW', 'Encapsulate high-value order filtering'],
            ['2. Pricing Function', 'CREATE FUNCTION', 'Calculate dynamic customer discounts'],
            ['3. Operations Routine', 'CREATE PROCEDURE', 'Manage automated order completion'],
            ['4. Change Detection', 'CREATE TRIGGER', 'Log inventory adjustments automatically'],
          ],
        },
        explanation: [
          'No hints or hand-holding in this checkpoint. Read each business requirement carefully and write clean, idiomatic SQL.',
          '1. **View:** Must be queryable with a simple SELECT *.',
          '2. **Function:** Must take typed arguments and RETURN a computed scalar.',
          '3. **Procedure:** Must be executable via CALL with parameters.',
          '4. **Trigger:** Must fire automatically on mutations and inspect OLD and NEW records.',
        ],
        syntaxBlocks: [
          {
            title: 'Milestone 4A Toolset',
            sql: '-- 1. View\nCREATE VIEW v_name AS SELECT ...;\n-- 2. Function\nCREATE FUNCTION fn_name(...) RETURNS ... RETURN ...;\n-- 3. Procedure\nCREATE PROCEDURE sp_name(...) BEGIN ... END;\n-- 4. Trigger\nCREATE TRIGGER trg_name AFTER ... ON table FOR EACH ROW ...;',
            description:
              'The complete encapsulation toolset.',
          },
        ],
        keyTakeaway:
          'Enterprise database engineering combines views, routines, and triggers to build self-protecting, highly reusable data architectures.',
        exampleQuery: 'SELECT * FROM v_high_value_orders;',
        exampleQueryExplanation: 'Querying the view created in Deliverable 1.',
        liveDemoSql: 'SELECT product_id, name, price FROM products LIMIT 3;',
        liveDemoNotes: 'Reference sample data.',
        mcqs: [
          {
            question: 'Which construct is best suited to encapsulate a multi-table JOIN used in 15 different executive dashboards?',
            options: ['A. Event trigger', 'B. Stored view', 'C. Scalar function', 'D. SAVEPOINT'],
            correctIndex: 1,
            explanation:
              'Views are virtual tables designed to package reusable queries and hide complex joins from reporting layers.',
          },
        ],
        commonMistakes: [
          'Confusing function syntax (RETURNS TYPE) with procedure syntax.',
          'Forgetting FOR EACH ROW in trigger definitions.',
        ],
      },
      tasks: [
        {
          id: 'day48-t1',
          title: 'Deliverable 1: High-Value Orders View',
          description:
            'Create a view v_high_value_orders that exposes order_id, customer_id, status, and the order total aliased total_amount (SUM of quantity * unit_price) for orders whose total reaches 100 or more. Then query the view ordered by total_amount DESC.',
          instructions: [
            'Create view: CREATE VIEW v_high_value_orders AS SELECT o.order_id, o.customer_id, o.status, SUM(oi.quantity * oi.unit_price) AS total_amount FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_id, o.customer_id, o.status HAVING SUM(oi.quantity * oi.unit_price) >= 100;',
            'Query view: SELECT * FROM v_high_value_orders ORDER BY total_amount DESC;',
          ],
          type: 'assignment',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql:
            '-- Deliverable 1: High-value orders view\n',
          solutionSql:
            'CREATE VIEW v_high_value_orders AS\n  SELECT o.order_id, o.customer_id, o.status,\n         SUM(oi.quantity * oi.unit_price) AS total_amount\n  FROM orders o\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY o.order_id, o.customer_id, o.status\n  HAVING SUM(oi.quantity * oi.unit_price) >= 100;\nSELECT * FROM v_high_value_orders ORDER BY total_amount DESC;',
          solutionExplanation:
            'An order total is never stored on orders — it only exists as SUM(quantity * unit_price) over order_items, so the view hides a JOIN + GROUP BY behind one name, exactly like the Day-39 reporting layer. HAVING filters the aggregate (WHERE cannot) and the outer SELECT simply orders the 3 rows the view exposes.',
          hints: [
            { level: 1, text: 'CREATE VIEW v_high_value_orders AS ... first, then query it. The total is not a column on orders: SUM(oi.quantity * oi.unit_price) over a JOIN to order_items, filtered with HAVING — not WHERE.' },
            { level: 2, text: 'CREATE VIEW v_high_value_orders AS SELECT o.order_id, o.customer_id, o.status, SUM(oi.quantity * oi.unit_price) AS total_amount FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_id, o.customer_id, o.status HAVING SUM(oi.quantity * oi.unit_price) >= 100;\nSELECT * FROM v_high_value_orders ORDER BY total_amount DESC;' },
          ],
          validation: {
            requireView: true,
            requireJoin: true,
            requireGroupBy: true,
            requireHaving: true,
            requireOrderBy: [{ column: 'total_amount', direction: 'DESC' }],
          },
          successMessage: 'Deliverable 1 passed! High-value orders view deployed.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day48-t2',
          title: 'Deliverable 2: Loyalty Discount Function',
          description:
            'Create a scalar function fn_member_discount(base_price DECIMAL, discount_percent DECIMAL) that returns base_price * (1 - discount_percent / 100). Query product_id, name, price, and fn_member_discount(price, 15) AS discounted_price from products where product_id = 1.',
          instructions: [
            'Create function fn_member_discount(base_price DECIMAL, discount_percent DECIMAL) RETURNS DECIMAL RETURN base_price * (1 - discount_percent / 100);',
            'SELECT product_id, name, price, fn_member_discount(price, 15) AS discounted_price FROM products WHERE product_id = 1;',
          ],
          type: 'assignment',
          primaryTable: 'products',
          initialSql:
            '-- Deliverable 2: Loyalty discount function\n',
          solutionSql:
            'CREATE FUNCTION fn_member_discount(base_price DECIMAL, discount_percent DECIMAL)\nRETURNS DECIMAL\nRETURN base_price * (1 - discount_percent / 100);\nSELECT product_id, name, price, fn_member_discount(price, 15) AS discounted_price\nFROM products\nWHERE product_id = 1;',
          solutionExplanation:
            'The function standardizes the discount calculation. Querying product 1 computes its discounted price with 15% off.',
          hints: [
            { level: 1, text: 'Use RETURN base_price * (1 - discount_percent / 100); in the function body.' },
            { level: 2, text: 'Call fn_member_discount(price, 15) AS discounted_price in your SELECT query.' },
          ],
          validation: {
            requireCustomFunction: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Deliverable 2 passed! Reusable pricing function deployed.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day48-t3',
          title: 'Deliverable 3: Order Fulfillment Procedure',
          description:
            'Create a procedure sp_fulfill_shipment(target_id INT) that updates orders setting status = "shipped" WHERE order_id = target_id. Call it on order_id = 1, then select order_id and status from orders for order 1.',
          instructions: [
            'Create procedure: CREATE PROCEDURE sp_fulfill_shipment(target_id INT) BEGIN UPDATE orders SET status = "shipped" WHERE order_id = target_id; END;',
            'Call procedure: CALL sp_fulfill_shipment(1);',
            'Select order: SELECT order_id, status FROM orders WHERE order_id = 1;',
          ],
          type: 'assignment',
          primaryTable: 'orders',
          initialSql:
            '-- Deliverable 3: Order fulfillment procedure\n',
          solutionSql:
            'CREATE PROCEDURE sp_fulfill_shipment(target_id INT)\nBEGIN\n  UPDATE orders SET status = "shipped" WHERE order_id = target_id;\nEND;\nCALL sp_fulfill_shipment(1);\nSELECT order_id, status FROM orders WHERE order_id = 1;',
          solutionExplanation:
            'The procedure executes the shipment status update cleanly inside the database.',
          hints: [
            { level: 1, text: 'Follow the CREATE PROCEDURE statement with CALL sp_fulfill_shipment(1); and then the SELECT.' },
            { level: 2, text: 'CREATE PROCEDURE sp_fulfill_shipment(target_id INT) BEGIN UPDATE orders SET status = "shipped" WHERE order_id = target_id; END;\nCALL sp_fulfill_shipment(1);\nSELECT order_id, status FROM orders WHERE order_id = 1;' },
          ],
          validation: {
            requireProcedure: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Deliverable 3 passed! Fulfillment procedure executed and verified.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day48-t4',
          title: 'Deliverable 4: Inventory Change Trigger',
          description:
            'Create an audit table stock_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_qty INT, new_qty INT). Create an AFTER UPDATE trigger trg_audit_stock on products that inserts OLD.product_id, OLD.quantity_in_stock, and NEW.quantity_in_stock. Update product 1 to add 5 units of stock, then query stock_audit.',
          instructions: [
            'Create table: CREATE TABLE stock_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_qty INT, new_qty INT);',
            'Create trigger: CREATE TRIGGER trg_audit_stock AFTER UPDATE ON products FOR EACH ROW BEGIN INSERT INTO stock_audit (product_id, old_qty, new_qty) VALUES (OLD.product_id, OLD.quantity_in_stock, NEW.quantity_in_stock); END;',
            'Update product: UPDATE products SET quantity_in_stock = quantity_in_stock + 5 WHERE product_id = 1;',
            'Query log: SELECT product_id, old_qty, new_qty FROM stock_audit;',
          ],
          type: 'assignment',
          primaryTable: 'products',
          initialSql:
            '-- Deliverable 4: Inventory change trigger\n',
          solutionSql:
            'CREATE TABLE stock_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, old_qty INT, new_qty INT);\nCREATE TRIGGER trg_audit_stock AFTER UPDATE ON products FOR EACH ROW\nBEGIN\n  INSERT INTO stock_audit (product_id, old_qty, new_qty) VALUES (OLD.product_id, OLD.quantity_in_stock, NEW.quantity_in_stock);\nEND;\nUPDATE products SET quantity_in_stock = quantity_in_stock + 5 WHERE product_id = 1;\nSELECT product_id, old_qty, new_qty FROM stock_audit;',
          solutionExplanation:
            'The trigger captures inventory modifications with before-and-after values into stock_audit automatically.',
          hints: [
            { level: 1, text: 'Use OLD.quantity_in_stock and NEW.quantity_in_stock in the trigger body.' },
            { level: 2, text: 'Execute the table creation, trigger creation, product update, and audit select in sequence.' },
          ],
          validation: {
            requiredColumns: ['audit_id', 'product_id', 'old_qty', 'new_qty'],
            requireTrigger: true,
            expectedRowCount: 1,
          },
          successMessage: 'Deliverable 4 passed! Automated inventory audit trigger deployed.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day48-challenge',
    title: 'Milestone 4A Master Capstone',
    scenario:
      'The executive team requires a complete operational overhaul: create a view v_low_stock_alerts showing items with quantity_in_stock < 20, and write a procedure sp_emergency_reorder(min_stock INT) that increases stock by 50 for items below min_stock.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day48-ch1',
        title: 'Master Capstone Integration',
        description:
          'Create a view v_low_stock_alerts showing product_id, name, and quantity_in_stock where quantity_in_stock < 20. Then create a procedure sp_emergency_reorder(min_stock INT) that sets quantity_in_stock = quantity_in_stock + 50 WHERE quantity_in_stock < min_stock. Query the view before and after calling sp_emergency_reorder(20).',
        instructions: [
          'CREATE VIEW v_low_stock_alerts AS SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 20;',
          'CREATE PROCEDURE sp_emergency_reorder(min_stock INT) BEGIN UPDATE products SET quantity_in_stock = quantity_in_stock + 50 WHERE quantity_in_stock < min_stock; END;',
          'CALL sp_emergency_reorder(20);',
          'SELECT * FROM v_low_stock_alerts;',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql:
          '-- Master Capstone: View + Procedure\n',
        solutionSql:
          'CREATE VIEW v_low_stock_alerts AS\n  SELECT product_id, name, quantity_in_stock\n  FROM products\n  WHERE quantity_in_stock < 20;\nCREATE PROCEDURE sp_emergency_reorder(min_stock INT)\nBEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + 50 WHERE quantity_in_stock < min_stock;\nEND;\nCALL sp_emergency_reorder(20);\nSELECT * FROM v_low_stock_alerts;',
        solutionExplanation:
          'The view monitors low-stock alerts and the procedure resolves them in one call. Because all items below 20 were increased by 50, the final view returns 0 low-stock items.',
        hints: [
          { level: 1, text: 'First CREATE VIEW ..., then CREATE PROCEDURE ..., then CALL ..., and finally SELECT * FROM v_low_stock_alerts;' },
          { level: 2, text: 'CREATE VIEW v_low_stock_alerts AS SELECT product_id, name, quantity_in_stock FROM products WHERE quantity_in_stock < 20;\nCREATE PROCEDURE sp_emergency_reorder(min_stock INT) BEGIN UPDATE products SET quantity_in_stock = quantity_in_stock + 50 WHERE quantity_in_stock < min_stock; END;\nCALL sp_emergency_reorder(20);\nSELECT * FROM v_low_stock_alerts;' },
        ],
        validation: {
          judgment: [             { kind: 'diagnose-plan', prompt: 'An audit table must record every price change even if the application forgets. Where does that logic belong?', options: ['In an AFTER UPDATE trigger - it runs inside the database on every qualifying write', 'In each client application front end', 'In the view definition used for reports', 'In a monthly batch script'], correctIndex: 0, explanation: 'A trigger is the only option here that executes within the database on every qualifying write, independent of which client made the change.' },           ],
          requireView: true,
          requireProcedure: true,
        },
        successMessage: 'Milestone 4A Master Capstone Complete! You have mastered views, functions, procedures, and triggers!',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
