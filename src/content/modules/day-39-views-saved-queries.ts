import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 39 — Views: Saved Queries (id: day-39 — order 39)
// Milestone 4, Phase 1: Reusable Queries & Tree Exploration
//   C1 What a view is — save a query under a name
//   C2 Querying a view — use it like any table
//   C3 Dropping a view — clean up when no longer needed
// =============================================================================
export const Day_39_MODULE: ModuleData = {
  id: 'day-39',
  slug: 'views-saved-queries',
  day: 39,
  title: 'Day 39 — Views: Save a Query Under a Name',
  shortTitle: 'Views & Saved Queries',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'A view is a saved SELECT query that you can treat like a table. Instead of retyping a complex JOIN every time, you save it once as a view and anyone can query it with a simple SELECT. Learn to create, query, and drop views.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Create a view that wraps a complex query and gives it a simple name',
    'Query a view exactly like you query a table — no extra syntax',
    'Understand that a view is not a copy of the data — it re-runs the query live each time',
    'Drop a view when it is no longer needed',
  ],
  concepts: [
    {
      id: 'view-what-it-is',
      order: 1,
      title: 'What a View Is',
      shortDescription: 'A view is a saved query with a name — not a copy of the data.',
      theory: {
        summary:
          'A view saves a query under a name. Instead of retyping a complex JOIN every time, save it once as a view. The data is not copied — the view re-runs your query live each time someone queries it.',
        introTable: {
          tableName: 'products (sample)',
          description: 'The products table joined to suppliers is what we want to make reusable.',
          columns: ['product_id', 'name', 'price', 'supplier_id'],
          rows: [
            [1, 'Wireless Mouse', 15.99, 2],
            [2, 'Bluetooth Speaker', 45.5, 1],
            [3, 'USB-C Hub', 29.99, 2],
          ],
        },
        explanation: [
          'Think of a view like a saved search on your phone. You set it up once ("show me all unread emails from work") and every time you tap it, the phone runs that search live. The emails are not moved — the search just runs again.',
          'In SQL, the syntax is: CREATE VIEW view_name AS SELECT ...;',
          '```sql\nCREATE VIEW v_expensive_products AS\n  SELECT product_id, name, price\n  FROM products\n  WHERE price > 30;\n```',
          'QUESTION_BLOCK::BEFORE::If you INSERT a new expensive product into the products table, will it automatically show up when someone queries v_expensive_products?',
          'QUESTION_BLOCK::AFTER::Yes — because the view re-runs the SELECT live every time. There is no stale copy.',
          'The view name follows the same rules as a table name. A common convention is to prefix views with v_ so you can instantly tell them apart from real tables.',
          'Once created, a view appears in your schema just like a table. Other developers on your team can use it without knowing the underlying JOIN.',
        ],
        targetQuery: {
          sql: 'CREATE VIEW v_expensive_products AS\n  SELECT product_id, name, price\n  FROM products\n  WHERE price > 30;',
          explanation:
            'This saves the query "products costing more than $30" under the name v_expensive_products. From now on, any SELECT against v_expensive_products runs this filter automatically.',
          badge: 'The view we will create',
        },
        syntaxBlocks: [
          {
            title: 'CREATE VIEW',
            sql: 'CREATE VIEW view_name AS\n  SELECT column1, column2\n  FROM some_table\n  WHERE condition;',
            description:
              'Everything after AS is the stored query. The view name can be queried exactly like a table name.',
          },
        ],
        keyTakeaway:
          'A view is a saved query with a name. It stores instructions, not a copy of data, running the query fresh on every call.',
        exampleQuery:
          'CREATE VIEW v_expensive_products AS\n  SELECT product_id, name, price\n  FROM products\n  WHERE price > 30;',
        exampleQueryExplanation:
          'Creates the view. Nothing is returned — the view is just registered. You then SELECT from it like a table.',
        liveDemoSql:
          "CREATE VIEW v_expensive_products AS\n  SELECT product_id, name, price FROM products WHERE price > 30;",
        liveDemoNotes:
          'Run this to create the view. Then try: SELECT * FROM v_expensive_products; — you should get only the products over $30.',
        mcqs: [
          {
            question: 'When a view is queried, what does the database actually do?',
            options: [
              'A. It reads a pre-saved copy of the rows',
              'B. It runs the original stored SELECT query fresh',
              'C. It reads a file saved on disk',
              'D. It imports data from another database',
            ],
            correctIndex: 1,
            explanation:
              'A view stores the SQL instructions, not the data. Every query against the view re-executes the stored SELECT.',
          },
          {
            question: 'Which keyword starts the definition of what a view should return?',
            options: ['A. THEN', 'B. RETURNS', 'C. AS', 'D. FROM'],
            correctIndex: 2,
            explanation:
              'The pattern is: CREATE VIEW name AS SELECT ... The AS separates the view name from the stored query.',
          },
        ],
        commonMistakes: [
          'Thinking the view "copies" data — it does not. If the underlying table changes, the view reflects the change immediately.',
          'Forgetting the AS keyword between the view name and the SELECT.',
          'Trying to query a view that does not exist yet — you must CREATE it first.',
        ],
      },
      tasks: [
        {
          id: 'day39-t1',
          title: 'Create a Simple View',
          description:
            'Save a filtered product query as a view named v_affordable_products that shows only products priced at $20 or less.',
          instructions: [
            'Write CREATE VIEW v_affordable_products AS',
            'Follow it with a SELECT that picks product_id, name, and price from products',
            'Add a WHERE clause: price <= 20',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Create a view called v_affordable_products\n-- It should show: product_id, name, price\n-- Filter: price <= 20\n',
          solutionSql:
            'CREATE VIEW v_affordable_products AS\n  SELECT product_id, name, price\n  FROM products\n  WHERE price <= 20;',
          solutionExplanation:
            'CREATE VIEW registers the query under the name v_affordable_products. The WHERE clause makes sure only products at $20 or under appear when someone queries this view.',
          hints: [
            { level: 1, text: 'Start with CREATE VIEW v_affordable_products AS — then write your SELECT normally.' },
            { level: 2, text: 'SELECT product_id, name, price FROM products WHERE price <= 20' },
          ],
          validation: { requireView: true, requireWhere: true },
          successMessage: 'View created! You can now run SELECT * FROM v_affordable_products; to see the results.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'view-querying',
      order: 2,
      title: 'Querying a View Like a Table',
      shortDescription: 'Once created, a view works exactly like a regular table in any SELECT.',
      theory: {
        summary:
          'After creating a view, you query it exactly the same way you query any table. You can add WHERE, ORDER BY, LIMIT, JOINs — everything. The database transparently replaces the view name with its stored query before running yours.',
        explanation: [
          'Querying a view is no different from querying a table:',
          '```sql\n-- After creating the view:\nSELECT name, price\nFROM v_expensive_products\nORDER BY price DESC;\n```',
          'QUESTION_BLOCK::BEFORE::Can you filter a view with your own WHERE clause on top of the view built-in filter?',
          'QUESTION_BLOCK::AFTER::Yes. The database combines both conditions — the view internal WHERE and your outer WHERE both apply.',
          'You can even JOIN a view with a real table:',
          '```sql\nSELECT v.name, s.name AS supplier_name\nFROM v_expensive_products v\nJOIN suppliers s ON v.supplier_id = s.supplier_id;\n```',
          'The database does all the "unfolding" automatically. From your perspective, a view is just a table with a name.',
          'Views are especially useful in reporting tools (like Metabase or Tableau) that do not let you write complex SQL — you just point them at a clean view.',
        ],
        syntaxBlocks: [
          {
            title: 'Querying a view',
            sql: 'SELECT column1, column2\nFROM view_name\nWHERE extra_condition\nORDER BY column1;',
            description: 'A view name goes anywhere a table name goes. All clauses work normally.',
          },
        ],
        keyTakeaway:
          'A view behaves exactly like a table when you query it. You can filter, sort, join, and alias view columns just like table columns.',
        exampleQuery:
          'SELECT name, price FROM v_expensive_products ORDER BY price DESC;',
        exampleQueryExplanation:
          'Returns products from the view, sorted most expensive first. The database runs the view stored WHERE internally before applying your ORDER BY.',
        liveDemoSql:
          'CREATE VIEW v_expensive_products AS SELECT product_id, name, price, supplier_id FROM products WHERE price > 30;\nSELECT name, price FROM v_expensive_products ORDER BY price DESC;',
        liveDemoNotes:
          'First statement creates the view. Second queries it — notice you get only the filtered rows, sorted.',
        mcqs: [
          {
            question:
              'You have a view called v_vip_customers. Which query is valid?',
            options: [
              'A. OPEN VIEW v_vip_customers;',
              'B. SELECT * FROM v_vip_customers;',
              'C. FETCH v_vip_customers;',
              'D. READ FROM v_vip_customers;',
            ],
            correctIndex: 1,
            explanation: 'A view is queried with a plain SELECT ... FROM, exactly like a table.',
          },
        ],
        commonMistakes: [
          'Forgetting to create the view before querying it — you get a "table not found" error.',
          'Trying to use special syntax to "open" or "read" a view — it is just a SELECT.',
        ],
      },
      tasks: [
        {
          id: 'day39-t2',
          title: 'Query Your View',
          description:
            'The view v_affordable_products was just created. Query it to get all product names and prices, sorted cheapest first.',
          instructions: [
            'Keep the CREATE VIEW line at the top so the view exists in this run',
            'Write a SELECT below it that picks name and price from v_affordable_products',
            'Sort the results by price ascending (cheapest first)',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            'CREATE VIEW v_affordable_products AS\n  SELECT product_id, name, price FROM products WHERE price <= 20;\n\n-- Now query the view:\n',
          solutionSql:
            'CREATE VIEW v_affordable_products AS\n  SELECT product_id, name, price FROM products WHERE price <= 20;\nSELECT name, price FROM v_affordable_products ORDER BY price ASC;',
          solutionExplanation:
            'The CREATE VIEW line registers the view. The SELECT queries it like a normal table. The ORDER BY sorts results cheapest first.',
          hints: [
            { level: 1, text: 'After CREATE VIEW, write: SELECT name, price FROM v_affordable_products' },
            { level: 2, text: 'Add ORDER BY price ASC; at the end.' },
          ],
          validation: {
            requireView: true,
            requireOrderBy: [{ column: 'price', direction: 'ASC' }],
          },
          successMessage: 'You queried the view just like a table — that is all there is to it!',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day39-t3',
          title: 'Build a Multi-Table View',
          description:
            'Create a view v_order_summary that joins orders and customers, showing: order_id, customer name, and order_date.',
          instructions: [
            'Write CREATE VIEW v_order_summary AS',
            'SELECT order_id, customers.name AS customer_name, order_date',
            'FROM orders JOIN customers ON orders.customer_id = customers.customer_id',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['customers'],
          initialSql: '-- Create a view v_order_summary\n-- Columns: order_id, customer_name (alias), order_date\n',
          solutionSql:
            'CREATE VIEW v_order_summary AS\n  SELECT o.order_id, c.name AS customer_name, o.order_date\n  FROM orders o\n  JOIN customers c ON o.customer_id = c.customer_id;',
          solutionExplanation:
            'The view joins orders and customers. Anyone querying v_order_summary gets the combined result automatically — the JOIN is hidden inside the view.',
          hints: [
            { level: 1, text: 'Start with CREATE VIEW v_order_summary AS, then write your JOIN query.' },
            {
              level: 2,
              text: 'SELECT o.order_id, c.name AS customer_name, o.order_date FROM orders o JOIN customers c ON o.customer_id = c.customer_id',
            },
          ],
          validation: { requireView: true, requireJoin: true },
          successMessage:
            'A view wrapping a JOIN means other queries never need to know how orders and customers connect.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'view-drop',
      order: 3,
      title: 'Dropping (Deleting) a View',
      shortDescription: 'When you no longer need a view, remove it with DROP VIEW.',
      theory: {
        summary:
          'Just like you can DROP TABLE, you can DROP VIEW. This removes the saved query — not the underlying data. The real tables are completely unaffected.',
        explanation: [
          'Dropping a view is one line:',
          '```sql\nDROP VIEW v_expensive_products;\n```',
          'QUESTION_BLOCK::BEFORE::If you drop a view, does the underlying data in the products table get deleted?',
          'QUESTION_BLOCK::AFTER::No. A view is just a saved query. Dropping it removes only the name — the real table and its rows are untouched.',
          'You can also use DROP VIEW IF EXISTS to avoid an error if the view does not exist:',
          '```sql\nDROP VIEW IF EXISTS v_expensive_products;\n```',
          'When to drop a view: when the underlying query has changed so much the view is wrong, when a feature is retired, or to rename a view (drop + recreate with the new name).',
        ],
        syntaxBlocks: [
          {
            title: 'DROP VIEW',
            sql: 'DROP VIEW view_name;\n-- or safely:\nDROP VIEW IF EXISTS view_name;',
            description:
              'Removes the stored query. The underlying tables and their data remain untouched.',
          },
        ],
        keyTakeaway:
          'DROP VIEW removes the saved query name. The real data in the underlying tables is never touched.',
        exampleQuery: 'DROP VIEW IF EXISTS v_affordable_products;',
        exampleQueryExplanation:
          'Removes v_affordable_products from the schema. After this, querying it returns an error. The products table is unchanged.',
        liveDemoSql:
          'CREATE VIEW v_temp AS SELECT product_id FROM products WHERE price > 40;\nSELECT * FROM v_temp;\nDROP VIEW v_temp;\nSELECT * FROM v_temp;',
        liveDemoNotes:
          'Watch the last SELECT fail with "table not found" — the view was successfully dropped. The products data is still there.',
        mcqs: [
          {
            question: 'You run DROP VIEW v_sales_report. What happens to the orders table?',
            options: [
              'A. All rows in orders are deleted',
              'B. Nothing — the orders table is unchanged',
              'C. The orders table is also dropped',
              'D. The orders table is renamed',
            ],
            correctIndex: 1,
            explanation:
              'DROP VIEW only removes the stored query definition. The underlying tables and rows are completely unaffected.',
          },
        ],
        commonMistakes: [
          'Thinking DROP VIEW deletes data — it never does. Only the saved query is removed.',
          'Using DROP TABLE on a view by mistake — always use DROP VIEW for views.',
        ],
      },
      tasks: [
        {
          id: 'day39-t4',
          title: 'Drop a View',
          description:
            'Create a temporary view v_temp_report, confirm it works, then drop it.',
          instructions: [
            "Create v_temp_report as: SELECT order_id, status FROM orders WHERE status = 'shipped'",
            'Query from v_temp_report to confirm it works',
            'Run DROP VIEW v_temp_report to remove it',
          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql:
            "-- Step 1: Create the view\n\n\n-- Step 2: Query it\n\n\n-- Step 3: Drop it\n",
          solutionSql:
            "CREATE VIEW v_temp_report AS\n  SELECT order_id, status FROM orders WHERE status = 'shipped';\nSELECT * FROM v_temp_report;\nDROP VIEW v_temp_report;",
          solutionExplanation:
            'The three steps: create, verify, remove. After DROP VIEW, any query against v_temp_report will fail — the saved query no longer exists.',
          hints: [
            { level: 1, text: 'After confirming the view works, write DROP VIEW v_temp_report;' },
            { level: 2, text: 'Full drop: DROP VIEW v_temp_report;' },
          ],
          validation: { requireView: true },
          successMessage: 'You created and dropped a view cleanly. This is the full view lifecycle in SQL.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day39-challenge',
    title: 'Build a Reporting Layer with Views',
    scenario:
      'The business team needs two clean "windows" into the database for their weekly dashboard. They do not know SQL joins — they just want to run simple SELECTs. Your job is to build two views that hide all the complexity.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day39-ch1',
        title: 'High-Value Orders View',
        description:
          'Create a view v_high_value_orders showing order_id and total_value (SUM of quantity * unit_price) for orders where the total is over $100.',
        instructions: [
          'CREATE VIEW v_high_value_orders AS',
          'SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS total_value',
          'FROM orders o JOIN order_items oi ON o.order_id = oi.order_id',
          'GROUP BY o.order_id',
          'HAVING SUM(oi.quantity * oi.unit_price) > 100',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Create v_high_value_orders\n',
        solutionSql:
          'CREATE VIEW v_high_value_orders AS\n  SELECT o.order_id,\n         SUM(oi.quantity * oi.unit_price) AS total_value\n  FROM orders o\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY o.order_id\n  HAVING SUM(oi.quantity * oi.unit_price) > 100;',
        solutionExplanation:
          'The view wraps a JOIN + GROUP BY + HAVING. Any business user can now just run SELECT * FROM v_high_value_orders and get filtered, summed results instantly.',
        hints: [
          { level: 1, text: 'Think of this as a normal GROUP BY query wrapped inside CREATE VIEW ... AS.' },
          { level: 2, text: 'SUM(oi.quantity * oi.unit_price) > 100 goes in HAVING, not WHERE, because it is an aggregate.' },
        ],
        validation: { requireView: true, requireJoin: true, requireGroupBy: true, requireHaving: true },
        successMessage: 'The business team can now query v_high_value_orders without knowing about the JOIN or GROUP BY!',
        databaseLifecycle: 'fresh',
      },
      {
        id: 'day39-ch2',
        title: 'Customer Purchase Summary View',
        description:
          'Create a view v_customer_spend that shows each customer name and their total spend (SUM of payments.amount), joining customers and payments through orders.',
        instructions: [
          'CREATE VIEW v_customer_spend AS',
          'SELECT c.name AS customer_name, SUM(p.amount) AS total_spent',
          'FROM customers c JOIN orders o ON c.customer_id = o.customer_id',
          'JOIN payments p ON o.order_id = p.order_id',
          'GROUP BY c.customer_id, c.name',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        secondaryTables: ['orders', 'payments'],
        initialSql: '-- Create v_customer_spend\n',
        solutionSql:
          'CREATE VIEW v_customer_spend AS\n  SELECT c.name AS customer_name,\n         SUM(p.amount) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.customer_id = o.customer_id\n  JOIN payments p ON o.order_id = p.order_id\n  GROUP BY c.customer_id, c.name;',
        solutionExplanation:
          'The view chains two JOINs (customers to orders to payments) and aggregates spend per customer. The complexity is invisible to the view user.',
        hints: [
          { level: 1, text: 'You need two JOINs: customers to orders, and orders to payments.' },
          {
            level: 2,
            text: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN payments p ON o.order_id = p.order_id',
          },
        ],
        validation: { requireView: true, requireJoin: true, requireGroupBy: true },
        successMessage: 'Three-table join hidden inside a clean view — textbook encapsulation!',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
