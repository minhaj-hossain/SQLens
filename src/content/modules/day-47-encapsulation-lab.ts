import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 47 — Encapsulation Lab: Architecture & Decisions (id: day-47 — order 47)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   C1 Architectural decision-making — choosing the right tool for the job
//   T1 Build a reporting view (encapsulate joins)
//   T2 Build a pricing function (encapsulate formulas)
//   T3 Build an operational procedure (encapsulate actions)
// =============================================================================
export const Day_47_MODULE: ModuleData = {
  id: 'day-47',
  slug: 'encapsulation-lab',
  day: 47,
  title: 'Day 47 — Architecture Lab: Views, Functions, Procedures & Triggers',
  shortTitle: 'Encapsulation Lab',
  type: 'practice_day',
  milestoneId: 'milestone-4',
  description:
    'A practice lab designed to test your judgment: given a real-world engineering challenge, which database tool is the right one? You will build a view to hide messy joins, a function to standardize pricing math, and a procedure to manage operational updates.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Decide with confidence when to use a VIEW, FUNCTION, PROCEDURE, or TRIGGER',
    'Refactor complex join queries into clean, secure reporting views',
    'Encapsulate business pricing formulas inside scalar functions',
    'Package multi-step table mutations inside reliable stored procedures',
  ],
  concepts: [
    {
      id: 'encapsulation-decision-matrix',
      order: 1,
      title: 'Architectural Decision Matrix',
      shortDescription: 'How to pick the right database tool for every problem.',
      theory: {
        summary:
          'Software architecture is about putting code where it belongs. In modern database engineering, you have four core encapsulation tools. Choosing the right one keeps your codebase clean, fast, and secure.',
        introTable: {
          tableName: 'Database tool decision matrix',
          description: 'Quick reference for picking the right database construct.',
          columns: ['Construct', 'Returns', 'How It Runs', 'Best Used For'],
          rows: [
            ['VIEW', 'Virtual Table (rows)', 'SELECT * FROM view', 'Hiding complex joins, secure reporting portals'],
            ['FUNCTION', 'Single value', 'In SELECT / WHERE', 'Reusable math (tax, discounts, loyalty tiers)'],
            ['PROCEDURE', 'Status / affected rows', 'CALL procedure(args)', 'Multi-step actions (checkout, restock, archive)'],
            ['TRIGGER', 'Automatic side-effect', 'Fires on table event', 'Audit trails, history logging, compliance'],
          ],
        },
        explanation: [
          'Here is the simple mental framework to choose instantly:',
          '1. **Need a virtual table for reporting?** → Use a **VIEW**.',
          '2. **Need to calculate a single number or text string?** → Use a **FUNCTION**.',
          '3. **Need to perform multi-step database actions when called?** → Use a **PROCEDURE**.',
          '4. **Need something to happen automatically whenever data changes?** → Use a **TRIGGER**.',
          'QUESTION_BLOCK::BEFORE::If you need to calculate discounted prices in 10 different reports, should you use a view or a function?',
          'QUESTION_BLOCK::AFTER::A function! A function calculates the single price value and can be dropped into any report without changing the underlying table joins.',
        ],
        syntaxBlocks: [
          {
            title: 'The 4 Core Tools',
            sql: '-- 1. Virtual Table:\nCREATE VIEW v_report AS SELECT ...;\n\n-- 2. Formula:\nCREATE FUNCTION fn_calc(...) RETURNS ... RETURN ...;\n\n-- 3. Action Routine:\nCREATE PROCEDURE sp_action(...) BEGIN ... END;\n\n-- 4. Automated Hook:\nCREATE TRIGGER trg_hook AFTER UPDATE ON table ...;',
            description:
              'Each construct has a distinct purpose in production database design.',
          },
        ],
        keyTakeaway:
          'Match the construct to the problem: Views for queries, Functions for formulas, Procedures for actions, Triggers for automatic side-effects.',
        exampleQuery:
          'CREATE VIEW v_active_products AS SELECT product_id, name, price FROM products WHERE quantity_in_stock > 0;',
        exampleQueryExplanation:
          'A classic view pattern: saving a commonly used filtered dataset under a clean name.',
        liveDemoSql:
          'CREATE VIEW v_cheap AS SELECT product_id, name, price FROM products WHERE price < 20;\nSELECT * FROM v_cheap;',
        liveDemoNotes:
          'Shows the view in action.',
        mcqs: [
          {
            question: 'A team needs to automatically record historical price changes whenever an UPDATE occurs. What should they build?',
            options: [
              'A. A scalar function',
              'B. An event trigger',
              'C. A recursive CTE',
              'D. A composite index',
            ],
            correctIndex: 1,
            explanation:
              'Triggers execute automatically in response to table modifications, making them the ideal choice for audit logging.',
          },
        ],
        commonMistakes: [
          'Using a procedure when a simple function would do.',
          'Using a trigger for business logic that should be explicitly called by the application.',
        ],
      },
      tasks: [
        {
          id: 'day47-t1',
          title: 'Refactor Query into a Reusable View',
          description:
            'Create a view v_product_inventory that combines products and categories, showing: product_id, product name (aliased as product_name), category name (aliased as category_name), price, and quantity_in_stock. Then query it ordered by product_id ASC.',
          instructions: [
            'Write CREATE VIEW v_product_inventory AS',
            'SELECT p.product_id, p.name AS product_name, c.name AS category_name, p.price, p.quantity_in_stock',
            'FROM products p JOIN categories c ON p.category_id = c.category_id',
            'Query the view: SELECT * FROM v_product_inventory ORDER BY product_id ASC;',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories'],
          initialSql:
            '-- Step 1: Create the view\n\n\n-- Step 2: Query the view\n',
          solutionSql:
            'CREATE VIEW v_product_inventory AS\n  SELECT p.product_id, p.name AS product_name, c.name AS category_name, p.price, p.quantity_in_stock\n  FROM products p\n  JOIN categories c ON p.category_id = c.category_id;\nSELECT * FROM v_product_inventory ORDER BY product_id ASC;',
          solutionExplanation:
            'The view encapsulates the JOIN between products and categories. Querying v_product_inventory gives callers the clean merged data directly.',
          hints: [
            { level: 1, text: 'CREATE VIEW v_product_inventory AS SELECT p.product_id, p.name AS product_name, c.name AS category_name, p.price, p.quantity_in_stock FROM products p JOIN categories c ON p.category_id = c.category_id;' },
            { level: 2, text: 'Query it with: SELECT * FROM v_product_inventory ORDER BY product_id ASC;' },
          ],
          validation: {
            requireView: true,
            requireJoin: true,
            requireOrderBy: [{ column: 'product_id', direction: 'ASC' }],
          },
          successMessage: 'Messy join encapsulated in a clean reporting view!',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day47-t2',
          title: 'Encapsulate Fee Calculation into a Function',
          description:
            'Create a function fn_shipping_fee(item_price DECIMAL) that calculates shipping: returns 0.00 for items >= 50.00 (free shipping) and 5.99 for items under 50.00. Then query product_id, name, price, and fn_shipping_fee(price) AS shipping_fee from products where product_id <= 3.',
          instructions: [
            'Create fn_shipping_fee(item_price DECIMAL) RETURNS DECIMAL RETURN IF(item_price >= 50, 0, 5.99);',
            'SELECT product_id, name, price, fn_shipping_fee(price) AS shipping_fee FROM products WHERE product_id <= 3;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the shipping fee function\n\n\n-- Step 2: Query products with shipping fee\n',
          solutionSql:
            'CREATE FUNCTION fn_shipping_fee(item_price DECIMAL)\nRETURNS DECIMAL\nRETURN IF(item_price >= 50, 0, 5.99);\nSELECT product_id, name, price, fn_shipping_fee(price) AS shipping_fee\nFROM products\nWHERE product_id <= 3;',
          solutionExplanation:
            'The function implements the shipping rule. Any report can now call fn_shipping_fee without hardcoding the $50 threshold.',
          hints: [
            { level: 1, text: 'Use RETURN IF(item_price >= 50, 0, 5.99); inside the function body.' },
            { level: 2, text: 'SELECT product_id, name, price, fn_shipping_fee(price) AS shipping_fee FROM products WHERE product_id <= 3;' },
          ],
          validation: {
            requireCustomFunction: true,
            requireWhere: true,
            expectedRowCount: 3,
          },
          successMessage: 'Shipping rule encapsulated! All queries will compute shipping consistently.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day47-t3',
          title: 'Package an Inventory Adjustment Procedure',
          description:
            'Create a stored procedure sp_adjust_inventory(p_id INT, delta INT) that modifies quantity_in_stock by adding delta (can be positive for restock or negative for sale). Call it to add 10 units to product 1, then select product 1.',
          instructions: [
            'Create procedure: CREATE PROCEDURE sp_adjust_inventory(p_id INT, delta INT) BEGIN UPDATE products SET quantity_in_stock = quantity_in_stock + delta WHERE product_id = p_id; END;',
            'CALL sp_adjust_inventory(1, 10);',
            'SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create procedure\n\n\n-- Step 2: Call procedure\n\n\n-- Step 3: Verify\n',
          solutionSql:
            'CREATE PROCEDURE sp_adjust_inventory(p_id INT, delta INT)\nBEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + delta WHERE product_id = p_id;\nEND;\nCALL sp_adjust_inventory(1, 10);\nSELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;',
          solutionExplanation:
            'The procedure centralizes inventory adjustments so applications perform restocks and sales through a standard procedure call.',
          hints: [
            { level: 1, text: 'UPDATE products SET quantity_in_stock = quantity_in_stock + delta WHERE product_id = p_id;' },
            { level: 2, text: 'Follow with CALL sp_adjust_inventory(1, 10); and SELECT product_id, name, quantity_in_stock FROM products WHERE product_id = 1;' },
          ],
          validation: {
            requireProcedure: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Operational adjustment encapsulated in a clean procedure!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day47-challenge',
    title: 'Customer Tiering & Logging System',
    scenario:
      'Build a customer status audit system: whenever a customer city is changed, an automated trigger must log the customer_id, OLD.city, and NEW.city to a customer_audit table.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day47-ch1',
        title: 'Deploy Customer Relocation Trigger',
        description:
          'Create table customer_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT, old_city TEXT, new_city TEXT). Create an AFTER UPDATE trigger trg_audit_city on customers that logs customer_id, OLD.city, and NEW.city. Update customer 1 setting city = "San Francisco". Then query customer_audit.',
        instructions: [
          'Create table customer_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT, old_city TEXT, new_city TEXT);',
          'Create trigger trg_audit_city AFTER UPDATE ON customers FOR EACH ROW BEGIN INSERT INTO customer_audit (customer_id, old_city, new_city) VALUES (OLD.customer_id, OLD.city, NEW.city); END;',
          'UPDATE customers SET city = "San Francisco" WHERE customer_id = 1;',
          'SELECT customer_id, old_city, new_city FROM customer_audit;',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql:
          '-- Create audit table, trigger, update customer, and query log\n',
        solutionSql:
          'CREATE TABLE customer_audit (audit_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT, old_city TEXT, new_city TEXT);\nCREATE TRIGGER trg_audit_city AFTER UPDATE ON customers FOR EACH ROW\nBEGIN\n  INSERT INTO customer_audit (customer_id, old_city, new_city) VALUES (OLD.customer_id, OLD.city, NEW.city);\nEND;\nUPDATE customers SET city = "San Francisco" WHERE customer_id = 1;\nSELECT customer_id, old_city, new_city FROM customer_audit;',
        solutionExplanation:
          'The trigger automatically captures relocations in customer_audit whenever customer addresses are updated.',
        hints: [
          { level: 1, text: 'Use OLD.city and NEW.city in your INSERT statement inside the trigger.' },
          { level: 2, text: 'Follow the CREATE TABLE and CREATE TRIGGER with the UPDATE and the final SELECT from customer_audit.' },
        ],
        validation: {
          requireTrigger: true,
          expectedRowCount: 1,
        },
        successMessage: 'Full encapsulation loop completed: views, functions, procedures, and triggers are all in your toolkit!',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
