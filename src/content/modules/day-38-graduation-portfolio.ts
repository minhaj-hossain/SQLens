import { ModuleData } from '../../types/curriculum';

export const Day_38_MODULE: ModuleData = {
  id: 'day-38',
  slug: 'graduation-real-world-bridge',
  day: 38,
  title: 'Day 38 - Graduation: Bridge to Production Development',
  shortTitle: 'Graduation & Real-World SQL',
  type: 'project_part',
  milestoneId: 'milestone-3',
  description: 'Celebrate your complete SQL journey! Bridge your skills to Node.js/TypeScript backend development with production libraries (Drizzle, Prisma, pg, mysql2). Review the progression from table basics to full relational engineering.',
  estimatedMinutes: 60,
  completionLearnings: [
    'Understand the difference between GROUP BY (collapses rows) and Window Functions (preserves all rows)',
    'Write Window Functions using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)',
    'Bridge SQL skills to backend Node.js/TypeScript libraries (Drizzle, Prisma, pg, mysql2)',
    'Review the complete progression from Day 1 basics to Day 38 advanced database engineering',
  ],
  concepts: [
    {
      id: 'window-functions-and-future',
      order: 1,
      title: '1. Beyond the Course: Window Functions Preview',
      shortDescription: 'Calculate analytical ranks and running metrics without collapsing rows.',
      theory: {
        summary: 'Congratulations on reaching Day 25! Today is a celebration and a bridge to advanced SQL: preview Window Functions, which calculate rankings and running totals across rows while keeping every individual row visible in the result.',
        introTable: {
          tableName: 'products (Ranked in Category)',
          description: 'Window function category partition output',
          columns: ['name', 'category_id', 'price', 'rank_in_category'],
          rows: [
            ['Mechanical Keyboard', 1, 65.00, 1],
            ['Gaming Headset', 1, 55.00, 2],
            ['Office Chair', 3, 120.00, 1],
          ],
        },
        explanation: [
          '### 1. The Core Difference: GROUP BY vs Window Functions',
          '• **`GROUP BY`**: **Collapses** multiple rows into a single summary bucket row.',
          '• **`Window Function (OVER / PARTITION BY)`**: **Preserves** all original rows and appends an analytical rank or running calculation alongside each row.',
          '```sql\nSELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n```',
          '### 2. Bridging SQL to Full-Stack Production Development',
          'In modern TypeScript/Node.js stacks, your SQL mastery translates directly into production database workflows using tools like **Drizzle ORM**, **Prisma**, **Kysely**, and raw drivers like **pg** and **mysql2**.',
          '### 3. Graduation Celebration 🎓',
          'You have progressed through 25 comprehensive days: from single-table retrieval and filtering, to multi-table joins, relational aggregation, subqueries, CTEs, DML mutations, DDL schema architecture, and performance indexing!',
        ],
        targetQuery: {
          sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
          explanation: 'Compute analytical in-category price ranks dynamically without collapsing individual product rows.',
          badge: "The query we're going to break down",
        },
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Partitioning Products by Category and Ranking by Price',
            sqlSnippet: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
            explanation: 'Assigns ranks 1, 2, 3... within each category partition ordered by price descending.',
            tableData: {
              tableName: 'Partitioned Product Rankings',
              columns: ['name', 'category_id', 'price', 'category_rank'],
              highlightedColumns: ['category_id', 'category_rank'],
              rows: [
                ['Mechanical Keyboard', 1, 65.00, 1],
                ['Gaming Headset', 1, 55.00, 2],
                ['Wireless Mouse', 1, 15.99, 3],
              ],
            },
          },
        ],
        syntaxBlocks: [
          {
            title: 'Window function syntax',
            sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_in_category\nFROM products;',
            description: 'Ranks items inside each partition while preserving all rows.',
          },
        ],
        keyTakeaway: 'Window functions calculate partition rankings and running aggregates without collapsing individual rows.',
        exampleQuery: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
        exampleQueryExplanation: 'Ranks products within each category.',
        liveDemoSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products LIMIT 10;',
        liveDemoNotes: 'Each product ranked within its own category, without collapsing a single row.',
        mcqs: [
          {
            question: 'What is the main conceptual difference between GROUP BY and a Window Function with PARTITION BY?',
            options: [
              'A. GROUP BY collapses rows into a single summary row per group; Window Functions retain individual rows and append calculated metrics',
              'B. Window Functions only work on strings',
              'C. GROUP BY is deprecated',
              'D. Window Functions delete duplicate records',
            ],
            correctIndex: 0,
            explanation: 'Window functions compute partition metrics while preserving all individual rows.',
          },
        ],
        masteryPoints: ['Write Window Functions using PARTITION BY and ORDER BY', 'Graduate with full 25-day SQL relational mastery'],
      },
      tasks: [
        {
          id: 'day25-c1-t1',
          title: 'Exploration 1: Rank Products within Categories',
          description: 'Use ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) to rank products in each category.',
          instructions: [
            'Select `name`, `category_id`, `price`, `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank` from `products`.',
            'End with a semicolon (;).',
          ],
          type: 'guided',
          primaryTable: 'products',
          initialSql: '-- Exploration 1: Rank products inside categories\nSELECT name, category_id, price\nFROM products;',
          solutionSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
          solutionExplanation: 'Ranks products by price within each category.',
          hints: [{ level: 1, text: 'Use `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            requiredColumns: ['name', 'category_id', 'price', 'category_rank'],
            expectedRowCount: 28,
          },
          successMessage: 'Exploration 1 verified! Window function ranking calculated.',
        },
        {
          id: 'day25-c1-t2',
          title: 'Exploration 2: Top 2 Products per Category via CTE',
          description: 'Combine a Window Function with a CTE to extract only the top 2 highest priced products per category.',
          instructions: [
            'Define `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products)`.',
            'Select all columns from `RankedProducts` where `rank_num <= 2`.',
          ],
          type: 'independent',
          primaryTable: 'products',
          initialSql: '-- Top 2 products per category with window function\n',
          solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
          solutionExplanation: 'Extracts top 2 ranked products per category.',
          hints: [{ level: 1, text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`' }],
          validation: {
            requireExactResult: true,
            targetTable: 'products',
            expectedRowCount: 11,
          },
          successMessage: 'Congratulations! You have completed the entire 25-Day SQL Master Curriculum!',
        },
      ],
    },
  ],

  // ===========================================================================
  // DAY 25: OPTIONAL EXPLORATION SANDBOX (GRADUATION)
  // ===========================================================================
  challenge: {
    id: 'day-38-homework',
    title: 'Day 38 — Optional Exploration Sandbox (Graduation)',
    scenario: 'Optional Exploration: Run the final Window Function query to complete your graduation portfolio:',
    tasks: [
      {
        id: 'day25-hw-1',
        title: 'Graduation Milestone: Top 2 Most Expensive Products in Each Category',
        description: 'Find the top 2 most expensive products in each category using ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC).',
        instructions: [
          'Use `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;`.',
          'End with a semicolon (;).',
        ],
        type: 'challenge',
        primaryTable: 'products',
        secondaryTables: ['categories'],
        initialSql: '-- Graduation Milestone: Top 2 products in each category using Window Function\n',
        solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
        solutionExplanation: 'Combines a Window Function inside a CTE to slice the top 2 products per category.',
        hints: [{ level: 1, text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`' }],
        validation: {
          requireExactResult: true,
          targetTable: 'products',
          expectedRowCount: 11,
        },
        successMessage: 'Congratulations on graduating the 25-Day SQL Master Curriculum! 🎓',
      },
    ],
  },
};
