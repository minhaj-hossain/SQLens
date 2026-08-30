import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 24 — Window Functions II: Running Metrics  (id: window-running-metrics · order 24)
// Inserts after Day 23 (window-ranking). Atomic chain:
//   C1 Running totals — SUM() OVER (ORDER BY …)  → the frame grows per row
//   C2 LAG / LEAD — compare each row to its neighbor without a self-join
//   C3 Advanced Preview (OPTIONAL) — window frames & moving averages (conceptual)
// Spiral: Day 9 SUM/GROUP BY, Day 12 DATEDIFF, Day 3/17 NULL semantics, Day 23 PARTITION BY.
// =============================================================================
export const WINDOW_RUNNING_METRICS_MODULE: ModuleData = {
  id: 'window-running-metrics',
  slug: 'window-running-metrics',
  day: 0, // ordering uses curriculumOrder (Day 24)
  title: 'Day 24 — Window Functions II: Running Metrics',
  shortTitle: 'Window Functions: Running Metrics',
  type: 'module',
  milestoneId: 'milestone-3',
  description: 'Compute values that grow as you move through the result: cumulative running totals with SUM() OVER (ORDER BY …) and month-over-month comparisons with LAG/LEAD — the trend dashboard toolkit. Ends with an optional preview of window frames and moving averages.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Build a running total with SUM() OVER (ORDER BY …) — the frame grows row by row',
    'Read the previous or next row with LAG() / LEAD() — no self-join needed',
    'Explain why the first row of a LAG has no predecessor (NULL) and handle it',
    'Combine running totals + LAG into a real executive trend report',
  ],
  concepts: [
    {
      id: 'running-totals',
      order: 1,
      title: '1. SUM() OVER (ORDER BY …): The Running Total',
      shortDescription: 'A cumulative column that grows row by row — revenue to date.',
      theory: {
        summary:
          "Day 9 taught you SUM() with GROUP BY: it answers 'how much per group' but collapses the detail. Day 23 taught you ROW_NUMBER: it decorates rows without collapsing them. Now combine both ideas — compute a SUM that grows as you walk through the rows. Revenue 'to date' is THE dashboard number executives watch: not just March's revenue, but the running total through March.",
        introTable: {
          tableName: 'Monthly revenue, before the magic column',
          description: 'Plain per-month totals (GROUP BY-style). No cumulative picture yet.',
          columns: ['mon', 'revenue'],
          rows: [
            [2, 89.99],
            [3, 120.0],
            [4, 24.99],
            [5, 101.84],
          ],
        },
        explanation: [
          'The mental model: `SUM(revenue) OVER (ORDER BY mon)` does NOT collapse rows. Instead it defines a **moving frame**: for each row, the frame is "all rows from the start up to and including this one, in window order." The SUM is re-computed over that frame, row by row.',
          '```sql\nWITH monthly AS (\n  SELECT MONTH(o.order_date) AS mon,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY MONTH(o.order_date)\n)\nSELECT mon, revenue,\n       SUM(revenue) OVER (ORDER BY mon) AS running_revenue\nFROM monthly\nORDER BY mon;\n```',
          'QUESTION_BLOCK::ORDER::What does ORDER BY mon inside OVER change compared to SUM() OVER() with no ORDER BY?',
          'QUESTION_BLOCK::LAST::Why does the last row\'s running_revenue equal the grand total?',
          'Contrast with Day 9: GROUP BY gave you one row per month. Here the same aggregate feed is re-used — the window SUM walks over it **without** collapsing. The final running_revenue (1188.71) is exactly the whole-database total, which is a built-in sanity check: if the last row is not the grand total, the window order is wrong.',
        ],
        targetQuery: {
          sql: 'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue FROM monthly ORDER BY mon;',
          explanation: 'Feb 89.99 → Mar running 209.99 → … → Aug running 1188.71 — seven rows in, seven out, each carrying cumulative revenue.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Build the plain monthly totals first',
            sqlSnippet: 'WITH monthly AS (… GROUP BY MONTH(o.order_date))',
            explanation:
              'A Day 9 query you have written many times: JOIN orders→order_items, multiply quantity × unit_price, SUM per month. The CTE gives one row per month — no cumulative column yet.',
            tableData: {
              tableName: 'CTE monthly',
              columns: ['mon', 'revenue'],
              rows: [
                [2, 89.99],
                [3, 120.0],
                [4, 24.99],
                [5, 101.84],
                [6, 173.98],
                [7, 264.19],
                [8, 413.72],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: OVER (ORDER BY mon) defines the growing frame',
            sqlSnippet: 'SUM(revenue) OVER (ORDER BY mon)',
            explanation:
              'Think of the frame as a basket that grows: for mon=2 the basket holds row 2 only; for mon=3 it holds rows 2 and 3; for mon=8 it holds all seven. ORDER BY mon decides the order in which rows join the basket.',
            tableData: {
              tableName: 'Frame growth',
              columns: ['mon', 'rows in basket', 'SUM'],
              rows: [
                [2, '[2]', 89.99],
                [3, '[2, 3]', 209.99],
                [4, '[2, 3, 4]', 234.98],
                ['…', '…', '…'],
                [8, '[2..8]', 1188.71],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Attach the cumulative value to each row',
            sqlSnippet: '… AS running_revenue',
            explanation:
              'Seven rows in, seven out — each row keeps its own revenue AND gains the cumulative running_revenue. Rows are decorated, not destroyed: the opposite of the GROUP BY collapse you felt in Day 9.',
            tableData: {
              tableName: 'Result (running total)',
              columns: ['mon', 'revenue', 'running_revenue'],
              highlightedColumns: ['running_revenue'],
              rows: [
                [2, 89.99, 89.99],
                [3, 120.0, 209.99],
                [4, 24.99, 234.98],
                [5, 101.84, 336.82],
                [6, 173.98, 510.8],
                [7, 264.19, 774.99],
                [8, 413.72, 1188.71],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Running total syntax',
            sql: 'SUM(col) OVER (ORDER BY sort_col) AS running_alias',
            description:
              'The function is plain SUM(). OVER is what makes it cumulative: ORDER BY tells the frame to grow in that order. No ORDER BY inside OVER = every row gets the SAME global total (a classic bug).',
          },
        ],
        keyTakeaway:
          "SUM() OVER (ORDER BY …) computes a running total: each row carries its value plus the sum of everything before it, in window order. The last running total must equal the grand total — a free correctness check.",
        exampleQuery:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue FROM monthly ORDER BY mon;',
        exampleQueryExplanation:
          'Feb starts at 89.99; each row adds the next month; August closes at 1188.71 — exactly the grand total, confirming the window order is right.',
        liveDemoSql:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue FROM monthly ORDER BY mon;',
        liveDemoNotes:
          'Watch running_revenue climb every row. Now imagine SUM() OVER() WITHOUT the ORDER BY — every row would show 1188.71. That is the classic "flat total" bug.',
        mcqs: [
          {
            question: 'What does SUM(revenue) OVER (ORDER BY mon) compute on row mon=5?',
            options: [
              'A. Only May\'s revenue (101.84)',
              'B. The sum of February through May (336.82)',
              'C. The whole-year total (1188.71)',
              'D. The sum of the next 5 rows',
            ],
            correctIndex: 1,
            explanation:
              "The frame grows from the start to the current row in window order. By May, the basket holds Feb+Mar+Apr+May = 336.82.",
          },
          {
            question: 'What happens if you write SUM(revenue) OVER () with no ORDER BY?',
            options: [
              'A. It sums row by row like a running total',
              'B. It shows the global total on every row',
              'C. It returns NULL on the first row',
              'D. It is a syntax error',
            ],
            correctIndex: 1,
            explanation:
              "Without ORDER BY, the frame is the whole result set for every row — every row carries the same grand total. The ORDER BY inside OVER is what creates the growing frame.",
          },
        ],
        commonMistakes: [
          'Omitting the ORDER BY inside OVER — the running total becomes a flat global total on every row.',
          'Trying to reuse the running alias (running_revenue) inside the same SELECT for another computation — aliases from the same clause are not visible to each other (the Day 6 processing-order lesson).',
        ],
        debuggingExercise: {
          brokenSql:
            'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, SUM(revenue) OVER () AS running_revenue FROM monthly ORDER BY mon;',
          bugs: [
            'SUM(revenue) OVER () has no ORDER BY, so running_revenue is the flat grand total (1188.71) repeated on every row instead of climbing.',
          ],
          fixDescription:
            'Add ORDER BY mon inside the OVER clause — the frame then grows Feb→Aug and the column becomes a true running total.',
        },
        masteryPoints: [
          'Explain why the last running total equals the grand total',
          'Diagnose the "flat total" bug (missing ORDER BY in OVER)',
        ],
      },
      tasks: [
        {
          id: 'running-total-t1',
          title: 'Task 1 (Guided): Running revenue by month',
          description:
            "Finance wants a revenue trend table: each month's revenue side by side with the revenue to date. Build the exact pattern from the concept.",
          instructions: [
            'CTE `monthly`: `MONTH(o.order_date) AS mon` and `SUM(oi.quantity * oi.unit_price) AS revenue`, JOIN `orders o` to `order_items oi`, GROUP BY the month expression.',
            'Main query: `mon`, `revenue`, and `SUM(revenue) OVER (ORDER BY mon) AS running_revenue` FROM `monthly`, ORDER BY `mon`.',
            'Expect 7 rows — February through August.',
          ],
          type: 'guided',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Running revenue by month\n',
          solutionSql:
            'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue FROM monthly ORDER BY mon;',
          solutionExplanation:
            '7 rows. The final running_revenue 1188.71 is the grand total — your built-in correctness check.',
          hints: [
            { level: 1, text: 'Stage 1 is the Day 9 aggregate. Stage 2 adds exactly one OVER clause from the concept.' },
            { level: 2, text: 'The OVER clause has its own ORDER BY mon — WITHOUT it, every row repeats 1188.71.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['mon', 'revenue', 'running_revenue'],
            requireFunction: 'SUM',
            expectedRowCount: 7,
          },
          successMessage: 'Running revenue shipped — and you now know the last-row-equals-grand-total sanity check.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'running-total-t2',
          title: 'Task 2 (Independent): Customer lifetime-spend ledger',
          description:
            "Support wants a ledger: for every order, the customer's cumulative spend up to that order. Same cumulative frame, new partition.",
          instructions: [
            'CTE `ord`: `o.customer_id, o.order_id, o.order_date`, and `SUM(oi.quantity * oi.unit_price) AS total`; JOIN orders→order_items; GROUP BY the three order columns.',
            'Main query: customer_id, order_id, order_date, total, and `SUM(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total` from `ord`.',
            'Expect 18 rows — one per order. Rafiul (customer 1) should show 96.98 → 262.48 → 291.23.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Customer lifetime-spend ledger\n',
          solutionSql:
            'WITH ord AS (SELECT o.customer_id, o.order_id, o.order_date, SUM(oi.quantity * oi.unit_price) AS total FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.customer_id, o.order_id, o.order_date) SELECT customer_id, order_id, order_date, total, SUM(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total FROM ord ORDER BY customer_id, order_date;',
          solutionExplanation:
            '18 rows, one per order. Each customer\'s frame restarts (PARTITION BY customer_id), so running_total is per-customer spend to date — the Day 23 partition idea carrying a cumulative SUM instead of a rank.',
          hints: [
            { level: 1, text: 'A running total inside each group = SUM() OVER (PARTITION BY … ORDER BY …) — the partition pairs with Day 23\'s lesson.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['customer_id', 'order_id', 'order_date', 'total', 'running_total'],
            requireFunction: 'SUM',
            requireJoin: true,
            expectedRowCount: 18,
          },
          successMessage: 'Ledger complete — the same frame idea, now sliced per customer. This is how loyalty reports are built.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'lag-lead',
      order: 2,
      title: '2. LAG() / LEAD(): Peek at the Neighboring Row',
      shortDescription: 'Compare each row to its predecessor or successor — no self-join.',
      theory: {
        summary:
          'A running total answers "where are we now?" The next question every manager asks is "how are we doing compared to last month?" LAG() reaches back one row and brings its value forward; LEAD() looks ahead. Both are window functions, so rows are still not collapsed — every month keeps its own revenue AND gains its neighbor\'s number for comparison.',
        introTable: {
          tableName: 'Monthly revenue (fetched already)',
          description: 'The seven monthly totals. We want each one side by side with the previous month.',
          columns: ['mon', 'revenue'],
          rows: [
            [2, 89.99],
            [3, 120.0],
            [4, 24.99],
            [5, 101.84],
          ],
        },
        explanation: [
          'The mental model: `LAG(revenue) OVER (ORDER BY mon)` answers "what was the revenue one row earlier in window order?" For March it returns February\'s 89.99. For February — the first row — there is no earlier row, so it returns **NULL**. That NULL is not an error; it is the honest "no predecessor" and it MUST be handled (Days 3 & 17\'s three-valued-logic lesson comes home).',
          '```sql\nWITH monthly AS (\n  SELECT MONTH(o.order_date) AS mon,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY MONTH(o.order_date)\n), with_prev AS (\n  SELECT mon, revenue,\n         LAG(revenue) OVER (ORDER BY mon) AS prev_revenue\n  FROM monthly\n)\nSELECT mon, revenue, revenue - prev_revenue AS growth\nFROM with_prev\nORDER BY mon;\n```',
          'QUESTION_BLOCK::FIRST::What does LAG return on the very first row — and why is that the right behavior?',
          'QUESTION_BLOCK::JOIN::Why is this better than a self-join that fetches "the row that is one month older"?',
          'The CTE materializes the LAG into a plain column (prev_revenue), then the outer SELECT computes `revenue - prev_revenue` — growth, positive or negative. Two stages because window values come from a later processing stage (the Day 6/13 processing-order rule again): you cannot subtract a window result inside the same SELECT that created it.',
          'LEAD() is the mirror: `LEAD(revenue) OVER (ORDER BY mon)` returns the NEXT row\'s revenue. Use LAG for "vs last period", LEAD for "vs next period" (e.g. forecasting, queue position).',
        ],
        targetQuery: {
          sql: 'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), with_prev AS (SELECT mon, revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, revenue - prev_revenue AS growth FROM with_prev ORDER BY mon;',
          explanation: 'February\'s growth is NULL (no predecessor); March is +30.01; April is −95.01 — the trend dimple you would point at in a board meeting.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: The CTE carries each month plus its predecessor',
            sqlSnippet: 'WITH … LAG(revenue) OVER (ORDER BY mon) AS prev_revenue',
            explanation:
              'For every month, LAG reaches one row back in window order. March\'s prev_revenue = 89.99 (February). February\'s = NULL — the honest "no previous row".',
            tableData: {
              tableName: 'CTE with_prev',
              columns: ['mon', 'revenue', 'prev_revenue'],
              rows: [
                [2, 89.99, null],
                [3, 120.0, 89.99],
                [4, 24.99, 120.0],
                [5, 101.84, 24.99],
              ],
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: The outer SELECT subtracts',
            sqlSnippet: 'SELECT mon, revenue, revenue - prev_revenue AS growth',
            explanation:
              'Now that prev_revenue is a plain column, subtracting is a normal arithmetic expression. NULL − anything is NULL, so February\'s growth stays NULL on purpose.',
            tableData: {
              tableName: 'Growth (subtracting)',
              columns: ['mon', 'growth'],
              rows: [
                [2, null],
                [3, 30.01],
                [4, -95.01],
                [5, 76.85],
              ],
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Read the trend',
            sqlSnippet: 'ORDER BY mon',
            explanation:
              'Now the story: Feb starts, Mar grows, Apr dives (a promotion hangover), May recovers. The NULL on row 1 tells you "no data before Feb" instead of lying with 0.',
            tableData: {
              tableName: 'Final trend',
              columns: ['mon', 'revenue', 'growth'],
              highlightedColumns: ['growth'],
              rows: [
                [2, 89.99, null],
                [3, 120.0, 30.01],
                [4, 24.99, -95.01],
                [5, 101.84, 76.85],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'LAG / LEAD syntax',
            sql: 'LAG(col [, offset]) OVER (PARTITION BY … ORDER BY …) AS prev_alias',
            description:
              'LAG brings a value from `offset` rows earlier (default 1); LEAD from `offset` rows later. PARTITION BY restarts the comparison per group. First rows have no neighbor → NULL.',
          },
        ],
        keyTakeaway:
          "LAG() reads the previous row's value, LEAD() the next — in window order, with NULL for rows that have no neighbor. The two-stage pattern (CTE materializes the peek, outer query computes the difference) is the standard way to build growth columns.",
        exampleQuery:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), with_prev AS (SELECT mon, revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, revenue - prev_revenue AS growth FROM with_prev ORDER BY mon;',
        exampleQueryExplanation:
          'The trend column: March +30.01, April −95.01, May +76.85… February\'s NULL is the honest "no prior month".',
        liveDemoSql:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), with_prev AS (SELECT mon, revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, revenue - prev_revenue AS growth FROM with_prev ORDER BY mon;',
        liveDemoNotes:
          'Watch how growth goes negative in April then rebounds — and how the first row stays NULL instead of pretending to be 0.',
        mcqs: [
          {
            question: 'What does LAG(revenue) OVER (ORDER BY mon) return for the FIRST month (February)?',
            options: [
              'A. 0',
              'B. 89.99',
              'C. NULL (no previous row exists)',
              'D. The grand total',
            ],
            correctIndex: 2,
            explanation:
              "There is no row before February in window order, so LAG returns NULL. That's correct behavior — and why you handle NULLs (COALESCE/drop them) before using the column in arithmetic.",
          },
          {
            question: 'Why do we compute `revenue - prev_revenue` in an OUTER query instead of in the same SELECT that made the LAG?',
            options: [
              'A. It is faster',
              'B. Window results materialize after the SELECT — you cannot use the LAG alias in the same clause (processing-order rule)',
              'C. LAG can only be used in WHERE',
              'D. It is not allowed to alias LAG',
            ],
            correctIndex: 1,
            explanation:
              "The Day 6/13 lesson again: SELECT aliases (including window aliases) are not visible inside the same SELECT. The CTE turns prev_revenue into a plain column an outer query can subtract.",
          },
        ],
        commonMistakes: [
          'Forgetting that the first row of a LAG is NULL — then arithmetic on it silently produces NULL everywhere downstream. Filter or COALESCE deliberately.',
          'Trying to use the LAG alias in the same SELECT that created it (the processing-order wall). Use a CTE.',
        ],
        debuggingExercise: {
          brokenSql:
            "SELECT mon, revenue,\n       LAG(revenue) OVER (ORDER BY mon) AS prev_revenue,\n       revenue - prev_revenue AS growth\nFROM monthly; -- ERROR: prev_revenue not visible in its own SELECT",
          bugs: [
            'The growth expression references prev_revenue inside the same SELECT that defines it — window aliases are not visible there (processing-order rule).',
          ],
          fixDescription:
            'Move the LAG into a CTE (WITH … AS …), then compute revenue - prev_revenue in the outer query where prev_revenue is a plain column.',
        },
        masteryPoints: [
          'Explain what LAG returns on the first row and why that is correct',
          'Build a month-over-month growth column using the CTE-then-subtract pattern',
        ],
      },
      tasks: [
        {
          id: 'lag-t1',
          title: 'Task 1 (Guided): Month-over-month growth',
          description:
            "The CEO wants to see each month's revenue next to its growth vs the prior month. Use the exact two-stage pattern from the concept.",
          instructions: [
            'CTE `monthly`: `MONTH(o.order_date) AS mon`, `SUM(oi.quantity * oi.unit_price) AS revenue`, JOIN orders→order_items, GROUP BY the month expression.',
            'CTE `with_prev`: add `LAG(revenue) OVER (ORDER BY mon) AS prev_revenue` FROM `monthly`.',
            'Outer query: `mon`, `revenue`, and `revenue - prev_revenue AS growth`, ORDER BY `mon`. Expect 7 rows.',
          ],
          type: 'guided',
          primaryTable: 'orders',
          secondaryTables: ['order_items'],
          initialSql: '-- Month-over-month growth\n',
          solutionSql:
            'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), with_prev AS (SELECT mon, revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, revenue - prev_revenue AS growth FROM with_prev ORDER BY mon;',
          solutionExplanation:
            '7 rows. February\'s growth is NULL (no predecessor), March +30.01, April −95.01 (that dimple), May +76.85, all the way to August.',
          hints: [
            { level: 1, text: 'Two CTEs: `monthly` (the Day 9 aggregate) then `with_prev` (the LAG decoration).' },
            { level: 2, text: 'Subtract in the OUTER query — revenue - prev_revenue — not inside the CTE that created the LAG.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['mon', 'revenue', 'growth'],
            requireFunction: 'LAG',
            expectedRowCount: 7,
          },
          successMessage: 'Growth column shipped — and you know exactly why that first-row NULL is the honest answer, not a bug.',
          databaseLifecycle: 'fresh',
        },
        {
          id: 'lag-t2',
          title: 'Task 2 (Independent): Days between a customer\'s orders',
          description:
            'Customer success wants to know how long each customer waits between orders. For each order after a customer\'s first, report the days elapsed since their previous order.',
          instructions: [
            'CTE `ordered`: `customer_id, order_date`, and `LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date`, FROM `orders`.',
            'Outer query: `customer_id, order_date`, and `DATEDIFF(order_date, prev_date) AS days_between`, WHERE `prev_date IS NOT NULL`, ORDER BY `customer_id, order_date`.',
            'Expect 6 rows. Rafiul (customer 1) waited 53 days then 21 days.',
          ],
          type: 'independent',
          primaryTable: 'orders',
          initialSql: '-- Days between a customer\'s orders\n',
          solutionSql:
            'WITH ordered AS (SELECT customer_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date FROM orders) SELECT customer_id, order_date, DATEDIFF(order_date, prev_date) AS days_between FROM ordered WHERE prev_date IS NOT NULL ORDER BY customer_id, order_date;',
          solutionExplanation:
            '6 rows — every repeat order gets the days since the previous one. The `IS NOT NULL` filter removes each customer\'s first order (no predecessor — the LAG NULL lesson, applied deliberately).',
          hints: [
            { level: 1, text: 'Restart the comparison per customer with PARTITION BY customer_id (Day 23), ordered by date.' },
            { level: 2, text: 'The first order of each customer has prev_date = NULL — filter it out with WHERE prev_date IS NOT NULL.' },
          ],
          validation: {
            targetTable: 'orders',
            requiredColumns: ['customer_id', 'order_date', 'days_between'],
            requireFunction: 'LAG',
            expectedRowCount: 6,
          },
          successMessage: 'The gap analysis works — LAG plus a deliberate NULL filter. This is exactly how retention teams spot customers at risk.',
          databaseLifecycle: 'fresh',
        },
      ],
    },
    {
      id: 'window-frames-preview',
      order: 3,
      title: '3. Advanced Preview (Optional): Window Frames & Moving Averages',
      shortDescription: 'A taste of ROWS BETWEEN — the smoothing tool you will meet in real dashboards.',
      theory: {
        summary:
          'You now control window ordering and grouping — but what about window SIZE? A running total grows forever; a moving average should roll over a fixed window, like the last 3 months. That is what a **frame** expresses: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` pins the window to exactly three rows, sliding along as the query moves. This is deliberately optional — it is powerful, rarely the first thing a beginner needs, and interviewers love it.',
        introTable: {
          tableName: 'Monthly revenue',
          description: 'The same seven months. A 3-month moving average smooths the April dip.',
          columns: ['mon', 'revenue'],
          rows: [
            [2, 89.99],
            [3, 120.0],
            [4, 24.99],
            [5, 101.84],
            [6, 173.98],
            [7, 264.19],
            [8, 413.72],
          ],
        },
        explanation: [
          'The mental model: for each row, the frame answers "which rows am I allowed to see?" A running total uses the default frame `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` (everything so far). A moving average instead declares `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` — the current row plus the two before it. As the query moves forward, the frame slides with it, always holding exactly three rows.',
          '```sql\nWITH monthly AS (\n  SELECT MONTH(o.order_date) AS mon,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY MONTH(o.order_date)\n)\nSELECT mon, revenue,\n       AVG(revenue) OVER (ORDER BY mon\n         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3\nFROM monthly\nORDER BY mon;\n```',
          'QUESTION_BLOCK::EARLY::At month 2, the frame "2 PRECEDING AND CURRENT ROW" can only hold two rows — what does SQL do?',
          'QUESTION_BLOCK::SMOOTH::Why does moving_avg_3 look calmer than the raw revenue line?',
          'KEY INSIGHT: The syntax is only a suffix on the OVER clause you already know: `SUM(col) OVER (ORDER BY …)` is really `… ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — the default frame. The frame keyword is what turns a running calculation into a sliding one.',
          'When to use it: smoothing noisy series (moving averages), computing "spend over the last 90 days" per row, rolling totals that reset (e.g. trailing 7-day sums). When NOT to: if you just need "cumulative to date", the default frame already does that.',
          '⚠️ This is a PREVIEW, not a core requirement. If it feels like a lot, park it — Day 24\'s required skills are running totals and LAG/LEAD, which you have already mastered. Revisit frames when you meet them in real charts.',
        ],
        keyTakeaway:
          "A frame fixes HOW MANY rows a window function sees: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` = a sliding 3-row window, the moving average. The default frame is 'everything up to now' — which is exactly why a running total grows. Optional, but now the mental model is yours.",
        exampleQuery:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)) SELECT mon, revenue, AVG(revenue) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3 FROM monthly ORDER BY mon;',
        exampleQueryExplanation:
          'May\'s moving average averages Feb+Mar+Apr+May wait — the frame "2 PRECEDING AND CURRENT ROW" means 2 PRECEDING (Feb, Mar) + current (Apr) for April, so the numbers roll smoothly instead of jumping.',
        mcqs: [
          {
            question: 'What does ROWS BETWEEN 2 PRECEDING AND CURRENT ROW mean for a moving average?',
            options: [
              'A. Average of the next 3 rows',
              'B. Average of the current row and the 2 rows before it',
              'C. Average of all rows so far',
              'D. Average of the last 2 rows only',
            ],
            correctIndex: 1,
            explanation:
              'The frame pins exactly (current + 2 preceding), sliding as the query moves — that is what makes it a 3-period moving average rather than a running total.',
          },
          {
            question: 'What is the DEFAULT frame of SUM() OVER (ORDER BY …) when no ROWS clause is written?',
            options: [
              'A. Only the current row',
              'B. The current row and the 2 preceding',
              'C. Everything from the start up to the current row',
              'D. The whole result set',
            ],
            correctIndex: 2,
            explanation:
              "That default (\"everything so far\") is why a running total grows. The moment you want a FIXED size, you write an explicit ROWS frame.",
          },
        ],
        commonMistakes: [
          'Writing ROWS BETWEEN but forgetting it only controls the window — the PARTITION BY and ORDER BY still do their jobs. A frame is an extra dial, not a replacement.',
          'Assuming "moving average" means only the rows BEFORE the current one — frames are inclusive of CURRENT ROW by default.',
        ],
        masteryPoints: [
          'Explain the difference between the default frame and a fixed-size frame',
          'Read a moving-average query and predict its smoothing effect on a spike',
        ],
      },
      tasks: [],
    },
  ],
  challenge: {
    id: 'window-metrics-homework',
    title: 'Day 24 — Running-Metrics Challenge (Ending Activity)',
    scenario:
      'Two production deliverables for the trend dashboard — the first is the executive revenue trend with a running total AND month-over-month growth in one query; the second extends the same thinking to customer order cadence. The optional frame preview stays a stretch goal.',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'metrics-hw-1',
        title: 'Task 1: The executive revenue trend (running total + growth)',
        description:
          'Finance wants one table that tells the whole story: each month\'s revenue, the revenue to date, and the growth vs the previous month. Harness both of today\'s window functions in a single report.',
        instructions: [
          'CTE `monthly`: `MONTH(o.order_date) AS mon`, `SUM(oi.quantity * oi.unit_price) AS revenue`, JOIN orders→order_items, GROUP BY the month expression.',
          'CTE `trend`: add `SUM(revenue) OVER (ORDER BY mon) AS running_revenue` AND `LAG(revenue) OVER (ORDER BY mon) AS prev_revenue`.',
          'Outer query: `mon`, `revenue`, `running_revenue`, and `revenue - prev_revenue AS growth`, ORDER BY `mon`. Expect 7 rows.',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Executive revenue trend\n',
        solutionSql:
          'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), trend AS (SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, running_revenue, revenue - prev_revenue AS growth FROM trend ORDER BY mon;',
        solutionExplanation:
          '7 rows, three window concepts in one report: the running total climbs to 1188.71, growth starts NULL then goes +30.01, −95.01, +76.85… The CTE materializes both window columns so the outer query can subtract.',
        hints: [
          { level: 1, text: 'Both window functions belong in the SAME CTE `trend`, then the outer SELECT subtracts.' },
          { level: 2, text: 'running_revenue uses SUM() OVER; growth is revenue - prev_revenue where prev_revenue came from LAG.' },
        ],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['mon', 'revenue', 'running_revenue', 'growth'],
          requireFunction: 'LAG',
          requireJoin: true,
          expectedRowCount: 7,
        },
        successMessage: 'The one-query trend report is exactly what a BI engineer hands to a CFO — running total + MoM growth combined.',
      },
      {
        id: 'metrics-hw-2',
        title: 'Task 2: Each customer\'s longest wait between orders',
        description:
          'Retention analysis: for each repeat customer, what is the LONGEST gap between two consecutive orders (in days)? Customers with only one order do not appear.',
        instructions: [
          'CTE `ordered`: `customer_id, order_date`, `LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date`, FROM `orders`.',
          'CTE `gaps`: `customer_id`, `DATEDIFF(order_date, prev_date) AS days_between`, WHERE `prev_date IS NOT NULL`.',
          'Outer query: `customer_id, MAX(days_between) AS longest_gap`, GROUP BY `customer_id`, ORDER BY `customer_id`.',
          'Expect 5 rows; customer 1 (Rafiul) has the longest gap 53 days.',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        initialSql: '-- Longest wait between orders\n',
        solutionSql:
          'WITH ordered AS (SELECT customer_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date FROM orders), gaps AS (SELECT customer_id, DATEDIFF(order_date, prev_date) AS days_between FROM ordered WHERE prev_date IS NOT NULL) SELECT customer_id, MAX(days_between) AS longest_gap FROM gaps GROUP BY customer_id ORDER BY customer_id;',
        solutionExplanation:
          '5 rows — the repeats with a longest-gap number each. LAG computed the gaps, group by + MAX collapsed each customer to their riskiest wait.',
        hints: [
          { level: 1, text: 'Three stages: compute the gaps with LAG, drop the first orders, then MAX per customer.' },
          { level: 2, text: 'DATEDIFF(order_date, prev_date) gives days; then GROUP BY customer_id and take MAX(days_between).' },
        ],
        validation: {
          targetTable: 'orders',
          requiredColumns: ['customer_id', 'longest_gap'],
          requireFunction: 'LAG',
          expectedRowCount: 5,
        },
        successMessage: 'Retention risk surfaced with three SQL stages — the exact analysis that flags customers slipping away.',
      },
    ],
  },
};