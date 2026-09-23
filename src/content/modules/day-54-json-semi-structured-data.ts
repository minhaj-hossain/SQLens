import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 54 — JSON & Semi-Structured Data (id: day-54 — order 54)
// Milestone 4, Phase 4: Diagnose Then Scale
//   C1 Storing and Extracting JSON Attributes (JSON_EXTRACT & paths)
//   C2 Filtering on Nested Document Properties (WHERE with JSON)
//   C3 Relational vs Document Trade-offs & Clean Unquoting
// =============================================================================
export const Day_54_MODULE: ModuleData = {
  id: 'day-54',
  slug: 'json-semi-structured-data',
  day: 54,
  title: 'Day 54 — JSON & Semi-Structured Data in SQL',
  shortTitle: 'JSON & Semi-Structured Data',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'Not all business data fits into rigid tables. User settings, third-party webhook payloads, and flexible e-commerce specifications often change too fast for schema migrations. Modern relational databases include native JSON support so you can blend structured SQL tables with flexible document attributes.',
  estimatedMinutes: 65,
  completionLearnings: [
    'Store semi-structured JSON payloads inside relational columns',
    'Extract nested properties using JSON_EXTRACT() and standard JSON path syntax',
    'Cleanly unquote string values using JSON_UNQUOTE()',
    'Filter rows in WHERE clauses based on nested JSON attributes',
    'Evaluate architectural trade-offs: when to normalize vs when to use JSON',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — Extracting JSON with Paths
    // -------------------------------------------------------------------------
    {
      id: 'json-extract',
      order: 1,
      title: 'Extracting Properties with JSON_EXTRACT',
      shortDescription: 'Navigate nested document paths using the $.path notation.',
      theory: {
        summary:
          'JSON columns store JavaScript Object Notation text. To read a specific key from a JSON document, you use JSON_EXTRACT(column, \'$.key\') where $ represents the root of the JSON document.',
        explanation: [
          'Suppose you have a `preferences` column containing:',
          '```json\n{"theme": "dark", "notifications": true, "language": "en"}\n```',
          'Standard JSON path syntax:',
          '- `$.theme` -> Extracts `"dark"`',
          '- `$.notifications` -> Extracts `true`',
          '- `$.address.city` -> Extracts nested city object property',
          '- `$.tags[0]` -> Extracts the first element of a JSON array',
          'In MySQL and SQLite, `JSON_EXTRACT(preferences, \'$.theme\')` reads the value directly inside your SELECT list.',
          'QUESTION_BLOCK::BEFORE::What symbol represents the root object of a JSON document in SQL path expressions?',
          'QUESTION_BLOCK::AFTER::The dollar sign ($). All JSON path expressions begin with $.',
        ],
        syntaxBlocks: [
          {
            title: 'Extracting a JSON property',
            sql: 'SELECT\n  username,\n  JSON_EXTRACT(preferences, \'$.theme\') AS theme\nFROM user_profiles;',
            description:
              'JSON_EXTRACT takes the column name and the JSON path string ($ followed by dot notation).',
          },
        ],
        keyTakeaway:
          'Use JSON_EXTRACT(col, \'$.key\') to pull specific values out of JSON documents stored in table columns.',
        exampleQuery:
          "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}');\nSELECT username, JSON_EXTRACT(preferences, '$.theme') AS theme FROM user_profiles;",
        exampleQueryExplanation:
          'This query extracts the theme property from alice\'s preferences JSON.',
        liveDemoSql:
          "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');\nSELECT username, JSON_EXTRACT(preferences, '$.theme') AS theme FROM user_profiles;",
        liveDemoNotes:
          'Notice how theme is projected as a normal SQL column.',
        mcqs: [
          {
            question: 'What is the correct syntax to extract the "country" field from a JSON column named "shipping_address"?',
            options: [
              "A. JSON_EXTRACT(shipping_address, '$.country')",
              "B. EXTRACT(country FROM shipping_address)",
              "C. shipping_address.country",
              "D. GET_JSON('country', shipping_address)",
            ],
            correctIndex: 0,
            explanation:
              "JSON_EXTRACT takes the column and a path string starting with $. like '$.country'.",
          },
        ],
        commonMistakes: [
          'Forgetting the leading $. in the path string — \'theme\' is invalid path syntax; it must be \'$.theme\'.',
        ],
      },
      tasks: [
        {
          id: 'day54-t1',
          title: 'Store and Extract JSON Attributes',
          description:
            'Create a user_profiles table with a preferences JSON column, insert two profiles, and project each user\'s theme.',
          instructions: [
            'CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT)',
            "INSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}')",
            "SELECT id, username, JSON_EXTRACT(preferences, '$.theme') AS theme FROM user_profiles",
          ],
          type: 'guided',
          primaryTable: 'user_profiles',
          setupSql: '',
          initialSql: '-- Create table with JSON preferences and extract theme\n\n\n\n',
          solutionSql:
            "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');\nSELECT id, username, JSON_EXTRACT(preferences, '$.theme') AS theme FROM user_profiles;",
          solutionExplanation:
            'JSON_EXTRACT retrieves the theme property from the semi-structured JSON string.',
          hints: [
            { level: 1, text: "Use JSON_EXTRACT(preferences, '$.theme') AS theme in your SELECT list." },
            { level: 2, text: "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');\nSELECT id, username, JSON_EXTRACT(preferences, '$.theme') AS theme FROM user_profiles;" },
          ],
          validation: {             requiredColumns: ['id', 'username', 'preferences'],             requireSelect: true, expectedRowCount: 2,           },
          successMessage: 'JSON extracted successfully! You navigated the JSON path to project nested data.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Filtering on JSON Attributes
    // -------------------------------------------------------------------------
    {
      id: 'json-filtering',
      order: 2,
      title: 'Filtering on Nested JSON Keys',
      shortDescription: 'Use JSON_EXTRACT inside WHERE clauses to filter semi-structured data.',
      theory: {
        summary:
          'Just like scalar functions (UPPER, YEAR), JSON_EXTRACT can be placed directly inside a WHERE clause. This allows you to find rows matching specific nested criteria without having to alter the table schema.',
        explanation: [
          'Filtering on nested JSON:',
          '```sql\nSELECT id, username\nFROM user_profiles\nWHERE JSON_EXTRACT(preferences, \'$.theme\') = \'dark\';\n```',
          'This queries all users whose theme is set to dark.',
          'Notice how powerful this is: you can add new user preferences (e.g. `high_contrast`, `fontSize`, `beta_tester`) without running `ALTER TABLE ADD COLUMN` migrations on production!',
          'QUESTION_BLOCK::BEFORE::Can you combine a relational filter with a JSON filter in the same WHERE clause?',
          'QUESTION_BLOCK::AFTER::Yes! e.g. `WHERE id > 0 AND JSON_EXTRACT(preferences, \'$.theme\') = \'dark\'`. SQL treats extracted values like any other column expression.',
        ],
        syntaxBlocks: [
          {
            title: 'Filtering by JSON value',
            sql: "SELECT * FROM user_profiles\nWHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';",
            description:
              'Place JSON_EXTRACT in the WHERE condition and compare with the expected value.',
          },
        ],
        keyTakeaway:
          'You can filter by nested JSON properties inside WHERE clauses, giving you document-database flexibility inside relational tables.',
        exampleQuery:
          "SELECT id, username FROM user_profiles WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';",
        exampleQueryExplanation:
          'Matches only the profiles where the JSON theme key equals dark.',
        liveDemoSql:
          "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');\nSELECT id, username FROM user_profiles WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';",
        liveDemoNotes:
          'Only alice is returned.',
        mcqs: [
          {
            question: 'What is the main operational benefit of storing optional user settings in a JSON column?',
            options: [
              'A. JSON columns never use disk space',
              'B. New settings can be added without running ALTER TABLE schema migrations on production',
              'C. JSON columns enforce Foreign Key constraints automatically',
              'D. JSON columns disable transactions',
            ],
            correctIndex: 1,
            explanation:
              'Semi-structured columns allow flexible, polymorphic schema evolution without performing blocking DDL migrations.',
          },
        ],
        commonMistakes: [
          'Storing highly relational, frequently queried foreign keys inside JSON — keep core relationships in normalized relational columns.',
        ],
      },
      tasks: [
        {
          id: 'day54-t2',
          title: 'Filter Profiles by JSON Setting',
          description:
            'Query the user_profiles table and return only users who have preferences with theme equal to "dark".',
          instructions: [
            "SELECT id, username FROM user_profiles WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark'",
          ],
          type: 'guided',
          primaryTable: 'user_profiles',
          setupSql:
            "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT); INSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');",
          initialSql: '-- Find users with dark theme\n',
          solutionSql:
            "SELECT id, username FROM user_profiles WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';",
          solutionExplanation:
            "The WHERE condition JSON_EXTRACT(preferences, '$.theme') = 'dark' filters for alice.",
          hints: [
            { level: 1, text: "Filter using WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark'" },
          ],
          validation: { requireExactResult: true, requireSelect: true, expectedRowCount: 1 },
          successMessage: 'Filtered on nested JSON successfully! Only Alice matched the criteria.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Clean Unquoting & Trade-offs
    // -------------------------------------------------------------------------
    {
      id: 'json-unquote-tradeoffs',
      order: 3,
      title: 'Clean Text with JSON_UNQUOTE & Architecture Trade-offs',
      shortDescription: 'Remove quotes from extracted strings and know when to normalize vs when to use JSON.',
      theory: {
        summary:
          'In SQL, extracting a string from JSON often retains surrounding double quotes (e.g. \'"dark"\' instead of \'dark\'). JSON_UNQUOTE() strips these outer quotes to return clean plain text. Knowing when to use JSON versus normalized columns is a crucial architectural skill.',
        explanation: [
          '**When to use JSON in SQL:**',
          '- Volatile or dynamic attributes (e.g. customizable product specs, form builder fields).',
          '- Third-party API payload logs (e.g. Stripe webhook receipts, audit snapshots).',
          '- User preferences and UI state that are read as a whole object.',
          '**When NOT to use JSON:**',
          '- Foreign keys and relationships (use proper relational tables and foreign keys).',
          '- Quantities, prices, and numbers that need strict type checking or mathematical aggregates (SUM, AVG).',
          '- Highly queried search criteria on massive tables (unless using functional indexes).',
          'QUESTION_BLOCK::BEFORE::Why should financial totals or inventory quantities NOT be stored solely in JSON columns?',
          'QUESTION_BLOCK::AFTER::Because JSON columns do not enforce strict data types, CHECK constraints, or relational integrity, and aggregating them is slower than indexing native numeric columns.',
        ],
        syntaxBlocks: [
          {
            title: 'Unquoting JSON text',
            sql: "SELECT\n  username,\n  JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS clean_theme\nFROM user_profiles;",
            description:
              'JSON_UNQUOTE removes the outer quotes from a string value extracted from JSON.',
          },
        ],
        keyTakeaway:
          'JSON_UNQUOTE removes surrounding quotes from extracted JSON strings. Use JSON for dynamic, document-like attributes; keep core business entities normalized in relational columns.',
        exampleQuery:
          "SELECT username, JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS theme FROM user_profiles;",
        exampleQueryExplanation:
          'Returns clean unquoted text for theme.',
        liveDemoSql:
          "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT);\nINSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}');\nSELECT username, JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS theme FROM user_profiles;",
        liveDemoNotes:
          'The resulting string has no quotation marks.',
        mcqs: [
          {
            question: 'What is the result of applying JSON_UNQUOTE to the JSON string value \'"emerald"\'?',
            options: [
              'A. NULL',
              'B. \'emerald\' (plain text without quotes)',
              'C. [\'emerald\'] (array)',
              'D. Error',
            ],
            correctIndex: 1,
            explanation:
              'JSON_UNQUOTE unescapes and strips the surrounding JSON quotation marks from strings.',
          },
        ],
        commonMistakes: [
          'Comparing JSON strings with double quotes against plain strings without unquoting them.',
        ],
      },
      tasks: [
        {
          id: 'day54-t3',
          title: 'Extract and Unquote a JSON Attribute',
          description:
            'Query user_profiles to extract and unquote the theme property using JSON_UNQUOTE and JSON_EXTRACT.',
          instructions: [
            "SELECT id, username, JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS theme FROM user_profiles",
          ],
          type: 'independent',
          primaryTable: 'user_profiles',
          setupSql:
            "CREATE TABLE user_profiles (id INTEGER PRIMARY KEY, username TEXT, preferences TEXT); INSERT INTO user_profiles (id, username, preferences) VALUES (1, 'alice', '{\"theme\": \"dark\"}'), (2, 'bob', '{\"theme\": \"light\"}');",
          initialSql: '-- Extract clean unquoted theme\n',
          solutionSql:
            "SELECT id, username, JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS theme FROM user_profiles;",
          solutionExplanation:
            'Wrapping JSON_EXTRACT inside JSON_UNQUOTE produces clean string values without quotation marks.',
          hints: [
            { level: 1, text: "Use JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) AS theme" },
          ],
          validation: { requireExactResult: true, requireSelect: true, expectedRowCount: 2 },
          successMessage: 'Clean unquoted string extracted! Perfectly formatted for client consumption.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day54-challenge',
    title: 'E-Commerce Catalog Flexible Specifications',
    scenario:
      'An electronics retailer stores dynamic device specifications (like storage and color) in a JSON specs column. Query items with specific storage capacity.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day54-ch1',
        title: 'Filter Catalog by Dynamic JSON Attribute',
        description:
          'Create an items table with a specs JSON column, insert two items, and query for items where storage equals "256GB".',
        instructions: [
          'CREATE TABLE items (id INTEGER PRIMARY KEY, title TEXT, specs TEXT)',
          "INSERT INTO items (id, title, specs) VALUES (1, 'Pro Phone', '{\"storage\": \"256GB\", \"color\": \"black\"}'), (2, 'Mini Phone', '{\"storage\": \"128GB\", \"color\": \"white\"}')",
          "SELECT id, title, JSON_EXTRACT(specs, '$.storage') AS storage FROM items WHERE JSON_EXTRACT(specs, '$.storage') = '256GB'",
        ],
        type: 'challenge',
        primaryTable: 'items',
        setupSql: '',
        initialSql: '-- Create items table with JSON specs and filter by storage\n\n\n\n',
        solutionSql:
          "CREATE TABLE items (id INTEGER PRIMARY KEY, title TEXT, specs TEXT);\nINSERT INTO items (id, title, specs) VALUES (1, 'Pro Phone', '{\"storage\": \"256GB\", \"color\": \"black\"}'), (2, 'Mini Phone', '{\"storage\": \"128GB\", \"color\": \"white\"}');\nSELECT id, title, JSON_EXTRACT(specs, '$.storage') AS storage FROM items WHERE JSON_EXTRACT(specs, '$.storage') = '256GB';",
        solutionExplanation:
          'This extracts the storage capacity from specs and filters for 256GB items.',
        hints: [
          { level: 1, text: "Create table, insert the two rows, then filter WHERE JSON_EXTRACT(specs, '$.storage') = '256GB'." },
        ],
        validation: {
          requiredColumns: ['id', 'title', 'specs'], requireSelect: true, expectedRowCount: 1,
          judgment: [
            { kind: 'choose-and-defend', prompt: 'When does a JSON column make more sense than adding new columns?', options: ['When keys vary per row and change often, so schema churn would dominate', 'When the attributes need foreign keys', 'When the attributes must be NOT NULL', 'When you constantly GROUP BY every attribute'], correctIndex: 0, explanation: 'JSON fits sparse, per-row, fast-changing keys; anything you filter, join, constrain or aggregate regularly should be a real column.' },
          ],
        },
        successMessage: 'Challenge complete! Semi-structured JSON modeling gives you infinite flexibility without sacrificing SQL query power.',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
