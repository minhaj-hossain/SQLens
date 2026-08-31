import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 32 - SECURITY & PRODUCTION SAFETY (id: day-32, order 32)
// -----------------------------------------------------------------------------
// The "ship it safely" day. Everything runs against the live seed database so
// the injection demos are REAL: the attack queries actually execute, return
// rows they should never return, and the fix is shown as the exact query a
// parameterized driver would produce.
//
//   C1 SQL Injection - the live demo   (bypass + UNION exfiltration, for real)
//   C2 The Fix                         (parameterized queries, whitelisting)
//   C3 Production Safety Drills        (transaction dry-runs, least privilege)
//
// Challenge (independent, fresh per task): replay the breach, ship the fix,
// then run a guarded migration drill.
// =============================================================================
export const Day_32_MODULE: ModuleData = {
  id: 'day-32',
  slug: 'security-production-safety',
  day: 32,
  title: 'Day 32 - Ship It Safely: Security & Production Practices',
  shortTitle: 'Security & Production',
  type: 'module',
  milestoneId: 'milestone-3',
  description:
    'See SQL injection attack actually succeed against a live database, then shut it down with parameterized queries and whitelisting. Master the production safety drills (transaction dry-runs, least privilege) that keep real systems safe.',
  estimatedMinutes: 70,
  completionLearnings: [
    'Understand how string concatenation lets attacker input become executable SQL',
    'Run a real authentication-bypass and a UNION-based data exfiltration query',
    'Rewrite vulnerable queries the way a parameterized driver would execute them',
    'Whitelist the places user input can never be parameterized (ORDER BY, table names)',
    'Dry-run destructive changes inside a transaction and commit only after verifying',
  ],
  concepts: [
    {
      id: 'sec-injection',
      order: 1,
      title: '1. SQL Injection: The Live Demo',
      shortDescription: "Build the vulnerable query the way naive code does - then watch the attack work.",
      theory: {
        summary:
          "Imagine the app builds its customer search by gluing the user's typed name straight into the SQL string. That is string concatenation, and it means the database cannot tell YOUR code apart from the ATTACKER's input - both arrive as one SQL string. In this concept you run the vulnerable query exactly as the attacker would send it, against a real database, and watch it return rows it was never supposed to return.",
        introTable: {
          tableName: 'Anatomy of the breach',
          description: 'The same query, before and after the payload is concatenated in.',
          columns: ['Code intent', 'Attacker types', 'SQL the database actually runs'],
          rows: [
            ['Find one customer by name', 'Rafiul Islam', "…WHERE name = 'Rafiul Islam'  (1 row - fine)"],
            ['Find one customer by name', "' OR '1'='1", "…WHERE name = '' OR '1'='1'  (EVERY row - breached)"],
          ],
        },
        explanation: [
          '### 1. The code the developer meant to write',
          'A search box takes a name and the backend builds SQL as a string: `"SELECT … WHERE name = \'" + input + "\'"`. With honest input like `Rafiul Islam`, this works perfectly - which is exactly why the flaw survives code review.',
          '### 2. The quote is a jailbreak',
          "The attacker's input begins with a single quote `'`. Because the code just glues text together, that quote **closes the string literal early**. Everything typed after it is no longer data - it is SQL the database will execute.",
          "### 3. The payload: `' OR '1'='1`",
          "The injected SQL becomes `WHERE name = '' OR '1'='1'`. For every row the second condition `'1'='1'` is true, so **every row passes the filter**. A login check built this way would log the attacker in as the first account in the table.",
          '### 4. Escalation: UNION-based exfiltration',
          'It gets worse. `UNION` appends a second result set to the same query, so the attacker can read a **completely different table** through the vulnerable endpoint: `… WHERE name = \'\' UNION SELECT name, contact_email FROM suppliers` pours supplier contact data into a customer-search response.',
        ],
        targetQuery: {
          sql: "SELECT customer_id, name, email\nFROM customers\nWHERE name = '' OR '1'='1';",
          explanation: 'The payload closed the string early and appended an always-true condition. Run it and every customer row comes back.',
          badge: 'The attack query - run it and watch it work',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Where concatenation happens',
            sqlSnippet: '"…WHERE name = \'" + input + "\'"',
            explanation: 'The backend has ONE string. User input and program logic are indistinguishable inside it.',
          },
          {
            stepNumber: 2,
            stepTitle: 'The payload breaks out of the literal',
            sqlSnippet: "name = '' OR '1'='1'",
            explanation: "The leading `'` ends the intended string; `OR '1'='1'` is a second, always-true condition the developer never wrote.",
          },
          {
            stepNumber: 3,
            stepTitle: 'The database just obeys',
            sqlSnippet: '15 of 15 customer rows returned',
            explanation: 'The engine sees valid SQL and executes it faithfully. The bug is not in the database - it is in how the string was built.',
          },
        ],
        keyTakeaway:
          "If user input is concatenated into SQL, input IS code. `' OR '1'='1` is not a special hack - it is just a quote closing a string early and an always-true condition riding along.",
        exampleQuery: "SELECT customer_id, name, email FROM customers WHERE name = '' OR '1'='1';",
        exampleQueryExplanation: 'The bypass payload, runnable right now: it returns all 15 customers instead of the 1 an honest search would.',
        mcqs: [
          {
            question: "What makes `' OR '1'='1` an authentication bypass?",
            options: [
              'A. It encrypts the password check',
              'B. It closes the string literal early and appends an always-true condition, so the WHERE clause matches every row',
              'C. It deletes the users table',
              'D. It slows the query down until the server times out',
            ],
            correctIndex: 1,
            explanation: "The quote escapes the intended literal; `OR '1'='1'` is true for every row, so the login check finds a 'match' immediately.",
          },
          {
            question: 'Why does string concatenation cause this?',
            options: [
              'A. Concatenation is too slow',
              'B. Because the database cannot distinguish program-authored SQL from attacker-authored text once they are one string',
              'C. Because SQL dislikes long strings',
              'D. It only happens with uppercase SQL',
            ],
            correctIndex: 1,
            explanation: 'After concatenation there is one string. The engine parses it as SQL - whichever part wrote it.',
          },
          {
            question: 'What does a UNION-based payload accomplish?',
            options: [
              'A. It speeds up the original query',
              'B. It appends rows from another table to the result set, exfiltrating data through the vulnerable endpoint',
              'C. It unions two databases',
              'D. It fixes the missing WHERE clause',
            ],
            correctIndex: 1,
            explanation: "UNION appends a second SELECT's rows to the result, so a customer-search endpoint can be made to pour out a different table entirely.",
          },
        ],
        commonMistakes: [
          'Thinking injection needs a special tool - the payload above is plain SQL you can type by hand.',
          'Blaming the database. The engine behaves correctly; the flaw is building SQL as one concatenated string.',
        ],
        masteryPoints: [
          'Trace a payload from user input to the final SQL string',
          'Predict what a concatenated query returns before running it',
        ],
      },
      tasks: [
        {
          id: 'sec-c1-t1',
          title: 'Task 1 (Guided): The honest query - what the app MEANT to run',
          description: 'First, establish the baseline: an honest search for a customer by name returns exactly one row.',
          instructions: [
            "Select `customer_id`, `name`, `email` from `customers`.",
            "Filter with `WHERE name = 'Rafiul Islam'` (the string the user typed).",
            'Expect exactly 1 row.',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: "-- This is what the backend runs when input is honest\n",
          solutionSql: "SELECT customer_id, name, email FROM customers WHERE name = 'Rafiul Islam';",
          solutionExplanation: 'With honest input, concatenation "works": one customer matches, one row returns. This is the behavior the attacker is about to abuse.',
          hints: [
            { level: 1, text: "SELECT customer_id, name, email FROM customers WHERE name = 'Rafiul Islam';" },
          ],
          validation: {
          requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 1 },
          successMessage: 'Baseline established: 1 honest input, 1 honest row.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c1-t2',
          title: "Task 2 (Independent): Run the attack - `' OR '1'='1`",
          description: "Now concatenate the attacker's payload instead of the honest name and run the result. Watch the WHERE clause collapse.",
          instructions: [
            "The user typed this into the search box: `\" OR '1'='1` (a quote, then OR, then an always-true comparison).",
            'Concatenated into the query, the filter becomes: `WHERE name = \'\' OR \'1\'=\'1\'`.',
            "Run it and count the rows that come back - it should be every customer.",
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: "-- The backend glues the typed text in and sends the whole thing\n",
          solutionSql: "SELECT customer_id, name, email FROM customers WHERE name = '' OR '1'='1';",
          solutionExplanation: "The quote closed the intended literal early; `OR '1'='1'` matches every row. 15 rows return where 1 was expected - the filter is gone.",
          hints: [
            { level: 1, text: "The WHERE clause is: WHERE name = '' OR '1'='1' - the string closes, then an always-true condition is OR-ed on." },
            { level: 2, text: "SELECT customer_id, name, email FROM customers WHERE name = '' OR '1'='1';" },
          ],
          validation: {
          requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 15 },
          successMessage: "Breach confirmed: the always-true condition returned all 15 customers. That is SQL injection, live.",
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c1-t3',
          title: 'Task 3 (Independent): Escalate - exfiltrate another table with UNION',
          description: 'Bypassing a filter is bad; reading a table the endpoint never owned is worse. Append a second SELECT with UNION and leak the suppliers.',
          instructions: [
            "Start from the bypass: `SELECT name, email FROM customers WHERE name = ''` (matches nothing on its own).",
            'Append `UNION SELECT name, contact_email FROM suppliers` so supplier rows ride along in the result.',
            'Expect 6 rows - every supplier, leaked through a customer-search endpoint.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          secondaryTables: ['suppliers'],
          initialSql: "-- One endpoint, two tables: the classic UNION exfiltration\n",
          solutionSql: "SELECT name, email FROM customers WHERE name = '' UNION SELECT name, contact_email FROM suppliers;",
          solutionExplanation: 'The empty first SELECT contributes 0 rows; UNION then appends all 6 supplier rows. The attacker just read a table the customer-search page never should have touched.',
          hints: [
            { level: 1, text: 'Both SELECTs must return the same number of columns - here 2 and 2, so the union is valid.' },
            { level: 2, text: "SELECT name, email FROM customers WHERE name = '' UNION SELECT name, contact_email FROM suppliers;" },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'customers',
            requireSetOp: 'UNION',
            requiredColumns: ['name', 'email'],
            expectedRowCount: 6,
          },
          successMessage: 'Exfiltration complete: 6 supplier records surfaced through a customer search. This is why injection is the #1 SQL risk.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'sec-parameterized',
      order: 2,
      title: '2. The Fix: Parameterized Queries',
      shortDescription: 'Separate code from data so a payload is only ever a value - plus whitelisting for the places parameters cannot go.',
      theory: {
        summary:
          "The fix is not 'escape the quotes better' - it is to stop mixing data into the SQL string at all. A parameterized query (prepared statement) sends the database a fixed template with placeholders like ? or $1, and sends the user's values separately, over the wire. The database compiles the template first and then plugs values in as pure data: a quote in the data is just a character in a string, never a jailbreak. For the few spots parameters cannot reach (table names, ORDER BY columns), the fix is a server-side whitelist.",
        introTable: {
          tableName: 'Same endpoint, three ways',
          description: 'How the search reaches the database under each coding style.',
          columns: ['Style', 'What the database receives', 'Result with payload input'],
          rows: [
            ['String concatenation', "one string: …name = '' OR '1'='1'", '15 rows - breached'],
            ['Parameterized', "template …name = ?  +  value: \"' OR '1'='1\"", "0 rows - the payload is just a weird name"],
            ['Hand-rolled escaping', "…name = '''' OR ''1''=''1''", "fragile - one missed code path and you are breached again"],
          ],
        },
        explanation: [
          '### 1. The template and the data travel separately',
          'A parameterized query has two parts: the SQL template with a placeholder - `WHERE name = ?` (or `$1`, `@name` depending on the driver) - and the list of values. The database parses and plans the template **first**, so its shape is fixed. Values are then bound as data and can never change that shape.',
          "### 2. Why the payload dies",
          "Bind the payload `' OR '1'='1` to `?` and the engine compares every customer's name against that **literal string**. It matches no one: 0 rows. The quote is a character inside a value, not the start of new SQL.",
          '### 3. Typed parameters protect numbers too',
          'Numeric fields are bound as actual numbers. A payload like `9 OR 1=1` is simply not a number - the driver rejects it before any SQL runs. No comparison, no bypass.',
          '### 4. The blind spots: whitelisting',
          'Parameters only work for **values**. A table name, a column name, or an `ORDER BY` direction is part of the SQL structure, so it cannot be a placeholder - concatenating it re-opens the hole. The rule there is a server-side **whitelist**: the backend only ever inserts column/direction names it wrote itself (e.g. map `sort=price` to the literal string `price`), never anything raw from the request.',
          '### 5. ORMs are not a free pass',
          'Query builders and ORMs (Prisma, SQLAlchemy, ActiveRecord…) use prepared statements under the hood - but their "raw query" escape hatches drop you right back into concatenation. The rule survives every abstraction: user input is a parameter or a whitelisted token, never a concatenated fragment.',
        ],
        targetQuery: {
          sql: 'SELECT customer_id, name, city\nFROM customers\nWHERE customer_id = 3;',
          explanation: 'The parameterized lookup with a bound numeric value. The SQL shape is fixed; 3 is data. Run the safe version and get exactly one row.',
          badge: 'What the driver executes after binding',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Parse the template first',
            sqlSnippet: 'SELECT … WHERE customer_id = ?   -- shape is fixed',
            explanation: 'The database compiles the statement with the placeholder in place. There is no string left for input to break out of.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Bind values as data',
            sqlSnippet: "bind(\"' OR '1'='1\")  →  compares as one literal string",
            explanation: 'Whatever the user typed is a value. Worst case, it matches nothing - it can never execute.',
          },
          {
            stepNumber: 3,
            stepTitle: 'Whitelist the structural parts',
            sqlSnippet: "const SORT_COLUMNS = { price: 'price', name: 'name' };",
            explanation: 'For ORDER BY / table names, translate user choices into server-side constants. Unknown choices are rejected, never concatenated.',
          },
        ],
        keyTakeaway:
          'Parameterize every value; whitelist every structural token. The database receives code from you and data from the user - and never the two mixed.',
        exampleQuery: "SELECT customer_id, name FROM customers WHERE name = 'Rafiul Islam';",
        exampleQueryExplanation: 'The bound-string version of the honest search - the quotes around Rafiul Islam were written by the driver, not assembled from user text.',
        mcqs: [
          {
            question: 'Why does a prepared statement stop the bypass payload?',
            options: [
              'A. It deletes special characters from the input',
              'B. The template is compiled before values are bound, so the payload is compared as a literal string and matches nothing',
              'C. It encrypts the query',
              'D. It runs the query twice and compares',
            ],
            correctIndex: 1,
            explanation: 'The SQL shape is fixed at parse time. Bound values are data; a quote inside them is just a character.',
          },
          {
            question: 'Which of these can NOT be a bound parameter?',
            options: [
              'A. A name in a WHERE clause',
              'B. A date in a WHERE clause',
              'C. An ORDER BY column name',
              'D. A price in an UPDATE',
            ],
            correctIndex: 2,
            explanation: 'Column and table names are part of SQL structure, not values - they need server-side whitelisting instead.',
          },
          {
            question: 'You use a modern ORM. Are you safe from injection?',
            options: [
              'A. Always - ORMs cannot run raw SQL',
              'B. Mostly - its normal query API parameterizes, but raw-query escape hatches can still concatenate user input',
              'C. Never - ORMs are always vulnerable',
              'D. Only if the database is PostgreSQL',
            ],
            correctIndex: 1,
            explanation: 'The parameterization happens inside the ORM. The moment you drop to its raw-SQL escape hatch, the old rules apply.',
          },
        ],
        commonMistakes: [
          'Escaping quotes by hand instead of parameterizing - it only takes one missed code path (a report, an export, a search) to re-open the hole.',
          'Parameterizing the WHERE values but concatenating the ORDER BY column straight from the request.',
        ],
        masteryPoints: [
          'Rewrite a concatenated query as template + bound values',
          'Know which positions need whitelisting instead of parameters',
        ],
      },
      tasks: [
        {
          id: 'sec-c2-t1',
          title: 'Task 1 (Guided): The bound-numeric lookup',
          description: 'The customer profile endpoint takes an id. Parameterized, the id arrives as an actual number - the SQL shape is fixed before any data shows up.',
          instructions: [
            'Select `customer_id`, `name`, `city` from `customers`.',
            'Filter with `WHERE customer_id = 3` - as if the driver had bound the integer 3.',
            'Expect exactly 1 row (Tanvir Ahmed).',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: "-- The template was compiled first; 3 arrived as a bound value\n",
          solutionSql: 'SELECT customer_id, name, city FROM customers WHERE customer_id = 3;',
          solutionExplanation: 'The placeholder was an integer position: whatever the request contained had to BE an integer to get here. The query shape cannot be changed by input.',
          hints: [
            { level: 1, text: 'SELECT customer_id, name, city FROM customers WHERE customer_id = 3;' },
          ],
          validation: {
          requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 1 },
          successMessage: 'One row, by design: the number was data, not code.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c2-t2',
          title: 'Task 2 (Independent): Feed the payload to the bound-string version',
          description: "Same attack, parameterized: the payload is bound as the *value* of name. Predict the row count before you run it.",
          instructions: [
            "The template is `WHERE name = ?` and the driver binds the raw payload text as the value.",
            'The executed SQL compares every name against the literal payload string: `WHERE name = \'\' OR \'1\'=\'1\'` is NOT what runs - instead the whole payload is ONE literal.',
            "Model it as an honest search for a name no customer has: `WHERE name = 'no such customer'` - and confirm it returns 0 rows.",
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: "-- Same payload, now bound as data. What comes back?\n",
          solutionSql: "SELECT customer_id, name FROM customers WHERE name = 'no such customer';",
          solutionExplanation: 'Bound as data, the payload is just a string no customer has. 0 rows - the attack is dead. The quotes in the SQL came from the driver, so input cannot create new ones.',
          hints: [
            { level: 1, text: 'The bound value is inert text. Searching for a name nobody has returns an empty result.' },
            { level: 2, text: "SELECT customer_id, name FROM customers WHERE name = 'no such customer';" },
          ],
          validation: {
          requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 0 },
          successMessage: '0 rows - the payload is now just an unusual name. Code and data are separated.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c2-t3',
          title: 'Task 3 (Independent): Whitelist the sort column',
          description: 'ORDER BY cannot take a parameter - so the backend whitelists it. You are the whitelist: only a server-side constant may reach the sort.',
          instructions: [
            'Select `product_id`, `name`, `price` from `products` where `category_id = 1` (Electronics).',
            'Sort by `price` ascending - the direction came from a whitelisted token, not the request.',
            'Expect 7 rows, cheapest first.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['categories'],
          initialSql: "-- sort column came from the whitelist: SORT_COLUMNS['price']\n",
          solutionSql: 'SELECT product_id, name, price FROM products WHERE category_id = 1 ORDER BY price ASC;',
          solutionExplanation: 'The WHERE value (1) is a bound parameter; the ORDER BY column came from a server-side whitelist. Both halves of the query are input-proof.',
          hints: [
            { level: 1, text: 'SELECT product_id, name, price FROM products WHERE category_id = 1 ORDER BY price ASC;' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requireWhere: true,
            requireOrderBy: [{ column: 'price', direction: 'ASC' }],
            expectedRowCount: 7,
          },
          successMessage: 'Values parameterized, structure whitelisted - the endpoint is sealed.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'sec-production',
      order: 3,
      title: '3. Production Safety Drills',
      shortDescription: 'Least privilege, transaction dry-runs, backups, and error hygiene - the habits that keep a live database alive.',
      theory: {
        summary:
          "Stopping injection is table stakes. Production safety is the surrounding discipline: give the application account the least power it needs, rehearse every destructive change inside a transaction before committing it, keep backups you have actually tested a restore from, and never let a database error leak your SQL to an end user. Each drill here is runnable: you will dry-run a risky UPDATE and prove the ROLLBACK erased it, then ship a guarded version that commits only what it should.",
        introTable: {
          tableName: 'The production safety checklist',
          description: 'Five habits, one line each - every one maps to a real incident class.',
          columns: ['Habit', 'What it prevents'],
          rows: [
            ['Least-privilege accounts', "a breached app account cannot DROP TABLE other people's data"],
            ['Transaction dry-runs', 'a bad UPDATE/DELETE mass-destroys rows in one unmonitored statement'],
            ['Tested backups', '"we have backups" is not the same as "we can restore"'],
            ['Error hygiene', 'raw SQL errors in responses hand attackers your schema'],
            ['Connection pooling', 'exhausted connections take the whole app down, not just one request'],
          ],
        },
        explanation: [
          '### 1. Least privilege: the app account is not a superuser',
          'If the web app connects as a role that can only `SELECT/INSERT/UPDATE/DELETE` on its own schema, then even a **successful** injection cannot `DROP TABLE payments` or read a colleague database. Power not granted is power that cannot be stolen. The same lens applies to columns: a reporting integration that only needs `name` and `price` should not be handed `SELECT *`.',
          '### 2. Dry-run destructive changes',
          'A mistyped `UPDATE` without a WHERE, or with the wrong one, rewrites thousands of rows in the time it takes to press Enter. The drill: open a transaction, run the change, **SELECT the affected rows to verify**, and only then `COMMIT` - otherwise `ROLLBACK`. Day 26 gave you the tool; this is its safety use.',
          '### 3. Backups you have restored',
          'A backup that has never been restored is a hope, not a plan. Schedule them, and rehearse the restore.',
          '### 4. Error hygiene',
          'A raw database error page that echoes the failed SQL hands an attacker your table and column names - free reconnaissance. Catch errors server-side, log the details, show the user a generic message.',
          '### 5. Connection pooling',
          'Opening a database connection per request is slow and collapses under load. A pool keeps connections warm and lends them out per query - the app-level counterpart to everything you have learned about round trips.',
        ],
        targetQuery: {
          sql: 'BEGIN;\nUPDATE products SET price = price * 0.5 WHERE category_id = 1;\nROLLBACK;\nSELECT COUNT(*) AS half_price FROM products WHERE price < 20;',
          explanation: 'The dry-run: halve every Electronics price inside a transaction, roll it back, then PROVE the table is untouched by counting rows under the new threshold.',
          badge: 'The dry-run pattern you will drill below',
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'BEGIN - changes are provisional',
            sqlSnippet: 'BEGIN;',
            explanation: 'From here, nothing is permanent. This is the safety net that makes rehearsal free.',
          },
          {
            stepNumber: 2,
            stepTitle: 'Run the risky change, then look at it',
            sqlSnippet: 'UPDATE … ; SELECT … ;',
            explanation: 'Inspect the rows the change would affect while still inside the transaction. Wrong? ROLLBACK costs nothing.',
          },
          {
            stepNumber: 3,
            stepTitle: 'COMMIT only after verification',
            sqlSnippet: 'ROLLBACK;  -- or COMMIT once verified',
            explanation: 'The undo proves the point: after ROLLBACK, the verification SELECT shows the pre-change world, byte for byte.',
          },
        ],
        keyTakeaway:
          'Least privilege caps the blast radius before anything goes wrong; transaction dry-runs cap it during the change. Both are habits, not tools you buy.',
        exampleQuery: 'BEGIN; UPDATE products SET price = price * 0.5 WHERE category_id = 1; ROLLBACK;',
        exampleQueryExplanation: 'The two-statement rehearsal: try the change, throw it away. COMMIT only replaces it once the verification SELECT looks right.',
        mcqs: [
          {
            question: 'Your app connects with a least-privilege role and gets breached via injection. What can the attacker NOT do?',
            options: [
              'A. Read tables the role may SELECT',
              'B. DROP TABLE payments, if the role was never granted DDL rights',
              'C. INSERT rows into tables the role may write',
              'D. Update rows the role may update',
            ],
            correctIndex: 1,
            explanation: 'Least privilege caps the blast radius: rights never granted cannot be abused, even after a successful injection.',
          },
          {
            question: 'What is the correct order for a destructive-change drill?',
            options: [
              'A. UPDATE, COMMIT, then check the rows',
              'B. BEGIN, UPDATE, SELECT to verify, then COMMIT or ROLLBACK',
              'C. SELECT, BEGIN, UPDATE',
              'D. Backup, UPDATE, pray',
            ],
            correctIndex: 1,
            explanation: 'Verify inside the transaction, while the change is still free to undo. COMMIT is the last step, taken only after the check passes.',
          },
          {
            question: 'Why show users a generic error instead of the raw database error?',
            options: [
              'A. Raw errors are too long for the UI',
              'B. Raw errors can echo the failed SQL, leaking table and column names to attackers',
              'C. Generic errors render faster',
              'D. Databases block error messages anyway',
            ],
            correctIndex: 1,
            explanation: 'Error messages are reconnaissance. Log the detail server-side; show the user nothing useful to an attacker.',
          },
        ],
        commonMistakes: [
          'Running the risky UPDATE "quickly" outside a transaction - the dry-run only protects you if the BEGIN comes first.',
          'Granting the app account admin "just to make the deploy work" and forgetting to revoke it.',
        ],
        masteryPoints: [
          'Dry-run a destructive UPDATE and prove ROLLBACK restored the table',
          'Write queries the way a least-privilege role would: only the columns you need',
        ],
      },
      tasks: [
        {
          id: 'sec-c3-t1',
          title: 'Task 1 (Guided): Dry-run a 50% discount - then prove the ROLLBACK erased it',
          description: 'Marketing wants every Electronics price halved. Before touching live data, rehearse it: BEGIN, UPDATE, ROLLBACK, then prove the table never changed.',
          instructions: [
            'Start a transaction with `BEGIN;`.',
            'Run `UPDATE products SET price = price * 0.5 WHERE category_id = 1;`.',
            'Undo it with `ROLLBACK;`.',
            'Prove the undo: `SELECT COUNT(*) AS half_price FROM products WHERE price < 20;` - expect 14 (the pre-change count). A committed update would have made it 17.',
          ],
          type: 'guided',
          primaryTable: 'products',
          secondaryTables: ['categories'],
          initialSql: '-- Dry-run: the discount is about to be rehearsed, not shipped\n',
          solutionSql:
            'BEGIN;\nUPDATE products SET price = price * 0.5 WHERE category_id = 1;\nROLLBACK;\nSELECT COUNT(*) AS half_price FROM products WHERE price < 20;',
          solutionExplanation: 'The UPDATE lived only inside the transaction. ROLLBACK restored every price, so the verification count (14) matches the pre-change world - the drill is free to repeat until the numbers look right.',
          hints: [
            { level: 1, text: 'BEGIN; UPDATE products SET price = price * 0.5 WHERE category_id = 1; ROLLBACK; SELECT COUNT(*) AS half_price FROM products WHERE price < 20;' },
            { level: 2, text: 'If you see 17, the UPDATE committed - the ROLLBACK must come before the verification SELECT.' },
          ],
          validation: {
            targetTable: 'products',
            customValidator: (parsed: any, result: any) => {
              const cnt = result?.rows?.[0]?.half_price ?? result?.rows?.[0]?.HALF_PRICE;
              return cnt === 14
                ? { valid: true }
                : { valid: false, message: `Expected 14 products under $20 after ROLLBACK (table unchanged). Got ${cnt ?? '?'}.` };
            },
          },
          successMessage: 'Dry-run complete and proven: 14 rows - the ROLLBACK erased the discount exactly.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c3-t2',
          title: 'Task 2 (Independent): Ship the guarded version - commit only what passed review',
          description: 'The dry-run looked right. Now ship the guarded change: a narrowed WHERE plus a COMMIT, and verify the final catalog state.',
          instructions: [
            'Begin a transaction, then run `UPDATE products SET price = price * 0.5 WHERE category_id = 1 AND price >= 20;` (only expensive Electronics are discounted).',
            'Commit it with `COMMIT;`.',
            'Verify: select `product_id`, `name`, `price` from `products` where `category_id = 1`, ordered by `price` ascending - expect 7 rows, all under $40.',
          ],
          type: 'independent',
          primaryTable: 'products',
          secondaryTables: ['categories'],
          initialSql: '-- Reviewed dry-run → narrowed WHERE → COMMIT\n',
          solutionSql:
            'BEGIN;\nUPDATE products SET price = price * 0.5 WHERE category_id = 1 AND price >= 20;\nCOMMIT;\nSELECT product_id, name, price FROM products WHERE category_id = 1 ORDER BY price ASC;',
          solutionExplanation: 'The guard `price >= 20` narrows the blast radius, the transaction makes it verifiable, and the final SELECT documents the shipped state: 7 Electronics rows, all under $40.',
          hints: [
            { level: 1, text: 'BEGIN; UPDATE … WHERE category_id = 1 AND price >= 20; COMMIT; then SELECT … WHERE category_id = 1 ORDER BY price ASC;' },
          ],
          validation: {
            targetTable: 'products',
            requireWhere: true,
            requireOrderBy: [{ column: 'price', direction: 'ASC' }],
            expectedRowCount: 7,
          },
          successMessage: 'Shipped and verified: the guarded discount is live, cheapest-first proof included.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'sec-c3-t3',
          title: 'Task 3 (Stretch): Think like a least-privilege reporting role',
          description: 'A read-only reporting integration needs two columns - not the whole table. Write the query the way a least-privilege account should run it.',
          instructions: [
            'Select only `name` and `price` from `products` (no `SELECT *`).',
            'Filter with `WHERE quantity_in_stock < reorder_level` - the items a purchasing officer must reorder.',
            'Expect 8 rows.',
          ],
          type: 'stretch',
          primaryTable: 'products',
          initialSql: "-- A reporting role with rights on two columns needs nothing more\n",
          solutionSql: 'SELECT name, price FROM products WHERE quantity_in_stock < reorder_level;',
          solutionExplanation: 'Least privilege in query form: exactly the two columns the report needs, so a breach of this integration exposes nothing else - no supplier ids, no stock counts.',
          hints: [
            { level: 1, text: 'SELECT name, price FROM products WHERE quantity_in_stock < reorder_level;' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requireWhere: true,
            requiredColumns: ['name', 'price'],
            expectedRowCount: 8,
          },
          successMessage: '8 low-stock items, two columns, zero excess exposure - least privilege, practiced.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],
  challenge: {
    id: 'day-32-homework',
    title: 'Day 32 - Security & Production Safety (Ending Activity)',
    scenario:
      'The security review came back with three findings on the storefront: the search endpoint concatenates input, the profile endpoint needs a parameterized rewrite, and the ops team ships UPDATEs with no rehearsal. Fix all three - replay the breach, ship the bound fix, and drill the guarded migration.',
    tasks: [
      {
        id: 'sec-ch-t1',
        title: 'Task 1: Replay the breach (so it never happens twice)',
        description: "Reproduce the finding: the email-search endpoint concatenates input. Run the attacker's payload against it and capture the evidence.",
        instructions: [
          "The endpoint builds: `SELECT customer_id, name, email FROM customers WHERE email = '<input>'`.",
          "Concatenated with the payload `' OR '1'='1`, the filter becomes `WHERE email = '' OR '1'='1'`.",
          'Run it and expect all 15 customers to come back - the evidence the review needs.',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Finding #1: reproduction of the concatenated email search\n',
        solutionSql: "SELECT customer_id, name, email FROM customers WHERE email = '' OR '1'='1';",
        solutionExplanation: "Same anatomy as the name-search bypass: the quote closes the literal early, `OR '1'='1'` matches every row, and all 15 customers leak.",
        hints: [
          { level: 1, text: "WHERE email = '' OR '1'='1' - the payload closes the string, then ORs on an always-true condition." },
        ],
        validation: {
        requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 15 },
        successMessage: 'Breach reproduced: 15 rows through an email lookup. Finding #1 confirmed.',
        databaseLifecycle: 'fresh',
      },
      {
        id: 'sec-ch-t2',
        title: 'Task 2: Ship the parameterized rewrite',
        description: 'Finding #2: the profile endpoint must take a bound id. Write the exact SQL the prepared statement produces for customer 7.',
        instructions: [
          'Select `customer_id`, `name`, `city` from `customers`.',
          'Filter with `WHERE customer_id = 7` - the template compiled first, 7 was bound as an integer.',
          'Expect exactly 1 row (Shakil Ahmed).',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Finding #2: the parameterized profile lookup\n',
        solutionSql: 'SELECT customer_id, name, city FROM customers WHERE customer_id = 7;',
        solutionExplanation: 'Template + bound value: the SQL shape is fixed at parse time, so no input can ever append SQL to this endpoint again.',
        hints: [
          { level: 1, text: 'SELECT customer_id, name, city FROM customers WHERE customer_id = 7;' },
        ],
        validation: {
        requireExactResult: true, targetTable: 'customers', requireWhere: true, expectedRowCount: 1 },
        successMessage: 'Finding #2 closed: one row by design, the id was data all along.',
        databaseLifecycle: 'fresh',
      },
      {
        id: 'sec-ch-t3',
        title: 'Task 3: Drill the guarded pending-order migration',
        description: "Finding #3: ops ships UPDATEs unrehearsed. Run the drill for real - begin, update pending orders placed before 2026-08-15 to 'shipped', commit, and verify.",
        instructions: [
          "Begin with `BEGIN;`.",
          "Run `UPDATE orders SET status = 'shipped' WHERE status = 'pending' AND order_date < '2026-08-15';`.",
          "Commit with `COMMIT;`.",
          "Verify: select `order_id`, `status` from `orders` where `status = 'shipped'`, ordered by `order_id` - expect exactly 4 rows.",
        ],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Finding #3: the rehearsed, guarded migration\n',
        solutionSql:
          "BEGIN;\nUPDATE orders SET status = 'shipped' WHERE status = 'pending' AND order_date < '2026-08-15';\nCOMMIT;\nSELECT order_id, status FROM orders WHERE status = 'shipped' ORDER BY order_id;",
        solutionExplanation: 'The date guard keeps the blast radius to exactly the two stale pending orders (2 and 8); the transaction made the change verifiable before COMMIT; the final SELECT documents the shipped state: orders 2, 4, 8, and 16.',
        hints: [
          { level: 1, text: "BEGIN; UPDATE orders SET status = 'shipped' WHERE status = 'pending' AND order_date < '2026-08-15'; COMMIT; then SELECT … WHERE status = 'shipped' ORDER BY order_id;" },
        ],
        validation: {
          targetTable: 'orders',
          requireWhere: true,
          requireOrderBy: [{ column: 'order_id', direction: 'ASC' }],
          expectedRowCount: 4,
        },
        successMessage: 'All three findings closed: breach reproduced, endpoints parameterized, migrations rehearsed and guarded.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};

