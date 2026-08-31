import { ModuleData } from '../../types/curriculum';

// =============================================================================
// DAY 37 - INTERVIEW GAUNTLET (id: day-37, order 37)
// -----------------------------------------------------------------------------
// Pure retrieval under pressure. No new teaching - every task only combines
// skills from Days 1-36. Modelled on real SQL interviews: classic patterns,
// tight scope, solutions revealed only after submission.
//
//   C1 Rapid Recall Warmups        (MCQ-only: NULL traps, tie semantics)
//   C2 Classic Patterns            (second-highest, above-average)
//
// Challenge (fresh per task, semantic validators): top-N per group,
// the executive revenue trend, and the fan-out count drill.
// =============================================================================

const GAUNTLET_TREND_SQL =
  'WITH monthly AS (SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id GROUP BY MONTH(o.order_date)), trend AS (SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue FROM monthly) SELECT mon, revenue, running_revenue, revenue - prev_revenue AS growth FROM trend ORDER BY mon;';

export const Day_37_MODULE: ModuleData = {
  id: 'day-37',
  slug: 'interview-gauntlet',
  day: 37,
  title: 'Day 37 - Test Your Skills: Interview Gauntlet Challenge',
  shortTitle: 'Interview Gauntlet',
  type: 'assignment',
  milestoneId: 'milestone-3',
  description:
    'Under pressure, apply classic SQL interview patterns - second-highest value, above-average rows, top-N per group, running trends. No new teaching: every skill comes from Days 1-36. Patterns and traps that filter candidates.',
  estimatedMinutes: 45,
  completionLearnings: [
    'Solve the classic interview patterns (second-highest, above-average, top-N per group) without templates',
    'Combine window functions, CTEs, joins and aggregation in single production-style queries',
    'Avoid the standard interview traps: NULL in NOT IN, tie handling, and join fan-out',
  ],
  concepts: [
    {
      id: 'gauntlet-warmup',
      order: 1,
      title: '1. Rapid Recall Warmups',
      shortDescription: 'Four questions, no lookup, sixty seconds each. The traps interviewers use to filter.',
      theory: {
        summary:
          'Before the timed patterns, four rapid recall questions. These are not trivia - each one is a decision you will need to make correctly in the tasks below, and each has ended real interviews early. Answer from memory; the explanations only appear after you commit.',
        introTable: {
          tableName: 'The trap map',
          description: 'Each classic trap, and the one-line defense.',
          columns: ['Trap', 'What it looks like', 'The defense'],
          rows: [
            ['NULL in NOT IN', 'A subquery returns one NULL - the whole NOT IN returns nothing', 'Guard the subquery: WHERE col IS NOT NULL'],
            ['Ranking ties', 'RANK vs DENSE_RANK vs ROW_NUMBER give 1,1,3 vs 1,1,2 vs 1,2,3', 'Pick the ranking that matches the business rule, not habit'],
            ['COUNT(*) vs COUNT(col)', 'One counts rows, the other skips NULLs', 'Know which one your report means'],
            ['Join fan-out', 'COUNT after a one-to-many join silently inflates', 'COUNT(DISTINCT key) when rows multiply'],
          ],
        },
        explanation: [
          '### How this works',
          'There is nothing to learn here - that is the point. This concept checks that the instincts built over Days 1-36 are still loaded. If any answer surprises you, the module named in the explanation is the one to revisit - before the timed tasks, not after.',
        ],
        keyTakeaway: 'The interview traps are all mental-model checks: NULL poisons NOT IN, ties change rank behavior, COUNT(col) skips NULLs, and joins multiply rows.',
        exampleQuery: "SELECT name FROM customers WHERE email IS NULL;",
        exampleQueryExplanation: 'The IS NULL form from Day 3 - a reminder that NULL has its own comparison syntax, and that forgetting it is the root of most interview traps.',
        mcqs: [
        {
          question: 'A subquery returns these values:\n• 4\n• 7\n• NULL\n\nWhat does `WHERE id NOT IN (subquery)` return?',
          options: [
            'A. Every row whose id is not 4 or 7',
            'B. Only rows whose id is not 4, 7, or NULL',
            'C. Zero rows - the comparison with NULL makes every test UNKNOWN',
            'D. A syntax error',
          ],
          correctIndex: 2,
          explanation: 'One NULL poisons the whole list (Day 21): `id NOT IN (4, 7, NULL)` can never be provably TRUE, so zero rows come back. Guard the subquery with `WHERE ... IS NOT NULL`.',
        },
        {
          question: 'Three products are tied at the top price. What rank does DENSE_RANK give the next (cheaper) product?',
          options: ['A. 2', 'B. 3', 'C. 4', 'D. 1'],
          correctIndex: 1,
          explanation: 'DENSE_RANK shares ranks with no gaps: 1, 1, 1, then 2 (Day 23). RANK would jump to 4; ROW_NUMBER would have forced 1, 2, 3.',
        },
        {
          question: 'A table has 10 rows:\n• 6 rows have a value in `email`\n• 4 rows have NULL in `email`\n\nWhat does `COUNT(email)` return?',
          options: ['A. 10', 'B. 4', 'C. 6', 'D. NULL'],
          correctIndex: 2,
          explanation: 'COUNT(column) skips NULLs: 10 - 4 = 6 (Day 9). COUNT(*) counts all 10 rows.',
        },
        {
          question: 'A LEFT JOIN to order_items multiplies each order by its line items. Which count reports ORDERS (not rows)?',
          options: [
            'A. COUNT(*)',
            'B. COUNT(oi.order_id)',
            'C. COUNT(DISTINCT o.order_id)',
            'D. SUM(o.order_id)',
          ],
          correctIndex: 2,
          explanation: 'After a one-to-many join, only COUNT(DISTINCT o.order_id) counts each order once (Day 15). COUNT(*) and COUNT(oi.order_id) both count joined rows.',
        },
      ],
      },
      tasks: [],
    },
    {
      id: 'gauntlet-patterns',
      order: 2,
      title: '2. Classic Patterns, No Hints',
      shortDescription: 'The two patterns every SQL interview opens with - unaided, against the live store database.',
      theory: {
        summary:
          'Two classics: find the second-highest value, and find everything above the average. Both look trivial - both are built around a trap. The second-highest punishes OFFSET thinking that ignores duplicates; the above-average punishes aggregate-in-WHERE attempts. You know both tools; the interview tests whether you reach for the right one.',
        introTable: {
          tableName: 'Pattern to tool',
          description: 'The two patterns and the canonical tool for each.',
          columns: ['Pattern', 'Tool', 'The trap'],
          rows: [
            ['Second-highest value', 'DISTINCT + ORDER BY + LIMIT/OFFSET (or a MAX subquery)', 'Duplicate values - skip DISTINCT and you return the highest twice-removed'],
            ['Above the average', 'Scalar subquery in WHERE', 'You cannot write AVG(price) in WHERE - compare to a subquery'],
          ],
        },
        explanation: [
          '### Why interviewers love these',
          'Both are one-liners *if* your mental model is solid, and both fail loudly *if* it is not. That is exactly what a screening question is for. Solve them the way you would on a whiteboard: state the interpretation first ("second-highest distinct price"), then write the query.',
        ],
        keyTakeaway: 'Second-highest = DISTINCT + ORDER BY + OFFSET; above-average = scalar subquery in WHERE. Interpretation first, SQL second.',
        exampleQuery: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
        exampleQueryExplanation: 'The scalar subquery computes the catalog average once; WHERE then compares each row against that single value.',
        mcqs: [
          {
            question: 'Why can you not write `WHERE price > AVG(price)` directly?',
            options: [
              'A. AVG is too slow for WHERE',
              'B. WHERE evaluates row-by-row before grouping - it cannot see the group value',
              'C. You can - it just returns a warning',
              'D. AVG only works in HAVING with GROUP BY',
            ],
            correctIndex: 1,
            explanation: 'The 7-stage pipeline (Day 16): WHERE runs per-row before grouping, so an ungrouped AVG has no meaning there. Compare against a scalar subquery - or filter groups with HAVING.',
          },
        ],
      },
      tasks: [
        {
          id: 'gauntlet-t1',
          title: 'Task 1: The second-highest price',
          description: '"What is the second-highest distinct product price in the catalog?" One row out, no tie fudging.',
          instructions: [
            'SELECT DISTINCT price FROM products (ties must collapse to one value).',
            'WHERE price IS NOT NULL - a NULL would sit at the top of a DESC sort.',
            'ORDER BY price DESC, then LIMIT 1 OFFSET 1 to take the runner-up.',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Second-highest distinct price\n',
          solutionSql: 'SELECT DISTINCT price FROM products WHERE price IS NOT NULL ORDER BY price DESC LIMIT 1 OFFSET 1;',
          solutionExplanation: 'Exactly 1 row: 89.99. Without DISTINCT, duplicated top prices would shift OFFSET and return the wrong rank.',
          hints: [
            { level: 1, text: 'Order prices descending and skip the first row - but make duplicates count as one first.' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requiredColumns: ['price'],
            requireOrderBy: [{ column: 'price', direction: 'DESC' }],
            requireLimit: 1,
            expectedRowCount: 1,
          },
          successMessage: 'Runner-up isolated - the OFFSET pattern with the duplicate guard.',
        },
        {
          id: 'gauntlet-t2',
          title: 'Task 2: Priced above the catalog average',
          description: '"Which products cost more than the average price of the whole catalog?"',
          instructions: [
            'SELECT name, price FROM products.',
            'WHERE price > (SELECT AVG(price) FROM products) - the average is computed in a scalar subquery.',
            'Expect 10 rows.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Above-average pricing\n',
          solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
          solutionExplanation: '10 products clear the catalog average (30.43). The inner query is evaluated once and acts as a single comparison value.',
          hints: [
            { level: 1, text: 'WHERE cannot hold an aggregate comparison directly - wrap the average in its own SELECT.' },
          ],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requiredColumns: ['name', 'price'],
            requireFunction: 'AVG',
            expectedRowCount: 10,
          },
          successMessage: 'Scalar subquery under pressure - clean.',
        },
      ],
    },
  ],
  challenge: {
    id: 'day-37-homework',
    title: 'Day 37 — Gauntlet Finals (Timed)',
    scenario: 'Three deliverables, fresh database each, hints off. These are the queries that decide real interviews:',
    databaseLifecycle: 'fresh',
    tasks: [
      {
        id: 'gauntlet-hw-1',
        title: 'Task 1: Top-3 premium products per category',
        description: 'The most expensive 3 products of every category, cheapest of the three last. The single most-asked modern SQL interview question.',
        instructions: [
          'CTE ranked: name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank.',
          'Outer: keep price_rank <= 3 AND category_id IS NOT NULL, ORDER BY category_id, price DESC. Expect 15 rows.',
        ],
        type: 'challenge',
        primaryTable: 'products',
        initialSql: '-- Final 1: top-3 per category\n',
        solutionSql: 'WITH ranked AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank FROM products) SELECT name, category_id, price FROM ranked WHERE price_rank <= 3 AND category_id IS NOT NULL ORDER BY category_id, price DESC;',
        solutionExplanation: '15 rows: 3 per category across 5 populated categories. The NULL-category product forms its own 1-row partition - without the guard you return 16.',
        hints: [
          { level: 1, text: 'Rank inside a CTE, filter outside it - the Top-N per group pattern from Day 23.' },
        ],
        validation: {
          requireExactResult: true,
          targetTable: 'products',
          requiredColumns: ['name', 'category_id', 'price'],
          requireFunction: 'ROW_NUMBER',
          expectedRowCount: 15,
        },
        successMessage: 'Top-N per group under the clock - the pattern is yours.',
      },
      {
        id: 'gauntlet-hw-2',
        title: 'Task 2: The executive revenue trend',
        description: 'Month, revenue, running total, and month-over-month growth - one query, two window functions. Verified against the store ledger.',
        instructions: [
          'CTE monthly: MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue, JOIN orders to order_items, GROUP BY the month expression.',
          'CTE trend: SUM(revenue) OVER (ORDER BY mon) AS running_revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue.',
          'Outer: mon, revenue, running_revenue, revenue - prev_revenue AS growth, ORDER BY mon. Expect 7 rows.',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Final 2: executive revenue trend\n',
        solutionSql: GAUNTLET_TREND_SQL,
        solutionExplanation: '7 rows - one per month with sales. Running totals and LAG in one pass; the first growth is NULL by design (no previous month).',
        hints: [
          { level: 1, text: 'Aggregate to months first, then layer both window functions in a second CTE.' },
        ],
        validation: {
          requireExactResult: true,
          targetTable: 'orders',
          requiredColumns: ['mon', 'revenue', 'running_revenue', 'growth'],
          requireFunction: 'LAG',
          expectedRowCount: 7,
        },
        successMessage: 'Revenue trend delivered - running total and growth in a single pass.',
      },
      {
        id: 'gauntlet-hw-3',
        title: 'Task 3: The fan-out count',
        description: '"How many distinct orders does the ledger actually contain?" Asked after showing the candidate an orders-to-order_items join.',
        instructions: [
          'JOIN order_items to orders (the many side).',
          'COUNT(DISTINCT o.order_id) AS orders_placed - not COUNT(*), which counts line items.',
          'Expect 1 row.',
        ],
        type: 'challenge',
        primaryTable: 'orders',
        secondaryTables: ['order_items'],
        initialSql: '-- Final 3: distinct orders through the fan-out\n',
        solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS orders_placed FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
        solutionExplanation: '1 row: the true order count despite each order appearing once per line item. The Day 15 fan-out lesson, at interview speed.',
        hints: [
          { level: 1, text: 'One order becomes many joined rows - count keys, not rows.' },
        ],
        validation: {
          requireExactResult: true,
          targetTable: 'orders',
          requiredColumns: ['orders_placed'],
          requireFunction: 'COUNT',
          expectedRowCount: 1,
        },
        successMessage: 'Fan-out neutralized. Gauntlet complete - go take the real thing.',
      },
    ],
  },
};
