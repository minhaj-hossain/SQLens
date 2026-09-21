import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 43 — Stored Functions: Custom Formulas (id: day-43 — order 43)
// Milestone 4, Phase 2: Automation, Procedures & Guardrails
//   C1 What a stored function is — save a calculation under a name
//   C2 Using custom functions in SELECT and WHERE
//   C3 Updating and dropping functions cleanly
// =============================================================================
export const Day_43_MODULE: ModuleData = {
  id: 'day-43',
  slug: 'stored-functions',
  day: 43,
  title: 'Day 43 — Custom Formulas: Writing Functions in SQL',
  shortTitle: 'Stored Functions',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'When you calculate tax, discounts, or fees across many queries, retyping the same math formula leads to bugs. Stored functions let you save a formula once under a name and call it anywhere in SQL like a built-in function.',
  estimatedMinutes: 55,
  completionLearnings: [
    'Create a custom scalar function using CREATE FUNCTION and RETURN',
    'Invoke custom functions inside SELECT lists and WHERE clauses',
    'Pass parameters into functions to compute dynamic results',
    'Update and remove functions safely using DROP FUNCTION',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — What a stored function is
    // -------------------------------------------------------------------------
    {
      id: 'function-what-it-is',
      order: 1,
      title: 'What a Stored Function Is',
      shortDescription: 'A stored function packages a calculation under a name and returns a single value.',
      theory: {
        summary:
          'You already know built-in SQL functions like ROUND(), UPPER(), and LENGTH(). A stored function is simply a custom function you write yourself. You give it parameters, write the formula, and it returns a single computed answer.',
        introTable: {
          tableName: 'products (sample)',
          description: 'We will use product prices to compute tax and discounts consistently.',
          columns: ['product_id', 'name', 'price'],
          rows: [
            [1, 'Wireless Mouse', 15.99],
            [2, 'Bluetooth Speaker', 45.5],
            [3, 'USB-C Hub', 29.99],
          ],
        },
        explanation: [
          'Every time you write a report, typing `price * 0.08` works. But what if the tax rate changes, or different items have different rules? If you copy-paste the formula in 20 queries, changing it means updating 20 places.',
          'With a stored function, you define the math once:',
          '```sql\nCREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL)\nRETURNS DECIMAL\nRETURN subtotal * tax_rate;\n```',
          'QUESTION_BLOCK::BEFORE::What is the primary difference between a VIEW and a FUNCTION?',
          'QUESTION_BLOCK::AFTER::A view stores a full query and returns a table of rows. A scalar function takes input parameters and returns a single computed value.',
          'The function name can be anything, but starting with `fn_` is a clean team habit. The `RETURNS` clause specifies what type of value comes out.',
        ],
        syntaxBlocks: [
          {
            title: 'CREATE FUNCTION',
            sql: 'CREATE FUNCTION function_name(param1 TYPE, param2 TYPE)\nRETURNS RETURN_TYPE\nRETURN formula_expression;',
            description:
              'Defines a custom formula. In MySQL and PostgreSQL, functions accept typed parameters and return a computed result.',
          },
        ],
        keyTakeaway:
          'A stored function accepts inputs, calculates a formula, and returns one value. Save formulas once so reports never disagree on math.',
        exampleQuery:
          'CREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL)\nRETURNS DECIMAL\nRETURN subtotal * tax_rate;',
        exampleQueryExplanation:
          'Registers the formula under fn_calculate_tax. You can now use fn_calculate_tax(price, 0.08) in any query.',
        liveDemoSql:
          'CREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL)\nRETURNS DECIMAL\nRETURN subtotal * tax_rate;\nSELECT name, price, fn_calculate_tax(price, 0.08) AS tax FROM products WHERE product_id = 1;',
        liveDemoNotes:
          'The first statement creates the formula. The second calls it on price with an 8% tax rate.',
        mcqs: [
          {
            question: 'What does a scalar stored function return?',
            options: [
              'A. A whole table of rows',
              'B. Exactly one computed value per call',
              'C. A list of column names',
              'D. A new database schema',
            ],
            correctIndex: 1,
            explanation:
              'A scalar function takes input arguments and returns a single value (number, text, or date) for each row it is called on.',
          },
        ],
        commonMistakes: [
          'Forgetting the RETURNS keyword — you must tell SQL what type comes out.',
          'Confusing a function with a view — a view returns a table of rows; a scalar function returns a single value.',
        ],
      },
      tasks: [
        {
          id: 'day43-t1',
          title: 'Create and Use a Tax Function',
          description:
            'Create a function named fn_calculate_tax that accepts subtotal and tax_rate, and returns subtotal * tax_rate. Then select product_id, name, and the calculated tax using a 10% rate (0.10) for product_id = 1.',
          instructions: [
            'Create the function: CREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL) RETURNS DECIMAL RETURN subtotal * tax_rate;',
            'Below it, write a SELECT picking product_id, name, and fn_calculate_tax(price, 0.10) AS tax FROM products WHERE product_id = 1;',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the tax function\n\n\n-- Step 2: Call it in a SELECT\n',
          solutionSql:
            'CREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL)\nRETURNS DECIMAL\nRETURN subtotal * tax_rate;\nSELECT product_id, name, fn_calculate_tax(price, 0.10) AS tax\nFROM products WHERE product_id = 1;',
          solutionExplanation:
            'The CREATE FUNCTION statement stores the formula. The SELECT invokes it with the product price and 0.10, yielding the calculated tax.',
          hints: [
            { level: 1, text: 'Think of CREATE FUNCTION like naming a math formula: provide the name, declare the incoming inputs (subtotal and tax_rate), specify the return type, and write the calculation after RETURN.' },
            { level: 2, text: 'In your SELECT, include fn_calculate_tax(price, 0.10) AS tax and filter with WHERE product_id = 1;' },
          ],
          validation: {
            requireCustomFunction: true,
            requireWhere: true,
            expectedRowCount: 1,
          },
          successMessage: 'Function created and invoked! The database calculated the tax using your custom formula.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Using functions in SELECT and WHERE
    // -------------------------------------------------------------------------
    {
      id: 'function-filtering',
      order: 2,
      title: 'Using Functions in SELECT and WHERE',
      shortDescription: 'Custom functions can be used anywhere an expression is valid.',
      theory: {
        summary:
          'Once a function is registered, you can use it in your SELECT list, your WHERE conditions, and your ORDER BY clauses. It behaves just like built-in functions like UPPER() or ROUND().',
        explanation: [
          'You can use a function to compute display values in SELECT:',
          '```sql\nSELECT name, fn_discounted_price(price, 15) AS sale_price\nFROM products;\n```',
          'QUESTION_BLOCK::BEFORE::Can you use a custom function inside a WHERE clause to filter rows?',
          'QUESTION_BLOCK::AFTER::Yes. You can write WHERE fn_discounted_price(price, 15) < 20 to find items whose sale price is under $20.',
          'Notice how readable the query is: anyone reading `WHERE fn_discounted_price(price, 15) < 20` instantly knows what business rule is being checked, without deciphering inline math.',
        ],
        syntaxBlocks: [
          {
            title: 'Function in WHERE clause',
            sql: 'SELECT column1, fn_name(column2, argument) AS computed\nFROM table_name\nWHERE fn_name(column2, argument) < threshold;',
            description:
              'Custom functions can be evaluated in filters just like column values.',
          },
        ],
        keyTakeaway:
          'Custom functions can appear in SELECT, WHERE, and ORDER BY. They make business logic readable and consistent across your application.',
        exampleQuery:
          'SELECT name, fn_calculate_tax(price, 0.05) AS tax FROM products WHERE fn_calculate_tax(price, 0.05) > 2;',
        exampleQueryExplanation:
          'Filters products where the 5% tax amount exceeds $2.00.',
        liveDemoSql:
          'CREATE FUNCTION fn_calc_tax(price DECIMAL, rate DECIMAL) RETURNS DECIMAL RETURN price * rate;\nSELECT name, price, fn_calc_tax(price, 0.05) AS tax FROM products WHERE fn_calc_tax(price, 0.05) > 2;',
        liveDemoNotes:
          'Shows products where the 5% tax is greater than $2.00.',
        mcqs: [
          {
            question: 'Where can a scalar stored function be called in SQL?',
            options: [
              'A. Only inside a CREATE VIEW statement',
              'B. Anywhere an expression or column is allowed: SELECT, WHERE, and ORDER BY',
              'C. Only at the very beginning of a script',
              'D. Only in DROP commands',
            ],
            correctIndex: 1,
            explanation:
              'Scalar functions evaluate to a value, so they can be placed anywhere a value or column is valid.',
          },
        ],
        commonMistakes: [
          'Passing the wrong number of arguments to the function.',
          'Expecting a scalar function to return multiple columns — it produces only one value per call.',
        ],
      },
      tasks: [
        {
          id: 'day43-t2',
          title: 'Calculate Discount and Filter',
          description:
            'Create a function fn_discount_price(price, discount_rate) that returns price * (1 - discount_rate). Then query products where the discounted price at a 20% discount (0.20) is less than $15. Show name, price, and the discounted price as sale_price.',
          instructions: [
            'Create fn_discount_price(price DECIMAL, discount_rate DECIMAL) RETURNS DECIMAL RETURN price * (1 - discount_rate);',
            'Write a SELECT picking name, price, and fn_discount_price(price, 0.20) AS sale_price from products',
            'Filter with WHERE fn_discount_price(price, 0.20) < 15',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the discount function\n\n\n-- Step 2: Query products with sale price under $15\n',
          solutionSql:
            'CREATE FUNCTION fn_discount_price(price DECIMAL, discount_rate DECIMAL)\nRETURNS DECIMAL\nRETURN price * (1 - discount_rate);\nSELECT name, price, fn_discount_price(price, 0.20) AS sale_price\nFROM products\nWHERE fn_discount_price(price, 0.20) < 15;',
          solutionExplanation:
            'The function computes price * (1 - discount_rate). The SELECT uses it both in the column list to display the sale price and in the WHERE clause to filter items under $15.',
          hints: [
            { level: 1, text: 'The formula in the function is: RETURN price * (1 - discount_rate);' },
            { level: 2, text: 'SELECT name, price, fn_discount_price(price, 0.20) AS sale_price FROM products WHERE fn_discount_price(price, 0.20) < 15;' },
          ],
          validation: {
            requireCustomFunction: true,
            requireWhere: true,
          },
          successMessage: 'You filtered rows using a custom formula directly in the WHERE clause!',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Dropping and replacing functions
    // -------------------------------------------------------------------------
    {
      id: 'function-cleanup',
      order: 3,
      title: 'Updating and Dropping Functions',
      shortDescription: 'Remove outdated functions using DROP FUNCTION.',
      theory: {
        summary:
          'When business rules change or a temporary formula is no longer needed, clean up your schema using DROP FUNCTION. You can also use DROP FUNCTION IF EXISTS to prevent errors if the function was already removed.',
        explanation: [
          'To remove a function:',
          '```sql\nDROP FUNCTION fn_calculate_tax;\n-- or safely:\nDROP FUNCTION IF EXISTS fn_calculate_tax;\n```',
          'QUESTION_BLOCK::BEFORE::If you drop a function, what happens to saved queries or views that called it?',
          'QUESTION_BLOCK::AFTER::Queries calling that function will fail with an error because the function no longer exists. Always check where a function is used before dropping it.',
          'To update a function, use CREATE OR REPLACE FUNCTION (or DROP then CREATE) to install the updated formula.',
        ],
        syntaxBlocks: [
          {
            title: 'DROP FUNCTION',
            sql: 'DROP FUNCTION IF EXISTS function_name;',
            description:
              'Removes the function definition from the schema.',
          },
        ],
        keyTakeaway:
          'Use DROP FUNCTION IF EXISTS to safely remove functions you no longer need.',
        exampleQuery: 'DROP FUNCTION IF EXISTS fn_calculate_tax;',
        exampleQueryExplanation:
          'Removes the fn_calculate_tax formula from the database.',
        liveDemoSql:
          'CREATE FUNCTION fn_temp(n INT) RETURNS INT RETURN n * 2;\nDROP FUNCTION IF EXISTS fn_temp;',
        liveDemoNotes:
          'Creates a temporary function and immediately drops it cleanly.',
        mcqs: [
          {
            question: 'What is the safe way to drop a function without erroring if it does not exist?',
            options: [
              'A. DROP FUNCTION FORCE name;',
              'B. DROP FUNCTION IF EXISTS name;',
              'C. DELETE FUNCTION name;',
              'D. REMOVE FUNCTION name;',
            ],
            correctIndex: 1,
            explanation: 'DROP FUNCTION IF EXISTS safely removes the function without throwing an error if it was already deleted.',
          },
        ],
        commonMistakes: [
          'Writing DELETE FUNCTION instead of DROP FUNCTION — functions are schema objects, not table rows.',
        ],
      },
      tasks: [
        {
          id: 'day43-t3',
          title: 'Create and Clean Up a Function',
          description:
            'Create a temporary function fn_double_price(val DECIMAL) that returns val * 2. Verify it by calling it in a SELECT on product_id = 1, then drop it with DROP FUNCTION.',
          instructions: [
            'Create fn_double_price(val DECIMAL) RETURNS DECIMAL RETURN val * 2;',
            'SELECT product_id, fn_double_price(price) AS doubled FROM products WHERE product_id = 1;',
            'Drop the function: DROP FUNCTION fn_double_price;',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Step 1: Create the function\n\n\n-- Step 2: Use it\n\n\n-- Step 3: Drop it\n',
          solutionSql:
            'CREATE FUNCTION fn_double_price(val DECIMAL) RETURNS DECIMAL RETURN val * 2;\nSELECT product_id, fn_double_price(price) AS doubled FROM products WHERE product_id = 1;\nDROP FUNCTION fn_double_price;',
          solutionExplanation:
            'The function is created, queried once, and then dropped cleanly so no leftover routine remains in the schema.',
          hints: [
            { level: 1, text: 'The three statements are CREATE FUNCTION ..., SELECT ..., and DROP FUNCTION fn_double_price;' },
            { level: 2, text: 'CREATE FUNCTION fn_double_price(val DECIMAL) RETURNS DECIMAL RETURN val * 2;\nSELECT product_id, fn_double_price(price) AS doubled FROM products WHERE product_id = 1;\nDROP FUNCTION fn_double_price;' },
          ],
          validation: {
            requireCustomFunction: true,
            whereContainsTerms: ['DROP FUNCTION'],
          },
          successMessage: 'You created, verified, and cleaned up a custom function!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day43-challenge',
    title: 'Standardizing Price Markup',
    scenario:
      'The store pricing team needs a standardized markup calculation: wholesale products get a 25% markup (price * 1.25) plus a flat $2.00 packaging fee. Build a reusable function for this policy and apply it to product reports.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day43-ch1',
        title: 'Build the Retail Markup Function',
        description:
          'Create a function fn_retail_price(cost DECIMAL) that returns (cost * 1.25) + 2.00. Then query all products showing product_id, name, price, and fn_retail_price(price) AS retail_price, sorted by retail_price descending.',
        instructions: [
          'Create fn_retail_price(cost DECIMAL) RETURNS DECIMAL RETURN (cost * 1.25) + 2.00;',
          'Query product_id, name, price, and fn_retail_price(price) AS retail_price FROM products',
          'Sort by retail_price DESC',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql:
          '-- Create fn_retail_price and query products\n',
        solutionSql:
          'CREATE FUNCTION fn_retail_price(cost DECIMAL)\nRETURNS DECIMAL\nRETURN (cost * 1.25) + 2.00;\nSELECT product_id, name, price, fn_retail_price(price) AS retail_price\nFROM products\nORDER BY retail_price DESC;',
        solutionExplanation:
          'The function encapsulates the markup and fee formula. The SELECT outputs the calculated retail price and sorts highest to lowest.',
        hints: [
          { level: 1, text: 'Define the function with RETURN (cost * 1.25) + 2.00;' },
          { level: 2, text: 'SELECT product_id, name, price, fn_retail_price(price) AS retail_price FROM products ORDER BY retail_price DESC;' },
        ],
        validation: {
          requireCustomFunction: true,
          requireOrderBy: [{ column: 'retail_price', direction: 'DESC' }],
        },
        successMessage: 'Pricing policy encapsulated! Every report calling fn_retail_price will always use the exact same markup formula.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
