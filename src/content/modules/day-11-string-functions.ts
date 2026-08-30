import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 11 — String Functions  (id: string-functions · order 11)
// Atomic chain: C1 UPPER/LOWER → C2 TRIM → C3 CONCAT → C4 SUBSTRING → C5 LENGTH
// =============================================================================
export const Day_11_MODULE: ModuleData = {
  id: 'string-functions',
  slug: 'string-functions',
  day: 0, // legacy positional field — ordering uses curriculumOrder (Day 11)
  title: 'Day 11 — String Functions: Shaping Text',
  shortTitle: 'String Functions',
  type: 'module',
  milestoneId: 'milestone-2',
  description: 'Transform text at query time: normalize case, clean whitespace, assemble display strings, extract substrings, and measure text length — without ever modifying the stored data.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Normalize case with UPPER() and LOWER(), in SELECT and in WHERE',
    'Clean whitespace with TRIM()',
    'Assemble display strings from columns and literals with CONCAT()',
    'Extract text portions with SUBSTRING() and measure them with LENGTH()',
  ],
  concepts: [
    {
      id: 'upper-lower',
      order: 1,
      title: '1. UPPER / LOWER: Controlling Case',
      shortDescription: 'Normalize text case at query time.',
      theory: {
        summary: 'The email client needs every name in CAPITALS for a shipping manifest; the analytics sheet needs emails lowercased. The database stores names as typed ("Rafiul Islam") — rewriting 15 rows for one report would be madness. Case is a display concern, and display belongs in the query.',
        introTable: {
          tableName: 'customers',
          description: 'A few customers — names as typed, emails lowercase',
          columns: ['customer_id', 'name', 'email'],
          rows: [
            [1, 'Rafiul Islam', 'rafiul@example.com'],
            [2, 'Priya Akter', 'priya.akter@example.com'],
            [3, 'Tanvir Ahmed', null],
          ],
        },
        explanation: [
          'UPPER() and LOWER() wrap a column the way a function wraps a number — they return a transformed copy of every value:',
          '```sql\nSELECT UPPER(name) AS name_upper, LOWER(email) AS email_lower\nFROM customers;\n```',
          'They work in WHERE too — `WHERE UPPER(city) = \'DHAKA\'` matches Dhaka, DHAKA and dhaka at once. That is the classic case-insensitive comparison trick.',
        ],
        targetQuery: {
          sql: "SELECT UPPER(name) AS name_upper, LOWER(email) AS email_lower\nFROM customers;",
          explanation: 'Two normalized copies of the text columns, original data untouched.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The function receives each value and returns a copy',
            sqlSnippet: 'UPPER(name) AS name_upper',
            explanation: 'Row by row: \'Rafiul Islam\' → \'RAFIUL ISLAM\'. The customers table itself is never modified.',
            tableData: {
              tableName: 'Transformation',
              columns: ['name (stored)', 'UPPER(name)'],
              highlightedColumns: ['UPPER(name)'],
              rows: [
                ['Rafiul Islam', 'RAFIUL ISLAM'],
                ['Priya Akter', 'PRIYA AKTER'],
                ['Tanvir Ahmed', 'TANVIR AHMED'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: LOWER does the mirror job',
            sqlSnippet: 'LOWER(email) AS email_lower',
            explanation: 'Emails are already lowercase here, so LOWER is a no-op — but it guarantees normalization when data comes from mixed sources.',
            tableData: {
              tableName: 'Result columns',
              columns: ['name_upper', 'email_lower'],
              rows: [
                ['RAFIUL ISLAM', 'rafiul@example.com'],
                ['PRIYA AKTER', 'priya.akter@example.com'],
              ],
            },
          },
        ],
        keyTakeaway: 'UPPER()/LOWER() return a transformed copy of each text value — perfect for display consistency and case-insensitive comparisons. Always alias the result.',
        exampleQuery: "SELECT UPPER(name) AS name_upper, LOWER(email) AS email_lower FROM customers;",
        exampleQueryExplanation: 'Both directions of case normalization in one query.',
        liveDemoSql: "SELECT name, UPPER(name) AS name_upper FROM customers LIMIT 5;",
        liveDemoNotes: 'Compare the original and transformed columns side by side.',
        mcqs: [
          {
            question: 'What does `WHERE UPPER(city) = \'DHAKA\'` match?',
            options: [
              'A. Only rows where city is stored as DHAKA',
              'B. Dhaka, DHAKA, dhaka — any casing',
              'C. Nothing — WHERE cannot use functions',
              'D. Only NULL cities',
            ],
            correctIndex: 1,
            explanation: 'UPPER(city) normalizes before comparing, so the stored casing stops mattering.',
          },
        ],
        masteryPoints: ['Apply UPPER/LOWER in SELECT', 'Use UPPER() for case-insensitive WHERE comparisons'],
      },
      tasks: [
        {
          id: 'upper-t1',
          title: 'Task 1 (Guided): Shipping manifest in capitals',
          description: 'Warehouse manifest: every customer name in CAPITALS next to the original.',
          instructions: [
            'Select `name` and `UPPER(name) AS name_upper` from `customers`.',
            'End with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: '-- Shipping manifest\n',
          solutionSql: 'SELECT name, UPPER(name) AS name_upper FROM customers;',
          solutionExplanation: 'All 15 names uppercased in the output; stored data unchanged.',
          hints: [
            { level: 1, text: 'UPPER(name) wraps the column; alias AS name_upper.' },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'name_upper'],
            requireFunction: 'UPPER',
            expectedRowCount: 15,
          },
          successMessage: 'Manifest ready — every name in capitals.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'upper-t2',
          title: 'Task 2 (Independent): Case-proof Dhaka filter',
          description: 'Find all customers in Dhaka — but write the filter so it would work even if the stored casing were \'dhaka\' or \'DHAKA\'.',
          instructions: [
            'Select `name` and `city` from `customers`.',
            'WHERE `UPPER(city) = \'DHAKA\'`. End with a semicolon.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Case-insensitive city filter\n',
          solutionSql: "SELECT name, city FROM customers WHERE UPPER(city) = 'DHAKA';",
          solutionExplanation: '6 customers — the function normalizes city before the comparison.',
          hints: [
            { level: 1, text: "Wrap the column, not the literal: WHERE UPPER(city) = 'DHAKA'." },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'city'],
            requireFunction: 'UPPER',
            expectedRowCount: 6,
          },
          successMessage: 'Case-insensitive filtering — a trick you will use for user-search boxes forever.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'trim',
      order: 2,
      title: '2. TRIM: Cleaning Whitespace',
      shortDescription: 'Strip stray spaces from the edges of text values.',
      theory: {
        summary: 'Data from imports and form inputs often carries invisible leading/trailing spaces: \' Dhaka\' is not \'Dhaka\' to SQL — it is a different string that will never match your filters. TRIM() strips whitespace from both ends of a value, returning the clean copy.',
        introTable: {
          tableName: 'students',
          description: 'The familiar Day-1 table — imagine some city values arrived with stray spaces',
          columns: ['id', 'name', 'city'],
          rows: [
            [1, 'Rahim', 'Dhaka'],
            [2, 'Karim', 'Gazipur'],
            [3, 'Ayesha', 'Dhaka'],
          ],
        },
        explanation: [
          'TRIM(col) removes leading and trailing whitespace (spaces, tabs) — but never spaces *inside* the text.',
          '```sql\nSELECT TRIM(city) AS clean_city FROM students;\n```\nOn cleanly stored data the output looks identical — that is the point: TRIM makes the query correct regardless of how dirty the input was.',
          'It combines naturally: `WHERE TRIM(city) = \'Dhaka\'` matches even padded values — the cleaning happens before the comparison.',
        ],
        targetQuery: {
          sql: 'SELECT name, TRIM(city) AS clean_city\nFROM students;',
          explanation: 'A whitespace-proof city column for every student.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: TRIM cuts only the edges',
            sqlSnippet: 'TRIM(city) AS clean_city',
            explanation: "'  Dhaka  ' → 'Dhaka'. Inner spaces ('New  York') are untouched — TRIM is edge-only.",
            tableData: {
              tableName: 'Edge-only cleaning',
              columns: ['stored value', 'TRIM result'],
              highlightedColumns: ['TRIM result'],
              rows: [
                ["'  Dhaka  '", "'Dhaka'"],
                ["'Gazipur'", "'Gazipur' (no change)"],
                ["'New  York'", "'New  York' (inner spaces stay)"],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Cleaning before comparing',
            sqlSnippet: "WHERE TRIM(city) = 'Dhaka'",
            explanation: 'The trimmed value is what gets compared — padded or not, only true Dhaka rows survive.',
            tableData: {
              tableName: 'Filter behavior',
              columns: ['stored value', "TRIM(city) = 'Dhaka'"],
              rows: [
                ["'  Dhaka  '", 'TRUE'],
                ["'Gazipur  '", 'FALSE'],
                ["'Dhaka'", 'TRUE'],
              ],
            },
          },
        ],
        keyTakeaway: 'TRIM() strips edge whitespace before comparison or display — cheap insurance against dirty imported data.',
        exampleQuery: 'SELECT name, TRIM(city) AS clean_city FROM students;',
        exampleQueryExplanation: 'Every city, edge-cleaned.',
        liveDemoSql: "SELECT TRIM('  Dhaka  ') AS trimmed_demo, city, TRIM(city) AS clean_city FROM students LIMIT 4;",
        liveDemoNotes: 'The literal demo shows TRIM working visibly; the table columns show the no-change case.',
        mcqs: [
          {
            question: "What does TRIM('  a b  ') return?",
            options: ["A. 'ab'", "B. 'a b'", "C. 'a b  '", "D. '  a b'"],
            correctIndex: 1,
            explanation: 'TRIM strips only leading/trailing whitespace — the inner space stays.',
          },
        ],
        masteryPoints: ['Apply TRIM to clean text columns', 'Combine TRIM with WHERE comparisons'],
      },
      tasks: [
        {
          id: 'trim-t1',
          title: 'Task 1 (Guided): Whitespace-proof city column',
          description: 'Produce a clean_city column for every student, trimmed on both edges.',
          instructions: [
            'Select `name` and `TRIM(city) AS clean_city` from `students`.',
            'End with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'students',
          initialSql: '-- Clean city column\n',
          solutionSql: 'SELECT name, TRIM(city) AS clean_city FROM students;',
          solutionExplanation: 'Five rows, cities edge-cleaned — on clean data the values look unchanged, which is correct.',
          hints: [
            { level: 1, text: 'TRIM(city) wraps the column; alias AS clean_city.' },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'clean_city'],
            requireFunction: 'TRIM',
            expectedRowCount: 5,
          },
          successMessage: 'Whitespace-proofed — this habit saves hours of "why doesn\'t it match" debugging.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'trim-t2',
          title: 'Task 2 (Independent): TRIM inside a WHERE filter',
          description: 'Find Dhaka students using a whitespace-proof filter.',
          instructions: [
            'Select `name`, `city` from `students`.',
            'WHERE `TRIM(city) = \'Dhaka\'`. End with a semicolon.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- TRIM in the filter\n',
          solutionSql: "SELECT name, city FROM students WHERE TRIM(city) = 'Dhaka';",
          solutionExplanation: 'Rahim and Ayesha — 2 rows.',
          hints: [
            { level: 1, text: "Put the function on the column side of the comparison: WHERE TRIM(city) = 'Dhaka'." },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['name', 'city'],
            requireFunction: 'TRIM',
            expectedRowCount: 2,
          },
          successMessage: 'Cleaning-before-comparing — TRIM has officially joined your WHERE toolbox.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'concat',
      order: 3,
      title: '3. CONCAT: Assembling Display Strings',
      shortDescription: 'Glue columns and literals into one text value.',
      theory: {
        summary: 'The email client needs one field: "Rafiul Islam <rafiul@example.com>". The database has two columns — name and email — and no format string column. CONCAT glues any number of text pieces (columns *and* quoted literals) into a single value.',
        introTable: {
          tableName: 'customers',
          description: 'Two separate columns that the display needs stitched together',
          columns: ['name', 'email'],
          rows: [
            ['Rafiul Islam', 'rafiul@example.com'],
            ['Priya Akter', 'priya.akter@example.com'],
          ],
        },
        explanation: [
          'CONCAT(a, b, c, …) joins its arguments left to right, in the exact order given. Literals supply the glue:',
          '```sql\nSELECT CONCAT(name, \' <\', email, \'>\') AS contact\nFROM customers\nWHERE email IS NOT NULL;\n```',
          'Two details: the spaces and angle brackets are **quoted literals** — anything in quotes appears as-is; and NULL poisons CONCAT (a row with a NULL email would output NULL), so the WHERE email IS NOT NULL guard is not decoration — it is data hygiene from Day 3 doing its job.',
        ],
        targetQuery: {
          sql: "SELECT CONCAT(name, ' <', email, '>') AS contact\nFROM customers\nWHERE email IS NOT NULL;",
          explanation: 'One display-ready contact field per mailable customer.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The pieces, in order',
            sqlSnippet: "CONCAT(name, ' <', email, '>')",
            explanation: 'For Rafiul: "Rafiul Islam" + " <" + "rafiul@example.com" + ">" — four pieces, one output.',
            tableData: {
              tableName: 'Piece by piece',
              columns: ['piece 1', 'piece 2', 'piece 3', 'piece 4'],
              rows: [
                ['Rafiul Islam', ' <', 'rafiul@example.com', '>'],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Assembled output',
            sqlSnippet: '… AS contact',
            explanation: 'Rafiul Islam <rafiul@example.com> — a single contact string, ready for any mail client.',
            tableData: {
              tableName: 'Result',
              columns: ['contact'],
              highlightedColumns: ['contact'],
              rows: [
                ['Rafiul Islam <rafiul@example.com>'],
                ['Priya Akter <priya.akter@example.com>'],
              ],
            },
          },
        ],
        keyTakeaway: 'CONCAT() joins columns and quoted literals into one text value, in the order given. Guard against NULLs first — one NULL makes the whole output NULL.',
        exampleQuery: "SELECT CONCAT(name, ' <', email, '>') AS contact FROM customers WHERE email IS NOT NULL;",
        exampleQueryExplanation: 'Email-ready contact strings for the 13 mailable customers.',
        liveDemoSql: "SELECT name, email, CONCAT(name, ' <', email, '>') AS contact FROM customers WHERE email IS NOT NULL LIMIT 5;",
        liveDemoNotes: 'Three sources become one column — the assembly is computed, never stored.',
        mcqs: [
          {
            question: "In CONCAT(name, ' <', email, '>'), what role does ' <' play?",
            options: [
              'A. It is a column reference',
              'B. A quoted literal — inserted as-is into every row\'s output',
              'C. A comment',
              'D. A filter',
            ],
            correctIndex: 1,
            explanation: 'Quoted text in CONCAT is a literal glue piece; unquoted names are columns.',
          },
          {
            question: 'What happens to a CONCAT row if one argument is NULL?',
            options: ['A. The NULL is skipped', 'B. The whole output is NULL', 'C. It becomes 0', 'D. It becomes an empty string'],
            correctIndex: 1,
            explanation: 'NULL propagates through CONCAT — which is why we filter IS NOT NULL first (or coalesce, coming soon).',
          },
        ],
        masteryPoints: ['Mix columns and literals in CONCAT', 'Explain why NULL breaks CONCAT and how to guard it'],
      },
      tasks: [
        {
          id: 'concat-t1',
          title: 'Task 1 (Guided): Build the email contact field',
          description: 'Produce contact = "Name <email>" for every customer who has an email.',
          instructions: [
            'Select `CONCAT(name, \' <\', email, \'>\') AS contact` from `customers`.',
            'Guard with `WHERE email IS NOT NULL`. End with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: '-- Contact strings\n',
          solutionSql: "SELECT CONCAT(name, ' <', email, '>') AS contact FROM customers WHERE email IS NOT NULL;",
          solutionExplanation: '13 rows — Tanvir and Shakil (no email) are excluded by the guard.',
          hints: [
            { level: 1, text: "CONCAT(name, ' <', email, '>') — the literal pieces carry the space, < and >." },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['contact'],
            requireFunction: 'CONCAT',
            expectedRowCount: 13,
          },
          successMessage: 'Display strings assembled — the mail client will love this.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'concat-t2',
          title: 'Task 2 (Independent): City directory entries',
          description: 'Build directory entries like "Rahim (Dhaka)" for every student: CONCAT(name, \' (\', city, \')\') AS directory_entry.',
          instructions: [
            'Select `CONCAT(name, \' (\', city, \')\') AS directory_entry` from `students`.',
            'Order by `directory_entry ASC` so the directory is alphabetical. End with a semicolon.',
          ],
          type: 'independent',
          primaryTable: 'students',
          initialSql: '-- Student directory\n',
          solutionSql: "SELECT CONCAT(name, ' (', city, ')') AS directory_entry FROM students ORDER BY directory_entry ASC;",
          solutionExplanation: 'Five entries like "Rahim (Dhaka)", alphabetized.',
          hints: [
            { level: 1, text: "Four pieces: name, ' (', city, ')' — then ORDER BY the alias." },
          ],
          validation: {
            targetTable: 'students',
            requiredColumns: ['directory_entry'],
            requireFunction: 'CONCAT',
            expectedRowCount: 5,
          },
          successMessage: 'Same tool, new format — you just wrote a directory generator.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'substring',
      order: 4,
      title: '4. SUBSTRING: Extracting Text Portions',
      shortDescription: 'Pull a slice out of a text value by position.',
      theory: {
        summary: 'Order dates are stored as \'2026-08-12\' — but the dashboard only needs the \'2026-08\' month prefix. SUBSTRING(col, start, length) cuts a slice out of text, counting from 1. It works on any structured text: date prefixes, SKU codes, initials.',
        introTable: {
          tableName: 'orders',
          description: 'Date strings — the first 7 characters are the year and month',
          columns: ['order_id', 'order_date'],
          rows: [
            [1, '2026-06-10'],
            [2, '2026-08-01'],
            [3, '2026-05-15'],
          ],
        },
        explanation: [
          'SUBSTRING takes three arguments: the text, where to start (1-based!), and how many characters to take.',
          '```sql\nSELECT SUBSTRING(order_date, 1, 7) AS month_prefix FROM orders;\n```\n\'2026-08-12\': start at position 1, take 7 characters → \'2026-08\'.',
          'Watch the 1-based counting: the first character is position **1**, not 0. This trips up programmers coming from other languages.',
        ],
        targetQuery: {
          sql: 'SELECT order_id, order_date, SUBSTRING(order_date, 1, 7) AS month_prefix\nFROM orders;',
          explanation: 'Every order tagged with its year-month prefix.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Number the positions (from 1!)',
            sqlSnippet: 'SUBSTRING(order_date, 1, 7)',
            explanation: "'2026-08-12': positions 1–4 = '2026', position 5 = '-', positions 6–7 = '08'. Taking 7 characters from position 1 captures '2026-08'.",
            tableData: {
              tableName: 'Position map',
              columns: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
              rows: [
                ['2', '0', '2', '6', '-', '0', '8', '-', '1', '2'],
              ],
              highlightedColumns: ['1', '2', '3', '4', '5', '6', '7'],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The extracted slice becomes a real column',
            sqlSnippet: '… AS month_prefix',
            explanation: 'Every order now carries a month_prefix you can sort, group, or filter on.',
            tableData: {
              tableName: 'Result',
              columns: ['order_id', 'order_date', 'month_prefix'],
              highlightedColumns: ['month_prefix'],
              rows: [
                [1, '2026-06-10', '2026-06'],
                [2, '2026-08-01', '2026-08'],
                [3, '2026-05-15', '2026-05'],
              ],
            },
          },
        ],
        keyTakeaway: 'SUBSTRING(text, start, length) slices text by position — start counts from 1. Perfect for structured prefixes like date parts and codes.',
        exampleQuery: 'SELECT order_id, order_date, SUBSTRING(order_date, 1, 7) AS month_prefix FROM orders;',
        exampleQueryExplanation: 'A month tag for every order, extracted from the stored date string.',
        liveDemoSql: 'SELECT order_date, SUBSTRING(order_date, 1, 7) AS month_prefix FROM orders LIMIT 6;',
        liveDemoNotes: 'Ten characters in, seven characters out — the slice is exact.',
        mcqs: [
          {
            question: "What does SUBSTRING('2026-08-12', 1, 4) return?",
            options: ["A. '026-'", "B. '2026'", "C. '2026-08'", "D. '12'"],
            correctIndex: 1,
            explanation: 'Start at position 1, take 4 characters: 2026.',
          },
        ],
        masteryPoints: ['Slice text with 1-based positions', 'Extract structured prefixes from stored values'],
      },
      tasks: [
        {
          id: 'substring-t1',
          title: 'Task 1 (Guided): Three-letter initials',
          description: 'Badges need 3-letter initials: SUBSTRING(name, 1, 3) for every customer.',
          instructions: [
            'Select `name` and `SUBSTRING(name, 1, 3) AS initials` from `customers`.',
            'End with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: '-- Badge initials\n',
          solutionSql: 'SELECT name, SUBSTRING(name, 1, 3) AS initials FROM customers;',
          solutionExplanation: "'Rafiul Islam' → 'Raf', 'Priya Akter' → 'Pri' — 15 initials.",
          hints: [
            { level: 1, text: 'Start at position 1, take 3 characters.' },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'initials'],
            requireFunction: 'SUBSTRING',
            expectedRowCount: 15,
          },
          successMessage: 'Slicing mastered — position 1, length 3.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'substring-t2',
          title: 'Task 2 (Independent): Monthly order tags',
          description: 'Give every order a month_prefix column: SUBSTRING(order_date, 1, 7) — then sort by it.',
          instructions: [
            'Select `order_id`, `order_date`, `SUBSTRING(order_date, 1, 7) AS month_prefix` from `orders`.',
            'ORDER BY `month_prefix ASC`. End with a semicolon.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql: '-- Monthly tags\n',
          solutionSql: 'SELECT order_id, order_date, SUBSTRING(order_date, 1, 7) AS month_prefix FROM orders ORDER BY month_prefix ASC;',
          solutionExplanation: '18 orders, chronologically grouped from 2026-02 to 2026-08.',
          hints: [
            { level: 1, text: 'The slice is the same as the theory example — then ORDER BY the alias.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['order_id', 'order_date', 'month_prefix'],
            requireFunction: 'SUBSTRING',
            expectedRowCount: 18,
          },
          successMessage: 'Chronological grouping from raw text — SQL agrees with your intuition.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'length',
      order: 5,
      title: '5. LENGTH: Measuring Text',
      shortDescription: 'Count the characters of a value — and sort or filter by it.',
      theory: {
        summary: 'Which of our customer emails is suspiciously long? LENGTH(col) returns the character count of each value — and because it produces a number per row, you can filter, sort, and even aggregate by it.',
        introTable: {
          tableName: 'customers',
          description: 'Email lengths vary — LENGTH turns that into data',
          columns: ['name', 'email'],
          rows: [
            ['Rafiul Islam', 'rafiul@example.com'],
            ['Priya Akter', 'priya.akter@example.com'],
          ],
        },
        explanation: [
          'LENGTH returns a number, so it composes with everything you already know:',
          '```sql\nSELECT name, LENGTH(email) AS email_len\nFROM customers\nWHERE email IS NOT NULL\nORDER BY email_len DESC\nLIMIT 5;\n```\nFilter it (WHERE LENGTH(name) > 12), sort by it (ORDER BY LENGTH(email) DESC), or just display it — one function, three jobs.',
          'NULL emails have no length — LENGTH(NULL) is NULL, so the IS NOT NULL guard (Day 3 again) keeps the ranking clean.',
        ],
        targetQuery: {
          sql: 'SELECT name, LENGTH(email) AS email_len\nFROM customers\nWHERE email IS NOT NULL\nORDER BY email_len DESC\nLIMIT 5;',
          explanation: 'The five longest email addresses on file.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Each value becomes a count',
            sqlSnippet: 'LENGTH(email) AS email_len',
            explanation: "'rafiul@example.com' → 18. The text column becomes a number column you can sort by.",
            tableData: {
              tableName: 'Measured values',
              columns: ['email', 'LENGTH(email)'],
              highlightedColumns: ['LENGTH(email)'],
              rows: [
                ['rafiul@example.com', 18],
                ['priya.akter@example.com', 23],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The number drives the ranking',
            sqlSnippet: 'ORDER BY email_len DESC LIMIT 5',
            explanation: 'Sort the counts descending, keep the top five — the longest emails surface instantly.',
            tableData: {
              tableName: 'Composition',
              columns: ['clause', 'job'],
              rows: [
                ['WHERE email IS NOT NULL', 'drop rows with no email (NULL length)'],
                ['ORDER BY email_len DESC', 'longest first'],
                ['LIMIT 5', 'keep the top five'],
              ],
            },
          },
        ],
        keyTakeaway: 'LENGTH() converts text into a number — so Day 4 sorting and Day 2 filtering apply to it like any numeric column.',
        exampleQuery: 'SELECT name, LENGTH(email) AS email_len FROM customers WHERE email IS NOT NULL ORDER BY email_len DESC LIMIT 5;',
        exampleQueryExplanation: 'A data-quality ranking: longest emails first.',
        liveDemoSql: 'SELECT name, LENGTH(name) AS name_len, LENGTH(email) AS email_len FROM customers WHERE email IS NOT NULL LIMIT 5;',
        liveDemoNotes: 'Two measured columns side by side — compare name vs email lengths.',
        mcqs: [
          {
            question: 'What does LENGTH(NULL) return?',
            options: ['A. 0', 'B. NULL', 'C. An error', 'D. -1'],
            correctIndex: 1,
            explanation: 'No value → no length. That is why IS NOT NULL guards length-based queries.',
          },
        ],
        masteryPoints: ['Measure text with LENGTH', 'Filter, sort, and rank by computed lengths'],
      },
      tasks: [
        {
          id: 'length-t1',
          title: 'Task 1 (Guided): Name vs email lengths',
          description: 'Measure both text columns side by side for the first five customers.',
          instructions: [
            'Select `name`, `LENGTH(name) AS name_len`, `LENGTH(email) AS email_len` from `customers`.',
            'Add `LIMIT 5`. End with a semicolon.',
          ],
          type: 'guided',
          primaryTable: 'customers',
          initialSql: '-- Measuring text\n',
          solutionSql: 'SELECT name, LENGTH(name) AS name_len, LENGTH(email) AS email_len FROM customers LIMIT 5;',
          solutionExplanation: 'Two numeric columns derived from text — note the NULL email_len rows for customers without emails.',
          hints: [
            { level: 1, text: 'Wrap each column in LENGTH() and alias both.' },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'name_len', 'email_len'],
            requireFunction: 'LENGTH',
            expectedRowCount: 5,
          },
          successMessage: 'Text measured — LENGTH turns strings into sortable numbers.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'length-t2',
          title: 'Task 2 (Independent): Top 5 longest emails',
          description: 'Data-quality ranking: the 5 longest email addresses on file (skip customers without emails).',
          instructions: [
            'Select `name`, `LENGTH(email) AS email_len` from `customers`.',
            'WHERE `email IS NOT NULL`, ORDER BY `email_len DESC`, LIMIT 5.',
          ],
          type: 'independent',
          primaryTable: 'customers',
          initialSql: '-- Longest emails\n',
          solutionSql: 'SELECT name, LENGTH(email) AS email_len FROM customers WHERE email IS NOT NULL ORDER BY email_len DESC LIMIT 5;',
          solutionExplanation: 'The five longest addresses lead — Priya Akter\'s 23-character email tops the list.',
          hints: [
            { level: 1, text: 'Three clauses compose: IS NOT NULL guard → ORDER BY the length alias DESC → LIMIT 5.' },
          ],
          validation: {
            targetTable: 'customers',
            requiredColumns: ['name', 'email_len'],
            requireFunction: 'LENGTH',
            requireLimit: 5,
            expectedRowCount: 5,
          },
          successMessage: 'Ranking by a computed value — Day 4 pagination applied to Day 11 numbers.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],
  // ===========================================================================
  // DAY 11 CHALLENGE: TEXT SHAPING FOR A REAL DELIVERABLE (ENDING ACTIVITY)
  // ===========================================================================
  challenge: {
    id: 'string-functions-homework',
    title: 'Day 11 — String Functions Challenge (Ending Activity)',
    scenario: 'The email platform needs a clean import file. Assemble, normalize, and audit — all in queries:',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'str-hw-1',
        title: 'Task 1: The import-ready contact file',
        description: 'One row per mailable customer: the contact field "Name <email>" — with the email part guaranteed lowercase.',
        instructions: [
          'WHERE `email IS NOT NULL`; output `CONCAT(name, \' <\', LOWER(email), \'>\') AS contact`.',
          'ORDER BY `contact ASC`. End with a semicolon.',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Challenge: import-ready contacts\n',
        solutionSql: "SELECT CONCAT(name, ' <', LOWER(email), '>') AS contact FROM customers WHERE email IS NOT NULL ORDER BY contact ASC;",
        solutionExplanation: 'CONCAT assembles, LOWER guarantees lowercase, the guard drops the 2 email-less customers — 13 alphabetized contacts.',
        hints: [
          { level: 1, text: 'Functions can nest inside CONCAT arguments: LOWER(email) is just another piece.' },
        ],
        validation: {
          targetTable: 'customers',
          requiredColumns: ['contact'],
          requireFunction: 'CONCAT',
          expectedRowCount: 13,
        },
        successMessage: 'Import file built — three string functions composed into one deliverable.',
      },
      {
        id: 'str-hw-2',
        title: 'Task 2: Uppercase display names for the app header',
        description: 'The product team wants the welcome bar to show names fully capitalized, sorted alphabetically.',
        instructions: [
          'Select `UPPER(name) AS display_name` from `customers`.',
          'ORDER BY `display_name ASC`. End with a semicolon.',
        ],
        type: 'challenge',
        primaryTable: 'customers',
        initialSql: '-- Challenge: display names\n',
        solutionSql: 'SELECT UPPER(name) AS display_name FROM customers ORDER BY display_name ASC;',
        solutionExplanation: '15 capitalized names, alphabetized — note UPPER sorts as the uppercase text.',
        hints: [
          { level: 1, text: 'UPPER in SELECT, then ORDER BY the alias.' },
        ],
        validation: {
          targetTable: 'customers',
          requiredColumns: ['display_name'],
          requireFunction: 'UPPER',
          expectedRowCount: 15,
        },
        successMessage: 'Header-ready names delivered.',
      },
      {
        id: 'str-hw-3',
        title: 'Task 3: Monthly campaign tags (final boss)',
        description: 'Marketing campaigns run per month. Give every order a tag like "2026-08 — order #8": CONCAT(SUBSTRING(order_date, 1, 7), \' — order #\', order_id) AS campaign_tag, sorted by tag.',
        instructions: [
          'Select `order_id`, `order_date`, and `CONCAT(SUBSTRING(order_date, 1, 7), \' — order #\', order_id) AS campaign_tag` from `orders`.',
          'ORDER BY `campaign_tag ASC`. End with a semicolon.',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Challenge: campaign tags\n',
        solutionSql: "SELECT order_id, order_date, CONCAT(SUBSTRING(order_date, 1, 7), ' — order #', order_id) AS campaign_tag FROM orders ORDER BY campaign_tag ASC;",
        solutionExplanation: 'SUBSTRING extracts the month prefix, CONCAT glues it with a literal and the numeric order_id — 18 tags, chronologically sorted.',
        hints: [
          { level: 1, text: 'SUBSTRING(order_date, 1, 7) is the first CONCAT argument; order_id can be glued directly — it converts to text automatically.' },
        ],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['order_id', 'order_date', 'campaign_tag'],
          requireFunction: 'CONCAT',
          expectedRowCount: 18,
        },
        successMessage: 'Final boss cleared — SUBSTRING inside CONCAT: two functions, one composed deliverable.',
      },
    ],
  },
};
