import { ModuleData } from '../../types/curriculum';

export const Day_06_MODULE: ModuleData = {
  id: 'day-06',
  slug: 'logical-query-processing-simple',
  day: 6,
  title: 'Day 6 — Visual Concept Lab: Logical Query Processing Order (Simple Pass)',
  shortTitle: 'Logical Query Processing (Simple)',
  type: 'conceptual_session',
  milestoneId: 'milestone-1',
  description: 'Understand the 5-step logical execution order: FROM → WHERE → SELECT → ORDER BY → LIMIT, and why WHERE cannot reference SELECT column aliases.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Explain the 5-step simple logical query processing order: FROM → WHERE → SELECT → ORDER BY → LIMIT',
    'Understand why WHERE cannot reference aliases defined in SELECT',
    'Distinguish between the standard logical execution model and database-specific syntax extensions (like MySQL)',
  ],
  concepts: [
    {
      id: 'simple-logical-order',
      order: 1,
      title: '1. The 5-Step Evaluation Lifecycle & Alias Visibility',
      shortDescription: 'FROM → WHERE → SELECT → ORDER BY → LIMIT.',
      theory: {
        summary: 'SQL queries are written starting with SELECT, but the database engine evaluates them in a completely different logical order. Understanding this lifecycle explains why column aliases created in SELECT cannot be used in WHERE.',
        introTable: {
          tableName: 'products',
          description: 'Sample products for execution tracing',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 25.00],
            [2, 'Mechanical Keyboard', 89.99],
            [6, '4K UltraHD Monitor', 349.99],
          ],
        },
        explanation: [
          '### 1. The Core Misconception',
          'Why does this query fail with an error?',
          '```sql\nSELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE taxed_price > 50;\n```',
          'Because the database does not evaluate `SELECT` first! It evaluates `WHERE` before `SELECT`.',
          '### 2. The 5-Step Evaluation Timeline',
          '1. **Step 1: `FROM products`** — The engine identifies and loads the source table.',
          '2. **Step 2: `WHERE ...`** — Individual rows are filtered. (*`taxed_price` does not exist yet!*)',
          '3. **Step 3: `SELECT ...`** — Specific columns are extracted, calculated, and assigned aliases.',
          '4. **Step 4: `ORDER BY ...`** — The resulting rows are sorted. (*Can see SELECT aliases!*)',
          '5. **Step 5: `LIMIT / OFFSET`** — The sorted output is sliced.',
        ],
        targetQuery: {
          sql: 'SELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE price * 1.15 > 50\nORDER BY taxed_price DESC\nLIMIT 5;',
          explanation: 'Find products with a taxed price over $50, sort highest first, and return the top 5.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: FROM products',
            sqlSnippet: 'FROM products',
            explanation: 'SQL identifies the products table with all records.',
            tableData: {
              tableName: 'products (Source Table)',
              columns: ['name', 'price'],
              rows: [
                ['Wireless Mouse', 25.00],
                ['Mechanical Keyboard', 89.99],
                ['4K UltraHD Monitor', 349.99],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: WHERE price * 1.15 > 50 (Filter using raw expression)',
            sqlSnippet: 'WHERE price * 1.15 > 50',
            explanation: 'SQL filters rows using raw math (the alias taxed_price is not created yet).',
            tableData: {
              tableName: 'Filtered Surviving Rows',
              columns: ['name', 'price'],
              rows: [
                ['Mechanical Keyboard', 89.99],
                ['4K UltraHD Monitor', 349.99],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: SELECT name, price * 1.15 AS taxed_price (Alias created)',
            sqlSnippet: 'SELECT name, price * 1.15 AS taxed_price',
            explanation: 'SQL computes the expression and assigns the alias taxed_price.',
            tableData: {
              tableName: 'Calculated Columns',
              columns: ['name', 'taxed_price'],
              rows: [
                ['Mechanical Keyboard', 103.49],
                ['4K UltraHD Monitor', 402.49],
              ],
            },
          },
          {
            stepNumber: 4,
            stepTitle: 'Step 4: ORDER BY taxed_price DESC (Alias is visible here)',
            sqlSnippet: 'ORDER BY taxed_price DESC',
            explanation: 'ORDER BY runs after SELECT, so it safely sees and sorts by taxed_price.',
            tableData: {
              tableName: 'Sorted Calculation',
              columns: ['name', 'taxed_price'],
              highlightedColumns: ['taxed_price'],
              rows: [
                ['4K UltraHD Monitor', 402.49],
                ['Mechanical Keyboard', 103.49],
              ],
            },
          },
          {
            stepNumber: 5,
            stepTitle: 'Step 5: LIMIT 5 (Slice final rows)',
            sqlSnippet: 'LIMIT 5',
            explanation: 'Takes the top 5 highest-priced rows.',
            tableData: {
              tableName: 'Final Query Result',
              columns: ['name', 'taxed_price'],
              highlightedColumns: ['name', 'taxed_price'],
              highlightedRows: [0, 1],
              rows: [
                ['4K UltraHD Monitor', 402.49],
                ['Mechanical Keyboard', 103.49],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Logical evaluation order',
            sql: '1. FROM table_name\n2. WHERE filter_condition (raw expressions)\n3. SELECT column_list (aliases created)\n4. ORDER BY sort_expression (can use aliases)\n5. LIMIT row_count;',
            description: 'The logical order of visibility across clauses.',
          },
        ],
        keyTakeaway: 'WHERE executes before SELECT (so WHERE cannot see SELECT aliases), while ORDER BY executes after SELECT.',
        exampleQuery: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
        exampleQueryExplanation: 'Uses raw math in WHERE and alias in ORDER BY.',
        liveDemoSql: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
        liveDemoNotes: 'Observes the full logical sequence in action.',
        mcqs: [
          {
            question: 'Why does `SELECT name, price * 1.15 AS taxed_price FROM products WHERE taxed_price > 50;` cause an error in standard SQL?',
            options: [
              'A. Because 1.15 is not a valid decimal',
              'B. Because the WHERE clause is evaluated at Step 2, before the SELECT clause creates the alias at Step 3',
              'C. Because AS is not allowed on calculated columns',
              'D. Because WHERE only accepts integer comparisons',
            ],
            correctIndex: 1,
            explanation: 'Logically, WHERE filters rows before SELECT creates column aliases.',
          },
        ],
        masteryPoints: ['Explain the 5-step execution lifecycle', 'Place aliases correctly in ORDER BY rather than WHERE'],
      },
      tasks: [
        {
          id: 'day06-c1-t1',
          title: 'Task 1 (Guided Fix): Fix the Alias in WHERE Error',
          description: 'Repair the broken query by placing the raw calculation in `WHERE` and using the alias in `ORDER BY`.',
          instructions: [
            'Select `name` and `price * 1.15 AS taxed_price` from `products`.',
            'Filter with `WHERE price * 1.15 > 50` (use raw math in WHERE).',
            'Sort by `taxed_price DESC` (use the alias in ORDER BY).',
            'Limit output to `5`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Fix the broken query below\nSELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE taxed_price > 50\nORDER BY taxed_price DESC\nLIMIT 5;',
          solutionSql: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
          solutionExplanation: 'Raw expression is evaluated in WHERE at Step 2; the alias taxed_price is used in ORDER BY at Step 4.',
          hints: [
            { level: 1, text: 'Replace `WHERE taxed_price > 50` with `WHERE price * 1.15 > 50`.' },
            { level: 2, text: 'Keep `ORDER BY taxed_price DESC LIMIT 5;` since ORDER BY runs after SELECT.' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requireOrderBy: [{ column: 'taxed_price', direction: 'DESC' }],
            requireLimit: 5,
            expectedRowCount: 5,
          },
          successMessage: 'Task 1 completed! Query repaired with correct clause visibility.',
        },
        {
          id: 'day06-c1-t2',
          title: 'Task 2 (Transfer): Customer Alias Sorting',
          description: 'Select customer name aliased as customer_name and city from customers in Dhaka, sorted by customer_name ASC.',
          instructions: [
            'Query the `customers` table.',
            'Select `name AS customer_name` and `city`.',
            "Filter where `city = 'Dhaka'`.",
            'Sort by `customer_name ASC`.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Select with alias in ORDER BY\n',
          solutionSql: "SELECT name AS customer_name, city FROM customers WHERE city = 'Dhaka' ORDER BY customer_name ASC;",
          solutionExplanation: 'WHERE uses actual column city; ORDER BY uses the created alias customer_name.',
          hints: [
            { level: 1, text: "Use `WHERE city = 'Dhaka'`." },
            { level: 2, text: "Add `ORDER BY customer_name ASC;`." },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['customer_name', 'city'],
            requiredAliases: { name: 'customer_name' },
            requireWhere: true,
            requireOrderBy: [{ column: 'customer_name', direction: 'ASC' }],
            expectedRowCount: 6,
          },
          successMessage: 'Task 2 completed! Clause execution order verified.',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 6 CHALLENGE: PREDICTION & ALIAS TRACING TEST (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'day-06-homework',
    title: 'Day 6 — Prediction & Alias Tracing Test (Ending Activity)',
    scenario: 'Demonstrate your mastery of the 5-step query processing order:',
    tasks: [
      {
        id: 'day06-hw-1',
        title: 'Task 1: Trace execution order with WHERE and ORDER BY',
        description: 'Select products with price > 40, alias price as catalog_price, order by catalog_price DESC, limit 5.',
        instructions: [
          'Select `name`, `price AS catalog_price` from `products` where `price > 40` order by `catalog_price DESC` limit 5.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Task 1: Trace execution order with WHERE and ORDER BY\n',
        solutionSql: 'SELECT name, price AS catalog_price FROM products WHERE price > 40 ORDER BY catalog_price DESC LIMIT 5;',
        solutionExplanation: 'Uses raw column in WHERE and alias in ORDER BY.',
        hints: [{ level: 1, text: 'Use `WHERE price > 40 ORDER BY catalog_price DESC LIMIT 5;`' }],
        validation: {
          targetTable: 'products',
          requireWhere: true,
          requireOrderBy: [{ column: 'catalog_price', direction: 'DESC' }],
          requireLimit: 5,
          expectedRowCount: 5,
        },
        successMessage: 'Challenge completed! Execution lifecycle verified.',
      },
    ],
  },
};
