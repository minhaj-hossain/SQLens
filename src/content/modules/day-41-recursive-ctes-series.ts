import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 41 — WITH RECURSIVE: Generating Sequences & Filling Gaps (id: day-41)
// Milestone 4, Phase 1: Reusable Queries & Tree Exploration
//   C1 What WITH RECURSIVE does and how the anchor + recursive step work
//   C2 Generating a number sequence (1 to N)
//   C3 Generating a date range to fill gaps in charts
// =============================================================================
export const Day_41_MODULE: ModuleData = {
  id: 'day-41',
  slug: 'recursive-ctes-series',
  day: 41,
  title: 'Day 41 — WITH RECURSIVE: Generate Sequences and Fill Calendar Gaps',
  shortTitle: 'Recursive CTEs & Sequences',
  type: 'module',
  milestoneId: 'milestone-4',
  description:
    'WITH RECURSIVE lets you build a query that keeps running in a loop until a condition stops it. Use it to generate numbers from 1 to N, build a list of every date in a month, and fill in the "zero sales" days that normally disappear from charts.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Understand the two parts of a recursive CTE: the starting row (anchor) and the loop step',
    'Generate a number sequence from 1 to N using WITH RECURSIVE',
    'Build a complete date range and LEFT JOIN it against real data to expose gaps',
    'Know that a depth limit (100 iterations) stops runaway loops automatically',
  ],
  concepts: [
    // -------------------------------------------------------------------------
    // CONCEPT 1 — How WITH RECURSIVE works
    // -------------------------------------------------------------------------
    {
      id: 'recursive-how-it-works',
      order: 1,
      title: 'How WITH RECURSIVE Works',
      shortDescription: 'A recursive CTE has two parts: a starting row and a loop step.',
      theory: {
        summary:
          'A regular CTE (WITH ...) runs once and returns a result. A recursive CTE (WITH RECURSIVE ...) runs in a loop: it starts with one row, uses that row to generate the next, then uses THAT row to generate the one after, and so on — until the loop condition says stop.',
        explanation: [
          'The structure has exactly two parts, joined by UNION ALL:',
          '1. The ANCHOR — the starting row. Runs exactly once.',
          '2. The RECURSIVE STEP — the loop body. Runs repeatedly until the WHERE condition is false.',
          '```sql\nWITH RECURSIVE counter AS (\n  SELECT 1 AS n          -- ANCHOR: start at 1\n  UNION ALL\n  SELECT n + 1 FROM counter WHERE n < 5  -- STEP: add 1 each time, stop at 5\n)\nSELECT n FROM counter;\n```',
          'QUESTION_BLOCK::BEFORE::In the query above, how many rows will counter produce?',
          'QUESTION_BLOCK::AFTER::Five rows: 1, 2, 3, 4, 5. When n reaches 5, the WHERE n < 5 condition becomes false and the loop stops.',
          'Safety: the engine has a built-in limit of 100 iterations. A query that would loop forever (no stopping condition) is automatically cut off with an error.',
        ],
        introTable: {
          tableName: 'How the loop runs (tracing counter)',
          columns: ['Iteration', 'n value', 'WHERE n < 5?', 'Continues?'],
          rows: [
            ['Anchor', 1, 'Yes (1 < 5)', 'Yes'],
            ['Step 1', 2, 'Yes (2 < 5)', 'Yes'],
            ['Step 2', 3, 'Yes (3 < 5)', 'Yes'],
            ['Step 3', 4, 'Yes (4 < 5)', 'Yes'],
            ['Step 4', 5, 'No (5 < 5 is false)', 'Stops'],
          ],
        },
        syntaxBlocks: [
          {
            title: 'WITH RECURSIVE structure',
            sql: 'WITH RECURSIVE cte_name AS (\n  -- ANCHOR (runs once)\n  SELECT starting_value AS column_name\n  UNION ALL\n  -- RECURSIVE STEP (runs in a loop)\n  SELECT expression FROM cte_name WHERE stop_condition\n)\nSELECT column_name FROM cte_name;',
            description:
              'The anchor and recursive step are separated by UNION ALL. The loop runs until the WHERE condition in the recursive step is false.',
          },
        ],
        keyTakeaway:
          'WITH RECURSIVE = anchor (starting row) + UNION ALL + recursive step (loop) + WHERE condition to stop. The loop stops when the WHERE becomes false.',
        exampleQuery:
          'WITH RECURSIVE counter AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM counter WHERE n < 10\n)\nSELECT n FROM counter;',
        exampleQueryExplanation:
          'Generates numbers 1 through 10. The anchor starts at 1. Each step adds 1. The loop stops when n reaches 10.',
        liveDemoSql:
          'WITH RECURSIVE counter AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM counter WHERE n < 10\n)\nSELECT n FROM counter;',
        liveDemoNotes:
          'Run this and you should see 10 rows: 1, 2, 3, … 10. Adjust the WHERE to WHERE n < 5 and re-run — only 5 rows appear.',
        mcqs: [
          {
            question: 'What does the ANCHOR part of a WITH RECURSIVE CTE do?',
            options: [
              'A. It defines the stopping condition',
              'B. It produces the very first row — the starting point',
              'C. It UNION ALL the results together',
              'D. It connects to an external table',
            ],
            correctIndex: 1,
            explanation:
              'The anchor runs exactly once and produces the first row(s). The recursive step then uses those rows to generate the next set, looping until the WHERE condition is false.',
          },
          {
            question: 'A recursive CTE has no WHERE stop condition. What happens?',
            options: [
              'A. It runs forever and crashes the server',
              'B. It returns no rows',
              'C. The engine cuts it off at 100 iterations and returns an error',
              'D. It automatically stops after 1 row',
            ],
            correctIndex: 2,
            explanation:
              'The engine has a built-in safety limit of 100 iterations. A runaway recursive CTE is automatically terminated with a "maximum recursion depth" error.',
          },
        ],
        commonMistakes: [
          'Forgetting UNION ALL — using UNION (without ALL) de-duplicates rows and can stop the loop too early.',
          'Not including a WHERE stop condition — the engine will hit the 100-depth limit and return an error.',
          'Referencing the CTE name inside the anchor (not allowed) — only the recursive step can reference the CTE name.',
        ],
      },
      tasks: [
        {
          id: 'day41-t1',
          title: 'Generate Numbers 1 to 7',
          description:
            'Write a WITH RECURSIVE query that generates the numbers 1 through 7 in a single column called n.',
          instructions: [
            'Write WITH RECURSIVE nums AS (...)',
            'Anchor: SELECT 1 AS n',
            'Recursive step: SELECT n + 1 FROM nums WHERE n < 7',
            'Main query: SELECT n FROM nums',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql:
            '-- Generate numbers 1 through 7\nWITH RECURSIVE nums AS (\n  -- anchor\n  \n  UNION ALL\n  -- recursive step\n  \n)\nSELECT n FROM nums;\n',
          solutionSql:
            'WITH RECURSIVE nums AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 7\n)\nSELECT n FROM nums;',
          solutionExplanation:
            'The anchor starts at 1. Each loop adds 1. The WHERE n < 7 condition stops the loop once n reaches 7. Result: 7 rows containing 1 through 7.',
          hints: [
            { level: 1, text: 'The anchor is just: SELECT 1 AS n. The recursive step is: SELECT n + 1 FROM nums WHERE n < 7.' },
            { level: 2, text: 'WITH RECURSIVE nums AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 7) SELECT n FROM nums;' },
          ],
          validation: { requireExactResult: true, requireRecursive: true, expectedRowCount: 7 },
          successMessage: '7 rows generated purely from logic — no table required. This is the power of WITH RECURSIVE.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 2 — Generating a number sequence
    // -------------------------------------------------------------------------
    {
      id: 'recursive-number-series',
      order: 2,
      title: 'Building a Number Sequence',
      shortDescription: 'Use WITH RECURSIVE to count, multiply, or rank without any real table.',
      theory: {
        summary:
          'Generating numbers from scratch is one of the most practical uses of WITH RECURSIVE. You can use the series for rankings, batch IDs, loop indexes, or to simulate pagination without any real data in the database.',
        explanation: [
          'The pattern is always the same — only the anchor and stop condition change:',
          '```sql\n-- Numbers 1 to 100\nWITH RECURSIVE series(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM series WHERE n < 100\n)\nSELECT n FROM series;\n```',
          'QUESTION_BLOCK::BEFORE::How would you change this to generate even numbers (2, 4, 6, 8 ...)?',
          'QUESTION_BLOCK::AFTER::Change the anchor to SELECT 2 and the step to SELECT n + 2 FROM series WHERE n < 100.',
          'You can also use a series to assign row numbers to results:',
          '```sql\nWITH RECURSIVE rank_gen AS (\n  SELECT 1 AS rn\n  UNION ALL\n  SELECT rn + 1 FROM rank_gen WHERE rn < 5\n)\nSELECT rn, name\nFROM rank_gen\nJOIN (\n  SELECT name, ROW_NUMBER() OVER (ORDER BY price DESC) AS rn\n  FROM products\n) ranked ON rank_gen.rn = ranked.rn;\n```',
          'In real projects, number series are most often used to generate date ranges — which is what the next concept covers.',
        ],
        syntaxBlocks: [
          {
            title: 'Number series pattern',
            sql: 'WITH RECURSIVE series(n) AS (\n  SELECT start_value\n  UNION ALL\n  SELECT n + step FROM series WHERE n < end_value\n)\nSELECT n FROM series;',
            description:
              'Change start_value, step, and end_value to control what numbers are generated.',
          },
        ],
        keyTakeaway:
          'WITH RECURSIVE can generate any arithmetic sequence from scratch. No table needed — just an anchor value, a step expression, and a stopping condition.',
        exampleQuery:
          'WITH RECURSIVE series(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM series WHERE n < 30\n)\nSELECT n FROM series;',
        exampleQueryExplanation:
          'Generates integers 1 through 30. Pure computation — no table scan involved.',
        liveDemoSql:
          'WITH RECURSIVE series(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM series WHERE n < 30\n)\nSELECT n FROM series;',
        liveDemoNotes:
          'You get 30 rows. Change the anchor to SELECT 0 and the condition to WHERE n < 29 — still 30 rows, but starting from 0.',
        mcqs: [
          {
            question: 'How do you generate the odd numbers 1, 3, 5, 7, 9 using WITH RECURSIVE?',
            options: [
              'A. Anchor: SELECT 1 AS n, Step: SELECT n + 2 FROM ... WHERE n < 9',
              'B. Anchor: SELECT 2 AS n, Step: SELECT n + 1 FROM ... WHERE n < 9',
              'C. Anchor: SELECT 0 AS n, Step: SELECT n + 1 FROM ... WHERE n < 9',
              'D. Anchor: SELECT 1 AS n, Step: SELECT n + 1 FROM ... WHERE n < 9',
            ],
            correctIndex: 0,
            explanation:
              'Starting at 1 and adding 2 each time gives 1, 3, 5, 7, 9. The WHERE n < 9 stops after 9.',
          },
        ],
        commonMistakes: [
          'Using UNION instead of UNION ALL — UNION de-duplicates, which can cut the series short when values repeat.',
          'Off-by-one errors: WHERE n < 10 gives you numbers up to 10 (the step generates 10, then 10 < 10 is false, stopping).',
        ],
      },
      tasks: [
        {
          id: 'day41-t2',
          title: 'Generate Even Numbers 2 to 20',
          description:
            'Write a WITH RECURSIVE query that generates the even numbers 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.',
          instructions: [
            'Anchor: SELECT 2 AS n',
            'Recursive step: SELECT n + 2 FROM evens WHERE n < 20',
            'Main query: SELECT n FROM evens',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql:
            '-- Generate even numbers: 2, 4, 6, ... 20\nWITH RECURSIVE evens AS (\n  \n)\nSELECT n FROM evens;\n',
          solutionSql:
            'WITH RECURSIVE evens AS (\n  SELECT 2 AS n\n  UNION ALL\n  SELECT n + 2 FROM evens WHERE n < 20\n)\nSELECT n FROM evens;',
          solutionExplanation:
            'Anchor starts at 2. Each step adds 2. The loop runs while n < 20, generating 2, 4, 6, ..., 20. That is 10 rows.',
          hints: [
            { level: 1, text: 'Change the anchor from SELECT 1 to SELECT 2, and change n + 1 to n + 2.' },
            { level: 2, text: 'WITH RECURSIVE evens AS (SELECT 2 AS n UNION ALL SELECT n + 2 FROM evens WHERE n < 20) SELECT n FROM evens;' },
          ],
          validation: { requireExactResult: true, requireRecursive: true, expectedRowCount: 10 },
          successMessage: '10 even numbers generated. You now control the start, step size, and end of any sequence.',
          databaseLifecycle: 'fresh',
        },
      ],
    },

    // -------------------------------------------------------------------------
    // CONCEPT 3 — Date ranges and filling gaps
    // -------------------------------------------------------------------------
    {
      id: 'recursive-date-range',
      order: 3,
      title: 'Generating Date Ranges to Fill Chart Gaps',
      shortDescription: 'Build every date in a range, then LEFT JOIN your real data to expose zero-sales days.',
      theory: {
        summary:
          'The classic chart problem: your sales chart shows January 3, January 7, January 12 — but what happened on the days in between? Zero-sales days are missing from the data entirely, so charts look like they jumped. A date-range CTE solves this by generating EVERY date in a period, then LEFT JOINing real data onto it.',
        explanation: [
          'Generate every date in January 2024:',
          '```sql\nWITH RECURSIVE dates AS (\n  SELECT DATE("2024-01-01") AS d\n  UNION ALL\n  SELECT DATE(d, "+1 day") FROM dates WHERE d < DATE("2024-01-31")\n)\nSELECT d FROM dates;\n```',
          'QUESTION_BLOCK::BEFORE::What does DATE(d, "+1 day") do in this query?',
          'QUESTION_BLOCK::AFTER::It adds exactly one day to the current date d. SQLite uses this string-based date arithmetic. The result is the next calendar day.',
          'Now LEFT JOIN real order data to fill in zeros:',
          '```sql\nWITH RECURSIVE dates AS (\n  SELECT DATE("2024-01-01") AS d\n  UNION ALL\n  SELECT DATE(d, "+1 day") FROM dates WHERE d < DATE("2024-01-31")\n)\nSELECT\n  dates.d AS sale_date,\n  COALESCE(COUNT(o.order_id), 0) AS orders_count\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nGROUP BY dates.d\nORDER BY dates.d;\n```',
          'The LEFT JOIN means: for every date in the range, include any matching orders. If there are no orders on that day, the count is 0 (via COALESCE). The date never disappears.',
          'QUESTION_BLOCK::BEFORE::Why is a LEFT JOIN used here instead of an INNER JOIN?',
          'QUESTION_BLOCK::AFTER::An INNER JOIN would remove dates with no orders (gap days). A LEFT JOIN keeps ALL dates from the date series, even when no orders exist on that day.',
        ],
        syntaxBlocks: [
          {
            title: 'Date range generator',
            sql: "WITH RECURSIVE dates AS (\n  SELECT DATE('start_date') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('end_date')\n)\nSELECT d FROM dates;",
            description:
              "Replace 'start_date' and 'end_date' with real dates. Each iteration adds 1 day until the end date is reached.",
          },
        ],
        keyTakeaway:
          'Generate a complete date series with WITH RECURSIVE, then LEFT JOIN your data onto it. Every missing day appears with a count of zero instead of simply not existing.',
        exampleQuery:
          "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-01-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')\n)\nSELECT d FROM dates;",
        exampleQueryExplanation:
          'Generates 7 rows — one per day from Jan 1 to Jan 7. Each row is a date that will be used as the "spine" of a gap-filled report.',
        liveDemoSql:
          "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-01-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')\n)\nSELECT dates.d AS sale_date, COALESCE(COUNT(o.order_id), 0) AS orders_count\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nGROUP BY dates.d\nORDER BY dates.d;",
        liveDemoNotes:
          'Every day from Jan 1–7 appears. Days with no orders show 0. Without the date series, those zero days would simply be missing.',
        mcqs: [
          {
            question: 'Why do we use LEFT JOIN (not INNER JOIN) when combining a date series with real order data?',
            options: [
              'A. INNER JOIN is slower on date columns',
              'B. LEFT JOIN keeps all dates from the series even when no orders exist on that date',
              'C. INNER JOIN cannot work with CTEs',
              'D. LEFT JOIN returns more rows regardless of the data',
            ],
            correctIndex: 1,
            explanation:
              'LEFT JOIN keeps every row from the left table (our date series). Days with no matching orders appear with NULL values (converted to 0 by COALESCE) instead of disappearing.',
          },
        ],
        commonMistakes: [
          'Using INNER JOIN — zero-sales days are excluded and the gap problem is not solved.',
          'Forgetting COALESCE: COUNT returns 0 naturally for LEFT JOIN NULLs, but SUM needs COALESCE(SUM(amount), 0) to avoid NULL totals.',
          'Missing GROUP BY dates.d — without grouping, all dates collapse into one row.',
        ],
      },
      tasks: [
        {
          id: 'day41-t3',
          title: 'Generate a 7-Day Date Series',
          description:
            'Write a WITH RECURSIVE query that generates every date from 2024-01-01 through 2024-01-07 (7 rows total).',
          instructions: [
            "Anchor: SELECT DATE('2024-01-01') AS d",
            "Recursive step: SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')",
            'Main query: SELECT d FROM dates',
          ],
          type: 'guided',
          primaryTable: 'orders',
          initialSql:
            '-- Generate dates: 2024-01-01 through 2024-01-07\nWITH RECURSIVE dates AS (\n  \n)\nSELECT d FROM dates;\n',
          solutionSql:
            "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-01-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')\n)\nSELECT d FROM dates;",
          solutionExplanation:
            'The anchor starts at Jan 1. Each step adds 1 day. The loop stops when d reaches Jan 7. Result: 7 date rows.',
          hints: [
            { level: 1, text: "Anchor: SELECT DATE('2024-01-01') AS d. Step: SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')" },
            { level: 2, text: "WITH RECURSIVE dates AS (SELECT DATE('2024-01-01') AS d UNION ALL SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')) SELECT d FROM dates;" },
          ],
          validation: { requireExactResult: true, requireRecursive: true, expectedRowCount: 7 },
          successMessage: '7 date rows generated. You can now LEFT JOIN real data onto this spine to fill in gaps.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'day41-t4',
          title: 'Fill the Zero-Orders Gap',
          description:
            'Using a date series from 2024-01-01 to 2024-01-07, LEFT JOIN with orders to count how many orders were placed each day. Days with no orders should show 0.',
          instructions: [
            'Create the date series from 2024-01-01 to 2024-01-07',
            'LEFT JOIN orders o ON DATE(o.order_date) = dates.d',
            'SELECT dates.d AS sale_date, COALESCE(COUNT(o.order_id), 0) AS orders_count',
            'GROUP BY dates.d, ORDER BY dates.d',
            "Recursive step uses DATE(d, '+1 day') — the check requires that exact '+1 day' step expression in your query",

          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql:
            '-- Gap-filled daily order count\nWITH RECURSIVE dates AS (\n  \n)\nSELECT\n  dates.d AS sale_date,\n  COALESCE(COUNT(o.order_id), 0) AS orders_count\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nGROUP BY dates.d\nORDER BY dates.d;\n',
          solutionSql:
            "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-01-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')\n)\nSELECT\n  dates.d AS sale_date,\n  COALESCE(COUNT(o.order_id), 0) AS orders_count\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nGROUP BY dates.d\nORDER BY dates.d;",
          solutionExplanation:
            'Every date in the range appears exactly once. Days with no orders show 0 (via COALESCE) instead of vanishing from the result.',
          hints: [
            { level: 1, text: "Fill the date series: SELECT DATE('2024-01-01') AS d UNION ALL SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')" },
            {
              level: 2,
              text: "WITH RECURSIVE dates AS (SELECT DATE('2024-01-01') AS d UNION ALL SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-07')) SELECT dates.d AS sale_date, COALESCE(COUNT(o.order_id), 0) AS orders_count FROM dates LEFT JOIN orders o ON DATE(o.order_date) = dates.d GROUP BY dates.d ORDER BY dates.d;",
            },
          ],
          validation: { requireExactResult: true, requireRecursive: true, expectedRowCount: 7 },
          successMessage: 'Every day in the range appears with a count — even zero-order days. No more disappearing dates in charts!',
          databaseLifecycle: 'fresh',
        },
      ],
    },
  ],

  challenge: {
    id: 'day41-challenge',
    title: 'Build a Complete Monthly Sales Report',
    scenario:
      'The finance team wants a daily sales total for January 2024, with every single day listed even if sales were zero. They are tired of charts that jump over silent days.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'day41-ch1',
        title: 'Daily Revenue Report with Gap-Filling',
        description:
          'Generate all 31 days of January 2024 using WITH RECURSIVE, then LEFT JOIN orders and order_items to compute total revenue per day (SUM of quantity * unit_price). Show sale_date and daily_revenue. Days with no sales should show 0.',
        instructions: [
          'Anchor: 2024-01-01, end condition: d < 2024-01-31 (gives 31 days)',
          'LEFT JOIN orders on order_date, then JOIN order_items',
          'SELECT dates.d AS sale_date, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS daily_revenue',
          'GROUP BY dates.d ORDER BY dates.d',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql:
          '-- 31-day revenue report with no missing days\nWITH RECURSIVE dates AS (\n  \n)\nSELECT\n  dates.d AS sale_date,\n  COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS daily_revenue\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nLEFT JOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY dates.d\nORDER BY dates.d;\n',
        solutionSql:
          "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-01-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-31')\n)\nSELECT\n  dates.d AS sale_date,\n  COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS daily_revenue\nFROM dates\nLEFT JOIN orders o ON DATE(o.order_date) = dates.d\nLEFT JOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY dates.d\nORDER BY dates.d;",
        solutionExplanation:
          'The date series covers all 31 days of January. LEFT JOINs on orders and order_items pull in revenue data where it exists. COALESCE converts NULL to 0 for days with no sales. Result: 31 rows, always.',
        hints: [
          { level: 1, text: "Change the anchor to DATE('2024-01-01') and the stop condition to d < DATE('2024-01-31') to get all 31 days." },
          {
            level: 2,
            text: "WITH RECURSIVE dates AS (SELECT DATE('2024-01-01') AS d UNION ALL SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('2024-01-31')) SELECT dates.d AS sale_date, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS daily_revenue FROM dates LEFT JOIN orders o ON DATE(o.order_date) = dates.d LEFT JOIN order_items oi ON o.order_id = oi.order_id GROUP BY dates.d ORDER BY dates.d;",
          },
        ],
        validation: {           requireExactResult: true, requireRecursive: true, expectedRowCount: 31,           judgment: [             { kind: 'compare-tradeoff', prompt: 'Why does the date-series recursion use UNION ALL instead of UNION?', options: ['UNION ALL appends rows with no duplicate check, and a date series has no duplicates', 'UNION is rejected inside WITH RECURSIVE', 'UNION sorts the rows before returning them', 'UNION only accepts numeric literals'], correctIndex: 0, explanation: 'Every generated date is unique, so the dedup pass UNION performs is wasted work; UNION ALL just appends the next row.' },           ],         },
        successMessage: 'All 31 days accounted for — the finance team will love this chart. No more gaps!',
        databaseLifecycle: 'fresh',
      },
    ],
  },
};
